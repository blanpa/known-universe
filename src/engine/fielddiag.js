// Field diagrams: the Gaia stars in the telescope's field as a colour–magnitude diagram
// (M_G against BP−RP, from the Bailer-Jones distance) and a vector-point diagram (μα*, μδ).
// A cluster is a clump in the VPD and a sequence in the CMD; a box drawn on the VPD picks its
// members, marks them on the sky and hands them over as a set for export or cross-match.
import { api } from '../lib/api.js';
import { fielddiag as store } from '../lib/stores.js';
import { ctx } from './canvas.js';
import { gaiaPm, gaiaQ, gaiaRange, gaiaRaw } from './gl.js';
import { S, V } from './state.js';
import { fovDeg } from './survey.js';
import { importUser } from './userdata.js';
import { H, W, _pj, camDist, camFwd, projectInto, scale } from './view.js';
export const FD={ rows:[], box:null, members:[] };          // rows: {dx,dy,dz,g,bprp,d,pr,pd,ruwe,MG}
const D2R=Math.PI/180;
export function scanField(){
  FD.rows=[]; FD.members=[];
  if(!S.skyMode||camDist>1e-4||!gaiaRaw||!gaiaPm||(gaiaRaw.length/8|0)!==(gaiaPm.length/4|0)){ store.set({ n:0, msg:!S.skyMode?'switch the telescope on and point it at a field':'the Gaia cloud with proper motions is not loaded', cmd:[], vpd:[] }); return 0; }
  const fov=fovDeg(); if(fov>40){ store.set({ n:0, msg:'zoom in: fields up to 40° are scanned', cmd:[], vpd:[] }); return 0; }
  const dv=new DataView(gaiaRaw.buffer,gaiaRaw.byteOffset,gaiaRaw.byteLength), pv=new DataView(gaiaPm.buffer,gaiaPm.byteOffset,gaiaPm.byteLength);
  const qv=gaiaQ&&(gaiaQ.length/12|0)===(gaiaRaw.length/8|0)?new DataView(gaiaQ.buffer,gaiaQ.byteOffset,gaiaQ.byteLength):null;
  const n=(gaiaRaw.length/8)|0, half=fov*Math.hypot(W,H)/Math.max(W,H)*0.5, cosLim=Math.cos(Math.min(89,half)*D2R), fx=camFwd[0],fy=camFwd[1],fz=camFwd[2], R=scale(1e4);
  const rows=[];
  for(let i=0;i<n;i++){ const b=i*8, dr=(dv.getUint16(b+2,true)*(180/65535)-90)*D2R, dz=Math.sin(dr);
    if(dz*fz+Math.sqrt(1-dz*dz)<cosLim) continue;
    const rr=dv.getUint16(b,true)*(360/65535)*D2R, cd=Math.cos(dr), dx=cd*Math.cos(rr), dy=cd*Math.sin(rr);
    if(dx*fx+dy*fy+dz*fz<cosLim) continue;
    projectInto(dx*R,dy*R,dz*R,_pj); if(_pj.depth<=0||_pj.x<0||_pj.x>W||_pj.y<0||_pj.y>H) continue;   // on screen
    const g=dv.getUint8(b+6)/255*28-2, bprp=dv.getUint8(b+7)/255*6-1, d=dv.getUint16(b+4,true)/65535*gaiaRange;
    const pr=pv.getInt16(i*4,true), pd=pv.getInt16(i*4+2,true), ruwe=qv?qv.getUint8(i*12+4)/20:undefined;
    if(S.ruwe&&ruwe!==undefined&&ruwe>1.4) continue;
    rows.push({ i, dx,dy,dz, g, bprp, d, pr, pd, ruwe, MG:g-5*Math.log10(Math.max(d,0.01)/10) });
    if(rows.length>=200000) break; }
  FD.rows=rows;
  const step=Math.max(1,Math.floor(rows.length/6000));
  store.set({ n:rows.length, fov, msg:rows.length?`${rows.length.toLocaleString('en-US')} Gaia stars in the ${fov>=1?fov.toFixed(1)+'°':(fov*60).toFixed(0)+'′'} field${S.ruwe?' (RUWE ≤ 1.4)':''}`:'no Gaia stars in this field',
    cmd:rows.filter((_,k)=>k%step===0).map(r=>[r.bprp,r.MG]), vpd:rows.filter((_,k)=>k%step===0).map(r=>[r.pr,r.pd]), box:FD.box, members:0 });
  if(FD.box) selectBox(FD.box);
  return rows.length;
}
// a box in the VPD (mas/yr) picks members; they are ringed in the telescope
export function selectBox(box){
  FD.box=box; if(!box){ FD.members=[]; store.update(s=>({ ...s, box:null, members:0 })); V.dirty=true; return 0; }
  const m=FD.rows.filter(r=>r.pr>=box.pr0&&r.pr<=box.pr1&&r.pd>=box.pd0&&r.pd<=box.pd1); FD.members=m;
  let md=0, mb=0; for(const r of m){ md+=r.d; mb+=r.bprp; } const n=m.length||1;
  store.update(s=>({ ...s, box, members:m.length, meanD:md/n, meanBprp:mb/n, memberCmd:m.map(r=>[r.bprp,r.MG]) })); V.dirty=true; return m.length;
}
export function membersAsSet(name){
  if(!FD.members.length) return 0;
  const text=['name,ra,dec,parallax,mag,pmra,pmdec,ruwe,bp_rp'].concat(FD.members.map((r,k)=>{ const ra=((Math.atan2(r.dy,r.dx)/D2R)+360)%360, dec=Math.asin(r.dz)/D2R;
    return `member ${k+1},${ra.toFixed(5)},${dec.toFixed(5)},${(1000/r.d).toFixed(3)},${r.g.toFixed(2)},${r.pr},${r.pd},${r.ruwe!==undefined?r.ruwe.toFixed(2):''},${r.bprp.toFixed(2)}`; })).join('\n');
  return importUser(text, name||`VPD members · ${FD.members.length}`, { src:'vpd', epoch:2016.0 });
}
export function drawMembers(){
  if(!S.skyMode||!FD.members.length) return;
  const R=scale(1e4); ctx.strokeStyle='rgba(196,170,255,0.9)'; ctx.lineWidth=1.2;
  for(const r of FD.members){ projectInto(r.dx*R,r.dy*R,r.dz*R,_pj); if(_pj.depth<=0) continue; ctx.beginPath(); ctx.arc(_pj.x,_pj.y,6,0,6.2832); ctx.stroke(); }
}
Object.assign(api,{ scanField, selectBox, membersAsSet });
