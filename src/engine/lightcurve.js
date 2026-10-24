// Light curves from the archive: TESS (2-minute SPOC) and Kepler for the pinned star,
// found through MAST's observation search, fetched as FITS from the public STScI bucket,
// parsed here, and searched for periods with Lomb–Scargle and for transits with BLS.
// The whole chain is in the browser; nothing is stored anywhere.
import { api } from '../lib/api.js';
import { csvOf, download } from '../lib/export.js';
import { parseFITSTables } from '../lib/fits.js';
import { bestPeak, binned, bls, fap, fold, lombScargle } from '../lib/periodogram.js';
import { count, tfetch } from '../lib/sources.js';
import { lightcurve as store } from '../lib/stores.js';
import { nameOf, physPos } from './entity.js';
import { S } from './state.js';
const MAST='https://mast.stsci.edu/api/v0/invoke';
const S3='https://stpubdata.s3.us-east-1.amazonaws.com/';
const META_Q={ name:'MAST · observation search (TESS, Kepler)', host:'mast.stsci.edu', group:'query' };
const META_F={ name:'STScI public bucket · light-curve FITS', host:'stpubdata.s3.us-east-1.amazonaws.com', group:'query' };
export const LC={ target:null, obs:[], data:null, analysis:null };
function publish(patch){ store.update(s=>({ ...s, ...patch })); }
async function invoke(req, ms=60000){
  const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),ms);
  try{ const r=await tfetch('q-mast',META_Q,MAST+'?request='+encodeURIComponent(JSON.stringify(req)),{ signal:ctl.signal }); if(!r.ok) throw new Error('MAST HTTP '+r.status);
    const j=await r.json(); if(j.status&&j.status!=='COMPLETE') throw new Error('MAST: '+(j.msg||j.status)); return j.data||[]; }
  finally{ clearTimeout(t); }
}
// the file name says where the public bucket keeps it
export function bucketURL(uri){
  let m=uri.match(/^mast:TESS\/product\/(tess\d+-s(\d{4})-(\d{16})-\d{4}-[sa]_(?:lc|fast-lc)\.fits)$/);
  if(m){ const tic=m[3]; return `${S3}tess/public/tid/s${m[2]}/${tic.slice(0,4)}/${tic.slice(4,8)}/${tic.slice(8,12)}/${tic.slice(12,16)}/${m[1]}`; }
  m=uri.match(/^mast:KEPLER\/url\/missions\/kepler\/(.+)$/i); if(m) return `${S3}kepler/public/${m[1]}`;
  return null;
}
export async function lcSearch(o=S.pinned){
  if(!o) return 0; const P=physPos(o); if(!P) return 0;
  const L=Math.hypot(P[0],P[1],P[2])||1, ra=((Math.atan2(P[1],P[0])*57.29578)+360)%360, dec=Math.asin(P[2]/L)*57.29578, name=nameOf(o);
  LC.target={ name, ra, dec, o }; LC.obs=[]; LC.data=null; LC.analysis=null;
  publish({ busy:'search', msg:`asking MAST for TESS and Kepler light curves at ${name}…`, target:name, obs:[], data:null, analysis:null });
  try{
    const rows=await invoke({ service:'Mast.Caom.Filtered.Position', params:{ columns:'obsid,obs_id,target_name,t_min,t_max,obs_collection,sequence_number,t_exptime,distance',
      filters:[{ paramName:'obs_collection', values:['TESS','Kepler'] },{ paramName:'dataproduct_type', values:['timeseries'] }], position:`${ra.toFixed(5)}, ${dec.toFixed(5)}, 0.01` }, format:'json', pagesize:60, page:1 });
    // one entry per TESS sector (the 2-minute LC, not the 20-s fast one) and the Kepler long-cadence set
    const obs=[]; for(const r of rows){ const tess=r.obs_collection==='TESS'; if(tess&&/-a_fast$/.test(r.obs_id||'')) continue; if(tess&&!/^tess\d+-s\d{4}-\d{16}-\d{4}-s$/.test(r.obs_id||'')) continue;
      if(!tess&&!/_lc_/.test(r.obs_id||'')) continue;
      obs.push({ obsid:r.obsid, id:r.obs_id, mission:tess?'TESS':'Kepler', sector:tess?r.sequence_number:null, target:r.target_name, t0:r.t_min, t1:r.t_max, days:r.t_max&&r.t_min?r.t_max-r.t_min:null, exptime:r.t_exptime }); }
    obs.sort((a,b)=>(a.mission>b.mission?1:a.mission<b.mission?-1:0)||(a.sector||0)-(b.sector||0));
    LC.obs=obs; count('q-mast', obs.length);
    publish({ busy:null, msg:obs.length?`${obs.length} light curve${obs.length===1?'':'s'} at ${name}: ${obs.filter(x=>x.mission==='TESS').length} TESS sector${obs.filter(x=>x.mission==='TESS').length===1?'':'s'}${obs.some(x=>x.mission==='Kepler')?', Kepler':''}`:`MAST has no TESS or Kepler light curve within 36″ of ${name}`, obs });
    return obs.length;
  }catch(e){ publish({ busy:null, msg:'MAST search failed: '+(e.name==='AbortError'?'timeout':e.message) }); return 0; }
}
export async function lcLoad(k){
  const ob=LC.obs[k]; if(!ob) return null;
  publish({ busy:'load', msg:`listing the products of ${ob.mission}${ob.sector?' sector '+ob.sector:''}…` });
  try{
    const prods=await invoke({ service:'Mast.Caom.Products', params:{ obsid:String(ob.obsid) }, format:'json', pagesize:200, page:1 });
    const lc=prods.filter(p=>/_lc\.fits$|_llc\.fits$/.test(p.dataURI||'')).map(p=>({ uri:p.dataURI, url:bucketURL(p.dataURI), size:p.size })).filter(p=>p.url);
    if(!lc.length) throw new Error('no light-curve FITS among the products');
    // Kepler: all quarters; TESS: the one file
    const files=ob.mission==='Kepler'?lc.sort((a,b)=>a.uri<b.uri?-1:1):[lc[0]];
    const t=[], y=[], e=[]; let loaded=0, meta=null;
    for(const f of files){ publish({ msg:`fetching ${f.uri.split('/').pop()} (${(f.size/1048576).toFixed(1)} MB)…` });
      const ctl=new AbortController(), tm=setTimeout(()=>ctl.abort(),180000);
      let buf; try{ const r=await tfetch('q-mast-file',META_F,f.url,{ signal:ctl.signal }); if(!r.ok) throw new Error('HTTP '+r.status); buf=await r.arrayBuffer(); } finally{ clearTimeout(tm); }
      const tab=parseFITSTables(buf).find(x=>x.name==='LIGHTCURVE'); if(!tab) throw new Error('no LIGHTCURVE table in '+f.uri);
      const T=tab.cols.TIME, F=tab.cols.PDCSAP_FLUX||tab.cols.SAP_FLUX, E=tab.cols.PDCSAP_FLUX_ERR||tab.cols.SAP_FLUX_ERR, Q=tab.cols.QUALITY||tab.cols.SAP_QUALITY;
      let med=0, nn=0; for(let i=0;i<tab.nrows;i++){ if(F[i]===F[i]&&(!Q||Q[i]===0)){ med+=F[i]; nn++; } } med=nn?med/nn:1;   // normalised per file (per quarter for Kepler)
      for(let i=0;i<tab.nrows;i++){ if(F[i]!==F[i]||T[i]!==T[i]||(Q&&Q[i]!==0)) continue; t.push(T[i]); y.push(F[i]/med); e.push(E?E[i]/med:0); }
      if(!meta) meta={ object:tab.header.OBJECT, tic:tab.header.TICID, kic:tab.header.KEPLERID, sector:tab.header.SECTOR, quarter:tab.header.QUARTER, timeRef:tab.header.TIMEUNIT||'d', bjdref:(tab.header.BJDREFI||0)+(tab.header.BJDREFF||0), column:tab.cols.PDCSAP_FLUX?'PDCSAP_FLUX':'SAP_FLUX', unit:tab.fields.find(x=>x.name==='TIME')?.unit };
      loaded++; }
    const baseline=t.length?t[t.length-1]-t[0]:0;
    LC.data={ t, y, e, n:t.length, files:loaded, mission:ob.mission, sector:ob.sector, meta, baseline, cadenceMin:t.length>1?(baseline/t.length)*1440:0 };
    count('q-mast-file', t.length);
    publish({ busy:null, msg:`${t.length.toLocaleString('en-US')} good points over ${baseline.toFixed(1)} days (${meta.column}, quality 0; BJD − ${meta.bjdref})`, data:{ n:t.length, baseline, mission:ob.mission, sector:ob.sector, files:loaded, meta, cadenceMin:LC.data.cadenceMin } });
    return LC.data;
  }catch(e){ publish({ busy:null, msg:'load failed: '+(e.name==='AbortError'?'timeout':e.message) }); return null; }
}
export function lcAnalyse(opts={}){
  const d=LC.data; if(!d||d.n<20) return null;
  const pmax=Math.max(opts.pmax||0, d.baseline/2), pmin=opts.pmin||Math.max(0.05, 4*d.cadenceMin/1440);
  const ls=lombScargle(d.t,d.y,{ fmin:1/pmax, fmax:1/pmin, ofac:5, nmax:12000 }), pk=bestPeak(ls.f,ls.p);
  const B=bls(d.t,d.y,{ pmin:Math.max(0.3,pmin), pmax, nP:Math.min(4000,Math.max(500,Math.round(d.baseline*120))) });
  const A={ ls:pk?{ period:pk.period, power:pk.power, fap:fap(pk.power,d.n,ls.n), nf:ls.n }:null, bls:B?{ period:B.period, depth:B.depth, duration:B.duration, t0:B.t0, nIn:B.nIn }:null,
    pg:{ f:Array.from(ls.f), p:Array.from(ls.p) }, blsSr:B?{ periods:Array.from(B.periods), sr:Array.from(B.sr) }:null };
  if(B){ const ph=fold(d.t,d.y,B.period,B.t0+B.duration/2); A.fold={ ph:Array.from(ph), bins:binned(ph,d.y,120) }; }
  LC.analysis=A;
  publish({ analysis:{ ls:A.ls, bls:A.bls, fold:A.fold?{ bins:A.fold.bins }:null, pg:{ f:A.pg.f.filter((_,i)=>i%Math.max(1,Math.floor(A.pg.f.length/1200))===0), p:A.pg.p.filter((_,i)=>i%Math.max(1,Math.floor(A.pg.p.length/1200))===0) }, blsSr:A.blsSr?{ periods:A.blsSr.periods.filter((_,i)=>i%Math.max(1,Math.floor(A.blsSr.periods.length/1200))===0), sr:A.blsSr.sr.filter((_,i)=>i%Math.max(1,Math.floor(A.blsSr.sr.length/1200))===0) }:null },
    msg:`Lomb–Scargle: ${A.ls?A.ls.period.toFixed(4)+' d (power '+A.ls.power.toFixed(3)+', FAP '+(A.ls.fap<1e-4?A.ls.fap.toExponential(1):A.ls.fap.toFixed(3))+')':'—'} · BLS transit: ${A.bls?A.bls.period.toFixed(4)+' d, depth '+(A.bls.depth*100).toFixed(3)+' %, '+(A.bls.duration*24).toFixed(1)+' h':'—'}` });
  return A;
}
export function lcExport(opts={}){
  const d=LC.data; if(!d) return '';
  const rows=[]; for(let i=0;i<d.n;i++) rows.push({ t:d.t[i], y:d.y[i], e:d.e[i] });
  const text=csvOf(rows,[{ k:'t', n:'time_bjd_minus_'+d.meta.bjdref },{ k:'y', n:'flux_normalised' },{ k:'e', n:'flux_err' }],[`Known Universe · ${LC.target?.name} · ${d.mission}${d.sector?' sector '+d.sector:''} · ${d.meta.column}, quality 0, per-file normalised · MAST / STScI`]);
  if(!opts.text) download(`lightcurve-${(LC.target?.name||'star').replace(/[^\w.-]+/g,'_')}-${d.mission}${d.sector?'-s'+d.sector:''}.csv`, text, 'text/csv');
  return text;
}
export const lcSamples=()=>{ const d=LC.data; if(!d) return null; const step=Math.max(1,Math.floor(d.n/2400)); const t=[],y=[]; for(let i=0;i<d.n;i+=step){ t.push(d.t[i]); y.push(d.y[i]); } return { t, y }; };
Object.assign(api,{ lcSearch, lcLoad, lcAnalyse, lcExport, lcSamples });
