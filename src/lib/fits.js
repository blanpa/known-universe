// FITS images and their WCS, pure: no DOM, so the maths can be checked in Node against
// astropy. parseFITS reads the primary HDU (BITPIX 8/16/32/64/-32/-64, BZERO/BSCALE,
// BLANK, a single plane of a cube); wcsOf reads a TAN projection with CD, PC+CDELT or
// CDELT+CROTA2, and pix2world maps FITS pixel coordinates (1-based, centres at integers)
// to ICRS degrees. Only TAN: anything else is reported, not guessed.
const D2R=Math.PI/180, R2D=180/Math.PI;
export function parseHeader(buf){
  const bytes=new Uint8Array(buf); const cards={}; let i=0, end=false, order=[];
  while(!end){
    if(i+80>bytes.length) throw new Error('FITS header has no END card');
    let line=''; for(let k=0;k<80;k++) line+=String.fromCharCode(bytes[i+k]); i+=80;
    const key=line.slice(0,8).trim();
    if(key==='END'){ end=true; break; }
    if(!key||key==='COMMENT'||key==='HISTORY'||line[8]!=='='){ continue; }
    let v=line.slice(10); const q=v.match(/^\s*'((?:[^']|'')*)'/);
    if(q){ cards[key]=q[1].replace(/''/g,"'").trimEnd(); }
    else { v=v.split('/')[0].trim(); cards[key]= v==='T'?true : v==='F'?false : isFinite(+v)&&v!==''?+v : v; }
    order.push(key);
  }
  const dataStart=Math.ceil(i/2880)*2880;
  return { cards, order, dataStart };
}
export function parseFITS(buf){
  const { cards:h, dataStart }=parseHeader(buf);
  if(h.SIMPLE!==true&&h.SIMPLE!=='T') throw new Error('not a standard FITS file (SIMPLE != T)');
  const bitpix=+h.BITPIX, naxis=+h.NAXIS;
  if(naxis<2) throw new Error(`not an image (NAXIS = ${naxis}); tables are not supported here`);
  const nx=+h.NAXIS1, ny=+h.NAXIS2, n=nx*ny, bz=+h.BZERO||0, bs=h.BSCALE!==undefined?+h.BSCALE:1, blank=h.BLANK!==undefined?+h.BLANK:null;
  const size=Math.abs(bitpix)/8; if(dataStart+n*size>buf.byteLength) throw new Error('file is shorter than its header says');
  const dv=new DataView(buf, dataStart), out=new Float32Array(n);
  for(let k=0;k<n;k++){ const o=k*size; let v;
    switch(bitpix){ case 8: v=dv.getUint8(o); break; case 16: v=dv.getInt16(o); break; case 32: v=dv.getInt32(o); break;
      case 64: v=Number(dv.getBigInt64(o)); break; case -32: v=dv.getFloat32(o); break; case -64: v=dv.getFloat64(o); break;
      default: throw new Error('BITPIX '+bitpix+' not supported'); }
    out[k]= (blank!==null&&v===blank) ? NaN : v*bs+bz; }
  return { header:h, nx, ny, data:out, bitpix };
}
// ---- WCS ----
export function wcsOf(h){
  const c1=String(h.CTYPE1||''), c2=String(h.CTYPE2||'');
  if(!c1||!c2) return { error:'no CTYPE keywords: the image carries no world coordinates' };
  const proj=c1.slice(5,8), proj2=c2.slice(5,8);
  const lonFirst=/^RA/.test(c1), latFirst=/^DEC/.test(c1);
  if(!(lonFirst&&/^DEC/.test(c2))&&!(latFirst&&/^RA/.test(c2))) return { error:`axes ${c1} / ${c2}: only RA/Dec images are supported` };
  if(proj!=='TAN'||proj2!=='TAN') return { error:`projection ${proj}: only TAN (gnomonic) is supported here` };
  const sip=/-SIP/.test(c1);
  const crpix=[+h.CRPIX1, +h.CRPIX2], crval=[+h.CRVAL1, +h.CRVAL2];
  if(!crpix.every(isFinite)||!crval.every(isFinite)) return { error:'CRPIX/CRVAL missing' };
  let cd;
  if(h.CD1_1!==undefined||h.CD2_2!==undefined) cd=[[+h.CD1_1||0,+h.CD1_2||0],[+h.CD2_1||0,+h.CD2_2||0]];
  else { const d1=+h.CDELT1, d2=+h.CDELT2; if(!isFinite(d1)||!isFinite(d2)) return { error:'no CD matrix and no CDELT' };
    let pc;
    if(h.PC1_1!==undefined||h.PC2_2!==undefined) pc=[[h.PC1_1!==undefined?+h.PC1_1:1,+h.PC1_2||0],[+h.PC2_1||0,h.PC2_2!==undefined?+h.PC2_2:1]];
    else { const rho=(+h.CROTA2||+h.CROTA1||0)*D2R;               // WCS paper II, eq. 186: CROTA2 → PC
      pc=[[Math.cos(rho), -(d2/d1)*Math.sin(rho)],[(d1/d2)*Math.sin(rho), Math.cos(rho)]]; }
    cd=[[d1*pc[0][0],d1*pc[0][1]],[d2*pc[1][0],d2*pc[1][1]]]; }
  const lonpole=h.LONPOLE!==undefined?+h.LONPOLE:180;
  const det=cd[0][0]*cd[1][1]-cd[0][1]*cd[1][0]; if(!det) return { error:'singular CD matrix' };
  const inv=[[cd[1][1]/det,-cd[0][1]/det],[-cd[1][0]/det,cd[0][0]/det]];
  const w={ crpix, crval:lonFirst?crval:[crval[1],crval[0]], cd, inv, lonpole, lonFirst, sip, scale:Math.sqrt(Math.abs(det))*3600,   // arcsec/px
    ctype:[c1,c2], equinox:h.EQUINOX!==undefined?+h.EQUINOX:(h.RADESYS?undefined:2000), radesys:h.RADESYS||'ICRS' };
  w.pix2world=(p1,p2)=>pix2world(w,p1,p2); w.world2pix=(ra,dec)=>world2pix(w,ra,dec);
  return w;
}
// pixel (1-based) → intermediate (x,y) degrees → native (φ,θ) → celestial, LONPOLE 180
export function pix2world(w,p1,p2){
  const u=p1-w.crpix[0], v=p2-w.crpix[1];
  let x=w.cd[0][0]*u+w.cd[0][1]*v, y=w.cd[1][0]*u+w.cd[1][1]*v;
  if(!w.lonFirst){ const t=x; x=y; y=t; }                   // DEC first: swap the intermediate axes
  const phi=Math.atan2(x,-y), r=Math.hypot(x,y)*D2R, theta=Math.atan2(1,r);
  const a0=w.crval[0]*D2R, d0=w.crval[1]*D2R, phip=w.lonpole*D2R;
  const st=Math.sin(theta), ct=Math.cos(theta), dphi=phi-phip, sd0=Math.sin(d0), cd0=Math.cos(d0);
  const dec=Math.asin(Math.max(-1,Math.min(1, st*sd0+ct*cd0*Math.cos(dphi))));
  const ra=a0+Math.atan2(-ct*Math.sin(dphi), st*cd0-ct*sd0*Math.cos(dphi));
  return [((ra*R2D)%360+360)%360, dec*R2D];
}
export function world2pix(w,ra,dec){
  const a0=w.crval[0]*D2R, d0=w.crval[1]*D2R, phip=w.lonpole*D2R, a=ra*D2R, d=dec*D2R;
  const sd=Math.sin(d), cdd=Math.cos(d), sd0=Math.sin(d0), cd0=Math.cos(d0), da=a-a0;
  const theta=Math.asin(Math.max(-1,Math.min(1, sd*sd0+cdd*cd0*Math.cos(da))));
  const phi=phip+Math.atan2(-cdd*Math.sin(da), sd*cd0-cdd*sd0*Math.cos(da));
  if(theta<=0) return null;                                 // behind the tangent plane
  const r=R2D/Math.tan(theta); let x=r*Math.sin(phi), y=-r*Math.cos(phi);
  if(!w.lonFirst){ const t=x; x=y; y=t; }
  return [w.crpix[0]+w.inv[0][0]*x+w.inv[0][1]*y, w.crpix[1]+w.inv[1][0]*x+w.inv[1][1]*y];
}
// the epoch of the exposure as a Julian year, from DATE-OBS (+ TIME-OBS) or MJD-OBS
export function epochOf(h){
  if(h['MJD-OBS']!==undefined&&isFinite(+h['MJD-OBS'])) return 2000+(+h['MJD-OBS']-51544.5)/365.25;
  const d=String(h['DATE-OBS']||''); const m=d.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}(?:\.\d*)?))?)?/);
  if(m){ const t=Date.UTC(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0),+(m[6]||0)); return 2000+(t/86400000+2440587.5-2451545)/365.25; }
  const m2=d.match(/^(\d{2})\/(\d{2})\/(\d{2})$/); if(m2) return 2000+(Date.UTC(1900+ +m2[3],+m2[2]-1,+m2[1])/86400000+2440587.5-2451545)/365.25;   // old DD/MM/YY
  return null;
}
// a display stretch: percentiles from a sample, asinh between them → 0..255
export function stretch(data,{lo=0.5,hi=99.7,asinhK=10}={}){
  const n=data.length, step=Math.max(1,Math.floor(n/200000)), s=[];
  for(let i=0;i<n;i+=step){ const v=data[i]; if(v===v) s.push(v); }
  s.sort((a,b)=>a-b); if(!s.length) return { lo:0, hi:1, map:()=>0 };
  const vlo=s[Math.floor(s.length*lo/100)], vhi=s[Math.min(s.length-1,Math.floor(s.length*hi/100))], span=(vhi-vlo)||1, K=Math.asinh(asinhK);
  return { lo:vlo, hi:vhi, map:v=>{ if(v!==v) return 0; const t=Math.max(0,Math.min(1,(v-vlo)/span)); return Math.round(255*Math.asinh(t*asinhK)/K); } };
}
// ---- binary tables (BINTABLE extensions): light curves, catalogues ----
// Every HDU after the primary is read; a table comes back as { name, header, nrows, cols:
// { NAME: TypedArray|string[] } }. TFORM codes D, E, J, I, K, B, L, A (with repeat counts;
// a repeat > 1 of a number keeps the first element — enough for TIME/FLUX columns).
export function parseFITSTables(buf){
  const bytes=new Uint8Array(buf); let off=0; const out=[];
  const hdr=()=>{ const h=parseHeader(buf.slice(off)); return h; };
  // primary HDU: skip header and any data
  let h=hdr(); let dataBytes=0; const naxis=+h.cards.NAXIS||0; if(naxis>0){ let n=Math.abs(+h.cards.BITPIX)/8; for(let i=1;i<=naxis;i++) n*=+h.cards['NAXIS'+i]; dataBytes=Math.ceil(n/2880)*2880; }
  off+=h.dataStart+dataBytes;
  while(off+2880<=bytes.length){
    h=hdr(); const c=h.cards; const xt=String(c.XTENSION||'').trim();
    const nrows=+c.NAXIS2||0, rowLen=+c.NAXIS1||0, nf=+c.TFIELDS||0, dataLen=Math.ceil(rowLen*nrows/2880)*2880;
    if(xt==='BINTABLE'&&nrows>0){
      const dv=new DataView(buf, off+h.dataStart, rowLen*nrows); const cols={}; let pos=0; const fields=[];
      for(let i=1;i<=nf;i++){ const tf=String(c['TFORM'+i]||'').trim(), m=tf.match(/^(\d*)([LXBIJKAEDCMPQ])/); if(!m){ fields.push(null); continue; }
        const rep=m[1]===''?1:+m[1], code=m[2], size={L:1,X:1,B:1,I:2,J:4,K:8,A:1,E:4,D:8,C:8,M:16,P:8,Q:16}[code];
        fields.push({ name:String(c['TTYPE'+i]||('col'+i)).trim(), rep, code, pos, size, unit:c['TUNIT'+i] }); pos+=rep*size; }
      for(const f of fields){ if(!f) continue;
        if(f.code==='A'){ const a=new Array(nrows); for(let r=0;r<nrows;r++){ let s=''; for(let k=0;k<f.rep;k++) s+=String.fromCharCode(dv.getUint8(r*rowLen+f.pos+k)); a[r]=s.trim(); } cols[f.name]=a; continue; }
        const a=(f.code==='D'||f.code==='K')?new Float64Array(nrows):f.code==='E'?new Float32Array(nrows):f.code==='J'?new Int32Array(nrows):f.code==='I'?new Int16Array(nrows):new Uint8Array(nrows);
        for(let r=0;r<nrows;r++){ const o=r*rowLen+f.pos;
          switch(f.code){ case 'D': a[r]=dv.getFloat64(o); break; case 'E': a[r]=dv.getFloat32(o); break; case 'J': a[r]=dv.getInt32(o); break; case 'I': a[r]=dv.getInt16(o); break; case 'K': a[r]=Number(dv.getBigInt64(o)); break; default: a[r]=dv.getUint8(o); } }
        cols[f.name]=a; }
      out.push({ name:String(c.EXTNAME||xt).trim(), header:c, nrows, cols, fields:fields.filter(Boolean) });
    }
    off+=h.dataStart+dataLen;
  }
  return out;
}
