// HYG background star field (2D fallback + projection for picking).
import { ctx } from './canvas.js';
import { LBL, P_SEL, P_STAR } from './labels.js';
import { hygPos } from './motion.js';
import { HYG } from './solar-data.js';
import { S, V } from './state.js';
import { H, W, _pj, compress, projectInto } from './view.js';
// ---- HYG background starfield ----
export let hygProj=[];
const _unusedMAS2RAD=Math.PI/(180*3600*1000);
export function projectHyg(){
  hygProj.length=0; if(!S.hyg) return;
  const pm=S.pm && S.pmYears!==0, ty=S.pmYears;
  for(const s of HYG){
    let dx=s.dx,dy=s.dy,dz=s.dz, dNow=s.d;
    if(pm){                                        // straight-line 3D motion over ty years
      const q=hygPos(s,ty); dNow=Math.hypot(q[0],q[1],q[2])||1e-9;
      dx=q[0]/dNow; dy=q[1]/dNow; dz=q[2]/dNow;
    }
    s._dNow=dNow;
    const dr=compress(dNow);
    const p=projectInto(dx*dr,dy*dr,dz*dr,_pj);
    if(p.depth<=V.NEAR) continue;
    if(p.x<-90||p.x>W+90||p.y<-90||p.y>H+90) continue;
    let bright=6.8-s.m; if(bright<0) bright=0;
    const size=(0.4+bright*0.34)*V.foc*0.0032/p.depth;
    if(size<0.34 && s!==S.hover && s!==S.pinned) continue;   // cull sub-pixel stars
    s._sx=p.x; s._sy=p.y; s._depth=p.depth; s._z2=p.z2; s._bright=bright; s._size=size;
    hygProj.push(s);
  }
  hygProj.sort((a,b)=>a._z2-b._z2);
}
export function drawHyg(){ LBL.prio=P_STAR;
  for(const s of hygProj){
    const bright=s._bright, size=Math.max(0.35, Math.min(3.6, s._size));
    const c=s.c, a=Math.max(.22,Math.min(1,(0.28+bright*0.12)*Math.min(1,1.9-s._depth*0.4)));
    const sel=(s===S.hover||s===S.pinned);
    ctx.beginPath(); ctx.arc(s._sx,s._sy, sel?size+1.4:size, 0, 6.2832);
    ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${a})`; ctx.fill();
    if(bright>5.2||sel){                               // glow for the bright named stars
      ctx.beginPath(); ctx.arc(s._sx,s._sy,size*2.6,0,6.2832);
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${a*0.12})`; ctx.fill();
    }
    if(sel){ ctx.beginPath(); ctx.arc(s._sx,s._sy,size+7,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    if(s.n && (sel || (s.m<1.7 && S.camZ<3.2))){        // label very bright / selected
      ctx.font=(sel?'11px':'9.5px')+' ui-monospace,monospace';
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${sel?1:.6})`;
      LBL.prio=sel?P_SEL:P_STAR;
      ctx.fillText(s.n, s._sx+size+4, s._sy+3); LBL.prio=P_STAR;
    }
  }
}
