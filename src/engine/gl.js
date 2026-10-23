// WebGL 2 point-cloud renderer with HDR accumulation.
import { count, tfetch } from '../lib/sources.js';
import { labels } from '../lib/stores.js';
import { BND, STARS, starRadius } from './data.js';
import { tNow, tSince } from './motion.js';
import { lensPar } from './mw.js';
import { CLUSTERS, CLU_T, PULSARS } from './sky-data.js';
import { FAC, HYG, solarJD } from './solar-data.js';
import { S, V } from './state.js';
import { SKY_R_PC, activeSurvey, bestTile, chooseOrder, surveyAlpha, tileGrid, uvOf, visibleTiles } from './survey.js';
import { AU_PC, H, KDEC, LOG0, REALK, W, camDist, ctr, exactPx, invScale, scale } from './view.js';
export let glOK=false, GL=null, glcv=null;
let progF=null, progU=null, progT=null, progS=null;   // float layout · raw-byte layout · tonemap · sky tiles
let hdrOK=false, hdrFB=null, hdrTex=null, glMaxPt=64;
export let glBuf=null, glBufH=null, glBufP=null, glBufC=null;   // float-layout VAO handles {vao,n}
const CL={G:null,B:null,W:null,Q:null,O:null,V:null};    // raw-byte cloud handles {vao,n,key}
export let gaiaRaw=null, gaiaPm=null, gaiaRange=100, webRaw=null, qsoRaw=null, beltRaw=null, obRaw=null, varRaw=null, beltEpoch=0;
// ---- WebGL star-field renderer (GPU point cloud; auto-falls back to Canvas 2D) ----
// ---- WebGL 2 renderer: two vertex layouts share one logical point shader ----
//  · float layout (40 B/vtx): HYG stars, exoplanet hosts, pulsars, clusters
//  · raw layout (8 B/vtx): the binary catalogues (Gaia, belt, 2MRS, quasars, …)
//    upload their records byte-for-byte and are decoded in the vertex shader
const GL_UNI=`
uniform float u_yaw,u_pitch,u_camZ,u_foc,u_dpr,u_LOG0,u_KDEC,u_REALK,u_cull,u_minPx,u_alphaK,u_maxPt,u_fovK,u_roll,u_sky;
uniform vec3 u_ctr; uniform vec2 u_res; uniform bool u_real;
uniform vec4 u_lens; uniform float u_lensOn;   // xy: lens device px · z: Einstein radius px · w: lens depth
out vec3 v_color; out float v_alpha;
float scl(float pc){ if(u_real) return pc*u_REALK; return max(0.0,(log(pc)/2.302585093 - u_LOG0)*u_KDEC); }
`;
function glTail(host){ return `
  float R=scl(dist);
  vec3 p=dir*R - u_ctr;
  float c=cos(u_yaw), sy=sin(u_yaw);
  float x1=p.x*c + p.z*sy;
  float z1=-p.x*sy + p.z*c;
  float y1=p.y;
  float cp=cos(u_pitch), sp=sin(u_pitch);
  float y2=y1*cp - z1*sp;
  float z2=y1*sp + z1*cp;
  float depth=u_camZ - z2;
  float cr=cos(u_roll), sr=sin(u_roll);
  float x3=x1*cr - y2*sr, y3=x1*sr + y2*cr;
  // Size and fade work on the depth RELATIVE to the framing distance (3.2 at the
  // centre of the view), as the 2D glyphs do. In real scale an absolute depth in
  // parsec made every far cloud sub-pixel: the cosmic web was culled wholesale.
  float dz = u_real ? depth/u_camZ*3.2 : depth;
  float focCss=u_foc/u_dpr;
  // sky view: brightness as seen from the vantage — the Sun's sky is the catalogue's,
  // from another star the distance modulus shifts every magnitude
  float mgV = u_sky>0.5 ? mg + 5.0*log(max(length(p),1e-9)/max(R,1e-9))/2.302585 : mg;
  float bright=max(0.0, 6.8 - mgV);
  float sizeCss;
  ${host?`if(u_hostMode>0.5) sizeCss=min(20.0, max(0.7, focCss*0.0075/dz*rs));
  else `:''}sizeCss=clamp((0.4+bright*0.34)*focCss*0.0032/dz, 0.0, 3.6);
  // sky view: the camera sits at the Sun, so size follows apparent magnitude alone
  if(u_sky>0.5) sizeCss=${host?'u_hostMode>0.5 ? 1.8 : ':''}clamp(0.5+bright*0.42, 0.0, 4.5)*(1.0+0.1*log2(u_fovK));
  float nearP=u_real?u_camZ*0.02:0.05; if(depth<=nearP || sizeCss<u_cull){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
  float px=max(sizeCss, u_minPx);
  ${host?`if(u_glow>0.5){
    if(mg>2.6){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    px=min(sizeCss*6.0, 26.0);                           // soft halo for the brightest stars
  }`:''}
  float dvx=u_res.x*0.5 + u_foc*u_fovK*x3/depth;
  float dvy=u_res.y*0.5 - u_foc*u_fovK*y3/depth;
  if(u_lensOn>0.5 && depth>u_lens.w){            // gravitational lens: sources behind
    vec2 lv=vec2(dvx,dvy)-u_lens.xy;             // Sgr A* deflect outward (point-mass
    float lr=max(length(lv),1e-3);               // lens equation, exaggerated scale)
    float lm=0.5*(lr+sqrt(lr*lr+4.0*u_lens.z*u_lens.z))/lr;
    dvx=u_lens.x+lv.x*lm; dvy=u_lens.y+lv.y*lm;
  }
  gl_Position=vec4(dvx/u_res.x*2.0-1.0, 1.0-dvy/u_res.y*2.0, 0.0, 1.0);
  gl_PointSize=min(px*u_dpr, u_maxPt);
  v_color=col;
  ${host?`if(u_hostMode>0.5){
    float av=u_sky>0.5 ? 0.9 : clamp(1.9-dz*0.55, 0.12, 1.0);
    if(u_veil>0.5 && dist>u_bnd){                        // red veil beyond the charted edge
      float t=min(1.0,(dist-u_bnd)/(u_bnd*1.6));
      v_color=mix(v_color, vec3(0.9098,0.2275,0.1961), t*0.85); av*=(1.0-t*0.4);
    }
    if(a_pm.y>0.5 && abs(a_pm.y-u_year)<0.5){ v_color=vec3(0.3098,0.8392,0.7843); av=1.0; }
    v_alpha=av;
  } else {`:'{'}
    float fade=u_sky>0.5 ? 1.0 : clamp(1.9-dz*0.4, 0.22, 1.0);
    v_alpha=clamp((0.28+bright*0.12)*fade, 0.0, 1.0);
    if(u_minPx>0.0) v_alpha=max(v_alpha, 0.17);          // Gaia: keep faint dwarfs visible
  }
  ${host?`if(u_glow>0.5) v_alpha*=0.05;`:''}
  v_alpha*=u_alphaK;
`;}
const GL_VSF=`#version 300 es
precision highp float;
in vec3 a_dir; in float a_dist; in float a_mag; in vec3 a_color; in vec2 a_pm; in vec3 a_vel;
${GL_UNI}
uniform float u_pmYears,u_hostMode,u_year,u_facColor,u_sizeOn,u_veil,u_bnd,u_glow;
uniform float u_facVis[8]; uniform vec3 u_pal[8];
void main(){
  vec3 dir=a_dir; float distM=a_dist;
  if(u_pmYears!=0.0){                                    // straight-line 3D motion, pc/yr
    vec3 pos=a_dir*a_dist + a_vel*u_pmYears;
    distM=max(1e-6, length(pos)); dir=pos/distM;
  }
  vec3 col=a_color; float rs=1.0;
  if(u_hostMode>0.5){
    float fy=a_pm.y;                                     // discovery-year filter on the GPU
    if(fy>u_year+0.5 && fy>0.5){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    int ci=int(a_pm.x+0.5);                              // facility category
    if(u_facVis[ci]<0.5){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    if(u_facColor>0.5) col=u_pal[ci];
    if(u_sizeOn>0.5) rs=a_mag;                           // a_mag carries radiusScale for hosts
  }
  float dist=distM, mg=a_mag;
  ${glTail(true)}
}`;
const GL_VSU=`#version 300 es
precision highp float;
in uvec4 a_rec;                                          // one raw 8-byte catalogue record
in ivec2 a_pm;                                           // Gaia only: pmRA*, pmDec in mas/yr (0 elsewhere)
${GL_UNI}
uniform float u_decDist,u_colMode,u_isBelt,u_beltDt,u_hasPm,u_pmYearsU;
uniform vec2 u_decMag; uniform vec3 u_colFix; uniform vec3 u_decPal[4];
vec3 gaiaCol(float bprp){                                // bp_rp -> Teff (Ballesteros) -> colour
  float t=4600.0*(1.0/(0.92*bprp+1.7)+1.0/(0.92*bprp+0.62));
  if(t>=30000.0) return vec3(0.608,0.690,1.0);
  if(t>=10000.0) return vec3(0.667,0.749,1.0);
  if(t>=7500.0)  return vec3(0.792,0.843,1.0);
  if(t>=6000.0)  return vec3(0.973,0.969,1.0);
  if(t>=5200.0)  return vec3(1.0,0.957,0.910);
  if(t>=3700.0)  return vec3(1.0,0.824,0.631);
  return vec3(1.0,0.710,0.424);
}
void main(){
  float D2R=0.017453292519943295;
  float rr=float(a_rec.x)*(360.0/65535.0)*D2R;
  float dr=(float(a_rec.y)*(180.0/65535.0)-90.0)*D2R;
  float u=float(a_rec.z)*(1.0/65535.0);
  float b6=float(a_rec.w & 255u), b7=float(a_rec.w >> 8);
  float cd=cos(dr);
  vec3 dir=vec3(cd*cos(rr), cd*sin(rr), sin(dr));
  if(u_hasPm>0.5 && u_pmYearsU!=0.0){                     // proper motion along a great circle
    float k=u_pmYearsU*4.84813681e-9;                    // mas → rad, times years
    vec3 e=vec3(-sin(rr), cos(rr), 0.0), nn=vec3(-sin(dr)*cos(rr), -sin(dr)*sin(rr), cd);
    vec3 m=e*(float(a_pm.x)*k) + nn*(float(a_pm.y)*k);
    float th=length(m); if(th>1e-12) dir=normalize(dir*cos(th) + (m/th)*sin(th));
  }
  float dist=u*u_decDist;
  float mg=(b6/255.0)*u_decMag.x + u_decMag.y;
  vec3 col = u_colMode<0.5 ? u_colFix
           : u_colMode<1.5 ? gaiaCol((b7/255.0)*6.0-1.0)
           : u_decPal[int(min(b7,3.0))];
  if(u_isBelt>0.5 && u_beltDt!=0.0){
    // approximate Kepler drift: circular mean motion at the body's heliocentric distance
    float rAU=max(0.05, dist/0.0000048481368);
    float ang=0.0172021242/pow(rAU,1.5)*u_beltDt;
    float ca=cos(ang), sa=sin(ang);
    vec3 k=vec3(0.0,-0.39777716,0.91748206);                      // the ecliptic pole in the equatorial world
    dir=dir*ca + cross(k,dir)*sa + k*dot(k,dir)*(1.0-ca);           // Rodrigues: rotate about the pole
  }
  ${glTail(false)}
}`;
const GL_FSP=`#version 300 es
precision mediump float;
in vec3 v_color; in float v_alpha;
out vec4 o;
void main(){
  float r=length(gl_PointCoord-vec2(0.5));
  if(r>0.5) discard;
  float a=v_alpha*smoothstep(0.5,0.12,r);
  o=vec4(v_color*a, a);                                  // premultiplied additive (ONE, ONE)
}`;
const TM_VS=`#version 300 es
void main(){                                             // fullscreen triangle from gl_VertexID
  vec2 p=vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  gl_Position=vec4(p*2.0-1.0, 0.0, 1.0);
}`;
const TM_FS=`#version 300 es
precision mediump float;
uniform sampler2D u_tex; out vec4 o;
void main(){                                             // soft shoulder above 0.55: dense star
  vec3 x=texelFetch(u_tex, ivec2(gl_FragCoord.xy), 0).rgb;   // fields roll off instead of clipping
  vec3 hi=vec3(0.55) + 0.45*(1.0-exp(-(x-vec3(0.55))/0.45));
  o=vec4(mix(x, hi, step(vec3(0.55), x)), 1.0);
}`;
function glCompile(gl,type,src){ const sh=gl.createShader(type); gl.shaderSource(sh,src); gl.compileShader(sh);
  if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){ try{console.error('shader:',gl.getShaderInfoLog(sh));}catch(_){} return null; } return sh; }
function mkProg(gl,vsSrc,fsSrc){
  const vs=glCompile(gl,gl.VERTEX_SHADER,vsSrc), fs=glCompile(gl,gl.FRAGMENT_SHADER,fsSrc);
  if(!vs||!fs) return null;
  const p=gl.createProgram(); gl.attachShader(p,vs); gl.attachShader(p,fs); gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){ try{console.error('link:',gl.getProgramInfoLog(p));}catch(_){} return null; }
  const o={p,loc:{},attr:{}};
  const nu=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<nu;i++){ const u=gl.getActiveUniform(p,i);
    o.loc[u.name.replace(/\[0\]$/,'')]=gl.getUniformLocation(p,u.name); }
  const na=gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);
  for(let i=0;i<na;i++){ const a=gl.getActiveAttrib(p,i); o.attr[a.name]=gl.getAttribLocation(p,a.name); }
  return o;
}
function mkFloatVAO(gl,arr){                             // 52-byte-stride float layout
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const A=progF.attr;
  gl.enableVertexAttribArray(A.a_dir);   gl.vertexAttribPointer(A.a_dir,3,gl.FLOAT,false,52,0);
  gl.enableVertexAttribArray(A.a_dist);  gl.vertexAttribPointer(A.a_dist,1,gl.FLOAT,false,52,12);
  gl.enableVertexAttribArray(A.a_mag);   gl.vertexAttribPointer(A.a_mag,1,gl.FLOAT,false,52,16);
  gl.enableVertexAttribArray(A.a_color); gl.vertexAttribPointer(A.a_color,3,gl.FLOAT,false,52,20);
  gl.enableVertexAttribArray(A.a_pm);    gl.vertexAttribPointer(A.a_pm,2,gl.FLOAT,false,52,32);
  gl.enableVertexAttribArray(A.a_vel);   gl.vertexAttribPointer(A.a_vel,3,gl.FLOAT,false,52,40);
  gl.bindVertexArray(null);
  return {vao, n:arr.length/13};
}
export function initGL(){
  try{
    glcv=document.getElementById('gl'); if(!glcv) return;
    const gl=glcv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,
      powerPreference:'high-performance'});
    if(!gl) return;                                      // no WebGL 2 -> Canvas-2D star renderer
    GL=gl;
    if(!glcv.__loss){ glcv.__loss=1;                     // recover from GPU resets / evicted contexts
      glcv.addEventListener('webglcontextlost',e=>{ e.preventDefault(); glOK=false; V.dirty=true; });
      glcv.addEventListener('webglcontextrestored',()=>{ initGL(); glRestoreClouds(); V.dirty=true; });
    }
    progF=mkProg(gl,GL_VSF,GL_FSP); progU=mkProg(gl,GL_VSU,GL_FSP); progT=mkProg(gl,TM_VS,TM_FS);
    progS=mkProg(gl,SK_VS,SK_FS); skyBuf=gl.createBuffer();
    if(!progF||!progU) return;
    glMaxPt=(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)||[1,64])[1]||64;
    // HDR accumulation: star fields add up in half-float and get tonemapped, so
    // dense cores saturate softly instead of clipping to flat white
    hdrOK=false;
    if(progT && gl.getExtension('EXT_color_buffer_float')){
      hdrTex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,hdrTex);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,4,4,0,gl.RGBA,gl.HALF_FLOAT,null);
      hdrFB=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,hdrFB);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,hdrTex,0);
      hdrOK=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      if(progT.loc.u_tex){ gl.useProgram(progT.p); gl.uniform1i(progT.loc.u_tex,0); }
    }
    // HYG stars (float layout)
    const arr=new Float32Array(HYG.length*13);
    for(let i=0;i<HYG.length;i++){ const st=HYG[i],o=i*13, v=st._v||[0,0,0];
      arr[o]=st.dx;arr[o+1]=st.dy;arr[o+2]=st.dz;arr[o+3]=st.d;arr[o+4]=st.m;
      arr[o+5]=st.c[0]/255;arr[o+6]=st.c[1]/255;arr[o+7]=st.c[2]/255;arr[o+8]=st.pr||0;arr[o+9]=st.pd||0;
      arr[o+10]=v[0];arr[o+11]=v[1];arr[o+12]=v[2]; }
    glBuf=mkFloatVAO(gl,arr);
    // exoplanet hosts — year filter & facility colours run in the shader
    const FACIDX={kepler:0,tess:1,k2:2,rv:3,micro:4,imaging:5,ground:6,other:7};
    const ha=new Float32Array(STARS.length*13);
    for(let i=0;i<STARS.length;i++){ const st2=STARS[i],o=i*13, v2=st2._v||[0,0,0];
      ha[o+10]=v2[0]; ha[o+11]=v2[1]; ha[o+12]=v2[2];
      const sr2=st2._sr!==undefined?st2._sr:starRadius(st2);
      ha[o]=st2._dx; ha[o+1]=st2._dy; ha[o+2]=st2._dz; ha[o+3]=st2._r;
      ha[o+4]=sr2?Math.max(0.30,Math.min(4.2,Math.pow(sr2,0.7))):1;   // same curve as radiusScale()
      ha[o+5]=st2._col[0]/255; ha[o+6]=st2._col[1]/255; ha[o+7]=st2._col[2]/255;
      ha[o+8]=FACIDX[st2.fac]!==undefined?FACIDX[st2.fac]:7; ha[o+9]=st2.fy||0; }
    glBufH=mkFloatVAO(gl,ha);
    // pulsars & open clusters as simple GPU point clouds
    const mkPts=(list,mag,cFn)=>{ const a2=new Float32Array(list.length*13);
      for(let i=0;i<list.length;i++){ const q=list[i],o=i*13,c=cFn(q);
        a2[o]=q._dir[0]; a2[o+1]=q._dir[1]; a2[o+2]=q._dir[2]; a2[o+3]=q.d; a2[o+4]=mag;
        a2[o+5]=c[0]/255; a2[o+6]=c[1]/255; a2[o+7]=c[2]/255; a2[o+8]=0; a2[o+9]=0; }
      return mkFloatVAO(gl,a2); };
    glBufP=mkPts(PULSARS,4.6,()=>[150,220,255]);
    glBufC=mkPts(CLUSTERS,4.2,q=>CLU_T[q.ct||0].c);
    gl.useProgram(progF.p);
    const pal=[]; for(const k of ['kepler','tess','k2','rv','micro','imaging','ground','other']){ const c3=FAC[k].c; pal.push(c3[0]/255,c3[1]/255,c3[2]/255); }
    gl.uniform3fv(progF.loc.u_pal,pal);
    gl.clearColor(0,0,0,1);                            // space is black, not navy
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE);    // premultiplied additive
    glOK=true; glResize();
  }catch(e){ glOK=false; }
}
export function glResize(){
  if(!glOK||!glcv) return;
  const raw=devicePixelRatio||1, px=(exactPx&&raw<=2.02)?exactPx:null;
  glcv.width=px?px[0]:Math.round(W*Math.min(raw,2));
  glcv.height=px?px[1]:Math.round(H*Math.min(raw,2));
  glcv.style.width=W+'px'; glcv.style.height=H+'px';
  V.GLDPR=glcv.width/W;
  GL.viewport(0,0,glcv.width,glcv.height);
  if(hdrOK){ GL.bindTexture(GL.TEXTURE_2D,hdrTex);      // resize the HDR target with the canvas
    GL.texImage2D(GL.TEXTURE_2D,0,GL.RGBA16F,glcv.width,glcv.height,0,GL.RGBA,GL.HALF_FLOAT,null); }
  V.dirty=true;
}
export function glClearCanvas(){ if(!glOK) return;             // GPU layer off -> blank the GL canvas
  GL.bindFramebuffer(GL.FRAMEBUFFER,null); GL.clear(GL.COLOR_BUFFER_BIT); }
