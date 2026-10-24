// Solar-system bodies and their orbital mechanics (Standish planets, JPL small bodies, moon ephemerides).
import { CAT, DATA } from './data.js';
import { ephemPos } from './ephem.js';
import { S } from './state.js';
import { AU_PC, scale } from './view.js';
// ---- our solar system (real radii in km, semi-major axis in AU) ----
export const SUN={n:'Sun',rk:696340,c:[255,238,178],slug:'sun',kind:'Star'};
// k = JPL Keplerian elements [a,ȧ, e,ė, I,İ, L,L̇, ϖ,ϖ̇, Ω,Ω̇] (deg, per century) → real positions
export const PLANETS=[
 {n:'Mercury',a:0.387,rk:2439.7,c:[176,168,158],slug:'mercury',moons:[],
   k:[0.38709927,0.00000037,0.20563593,0.00001906,7.00497902,-0.00594749,252.25032350,149472.67411175,77.45779628,0.16047689,48.33076593,-0.12534081]},
 {n:'Venus',a:0.723,rk:6051.8,c:[222,196,140],slug:'venus',moons:[],
   k:[0.72333566,0.00000390,0.00677672,-0.00004107,3.39467605,-0.00078890,181.97909950,58517.81538729,131.60246718,0.00268329,76.67984255,-0.27769418]},
 {n:'Earth',a:1,rk:6371,c:[104,157,222],slug:'earth',moons:[
   {n:'Moon',am:384,rk:1737,c:[188,188,190]}],
   k:[1.00000261,0.00000562,0.01671123,-0.00004392,-0.00001531,-0.01294668,100.46457166,35999.37244981,102.93768193,0.32327364,0.0,0.0]},
 {n:'Mars',a:1.524,rk:3389.5,c:[209,122,74],slug:'mars',moons:[
   {n:'Phobos',am:9.4,rk:11,c:[150,140,130]},{n:'Deimos',am:23.5,rk:6,c:[150,140,130]}],
   k:[1.52371034,0.00001847,0.09339410,0.00007882,1.84969142,-0.00813131,-4.55343205,19140.30268499,-23.94362959,0.44441088,49.55953891,-0.29257343]},
 {n:'Jupiter',a:5.203,rk:69911,c:[214,182,142],slug:'jupiter',moons:[
   {n:'Amalthea',am:181,rk:83,c:[196,140,110]},{n:'Io',am:422,rk:1821,c:[226,214,148]},{n:'Europa',am:671,rk:1560,c:[212,202,182]},
   {n:'Ganymede',am:1070,rk:2634,c:[170,162,152]},{n:'Callisto',am:1883,rk:2410,c:[128,120,120]}],
   k:[5.20288700,-0.00011607,0.04838624,-0.00013253,1.30439695,-0.00183714,34.39644051,3034.74612775,14.72847983,0.21252668,100.47390909,0.20469106]},
 {n:'Saturn',a:9.537,rk:58232,c:[224,206,158],slug:'saturn',ring:true,moons:[
   {n:'Mimas',am:185,rk:198,c:[214,214,218]},{n:'Enceladus',am:238,rk:252,c:[222,222,226]},{n:'Tethys',am:295,rk:531,c:[200,200,204]},{n:'Dione',am:377,rk:561,c:[195,195,200]},{n:'Rhea',am:527,rk:764,c:[182,182,186]},
   {n:'Titan',am:1222,rk:2575,c:[214,170,86]},{n:'Iapetus',am:3561,rk:735,c:[150,140,130]}],
   k:[9.53667594,-0.00125060,0.05386179,-0.00050991,2.48599187,0.00193609,49.95424423,1222.49362201,92.59887831,-0.41897216,113.66242448,-0.28867794]},
 {n:'Uranus',a:19.191,rk:25362,c:[170,214,222],slug:'uranus',uring:true,moons:[
   {n:'Miranda',am:130,rk:236,c:[170,170,175]},{n:'Ariel',am:191,rk:579,c:[178,178,182]},{n:'Umbriel',am:266,rk:585,c:[150,150,155]},{n:'Titania',am:436,rk:789,c:[172,172,176]},{n:'Oberon',am:583,rk:761,c:[160,155,155]}],
   k:[19.18916464,-0.00196176,0.04725744,-0.00004397,0.77263783,-0.00242939,313.23810451,428.48202785,170.95427630,0.40805281,74.01692503,0.04240589]},
 {n:'Neptune',a:30.07,rk:24622,c:[92,126,222],slug:'neptune',moons:[
   {n:'Proteus',am:118,rk:210,c:[150,150,155]},{n:'Triton',am:355,rk:1353,c:[192,196,202]},{n:'Nereid',am:5514,rk:170,c:[170,170,176]}],
   k:[30.06992276,0.00026291,0.00859048,0.00005105,1.77004347,0.00035372,-55.12002969,218.45945325,44.96476227,-0.32241464,131.78422574,-0.00508664]},
];
// kd = JPL SBDB osculating elements {a,e,i,om(Ω),w(ω),ma,n(°/day),ep(JD)} → real positions
const DWARFS=[
 {n:'Ceres',a:2.77,rk:473,c:[150,145,140],slug:'dwarf-planets',moons:[],
   kd:{a:2.765552595,e:0.079692295,i:10.58802780,om:80.24862682,w:73.29421453,ma:274.4193464,n:0.21430445,ep:2461200.5}},
 {n:'Pluto',a:39.59,rk:1188,c:[202,176,150],slug:'pluto',moons:[
   {n:'Charon',am:19.6,rk:606,c:[172,166,166]},{n:'Nix',am:48.7,rk:22,c:[180,180,184]},{n:'Hydra',am:64.7,rk:25,c:[180,180,184]}],
   kd:{a:39.58862939,e:0.251837878,i:17.14771141,om:110.2923841,w:113.7090015,ma:38.68366347,n:0.003956839,ep:2457588.5}},
 {n:'Haumea',a:43.06,rk:816,c:[212,206,200],slug:'haumea',moons:[],
   kd:{a:43.06029024,e:0.194443015,i:28.20847393,om:121.7860561,w:240.6905473,ma:223.2104119,n:0.003488098,ep:2461200.5}},
 {n:'Makemake',a:45.57,rk:715,c:[192,160,140],slug:'makemake',moons:[],
   kd:{a:45.57093317,e:0.158888995,i:29.02785604,om:79.29483382,w:297.0922733,ma:169.9379962,n:0.003203850,ep:2461200.5}},
 {n:'Eris',a:67.93,rk:1163,c:[206,206,212],slug:'eris',moons:[],
   kd:{a:67.93394688,e:0.438238535,i:43.92582795,om:36.00477044,w:150.7949236,ma:211.7744343,n:0.001760248,ep:2461200.5}},
];
// large asteroids & famous comets (JPL SBDB osculating elements, per-object epoch)
export const SMALL=[
 {n:'Vesta',t:'AST',rk:262,kd:{a:2.361365965,e:0.090203744,i:7.143925545,om:103.7012933,w:151.4686478,ma:81.19015608,n:0.271618361,ep:2461200.5}},
 {n:'Pallas',t:'AST',rk:256,kd:{a:2.769559011,e:0.230700100,i:34.93279322,om:172.8866193,w:310.9699162,ma:254.2496522,n:0.213839603,ep:2461200.5}},
 {n:'Hygiea',t:'AST',rk:217,kd:{a:3.150974034,e:0.106709274,i:3.829529946,om:283.1198928,w:312.4242387,ma:252.0344242,n:0.176212551,ep:2461200.5}},
 {n:'Juno',t:'AST',rk:127,kd:{a:2.670989527,e:0.255699984,i:12.98659237,om:169.8115953,w:247.8950743,ma:262.7322945,n:0.225785369,ep:2461200.5}},
 {n:'Psyche',t:'AST',rk:113,kd:{a:2.925720466,e:0.134932474,i:3.098749116,om:149.9753859,w:230.0326783,ma:79.76939505,n:0.196949476,ep:2461200.5}},
 {n:'Eros',t:'AST',rk:8.4,kd:{a:1.458243717,e:0.222877963,i:10.82854410,om:304.2679713,w:178.9181319,ma:62.51145502,n:0.559704635,ep:2461200.5}},
 {n:'Bennu',t:'AST',rk:0.24,kd:{a:1.126391026,e:0.203745076,i:6.034943770,om:2.060866196,w:66.22306084,ma:101.7039520,n:0.824461350,ep:2455562.5}},
 {n:'Ryugu',t:'AST',rk:0.45,kd:{a:1.190918932,e:0.191073005,i:5.866442495,om:251.2897124,w:211.6089939,ma:62.34067434,n:0.758369354,ep:2461200.5}},
 {n:'1P/Halley',t:'COM',rk:5.5,kd:{a:17.92863505,e:0.967935996,i:162.1905300,om:59.09894721,w:112.2414315,ma:274.3823371,n:0.012983244,ep:2439875.5}},
 {n:'2P/Encke',t:'COM',rk:2.4,kd:{a:2.219688710,e:0.847749697,i:11.41227811,om:334.1935846,w:187.1342464,ma:243.1260693,n:0.298034105,ep:2459847.5}},
 {n:'67P C-G',t:'COM',rk:2,kd:{a:3.462249490,e:0.640908131,i:7.040294907,om:50.13557380,w:12.79824973,ma:8.859927419,n:0.152991229,ep:2457305.5}},
 {n:'Hale-Bopp',t:'COM',rk:30,kd:{a:177.4333839,e:0.994981003,i:89.28759425,om:282.7334214,w:130.4146671,ma:3.878386339,n:0.000417014,ep:2459837.5}},
 {n:'9P/Tempel 1',t:'COM',rk:3,kd:{a:3.146133759,e:0.509702833,i:10.47342815,om:68.75357468,w:179.1972754,ma:336.5854439,n:0.176619357,ep:2457470.5}},
];
SMALL.forEach(o=>{ o.kind = o.t==='COM' ? 'Comet' : 'Asteroid'; });
// ---- all numbered comets with well-determined orbits (JPL SBDB, e<0.99) ----
const COMETS2=CAT.comets;
COMETS2.forEach(o=>{ o.kind='Comet'; });
SMALL.push.apply(SMALL,COMETS2);
// ---- complete outer solar system: human probes + trans-Neptunian objects/Centaurs ----
export const PROBES=CAT.probes;
export const TNOS=CAT.tnos;
TNOS.forEach(t=>{ t.kind=/Chariklo|Chiron|Pholus/.test(t.n)?'Centaur':'Trans-Neptunian object'; t.moons=[]; t.slug='dwarf-planets'; });
PROBES.forEach(p=>{ p.kind='Spacecraft'; p.moons=[]; });
// ---- real moon ephemerides (JPL Horizons state vectors -> circular propagation) ----
export const MOON_EPH=CAT.moonEph;;
// A moon's position about its planet from JPL osculating elements (catalog.json
// `moonEph`: a in km, ecliptic J2000). Kepler's equation gives the true phase, plane and
// eccentricity — the Moon's orbit is 5 % eccentric, Nereid's 75 %. Returns the world-axis
// direction (ecliptic → world, as eclToWorld) and the distance in km.
export function moonAt(kd,jd){
  const el=keplerSB(kd,jd), q=orbPoint(el,el.E), r=Math.hypot(q[0],q[1],q[2])||1, d=eclDir(q[0],q[1],q[2]);
  return { dir:[d[0]/r, d[1]/r, d[2]/r], r };
}
export function moonOrbitPoint(kd,E){              // a point of the orbit outline (world axes, km)
  const el={a:kd.a,e:kd.e,I:kd.i*D2R,om:kd.w*D2R,O:kd.om*D2R,E}, q=orbPoint(el,E);
  return eclDir(q[0],q[1],q[2]);
}
const EXTRA_MOONS=CAT.extraMoons;
for(const b of [...PLANETS,...DWARFS]){ const ex=EXTRA_MOONS[b.n];
  if(ex) for(const m of ex){ m.minor=true; m.c=[152,152,158]; b.moons.push(m); } }
