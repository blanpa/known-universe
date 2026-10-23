// Trajectories: Lambert transfers between planets, 1g interstellar routes.
import { msg } from './actions.js';
import { ctx } from './canvas.js';
import { PC2LY } from './data.js';
import { pathBegin, pathPt, pathStroke } from './draw.js';
import { fmt } from './hud.js';
import { LBL, P_PROBE, P_SEL } from './labels.js';
import { navPhys, navWorld } from './nav.js';
import { PLANETS, dateStr, eclToWorld, elementsAt, keplerEcl, keplerSB, orbPoint, solarJD } from './solar-data.js';
import { solarProj } from './solar.js';
import { S, V } from './state.js';
import { project, scale } from './view.js';
// ---- transfer trajectories: Lambert solver + launch-window search ----
// Two-impulse, Sun-centred (patched-conic estimate). Works in AU and days.
const MU_S=2.9591220828559093e-4, AUD2KMS=1731.456;      // GM_sun in AU³/day² ; AU/day → km/s

function stC(z){ if(z>1e-6) return (1-Math.cos(Math.sqrt(z)))/z;
  if(z<-1e-6) return (Math.cosh(Math.sqrt(-z))-1)/(-z); return 0.5-z/24; }
function stS(z){ if(z>1e-6){const s=Math.sqrt(z); return (s-Math.sin(s))/(s*s*s);}
  if(z<-1e-6){const s=Math.sqrt(-z); return (Math.sinh(s)-s)/(s*s*s);} return 1/6-z/120; }
// prograde single-rev Lambert (universal variables, Curtis alg. 5.2)
function lambert(r1v,r2v,tof){
  const r1=Math.hypot(r1v[0],r1v[1],r1v[2]), r2=Math.hypot(r2v[0],r2v[1],r2v[2]);
  let cosD=(r1v[0]*r2v[0]+r1v[1]*r2v[1]+r1v[2]*r2v[2])/(r1*r2); cosD=Math.max(-1,Math.min(1,cosD));
  let dth=Math.acos(cosD); if(r1v[0]*r2v[1]-r1v[1]*r2v[0]<0) dth=2*Math.PI-dth;
  const Ac=Math.sin(dth)*Math.sqrt(r1*r2/(1-cosD));
  if(!isFinite(Ac)||Math.abs(Ac)<1e-12) return null;
  const y=z=>r1+r2+Ac*(z*stS(z)-1)/Math.sqrt(stC(z));
  const F=z=>{const yy=y(z); return yy<0?NaN:Math.pow(yy/stC(z),1.5)*stS(z)+Ac*Math.sqrt(yy)-Math.sqrt(MU_S)*tof;};
  let zlo=-64, zhi=4*Math.PI*Math.PI-1e-9;
  while(zlo<zhi && !(y(zlo)>0 && isFinite(F(zlo)))) zlo+=4;
  if(!(F(zlo)<0)) return null;                           // tof below the parabolic minimum
  let z=0;
  for(let i=0;i<80;i++){ z=(zlo+zhi)/2; const f=F(z); if(isNaN(f)||f<0) zlo=z; else zhi=z; }
  const yy=y(z), f=1-yy/r1, g=Ac*Math.sqrt(yy/MU_S), gd=1-yy/r2;
  const v1=[0,0,0], v2=[0,0,0];
  for(let i=0;i<3;i++){ v1[i]=(r2v[i]-f*r1v[i])/g; v2[i]=(gd*r2v[i]-r1v[i])/g; }
  return {v1,v2};
}
// universal-variable Kepler propagation of a state — draws the arc, flies the craft
function propagateUV(r0v,v0v,dt){
  const r0=Math.hypot(r0v[0],r0v[1],r0v[2]), v02=v0v[0]*v0v[0]+v0v[1]*v0v[1]+v0v[2]*v0v[2];
  const vr0=(r0v[0]*v0v[0]+r0v[1]*v0v[1]+r0v[2]*v0v[2])/r0;
  const alpha=2/r0-v02/MU_S, sq=Math.sqrt(MU_S);
  let x=Math.abs(alpha)>1e-9 ? sq*Math.abs(alpha)*dt : sq*dt/r0;
  for(let i=0;i<40;i++){
    const z=alpha*x*x, C=stC(z), Sz=stS(z);
    const F=r0*vr0/sq*x*x*C+(1-alpha*r0)*x*x*x*Sz+r0*x-sq*dt;
    const dF=r0*vr0/sq*x*(1-z*Sz)+(1-alpha*r0)*x*x*C+r0;
    const dx=F/dF; x-=dx; if(Math.abs(dx)<1e-10) break;
  }
  const z=alpha*x*x, f=1-x*x/r0*stC(z), g=dt-x*x*x/sq*stS(z);
  return [f*r0v[0]+g*v0v[0], f*r0v[1]+g*v0v[1], f*r0v[2]+g*v0v[2]];
}
function bodyEclAt(b,jd){ const el=elementsAt(b,jd); return orbPoint(el,el.E); }
function bodyVelAt(b,jd){ const p=bodyEclAt(b,jd+0.5), m=bodyEclAt(b,jd-0.5);
  return [p[0]-m[0],p[1]-m[1],p[2]-m[2]]; }
