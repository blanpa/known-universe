// One place that knows what an object IS.
import { objWorld } from './actions.js';
import { icrsOfDate } from '../lib/astro.js';
import { ephemApparent } from './ephem.js';
import { uvwOf } from './kinematics.js';
import { jdNow, observeRows } from './observe.js';
import { META, PC2LY } from './data.js';
import { fmt } from './hud.js';
import { epochNow, hostPos, hygPos, tNow } from './motion.js';
import { CLU_T, DSO_T } from './sky-data.js';
import { FAC, SOLAR_BODIES, SUN, dateStr, eclDir, eclToWorld } from './solar-data.js';
import { S } from './state.js';
import { planetColor } from './system.js';
import { fmtYears, route1g } from './transfer.js';
import { USER } from './userdata.js';
import { AU_PC } from './view.js';
//
// The catalogues keep their native shapes — an exoplanet host is {h, p:[…]}, a pulsar
// is [ra,dec,d,name] with a flag, a planet is {n, rk, _e} — because the hot loops are
// written against them. Everything that has to treat objects alike (picking, flying,
// measuring, the info card, the nav console) asks here instead of testing fields.

const GTYPE={Sp:'Spiral galaxy',E:'Elliptical galaxy',S0:'Lenticular galaxy',
  Irr:'Irregular galaxy',dSph:'Dwarf galaxy'};

// ---- kind -----------------------------------------------------------------------
// Order matters: the live objects carry a flag each, solar bodies have a radius,
// galaxies a distance in Mpc, HYG stars no planet list, hosts the rest.
export function kindOf(o){
  if(!o) return null;
  if(o.gpick) return 'gpick';
  if(o.usr) return 'user';
  if(o.oclu) return 'cluster';
  if(o.psr) return 'pulsar';
  if(o.lp) return 'lagrange';
  if(o.cme) return 'cme';
  if(o.iroute) return 'route';
  if(o.xfer) return 'transfer';
  if(o.spot) return 'spot';
  if(o.rec) return 'satellite';
  if(o.fb) return 'fireball';
  if(o.rk!==undefined){
    if(o===SUN) return 'sun';
    if(o.kind==='Spacecraft') return 'probe';
    if(o.kind==='Moon') return 'moon';
    if(o.iso) return 'iso';
    if(o.kind==='Comet') return 'comet';
    if(o.kind==='Asteroid') return 'asteroid';
    if(o.kind==='Trans-Neptunian object'||o.kind==='Centaur') return 'tno';
    if(o.kind==='Dwarf planet') return 'dwarf';
    if(o.kind==='Near-Earth object'||o.kd&&o.t!==undefined&&o.ld!==undefined) return 'neo';
    return 'planet';
  }
  if(o.dso) return 'dso';
  if(o.sgra) return 'sgra';
  if(o.fc!==undefined) return 'exoplanet';
  if(o.mpc!==undefined) return 'galaxy';
  if(!o.p) return 'star';
  return 'host';
}
export function nameOf(o){ return o ? (o.n||o.h||'object') : ''; }

const SOLAR_KINDS=new Set(['sun','planet','dwarf','moon','tno','probe','comet','asteroid','iso','neo','lagrange']);
export const isSolar = o => SOLAR_KINDS.has(kindOf(o));

// ---- colour -----------------------------------------------------------------------
export function colorOf(o){
  switch(kindOf(o)){
    case 'gpick': return [207,216,242];
    case 'user': return [255,176,96];
    case 'cluster': return (CLU_T[o.ct||0]||CLU_T[0]).c;
    case 'pulsar': return [150,220,255];
    case 'lagrange': return [196,170,255];
    case 'cme': return o.c||[255,150,80];
    case 'route': case 'transfer': return [120,255,235];
    case 'spot': return [200,100,50];
    case 'satellite': return [150,235,255];
    case 'fireball': return [255,150,80];
    case 'dso': return (DSO_T[o.t]||DSO_T.EN).c;
    case 'sgra': return [255,205,130];
    case 'exoplanet': return planetColor(o.r);
    case 'host': return o._col||[230,230,240];
    case 'galaxy': case 'star': return o.c||[200,205,215];
    default: return o.c||[190,215,235];
  }
}

