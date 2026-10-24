// Uncertainties drawn, not just printed. On the map: the distance range of the pinned
// object (16th–84th percentile, or ±1σ of 1/ϖ) as a radial bar along its line of sight.
// In the telescope: the 1σ position uncertainty of a propagated star — its proper-motion
// error times the years since its catalogue epoch — as a dashed ellipse. Only objects
// that carry errors get one; a bar or ellipse that would be under a pixel is not drawn.
import { ctx } from './canvas.js';
import { hygProj } from './hyg.js';
import { LBL, P_SEL } from './labels.js';
import { tNow, tSince } from './motion.js';
import { S, V } from './state.js';
import { fovDeg } from './survey.js';
import { userProj } from './userdata.js';
import { H, W, camDist, project, scale } from './view.js';
export const ERRSTAT={ bars:0, ellipses:0 };               // what the last frame drew (the e2e run reads it)
function dirOf(o){ if(o.dx!==undefined) return [o.dx,o.dy,o.dz]; if(o._dir) return o._dir; return null; }
// the distance range of an object: the 16–84 % percentiles it carries, or 1/ϖ ± σ (HYG stars with Gaia errors)
export function rangeOf(o){
  if(!o) return null;
  if(o.dlo>0&&isFinite(o.dhi)&&o.dhi>o.dlo) return [o.dlo,o.dhi];
  if(o.ep>0&&o.d>0&&o.dx!==undefined&&!o.usr){ const plx=1000/o.d; if(plx-o.ep>0) return [1000/(plx+o.ep),1000/(plx-o.ep)]; }
  return null;
}
export function drawErrors(){
  ERRSTAT.bars=0; ERRSTAT.ellipses=0;
  const sel=S.pinned||S.hover, rg=rangeOf(sel);
  if(!S.skyMode && rg){
    const d=dirOf(sel); if(d){
      const a=scale(rg[0]), b=scale(rg[1]), pa=project(d[0]*a,d[1]*a,d[2]*a), pb=project(d[0]*b,d[1]*b,d[2]*b);
      if(pa.depth>V.NEAR&&pb.depth>V.NEAR){ const L=Math.hypot(pb.x-pa.x,pb.y-pa.y);
        if(L>=3&&L<4*Math.max(W,H)){ const ux=(pb.x-pa.x)/L, uy=(pb.y-pa.y)/L, tx=-uy*4, ty=ux*4;
          ctx.strokeStyle='rgba(255,207,107,0.85)'; ctx.lineWidth=1.2;
          ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y);
          ctx.moveTo(pa.x-tx,pa.y-ty); ctx.lineTo(pa.x+tx,pa.y+ty); ctx.moveTo(pb.x-tx,pb.y-ty); ctx.lineTo(pb.x+tx,pb.y+ty); ctx.stroke();
          ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(255,220,140,0.9)'; LBL.prio=P_SEL;
          const f=v=>v<100?v.toFixed(2):v<1e4?v.toFixed(0):v.toExponential(1);
          ctx.fillText(`${f(rg[0])} – ${f(rg[1])} pc`, (pa.x+pb.x)/2+6, (pa.y+pb.y)/2-5); ERRSTAT.bars++; } } }
  }
  if(S.skyMode && camDist<1e-4){
    const pxA=Math.max(W,H)/fovDeg()/3600;                 // screen px per arcsecond
    const one=(o,t,sx,sy)=>{ if(o._sx===undefined) return; const rx=sx*Math.abs(t)/1000*pxA, ry=sy*Math.abs(t)/1000*pxA;
      if(Math.max(rx,ry)<1) return; const isSel=(o===S.pinned||o===S.hover);
      ctx.setLineDash([3,3]); ctx.strokeStyle=isSel?'rgba(79,214,200,0.9)':'rgba(255,176,96,0.55)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.ellipse(o._sx,o._sy,Math.max(rx,0.5),Math.max(ry,0.5),0,0,6.2832); ctx.stroke(); ctx.setLineDash([]); ERRSTAT.ellipses++;
      if(isSel){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(79,214,200,0.9)';
        const s=Math.max(sx,sy)*Math.abs(t)/1000; ctx.fillText(`1σ ${s>=60?(s/60).toFixed(1)+'′':s>=1?s.toFixed(1)+'″':s.toFixed(2)+'″'} after ${Math.abs(t).toFixed(0)} yr`, o._sx+Math.max(rx,0.5)+5, o._sy-Math.max(ry,0.5)-3); } };
    for(const o of userProj) if(o.epr!==undefined||o.epd!==undefined) one(o, tSince(o.ep||2000), o.epr||0, o.epd||0);
    if(S.hyg) for(const s of hygProj) if(s.epm!==undefined) one(s, tNow(), s.epm, s.epm);
    if(sel&&sel.gpick==='gaia'&&sel.epm!==undefined&&sel._sx!==undefined) one(sel, tSince(2016), sel.epm, sel.epm);
  }
}