// scan departure × time-of-flight for the min-Δv window, then refine locally
function findWindow(bA,bB,jd0){
  const aA=bA.k?bA.k[0]:bA.kd.a, aB=bB.k?bB.k[0]:bB.kd.a;
  const Ta=Math.sqrt(aA*aA*aA)*365.25, Tb=Math.sqrt(aB*aB*aB)*365.25;
  const syn=1/Math.max(1e-9,Math.abs(1/Ta-1/Tb));
  const span=Math.min(1000,Math.max(420,syn*1.15));
  const hoh=Math.PI*Math.sqrt(Math.pow((aA+aB)/2,3)/MU_S);
  const tofLo=hoh*0.55, tofHi=Math.min(hoh*1.6,73000);
  let best=null;
  const evalPt=(dep,tof)=>{
    const L=lambert(bodyEclAt(bA,dep), bodyEclAt(bB,dep+tof), tof);
    if(!L) return;
    const vA=bodyVelAt(bA,dep), vB=bodyVelAt(bB,dep+tof);
    const dv=(Math.hypot(L.v1[0]-vA[0],L.v1[1]-vA[1],L.v1[2]-vA[2])
             +Math.hypot(L.v2[0]-vB[0],L.v2[1]-vB[1],L.v2[2]-vB[2]))*AUD2KMS;
    if(!best||dv<best.dv) best={dep,tof,dv,v1:L.v1};
  };
  for(let i=0;i<=70;i++) for(let j=0;j<=20;j++)
    evalPt(jd0+i*span/70, tofLo+j*(tofHi-tofLo)/20);
  if(!best) return null;
  const ds=span/70, ts=(tofHi-tofLo)/20, c={dep:best.dep,tof:best.tof};
  for(let i=-6;i<=6;i++) for(let j=-6;j<=6;j++)
    evalPt(c.dep+i*ds/6, Math.max(20,c.tof+j*ts/6));
  return best;
}
export function computeTransfer(b){
  const earth=PLANETS.find(p=>p.n==='Earth');
  const w=findWindow(earth,b,solarJD());
  if(!w){ msg('no transfer window found'); return; }
  const r1=bodyEclAt(earth,w.dep), pts=[], N=96;
  for(let i=0;i<=N;i++) pts.push(propagateUV(r1,w.v1,w.tof*i/N));
  V.TRANSFER={to:b,dep:w.dep,tof:w.tof,dv:w.dv,r1,v1:w.v1,pts};
  V.TRANSFER._o={xfer:true,n:'Earth → '+b.n+' transfer',T:V.TRANSFER};
  msg(`launch ${dateStr(w.dep)} · ${Math.round(w.tof)} d · Δv ${w.dv.toFixed(1)} km/s — ride the time slider`);
  V.lastInfo=undefined; V.dirty=true;
}
export function drawTransfer(A){ LBL.prio=P_PROBE;
  const T=V.TRANSFER; if(!T) return;
  pathBegin();
  for(const q of T.pts){ const w=eclToWorld(q[0],q[1],q[2]); pathPt(project(w[0],w[1],w[2])); }
  pathStroke(`rgba(79,214,200,${A*0.8})`,1.5,[5,4]);
  const ends=[[T.pts[0],`launch ${dateStr(T.dep)} · Δv ${T.dv.toFixed(1)} km/s`],
              [T.pts[T.pts.length-1],`${T.to.n} at arrival · ${dateStr(T.dep+T.tof)}`]];
  ctx.font='9px ui-monospace,monospace';
  for(const [q,txt] of ends){
    const w=eclToWorld(q[0],q[1],q[2]), p=project(w[0],w[1],w[2]);
    if(p.depth<=V.NEAR) continue;
    ctx.beginPath(); ctx.arc(p.x,p.y,4,0,6.2832);
    ctx.strokeStyle=`rgba(79,214,200,${A*0.9})`; ctx.lineWidth=1.2; ctx.stroke();
    ctx.fillStyle=`rgba(140,235,225,${A*0.85})`; ctx.fillText(txt, p.x+7, p.y-4);
  }
  const jd=solarJD();
  if(jd>=T.dep && jd<=T.dep+T.tof){                      // the craft, en route at the selected date
    const q=propagateUV(T.r1,T.v1,jd-T.dep);
    const w=eclToWorld(q[0],q[1],q[2]), p=project(w[0],w[1],w[2]);
    if(p.depth>V.NEAR){
      const sel=(T._o===S.hover||T._o===S.pinned), sz=sel?6:5;
      ctx.beginPath(); ctx.moveTo(p.x,p.y-sz); ctx.lineTo(p.x+sz,p.y); ctx.lineTo(p.x,p.y+sz); ctx.lineTo(p.x-sz,p.y); ctx.closePath();
      ctx.fillStyle=`rgba(120,255,235,${A})`; ctx.fill();
      if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,sz+6,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
      ctx.font='10px ui-monospace,monospace'; ctx.fillStyle=`rgba(140,255,240,${A*0.95})`;
      const prog=Math.round((jd-T.dep)/T.tof*100);
      ctx.fillText(`Earth → ${T.to.n} · ${prog}%`, p.x+sz+4, p.y+3);
      solarProj.push({o:T._o,x:p.x,y:p.y,px:Math.max(8,sz+3)});
    }
  }
}

