// The main dataset (data.json) and catalog.json, with the per-star precompute.
import { S } from './state.js';
export const DATA = window.__DATA__, META = DATA.meta, STARS = DATA.stars;
// the baked catalogues (pulsars, clusters, comets, moon ephemerides, …) now ship as
// site/data/catalog.json — loaded by main.js next to data.json, embedded in the artifact
export const CAT = window.__CATALOG__ || {};
export const PC2LY = 3.261564;
// ---- precompute direction + radius, normalization ----
const dists = STARS.map(s=>s.d).slice().sort((a,b)=>a-b);
const R0 = dists[Math.floor(dists.length*0.90)] || META.maxDist;   // 90th pct -> radius 1
const MAXD = META.maxDist;
STARS.forEach(s=>{
  const r=s.d||1e-6;
  s._dx=s.x/r; s._dy=s.y/r; s._dz=s.z/r; s._r=r;
  s._col=tempColor(s.t);
  s._sr=starRadius(s);                       // stellar radius in R☉ — drives the glyph size
  s._search=(s.h+' '+s.p.map(p=>p.n).join(' ')).toLowerCase();
});

export const BND = R0;
export const GAL = DATA.galaxies||[];
GAL.forEach(g=>{ g._gs=0.5+Math.sqrt(g.kpc||0.5)/6; });   // positions computed per frame
// ---- blackbody-ish star colour from effective temperature (K) ----
function tempColor(t){
  if(!t) return [150,160,190];
  if(t>=30000) return [155,176,255];
  if(t>=10000) return [170,191,255];
  if(t>=7500)  return [202,215,255];
  if(t>=6000)  return [248,247,255];
  if(t>=5200)  return [255,244,232];
  if(t>=3700)  return [255,210,161];
  return [255,181,108];
}
// point-size multiplier from the largest planet's real radius (Earth radii)
// Host-star glyph size. It used to scale with the system's largest PLANET, which made
// a red dwarf with a hot Jupiter outrank a real giant. Stellar radius is not in the
// dataset, but it follows from what is: R/R☉ = √(L/L☉) / (T/5772)². Checked against the
// literature — Proxima 0.153, TRAPPIST-1 0.124, KELT-9 2.42 R☉, all within a few percent.
export function starRadius(s){
  if(s.lum>0 && s.t>0) return Math.sqrt(s.lum)/Math.pow(s.t/5772, 2);
  if(s.t>0) return Math.pow(s.t/5772, 2);      // main-sequence approximation (6% of hosts)
  return 1;
}
// Planets discovered by a given year. Only the year slider changes this, so cache it
// per star instead of re-walking every planet list on every frame.
let _pcYear=-1;
export function planetsBy(s, year){
  if(_pcYear!==year){ _pcYear=year; for(let i=0;i<STARS.length;i++) STARS[i]._pcN=-1; }
  let n=s._pcN;
  if(n<0){ n=0; const ps=s.p;
    for(let k=0;k<ps.length;k++){ const y=ps[k].y; if(y<=year||y===0) n++; }
    s._pcN=n; }
  return n;
}
export function radiusScale(sr){
  if(!S.size || !sr) return 1;
  // ^0.7 keeps the 0.012–94 R☉ span usable: dwarfs sit near the floor, giants at the cap
  return Math.max(0.30, Math.min(4.2, Math.pow(sr, 0.7)));
}
