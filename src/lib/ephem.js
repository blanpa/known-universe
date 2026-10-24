// JPL Horizons ephemerides, packed by pipeline/fetch_horizons.py: per body a run of
// float32 (x, y, z) in AU, ecliptic J2000, at a fixed step. A 4-point Lagrange polynomial
// through the two samples on either side gives the position at any time in the table's
// span (checked against off-grid Horizons samples by tools/ephem-check.mjs). Pure: Node
// runs it as it is.
export function ephemTable(meta, bytes){
  const f32=new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength/4), bodies={};
  for(const b of meta.bodies) bodies[b.n]={ jd0:b.jd0, step:b.step, n:b.count, off:b.offset/4, jd1:b.jd0+(b.count-1)*b.step };
  return { bodies, f32, meta,
    has(name){ return !!bodies[name]; },
    covers(name,jd){ const b=bodies[name]; return !!b && jd>=b.jd0+b.step && jd<=b.jd1-2*b.step; },
    // heliocentric (Moon: geocentric) ecliptic J2000 position in AU, or null outside the span
    at(name,jd){ const b=bodies[name]; if(!b||jd<b.jd0+b.step||jd>b.jd1-2*b.step) return null;
      const u=(jd-b.jd0)/b.step, i=Math.floor(u), t=u-i, k=b.off+(i-1)*3;
      // Lagrange weights for samples at -1, 0, 1, 2
      const w0=-t*(t-1)*(t-2)/6, w1=(t+1)*(t-1)*(t-2)/2, w2=-(t+1)*t*(t-2)/2, w3=(t+1)*t*(t-1)/6;
      return [ w0*f32[k]+w1*f32[k+3]+w2*f32[k+6]+w3*f32[k+9], w0*f32[k+1]+w1*f32[k+4]+w2*f32[k+7]+w3*f32[k+10], w0*f32[k+2]+w1*f32[k+5]+w2*f32[k+8]+w3*f32[k+11] ]; } };
}

// geocentric apparent direction of a planet (ICRS axes → true of date) from the table: the
// body's position at emission (one light-time iteration), the Earth's at reception, then
// annual aberration and precession-nutation — what astropy's get_body(…).transform_to(TETE) gives
import { DELTA_T, apparentOf } from './astro.js';
const EPS0=84381.406/3600*Math.PI/180, C_AUD=173.1446326846693;
export function eclToEq(v){ const c=Math.cos(EPS0), s=Math.sin(EPS0); return [v[0], v[1]*c-v[2]*s, v[1]*s+v[2]*c]; }
export function geocentric(table, name, jdUTC){            // ICRS-axes direction + distance (AU), light-time applied
  const jdTDB=jdUTC+DELTA_T/86400, e=table.at('Earth',jdTDB); if(!e) return null;
  // the body where it was when the light left (one iteration), seen from the Earth where it is now.
  // The Moon's table is geocentric: its vector at emission is taken from the Earth of that moment,
  // so the Earth's own displacement during the light-time (38 km, 20″) is added back — the term
  // that nearly cancels the Moon's aberration, as it must for a body that travels with us
  const rel0=name==='Moon'?table.at('Moon',jdTDB):(b=>b&&[b[0]-e[0],b[1]-e[1],b[2]-e[2]])(table.at(name,jdTDB)); if(!rel0) return null;
  const tau=Math.hypot(rel0[0],rel0[1],rel0[2])/C_AUD;
  let rel;
  if(name==='Moon'){ const m=table.at('Moon',jdTDB-tau), e1=table.at('Earth',jdTDB-tau); if(!m||!e1) return null; rel=[m[0]+e1[0]-e[0], m[1]+e1[1]-e[1], m[2]+e1[2]-e[2]]; }
  else { const b=table.at(name,jdTDB-tau); if(!b) return null; rel=[b[0]-e[0],b[1]-e[1],b[2]-e[2]]; }
  const d=Math.hypot(rel[0],rel[1],rel[2]), q=eclToEq(rel); return { dir:[q[0]/d,q[1]/d,q[2]/d], dist:d, lightMin:tau*1440 };
}
export function planetApparent(table, name, jdUTC){ const g=geocentric(table,name,jdUTC); if(!g) return null;
  return { dir:apparentOf(g.dir, jdUTC), dist:g.dist, lightMin:g.lightMin }; }
