// The Milky Way: lensing at Sgr A*, the structural model, the plane band, Sgr A* itself.
import { drawBlackHole } from './blackhole.js';
import { ctx } from './canvas.js';
import { pathBegin, pathPt, pathStroke } from './draw.js';
import { LBL, P_DEEP, P_GAL } from './labels.js';
import { camPhysPos } from './nav.js';
import { GPu, GPv, SGRA } from './sky-data.js';
import { S, V } from './state.js';
import { H, W, project, scale } from './view.js';
// ---- gravitational lensing at Sgr A* (GPU point clouds bend around the BH) ----
// Einstein angle θE = √(2·r_s/D) for the camera's TRUE distance D to Sgr A*;
// drawn ×300 exaggerated (the real ring is arcsecond-scale even up close).
// Deflection itself happens in the shared vertex shader (u_lens / u_lensOn).
export const LENS_EXAG=300, SGRA_RS=4.1e-7;             // Schwarzschild radius of Sgr A* in pc
export let lensPar=null;
export function calcLens(){
  lensPar=null; if(!S.lens) return;
  const R=scale(SGRA.d);
  const p=project(SGRA._dir[0]*R,SGRA._dir[1]*R,SGRA._dir[2]*R);
  if(p.depth<=V.NEAR) return;
  const c=camPhysPos();
  const D=Math.max(1e-9,Math.hypot(SGRA._dir[0]*SGRA.d-c[0],
    SGRA._dir[1]*SGRA.d-c[1], SGRA._dir[2]*SGRA.d-c[2]));
  const px=V.foc*Math.sqrt(2*SGRA_RS/D)*LENS_EXAG;
  if(px<0.7) return;                             // too far away — no visible effect
  lensPar={x:p.x,y:p.y,e:Math.min(px,Math.min(W,H)*0.22),depth:p.depth};
}
// ---- Milky Way: galactic plane band + Sgr A* ----
export let sgraScreen=null;
// ---- Milky Way structural model (data-informed schematic: Reid+ 2019 arm geometry) ----
const MW_R0=8178;                              // Sun -> galactic centre (pc)
function mwWorld(r,th){                        // galactocentric polar -> world position
  const u=MW_R0 - r*Math.cos(th), v=r*Math.sin(th);
  const dx=GPu[0]*u+GPv[0]*v, dy=GPu[1]*u+GPv[1]*v, dz=GPu[2]*u+GPv[2]*v;
  const dist=Math.hypot(dx,dy,dz)||1e-6, R=scale(dist)/dist;
  return [dx*R,dy*R,dz*R,dist];
}
const MW_ARMS=[
  {n:'Perseus Arm',           t0:0.35, c:[150,185,255]},
  {n:'Sagittarius Arm',       t0:1.92, c:[165,205,255]},
  {n:'Scutum-Centaurus Arm',  t0:3.49, c:[150,185,255]},
  {n:'Norma / Outer Arm',     t0:5.06, c:[165,200,255]} ];
