// Sky-sphere figures: constellations, active meteor-shower radiants.
import { activeShowers } from '../lib/live.js';
import { ctx } from './canvas.js';
import { pathBegin, pathPt, pathStroke } from './draw.js';
import { LBL, P_GRID, P_SMALL } from './labels.js';
import { CONS, CON_NAME, dirOf } from './sky-data.js';
import { cmeSolarMs } from './solar-live.js';
import { S, V } from './state.js';
import { camDist, invScale, project, scale } from './view.js';
// ---- constellation lines (sky sphere at fixed radius) ----
// The figures live on a sphere 30 pc out. From much farther away that sphere is a
// knot of 89 names around the Sun, so the layer fades out between 20 and 80 pc.
export function skyAlpha(){ const d=camDist>1e-9?invScale(camDist):0; return Math.max(0,Math.min(1,(80-d)/60)); }
export function drawConstellations(){ LBL.prio=P_GRID;
  if(!S.con) return;
  const A=skyAlpha(); if(A<=0.02) return;
  const R=scale(30);                        // sky-sphere radius among the local stars
  for(const k of CONS){
    for(const pl of k._L){
      pathBegin();
      for(const d of pl) pathPt(project(d[0]*R,d[1]*R,d[2]*R));
      pathStroke(`rgba(128,150,215,${0.15*A})`,1);
    }
    const cp=project(k.c[0]*R,k.c[1]*R,k.c[2]*R);
    if(cp.depth>V.NEAR){ ctx.font='8.5px ui-monospace,monospace'; ctx.fillStyle=`rgba(150,170,225,${0.38*A})`;
      ctx.fillText(CON_NAME[k.id]||k.id, cp.x+3, cp.y); }
  }
}
// ---- meteor-shower radiants active on the selected date (IMO calendar, sky sphere) ----
export function drawShowers(){ LBL.prio=P_SMALL;
  if(skyAlpha()<=0.02) return;                 // radiants sit on the same sphere
  const act=activeShowers(cmeSolarMs()); if(!act.length) return;
  const R=scale(30);
  for(const s of act){
    const d=dirOf(s.ra,s.dec), p=project(d[0]*R,d[1]*R,d[2]*R);
    if(p.depth<=V.NEAR) continue;
    ctx.strokeStyle='rgba(190,255,200,0.55)'; ctx.lineWidth=1;
    for(let k=0;k<4;k++){ const a=k*0.7854;            // radiant: 8-ray asterisk
      const dx=Math.cos(a)*6, dy=Math.sin(a)*6;
      ctx.beginPath(); ctx.moveTo(p.x-dx,p.y-dy); ctx.lineTo(p.x+dx,p.y+dy); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(p.x,p.y,2,0,6.2832); ctx.fillStyle='rgba(210,255,215,0.9)'; ctx.fill();
    ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(190,255,200,0.75)';
    ctx.fillText(`${s.n} · ZHR ${s.zhr}`, p.x+9, p.y+3);
  }
}