export function glStars(){ return glOK && S.gpu; }
// ---- binary catalogue layers: raw 8-byte records, decoded in the vertex shader ----
const BELT_COL=[[176,166,148],[160,148,172],[255,150,120],[140,172,224]];  // MBA·Trojan·NEO·TNO
const VAR_COL=[[255,214,120],[200,160,255]];                               // Cepheid gold · RR Lyrae violet
const CLOUD_DEC={                    // dist: pc per unit u16 · mag: [scale,offset] on byte 6 ·
  gaia:   {dist:100,            mag:[28,-2],   mode:1},                    // mode: 0 fixed colour,
  gaiabig:{dist:150,            mag:[28,-2],   mode:1},                    // 1 gaiaCol(byte 7),
  belt:   {dist:120*4.84814e-6, mag:[0,5.6],   mode:2, pal:BELT_COL, belt:1}, // 2 palette[byte 7]
  vars:   {dist:20000,          mag:[0,5.0],   mode:2, pal:VAR_COL},
  ob:     {dist:4000,           mag:[0,5.2],   mode:0, fix:[168,205,255]},
  web:    {dist:600e6,          mag:[16,-5.2], mode:0, fix:[190,200,228]},
  qso:    {dist:13000e6,        mag:[0,5.0],   mode:0, fix:[212,150,255]},
};
function buildCloudBuf(bytes,key){   // raw bytes -> GPU verbatim (uvec4 attribute, stride 8)
  if(!glOK||!bytes||bytes.length<8) return null;
  const gl=GL, n=(bytes.length/8)|0;
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,bytes,gl.STATIC_DRAW);
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const a=progU.attr.a_rec;
  gl.enableVertexAttribArray(a); gl.vertexAttribIPointer(a,4,gl.UNSIGNED_SHORT,8,0);
  gl.bindVertexArray(null);
  V.dirty=true; return {vao,n,key};
}
function cloudLabel(id,txt){ labels.update(m => ({ ...m, [id]: txt })); }
function buildGaia(bytes){ const r=buildCloudBuf(bytes,'gaia'); if(!r) return; count('file-gaia', r.n);
  CL.G=r; gaiaRaw=bytes; gaiaRange=100; attachGaiaPm();
  cloudLabel('t-gaia','Gaia stars ('+(r.n>=1000?((r.n/1000)|0)+'k':r.n)+' <100 pc)'); }
