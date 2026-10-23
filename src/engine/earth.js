// The Earth up close: EPIC/GOES imagery, the 3D globe, the surface tile map.
import { LIVE } from '../lib/live.js';
import { ctx } from './canvas.js';
import { LBL, P_HUD } from './labels.js';
import { D2R, PLANETS, eclDir, solarJD } from './solar-data.js';
import { S, V } from './state.js';
import { H, W } from './view.js';
// ---- EPIC: today's photo of Earth as the glyph texture (lazy, CORS image) ----
let _epicImg=null,_epicState=0;
function epicImage(){
  if(_epicState===0 && LIVE.epic){ _epicState=1;
    const im=new Image(); im.crossOrigin='anonymous';
    im.onload=()=>{ _epicImg=im; V.dirty=true; };
    im.onerror=()=>{ _epicState=2; };
    im.src=LIVE.epic.url;
  }
  return _epicImg;
}
// ---- GOES-19 GEOCOLOR full disk: a truly live Earth (new image every ~10 min) ----
// The disk fills the frame edge-to-edge (measured); the small NOAA banner at the
// bottom is left visible — it carries the real observation timestamp.
let _goesImg=null,_goesLoading=false,_goesTs=0,_goesHi=false,_goesFail=0;
function loadGoes(res){
  if(_goesLoading) return;
  _goesLoading=true;
  const im=new Image(); im.crossOrigin='anonymous';
  im.onload=()=>{ _goesImg=im; _goesTs=Date.now(); _goesHi=res>2000; _goesLoading=false; V.dirty=true; };
  im.onerror=()=>{ _goesLoading=false; _goesFail++; };
  im.src=`https://cdn.star.nesdis.noaa.gov/GOES19/ABI/FD/GEOCOLOR/${res}x${res}.jpg`
        +'?t='+Math.floor(Date.now()/600000);          // 10-min cache-buster
}
export function earthImage(px){
  if(_goesFail>1) return {im:epicImage(), live:false};  // GOES unreachable → EPIC fallback
  const wantHi=px>420;
  if(!_goesImg || Date.now()-_goesTs>10*60*1000 || (wantHi&&!_goesHi))
    loadGoes(wantHi?5424:1808);
  return _goesImg ? {im:_goesImg, live:true} : {im:epicImage(), live:false};
}
// ---- 3D Earth globe: offscreen WebGL sphere with the daily VIIRS mosaic ----
// True orientation (GMST spin + 23.44° obliquity) and the real sun direction →
// the day/night terminator is where it actually is; dragging orbits the globe.
export let _gbl=null;
function gmstRad(jd){ const d=jd-2451545; let g=(280.46061837+360.98564736629*d)%360;
  if(g<0)g+=360; return g*D2R; }
