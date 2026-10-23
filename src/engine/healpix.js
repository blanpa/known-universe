// HEALPix, nested scheme — just enough to place a HiPS tile on the sky: a nested pixel
// index at some order → the face and its (ix, iy) cell, a point in that cell's local
// (x, y) square → a direction on the sphere. The projection follows the reference
// implementation's xyf2loc (Górski et al. 2005).
const JRLL=[2,2,2,2,3,3,3,3,4,4,4,4], JPLL=[1,3,5,7,0,2,4,6,1,3,5,7];
function compress(v){                       // keep the even bits of v, packed
  v&=0x55555555; v=(v|(v>>1))&0x33333333; v=(v|(v>>2))&0x0f0f0f0f; v=(v|(v>>4))&0x00ff00ff; v=(v|(v>>8))&0x0000ffff; return v;
}
export function nest2xyf(order,pix){
  const nside=1<<order, face=pix>>>(2*order), p=pix&(nside*nside-1);
  return {face, ix:compress(p), iy:compress(p>>>1), nside};
}
// local square coordinates (x, y in 0..1) of face f → unit direction (equatorial frame)
export function xyf2dir(x,y,face){
  const jr=JRLL[face]-x-y; let nr, z;
  if(jr<1){ nr=jr; z=1-nr*nr/3; }
  else if(jr>3){ nr=4-jr; z=nr*nr/3-1; }
  else { nr=1; z=(2-jr)*2/3; }
  let t=JPLL[face]*nr+x-y; if(t<0) t+=8; if(t>=8) t-=8;
  const phi=nr<1e-15?0:t*Math.PI/4/nr;
  const sth=Math.sqrt(Math.max(0,1-z*z));
  return [sth*Math.cos(phi), sth*Math.sin(phi), z];
}
// a point inside tile `pix` (order) at fractional cell coordinates (u, v in 0..1)
export function tileDir(order,pix,u,v){
  const {face,ix,iy,nside}=nest2xyf(order,pix);
  return xyf2dir((ix+u)/nside,(iy+v)/nside,face);
}
export const tileCentre=(order,pix)=>tileDir(order,pix,0.5,0.5);
// angular radius of a tile at this order (deg), generous: the diagonal of a cell
export const tileRadiusDeg=order=>58.6/(1<<order)*0.75;
