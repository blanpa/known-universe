// Camera, the unified distance scale, and projection.
import { ctx, cv } from './canvas.js';
import { syncToggle } from './controls.js';
import { glResize } from './gl.js';
import { S, V } from './state.js';
export let W=0, H=0, DPR=1;
export function camDir2(v){                               // world direction -> screen direction
  camTrig();
  const x1=v[0]*_cyw+v[2]*_syw, z1=-v[0]*_syw+v[2]*_cyw, y2=v[1]*_cp2 - z1*_sp2;
  return [x1*_cr-y2*_sr, -(x1*_sr+y2*_cr)];
}
// allocation-free variant for the per-galaxy position-angle maths
export let _d2x=0,_d2y=0;
export function camDir2i(vx,vy,vz){
  const x1=vx*_cyw+vz*_syw, z1=-vx*_syw+vz*_cyw, y2=vy*_cp2 - z1*_sp2;
  _d2x=x1*_cr-y2*_sr; _d2y=-(x1*_sr+y2*_cr);
}
// ---- ONE unified logarithmic distance scale, anchored at the solar system ----
// world radius = (log10(distance in parsec) - LOG0) * KDEC ; direction = real sky vector.
// Everything — planets, moons, stars, exoplanets, galaxies — lives in this space,
// so you fly continuously from the solar system (AU) out to galaxies (Mpc).
export const AU_PC=4.84814e-6, LOG0=-6.0, KDEC=1.0;   // more radial room between shells
function rlog(pc){ return Math.max(0,(Math.log10(pc)-LOG0)*KDEC); }
// scale(pc) → world radius. Two modes: logarithmic (overview) or real (proportional).
export const REALK=1;                                     // real mode: 1 parsec = 1 world unit
export function scale(pc){ return S.realScale ? pc*REALK : rlog(pc); }
export function invScale(u){ return S.realScale ? u/REALK : Math.pow(10, u/KDEC + LOG0); }
// level-of-detail opacity from a camera distance, using physical fade thresholds (pc)
export function lodA(camd, fullPc, hidePc){ const f=scale(fullPc), h=scale(hidePc);
  return Math.max(0, Math.min(1, (h-camd)/((h-f)||1e-12))); }
export function camSolar(){ return scale(3e-4); }          // frame the solar system (~60 AU: Neptune's orbit)
export function camCosmos(){ return scale(3e7); }          // frame out to the farthest galaxy

// free movement: a movable view centre + camera basis vectors (computed each frame)
export const ctr={x:0,y:0,z:0}, tgtCtr={x:0,y:0,z:0};
export let camRight=[1,0,0], camUp=[0,1,0], camFwd=[0,0,1], camDist=0, camPos=[0,0,0];
export const keys=new Set();
let _cyw=1,_syw=0,_cp2=1,_sp2=0,_cr=1,_sr=0, _trigY=NaN, _trigP=NaN, _trigS=null;   // camera trig, cached per frame
// sky view: roll the screen so celestial north (world +z) points up; the map never rolls
function rollOf(c,s,sp){ return S.skyMode ? Math.atan2(s, -c*sp) : 0; }
// project() also runs from event handlers (picking, fly-to), where the camera may have
// moved since the last camBasis() — so the cache validates itself instead of trusting
// the render loop to have refreshed it.
function camTrig(){
  if(_trigY===S.yaw && _trigP===S.pitch && _trigS===S.skyMode) return;
  _trigS=S.skyMode;
  _trigY=S.yaw; _trigP=S.pitch;
  _cyw=Math.cos(S.yaw); _syw=Math.sin(S.yaw);
  _cp2=Math.cos(S.pitch); _sp2=Math.sin(S.pitch);
  V.roll=rollOf(_cyw,_syw,_sp2); _cr=Math.cos(V.roll); _sr=Math.sin(V.roll);
}
export function camBasis(){
  const c=Math.cos(S.yaw),s=Math.sin(S.yaw),cp=Math.cos(S.pitch),sp=Math.sin(S.pitch);
  _cyw=c; _syw=s; _cp2=cp; _sp2=sp; _trigY=S.yaw; _trigP=S.pitch; _trigS=S.skyMode;
  V.roll=rollOf(c,s,sp); _cr=Math.cos(V.roll); _sr=Math.sin(V.roll);
  // the screen axes in world coordinates: the ROWS of the view rotation that
  // projectInto applies (yaw about world y, then pitch about the screen x axis),
  // rolled when the sky view keeps north up. camFwd is where the camera looks.
  const rx=c, ry=0, rz=s, ux=s*sp, uy=cp, uz=-c*sp;
  camRight=[_cr*rx-_sr*ux, _cr*ry-_sr*uy, _cr*rz-_sr*uz];
  camUp   =[_sr*rx+_cr*ux, _sr*ry+_cr*uy, _sr*rz+_cr*uz];
  camFwd  =[s*cp, -sp, -c*cp];
  camPos=[ctr.x-camFwd[0]*S.camZ, ctr.y-camFwd[1]*S.camZ, ctr.z-camFwd[2]*S.camZ];
  camDist=Math.hypot(camPos[0],camPos[1],camPos[2]);   // distance to the Sun (origin)
}
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce) S.autorot=false, syncToggle('t-rot',false);

