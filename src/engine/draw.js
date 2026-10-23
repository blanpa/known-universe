// Shared drawing helpers: sprites, viewport-clipped polylines, the per-layer profiler.
import { api } from '../lib/api.js';
import { ctx } from './canvas.js';
import { V } from './state.js';
import { H, W } from './view.js';
// pre-rendered soft-blob sprites — replaces per-frame createRadialGradient calls
const _sprites={};
export function blobSprite(r,g,b,a0,a1){
  const k=r+','+g+','+b+','+a0+','+a1; let sp=_sprites[k];
  if(!sp){ sp=document.createElement('canvas'); sp.width=sp.height=64;
    const c2=sp.getContext('2d'); const gr=c2.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,`rgba(${r},${g},${b},${a0})`); gr.addColorStop(.5,`rgba(${r},${g},${b},${a1})`);
    gr.addColorStop(1,`rgba(${r},${g},${b},0)`);
    c2.fillStyle=gr; c2.fillRect(0,0,64,64); _sprites[k]=sp; }
  return sp;
}
// A radial gradient evaluated per pixel over a viewport-sized disc is the single most
// expensive thing this renderer did (measured: the heliosphere haze alone halved the
// frame rate on an Intel iGPU). These glows are drawn once into a sprite and blitted.
const _halos={};
export function haloSprite(key,stops,size){
  let sp=_halos[key]; if(sp) return sp;
  sp=document.createElement('canvas'); sp.width=sp.height=size||256;
  const h=sp.width/2, c2=sp.getContext('2d'), gr=c2.createRadialGradient(h,h,0,h,h,h);
  for(const [t,col] of stops) gr.addColorStop(t,col);
  // a disc, not a square: the gradient pads its last stop into the corners
  c2.fillStyle=gr; c2.beginPath(); c2.arc(h,h,h,0,6.2832); c2.fill(); _halos[key]=sp; return sp;
}
export function drawHalo(sp,x,y,r,alpha){                       // alpha multiplies the sprite's own
  if(!(r>0.5)) return;
  if(r>4*Math.max(W,H)) return;                          // we are deep inside: the visible part is ~uniform and faint
  const ga=ctx.globalAlpha; ctx.globalAlpha=ga*alpha;
  ctx.drawImage(sp,x-r,y-r,r*2,r*2); ctx.globalAlpha=ga;
}
// Skia stalls for tens of seconds on stroke/fill paths whose bounds reach millions
// of px — reachable since real-scale deep zoom (orbit of Neptune seen from 500 km
// above Earth ≈ 1e9 px). Break paths at this limit like at the near plane.
const PLIM=32768;
export function offscr(p){ return p.depth<=V.NEAR || Math.abs(p.x-V.cx)>PLIM || Math.abs(p.y-V.cy)>PLIM; }
// ---- clipped polylines ----------------------------------------------------------
// Rings, grids, orbits and sky circles are paths that mostly lie off-screen: the 1-ly
// ring seen from 200 AU is hundreds of viewports wide, and the rasteriser still walks
// every pixel of it (every dash of it, if dashed) before clipping. So no such path
// reaches the canvas directly: points go through pathPt(), each segment is clipped to
// the viewport (Liang–Barsky, 40-px margin), and only the visible pieces are stroked.
export const PATH={n:0, x:new Float64Array(2048), y:new Float64Array(2048), brk:new Uint8Array(2048)};
export function pathBegin(){ PATH.n=0; }
export function pathPt(p){                                      // projected point; behind/far → break
  if(offscr(p)){ if(PATH.n) PATH.brk[PATH.n-1]=1; return; }
  const i=PATH.n; if(i>=PATH.x.length) return;
  PATH.x[i]=p.x; PATH.y[i]=p.y; PATH.brk[i]=0; PATH.n=i+1;
}
export function pathBreak(){ if(PATH.n) PATH.brk[PATH.n-1]=1; }
export function pathStroke(style,lw,dash){
  const n=PATH.n; if(n<2) return;
  const M=40, X0=-M, Y0=-M, X1=W+M, Y1=H+M;
  ctx.beginPath(); let any=false, open=false;
  for(let i=1;i<n;i++){
    if(PATH.brk[i-1]){ open=false; continue; }
    const ax=PATH.x[i-1], ay=PATH.y[i-1], dx=PATH.x[i]-ax, dy=PATH.y[i]-ay;
    let t0=0, t1=1, ok=true;
    for(let e=0;e<4;e++){
      const q = e===0?-dx : e===1?dx : e===2?-dy : dy;
      const r = e===0?ax-X0 : e===1?X1-ax : e===2?ay-Y0 : Y1-ay;
      if(q===0){ if(r<0){ ok=false; break; } continue; }
      const t=r/q;
      if(q<0){ if(t>t1){ ok=false; break; } if(t>t0) t0=t; }
      else   { if(t<t0){ ok=false; break; } if(t<t1) t1=t; }
    }
    if(!ok){ open=false; continue; }
    if(!open || t0>0) ctx.moveTo(ax+dx*t0, ay+dy*t0);
    ctx.lineTo(ax+dx*t1, ay+dy*t1); any=true;
    open = t1>=1;
  }
  if(!any) return;
  ctx.strokeStyle=style; ctx.lineWidth=lw;
  if(dash){ ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); } else ctx.stroke();
}
// ---- per-layer profiler (off unless api.prof(true)) ------------------------
// Frame cost is invisible from the outside: everything happens inside one render().
// P() accumulates wall time per layer so "it feels slow" becomes a number per layer.
export const PROF = { on: false, t: Object.create(null), frames: 0 };
export function P(k, fn) {
  if (!PROF.on) return fn();
  const a = performance.now(); const r = fn();
  PROF.t[k] = (PROF.t[k] || 0) + (performance.now() - a);
  return r;
}
api.prof = on => {
  if (on) { PROF.on = true; PROF.t = Object.create(null); PROF.frames = 0; return null; }
  PROF.on = false;
  const f = PROF.frames || 1;
  return { frames: PROF.frames,
    ms: Object.fromEntries(Object.entries(PROF.t)
      .map(([k, v]) => [k, +(v / f).toFixed(2)]).sort((a, b) => b[1] - a[1])) };
};
