// Sky surveys as a backdrop: real images of the sky (DSS2, 2MASS, AllWISE, Pan-STARRS)
import { survey as surveyStore } from '../lib/stores.js';
import { nest2xyf, tileCentre, tileDir, tileRadiusDeg } from './healpix.js';
import { S, V } from './state.js';
import { H, W, camDist, camFwd, invScale, projectInto, scale } from './view.js';
// served as HiPS tiles by the CDS, projected on a sphere far outside the stellar
// neighbourhood. From the Sun's position the view direction is the sky direction, so
// the catalogue stars fall on their images. Different surveys are different epochs:
// blink DSS2 (1980s–90s) against Pan-STARRS or WISE (2010s) and the stars that move
// are the ones nobody has catalogued yet, or has.

export const SURVEYS=[
  { id:'dss',   n:'DSS2',       epoch:'1983–1999', ep:1992,   base:'https://alasky.cds.unistra.fr/DSS/DSSColor',               ext:'jpg', maxOrder:9 },
  { id:'2mass', n:'2MASS',      epoch:'1997–2001', ep:1999,   base:'https://alasky.cds.unistra.fr/2MASS/Color',                ext:'jpg', maxOrder:9 },
  { id:'wise',  n:'AllWISE',    epoch:'2010',      ep:2010.5, base:'https://alasky.cds.unistra.fr/AllWISE/RGB-W4-W2-W1',       ext:'jpg', maxOrder:8 },
  { id:'ps1',   n:'Pan-STARRS', epoch:'2010–2014', ep:2012,   base:'https://alasky.cds.unistra.fr/Pan-STARRS/DR1/color-z-zg-g', ext:'jpg', maxOrder:11 },
];
export const SKY_R_PC=1e4;                                  // the backdrop sphere, far beyond the local stars
export const ST={ id:'dss', on:false, blink:false, blinkWith:'ps1' };
let _blinkTimer=null, _blinkPhase=0;

export function setSurvey(id){ ST.id=id; ST.on=!!SURVEYS.find(s=>s.id===id); publish(); V.dirty=true; }
export function setBlink(on, withId){
  ST.blink=!!on; if(withId) ST.blinkWith=withId;
  if(_blinkTimer){ clearInterval(_blinkTimer); _blinkTimer=null; }
  if(ST.blink) _blinkTimer=setInterval(()=>{ _blinkPhase^=1; V.dirty=true; },700);
  publish(); V.dirty=true;
}
function publish(){ surveyStore.set({ id:ST.on?ST.id:null, blink:ST.blink, blinkWith:ST.blinkWith }); }
publish();
export function activeSurvey(){
  if(!ST.on) return null;
  const id=(ST.blink&&_blinkPhase)?ST.blinkWith:ST.id;
  return SURVEYS.find(s=>s.id===id)||null;
}
// the backdrop only makes sense from (near) the Sun: fade out within 30–60 pc
export function surveyAlpha(){
  if(!ST.on) return 0;
  if(S.skyMode&&camDist>1e-4) return 0;                   // the photographs are the Sun's sky
  const d=camDist>1e-9?invScale(camDist):0;
  return Math.max(0,Math.min(1,(60-d)/30));
}

