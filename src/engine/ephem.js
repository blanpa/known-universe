// The JPL Horizons table (site/data/ephem.bin, 2015–2045) replaces the Keplerian elements
// for the planets, Pluto and the Moon whenever the displayed date is inside it: positions
// good to 0.02″ (tools/ephem-check.mjs) instead of arcminutes. Outside the span, or before
// the file arrives, the elements carry on; every card says which one placed the body.
import { count, tfetch } from '../lib/sources.js';
import { ephemTable, geocentric, planetApparent } from '../lib/ephem.js';
import { DELTA_T } from '../lib/astro.js';
import { V } from './state.js';
export const EPH={ table:null, meta:null };
const AU_KM=149597870.7;
export function loadEphem(){
  const meta={ name:'ephem.bin · JPL Horizons DE441, planets + Moon 2015–2045', group:'catalogue', optional:true };
  Promise.all([tfetch('file-ephem',meta,'data/ephem.json?b='+__BUILD__).then(r=>r.ok?r.json():null),
               fetch('data/ephem.bin?b='+__BUILD__).then(r=>r.ok?r.arrayBuffer():null)])
    .then(([m,b])=>{ if(!m||!b) return; EPH.meta=m; EPH.table=ephemTable(m,new Uint8Array(b)); count('file-ephem', m.bodies.length); V.dirty=true; }).catch(()=>{});
}
// heliocentric ecliptic J2000 position (AU) of a planet at a UTC Julian date, or null
export function ephemPos(name, jdUTC){ const t=EPH.table; if(!t) return null; return t.at(name, jdUTC+DELTA_T/86400); }
// the Moon: geocentric direction (equatorial J2000 axes) and distance in km, or null
export function ephemMoon(jdUTC){ const t=EPH.table; if(!t) return null; const g=geocentric(t,'Moon',jdUTC); if(!g) return null; return { dir:g.dir, r:g.dist*AU_KM }; }
export function ephemApparent(name, jdUTC){ const t=EPH.table; if(!t) return null; return planetApparent(t,name,jdUTC); }
export function ephemCovers(jdUTC){ const t=EPH.table; return !!t && t.covers('Earth', jdUTC+DELTA_T/86400); }