export function globeViewRows(){
  const cy=Math.cos(S.yaw),sy=Math.sin(S.yaw),cp=Math.cos(S.pitch),sp=Math.sin(S.pitch);
  return [[cy,0,sy],[sy*sp,cp,-cy*sp],[-sy*cp,sp,cy*cp]];   // rows of project()'s rotation
}
function globeModelRows(t){                                  // spin angle t (GMST)
  // the world frame is equatorial, so the axis is world z and the tilt is already in
  // where the Sun stands (eclDir); the model is the daily spin alone
  const ct=Math.cos(t), st=Math.sin(t);
  return [[ct,-st,0],[st,ct,0],[0,0,1]];                    // world ← geographic
}
const rows2col=r=>[r[0][0],r[1][0],r[2][0], r[0][1],r[1][1],r[2][1], r[0][2],r[1][2],r[2][2]];
let _gblFails=0, _gblNextTry=0;
function globeInit(){
  if(_gbl!==null){
    if(_gbl.gl) return _gbl;
    // context/link failures are often transient (driver hiccup, context limit) —
    // retry with a fresh canvas instead of caching the failure forever
    if(_gblFails>=5 || performance.now()<_gblNextTry) return null;
    _gbl=null;
  }
  const fail=msg=>{ _gbl={gl:null}; _gblFails++; _gblNextTry=performance.now()+4000;
    try{console.warn(msg);}catch(e){} return null; };
  const cv2=document.createElement('canvas');
  const gl=cv2.getContext('webgl',{alpha:true,antialias:true});
  if(!gl) return fail('globe: no WebGL context');
  const mk=(t,src)=>{ const sh=gl.createShader(t); gl.shaderSource(sh,src); gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){ console.warn(gl.getShaderInfoLog(sh)); return null; } return sh; };
  const vsh=mk(gl.VERTEX_SHADER,`attribute vec3 aP; uniform mat3 uV,uM; varying vec3 vS;
    void main(){ vS=aP; vec3 q=uV*(uM*aP); gl_Position=vec4(q.x,q.y,-q.z*0.5,1.0); }`);
  const fsh=mk(gl.FRAGMENT_SHADER,`precision mediump float; varying vec3 vS;
    uniform highp mat3 uV,uM; uniform vec3 uSun; uniform sampler2D uT;
    void main(){
      vec3 n=normalize(vS);
      vec2 uv=vec2(0.5+atan(n.y,n.x)/6.2831853, 0.5-asin(clamp(n.z,-1.0,1.0))/3.14159265);
      vec3 tex=texture2D(uT,uv).rgb;
      vec3 wn=normalize(uM*n);
      float d=dot(wn,uSun);
      float day=smoothstep(-0.08,0.12,d);
      vec3 lit=tex*(0.16+0.92*max(d,0.0));
      vec3 night=tex*0.05+vec3(0.008,0.012,0.028);
      vec3 col=mix(night,lit,day);
      vec3 vn=uV*wn;                                        // subtle atmosphere at the limb
      col+=vec3(0.10,0.22,0.45)*pow(1.0-clamp(vn.z,0.0,1.0),3.0)*(0.25+0.75*day)*0.35;
      gl_FragColor=vec4(col,1.0);
    }`);
  if(!vsh||!fsh) return fail('globe: shader compile failed');
  const pr=gl.createProgram(); gl.attachShader(pr,vsh); gl.attachShader(pr,fsh); gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) return fail('globe: link failed');
  _gblFails=0;
  const ST=48,SL=96,pos=[],idx=[];
  for(let i=0;i<=ST;i++){ const ph=Math.PI*(i/ST-0.5), cp2=Math.cos(ph);
    for(let j=0;j<=SL;j++){ const la=2*Math.PI*j/SL;
      pos.push(cp2*Math.cos(la), cp2*Math.sin(la), Math.sin(ph)); } }
  for(let i=0;i<ST;i++) for(let j=0;j<SL;j++){
    const a=i*(SL+1)+j, b=a+SL+1; idx.push(a,b,a+1, a+1,b,b+1); }
  const vb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vb);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);
  const ib=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),gl.STATIC_DRAW);
  const tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([30,50,90,255]));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.enable(gl.DEPTH_TEST);
  const aP=gl.getAttribLocation(pr,'aP');
  _gbl={cv:cv2,gl,pr,vb,ib,nIdx:idx.length,tex,aP,
    uV:gl.getUniformLocation(pr,'uV'),uM:gl.getUniformLocation(pr,'uM'),
    uSun:gl.getUniformLocation(pr,'uSun'),uT:gl.getUniformLocation(pr,'uT'),
    texReady:false,loading:false,texDate:''};
  return _gbl;
}
// fraction of black/no-data pixels, polar caps excluded (polar night is legitimately dark)
function mosaicGaps(cnv){
  const c=document.createElement('canvas'); c.width=128; c.height=64;
  const g2=c.getContext('2d'); g2.drawImage(cnv,0,0,128,64);
  const d=g2.getImageData(0,12,128,40).data;             // ±56° band — clear of winter darkness;
                                                         // missing orbit swaths cross it anyway
  let black=0, n=0;
  for(let i=0;i<d.length;i+=4){ n++; if(d[i]+d[i+1]+d[i+2]<24) black++; }
  return black/n;
}
// stitch the GIBS level-3 equirect mosaic (10×5 tiles of 512px) into the texture.
// The freshest days are often only partially ingested (missing orbit swaths render
// as black) — walk back until a day is ≥94% complete, else keep the best one seen.
function globeTexture(){
  const g=_gbl; if(!g||g.loading||g.texReady) return;
  if(g.nextTexTry && performance.now()<g.nextTexTry) return;   // full ladder failed: back off,
  g.loading=true;                                              // don't restart 50 fetches per frame
  const finish=()=>{
    const b=g.best;
    if(!b){ g.loading=false; g.nextTexTry=performance.now()+30000;
      try{console.warn('globe: mosaic unavailable, retrying in 30 s');}catch(e){} return; }
    const sc=document.createElement('canvas'); sc.width=4096; sc.height=2048;
    sc.getContext('2d').drawImage(b.cnv,0,0,4096,2048);
    const gl=g.gl;
    gl.bindTexture(gl.TEXTURE_2D,g.tex);
    try{ gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,sc);
      g.texReady=true; g.texDate=b.date; SURF.dayOff=Math.max(SURF.dayOff,b.off);
      try{console.log('globe: mosaic ready ·',b.date,'·',(b.frac*100).toFixed(1)+'% gaps');}catch(e){}
    }catch(e){ try{console.warn('globe: texture upload failed',e);}catch(e2){} }
    g.best=null; g.loading=false; V.dirty=true;
  };
  const tryDay=off=>{
    if(off>5){ finish(); return; }
    const date=new Date(Date.now()-off*86400000).toISOString().slice(0,10);
    const cnv=document.createElement('canvas'); cnv.width=5120; cnv.height=2560;
    const c2=cnv.getContext('2d');
    let n=0, failed=false;
    for(let r=0;r<5;r++) for(let c=0;c<10;c++){
      const im=new Image(); im.crossOrigin='anonymous';
      im.onload=()=>{ if(failed) return;
        c2.drawImage(im,c*512,r*512);
        if(++n===50){
          let frac=0;
          try{ frac=mosaicGaps(cnv); }catch(e){}         // sampling failed → just accept the day
          if(!g.best || frac<g.best.frac) g.best={cnv,frac,date,off};
          if(frac>0.06){
            try{console.log('globe: mosaic',date,'is',(frac*100).toFixed(0)+'% black — trying an earlier day');}catch(e){}
            tryDay(off+1); return;
          }
          finish();
        } };
      im.onerror=()=>{ if(!failed){ failed=true; tryDay(off+1); } };
      im.src=`https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/250m/3/${r}/${c}.jpg`;
    }
  };
  tryDay(SURF.dayOff||1);
}
function renderGlobe(px,tex,Mrows,body){                 // shared sphere pass (Earth + planets)
  const g=globeInit(); if(!g) return null;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  const size=Math.max(64,Math.min(2048,Math.ceil(px*2*dpr)));
  if(g.cv.width!==size){ g.cv.width=g.cv.height=size; }
  const gl=g.gl;
  gl.viewport(0,0,size,size);
  gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.useProgram(g.pr);
  gl.bindBuffer(gl.ARRAY_BUFFER,g.vb);
  gl.enableVertexAttribArray(g.aP);
  gl.vertexAttribPointer(g.aP,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.ib);
  gl.uniformMatrix3fv(g.uV,false,rows2col(globeViewRows()));
  gl.uniformMatrix3fv(g.uM,false,rows2col(Mrows));
  let sun=[0,0,1];
  if(body&&body._e){ const w=eclDir(-body._e[0],-body._e[1],-body._e[2]);
    const l=Math.hypot(w[0],w[1],w[2])||1; sun=[w[0]/l,w[1]/l,w[2]/l]; }
  gl.uniform3fv(g.uSun,sun);
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.uniform1i(g.uT,0);
  gl.drawElements(gl.TRIANGLES,g.nIdx,gl.UNSIGNED_SHORT,0);
  return g.cv;
}
export function earthGlobe(px,jd){
  const g=globeInit(); if(!g) return null;
  if(!g.texReady){ globeTexture(); return null; }        // GOES disc until the mosaic is in
  const earth=PLANETS.find(p=>p.n==='Earth');
  return renderGlobe(px,g.tex,globeModelRows(gmstRad(jd)),earth);
}
// planet globes: local equirect maps (Solar System Scope · CC BY 4.0) on the same
// sphere pass — real sun direction, spin from the true rotation period (schematic pole)
export const PTEX={ Moon:['moon',27.322,0.116],
  Mercury:['mercury',58.646,0.001], Venus:['venus',-243.02,3.096],
  Mars:['mars',1.02596,0.4396], Jupiter:['jupiter',0.41354,0.0546],
  Saturn:['saturn',0.44401,0.4665], Uranus:['uranus',-0.71833,1.706],
  Neptune:['neptune',0.67125,0.4943] };                  // [file, rot d, tilt rad]