// ---- position ---------------------------------------------------------------------
// Physical position in parsec, world axes (x toward RA 0, z toward the north celestial
// pole — the same frame the catalogues are stored in). null = not a place you can go.
export function physPos(o){
  switch(kindOf(o)){
    case 'sun': return [0,0,0];
    case 'user': return o.noDist ? null : [o.dx*o.d, o.dy*o.d, o.dz*o.d];
    case 'gpick': case 'sgra': case 'dso': case 'pulsar': case 'cluster':
      return [o._dir[0]*o.d, o._dir[1]*o.d, o._dir[2]*o.d];
    case 'galaxy': { const d=o.mpc*1e6; return [o.dx*d, o.dy*d, o.dz*d]; }
    case 'host': return hostPos(o, tNow());
    case 'star': return hygPos(o, tNow());
    case 'moon': { const p=SOLAR_BODIES.find(b=>b.n===o.parent); return p&&p._e ? eclPos(p._e) : null; }
    case 'satellite': { const e=SOLAR_BODIES.find(b=>b.n==='Earth'); return e&&e._e ? eclPos(e._e) : null; }
    default: return o._e ? eclPos(o._e) : null;
  }
}
// ecliptic AU → world parsec (the obliquity rotation eclToWorld() uses)
function eclPos(e){ const d=eclDir(e[0],e[1],e[2]); return [d[0]*AU_PC, d[1]*AU_PC, d[2]*AU_PC]; }

// Position on the unified (scaled) world — where the thing is drawn right now.
export function worldPos(o){
  const w=objWorld(o); if(w) return w;
  switch(kindOf(o)){
    case 'sun': return [0,0,0];
    case 'moon': { const p=SOLAR_BODIES.find(b=>b.n===o.parent); return p&&p._e ? eclToWorld(p._e[0],p._e[1],p._e[2]) : null; }
    case 'satellite': { const e=SOLAR_BODIES.find(b=>b.n==='Earth'); return e&&e._e ? eclToWorld(e._e[0],e._e[1],e._e[2]) : null; }
    default: return o._e ? eclToWorld(o._e[0],o._e[1],o._e[2]) : null;
  }
}

// ---- what the UI may offer for it ------------------------------------------------
export function abilities(o){
  const k=kindOf(o), pos=physPos(o);
  return {
    lockable: !!worldPos(o),                                   // keep it centred while zooming
    navigable: !!pos,                                          // set a course
    routable: !!pos && !isSolar(o) && k!=='route' && k!=='transfer',   // 1g interstellar ship
    transferable: (k==='planet'||k==='dwarf'||k==='tno'||k==='comet'||k==='asteroid') && !!(o.k||o.kd) && o.n!=='Earth',
  };
}

// ---- RA / Dec ---------------------------------------------------------------------
export function radec(dx,dy,dz){
  let ra=Math.atan2(dy,dx)*57.29578; if(ra<0) ra+=360;
  const dec=Math.asin(Math.max(-1,Math.min(1,dz)))*57.29578;
  return [ra,dec];
}
// sexagesimal, to the precision the catalogues carry (0.1 s of RA ≈ 1.5″, 1″ of Dec)
export function hmsOf(ra,secDigits=1){ ra=((ra%360)+360)%360; const h=ra/15, hh=Math.floor(h), m=(h-hh)*60, mm=Math.floor(m), s=(m-mm)*60;
  let ss=s.toFixed(secDigits); if(+ss>=60){ ss=(0).toFixed(secDigits); } return `${String(hh).padStart(2,'0')}h${String(mm).padStart(2,'0')}m${ss.padStart(secDigits?3+secDigits:2,'0')}s`; }
export function dmsOf(dec,secDigits=0){ const sg=dec<0?'−':'+', a=Math.abs(dec), dd=Math.floor(a), m=(a-dd)*60, mm=Math.floor(m), s=(m-mm)*60;
  return `${sg}${String(dd).padStart(2,'0')}°${String(mm).padStart(2,'0')}′${s.toFixed(secDigits).padStart(secDigits?3+secDigits:2,'0')}″`; }
// ICRS → galactic (the Hipparcos definition: α_G 192.85948°, δ_G 27.12825°, l_Ω 32.93192°)
const GAL_M=[[-0.0548755604162154,-0.8734370902348850,-0.4838350155487132],[0.4941094278755837,-0.4448296299600112,0.7469822444972189],[-0.8676661490190047,-0.1980763734312015,0.4559837761750669]];
export function galactic(dx,dy,dz){
  const x=GAL_M[0][0]*dx+GAL_M[0][1]*dy+GAL_M[0][2]*dz, y=GAL_M[1][0]*dx+GAL_M[1][1]*dy+GAL_M[1][2]*dz, z=GAL_M[2][0]*dx+GAL_M[2][1]*dy+GAL_M[2][2]*dz;
  let l=Math.atan2(y,x)*57.29577951; if(l<0) l+=360; return [l, Math.asin(Math.max(-1,Math.min(1,z)))*57.29577951];
}
export function coordText(dx,dy,dz){ const [ra,dec]=radec(dx,dy,dz); return `${hmsOf(ra)} ${dmsOf(dec)}`; }
export function galText(dx,dy,dz){ const [l,b]=galactic(dx,dy,dz); return `l ${l.toFixed(3)}° b ${b>=0?'+':'−'}${Math.abs(b).toFixed(3)}°`; }
function radecText(dx,dy,dz){ return coordText(dx,dy,dz); }
// proper motion: total and position angle (east of north), from μα* and μδ in mas/yr
export function pmText(pr,pd){ const t=Math.hypot(pr||0,pd||0); if(!t) return '—'; let pa=Math.atan2(pr||0,pd||0)*57.29578; if(pa<0) pa+=360;
  return `${t>=1000?(t/1000).toFixed(2)+'″/yr':t.toFixed(1)+' mas/yr'} · PA ${pa.toFixed(0)}°`; }