// gaia_pm.bin: int16 pmRA*, pmDec per star in gaia.bin's order — a second attribute on its VAO
function attachGaiaPm(){
  if(!glOK||!CL.G||!gaiaPm||CL.G.pm) return;
  const gl=GL, a=progU.attr.a_pm; if(a===undefined||a<0) return;
  if((gaiaPm.length/4|0)!==CL.G.n) return;                                // the side file belongs to one catalogue: same count, same order
  gl.bindVertexArray(CL.G.vao);
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.bufferData(gl.ARRAY_BUFFER,gaiaPm,gl.STATIC_DRAW);
  gl.enableVertexAttribArray(a); gl.vertexAttribIPointer(a,2,gl.SHORT,4,0);
  gl.bindVertexArray(null); gl.bindBuffer(gl.ARRAY_BUFFER,null);
  CL.G.pm=true; V.dirty=true;
}
function buildGaiaBig(bytes){ const r=buildCloudBuf(bytes,'gaiabig'); if(!r) return; count('file-gaiabig', r.n);
  CL.G=r; gaiaRaw=bytes; gaiaRange=150;
  cloudLabel('t-gaia','Gaia stars ('+(r.n/1e6).toFixed(1)+'M <150 pc)'); }
function buildBelt(bytes){
  if(!bytes||bytes.length<16) return;
  beltEpoch=new DataView(bytes.buffer,bytes.byteOffset,8).getFloat64(0,true)||0;
  bytes=bytes.subarray(8);
  const r=buildCloudBuf(bytes,'belt'); if(!r) return; count('file-belt', r.n);
  CL.B=r; beltRaw=bytes;
  cloudLabel('t-belt','Asteroid field ('+((r.n/1000)|0)+'k)'); }
