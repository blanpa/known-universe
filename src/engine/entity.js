// One place that knows what an object IS.
import { objWorld } from './actions.js';
import { PC2LY } from './data.js';
import { fmt } from './hud.js';
import { hostPos, hygPos, tNow } from './motion.js';
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
function radecText(dx,dy,dz){
  const [ra,dec]=radec(dx,dy,dz);
  const hh=Math.floor(ra/15), mm=Math.round((ra/15-hh)*60);
  return `${hh}h ${String(mm).padStart(2,'0')}m · ${dec>=0?'+':'−'}${Math.abs(dec).toFixed(1)}°`;
}
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
      c.title=o.n||`Row ${o.i+1}`; c.kindLabel=`Your data · ${USER.name}`;
      c.rows.push(['Type',`Imported · ${USER.name}`],['RA / Dec',radecText(o.dx,o.dy,o.dz)]);
      c.rows.push(['Distance', o.noDist ? 'not given — placed on the sky' : `${ly(o.d)} · ${o.d<100?o.d.toFixed(2):fmt(o.d)} pc`]);
      if(o.m!==undefined) c.rows.push(['Magnitude',o.m.toFixed(2)]);
      if(o.pr||o.pd) c.rows.push(['Proper motion',`${o.pr.toFixed(1)} · ${o.pd.toFixed(1)} mas/yr · ${Math.hypot(o.pr,o.pd).toFixed(0)} total`]);
      for(const [kx,vx] of Object.entries(o.x||{}).slice(0,8)) c.rows.push([kx,String(vx).slice(0,60)]);
      c.links=[{t:'SIMBAD',u:simbadCoo(o.ra,o.dec,2)},{t:'Aladin',u:aladin(o.ra,o.dec,0.3)}];
      c.hint='from your file · the links query the catalogues at this position'; break; }
    case 'gpick': {
      const [ra,dec]=radec(o._dir[0],o._dir[1],o._dir[2]);
      if(o.gpick==='gaia') c.rows.push(['Type','Star · Gaia DR3'],['Mag G',o.mag.toFixed(1)],['Colour bp−rp',o.bprp.toFixed(2)],['Distance',`${ly(o.d)} · ${o.d.toFixed(1)} pc`]);
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
      const [ra,dec]=radec(o.dx,o.dy,o.dz); c.title=o.n||'Star';
      c.rows.push(['Distance',`${ly(o.d)} · ${o.d} pc`],['Apparent mag.',String(o.m)]);
      if(tNow()){ const q=hygPos(o,tNow()), L=Math.hypot(q[0],q[1],q[2]); c.rows.push(['On the timeline',`${L<0.5?(L*206265).toFixed(0)+' AU':ly(L)} away`]); }
      if(o.con) c.rows.push(['Constellation',o.con]);
      c.rows.push(['RA / Dec',radecText(o.dx,o.dy,o.dz)]);
      c.links=[{t:'SIMBAD',u:o.n?simbadId(o.n):simbadCoo(ra,dec,2)},{t:'Aladin',u:aladin(ra,dec,0.5)}];
      c.hint='Background star · HYG catalogue'; break; }
    case 'host': {
      const pls=o.p.filter(p=>p.y<=S.year||p.y===0).sort((a,b)=>(a.y||9999)-(b.y||9999));
      const fc=FAC[o.fac]||FAC.other, [ra,dec]=radec(o.x/o.d,o.y/o.d,o.z/o.d);
      c.rows.push(['Distance',`${ly(o.d)} · ${fmt(o.d)} pc`],['Star',o.sp?o.sp:(o.t?fmt(o.t)+' K':'—')],['Discovered',String(o.fy||'—')],['Instrument',fc.l]);
      if(tNow()){ const q=hostPos(o,tNow()), L=Math.hypot(q[0],q[1],q[2]); c.rows.push(['On the timeline',`${ly(L)} away`]); }
      c.instrumentColor=fc.c;
      c.planets=pls.slice(0,6).map(p=>({n:p.n, y:p.y||'', extra:p.r?`${p.r} R⊕`:(p.ma?`${p.ma} M⊕`:'')}));
      c.planetsTotal=pls.length;
      c.links=[{t:'NASA archive',u:`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(o.h)}`},{t:'SIMBAD',u:simbadId(o.h)},{t:'Aladin',u:aladin(ra,dec,0.4)}];
      c.hint='Click → fly into the system and see the orbits'; break; }
  }
  return c;
}
