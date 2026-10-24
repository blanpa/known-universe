// The view as a vector drawing: one frame is rendered through a context that records
// Canvas 2D calls as SVG elements — every line, ring, grid, orbit and label stays a path
// or a text — with the GL point clouds and the sky image underneath as one raster.
// Figures for a paper come out of this; the e2e run parses the file and renders it back.
import { api } from '../lib/api.js';
import { download } from '../lib/export.js';
import { cv, swapContext } from './canvas.js';
import { glcv } from './gl.js';
import { render } from './render.js';
import { V } from './state.js';
import { H, W } from './view.js';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const num=v=>(Math.round(v*100)/100).toString();
// a Canvas 2D look-alike that writes SVG
class SvgCtx{
  constructor(w,h){ this.w=w; this.h=h; this.out=[]; this.path=[]; this.defs=new Map(); this.defList=[]; this.defSize=new Map(); this.nimg=0; this.st={ fill:'#000', stroke:'#000', lw:1, alpha:1, font:'10px monospace', align:'start', base:'alphabetic', dash:[], cap:'butt', join:'miter', m:[1,0,0,1,0,0], clip:null }; this.stack=[]; this.clips=0; this.openClip=null; this.canvas={ width:w, height:h }; }
  // state as properties, like the real thing
  set fillStyle(v){ this.st.fill=styleOf(v); } get fillStyle(){ return this.st.fill; }
  set strokeStyle(v){ this.st.stroke=styleOf(v); } get strokeStyle(){ return this.st.stroke; }
  set lineWidth(v){ this.st.lw=v; } get lineWidth(){ return this.st.lw; }
  set globalAlpha(v){ this.st.alpha=v; } get globalAlpha(){ return this.st.alpha; }
  set font(v){ this.st.font=v; } get font(){ return this.st.font; }
  set textAlign(v){ this.st.align=v; } get textAlign(){ return this.st.align; }
  set textBaseline(v){ this.st.base=v; } get textBaseline(){ return this.st.base; }
  set lineCap(v){ this.st.cap=v; } get lineCap(){ return this.st.cap; }
  set lineJoin(v){ this.st.join=v; } get lineJoin(){ return this.st.join; }
  set globalCompositeOperation(v){ this.st.gco=v; } get globalCompositeOperation(){ return this.st.gco||'source-over'; }
  set imageSmoothingEnabled(v){ this._ise=v; } get imageSmoothingEnabled(){ return !!this._ise; }
  setLineDash(d){ this.st.dash=d?Array.from(d):[]; } getLineDash(){ return this.st.dash.slice(); }
  save(){ this.stack.push({ ...this.st, m:this.st.m.slice(), dash:this.st.dash.slice() }); }
  restore(){ const s=this.stack.pop(); if(s){ if(this.st.clip!==s.clip&&this.openClip){ this.out.push('</g>'); this.openClip=null; } this.st=s; } }
  translate(x,y){ this.st.m=mul(this.st.m,[1,0,0,1,x,y]); } rotate(a){ const c=Math.cos(a),s=Math.sin(a); this.st.m=mul(this.st.m,[c,s,-s,c,0,0]); } scale(x,y){ this.st.m=mul(this.st.m,[x,0,0,y,0,0]); }
  setTransform(a,b,c,d,e,f){ this.st.m=[a,b,c,d,e,f]; } resetTransform(){ this.st.m=[1,0,0,1,0,0]; } transform(a,b,c,d,e,f){ this.st.m=mul(this.st.m,[a,b,c,d,e,f]); }
  tr(){ const m=this.st.m; return (m[0]===1&&m[1]===0&&m[2]===0&&m[3]===1&&m[4]===0&&m[5]===0)?'':` transform="matrix(${m.map(num).join(' ')})"`; }
  beginPath(){ this.path=[]; } closePath(){ this.path.push('Z'); }
  moveTo(x,y){ this.path.push(`M${num(x)} ${num(y)}`); } lineTo(x,y){ this.path.push(`L${num(x)} ${num(y)}`); }
  rect(x,y,w,h){ this.path.push(`M${num(x)} ${num(y)}h${num(w)}v${num(h)}h${num(-w)}Z`); }
  arc(x,y,r,a0,a1,ccw){ if(r<=0) return; const full=Math.abs(a1-a0)>=2*Math.PI-1e-6;
    if(full){ this.path.push(`M${num(x+r)} ${num(y)}A${num(r)} ${num(r)} 0 1 1 ${num(x-r)} ${num(y)}A${num(r)} ${num(r)} 0 1 1 ${num(x+r)} ${num(y)}`); return; }
    const sx=x+r*Math.cos(a0), sy=y+r*Math.sin(a0), ex=x+r*Math.cos(a1), ey=y+r*Math.sin(a1); let d=a1-a0; if(ccw) d=-(2*Math.PI-((d%(2*Math.PI))+2*Math.PI)%(2*Math.PI)); const large=Math.abs(d)>Math.PI?1:0, sweep=d>0?1:0;
    this.path.push(`${this.path.length?'L':'M'}${num(sx)} ${num(sy)}A${num(r)} ${num(r)} 0 ${large} ${sweep} ${num(ex)} ${num(ey)}`); }
  ellipse(x,y,rx,ry,rot,a0,a1){ if(rx<=0||ry<=0) return; const full=Math.abs(a1-a0)>=2*Math.PI-1e-6, c=Math.cos(rot), s=Math.sin(rot);
    const pt=a=>[x+rx*Math.cos(a)*c-ry*Math.sin(a)*s, y+rx*Math.cos(a)*s+ry*Math.sin(a)*c];
    if(full){ const p0=pt(0), p1=pt(Math.PI); this.path.push(`M${num(p0[0])} ${num(p0[1])}A${num(rx)} ${num(ry)} ${num(rot*57.2958)} 1 1 ${num(p1[0])} ${num(p1[1])}A${num(rx)} ${num(ry)} ${num(rot*57.2958)} 1 1 ${num(p0[0])} ${num(p0[1])}`); return; }
    const p0=pt(a0), p1=pt(a1), d=a1-a0; this.path.push(`${this.path.length?'L':'M'}${num(p0[0])} ${num(p0[1])}A${num(rx)} ${num(ry)} ${num(rot*57.2958)} ${Math.abs(d)>Math.PI?1:0} ${d>0?1:0} ${num(p1[0])} ${num(p1[1])}`); }
  quadraticCurveTo(cx,cy,x,y){ this.path.push(`Q${num(cx)} ${num(cy)} ${num(x)} ${num(y)}`); } bezierCurveTo(a,b,c,d,x,y){ this.path.push(`C${num(a)} ${num(b)} ${num(c)} ${num(d)} ${num(x)} ${num(y)}`); }
  fill(){ if(!this.path.length) return; this.out.push(`<path d="${this.path.join('')}" fill="${this.st.fill}"${this.op()}${this.tr()}/>`); }
  stroke(){ if(!this.path.length) return; this.out.push(`<path d="${this.path.join('')}" fill="none" stroke="${this.st.stroke}" stroke-width="${num(this.st.lw)}"${this.st.dash.length?` stroke-dasharray="${this.st.dash.map(num).join(' ')}"`:''}${this.st.cap!=='butt'?` stroke-linecap="${this.st.cap}"`:''}${this.op()}${this.tr()}/>`); }
  clip(){ if(!this.path.length) return; const id='c'+(++this.clips); this.out.push(`<clipPath id="${id}"><path d="${this.path.join('')}"${this.tr()}/></clipPath><g clip-path="url(#${id})">`); this.openClip=id; this.st.clip=id; }
  fillRect(x,y,w,h){ this.out.push(`<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" fill="${this.st.fill}"${this.op()}${this.tr()}/>`); }
  strokeRect(x,y,w,h){ this.out.push(`<rect x="${num(x)}" y="${num(y)}" width="${num(w)}" height="${num(h)}" fill="none" stroke="${this.st.stroke}" stroke-width="${num(this.st.lw)}"${this.op()}${this.tr()}/>`); }
  clearRect(){ /* the frame starts empty */ }
  fillText(t,x,y){ if(t===undefined||t===null||t==='') return; const f=this.st.font.match(/(\d+(?:\.\d+)?)px\s+(.+)/); const size=f?f[1]:'10', fam=f?f[2].replace(/"/g,"'"):'monospace', w=/bold|[6-9]00/.test(this.st.font)?' font-weight="bold"':'';
    const anchor=this.st.align==='center'?'middle':this.st.align==='right'||this.st.align==='end'?'end':'start', base=this.st.base==='middle'?' dominant-baseline="middle"':this.st.base==='top'||this.st.base==='hanging'?' dominant-baseline="hanging"':'';
    this.out.push(`<text x="${num(x)}" y="${num(y)}" font-size="${size}" font-family="${esc(fam)}"${w} text-anchor="${anchor}"${base} fill="${this.st.fill}"${this.op()}${this.tr()}>${esc(t)}</text>`); }
  strokeText(t,x,y){ this.fillText(t,x,y); }
  measureText(t){ const f=this.st.font.match(/(\d+(?:\.\d+)?)px/); const size=f?+f[1]:10; return { width:String(t).length*size*0.6, actualBoundingBoxAscent:size*0.8, actualBoundingBoxDescent:size*0.2 }; }
  // the same sprite (a halo, a glow) is drawn many times: it goes into <defs> once and is <use>d
  drawImage(im,...a){ let sx=0,sy=0,sw=im.width,sh=im.height,dx,dy,dw,dh; if(a.length>=8){ [sx,sy,sw,sh,dx,dy,dw,dh]=a; } else { [dx,dy,dw,dh]=a; if(dw===undefined){ dw=im.width; dh=im.height; } }
    try{ const key=`${sx},${sy},${sw},${sh}`; let m=this.defs.get(im); if(!m){ m=new Map(); this.defs.set(im,m); }
      let id=m.get(key); if(!id){ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(sw)); c.height=Math.max(1,Math.round(sh)); c.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,c.width,c.height);
        id='i'+(++this.nimg); m.set(key,id); this.defList.push(`<image id="${id}" width="${c.width}" height="${c.height}" href="${c.toDataURL('image/png')}"/>`); this.defSize.set(id,[c.width,c.height]); }
      const [iw,ih]=this.defSize.get(id), sxk=dw/iw, syk=dh/ih;
      this.out.push(`<use href="#${id}" transform="${this.tr()?this.tr().slice(12,-1)+' ':''}translate(${num(dx)} ${num(dy)}) scale(${num(sxk)} ${num(syk)})"${this.op()}/>`); }catch(_){} }
  createRadialGradient(){ return { addColorStop(){}, __grad:true }; } createLinearGradient(){ return { addColorStop(){}, __grad:true }; }
  createPattern(){ return null; } getImageData(){ return { data:new Uint8ClampedArray(4) }; } putImageData(){} isPointInPath(){ return false; }
  op(){ return this.st.alpha<1?` opacity="${num(this.st.alpha)}"`:''; }
  svg(bgPng){ if(this.openClip){ this.out.push('</g>'); this.openClip=null; }
    return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}">\n<title>Known Universe — view</title>\n<rect width="100%" height="100%" fill="#000"/>\n${this.defList.length?`<defs>\n${this.defList.join('\n')}\n</defs>\n`:''}${bgPng?`<image x="0" y="0" width="${this.w}" height="${this.h}" href="${bgPng}"/>\n`:''}<g font-family="ui-monospace, monospace">\n${this.out.join('\n')}\n</g>\n</svg>\n`; }
}
function styleOf(v){ if(v&&typeof v==='object'){ return v.__grad?'rgba(255,255,255,0.08)':'#fff'; } return String(v); }
function mul(a,b){ return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]]; }
export function exportSvg(opts={}){
  const w=Math.round(W), h=Math.round(H);
  V.dirty=true; render();                                        // a fresh GL frame to rasterise
  let bg=null; try{ const c=document.createElement('canvas'); c.width=w; c.height=h; const g=c.getContext('2d'); g.drawImage(glcv,0,0,w,h); bg=c.toDataURL('image/png'); }catch(_){}
  const rec=new SvgCtx(w,h); rec.setTransform(1,0,0,1,0,0);
  swapContext(rec); try{ V.dirty=true; render(); } finally{ swapContext(null); }
  V.dirty=true;
  const text=rec.svg(bg), stats={ paths:(text.match(/<path /g)||[]).length, texts:(text.match(/<text /g)||[]).length, rects:(text.match(/<rect /g)||[]).length, images:(text.match(/<image /g)||[]).length, uses:(text.match(/<use /g)||[]).length, bytes:text.length };
  if(!opts.text) download(`known-universe-${new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')}.svg`, text, 'image/svg+xml');
  return opts.text?text:stats;
}
void cv;
api.exportSvg=exportSvg;