function buildVars(bytes){ const r=buildCloudBuf(bytes,'vars'); if(!r) return; count('file-variables', r.n); CL.V=r; varRaw=bytes;
  cloudLabel('t-var','Variable stars ('+((r.n/1000)|0)+'k Cepheids·RR Lyr)'); }
function buildOB(bytes){ const r=buildCloudBuf(bytes,'ob'); if(!r) return; count('file-obstars', r.n); CL.O=r; obRaw=bytes;
  cloudLabel('t-ob','OB stars ('+((r.n/1000)|0)+'k arm tracers)'); }
function buildWeb(bytes){ const r=buildCloudBuf(bytes,'web'); if(!r) return; count('file-cosmicweb', r.n); CL.W=r; webRaw=bytes;
  cloudLabel('t-web','Cosmic web ('+((r.n/1000)|0)+'k galaxies)'); }
function buildQso(bytes){ if(bytes && CL.Q && (bytes.length/8)<=CL.Q.n) return;
  const r=buildCloudBuf(bytes,'qso'); if(!r) return; count('file-quasars', r.n); CL.Q=r; qsoRaw=bytes;
  cloudLabel('t-qso','Quasars ('+((r.n/1000)|0)+'k)'); }
function glRestoreClouds(){          // re-upload retained raw bytes after a context restore
  if(!glOK) return;
  if(gaiaRaw){ const r=buildCloudBuf(gaiaRaw,gaiaRange>100?'gaiabig':'gaia'); if(r){ CL.G=r; attachGaiaPm(); } }
  if(beltRaw){ const r=buildCloudBuf(beltRaw,'belt'); if(r) CL.B=r; }
  if(webRaw){ const r=buildCloudBuf(webRaw,'web'); if(r) CL.W=r; }
  if(qsoRaw){ const r=buildCloudBuf(qsoRaw,'qso'); if(r) CL.Q=r; }
  if(obRaw){ const r=buildCloudBuf(obRaw,'ob'); if(r) CL.O=r; }
  if(varRaw){ const r=buildCloudBuf(varRaw,'vars'); if(r) CL.V=r; }
}
export function loadExtragal(){
  if(!glOK) return;
  try{
    if(typeof window.__WEB_B64__==='string' && window.__WEB_B64__.length){ buildWeb(b64ToBytes(window.__WEB_B64__)); window.__WEB_B64__=null; }
    else tfetch('file-cosmicweb',{name:'cosmicweb.bin',group:'catalogue'},'data/cosmicweb.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildWeb(new Uint8Array(a)); }).catch(()=>{});
    if(typeof window.__QSO_B64__==='string' && window.__QSO_B64__.length){ buildQso(b64ToBytes(window.__QSO_B64__)); window.__QSO_B64__=null; }
    else tfetch('file-quasars',{name:'quasars.bin',group:'catalogue'},'data/quasars.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildQso(new Uint8Array(a)); }).catch(()=>{});
    tfetch('file-quasarsbig',{name:'quasarsbig.bin',group:'catalogue',optional:true},'data/quasarsbig.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildQso(new Uint8Array(a)); }).catch(()=>{});
    if(typeof window.__BELT_B64__==='string' && window.__BELT_B64__.length){ buildBelt(b64ToBytes(window.__BELT_B64__)); window.__BELT_B64__=null; }
    else tfetch('file-belt',{name:'belt.bin',group:'catalogue'},'data/belt.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildBelt(new Uint8Array(a)); }).catch(()=>{});
    tfetch('file-gaiabig',{name:'gaiabig.bin',group:'catalogue',optional:true},'data/gaiabig.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a){ buildGaiaBig(new Uint8Array(a));
      tfetch('file-gaiabig_pm',{name:'gaiabig_pm.bin',group:'catalogue',optional:true},'data/gaiabig_pm.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null).then(p=>{ if(p){ gaiaPm=new Uint8Array(p); if(CL.G) CL.G.pm=false; attachGaiaPm(); } }).catch(()=>{}); } }).catch(()=>{});
    if(typeof window.__OB_B64__==='string' && window.__OB_B64__.length){ buildOB(b64ToBytes(window.__OB_B64__)); window.__OB_B64__=null; }
    else tfetch('file-obstars',{name:'obstars.bin',group:'catalogue'},'data/obstars.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildOB(new Uint8Array(a)); }).catch(()=>{});
    if(typeof window.__VAR_B64__==='string' && window.__VAR_B64__.length){ buildVars(b64ToBytes(window.__VAR_B64__)); window.__VAR_B64__=null; }
    else tfetch('file-variables',{name:'variables.bin',group:'catalogue'},'data/variables.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildVars(new Uint8Array(a)); }).catch(()=>{});
  }catch(e){}
}
function b64ToBytes(b64){ const bin=atob(b64), len=bin.length, u=new Uint8Array(len);
  for(let i=0;i<len;i++) u[i]=bin.charCodeAt(i); return u; }
export function loadGaia(){
  if(!glOK) return;
  try{
    if(typeof window.__GAIA_B64__==='string' && window.__GAIA_B64__.length){
      buildGaia(b64ToBytes(window.__GAIA_B64__)); window.__GAIA_B64__=null; return; }
    tfetch('file-gaia',{name:'gaia.bin',group:'catalogue'},'data/gaia.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null)
      .then(a=>{ if(a) buildGaia(new Uint8Array(a)); }).catch(()=>{});
    tfetch('file-gaia_pm',{name:'gaia_pm.bin',group:'catalogue',optional:true},'data/gaia_pm.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null)
      .then(a=>{ if(a&&(!gaiaPm||gaiaRange===100)){ gaiaPm=new Uint8Array(a); attachGaiaPm(); } }).catch(()=>{});
  }catch(e){}
}
function glShared(L){                // per-frame camera/scale uniforms, per program
  const gl=GL, foc=Math.min(W,H)*0.62;
  gl.uniform1f(L.u_yaw,S.yaw); gl.uniform1f(L.u_pitch,S.pitch); gl.uniform1f(L.u_camZ,S.camZ);
  gl.uniform1f(L.u_foc,foc*V.GLDPR); gl.uniform1f(L.u_dpr,V.GLDPR); gl.uniform1f(L.u_fovK,V.fovK);
  gl.uniform1f(L.u_roll,V.roll); gl.uniform1f(L.u_sky,S.skyMode?1:0);
  gl.uniform1f(L.u_LOG0,LOG0); gl.uniform1f(L.u_KDEC,KDEC); gl.uniform1f(L.u_REALK,REALK);
  gl.uniform3f(L.u_ctr,ctr.x,ctr.y,ctr.z);
  gl.uniform2f(L.u_res,glcv.width,glcv.height);
  gl.uniform1i(L.u_real,S.realScale?1:0);
  gl.uniform1f(L.u_maxPt,glMaxPt); gl.uniform1f(L.u_alphaK,1);
  if(lensPar && L.u_lensOn){ gl.uniform1f(L.u_lensOn,1);
    gl.uniform4f(L.u_lens, lensPar.x*V.GLDPR, lensPar.y*V.GLDPR, lensPar.e*V.GLDPR, lensPar.depth); }
  else if(L.u_lensOn) gl.uniform1f(L.u_lensOn,0);
}
function drawCloud(h,cull,minPx,alphaK,beltDt){
  const gl=GL, L=progU.loc, d=CLOUD_DEC[h.key];
  const tune=window.__ku&&window.__ku.tune&&window.__ku.tune[h.key];   // live tuning hook (verify harness)
  if(tune){ if(tune.a!==undefined) alphaK=tune.a; if(tune.px!==undefined) minPx=tune.px; }
  gl.uniform1f(L.u_cull,cull); gl.uniform1f(L.u_minPx,minPx); gl.uniform1f(L.u_alphaK,alphaK||1);
  gl.uniform1f(L.u_decDist,d.dist); gl.uniform2f(L.u_decMag,d.mag[0],d.mag[1]);
  gl.uniform1f(L.u_colMode,d.mode);
  if(d.fix) gl.uniform3f(L.u_colFix,d.fix[0]/255,d.fix[1]/255,d.fix[2]/255);
  if(d.pal){ const pa=[]; for(let i=0;i<4;i++){ const c=d.pal[i]||d.pal[0]; pa.push(c[0]/255,c[1]/255,c[2]/255); }
    gl.uniform3fv(L.u_decPal,pa); }
  gl.uniform1f(L.u_isBelt,d.belt?1:0); gl.uniform1f(L.u_beltDt,d.belt?(beltDt||0):0);
  gl.uniform1f(L.u_hasPm,h.pm?1:0);
  gl.bindVertexArray(h.vao); gl.drawArrays(gl.POINTS,0,h.n);
}

// ---- sky-survey tiles: textured HEALPix cells on a far sphere --------------------
const SK_VS=`#version 300 es
precision highp float;
in vec3 a_dir; in vec2 a_uv;
uniform float u_yaw,u_pitch,u_camZ,u_foc,u_fovK,u_roll,u_R; uniform vec3 u_ctr; uniform vec2 u_res;
out vec2 v_uv;
void main(){
  vec3 p=a_dir*u_R - u_ctr;
  float c=cos(u_yaw), sy=sin(u_yaw);
  float x1=p.x*c + p.z*sy, z1=-p.x*sy + p.z*c, y1=p.y;
  float cp=cos(u_pitch), sp=sin(u_pitch);
  float y2=y1*cp - z1*sp, z2=y1*sp + z1*cp;
  float depth=max(1e-9, u_camZ - z2);
  float cr=cos(u_roll), sr=sin(u_roll);
  float x3=x1*cr - y2*sr, y3=x1*sr + y2*cr;
  float dvx=u_res.x*0.5 + u_foc*u_fovK*x3/depth, dvy=u_res.y*0.5 - u_foc*u_fovK*y3/depth;
  gl_Position=vec4(dvx/u_res.x*2.0-1.0, 1.0-dvy/u_res.y*2.0, 0.0, 1.0);
  v_uv=a_uv;
}`;
const SK_FS=`#version 300 es
precision highp float;
in vec2 v_uv; uniform sampler2D u_tex; uniform float u_alpha, u_inv; out vec4 o;
void main(){
  vec3 c=texture(u_tex, v_uv).rgb*u_alpha;
  // the HDR pass rolls values above 0.55 off; pre-invert so the image comes out as it is
  if(u_inv>0.5){ vec3 t=clamp((c-0.55)/0.45, 0.0, 0.995); c=mix(c, 0.55-0.45*log(1.0-t), step(0.55, c)); }
  o=vec4(c,1.0);
}`;
let skyBuf=null;
const SKY_N=4;                                           // grid per tile → 32 triangles
function tileTexture(gl,t){
  if(t.tex) return t.tex;
  const tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,t.img);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  t.tex=tex; t.gl=gl; return tex;
}
function drawSurveyTiles(){
  const sv=activeSurvey(), a=surveyAlpha(); if(!sv||a<=0.01||!progS) return;
  const gl=GL, L=progS.loc, A=progS.attr;
  const order=chooseOrder(sv), tiles=visibleTiles(order);
  gl.useProgram(progS.p); gl.disable(gl.BLEND);
  gl.uniform1f(L.u_yaw,S.yaw); gl.uniform1f(L.u_pitch,S.pitch); gl.uniform1f(L.u_camZ,S.camZ);
  gl.uniform1f(L.u_foc,Math.min(W,H)*0.62*V.GLDPR); gl.uniform1f(L.u_fovK,V.fovK); gl.uniform1f(L.u_roll,V.roll);
  gl.uniform1f(L.u_R,scale(SKY_R_PC)); gl.uniform3f(L.u_ctr,ctr.x,ctr.y,ctr.z); gl.uniform2f(L.u_res,glcv.width,glcv.height);
  gl.uniform1f(L.u_alpha,a); gl.uniform1f(L.u_inv,hdrOK?1:0); gl.uniform1i(L.u_tex,0);
  gl.bindBuffer(gl.ARRAY_BUFFER,skyBuf);
  gl.enableVertexAttribArray(A.a_dir); gl.vertexAttribPointer(A.a_dir,3,gl.FLOAT,false,20,0);
  gl.enableVertexAttribArray(A.a_uv);  gl.vertexAttribPointer(A.a_uv,2,gl.FLOAT,false,20,12);
  const N=SKY_N, verts=new Float32Array((N+1)*(N+1)*5), idx=[];
  for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const k=j*(N+1)+i; idx.push(k,k+1,k+N+1, k+1,k+N+2,k+N+1); }
  const ib=new Uint16Array(idx); const ibuf=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ibuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,ib,gl.STREAM_DRAW);
  let drawn=0;
  for(const pix of tiles){
    const best=bestTile(sv,order,pix); if(!best) continue;
    const dirs=tileGrid(order,pix,N);
    for(let j=0;j<=N;j++) for(let i=0;i<=N;i++){ const k=j*(N+1)+i, d=dirs[k], o=k*5;
      const uv=uvOf(best.u0+i/N*best.size, best.v0+j/N*best.size);   // cell → ancestor cell → image
      verts[o]=d[0]; verts[o+1]=d[1]; verts[o+2]=d[2]; verts[o+3]=uv[0]; verts[o+4]=uv[1]; }
    gl.bufferData(gl.ARRAY_BUFFER,verts,gl.STREAM_DRAW);
    gl.bindTexture(gl.TEXTURE_2D,tileTexture(gl,best.t));
    gl.drawElements(gl.TRIANGLES,ib.length,gl.UNSIGNED_SHORT,0); drawn++;
  }
  gl.deleteBuffer(ibuf);
  gl.disableVertexAttribArray(A.a_dir); gl.disableVertexAttribArray(A.a_uv);
  gl.bindBuffer(gl.ARRAY_BUFFER,null); gl.enable(gl.BLEND);
  SKYSTAT.order=order; SKYSTAT.tiles=tiles.length; SKYSTAT.drawn=drawn;
}
export const SKYSTAT={order:0,tiles:0,drawn:0};
export function glClearColor(){ return GL?Array.from(GL.getParameter(GL.COLOR_CLEAR_VALUE)):null; }

export function glRender(){
  const gl=GL;
  if(hdrOK) gl.bindFramebuffer(gl.FRAMEBUFFER,hdrFB);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawSurveyTiles();                                   // the sky images, under everything
  // raw-byte catalogue layers (decoded in the vertex shader)
  gl.useProgram(progU.p); glShared(progU.loc);
  gl.uniform1f(progU.loc.u_pmYearsU,tSince(2016));           // Gaia DR3 epoch 2016.0 → the displayed date
  if(V.solarA<0.5){
    const far = camDist>1e-9 && invScale(camDist)>3e6;              // out among the galaxies: brighter web
    if(CL.W && S.web) drawCloud(CL.W,0.05,far?1.6:1.1, far?2.4:1);
    if(CL.Q && S.qso) drawCloud(CL.Q,0.05,1.15, far?1.5:1);
  }
  if(CL.B && S.belt && V.solarA>0.05){
    const ringPx = S.realScale ? V.foc*(2.8*AU_PC)/S.camZ : 60;      // the belt's radius on screen
    const beltA = Math.max(0.12, Math.min(1, (ringPx-24)/140));       // unresolved ring → faint
    drawCloud(CL.B,0.03,1.05,beltA, beltEpoch?(solarJD()-beltEpoch):0); }
  // the Gaia field carries no velocities: it fades out in deep time rather than standing
  // still while the HYG stars fly past it
  const gaiaFade = S.pm ? Math.max(0.12, Math.min(1, 1-(Math.abs(S.pmYears)-1e5)/4e5)) : 1;
  if(CL.G && S.gaia) drawCloud(CL.G,0.12,1.2, (hdrOK?1:0.85)*gaiaFade);   // HDR tames the dense core itself
  if(V.solarA<0.5 && V.sysA<0.5){
    if(CL.O && S.ob) drawCloud(CL.O,0.05,1.0,0.8);
    if(CL.V && S.vars) drawCloud(CL.V,0.05,1.0);
  }
  // float layers: exoplanet hosts (year + facility filters on the GPU), pulsars,
  // open clusters (cosmos view only, matching the 2D gate), HYG stars + halo
  const L=progF.loc;
  gl.useProgram(progF.p); glShared(L);
  gl.uniform1f(L.u_pmYears,tNow());                          // J2000 → the displayed date
  gl.uniform1f(L.u_hostMode,0); gl.uniform1f(L.u_glow,0);
  if(glBufH){
    gl.uniform1f(L.u_hostMode,1); gl.uniform1f(L.u_year,S.year);
    gl.uniform1f(L.u_facColor,S.facColor?1:0); gl.uniform1f(L.u_sizeOn,S.size?1:0);
    gl.uniform1f(L.u_veil,S.veil?1:0); gl.uniform1f(L.u_bnd,BND);
    const fv=[]; for(const k of ['kepler','tess','k2','rv','micro','imaging','ground','other']) fv.push(S.facHidden.has(k)?0:1);
    gl.uniform1fv(L.u_facVis,fv);
    gl.uniform1f(L.u_cull,0.0); gl.uniform1f(L.u_minPx,0.0);
    gl.bindVertexArray(glBufH.vao); gl.drawArrays(gl.POINTS,0,glBufH.n);
    gl.uniform1f(L.u_hostMode,0);
  }
  if(V.solarA<0.5 && V.sysA<0.5){
    gl.uniform1f(L.u_cull,0.05); gl.uniform1f(L.u_minPx,1.0);
    if(glBufP && S.psr){ gl.bindVertexArray(glBufP.vao); gl.drawArrays(gl.POINTS,0,glBufP.n); }
    if(glBufC && S.oclu){ gl.bindVertexArray(glBufC.vao); gl.drawArrays(gl.POINTS,0,glBufC.n); }
  }
  gl.uniform1f(L.u_cull,0.34); gl.uniform1f(L.u_minPx,0.0);
  if(S.hyg && glBuf){ gl.bindVertexArray(glBuf.vao);
    gl.drawArrays(gl.POINTS,0,glBuf.n);
    gl.uniform1f(L.u_glow,1);                            // bright-star halo pass
    gl.drawArrays(gl.POINTS,0,glBuf.n);
    gl.uniform1f(L.u_glow,0); }
  gl.bindVertexArray(null);
  if(hdrOK){                                             // tonemap HDR accumulation -> canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.disable(gl.BLEND);
    gl.useProgram(progT.p);
    gl.bindTexture(gl.TEXTURE_2D,hdrTex);
    gl.drawArrays(gl.TRIANGLES,0,3);
    gl.enable(gl.BLEND);
  }
}