// ---- tiles ----
const CACHE=new Map();                                      // key → {img, tex, ok, failed}
let _loads=0;
export const cacheSize=()=>CACHE.size;
export function tileKey(sv,order,pix){ return sv.id+'/'+order+'/'+pix; }
export function tileURL(sv,order,pix){ return `${sv.base}/Norder${order}/Dir${Math.floor(pix/10000)*10000}/Npix${pix}.${sv.ext}`; }
export function requestTile(sv,order,pix){
  const k=tileKey(sv,order,pix); let t=CACHE.get(k);
  if(t) return t;
  if(_loads>=12) return null;                               // a dozen in flight is plenty
  t={img:new Image(), tex:null, ok:false, failed:false, at:performance.now()}; CACHE.set(k,t); _loads++;
  t.img.crossOrigin='anonymous';
  t.img.onload=()=>{ _loads--; t.ok=true; V.dirty=true; };
  t.img.onerror=()=>{ _loads--; t.failed=true; };
  t.img.src=tileURL(sv,order,pix);
  if(CACHE.size>600){                                       // drop the oldest finished tiles
    const old=[...CACHE.entries()].filter(e=>e[1].ok||e[1].failed).sort((a,b)=>a[1].at-b[1].at).slice(0,150);
    for(const [kk,tt] of old){ if(tt.tex&&tt.gl) tt.gl.deleteTexture(tt.tex); CACHE.delete(kk); }
  }
  return t;
}
// the best loaded image for a tile: itself, or an ancestor with the matching sub-rectangle
export function bestTile(sv,order,pix){
  let o=order, p=pix, u0=0, v0=0, size=1;
  while(o>=3){
    const t=CACHE.get(tileKey(sv,o,p));
    if(t&&t.ok) return {t, u0, v0, size};
    if(!t && o===order) requestTile(sv,o,p);
    if(o===3) break;
    // step to the parent: the child's position within the parent follows from nest bits
    const c=p&3; p>>>=2; o--;
    size*=0.5;
    const cx=(c&1)?1:0, cy=(c&2)?1:0;                       // nested: bit 0 → +x, bit 1 → +y
    u0=u0*0.5+cx*0.5; v0=v0*0.5+cy*0.5;
  }
  const t=CACHE.get(tileKey(sv,3,p)); if(!t) requestTile(sv,3,p);
  return null;
}
// ---- which tiles are in view ----
export function fovDeg(){ return 2*Math.atan(Math.max(W,H)/2/(V.foc*V.fovK))*57.29578; }
export function chooseOrder(sv){
  const fov=fovDeg(), pxPerDeg=Math.max(W,H)/fov;
  // one tile (512 px) should cover about 512 screen px: tile size 58.6°/2^o
  let o=Math.round(Math.log2(58.6*pxPerDeg/512)+0.3);
  return Math.max(3,Math.min(sv.maxOrder,o));
}
// The tiles in view: a cone test prunes the HEALPix tree, then each leaf's centre is
// projected and kept when it lands inside the viewport plus its own radius. (A cone
// alone over-fetched tenfold at narrow fields — 800 tiles for a 2° view.)
export function visibleTiles(order){
  const fw=camFwd, fov=fovDeg(), half=fov*Math.hypot(W,H)/Math.max(W,H)*0.5, out=[];
  const pxPerDeg=Math.max(W,H)/fov, R=scale(SKY_R_PC), o_={};
  function visit(o,pix){
    const c=tileCentre(o,pix), dot=c[0]*fw[0]+c[1]*fw[1]+c[2]*fw[2];
    const r=tileRadiusDeg(o);
    if(dot < Math.cos(Math.min(179,half+r+0.5)*0.0174533)) return;  // outside the cone
    if(o===order){
      projectInto(c[0]*R,c[1]*R,c[2]*R,o_);
      const m=r*pxPerDeg*1.3+8;                                   // the tile's own extent on screen
      if(o_.depth>0 && o_.x>-m && o_.x<W+m && o_.y>-m && o_.y<H+m) out.push(pix);
      return; }
    for(let k=0;k<4;k++) visit(o+1,(pix<<2)|k);
  }
  for(let p=0;p<768;p++) visit(3,p);
  return out;
}
// corner / grid directions of a tile for the mesh (N×N grid in cell coordinates)
export function tileGrid(order,pix,N){
  const dirs=[];
  for(let j=0;j<=N;j++) for(let i=0;i<=N;i++) dirs.push(tileDir(order,pix,i/N,j/N));
  return dirs;
}
// cell (x,y) → image (s,t). The HiPS tile image runs the cell's y along its columns and
// the cell's x down its rows (s=y, t=x). Settled empirically: of the eight candidate
// flips this is the only one that puts the catalogue stars on their photographs, at the
// Pleiades, Orion's belt and a polar field, in DSS2 and 2MASS alike.
export function uvOf(u,v){ return [v, u]; }
export { nest2xyf };