export function drawGalaxyModel(){ LBL.prio=P_GAL;
  const k=0.235;                               // pitch angle ~13 deg
  { const w=mwWorld(0.0001,0), p=project(w[0],w[1],w[2]);
    if(p.depth>V.NEAR){ const sz=Math.max(6,Math.min(70, V.foc*0.14/p.depth));
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,sz);
      g.addColorStop(0,'rgba(255,232,190,0.32)'); g.addColorStop(.5,'rgba(255,206,150,0.12)'); g.addColorStop(1,'rgba(255,190,120,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,6.2832); ctx.fill(); } }
  ctx.fillStyle='rgba(255,214,160,0.5)';
  for(let t=-1;t<=1;t+=0.06){ const r=Math.abs(t)*3200, th=(t<0?Math.PI:0)+0.44;
    const w=mwWorld(r,th), p=project(w[0],w[1],w[2]);
    if(p.depth<=V.NEAR) continue; const sz=Math.max(0.9,Math.min(3,V.foc*0.02/p.depth));
    ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,6.2832); ctx.fill(); }
  for(const arm of MW_ARMS){
    ctx.fillStyle=`rgba(${arm.c[0]},${arm.c[1]},${arm.c[2]},0.55)`;
    let mid=null;
    for(let th=0.15; th<7.4; th+=0.075){
      const r=2600*Math.exp(k*th); if(r>17000) break;
      const w=mwWorld(r, th+arm.t0), p=project(w[0],w[1],w[2]);
      if(p.depth<=V.NEAR) continue;
      if(p.x<-30||p.x>W+30||p.y<-30||p.y>H+30) continue;
      const sz=Math.max(0.8,Math.min(2.6, V.foc*0.02/p.depth));
      ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,6.2832); ctx.fill();
      if(th>2.4 && th<2.55) mid=p;
    }
    if(mid){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(${arm.c[0]},${arm.c[1]},${arm.c[2]},0.72)`;
      ctx.fillText(arm.n, mid.x+4, mid.y); }
  }
  { const w=mwWorld(MW_R0,0.0), p=project(w[0],w[1],w[2]);
    if(p.depth>V.NEAR){ ctx.fillStyle='rgba(120,230,255,0.95)';
      ctx.beginPath(); ctx.arc(p.x,p.y,2.4,0,6.2832); ctx.fill();
      ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(150,235,255,0.8)';
      ctx.fillText('Sun · Orion Spur', p.x+5, p.y+3); } }
  pathBegin();
  for(let a=0;a<=6.2833;a+=0.1){ const w=mwWorld(16000,a); pathPt(project(w[0],w[1],w[2])); }
  pathStroke('rgba(150,175,235,0.14)',1);
}
export function drawMW(){ LBL.prio=P_DEEP;
  sgraScreen=null; if(!S.mw) return;
  { const R=scale(SGRA.d); SGRA._x=SGRA._dir[0]*R; SGRA._y=SGRA._dir[1]*R; SGRA._z=SGRA._dir[2]*R; }
  // the galactic plane, drawn as great circles in that plane (the "Milky Way band")
  [500,1500,5000].forEach((pc,idx)=>{ const R=scale(pc), mid=idx===1;
    pathBegin();
    for(let t=0;t<=100;t++){ const th=t/100*6.2832, c=Math.cos(th), s=Math.sin(th);
      pathPt(project((GPu[0]*c+GPv[0]*s)*R,(GPu[1]*c+GPv[1]*s)*R,(GPu[2]*c+GPv[2]*s)*R)); }
    pathStroke(`rgba(140,165,235,${mid?0.16:0.08})`, mid?2:1);
  });
  // Sagittarius A* — the galactic centre
  const sp=project(SGRA._x,SGRA._y,SGRA._z);
  if(sp.depth>V.NEAR){
    sgraScreen={x:sp.x,y:sp.y};
    // close enough → the simulated look (shadow, photon ring, folded disk)
    // a 60-pc virtual radius: the ray-traced look appears inside the central kiloparsecs,
    // from the Sun's distance it is the small marker (a 500-pc radius read as a brown planet)
    const rbh=Math.min(Math.min(W,H)*0.28, V.foc*(S.realScale?60:0.08)/sp.depth);
    if(rbh>=10){
      drawBlackHole(sp.x,sp.y,rbh,1,S.eht);
      ctx.font='10px ui-monospace,monospace'; ctx.fillStyle='rgba(255,205,150,0.92)';
      ctx.fillText(S.eht?'Sagittarius A* · hot accretion flow (EHT 2022 geometry)'
                        :'Sagittarius A* · 4.15 million M☉', sp.x+rbh*1.15, sp.y-rbh*1.35);
      return;
    }
    const gr=ctx.createRadialGradient(sp.x,sp.y,0,sp.x,sp.y,11);
    gr.addColorStop(0,'rgba(255,180,90,0.55)'); gr.addColorStop(.5,'rgba(255,120,60,0.22)'); gr.addColorStop(1,'rgba(255,120,60,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(sp.x,sp.y,11,0,6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(sp.x,sp.y,3.4,0,6.2832); ctx.fillStyle='#0a0a12'; ctx.fill();
    ctx.beginPath(); ctx.arc(sp.x,sp.y,3.4,0,6.2832); ctx.strokeStyle='rgba(255,205,130,0.95)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.font='10px ui-monospace,monospace'; ctx.fillStyle='rgba(255,205,150,0.92)';
    ctx.fillText('Sagittarius A * · galactic centre', sp.x+9, sp.y+3);
  }
}
