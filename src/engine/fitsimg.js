// Your own image in the telescope: a FITS file with a TAN WCS is stretched, textured
// onto the sky sphere and drawn like a survey — under the catalogue, blinkable against
// DSS2 or Pan-STARRS. The catalogue stars then sit on your exposure, and whatever is
// on your exposure but not in the catalogue is the find.
import { api } from '../lib/api.js';
import { epochOf, parseFITS, stretch, wcsOf } from '../lib/fits.js';
import { V } from './state.js';
import { ST, publishSurvey, setBlink, setSurvey } from './survey.js';
export const FITS={ img:null };                          // { name, nx, ny, wcs, epoch, canvas, tex, header, mesh }
const D2R=Math.PI/180;
export function importFits(buf, name='image.fits'){
  let f, w;
  try{ f=parseFITS(buf); } catch(e){ ST.fits=null; ST.fitsMsg=`${name}: ${e.message}`; publishSurvey(); return null; }
  w=wcsOf(f.header);
  if(w.error){ ST.fits=null; ST.fitsMsg=`${name}: ${w.error}`; publishSurvey(); return null; }
  const st=stretch(f.data), cv=document.createElement('canvas'); cv.width=f.nx; cv.height=f.ny;
  const c2=cv.getContext('2d'), im=c2.createImageData(f.nx,f.ny), px=im.data;
  for(let y=0;y<f.ny;y++){ const row=(f.ny-1-y)*f.nx;             // FITS row 1 is the bottom: draw it at the bottom of the canvas
    for(let x=0;x<f.nx;x++){ const g=st.map(f.data[row+x]), o=(y*f.nx+x)*4; px[o]=px[o+1]=px[o+2]=g; px[o+3]=255; } }
  c2.putImageData(im,0,0);
  if(FITS.img&&FITS.img.tex&&FITS.img.gl) FITS.img.gl.deleteTexture(FITS.img.tex);
  const epoch=epochOf(f.header);
  FITS.img={ name, nx:f.nx, ny:f.ny, wcs:w, epoch, canvas:cv, tex:null, gl:null, header:f.header, lo:st.lo, hi:st.hi, bitpix:f.bitpix, mesh:null };
  const c=w.pix2world((f.nx+1)/2,(f.ny+1)/2);
  ST.fits={ name, nx:f.nx, ny:f.ny, epoch, scale:w.scale, ra:c[0], dec:c[1], object:f.header.OBJECT||'', date:f.header['DATE-OBS']||'', sip:w.sip };
  ST.fitsMsg=w.sip?'SIP distortion terms ignored: positions near the edges may be off by a few pixels':'';
  setSurvey('fits'); V.dirty=true; return ST.fits;
}
export function clearFits(){
  if(FITS.img&&FITS.img.tex&&FITS.img.gl) FITS.img.gl.deleteTexture(FITS.img.tex);
  FITS.img=null; ST.fits=null; ST.fitsMsg='';
  if(ST.id==='fits') setSurvey('dss'); if(ST.blinkWith==='fits') setBlink(ST.blink,'ps1');
  publishSurvey(); V.dirty=true;
}
// the image as a mesh on the sky: an N×N grid of FITS pixel positions → directions, with
// texture coordinates; the canvas row 0 is the TOP of the image (FITS row ny), so v runs
// from 1 at FITS row 1 to 0 at row ny
export function fitsMesh(N){
  const im=FITS.img; if(!im) return null; if(im.mesh&&im.mesh.N===N) return im.mesh;
  const verts=new Float32Array((N+1)*(N+1)*5);
  for(let j=0;j<=N;j++) for(let i=0;i<=N;i++){
    const p1=0.5+i/N*im.nx, p2=0.5+j/N*im.ny, [ra,dec]=im.wcs.pix2world(p1,p2), r=ra*D2R, d=dec*D2R, cd=Math.cos(d), o=(j*(N+1)+i)*5;
    verts[o]=cd*Math.cos(r); verts[o+1]=cd*Math.sin(r); verts[o+2]=Math.sin(d); verts[o+3]=i/N; verts[o+4]=1-j/N; }
  return im.mesh={ N, verts };
}
// the sky direction under a FITS pixel and the pixel under a sky direction (for readouts)
export function fitsPixelOf(ra,dec){ const im=FITS.img; if(!im) return null; const p=im.wcs.world2pix(ra,dec); if(!p) return null;
  return (p[0]>=0.5&&p[0]<=im.nx+0.5&&p[1]>=0.5&&p[1]<=im.ny+0.5) ? { x:p[0], y:p[1], inside:true } : { x:p[0], y:p[1], inside:false }; }
Object.assign(api,{ importFits, clearFits });
