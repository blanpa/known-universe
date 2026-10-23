// Local-Volume galaxies.
import { ctx, cv } from './canvas.js';
import { GAL, PC2LY } from './data.js';
import { blobSprite } from './draw.js';
import { LBL, P_GAL, P_SEL } from './labels.js';
import { S, V } from './state.js';
import { DPR, H, W, _d2x, _d2y, _pj, camDir2i, projectInto, scale } from './view.js';
// ---- galaxy layer ----
export let galProj=[];
export function projectGalaxies(){
  galProj.length=0; if(!S.galaxies) return;
  for(const g of GAL){
    const R=scale(g.mpc*1e6); g._x=g.dx*R; g._y=g.dy*R; g._z=g.dz*R;
    const p=projectInto(g._x,g._y,g._z,_pj);
    if(p.depth<=V.NEAR) continue;
    if(p.x<-90||p.x>W+90||p.y<-90||p.y>H+90) continue;
    g._sx=p.x; g._sy=p.y; g._depth=p.depth; g._z2=p.z2;
    galProj.push(g);
  }
  galProj.sort((a,b)=>a._z2-b._z2);
}
export function drawGalaxies(list){ LBL.prio=P_GAL;
  for(const g of list){
    const s=Math.max(1.4, V.foc*0.011/g._depth*g._gs);
    const c=g.c, a=Math.max(.25,Math.min(.95, 1.7-g._depth*0.045));
    if(s>4){                       // soft nebulous blob only for the larger/nearer ones
      const ba=(g.ba&&g.ba>0.05)?g.ba:1;
      const sprite=blobSprite(c[0],c[1],c[2],0.85,0.3);
      ctx.globalAlpha=a;             // sprite carries the stop shape; alpha scales it
      // a round galaxy needs no rotation, so it skips the transform entirely; the rest
      // use setTransform rather than save/rotate/scale/restore (three fewer state ops
      // per galaxy, and camDir2i keeps the position-angle maths allocation-free)
      if(ba>0.985 || g.pa===undefined){
        ctx.drawImage(sprite, g._sx-s, g._sy-s, s*2, s*2);
      } else {
        const dx3=g.dx,dy3=g.dy,dz3=g.dz, cd3=Math.max(1e-6,Math.hypot(dx3,dy3));
        camDir2i(-dy3/cd3, dx3/cd3, 0);           const e2x=_d2x, e2y=_d2y;
        camDir2i(-dz3*dx3/cd3, -dz3*dy3/cd3, cd3); const n2x=_d2x, n2y=_d2y;
        const pa=g.pa*0.0174533, cpa=Math.cos(pa), spa=Math.sin(pa);
        const th=Math.atan2(n2y*cpa+e2y*spa, n2x*cpa+e2x*spa);
        const ct=Math.cos(th), stt=Math.sin(th);
        ctx.setTransform(DPR*ct, DPR*stt, -DPR*stt*ba, DPR*ct*ba,
                         DPR*g._sx, (cv.height/H)*g._sy);
        ctx.drawImage(sprite, -s, -s, s*2, s*2);
        ctx.setTransform(DPR,0,0,cv.height/H,0,0);
      }
      ctx.globalAlpha=1;
    } else if(s<1.8){              // sub-2-px far galaxy: one square (a path arc costs the same
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${Math.min(1,a*0.55+0.3)})`;   // as a planet at this size)
      ctx.fillRect(g._sx-s,g._sy-s,s*2,s*2);
    } else {                       // cheap flat fill for tiny far galaxies — visually identical
      ctx.beginPath(); ctx.arc(g._sx,g._sy,s,0,6.2832);
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${a*0.55})`; ctx.fill();
    }
    if(s>=1.8){                    // the brighter core: invisible under a 2-px glyph, so skipped there
      ctx.beginPath(); ctx.arc(g._sx,g._sy,Math.max(.8,s*0.26),0,6.2832);
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${Math.min(1,a+0.25)})`; ctx.fill(); }
    const sel=(g===S.hover||g===S.pinned);
    if(sel){ ctx.beginPath(); ctx.arc(g._sx,g._sy,s+6,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    if(g.f||sel){
      ctx.font=(sel?'11px':'10px')+' ui-monospace,monospace';
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${sel?1:0.72})`;
      LBL.prio=sel?P_SEL:P_GAL;
      ctx.fillText(g.n, g._sx+s+4, g._sy+3); LBL.prio=P_GAL;
    }
  }
}

// unified distance ruler — one set of rings spanning AU → light-years → Mpc
export const LY_PC=1/PC2LY;