export function bodyGlobe(b,px,jd){
  const cfg=PTEX[b.n]; if(!cfg) return null;
  const g=globeInit(); if(!g) return null;
  if(!g.pt) g.pt={};
  let t=g.pt[cfg[0]];
  if(!t){ t=g.pt[cfg[0]]={tex:null,ready:false};
    const im=new Image();
    im.onload=()=>{ try{ const gl=g.gl, tx=gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D,tx);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      t.tex=tx; t.ready=true; V.dirty=true; }catch(e){} };
    im.src='data/tex/'+cfg[0]+'.jpg';                    // missing (artifact build) → shaded ball stays
  }
  if(!t.ready) return null;
  const rot=((jd/cfg[1])%1)*6.283185307;
  return renderGlobe(px,t.tex,globeModelRows(rot,cfg[2]),b);
}
// screen point on the globe → geographic lat/lon (for the surface-mode entry)
function globeInverse(u,v){
  const rho=Math.hypot(u,v); if(rho>=1) return null;
  const nv=[u,-v,Math.sqrt(1-rho*rho)];
  const V=globeViewRows(), M=globeModelRows(gmstRad(solarJD()));
  const wrl=[V[0][0]*nv[0]+V[1][0]*nv[1]+V[2][0]*nv[2],   // Vᵀ·nv
             V[0][1]*nv[0]+V[1][1]*nv[1]+V[2][1]*nv[2],
             V[0][2]*nv[0]+V[1][2]*nv[1]+V[2][2]*nv[2]];
  const geo=[M[0][0]*wrl[0]+M[1][0]*wrl[1]+M[2][0]*wrl[2], // Mᵀ·wrl
             M[0][1]*wrl[0]+M[1][1]*wrl[1]+M[2][1]*wrl[2],
             M[0][2]*wrl[0]+M[1][2]*wrl[1]+M[2][2]*wrl[2]];
  return [Math.asin(Math.max(-1,Math.min(1,geo[2])))/D2R, Math.atan2(geo[1],geo[0])/D2R];
}
// ---- surface mode: past full-disk resolution the view descends into a real tile map ----
// NASA GIBS · VIIRS true color (yesterday UTC — the last complete global mosaic),
// web-mercator tiles up to level 9 (~300 m/px). Entry point = where the view centre
// sits on the GOES disc (orthographic inverse from the GOES-East sub-point, 75.2°W).
export const SURF={on:false, lat:20, lon:-75, cache:new Map(), order:[], dayOff:2};   // day-1 is often half-ingested
const SURF_ENTER=0.003, SURF_EXIT=0.0033, GOES_LON=-75.2, RE_PC=2.0646e-10;  // Earth radius in pc

