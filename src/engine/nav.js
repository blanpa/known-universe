// Navigation geometry: object positions, camera-space coordinates, distances.
import { objWorld } from './actions.js';
import { fmt } from './hud.js';
import { eclToWorld } from './solar-data.js';
import { S, V } from './state.js';
import { AU_PC, camPos, ctr, invScale } from './view.js';
// ---- navigation ----
export function navWorld(o){ const w=objWorld(o); if(w) return w;
  if(o._e) return eclToWorld(o._e[0],o._e[1],o._e[2]); return null; }
export function navPhys(o){                        // physical position in parsec
  if(o.sgra||o.dso||o.psr||o.oclu||o.gpick) return [o._dir[0]*o.d,o._dir[1]*o.d,o._dir[2]*o.d];
  if(o.mpc!==undefined){ const d=o.mpc*1e6; return [o.dx*d,o.dy*d,o.dz*d]; }
  if(o.p&&o._dx!==undefined){ const d=o._r; return [o._dx*d,o._dy*d,o._dz*d]; }
  if(o.m!==undefined&&o.dx!==undefined){ const d=o.d; return [o.dx*d,o.dy*d,o.dz*d]; }
  if(o._e) return [o._e[0]*AU_PC,o._e[1]*AU_PC,o._e[2]*AU_PC]; return null; }
export function camXY(px,py,pz){                    // camera-space coords (valid even behind)
  px-=ctr.x;py-=ctr.y;pz-=ctr.z;
  const c=Math.cos(S.yaw),s=Math.sin(S.yaw), x1=px*c+pz*s, z1=-px*s+pz*c, y1=py;
  const cp=Math.cos(S.pitch),sp=Math.sin(S.pitch), y2=y1*cp-z1*sp, z2=y1*sp+z1*cp;
  return {x1,y2,z2,depth:S.camZ-z2}; }
export function camPhysPos(){ const cd=Math.hypot(camPos[0],camPos[1],camPos[2]);
  if(cd<1e-15) return [0,0,0]; const p=invScale(cd)/cd; return [camPos[0]*p,camPos[1]*p,camPos[2]*p]; }
export function navDistPc(){ if(!V.navTarget) return 0; const t=navPhys(V.navTarget); if(!t) return 0;
  const c=camPhysPos(); return Math.hypot(t[0]-c[0],t[1]-c[1],t[2]-c[2]); }
export function fmtLight(pc){ const ly=pc*3.261564;
  if(ly<1){ const min=ly*365.25*24*60;
    if(min<90) return Math.max(1,Math.round(min))+' light-minutes';
    if(min<2880) return (min/60).toFixed(1)+' light-hours';
    return fmt(min/1440)+' light-days'; }
  if(ly<1e3) return fmt(ly)+' years';
  if(ly<1e6) return (ly/1e3).toFixed(1)+' thousand years';
  return (ly/1e6).toFixed(2)+' million years'; }
