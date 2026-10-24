// Cross-identification of your rows: first against what is loaded here (HYG, the Gaia
// cloud), then — one request per set — against Gaia DR3 or SIMBAD through the CDS X-Match
// service, which answers with the catalogue's own identifiers. A row without a counterpart
// inside the radius is the interesting one; it is drawn red and listed first.
//
// Epochs: the Gaia cloud and Gaia DR3 sit at J2016.0, HYG and SIMBAD at J2000.0. A row
// that carries proper motion is moved to the catalogue's epoch before the comparison; a
// row without one is compared where it is, so for a fast star a wider radius is needed.
import { count, tfetch } from '../lib/sources.js';
import { crossmatch as store } from '../lib/stores.js';
import { gaiaPm, gaiaRange, gaiaRaw } from './gl.js';
import { hygPos } from './motion.js';
import { HYG } from './solar-data.js';
import { S, V } from './state.js';
import { USER, splitLine } from './userdata.js';
const XM='https://cdsxmatch.u-strasbg.fr/xmatch/api/v1/sync';
const META={ name:'CDS X-Match · cross-identification', host:'cdsxmatch.u-strasbg.fr', group:'query' };
export const REMOTE={ gaia:{ n:'Gaia DR3', cat:'vizier:I/355/gaiadr3', epoch:2016.0 }, simbad:{ n:'SIMBAD', cat:'simbad', epoch:2000.0 } };
const D2R=Math.PI/180, MAS=4.84813681e-9, COARSE=40;              // arcsec: what the packed Gaia cloud can resolve
// unit vector of a row moved by its proper motion to `epoch` (small-angle, on the sky)
function dirAt(o,epoch){
  let dx=o.dx,dy=o.dy,dz=o.dz; const t=epoch-(o.ep||2000);
  if(t&&(o.pr||o.pd)){ const cq=Math.hypot(dx,dy)||1e-9, ex=-dy/cq, ey=dx/cq, nx=-dz*dx/cq, ny=-dz*dy/cq, nz=cq, a=o.pr*t*MAS, b=o.pd*t*MAS;
    dx+=ex*a+nx*b; dy+=ey*a+ny*b; dz+=nz*b; const L=Math.hypot(dx,dy,dz)||1; dx/=L; dy/=L; dz/=L; }
  return [dx,dy,dz];
}
const sepArcsec=(a,b)=>{ const c=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]); return 2*Math.asin(Math.min(1,c/2))*206264.806; };
// ---- a 1°×1° grid over the loaded catalogues, built once per catalogue ----
function gridOf(n, raOf, decOf){
  const cellOf=i=>{ const d=Math.min(179,Math.max(0,Math.floor(decOf(i)+90))), r=((Math.floor(raOf(i))%360)+360)%360; return d*360+r; };
  const cnt=new Int32Array(180*360+1);
  for(let i=0;i<n;i++) cnt[cellOf(i)+1]++;
  for(let c=0;c<180*360;c++) cnt[c+1]+=cnt[c];
  const idx=new Int32Array(n), fill=cnt.slice(0,180*360);
  for(let i=0;i<n;i++){ const c=cellOf(i); idx[fill[c]++]=i; }
  return { off:cnt, idx, each(ra,dec,fn){                   // the 3×3 cells around a position (RA wraps)
    const d0=Math.floor(dec+90), r0=Math.floor(ra);
    for(let d=d0-1; d<=d0+1; d++){ if(d<0||d>179) continue;
      for(let r=r0-1; r<=r0+1; r++){ const c=d*360+((r%360)+360)%360; for(let k=cnt[c]; k<cnt[c+1]; k++) fn(idx[k]); } } } };
}
let _hygGrid=null, _gaiaGrid=null, _gaiaN=0, _gRa=null, _gDec=null;
function hygGrid(){ if(_hygGrid) return _hygGrid;
  return _hygGrid=gridOf(HYG.length, i=>Math.atan2(HYG[i].dy,HYG[i].dx)/D2R, i=>Math.asin(HYG[i].dz)/D2R); }
