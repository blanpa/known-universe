// Ray-traced black holes (Schwarzschild null geodesics) and the painted fallback.
import { ctx, cv } from './canvas.js';
import { globeViewRows } from './earth.js';
import { GC, NGP } from './sky-data.js';
import { DPR } from './view.js';
// ---- black holes, ray-traced: per-pixel null geodesics (Schwarzschild) ----
// shadow, photon ring and the folded disk all EMERGE from the light bending;
// disk shading has Doppler beaming + gravitational redshift; escaped rays
// sample the real scene behind the hole, so the background warps too.
let _bhgl=null, _bhFails=0, _bhNextTry=0;
function bhInit(){
  if(_bhgl!==null){
    if(_bhgl.gl) return _bhgl;
    if(_bhFails>=4 || performance.now()<_bhNextTry) return null;
    _bhgl=null;
  }
  const fail=m=>{ _bhgl={gl:null}; _bhFails++; _bhNextTry=performance.now()+5000;
    try{console.warn(m);}catch(e){} return null; };
  const cv2=document.createElement('canvas');
  const gl=cv2.getContext('webgl',{alpha:true,antialias:false});
  if(!gl) return fail('bh: no WebGL context');
  const mk=(t,src)=>{ const sh=gl.createShader(t); gl.shaderSource(sh,src); gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){ try{console.warn('bh:',gl.getShaderInfoLog(sh));}catch(e){} return null; }
    return sh; };
  const vsh=mk(gl.VERTEX_SHADER,`attribute vec2 aP; varying vec2 vP;
    void main(){ vP=aP; gl_Position=vec4(aP,0.0,1.0); }`);
  const fsh=mk(gl.FRAGMENT_SHADER,`precision highp float; varying vec2 vP;
    uniform highp mat3 uT; uniform sampler2D uBg; uniform float uBgOk, uMode;
    float hash(vec3 p){ p=fract(p*0.3183+vec3(0.11,0.23,0.37)); p*=17.0;
      return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    void main(){
      const float HALF=9.6;
      vec3 pos=uT*vec3(vP*HALF,-18.0);
      vec3 dir=uT*vec3(0.0,0.0,1.0);
      vec3 hv=cross(pos,dir); float h2=dot(hv,hv);
      vec3 col=vec3(0.0); float trans=1.0; bool cap=false;
      float jit=0.85+0.3*fract(sin(dot(vP,vec2(12.9898,78.233)))*43758.5453);   // de-band the integrator
      float py=pos.y;
      for(int i=0;i<300;i++){
        float r=length(pos);
        if(r<1.02){cap=true;break;}
        if(r>20.0 && dot(pos,dir)>0.0) break;
        float dt=clamp(r*0.1,0.04,0.35)*jit;
        dir+=-1.5*h2*pos/pow(r,5.0)*dt;      // null-geodesic bending
        pos+=dir*dt;
        float ny=pos.y;
        if(uMode>0.5){                       // EHT: hot puffy torus (RIAF), integrated volumetrically
          float rc=length(pos.xz);
          float em=exp(-pow((rc-4.6)/1.5,2.0)-pow(pos.y/1.6,2.0));
          if(em>0.002){
            float th=atan(pos.z,pos.x);
            em*=0.72+0.4*sin(3.0*th+0.9);    // the three bright knots
            float v=0.35*clamp(sqrt(3.0/max(rc,2.0)),0.0,1.0);
            vec3 vel=normalize(vec3(-pos.z,0.0,pos.x))*v;
            float g=clamp(1.0/(1.0-dot(vel,normalize(dir))),0.6,1.7);
            col+=trans*vec3(1.0,0.42,0.08)*em*dt*0.6*pow(g,2.0);
            trans*=exp(-em*dt*0.16);
            if(trans<0.04) break;
          }
        }
        else if(py*ny<0.0){                  // Gargantua: crossed the thin-disk plane
          float f=py/(py-ny);
          vec3 hit=mix(pos-dir*dt,pos,f);
          float rh=length(hit.xz);
          if(rh>2.6&&rh<9.0){                // thin disk from the ISCO out
            float v=clamp(sqrt(0.5/max(rh-1.0,0.4)),0.0,0.72);
            vec3 vel=normalize(vec3(-hit.z,0.0,hit.x))*v;
            float g=clamp(1.0/(1.0-dot(vel,normalize(dir))),0.42,2.6);   // Doppler
            float grav=sqrt(clamp(1.0-1.0/rh,0.0,1.0));                  // grav. redshift
            float br=pow(3.0/rh,0.9)*pow(g,3.0)*grav
                     *smoothstep(2.6,3.3,rh)*smoothstep(9.0,7.4,rh);   // crisp band edges
            vec3 dc=mix(vec3(1.0,0.4,0.13),vec3(1.0,0.97,0.9),clamp(g*0.8-0.4,0.0,1.0));
            col+=trans*dc*br*1.7;
            trans*=0.22;
            if(trans<0.05) break;
          }
        }
        py=ny;
      }
      if(!cap&&trans>0.05){
        vec3 pc=pos*uT;                      // back to camera frame (transpose)
        vec2 buv=pc.xy/HALF*0.5+0.5;
        vec3 bg=vec3(0.0);
        if(uBgOk>0.5&&buv.x>0.0&&buv.x<1.0&&buv.y>0.0&&buv.y<1.0)
          bg=texture2D(uBg,vec2(buv.x,1.0-buv.y)).rgb;
        vec3 rd=normalize(dir)*uT;
        vec3 sp=floor(rd*240.0);             // faint procedural stars so the warp
        float st=step(0.9985,hash(sp));      // shows even over empty capture
        col+=trans*(bg+vec3(st)*0.85);
      }
      col=vec3(1.0)-exp(-col*1.25);                      // filmic-ish tone map
      float edge=1.0-smoothstep(0.74,0.98,length(vP));   // round vignette — no square seam
      gl_FragColor=vec4(col*edge,edge);
    }`);
  if(!vsh||!fsh) return fail('bh: shader compile failed');
  const pr=gl.createProgram(); gl.attachShader(pr,vsh); gl.attachShader(pr,fsh); gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) return fail('bh: link failed');
  const vb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vb);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  _bhgl={cv:cv2,gl,pr,vb,tex,capCv:document.createElement('canvas'),
    aP:gl.getAttribLocation(pr,'aP'),uT:gl.getUniformLocation(pr,'uT'),
    uBg:gl.getUniformLocation(pr,'uBg'),uBgOk:gl.getUniformLocation(pr,'uBgOk'),
    uMode:gl.getUniformLocation(pr,'uMode')};
  _bhFails=0;
  return _bhgl;
}
function bhRender(x,y,rpx,eht){
  const g=bhInit(); if(!g) return null;
  const gl=g.gl, box=rpx*7.4;
  let bgOk=0;                                            // capture the scene behind the hole
  try{
    const c=g.capCv; c.width=c.height=256;
    const g2=c.getContext('2d');
    const glcv=document.getElementById('gl');
    if(glcv) g2.drawImage(glcv,(x-box/2)*V.GLDPR,(y-box/2)*V.GLDPR,box*V.GLDPR,box*V.GLDPR,0,0,256,256);
    g2.drawImage(cv,(x-box/2)*DPR,(y-box/2)*DPR,box*DPR,box*DPR,0,0,256,256);
    gl.bindTexture(gl.TEXTURE_2D,g.tex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
    bgOk=1;
  }catch(e){}
  const dpr=Math.min(2,window.devicePixelRatio||1);
  const size=Math.max(160,Math.min(1024,Math.ceil(box*dpr)));
  if(g.cv.width!==size){ g.cv.width=g.cv.height=size; }
  gl.viewport(0,0,size,size);
  gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(g.pr);
  gl.bindBuffer(gl.ARRAY_BUFFER,g.vb);
  gl.enableVertexAttribArray(g.aP);
  gl.vertexAttribPointer(g.aP,2,gl.FLOAT,false,0,0);
  // the disk lies in the GALACTIC PLANE (world-fixed): orbiting the camera really
  // changes the view — edge-on from the plane, face-on from the galactic pole
  const V=globeViewRows();                       // world→camera rows (yaw/pitch)
  // Gargantua: disk in the galactic plane. EHT torus: flow axis points at Earth
  // (per EHT/GRAVITY we see Sgr A* nearly face-on) — GC ⊥ NGP either way
  const n=eht?GC:NGP, u=eht?NGP:GC;
  const w=[n[1]*u[2]-n[2]*u[1], n[2]*u[0]-n[0]*u[2], n[0]*u[1]-n[1]*u[0]];
  const B=[u,n,w];                               // world→BH rows (disk plane y=0)
  const M=new Array(9);                          // camera→BH = B·Vᵀ, column-major for GLSL
  for(let i2=0;i2<3;i2++) for(let j=0;j<3;j++){
    M[j*3+i2]=B[i2][0]*V[j][0]+B[i2][1]*V[j][1]+B[i2][2]*V[j][2]; }
  gl.uniformMatrix3fv(g.uT,false,M);
  gl.bindTexture(gl.TEXTURE_2D,g.tex);
  gl.uniform1i(g.uBg,0); gl.uniform1f(g.uBgOk,bgOk); gl.uniform1f(g.uMode,eht?1:0);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  return g.cv;
}
// the EHT 2022 image of Sgr A*: a fuzzy face-on ring with three bright knots —
// the MEASURED view from Earth, so it deliberately doesn't rotate with the camera
function drawEHT(x,y,r,A){
  ctx.save();
  let bg=ctx.createRadialGradient(x,y,0,x,y,r*2.3);
  bg.addColorStop(0,`rgba(8,3,1,${A*0.9})`); bg.addColorStop(0.72,`rgba(8,3,1,${A*0.55})`);
  bg.addColorStop(1,'rgba(8,3,1,0)');
  ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(x,y,r*2.3,0,6.2832); ctx.fill();
  const ring=ctx.createRadialGradient(x,y,r*0.25,x,y,r*1.8);
  ring.addColorStop(0,'rgba(30,6,0,0)');
  ring.addColorStop(0.32,`rgba(120,30,4,${A*0.5})`);
  ring.addColorStop(0.5,`rgba(255,118,18,${A*0.9})`);
  ring.addColorStop(0.62,`rgba(255,170,48,${A*0.95})`);
  ring.addColorStop(0.8,`rgba(150,40,6,${A*0.5})`);
  ring.addColorStop(1,'rgba(60,10,0,0)');
  ctx.fillStyle=ring; ctx.beginPath(); ctx.arc(x,y,r*1.8,0,6.2832); ctx.fill();
  ctx.globalCompositeOperation='lighter';
  for(const [ang,s,b] of [[1.9,1,1],[3.6,0.85,0.8],[0.2,0.8,0.7]]){   // the three bright knots
    const kx=x+Math.cos(ang)*r, ky=y+Math.sin(ang)*r;
    const kg=ctx.createRadialGradient(kx,ky,0,kx,ky,r*0.55*s);
    kg.addColorStop(0,`rgba(255,225,140,${A*0.7*b})`);
    kg.addColorStop(0.5,`rgba(255,150,40,${A*0.38*b})`);
    kg.addColorStop(1,'rgba(255,120,30,0)');
    ctx.fillStyle=kg; ctx.beginPath(); ctx.arc(kx,ky,r*0.55*s,0,6.2832); ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
  ctx.restore();
}
// painted fallback (no WebGL / artifact build); ray tracer first
export function drawBlackHole(x,y,r,A,eht){
  const patch=bhRender(x,y,r,!!eht);
  if(patch){
    // in patch units the shadow (b=2.6 rs) sits at 2.6/9.6 of the half-box → scale so it spans r
    ctx.drawImage(patch, x-r*3.7, y-r*3.7, r*7.4, r*7.4);
    return;
  }
  if(eht) drawEHT(x,y,r,A); else drawBlackHolePainted(x,y,r,A);
}
function drawBlackHolePainted(x,y,r,A){
  const disk=r*3.1, flat=0.13;                     // razor-thin disk, Gargantua-style
  ctx.save(); ctx.translate(x,y); ctx.rotate(-0.14);
  let g=ctx.createRadialGradient(0,0,r*0.7,0,0,disk*1.35);         // ambient glow
  g.addColorStop(0,`rgba(255,190,120,${A*0.22})`); g.addColorStop(0.6,`rgba(255,150,70,${A*0.07})`);
  g.addColorStop(1,'rgba(255,140,60,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,disk*1.35,0,6.2832); ctx.fill();
  // the flat disk: one smooth annulus, white-hot at the inner edge fading to amber
  const diskGrad=()=>{ const dg=ctx.createRadialGradient(0,0,r*1.22,0,0,disk);
    dg.addColorStop(0,`rgba(255,252,246,${A})`);
    dg.addColorStop(0.18,`rgba(255,238,205,${A*0.92})`);
    dg.addColorStop(0.55,`rgba(255,196,120,${A*0.55})`);
    dg.addColorStop(1,'rgba(255,150,70,0)'); return dg; };
  ctx.save(); ctx.scale(1,flat); ctx.fillStyle=diskGrad();
  ctx.beginPath(); ctx.arc(0,0,disk,0,6.2832); ctx.arc(0,0,r*1.24,0,6.2832,true); ctx.fill();
  // mild Doppler beaming — the film kept it subtle too
  const dop=ctx.createLinearGradient(-disk,0,disk,0);
  dop.addColorStop(0,`rgba(255,255,255,${A*0.30})`); dop.addColorStop(0.5,'rgba(255,255,255,0)');
  ctx.fillStyle=dop;
  ctx.beginPath(); ctx.arc(0,0,disk,0,6.2832); ctx.arc(0,0,r*1.24,0,6.2832,true); ctx.fill();
  ctx.restore();
  // gravitational lensing: the far side of the disk wraps into a full halo around the shadow
  const hg=ctx.createRadialGradient(0,0,r*1.02,0,0,r*1.75);
  hg.addColorStop(0,`rgba(255,250,240,${A*0.85})`);
  hg.addColorStop(0.35,`rgba(255,225,175,${A*0.45})`);
  hg.addColorStop(1,'rgba(255,180,110,0)');
  ctx.fillStyle=hg;
  ctx.beginPath(); ctx.arc(0,0,r*1.75,0,6.2832); ctx.arc(0,0,r*1.02,0,6.2832,true); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0,0,r*1.32,r*1.28,0,Math.PI,6.2832);   // fold over the top, a touch brighter
  ctx.strokeStyle=`rgba(255,252,244,${A*0.45})`; ctx.lineWidth=Math.max(1,r*0.16); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,r,0,6.2832); ctx.fillStyle='#000'; ctx.fill();   // the shadow
  ctx.beginPath(); ctx.arc(0,0,r*1.05,0,6.2832);                                // photon ring
  ctx.strokeStyle=`rgba(255,248,232,${A*0.95})`; ctx.lineWidth=Math.max(1,r*0.035); ctx.stroke();
  // the near side of the disk passes in front of the shadow
  ctx.save(); ctx.beginPath(); ctx.rect(-disk*1.05,r*0.02,disk*2.1,disk); ctx.clip();
  ctx.save(); ctx.scale(1,flat); ctx.fillStyle=diskGrad();
  ctx.beginPath(); ctx.arc(0,0,disk*0.9,0,6.2832); ctx.arc(0,0,r*1.24,0,6.2832,true); ctx.fill();
  ctx.restore(); ctx.restore();
  ctx.restore();
}
