// Reference geometry: distance rings, coordinate grids, radio bubble, Local Bubble, veil.
import { ctx } from './canvas.js';
import { BND, PC2LY } from './data.js';
import { PATH, offscr, pathBegin, pathPt, pathStroke } from './draw.js';
import { LY_PC } from './galaxies.js';
import { fmt } from './hud.js';
import { LBL, P_GRID } from './labels.js';
import { GC, GPu, GPv, NGP, dirOf } from './sky-data.js';
import { D2R, solarJD } from './solar-data.js';
import { V } from './state.js';
import { AU_PC, compress, project, scale } from './view.js';
const RINGS=[
  {pc:1*AU_PC,l:'1 AU'}, {pc:30*AU_PC,l:'30 AU'},
  {pc:1*LY_PC,l:'1 ly'}, {pc:100*LY_PC,l:'100 ly'},
  {pc:1e4*LY_PC,l:'10,000 ly'}, {pc:1e6*LY_PC,l:'1 Mly'}, {pc:1e7*LY_PC,l:'10 Mly'},
];
export function drawRings(){ LBL.prio=P_GRID;
  ctx.save();
  for(const R of RINGS){
    const dr=scale(R.pc);
    pathBegin();
    for(let a=0;a<=72;a++){
      const th=a/72*6.2832;
      pathPt(project(Math.cos(th)*dr,0,Math.sin(th)*dr));
    }
    const drew=PATH.n>1;
    pathStroke('rgba(120,140,190,.11)',1);
    const lp=project(dr,0,0);
    if(lp.depth>V.NEAR&&drew){
      ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(120,140,190,.42)';
      ctx.fillText(R.l, lp.x+4, lp.y-3);
    }
  }
  ctx.restore();
}

