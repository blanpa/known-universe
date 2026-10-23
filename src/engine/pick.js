// Picking: 2D projections and the GPU point clouds.
import { cluProj, dsoProj, pulsarProj } from './deep.js';
import { SURF } from './earth.js';
import { galProj } from './galaxies.js';
import { beltRaw, gaiaRange, gaiaRaw, glOK, qsoRaw, webRaw } from './gl.js';
import { hygProj } from './hyg.js';
import { sgraScreen } from './mw.js';
import { lastSun, order } from './render.js';
import { SGRA } from './sky-data.js';
import { SUNHIT } from './solar-data.js';
import { solarProj } from './solar.js';
import { S, V } from './state.js';
import { sysProj } from './system.js';
import { userProj } from './userdata.js';
import { project, scale } from './view.js';
// ---- picking ----
export function pick(mx,my){
  if(SURF.on) return null;                 // surface map: nothing to pick
  if(V.ROUTE&&V.ROUTE._sx!==undefined){        // interstellar route craft (outside the solar LOD)
    const dx=V.ROUTE._sx-mx, dy=V.ROUTE._sy-my;
    if(dx*dx+dy*dy<14*14) return V.ROUTE._o;
  }
  if(V.sysA>0.5){                            // planets of a focused exoplanet system
    let best=null,bd=1e9;
    for(const it of sysProj){ const dx=it.x-mx,dy=it.y-my,d=dx*dx+dy*dy;
      const rr=Math.max(12,it.px+8); if(d<rr*rr && d<bd){bd=d;best=it.o;} }
    if(best) return best;
  }
  if(V.solarA>0.5){                          // zoomed into the solar system
    let best=null,bd=1e9;
    for(const it of solarProj){ const dx=it.x-mx,dy=it.y-my,d=dx*dx+dy*dy;
      const rr=Math.max(13,it.px+8); if(d<rr*rr && d<bd){bd=d;best=it.o;} }
    if(best) return best;
  }
  let best=null,bd=18*18;
  if(S.user) for(const o of userProj){        // imported rows first: they are what you are checking
    const dx=o._sx-mx,dy=o._sy-my,d=dx*dx+dy*dy;
    if(d<12*12 && d<bd){bd=d;best=o;}
  }
  for(const s of order){
    const dx=s._sx-mx,dy=s._sy-my,d=dx*dx+dy*dy;
    if(d<bd){bd=d;best=s;}
  }
  if(S.galaxies) for(const g of galProj){
    const dx=g._sx-mx,dy=g._sy-my,d=dx*dx+dy*dy;
    if(d<bd){bd=d;best=g;}
  }
  if(S.dso) for(const o of dsoProj){
    const dx=o._sx-mx,dy=o._sy-my,d=dx*dx+dy*dy;
    if(d<17*17 && d<bd){bd=d;best=o;}
  }
  if(S.psr) for(const o of pulsarProj){
    const dx=o._sx-mx,dy=o._sy-my,d=dx*dx+dy*dy;
    if(d<13*13 && d<bd){bd=d;best=o;}
  }
  if(S.oclu) for(const o of cluProj){
    const dx=o._sx-mx,dy=o._sy-my,d=dx*dx+dy*dy;
    if(d<13*13 && d<bd){bd=d;best=o;}
  }
  if(S.hyg){ let hb=13*13;                 // tighter radius for dense field
    for(const g of hygProj){
      const dx=g._sx-mx,dy=g._sy-my,d=dx*dx+dy*dy;
      if(d<hb && d<bd){bd=d;best=g;}
    }
  }
  if(S.mw && sgraScreen){                  // Sagittarius A*
    const dx=sgraScreen.x-mx,dy=sgraScreen.y-my,d=dx*dx+dy*dy;
    if(d<15*15 && d<bd){ bd=d; best=SGRA; }
  }
  if(V.solarA<0.3 && lastSun.depth>V.NEAR){    // Sun = fly-in target (when zoomed out)
    const dx=lastSun.x-mx,dy=lastSun.y-my;
    if(dx*dx+dy*dy<16*16) return SUNHIT;
  }
  return best;
}
// CPU picking of the anonymous GPU point clouds (click only — too heavy for hover)
export function gpuPick(mx,my){
  if(SURF.on||!glOK||!S.gpu) return null;
  const layers=[];
  if(gaiaRaw&&S.gaia) layers.push(['gaia',gaiaRaw]);
  if(V.solarA<0.5){ if(webRaw&&S.web) layers.push(['web',webRaw]); if(qsoRaw&&S.qso) layers.push(['qso',qsoRaw]); }
  if(V.solarA>0.05&&beltRaw&&S.belt) layers.push(['belt',beltRaw]);
  const D2R=Math.PI/180; let best=null,bd=9*9;
  for(const [type,bytes] of layers){
    const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength), n=(bytes.length/8)|0;
    for(let i=0;i<n;i++){ const b=i*8;
      const u=dv.getUint16(b+4,true)/65535;
      const dist = type==='gaia'?u*gaiaRange : type==='web'?u*600e6 : type==='qso'?u*13000e6 : u*120*4.84814e-6;
      const rr=dv.getUint16(b,true)*(360/65535)*D2R, dr=(dv.getUint16(b+2,true)*(180/65535)-90)*D2R;
      const cd=Math.cos(dr), R=scale(dist);
      const p=project(cd*Math.cos(rr)*R, cd*Math.sin(rr)*R, Math.sin(dr)*R);
      if(p.depth<=V.NEAR) continue;
      const dx=p.x-mx,dy=p.y-my,d2=dx*dx+dy*dy;
      if(d2<bd){ bd=d2; best={type,b,rr,dr,dist,bytes}; }
    }
  }
  if(!best) return null;
  const dv=new DataView(best.bytes.buffer,best.bytes.byteOffset,best.bytes.byteLength);
  const b6=dv.getUint8(best.b+6), b7=dv.getUint8(best.b+7), cd=Math.cos(best.dr);
  const o={gpick:best.type, _dir:[cd*Math.cos(best.rr),cd*Math.sin(best.rr),Math.sin(best.dr)], d:best.dist};
  if(best.type==='gaia'){ o.n='Gaia DR3 star'; o.mag=b6/255*28-2; o.bprp=b7/255*6-1; }
  else if(best.type==='web'){ o.n='2MRS galaxy'; o.kmag=b6/255*16; }
  else if(best.type==='qso'){ o.n='Quasar'; o.z=b6/20; }
  else { o.n=['Main-belt asteroid','Jupiter trojan','Near-Earth object','Trans-Neptunian object'][b7]||'Asteroid'; o.H=b6/10; o.rAU=best.dist/4.84814e-6; }
  return o;
}
