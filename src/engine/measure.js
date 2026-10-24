// Measure tool.
import { api } from '../lib/api.js';
import { measure as measureStore, measureLog } from '../lib/stores.js';
import { findByName, msg } from './actions.js';
import { ctx } from './canvas.js';
import { PC2LY } from './data.js';
import { pathBegin, pathPt, pathStroke } from './draw.js';
import { nameOf, physPos, radec } from './entity.js';
import { fmt } from './hud.js';
import { epochNow } from './motion.js';
import { LBL, P_HUD } from './labels.js';
import { V } from './state.js';
import { AU_PC, ctr, project, scale } from './view.js';
// ---- measure tool: physical distance between two picked objects ----
export let measureMode=false, measA=null, measB=null;
export const MEAS={ log:[] };                       // every completed pair, for export
function measWorld(P){ const r=Math.hypot(P[0],P[1],P[2]); if(r<1e-15) return [0,0,0];
  const R=scale(r)/r; return [P[0]*R,P[1]*R,P[2]*R]; }
const measName=nameOf;
export function drawMeasure(){ LBL.prio=P_HUD;
  if(!measA||!measA.P) return;
  const wA=measWorld(measA.P), pA=project(wA[0],wA[1],wA[2]);
  ctx.beginPath(); ctx.arc(pA.x,pA.y,6,0,6.2832); ctx.strokeStyle='rgba(255,207,107,.9)'; ctx.lineWidth=1.4; ctx.stroke();
  if(!measB||!measB.P) return;
  const wB=measWorld(measB.P), pB=project(wB[0],wB[1],wB[2]);
  if(pA.depth<=V.NEAR||pB.depth<=V.NEAR) return;
  ctx.beginPath(); ctx.arc(pB.x,pB.y,6,0,6.2832); ctx.stroke();
  pathBegin(); pathPt(pA); pathPt(pB); pathStroke('rgba(255,207,107,.7)',1.4,[5,4]);
  const dpc=Math.hypot(measA.P[0]-measB.P[0],measA.P[1]-measB.P[1],measA.P[2]-measB.P[2]);
  const txt = (dpc<0.001 ? (dpc/AU_PC).toFixed(2)+' AU' : fmt(dpc*PC2LY)+' ly · light needs '+fmt(dpc*PC2LY)+' yr')+' · '+angularText(measA.P,measB.P);
  ctx.font='11px ui-monospace,monospace'; ctx.fillStyle='rgba(255,220,140,.95)';
  ctx.fillText(txt,(pA.x+pB.x)/2+8,(pA.y+pB.y)/2-6);
}
export function measurePick(hit){
  const P=physPos(hit); if(!P) return;
  if(!measA||measB){ measA={o:hit,P:P}; measB=null; msg(measName(hit)+' — pick a second object'); }
  else { measB={o:hit,P:P};
    const dpc=Math.hypot(measA.P[0]-P[0],measA.P[1]-P[1],measA.P[2]-P[2]), ang=angular(measA.P,P);
    MEAS.log.push({ a:measName(measA.o), b:measName(hit), dist_pc:+dpc.toPrecision(8), dist_au:+(dpc/AU_PC).toPrecision(8), dist_ly:+(dpc*PC2LY).toPrecision(8),
      sep:+ang.sep.toPrecision(8), pa:+ang.pa.toFixed(3), vantage:vantageText(), epoch:+epochNow().toFixed(4), at:new Date().toISOString() });
    measureLog.set(MEAS.log.slice());
    msg(measName(measA.o)+' ↔ '+measName(hit)+' = '+(dpc<0.001?(dpc/AU_PC).toFixed(2)+' AU':fmt(dpc*PC2LY)+' ly')+' · '+angularText(measA.P,P)); }
  V.dirty=true;
}
// a measurement typed by name, no clicking: measureBetween('Sirius','Vega')
export function measureBetween(a,b){
  const A=findByName(a), B=findByName(b); if(!A||!B) return null;
  measA=null; measB=null; measurePick(A[1]); measurePick(B[1]); return MEAS.log[MEAS.log.length-1]||null;
}
api.measureBetween=measureBetween;
export function measureToggle(){
  measureMode=!measureMode; measA=measB=null; measureStore.set(measureMode);
  msg(measureMode?'Measure: click the first object':''); V.dirty=true;
}
api.measure=measureToggle;

// angular separation and position angle (east of north) as seen from the vantage point
export function angular(A,B){
  const a=[A[0]-ctr.x,A[1]-ctr.y,A[2]-ctr.z], b=[B[0]-ctr.x,B[1]-ctr.y,B[2]-ctr.z];
  const la=Math.hypot(a[0],a[1],a[2])||1e-12, lb=Math.hypot(b[0],b[1],b[2])||1e-12;
  for(let i=0;i<3;i++){ a[i]/=la; b[i]/=lb; }
  const chord=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]), sep=2*Math.asin(Math.min(1,chord/2))*57.29577951;
  const [ra1,de1]=radec(a[0],a[1],a[2]), [ra2,de2]=radec(b[0],b[1],b[2]), D=Math.PI/180;
  const dA=(ra2-ra1)*D, pa=(Math.atan2(Math.sin(dA)*Math.cos(de2*D), Math.cos(de1*D)*Math.sin(de2*D)-Math.sin(de1*D)*Math.cos(de2*D)*Math.cos(dA))*57.29577951+360)%360;
  return { sep, pa };
}
const vantageText=()=> (Math.hypot(ctr.x,ctr.y,ctr.z)<1e-9) ? 'Sun' : `view centre (${ctr.x.toPrecision(4)}, ${ctr.y.toPrecision(4)}, ${ctr.z.toPrecision(4)} world)`;
export function angularText(A,B){
  const { sep, pa }=angular(A,B);
  const sepT = sep>=1 ? `${Math.floor(sep)}°${String(Math.round((sep-Math.floor(sep))*60)).padStart(2,'0')}′` : sep*60>=1 ? `${Math.floor(sep*60)}′${String(Math.round((sep*60-Math.floor(sep*60))*60)).padStart(2,'0')}″` : `${(sep*3600).toFixed(1)}″`;
  return `sep ${sepT} · PA ${pa.toFixed(1)}°`;
}
