// A foreign exoplanet system: planets on their orbits around the focused host.
import { transit as transitStore } from '../lib/stores.js';
import { ctx } from './canvas.js';
import { PC2LY } from './data.js';
import { fmt } from './hud.js';
import { LBL, P_SOLAR } from './labels.js';
import { solarJD } from './solar-data.js';
import { S, V } from './state.js';
import { H, W, _d2x, _d2y, camDir2i, project } from './view.js';
// ---- other exoplanet systems: an orbital diagram around the focused host star ----
export let sysProj=[];
// the transit light curve lives in a component; the engine publishes the ingredients once
// per visible change: depth (Rp/R*)², central-transit duration, ingress, and the epochs
let _transitKey='';
const R_EARTH_AU=4.2635e-5, R_SUN_AU=4.6505e-3;
function publishTransits(s,jd){
  const key=s.h+'|'+jd.toFixed(2); if(key===_transitKey) return; _transitKey=key;
  const rstar=s._sr||1, rsAU=rstar*R_SUN_AU;
  const planets=s.p.filter(p=>p.per>0&&p.t0>0&&p.r>0&&p.a>0).map(p=>{
    const k=p.r*R_EARTH_AU/rsAU, dur=p.per/Math.PI*Math.asin(Math.min(1,rsAU*(1+k)/p.a));
    return {n:p.n, per:p.per, t0:p.t0, depth:k*k, dur, ing:Math.max(1e-4,dur*k/(1+k))}; });
  transitStore.set({host:s.h, rstar, now:jd, planets});
}
export function clearTransits(){ if(_transitKey){ _transitKey=''; transitStore.set(null); } }
export function planetColor(r){
  if(!r)     return [180,185,195];
  if(r<1.6)  return [206,150,108];   // Gestein
  if(r<3.5)  return [110,196,184];   // Supererde
  if(r<8)    return [110,150,224];   // Neptune-like
  return [226,180,132];              // Gas giant
}
export function drawSystem(alpha){ LBL.prio=P_SOLAR;
  sysProj.length=0;
  const s=V.focusSys; if(!s||!V.focusSysW) return;
  const sp=project(V.focusSysW[0],V.focusSysW[1],V.focusSysW[2]);
  if(sp.depth<=V.NEAR) return;
  const A=alpha; ctx.globalAlpha=A;
  publishTransits(s, solarJD());
  const pls=s.p.filter(p=>p.a>0).slice().sort((x,y)=>x.a-y.a);
  const aMin=pls.length?pls[0].a:1, aMax=pls.length?pls[pls.length-1].a:1;
  const lr=Math.log10(aMax/aMin)||1, S0=Math.min(W,H)*0.34*A;
  // central star
  const sc=s._col;
  const gr=ctx.createRadialGradient(sp.x,sp.y,0,sp.x,sp.y,14);
  gr.addColorStop(0,`rgba(${sc[0]},${sc[1]},${sc[2]},${A*0.85})`); gr.addColorStop(1,`rgba(${sc[0]},${sc[1]},${sc[2]},0)`);
  ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(sp.x,sp.y,14,0,6.2832); ctx.fill();
  ctx.beginPath(); ctx.arc(sp.x,sp.y,Math.max(3,5*A),0,6.2832);
  ctx.fillStyle=`rgba(${sc[0]},${sc[1]},${sc[2]},${A})`; ctx.fill();
  // habitable zone (from the host's real luminosity)
  // habitable zone (from the host's real luminosity), drawn after the orbit frame below
  const HZ = (S.hz && s.lum) ? (()=>{ const sq=Math.sqrt(s.lum), rOf=au=>{ const t=Math.max(0,Math.min(1.06, pls.length>1?Math.log10(au/aMin)/lr:0.5));
      return S0*(0.13+t*0.84); }; return [rOf(0.95*sq), rOf(1.67*sq)]; })() : null;
  // Orbit geometry. A planet with a transit epoch orbits EDGE-ON to us: its plane holds
  // the line of sight, and at t0 it stands in front of its star. Where the orbit's node
  // points around that line the data does not say, so the plane is laid through the
  // local celestial north — honest about phase, elongation and in-front/behind, silent
  // about the rest. Planets without an epoch keep a schematic face-on circle.
  const u=[-s._dx,-s._dy,-s._dz];                            // star → us
  let v=[0,0,1]; { const d=v[2]*u[2]; v=[-d*u[0],-d*u[1],1-d*u[2]]; const l=Math.hypot(v[0],v[1],v[2])||1; v=[v[0]/l,v[1]/l,v[2]/l]; }
  const w=[u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0]];
  const ringPt=(r,a,b,th)=>{ const c=Math.cos(th), sn=Math.sin(th);
    camDir2i(a[0]*c+b[0]*sn, a[1]*c+b[1]*sn, a[2]*c+b[2]*sn); return [sp.x+_d2x*r, sp.y+_d2y*r]; };
  const ring=(r,a,b)=>{ ctx.beginPath(); for(let k=0;k<=48;k++){ const q=ringPt(r,a,b,k/48*6.2832); if(k) ctx.lineTo(q[0],q[1]); else ctx.moveTo(q[0],q[1]); } };
  if(HZ){ const [ri,ro]=HZ;                                  // in the plane the planets use
    const edgeOn=pls.some(p=>p.per>0&&p.t0>0), ha=edgeOn?u:v, hb=edgeOn?v:w;
    ring(ro,ha,hb); ring(ri,ha,hb); ctx.fillStyle=`rgba(90,220,130,${A*0.11})`; ctx.fill('evenodd');
    ctx.strokeStyle=`rgba(110,230,150,${A*0.32})`; ctx.lineWidth=1; ring(ri,ha,hb); ctx.stroke(); ring(ro,ha,hb); ctx.stroke();
    ctx.font='8.5px ui-monospace,monospace'; ctx.fillStyle=`rgba(120,230,150,${A*0.72})`;
    const lp=ringPt(ro,ha,hb,-0.9); ctx.fillText('habitable zone', lp[0]+4, lp[1]-3); }
  pls.forEach((p,i)=>{
    const t = pls.length>1 ? Math.log10(p.a/aMin)/lr : 0.5;
    const orb = S0*(0.13+t*0.84);
    const transit = p.per>0 && p.t0>0;
    const pa = transit ? u : v, pb = transit ? v : w;        // the orbit's plane
    ring(orb,pa,pb);
    ctx.strokeStyle=`rgba(150,170,210,${A*0.22})`; ctx.lineWidth=1; ctx.stroke();
    let ang;                                       // real transit phase when the ephemeris exists
    if(transit){ const ph=((solarJD()-p.t0)/p.per)%1; ang=(ph<0?ph+1:ph)*6.2832; }
    else ang=i*2.399+0.6;
    const [mx,my]=ringPt(orb,pa,pb,ang);
    const pc=planetColor(p.r), ppx=Math.max(2.2,Math.min(17,(p.r?Math.pow(p.r,0.4)*2.6:4)*A));
    const psel=(p===S.hover||p===S.pinned);
    ctx.beginPath(); ctx.arc(mx,my,ppx,0,6.2832);
    ctx.fillStyle=`rgba(${pc[0]},${pc[1]},${pc[2]},${A})`; ctx.fill();
    if(psel){ ctx.beginPath(); ctx.arc(mx,my,ppx+6,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    p._host=s.h;
    sysProj.push({o:p,x:mx,y:my,px:Math.max(7,ppx)});
    if(A>0.55){ ctx.font=(psel?'11px':'9.5px')+' ui-monospace,monospace';
      ctx.fillStyle=`rgba(${pc[0]},${pc[1]},${pc[2]},${psel?1:0.82})`;
      ctx.fillText(p.n.replace(s.h,'').trim()||p.n, mx+ppx+3, my+3); }
  });
  ctx.font='12px ui-monospace,monospace'; ctx.fillStyle=`rgba(233,237,250,${A*0.92})`;
  ctx.fillText('System '+s.h, sp.x+16, sp.y-6);
  ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(139,150,180,${A*0.9})`;
  ctx.fillText(pls.length+' planet'+(pls.length!==1?'s':'')+' · '+fmt(s.d*PC2LY)+' ly', sp.x+16, sp.y+7);
  ctx.globalAlpha=1;
}
