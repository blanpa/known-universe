// Deep-sky layers: nebulae & clusters, open clusters, pulsars, S2, the CMB shell.
import { drawBlackHole } from './blackhole.js';
import { ctx } from './canvas.js';
import { blobSprite, pathBegin, pathPt, pathStroke } from './draw.js';
import { glBufC, glBufP, glStars } from './gl.js';
import { LBL, P_DEEP, P_GRID, P_SMALL } from './labels.js';
import { sgraScreen } from './mw.js';
import { CLUSTERS, CLU_T, DSO, DSO_T, PULSARS, SGRA } from './sky-data.js';
import { solarJD } from './solar-data.js';
import { S, V } from './state.js';
import { H, W, camDir2, camPos, lodA, project, scale } from './view.js';
// ---- deep-sky objects (nebulae & clusters) ----
export let dsoProj=[];
export let pulsarProj=[];
export let cluProj=[];
// a GW event is visible → frame loop keeps the ripples moving
export function drawDSO(){ LBL.prio=P_DEEP;
  dsoProj.length=0; if(!S.dso) return;
  for(const o of DSO){
    const R=scale(o.d); o._x=o._dir[0]*R; o._y=o._dir[1]*R; o._z=o._dir[2]*R;
    const p=project(o._x,o._y,o._z);
    if(p.depth<=V.NEAR) continue;
    if(p.x<-70||p.x>W+70||p.y<-70||p.y>H+70) continue;
    const c=(DSO_T[o.t]||DSO_T.EN).c, sz=Math.max(3,Math.min(26,V.foc*0.02/p.depth));
    const sel=(o===S.hover||o===S.pinned);
    o._sx=p.x; o._sy=p.y;
    const bhR=o.t==='BH'?Math.min(Math.min(W,H)*0.22, V.foc*0.028/p.depth):0;
    if(bhR>=9){ drawBlackHole(p.x,p.y,bhR,0.95); }   // stellar BH up close: the simulated look
    else{
    ctx.drawImage(blobSprite(c[0],c[1],c[2],0.62,0.24), p.x-sz*1.9, p.y-sz*1.9, sz*3.8, sz*3.8);
    if(o.t==='GW'){                              // spacetime ripples spreading from the merger
      V.gwOnScreen=true;
      const ph=(performance.now()/2600)%1;
      for(let k=0;k<3;k++){ const f=(ph+k/3)%1, rr=sz*(0.9+f*3.6);
        ctx.beginPath(); ctx.arc(p.x,p.y,rr,0,6.2832);
        ctx.strokeStyle=`rgba(130,255,220,${(1-f)*0.5})`; ctx.lineWidth=1.2; ctx.stroke(); }
    }
    if(o.t==='GC'||o.t==='OC'){                 // clusters: a sprinkle of stars
      const n=o.t==='GC'?10:6;
      for(let k=0;k<n;k++){ const a=k*2.399, rr=sz*(0.25+0.6*(((k*7)%5)/5));
        ctx.beginPath(); ctx.arc(p.x+Math.cos(a)*rr,p.y+Math.sin(a)*rr,0.9,0,6.2832);
        ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},0.9)`; ctx.fill(); }
    } else {                                     // nebulae: a soft bright core
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(1,sz*0.32),0,6.2832);
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},0.8)`; ctx.fill();
    }
    }
    if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,sz*1.9+6,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    dsoProj.push(o);
    ctx.font=(sel?'10px':'9px')+' ui-monospace,monospace';
    ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${sel?1:0.72})`;
    ctx.fillText(o.n, p.x+sz*1.9+3, p.y+3);
  }
}
export function drawClusters(){ LBL.prio=P_DEEP;
  cluProj.length=0; if(!S.oclu) return;
  for(const c of CLUSTERS){
    const R=scale(c.d); const x=c._dir[0]*R, y=c._dir[1]*R, z=c._dir[2]*R;
    const p=project(x,y,z);
    if(p.depth<=V.NEAR) continue;
    if(p.x<-20||p.x>W+20||p.y<-20||p.y>H+20) continue;
    const selc=(c===S.hover||c===S.pinned);
    const raw=V.foc*0.012/p.depth;
    if(raw<0.1 && !selc) continue;
    const sz=Math.max(1.0,Math.min(3.2,raw));
    c._x=x; c._y=y; c._z=z; c._sx=p.x; c._sy=p.y;
    const cc=CLU_T[c.ct||0].c;
    if(!(glStars()&&glBufC)){ ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,6.2832);
      ctx.fillStyle=`rgba(${cc[0]},${cc[1]},${cc[2]},0.55)`; ctx.fill(); }
    cluProj.push(c);
    if(selc){ ctx.beginPath(); ctx.arc(p.x,p.y,sz+5,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1; ctx.stroke();
      ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(${cc[0]},${cc[1]},${cc[2]},0.95)`; ctx.fillText(c.n, p.x+sz+4, p.y+3); }
  }
}
export function drawPulsars(){ LBL.prio=P_SMALL;
  pulsarProj.length=0; if(!S.psr) return;
  for(const q of PULSARS){
    const R=scale(q.d); const x=q._dir[0]*R, y=q._dir[1]*R, z=q._dir[2]*R;
    const p=project(x,y,z);
    if(p.depth<=V.NEAR) continue;
    if(p.x<-20||p.x>W+20||p.y<-20||p.y>H+20) continue;
    const selp=(q===S.hover||q===S.pinned);
    const raw=V.foc*0.02/p.depth;
    if(raw<0.13 && !selp) continue;                // cull only the far tail
    const sz=Math.max(1.0, Math.min(3.4, raw));    // visible floor
    q._x=x; q._y=y; q._z=z; q._sx=p.x; q._sy=p.y;
    if(!(glStars()&&glBufP)){ ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,6.2832);
      ctx.fillStyle='rgba(150,220,255,0.72)'; ctx.fill(); }
    pulsarProj.push(q);
    if(selp){
      ctx.beginPath(); ctx.arc(p.x,p.y,sz+5,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1; ctx.stroke();
      ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(150,220,255,0.95)'; ctx.fillText(q.n, p.x+sz+4, p.y+3);
    }
  }
}

