// Guided blinking. Between two survey epochs a star with proper motion μ moves by
// μ·Δt; for the rows on screen (yours and the HYG stars) this is a predicted jump in
// arcseconds and screen pixels. The list says where to look, the arrows on the sky say
// which way: tail at the first survey's epoch, head at the second's. A jump without an
// entry here is the interesting case — something the catalogues missed, or something
// that is not a star.
import { movers as store } from '../lib/stores.js';
import { ctx } from './canvas.js';
import { gaiaPm, gaiaRange, gaiaRaw } from './gl.js';
import { hygProj } from './hyg.js';
import { S, V } from './state.js';
import { ST, SURVEYS, fovDeg } from './survey.js';
import { userProj } from './userdata.js';
import { H, W, _pj, camDist, camFwd, compress, projectInto } from './view.js';

const MAS=4.84813681e-9;
export let MOVERS=[];
let _key='';
function epochOf(id){ const s=SURVEYS.find(x=>x.id===id); return s?s.ep:2000; }
// sky position of a row at `epoch`, given its catalogue epoch and proper motion (small angles)
function shifted(o,epoch){
  const t=epoch-(o.ep||2000), a=(o.pr||0)*t*MAS, b=(o.pd||0)*t*MAS;
  let dx=o.dx,dy=o.dy,dz=o.dz;
  const cq=Math.hypot(dx,dy)||1e-9, ex=-dy/cq, ey=dx/cq, nx=-dz*dx/cq, ny=-dz*dy/cq, nz=cq;
  dx+=ex*a+nx*b; dy+=ey*a+ny*b; dz+=nz*b;
  const L=Math.hypot(dx,dy,dz)||1; return [dx/L,dy/L,dz/L];
}
export function updateMovers(){
  if(!S.skyMode||!ST.on||camDist>1e-4){ if(MOVERS.length){ MOVERS=[]; store.set({list:[], a:'', b:'', dt:0}); _key=''; } return; }
  const ia=ST.id, ib=ST.blinkWith===ST.id?(ST.id==='dss'?'ps1':'dss'):ST.blinkWith;
  const key=[S.yaw.toFixed(3),S.pitch.toFixed(3),V.fovK.toFixed(2),ia,ib,userProj.length,hygProj.length,gaiaPm?gaiaPm.length:0,gaiaRange].join();
  if(key===_key) return; _key=key;
  const ea=epochOf(ia), eb=epochOf(ib), dt=eb-ea, pxPerDeg=Math.max(W,H)/fovDeg();
  const out=[], seen=new Set();
  const add=(o,name)=>{ const pm=Math.hypot(o.pr||0,o.pd||0); if(!pm) return;
    if(o.x&&o.x.otype==='Pl') return;                                    // SIMBAD's planets: the star carries the motion
    const jump=pm*Math.abs(dt)/1000, px=jump/3600*pxPerDeg;
    if(jump<0.5) return;
    // one entry per place: SIMBAD lists a star's planets as objects at the star's position
    const k=o.dx.toFixed(5)+','+o.dy.toFixed(5)+','+o.dz.toFixed(5); if(seen.has(k)) return; seen.add(k);
    out.push({o, name:name.replace(/^NAME /,''), pm, jump, px, usr:!!o.usr, ea, eb, src:o.usr?'your data':o.gpick==='gaia'?'Gaia DR3 cloud':'HYG'}); };
  for(const o of userProj) add(o, o.n||`Row ${o.i+1}`);
  if(S.hyg) for(const s of hygProj) add(s, s.n||(s.hip?'HIP '+s.hip:'star'));
  // the Gaia cloud: every star within 100 pc with its DR3 proper motion, scanned on the CPU
  const fov=fovDeg();
  // the side file belongs to one catalogue: same star count, same order (the Docker set has its own)
  if(S.gaia&&gaiaRaw&&gaiaPm&&fov<=30&&(gaiaRaw.length/8|0)===(gaiaPm.length/4|0)){
    const dv=new DataView(gaiaRaw.buffer,gaiaRaw.byteOffset,gaiaRaw.byteLength), pv=new DataView(gaiaPm.buffer,gaiaPm.byteOffset,gaiaPm.byteLength);
    const n=(gaiaRaw.length/8)|0, cosLim=Math.cos(Math.min(89,fov*0.75)*0.0174533), D2R=Math.PI/180;
    const fx=camFwd[0],fy=camFwd[1],fz=camFwd[2], minPm=0.5*1000/Math.max(1,Math.abs(dt));   // mas/yr for a 0.5″ jump
    for(let i=0;i<n;i++){
      const pr=pv.getInt16(i*4,true), pd=pv.getInt16(i*4+2,true);
      if(pr*pr+pd*pd<minPm*minPm) continue;
      const b=i*8, dr=(dv.getUint16(b+2,true)*(180/65535)-90)*D2R, dz=Math.sin(dr);
      if(dz*fz+Math.sqrt(1-dz*dz)<cosLim) continue;                      // a cheap bound before the trig
      const rr=dv.getUint16(b,true)*(360/65535)*D2R, cd=Math.cos(dr), dx=cd*Math.cos(rr), dy=cd*Math.sin(rr);
      if(dx*fx+dy*fy+dz*fz<cosLim) continue;
      const mag=dv.getUint8(b+6)/255*28-2, d=dv.getUint16(b+4,true)/65535*gaiaRange;
      add({dx,dy,dz,d,pr,pd,ep:2016,m:mag,gpick:'gaia'}, `Gaia star · G ${mag.toFixed(1)}`);
    }
  }
  out.sort((a,b)=>b.jump-a.jump);
  MOVERS=out.slice(0,60);
  const sa=SURVEYS.find(x=>x.id===ia), sb=SURVEYS.find(x=>x.id===ib);
  store.set({ list:MOVERS.slice(0,14).map(m=>({ name:m.name, pm:m.pm, jump:m.jump, px:m.px, usr:m.usr, ra:Math.atan2(m.o.dy,m.o.dx)*57.29578, dec:Math.asin(m.o.dz)*57.29578 })),
    a:sa?sa.n:'', b:sb?sb.n:'', ea, eb, dt });
}
// arrows from the first epoch to the second, drawn over the images
export function drawMovers(){
  if(!S.skyMode||!ST.on||!MOVERS.length) return;
  const ea=epochOf(ST.id), eb=epochOf(ST.blinkWith===ST.id?(ST.id==='dss'?'ps1':'dss'):ST.blinkWith);
  const R=compress(1e4);
  ctx.lineWidth=1.3; ctx.strokeStyle='rgba(255,176,96,0.9)'; ctx.fillStyle='rgba(255,176,96,0.9)';
  for(const m of MOVERS){
    if(m.px<3) continue;
    const o=m.o, Rr=compress(o.d||1e4);
    const A=shifted(o,ea), B=shifted(o,eb);
    const pa=projectInto(A[0]*Rr,A[1]*Rr,A[2]*Rr,_pj); const ax=pa.x, ay=pa.y, da=pa.depth;
    const pb=projectInto(B[0]*Rr,B[1]*Rr,B[2]*Rr,_pj); const bx=pb.x, by=pb.y;
    if(da<=0||pb.depth<=0) continue;
    const L=Math.hypot(bx-ax,by-ay); if(L<2) continue;
    const ux=(bx-ax)/L, uy=(by-ay)/L;
    ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx,by); ctx.lineTo(bx-ux*6-uy*3, by-uy*6+ux*3); ctx.lineTo(bx-ux*6+uy*3, by-uy*6-ux*3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(ax,ay,2.2,0,6.2832); ctx.stroke();
  }
  void R;
}