const KMS_PER_PCYR_MAS=4.740470;                      // v_t [km/s] = 4.74047 · μ[″/yr] · d[pc]
const simbadCoo=(ra,dec,r)=>`https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${ra.toFixed(4)}%20${dec.toFixed(4)}&Radius=${r}&Radius.unit=arcmin`;
const simbadId=id=>`https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(id)}`;
const aladin=(ra,dec,fov)=>`https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=${fov}`;
const dtime=t=>new Date(t).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
const ly=pc=>fmt(pc*PC2LY)+' ly';

// ---- the card ---------------------------------------------------------------------
// {kind, title, color, rows:[[key,value]], links:[{t,u}], hint, planets?, planetsMore?}
export function card(o){
  const k=kindOf(o), color=colorOf(o);
  const c={kind:k, title:nameOf(o), color, rows:[], links:[], hint:''};
  const pin = S.pinned ? 'Click empty space to release' : 'Click to pin';
  switch(k){
    case 'user': {
      const setName=(USER.sets[o.set]||{}).name||'your data';
      c.title=o.n||`Row ${o.i+1}`; c.kindLabel=`Your data · ${setName}`;
      c.rows.push(['Source',setName],['Position',coordText(o.dx,o.dy,o.dz)],['Galactic',galText(o.dx,o.dy,o.dz)],['Epoch',`J${(o.ep||2000).toFixed(1)}${(o.pr||o.pd)?' · shown at J'+epochNow().toFixed(2):''}`]);
      c.rows.push(['Distance', o.noDist ? 'not given — placed on the sky' : `${ly(o.d)} · ${o.d<100?o.d.toFixed(2):fmt(o.d)} pc${o.dlo&&isFinite(o.dhi)?` (${o.dlo.toFixed(o.dlo<100?2:0)} – ${o.dhi.toFixed(o.dhi<100?2:0)})`:''}`]);
      if(!o.noDist&&o.eplx!==undefined) c.rows.push(['Parallax',`${(1000/o.d).toFixed(3)} ± ${o.eplx.toFixed(3)} mas · ${(1000/o.d/o.eplx).toFixed(0)} σ`]);
      if(o.m!==undefined) c.rows.push(['Magnitude',o.m.toFixed(2)]);
      if(o.pr||o.pd) c.rows.push(['Proper motion',`${o.pr.toFixed(1)}${o.epr!==undefined?' ± '+o.epr.toFixed(2):''} · ${o.pd.toFixed(1)}${o.epd!==undefined?' ± '+o.epd.toFixed(2):''} mas/yr · ${Math.hypot(o.pr,o.pd).toFixed(0)} total`]);
      if(o.ruwe!==undefined) c.rows.push(['RUWE',`${o.ruwe.toFixed(2)}${o.ruwe>1.4?' · astrometry suspect (>1.4: binary or crowded)':' · single-star fit ok'}`]);
      const xst=(USER.sets[o.set]||{}).xm;
      if(xst) c.rows.push(['Counterpart', o.xm ? `${o.xm.id} · ${o.xm.src} · ${o.xm.sep.toFixed(2)}″ away` : `none within ${xst.radius}″ of ${xst.remote||'the loaded catalogues'}`]);
      if(o.xm&&o.xm.plx!==undefined) c.rows.push(['Counterpart ϖ',`${o.xm.plx.toFixed(3)}${o.xm.eplx!==undefined?' ± '+o.xm.eplx.toFixed(3):''} mas${o.xm.plx>0?' · '+(1000/o.xm.plx).toFixed(1)+' pc':''}`]);
      if(o.xm&&(o.xm.pr!==undefined||o.xm.pd!==undefined)) c.rows.push(['Counterpart μ',`${(o.xm.pr||0).toFixed(2)}${o.xm.epr!==undefined?' ± '+o.xm.epr.toFixed(2):''} · ${(o.xm.pd||0).toFixed(2)}${o.xm.epd!==undefined?' ± '+o.xm.epd.toFixed(2):''} mas/yr`]);
      if(o.xm&&o.xm.ruwe!==undefined) c.rows.push(['Counterpart RUWE',`${o.xm.ruwe.toFixed(2)}${o.xm.ruwe>1.4?' · astrometry suspect (>1.4)':''}`]);
      if(o.xm&&o.xm.otype) c.rows.push(['Counterpart type',`${o.xm.otype}${o.xm.sp?' · '+o.xm.sp:''}`]);
      if(o.xm&&o.xm.doubt) c.rows.push(['Doubt',o.xm.doubt]);
      for(const [kx,vx] of Object.entries(o.x||{}).slice(0,8)) c.rows.push([kx,String(vx).slice(0,60)]);
      c.links=[{t:'SIMBAD',u:simbadCoo(o.ra,o.dec,2)},{t:'Aladin',u:aladin(o.ra,o.dec,0.3)}];
      c.hint='from your file · the links query the catalogues at this position'; break; }
    case 'gpick': {
      const [ra,dec]=radec(o._dir[0],o._dir[1],o._dir[2]);
      if(o.gpick==='gaia'){ c.rows.push(['Type','Star · Gaia DR3'],['Position',coordText(o._dir[0],o._dir[1],o._dir[2])+' (±20″, packed)'],['Galactic',galText(o._dir[0],o._dir[1],o._dir[2])],['G magnitude',o.mag.toFixed(1)],['Colour BP−RP',o.bprp.toFixed(2)]);
        c.rows.push(['Distance',`${ly(o.d)} · ${o.d.toFixed(1)} pc${o.dlo!==undefined?` (${o.dlo.toFixed(1)} – ${o.dhi.toFixed(1)}, ${o.bj?'Bailer-Jones geometric 16–84 %':'1/ϖ ± σ'})`:` · ϖ ≈ ${(1000/o.d).toFixed(1)} mas`}`]);
        if(o.eplx!==undefined) c.rows.push(['Parallax error',`± ${o.eplx.toFixed(2)} mas (ϖ ≈ ${(1000/o.d).toFixed(1)} mas, packed)`]);
        if(o.pr!==undefined) c.rows.push(['Proper motion',pmText(o.pr,o.pd)+(o.epm!==undefined?` ± ${o.epm.toFixed(2)}`:'')],['Tangential velocity',`${(KMS_PER_PCYR_MAS*Math.hypot(o.pr,o.pd)/1000*o.d).toFixed(1)} km/s`]);
        if(o.rv!==undefined) c.rows.push(['Radial velocity',`${o.rv>0?'+':''}${o.rv.toFixed(1)} km/s`]);
        if(o.ruwe!==undefined) c.rows.push(['RUWE',`${o.ruwe.toFixed(2)}${o.ruwe>1.4?' · astrometry suspect (>1.4: binary or crowded)':' · single-star fit ok'}`]); }
      else if(o.gpick==='web') c.rows.push(['Type','Galaxy · 2MRS survey'],['Mag K',o.kmag.toFixed(1)],['Distance',`${(o.d/1e6).toFixed(1)} Mpc · ${(o.d*PC2LY/1e6).toFixed(0)} Mly`]);
      else if(o.gpick==='qso') c.rows.push(['Type','Quasar · Milliquas'],['Redshift',`z ≈ ${o.z.toFixed(2)}`],['Distance',`${(o.d/1e9).toFixed(2)} Gpc comoving`]);
      else c.rows.push(['Type',`${o.n} · JPL SBDB`],['Abs. mag H',o.H.toFixed(1)],['Distance',`${o.rAU.toFixed(2)} AU from the Sun`]);
      c.links=[{t:'SIMBAD',u:simbadCoo(ra,dec,2)},{t:'Aladin',u:aladin(ra,dec,0.5)}];
      c.hint='catalogue point — no individual name'; break; }
    case 'cluster': {
      const frb=o.ct===2;
      c.rows.push(['Type',(CLU_T[o.ct||0]||CLU_T[0]).l],
        ['Distance', frb ? fmt(o.d/1e6)+' Mpc' : ly(o.d)],
        [frb?'Estimate':'Measured', frb ? 'redshift from the dispersion measure — approximate' : fmt(o.d)+' pc']);
      c.links=[{t:'SIMBAD',u:simbadId(o.n)},{t:'Aladin',u:aladin(o[0],o[1],2)}]; c.hint=pin; break; }
    case 'pulsar':
      c.rows.push(['Type','Pulsar · rotating neutron star'],['Distance',ly(o.d)],['Measured',fmt(o.d)+' pc, from the dispersion measure']);
      c.links=[{t:'ATNF',u:'https://www.atnf.csiro.au/research/pulsar/psrcat/'},{t:'SIMBAD',u:simbadCoo(o[0],o[1],5)}]; c.hint=pin; break;
    case 'lagrange': {
      const rAU=o._e?Math.hypot(o._e[0],o._e[1],o._e[2]):0;
      c.rows.push(['Type','Lagrange point · gravity balance'],['System',`Sun–${o.pl}`],['Distance',`${rAU.toFixed(2)} AU from the Sun`]);
      if(o.note) c.rows.push(['Note',o.note]);
      c.links=[{t:'Wikipedia',u:'https://en.wikipedia.org/wiki/Lagrange_point'}];
      c.hint=`where the Sun's and ${o.pl}'s gravity balance the orbit`; break; }
    case 'cme': {
      const m=o.cme, dir=`${m.lat>=0?'N':'S'}${Math.abs(m.lat).toFixed(0)} ${m.lon>=0?'W':'E'}${Math.abs(m.lon).toFixed(0)}`;
      c.title='Coronal mass ejection';
      c.rows.push(['Type',`CME · class ${m.type} · NASA DONKI`],['Erupted',`${dtime(m.t)} UTC (at 21.5 R☉)`],['Speed',`${Math.round(m.v)} km/s`],['Width',`±${Math.round(m.half)}° · from ${dir}`],
        m.earthDir ? ['Earth arrival',`~ ${dtime(m.eta)} UTC`] : ['Direction','not Earth-directed']);
      c.links=[{t:'DONKI',u:'https://kauai.ccmc.gsfc.nasa.gov/DONKI/'},{t:'SWPC',u:'https://www.swpc.noaa.gov/'}];
      c.hint='ballistic estimate — real fronts decelerate in the solar wind'; break; }
    case 'route': {
      const R=o.R, D=R.distPc*PC2LY, r=route1g(D);
      c.rows.push(['Distance', D<1e4?`${D.toFixed(1)} ly`:`${fmt(D)} ly`],['Light',fmtYears(D)],['Voyager 1 (17 km/s)',fmtYears(D/5.67e-5)],['Probe at 0.1 c',fmtYears(D*10)],['1g ship · Earth clock',fmtYears(r.T)],['1g ship · on board',fmtYears(r.TAU)]);
      c.links=[{t:'Wikipedia',u:'https://en.wikipedia.org/wiki/Space_travel_under_constant_acceleration'}];
      c.hint='accelerate at 1 g to the midpoint, flip, brake — time dilation makes even galaxies reachable within a life on board'; break; }
    case 'transfer': {
      const T=o.T;
      c.rows.push(['Type','Two-impulse transfer (Lambert)'],['Launch',dateStr(T.dep)],['Arrival',dateStr(T.dep+T.tof)],['Time of flight',`${Math.round(T.tof)} days`],['Δv (heliocentric)',`${T.dv.toFixed(2)} km/s`]);
      c.links=[{t:'Wikipedia',u:'https://en.wikipedia.org/wiki/Hohmann_transfer_orbit'}];
      c.hint='min-Δv window from a departure × flight-time search — drag the timeline to fly it'; break; }
    case 'spot': {
      const r=o.spot; c.title=`Active region ${r.no}`;
      c.rows.push(['Type','Sunspot group · NOAA SWPC'],['Class',`${r.cls||'—'}${r.mag?' · mag '+r.mag:''}`],['Area',`${r.area} millionths · ${r.spots} spots`],['Flares 24 h',`${r.cx} C · ${r.mx} M · ${r.xx} X`],['Flare odds',`C ${r.cp}% · M ${r.mp}% · X ${r.xp}%`]);
      c.links=[{t:'SWPC',u:'https://www.swpc.noaa.gov/products/solar-region-summary'}];
      c.hint=`observed ${r.date} — sunspots this size dwarf the Earth`; break; }
    case 'satellite':
      c.rows.push(['Type',`Satellite · NORAD ${o.rec.satnum}`],['Altitude',`${fmt(o.alt||0)} km`],['Period',`${(2*Math.PI/o.rec.no).toFixed(0)} min`],['Inclination',`${(o.rec.inclo*57.2958).toFixed(1)}°`]);
      c.links=[{t:'N2YO',u:`https://www.n2yo.com/satellite/?s=${o.rec.satnum}`},{t:'CelesTrak',u:'https://celestrak.org/'}];
      c.hint='real orbit, SGP4-propagated — it moves as you watch'; break;
    case 'fireball': {
      const f=o.fb; c.title='Fireball';
      c.rows.push(['Type','Atmospheric impact · JPL CNEOS'],['When',`${dtime(f.t)} UTC`],['Energy',`${f.kt} kt TNT`],['Location',`${Math.abs(f.lat).toFixed(1)}°${f.lat>=0?'N':'S'} ${Math.abs(f.lon).toFixed(1)}°${f.lon>=0?'E':'W'}`]);
      if(f.vel) c.rows.push(['Velocity',`${f.vel} km/s`]);
      c.links=[{t:'CNEOS',u:'https://cneos.jpl.nasa.gov/fireballs/'}];
      c.hint='a small asteroid burning up — most are never seen by anyone'; break; }
    case 'sun': case 'planet': case 'dwarf': case 'moon': case 'tno': case 'probe': case 'comet': case 'asteroid': case 'iso': case 'neo': {
      if(o._src) c.rows.push(['Position from', o._src==='horizons'?'JPL Horizons table (DE441), interpolated · 0.02″':'Keplerian elements (JPL) · arcminutes']);
      const er=o.rk/6371;
      const dist = o.am!==undefined ? `${fmt(o.am*1000)} km from ${o.parent}`
                 : o._r!==undefined ? `${o._r.toFixed(2)} AU from the Sun`
                 : o.a!==undefined ? `${o.a} AU (semi-major axis)` : '—';
      c.kindLabel = k==='moon' ? `Moon of ${o.parent}` : k==='probe' ? 'Spacecraft · human-made' : (o.kind||'Body');
      if(k==='probe'){
        const lt = o._r!==undefined ? (o._r*8.317>120 ? (o._r*8.317/60).toFixed(1)+' h' : (o._r*8.317).toFixed(0)+' min') : '—';
        if(o.launch) c.rows.push(['Launched',String(o.launch)]);
        c.rows.push(['Distance',dist],['Signal delay',`${lt} · one way`]);
      } else {
        c.rows.push(['Radius',`${fmt(o.rk)} km`],['Earth radii',`${er<0.1?er.toFixed(3):er.toFixed(2)} ⊕`],['Distance',dist]);
      }
      if(o.note) c.rows.push(['Note',o.note]);
      c.links=[{t:'NASA',u:o.slug?`https://science.nasa.gov/${o.slug}/`:`https://science.nasa.gov/?search=${encodeURIComponent(o.n)}`},
        {t:'Wikipedia',u:`https://en.wikipedia.org/wiki/${encodeURIComponent(o.n)}`}];
      c.hint=pin; break; }
    case 'dso': {
      const [ra,dec]=radec(o._dir[0],o._dir[1],o._dir[2]);
      c.rows.push(['Type',(DSO_T[o.t]||DSO_T.EN).l],['Distance',`${ly(o.d)} · ${fmt(o.d)} pc`],['RA / Dec',radecText(o._dir[0],o._dir[1],o._dir[2])]);
      c.links=[{t:'SIMBAD',u:simbadCoo(ra,dec,10)},{t:'Aladin',u:aladin(ra,dec,1)}]; c.hint=pin; break; }
    case 'sgra': {
      const [ra,dec]=radec(o._dir[0],o._dir[1],o._dir[2]);
      c.rows.push(['Object','Supermassive black hole'],['Mass','4.3 million M☉'],['Distance',`${ly(o.d)} · ${fmt(o.d)} pc`],['Where','centre of the Milky Way']);
      c.links=[{t:'SIMBAD',u:simbadId('Sgr A*')},{t:'Aladin',u:aladin(ra,dec,0.3)}];
      c.hint='We orbit it every ~225 million years'; break; }
    case 'exoplanet': {
      const cls = !o.r?'—' : o.r<1.6?'Rocky planet' : o.r<3.5?'Super-Earth' : o.r<8?'Neptune-like':'Gas giant';
      c.rows.push(['Type',cls]); if(o.r) c.rows.push(['Radius',`${o.r} R⊕`]); if(o.ma) c.rows.push(['Mass',`${o.ma} M⊕`]);
      if(o.a) c.rows.push(['Orbit (a)',`${o.a} AU`]);
      c.rows.push(['Discovered',`${o.y||'—'} · ${o.m||''}`]);
      c.links=[{t:'NASA archive',u:`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(o._host||o.n)}`},{t:'SIMBAD',u:simbadId(o._host||o.n)}];
      c.hint=`Planet in the ${o._host||''} system`; break; }
    case 'galaxy': {
      const mly=o.mpc*PC2LY, [ra,dec]=radec(o.dx,o.dy,o.dz);
      c.rows.push(['Distance', mly<10 ? mly.toFixed(2)+' Mly' : fmt(mly)+' Mly'],['Type',`${GTYPE[o.t]||'Galaxy'} · ${o.mpc} Mpc`],['Catalogue',o.id]);
      if(o.kpc) c.rows.push(['Diameter',`${o.kpc} kpc`]);
      c.links=[{t:'SIMBAD',u:simbadId(o.id)},{t:'NED',u:`https://ned.ipac.caltech.edu/byname?objname=${encodeURIComponent(o.id)}`},{t:'Aladin',u:aladin(ra,dec,1)}];
      c.hint=pin; break; }
    case 'star': {
      const [ra,dec]=radec(o.dx,o.dy,o.dz); c.title=o.n||(o.hip?`HIP ${o.hip}`:'Star');
      const q=hygPos(o,tNow()), L=Math.hypot(q[0],q[1],q[2])||1e-9;
      c.rows.push(['Position', coordText(q[0]/L,q[1]/L,q[2]/L)],['Galactic', galText(q[0]/L,q[1]/L,q[2]/L)],['Epoch',`J${epochNow().toFixed(2)} (J2000 + μ)`]);
      const plx=1000/o.d, rg=(o.ep>0&&plx-o.ep>0)?[1000/(plx+o.ep),1000/(plx-o.ep)]:null;
      c.rows.push(['Distance',`${ly(o.d)} · ${o.d} pc${rg?` (${rg[0].toFixed(rg[0]<100?2:0)} – ${rg[1].toFixed(rg[1]<100?2:0)})`:''}`],['Parallax',`${plx.toFixed(o.ep?3:2)}${o.ep?' ± '+o.ep.toFixed(3):''} mas${o.ep?' · '+(plx/o.ep).toFixed(0)+' σ':''}`],['V magnitude',String(o.m)],['Proper motion',pmText(o.pr,o.pd)+(o.epm?` ± ${o.epm.toFixed(2)}`:'')]);
      if(o.ruwe!==undefined) c.rows.push(['RUWE',`${o.ruwe.toFixed(2)}${o.ruwe>1.4?' · astrometry suspect (>1.4: binary or crowded)':' · single-star fit ok'}`]);
      if(o.pr!==undefined){ const vt=KMS_PER_PCYR_MAS*Math.hypot(o.pr||0,o.pd||0)/1000*o.d;
        c.rows.push(['Velocity', o.rv!==undefined ? `v_t ${vt.toFixed(1)} · v_r ${o.rv>0?'+':''}${o.rv.toFixed(1)} · ${Math.hypot(vt,o.rv).toFixed(1)} km/s` : `v_t ${vt.toFixed(1)} km/s · no radial velocity`]); }
      { const u=uvwOf(o); if(u) c.rows.push(['Space velocity U V W',`${u.U.toFixed(1)} · ${u.V.toFixed(1)} · ${u.W.toFixed(1)} km/s (heliocentric; U toward the centre) · ${Math.hypot(u.U,u.V,u.W).toFixed(1)} total`]); }
      if(o.hip) c.rows.push(['Hipparcos',`HIP ${o.hip}`]);
      if(S.pm){ const q=hygPos(o,tNow()), L=Math.hypot(q[0],q[1],q[2]); c.rows.push(['On the timeline',`${L<0.5?(L*206265).toFixed(0)+' AU':ly(L)} away`]); }
      if(o.con) c.rows.push(['Constellation',o.con]);
      c.links=[{t:'SIMBAD',u:o.n?simbadId(o.n):o.hip?simbadId('HIP '+o.hip):simbadCoo(ra,dec,2)},{t:'Aladin',u:aladin(ra,dec,0.5)}];
      c.hint=(o.src==='G'?'Gaia DR3 astrometry (via Hipparcos cross-match), HYG photometry and names':'HYG v4.1 (Hipparcos · Yale · Gliese), not in Gaia DR3')+' · ICRS, position propagated to the displayed epoch'; break; }
    case 'host': {
      const pls=o.p.filter(p=>p.y<=S.year||p.y===0).sort((a,b)=>(a.y||9999)-(b.y||9999));
      const fc=FAC[o.fac]||FAC.other, [ra,dec]=radec(o.x/o.d,o.y/o.d,o.z/o.d);
      { const q=hostPos(o,tNow()), L=Math.hypot(q[0],q[1],q[2])||1e-9;
        c.rows.push(['Position', coordText(q[0]/L,q[1]/L,q[2]/L)],['Galactic', galText(q[0]/L,q[1]/L,q[2]/L)]); }
      c.rows.push(['Distance',`${ly(o.d)} · ${fmt(o.d)} pc · ϖ ${(1000/o.d).toFixed(2)} mas`],['Star',o.sp?o.sp:(o.t?fmt(o.t)+' K':'—')],['Discovered',String(o.fy||'—')],['Instrument',fc.l]);
      if(o.pr!==undefined||o.pd!==undefined) c.rows.push(['Proper motion',pmText(o.pr,o.pd)]);
      if(o.rv!==undefined) c.rows.push(['Radial velocity',`${o.rv>0?'+':''}${(+o.rv).toFixed(1)} km/s`]);
      if(S.pm){ const q=hostPos(o,tNow()), L=Math.hypot(q[0],q[1],q[2]); c.rows.push(['On the timeline',`${ly(L)} away`]); }
      c.instrumentColor=fc.c;
      c.planets=pls.slice(0,6).map(p=>({n:p.n, y:p.y||'', extra:p.r?`${p.r} R⊕`:(p.ma?`${p.ma} M⊕`:'')}));
      c.planetsTotal=pls.length;
      c.links=[{t:'NASA archive',u:`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(o.h)}`},{t:'SIMBAD',u:simbadId(o.h)},{t:'Aladin',u:aladin(ra,dec,0.4)}];
      c.hint='Click → fly into the system and see the orbits'; break; }
  }
  // the observer's view of it: apparent place, alt/az, rise and set (observe.js)
  try{ const d=dirForObserver(o,k); if(d) for(const r of observeRows(d)) c.rows.push(r); }catch(_){}
  // where the numbers come from: the catalogue, its version, the build they were packed in
  c.rows.push(['Provenance', provOf(o,k)]);
  return c;
}
const PROV={ star:o=>o.src==='G'?'Gaia DR3 astrometry (Hipparcos cross-match) + HYG v4.1 photometry':'HYG v4.1', host:()=>'NASA Exoplanet Archive pscomppars (positions J2015.5 → J2000)',
  gpick:o=>o.gpick==='gaia'?'Gaia DR3, Bailer-Jones (2021) distances':o.gpick==='web'?'2MRS (Huchra et al. 2012)':o.gpick==='qso'?'Milliquas (Flesch 2023)':'JPL SBDB', user:o=>`your data (${(USER.sets[o.set]||{}).src||'file'})`,
  galaxy:()=>'Local Volume catalogue (Karachentsev et al.)', dso:()=>'curated catalogue (catalog.json)', pulsar:()=>'ATNF pulsar catalogue', cluster:()=>'curated catalogue (catalog.json)',
  planet:o=>o._src==='horizons'?'JPL Horizons DE441 table (2015–2045)':'JPL Keplerian elements', dwarf:o=>o._src==='horizons'?'JPL Horizons DE441 table':'JPL Keplerian elements', moon:()=>'JPL Horizons (the Moon) / mean elements', sun:()=>'at the origin',
  satellite:()=>'CelesTrak elements (live)', cme:()=>'NASA DONKI (live)', neo:()=>'NASA NEO (live)', probe:()=>'JPL Horizons state vectors (pipeline)', tno:()=>'JPL SBDB', comet:()=>'JPL SBDB', asteroid:()=>'JPL SBDB', iso:()=>'JPL SBDB' };