// real scale: descend where the true disc overflows the viewport (~200 km altitude);
// log mode keeps its fixed camZ threshold
function surfEnterZ(){ return S.realScale ? 2*V.foc*RE_PC/(Math.min(W,H)*1.2) : SURF_ENTER; }
// GIBS ingests with 1-2 days lag — start at yesterday, fall back on tile 404s
function surfDate(){ return new Date(Date.now()-SURF.dayOff*86400000).toISOString().slice(0,10); }
function surfMpp(){                                                // m per screen px
  if(S.realScale) return 12742000*S.camZ/(2*V.foc*RE_PC);            // true perspective: disc px ↔ metres
  return 12742000/(8*Math.min(W,H)) * (S.camZ/SURF_ENTER);
}
export function surfUpdate(){
  const enterZ=surfEnterZ();
  if(!SURF.on){
    if(S.camZ<enterZ && V._earthScr){
      const u=(V.cx-V._earthScr.x)/V._earthScr.r, v=(V.cy-V._earthScr.y)/V._earthScr.r;
      const rho=Math.hypot(u,v);
      if(rho<0.985){                                  // view centre is on the disc → descend
        const gi=V._globeOn?globeInverse(u,v):null;
        if(gi){ SURF.lat=gi[0]; SURF.lon=gi[1]; }
        else {                                        // flat GOES disc: orthographic from 75.2°W
          const c=Math.asin(Math.min(1,rho));
          SURF.lat = rho<1e-6 ? 0 : Math.asin(-v*Math.sin(c)/rho)/D2R;
          SURF.lon = GOES_LON + (rho<1e-6 ? 0 : Math.atan2(u*Math.sin(c), rho*Math.cos(c))/D2R);
        }
        SURF.on=true;
      } else { S.camZ=V.tgtCamZ=enterZ; }            // diving beside the planet: hold the floor
    }
  } else if(S.camZ>(S.realScale?enterZ*1.1:SURF_EXIT)){ SURF.on=false; }
  return SURF.on;
}
function surfTile(z,x,y){
  const n=1<<z; x=((x%n)+n)%n;
  if(y<0||y>=n) return null;
  const url=`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${surfDate()}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.jpg`;
  let t=SURF.cache.get(url);
  if(!t){
    t={im:new Image(),ok:false};
    t.im.crossOrigin='anonymous';
    t.im.onload=()=>{ t.ok=true; V.dirty=true; };
    const day=SURF.dayOff;
    t.im.onerror=()=>{                                // mosaic for that day not ingested yet
      if(day===SURF.dayOff && SURF.dayOff<4){
        SURF.dayOff++; SURF.cache.clear(); SURF.order.length=0; V.dirty=true; }
    };
    t.im.src=url;
    SURF.cache.set(url,t); SURF.order.push(url);
    if(SURF.order.length>260){ SURF.cache.delete(SURF.order.shift()); }
  }
  return t.ok?t.im:null;
}
export function drawSurface(){ LBL.prio=P_HUD;
  const mpp=surfMpp(), latR=SURF.lat*D2R;
  const zf=Math.log2(156543.034*Math.cos(latR)/mpp);
  const zt=Math.max(2,Math.min(9,Math.round(zf)));
  const k=Math.pow(2,zf-zt), ts=256*k;                // tile size on screen
  const n=1<<zt;
  const wx=(SURF.lon+180)/360*n;                      // centre in tile units
  const sy=Math.sin(latR);
  const wy=(0.5-Math.log((1+sy)/(1-sy))/(4*Math.PI))*n;
  ctx.fillStyle='#04070f'; ctx.fillRect(0,0,W,H);
  const x0=Math.floor(wx-V.cx/ts), x1=Math.ceil(wx+(W-V.cx)/ts);
  const y0=Math.floor(wy-V.cy/ts), y1=Math.ceil(wy+(H-V.cy)/ts);
  for(let ty=y0;ty<=y1;ty++) for(let tx=x0;tx<=x1;tx++){
    const im=surfTile(zt,tx,ty); if(!im) continue;
    ctx.drawImage(im, V.cx+(tx-wx)*ts, V.cy+(ty-wy)*ts, ts+0.6, ts+0.6);
  }
  ctx.font='10px ui-monospace,monospace';
  ctx.fillStyle='rgba(200,214,240,0.85)';
  ctx.fillText(`Earth surface · ${SURF.lat.toFixed(2)}°, ${SURF.lon.toFixed(2)}° · ${mpp<1000?Math.round(mpp)+' m':(mpp/1000).toFixed(1)+' km'}/px`, 16, H-46);
  ctx.fillStyle='rgba(150,165,195,0.6)';
  ctx.fillText(`NASA GIBS · VIIRS true color · ${surfDate()} — drag to pan · scroll out to leave`, 16, H-32);
  V.dirty=SURF.cache.size<4?true:V.dirty;                 // keep painting while first tiles arrive
}
export function surfPan(dx,dy){
  const mpp=surfMpp(), latR=SURF.lat*D2R;
  SURF.lon-=dx*mpp/(111320*Math.cos(latR));
  SURF.lat+=dy*mpp/110540;
  SURF.lat=Math.max(-84,Math.min(84,SURF.lat));
  SURF.lon=((SURF.lon+540)%360)-180;
  V.dirty=true;
}