// ---- coordinate grids on a sun-centred sky sphere ----
export function drawSkyGrid(){ LBL.prio=P_GRID;                          // equatorial RA/Dec
  const R=scale(BND*3);
  ctx.save();
  for(const dec of [-60,-30,0,30,60]){
    pathBegin();
    for(let k=0;k<=96;k++){ const d=dirOf(k/96*360,dec); pathPt(project(d[0]*R,d[1]*R,d[2]*R)); }
    pathStroke(dec===0?'rgba(150,175,215,.34)':'rgba(130,150,190,.15)', dec===0?1.2:1, [1,4]);
  }
  for(let h=0;h<12;h++){
    pathBegin();
    for(let k=0;k<=48;k++){ const d=dirOf(h*30,-90+k/48*180); pathPt(project(d[0]*R,d[1]*R,d[2]*R)); }
    pathStroke('rgba(130,150,190,.13)',1,[1,4]);
  }
  ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(150,175,215,.6)';
  for(let h=0;h<24;h+=6){ const d=dirOf(h*15,2), p=project(d[0]*R,d[1]*R,d[2]*R);
    if(p.depth>V.NEAR&&!offscr(p)) ctx.fillText(h+'h', p.x+3, p.y-4); }
  const np=dirOf(0,90), pp=project(np[0]*R,np[1]*R,np[2]*R);
  if(pp.depth>V.NEAR&&!offscr(pp)) ctx.fillText('celestial N pole', pp.x+4, pp.y);
  ctx.restore();
}
export function drawGalGrid(){ LBL.prio=P_GRID;                          // galactic l/b
  const R=scale(BND*3.2);
  const gx=GC, gz=NGP,
        gy=[gz[1]*gx[2]-gz[2]*gx[1], gz[2]*gx[0]-gz[0]*gx[2], gz[0]*gx[1]-gz[1]*gx[0]];
  const dir=(l,b)=>{ const cl=Math.cos(l),sl=Math.sin(l),cb=Math.cos(b),sb=Math.sin(b);
    return [gx[0]*cb*cl+gy[0]*cb*sl+gz[0]*sb, gx[1]*cb*cl+gy[1]*cb*sl+gz[1]*sb,
            gx[2]*cb*cl+gy[2]*cb*sl+gz[2]*sb]; };
  ctx.save();
  for(const b of [-60,-30,0,30,60]){
    pathBegin();
    for(let k=0;k<=96;k++){ const d=dir(k/96*6.2832,b*D2R); pathPt(project(d[0]*R,d[1]*R,d[2]*R)); }
    pathStroke(b===0?'rgba(235,200,150,.32)':'rgba(215,180,135,.14)', b===0?1.2:1, [1,4]);
  }
  for(let i=0;i<12;i++){
    pathBegin();
    for(let k=0;k<=48;k++){ const d=dir(i/12*6.2832,(-90+k/48*180)*D2R); pathPt(project(d[0]*R,d[1]*R,d[2]*R)); }
    pathStroke('rgba(215,180,135,.12)',1,[1,4]);
  }
  ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(235,200,150,.6)';
  for(const l of [0,90,180,270]){ const d=dir(l*D2R,0.03), p=project(d[0]*R,d[1]*R,d[2]*R);
    if(p.depth>V.NEAR&&!offscr(p)) ctx.fillText('l='+l+'°', p.x+3, p.y-4); }
  const np=dir(0,Math.PI/2), pp=project(np[0]*R,np[1]*R,np[2]*R);
  if(pp.depth>V.NEAR&&!offscr(pp)) ctx.fillText('galactic N pole', pp.x+4, pp.y);
  ctx.restore();
}
// the human radio bubble: how far our first broadcasts have travelled (since ~1901),
// time-slider aware — scrub the future and watch it grow
export function drawRadioSphere(){ LBL.prio=P_GRID;
  const yr=2000+(solarJD()-2451545)/365.25, lyr=yr-1901;
  if(lyr<1) return;
  const R=scale(lyr*0.306601);
  ctx.save();
  for(const [ax,ay] of [[0,1],[0,2],[1,2]]){
    pathBegin();
    for(let a=0;a<=72;a++){ const th=a/72*6.2832, v=[0,0,0];
      v[ax]=Math.cos(th)*R; v[ay]=Math.sin(th)*R;
      pathPt(project(v[0],v[1],v[2]));
    }
    pathStroke('rgba(120,225,235,.22)',1,[2,5]);
  }
  const lp=project(R*0.71,R*0.71,0);
  if(lp.depth>V.NEAR&&!offscr(lp)){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(130,225,235,.6)';
    ctx.fillText('our radio signals · '+Math.round(lyr)+' ly out', lp.x+4, lp.y-3); }
  ctx.restore();
}
// the Local Bubble: the supernova-blown cavity we live in (≈Zucker+ 2022 extents,
// drawn as a schematic ellipsoid in galactic coordinates)
export function drawBubble(){ LBL.prio=P_GRID;
  ctx.save();
  for(const [e1,e2,a,b] of [[GPu,GPv,95,95],[GPu,NGP,95,150],[GPv,NGP,95,150]]){
    pathBegin();
    for(let k=0;k<=72;k++){ const th=k/72*6.2832, ca=Math.cos(th)*a, sb=Math.sin(th)*b;
      const v=[e1[0]*ca+e2[0]*sb, e1[1]*ca+e2[1]*sb, e1[2]*ca+e2[2]*sb];
      const len=Math.hypot(v[0],v[1],v[2])||1, R=scale(len);
      pathPt(project(v[0]/len*R, v[1]/len*R, v[2]/len*R));
    }
    pathStroke('rgba(150,190,255,.17)',1,[3,6]);
  }
  const lt=scale(150), lp=project(NGP[0]*lt,NGP[1]*lt,NGP[2]*lt);
  if(lp.depth>V.NEAR&&!offscr(lp)){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(160,195,255,.55)';
    ctx.fillText('Local Bubble · blown clear by ~15 supernovae', lp.x+4, lp.y-3); }
  ctx.restore();
}
// red veil boundary: three great circles forming a sphere at the neighbourhood edge
export function drawVeilSphere(){ LBL.prio=P_GRID;
  const dr=compress(BND);
  const planes=[[0,1],[0,2],[1,2]]; // xy, xz, yz
  ctx.save();
  for(const [ax,ay] of planes){
    pathBegin();
    for(let a=0;a<=72;a++){
      const th=a/72*6.2832, co=Math.cos(th)*dr, si=Math.sin(th)*dr;
      const v=[0,0,0]; v[ax]=co; v[ay]=si;
      pathPt(project(v[0],v[1],v[2]));
    }
    pathStroke('rgba(230,71,60,.20)',1);
  }
  const lp=project(0,dr,0);
  if(lp.depth>V.NEAR){
    ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(230,71,60,.55)';
    ctx.fillText('charted neighbourhood · '+fmt(BND*PC2LY)+' ly', lp.x+5, lp.y);
  }
  ctx.restore();
}
