// Measure tool.
import { objWorld, searchMsg } from './actions.js';
import { ctx } from './canvas.js';
import { PC2LY } from './data.js';
import { pathBegin, pathPt, pathStroke } from './draw.js';
import { fmt } from './hud.js';
import { LBL, P_HUD } from './labels.js';
import { V } from './state.js';
import { AU_PC, invScale, project, scale } from './view.js';
// ---- measure tool: physical distance between two picked objects ----
export let measureMode=false, measA=null, measB=null;
function physPos(o){                              // object -> physical position (pc, world axes)
  if(o&&o._e) return [o._e[0]*AU_PC, o._e[2]*AU_PC, o._e[1]*AU_PC];   // solar body (ecliptic AU)
  const w=objWorld(o); if(!w) return null;
  const m2=Math.hypot(w[0],w[1],w[2]); if(m2<1e-12) return [0,0,0];
  const r=invScale(m2)/m2; return [w[0]*r,w[1]*r,w[2]*r];
}
function measWorld(P){ const r=Math.hypot(P[0],P[1],P[2]); if(r<1e-15) return [0,0,0];
  const R=scale(r)/r; return [P[0]*R,P[1]*R,P[2]*R]; }
function measName(o){ return o.n||o.h||'object'; }
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
  const txt = dpc<0.001 ? (dpc/AU_PC).toFixed(2)+' AU' : fmt(dpc*PC2LY)+' ly · light needs '+fmt(dpc*PC2LY)+' yr';
  ctx.font='11px ui-monospace,monospace'; ctx.fillStyle='rgba(255,220,140,.95)';
  ctx.fillText(txt,(pA.x+pB.x)/2+8,(pA.y+pB.y)/2-6);
}
export function measurePick(hit){
  const P=physPos(hit); if(!P) return;
  if(!measA||measB){ measA={o:hit,P:P}; measB=null; searchMsg.textContent=measName(hit)+' — pick a second object'; }
  else { measB={o:hit,P:P};
    const dpc=Math.hypot(measA.P[0]-P[0],measA.P[1]-P[1],measA.P[2]-P[2]);
    searchMsg.textContent=measName(measA.o)+' ↔ '+measName(hit)+' = '
      +(dpc<0.001?(dpc/AU_PC).toFixed(2)+' AU':fmt(dpc*PC2LY)+' ly'); }
  V.dirty=true;
}
document.getElementById('measureBtn').addEventListener('click',()=>{
  measureMode=!measureMode; measA=measB=null;
  document.getElementById('measureBtn').classList.toggle('active',measureMode);
  searchMsg.textContent=measureMode?'Measure: click the first object':''; V.dirty=true;
});