// ---- S2: the star racing around Sagittarius A* (GRAVITY orbit, 16.05-yr period) ----
const S2EL={e:0.884649, i:134.567*Math.PI/180, O:228.171*Math.PI/180, w:66.263*Math.PI/180,
            Pd:16.0455*365.25, Tp:2458257.9};
function s2XY(jd){                                  // Thiele-Innes: orbit -> (east, north) in units of a
  let M=6.28318*(((jd-S2EL.Tp)/S2EL.Pd)%1); const e=S2EL.e;
  let E=M+e*Math.sin(M)*(1+e*Math.cos(M));
  for(let k=0;k<24;k++){ const dE=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E)); E-=dE; if(Math.abs(dE)<1e-9)break; }
  const X=Math.cos(E)-e, Y=Math.sqrt(1-e*e)*Math.sin(E);
  const cO=Math.cos(S2EL.O),sO=Math.sin(S2EL.O),ci=Math.cos(S2EL.i),cw=Math.cos(S2EL.w),sw=Math.sin(S2EL.w);
  const A2=cO*cw-sO*sw*ci, B2=sO*cw+cO*sw*ci, F2=-cO*sw-sO*cw*ci, G2=-sO*sw+cO*cw*ci;
  return [B2*X+G2*Y, A2*X+F2*Y];                    // [east, north]
}
export function drawS2(){ LBL.prio=P_DEEP;
  if(!S.mw||!sgraScreen) return;
  const sgW=[SGRA._x,SGRA._y,SGRA._z];
  const dS=Math.hypot(camPos[0]-sgW[0],camPos[1]-sgW[1],camPos[2]-sgW[2]);
  const a2=(S.pinned===SGRA)?1:lodA(dS,3,7);
  if(a2<0.02) return;
  const d0=SGRA._dir, cd=Math.max(1e-6,Math.hypot(d0[0],d0[1]));
  const east=camDir2([-d0[1]/cd, d0[0]/cd, 0]);
  const north=camDir2([-d0[2]*d0[0]/cd, -d0[2]*d0[1]/cd, cd]);
  const K=Math.min(W,H)*0.11*a2;                    // exploded scale (real orbit ~1000 AU)
  ctx.globalAlpha=a2;
  ctx.beginPath();                                   // the projected true orbit
  for(let k=0;k<=48;k++){
    const eo=s2XY(S2EL.Tp + k/48*S2EL.Pd);
    const qx=sgraScreen.x+(east[0]*eo[0]+north[0]*eo[1])*K;
    const qy=sgraScreen.y+(east[1]*eo[0]+north[1]*eo[1])*K;
    if(k===0) ctx.moveTo(qx,qy); else ctx.lineTo(qx,qy);
  }
  ctx.strokeStyle='rgba(255,220,150,0.4)'; ctx.lineWidth=1; ctx.stroke();
  const p2=s2XY(solarJD());
  const sx=sgraScreen.x+(east[0]*p2[0]+north[0]*p2[1])*K;
  const sy=sgraScreen.y+(east[1]*p2[0]+north[1]*p2[1])*K;
  ctx.beginPath(); ctx.arc(sx,sy,2.6,0,6.2832); ctx.fillStyle='rgba(255,235,180,0.95)'; ctx.fill();
  ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(255,225,160,0.85)';
  ctx.fillText('S2 · 16-yr orbit · pericentre 2018/2034', sx+5, sy+3);
  ctx.globalAlpha=1;
}
// ---- observable-universe boundary (CMB shell, ~46 Gly) ----
export function drawEdge(){ LBL.prio=P_GRID;
  const R=scale(14300e6);
  for(let pl=0;pl<3;pl++){
    pathBegin();
    for(let a=0;a<=6.2833;a+=0.13){
      const ca=Math.cos(a)*R, sa=Math.sin(a)*R;
      const w = pl===0?[ca,sa,0] : pl===1?[ca,0,sa] : [0,ca,sa];
      pathPt(project(w[0],w[1],w[2]));
    }
    pathStroke('rgba(120,150,255,0.11)',1);
  }
  const lp=project(R,0,0);
  if(lp.depth>V.NEAR){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(140,165,255,0.5)';
    ctx.fillText('observable universe · CMB ~46 Gly', lp.x+5, lp.y); }
}
