// Search suggestions.
import { GAL, STARS } from './data.js';
import { CLUSTERS, CLU_T, DSO, DSO_T, PULSARS } from './sky-data.js';
import { HYG, PROBES, SMALL, SOLAR_BODIES } from './solar-data.js';
// ---- search suggestions ----
let _sugIdx=null;
function sugIndex(){
  if(_sugIdx) return _sugIdx;
  const ix=[];
  const add=(n,k)=>{ if(n) ix.push([n,n.toLowerCase(),k]); };
  SOLAR_BODIES.forEach(b=>{ add(b.n,b.kind); (b.moons||[]).forEach(m=>add(m.n,'Moon')); });
  add('Sun','Star');
  PROBES.forEach(p=>add(p.n,'Spacecraft'));
  SMALL.forEach(o=>add(o.n,o.kind));
  DSO.forEach(o=>add(o.n,(DSO_T[o.t]||{}).l||'Deep sky'));
  HYG.forEach(h=>add(h.n,'Star'));
  GAL.forEach(g=>add(g.n,'Galaxy'));
  STARS.forEach(st=>add(st.h,'Exoplanet host'));
  CLUSTERS.forEach(c=>add(c.n,(CLU_T[c.ct||0]||{}).l||'Cluster'));
  PULSARS.forEach(p=>add(p.n,'Pulsar'));
  return _sugIdx=ix;
}
export function suggestList(q){                                  // shared by desktop dropdown + mobile sheet
  q=(q||'').trim().toLowerCase();
  if(!q||q.length<2) return [];
  const ix=sugIndex(), out=[];
  for(const e of ix){ if(e[1].startsWith(q)){ out.push(e); if(out.length>=6) break; } }
  if(out.length<6) for(const e of ix){ if(!e[1].startsWith(q)&&e[1].includes(q)){ out.push(e); if(out.length>=6) break; } }
  return out;
}
