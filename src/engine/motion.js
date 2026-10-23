// Stars move. Proper motion and radial velocity give every catalogue star a 3D velocity
// relative to the Sun; over ±2 Myr straight-line motion is exact enough (the Galactic
// potential bends a nearby star's path by far less than the catalogue errors do). The
// Sun stays at the origin — the velocities are relative to it already.
import { encounters as encountersStore } from '../lib/stores.js';
import { STARS } from './data.js';
import { HYG } from './solar-data.js';
import { S } from './state.js';

const MAS2RAD=Math.PI/(180*3600*1000), KMS2PCYR=1.0227e-6;
// unit direction, distance (pc), proper motion (mas/yr), radial velocity (km/s) → pc/yr
export function velocityOf(dir,d,pr,pd,rv){
  const cd=Math.hypot(dir[0],dir[1])||1e-6;
  const ex=-dir[1]/cd, ey=dir[0]/cd;                                  // east
  const nx=-dir[2]*dir[0]/cd, ny=-dir[2]*dir[1]/cd, nz=cd;            // north
  const vE=(pr||0)*MAS2RAD*d, vN=(pd||0)*MAS2RAD*d, vR=(rv||0)*KMS2PCYR;
  return [ex*vE+nx*vN+dir[0]*vR, ey*vE+ny*vN+dir[1]*vR, nz*vN+dir[2]*vR];
}
for(const s of HYG)   s._v=velocityOf([s.dx,s.dy,s.dz], s.d, s.pr, s.pd, s.rv);
for(const s of STARS) s._v=velocityOf([s._dx,s._dy,s._dz], s._r, s.pr, s.pd, s.rv);

export const tNow=()=> S.pm ? S.pmYears : 0;             // years from today on the timeline
export function hygPos(s,t){ return [s.dx*s.d+s._v[0]*t, s.dy*s.d+s._v[1]*t, s.dz*s.d+s._v[2]*t]; }
export function hostPos(s,t){ return [s._dx*s._r+s._v[0]*t, s._dy*s._r+s._v[1]*t, s._dz*s._r+s._v[2]*t]; }

// Close encounters: for a straight path r + v·t the nearest point to the Sun is at
// t* = −(r·v)/|v|², d* = |r + v·t*|. Stars with a measured radial velocity only.
export const ENCOUNTERS=(()=>{
  const out=[];
  for(const s of HYG){
    if(s.rv===undefined) continue;
    const v=s._v, rx=s.dx*s.d, ry=s.dy*s.d, rz=s.dz*s.d;
    const vv=v[0]*v[0]+v[1]*v[1]+v[2]*v[2]; if(vv<=0) continue;
    const t=-(rx*v[0]+ry*v[1]+rz*v[2])/vv; if(Math.abs(t)>2e6) continue;
    const d=Math.hypot(rx+v[0]*t, ry+v[1]*t, rz+v[2]*t);
    if(d<1.5 && d<s.d*0.9) out.push({s, t:Math.round(t), d, v:Math.sqrt(vv)/KMS2PCYR});
  }
  out.sort((a,b)=>a.d-b.d);
  return out.slice(0,40);
})();
encountersStore.set(ENCOUNTERS.map((e,i)=>({ i, name:e.s.n||'HIP '+e.s.hip, t:e.t, d:e.d, v:e.v, dNow:e.s.d })));