// ---- view lock: keep a picked body centred while zooming / time-travelling ----
// ---- interstellar routes: relativistic 1g brachistochrone to any cosmic target ----
// accelerate at 1 g to the midpoint, flip, brake — the classic relativistic rocket.
// Units: ly and years with c = 1, so g = 1.0323 ly/yr².

const G_LYR=1.0323;
export function route1g(Dly){ const d=Dly/2;
  const t1=Math.sqrt(Math.pow(1+G_LYR*d,2)-1)/G_LYR;   // coordinate (Earth) time, half trip
  const tau1=Math.acosh(1+G_LYR*d)/G_LYR;              // proper (ship) time, half trip
  return {T:2*t1, TAU:2*tau1};
}
function route1gAt(Dly,t){                             // Earth-time t years into the trip
  const {T}=route1g(Dly), t1=T/2;
  const leg=tt=>(Math.sqrt(1+Math.pow(G_LYR*tt,2))-1)/G_LYR;
  if(t>=T) return {x:Dly, v:0, done:true};
  const x=t<=t1 ? leg(t) : Dly-leg(T-t);
  const ta=t<=t1?t:T-t, v=G_LYR*ta/Math.sqrt(1+Math.pow(G_LYR*ta,2));
  const tau=(t<=t1 ? Math.asinh(G_LYR*t) : 2*Math.asinh(G_LYR*t1)-Math.asinh(G_LYR*(T-t)))/G_LYR;
  return {x,v,tau,done:false};
}
export function computeRoute(o){
  const P=navPhys(o); if(!P) return;
  const distPc=Math.hypot(P[0],P[1],P[2]); if(!(distPc>0)) return;
  const w=navWorld(o), wl=Math.hypot(w[0],w[1],w[2])||1;
  V.ROUTE={o, n:o.n||o.h||'target', distPc, dir:[w[0]/wl,w[1]/wl,w[2]/wl], dep:solarJD()};
  V.ROUTE._o={iroute:true, n:'Route: Earth → '+V.ROUTE.n, R:V.ROUTE};
  const r=route1g(distPc*PC2LY);
  msg(`1g starship: ${fmtYears(r.T)} Earth time · ${fmtYears(r.TAU)} ship time — ride the time slider`);
  V.lastInfo=undefined; V.dirty=true;
}
export function fmtYears(y){
  if(y<1) return Math.round(y*365.25)+' d';
  if(y<1e4) return y.toFixed(y<20?1:0).replace(/\.0$/,'')+' yr';
  if(y<1e6) return (y/1e3).toFixed(1)+' kyr';
  if(y<1e9) return (y/1e6).toFixed(2)+' Myr';
  return (y/1e9).toFixed(2)+' Gyr';
}
export function drawRoute(){ LBL.prio=P_SEL;
  const R=V.ROUTE, w=navWorld(R.o);
  if(!w){ return; }
  const wr=Math.hypot(w[0],w[1],w[2]);
  pathBegin();
  for(let i=0;i<=40;i++){ const r=wr*i/40;             // radial chord: Sun → target
    pathPt(project(R.dir[0]*r,R.dir[1]*r,R.dir[2]*r)); }
  pathStroke('rgba(120,255,235,0.55)',1.3,[6,5]);
  const tp=project(w[0],w[1],w[2]);
  if(tp.depth>V.NEAR){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(140,255,240,0.8)';
    const D=R.distPc*PC2LY, r=route1g(D);
    ctx.fillText(`${R.n} · ${D<1e4?D.toFixed(1)+' ly':fmt(D)+' ly'} · 1g: ${fmtYears(r.T)} (ship ${fmtYears(r.TAU)})`, tp.x+8, tp.y+12); }
  // the ship, en route since the plot date (sim time drives it)
  const tYr=(solarJD()-R.dep)/365.25;
  if(tYr>0){
    const st=route1gAt(R.distPc*PC2LY, tYr);
    const xr=scale(Math.min(R.distPc, Math.max(1e-9, st.x/PC2LY)));
    const p=project(R.dir[0]*xr,R.dir[1]*xr,R.dir[2]*xr);
    if(p.depth>V.NEAR){
      const sel=(R._o===S.hover||R._o===S.pinned), sz=sel?6:5;
      ctx.beginPath(); ctx.moveTo(p.x,p.y-sz); ctx.lineTo(p.x+sz,p.y); ctx.lineTo(p.x,p.y+sz); ctx.lineTo(p.x-sz,p.y); ctx.closePath();
      ctx.fillStyle='rgba(120,255,235,0.95)'; ctx.fill();
      if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,sz+6,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
      ctx.font='10px ui-monospace,monospace'; ctx.fillStyle='rgba(150,255,242,0.95)';
      ctx.fillText(st.done?`arrived at ${R.n}`:`1g starship · ${(st.v).toFixed(st.v>0.99?4:2)} c · ship +${fmtYears(st.tau)}`, p.x+sz+4, p.y+3);
      R._sx=p.x; R._sy=p.y;
    } else { R._sx=undefined; }
  } else { R._sx=undefined; }
}
