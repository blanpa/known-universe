// Live catalogue queries for the field the telescope shows. Gaia DR3 comes from
// VizieR's TAP service, SIMBAD from its own; both answer CSV with CORS headers, so
// the browser asks them directly and the rows land in the "Your data" layer, named
// after the source and the field. No key, no backend, nothing stored on a server.
import { count, tfetch } from '../lib/sources.js';
import { fieldQuery as store } from '../lib/stores.js';
import { fovDeg } from './survey.js';
import { importUser } from './userdata.js';
import { camFwd } from './view.js';

// VizieR's TAP answers with the CORS header doubled, which browsers reject; its cone
// search is fine, though at busy hours it can take a minute. SIMBAD's TAP is quick.
const ASU='https://vizier.cds.unistra.fr/viz-bin/asu-tsv';
const SIM='https://simbad.cds.unistra.fr/simbad/sim-tap/sync';
export const SOURCES={
  gaia:   { n:'Gaia DR3', epoch:2016.0, limit:4000, prefix:'Gaia DR3 ' },
  simbad: { n:'SIMBAD',   epoch:2000.0, limit:2000, prefix:'' },
};
export function fieldCentre(){
  let ra=Math.atan2(camFwd[1],camFwd[0])*57.29578; if(ra<0) ra+=360;
  return [ra, Math.asin(Math.max(-1,Math.min(1,camFwd[2])))*57.29578];
}
export function fieldRadiusDeg(){ return Math.min(2.5, Math.max(0.02, fovDeg()*0.55)); }   // the services cap big cones anyway
const hms=ra=>{ const h=ra/15, hh=Math.floor(h), m=(h-hh)*60; return `${String(hh).padStart(2,'0')}h${String(Math.floor(m)).padStart(2,'0')}m`; };
const dms=d=>{ const s=d<0?'−':'+', a=Math.abs(d); return `${s}${String(Math.floor(a)).padStart(2,'0')}°${String(Math.floor((a-Math.floor(a))*60)).padStart(2,'0')}′`; };
const QMETA={ 'q-simbad':{name:'SIMBAD · field query (TAP)', host:'simbad.cds.unistra.fr', group:'query'}, 'q-vizier':{name:'VizieR · Gaia DR3 cone search', host:'vizier.cds.unistra.fr', group:'query'} };
async function tap(id,url,adql){
  const body=new URLSearchParams({REQUEST:'doQuery',LANG:'ADQL',FORMAT:'csv',QUERY:adql});
  const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),45000);
  try{ const r=await tfetch(id,QMETA[id],url,{method:'POST',body,signal:ctl.signal}); if(!r.ok) throw new Error('HTTP '+r.status); return await r.text(); }
  finally{ clearTimeout(t); }
}
function adql(src,ra,dec,r){                          // SIMBAD
  const c=`CIRCLE('ICRS', ${ra.toFixed(5)}, ${dec.toFixed(5)}, ${r.toFixed(4)})`;
  return `SELECT TOP ${SOURCES.simbad.limit} main_id, ra, dec, plx_value, pmra, pmdec, otype, sp_type FROM basic WHERE 1=CONTAINS(POINT('ICRS', ra, dec), ${c}) AND ra IS NOT NULL`;
}
// VizieR's TSV: '#' comments, a header, a units row, a dashes row, then data
async function asuGaia(ra,dec,r){
  const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),120000);
  try{
    const u=`${ASU}?-source=I/355/gaiadr3&-c=${encodeURIComponent(ra.toFixed(5)+' '+(dec>=0?'+':'')+dec.toFixed(5))}&-c.rd=${r.toFixed(4)}&-out=Source,RA_ICRS,DE_ICRS,Plx,pmRA,pmDE,Gmag,BP-RP&-out.max=${SOURCES.gaia.limit}&-sort=Gmag`;
    const res=await tfetch('q-vizier',QMETA['q-vizier'],u,{signal:ctl.signal}); if(!res.ok) throw new Error('HTTP '+res.status);
    const lines=(await res.text()).split(/\r?\n/).filter(l=>l&&!l.startsWith('#'));
    const i=lines.findIndex(l=>/^-+(\t-+)*\t?$/.test(l.trim()));
    if(i>=2) lines.splice(1,i);                                   // drop units + dashes
    return lines.join('\n');
  } finally{ clearTimeout(t); }
}
let _busy=null;
export async function queryField(src){
  const S_=SOURCES[src]; if(!S_||_busy) return 0;
  const [ra,dec]=fieldCentre(), r=fieldRadiusDeg();
  const field=`${hms(ra)} ${dms(dec)} · r ${r>=1?r.toFixed(1)+'°':(r*60).toFixed(0)+'′'}`;
  _busy=src; store.set({ busy:src, msg:`asking ${S_.n} for ${field}…` });
  try{
    if(src==='gaia') store.set({ busy:src, msg:`asking VizieR for Gaia DR3 in ${field}… (can take a minute when the server is busy)` });
    const text = src==='gaia' ? await asuGaia(ra,dec,r) : await tap('q-simbad', SIM, adql(src,ra,dec,r));
    const n=importUser(text, `${S_.n} · ${field}`, { src, epoch:S_.epoch, prefix:S_.prefix });
    count(src==='gaia'?'q-vizier':'q-simbad', n);
    store.set({ busy:null, msg:n ? `${n} rows from ${S_.n}${n>=S_.limit?' (the brightest; the cone holds more)':''}` : `${S_.n}: nothing in this field` });
    return n;
  }catch(e){ store.set({ busy:null, msg:`${S_.n} query failed: ${e.name==='AbortError'?'timeout':e.message}` }); return 0; }
  finally{ _busy=null; }
}