export const SUNHIT={sunhit:true};
PLANETS.forEach(p=>{p.kind='Planet'; p.moons.forEach(m=>{m.kind='Moon'; m.parent=p.n; m.pc=p.c;});
  if(CAT.planetsOsc&&CAT.planetsOsc[p.n]) p.osc=CAT.planetsOsc[p.n]; });
DWARFS.forEach(p=>{p.kind='Dwarf planet'; p.moons.forEach(m=>{m.kind='Moon'; m.parent=p.n; m.pc=p.c;});});
SUN.kind='Star';
export const SOLAR_BODIES=[...PLANETS,...DWARFS,...TNOS];

// ---- real body positions (Standish planets + JPL small-body dwarfs), time-aware ----
export const D2R=Math.PI/180;
const NOW=new Date();
const EPOCH_JD=NOW.getTime()/86400000 + 2440587.5;      // "today" at load
export function solarJD(){ return EPOCH_JD + S.tOffsetDays; }   // shifted by the time-travel slider
function jdToDate(jd){ return new Date((jd-2440587.5)*86400000); }
export function dateStr(jd){ return jdToDate(jd).toLocaleDateString('en-US',{day:'2-digit',month:'2-digit',year:'numeric'}); }
export function keplerEcl(k,T,E0){
  const a=k[0]+k[1]*T, e=k[2]+k[3]*T, I=(k[4]+k[5]*T)*D2R;
  const L=k[6]+k[7]*T, wb=k[8]+k[9]*T, O=(k[10]+k[11]*T)*D2R;
  const om=wb*D2R-O;                            // argument of perihelion = ϖ − Ω
  let M=(L-wb)*D2R; M=Math.atan2(Math.sin(M),Math.cos(M));
  let E=(E0!==undefined)?E0:M;
  for(let i=0;i<6;i++) E=E-(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
  return {a,e,I,om,O,E};
}
export function orbPoint(el,E){                        // ecliptic xyz (AU) for eccentric anomaly E
  const {a,e,I,om,O}=el;
  const xp=a*(Math.cos(E)-e), yp=a*Math.sqrt(1-e*e)*Math.sin(E);
  const cO=Math.cos(O),sO=Math.sin(O),cI=Math.cos(I),sI=Math.sin(I),cw=Math.cos(om),sw=Math.sin(om);
  return [ (cw*cO-sw*sO*cI)*xp + (-sw*cO-cw*sO*cI)*yp,
           (cw*sO+sw*cO*cI)*xp + (-sw*sO+cw*cO*cI)*yp,
           (sw*sI)*xp + (cw*sI)*yp ];
}
// small-body elements → {a,e,I,om,O,E}, propagated to JD (robust for high eccentricity)
export function keplerSB(kd,jd){
  let M=(kd.ma + kd.n*(jd-kd.ep))*D2R; M=Math.atan2(Math.sin(M),Math.cos(M));
  const e=kd.e; let E=M+e*Math.sin(M)*(1+e*Math.cos(M));
  for(let i=0;i<18;i++){ const dE=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E)); E-=dE; if(Math.abs(dE)<1e-8)break; }
  return {a:kd.a,e:kd.e,I:kd.i*D2R,om:kd.w*D2R,O:kd.om*D2R,E};
}
// ---- frames ----
// The catalogues are equatorial J2000: x toward the vernal equinox, z toward the celestial
// north pole. The solar system is computed in the ecliptic J2000 frame, and ONE rotation
// by the obliquity puts it into the same sky. (It used to be an axis swap, which stood the
// whole solar system 90° against the stars — the Sun was in the wrong constellation.)
export const OBLQ=23.4392911*D2R, cOB=Math.cos(OBLQ), sOB=Math.sin(OBLQ);
export function eclDir(xe,ye,ze){ return [xe, ye*cOB-ze*sOB, ye*sOB+ze*cOB]; }
// ecliptic AU → unified world coords (direction in the equatorial frame, radius scaled)
export function eclToWorld(xe,ye,ze){
  const r=Math.hypot(xe,ye,ze)||1e-12, R=scale(r*AU_PC)/r;
  return [xe*R, (ye*cOB-ze*sOB)*R, (ye*sOB+ze*cOB)*R];
}
// recompute every body's orbit elements + position for a given Julian date
// Orbit elements of a body for a date. Planets carry two sets: JPL osculating elements
// at a recent epoch (catalog.json `planetsOsc`, exact to arcminutes near the epoch) and
// the long-term Standish formulas (good to a degree over centuries). Within ±2 years of
// the epoch the osculating set wins; beyond, a Kepler orbit would drift with perturbations.
const OSC_SPAN=730;
export function elementsAt(b,jd){
  if(b.osc && Math.abs(jd-b.osc.ep)<OSC_SPAN) return keplerSB(b.osc,jd);
  if(b.k) return keplerEcl(b.k,(jd-2451545.0)/36525);
  return b.kd ? keplerSB(b.kd,jd) : null;
}
export function updateSolarPositions(jd){
  for(const b of SOLAR_BODIES){
    b._el = elementsAt(b,jd);
    b._e  = b._el ? orbPoint(b._el,b._el.E) : null;
    const q=ephemPos(b.n,jd);                    // the Horizons table wins while the date is inside it
    if(q){ b._e=q; b._src='horizons'; } else b._src='elements';
    if(b._e) b._r = Math.hypot(b._e[0],b._e[1],b._e[2]);
  }
  for(const p of PROBES){ const dt=jd-p.ep;
    p._e=[p.p[0]+p.v[0]*dt, p.p[1]+p.v[1]*dt, p.p[2]+p.v[2]*dt];
    p._r=Math.hypot(p._e[0],p._e[1],p._e[2]); }
}

// discovery-instrument categories → colour + label
export const FAC={
  kepler:{c:[122,162,255],l:'Kepler'}, tess:{c:[79,214,200],l:'TESS'},
  k2:{c:[168,150,255],l:'K2'}, rv:{c:[255,207,107],l:'Radial velocity'},
  micro:{c:[255,143,176],l:'Microlensing'}, imaging:{c:[127,224,138],l:'Direct imaging'},
  ground:{c:[214,217,226],l:'Transit (ground)'}, other:{c:[150,161,190],l:'Other'}};
export const HYG = DATA.hyg||[];
// boundary of the well-charted solar neighbourhood (parsecs) = 90th percentile
