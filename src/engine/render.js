// The frame: render() composes every layer in painter order.
import { ctx } from './canvas.js';
import { BND, STARS, planetsBy, radiusScale } from './data.js';
import { drawClusters, drawDSO, drawEdge, drawPulsars, drawS2 } from './deep.js';
import { P, PROF } from './draw.js';
import { drawSurface, surfUpdate } from './earth.js';
import { drawGalaxies, galProj, projectGalaxies } from './galaxies.js';
import { glBufH, glClearCanvas, glRender, glStars } from './gl.js';
import { drawBubble, drawGalGrid, drawRadioSphere, drawRings, drawSkyGrid, drawVeilSphere } from './grids.js';
import { drawNav, drawScaleBar, updateHUD } from './hud.js';
import { drawHyg, drawHygLabels, projectHyg } from './hyg.js';
import { LBL, P_SOLAR, P_STAR, lblFlush, lblReset } from './labels.js';
import { drawMeasure, measureMode } from './measure.js';
import { hostPos, tNow } from './motion.js';
import { LENS_EXAG, calcLens, drawGalaxyModel, drawMW, lensPar } from './mw.js';
import { drawConstellations, drawShowers } from './sky.js';
import { FAC } from './solar-data.js';
import { drawSolar } from './solar.js';
import { S, V } from './state.js';
import { clearTransits, drawSystem, sysProj } from './system.js';
import { drawRoute } from './transfer.js';
import { H, W, _pj, camBasis, camDist, camPos, compress, lodA, project, projectInto } from './view.js';
export let visSys=0,visPl=0,nearD=Infinity,farD=0;
export const order=[];
export function render(){
  V.cx=W/2; V.cy=H/2; V.foc=Math.min(W,H)*0.62;
  V.gwOnScreen=false;
  ctx.clearRect(0,0,W,H);                        // no vignette — space is black
  lblReset();

  if(surfUpdate()){ drawSurface(); lblFlush(); updateHUD(); return; }   // descended to the Earth's surface

  camBasis();
  V.NEAR = S.realScale ? Math.max(1e-13, S.camZ*0.02) : Math.min(0.05, Math.max(0.001, S.camZ*0.35));
  // solar-system detail from the camera's real distance to the Sun (so it also
  // fades as you fly away from the centre, not only when you zoom out)
  V.solarA=lodA(camDist, 0.001, 0.1);              // full ≤0.001 pc, hidden ≥0.1 pc from Sun
  // exoplanet-system detail: from the camera's distance to the focused host star
  V.sysA=0;
  if(V.focusSys && V.focusSysW){
    const sd=Math.hypot(camPos[0]-V.focusSysW[0],camPos[1]-V.focusSysW[1],camPos[2]-V.focusSysW[2]);
    V.sysA=lodA(sd, 8e-6, 8e-4);
  }
  calcLens();                                    // Sgr A* lensing (needs camBasis + V.foc)

  if(S.rings) P('rings',drawRings);
  if(S.veil) P('veil',drawVeilSphere);
  if(S.radio) P('radio',drawRadioSphere);
  if(S.bubble) P('bubble',drawBubble);
  if(S.grid) P('grid',drawSkyGrid);
  if(S.ggrid) P('ggrid',drawGalGrid);

  // galaxies: project, split behind/in-front of the local cloud for painter order
  P('gal:project',projectGalaxies);
  const backG=[], frontG=[];
  for(const g of galProj){ (g._z2<0?backG:frontG).push(g); }
  P('gal:back',()=>drawGalaxies(backG));

  // gather visible
  order.length=0; visSys=0; visPl=0; nearD=Infinity; farD=0;
  const tMove=tNow();
  for(let i=0;i<STARS.length;i++){
    const s=STARS[i];
    if(s.fy>S.year && s.fy!==0) continue;
    if(S.facHidden.has(s.fac)) continue;
    let ddx=s._dx, ddy=s._dy, ddz=s._dz, dNow=s._r;
    if(tMove){ const q=hostPos(s,tMove); dNow=Math.hypot(q[0],q[1],q[2])||1e-9; ddx=q[0]/dNow; ddy=q[1]/dNow; ddz=q[2]/dNow; }
    const dr=compress(dNow);
    const p=projectInto(ddx*dr,ddy*dr,ddz*dr,_pj);
    if(p.depth<=V.NEAR) continue;
    if(p.x<-90||p.x>W+90||p.y<-90||p.y>H+90) continue;   // off-screen cull
    s._sx=p.x; s._sy=p.y; s._depth=p.depth; s._z2=p.z2;
    order.push(s);
    visSys++;
    visPl += planetsBy(s, S.year);
    if(s._r<nearD) nearD=s._r;
    if(s._r>farD) farD=s._r;
  }
  P('stars:sort',()=>order.sort((a,b)=>a._z2-b._z2));   // far first (painter)

  // background starfield (HYG) behind the exoplanet hosts
  P('hyg:project',projectHyg); if(glStars()){ P('gl:render',glRender); if(S.skyMode) P('hyg:labels',drawHygLabels); } else { glClearCanvas(); P('hyg:draw',drawHyg); }

  // draw sun at origin
  const sp=project(0,0,0);
  const gpuH=glStars()&&glBufH;   // GPU draws the host points; 2D keeps picking/rings
  for(const s of order){
    const size=Math.max(0.7, V.foc*0.0075/s._depth * radiusScale(s._sr));
    const fade=Math.max(0.12, Math.min(1, 1.9 - s._depth*0.55));
    const isNew=(s.fy===S.year && s.fy!==0);
    const isSel=(s===S.hover||s===S.pinned||s===S.focusStar);
    let col=S.facColor?((FAC[s.fac]||FAC.other).c):s._col, a=fade;
    // red veil: everything beyond the charted neighbourhood reddens & dims
    let veil=0;
    if(S.veil && s._r>BND){
      veil=Math.min(1,(s._r-BND)/(BND*1.6));
      col=[ col[0]+(232-col[0])*veil*0.85,
            col[1]+(58 -col[1])*veil*0.85,
            col[2]+(50 -col[2])*veil*0.85 ];
      a*=(1-veil*0.4);
    }
    if(isNew){col=[79,214,200]; a=1; veil=0;}
    const cr=col[0]|0,cg=col[1]|0,cb=col[2]|0;
    if(!gpuH){
      ctx.beginPath();
      ctx.arc(s._sx,s._sy, isSel?size+1.6:size, 0, 6.2832);
      ctx.fillStyle=`rgba(${cr},${cg},${cb},${a})`;
      ctx.fill();
      if(size>1.6||isNew||isSel||veil>0.35){ // glow for bright/near/veiled
        ctx.beginPath();
        ctx.arc(s._sx,s._sy,(isSel?size+1.6:size)*(veil>0.35?3.0:2.4),0,6.2832);
        ctx.fillStyle=`rgba(${cr},${cg},${cb},${a*(veil>0.35?0.16:0.10)})`;
        ctx.fill();
      }
    }
    if(isSel){
      ctx.beginPath(); ctx.arc(s._sx,s._sy,size+7,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke();
    }
  }
  // Sun marker (the origin / "you are here") — hands off to the real Sun on zoom-in
  const sm=1-V.solarA;
  if(sm>0.02){
    ctx.globalAlpha=sm;
    ctx.beginPath(); ctx.arc(sp.x,sp.y,4.2,0,6.2832); ctx.fillStyle='#eafffb'; ctx.fill();
    ctx.beginPath(); ctx.arc(sp.x,sp.y,9,0,6.2832);
    ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.arc(sp.x,sp.y,15,0,6.2832);
    ctx.fillStyle='rgba(255,255,255,.05)'; ctx.fill();
    ctx.globalAlpha=1;
  }

  // galaxies in front of the local cloud, on top
  drawGalaxies(frontG);
  if(V.solarA<0.5 && V.sysA<0.5){ drawConstellations(); if(S.met) drawShowers(); drawDSO(); drawPulsars(); drawClusters(); if(S.mw3d) drawGalaxyModel(); drawMW(); drawS2(); if(S.edge) drawEdge(); }
  if(lensPar && lensPar.e>12){                   // Einstein ring marker around Sgr A*
    ctx.beginPath(); ctx.arc(lensPar.x,lensPar.y,lensPar.e,0,6.2832);
    ctx.setLineDash([2,6]); ctx.strokeStyle='rgba(255,215,150,0.35)'; ctx.lineWidth=1;
    ctx.stroke(); ctx.setLineDash([]);
    ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(255,215,150,0.6)';
    ctx.fillText('Einstein ring · lensing exaggerated ×'+LENS_EXAG,
      lensPar.x+lensPar.e*0.72, lensPar.y-lensPar.e*0.72);
  }
  if(S.galaxies && sp.depth>V.NEAR && V.solarA<0.5){
    ctx.globalAlpha=1-V.solarA*2;
    ctx.font='10px ui-monospace,monospace'; ctx.fillStyle='rgba(233,237,250,.55)';
    LBL.prio=P_SOLAR;                            // the centre's own label is never crowded out
    ctx.fillText('Milky Way · all exoplanets', sp.x+14, sp.y-10);
    if(V.solarA<0.15){ ctx.fillStyle='rgba(255,238,178,.7)'; ctx.font='9px ui-monospace,monospace';
      ctx.fillText('click → into the solar system', sp.x+14, sp.y+4); }
    LBL.prio=P_STAR;
    ctx.globalAlpha=1;
  }
  lastSun.x=sp.x; lastSun.y=sp.y; lastSun.depth=sp.depth;

  // our solar system — detail fades in as we zoom toward the Sun
  if(V.solarA>0.01) P('solar',()=>drawSolar(V.solarA));
  // a fellow exoplanet system — its planets on their orbits, when we fly to it
  if(V.sysA>0.01) P('system',()=>drawSystem(V.sysA)); else { sysProj.length=0; clearTransits(); }

  if(measureMode) drawMeasure();
  if(V.ROUTE) drawRoute();                   // interstellar 1g route (Earth → star/galaxy)
  P('nav',drawNav);                        // course reticle / off-screen arrow
  drawScaleBar();                          // where we are on the distance ladder
  P('labels:flush',lblFlush);              // all queued labels, decluttered, on top
  P('hud',updateHUD);
  PROF.frames++;
}
export const lastSun={x:0,y:0,depth:0};