export let exactPx=null;                    // viewport size in device pixels (ResizeObserver)
function resize(){
  const raw=devicePixelRatio||1;
  W=innerWidth; H=innerHeight;
  // 2D overlay (text/lines) renders up to 3x for crisp text; GL point clouds cap at 2x
  const px2=(exactPx&&raw<=3.02)?exactPx:null;
  cv.width=px2?px2[0]:Math.round(W*Math.min(raw,3));
  cv.height=px2?px2[1]:Math.round(H*Math.min(raw,3));
  cv.style.width=W+'px'; cv.style.height=H+'px';
  DPR=cv.width/W;
  ctx.setTransform(DPR,0,0,cv.height/H,0,0);
  glResize();
  V.dirty=true;
}
addEventListener('resize',resize);
if(window.ResizeObserver){ try{      // pixel-exact backing store (no resampling blur)
  const ro=new ResizeObserver(es=>{ const e=es[es.length-1], s=e.devicePixelContentBoxSize;
    if(s&&s[0]) exactPx=[s[0].inlineSize,s[0].blockSize]; resize(); });
  ro.observe(cv,{box:'device-pixel-content-box'});
}catch(_){}}
resize();

export function compress(r){ return scale(r); }   // all layers share the one scale (log or real)

export function project(px,py,pz){ return projectInto(px,py,pz,{}); }
// Same maths, writing into a caller-owned object. The hot loops (11.6 k HYG stars,
// 4.7 k hosts, 869 galaxies) ran project() per point and threw away ~17 000 short-lived
// objects every frame; they now pass one scratch object and copy the fields out.
export const _pj = {x:0,y:0,depth:0,z2:0};
export function projectInto(px,py,pz,o){
  camTrig();
  px-=ctr.x; py-=ctr.y; pz-=ctr.z;         // orbit/look around the movable centre
  const x1=px*_cyw+pz*_syw, z1=-px*_syw+pz*_cyw, y1=py;
  const y2=y1*_cp2 - z1*_sp2, z2=y1*_sp2 + z1*_cp2;
  const depth=S.camZ - z2;                 // >0 in front
  const f=V.foc*V.fovK, x3=x1*_cr-y2*_sr, y3=x1*_sr+y2*_cr;
  o.x=V.cx+f*x3/depth; o.y=V.cy-f*y3/depth; o.depth=depth; o.z2=z2;
  return o;
}

// yaw/pitch that point the view (from the Sun outward) along a world direction
export function lookAlong(d){ const l=Math.hypot(d[0],d[1],d[2])||1, x=d[0]/l,y=d[1]/l,z=d[2]/l;
  return { yaw:Math.atan2(x,-z), pitch:Math.asin(Math.max(-1,Math.min(1,-y))) }; }

// screen → sky direction (the inverse of projectInto for a point at infinity)
export function screenDir(mx,my){
  camBasis(); const f=V.foc*V.fovK, a=(mx-V.cx)/f, b=(V.cy-my)/f;
  const d=[camFwd[0]+camRight[0]*a+camUp[0]*b, camFwd[1]+camRight[1]*a+camUp[1]*b, camFwd[2]+camRight[2]*a+camUp[2]*b];
  const l=Math.hypot(d[0],d[1],d[2])||1; return [d[0]/l,d[1]/l,d[2]/l];
}