function gaiaGrid(){
  if(!gaiaRaw) return null; const n=(gaiaRaw.length/8)|0; if(_gaiaGrid&&_gaiaN===n) return _gaiaGrid;
  const dv=new DataView(gaiaRaw.buffer,gaiaRaw.byteOffset,gaiaRaw.byteLength);
  _gRa=new Float32Array(n); _gDec=new Float32Array(n);
  for(let i=0;i<n;i++){ _gRa[i]=dv.getUint16(i*8,true)*(360/65535); _gDec[i]=dv.getUint16(i*8+2,true)*(180/65535)-90; }
  _gaiaN=n; return _gaiaGrid=gridOf(n, i=>_gRa[i], i=>_gDec[i]);
}
function gaiaStar(i,epoch){                                // direction at `epoch` (the cloud sits at 2016), magnitude, distance
  const dv=new DataView(gaiaRaw.buffer,gaiaRaw.byteOffset,gaiaRaw.byteLength), b=i*8;
  const rr=_gRa[i]*D2R, dr=_gDec[i]*D2R, cd=Math.cos(dr); let dx=cd*Math.cos(rr), dy=cd*Math.sin(rr), dz=Math.sin(dr);
  let pr=0,pd=0; if(gaiaPm&&(gaiaPm.length/4|0)===_gaiaN){ const pv=new DataView(gaiaPm.buffer,gaiaPm.byteOffset,gaiaPm.byteLength); pr=pv.getInt16(i*4,true); pd=pv.getInt16(i*4+2,true); }
  const t=epoch-2016;
  if(t&&(pr||pd)){ const cq=Math.hypot(dx,dy)||1e-9, a=pr*t*MAS, b2=pd*t*MAS; dx+=(-dy/cq)*a+(-dz*dx/cq)*b2; dy+=(dx/cq)*a+(-dz*dy/cq)*b2; dz+=cq*b2; const L=Math.hypot(dx,dy,dz)||1; dx/=L; dy/=L; dz/=L; }
  return { dir:[dx,dy,dz], g:dv.getUint8(b+6)/255*28-2, d:dv.getUint16(b+4,true)/65535*gaiaRange, pr, pd };
}
// ---- the local pass: instant, no network ----
export function matchLocal(k, radius){
  const st=USER.sets[k]; if(!st) return null;
  const hg=hygGrid(), gg=gaiaGrid(); let known=0;
  for(const o of st.rows){
    let best=null;
    const dH=dirAt(o,2000), raH=Math.atan2(dH[1],dH[0])/D2R, deH=Math.asin(dH[2])/D2R;
    hg.each(raH,deH,i=>{ const s=HYG[i], q=hygPos(s,(o.ep||2000)-2000+0), L=Math.hypot(q[0],q[1],q[2])||1;   // HYG at the row's epoch
      const sep=sepArcsec(o.pr||o.pd?dH:[o.dx,o.dy,o.dz], o.pr||o.pd?[s.dx,s.dy,s.dz]:[q[0]/L,q[1]/L,q[2]/L]);
      if(sep<=radius&&(!best||sep<best.sep)) best={ src:'HYG', id:s.n||('HIP '+s.hip), sep, mag:s.m, d:s.d, pr:s.pr, pd:s.pd, local:true }; });
    // the cloud's packed positions are good to ±20″ only, so it can say "a star is
    // there" but never settle an identity: a coarse match, to be confirmed by the CDS pass
    if(gg&&!best){ const dG=dirAt(o,2016), raG=Math.atan2(dG[1],dG[0])/D2R, deG=Math.asin(dG[2])/D2R, rc=Math.max(radius,COARSE);
      gg.each(raG,deG,i=>{ const g=gaiaStar(i,(o.pr||o.pd)?2016:(o.ep||2000));
        const sep=sepArcsec((o.pr||o.pd)?dG:[o.dx,o.dy,o.dz], g.dir);
        if(sep<=rc&&(!best||sep<best.sep)) best={ src:'Gaia cloud', id:`G ${g.g.toFixed(1)} · ${g.d.toFixed(1)} pc (packed, ±20″)`, sep, mag:g.g, d:g.d, pr:g.pr, pd:g.pd, local:true, coarse:true }; }); }
    o.xm=best; if(best) known++;
  }
  const coarse=st.rows.filter(o=>o.xm&&o.xm.coarse).length;
  st.xm={ radius, known, unknown:st.rows.length-known, coarse, remote:null, at:Date.now() };
  publish(k, `${known} of ${st.rows.length} rows have a counterpart in the loaded catalogues: HYG within ${radius}″${gg?`, the Gaia ${gaiaRange} pc cloud within ${Math.max(radius,COARSE)}″ (${coarse} coarse: its positions are packed to ±20″ — identify to confirm)`:''}`);
  V.dirty=true; return st.xm;
}
// ---- the remote pass: CDS X-Match, 5,000 rows per request ----
let _busy=false;
export async function matchRemote(k, which, radius){
  const st=USER.sets[k], R=REMOTE[which]; if(!st||!R||_busy) return null;
  _busy=true; store.update(s=>({ ...s, busy:which, msg:`asking the CDS X-Match service for ${R.n} counterparts of ${st.rows.length} rows…` }));
  try{
    const rows=st.rows; let done=0, known=0;
    for(const o of rows) if(o.xm&&!o.xm.local) o.xm=null;       // one identification per run: the answer is this catalogue's
    for(let c=0;c<rows.length;c+=5000){
      const part=rows.slice(c,c+5000);
      const csv=['id,ra,dec'].concat(part.map(o=>{ const d=dirAt(o,R.epoch); return `${o.i},${(Math.atan2(d[1],d[0])/D2R+360)%360},${Math.asin(d[2])/D2R}`; })).join('\n');
      const fd=new FormData(); fd.append('request','xmatch'); fd.append('distMaxArcsec',String(radius)); fd.append('RESPONSEFORMAT','csv');
      fd.append('cat1',new Blob([csv],{type:'text/csv'}),'cat1.csv'); fd.append('colRA1','ra'); fd.append('colDec1','dec'); fd.append('cat2',R.cat);
      const ctl=new AbortController(), t=setTimeout(()=>ctl.abort(),120000);
      let text; try{ const res=await tfetch('q-xmatch',META,XM,{method:'POST',body:fd,signal:ctl.signal}); if(!res.ok) throw new Error('HTTP '+res.status); text=await res.text(); } finally{ clearTimeout(t); }
      const lines=text.split(/\r?\n/).filter(l=>l.trim()); if(!lines.length) continue;
      const head=splitLine(lines[0],','), col=n=>head.indexOf(n);
      const iD=col('angDist'), iId=col('id'), iN=which==='gaia'?col('DR3Name'):col('main_id');
      const iPlx=which==='gaia'?col('Plx'):col('plx'), iEPlx=which==='gaia'?col('e_Plx'):col('plx_err'), iPr=which==='gaia'?col('pmRA'):col('pmra'), iPd=which==='gaia'?col('pmDE'):col('pmdec');
      const iEPr=col('e_pmRA'), iEPd=col('e_pmDE'), iG=col('Gmag'), iRuwe=col('RUWE'), iBR=col('BP-RP'), iOt=col('main_type'), iSp=col('sp_type'), iV=col('V');
      const byId=new Map(); for(const r of rows) byId.set(String(r.i), r);
      const num=(f,i)=>i>=0&&f[i]!==''&&isFinite(+f[i])?+f[i]:undefined;
      for(let li=1; li<lines.length; li++){ const f=splitLine(lines[li],','); const o=byId.get(f[iId]); if(!o) continue;
        const sep=+f[iD]; if(!(sep>=0)) continue;
        // keep the nearest remote counterpart; SIMBAD lists a star's planets at the star's
        // position, so at equal distance the star wins over its planets
        const pl=iOt>=0&&/^Planet/.test(f[iOt]||'');
        if(o.xm&&!o.xm.local){ const oldPl=/^Planet/.test(o.xm.otype||'');
          if(o.xm.sep<=sep && !(oldPl&&!pl&&sep<=o.xm.sep+0.05)) continue;
          if(pl&&!oldPl&&o.xm.sep<=sep+0.05) continue; }
        o.xm={ src:R.n, id:f[iN], sep, plx:num(f,iPlx), eplx:num(f,iEPlx), pr:num(f,iPr), pd:num(f,iPd), epr:num(f,iEPr), epd:num(f,iEPd), g:num(f,iG), ruwe:num(f,iRuwe), bprp:num(f,iBR), mag:num(f,iG)??num(f,iV), otype:iOt>=0?f[iOt]:undefined, sp:iSp>=0?f[iSp]:undefined, local:false };
      }
      done+=part.length; store.update(s=>({ ...s, msg:`${R.n}: ${done} of ${rows.length} rows sent…` }));
    }
    for(const o of rows){ if(o.xm&&o.xm.local) o.xm=null; if(o.xm){ known++; o.xm.doubt=doubtOf(o,o.xm); } }   // the remote answer replaces the local guess
    st.xm={ radius, known, unknown:rows.length-known, remote:R.n, at:Date.now() };
    count('q-xmatch', known);
    publish(k, `${known} of ${rows.length} rows identified in ${R.n} within ${radius}″ (positions compared at J${R.epoch.toFixed(1)})`);
    V.dirty=true; return st.xm;
  }catch(e){ store.update(s=>({ ...s, busy:null, msg:`${R.n} cross-match failed: ${e.name==='AbortError'?'timeout':e.message}` })); return null; }
  finally{ _busy=false; }
}
// a counterpart inside the radius can still be the wrong star: a row with its own parallax
// or magnitude is checked against the counterpart's, and a disagreement is said out loud
function doubtOf(o,m){
  const out=[];
  if(!o.noDist&&m.plx>0&&o.d>0){ const rp=1000/o.d, e=Math.max(m.eplx||0,0.05*rp,0.1); if(Math.abs(rp-m.plx)>5*e&&Math.max(rp,m.plx)/Math.min(rp,m.plx)>1.5) out.push(`parallax disagrees (row ${rp.toFixed(2)} mas, counterpart ${m.plx.toFixed(2)} mas)`); }
  if(o.m!==undefined&&m.mag!==undefined&&Math.abs(o.m-m.mag)>3) out.push(`brightness disagrees (row ${o.m.toFixed(1)}, counterpart ${m.mag.toFixed(1)} mag)`);
  return out.length?out.join(' · '):undefined;
}
function publish(k, msg){
  const st=USER.sets[k]; if(!st) return;
  const list=st.rows.map(o=>({ i:o.i, n:o.n||`Row ${o.i+1}`, ra:o.ra, dec:o.dec, src:o.xm?o.xm.src:null, id:o.xm?o.xm.id:null, sep:o.xm?o.xm.sep:null, coarse:!!(o.xm&&o.xm.coarse), doubt:o.xm?o.xm.doubt:undefined, mag:o.m }));
  list.sort((a,b)=>(a.src?1:0)-(b.src?1:0) || (a.doubt?0:1)-(b.doubt?0:1) || (a.coarse?1:0)-(b.coarse?1:0) || (a.sep||0)-(b.sep||0));
  const doubt=list.filter(r=>r.doubt).length;
  store.set({ busy:null, msg, set:k, radius:st.xm.radius, remote:st.xm.remote, known:st.xm.known, unknown:st.xm.unknown, coarse:st.xm.coarse||0, doubt, n:st.rows.length, rows:list.slice(0,300) });
}
export async function crossmatch(k, opts={}){
  const radius=Math.max(0.1, Math.min(60, +opts.radius||3));
  if(!opts.remote) return matchLocal(k, radius);
  if(!USER.sets[k]) return null;
  if(!USER.sets[k].xm) matchLocal(k, radius);                       // the local pass is free: start from it
  return matchRemote(k, opts.remote, radius);
}
export const xmTouched=()=>!!S.user;
