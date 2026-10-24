// Space motion of the pinned star: U, V, W from its parallax, proper motion and radial
// velocity, and its orbit in the Galaxy for ±500 Myr, drawn on the map and summed up in the
// Analysis pane. src/lib/kinematics.js is the maths (checked against astropy and the Sun's
// textbook orbit); this is the plumbing.
import { api } from '../lib/api.js';
import { galXYZ, orbit, toHelioICRS, uvw } from '../lib/kinematics.js';
import { kinematics as store } from '../lib/stores.js';
import { ctx } from './canvas.js';
import { pathBegin, pathPt, pathStroke } from './draw.js';
import { LBL, P_SEL } from './labels.js';
import { nameOf, physPos } from './entity.js';
import { S, V } from './state.js';
import { project, scale } from './view.js';
export const KIN={ star:null, res:null, path:null };
// what the catalogue knows about a star's motion: parallax, μ, radial velocity
export function motionOf(o){
  if(!o) return null;
  const d=o.usr?(o.noDist?null:o.d):(o.d!==undefined?o.d:o._r); if(!(d>0)) return null;
  const pr=o.pr, pd=o.pd, rv=o.rv; if(pr===undefined||pd===undefined) return null;
  const P=physPos(o); if(!P) return null; const L=Math.hypot(P[0],P[1],P[2])||1, dir=[P[0]/L,P[1]/L,P[2]/L];
  const ra=((Math.atan2(dir[1],dir[0])*57.29578)+360)%360, dec=Math.asin(dir[2])*57.29578;
  return { ra, dec, plx:1000/d, d, pr, pd, rv:rv!==undefined?rv:null, dir, name:nameOf(o) };
}
export function uvwOf(o){ const m=motionOf(o); if(!m||m.rv===null) return null; return { ...uvw(m.ra,m.dec,m.plx,m.pr,m.pd,m.rv), m }; }
export function kinematicsOf(o=S.pinned, opts={}){
  const u=uvwOf(o); if(!u){ KIN.star=null; KIN.res=null; KIN.path=null; store.set({ star:null, msg:o?`${nameOf(o)}: no radial velocity in the catalogue — U, V, W need all three velocity components`:'' }); return null; }
  const pos=galXYZ(u.m.dir,u.m.d), vel=[u.U,u.V,u.W];
  const res=orbit(pos,vel,{ span:opts.span||500, dt:opts.dt||0.5 });
  KIN.star=o; KIN.res=res; KIN.path=res.pts.filter((_,i)=>i%4===0).map(q=>toHelioICRS(q));
  store.set({ star:u.m.name, U:u.U, V:u.V, W:u.W, speed:Math.hypot(u.U,u.V,u.W), rv:u.m.rv, pm:Math.hypot(u.m.pr,u.m.pd), d:u.m.d,
    Rmin:res.Rmin, Rmax:res.Rmax, zmax:res.zmax, ecc:res.ecc, period:res.period, Rg:res.Rg, span:opts.span||500, pts:res.pts.filter((_,i)=>i%8===0).map(q=>({ t:q.t, R:q.R, z:q.z })), msg:'' });
  V.dirty=true; return res;
}
export function clearKinematics(){ KIN.star=null; KIN.res=null; KIN.path=null; store.set({ star:null, msg:'' }); V.dirty=true; }
// the orbit on the map: a polyline through the last 500 Myr (dim) and the next (bright)
export function drawOrbit(){
  if(!KIN.path||S.skyMode) return;
  const n=KIN.path.length, half=Math.floor(n/2); let drawn=0;
  for(const [from,to,col] of [[0,half,'rgba(196,170,255,0.35)'],[half,n-1,'rgba(196,170,255,0.9)']]){
    pathBegin(); for(let i=from;i<=to;i++){ const q=KIN.path[i], R=scale(q.d); pathPt(project(q.dir[0]*R,q.dir[1]*R,q.dir[2]*R)); drawn++; } pathStroke(col,1.2,from===0?[4,4]:[]); }
  const q=KIN.path[n-1], R=scale(q.d), p=project(q.dir[0]*R,q.dir[1]*R,q.dir[2]*R);
  if(p.depth>V.NEAR){ LBL.prio=P_SEL; ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(196,170,255,0.9)'; ctx.fillText(`${KIN.res?.period?'+'+(KIN.path.length?Math.round(KIN.res.pts[KIN.res.pts.length-1].t):'')+' Myr':''}`, p.x+5, p.y-4); }
  return drawn;
}
Object.assign(api,{ kinematics:kinematicsOf, clearKinematics });