function provOf(o,k){ const f=PROV[k]; const src=f?f(o):'catalogue'; return `${src} · catalogue build ${META.built||'?'} · app ${__BUILD__}`; }
// geocentric ICRS direction of an object, for the observer rows: stars and deep sky from
// their position (the Sun's and the Earth's view agree to a parallax), solar-system bodies
// from the table or the elements relative to the Earth
function dirForObserver(o,k){
  if(k==='sun'||k==='planet'||k==='dwarf'||k==='moon'||k==='tno'||k==='probe'||k==='comet'||k==='asteroid'||k==='iso'||k==='neo'){
    if(k==='planet'||k==='dwarf'){ const a=ephemApparent(o.n, jdNow()); if(a) return icrsOfDate(a.dir, jdNow()); }   // light-time included; apparentOf is applied again downstream, so undo its frame here
    const E=SOLAR_BODIES.find(b=>b.n==='Earth'); if(!E||!E._e) return null;
    const P=k==='sun'?[0,0,0]:k==='moon'?(SOLAR_BODIES.find(b=>b.n===o.parent)||{})._e:o._e; if(!P) return null;
    const q=eclDir(P[0]-E._e[0],P[1]-E._e[1],P[2]-E._e[2]), l=Math.hypot(q[0],q[1],q[2])||1; return [q[0]/l,q[1]/l,q[2]/l]; }
  const p=physPos(o); if(!p) return o._dir||(o.dx!==undefined?[o.dx,o.dy,o.dz]:null); const l=Math.hypot(p[0],p[1],p[2])||1; return [p[0]/l,p[1]/l,p[2]/l];
}
