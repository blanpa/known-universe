// Known Universe engine — the renderer + app logic (framework-free by design).
// Svelte owns the DOM structure; this module binds to it by element id.
import { LIVE, startLive, satEcl, groundEcl, activeShowers } from './live.js';
import { svgIcon } from './icons.js';
import { UI, api } from './api.js';
export { UI, api };

// This module runs at import time and expects the data to be there: main.js imports it
// dynamically once data.json and catalog.json have arrived (or were embedded).
const DATA = window.__DATA__, META = DATA.meta, STARS = DATA.stars;
// the baked catalogues (pulsars, clusters, comets, moon ephemerides, …) now ship as
// site/data/catalog.json — loaded by main.js next to data.json, embedded in the artifact
const CAT = window.__CATALOG__ || {};
const PC2LY = 3.261564;
const cv = document.getElementById('sky'), ctx = cv.getContext('2d');
// ---- label pipeline: halo + priority declutter -------------------------------
// Every canvas label goes through ctx.fillText. Instead of painting immediately we
// queue it, then flush once per frame highest-priority-first, dropping any label whose
// box overlaps one already placed. Two consequences, both wanted: labels never bury each
// other in dense fields, and they all land on top of the geometry.
const _rawFillText = ctx.fillText.bind(ctx);
const LBL = { q: [], on: true, prio: 50, grid: new Map(), cell: 48 };
const LBLW = new Map();                 // font+text -> measured width
// priority tiers — higher wins a collision. Set LBL.prio before a draw section.
const P_HUD = 100, P_SEL = 92, P_SOLAR = 80, P_PROBE = 70, P_DEEP = 62,
      P_STAR = 52, P_SMALL = 40, P_GAL = 30, P_GRID = 14;
// The halo is eight 1-px-offset fills, not a strokeText: filled glyphs come from the
// glyph cache (a bitmap blit each), a stroked glyph is an outline path rasterised per
// frame — the difference is what makes ~80 labels affordable in a software canvas.
const HALO_DX = [1, -1, 0, 0, 1, 1, -1, -1], HALO_DY = [0, 0, 1, -1, 1, -1, 1, -1];
function _paint(s, x, y, mw, st) {
  ctx.font = st.f; ctx.textAlign = st.a; ctx.textBaseline = st.b;
  ctx.globalAlpha = st.g;
  ctx.fillStyle = 'rgba(5,7,14,0.6)';
  for (let k = 0; k < 8; k++) _rawFillText(s, x + HALO_DX[k], y + HALO_DY[k], mw);
  ctx.fillStyle = st.c;
  _rawFillText(s, x, y, mw);
}
ctx.fillText = (s, x, y, mw) => {
  if (!S.labels) return;                          // clean view: one switch kills all text
  const st = { f: ctx.font, c: ctx.fillStyle, a: ctx.textAlign, b: ctx.textBaseline, g: ctx.globalAlpha };
  if (!LBL.on) { _paint(s, x, y, mw, st); ctx.globalAlpha = st.g; return; }
  LBL.q.push({ s, x, y, mw, p: LBL.prio, st });
};
function lblReset() { LBL.q.length = 0; LBL.grid.clear(); LBL.prio = P_STAR; }
// uniform-grid occupancy test — labels are small and clustered, so a hash beats an O(n²) sweep
function lblFits(x0, y0, x1, y1, place) {
  const c = LBL.cell;
  const gx0 = Math.floor(x0 / c), gx1 = Math.floor(x1 / c),
        gy0 = Math.floor(y0 / c), gy1 = Math.floor(y1 / c);
  for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
    const bucket = LBL.grid.get(gx * 8192 + gy); if (!bucket) continue;
    for (let i = 0; i < bucket.length; i++) { const b = bucket[i];
      if (x0 < b[2] && x1 > b[0] && y0 < b[3] && y1 > b[1]) return false; }
  }
  if (place) { const box = [x0, y0, x1, y1];
    for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
      const k = gx * 8192 + gy; let bucket = LBL.grid.get(k);
      if (!bucket) LBL.grid.set(k, bucket = []); bucket.push(box); } }
  return true;
}
function lblFlush() {
  if (!LBL.q.length) return;
  const q = LBL.q;
  // stable sort by priority, high first — draw order breaks ties inside a tier
  for (let i = 0; i < q.length; i++) q[i]._i = i;
  q.sort((a, b) => (b.p - a.p) || (a._i - b._i));
  const pf = ctx.font, pc = ctx.fillStyle, pa = ctx.textAlign, pb = ctx.textBaseline, pg = ctx.globalAlpha;
  for (let i = 0; i < q.length; i++) {
    const it = q[i], st = it.st;
    ctx.font = st.f;
    const fs = parseFloat(st.f) || 10;
    // measureText is the expensive part of decluttering and the same strings recur every
    // frame — cache by font+text, and bound the map so a time slider cannot grow it forever
    const mk = st.f + '\u0000' + it.s;
    let w = LBLW.get(mk);
    if (w === undefined) { if (LBLW.size > 4000) LBLW.clear();
      w = ctx.measureText(it.s).width; LBLW.set(mk, w); }
    if (it.mw !== undefined && w > it.mw) w = it.mw;
    let x0 = it.x;
    if (st.a === 'center') x0 = it.x - w / 2; else if (st.a === 'right' || st.a === 'end') x0 = it.x - w;
    let y0 = it.y - fs * 0.80, y1 = it.y + fs * 0.26;
    if (st.b === 'top' || st.b === 'hanging') { y0 = it.y; y1 = it.y + fs * 1.06; }
    else if (st.b === 'middle') { y0 = it.y - fs * 0.53; y1 = it.y + fs * 0.53; }
    // off-screen labels neither draw nor block anything on screen; a label that would
    // be sliced by the right edge is dropped rather than shown as a truncated word
    if (x0 > W || x0 + w < 0 || y0 > H || y1 < 0) continue;
    if (it.p < P_HUD && (x0 + w > W - 2 || x0 < -2)) continue;
    if (!lblFits(x0 - 1, y0 - 1, x0 + w + 1, y1 + 1, true) && it.p < P_HUD) continue;
    _paint(it.s, it.x, it.y, it.mw, st);
  }
  ctx.font = pf; ctx.fillStyle = pc; ctx.textAlign = pa; ctx.textBaseline = pb; ctx.globalAlpha = pg;
}
// UI api FIRST: layer toggles + search stay usable even if a later boot step fails
api.clickToggle=clickToggle; api.doSearch=doSearch; api.suggest=suggestList;
api.toggleFac=toggleFac; api.facColorToggle=facColorToggle;
let W=0,H=0,DPR=1,GLDPR=1;

// ---- precompute direction + radius, normalization ----
const dists = STARS.map(s=>s.d).slice().sort((a,b)=>a-b);
const R0 = dists[Math.floor(dists.length*0.90)] || META.maxDist;   // 90th pct -> radius 1
const MAXD = META.maxDist;
STARS.forEach(s=>{
  const r=s.d||1e-6;
  s._dx=s.x/r; s._dy=s.y/r; s._dz=s.z/r; s._r=r;
  s._col=tempColor(s.t);
  s._sr=starRadius(s);                       // stellar radius in R☉ — drives the glyph size
  s._search=(s.h+' '+s.p.map(p=>p.n).join(' ')).toLowerCase();
});

// ---- state ----
const S={ yaw:0.5, pitch:-0.5, camZ:3.0, year:2026, tOffsetDays:0,
  autorot:false, freelook:false, rings:true, veil:true, size:true, galaxies:true,
  hyg:true, gpu:true, gaia:true, web:true, qso:true, ob:true, vars:true, edge:true, facColor:false, facHidden:new Set(),
  solar:true, moons:true, mw:true, mw3d:true, dso:true, psr:true, oclu:true, ast:true, tno:true, probes:true, helio:true, belt:true, con:true, hz:true, lag:true, lens:true, pm:false, pmYears:0,
  cme:true, neo:true, sat:true, sunAR:true, met:true, iso:true, eht:false, labels:true,
  radio:true, bubble:true, grid:false, ggrid:false,
  realScale:false,
  hover:null, pinned:null, focusStar:null, focusT:0 };

// ---- our solar system (real radii in km, semi-major axis in AU) ----
const SUN={n:'Sun',rk:696340,c:[255,238,178],slug:'sun',kind:'Star'};
// k = JPL Keplerian elements [a,ȧ, e,ė, I,İ, L,L̇, ϖ,ϖ̇, Ω,Ω̇] (deg, per century) → real positions
const PLANETS=[
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
const SMALL=[
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
const PROBES=CAT.probes;
const TNOS=CAT.tnos;
TNOS.forEach(t=>{ t.kind=/Chariklo|Chiron|Pholus/.test(t.n)?'Centaur':'Trans-Neptunian object'; t.moons=[]; t.slug='dwarf-planets'; });
PROBES.forEach(p=>{ p.kind='Spacecraft'; p.moons=[]; });
// ---- real moon ephemerides (JPL Horizons state vectors -> circular propagation) ----
const MOON_EPH=CAT.moonEph;;
function moonDirAt(eph,ang){                       // rotate epoch vector around the orbit normal
  const ca=Math.cos(ang), sa=Math.sin(ang), p0=eph.p, n=eph.n;
  const dot=p0[0]*n[0]+p0[1]*n[1]+p0[2]*n[2];
  const cr=[n[1]*p0[2]-n[2]*p0[1], n[2]*p0[0]-n[0]*p0[2], n[0]*p0[1]-n[1]*p0[0]];
  const e=[p0[0]*ca+cr[0]*sa+n[0]*dot*(1-ca),
           p0[1]*ca+cr[1]*sa+n[1]*dot*(1-ca),
           p0[2]*ca+cr[2]*sa+n[2]*dot*(1-ca)];
  return [e[0], e[2], e[1]];                       // ecliptic -> world (matches eclToWorld)
}
function camDir2(v){                               // world direction -> screen direction
  camTrig();
  const x1=v[0]*_cyw+v[2]*_syw, z1=-v[0]*_syw+v[2]*_cyw, y2=v[1]*_cp2 - z1*_sp2;
  return [x1,-y2];
}
// allocation-free variant for the per-galaxy position-angle maths
let _d2x=0,_d2y=0;
function camDir2i(vx,vy,vz){
  const x1=vx*_cyw+vz*_syw, z1=-vx*_syw+vz*_cyw;
  _d2x=x1; _d2y=-(vy*_cp2 - z1*_sp2);
}
const EXTRA_MOONS=CAT.extraMoons;
for(const b of [...PLANETS,...DWARFS]){ const ex=EXTRA_MOONS[b.n];
  if(ex) for(const m of ex){ m.minor=true; m.c=[152,152,158]; b.moons.push(m); } }
const SUNHIT={sunhit:true};
PLANETS.forEach(p=>{p.kind='Planet'; p.moons.forEach(m=>{m.kind='Moon'; m.parent=p.n; m.pc=p.c;});});
DWARFS.forEach(p=>{p.kind='Dwarf planet'; p.moons.forEach(m=>{m.kind='Moon'; m.parent=p.n; m.pc=p.c;});});
SUN.kind='Star';
const SOLAR_BODIES=[...PLANETS,...DWARFS,...TNOS];

// ---- real body positions (Standish planets + JPL small-body dwarfs), time-aware ----
const D2R=Math.PI/180;
const NOW=new Date();
const EPOCH_JD=NOW.getTime()/86400000 + 2440587.5;      // "today" at load
function solarJD(){ return EPOCH_JD + S.tOffsetDays; }   // shifted by the time-travel slider
function jdToDate(jd){ return new Date((jd-2440587.5)*86400000); }
function dateStr(jd){ return jdToDate(jd).toLocaleDateString('en-US',{day:'2-digit',month:'2-digit',year:'numeric'}); }
function keplerEcl(k,T,E0){
  const a=k[0]+k[1]*T, e=k[2]+k[3]*T, I=(k[4]+k[5]*T)*D2R;
  const L=k[6]+k[7]*T, wb=k[8]+k[9]*T, O=(k[10]+k[11]*T)*D2R;
  const om=wb*D2R-O;                            // argument of perihelion = ϖ − Ω
  let M=(L-wb)*D2R; M=Math.atan2(Math.sin(M),Math.cos(M));
  let E=(E0!==undefined)?E0:M;
  for(let i=0;i<6;i++) E=E-(E-e*Math.sin(E)-M)/(1-e*Math.cos(E));
  return {a,e,I,om,O,E};
}
function orbPoint(el,E){                        // ecliptic xyz (AU) for eccentric anomaly E
  const {a,e,I,om,O}=el;
  const xp=a*(Math.cos(E)-e), yp=a*Math.sqrt(1-e*e)*Math.sin(E);
  const cO=Math.cos(O),sO=Math.sin(O),cI=Math.cos(I),sI=Math.sin(I),cw=Math.cos(om),sw=Math.sin(om);
  return [ (cw*cO-sw*sO*cI)*xp + (-sw*cO-cw*sO*cI)*yp,
           (cw*sO+sw*cO*cI)*xp + (-sw*sO+cw*cO*cI)*yp,
           (sw*sI)*xp + (cw*sI)*yp ];
}
// small-body elements → {a,e,I,om,O,E}, propagated to JD (robust for high eccentricity)
function keplerSB(kd,jd){
  let M=(kd.ma + kd.n*(jd-kd.ep))*D2R; M=Math.atan2(Math.sin(M),Math.cos(M));
  const e=kd.e; let E=M+e*Math.sin(M)*(1+e*Math.cos(M));
  for(let i=0;i<18;i++){ const dE=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E)); E-=dE; if(Math.abs(dE)<1e-8)break; }
  return {a:kd.a,e:kd.e,I:kd.i*D2R,om:kd.w*D2R,O:kd.om*D2R,E};
}
// ecliptic AU → unified world coords (ecliptic plane = world XZ, north = world +Y)
function eclToWorld(xe,ye,ze){
  const r=Math.hypot(xe,ye,ze)||1e-12, R=scale(r*AU_PC)/r;
  return [xe*R, ze*R, ye*R];
}
// recompute every body's orbit elements + position for a given Julian date
function updateSolarPositions(jd){
  const T=(jd-2451545.0)/36525;
  for(const b of SOLAR_BODIES){
    b._el = b.k ? keplerEcl(b.k,T) : b.kd ? keplerSB(b.kd,jd) : null;
    b._e  = b._el ? orbPoint(b._el,b._el.E) : null;
    if(b._e) b._r = Math.hypot(b._e[0],b._e[1],b._e[2]);
  }
  for(const p of PROBES){ const dt=jd-p.ep;
    p._e=[p.p[0]+p.v[0]*dt, p.p[1]+p.v[1]*dt, p.p[2]+p.v[2]*dt];
    p._r=Math.hypot(p._e[0],p._e[1],p._e[2]); }
}

// discovery-instrument categories → colour + label
const FAC={
  kepler:{c:[122,162,255],l:'Kepler'}, tess:{c:[79,214,200],l:'TESS'},
  k2:{c:[168,150,255],l:'K2'}, rv:{c:[255,207,107],l:'Radial velocity'},
  micro:{c:[255,143,176],l:'Microlensing'}, imaging:{c:[127,224,138],l:'Direct imaging'},
  ground:{c:[214,217,226],l:'Transit (ground)'}, other:{c:[150,161,190],l:'Other'}};
const HYG = DATA.hyg||[];
// boundary of the well-charted solar neighbourhood (parsecs) = 90th percentile
const BND = R0;

// ---- ONE unified logarithmic distance scale, anchored at the solar system ----
// world radius = (log10(distance in parsec) - LOG0) * KDEC ; direction = real sky vector.
// Everything — planets, moons, stars, exoplanets, galaxies — lives in this space,
// so you fly continuously from the solar system (AU) out to galaxies (Mpc).
const AU_PC=4.84814e-6, LOG0=-6.0, KDEC=1.0;   // more radial room between shells
const CAM_SOLAR=3.0, CAM_LOCAL=7.0, CAM_COSMOS=16, SOLAR_SHOW=5.0, SYS_SHOW=2.9;
let focusSys=null, focusSysW=null, sysA=0;     // an exoplanet system you've flown into
let navTarget=null;                            // navigation destination
let dirty=true;                                // render only when something changed
let flySpeed=1;                                // hold-to-accelerate (real scale)
function rlog(pc){ return Math.max(0,(Math.log10(pc)-LOG0)*KDEC); }
// scale(pc) → world radius. Two modes: logarithmic (overview) or real (proportional).
const REALK=1;                                     // real mode: 1 parsec = 1 world unit
function scale(pc){ return S.realScale ? pc*REALK : rlog(pc); }
function invScale(u){ return S.realScale ? u/REALK : Math.pow(10, u/KDEC + LOG0); }
// level-of-detail opacity from a camera distance, using physical fade thresholds (pc)
function lodA(camd, fullPc, hidePc){ const f=scale(fullPc), h=scale(hidePc);
  return Math.max(0, Math.min(1, (h-camd)/((h-f)||1e-12))); }
function camSolar(){ return scale(0.0015); }        // frame the solar system (~300 AU)
function camCosmos(){ return scale(3e7); }          // frame out to the farthest galaxy
const GAL = DATA.galaxies||[];
GAL.forEach(g=>{ g._gs=0.5+Math.sqrt(g.kpc||0.5)/6; });   // positions computed per frame
let solarA=0;
let NEAR=0.05;   // near-plane cull; scales with zoom so real-scale solar view works                             // solar-system detail opacity (from zoom)

// ---- Milky Way: galactic centre (Sgr A*) + the galactic plane ----
function dirOf(raDeg,decDeg){ const r=raDeg*Math.PI/180, d=decDeg*Math.PI/180;
  return [Math.cos(d)*Math.cos(r), Math.cos(d)*Math.sin(r), Math.sin(d)]; }
const SGRA={n:'Sagittarius A*', sgra:true, kind:'galactic centre', d:8178,
  desc:'supermassive black hole · 4.3 million solar masses'};
SGRA._dir=dirOf(266.41684,-29.00781);              // world position computed per frame
// galactic plane basis: two orthonormal in-plane vectors (⊥ to the North Galactic Pole)
const NGP=dirOf(192.85948,27.12825), GC=SGRA._dir;
const GPv=(function(){ const c=[NGP[1]*GC[2]-NGP[2]*GC[1], NGP[2]*GC[0]-NGP[0]*GC[2], NGP[0]*GC[1]-NGP[1]*GC[0]];
  const n=Math.hypot(c[0],c[1],c[2]); return [c[0]/n,c[1]/n,c[2]/n]; })();
const GPu=GC;                             // one in-plane axis points at the galactic centre

// ---- famous deep-sky objects: nebulae & star clusters (curated, real positions) ----
const DSO_T={
  OC:{c:[150,190,255],l:'Open cluster'}, GC:{c:[255,226,160],l:'Globular cluster'},
  EN:{c:[255,118,118],l:'Emission nebula'},      PN:{c:[110,230,198],l:'Planetary nebula'},
  SNR:{c:[232,140,222],l:'Supernova remnant'},
  BH:{c:[176,140,255],l:'Stellar black hole'}, NS:{c:[150,220,255],l:'Neutron star / magnetar'},
  BD:{c:[216,130,96],l:'Brown dwarf'},
  XRB:{c:[255,168,120],l:'X-ray binary'},
  CL:{c:[255,182,140],l:'Galaxy cluster'}, SC:{c:[255,150,110],l:'Supercluster'},
  GW:{c:[130,255,220],l:'Gravitational-wave event'}, QSOn:{c:[214,150,255],l:'Quasar'},
  WD:{c:[235,240,250],l:'White dwarf'}, BD:{c:[205,140,95],l:'Brown dwarf'},
  GRB:{c:[255,215,120],l:'Gamma-ray burst'}, FRB:{c:[170,255,190],l:'Fast radio burst'},
  MC:{c:[172,128,98],l:'Molecular cloud (Gaia 3D dust)'} };
const DSO=[
 {n:'Pleiades · M45',t:'OC',ra:56.75,dec:24.12,d:136},   {n:'Hyades',t:'OC',ra:66.75,dec:15.87,d:47},
 {n:'Praesepe · M44',t:'OC',ra:130.05,dec:19.67,d:187},  {n:'Double Cluster',t:'OC',ra:34.74,dec:57.13,d:2300},
 {n:'Wild Duck · M11',t:'OC',ra:282.77,dec:-6.27,d:1900},{n:'Ptolemy · M7',t:'OC',ra:268.46,dec:-34.79,d:300},
 {n:'Butterfly · M6',t:'OC',ra:265.08,dec:-32.21,d:490},{n:'M35',t:'OC',ra:92.27,dec:24.33,d:860},
 {n:'M67',t:'OC',ra:132.83,dec:11.81,d:800},
 {n:'M13 · Hercules',t:'GC',ra:250.42,dec:36.46,d:7700}, {n:'M22',t:'GC',ra:279.10,dec:-23.90,d:3200},
 {n:'Omega Centauri',t:'GC',ra:201.70,dec:-47.48,d:5200},{n:'47 Tucanae',t:'GC',ra:6.02,dec:-72.08,d:4000},
 {n:'M5',t:'GC',ra:229.64,dec:2.08,d:7500},              {n:'M15',t:'GC',ra:322.49,dec:12.17,d:10400},
 {n:'M3',t:'GC',ra:205.55,dec:28.38,d:10200},            {n:'M4',t:'GC',ra:245.90,dec:-26.53,d:1850},
 {n:'M92',t:'GC',ra:259.28,dec:43.14,d:8200},
 {n:'Orion Nebula · M42',t:'EN',ra:83.82,dec:-5.39,d:412}, {n:'Lagoon Nebula · M8',t:'EN',ra:270.92,dec:-24.38,d:1250},
 {n:'Eagle Nebula · M16',t:'EN',ra:274.70,dec:-13.81,d:1740},{n:'Trifid Nebula · M20',t:'EN',ra:270.60,dec:-23.03,d:1550},
 {n:'Omega Nebula · M17',t:'EN',ra:275.20,dec:-16.17,d:1700},{n:'Carina Nebula',t:'EN',ra:161.27,dec:-59.87,d:2300},
 {n:'Rosette Nebula',t:'EN',ra:97.98,dec:4.95,d:1600},   {n:'North America Nebula',t:'EN',ra:314.75,dec:44.31,d:800},
 {n:'Tarantula Nebula',t:'EN',ra:84.68,dec:-69.10,d:49000},
 {n:'Ring Nebula · M57',t:'PN',ra:283.40,dec:33.03,d:700},{n:'Dumbbell Nebula · M27',t:'PN',ra:299.90,dec:22.72,d:380},
 {n:'Helix Nebula',t:'PN',ra:337.41,dec:-20.84,d:200},    {n:"Cat's Eye Nebula",t:'PN',ra:269.64,dec:66.63,d:1000},
 {n:'Crab Nebula · M1',t:'SNR',ra:83.63,dec:22.01,d:2000},{n:'Veil Nebula',t:'SNR',ra:311.60,dec:30.72,d:740},
 {n:'Cygnus X-1',t:'BH',ra:299.590,dec:35.202,d:2220},   {n:'V404 Cygni',t:'BH',ra:306.016,dec:33.867,d:2390},
 {n:'GRS 1915+105',t:'BH',ra:288.798,dec:10.946,d:8600}, {n:'A0620-00',t:'BH',ra:95.676,dec:-0.350,d:1060},
 {n:'GRO J1655-40',t:'BH',ra:253.500,dec:-39.846,d:3200},{n:'LMC X-1',t:'BH',ra:84.912,dec:-69.743,d:49700},
 {n:'V4641 Sgr',t:'BH',ra:274.839,dec:-25.407,d:6200},   {n:'Cygnus X-3',t:'XRB',ra:308.107,dec:40.958,d:7400},
 {n:'Scorpius X-1',t:'XRB',ra:244.979,dec:-15.640,d:2800},{n:'Hercules X-1',t:'XRB',ra:254.457,dec:35.342,d:6100},
 {n:'SS 433',t:'XRB',ra:287.957,dec:4.983,d:5500},       {n:'Vela X-1',t:'XRB',ra:135.529,dec:-40.555,d:1900},
 {n:'Centaurus X-3',t:'XRB',ra:170.313,dec:-60.624,d:5700},{n:'Geminga',t:'NS',ra:98.476,dec:17.770,d:250},
 {n:'SGR 1806-20',t:'NS',ra:272.163,dec:-20.412,d:8700}, {n:'RX J1856-3754',t:'NS',ra:284.146,dec:-37.908,d:120},
 {n:'SGR 1935+2154',t:'NS',ra:293.732,dec:21.897,d:6600},
 // the nearest brown dwarfs — failed stars, third-closest system among them
 {n:'Luhman 16 AB',t:'BD',ra:162.328,dec:-53.319,d:2.0},  {n:'WISE 0855−0714',t:'BD',ra:133.79,dec:-7.24,d:2.28},
 {n:'Epsilon Indi Ba',t:'BD',ra:330.87,dec:-56.79,d:3.62},{n:'SCR 1845−6357 B',t:'BD',ra:281.30,dec:-63.96,d:3.85},
 {n:'DENIS 1048−3956',t:'BD',ra:162.07,dec:-39.94,d:4.0}, {n:'UGPS 0722−05',t:'BD',ra:110.61,dec:-5.68,d:4.1},
 {n:'Gliese 229 B',t:'BD',ra:92.64,dec:-21.86,d:5.76},    {n:'GJ 570 D',t:'BD',ra:224.36,dec:-21.41,d:5.88},
 {n:'SIMP 0136+0933',t:'BD',ra:24.24,dec:9.56,d:6.1},     {n:'2MASS 1507−1627',t:'BD',ra:226.95,dec:-16.46,d:7.4},
 {n:'2M1207 · has a planet',t:'BD',ra:181.89,dec:-39.55,d:52.4},{n:'Teide 1 · Pleiades',t:'BD',ra:56.9,dec:24.36,d:120},
 {n:'SN 1006',t:'SNR',ra:225.592,dec:-41.935,d:2200},    {n:'Tycho · SN 1572',t:'SNR',ra:6.340,dec:64.140,d:2500},
 {n:'Kepler · SN 1604',t:'SNR',ra:262.675,dec:-21.490,d:5000},{n:'Cassiopeia A',t:'SNR',ra:350.850,dec:58.815,d:3400},
 {n:'SN 1987A · LMC',t:'SNR',ra:83.867,dec:-69.270,d:51400},{n:'Vela SNR',t:'SNR',ra:128.500,dec:-45.833,d:290},
 {n:'Puppis A',t:'SNR',ra:125.500,dec:-42.900,d:2000},   {n:'RCW 86 · SN 185',t:'SNR',ra:220.700,dec:-62.500,d:2500},
 {n:'M2',t:'GC',ra:323.363,dec:-0.823,d:11500},  {n:'M10',t:'GC',ra:254.288,dec:-4.100,d:4400},
 {n:'M12',t:'GC',ra:251.809,dec:-1.948,d:4800},  {n:'M14',t:'GC',ra:264.400,dec:-3.246,d:9300},
 {n:'M19',t:'GC',ra:255.657,dec:-26.268,d:8800}, {n:'M28',t:'GC',ra:276.137,dec:-24.870,d:5500},
 {n:'M30',t:'GC',ra:325.092,dec:-23.180,d:8100}, {n:'M54',t:'GC',ra:283.764,dec:-30.480,d:26000},
 {n:'M55',t:'GC',ra:294.999,dec:-30.965,d:5400}, {n:'M62',t:'GC',ra:255.303,dec:-30.112,d:6800},
 {n:'M79',t:'GC',ra:81.044,dec:-24.524,d:12900}, {n:'NGC 6752',t:'GC',ra:287.717,dec:-59.985,d:4000},
 {n:'M36',t:'OC',ra:84.05,dec:34.13,d:1330},     {n:'M37',t:'OC',ra:88.07,dec:32.55,d:1400},
 {n:'M38',t:'OC',ra:82.17,dec:35.85,d:1070},     {n:'M34',t:'OC',ra:40.52,dec:42.72,d:500},
 {n:'M41',t:'OC',ra:101.50,dec:-20.72,d:710},    {n:'M46',t:'OC',ra:115.44,dec:-14.81,d:1660},
 {n:'M93',t:'OC',ra:116.14,dec:-23.86,d:1140},   {n:'M23',t:'OC',ra:269.15,dec:-19.02,d:660},
 {n:'M25',t:'OC',ra:277.94,dec:-19.25,d:610},    {n:'Jewel Box',t:'OC',ra:193.68,dec:-60.35,d:1980},
 {n:'Owl Nebula · M97',t:'PN',ra:168.70,dec:55.02,d:640},{n:'Little Dumbbell · M76',t:'PN',ra:25.58,dec:51.58,d:780},
 {n:'Saturn Nebula',t:'PN',ra:316.05,dec:-11.36,d:1500}, {n:'Eskimo Nebula',t:'PN',ra:112.30,dec:20.91,d:1800},
 {n:'California Nebula',t:'EN',ra:60.0,dec:36.42,d:300},  {n:'Flame Nebula',t:'EN',ra:85.43,dec:-1.85,d:400},
 {n:'Cocoon Nebula',t:'EN',ra:328.38,dec:47.27,d:1200},
 {n:'Virgo Cluster',t:'CL',ra:187.7,dec:12.4,d:16.5e6},   {n:'Fornax Cluster',t:'CL',ra:54.6,dec:-35.5,d:19e6},
 {n:'Coma Cluster',t:'CL',ra:194.9,dec:27.9,d:99e6},      {n:'Perseus Cluster',t:'CL',ra:49.9,dec:41.5,d:73e6},
 {n:'Centaurus Cluster',t:'CL',ra:192.2,dec:-41.3,d:52e6},{n:'Hydra Cluster',t:'CL',ra:159.2,dec:-27.5,d:58e6},
 {n:'Norma Cluster',t:'CL',ra:243.6,dec:-60.9,d:65e6},    {n:'Hercules Cluster',t:'CL',ra:241.3,dec:17.7,d:160e6},
 {n:'Shapley · A3558',t:'CL',ra:202.0,dec:-31.5,d:200e6},
 {n:'Virgo Supercluster',t:'SC',ra:187.0,dec:12.0,d:18e6},{n:'Laniakea · Great Attractor',t:'SC',ra:243.0,dec:-61.0,d:79e6},
 {n:'Perseus-Pisces SC',t:'SC',ra:30.0,dec:35.0,d:70e6},  {n:'Shapley Supercluster',t:'SC',ra:202.0,dec:-31.0,d:200e6},
 {n:'3C 273',t:'QSOn',ra:187.278,dec:2.052,d:652e6},      {n:'3C 48',t:'QSOn',ra:24.422,dec:33.160,d:1436e6},
 {n:'ULAS J1342+0928',t:'QSOn',ra:205.617,dec:9.477,d:8805e6},{n:'J0313-1806 · z 7.64',t:'QSOn',ra:48.353,dec:-18.107,d:8836e6},
 {n:'GW170817 · NGC 4993',t:'GW',ra:197.448,dec:-23.384,d:40e6},{n:'GW150914',t:'GW',ra:112.0,dec:-70.0,d:440e6},
 {n:'Sirius B',t:'WD',ra:101.287,dec:-16.716,d:2.64},   {n:'Procyon B',t:'WD',ra:114.826,dec:5.225,d:3.51},
 {n:'40 Eridani B',t:'WD',ra:63.818,dec:-7.653,d:5.04},  {n:'Van Maanen 2',t:'WD',ra:11.332,dec:5.388,d:4.31},
 {n:'Luhman 16',t:'BD',ra:162.328,dec:-53.319,d:2.0},    {n:'WISE 0855-0714',t:'BD',ra:133.787,dec:-7.245,d:2.28},
 {n:'Gliese 229 B',t:'BD',ra:86.864,dec:-21.864,d:5.76}, {n:'Epsilon Indi Ba',t:'BD',ra:330.84,dec:-56.786,d:3.64},
 {n:'GRB 221009A · BOAT',t:'GRB',ra:288.265,dec:19.773,d:624e6},{n:'GRB 080319B · naked-eye',t:'GRB',ra:217.920,dec:36.303,d:3148e6},
 {n:'GRB 090423 · z 8.2',t:'GRB',ra:148.888,dec:18.149,d:9000e6},{n:'GRB 130427A',t:'GRB',ra:173.136,dec:27.699,d:1340e6},
 {n:'FRB 121102 · repeater',t:'FRB',ra:82.995,dec:33.148,d:790e6},{n:'FRB 180924',t:'FRB',ra:326.105,dec:-40.900,d:1273e6},
 {n:'FRB 20200120E · M81',t:'FRB',ra:149.5,dec:68.8,d:3.6e6},
 {n:'Orion A cloud',t:'MC',ra:84.1,dec:-7.2,d:432},   {n:'Orion B cloud',t:'MC',ra:86.7,dec:-0.5,d:423},
 {n:'\u03bb Orionis ring',t:'MC',ra:83.8,dec:9.9,d:402}, {n:'Taurus cloud',t:'MC',ra:68.5,dec:25.9,d:141},
 {n:'Perseus cloud',t:'MC',ra:54.1,dec:31.3,d:294},  {n:'Ophiuchus cloud',t:'MC',ra:246.8,dec:-24.5,d:139},
 {n:'Lupus cloud',t:'MC',ra:240.6,dec:-38.1,d:189},  {n:'Chamaeleon cloud',t:'MC',ra:165.4,dec:-77.4,d:192},
 {n:'Musca cloud',t:'MC',ra:186.8,dec:-71.5,d:170},  {n:'Corona Australis cloud',t:'MC',ra:285.5,dec:-36.9,d:151},
 {n:'Serpens cloud',t:'MC',ra:277.5,dec:0.5,d:438},  {n:'Aquila Rift',t:'MC',ra:277.8,dec:-3.7,d:271},
 {n:'California cloud',t:'MC',ra:60.1,dec:37.2,d:452},{n:'Cepheus cloud',t:'MC',ra:337.4,dec:75.2,d:346},
 {n:'Mon R2 cloud',t:'MC',ra:91.9,dec:-6.4,d:788},   {n:'Pipe Nebula',t:'MC',ra:259.5,dec:-26.7,d:163},
 {n:'Polaris Flare',t:'MC',ra:344.0,dec:87.5,d:341}, {n:'Rosette cloud',t:'MC',ra:98.2,dec:4.5,d:1330},
 {n:'Cygnus X',t:'MC',ra:307.7,dec:40.8,d:1400},     {n:'W3 cloud',t:'MC',ra:36.5,dec:62.1,d:1950},
 {n:'NGC 2808',t:'GC',ra:138.013,dec:-64.863,d:9600},   {n:'NGC 6397',t:'GC',ra:265.175,dec:-53.674,d:2300},
 {n:'NGC 6541',t:'GC',ra:272.010,dec:-43.715,d:7500},   {n:'NGC 3201',t:'GC',ra:154.403,dec:-46.412,d:4900},
 {n:'NGC 288',t:'GC',ra:13.188,dec:-26.583,d:8900},     {n:'NGC 362',t:'GC',ra:15.809,dec:-70.849,d:8600},
 {n:'NGC 1851',t:'GC',ra:78.528,dec:-40.047,d:12100},   {n:'M68',t:'GC',ra:189.867,dec:-26.744,d:10300},
 {n:'M53',t:'GC',ra:198.230,dec:18.169,d:17900},        {n:'M69',t:'GC',ra:277.846,dec:-32.348,d:8800},
 {n:'M70',t:'GC',ra:280.803,dec:-32.292,d:9700},        {n:'M71',t:'GC',ra:298.444,dec:18.779,d:4000},
 {n:'M72',t:'GC',ra:313.365,dec:-12.537,d:16900},       {n:'M75',t:'GC',ra:301.520,dec:-21.921,d:20500},
 {n:'M80',t:'GC',ra:244.260,dec:-22.976,d:10000},       {n:'M107',t:'GC',ra:248.133,dec:-13.054,d:6400},
 {n:'M9',t:'GC',ra:259.799,dec:-18.516,d:7900},         {n:'M56',t:'GC',ra:289.148,dec:30.184,d:10200},
 {n:'NGC 4833',t:'GC',ra:194.891,dec:-70.876,d:6600},
];
DSO.forEach(o=>{ o.dso=true; o._dir=dirOf(o.ra,o.dec); });   // world pos computed per frame
// ---- pulsars (ATNF, real DM distances) — a galactic neutron-star population ----
const PULSARS=CAT.pulsars;
PULSARS.forEach(q=>{ q.psr=true; q._dir=dirOf(q[0],q[1]); q.n=q[3]; q.d=q[2]; });
// ---- open clusters (Cantat-Gaudin 2020, Gaia distances) ----
const CLUSTERS=CAT.clusters;
CLUSTERS.forEach(c=>{ c.oclu=true; c.ct=0; c._dir=dirOf(c[0],c[1]); c.n=c[3]; c.d=c[2]; });
// globular clusters (Baumgardt/Gaia) + CHIME FRBs share the layer, typed by ct
const GLOBS=CAT.globs;
const FRBS=CAT.frbs;
const CLU_T=[{c:[150,190,255],l:'Open cluster · Cantat-Gaudin 2020 (Gaia)'},
             {c:[255,215,140],l:'Globular cluster · Baumgardt (Gaia)'},
             {c:[170,255,190],l:'Fast radio burst · CHIME (distance estimated from DM)'}];
GLOBS.concat(FRBS).forEach(c=>{ c.oclu=true; c.ct=c[4]||0; c._dir=dirOf(c[0],c[1]); c.n=c[3]; c.d=c[2]; CLUSTERS.push(c); });

// ---- constellation stick-figures (drawn on a fixed sky sphere) ----
const CONS=DATA.constellations||[];
CONS.forEach(k=>{ k._L=k.L.map(pl=>{ const a=[]; for(let i=0;i<pl.length;i+=2) a.push(dirOf(pl[i],pl[i+1])); return a; }); });
const CON_NAME={Ori:'Orion',UMa:'Ursa Major',UMi:'Ursa Minor',Cas:'Cassiopeia',Cyg:'Cygnus',
  Lyr:'Lyra',Aql:'Aquila',Sco:'Scorpius',Sgr:'Sagittarius',Leo:'Leo',Tau:'Taurus',Gem:'Gemini',
  Cnc:'Cancer',Vir:'Virgo',And:'Andromeda',Per:'Perseus',Aur:'Auriga',Boo:'Bootes',
  Cru:'Crux',Cen:'Centaurus',CMa:'Canis Major',CMi:'Canis Minor',Peg:'Pegasus',Ari:'Aries',
  Psc:'Pisces',Aqr:'Aquarius',Cap:'Capricornus',Dra:'Draco',Her:'Hercules',Oph:'Ophiuchus',
  Car:'Carina',Vel:'Vela',Cae:'Caelum',Del:'Delphinus',Crv:'Corvus',Cvn:'Canes Venatici'};
let tgtYaw=S.yaw, tgtPitch=S.pitch, tgtCamZ=S.camZ;
// free movement: a movable view centre + camera basis vectors (computed each frame)
const ctr={x:0,y:0,z:0}, tgtCtr={x:0,y:0,z:0};
let camRight=[1,0,0], camUp=[0,1,0], camFwd=[0,0,1], camDist=0, camPos=[0,0,0];
const keys=new Set();
let _cyw=1,_syw=0,_cp2=1,_sp2=0, _trigY=NaN, _trigP=NaN;   // camera trig, cached per frame
// project() also runs from event handlers (picking, fly-to), where the camera may have
// moved since the last camBasis() — so the cache validates itself instead of trusting
// the render loop to have refreshed it.
function camTrig(){
  if(_trigY===S.yaw && _trigP===S.pitch) return;
  _trigY=S.yaw; _trigP=S.pitch;
  _cyw=Math.cos(S.yaw); _syw=Math.sin(S.yaw);
  _cp2=Math.cos(S.pitch); _sp2=Math.sin(S.pitch);
}
function camBasis(){
  const c=Math.cos(S.yaw),s=Math.sin(S.yaw),cp=Math.cos(S.pitch),sp=Math.sin(S.pitch);
  _cyw=c; _syw=s; _cp2=cp; _sp2=sp; _trigY=S.yaw; _trigP=S.pitch;
  camRight=[c, sp*s, -cp*s];
  camUp   =[0, cp, sp];
  camFwd  =[s, -sp*c, cp*c];
  camPos=[ctr.x-camFwd[0]*S.camZ, ctr.y-camFwd[1]*S.camZ, ctr.z-camFwd[2]*S.camZ];
  camDist=Math.hypot(camPos[0],camPos[1],camPos[2]);   // distance to the Sun (origin)
}
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce) S.autorot=false, syncToggle('t-rot',false);

let glOK=false, GL=null, glcv=null;
let progF=null, progU=null, progT=null;        // float layout · raw-byte layout · tonemap
let hdrOK=false, hdrFB=null, hdrTex=null, glMaxPt=64;
let glBuf=null, glBufH=null, glBufP=null, glBufC=null;   // float-layout VAO handles {vao,n}
const CL={G:null,B:null,W:null,Q:null,O:null,V:null};    // raw-byte cloud handles {vao,n,key}
let gaiaRaw=null, gaiaRange=100, webRaw=null, qsoRaw=null, beltRaw=null, obRaw=null, varRaw=null, beltEpoch=0;
let exactPx=null;                    // viewport size in device pixels (ResizeObserver)
function resize(){
  const raw=devicePixelRatio||1;
  W=innerWidth; H=innerHeight;
  // 2D overlay (text/lines) renders up to 3x for crisp text; GL point clouds cap at 2x
  const px2=(exactPx&&raw<=3.02)?exactPx:null;
  cv.width=px2?px2[0]:Math.round(W*Math.min(raw,3));
  cv.height=px2?px2[1]:Math.round(H*Math.min(raw,3));
  cv.style.width=W+'px'; cv.style.height=H+'px';
  DPR=cv.width/W;
  ctx.setTransform(DPR,0,0,cv.height/H,0,0);
  glResize();
  dirty=true;
}
addEventListener('resize',resize);
if(window.ResizeObserver){ try{      // pixel-exact backing store (no resampling blur)
  const ro=new ResizeObserver(es=>{ const e=es[es.length-1], s=e.devicePixelContentBoxSize;
    if(s&&s[0]) exactPx=[s[0].inlineSize,s[0].blockSize]; resize(); });
  ro.observe(cv,{box:'device-pixel-content-box'});
}catch(_){}}
resize();

// ---- blackbody-ish star colour from effective temperature (K) ----
function tempColor(t){
  if(!t) return [150,160,190];
  if(t>=30000) return [155,176,255];
  if(t>=10000) return [170,191,255];
  if(t>=7500)  return [202,215,255];
  if(t>=6000)  return [248,247,255];
  if(t>=5200)  return [255,244,232];
  if(t>=3700)  return [255,210,161];
  return [255,181,108];
}
function compress(r){ return scale(r); }   // all layers share the one scale (log or real)
// point-size multiplier from the largest planet's real radius (Earth radii)
// Host-star glyph size. It used to scale with the system's largest PLANET, which made
// a red dwarf with a hot Jupiter outrank a real giant. Stellar radius is not in the
// dataset, but it follows from what is: R/R☉ = √(L/L☉) / (T/5772)². Checked against the
// literature — Proxima 0.153, TRAPPIST-1 0.124, KELT-9 2.42 R☉, all within a few percent.
function starRadius(s){
  if(s.lum>0 && s.t>0) return Math.sqrt(s.lum)/Math.pow(s.t/5772, 2);
  if(s.t>0) return Math.pow(s.t/5772, 2);      // main-sequence approximation (6% of hosts)
  return 1;
}
// Planets discovered by a given year. Only the year slider changes this, so cache it
// per star instead of re-walking every planet list on every frame.
let _pcYear=-1;
function planetsBy(s, year){
  if(_pcYear!==year){ _pcYear=year; for(let i=0;i<STARS.length;i++) STARS[i]._pcN=-1; }
  let n=s._pcN;
  if(n<0){ n=0; const ps=s.p;
    for(let k=0;k<ps.length;k++){ const y=ps[k].y; if(y<=year||y===0) n++; }
    s._pcN=n; }
  return n;
}
function radiusScale(sr){
  if(!S.size || !sr) return 1;
  // ^0.7 keeps the 0.012–94 R☉ span usable: dwarfs sit near the floor, giants at the cap
  return Math.max(0.30, Math.min(4.2, Math.pow(sr, 0.7)));
}

// ---- projection ----
let cy,cx,foc;
function project(px,py,pz){ return projectInto(px,py,pz,{}); }
// Same maths, writing into a caller-owned object. The hot loops (11.6 k HYG stars,
// 4.7 k hosts, 869 galaxies) ran project() per point and threw away ~17 000 short-lived
// objects every frame; they now pass one scratch object and copy the fields out.
const _pj = {x:0,y:0,depth:0,z2:0};
function projectInto(px,py,pz,o){
  camTrig();
  px-=ctr.x; py-=ctr.y; pz-=ctr.z;         // orbit/look around the movable centre
  const x1=px*_cyw+pz*_syw, z1=-px*_syw+pz*_cyw, y1=py;
  const y2=y1*_cp2 - z1*_sp2, z2=y1*_sp2 + z1*_cp2;
  const depth=S.camZ - z2;                 // >0 in front
  o.x=cx+foc*x1/depth; o.y=cy-foc*y2/depth; o.depth=depth; o.z2=z2;
  return o;
}

// ---- render ----
let visSys=0,visPl=0,nearD=Infinity,farD=0;
const order=[];
// pre-rendered soft-blob sprites — replaces per-frame createRadialGradient calls
const _sprites={};
function blobSprite(r,g,b,a0,a1){
  const k=r+','+g+','+b+','+a0+','+a1; let sp=_sprites[k];
  if(!sp){ sp=document.createElement('canvas'); sp.width=sp.height=64;
    const c2=sp.getContext('2d'); const gr=c2.createRadialGradient(32,32,0,32,32,32);
    gr.addColorStop(0,`rgba(${r},${g},${b},${a0})`); gr.addColorStop(.5,`rgba(${r},${g},${b},${a1})`);
    gr.addColorStop(1,`rgba(${r},${g},${b},0)`);
    c2.fillStyle=gr; c2.fillRect(0,0,64,64); _sprites[k]=sp; }
  return sp;
}
// A radial gradient evaluated per pixel over a viewport-sized disc is the single most
// expensive thing this renderer did (measured: the heliosphere haze alone halved the
// frame rate on an Intel iGPU). These glows are drawn once into a sprite and blitted.
const _halos={};
function haloSprite(key,stops,size){
  let sp=_halos[key]; if(sp) return sp;
  sp=document.createElement('canvas'); sp.width=sp.height=size||256;
  const h=sp.width/2, c2=sp.getContext('2d'), gr=c2.createRadialGradient(h,h,0,h,h,h);
  for(const [t,col] of stops) gr.addColorStop(t,col);
  // a disc, not a square: the gradient pads its last stop into the corners
  c2.fillStyle=gr; c2.beginPath(); c2.arc(h,h,h,0,6.2832); c2.fill(); _halos[key]=sp; return sp;
}
function drawHalo(sp,x,y,r,alpha){                       // alpha multiplies the sprite's own
  if(!(r>0.5)) return;
  if(r>4*Math.max(W,H)) return;                          // we are deep inside: the visible part is ~uniform and faint
  const ga=ctx.globalAlpha; ctx.globalAlpha=ga*alpha;
  ctx.drawImage(sp,x-r,y-r,r*2,r*2); ctx.globalAlpha=ga;
}
// Skia stalls for tens of seconds on stroke/fill paths whose bounds reach millions
// of px — reachable since real-scale deep zoom (orbit of Neptune seen from 500 km
// above Earth ≈ 1e9 px). Break paths at this limit like at the near plane.
const PLIM=32768;
function offscr(p){ return p.depth<=NEAR || Math.abs(p.x-cx)>PLIM || Math.abs(p.y-cy)>PLIM; }
// ---- clipped polylines ----------------------------------------------------------
// Rings, grids, orbits and sky circles are paths that mostly lie off-screen: the 1-ly
// ring seen from 200 AU is hundreds of viewports wide, and the rasteriser still walks
// every pixel of it (every dash of it, if dashed) before clipping. So no such path
// reaches the canvas directly: points go through pathPt(), each segment is clipped to
// the viewport (Liang–Barsky, 40-px margin), and only the visible pieces are stroked.
const PATH={n:0, x:new Float64Array(2048), y:new Float64Array(2048), brk:new Uint8Array(2048)};
function pathBegin(){ PATH.n=0; }
function pathPt(p){                                      // projected point; behind/far → break
  if(offscr(p)){ if(PATH.n) PATH.brk[PATH.n-1]=1; return; }
  const i=PATH.n; if(i>=PATH.x.length) return;
  PATH.x[i]=p.x; PATH.y[i]=p.y; PATH.brk[i]=0; PATH.n=i+1;
}
function pathBreak(){ if(PATH.n) PATH.brk[PATH.n-1]=1; }
function pathStroke(style,lw,dash){
  const n=PATH.n; if(n<2) return;
  const M=40, X0=-M, Y0=-M, X1=W+M, Y1=H+M;
  ctx.beginPath(); let any=false, open=false;
  for(let i=1;i<n;i++){
    if(PATH.brk[i-1]){ open=false; continue; }
    const ax=PATH.x[i-1], ay=PATH.y[i-1], dx=PATH.x[i]-ax, dy=PATH.y[i]-ay;
    let t0=0, t1=1, ok=true;
    for(let e=0;e<4;e++){
      const q = e===0?-dx : e===1?dx : e===2?-dy : dy;
      const r = e===0?ax-X0 : e===1?X1-ax : e===2?ay-Y0 : Y1-ay;
      if(q===0){ if(r<0){ ok=false; break; } continue; }
      const t=r/q;
      if(q<0){ if(t>t1){ ok=false; break; } if(t>t0) t0=t; }
      else   { if(t<t0){ ok=false; break; } if(t<t1) t1=t; }
    }
    if(!ok){ open=false; continue; }
    if(!open || t0>0) ctx.moveTo(ax+dx*t0, ay+dy*t0);
    ctx.lineTo(ax+dx*t1, ay+dy*t1); any=true;
    open = t1>=1;
  }
  if(!any) return;
  ctx.strokeStyle=style; ctx.lineWidth=lw;
  if(dash){ ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); } else ctx.stroke();
}
// ---- per-layer profiler (off unless api.prof(true)) ------------------------
// Frame cost is invisible from the outside: everything happens inside one render().
// P() accumulates wall time per layer so "it feels slow" becomes a number per layer.
const PROF = { on: false, t: Object.create(null), frames: 0 };
function P(k, fn) {
  if (!PROF.on) return fn();
  const a = performance.now(); const r = fn();
  PROF.t[k] = (PROF.t[k] || 0) + (performance.now() - a);
  return r;
}
api.prof = on => {
  if (on) { PROF.on = true; PROF.t = Object.create(null); PROF.frames = 0; return null; }
  PROF.on = false;
  const f = PROF.frames || 1;
  return { frames: PROF.frames,
    ms: Object.fromEntries(Object.entries(PROF.t)
      .map(([k, v]) => [k, +(v / f).toFixed(2)]).sort((a, b) => b[1] - a[1])) };
};
function render(){
  cx=W/2; cy=H/2; foc=Math.min(W,H)*0.62;
  gwOnScreen=false;
  ctx.clearRect(0,0,W,H);                        // no vignette — space is black
  lblReset();

  if(surfUpdate()){ drawSurface(); lblFlush(); updateHUD(); return; }   // descended to the Earth's surface

  camBasis();
  NEAR = S.realScale ? Math.max(1e-13, S.camZ*0.02) : Math.min(0.05, Math.max(0.001, S.camZ*0.35));
  // solar-system detail from the camera's real distance to the Sun (so it also
  // fades as you fly away from the centre, not only when you zoom out)
  solarA=lodA(camDist, 0.001, 0.1);              // full ≤0.001 pc, hidden ≥0.1 pc from Sun
  // exoplanet-system detail: from the camera's distance to the focused host star
  sysA=0;
  if(focusSys && focusSysW){
    const sd=Math.hypot(camPos[0]-focusSysW[0],camPos[1]-focusSysW[1],camPos[2]-focusSysW[2]);
    sysA=lodA(sd, 8e-6, 8e-4);
  }
  calcLens();                                    // Sgr A* lensing (needs camBasis + foc)

  if(S.rings) P('rings',drawRings);
  if(S.veil) P('veil',drawVeilSphere);
  if(S.radio) P('radio',drawRadioSphere);
  if(S.bubble) P('bubble',drawBubble);
  if(S.grid) P('grid',drawSkyGrid);
  if(S.ggrid) P('ggrid',drawGalGrid);

  // galaxies: project, split behind/in-front of the local cloud for painter order
  P('gal:project',projectGalaxies);
  const backG=[], frontG=[];
  for(const g of galProj){ (g._z2<0?backG:frontG).push(g); }
  P('gal:back',()=>drawGalaxies(backG));

  // gather visible
  order.length=0; visSys=0; visPl=0; nearD=Infinity; farD=0;
  for(let i=0;i<STARS.length;i++){
    const s=STARS[i];
    if(s.fy>S.year && s.fy!==0) continue;
    if(S.facHidden.has(s.fac)) continue;
    const dr=compress(s._r);
    const p=projectInto(s._dx*dr,s._dy*dr,s._dz*dr,_pj);
    if(p.depth<=NEAR) continue;
    if(p.x<-90||p.x>W+90||p.y<-90||p.y>H+90) continue;   // off-screen cull
    s._sx=p.x; s._sy=p.y; s._depth=p.depth; s._z2=p.z2;
    order.push(s);
    visSys++;
    visPl += planetsBy(s, S.year);
    if(s._r<nearD) nearD=s._r;
    if(s._r>farD) farD=s._r;
  }
  P('stars:sort',()=>order.sort((a,b)=>a._z2-b._z2));   // far first (painter)

  // background starfield (HYG) behind the exoplanet hosts
  P('hyg:project',projectHyg); if(glStars()) P('gl:render',glRender); else { glClearCanvas(); P('hyg:draw',drawHyg); }

  // draw sun at origin
  const sp=project(0,0,0);
  const gpuH=glStars()&&glBufH;   // GPU draws the host points; 2D keeps picking/rings
  for(const s of order){
    const size=Math.max(0.7, foc*0.0075/s._depth * radiusScale(s._sr));
    const fade=Math.max(0.12, Math.min(1, 1.9 - s._depth*0.55));
    const isNew=(s.fy===S.year && s.fy!==0);
    const isSel=(s===S.hover||s===S.pinned||s===S.focusStar);
    let col=S.facColor?((FAC[s.fac]||FAC.other).c):s._col, a=fade;
    // red veil: everything beyond the charted neighbourhood reddens & dims
    let veil=0;
    if(S.veil && s._r>BND){
      veil=Math.min(1,(s._r-BND)/(BND*1.6));
      col=[ col[0]+(232-col[0])*veil*0.85,
            col[1]+(58 -col[1])*veil*0.85,
            col[2]+(50 -col[2])*veil*0.85 ];
      a*=(1-veil*0.4);
    }
    if(isNew){col=[79,214,200]; a=1; veil=0;}
    const cr=col[0]|0,cg=col[1]|0,cb=col[2]|0;
    if(!gpuH){
      ctx.beginPath();
      ctx.arc(s._sx,s._sy, isSel?size+1.6:size, 0, 6.2832);
      ctx.fillStyle=`rgba(${cr},${cg},${cb},${a})`;
      ctx.fill();
      if(size>1.6||isNew||isSel||veil>0.35){ // glow for bright/near/veiled
        ctx.beginPath();
        ctx.arc(s._sx,s._sy,(isSel?size+1.6:size)*(veil>0.35?3.0:2.4),0,6.2832);
        ctx.fillStyle=`rgba(${cr},${cg},${cb},${a*(veil>0.35?0.16:0.10)})`;
        ctx.fill();
      }
    }
    if(isSel){
      ctx.beginPath(); ctx.arc(s._sx,s._sy,size+7,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke();
    }
  }
  // Sun marker (the origin / "you are here") — hands off to the real Sun on zoom-in
  const sm=1-solarA;
  if(sm>0.02){
    ctx.globalAlpha=sm;
    ctx.beginPath(); ctx.arc(sp.x,sp.y,4.2,0,6.2832); ctx.fillStyle='#eafffb'; ctx.fill();
    ctx.beginPath(); ctx.arc(sp.x,sp.y,9,0,6.2832);
    ctx.strokeStyle='rgba(255,255,255,.5)'; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath(); ctx.arc(sp.x,sp.y,15,0,6.2832);
    ctx.fillStyle='rgba(255,255,255,.05)'; ctx.fill();
    ctx.globalAlpha=1;
  }

  // galaxies in front of the local cloud, on top
  drawGalaxies(frontG);
  if(solarA<0.5 && sysA<0.5){ drawConstellations(); if(S.met) drawShowers(); drawDSO(); drawPulsars(); drawClusters(); if(S.mw3d) drawGalaxyModel(); drawMW(); drawS2(); if(S.edge) drawEdge(); }
  if(lensPar && lensPar.e>12){                   // Einstein ring marker around Sgr A*
    ctx.beginPath(); ctx.arc(lensPar.x,lensPar.y,lensPar.e,0,6.2832);
    ctx.setLineDash([2,6]); ctx.strokeStyle='rgba(255,215,150,0.35)'; ctx.lineWidth=1;
    ctx.stroke(); ctx.setLineDash([]);
    ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(255,215,150,0.6)';
    ctx.fillText('Einstein ring · lensing exaggerated ×'+LENS_EXAG,
      lensPar.x+lensPar.e*0.72, lensPar.y-lensPar.e*0.72);
  }
  if(S.galaxies && sp.depth>NEAR && solarA<0.5){
    ctx.globalAlpha=1-solarA*2;
    ctx.font='10px ui-monospace,monospace'; ctx.fillStyle='rgba(233,237,250,.55)';
    ctx.fillText('Milky Way · all exoplanets', sp.x+14, sp.y-10);
    if(solarA<0.15){ ctx.fillStyle='rgba(255,238,178,.7)'; ctx.font='9px ui-monospace,monospace';
      ctx.fillText('click → into the solar system', sp.x+14, sp.y+4); }
    ctx.globalAlpha=1;
  }
  lastSun.x=sp.x; lastSun.y=sp.y; lastSun.depth=sp.depth;

  // our solar system — detail fades in as we zoom toward the Sun
  if(solarA>0.01) P('solar',()=>drawSolar(solarA));
  // a fellow exoplanet system — its planets on their orbits, when we fly to it
  if(sysA>0.01) P('system',()=>drawSystem(sysA)); else sysProj.length=0;

  if(measureMode) drawMeasure();
  if(ROUTE) drawRoute();                   // interstellar 1g route (Earth → star/galaxy)
  P('nav',drawNav);                        // course reticle / off-screen arrow
  drawScaleBar();                          // where we are on the distance ladder
  P('labels:flush',lblFlush);              // all queued labels, decluttered, on top
  P('hud',updateHUD);
  PROF.frames++;
}
const lastSun={x:0,y:0,depth:0};

// ---- galaxy layer ----
let galProj=[];
function projectGalaxies(){
  galProj.length=0; if(!S.galaxies) return;
  for(const g of GAL){
    const R=scale(g.mpc*1e6); g._x=g.dx*R; g._y=g.dy*R; g._z=g.dz*R;
    const p=projectInto(g._x,g._y,g._z,_pj);
    if(p.depth<=NEAR) continue;
    if(p.x<-90||p.x>W+90||p.y<-90||p.y>H+90) continue;
    g._sx=p.x; g._sy=p.y; g._depth=p.depth; g._z2=p.z2;
    galProj.push(g);
  }
  galProj.sort((a,b)=>a._z2-b._z2);
}
function drawGalaxies(list){ LBL.prio=P_GAL;
  for(const g of list){
    const s=Math.max(1.4, foc*0.011/g._depth*g._gs);
    const c=g.c, a=Math.max(.25,Math.min(.95, 1.7-g._depth*0.045));
    if(s>4){                       // soft nebulous blob only for the larger/nearer ones
      const ba=(g.ba&&g.ba>0.05)?g.ba:1;
      const sprite=blobSprite(c[0],c[1],c[2],0.85,0.3);
      ctx.globalAlpha=a;             // sprite carries the stop shape; alpha scales it
      // a round galaxy needs no rotation, so it skips the transform entirely; the rest
      // use setTransform rather than save/rotate/scale/restore (three fewer state ops
      // per galaxy, and camDir2i keeps the position-angle maths allocation-free)
      if(ba>0.985 || g.pa===undefined){
        ctx.drawImage(sprite, g._sx-s, g._sy-s, s*2, s*2);
      } else {
        const dx3=g.dx,dy3=g.dy,dz3=g.dz, cd3=Math.max(1e-6,Math.hypot(dx3,dy3));
        camDir2i(-dy3/cd3, dx3/cd3, 0);           const e2x=_d2x, e2y=_d2y;
        camDir2i(-dz3*dx3/cd3, -dz3*dy3/cd3, cd3); const n2x=_d2x, n2y=_d2y;
        const pa=g.pa*0.0174533, cpa=Math.cos(pa), spa=Math.sin(pa);
        const th=Math.atan2(n2y*cpa+e2y*spa, n2x*cpa+e2x*spa);
        const ct=Math.cos(th), stt=Math.sin(th);
        ctx.setTransform(DPR*ct, DPR*stt, -DPR*stt*ba, DPR*ct*ba,
                         DPR*g._sx, (cv.height/H)*g._sy);
        ctx.drawImage(sprite, -s, -s, s*2, s*2);
        ctx.setTransform(DPR,0,0,cv.height/H,0,0);
      }
      ctx.globalAlpha=1;
    } else if(s<1.8){              // sub-2-px far galaxy: one square (a path arc costs the same
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${Math.min(1,a*0.55+0.3)})`;   // as a planet at this size)
      ctx.fillRect(g._sx-s,g._sy-s,s*2,s*2);
    } else {                       // cheap flat fill for tiny far galaxies — visually identical
      ctx.beginPath(); ctx.arc(g._sx,g._sy,s,0,6.2832);
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${a*0.55})`; ctx.fill();
    }
    if(s>=1.8){                    // the brighter core: invisible under a 2-px glyph, so skipped there
      ctx.beginPath(); ctx.arc(g._sx,g._sy,Math.max(.8,s*0.26),0,6.2832);
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${Math.min(1,a+0.25)})`; ctx.fill(); }
    const sel=(g===S.hover||g===S.pinned);
    if(sel){ ctx.beginPath(); ctx.arc(g._sx,g._sy,s+6,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    if(g.f||sel){
      ctx.font=(sel?'11px':'10px')+' ui-monospace,monospace';
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${sel?1:0.72})`;
      LBL.prio=sel?P_SEL:P_GAL;
      ctx.fillText(g.n, g._sx+s+4, g._sy+3); LBL.prio=P_GAL;
    }
  }
}

// unified distance ruler — one set of rings spanning AU → light-years → Mpc
const LY_PC=1/PC2LY;
const RINGS=[
  {pc:1*AU_PC,l:'1 AU'}, {pc:30*AU_PC,l:'30 AU'},
  {pc:1*LY_PC,l:'1 ly'}, {pc:100*LY_PC,l:'100 ly'},
  {pc:1e4*LY_PC,l:'10,000 ly'}, {pc:1e6*LY_PC,l:'1 Mly'}, {pc:1e7*LY_PC,l:'10 Mly'},
];
function drawRings(){ LBL.prio=P_GRID;
  ctx.save();
  for(const R of RINGS){
    const dr=scale(R.pc);
    pathBegin();
    for(let a=0;a<=72;a++){
      const th=a/72*6.2832;
      pathPt(project(Math.cos(th)*dr,0,Math.sin(th)*dr));
    }
    const drew=PATH.n>1;
    pathStroke('rgba(120,140,190,.11)',1);
    const lp=project(dr,0,0);
    if(lp.depth>NEAR&&drew){
      ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(120,140,190,.42)';
      ctx.fillText(R.l, lp.x+4, lp.y-3);
    }
  }
  ctx.restore();
}

// ---- coordinate grids on a sun-centred sky sphere ----
function drawSkyGrid(){ LBL.prio=P_GRID;                          // equatorial RA/Dec
  const R=scale(BND*3);
  ctx.save();
  for(const dec of [-60,-30,0,30,60]){
    pathBegin();
    for(let k=0;k<=96;k++){ const d=dirOf(k/96*360,dec); pathPt(project(d[0]*R,d[1]*R,d[2]*R)); }
    pathStroke(dec===0?'rgba(150,175,215,.34)':'rgba(130,150,190,.15)', dec===0?1.2:1, [1,4]);
  }
  for(let h=0;h<12;h++){
    pathBegin();
    for(let k=0;k<=48;k++){ const d=dirOf(h*30,-90+k/48*180); pathPt(project(d[0]*R,d[1]*R,d[2]*R)); }
    pathStroke('rgba(130,150,190,.13)',1,[1,4]);
  }
  ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(150,175,215,.6)';
  for(let h=0;h<24;h+=6){ const d=dirOf(h*15,2), p=project(d[0]*R,d[1]*R,d[2]*R);
    if(p.depth>NEAR&&!offscr(p)) ctx.fillText(h+'h', p.x+3, p.y-4); }
  const np=dirOf(0,90), pp=project(np[0]*R,np[1]*R,np[2]*R);
  if(pp.depth>NEAR&&!offscr(pp)) ctx.fillText('celestial N pole', pp.x+4, pp.y);
  ctx.restore();
}
function drawGalGrid(){ LBL.prio=P_GRID;                          // galactic l/b
  const R=scale(BND*3.2);
  const gx=GC, gz=NGP,
        gy=[gz[1]*gx[2]-gz[2]*gx[1], gz[2]*gx[0]-gz[0]*gx[2], gz[0]*gx[1]-gz[1]*gx[0]];
  const dir=(l,b)=>{ const cl=Math.cos(l),sl=Math.sin(l),cb=Math.cos(b),sb=Math.sin(b);
    return [gx[0]*cb*cl+gy[0]*cb*sl+gz[0]*sb, gx[1]*cb*cl+gy[1]*cb*sl+gz[1]*sb,
            gx[2]*cb*cl+gy[2]*cb*sl+gz[2]*sb]; };
  ctx.save();
  for(const b of [-60,-30,0,30,60]){
    pathBegin();
    for(let k=0;k<=96;k++){ const d=dir(k/96*6.2832,b*D2R); pathPt(project(d[0]*R,d[1]*R,d[2]*R)); }
    pathStroke(b===0?'rgba(235,200,150,.32)':'rgba(215,180,135,.14)', b===0?1.2:1, [1,4]);
  }
  for(let i=0;i<12;i++){
    pathBegin();
    for(let k=0;k<=48;k++){ const d=dir(i/12*6.2832,(-90+k/48*180)*D2R); pathPt(project(d[0]*R,d[1]*R,d[2]*R)); }
    pathStroke('rgba(215,180,135,.12)',1,[1,4]);
  }
  ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(235,200,150,.6)';
  for(const l of [0,90,180,270]){ const d=dir(l*D2R,0.03), p=project(d[0]*R,d[1]*R,d[2]*R);
    if(p.depth>NEAR&&!offscr(p)) ctx.fillText('l='+l+'°', p.x+3, p.y-4); }
  const np=dir(0,Math.PI/2), pp=project(np[0]*R,np[1]*R,np[2]*R);
  if(pp.depth>NEAR&&!offscr(pp)) ctx.fillText('galactic N pole', pp.x+4, pp.y);
  ctx.restore();
}
// the human radio bubble: how far our first broadcasts have travelled (since ~1901),
// time-slider aware — scrub the future and watch it grow
function drawRadioSphere(){ LBL.prio=P_GRID;
  const yr=2000+(solarJD()-2451545)/365.25, lyr=yr-1901;
  if(lyr<1) return;
  const R=scale(lyr*0.306601);
  ctx.save();
  for(const [ax,ay] of [[0,1],[0,2],[1,2]]){
    pathBegin();
    for(let a=0;a<=72;a++){ const th=a/72*6.2832, v=[0,0,0];
      v[ax]=Math.cos(th)*R; v[ay]=Math.sin(th)*R;
      pathPt(project(v[0],v[1],v[2]));
    }
    pathStroke('rgba(120,225,235,.22)',1,[2,5]);
  }
  const lp=project(R*0.71,R*0.71,0);
  if(lp.depth>NEAR&&!offscr(lp)){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(130,225,235,.6)';
    ctx.fillText('our radio signals · '+Math.round(lyr)+' ly out', lp.x+4, lp.y-3); }
  ctx.restore();
}
// the Local Bubble: the supernova-blown cavity we live in (≈Zucker+ 2022 extents,
// drawn as a schematic ellipsoid in galactic coordinates)
function drawBubble(){ LBL.prio=P_GRID;
  ctx.save();
  for(const [e1,e2,a,b] of [[GPu,GPv,95,95],[GPu,NGP,95,150],[GPv,NGP,95,150]]){
    pathBegin();
    for(let k=0;k<=72;k++){ const th=k/72*6.2832, ca=Math.cos(th)*a, sb=Math.sin(th)*b;
      const v=[e1[0]*ca+e2[0]*sb, e1[1]*ca+e2[1]*sb, e1[2]*ca+e2[2]*sb];
      const len=Math.hypot(v[0],v[1],v[2])||1, R=scale(len);
      pathPt(project(v[0]/len*R, v[1]/len*R, v[2]/len*R));
    }
    pathStroke('rgba(150,190,255,.17)',1,[3,6]);
  }
  const lt=scale(150), lp=project(NGP[0]*lt,NGP[1]*lt,NGP[2]*lt);
  if(lp.depth>NEAR&&!offscr(lp)){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(160,195,255,.55)';
    ctx.fillText('Local Bubble · blown clear by ~15 supernovae', lp.x+4, lp.y-3); }
  ctx.restore();
}
// red veil boundary: three great circles forming a sphere at the neighbourhood edge
function drawVeilSphere(){ LBL.prio=P_GRID;
  const dr=compress(BND);
  const planes=[[0,1],[0,2],[1,2]]; // xy, xz, yz
  ctx.save();
  for(const [ax,ay] of planes){
    pathBegin();
    for(let a=0;a<=72;a++){
      const th=a/72*6.2832, co=Math.cos(th)*dr, si=Math.sin(th)*dr;
      const v=[0,0,0]; v[ax]=co; v[ay]=si;
      pathPt(project(v[0],v[1],v[2]));
    }
    pathStroke('rgba(230,71,60,.20)',1);
  }
  const lp=project(0,dr,0);
  if(lp.depth>NEAR){
    ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(230,71,60,.55)';
    ctx.fillText('charted neighbourhood · '+fmt(BND*PC2LY)+' ly', lp.x+5, lp.y);
  }
  ctx.restore();
}

// ---- HYG background starfield ----
let hygProj=[];
const MAS2RAD=Math.PI/(180*3600*1000);
function projectHyg(){
  hygProj.length=0; if(!S.hyg) return;
  const pm=S.pm && S.pmYears!==0, ty=S.pmYears;
  for(const s of HYG){
    let dx=s.dx,dy=s.dy,dz=s.dz;
    if(pm && s.pr!==undefined){                    // apply proper motion over ty years
      const ox=dx,oy=dy,oz=dz, cd=Math.hypot(ox,oy)||1e-6;
      const tE=(s.pr||0)*ty*MAS2RAD, tN=(s.pd||0)*ty*MAS2RAD;   // east / north displacement (rad)
      dx=ox+(-oy/cd)*tE+(-oz*ox/cd)*tN;
      dy=oy+( ox/cd)*tE+(-oz*oy/cd)*tN;
      dz=oz+cd*tN;
      const L=Math.hypot(dx,dy,dz)||1; dx/=L;dy/=L;dz/=L;
    }
    const dr=compress(s.d);
    const p=projectInto(dx*dr,dy*dr,dz*dr,_pj);
    if(p.depth<=NEAR) continue;
    if(p.x<-90||p.x>W+90||p.y<-90||p.y>H+90) continue;
    let bright=6.8-s.m; if(bright<0) bright=0;
    const size=(0.4+bright*0.34)*foc*0.0032/p.depth;
    if(size<0.34 && s!==S.hover && s!==S.pinned) continue;   // cull sub-pixel stars
    s._sx=p.x; s._sy=p.y; s._depth=p.depth; s._z2=p.z2; s._bright=bright; s._size=size;
    hygProj.push(s);
  }
  hygProj.sort((a,b)=>a._z2-b._z2);
}
function drawHyg(){ LBL.prio=P_STAR;
  for(const s of hygProj){
    const bright=s._bright, size=Math.max(0.35, Math.min(3.6, s._size));
    const c=s.c, a=Math.max(.22,Math.min(1,(0.28+bright*0.12)*Math.min(1,1.9-s._depth*0.4)));
    const sel=(s===S.hover||s===S.pinned);
    ctx.beginPath(); ctx.arc(s._sx,s._sy, sel?size+1.4:size, 0, 6.2832);
    ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${a})`; ctx.fill();
    if(bright>5.2||sel){                               // glow for the bright named stars
      ctx.beginPath(); ctx.arc(s._sx,s._sy,size*2.6,0,6.2832);
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${a*0.12})`; ctx.fill();
    }
    if(sel){ ctx.beginPath(); ctx.arc(s._sx,s._sy,size+7,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    if(s.n && (sel || (s.m<1.7 && S.camZ<3.2))){        // label very bright / selected
      ctx.font=(sel?'11px':'9.5px')+' ui-monospace,monospace';
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${sel?1:.6})`;
      LBL.prio=sel?P_SEL:P_STAR;
      ctx.fillText(s.n, s._sx+size+4, s._sy+3); LBL.prio=P_STAR;
    }
  }
}

// ---- solar system (positioned on the SAME unified scale: orbit radius = rlog(a·AU)) ----
let solarProj=[];
function orbitR(a){ return scale(a*AU_PC); }
// Bodies are drawn at their TRUE relative radii: the Sun really is 109 Earths across
// and the Moon really is a quarter of one. (The old model raised the ratio to the 0.42
// and added a constant, which squeezed the Sun down to ~5 Earths and puffed the Moon up
// to almost one — everything ended up looking the same size.) Positions stay compressed;
// only the sizes are honest, with a pixel floor so small moons remain clickable.
// One shared factor, so the ratios above stay EXACT at every zoom. Its value is set by
// the one constraint the compressed map imposes: the Sun's disc has to stay inside
// Earth's orbit. In compact mode 1 AU is a fixed 0.686 world units, so
//     109.3 · K · 0.02  ≤  0.30 · 0.686   →   K ≤ 0.094.
// Pick that, and everything else follows from its true radius. (Distances are
// compressed here and sizes are not, which is why a factor is needed at all — in real
// scale mode truePx below takes over and both are honest together.)
const BODY_K = 0.094;
function bodyPx(rk,depth){
  const ratio=rk/6371;
  const de = S.realScale ? (depth/S.camZ)*3.2 : depth;   // real: normalise to the log framing range
  // cap 4× the viewport: diving in takes you past full disc INTO the imagery (clouds fill the view)
  const sym = Math.max(1.7, Math.min(Math.min(W,H)*4, ratio*BODY_K*foc*0.02/de));
  if(!S.realScale) return sym;
  // real scale: once the TRUE angular size is resolvable it wins — fly at a
  // planet and it grows to a disc, exactly as it would in reality
  const truePx = foc*(rk*3.2408e-14)/depth;              // rk km -> pc, perspective size
  return Math.min(Math.max(sym, truePx), Math.min(W,H)*0.75);
}
// Saturn's rings, split at the planet: the far half hides behind the globe, the
// near half passes in front — drawn via a half-plane clip in the ring's tilt frame
function saturnRings(x,y,px,A,near){
  const R=px*2.35+Math.max(1,px*0.11);
  ctx.save(); ctx.translate(x,y); ctx.rotate(-0.42);
  ctx.beginPath(); ctx.rect(-R, near?0:-R, 2*R, R); ctx.clip();
  for(const rr of [2.35,1.98,1.55]){                    // Cassini-division gap between rings
    ctx.beginPath(); ctx.ellipse(0,0,px*rr,px*rr*0.34,0,0,6.2832);
    ctx.strokeStyle=`rgba(226,208,160,${A*(rr>2?0.7:0.4)})`;
    ctx.lineWidth=Math.max(1,px*0.11); ctx.stroke(); }
  ctx.restore();
}
// lit-sphere shading: planets used to be flat colour discs, which the real-scale
// deep zoom turns into screen-filling flat circles. Radial gradient offset toward
// the Sun's screen position → correct terminator side + limb darkening.
let _ballSun=null;                                    // set per frame by drawSolar
function ballFill(x,y,r,c,A){
  ctx.beginPath(); ctx.arc(x,y,r,0,6.2832);
  if(r<5){ ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${A})`; ctx.fill(); return; }
  let lx=-0.5, ly=-0.5;                               // sun invisible (behind camera) → full phase-ish
  if(_ballSun){ const dx=_ballSun.x-x, dy=_ballSun.y-y, l=Math.hypot(dx,dy);
    if(l>1){ lx=dx/l; ly=dy/l; } else { lx=0; ly=0; } }
  const hi=c.map(v=>Math.min(255,Math.round(v*0.62+255*0.38)));
  const lo=c.map(v=>Math.round(v*0.16));
  const g=ctx.createRadialGradient(x+lx*r*0.48,y+ly*r*0.48,r*0.08, x+lx*r*0.14,y+ly*r*0.14,r*1.12);
  g.addColorStop(0,`rgba(${hi[0]},${hi[1]},${hi[2]},${A})`);
  g.addColorStop(0.45,`rgba(${c[0]},${c[1]},${c[2]},${A})`);
  g.addColorStop(0.8,`rgba(${Math.round(c[0]*0.55)},${Math.round(c[1]*0.55)},${Math.round(c[2]*0.55)},${A})`);
  g.addColorStop(1,`rgba(${lo[0]},${lo[1]},${lo[2]},${A})`);
  ctx.fillStyle=g; ctx.fill();
}
function orbitRing(r,style,dash){
  pathBegin();
  for(let k=0;k<=96;k++){ const th=k/96*6.2832; pathPt(project(Math.cos(th)*r,0,Math.sin(th)*r)); }
  pathStroke(style,1,dash);
}
function drawOrbitEllipse(el,style){        // true (eccentric, inclined) orbit on the unified scale
  pathBegin();
  for(let j=0;j<=120;j++){ const q=orbPoint(el,j/120*6.2832), w=eclToWorld(q[0],q[1],q[2]);
    pathPt(project(w[0],w[1],w[2])); }
  pathStroke(style,1);
}
// live Sun: GOES SUVI 304 Å (chromosphere, prominences) — SWPC serves it with CORS
let _suvi={im:null,ok:false,t:0,loading:false};
function suviImage(){
  if(!_suvi.loading && Date.now()-_suvi.t>10*60e3){
    _suvi.loading=true;
    const im=new Image(); im.crossOrigin='anonymous';
    im.onload=()=>{ _suvi.im=im; _suvi.ok=true; _suvi.t=Date.now(); _suvi.loading=false; dirty=true; };
    im.onerror=()=>{ _suvi.t=Date.now(); _suvi.loading=false; };   // keep the last good frame
    im.src='https://services.swpc.noaa.gov/images/animations/suvi/primary/304/latest.png';
  }
  return _suvi.ok?_suvi.im:null;
}
function drawSolar(alpha){ LBL.prio=P_SOLAR;
  ctx.globalAlpha=alpha; solarProj.length=0;
  const A=alpha;
  updateSolarPositions(solarJD());               // real positions for the selected date
  // reference belts
  orbitRing(orbitR(2.7),`rgba(150,140,120,${A*0.16})`,[2,4]);   // Asteroid belt
  orbitRing(orbitR(43),`rgba(120,150,190,${A*0.13})`,[2,5]);    // Kuiper belt
  if(S.hz){                                                     // habitable zone (Sun, L=1)
    orbitRing(orbitR(0.95),`rgba(110,230,150,${A*0.30})`);
    orbitRing(orbitR(1.67),`rgba(110,230,150,${A*0.30})`);
    const hp=project(orbitR(1.28),0,0);
    if(hp.depth>NEAR){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(120,230,150,${A*0.72})`;
      ctx.fillText('habitable zone', hp.x+4, hp.y-3); }
  }
  // orbits — true (eccentric, inclined) ellipses for planets AND dwarfs
  for(const b of SOLAR_BODIES){
    if(outerHidden(b)) continue;
    const faint=b.kind!=='Planet';
    if(b._el) drawOrbitEllipse(b._el, faint?`rgba(150,160,195,${A*0.18})`:`rgba(150,170,210,${A*0.30})`);
  }
  // Sun
  const sp=project(0,0,0);
  _ballSun = sp.depth>NEAR ? {x:sp.x,y:sp.y} : null;   // light source for lit-sphere shading
  if(sp.depth>NEAR){
    const spx=bodyPx(SUN.rk,sp.depth);
    drawHalo(haloSprite('sun',[[0,'rgba(255,240,190,0.9)'],[.4,'rgba(255,210,120,0.35)'],[1,'rgba(255,180,80,0)']],512),
             sp.x,sp.y,spx*3.2,A);
    ctx.beginPath(); ctx.arc(sp.x,sp.y,spx,0,6.2832);
    ctx.fillStyle=`rgba(255,240,190,${A})`; ctx.fill();
    if(spx>=14){                                   // live chromosphere on the disc
      const im=suviImage();
      if(im){ const s=im.width*0.30;               // SUVI disc ≈ 60% of the frame — crop to it
        ctx.save(); ctx.beginPath(); ctx.arc(sp.x,sp.y,spx,0,6.2832); ctx.clip();
        ctx.drawImage(im, im.width/2-s, im.height/2-s, s*2, s*2, sp.x-spx, sp.y-spx, spx*2, spx*2);
        ctx.restore();
        if(spx>46){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(255,200,140,${A*0.7})`;
          ctx.fillText('GOES SUVI 304 Å · live (~4 min)', sp.x+spx+4, sp.y+16); } }
    }
    solarProj.push({o:SUN,x:sp.x,y:sp.y,px:spx}); window.__solarProj=solarProj;
    ctx.font='11px ui-monospace,monospace'; ctx.fillStyle=`rgba(255,238,178,${A*0.9})`;
    ctx.fillText('Sun', sp.x+spx+4, sp.y+3);
    ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(200,208,225,${A*0.6})`;
    ctx.fillText('Orbital positions · '+dateStr(solarJD()), sp.x+spx+4, sp.y+16);
    if(S.sunAR) drawSunspots(A, sp, spx);
  }
  // planets & dwarfs at their real positions (painter: sort by depth)
  const drawn=[];
  SOLAR_BODIES.forEach(b=>{
    if(!b._e || outerHidden(b)) return;
    const w=eclToWorld(b._e[0],b._e[1],b._e[2]);
    const p=project(w[0],w[1],w[2]);
    if(p.depth<=NEAR) return;
    b._p=p; drawn.push(b);
  });
  drawn.sort((a,b)=>a._p.z2-b._p.z2);
  for(const b of drawn){
    const p=b._p, px=bodyPx(b.rk,p.depth), c=b.c;
    const sel=(b===S.hover||b===S.pinned);
    if(b.ring) saturnRings(p.x,p.y,px,A,false);   // far half — behind the globe
    if(b.uring){  // Uranus — rings nearly perpendicular (the planet is tipped on its side)
      for(const rr of [1.95,1.55]){
        ctx.beginPath(); ctx.ellipse(p.x,p.y,px*rr*0.32,px*rr,0.36,0,6.2832);
        ctx.strokeStyle=`rgba(190,214,220,${A*(rr>1.8?0.5:0.32)})`;
        ctx.lineWidth=Math.max(1,px*0.09); ctx.stroke(); }
    }
    ballFill(p.x,p.y,px,c,A);
    if(b.n==='Earth') _earthScr = px>Math.min(W,H)*0.5 ? {x:p.x,y:p.y,r:px} : null;
    if(b.n==='Earth' && px>=16){                       // the real Earth: 3D globe > GOES > EPIC
      let credit=null;
      _globeOn=false;
      if(px>=26){
        const gcv=earthGlobe(px, solarJD());
        if(gcv){ ctx.drawImage(gcv, p.x-px, p.y-px, px*2, px*2);
          _globeOn=true; credit=`3D · GIBS VIIRS ${_gbl.texDate} · drag to rotate — the terminator is real`; }
      }
      if(!_globeOn){
        const {im,live}=earthImage(px);
        if(im){ ctx.save(); ctx.beginPath(); ctx.arc(p.x,p.y,px,0,6.2832); ctx.clip();
          ctx.drawImage(im, p.x-px, p.y-px, px*2, px*2); ctx.restore();
          credit=(live?'GOES-East GEOCOLOR · live (~10 min)':'NASA EPIC (DSCOVR) · daily')
            +(_gbl&&_gbl.gl&&!_gbl.texReady?' — 3D globe loading…'
              :_gbl&&!_gbl.gl?' — fixed view (3D globe unavailable: WebGL)':''); }
      }
      if(credit && px>70){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(160,200,240,${A*0.7})`;
        if(p.x+px+8<W) ctx.fillText(credit, p.x+px+4, p.y+16);
        else ctx.fillText(credit, 16, H-64);           // limb off-screen → pin to the corner
      }
    }
    else if(px>=26 && PTEX[b.n]){                      // textured planets: same sphere pass
      const gcv=bodyGlobe(b,px,solarJD());
      if(gcv){ ctx.drawImage(gcv, p.x-px, p.y-px, px*2, px*2);
        if(px>70){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(160,200,240,${A*0.7})`;
          const cr='texture · Solar System Scope (CC-BY)';
          if(p.x+px+8<W) ctx.fillText(cr, p.x+px+4, p.y+16); else ctx.fillText(cr, 16, H-64); } }
    }
    if(b.ring) saturnRings(p.x,p.y,px,A,true);         // near half — in front of the globe
    if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,px+7,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    solarProj.push({o:b,x:p.x,y:p.y,px:px});
    const faint=b.kind!=='Planet';
    ctx.font=(sel?'11px':'10px')+' ui-monospace,monospace';
    ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${A*(faint?0.72:0.95)})`;
    ctx.fillText(b.n, p.x+px+4, p.y+3);
    // moons — spaced by REAL relative orbital distance (am), sized by real radius
    if(S.moons && b.moons.length){
      // the moon list is static, but this used to map+slice+sort it on every frame for
      // every planet — Jupiter alone has 66 moons, so it was ~300 array allocations and
      // a full sort per frame before a single moon was drawn
      if(!b._ms){ b._ms=b.moons.slice().sort((x,y)=>x.am-y.am);
        b._amMax=b.moons.reduce((a,m)=>m.am>a?m.am:a, 0); }
      const amMax=b._amMax, ms=b._ms;
      const jdM=solarJD();
      // real scale: if even the outermost moon sits within a pixel of the planet, the whole
      // system is unresolved — nothing to see, nothing to pick (unless one is selected)
      const resolvable=!S.realScale || foc*(amMax*3.2408e-11)/p.depth>1.2
        || (S.pinned&&S.pinned.parent===b.n) || (S.hover&&S.hover.parent===b.n);
      if(resolvable) ms.forEach((m,mi)=>{
        const msel0=(m===S.hover||m===S.pinned);
        if(m.minor && px<13 && !msel0) return;      // small irregular moons: close zoom only
        const t=Math.log10(m.am+1)/Math.log10(amMax+1);       // 0..1 by true distance
        const rr=px+12 + t*Math.min(130, px*3.2+80);
        // separation on screen: TRUE angular separation in real scale, exploded (log) otherwise
        const sepPx=Math.min(S.realScale ? foc*(m.am*3.2408e-11)/p.depth : rr, 8*Math.max(W,H));
        const eph=MOON_EPH[m.n];
        let mx,my;
        if(eph){                                   // real orbital phase + real orbit plane
          const dm=moonDirAt(eph, eph.w*(jdM-eph.ep)); camDir2i(dm[0],dm[1],dm[2]);
          mx=p.x+_d2x*sepPx; my=p.y+_d2y*sepPx;
          // the orbit outline is 25 segments; below a few pixels of separation it is a
          // dot, so scale the segment count to what is actually resolvable
          const seg = sepPx<7 ? 0 : sepPx<40 ? 12 : 24;
          if(seg){
            ctx.beginPath();
            for(let k=0;k<=seg;k++){ const rp=moonDirAt(eph, k/seg*6.2832);
              camDir2i(rp[0],rp[1],rp[2]);
              const qx=p.x+_d2x*sepPx, qy=p.y+_d2y*sepPx;
              if(k===0) ctx.moveTo(qx,qy); else ctx.lineTo(qx,qy); }
            ctx.strokeStyle=`rgba(160,175,205,${A*0.15})`; ctx.lineWidth=0.6; ctx.stroke();
          }
        } else {                                    // fallback: schematic ring
          const ang=mi*2.24+0.7;
          mx=p.x+Math.cos(ang)*sepPx; my=p.y+Math.sin(ang)*sepPx*0.9;
          ctx.beginPath(); ctx.ellipse(p.x,p.y,sepPx,sepPx*0.9,-0.3,0,6.2832);
          ctx.strokeStyle=`rgba(160,175,205,${A*0.13})`; ctx.lineWidth=0.6; ctx.stroke();
        }
        const mde=S.realScale?(p.depth/S.camZ)*3.2:p.depth;
        // same law AND the same caps as bodyPx — moons used to cap at 10 px / half the
        // viewport while planets capped at 4×, so up close every moon clipped to the same
        // size and Io ended up two thirds of Jupiter instead of a fortieth
        let mpx=Math.max(1.1,Math.min(Math.min(W,H)*4,(m.rk/6371)*BODY_K*foc*0.02/mde));
        if(S.realScale) mpx=Math.min(Math.max(mpx, foc*(m.rk*3.2408e-14)/p.depth), Math.min(W,H)*4);
        ballFill(mx,my,mpx,m.c,A);
        if(m.n==='Moon'&&mpx>=26){                 // the Moon gets its real face up close
          const gcv=bodyGlobe({n:'Moon',_e:b._e},mpx,jdM);
          if(gcv) ctx.drawImage(gcv,mx-mpx,my-mpx,mpx*2,mpx*2);
        }
        const msel=(m===S.hover||m===S.pinned);
        if(msel){ ctx.beginPath(); ctx.arc(mx,my,mpx+5,0,6.2832);
          ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1; ctx.stroke(); }
        solarProj.push({o:m,x:mx,y:my,px:Math.max(4,mpx)});
        if((px>9||msel)&&(!m.minor||msel)){ ctx.font='9px ui-monospace,monospace';
          ctx.fillStyle=`rgba(${m.c[0]},${m.c[1]},${m.c[2]},${A*0.8})`;
          ctx.fillText(m.n, mx+mpx+3, my+3); }
      });
    }
  }
  if(S.lag) drawLagrange(A);
  // belt labels
  const bl=project(orbitR(2.7),0,0);
  if(bl.depth>NEAR){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(170,158,130,${A*0.6})`;
    ctx.fillText('Asteroid belt', bl.x+4, bl.y-3); }
  if(S.ast) drawSmall(A, solarJD());
  if(S.helio){
    // faint blue shell between the termination shock and the heliopause
    const rTS=orbitR(90), rHP=orbitR(122), sunp=project(0,0,0);
    if(sunp.depth>NEAR){ const rr=Math.abs(project(rHP,0,0).x-sunp.x)||0;
      drawHalo(haloSprite('helio',[[0,'rgba(90,140,220,0)'],[.72,'rgba(90,150,225,0.05)'],[1,'rgba(120,170,235,0.11)']]),
               sunp.x,sunp.y,rr,A); }
    orbitRing(rTS,`rgba(135,195,238,${A*0.5})`,[3,5]);
    orbitRing(rHP,`rgba(165,180,242,${A*0.62})`,[2,5]);
    const ts=project(rTS,0,0), hp2=project(rHP,0,0);
    ctx.font='9px ui-monospace,monospace';
    if(ts.depth>NEAR){ ctx.fillStyle=`rgba(145,200,238,${A*0.8})`; ctx.fillText('termination shock ~90 AU', ts.x+4, ts.y+11); }
    if(hp2.depth>NEAR){ ctx.fillStyle=`rgba(172,190,244,${A*0.85})`; ctx.fillText('heliopause ~120 AU', hp2.x+4, hp2.y-3); }
  }
  if(S.probes) drawProbes(A);
  if(S.iso) drawISO(A);
  if(S.cme) drawCME(A);
  if(S.neo){ drawLiveNeo(A); drawFireballs(A); }
  if(S.sat) drawSats(A);
  if(TRANSFER) drawTransfer(A);
  ctx.globalAlpha=1;
}
function outerHidden(b){ return (b.kind==='Trans-Neptunian object'||b.kind==='Centaur') && !S.tno; }
function drawProbes(A){ LBL.prio=P_PROBE;
  const sun=project(0,0,0);
  const drawn=PROBES.map(p=>{ const w=eclToWorld(p._e[0],p._e[1],p._e[2]); return {p,pr:project(w[0],w[1],w[2])}; })
    .filter(d=>d.pr.depth>NEAR).sort((a,b)=>a.pr.z2-b.pr.z2);
  for(const {p,pr} of drawn){
    const c=p.c, sel=(p===S.hover||p===S.pinned);
    pathBegin(); pathPt(sun); pathPt(pr); pathStroke(`rgba(${c[0]},${c[1]},${c[2]},${A*0.16})`,0.7,[2,4]);
    const sz=4.5;
    ctx.beginPath(); ctx.moveTo(pr.x,pr.y-sz); ctx.lineTo(pr.x+sz,pr.y); ctx.lineTo(pr.x,pr.y+sz); ctx.lineTo(pr.x-sz,pr.y); ctx.closePath();
    ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${A})`; ctx.fill();
    if(sel){ ctx.beginPath(); ctx.arc(pr.x,pr.y,sz+6,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    solarProj.push({o:p,x:pr.x,y:pr.y,px:Math.max(7,sz+3)});
    ctx.font=(sel?'10px':'9px')+' ui-monospace,monospace'; ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${A*0.92})`;
    ctx.fillText(p.n, pr.x+sz+4, pr.y+3);
  }
}
// ---- interstellar visitors: the only known objects from beyond the solar system ----
// hyperbolic elements (JPL SBDB) solved via the hyperbolic Kepler equation, so the
// time slider replays each passage (1I: 2017, 2I: 2019, 3I: 2025)
const ISO=[
 {n:'1I/ʻOumuamua', q:0.255343,e:1.20113,i:122.7417,om:24.5997, w:241.8105,tp:2458005.99,rk:0.11,
  note:'first interstellar visitor (2017) — elongated, tumbling, origin still debated'},
 {n:'2I/Borisov',   q:2.00664, e:3.3565, i:44.0526, om:308.1490,w:209.1246,tp:2458826.05,rk:0.4,
  note:'first clearly cometary interstellar visitor (2019)'},
 {n:'3I/ATLAS',     q:1.35638, e:6.1395, i:175.1131,om:322.1577,w:127.9889,tp:2460978.03,rk:1.4,
  note:'third interstellar visitor (2025) — fastest yet, ~58 km/s hyperbolic excess'},
];
ISO.forEach(o=>{ o.kind='Interstellar object'; o.c=[110,255,180]; o.iso=true; });
function isoEcl(o,jd){
  const a=o.q/(1-o.e), M=0.01720209895/Math.sqrt(-a*a*a)*(jd-o.tp);
  let H=Math.sign(M||1)*Math.log(2*Math.abs(M)/o.e+1.8);
  for(let k=0;k<40;k++){ const d=(o.e*Math.sinh(H)-H-M)/(o.e*Math.cosh(H)-1);
    H-=d; if(Math.abs(d)<1e-12) break; }
  const nu=2*Math.atan(Math.sqrt((o.e+1)/(o.e-1))*Math.tanh(H/2)), r=a*(1-o.e*Math.cosh(H));
  const xw=r*Math.cos(nu), yw=r*Math.sin(nu);
  const cw=Math.cos(o.w*D2R),sw=Math.sin(o.w*D2R),ci=Math.cos(o.i*D2R),si=Math.sin(o.i*D2R),
        cO=Math.cos(o.om*D2R),sO=Math.sin(o.om*D2R);
  return [(cO*cw-sO*sw*ci)*xw+(-cO*sw-sO*cw*ci)*yw,
          (sO*cw+cO*sw*ci)*xw+(-sO*sw+cO*cw*ci)*yw,
          (sw*si)*xw+(cw*si)*yw];
}
function drawISO(A){ LBL.prio=P_PROBE;
  const jd=solarJD();
  for(const o of ISO){
    o._e=isoEcl(o,jd); o._r=Math.hypot(o._e[0],o._e[1],o._e[2]);
    if(!o._path){ o._path=[];                    // the hyperbola is fixed in space — sample once
      for(let k=0;k<=120;k++){ const e2=isoEcl(o, o.tp-1460+k/120*2920);
        o._path.push(Math.hypot(e2[0],e2[1],e2[2])<=35?e2:null); } }
    pathBegin();
    for(const e2 of o._path){
      if(!e2){ pathBreak(); continue; }
      const w=eclToWorld(e2[0],e2[1],e2[2]); pathPt(project(w[0],w[1],w[2]));
    }
    pathStroke(`rgba(110,255,180,${A*0.42})`,1,[4,4]);
    const w=eclToWorld(o._e[0],o._e[1],o._e[2]), p=project(w[0],w[1],w[2]);
    if(p.depth<=NEAR||offscr(p)) continue;
    const sel=(o===S.hover||o===S.pinned), sz=sel?6:5;
    ctx.beginPath(); ctx.moveTo(p.x,p.y-sz); ctx.lineTo(p.x+sz,p.y); ctx.lineTo(p.x,p.y+sz); ctx.lineTo(p.x-sz,p.y); ctx.closePath();
    ctx.fillStyle=`rgba(110,255,180,${A})`; ctx.fill();
    ctx.beginPath(); ctx.arc(p.x,p.y,sz+4,0,6.2832);
    ctx.strokeStyle=`rgba(110,255,180,${A*(sel?0.9:0.45)})`; ctx.lineWidth=1.1; ctx.stroke();
    solarProj.push({o,x:p.x,y:p.y,px:sz+5});
    ctx.font=(sel?'10px':'9px')+' ui-monospace,monospace';
    ctx.fillStyle=`rgba(150,255,200,${A*0.95})`;
    ctx.fillText(o.n+' · interstellar', p.x+sz+4, p.y+3);
  }
}
// large asteroids & comets on their real orbits (time-aware)
function drawSmall(A, jd){ LBL.prio=P_SMALL;
  const sun=project(0,0,0);
  for(const o of SMALL){
    o._el=keplerSB(o.kd,jd); o._e=orbPoint(o._el,o._el.E); o._r=Math.hypot(o._e[0],o._e[1],o._e[2]);
    const com=o.t==='COM', bulk=o.t==='COM2';
    if(!bulk || o===S.hover || o===S.pinned)
      drawOrbitEllipse(o._el, (com||bulk)?`rgba(120,210,228,${A*(bulk?0.30:0.26)})`:`rgba(172,166,150,${A*0.18})`);
  }
  const drawn=SMALL.map(o=>{ const w=eclToWorld(o._e[0],o._e[1],o._e[2]); return {o,p:project(w[0],w[1],w[2])}; })
    .filter(d=>d.p.depth>NEAR).sort((a,b)=>a.p.z2-b.p.z2);
  for(const {o,p} of drawn){
    const com=o.t==='COM', bulk=o.t==='COM2';
    const c=com?[135,222,234]:bulk?[110,190,205]:[190,180,158];
    const px=bulk?1.8:Math.max(2.2, Math.min(6, 3*A + (com?1:0)));
    if(com && sun.depth>NEAR){                 // simple anti-solar tail
      let tx=p.x-sun.x, ty=p.y-sun.y, tl=Math.hypot(tx,ty)||1; tx/=tl; ty/=tl;
      const g=ctx.createLinearGradient(p.x,p.y,p.x+tx*22,p.y+ty*22);
      g.addColorStop(0,`rgba(150,230,240,${A*0.6})`); g.addColorStop(1,'rgba(150,230,240,0)');
      ctx.strokeStyle=g; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+tx*22,p.y+ty*22); ctx.stroke();
    }
    const sel=(o===S.hover||o===S.pinned);
    ctx.beginPath(); ctx.arc(p.x,p.y,px,0,6.2832); ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${A})`; ctx.fill();
    if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,px+5,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    solarProj.push({o,x:p.x,y:p.y,px:Math.max(6,px)});
    if((A>0.5||sel)&&(!bulk||sel)){ ctx.font=(sel?'10px':'8.5px')+' ui-monospace,monospace';
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${sel?1:0.72})`;
      LBL.prio=sel?P_SEL:P_SMALL; ctx.fillText(o.n, p.x+px+3, p.y+3); LBL.prio=P_SMALL; }
  }
}

// ---- live layer: CME fronts (NASA DONKI) + upcoming NEO flybys (NASA NeoWs) ----
// CME direction: DONKI lat/lon are Stonyhurst (Earth at lon 0, west positive).
// Frame: x̂ = Sun→Earth (ecliptic), ŷ = ẑ×x̂ (solar west ≈ Earth's orbital motion), ẑ = ecliptic north.
function cmeSolarMs(){ return (solarJD()-2440587.5)*86400000; }
function drawCME(A){ LBL.prio=P_SMALL;
  if(!LIVE.cmes.length) return;
  const earth=PLANETS.find(p=>p.n==='Earth'); if(!earth||!earth._e) return;
  const nowMs=cmeSolarMs(), lamE=Math.atan2(earth._e[1],earth._e[0]);
  const cE=Math.cos(lamE), sE=Math.sin(lamE);
  for(const c of LIVE.cmes){
    const dt=(nowMs-c.t)/1000; if(dt<=0) continue;               // not yet erupted at this sim time
    const rAU=0.1 + c.v*dt/1.496e8; if(rAU>2.6) continue;        // front left the inner system
    const fade=Math.max(0,Math.min(1,(2.6-rAU)/0.7));
    const la=c.lat*D2R, lo=c.lon*D2R, cb=Math.cos(la);
    const hx=cb*Math.cos(lo), hy=cb*Math.sin(lo), hz=Math.sin(la);
    const d=[hx*cE-hy*sE, hx*sE+hy*cE, hz];                      // axis in ecliptic coords
    // rim basis ⟂ axis
    let u=[-d[1],d[0],0]; const ul=Math.hypot(u[0],u[1],u[2])||1; u=[u[0]/ul,u[1]/ul,u[2]/ul];
    const v=[d[1]*u[2]-d[2]*u[1], d[2]*u[0]-d[0]*u[2], d[0]*u[1]-d[1]*u[0]];
    const col=c.v>=800?[255,96,80]:c.v>=500?[255,150,80]:[255,200,110];
    const H=Math.min(1.2,c.half*D2R), cH=Math.cos(H), sH=Math.sin(H);
    if(rAU<0.11) continue;
    // a CME is a directed plasma cone, so draw one: translucent fan from the Sun
    // that brightens toward the shock front — not a stack of concentric rings
    const sunp=project(0,0,0);
    const fw=eclToWorld(rAU*d[0],rAU*d[1],rAU*d[2]), fp=project(fw[0],fw[1],fw[2]);
    const rim=[]; let rimVis=0;
    for(let k=0;k<=48;k++){ const th=k/48*6.2832, ct=Math.cos(th), st=Math.sin(th);
      const ex=rAU*(cH*d[0]+sH*(ct*u[0]+st*v[0])), ey=rAU*(cH*d[1]+sH*(ct*u[1]+st*v[1])), ez=rAU*(cH*d[2]+sH*(ct*u[2]+st*v[2]));
      const w=eclToWorld(ex,ey,ez), p=project(w[0],w[1],w[2]);
      if(p.depth<=NEAR||offscr(p)){ rim.push(null); continue; }
      rim.push(p); rimVis++;
    }
    if(sunp.depth>NEAR && !offscr(sunp) && fp.depth>NEAR && !offscr(fp) && rimVis===49){
      const g=ctx.createLinearGradient(sunp.x,sunp.y,fp.x,fp.y);
      g.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},0)`);
      g.addColorStop(0.6,`rgba(${col[0]},${col[1]},${col[2]},${A*fade*0.09})`);
      g.addColorStop(0.93,`rgba(${col[0]},${col[1]},${col[2]},${A*fade*0.26})`);
      g.addColorStop(1,`rgba(${col[0]},${col[1]},${col[2]},0)`);
      ctx.beginPath(); ctx.moveTo(sunp.x,sunp.y);
      for(const p of rim) ctx.lineTo(p.x,p.y);
      ctx.closePath(); ctx.fillStyle=g; ctx.fill();
    }
    if(sunp.depth>NEAR){                     // radial streaks: the direction reads at a glance
      ctx.lineWidth=1.1; ctx.strokeStyle=`rgba(${col[0]},${col[1]},${col[2]},${A*fade*0.38})`;
      ctx.beginPath();
      for(let i=0;i<12;i++){
        const th=i/12*6.2832+0.35, ct=Math.cos(th), st=Math.sin(th);
        const mH=H*(0.25+((i*17)%13)/13*0.72), cM=Math.cos(mH), sM=Math.sin(mH);
        const dx=cM*d[0]+sM*(ct*u[0]+st*v[0]), dy=cM*d[1]+sM*(ct*u[1]+st*v[1]), dz=cM*d[2]+sM*(ct*u[2]+st*v[2]);
        const r2=rAU*(0.72+((i*37)%23)/23*0.2), r1=r2*0.42;
        const w1=eclToWorld(r1*dx,r1*dy,r1*dz), p1=project(w1[0],w1[1],w1[2]);
        const w2=eclToWorld(r2*dx,r2*dy,r2*dz), p2=project(w2[0],w2[1],w2[2]);
        if(p1.depth>NEAR&&p2.depth>NEAR&&!offscr(p1)&&!offscr(p2)){ ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); }
      }
      ctx.stroke();
    }
    ctx.beginPath(); let first=true;         // the shock front itself: one bright rim + soft glow
    for(const p of rim){ if(!p){first=true;continue;}
      if(first){ctx.moveTo(p.x,p.y);first=false;}else ctx.lineTo(p.x,p.y); }
    ctx.strokeStyle=`rgba(${col[0]},${col[1]},${col[2]},${A*fade*0.14})`;
    ctx.lineWidth=5.5; ctx.stroke();
    ctx.strokeStyle=`rgba(${col[0]},${col[1]},${col[2]},${A*fade*0.75})`;
    ctx.lineWidth=1.7; ctx.stroke();
    // label + pick target at the front's centre
    const tw=eclToWorld(rAU*d[0],rAU*d[1],rAU*d[2]), tp=project(tw[0],tw[1],tw[2]);
    if(tp.depth>NEAR){
      if(!c._o) c._o={cme:c, n:'Coronal mass ejection', c:col};
      const sel=(c._o===S.hover||c._o===S.pinned);
      ctx.font=(sel?'10px':'9px')+' ui-monospace,monospace';
      ctx.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},${A*fade*(sel?1:0.85)})`;
      ctx.fillText(`CME · ${Math.round(c.v)} km/s${c.earthDir?' · → Earth':''}`, tp.x+6, tp.y-4);
      if(sel){ ctx.beginPath(); ctx.arc(tp.x,tp.y,9,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
      solarProj.push({o:c._o,x:tp.x,y:tp.y,px:12});
    }
  }
}
function drawLiveNeo(A){ LBL.prio=P_SMALL;
  if(!LIVE.neos.length) return;
  const jd=solarJD(), nowMs=cmeSolarMs();
  const earth=PLANETS.find(p=>p.n==='Earth');
  let ep=null;
  if(earth&&earth._e){ const w=eclToWorld(earth._e[0],earth._e[1],earth._e[2]); const p=project(w[0],w[1],w[2]); if(p.depth>NEAR) ep=p; }
  for(const o of LIVE.neos){
    if(!o.kd) continue;
    o._el=keplerSB(o.kd,jd); o._e=orbPoint(o._el,o._el.E); o._r=Math.hypot(o._e[0],o._e[1],o._e[2]);
    const sel=(o===S.hover||o===S.pinned);
    drawOrbitEllipse(o._el, `rgba(255,168,88,${A*(sel?0.55:0.20)})`);
    const w=eclToWorld(o._e[0],o._e[1],o._e[2]), p=project(w[0],w[1],w[2]);
    if(p.depth<=NEAR) continue;
    const dtd=(o.t-nowMs)/86400000;                        // days until closest approach (sim time)
    if(ep && Math.abs(dtd)<5){                             // approach window: tie to Earth
      pathBegin(); pathPt(ep); pathPt(p); pathStroke(`rgba(255,168,88,${A*0.30})`,0.8,[3,4]);
    }
    const px=sel?6:4.5;                                    // diamond marker
    ctx.beginPath(); ctx.moveTo(p.x,p.y-px); ctx.lineTo(p.x+px,p.y); ctx.lineTo(p.x,p.y+px); ctx.lineTo(p.x-px,p.y); ctx.closePath();
    ctx.strokeStyle=`rgba(255,178,96,${A*(sel?1:0.9)})`; ctx.lineWidth=1.3; ctx.stroke();
    if(o.pha||o.sentry){ ctx.beginPath(); ctx.arc(p.x,p.y,px+3.5,0,6.2832);
      ctx.strokeStyle=`rgba(255,110,90,${A*0.7})`; ctx.lineWidth=0.9; ctx.stroke(); }
    if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,px+7,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    const rel=Math.abs(dtd)<0.04?'now':dtd>0?`in ${dtd>=1?Math.floor(dtd)+'d ':''}${Math.round(dtd%1*24)}h`:`${Math.abs(dtd).toFixed(1)}d ago`;
    const ldStr=o.ld<10?o.ld.toFixed(1):Math.round(o.ld);
    ctx.font=(sel?'10px':'9px')+' ui-monospace,monospace';
    ctx.fillStyle=`rgba(255,190,120,${A*(sel?1:0.8)})`;
    ctx.fillText(`${o.n} · ${rel} · ${ldStr} LD`, p.x+px+4, p.y+3);
    solarProj.push({o,x:p.x,y:p.y,px:Math.max(8,px+3)});
  }
}
// ---- EPIC: today's photo of Earth as the glyph texture (lazy, CORS image) ----
let _epicImg=null,_epicState=0;
function epicImage(){
  if(_epicState===0 && LIVE.epic){ _epicState=1;
    const im=new Image(); im.crossOrigin='anonymous';
    im.onload=()=>{ _epicImg=im; dirty=true; };
    im.onerror=()=>{ _epicState=2; };
    im.src=LIVE.epic.url;
  }
  return _epicImg;
}
// ---- GOES-19 GEOCOLOR full disk: a truly live Earth (new image every ~10 min) ----
// The disk fills the frame edge-to-edge (measured); the small NOAA banner at the
// bottom is left visible — it carries the real observation timestamp.
let _goesImg=null,_goesLoading=false,_goesTs=0,_goesHi=false,_goesFail=0;
function loadGoes(res){
  if(_goesLoading) return;
  _goesLoading=true;
  const im=new Image(); im.crossOrigin='anonymous';
  im.onload=()=>{ _goesImg=im; _goesTs=Date.now(); _goesHi=res>2000; _goesLoading=false; dirty=true; };
  im.onerror=()=>{ _goesLoading=false; _goesFail++; };
  im.src=`https://cdn.star.nesdis.noaa.gov/GOES19/ABI/FD/GEOCOLOR/${res}x${res}.jpg`
        +'?t='+Math.floor(Date.now()/600000);          // 10-min cache-buster
}
function earthImage(px){
  if(_goesFail>1) return {im:epicImage(), live:false};  // GOES unreachable → EPIC fallback
  const wantHi=px>420;
  if(!_goesImg || Date.now()-_goesTs>10*60*1000 || (wantHi&&!_goesHi))
    loadGoes(wantHi?5424:1808);
  return _goesImg ? {im:_goesImg, live:true} : {im:epicImage(), live:false};
}
// ---- 3D Earth globe: offscreen WebGL sphere with the daily VIIRS mosaic ----
// True orientation (GMST spin + 23.44° obliquity) and the real sun direction →
// the day/night terminator is where it actually is; dragging orbits the globe.
let _gbl=null, _globeOn=false;
function gmstRad(jd){ const d=jd-2451545; let g=(280.46061837+360.98564736629*d)%360;
  if(g<0)g+=360; return g*D2R; }
const OBLQ=23.439*Math.PI/180;
function globeViewRows(){
  const cy=Math.cos(S.yaw),sy=Math.sin(S.yaw),cp=Math.cos(S.pitch),sp=Math.sin(S.pitch);
  return [[cy,0,sy],[sy*sp,cp,-cy*sp],[-sy*cp,sp,cy*cp]];   // rows of project()'s rotation
}
function globeModelRows(t,eps){                              // spin angle t, axial tilt eps
  const ct=Math.cos(t), st=Math.sin(t), ce=Math.cos(eps), se=Math.sin(eps);
  return [[ct,-st,0],[-se*st,-se*ct,ce],[ce*st,ce*ct,se]];  // world ← ecl ← equatorial ← geographic
}
const rows2col=r=>[r[0][0],r[1][0],r[2][0], r[0][1],r[1][1],r[2][1], r[0][2],r[1][2],r[2][2]];
let _gblFails=0, _gblNextTry=0;
function globeInit(){
  if(_gbl!==null){
    if(_gbl.gl) return _gbl;
    // context/link failures are often transient (driver hiccup, context limit) —
    // retry with a fresh canvas instead of caching the failure forever
    if(_gblFails>=5 || performance.now()<_gblNextTry) return null;
    _gbl=null;
  }
  const fail=msg=>{ _gbl={gl:null}; _gblFails++; _gblNextTry=performance.now()+4000;
    try{console.warn(msg);}catch(e){} return null; };
  const cv2=document.createElement('canvas');
  const gl=cv2.getContext('webgl',{alpha:true,antialias:true});
  if(!gl) return fail('globe: no WebGL context');
  const mk=(t,src)=>{ const sh=gl.createShader(t); gl.shaderSource(sh,src); gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){ console.warn(gl.getShaderInfoLog(sh)); return null; } return sh; };
  const vsh=mk(gl.VERTEX_SHADER,`attribute vec3 aP; uniform mat3 uV,uM; varying vec3 vS;
    void main(){ vS=aP; vec3 q=uV*(uM*aP); gl_Position=vec4(q.x,q.y,-q.z*0.5,1.0); }`);
  const fsh=mk(gl.FRAGMENT_SHADER,`precision mediump float; varying vec3 vS;
    uniform highp mat3 uV,uM; uniform vec3 uSun; uniform sampler2D uT;
    void main(){
      vec3 n=normalize(vS);
      vec2 uv=vec2(0.5+atan(n.y,n.x)/6.2831853, 0.5-asin(clamp(n.z,-1.0,1.0))/3.14159265);
      vec3 tex=texture2D(uT,uv).rgb;
      vec3 wn=normalize(uM*n);
      float d=dot(wn,uSun);
      float day=smoothstep(-0.08,0.12,d);
      vec3 lit=tex*(0.16+0.92*max(d,0.0));
      vec3 night=tex*0.05+vec3(0.008,0.012,0.028);
      vec3 col=mix(night,lit,day);
      vec3 vn=uV*wn;                                        // subtle atmosphere at the limb
      col+=vec3(0.10,0.22,0.45)*pow(1.0-clamp(vn.z,0.0,1.0),3.0)*(0.25+0.75*day)*0.35;
      gl_FragColor=vec4(col,1.0);
    }`);
  if(!vsh||!fsh) return fail('globe: shader compile failed');
  const pr=gl.createProgram(); gl.attachShader(pr,vsh); gl.attachShader(pr,fsh); gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) return fail('globe: link failed');
  _gblFails=0;
  const ST=48,SL=96,pos=[],idx=[];
  for(let i=0;i<=ST;i++){ const ph=Math.PI*(i/ST-0.5), cp2=Math.cos(ph);
    for(let j=0;j<=SL;j++){ const la=2*Math.PI*j/SL;
      pos.push(cp2*Math.cos(la), cp2*Math.sin(la), Math.sin(ph)); } }
  for(let i=0;i<ST;i++) for(let j=0;j<SL;j++){
    const a=i*(SL+1)+j, b=a+SL+1; idx.push(a,b,a+1, a+1,b,b+1); }
  const vb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vb);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(pos),gl.STATIC_DRAW);
  const ib=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(idx),gl.STATIC_DRAW);
  const tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([30,50,90,255]));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.enable(gl.DEPTH_TEST);
  const aP=gl.getAttribLocation(pr,'aP');
  _gbl={cv:cv2,gl,pr,vb,ib,nIdx:idx.length,tex,aP,
    uV:gl.getUniformLocation(pr,'uV'),uM:gl.getUniformLocation(pr,'uM'),
    uSun:gl.getUniformLocation(pr,'uSun'),uT:gl.getUniformLocation(pr,'uT'),
    texReady:false,loading:false,texDate:''};
  return _gbl;
}
// fraction of black/no-data pixels, polar caps excluded (polar night is legitimately dark)
function mosaicGaps(cnv){
  const c=document.createElement('canvas'); c.width=128; c.height=64;
  const g2=c.getContext('2d'); g2.drawImage(cnv,0,0,128,64);
  const d=g2.getImageData(0,12,128,40).data;             // ±56° band — clear of winter darkness;
                                                         // missing orbit swaths cross it anyway
  let black=0, n=0;
  for(let i=0;i<d.length;i+=4){ n++; if(d[i]+d[i+1]+d[i+2]<24) black++; }
  return black/n;
}
// stitch the GIBS level-3 equirect mosaic (10×5 tiles of 512px) into the texture.
// The freshest days are often only partially ingested (missing orbit swaths render
// as black) — walk back until a day is ≥94% complete, else keep the best one seen.
function globeTexture(){
  const g=_gbl; if(!g||g.loading||g.texReady) return;
  if(g.nextTexTry && performance.now()<g.nextTexTry) return;   // full ladder failed: back off,
  g.loading=true;                                              // don't restart 50 fetches per frame
  const finish=()=>{
    const b=g.best;
    if(!b){ g.loading=false; g.nextTexTry=performance.now()+30000;
      try{console.warn('globe: mosaic unavailable, retrying in 30 s');}catch(e){} return; }
    const sc=document.createElement('canvas'); sc.width=4096; sc.height=2048;
    sc.getContext('2d').drawImage(b.cnv,0,0,4096,2048);
    const gl=g.gl;
    gl.bindTexture(gl.TEXTURE_2D,g.tex);
    try{ gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,sc);
      g.texReady=true; g.texDate=b.date; SURF.dayOff=Math.max(SURF.dayOff,b.off);
      try{console.log('globe: mosaic ready ·',b.date,'·',(b.frac*100).toFixed(1)+'% gaps');}catch(e){}
    }catch(e){ try{console.warn('globe: texture upload failed',e);}catch(e2){} }
    g.best=null; g.loading=false; dirty=true;
  };
  const tryDay=off=>{
    if(off>5){ finish(); return; }
    const date=new Date(Date.now()-off*86400000).toISOString().slice(0,10);
    const cnv=document.createElement('canvas'); cnv.width=5120; cnv.height=2560;
    const c2=cnv.getContext('2d');
    let n=0, failed=false;
    for(let r=0;r<5;r++) for(let c=0;c<10;c++){
      const im=new Image(); im.crossOrigin='anonymous';
      im.onload=()=>{ if(failed) return;
        c2.drawImage(im,c*512,r*512);
        if(++n===50){
          let frac=0;
          try{ frac=mosaicGaps(cnv); }catch(e){}         // sampling failed → just accept the day
          if(!g.best || frac<g.best.frac) g.best={cnv,frac,date,off};
          if(frac>0.06){
            try{console.log('globe: mosaic',date,'is',(frac*100).toFixed(0)+'% black — trying an earlier day');}catch(e){}
            tryDay(off+1); return;
          }
          finish();
        } };
      im.onerror=()=>{ if(!failed){ failed=true; tryDay(off+1); } };
      im.src=`https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/250m/3/${r}/${c}.jpg`;
    }
  };
  tryDay(SURF.dayOff||1);
}
function renderGlobe(px,tex,Mrows,body){                 // shared sphere pass (Earth + planets)
  const g=globeInit(); if(!g) return null;
  const dpr=Math.min(2,window.devicePixelRatio||1);
  const size=Math.max(64,Math.min(2048,Math.ceil(px*2*dpr)));
  if(g.cv.width!==size){ g.cv.width=g.cv.height=size; }
  const gl=g.gl;
  gl.viewport(0,0,size,size);
  gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.useProgram(g.pr);
  gl.bindBuffer(gl.ARRAY_BUFFER,g.vb);
  gl.enableVertexAttribArray(g.aP);
  gl.vertexAttribPointer(g.aP,3,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.ib);
  gl.uniformMatrix3fv(g.uV,false,rows2col(globeViewRows()));
  gl.uniformMatrix3fv(g.uM,false,rows2col(Mrows));
  let sun=[0,0,1];
  if(body&&body._e){ const w=[-body._e[0],-body._e[2],-body._e[1]];
    const l=Math.hypot(w[0],w[1],w[2])||1; sun=[w[0]/l,w[1]/l,w[2]/l]; }
  gl.uniform3fv(g.uSun,sun);
  gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.uniform1i(g.uT,0);
  gl.drawElements(gl.TRIANGLES,g.nIdx,gl.UNSIGNED_SHORT,0);
  return g.cv;
}
function earthGlobe(px,jd){
  const g=globeInit(); if(!g) return null;
  if(!g.texReady){ globeTexture(); return null; }        // GOES disc until the mosaic is in
  const earth=PLANETS.find(p=>p.n==='Earth');
  return renderGlobe(px,g.tex,globeModelRows(gmstRad(jd),OBLQ),earth);
}
// planet globes: local equirect maps (Solar System Scope · CC BY 4.0) on the same
// sphere pass — real sun direction, spin from the true rotation period (schematic pole)
const PTEX={ Moon:['moon',27.322,0.116],
  Mercury:['mercury',58.646,0.001], Venus:['venus',-243.02,3.096],
  Mars:['mars',1.02596,0.4396], Jupiter:['jupiter',0.41354,0.0546],
  Saturn:['saturn',0.44401,0.4665], Uranus:['uranus',-0.71833,1.706],
  Neptune:['neptune',0.67125,0.4943] };                  // [file, rot d, tilt rad]
function bodyGlobe(b,px,jd){
  const cfg=PTEX[b.n]; if(!cfg) return null;
  const g=globeInit(); if(!g) return null;
  if(!g.pt) g.pt={};
  let t=g.pt[cfg[0]];
  if(!t){ t=g.pt[cfg[0]]={tex:null,ready:false};
    const im=new Image();
    im.onload=()=>{ try{ const gl=g.gl, tx=gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D,tx);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      t.tex=tx; t.ready=true; dirty=true; }catch(e){} };
    im.src='data/tex/'+cfg[0]+'.jpg';                    // missing (artifact build) → shaded ball stays
  }
  if(!t.ready) return null;
  const rot=((jd/cfg[1])%1)*6.283185307;
  return renderGlobe(px,t.tex,globeModelRows(rot,cfg[2]),b);
}
// screen point on the globe → geographic lat/lon (for the surface-mode entry)
function globeInverse(u,v){
  const rho=Math.hypot(u,v); if(rho>=1) return null;
  const nv=[u,-v,Math.sqrt(1-rho*rho)];
  const V=globeViewRows(), M=globeModelRows(gmstRad(solarJD()),OBLQ);
  const wrl=[V[0][0]*nv[0]+V[1][0]*nv[1]+V[2][0]*nv[2],   // Vᵀ·nv
             V[0][1]*nv[0]+V[1][1]*nv[1]+V[2][1]*nv[2],
             V[0][2]*nv[0]+V[1][2]*nv[1]+V[2][2]*nv[2]];
  const geo=[M[0][0]*wrl[0]+M[1][0]*wrl[1]+M[2][0]*wrl[2], // Mᵀ·wrl
             M[0][1]*wrl[0]+M[1][1]*wrl[1]+M[2][1]*wrl[2],
             M[0][2]*wrl[0]+M[1][2]*wrl[1]+M[2][2]*wrl[2]];
  return [Math.asin(Math.max(-1,Math.min(1,geo[2])))/D2R, Math.atan2(geo[1],geo[0])/D2R];
}
// ---- surface mode: past full-disk resolution the view descends into a real tile map ----
// NASA GIBS · VIIRS true color (yesterday UTC — the last complete global mosaic),
// web-mercator tiles up to level 9 (~300 m/px). Entry point = where the view centre
// sits on the GOES disc (orthographic inverse from the GOES-East sub-point, 75.2°W).
const SURF={on:false, lat:20, lon:-75, cache:new Map(), order:[], dayOff:2};   // day-1 is often half-ingested
const SURF_ENTER=0.003, SURF_EXIT=0.0033, GOES_LON=-75.2, RE_PC=2.0646e-10;  // Earth radius in pc
let _earthScr=null;
// real scale: descend where the true disc overflows the viewport (~200 km altitude);
// log mode keeps its fixed camZ threshold
function surfEnterZ(){ return S.realScale ? 2*foc*RE_PC/(Math.min(W,H)*1.2) : SURF_ENTER; }
// GIBS ingests with 1-2 days lag — start at yesterday, fall back on tile 404s
function surfDate(){ return new Date(Date.now()-SURF.dayOff*86400000).toISOString().slice(0,10); }
function surfMpp(){                                                // m per screen px
  if(S.realScale) return 12742000*S.camZ/(2*foc*RE_PC);            // true perspective: disc px ↔ metres
  return 12742000/(8*Math.min(W,H)) * (S.camZ/SURF_ENTER);
}
function surfUpdate(){
  const enterZ=surfEnterZ();
  if(!SURF.on){
    if(S.camZ<enterZ && _earthScr){
      const u=(cx-_earthScr.x)/_earthScr.r, v=(cy-_earthScr.y)/_earthScr.r;
      const rho=Math.hypot(u,v);
      if(rho<0.985){                                  // view centre is on the disc → descend
        const gi=_globeOn?globeInverse(u,v):null;
        if(gi){ SURF.lat=gi[0]; SURF.lon=gi[1]; }
        else {                                        // flat GOES disc: orthographic from 75.2°W
          const c=Math.asin(Math.min(1,rho));
          SURF.lat = rho<1e-6 ? 0 : Math.asin(-v*Math.sin(c)/rho)/D2R;
          SURF.lon = GOES_LON + (rho<1e-6 ? 0 : Math.atan2(u*Math.sin(c), rho*Math.cos(c))/D2R);
        }
        SURF.on=true;
      } else { S.camZ=tgtCamZ=enterZ; }            // diving beside the planet: hold the floor
    }
  } else if(S.camZ>(S.realScale?enterZ*1.1:SURF_EXIT)){ SURF.on=false; }
  return SURF.on;
}
function surfTile(z,x,y){
  const n=1<<z; x=((x%n)+n)%n;
  if(y<0||y>=n) return null;
  const url=`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${surfDate()}/GoogleMapsCompatible_Level9/${z}/${y}/${x}.jpg`;
  let t=SURF.cache.get(url);
  if(!t){
    t={im:new Image(),ok:false};
    t.im.crossOrigin='anonymous';
    t.im.onload=()=>{ t.ok=true; dirty=true; };
    const day=SURF.dayOff;
    t.im.onerror=()=>{                                // mosaic for that day not ingested yet
      if(day===SURF.dayOff && SURF.dayOff<4){
        SURF.dayOff++; SURF.cache.clear(); SURF.order.length=0; dirty=true; }
    };
    t.im.src=url;
    SURF.cache.set(url,t); SURF.order.push(url);
    if(SURF.order.length>260){ SURF.cache.delete(SURF.order.shift()); }
  }
  return t.ok?t.im:null;
}
function drawSurface(){ LBL.prio=P_HUD;
  const mpp=surfMpp(), latR=SURF.lat*D2R;
  const zf=Math.log2(156543.034*Math.cos(latR)/mpp);
  const zt=Math.max(2,Math.min(9,Math.round(zf)));
  const k=Math.pow(2,zf-zt), ts=256*k;                // tile size on screen
  const n=1<<zt;
  const wx=(SURF.lon+180)/360*n;                      // centre in tile units
  const sy=Math.sin(latR);
  const wy=(0.5-Math.log((1+sy)/(1-sy))/(4*Math.PI))*n;
  ctx.fillStyle='#04070f'; ctx.fillRect(0,0,W,H);
  const x0=Math.floor(wx-cx/ts), x1=Math.ceil(wx+(W-cx)/ts);
  const y0=Math.floor(wy-cy/ts), y1=Math.ceil(wy+(H-cy)/ts);
  for(let ty=y0;ty<=y1;ty++) for(let tx=x0;tx<=x1;tx++){
    const im=surfTile(zt,tx,ty); if(!im) continue;
    ctx.drawImage(im, cx+(tx-wx)*ts, cy+(ty-wy)*ts, ts+0.6, ts+0.6);
  }
  ctx.font='10px ui-monospace,monospace';
  ctx.fillStyle='rgba(200,214,240,0.85)';
  ctx.fillText(`Earth surface · ${SURF.lat.toFixed(2)}°, ${SURF.lon.toFixed(2)}° · ${mpp<1000?Math.round(mpp)+' m':(mpp/1000).toFixed(1)+' km'}/px`, 16, H-46);
  ctx.fillStyle='rgba(150,165,195,0.6)';
  ctx.fillText(`NASA GIBS · VIIRS true color · ${surfDate()} — drag to pan · scroll out to leave`, 16, H-32);
  dirty=SURF.cache.size<4?true:dirty;                 // keep painting while first tiles arrive
}
function surfPan(dx,dy){
  const mpp=surfMpp(), latR=SURF.lat*D2R;
  SURF.lon-=dx*mpp/(111320*Math.cos(latR));
  SURF.lat+=dy*mpp/110540;
  SURF.lat=Math.max(-84,Math.min(84,SURF.lat));
  SURF.lon=((SURF.lon+540)%360)-180;
  dirty=true;
}
// ---- live sunspots: SWPC active regions on the Sun glyph (orthographic on the disc) ----
// screen-plane components of a world direction = orthographic sphere projection, and its
// camera-z component tells front (visible) from far side.
function dirScreen(u){
  const cyw=Math.cos(S.yaw),syw=Math.sin(S.yaw),cp2=Math.cos(S.pitch),sp2=Math.sin(S.pitch);
  const x1=u[0]*cyw+u[2]*syw, z1=-u[0]*syw+u[2]*cyw;
  return [x1, -(u[1]*cp2-z1*sp2), u[1]*sp2+z1*cp2];   // [screen x, screen y, toward-camera]
}
function stonyhurstEcl(latDeg,lonDeg,lamE){            // Stonyhurst (W+) → ecliptic unit vector
  const la=latDeg*D2R, lo=lonDeg*D2R, cb=Math.cos(la);
  const hx=cb*Math.cos(lo), hy=cb*Math.sin(lo), hz=Math.sin(la);
  const cE=Math.cos(lamE), sE=Math.sin(lamE);
  return [hx*cE-hy*sE, hx*sE+hy*cE, hz];
}
function drawSunspots(A, sp, spx){ LBL.prio=P_SMALL;
  if(!LIVE.regions.length || spx<10) return;
  const earth=PLANETS.find(p=>p.n==='Earth'); if(!earth||!earth._e) return;
  const lamE=Math.atan2(earth._e[1],earth._e[0]);
  for(const r of LIVE.regions){
    const e=stonyhurstEcl(r.lat,r.lon,lamE);
    const d=dirScreen([e[0],e[2],e[1]]);               // ecl → world axis swap
    if(d[2]<=0.05) continue;                           // far side / limb
    const x=sp.x+d[0]*spx*0.94, y=sp.y+d[1]*spx*0.94;
    const rr=Math.max(1.2, Math.sqrt(r.area||20)*spx/280);
    const hot=r.xp>=5||r.mp>=40||r.xx>0;
    ctx.beginPath(); ctx.arc(x,y,rr,0,6.2832);
    ctx.fillStyle=`rgba(96,48,22,${A*0.92})`; ctx.fill();
    if(hot){ ctx.beginPath(); ctx.arc(x,y,rr+1.6,0,6.2832);
      ctx.strokeStyle=`rgba(255,90,60,${A*0.85})`; ctx.lineWidth=1; ctx.stroke(); }
    if(!r._o) r._o={spot:r, n:'AR '+r.no};
    const sel=(r._o===S.hover||r._o===S.pinned);
    if(sel){ ctx.beginPath(); ctx.arc(x,y,rr+5,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    if(spx>34||sel){ ctx.font='8.5px ui-monospace,monospace';
      ctx.fillStyle=`rgba(70,35,15,${A*0.95})`; ctx.fillText('AR'+r.no, x+rr+2, y+3); }
    solarProj.push({o:r._o,x,y,px:Math.max(7,rr+3)});
  }
}
// ---- live satellites: CelesTrak TLEs, SGP4-propagated around the Earth glyph ----
let SATCUR=0;                                          // rotating SGP4 budget cursor
function drawSats(A){ LBL.prio=P_SMALL;
  if(!LIVE.sats.length) return;
  const earth=PLANETS.find(p=>p.n==='Earth');
  if(!earth||!earth._e||!earth._p) return;
  const ep=earth._p, px=bodyPx(earth.rk,ep.depth);
  if(px<10) return;
  const jd=solarJD(); let drawn=0, nSl=0, nDeb=0;
  const LOG_LO=Math.log10(6600), LOG_HI=Math.log10(50000);
  // SGP4 for the full catalogue (Starlink!) is too hot for every frame — propagate a
  // rotating batch and draw the rest from last frame's position (full refresh ≲0.1 s)
  const N=LIVE.sats.length, BUD=Math.min(N,1500);
  const cNamed=`rgba(150,235,255,${A})`, cDef=`rgba(140,215,250,${A*0.7})`,
        cSl=`rgba(168,196,232,${A*0.5})`, cOw=`rgba(196,176,232,${A*0.55})`,
        cDeb=`rgba(160,158,168,${A*0.38})`;
  for(let k=0;k<N;k++){
    const s=LIVE.sats[k];
    let e;
    if(((k-SATCUR+N)%N)<BUD){ e=satEcl(s,jd); s._e3=e||null; }
    else e=s._e3;                               // outside the batch: cached, or wait for it
    if(!e) continue;
    const l=Math.hypot(e[0],e[1],e[2]); if(!isFinite(l)||l<6400) continue;
    let x,y;
    if(S.realScale){
      const K=1.496e8;
      const w=eclToWorld(earth._e[0]+e[0]/K, earth._e[1]+e[1]/K, earth._e[2]+e[2]/K);
      const p=project(w[0],w[1],w[2]); if(p.depth<=NEAR) continue;
      x=p.x; y=p.y;
    } else {                                           // exploded shells by log(orbit radius), like the moons
      const u=[e[0]/l,e[2]/l,e[1]/l], d2=camDir2(u);
      const t=Math.min(1.25,Math.max(0,(Math.log10(l)-LOG_LO)/(LOG_HI-LOG_LO)));
      const sep=px+5+t*(px*2.0+36);
      x=ep.x+d2[0]*sep; y=ep.y+d2[1]*sep;
    }
    const named=s.iss||s.hst||s.css, sel=(s===S.hover||s===S.pinned);
    s.alt=l-6371; s.sat=true; s.kind='Satellite';
    if(s.sl) nSl++; if(s.deb) nDeb++;
    if(named){ ctx.beginPath(); ctx.arc(x,y,2.4,0,6.2832); ctx.fillStyle=cNamed; ctx.fill(); }
    else { ctx.fillStyle=s.deb?cDeb:s.sl?cSl:s.ow?cOw:cDef; ctx.fillRect(x-0.9,y-0.9,1.8,1.8); }
    if(sel){ ctx.beginPath(); ctx.arc(x,y,7,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    if(named||sel){ ctx.font='8.5px ui-monospace,monospace'; ctx.fillStyle=`rgba(160,230,255,${A*0.9})`;
      ctx.fillText(s.iss?'ISS':s.css?'CSS':s.hst?'Hubble':s.n, x+4, y-3); }
    solarProj.push({o:s,x,y,px:named?7:4});
    drawn++;
  }
  SATCUR=N?(SATCUR+BUD)%N:0;
  if(drawn){
    if(px>13){ ctx.font='8.5px ui-monospace,monospace'; ctx.fillStyle=`rgba(140,215,250,${A*0.55})`;
      ctx.fillText(drawn.toLocaleString('en-US')+' satellites · live'
        +(nSl?' · '+nSl.toLocaleString('en-US')+' Starlink':'')
        +(nDeb?' · '+nDeb.toLocaleString('en-US')+' debris':''), ep.x+px+4, ep.y+16); }
    dirty=true;                                        // they really move — keep animating while visible
  }
}
// ---- fireballs: recent atmospheric impacts (JPL, via live-extra proxy) on the Earth glyph ----
function drawFireballs(A){ LBL.prio=P_SMALL;
  const fb=LIVE.extra&&LIVE.extra.fireballs; if(!fb||!fb.length) return;
  const earth=PLANETS.find(p=>p.n==='Earth');
  if(!earth||!earth._p) return;
  const ep=earth._p, px=bodyPx(earth.rk,ep.depth);
  if(px<12) return;
  const nowMs=cmeSolarMs();
  for(const f of fb){
    if(f.lat==null||f.lon==null) continue;
    const age=(nowMs-f.t)/86400000; if(age<0||age>30) continue;
    const e=groundEcl(f.lat,f.lon,f.t);
    const d=dirScreen([e[0],e[2],e[1]]);
    if(d[2]<=0.05) continue;                           // far side
    const x=ep.x+d[0]*px*0.97, y=ep.y+d[1]*px*0.97;
    const rr=Math.max(1.6, 2.2+Math.log10(f.kt||0.1));
    ctx.beginPath(); ctx.arc(x,y,rr,0,6.2832);
    ctx.fillStyle=`rgba(255,150,60,${A*(age<7?0.95:0.55)})`; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,rr+1.8,0,6.2832);
    ctx.strokeStyle=`rgba(255,110,50,${A*0.4})`; ctx.lineWidth=0.8; ctx.stroke();
    if(!f._o) f._o={fb:f, n:'Fireball'};
    const sel=(f._o===S.hover||f._o===S.pinned);
    if(sel){ ctx.beginPath(); ctx.arc(x,y,rr+5,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    solarProj.push({o:f._o,x,y,px:Math.max(6,rr+3)});
  }
}

// ---- transfer trajectories: Lambert solver + launch-window search ----
// Two-impulse, Sun-centred (patched-conic estimate). Works in AU and days.
const MU_S=2.9591220828559093e-4, AUD2KMS=1731.456;      // GM_sun in AU³/day² ; AU/day → km/s
let TRANSFER=null;
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
function bodyEclAt(b,jd){ const el=b.k?keplerEcl(b.k,(jd-2451545)/36525):keplerSB(b.kd,jd); return orbPoint(el,el.E); }
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
function computeTransfer(b){
  const earth=PLANETS.find(p=>p.n==='Earth');
  const w=findWindow(earth,b,solarJD());
  if(!w){ if(UI.msg) UI.msg('no transfer window found'); return; }
  const r1=bodyEclAt(earth,w.dep), pts=[], N=96;
  for(let i=0;i<=N;i++) pts.push(propagateUV(r1,w.v1,w.tof*i/N));
  TRANSFER={to:b,dep:w.dep,tof:w.tof,dv:w.dv,r1,v1:w.v1,pts};
  TRANSFER._o={xfer:true,n:'Earth → '+b.n+' transfer',T:TRANSFER};
  if(UI.msg) UI.msg(`launch ${dateStr(w.dep)} · ${Math.round(w.tof)} d · Δv ${w.dv.toFixed(1)} km/s — ride the time slider`);
  lastInfo=undefined; dirty=true;
}
function drawTransfer(A){ LBL.prio=P_PROBE;
  const T=TRANSFER; if(!T) return;
  pathBegin();
  for(const q of T.pts){ const w=eclToWorld(q[0],q[1],q[2]); pathPt(project(w[0],w[1],w[2])); }
  pathStroke(`rgba(79,214,200,${A*0.8})`,1.5,[5,4]);
  const ends=[[T.pts[0],`launch ${dateStr(T.dep)} · Δv ${T.dv.toFixed(1)} km/s`],
              [T.pts[T.pts.length-1],`${T.to.n} at arrival · ${dateStr(T.dep+T.tof)}`]];
  ctx.font='9px ui-monospace,monospace';
  for(const [q,txt] of ends){
    const w=eclToWorld(q[0],q[1],q[2]), p=project(w[0],w[1],w[2]);
    if(p.depth<=NEAR) continue;
    ctx.beginPath(); ctx.arc(p.x,p.y,4,0,6.2832);
    ctx.strokeStyle=`rgba(79,214,200,${A*0.9})`; ctx.lineWidth=1.2; ctx.stroke();
    ctx.fillStyle=`rgba(140,235,225,${A*0.85})`; ctx.fillText(txt, p.x+7, p.y-4);
  }
  const jd=solarJD();
  if(jd>=T.dep && jd<=T.dep+T.tof){                      // the craft, en route at the selected date
    const q=propagateUV(T.r1,T.v1,jd-T.dep);
    const w=eclToWorld(q[0],q[1],q[2]), p=project(w[0],w[1],w[2]);
    if(p.depth>NEAR){
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
let FOLLOW=null;
// ---- interstellar routes: relativistic 1g brachistochrone to any cosmic target ----
// accelerate at 1 g to the midpoint, flip, brake — the classic relativistic rocket.
// Units: ly and years with c = 1, so g = 1.0323 ly/yr².
let ROUTE=null;
const G_LYR=1.0323;
function route1g(Dly){ const d=Dly/2;
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
function computeRoute(o){
  const P=navPhys(o); if(!P) return;
  const distPc=Math.hypot(P[0],P[1],P[2]); if(!(distPc>0)) return;
  const w=navWorld(o), wl=Math.hypot(w[0],w[1],w[2])||1;
  ROUTE={o, n:o.n||o.h||'target', distPc, dir:[w[0]/wl,w[1]/wl,w[2]/wl], dep:solarJD()};
  ROUTE._o={iroute:true, n:'Route: Earth → '+ROUTE.n, R:ROUTE};
  const r=route1g(distPc*PC2LY);
  if(UI.msg) UI.msg(`1g starship: ${fmtYears(r.T)} Earth time · ${fmtYears(r.TAU)} ship time — ride the time slider`);
  lastInfo=undefined; dirty=true;
}
function fmtYears(y){
  if(y<1) return Math.round(y*365.25)+' d';
  if(y<1e4) return y.toFixed(y<20?1:0).replace(/\.0$/,'')+' yr';
  if(y<1e6) return (y/1e3).toFixed(1)+' kyr';
  if(y<1e9) return (y/1e6).toFixed(2)+' Myr';
  return (y/1e9).toFixed(2)+' Gyr';
}
function drawRoute(){ LBL.prio=P_SEL;
  const R=ROUTE, w=navWorld(R.o);
  if(!w){ return; }
  const wr=Math.hypot(w[0],w[1],w[2]);
  pathBegin();
  for(let i=0;i<=40;i++){ const r=wr*i/40;             // radial chord: Sun → target
    pathPt(project(R.dir[0]*r,R.dir[1]*r,R.dir[2]*r)); }
  pathStroke('rgba(120,255,235,0.55)',1.3,[6,5]);
  const tp=project(w[0],w[1],w[2]);
  if(tp.depth>NEAR){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(140,255,240,0.8)';
    const D=R.distPc*PC2LY, r=route1g(D);
    ctx.fillText(`${R.n} · ${D<1e4?D.toFixed(1)+' ly':fmt(D)+' ly'} · 1g: ${fmtYears(r.T)} (ship ${fmtYears(r.TAU)})`, tp.x+8, tp.y+12); }
  // the ship, en route since the plot date (sim time drives it)
  const tYr=(solarJD()-R.dep)/365.25;
  if(tYr>0){
    const st=route1gAt(R.distPc*PC2LY, tYr);
    const xr=scale(Math.min(R.distPc, Math.max(1e-9, st.x/PC2LY)));
    const p=project(R.dir[0]*xr,R.dir[1]*xr,R.dir[2]*xr);
    if(p.depth>NEAR){
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

// ---- gravity structure: Lagrange points + Hill spheres (real, time-aware) ----
// mass ratio m = M_planet/M_sun → Hill radius r_H = r·(m/3)^(1/3); the L-points
// derive from the same ratio and the planets' true current positions.
const MASS_RATIO={Mercury:1.66e-7,Venus:2.447e-6,Earth:3.003e-6,Mars:3.227e-7,
  Jupiter:9.545e-4,Saturn:2.858e-4,Uranus:4.366e-5,Neptune:5.151e-5};
const LAG_NOTE={
  'L1 · Sun–Earth':'sunward · SOHO & DSCOVR station here',
  'L2 · Sun–Earth':'anti-sunward · JWST & Gaia orbit here',
  'L3 · Sun–Earth':'forever hidden behind the Sun',
  'L4 · Sun–Earth':'stable · leads Earth by 60°',
  'L5 · Sun–Earth':'stable · trails Earth by 60°',
  'L4 · Sun–Jupiter':'the "Greek camp" — thousands of trojans gather here',
  'L5 · Sun–Jupiter':'the "Trojan camp" — thousands of trojans gather here'};
const LAG_PTS=[];   // persistent objects so hover/pin identity survives frames
for(const [pl,pts] of [['Earth',['L1','L2','L3','L4','L5']],['Jupiter',['L4','L5']]])
  for(const L of pts) LAG_PTS.push({n:L+' · Sun–'+pl, lp:true, pl, L,
    kind:'Lagrange point', note:LAG_NOTE[L+' · Sun–'+pl]});
function drawLagrange(A){ LBL.prio=P_SMALL;
  const byName={}; for(const b of SOLAR_BODIES) byName[b.n]=b;
  // Hill spheres: dashed circle in the ecliptic plane, TRUE radius — sub-pixel
  // from afar (as in reality), grows into view as you zoom toward a planet
  for(const b of SOLAR_BODIES){
    const m=MASS_RATIO[b.n]; if(!m||!b._e) continue;
    const rH=b._r*Math.cbrt(m/3);
    const pc=project.apply(null,eclToWorld(b._e[0],b._e[1],b._e[2]));
    if(pc.depth<=NEAR) continue;
    const edge=project.apply(null,eclToWorld(b._e[0]+rH,b._e[1],b._e[2]));
    const rp=Math.hypot(edge.x-pc.x,edge.y-pc.y);
    if(rp<6 || rp>Math.min(W,H)*6) continue;     // invisible at this zoom / camera deep inside
                                                 // (dashing a 30k-px circle stalls the rasterizer)
    pathBegin();
    for(let k=0;k<=48;k++){ const th=k/48*6.2832;
      const w=eclToWorld(b._e[0]+Math.cos(th)*rH, b._e[1]+Math.sin(th)*rH, b._e[2]);
      pathPt(project(w[0],w[1],w[2]));
    }
    pathStroke(`rgba(150,205,255,${A*0.4})`,1,[3,5]);
    if(rp>30){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(150,205,255,${A*0.7})`;
      const km=rH*149.6;                         // AU → million km
      ctx.fillText('Hill sphere · '+(km<1?Math.round(km*1000).toLocaleString('en-US')+',000 km':km.toFixed(1)+' M km'),
        pc.x+rp*0.72, pc.y-rp*0.72); }
  }
  // Lagrange points of the Sun–Earth and Sun–Jupiter systems
  const c60=0.5, s60=0.8660254;
  for(const q of LAG_PTS){
    const b=byName[q.pl]; if(!b||!b._e){ q._e=null; continue; }
    const m=MASS_RATIO[q.pl], f=Math.cbrt(m/3), e=b._e;
    q._e = q.L==='L1' ? [e[0]*(1-f),e[1]*(1-f),e[2]*(1-f)]
         : q.L==='L2' ? [e[0]*(1+f),e[1]*(1+f),e[2]*(1+f)]
         : q.L==='L3' ? [-e[0]*(1+7*m/12),-e[1]*(1+7*m/12),-e[2]*(1+7*m/12)]
         : q.L==='L4' ? [e[0]*c60-e[1]*s60, e[0]*s60+e[1]*c60, e[2]]   // 60° ahead
         :              [e[0]*c60+e[1]*s60,-e[0]*s60+e[1]*c60, e[2]];  // 60° behind
    const w=eclToWorld(q._e[0],q._e[1],q._e[2]), p=project(w[0],w[1],w[2]);
    if(p.depth<=NEAR) continue;
    if(q.L==='L1'||q.L==='L2'){                  // hug the planet — draw only when resolvable
      const pp=project.apply(null,eclToWorld(e[0],e[1],e[2]));
      if(pp.depth>NEAR && Math.hypot(p.x-pp.x,p.y-pp.y)<13) continue;
    }
    const sel=(q===S.hover||q===S.pinned), r=sel?4.5:3;
    ctx.beginPath(); ctx.moveTo(p.x,p.y-r); ctx.lineTo(p.x+r,p.y); ctx.lineTo(p.x,p.y+r); ctx.lineTo(p.x-r,p.y); ctx.closePath();
    ctx.strokeStyle=`rgba(196,170,255,${A*0.9})`; ctx.lineWidth=1.1; ctx.stroke();
    if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,r+5,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    solarProj.push({o:q,x:p.x,y:p.y,px:7});
    ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(196,170,255,${A*(sel?1:0.78)})`;
    ctx.fillText(q.L+(q.pl==='Jupiter'?' · Jupiter':''), p.x+r+3, p.y+3);
  }
}

// ---- other exoplanet systems: an orbital diagram around the focused host star ----
let sysProj=[];
function planetColor(r){
  if(!r)     return [180,185,195];
  if(r<1.6)  return [206,150,108];   // Gestein
  if(r<3.5)  return [110,196,184];   // Supererde
  if(r<8)    return [110,150,224];   // Neptune-like
  return [226,180,132];              // Gas giant
}
function drawSystem(alpha){ LBL.prio=P_SOLAR;
  sysProj.length=0;
  const s=focusSys; if(!s||!focusSysW) return;
  const sp=project(focusSysW[0],focusSysW[1],focusSysW[2]);
  if(sp.depth<=NEAR) return;
  const A=alpha; ctx.globalAlpha=A;
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
  if(S.hz && s.lum){
    const sq=Math.sqrt(s.lum), rOf=au=>{ const t=Math.max(0,Math.min(1.06, pls.length>1?Math.log10(au/aMin)/lr:0.5));
      return S0*(0.13+t*0.84); };
    const ri=rOf(0.95*sq), ro=rOf(1.67*sq);
    ctx.beginPath(); ctx.ellipse(sp.x,sp.y,ro,ro*0.42,0,0,6.2832);
    ctx.ellipse(sp.x,sp.y,ri,ri*0.42,0,0,6.2832);
    ctx.fillStyle=`rgba(90,220,130,${A*0.11})`; ctx.fill('evenodd');
    ctx.strokeStyle=`rgba(110,230,150,${A*0.32})`; ctx.lineWidth=1;
    ctx.beginPath(); ctx.ellipse(sp.x,sp.y,ri,ri*0.42,0,0,6.2832); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(sp.x,sp.y,ro,ro*0.42,0,0,6.2832); ctx.stroke();
    ctx.font='8.5px ui-monospace,monospace'; ctx.fillStyle=`rgba(120,230,150,${A*0.72})`;
    ctx.fillText('habitable zone', sp.x+ro*0.5, sp.y-ro*0.42-3);
  }
  pls.forEach((p,i)=>{
    const t = pls.length>1 ? Math.log10(p.a/aMin)/lr : 0.5;
    const orb = S0*(0.13+t*0.84);
    ctx.beginPath(); ctx.ellipse(sp.x,sp.y,orb,orb*0.42,0,0,6.2832);
    ctx.strokeStyle=`rgba(150,170,210,${A*0.22})`; ctx.lineWidth=1; ctx.stroke();
    let ang;                                       // real transit phase when the ephemeris exists
    if(p.per>0 && p.t0>0){ const ph=((solarJD()-p.t0)/p.per)%1; ang=(ph<0?ph+1:ph)*6.2832; }
    else ang=i*2.399+0.6;
    const mx=sp.x+Math.cos(ang)*orb, my=sp.y+Math.sin(ang)*orb*0.42;
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

// ---- constellation lines (sky sphere at fixed radius) ----
function drawConstellations(){ LBL.prio=P_GRID;
  if(!S.con) return;
  const R=scale(30);                        // sky-sphere radius among the local stars
  for(const k of CONS){
    for(const pl of k._L){
      pathBegin();
      for(const d of pl) pathPt(project(d[0]*R,d[1]*R,d[2]*R));
      pathStroke('rgba(128,150,215,0.15)',1);
    }
    const cp=project(k.c[0]*R,k.c[1]*R,k.c[2]*R);
    if(cp.depth>NEAR){ ctx.font='8.5px ui-monospace,monospace'; ctx.fillStyle='rgba(150,170,225,0.38)';
      ctx.fillText(CON_NAME[k.id]||k.id, cp.x+3, cp.y); }
  }
}
// ---- meteor-shower radiants active on the selected date (IMO calendar, sky sphere) ----
function drawShowers(){ LBL.prio=P_SMALL;
  const act=activeShowers(cmeSolarMs()); if(!act.length) return;
  const R=scale(30);
  for(const s of act){
    const d=dirOf(s.ra,s.dec), p=project(d[0]*R,d[1]*R,d[2]*R);
    if(p.depth<=NEAR) continue;
    ctx.strokeStyle='rgba(190,255,200,0.55)'; ctx.lineWidth=1;
    for(let k=0;k<4;k++){ const a=k*0.7854;            // radiant: 8-ray asterisk
      const dx=Math.cos(a)*6, dy=Math.sin(a)*6;
      ctx.beginPath(); ctx.moveTo(p.x-dx,p.y-dy); ctx.lineTo(p.x+dx,p.y+dy); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(p.x,p.y,2,0,6.2832); ctx.fillStyle='rgba(210,255,215,0.9)'; ctx.fill();
    ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(190,255,200,0.75)';
    ctx.fillText(`${s.n} · ZHR ${s.zhr}`, p.x+9, p.y+3);
  }
}

// ---- deep-sky objects (nebulae & clusters) ----
let dsoProj=[];
let pulsarProj=[];
let cluProj=[];
let gwOnScreen=false;    // a GW event is visible → frame loop keeps the ripples moving
function drawDSO(){ LBL.prio=P_DEEP;
  dsoProj.length=0; if(!S.dso) return;
  for(const o of DSO){
    const R=scale(o.d); o._x=o._dir[0]*R; o._y=o._dir[1]*R; o._z=o._dir[2]*R;
    const p=project(o._x,o._y,o._z);
    if(p.depth<=NEAR) continue;
    if(p.x<-70||p.x>W+70||p.y<-70||p.y>H+70) continue;
    const c=(DSO_T[o.t]||DSO_T.EN).c, sz=Math.max(3,Math.min(26,foc*0.02/p.depth));
    const sel=(o===S.hover||o===S.pinned);
    o._sx=p.x; o._sy=p.y;
    const bhR=o.t==='BH'?Math.min(Math.min(W,H)*0.22, foc*0.028/p.depth):0;
    if(bhR>=9){ drawBlackHole(p.x,p.y,bhR,0.95); }   // stellar BH up close: the simulated look
    else{
    ctx.drawImage(blobSprite(c[0],c[1],c[2],0.62,0.24), p.x-sz*1.9, p.y-sz*1.9, sz*3.8, sz*3.8);
    if(o.t==='GW'){                              // spacetime ripples spreading from the merger
      gwOnScreen=true;
      const ph=(performance.now()/2600)%1;
      for(let k=0;k<3;k++){ const f=(ph+k/3)%1, rr=sz*(0.9+f*3.6);
        ctx.beginPath(); ctx.arc(p.x,p.y,rr,0,6.2832);
        ctx.strokeStyle=`rgba(130,255,220,${(1-f)*0.5})`; ctx.lineWidth=1.2; ctx.stroke(); }
    }
    if(o.t==='GC'||o.t==='OC'){                 // clusters: a sprinkle of stars
      const n=o.t==='GC'?10:6;
      for(let k=0;k<n;k++){ const a=k*2.399, rr=sz*(0.25+0.6*(((k*7)%5)/5));
        ctx.beginPath(); ctx.arc(p.x+Math.cos(a)*rr,p.y+Math.sin(a)*rr,0.9,0,6.2832);
        ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},0.9)`; ctx.fill(); }
    } else {                                     // nebulae: a soft bright core
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(1,sz*0.32),0,6.2832);
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},0.8)`; ctx.fill();
    }
    }
    if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,sz*1.9+6,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    dsoProj.push(o);
    ctx.font=(sel?'10px':'9px')+' ui-monospace,monospace';
    ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${sel?1:0.72})`;
    ctx.fillText(o.n, p.x+sz*1.9+3, p.y+3);
  }
}
function drawClusters(){ LBL.prio=P_DEEP;
  cluProj.length=0; if(!S.oclu) return;
  for(const c of CLUSTERS){
    const R=scale(c.d); const x=c._dir[0]*R, y=c._dir[1]*R, z=c._dir[2]*R;
    const p=project(x,y,z);
    if(p.depth<=NEAR) continue;
    if(p.x<-20||p.x>W+20||p.y<-20||p.y>H+20) continue;
    const selc=(c===S.hover||c===S.pinned);
    const raw=foc*0.012/p.depth;
    if(raw<0.1 && !selc) continue;
    const sz=Math.max(1.0,Math.min(3.2,raw));
    c._x=x; c._y=y; c._z=z; c._sx=p.x; c._sy=p.y;
    const cc=CLU_T[c.ct||0].c;
    if(!(glStars()&&glBufC)){ ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,6.2832);
      ctx.fillStyle=`rgba(${cc[0]},${cc[1]},${cc[2]},0.55)`; ctx.fill(); }
    cluProj.push(c);
    if(selc){ ctx.beginPath(); ctx.arc(p.x,p.y,sz+5,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1; ctx.stroke();
      ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(${cc[0]},${cc[1]},${cc[2]},0.95)`; ctx.fillText(c.n, p.x+sz+4, p.y+3); }
  }
}
function drawPulsars(){ LBL.prio=P_SMALL;
  pulsarProj.length=0; if(!S.psr) return;
  for(const q of PULSARS){
    const R=scale(q.d); const x=q._dir[0]*R, y=q._dir[1]*R, z=q._dir[2]*R;
    const p=project(x,y,z);
    if(p.depth<=NEAR) continue;
    if(p.x<-20||p.x>W+20||p.y<-20||p.y>H+20) continue;
    const selp=(q===S.hover||q===S.pinned);
    const raw=foc*0.02/p.depth;
    if(raw<0.13 && !selp) continue;                // cull only the far tail
    const sz=Math.max(1.0, Math.min(3.4, raw));    // visible floor
    q._x=x; q._y=y; q._z=z; q._sx=p.x; q._sy=p.y;
    if(!(glStars()&&glBufP)){ ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,6.2832);
      ctx.fillStyle='rgba(150,220,255,0.72)'; ctx.fill(); }
    pulsarProj.push(q);
    if(selp){
      ctx.beginPath(); ctx.arc(p.x,p.y,sz+5,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1; ctx.stroke();
      ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(150,220,255,0.95)'; ctx.fillText(q.n, p.x+sz+4, p.y+3);
    }
  }
}

// ---- S2: the star racing around Sagittarius A* (GRAVITY orbit, 16.05-yr period) ----
const S2EL={e:0.884649, i:134.567*Math.PI/180, O:228.171*Math.PI/180, w:66.263*Math.PI/180,
            Pd:16.0455*365.25, Tp:2458257.9};
function s2XY(jd){                                  // Thiele-Innes: orbit -> (east, north) in units of a
  let M=6.28318*(((jd-S2EL.Tp)/S2EL.Pd)%1); const e=S2EL.e;
  let E=M+e*Math.sin(M)*(1+e*Math.cos(M));
  for(let k=0;k<24;k++){ const dE=(E-e*Math.sin(E)-M)/(1-e*Math.cos(E)); E-=dE; if(Math.abs(dE)<1e-9)break; }
  const X=Math.cos(E)-e, Y=Math.sqrt(1-e*e)*Math.sin(E);
  const cO=Math.cos(S2EL.O),sO=Math.sin(S2EL.O),ci=Math.cos(S2EL.i),cw=Math.cos(S2EL.w),sw=Math.sin(S2EL.w);
  const A2=cO*cw-sO*sw*ci, B2=sO*cw+cO*sw*ci, F2=-cO*sw-sO*cw*ci, G2=-sO*sw+cO*cw*ci;
  return [B2*X+G2*Y, A2*X+F2*Y];                    // [east, north]
}
function drawS2(){ LBL.prio=P_DEEP;
  if(!S.mw||!sgraScreen) return;
  const sgW=[SGRA._x,SGRA._y,SGRA._z];
  const dS=Math.hypot(camPos[0]-sgW[0],camPos[1]-sgW[1],camPos[2]-sgW[2]);
  const a2=(S.pinned===SGRA)?1:lodA(dS,3,7);
  if(a2<0.02) return;
  const d0=SGRA._dir, cd=Math.max(1e-6,Math.hypot(d0[0],d0[1]));
  const east=camDir2([-d0[1]/cd, d0[0]/cd, 0]);
  const north=camDir2([-d0[2]*d0[0]/cd, -d0[2]*d0[1]/cd, cd]);
  const K=Math.min(W,H)*0.11*a2;                    // exploded scale (real orbit ~1000 AU)
  ctx.globalAlpha=a2;
  ctx.beginPath();                                   // the projected true orbit
  for(let k=0;k<=48;k++){
    const eo=s2XY(S2EL.Tp + k/48*S2EL.Pd);
    const qx=sgraScreen.x+(east[0]*eo[0]+north[0]*eo[1])*K;
    const qy=sgraScreen.y+(east[1]*eo[0]+north[1]*eo[1])*K;
    if(k===0) ctx.moveTo(qx,qy); else ctx.lineTo(qx,qy);
  }
  ctx.strokeStyle='rgba(255,220,150,0.4)'; ctx.lineWidth=1; ctx.stroke();
  const p2=s2XY(solarJD());
  const sx=sgraScreen.x+(east[0]*p2[0]+north[0]*p2[1])*K;
  const sy=sgraScreen.y+(east[1]*p2[0]+north[1]*p2[1])*K;
  ctx.beginPath(); ctx.arc(sx,sy,2.6,0,6.2832); ctx.fillStyle='rgba(255,235,180,0.95)'; ctx.fill();
  ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(255,225,160,0.85)';
  ctx.fillText('S2 · 16-yr orbit · pericentre 2018/2034', sx+5, sy+3);
  ctx.globalAlpha=1;
}
// ---- observable-universe boundary (CMB shell, ~46 Gly) ----
function drawEdge(){ LBL.prio=P_GRID;
  const R=scale(14300e6);
  for(let pl=0;pl<3;pl++){
    pathBegin();
    for(let a=0;a<=6.2833;a+=0.13){
      const ca=Math.cos(a)*R, sa=Math.sin(a)*R;
      const w = pl===0?[ca,sa,0] : pl===1?[ca,0,sa] : [0,ca,sa];
      pathPt(project(w[0],w[1],w[2]));
    }
    pathStroke('rgba(120,150,255,0.11)',1);
  }
  const lp=project(R,0,0);
  if(lp.depth>NEAR){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(140,165,255,0.5)';
    ctx.fillText('observable universe · CMB ~46 Gly', lp.x+5, lp.y); }
}
// ---- gravitational lensing at Sgr A* (GPU point clouds bend around the BH) ----
// Einstein angle θE = √(2·r_s/D) for the camera's TRUE distance D to Sgr A*;
// drawn ×300 exaggerated (the real ring is arcsecond-scale even up close).
// Deflection itself happens in the shared vertex shader (u_lens / u_lensOn).
const LENS_EXAG=300, SGRA_RS=4.1e-7;             // Schwarzschild radius of Sgr A* in pc
let lensPar=null;
function calcLens(){
  lensPar=null; if(!S.lens) return;
  const R=scale(SGRA.d);
  const p=project(SGRA._dir[0]*R,SGRA._dir[1]*R,SGRA._dir[2]*R);
  if(p.depth<=NEAR) return;
  const c=camPhysPos();
  const D=Math.max(1e-9,Math.hypot(SGRA._dir[0]*SGRA.d-c[0],
    SGRA._dir[1]*SGRA.d-c[1], SGRA._dir[2]*SGRA.d-c[2]));
  const px=foc*Math.sqrt(2*SGRA_RS/D)*LENS_EXAG;
  if(px<0.7) return;                             // too far away — no visible effect
  lensPar={x:p.x,y:p.y,e:Math.min(px,Math.min(W,H)*0.22),depth:p.depth};
}
// ---- Milky Way: galactic plane band + Sgr A* ----
let sgraScreen=null;
// ---- Milky Way structural model (data-informed schematic: Reid+ 2019 arm geometry) ----
const MW_R0=8178;                              // Sun -> galactic centre (pc)
function mwWorld(r,th){                        // galactocentric polar -> world position
  const u=MW_R0 - r*Math.cos(th), v=r*Math.sin(th);
  const dx=GPu[0]*u+GPv[0]*v, dy=GPu[1]*u+GPv[1]*v, dz=GPu[2]*u+GPv[2]*v;
  const dist=Math.hypot(dx,dy,dz)||1e-6, R=scale(dist)/dist;
  return [dx*R,dy*R,dz*R,dist];
}
const MW_ARMS=[
  {n:'Perseus Arm',           t0:0.35, c:[150,185,255]},
  {n:'Sagittarius Arm',       t0:1.92, c:[165,205,255]},
  {n:'Scutum-Centaurus Arm',  t0:3.49, c:[150,185,255]},
  {n:'Norma / Outer Arm',     t0:5.06, c:[165,200,255]} ];
function drawGalaxyModel(){ LBL.prio=P_GAL;
  const k=0.235;                               // pitch angle ~13 deg
  { const w=mwWorld(0.0001,0), p=project(w[0],w[1],w[2]);
    if(p.depth>NEAR){ const sz=Math.max(6,Math.min(70, foc*0.14/p.depth));
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,sz);
      g.addColorStop(0,'rgba(255,232,190,0.32)'); g.addColorStop(.5,'rgba(255,206,150,0.12)'); g.addColorStop(1,'rgba(255,190,120,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,6.2832); ctx.fill(); } }
  ctx.fillStyle='rgba(255,214,160,0.5)';
  for(let t=-1;t<=1;t+=0.06){ const r=Math.abs(t)*3200, th=(t<0?Math.PI:0)+0.44;
    const w=mwWorld(r,th), p=project(w[0],w[1],w[2]);
    if(p.depth<=NEAR) continue; const sz=Math.max(0.9,Math.min(3,foc*0.02/p.depth));
    ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,6.2832); ctx.fill(); }
  for(const arm of MW_ARMS){
    ctx.fillStyle=`rgba(${arm.c[0]},${arm.c[1]},${arm.c[2]},0.55)`;
    let mid=null;
    for(let th=0.15; th<7.4; th+=0.075){
      const r=2600*Math.exp(k*th); if(r>17000) break;
      const w=mwWorld(r, th+arm.t0), p=project(w[0],w[1],w[2]);
      if(p.depth<=NEAR) continue;
      if(p.x<-30||p.x>W+30||p.y<-30||p.y>H+30) continue;
      const sz=Math.max(0.8,Math.min(2.6, foc*0.02/p.depth));
      ctx.beginPath(); ctx.arc(p.x,p.y,sz,0,6.2832); ctx.fill();
      if(th>2.4 && th<2.55) mid=p;
    }
    if(mid){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(${arm.c[0]},${arm.c[1]},${arm.c[2]},0.72)`;
      ctx.fillText(arm.n, mid.x+4, mid.y); }
  }
  { const w=mwWorld(MW_R0,0.0), p=project(w[0],w[1],w[2]);
    if(p.depth>NEAR){ ctx.fillStyle='rgba(120,230,255,0.95)';
      ctx.beginPath(); ctx.arc(p.x,p.y,2.4,0,6.2832); ctx.fill();
      ctx.font='9px ui-monospace,monospace'; ctx.fillStyle='rgba(150,235,255,0.8)';
      ctx.fillText('Sun · Orion Spur', p.x+5, p.y+3); } }
  pathBegin();
  for(let a=0;a<=6.2833;a+=0.1){ const w=mwWorld(16000,a); pathPt(project(w[0],w[1],w[2])); }
  pathStroke('rgba(150,175,235,0.14)',1);
}
// ---- black holes, ray-traced: per-pixel null geodesics (Schwarzschild) ----
// shadow, photon ring and the folded disk all EMERGE from the light bending;
// disk shading has Doppler beaming + gravitational redshift; escaped rays
// sample the real scene behind the hole, so the background warps too.
let _bhgl=null, _bhFails=0, _bhNextTry=0;
function bhInit(){
  if(_bhgl!==null){
    if(_bhgl.gl) return _bhgl;
    if(_bhFails>=4 || performance.now()<_bhNextTry) return null;
    _bhgl=null;
  }
  const fail=m=>{ _bhgl={gl:null}; _bhFails++; _bhNextTry=performance.now()+5000;
    try{console.warn(m);}catch(e){} return null; };
  const cv2=document.createElement('canvas');
  const gl=cv2.getContext('webgl',{alpha:true,antialias:false});
  if(!gl) return fail('bh: no WebGL context');
  const mk=(t,src)=>{ const sh=gl.createShader(t); gl.shaderSource(sh,src); gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){ try{console.warn('bh:',gl.getShaderInfoLog(sh));}catch(e){} return null; }
    return sh; };
  const vsh=mk(gl.VERTEX_SHADER,`attribute vec2 aP; varying vec2 vP;
    void main(){ vP=aP; gl_Position=vec4(aP,0.0,1.0); }`);
  const fsh=mk(gl.FRAGMENT_SHADER,`precision highp float; varying vec2 vP;
    uniform highp mat3 uT; uniform sampler2D uBg; uniform float uBgOk, uMode;
    float hash(vec3 p){ p=fract(p*0.3183+vec3(0.11,0.23,0.37)); p*=17.0;
      return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    void main(){
      const float HALF=9.6;
      vec3 pos=uT*vec3(vP*HALF,-18.0);
      vec3 dir=uT*vec3(0.0,0.0,1.0);
      vec3 hv=cross(pos,dir); float h2=dot(hv,hv);
      vec3 col=vec3(0.0); float trans=1.0; bool cap=false;
      float jit=0.85+0.3*fract(sin(dot(vP,vec2(12.9898,78.233)))*43758.5453);   // de-band the integrator
      float py=pos.y;
      for(int i=0;i<300;i++){
        float r=length(pos);
        if(r<1.02){cap=true;break;}
        if(r>20.0 && dot(pos,dir)>0.0) break;
        float dt=clamp(r*0.1,0.04,0.35)*jit;
        dir+=-1.5*h2*pos/pow(r,5.0)*dt;      // null-geodesic bending
        pos+=dir*dt;
        float ny=pos.y;
        if(uMode>0.5){                       // EHT: hot puffy torus (RIAF), integrated volumetrically
          float rc=length(pos.xz);
          float em=exp(-pow((rc-4.6)/1.5,2.0)-pow(pos.y/1.6,2.0));
          if(em>0.002){
            float th=atan(pos.z,pos.x);
            em*=0.72+0.4*sin(3.0*th+0.9);    // the three bright knots
            float v=0.35*clamp(sqrt(3.0/max(rc,2.0)),0.0,1.0);
            vec3 vel=normalize(vec3(-pos.z,0.0,pos.x))*v;
            float g=clamp(1.0/(1.0-dot(vel,normalize(dir))),0.6,1.7);
            col+=trans*vec3(1.0,0.42,0.08)*em*dt*0.6*pow(g,2.0);
            trans*=exp(-em*dt*0.16);
            if(trans<0.04) break;
          }
        }
        else if(py*ny<0.0){                  // Gargantua: crossed the thin-disk plane
          float f=py/(py-ny);
          vec3 hit=mix(pos-dir*dt,pos,f);
          float rh=length(hit.xz);
          if(rh>2.6&&rh<9.0){                // thin disk from the ISCO out
            float v=clamp(sqrt(0.5/max(rh-1.0,0.4)),0.0,0.72);
            vec3 vel=normalize(vec3(-hit.z,0.0,hit.x))*v;
            float g=clamp(1.0/(1.0-dot(vel,normalize(dir))),0.42,2.6);   // Doppler
            float grav=sqrt(clamp(1.0-1.0/rh,0.0,1.0));                  // grav. redshift
            float br=pow(3.0/rh,0.9)*pow(g,3.0)*grav
                     *smoothstep(2.6,3.3,rh)*smoothstep(9.0,7.4,rh);   // crisp band edges
            vec3 dc=mix(vec3(1.0,0.4,0.13),vec3(1.0,0.97,0.9),clamp(g*0.8-0.4,0.0,1.0));
            col+=trans*dc*br*1.7;
            trans*=0.22;
            if(trans<0.05) break;
          }
        }
        py=ny;
      }
      if(!cap&&trans>0.05){
        vec3 pc=pos*uT;                      // back to camera frame (transpose)
        vec2 buv=pc.xy/HALF*0.5+0.5;
        vec3 bg=vec3(0.0);
        if(uBgOk>0.5&&buv.x>0.0&&buv.x<1.0&&buv.y>0.0&&buv.y<1.0)
          bg=texture2D(uBg,vec2(buv.x,1.0-buv.y)).rgb;
        vec3 rd=normalize(dir)*uT;
        vec3 sp=floor(rd*240.0);             // faint procedural stars so the warp
        float st=step(0.9985,hash(sp));      // shows even over empty capture
        col+=trans*(bg+vec3(st)*0.85);
      }
      col=vec3(1.0)-exp(-col*1.25);                      // filmic-ish tone map
      float edge=1.0-smoothstep(0.74,0.98,length(vP));   // round vignette — no square seam
      gl_FragColor=vec4(col*edge,edge);
    }`);
  if(!vsh||!fsh) return fail('bh: shader compile failed');
  const pr=gl.createProgram(); gl.attachShader(pr,vsh); gl.attachShader(pr,fsh); gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)) return fail('bh: link failed');
  const vb=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,vb);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const tex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,255]));
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  _bhgl={cv:cv2,gl,pr,vb,tex,capCv:document.createElement('canvas'),
    aP:gl.getAttribLocation(pr,'aP'),uT:gl.getUniformLocation(pr,'uT'),
    uBg:gl.getUniformLocation(pr,'uBg'),uBgOk:gl.getUniformLocation(pr,'uBgOk'),
    uMode:gl.getUniformLocation(pr,'uMode')};
  _bhFails=0;
  return _bhgl;
}
function bhRender(x,y,rpx,eht){
  const g=bhInit(); if(!g) return null;
  const gl=g.gl, box=rpx*7.4;
  let bgOk=0;                                            // capture the scene behind the hole
  try{
    const c=g.capCv; c.width=c.height=256;
    const g2=c.getContext('2d');
    const glcv=document.getElementById('gl');
    if(glcv) g2.drawImage(glcv,(x-box/2)*GLDPR,(y-box/2)*GLDPR,box*GLDPR,box*GLDPR,0,0,256,256);
    g2.drawImage(cv,(x-box/2)*DPR,(y-box/2)*DPR,box*DPR,box*DPR,0,0,256,256);
    gl.bindTexture(gl.TEXTURE_2D,g.tex);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
    bgOk=1;
  }catch(e){}
  const dpr=Math.min(2,window.devicePixelRatio||1);
  const size=Math.max(160,Math.min(1024,Math.ceil(box*dpr)));
  if(g.cv.width!==size){ g.cv.width=g.cv.height=size; }
  gl.viewport(0,0,size,size);
  gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(g.pr);
  gl.bindBuffer(gl.ARRAY_BUFFER,g.vb);
  gl.enableVertexAttribArray(g.aP);
  gl.vertexAttribPointer(g.aP,2,gl.FLOAT,false,0,0);
  // the disk lies in the GALACTIC PLANE (world-fixed): orbiting the camera really
  // changes the view — edge-on from the plane, face-on from the galactic pole
  const V=globeViewRows();                       // world→camera rows (yaw/pitch)
  // Gargantua: disk in the galactic plane. EHT torus: flow axis points at Earth
  // (per EHT/GRAVITY we see Sgr A* nearly face-on) — GC ⊥ NGP either way
  const n=eht?GC:NGP, u=eht?NGP:GC;
  const w=[n[1]*u[2]-n[2]*u[1], n[2]*u[0]-n[0]*u[2], n[0]*u[1]-n[1]*u[0]];
  const B=[u,n,w];                               // world→BH rows (disk plane y=0)
  const M=new Array(9);                          // camera→BH = B·Vᵀ, column-major for GLSL
  for(let i2=0;i2<3;i2++) for(let j=0;j<3;j++){
    M[j*3+i2]=B[i2][0]*V[j][0]+B[i2][1]*V[j][1]+B[i2][2]*V[j][2]; }
  gl.uniformMatrix3fv(g.uT,false,M);
  gl.bindTexture(gl.TEXTURE_2D,g.tex);
  gl.uniform1i(g.uBg,0); gl.uniform1f(g.uBgOk,bgOk); gl.uniform1f(g.uMode,eht?1:0);
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  return g.cv;
}
// the EHT 2022 image of Sgr A*: a fuzzy face-on ring with three bright knots —
// the MEASURED view from Earth, so it deliberately doesn't rotate with the camera
function drawEHT(x,y,r,A){
  ctx.save();
  let bg=ctx.createRadialGradient(x,y,0,x,y,r*2.3);
  bg.addColorStop(0,`rgba(8,3,1,${A*0.9})`); bg.addColorStop(0.72,`rgba(8,3,1,${A*0.55})`);
  bg.addColorStop(1,'rgba(8,3,1,0)');
  ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(x,y,r*2.3,0,6.2832); ctx.fill();
  const ring=ctx.createRadialGradient(x,y,r*0.25,x,y,r*1.8);
  ring.addColorStop(0,'rgba(30,6,0,0)');
  ring.addColorStop(0.32,`rgba(120,30,4,${A*0.5})`);
  ring.addColorStop(0.5,`rgba(255,118,18,${A*0.9})`);
  ring.addColorStop(0.62,`rgba(255,170,48,${A*0.95})`);
  ring.addColorStop(0.8,`rgba(150,40,6,${A*0.5})`);
  ring.addColorStop(1,'rgba(60,10,0,0)');
  ctx.fillStyle=ring; ctx.beginPath(); ctx.arc(x,y,r*1.8,0,6.2832); ctx.fill();
  ctx.globalCompositeOperation='lighter';
  for(const [ang,s,b] of [[1.9,1,1],[3.6,0.85,0.8],[0.2,0.8,0.7]]){   // the three bright knots
    const kx=x+Math.cos(ang)*r, ky=y+Math.sin(ang)*r;
    const kg=ctx.createRadialGradient(kx,ky,0,kx,ky,r*0.55*s);
    kg.addColorStop(0,`rgba(255,225,140,${A*0.7*b})`);
    kg.addColorStop(0.5,`rgba(255,150,40,${A*0.38*b})`);
    kg.addColorStop(1,'rgba(255,120,30,0)');
    ctx.fillStyle=kg; ctx.beginPath(); ctx.arc(kx,ky,r*0.55*s,0,6.2832); ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
  ctx.restore();
}
// painted fallback (no WebGL / artifact build); ray tracer first
function drawBlackHole(x,y,r,A,eht){
  const patch=bhRender(x,y,r,!!eht);
  if(patch){
    // in patch units the shadow (b=2.6 rs) sits at 2.6/9.6 of the half-box → scale so it spans r
    ctx.drawImage(patch, x-r*3.7, y-r*3.7, r*7.4, r*7.4);
    return;
  }
  if(eht) drawEHT(x,y,r,A); else drawBlackHolePainted(x,y,r,A);
}
function drawBlackHolePainted(x,y,r,A){
  const disk=r*3.1, flat=0.13;                     // razor-thin disk, Gargantua-style
  ctx.save(); ctx.translate(x,y); ctx.rotate(-0.14);
  let g=ctx.createRadialGradient(0,0,r*0.7,0,0,disk*1.35);         // ambient glow
  g.addColorStop(0,`rgba(255,190,120,${A*0.22})`); g.addColorStop(0.6,`rgba(255,150,70,${A*0.07})`);
  g.addColorStop(1,'rgba(255,140,60,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,disk*1.35,0,6.2832); ctx.fill();
  // the flat disk: one smooth annulus, white-hot at the inner edge fading to amber
  const diskGrad=()=>{ const dg=ctx.createRadialGradient(0,0,r*1.22,0,0,disk);
    dg.addColorStop(0,`rgba(255,252,246,${A})`);
    dg.addColorStop(0.18,`rgba(255,238,205,${A*0.92})`);
    dg.addColorStop(0.55,`rgba(255,196,120,${A*0.55})`);
    dg.addColorStop(1,'rgba(255,150,70,0)'); return dg; };
  ctx.save(); ctx.scale(1,flat); ctx.fillStyle=diskGrad();
  ctx.beginPath(); ctx.arc(0,0,disk,0,6.2832); ctx.arc(0,0,r*1.24,0,6.2832,true); ctx.fill();
  // mild Doppler beaming — the film kept it subtle too
  const dop=ctx.createLinearGradient(-disk,0,disk,0);
  dop.addColorStop(0,`rgba(255,255,255,${A*0.30})`); dop.addColorStop(0.5,'rgba(255,255,255,0)');
  ctx.fillStyle=dop;
  ctx.beginPath(); ctx.arc(0,0,disk,0,6.2832); ctx.arc(0,0,r*1.24,0,6.2832,true); ctx.fill();
  ctx.restore();
  // gravitational lensing: the far side of the disk wraps into a full halo around the shadow
  const hg=ctx.createRadialGradient(0,0,r*1.02,0,0,r*1.75);
  hg.addColorStop(0,`rgba(255,250,240,${A*0.85})`);
  hg.addColorStop(0.35,`rgba(255,225,175,${A*0.45})`);
  hg.addColorStop(1,'rgba(255,180,110,0)');
  ctx.fillStyle=hg;
  ctx.beginPath(); ctx.arc(0,0,r*1.75,0,6.2832); ctx.arc(0,0,r*1.02,0,6.2832,true); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0,0,r*1.32,r*1.28,0,Math.PI,6.2832);   // fold over the top, a touch brighter
  ctx.strokeStyle=`rgba(255,252,244,${A*0.45})`; ctx.lineWidth=Math.max(1,r*0.16); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,r,0,6.2832); ctx.fillStyle='#000'; ctx.fill();   // the shadow
  ctx.beginPath(); ctx.arc(0,0,r*1.05,0,6.2832);                                // photon ring
  ctx.strokeStyle=`rgba(255,248,232,${A*0.95})`; ctx.lineWidth=Math.max(1,r*0.035); ctx.stroke();
  // the near side of the disk passes in front of the shadow
  ctx.save(); ctx.beginPath(); ctx.rect(-disk*1.05,r*0.02,disk*2.1,disk); ctx.clip();
  ctx.save(); ctx.scale(1,flat); ctx.fillStyle=diskGrad();
  ctx.beginPath(); ctx.arc(0,0,disk*0.9,0,6.2832); ctx.arc(0,0,r*1.24,0,6.2832,true); ctx.fill();
  ctx.restore(); ctx.restore();
  ctx.restore();
}
function drawMW(){ LBL.prio=P_DEEP;
  sgraScreen=null; if(!S.mw) return;
  { const R=scale(SGRA.d); SGRA._x=SGRA._dir[0]*R; SGRA._y=SGRA._dir[1]*R; SGRA._z=SGRA._dir[2]*R; }
  // the galactic plane, drawn as great circles in that plane (the "Milky Way band")
  [500,1500,5000].forEach((pc,idx)=>{ const R=scale(pc), mid=idx===1;
    pathBegin();
    for(let t=0;t<=100;t++){ const th=t/100*6.2832, c=Math.cos(th), s=Math.sin(th);
      pathPt(project((GPu[0]*c+GPv[0]*s)*R,(GPu[1]*c+GPv[1]*s)*R,(GPu[2]*c+GPv[2]*s)*R)); }
    pathStroke(`rgba(140,165,235,${mid?0.16:0.08})`, mid?2:1);
  });
  // Sagittarius A* — the galactic centre
  const sp=project(SGRA._x,SGRA._y,SGRA._z);
  if(sp.depth>NEAR){
    sgraScreen={x:sp.x,y:sp.y};
    // close enough → the simulated look (shadow, photon ring, folded disk)
    const rbh=Math.min(Math.min(W,H)*0.28, foc*(S.realScale?500:0.35)/sp.depth);  // compact: log squeeze
                                                                                   // made it huge from afar
    if(rbh>=10){
      drawBlackHole(sp.x,sp.y,rbh,1,S.eht);
      ctx.font='10px ui-monospace,monospace'; ctx.fillStyle='rgba(255,205,150,0.92)';
      ctx.fillText(S.eht?'Sagittarius A* · hot accretion flow (EHT 2022 geometry)'
                        :'Sagittarius A* · 4.15 million M☉', sp.x+rbh*1.15, sp.y-rbh*1.35);
      return;
    }
    const gr=ctx.createRadialGradient(sp.x,sp.y,0,sp.x,sp.y,11);
    gr.addColorStop(0,'rgba(255,180,90,0.55)'); gr.addColorStop(.5,'rgba(255,120,60,0.22)'); gr.addColorStop(1,'rgba(255,120,60,0)');
    ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(sp.x,sp.y,11,0,6.2832); ctx.fill();
    ctx.beginPath(); ctx.arc(sp.x,sp.y,3.4,0,6.2832); ctx.fillStyle='#0a0a12'; ctx.fill();
    ctx.beginPath(); ctx.arc(sp.x,sp.y,3.4,0,6.2832); ctx.strokeStyle='rgba(255,205,130,0.95)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.font='10px ui-monospace,monospace'; ctx.fillStyle='rgba(255,205,150,0.92)';
    ctx.fillText('Sagittarius A * · galactic centre', sp.x+9, sp.y+3);
  }
}

// ---- navigation ----
function navWorld(o){ const w=objWorld(o); if(w) return w;
  if(o._e) return eclToWorld(o._e[0],o._e[1],o._e[2]); return null; }
function navPhys(o){                        // physical position in parsec
  if(o.sgra||o.dso||o.psr||o.oclu||o.gpick) return [o._dir[0]*o.d,o._dir[1]*o.d,o._dir[2]*o.d];
  if(o.mpc!==undefined){ const d=o.mpc*1e6; return [o.dx*d,o.dy*d,o.dz*d]; }
  if(o.p&&o._dx!==undefined){ const d=o._r; return [o._dx*d,o._dy*d,o._dz*d]; }
  if(o.m!==undefined&&o.dx!==undefined){ const d=o.d; return [o.dx*d,o.dy*d,o.dz*d]; }
  if(o._e) return [o._e[0]*AU_PC,o._e[1]*AU_PC,o._e[2]*AU_PC]; return null; }
function camXY(px,py,pz){                    // camera-space coords (valid even behind)
  px-=ctr.x;py-=ctr.y;pz-=ctr.z;
  const c=Math.cos(S.yaw),s=Math.sin(S.yaw), x1=px*c+pz*s, z1=-px*s+pz*c, y1=py;
  const cp=Math.cos(S.pitch),sp=Math.sin(S.pitch), y2=y1*cp-z1*sp, z2=y1*sp+z1*cp;
  return {x1,y2,z2,depth:S.camZ-z2}; }
function camPhysPos(){ const cd=Math.hypot(camPos[0],camPos[1],camPos[2]);
  if(cd<1e-15) return [0,0,0]; const p=invScale(cd)/cd; return [camPos[0]*p,camPos[1]*p,camPos[2]*p]; }
function navDistPc(){ if(!navTarget) return 0; const t=navPhys(navTarget); if(!t) return 0;
  const c=camPhysPos(); return Math.hypot(t[0]-c[0],t[1]-c[1],t[2]-c[2]); }
function fmtLight(pc){ const ly=pc*3.261564;
  if(ly<1){ const min=ly*365.25*24*60;
    if(min<90) return Math.max(1,Math.round(min))+' light-minutes';
    if(min<2880) return (min/60).toFixed(1)+' light-hours';
    return fmt(min/1440)+' light-days'; }
  if(ly<1e3) return fmt(ly)+' years';
  if(ly<1e6) return (ly/1e3).toFixed(1)+' thousand years';
  return (ly/1e6).toFixed(2)+' million years'; }
// ---- scale readout ---------------------------------------------------------
// A linear scale bar would be a lie in the compact view: that projection is
// logarithmic and radial, so a fixed screen length is a fixed *ratio*, not a fixed
// distance. So we draw the honest thing for each mode — a decade ladder in the
// compact view, a real 1-2-5 bar when distances are proportional.
function fmtDist(pc){
  if(!isFinite(pc)||pc<=0) return '0';
  const au=pc/AU_PC;
  if(au<0.02) return (au*1.496e8).toFixed(0)+' km';
  if(au<2000) return (au<10?au.toFixed(2):fmt(au))+' AU';
  const ly=pc*PC2LY;
  if(ly<1e3) return (ly<10?ly.toFixed(2):fmt(ly))+' ly';
  if(ly<1e6) return (ly/1e3).toFixed(ly<1e4?2:1)+' kly';
  if(ly<1e9) return (ly/1e6).toFixed(ly<1e7?2:1)+' Mly';
  return (ly/1e9).toFixed(2)+' Gly';
}
function niceLen(v){                      // round down to the nearest 1 / 2 / 5 × 10^n
  const e=Math.pow(10,Math.floor(Math.log10(v))), m=v/e;
  return (m>=5?5:m>=2?2:1)*e;
}
function drawScaleBar(){
  if(!S.labels) return;
  const narrow = W<=720;
  // the docked timeline strip owns the bottom edge when it is on
  const strip = document.body.classList.contains('show-time') ? 48 : 0;
  const x0 = 16, y0 = H - (narrow?92:30) - strip;
  const dim='rgba(154,163,184,0.85)', ink='rgba(232,235,244,0.95)';
  LBL.prio=P_HUD;
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  // how far out the camera itself sits — the "where am I" number
  const here = camDist>1e-9 ? invScale(camDist) : 0;
  ctx.font='10px ui-monospace,monospace'; ctx.fillStyle=dim;
  ctx.fillText(here>0 ? 'eye · '+fmtDist(here)+' from the Sun' : 'eye · at the Sun', x0, y0-22);

  if(S.realScale){                        // proportional space → a true scale bar
    const pcPerPx=S.camZ/foc;
    let L=niceLen(pcPerPx*(narrow?90:150));
    let px=L/pcPerPx;
    if(px<40){ L=niceLen(pcPerPx*220); px=L/pcPerPx; }
    if(!isFinite(px)||px<8) return;
    px=Math.min(px, W*0.4);
    ctx.strokeStyle=dim; ctx.lineWidth=1.2; ctx.beginPath();
    ctx.moveTo(x0,y0-9); ctx.lineTo(x0,y0-3); ctx.lineTo(x0+px,y0-3); ctx.lineTo(x0+px,y0-9);
    ctx.stroke();
    ctx.font='11px ui-monospace,monospace'; ctx.fillStyle=ink;
    ctx.fillText(fmtDist(L), x0, y0+9);
  } else {                                // logarithmic space → a decade ladder
    const dec=KDEC*foc/S.camZ;            // screen px for one factor of 10
    if(!isFinite(dec)||dec<2) return;
    let k=1; while(dec*k<64 && k<12) k++;
    let px=dec*k;
    if(px>W*0.42){ px=dec; k=1; }
    if(px<18) return;
    ctx.strokeStyle=dim; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(x0,y0-9); ctx.lineTo(x0,y0-3); ctx.lineTo(x0+px,y0-3); ctx.lineTo(x0+px,y0-9); ctx.stroke();
    if(k===1 && dec>26){                  // room for the intermediate decade ticks
      for(let i=1;i<10;i++){ const tx=x0+Math.log10(i+1)*dec;
        ctx.beginPath(); ctx.moveTo(tx,y0-3); ctx.lineTo(tx,y0-6.5); ctx.stroke(); }
    }
    ctx.font='11px ui-monospace,monospace'; ctx.fillStyle=ink;
    ctx.fillText('×'+(k===1?'10':'10^'+k)+' distance', x0, y0+9);
  }
  LBL.prio=P_STAR;
}
function drawNav(){ LBL.prio=P_HUD;
  if(!navTarget) return;
  const w=navWorld(navTarget); if(!w) return;
  const c=camXY(w[0],w[1],w[2]);
  let onscreen=false, sx=0, sy=0;
  if(c.depth>NEAR){ sx=cx+foc*c.x1/c.depth; sy=cy-foc*c.y2/c.depth;
    onscreen=(sx>12&&sx<W-12&&sy>12&&sy<H-12); }
  ctx.strokeStyle='rgba(79,214,200,0.9)'; ctx.fillStyle='rgba(79,214,200,0.9)'; ctx.lineWidth=1.4;
  if(onscreen){                              // course line + targeting reticle
    ctx.save(); ctx.setLineDash([6,6]); ctx.strokeStyle='rgba(79,214,200,0.4)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(sx,sy); ctx.stroke(); ctx.restore();
    ctx.strokeStyle='rgba(79,214,200,0.9)';
    const r=13;
    ctx.beginPath(); ctx.arc(sx,sy,r,0,6.2832); ctx.globalAlpha=0.5; ctx.stroke(); ctx.globalAlpha=1;
    for(const [ex,ey] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
      ctx.beginPath(); ctx.moveTo(sx+ex*r,sy+ey*r*0.4); ctx.lineTo(sx+ex*r,sy+ey*r);
      ctx.lineTo(sx+ex*r*0.4,sy+ey*r); ctx.stroke(); }
  } else {                                   // off-screen edge arrow toward the target
    let dx=c.x1, dy=-c.y2; if(c.depth<=NEAR){ dx=-c.x1; dy=c.y2; }
    const L=Math.hypot(dx,dy)||1; dx/=L; dy/=L;
    const rad=Math.min(W,H)*0.4, ax=cx+dx*rad, ay=cy+dy*rad;
    ctx.save(); ctx.setLineDash([6,6]); ctx.strokeStyle='rgba(79,214,200,0.35)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ax,ay); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(ax,ay); ctx.rotate(Math.atan2(dy,dx));
    ctx.beginPath(); ctx.moveTo(11,0); ctx.lineTo(-6,7); ctx.lineTo(-6,-7); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.font='10px ui-monospace,monospace'; ctx.textAlign='center';
    ctx.fillText(navTarget.n||navTarget.h||'Target', ax-dx*18, ay-dy*18+3); ctx.textAlign='left';
  }
}

// ---- HUD ----
function fmt(n){return Math.round(n).toLocaleString('en-US');}
let lastInfo=undefined, lastInfoNav=false, lastStat=['','','',''];
function setStat(id,v,i){ if(lastStat[i]!==v){ lastStat[i]=v; document.getElementById(id).textContent=v; } }
function updateHUD(){
  setStat('s-sys',fmt(visSys),0); setStat('s-pl',fmt(visPl),1);
  setStat('s-near', isFinite(nearD)?fmt(nearD*PC2LY):'—',2);
  setStat('s-far', farD?fmt(farD*PC2LY):'—',3);
  const s=S.pinned||S.hover, info=document.getElementById('info'), isNav=(s===navTarget);
  if(s!==lastInfo || isNav!==lastInfoNav){       // rebuild only on change (keeps the button clickable)
    lastInfo=s; lastInfoNav=isNav;
    if(s){ showInfo(s);
      if(s===SUN||navWorld(s)) info.insertAdjacentHTML('beforeend',
        `<button class="lockset">${FOLLOW===s?svgIcon('unlock')+'Unlock view':svgIcon('lock')+'Lock & zoom'}</button>`);
      if(navPhys(s)) info.insertAdjacentHTML('beforeend',
        `<button class="navset">${isNav?svgIcon('check')+'Target set':svgIcon('scope')+'Set course'}</button>`);
      // interstellar route button on every cosmic target (solar bodies get Lambert instead)
      if(navPhys(s) && s._e===undefined && s.rk===undefined && !s.lp && !s.iroute && !s.xfer)
        info.insertAdjacentHTML('beforeend',
          `<button class="transferset">${ROUTE&&ROUTE.o===s?svgIcon('close')+'Clear route':svgIcon('probe')+'Route from Earth · 1g ship'}</button>`);
    } else info.classList.remove('show');
  }
  updateNavPanel();
  syncSolarBtn();
}
function updateNavPanel(){
  const nav=document.getElementById('hud-nav');
  if(!navTarget){ if(nav.style.display!=='none') showNav(false); return; }
  document.getElementById('navName').textContent=navTarget.n||navTarget.h||'Target';
  const dpc=navDistPc();
  document.getElementById('navDist').textContent=fmtDist(dpc);
  document.getElementById('navLight').textContent=fmtLight(dpc);
  const w=navWorld(navTarget); let head='–';
  if(w){ const tv=[w[0]-camPos[0],w[1]-camPos[1],w[2]-camPos[2]], tl=Math.hypot(tv[0],tv[1],tv[2])||1;
    const dot=(tv[0]*camFwd[0]+tv[1]*camFwd[1]+tv[2]*camFwd[2])/tl;
    const ang=Math.acos(Math.max(-1,Math.min(1,dot)))*57.2958;
    head=ang<3?'on target':fmt(ang)+'° off'; }
  document.getElementById('navHead').textContent=head;
}
function showNav(on){
  document.getElementById('hud-nav').style.display=on?'block':'none';
  document.getElementById('hud-pm').style.top=on?'132px':'16px';
  if(!on) navTarget=null;
}
const GTYPE={Sp:'Spiral galaxy',E:'Elliptical galaxy',S0:'Lenticular galaxy',
  Irr:'Irregular galaxy',dSph:'Dwarf galaxy'};
function showInfo(s){
  const el=document.getElementById('info');
  if(s.gpick){             // ---- anonymous catalog point (GPU cloud) ----
    const [ra,dec]=radec(s._dir[0],s._dir[1],s._dir[2]);
    let rows='';
    if(s.gpick==='gaia') rows=`
        <div class="r"><span class="rk">Type</span><span class="rv">Star · Gaia DR3</span></div>
        <div class="r"><span class="rk">Mag G</span><span class="rv">${s.mag.toFixed(1)}</span></div>
        <div class="r"><span class="rk">Colour bp-rp</span><span class="rv">${s.bprp.toFixed(2)}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d*PC2LY)} ly · ${s.d.toFixed(1)} pc</span></div>`;
    else if(s.gpick==='web') rows=`
        <div class="r"><span class="rk">Type</span><span class="rv">Galaxy · 2MRS survey</span></div>
        <div class="r"><span class="rk">Mag K</span><span class="rv">${s.kmag.toFixed(1)}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${(s.d/1e6).toFixed(1)} Mpc · ${(s.d*3.2616/1e6).toFixed(0)} Mly</span></div>`;
    else if(s.gpick==='qso') rows=`
        <div class="r"><span class="rk">Type</span><span class="rv">Quasar · Milliquas</span></div>
        <div class="r"><span class="rk">Redshift</span><span class="rv">z ≈ ${s.z.toFixed(2)}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${(s.d/1e9).toFixed(2)} Gpc comoving</span></div>`;
    else rows=`
        <div class="r"><span class="rk">Type</span><span class="rv">${s.n} · JPL SBDB</span></div>
        <div class="r"><span class="rk">Abs. mag H</span><span class="rv">${s.H.toFixed(1)}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${s.rAU.toFixed(2)} AU from the Sun</span></div>`;
    let h=`<div class="nm"><span class="mk" style="color:#cfd8f2;background:#cfd8f2"></span>${s.n}</div>
      <div class="rows">${rows}</div>`;
    h+=links([{t:'SIMBAD',u:`https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${ra.toFixed(4)}%20${dec.toFixed(4)}&Radius=2&Radius.unit=arcmin`},
      {t:'Aladin',u:`https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=0.5`}]);
    h+=`<div class="hint">catalog point — no individual name</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.oclu){              // ---- open cluster (catalog) ----
    let h=`<div class="nm"><span class="mk" style="color:#96beff;background:#96beff"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">${CLU_T[s.ct||0].l}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${s.ct===2?fmt(s.d/1e6)+' Mpc':fmt(s.d*PC2LY)+' ly'}</span></div>
        <div class="r"><span class="rk">${s.ct===2?'z est. from DM':fmt(s.d)+' pc'}</span><span class="rv">${s.ct===2?'approximate!':'measured'}</span></div>
      </div>`;
    h+=links([{t:'SIMBAD',u:`https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(s.n)}`},
      {t:'Aladin',u:`https://aladin.cds.unistra.fr/AladinLite/?target=${s[0].toFixed(4)}%20${s[1].toFixed(4)}&fov=2`}]);
    h+=`<div class="hint">${S.pinned?'Click empty space to release':'Click to pin'}</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.psr){               // ---- pulsar (neutron star) ----
    let h=`<div class="nm"><span class="mk" style="color:#96dcff;background:#96dcff;box-shadow:0 0 7px #64b4ff"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Pulsar · rotating neutron star</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d*PC2LY)} ly</span></div>
        <div class="r"><span class="rk">${fmt(s.d)} pc</span><span class="rv">from DM (dispersion)</span></div>
      </div>`;
    h+=links([{t:'ATNF',u:'https://www.atnf.csiro.au/research/pulsar/psrcat/'},
      {t:'SIMBAD',u:`https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${s[0].toFixed(4)}%20${s[1].toFixed(4)}&Radius=5&Radius.unit=arcmin`}]);
    h+=`<div class="hint">${S.pinned?'Click empty space to release':'Click to pin'}</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.lp){                // ---- Lagrange point ----
    const rAU=s._e?Math.hypot(s._e[0],s._e[1],s._e[2]):0;
    let h=`<div class="nm"><span class="mk" style="color:#c4aaff;background:#c4aaff"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Lagrange point · gravity balance</span></div>
        <div class="r"><span class="rk">System</span><span class="rv">Sun–${s.pl}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${rAU.toFixed(2)} AU from the Sun</span></div>
        ${s.note?`<div class="r"><span class="rk">Note</span><span class="rv">${s.note}</span></div>`:''}
      </div>`;
    h+=links([{t:'Wikipedia',u:'https://en.wikipedia.org/wiki/Lagrange_point'}]);
    h+=`<div class="hint">where the Sun's and ${s.pl}'s gravity balance the orbit</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.cme){               // ---- live coronal mass ejection (DONKI) ----
    const c=s.cme, col=s.c||[255,150,80];
    const dir=`${c.lat>=0?'N':'S'}${Math.abs(c.lat).toFixed(0)} ${c.lon>=0?'W':'E'}${Math.abs(c.lon).toFixed(0)}`;
    const dt=o=>new Date(o).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
    let h=`<div class="nm"><span class="mk" style="color:rgb(${col[0]},${col[1]},${col[2]});background:rgb(${col[0]},${col[1]},${col[2]})"></span>Coronal mass ejection</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">CME · class ${c.type} · NASA DONKI</span></div>
        <div class="r"><span class="rk">Erupted</span><span class="rv">${dt(c.t)} UTC (at 21.5 R☉)</span></div>
        <div class="r"><span class="rk">Speed</span><span class="rv">${Math.round(c.v)} km/s</span></div>
        <div class="r"><span class="rk">Width</span><span class="rv">±${Math.round(c.half)}° · from ${dir}</span></div>
        ${c.earthDir?`<div class="r"><span class="rk">Earth arrival</span><span class="rv">~ ${dt(c.eta)} UTC</span></div>`:
          `<div class="r"><span class="rk">Direction</span><span class="rv">not Earth-directed</span></div>`}
      </div>`;
    h+=links([{t:'DONKI',u:'https://kauai.ccmc.gsfc.nasa.gov/DONKI/'},{t:'SWPC',u:'https://www.swpc.noaa.gov/'}]);
    h+=`<div class="hint">ballistic estimate — real fronts decelerate in the solar wind</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.iroute){             // ---- interstellar route card ----
    const R=s.R, D=R.distPc*PC2LY, r=route1g(D);
    const dTxt=D<1e4?`${D.toFixed(1)} ly`:`${fmt(D)} ly`;
    let h=`<div class="nm"><span class="mk" style="color:#78ffeb;background:#78ffeb"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Distance</span><span class="rv">${dTxt}</span></div>
        <div class="r"><span class="rk">Light</span><span class="rv">${fmtYears(D)}</span></div>
        <div class="r"><span class="rk">Voyager 1 (17 km/s)</span><span class="rv">${fmtYears(D/5.67e-5)}</span></div>
        <div class="r"><span class="rk">Probe at 0.1 c</span><span class="rv">${fmtYears(D*10)}</span></div>
        <div class="r"><span class="rk">1g ship · Earth clock</span><span class="rv">${fmtYears(r.T)}</span></div>
        <div class="r"><span class="rk">1g ship · on board</span><span class="rv">${fmtYears(r.TAU)}</span></div>
      </div>`;
    h+=links([{t:'Wikipedia',u:'https://en.wikipedia.org/wiki/Space_travel_under_constant_acceleration'}]);
    h+=`<div class="hint">accelerate at 1 g to the midpoint, flip, brake — time dilation makes even galaxies reachable within a life on board</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.xfer){              // ---- planned transfer trajectory ----
    const T=s.T;
    let h=`<div class="nm"><span class="mk" style="color:#78ffeb;background:#78ffeb"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Two-impulse transfer (Lambert)</span></div>
        <div class="r"><span class="rk">Launch</span><span class="rv">${dateStr(T.dep)}</span></div>
        <div class="r"><span class="rk">Arrival</span><span class="rv">${dateStr(T.dep+T.tof)}</span></div>
        <div class="r"><span class="rk">Time of flight</span><span class="rv">${Math.round(T.tof)} days</span></div>
        <div class="r"><span class="rk">Δv (heliocentric)</span><span class="rv">${T.dv.toFixed(2)} km/s</span></div>
      </div>`;
    h+=links([{t:'Wikipedia',u:'https://en.wikipedia.org/wiki/Hohmann_transfer_orbit'}]);
    h+=`<div class="hint">min-Δv window from a departure × flight-time search — drag the time slider to fly it</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.spot){              // ---- active solar region (SWPC) ----
    const r=s.spot;
    let h=`<div class="nm"><span class="mk" style="color:#c86432;background:#c86432"></span>Active region ${r.no}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Sunspot group · NOAA SWPC</span></div>
        <div class="r"><span class="rk">Class</span><span class="rv">${r.cls||'—'}${r.mag?' · mag '+r.mag:''}</span></div>
        <div class="r"><span class="rk">Area</span><span class="rv">${r.area} millionths · ${r.spots} spots</span></div>
        <div class="r"><span class="rk">Flares 24 h</span><span class="rv">${r.cx} C · ${r.mx} M · ${r.xx} X</span></div>
        <div class="r"><span class="rk">Flare odds</span><span class="rv">C ${r.cp}% · M ${r.mp}% · X ${r.xp}%</span></div>
      </div>`;
    h+=links([{t:'SWPC',u:'https://www.swpc.noaa.gov/products/solar-region-summary'}]);
    h+=`<div class="hint">observed ${r.date} — sunspots this size dwarf the Earth</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.rec){               // ---- live satellite (CelesTrak TLE) ----
    let h=`<div class="nm"><span class="mk" style="color:#96ebff;background:#96ebff"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Satellite · NORAD ${s.rec.satnum}</span></div>
        <div class="r"><span class="rk">Altitude</span><span class="rv">${fmt(s.alt||0)} km</span></div>
        <div class="r"><span class="rk">Period</span><span class="rv">${(2*Math.PI/s.rec.no).toFixed(0)} min</span></div>
        <div class="r"><span class="rk">Inclination</span><span class="rv">${(s.rec.inclo*57.2958).toFixed(1)}°</span></div>
      </div>`;
    h+=links([{t:'N2YO',u:`https://www.n2yo.com/satellite/?s=${s.rec.satnum}`},
      {t:'CelesTrak',u:'https://celestrak.org/'}]);
    h+=`<div class="hint">real orbit, SGP4-propagated — it moves as you watch</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.fb){                // ---- fireball (JPL CNEOS) ----
    const f=s.fb;
    let h=`<div class="nm"><span class="mk" style="color:#ff9650;background:#ff9650"></span>Fireball</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">Atmospheric impact · JPL CNEOS</span></div>
        <div class="r"><span class="rk">When</span><span class="rv">${new Date(f.t).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})} UTC</span></div>
        <div class="r"><span class="rk">Energy</span><span class="rv">${f.kt} kt TNT</span></div>
        <div class="r"><span class="rk">Location</span><span class="rv">${Math.abs(f.lat).toFixed(1)}°${f.lat>=0?'N':'S'} ${Math.abs(f.lon).toFixed(1)}°${f.lon>=0?'E':'W'}</span></div>
        ${f.vel?`<div class="r"><span class="rk">Velocity</span><span class="rv">${f.vel} km/s</span></div>`:''}
      </div>`;
    h+=links([{t:'CNEOS',u:'https://cneos.jpl.nasa.gov/fireballs/'}]);
    h+=`<div class="hint">a small asteroid burning up — most are never seen by anyone</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.rk!==undefined){   // ---- solar-system body ----
    const c=s.c||[190,215,235], er=(s.rk/6371), probe=s.kind==='Spacecraft';
    let dist = s.am!==undefined ? `${fmt(s.am*1000)} km from ${s.parent}`
             : s._r!==undefined ? `${s._r.toFixed(2)} AU from the Sun`
             : s.a!==undefined ? `${s.a} AU (semi-major axis)` : '—';
    const ltxt = s._r!==undefined ? (s._r*8.317>120 ? (s._r*8.317/60).toFixed(1)+' h' : (s._r*8.317).toFixed(0)+' min') : '—';
    let rows = probe
      ? `<div class="r"><span class="rk">Type</span><span class="rv">Spacecraft · human-made</span></div>
         ${s.launch?`<div class="r"><span class="rk">Launched</span><span class="rv">${s.launch}</span></div>`:''}
         <div class="r"><span class="rk">Distance</span><span class="rv">${dist}</span></div>
         <div class="r"><span class="rk">Signal delay</span><span class="rv">${ltxt} · one way</span></div>`
      : `<div class="r"><span class="rk">Type</span><span class="rv">${s.kind}${s.parent?' · '+s.parent:''}</span></div>
         <div class="r"><span class="rk">Radius</span><span class="rv">${fmt(s.rk)} km</span></div>
         <div class="r"><span class="rk">= Earth radii</span><span class="rv">${er<0.1?er.toFixed(3):er.toFixed(2)} ⊕</span></div>
         <div class="r"><span class="rk">Distance</span><span class="rv">${dist}</span></div>`;
    rows += s.note?`<div class="r"><span class="rk">Note</span><span class="rv">${s.note}</span></div>`:'';
    let h=`<div class="nm"><span class="mk" style="color:rgb(${c[0]},${c[1]},${c[2]});background:rgb(${c[0]},${c[1]},${c[2]})"></span>${s.n}</div>
      <div class="rows">${rows}</div>`;
    const q = s.slug ? `https://science.nasa.gov/${s.slug}/`
                     : `https://science.nasa.gov/?search=${encodeURIComponent(s.n)}`;
    h+=links([{t:'NASA',u:q},
      {t:'Wikipedia',u:`https://en.wikipedia.org/wiki/${encodeURIComponent(s.n)}`}]);
    if((s.k||s.kd) && s.n!=='Earth' && s.kind!=='Moon' && s.kind!=='Spacecraft')
      h+=`<button class="transferset">${TRANSFER&&TRANSFER.to===s?svgIcon('close')+'Clear transfer orbit':svgIcon('probe')+'Transfer Earth → '+s.n}</button>`;
    h+=`<div class="hint">${S.pinned?'Click empty space to release':'Click to pin'}</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.dso){               // ---- deep-sky object (nebula / cluster) ----
    const c=(DSO_T[s.t]||DSO_T.EN).c;
    let h=`<div class="nm"><span class="mk" style="color:rgb(${c});background:rgb(${c})"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">${(DSO_T[s.t]||DSO_T.EN).l}</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d*PC2LY)} LJ</span></div>
        <div class="r"><span class="rk">${fmt(s.d)} pc</span><span class="rv">Deep-Sky</span></div>
        ${radecRow(s._dir[0],s._dir[1],s._dir[2])}
      </div>`;
    const [ra,dec]=radec(s._dir[0],s._dir[1],s._dir[2]);
    h+=links([{t:'SIMBAD',u:`https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${ra.toFixed(4)}%20${dec.toFixed(4)}&Radius=10&Radius.unit=arcmin`},
      {t:'Aladin',u:`https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=1`}]);
    h+=`<div class="hint">${S.pinned?'Click empty space to release':'Click to pin'}</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.sgra){              // ---- Sagittarius A* (galactic centre) ----
    let h=`<div class="nm"><span class="mk" style="color:#ffcd82;background:#ffcd82;box-shadow:0 0 8px #ff8c3c"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Object</span><span class="rv">Black hole</span></div>
        <div class="r"><span class="rk">Mass</span><span class="rv">4.3 million M☉</span></div>
        <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d*PC2LY)} LJ</span></div>
        <div class="r"><span class="rk">${fmt(s.d)} pc</span><span class="rv">centre of the Milky Way</span></div>
      </div>`;
    const [ra,dec]=radec(s._dir[0],s._dir[1],s._dir[2]);
    h+=links([{t:'SIMBAD',u:'https://simbad.cds.unistra.fr/simbad/sim-id?Ident=Sgr+A*'},
      {t:'Aladin',u:`https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=0.3`}]);
    h+=`<div class="hint">We orbit it every ~225 million years</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.fc!==undefined){    // ---- exoplanet (clicked in a system diagram) ----
    const pc=planetColor(s.r);
    const cls = !s.r?'—' : s.r<1.6?'Rocky planet' : s.r<3.5?'Super-Earth' : s.r<8?'Neptune-like':'Gas giant';
    let h=`<div class="nm"><span class="mk" style="color:rgb(${pc});background:rgb(${pc})"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Type</span><span class="rv">${cls}</span></div>
        ${s.r?`<div class="r"><span class="rk">Radius</span><span class="rv">${s.r} R⊕</span></div>`:''}
        ${s.ma?`<div class="r"><span class="rk">Mass</span><span class="rv">${s.ma} M⊕</span></div>`:''}
        ${s.a?`<div class="r"><span class="rk">Orbit (a)</span><span class="rv">${s.a} AE</span></div>`:''}
        <div class="r"><span class="rk">Discovered</span><span class="rv">${s.y||'—'} · ${s.m||''}</span></div>
      </div>`;
    h+=links([{t:'NASA archive',u:`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(s._host||s.n)}`},
      {t:'SIMBAD',u:`https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(s._host||s.n)}`}]);
    h+=`<div class="hint">Planet in system ${s._host||''}</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(s.mpc!==undefined){   // ---- galaxy ----
    const c=s.c, mly=s.mpc*3.2616;
    const distTxt = mly<10 ? mly.toFixed(2)+' Mly' : fmt(mly)+' Mly';
    let h=`<div class="nm"><span class="mk" style="color:rgb(${c[0]},${c[1]},${c[2]});background:rgb(${c[0]},${c[1]},${c[2]})"></span>${s.n}</div>
      <div class="rows">
        <div class="r"><span class="rk">Distance</span><span class="rv">${distTxt}</span></div>
        <div class="r"><span class="rk">${s.mpc} Mpc</span><span class="rv">${GTYPE[s.t]||'Galaxie'}</span></div>
        <div class="r"><span class="rk">Catalog</span><span class="rv">${s.id}</span></div>
        ${s.kpc?`<div class="r"><span class="rk">Diameter</span><span class="rv">${s.kpc} kpc</span></div>`:''}
      </div>`;
    const [ra,dec]=radec(s.dx,s.dy,s.dz);
    h+=links([
      {t:'SIMBAD',u:`https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(s.id)}`},
      {t:'NED',u:`https://ned.ipac.caltech.edu/byname?objname=${encodeURIComponent(s.id)}`},
      {t:'Aladin',u:`https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=1`}]);
    h+=`<div class="hint">${S.pinned?'Click empty space to release':'Click to pin'}</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  if(!s.p){   // ---- HYG background star ----
    const c=s.c, [ra,dec]=radec(s.dx,s.dy,s.dz);
    let h=`<div class="nm"><span class="mk" style="color:rgb(${c[0]},${c[1]},${c[2]});background:rgb(${c[0]},${c[1]},${c[2]})"></span>${s.n||'Stern'}</div>
      <div class="rows">
        <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d*PC2LY)} LJ</span></div>
        <div class="r"><span class="rk">${s.d} pc</span><span class="rv">apparent mag. ${s.m}</span></div>
        ${s.con?`<div class="r"><span class="rk">Constellation</span><span class="rv">${s.con}</span></div>`:''}
        ${radecRow(s.dx,s.dy,s.dz)}
      </div>`;
    h+=links([
      {t:'SIMBAD',u:s.n?`https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(s.n)}`
                     :`https://simbad.cds.unistra.fr/simbad/sim-coo?Coord=${ra.toFixed(4)}%20${dec.toFixed(4)}&Radius=2&Radius.unit=arcmin`},
      {t:'Aladin',u:`https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=0.5`}]);
    h+=`<div class="hint">Background star (HYG catalogue)</div>`;
    el.innerHTML=h; el.classList.add('show'); return;
  }
  const c=s._col, pls=s.p.filter(p=>p.y<=S.year||p.y===0)
    .sort((a,b)=>(a.y||9999)-(b.y||9999));
  let rows=`
    <div class="nm"><span class="mk" style="color:rgb(${c[0]},${c[1]},${c[2]});background:rgb(${c[0]},${c[1]},${c[2]})"></span>${s.h}</div>
    <div class="rows">
      <div class="r"><span class="rk">Distance</span><span class="rv">${fmt(s.d*PC2LY)} LJ</span></div>
      <div class="r"><span class="rk">${fmt(s.d)} pc</span><span class="rv">${s.sp?s.sp:(s.t?fmt(s.t)+' K':'—')}</span></div>
      <div class="r"><span class="rk">Discovered</span><span class="rv">${s.fy||'—'}</span></div>
    </div>`;
  rows+=`<div class="pls"><div class="label">${pls.length} planet${pls.length!==1?'s':''}</div>`;
  for(const p of pls.slice(0,6)){
    const extra=p.r?`${p.r} R⊕`:(p.ma?`${p.ma} M⊕`:'');
    rows+=`<div class="pl"><b>${p.n}</b><span>${p.y||''} · ${extra}</span></div>`;
  }
  if(pls.length>6) rows+=`<div class="pl"><span>… and ${pls.length-6} more</span></div>`;
  const fc=FAC[s.fac]||FAC.other;
  rows+=`<div class="r" style="margin-top:9px"><span class="rk">Instrument</span><span class="rv" style="color:rgb(${fc.c[0]},${fc.c[1]},${fc.c[2]})">${fc.l}</span></div></div>`;
  const [ra,dec]=radec(s.x/s.d,s.y/s.d,s.z/s.d);
  rows+=links([
    {t:'NASA archive',u:`https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(s.h)}`},
    {t:'SIMBAD',u:`https://simbad.cds.unistra.fr/simbad/sim-id?Ident=${encodeURIComponent(s.h)}`},
    {t:'Aladin',u:`https://aladin.cds.unistra.fr/AladinLite/?target=${ra.toFixed(4)}%20${dec.toFixed(4)}&fov=0.4`}]);
  rows+=`<div class="hint">Click → fly into the system &amp; see the orbits</div>`;
  el.innerHTML=rows; el.classList.add('show');
}

// ---- picking ----
function pick(mx,my){
  if(SURF.on) return null;                 // surface map: nothing to pick
  if(ROUTE&&ROUTE._sx!==undefined){        // interstellar route craft (outside the solar LOD)
    const dx=ROUTE._sx-mx, dy=ROUTE._sy-my;
    if(dx*dx+dy*dy<14*14) return ROUTE._o;
  }
  if(sysA>0.5){                            // planets of a focused exoplanet system
    let best=null,bd=1e9;
    for(const it of sysProj){ const dx=it.x-mx,dy=it.y-my,d=dx*dx+dy*dy;
      const rr=Math.max(12,it.px+8); if(d<rr*rr && d<bd){bd=d;best=it.o;} }
    if(best) return best;
  }
  if(solarA>0.5){                          // zoomed into the solar system
    let best=null,bd=1e9;
    for(const it of solarProj){ const dx=it.x-mx,dy=it.y-my,d=dx*dx+dy*dy;
      const rr=Math.max(13,it.px+8); if(d<rr*rr && d<bd){bd=d;best=it.o;} }
    if(best) return best;
  }
  let best=null,bd=18*18;
  for(const s of order){
    const dx=s._sx-mx,dy=s._sy-my,d=dx*dx+dy*dy;
    if(d<bd){bd=d;best=s;}
  }
  if(S.galaxies) for(const g of galProj){
    const dx=g._sx-mx,dy=g._sy-my,d=dx*dx+dy*dy;
    if(d<bd){bd=d;best=g;}
  }
  if(S.dso) for(const o of dsoProj){
    const dx=o._sx-mx,dy=o._sy-my,d=dx*dx+dy*dy;
    if(d<17*17 && d<bd){bd=d;best=o;}
  }
  if(S.psr) for(const o of pulsarProj){
    const dx=o._sx-mx,dy=o._sy-my,d=dx*dx+dy*dy;
    if(d<13*13 && d<bd){bd=d;best=o;}
  }
  if(S.oclu) for(const o of cluProj){
    const dx=o._sx-mx,dy=o._sy-my,d=dx*dx+dy*dy;
    if(d<13*13 && d<bd){bd=d;best=o;}
  }
  if(S.hyg){ let hb=13*13;                 // tighter radius for dense field
    for(const g of hygProj){
      const dx=g._sx-mx,dy=g._sy-my,d=dx*dx+dy*dy;
      if(d<hb && d<bd){bd=d;best=g;}
    }
  }
  if(S.mw && sgraScreen){                  // Sagittarius A*
    const dx=sgraScreen.x-mx,dy=sgraScreen.y-my,d=dx*dx+dy*dy;
    if(d<15*15 && d<bd){ bd=d; best=SGRA; }
  }
  if(solarA<0.3 && lastSun.depth>NEAR){    // Sun = fly-in target (when zoomed out)
    const dx=lastSun.x-mx,dy=lastSun.y-my;
    if(dx*dx+dy*dy<16*16) return SUNHIT;
  }
  return best;
}
// CPU picking of the anonymous GPU point clouds (click only — too heavy for hover)
function gpuPick(mx,my){
  if(SURF.on||!glOK||!S.gpu) return null;
  const layers=[];
  if(gaiaRaw&&S.gaia) layers.push(['gaia',gaiaRaw]);
  if(solarA<0.5){ if(webRaw&&S.web) layers.push(['web',webRaw]); if(qsoRaw&&S.qso) layers.push(['qso',qsoRaw]); }
  if(solarA>0.05&&beltRaw&&S.belt) layers.push(['belt',beltRaw]);
  const D2R=Math.PI/180; let best=null,bd=9*9;
  for(const [type,bytes] of layers){
    const dv=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength), n=(bytes.length/8)|0;
    for(let i=0;i<n;i++){ const b=i*8;
      const u=dv.getUint16(b+4,true)/65535;
      const dist = type==='gaia'?u*gaiaRange : type==='web'?u*600e6 : type==='qso'?u*13000e6 : u*120*4.84814e-6;
      const rr=dv.getUint16(b,true)*(360/65535)*D2R, dr=(dv.getUint16(b+2,true)*(180/65535)-90)*D2R;
      const cd=Math.cos(dr), R=scale(dist);
      const p=project(cd*Math.cos(rr)*R, cd*Math.sin(rr)*R, Math.sin(dr)*R);
      if(p.depth<=NEAR) continue;
      const dx=p.x-mx,dy=p.y-my,d2=dx*dx+dy*dy;
      if(d2<bd){ bd=d2; best={type,b,rr,dr,dist,bytes}; }
    }
  }
  if(!best) return null;
  const dv=new DataView(best.bytes.buffer,best.bytes.byteOffset,best.bytes.byteLength);
  const b6=dv.getUint8(best.b+6), b7=dv.getUint8(best.b+7), cd=Math.cos(best.dr);
  const o={gpick:best.type, _dir:[cd*Math.cos(best.rr),cd*Math.sin(best.rr),Math.sin(best.dr)], d:best.dist};
  if(best.type==='gaia'){ o.n='Gaia DR3 star'; o.mag=b6/255*28-2; o.bprp=b7/255*6-1; }
  else if(best.type==='web'){ o.n='2MRS galaxy'; o.kmag=b6/255*16; }
  else if(best.type==='qso'){ o.n='Quasar'; o.z=b6/20; }
  else { o.n=['Main-belt asteroid','Jupiter trojan','Near-Earth object','Trans-Neptunian object'][b7]||'Asteroid'; o.H=b6/10; o.rAU=best.dist/4.84814e-6; }
  return o;
}
// equatorial RA/Dec (deg) from a unit direction — for deep-links
function radec(dx,dy,dz){
  let ra=Math.atan2(dy,dx)*57.29578; if(ra<0) ra+=360;
  const dec=Math.asin(Math.max(-1,Math.min(1,dz)))*57.29578;
  return [ra,dec];
}
function radecRow(dx,dy,dz){                     // info-panel coordinate line
  const [ra,dec]=radec(dx,dy,dz);
  const hh=Math.floor(ra/15), mm=Math.round((ra/15-hh)*60);
  return `<div class="r"><span class="rk">RA / Dec</span><span class="rv">${hh}h ${String(mm).padStart(2,'0')}m · ${dec>=0?'+':'−'}${Math.abs(dec).toFixed(1)}°</span></div>`;
}
function links(items){
  return '<div class="links">'+items.map(i=>
    `<a href="${i.u}" target="_blank" rel="noopener">${i.t}</a>`).join('')+'</div>';
}

// ---- interaction ----
let dragging=false,panning=false,lx=0,ly=0,moved=0;
cv.addEventListener('contextmenu',e=>e.preventDefault());
const ptrs=new Map(); let pinching=false, pinchD=0;
cv.addEventListener('pointerdown',e=>{
  if(document.body.classList){ document.body.classList.remove('mob-left','mob-right'); }
  ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===2){ pinching=true; dragging=false;
    const p2=[...ptrs.values()]; pinchD=Math.hypot(p2[0][0]-p2[1][0],p2[0][1]-p2[1][1]); return; }
  dragging=true;moved=0;lx=e.clientX;ly=e.clientY;
  panning=(e.button===2||e.button===1||e.shiftKey);
  cv.setPointerCapture(e.pointerId);cv.classList.add('drag');
  if(!panning){S.autorot=false;syncToggle('t-rot',false);}});
cv.addEventListener('pointermove',e=>{
  if(pinching){
    if(ptrs.has(e.pointerId)) ptrs.set(e.pointerId,[e.clientX,e.clientY]);
    if(ptrs.size===2){
      const p2=[...ptrs.values()]; const d=Math.hypot(p2[0][0]-p2[1][0],p2[0][1]-p2[1][1]);
      if(pinchD>4&&d>4){
        let ax=(p2[0][0]+p2[1][0])/2, ay=(p2[0][1]+p2[1][1])/2;   // pinch midpoint
        if(S.pinned){ const w=objWorld(S.pinned);                  // selected star/planet wins
          if(w){ const pp=project(w[0],w[1],w[2]);
            if(pp.depth>NEAR&&pp.x>0&&pp.x<W&&pp.y>0&&pp.y<H){ ax=pp.x; ay=pp.y; } } }
        zoomFactorAt(ax,ay,pinchD/d);
      }
      pinchD=d;
    }
    return;
  }
  if(dragging){
    const dx=e.clientX-lx,dy=e.clientY-ly;moved+=Math.abs(dx)+Math.abs(dy);
    if(SURF.on){ surfPan(dx,dy); lx=e.clientX; ly=e.clientY; return; }   // surface map: drag pans
    if(e.ctrlKey||e.metaKey){                      // CAD dolly: Ctrl+drag zooms (up = in)
      zoomFactorAt(e.clientX,e.clientY,Math.exp(dy*(S.realScale?0.008:0.003)));
      lx=e.clientX; ly=e.clientY; return;
    }
    if(panning){                                   // free pan — move the view centre (breaks the lock)
      FOLLOW=null;
      const sc=Math.max(S.camZ,camDist)/foc;
      tgtCtr.x+=(-camRight[0]*dx+camUp[0]*dy)*sc;
      tgtCtr.y+=(-camRight[1]*dx+camUp[1]*dy)*sc;
      tgtCtr.z+=(-camRight[2]*dx+camUp[2]*dy)*sc;
      S.pinned=null;
    } else if(S.freelook){                         // free-look: turn the camera in place
      camBasis();
      const px=camPos[0],py=camPos[1],pz=camPos[2];
      S.yaw=tgtYaw=tgtYaw+dx*0.005;
      S.pitch=tgtPitch=Math.max(-1.45,Math.min(1.45,tgtPitch+dy*0.005));
      const c=Math.cos(S.yaw),sn=Math.sin(S.yaw),cp=Math.cos(S.pitch),sp=Math.sin(S.pitch);
      tgtCtr.x=ctr.x=px+sn*S.camZ; tgtCtr.y=ctr.y=py+(-sp*c)*S.camZ; tgtCtr.z=ctr.z=pz+(cp*c)*S.camZ;
      S.focusStar=null;
    } else {                                       // orbit around the centre
      tgtYaw+=dx*0.005; tgtPitch+=dy*0.005;
      tgtPitch=Math.max(-1.45,Math.min(1.45,tgtPitch));
      S.focusStar=null;
    }
    lx=e.clientX;ly=e.clientY;
  } else {
    const h=pick(e.clientX,e.clientY);
    S.hover = (h===SUNHIT)?null:h;
    cv.style.cursor=h?'pointer':'grab';
  }
});
let lastTap={t:0,x:0,y:0}, lastTapFocusT=0;   // touch double-tap (dblclick is unreliable on mobile)
cv.addEventListener('pointerup',e=>{
  ptrs.delete(e.pointerId); if(ptrs.size<2){ pinching=false; pinchD=0; }
  dragging=false;panning=false;cv.classList.remove('drag');
  if(moved<5){
    if(e.pointerType==='touch'&&!measureMode&&!SURF.on){
      const now=performance.now();
      if(now-lastTap.t<350 && Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<40){
        lastTap.t=0; lastTapFocusT=now; focusAt(e.clientX,e.clientY); return; }
      lastTap={t:now,x:e.clientX,y:e.clientY};
    }
    const hit=pick(e.clientX,e.clientY) || gpuPick(e.clientX,e.clientY);
    if(measureMode){ if(hit&&hit!==SUNHIT) measurePick(hit); return; }
    if(hit===SUNHIT){ focusSys=null; enterSolar(); return; }
    S.pinned = hit || null;
    if(hit){
      if(hit.p && hit._dx!==undefined){ focusSys=hit; focusSysW=objWorld(hit); flyTo(hit); } // host → its system
      else if(hit.sgra || hit.dso || hit.psr || hit.oclu || hit.gpick || hit.mpc!==undefined || (hit.m!==undefined && hit.dx!==undefined)){ focusSys=null; flyTo(hit); }
      // system planets & solar bodies: just select, no travel
    }
  }
});
// keyboard free-flight (WASD / arrows, R·F up·down)
// frame the selection — CAD-style "zoom to fit" on the picked object
function frameSelection(){
  const b=S.pinned||S.hover; if(!b) return;
  if(b===SUN){ enterSolar(); return; }
  const w=navWorld(b); if(!w) return;
  const isSolar=b._e!==undefined||b.rk!==undefined;
  aim(w[0],w[1],w[2], isSolar?Math.min(tgtCamZ,scale(3e-6)):Math.max(scale(3e-6),tgtCamZ*0.5));
  if(b._e!==undefined||b===SUN){ FOLLOW=b; lastInfo=undefined; }   // solar body: frame = track it
  dirty=true;
}
addEventListener('keydown',e=>{
  const ae=document.activeElement; if(ae&&ae.tagName==='INPUT') return;
  const k=e.key.toLowerCase();
  if('wasdrf'.includes(k)||e.key.startsWith('Arrow')){ keys.add(k==='arrowup'?'w':k==='arrowdown'?'s':k==='arrowleft'?'a':k==='arrowright'?'d':k); e.preventDefault(); }
  else if(e.key==='.'){ frameSelection(); e.preventDefault(); }
  else if(e.key==='Home'){ const b=document.getElementById('resetBtn'); if(b) b.click(); e.preventDefault(); }
  else if(e.key==='Escape'){ S.pinned=null; S.hover=null; FOLLOW=null; lastInfo=undefined; dirty=true; }
});
addEventListener('keyup',e=>{ const k=e.key.toLowerCase();
  keys.delete(k); keys.delete(k==='arrowup'?'w':k==='arrowdown'?'s':k==='arrowleft'?'a':k==='arrowright'?'d':k); });
function zoomAt(mx,my,delta,deltaMode){
  // delta-proportional zoom: one mouse notch (~100px) ≈ 9% (log) / 30% (real);
  // trackpads fire many small deltas and now scale down instead of over-zooming
  let d = delta===true?-100 : delta===false?100 : delta*(deltaMode===1?33:deltaMode===2?400:1);
  d=Math.max(-200,Math.min(200,d));
  // real mode spans many orders → faster zoom; deep log dive (<0.45) doubles the rate
  const k=S.realScale?0.0026:(tgtCamZ<0.45?0.0019:0.00088);
  zoomFactorAt(mx,my,Math.exp(k*d));
}
// Each scale mode covers only part of the range: compact spans 1e-4..16 world units
// (log decades), real spans 1e-12..6e7 pc. The app boots in real mode and camCosmos() is
// 3e7 there, so "Reset" left you one notch below the ceiling and the wheel simply stopped
// — no way to reach the galaxies by zooming, only by finding the Compact view switch.
// The two ranges overlap by orders of magnitude, so hand over at the limit instead:
// clickToggle('t-real') already remaps camZ and ctr through physical distance, which
// makes the switch invisible. Zoom is one continuous range from the CMB to a planet.
function zoomRange(){ return S.realScale ? [1e-12, 6e7] : [1e-4, 16]; }
function zoomFactorAt(mx,my,f){
  let [zmin,zmax]=zoomRange();
  if((tgtCamZ*f>zmax && f>1 && S.realScale) ||        // out of real scale -> compact
     (tgtCamZ*f<zmin && f<1 && !S.realScale)){        // deeper than compact -> real
    clickToggle('t-real');                            // remaps the camera, framing preserved
    S.camZ=tgtCamZ;                                   // never lerp across the boundary:
    [zmin,zmax]=zoomRange();                          // the two modes' units are unrelated
  }
  const before=tgtCamZ;
  tgtCamZ*=f;
  tgtCamZ=Math.max(zmin,Math.min(zmax,tgtCamZ));
  if(SURF.on){                                   // surface map: keep the geo point under the cursor
    const eff=tgtCamZ/before;
    surfPan(-(mx-cx)*(1-eff), -(my-cy)*(1-eff));
    return;
  }
  if(tgtCamZ<before && !FOLLOW){                 // zoom in → anchor on the cursor, not the centre (unless locked)
    const k=tgtCamZ/before;
    const x1=(mx-cx)*before/foc, y2=(cy-my)*before/foc;   // cursor on the focal plane (camera space)
    // camera->world needs the ROWS of the view rotation (camRight/camUp are its columns)
    const cyw=Math.cos(S.yaw), syw=Math.sin(S.yaw), cpp=Math.cos(S.pitch), spp=Math.sin(S.pitch);
    const Px=tgtCtr.x + cyw*x1     + spp*syw*y2;
    const Py=tgtCtr.y +              cpp*y2;
    const Pz=tgtCtr.z + syw*x1     - spp*cyw*y2;
    tgtCtr.x+=(Px-tgtCtr.x)*(1-k); tgtCtr.y+=(Py-tgtCtr.y)*(1-k); tgtCtr.z+=(Pz-tgtCtr.z)*(1-k);
  }
}
// CAD-style double-click / double-tap: focus the object under the cursor (planets: focus = lock)
function focusAt(x,y){
  if(SURF.on) return;
  const hit=pick(x,y)||gpuPick(x,y);
  if(!hit) return;
  if(hit===SUNHIT||hit===SUN){ focusSys=null; enterSolar(); return; }
  if(!hit.gpick) S.pinned=hit;
  if(hit.p&&hit._dx!==undefined){ focusSys=hit; focusSysW=objWorld(hit); flyTo(hit); return; }
  if(objWorld(hit)){ flyTo(hit); return; }
  const w=navWorld(hit);
  if(w){ aim(w[0],w[1],w[2], Math.min(tgtCamZ, scale(3e-6)));
    if(hit._e!==undefined){ FOLLOW=hit; lastInfo=undefined; } }
  dirty=true;
}
cv.addEventListener('dblclick',e=>{
  if(performance.now()-lastTapFocusT<500) return;   // touch path already handled this pair of taps
  focusAt(e.clientX,e.clientY);
});
cv.addEventListener('pointercancel',e=>{ ptrs.delete(e.pointerId); if(ptrs.size<2){pinching=false;pinchD=0;} dragging=false; });
cv.addEventListener('wheel',e=>{e.preventDefault();
  zoomAt(e.clientX,e.clientY,e.deltaY,e.deltaMode);
},{passive:false});
['pointerdown','pointermove','pointerup','wheel','keydown','keyup','click','input'].forEach(ev=>
  addEventListener(ev,()=>{dirty=true;},{capture:true,passive:true}));

// ---- controls ----
function syncToggle(id,on){
  if(UI.syncToggle){ UI.syncToggle(id,on); return; }
  const el=document.getElementById(id); if(el&&el.classList) el.classList.toggle('on',on);
}
const TOGGLE_REG={}, TOGGLE_ACT={};
function bindToggle(id,key,fn){ TOGGLE_REG[key]=id; TOGGLE_ACT[id]={key,fn}; }
function clickToggle(id){ const t=TOGGLE_ACT[id]; if(!t) return;
  S[t.key]=!S[t.key]; syncToggle(id,S[t.key]); if(t.fn)t.fn(); dirty=true; }
// set a toggle to an explicit value (presets + restored session state) — no-op if already there
function setToggle(id,on){ const t=TOGGLE_ACT[id]; if(!t) return; if(!!S[t.key]===!!on) return; clickToggle(id); }
api.setToggle=setToggle;
api.toggleIds=()=>Object.keys(TOGGLE_ACT);
api.readToggles=()=>{ const o={}; for(const id in TOGGLE_ACT) o[id]=!!S[TOGGLE_ACT[id].key]; return o; };
bindToggle('t-rot','autorot');
bindToggle('t-freelook','freelook');
bindToggle('t-hyg','hyg');
bindToggle('t-gpu','gpu');
bindToggle('t-gaia','gaia');
bindToggle('t-web','web');
bindToggle('t-ob','ob');
bindToggle('t-var','vars');
bindToggle('t-qso','qso');
bindToggle('t-edge','edge');
bindToggle('t-size','size');
bindToggle('t-veil','veil');
bindToggle('t-rings','rings');
bindToggle('t-gal','galaxies');
bindToggle('t-dso','dso');
bindToggle('t-mw3d','mw3d');
bindToggle('t-psr','psr');
bindToggle('t-oclu','oclu');
// real ↔ logarithmic scale — remap camera to keep the same physical framing
bindToggle('t-real','realScale',()=>{
  const wasReal=!S.realScale;                       // clickToggle already flipped S
  const inv=v=> wasReal ? v/REALK : Math.pow(10, v/KDEC + LOG0);
  // Convert the zoom TARGET as well as the current value. camZ lerps toward tgtCamZ, so
  // during a fast scroll they are far apart; converting only camZ (as this did) left
  // tgtCamZ in the old mode's units and threw the camera to the opposite end of the
  // scale — the "zoom suddenly goes somewhere else" symptom.
  const physCam=inv(S.camZ), physTgt=inv(tgtCamZ);
  const cm=Math.hypot(ctr.x,ctr.y,ctr.z), physCtr=cm>0?inv(cm):0;
  // clamp both ends: deep real zoom maps below the log-scale zero, and a compact camZ
  // near the ceiling maps above real's (camZ=0 or an out-of-range camZ breaks projection)
  const zr=zoomRange(), cl=v=>Math.max(zr[0],Math.min(zr[1],v));
  S.camZ=cl(scale(physCam)); tgtCamZ=cl(scale(physTgt));
  if(cm>0){ const nm=scale(physCtr)/cm; ctr.x*=nm;ctr.y*=nm;ctr.z*=nm;
    tgtCtr.x=ctr.x;tgtCtr.y=ctr.y;tgtCtr.z=ctr.z; }
  if(focusSys) focusSysW=objWorld(focusSys);
});
bindToggle('t-con','con');
bindToggle('t-hz','hz');
bindToggle('t-moons','moons');
bindToggle('t-ast','ast');
bindToggle('t-tno','tno');
bindToggle('t-probes','probes');
bindToggle('t-helio','helio');
bindToggle('t-belt','belt');
bindToggle('t-lag','lag');
bindToggle('t-lens','lens');
bindToggle('t-iso','iso');
bindToggle('t-eht','eht');
bindToggle('t-labels','labels');
bindToggle('t-radio','radio');
bindToggle('t-bubble','bubble');
bindToggle('t-grid','grid');
bindToggle('t-ggrid','ggrid');
bindToggle('t-cme','cme');
bindToggle('t-neo','neo');
bindToggle('t-sat','sat');
bindToggle('t-sun','sunAR');
bindToggle('t-met','met');
// proper motion: reveal a deep-time slider when enabled
const pmTime=document.getElementById('pmTime'), pmVal=document.getElementById('pmVal');
function setPmVal(){ const y=S.pmYears;
  pmVal.textContent = y===0?'today':(y>0?'+':'−')+Math.abs(y).toLocaleString('en-US')+' years';
  pmTime.style.setProperty('--pct',((y+50000)/100000*100)+'%'); }
bindToggle('t-pm','pm',()=>{
  const el=document.getElementById('hud-pm'); if(el) el.style.display=S.pm?'block':'none';
  if(!S.pm){ S.pmYears=0; pmTime.value=0; setPmVal(); }
});
pmTime.addEventListener('input',e=>{ S.pmYears=+e.target.value; setPmVal(); });
setPmVal();

// ---- navigation controls ----
document.getElementById('info').addEventListener('click',e=>{
  if(e.target.classList.contains('navset')){ navTarget=S.pinned||S.hover; showNav(true); }
  if(e.target.classList.contains('lockset')){ const b=S.pinned||S.hover;
    if(!b) return;
    if(FOLLOW===b) FOLLOW=null;
    else { const w=b===SUN?[0,0,0]:navWorld(b);
      if(w){ tgtCtr.x=w[0]; tgtCtr.y=w[1]; tgtCtr.z=w[2]; FOLLOW=b;
        S.autorot=false; syncToggle('t-rot',false); } }
    lastInfo=undefined; dirty=true; }
  if(e.target.classList.contains('transferset')){ const b=S.pinned||S.hover;
    if(!b) return;
    if(b.rk!==undefined && (b.k||b.kd)){               // solar-system body → Lambert transfer
      if(TRANSFER && TRANSFER.to===b){ TRANSFER=null; lastInfo=undefined; dirty=true; }
      else computeTransfer(b);
    } else {                                           // star / galaxy / anything else → 1g route
      if(ROUTE && ROUTE.o===b){ ROUTE=null; lastInfo=undefined; dirty=true; }
      else computeRoute(b);
    } }
});
document.getElementById('navClose').addEventListener('click',()=>showNav(false));
document.getElementById('navGo').addEventListener('click',()=>{
  if(!navTarget) return;
  if(navTarget.p&&navTarget._dx!==undefined){ focusSys=navTarget; focusSysW=objWorld(navTarget); }
  if(objWorld(navTarget)) flyTo(navTarget);
  else { const w=navWorld(navTarget); if(w) aim(w[0],w[1],w[2], scale(3e-6)); }
});
bindToggle('t-mw','mw',()=>{ const el=document.getElementById('hud-mwmap'); if(el) el.style.display=S.mw?'block':'none'; });

// top-down schematic of the Milky Way (spiral arms + bar + "you are here")
function drawMWMap(){
  const cv2=document.getElementById('mwmap'); if(!cv2) return;
  const W2=198,H2=150, cx2=W2/2, cy2=H2*0.54, Rd=68;
  cv2.width=W2*DPR; cv2.height=H2*DPR;
  const g=cv2.getContext('2d'); g.setTransform(DPR,0,0,DPR,0,0);
  g.clearRect(0,0,W2,H2);
  g.save(); g.translate(cx2,cy2); g.scale(1,0.62);            // slight top-down tilt
  g.fillStyle='rgba(90,110,175,0.07)'; g.beginPath(); g.arc(0,0,Rd,0,6.2832); g.fill();
  for(let a=0;a<4;a++){                                        // 4 logarithmic spiral arms
    g.beginPath();
    for(let i=0;i<=130;i++){ const th=i/130*3.7, r=7*Math.exp(0.24*th);
      if(r>Rd)break; const ang=th+a*Math.PI/2, x=Math.cos(ang)*r, y=Math.sin(ang)*r;
      if(i===0)g.moveTo(x,y);else g.lineTo(x,y); }
    g.strokeStyle='rgba(150,180,240,0.32)'; g.lineWidth=3.4; g.stroke();
  }
  g.rotate(0.5); g.fillStyle='rgba(255,222,150,0.5)';         // central bar
  g.beginPath(); g.ellipse(0,0,24,10,0,0,6.2832); g.fill(); g.restore();
  // Sgr A* (centre)
  g.beginPath(); g.arc(cx2,cy2,3,0,6.2832); g.fillStyle='#0a0a12'; g.fill();
  g.strokeStyle='rgba(255,205,130,0.95)'; g.lineWidth=1; g.stroke();
  g.font='9px ui-monospace,monospace'; g.fillStyle='rgba(255,205,150,0.9)'; g.fillText('Sgr A*', cx2+5, cy2-3);
  // Sun (~8 kpc out, in the Orion spur)
  const sr=Rd*0.52, sa=-0.85, sx=cx2+Math.cos(sa)*sr, sy=cy2+Math.sin(sa)*sr*0.62;
  g.beginPath(); g.arc(sx,sy,3,0,6.2832); g.fillStyle='#eafffb'; g.fill();
  g.fillStyle='rgba(233,237,250,0.9)'; g.fillText('Sun', sx+5, sy+3);
}
drawMWMap();

// the overview is only reachable in the compact view — real scale tops out at 6e7 pc,
// a thousandth of the way to the CMB shell
function goCosmos(){ if(S.realScale) clickToggle('t-real'); tgtCamZ=camCosmos(); }
document.getElementById('resetBtn').addEventListener('click',()=>{
  tgtYaw=0.5;tgtPitch=-0.35;S.focusStar=null;S.pinned=null;focusSys=null;
  tgtCtr.x=tgtCtr.y=tgtCtr.z=0;                    // back to the Sun
  goCosmos();                                      // overview: the whole universe
  S.autorot=false;syncToggle('t-rot',false);
});

// instrument colour switch + filter chips
function facColorToggle(){ S.facColor=!S.facColor; if(UI.facColor) UI.facColor(S.facColor); dirty=true; return S.facColor; }
{ const tf=document.getElementById('t-fac');
  if(tf&&tf.addEventListener) tf.addEventListener('click',e=>{ facColorToggle(); if(e.currentTarget.classList) e.currentTarget.classList.toggle('on',S.facColor); }); }
// fly into / out of the solar system — pure camera move along the unified scale
const solarBtn=document.getElementById('solarBtn');
function enterSolar(){ S.pinned=null; S.hover=null; tgtCamZ=camSolar(); tgtPitch=-0.5;
  tgtCtr.x=tgtCtr.y=tgtCtr.z=0; }
solarBtn.addEventListener('click',()=>{
  if(solarA>0.5){ goCosmos(); tgtPitch=-0.35;                  // fly back out
    tgtCtr.x=tgtCtr.y=tgtCtr.z=0; }
  else enterSolar();                                             // fly in
  S.pinned=null;
});
let _wasSolar=null;
function syncSolarBtn(){
  const inS=solarA>0.5;
  if(inS!==_wasSolar){ _wasSolar=inS;
    solarBtn.textContent=inS?'← Back to space':'☉ Into the solar system';
    solarBtn.classList.toggle('active',inS);
    document.getElementById('hud-time').style.display=inS?'none':'flex';
    document.getElementById('hud-soltime').style.display=inS?'flex':'none';
    if(inS) stopPlay(); else solStop();          // swap the two time controls
  }
}

const facCount={}; for(const s of STARS) facCount[s.fac]=(facCount[s.fac]||0)+1;
const facList=Object.keys(FAC).filter(k=>facCount[k]).sort((a,b)=>facCount[b]-facCount[a])
  .map(k=>({k, l:FAC[k].l, c:FAC[k].c, n:facCount[k]}));
function toggleFac(k){ if(S.facHidden.has(k)) S.facHidden.delete(k); else S.facHidden.add(k);
  dirty=true; return S.facHidden.has(k); }
if(UI.fac) UI.fac(facList);
const facEl=document.getElementById('facChips');
if(!UI.fac&&facEl&&facEl.appendChild) Object.keys(FAC).filter(k=>facCount[k]).sort((a,b)=>facCount[b]-facCount[a]).forEach(k=>{
  const f=FAC[k], div=document.createElement('div');
  div.className='chip'; div.dataset.k=k;
  div.innerHTML=`<span class="cdot" style="background:rgb(${f.c[0]},${f.c[1]},${f.c[2]})"></span>`+
    `<span>${f.l}</span><span class="cn">${facCount[k].toLocaleString('en-US')}</span>`;
  div.addEventListener('click',()=>{
    if(S.facHidden.has(k)){S.facHidden.delete(k);div.classList.remove('off');}
    else{S.facHidden.add(k);div.classList.add('off');}
  });
  facEl.appendChild(div);
});

// year slider
const yearEl=document.getElementById('year'), yrVal=document.getElementById('yrVal'),
  yrMeta=document.getElementById('yrMeta');
function setYear(y,fromInput){
  S.year=+y; yrVal.textContent=y; if(!fromInput)yearEl.value=y;
  const pct=((y-1992)/(2026-1992))*100;
  yearEl.style.setProperty('--pct',pct+'%');
  // cumulative counts
  let sys=0,pl=0;
  for(const s of STARS){ if(s.fy<=y&&s.fy!==0){sys++;} }
  for(const s of STARS) for(const p of s.p) if(p.y<=y&&p.y!==0) pl++;
  yrMeta.innerHTML=`${fmt(sys)} systems · ${fmt(pl)} planets<br>by end of ${y}`;
}
yearEl.addEventListener('input',e=>{setYear(e.target.value,true);stopPlay();});
setYear(2026);

// play
let playing=false,playAcc=0;
const playIcon=document.getElementById('playIcon');
function stopPlay(){playing=false;playIcon.innerHTML='<path d="M3 2l11 6L3 14z"/>';}
function startPlay(){
  if(S.year>=2026) setYear(1992);
  playing=true; playIcon.innerHTML='<path d="M3 2h4v12H3zM9 2h4v12H9z"/>';
}
document.getElementById('play').addEventListener('click',()=>{playing?stopPlay():startPlay();});

// search
let _lastMsg='';
const searchMsg={ set textContent(v){ _lastMsg=v; if(UI.msg) UI.msg(v);
    const el=document.getElementById('searchMsg'); if(el&&!UI.msg) el.textContent=v; },
  get textContent(){ return _lastMsg; } };
function doSearch(q){
  q=q.trim().toLowerCase(); if(!q){searchMsg.textContent='';return;}
  const eq=s=>s&&s.toLowerCase()===q, has=s=>s&&s.toLowerCase().includes(q);
  const cands=[];
  const push=(t,o)=>{ if(o) cands.push([t,o]); };
  // the galactic centre is a special object, not in any catalogue list
  if(/^(sgr ?a\*?|sagittarius a\*?|galactic cent(er|re))$/.test(q)){
    searchMsg.textContent='→ Sgr A* · galactic centre';
    if(!S.mw){S.mw=true;syncToggle('t-mw',true);}
    focusSys=null; S.pinned=SGRA; flyTo(SGRA); return; }
  // exact first
  push('iso', ISO.find(o=>eq(o.n)));
  push('small',SMALL.find(o=>eq(o.n)));
  push('dso', DSO.find(o=>eq(o.n)));
  push('hyg', HYG.find(s=>eq(s.n)));
  push('gal', GAL.find(g=>eq(g.n)||eq(g.id)));
  push('star',STARS.find(s=>eq(s.h)));
  push('body',SOLAR_BODIES.find(b=>eq(b.n))||(eq('sun')?SUN:null));
  push('probe',PROBES.find(p=>eq(p.n)));
  push('tno2',TNOS.find(t2=>eq(t2.n)));
  push('psr',PULSARS.find(o=>eq(o.n)));
  push('clu',CLUSTERS.find(c=>eq(c.n)));
  // substring fallback — ISO first: "borisov"/"atlas" should hit 2I/3I, not namesake comets
  push('iso', ISO.find(o=>has(o.n)));
  push('small',SMALL.find(o=>has(o.n)));
  push('dso', DSO.find(o=>has(o.n)));
  push('hyg', HYG.find(s=>has(s.n)));
  push('gal', GAL.find(g=>has(g.n)||has(g.id)));
  push('star',STARS.find(s=>s._search.includes(q)));
  push('body',SOLAR_BODIES.find(b=>has(b.n)));
  push('probe',PROBES.find(p=>has(p.n)));
  push('tno2',TNOS.find(t2=>has(t2.n)));
  push('psr',PULSARS.find(o=>has(o.n)));
  push('clu',CLUSTERS.find(c=>has(c.n)));
  if(!cands.length){searchMsg.textContent='nothing found';return;}
  const [t,o]=cands[0];
  if(t==='iso'){ searchMsg.textContent='→ '+o.n+' (interstellar)';
    if(!S.iso){S.iso=true;syncToggle('t-iso',true);} focusSys=null; enterSolar(); S.pinned=o; return; }
  if(t==='small'){ searchMsg.textContent='→ '+o.n+' ('+o.kind+')';
    if(!S.ast){S.ast=true;syncToggle('t-ast',true);} focusSys=null; enterSolar(); S.pinned=o; return; }
  if(t==='body'){ searchMsg.textContent='→ '+o.n+' ('+(o.kind||'')+')';
    focusSys=null; enterSolar(); S.pinned=o; return; }   // pin AFTER enterSolar — it clears the pin
  if(t==='probe'||t==='tno2'){ searchMsg.textContent='→ '+o.n+' ('+(o.kind||'')+')';
    if(t==='probe'&&!S.probes){S.probes=true;syncToggle('t-probes',true);}
    if(t==='tno2'&&!S.tno){S.tno=true;syncToggle('t-tno',true);}
    focusSys=null; enterSolar(); S.pinned=o; return; }
  if(t==='psr'||t==='clu'){ searchMsg.textContent='→ '+o.n+' · '+fmt(o.d*PC2LY)+' ly';
    if(t==='psr'&&!S.psr){S.psr=true;syncToggle('t-psr',true);}
    if(t==='clu'&&!S.oclu){S.oclu=true;syncToggle('t-oclu',true);}
    focusSys=null; S.pinned=o;
    const R=scale(o.d); aim(o._dir[0]*R,o._dir[1]*R,o._dir[2]*R, scale(o.d*0.25)); return; }
  if(t==='dso'){ searchMsg.textContent='→ '+o.n+' · '+fmt(o.d*PC2LY)+' ly';
    focusSys=null; S.pinned=o; if(!S.dso){S.dso=true;syncToggle('t-dso',true);}
    const R=scale(o.d); aim(o._dir[0]*R,o._dir[1]*R,o._dir[2]*R, scale(o.d*0.25)); }
  else if(t==='gal'){ searchMsg.textContent='→ '+o.n+' · '+fmt(o.mpc*3.2616)+' Mly'; focusOnGalaxy(o); }
  else if(t==='hyg'){ searchMsg.textContent='→ '+(o.n||'Stern')+' · '+fmt(o.d*PC2LY)+' ly'; focusOnHyg(o); }
  else { searchMsg.textContent='→ '+o.h+' · '+fmt(o.d*PC2LY)+' ly';
         if(o.fy>S.year&&o.fy!==0) setYear(o.fy); focusOn(o); }
}
function aim(x,y,z,margin){        // travel: move the view centre onto the target
  if(!isFinite(x+y+z+margin)) return;              // a NaN camera is a black screen
  FOLLOW=null;
  tgtCtr.x=x; tgtCtr.y=y; tgtCtr.z=z;
  tgtCamZ=Math.max(scale(3e-6), margin);
  S.autorot=false; syncToggle('t-rot',false);
}
// world position of a clickable cosmic object (null for solar bodies → handled by zoom)
function objWorld(o){
  // compute from direction × distance — the cached _x is only set once the layer
  // has drawn, which never happens while parked in the solar system (NaN camera)
  if((o.psr||o.oclu||o.gpick||o.sgra||o.dso)&&o._dir&&o.d!==undefined){
    const R=scale(o.d); return [o._dir[0]*R,o._dir[1]*R,o._dir[2]*R]; }
  if(o.sgra||o.dso) return [o._x,o._y,o._z];                     // Sgr A* / deep-sky (fallback)
  if(o.mpc!==undefined) return [o._x,o._y,o._z];                       // galaxy
  if(o.p && o._dx!==undefined){ const d=compress(o._r); return [o._dx*d,o._dy*d,o._dz*d]; } // exoplanet host
  if(o.m!==undefined && o.dx!==undefined){ const d=compress(o.d); return [o.dx*d,o.dy*d,o.dz*d]; } // HYG star
  return null;
}
function flyTo(o){
  const w=objWorld(o); if(!w) return;
  const physPc=invScale(Math.hypot(w[0],w[1],w[2]))||1;
  let m;
  if(o.p) m=S.realScale?scale(physPc*0.12):scale(3e-5);   // host: beside it (real) / into its system (log)
  else if(o.m!==undefined&&o.dx!==undefined) m=scale(physPc*0.2);   // field star
  else m=scale(physPc*0.25);                          // galaxy / DSO / Sgr A*
  aim(w[0],w[1],w[2],m);
}
function focusOn(s){                       // exoplanet host → fly in & open its system
  S.pinned=s; S.focusStar=s; focusSys=s; focusSysW=objWorld(s);
  aim(focusSysW[0],focusSysW[1],focusSysW[2], S.realScale?scale(s._r*0.12):scale(3e-5));
}
function focusOnGalaxy(g){
  if(!S.galaxies){S.galaxies=true;syncToggle('t-gal',true);}
  S.pinned=g; S.focusStar=null; focusSys=null;
  const R=scale(g.mpc*1e6);
  aim(g.dx*R,g.dy*R,g.dz*R, scale(g.mpc*1e6*0.25));
}
function focusOnHyg(s){
  if(!S.hyg){S.hyg=true;syncToggle('t-hyg',true);}
  S.pinned=s; S.focusStar=null; focusSys=null;
  const dr=compress(s.d); aim(s.dx*dr,s.dy*dr,s.dz*dr, scale(s.d*0.2));
}

// ---- solar-system time travel ----
const solTime=document.getElementById('solTime'), solDate=document.getElementById('solDate'),
      solIcon=document.getElementById('solIcon');
let solPlaying=false, solAcc=0;
function setSolDate(){ solDate.textContent=dateStr(solarJD());
  solTime.style.setProperty('--pct',((S.tOffsetDays+36525)/73050*100)+'%'); }
function solStop(){ solPlaying=false; solIcon.innerHTML='<path d="M3 2l11 6L3 14z"/>'; }
function solStart(){ if(S.tOffsetDays>=36525) {S.tOffsetDays=-36525;solTime.value=-36525;}
  solPlaying=true; solIcon.innerHTML='<path d="M3 2h4v12H3zM9 2h4v12H9z"/>'; }
solTime.addEventListener('input',e=>{ S.tOffsetDays=+e.target.value; setSolDate(); solStop(); });
document.getElementById('solPlay').addEventListener('click',()=>{ solPlaying?solStop():solStart(); });
document.getElementById('solNow').addEventListener('click',()=>{ S.tOffsetDays=0; solTime.value=0; setSolDate(); solStop(); });
setSolDate();

// ---- WebGL star-field renderer (GPU point cloud; auto-falls back to Canvas 2D) ----
// ---- WebGL 2 renderer: two vertex layouts share one logical point shader ----
//  · float layout (40 B/vtx): HYG stars, exoplanet hosts, pulsars, clusters
//  · raw layout (8 B/vtx): the binary catalogues (Gaia, belt, 2MRS, quasars, …)
//    upload their records byte-for-byte and are decoded in the vertex shader
const GL_UNI=`
uniform float u_yaw,u_pitch,u_camZ,u_foc,u_dpr,u_LOG0,u_KDEC,u_REALK,u_cull,u_minPx,u_alphaK,u_maxPt;
uniform vec3 u_ctr; uniform vec2 u_res; uniform bool u_real;
uniform vec4 u_lens; uniform float u_lensOn;   // xy: lens device px · z: Einstein radius px · w: lens depth
out vec3 v_color; out float v_alpha;
float scl(float pc){ if(u_real) return pc*u_REALK; return max(0.0,(log(pc)/2.302585093 - u_LOG0)*u_KDEC); }
`;
function glTail(host){ return `
  float R=scl(dist);
  vec3 p=dir*R - u_ctr;
  float c=cos(u_yaw), sy=sin(u_yaw);
  float x1=p.x*c + p.z*sy;
  float z1=-p.x*sy + p.z*c;
  float y1=p.y;
  float cp=cos(u_pitch), sp=sin(u_pitch);
  float y2=y1*cp - z1*sp;
  float z2=y1*sp + z1*cp;
  float depth=u_camZ - z2;
  float focCss=u_foc/u_dpr;
  float bright=max(0.0, 6.8 - mg);
  float sizeCss;
  ${host?`if(u_hostMode>0.5) sizeCss=min(20.0, max(0.7, focCss*0.0075/depth*rs));
  else `:''}sizeCss=clamp((0.4+bright*0.34)*focCss*0.0032/depth, 0.0, 3.6);
  float nearP=u_real?u_camZ*0.02:0.05; if(depth<=nearP || sizeCss<u_cull){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
  float px=max(sizeCss, u_minPx);
  ${host?`if(u_glow>0.5){
    if(mg>2.6){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    px=min(sizeCss*6.0, 26.0);                           // soft halo for the brightest stars
  }`:''}
  float dvx=u_res.x*0.5 + u_foc*x1/depth;
  float dvy=u_res.y*0.5 - u_foc*y2/depth;
  if(u_lensOn>0.5 && depth>u_lens.w){            // gravitational lens: sources behind
    vec2 lv=vec2(dvx,dvy)-u_lens.xy;             // Sgr A* deflect outward (point-mass
    float lr=max(length(lv),1e-3);               // lens equation, exaggerated scale)
    float lm=0.5*(lr+sqrt(lr*lr+4.0*u_lens.z*u_lens.z))/lr;
    dvx=u_lens.x+lv.x*lm; dvy=u_lens.y+lv.y*lm;
  }
  gl_Position=vec4(dvx/u_res.x*2.0-1.0, 1.0-dvy/u_res.y*2.0, 0.0, 1.0);
  gl_PointSize=min(px*u_dpr, u_maxPt);
  v_color=col;
  ${host?`if(u_hostMode>0.5){
    float av=clamp(1.9-depth*0.55, 0.12, 1.0);
    if(u_veil>0.5 && dist>u_bnd){                        // red veil beyond the charted edge
      float t=min(1.0,(dist-u_bnd)/(u_bnd*1.6));
      v_color=mix(v_color, vec3(0.9098,0.2275,0.1961), t*0.85); av*=(1.0-t*0.4);
    }
    if(a_pm.y>0.5 && abs(a_pm.y-u_year)<0.5){ v_color=vec3(0.3098,0.8392,0.7843); av=1.0; }
    v_alpha=av;
  } else {`:'{'}
    float fade=clamp(1.9-depth*0.4, 0.22, 1.0);
    v_alpha=clamp((0.28+bright*0.12)*fade, 0.0, 1.0);
    if(u_minPx>0.0) v_alpha=max(v_alpha, 0.17);          // Gaia: keep faint dwarfs visible
  }
  ${host?`if(u_glow>0.5) v_alpha*=0.05;`:''}
  v_alpha*=u_alphaK;
`;}
const GL_VSF=`#version 300 es
precision highp float;
in vec3 a_dir; in float a_dist; in float a_mag; in vec3 a_color; in vec2 a_pm;
${GL_UNI}
uniform float u_pmYears,u_hostMode,u_year,u_facColor,u_sizeOn,u_veil,u_bnd,u_glow;
uniform float u_facVis[8]; uniform vec3 u_pal[8];
void main(){
  vec3 dir=a_dir;
  if(u_pmYears!=0.0 && u_hostMode<0.5){
    float cd=max(1e-6, length(a_dir.xy));
    float mas=3.14159265/(180.0*3600.0*1000.0);
    float tE=a_pm.x*u_pmYears*mas, tN=a_pm.y*u_pmYears*mas;
    vec3 east=vec3(-a_dir.y/cd, a_dir.x/cd, 0.0);
    vec3 north=vec3(-a_dir.z*a_dir.x/cd, -a_dir.z*a_dir.y/cd, cd);
    dir=normalize(a_dir + east*tE + north*tN);
  }
  vec3 col=a_color; float rs=1.0;
  if(u_hostMode>0.5){
    float fy=a_pm.y;                                     // discovery-year filter on the GPU
    if(fy>u_year+0.5 && fy>0.5){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    int ci=int(a_pm.x+0.5);                              // facility category
    if(u_facVis[ci]<0.5){ gl_Position=vec4(2.0,0.0,0.0,1.0); gl_PointSize=0.0; return; }
    if(u_facColor>0.5) col=u_pal[ci];
    if(u_sizeOn>0.5) rs=a_mag;                           // a_mag carries radiusScale for hosts
  }
  float dist=a_dist, mg=a_mag;
  ${glTail(true)}
}`;
const GL_VSU=`#version 300 es
precision highp float;
in uvec4 a_rec;                                          // one raw 8-byte catalogue record
${GL_UNI}
uniform float u_decDist,u_colMode,u_isBelt,u_beltDt;
uniform vec2 u_decMag; uniform vec3 u_colFix; uniform vec3 u_decPal[4];
vec3 gaiaCol(float bprp){                                // bp_rp -> Teff (Ballesteros) -> colour
  float t=4600.0*(1.0/(0.92*bprp+1.7)+1.0/(0.92*bprp+0.62));
  if(t>=30000.0) return vec3(0.608,0.690,1.0);
  if(t>=10000.0) return vec3(0.667,0.749,1.0);
  if(t>=7500.0)  return vec3(0.792,0.843,1.0);
  if(t>=6000.0)  return vec3(0.973,0.969,1.0);
  if(t>=5200.0)  return vec3(1.0,0.957,0.910);
  if(t>=3700.0)  return vec3(1.0,0.824,0.631);
  return vec3(1.0,0.710,0.424);
}
void main(){
  float D2R=0.017453292519943295;
  float rr=float(a_rec.x)*(360.0/65535.0)*D2R;
  float dr=(float(a_rec.y)*(180.0/65535.0)-90.0)*D2R;
  float u=float(a_rec.z)*(1.0/65535.0);
  float b6=float(a_rec.w & 255u), b7=float(a_rec.w >> 8);
  float cd=cos(dr);
  vec3 dir=vec3(cd*cos(rr), cd*sin(rr), sin(dr));
  float dist=u*u_decDist;
  float mg=(b6/255.0)*u_decMag.x + u_decMag.y;
  vec3 col = u_colMode<0.5 ? u_colFix
           : u_colMode<1.5 ? gaiaCol((b7/255.0)*6.0-1.0)
           : u_decPal[int(min(b7,3.0))];
  if(u_isBelt>0.5 && u_beltDt!=0.0){
    // approximate Kepler drift: circular mean motion at the body's heliocentric distance
    float rAU=max(0.05, dist/0.0000048481368);
    float ang=0.0172021242/pow(rAU,1.5)*u_beltDt;
    float ca=cos(ang), sa=sin(ang);
    dir=vec3(dir.x*ca - dir.z*sa, dir.y, dir.x*sa + dir.z*ca);   // world y = ecliptic pole
  }
  ${glTail(false)}
}`;
const GL_FSP=`#version 300 es
precision mediump float;
in vec3 v_color; in float v_alpha;
out vec4 o;
void main(){
  float r=length(gl_PointCoord-vec2(0.5));
  if(r>0.5) discard;
  float a=v_alpha*smoothstep(0.5,0.12,r);
  o=vec4(v_color*a, a);                                  // premultiplied additive (ONE, ONE)
}`;
const TM_VS=`#version 300 es
void main(){                                             // fullscreen triangle from gl_VertexID
  vec2 p=vec2(float((gl_VertexID<<1)&2), float(gl_VertexID&2));
  gl_Position=vec4(p*2.0-1.0, 0.0, 1.0);
}`;
const TM_FS=`#version 300 es
precision mediump float;
uniform sampler2D u_tex; out vec4 o;
void main(){                                             // soft shoulder above 0.55: dense star
  vec3 x=texelFetch(u_tex, ivec2(gl_FragCoord.xy), 0).rgb;   // fields roll off instead of clipping
  vec3 hi=vec3(0.55) + 0.45*(1.0-exp(-(x-vec3(0.55))/0.45));
  o=vec4(mix(x, hi, step(vec3(0.55), x)), 1.0);
}`;
function glCompile(gl,type,src){ const sh=gl.createShader(type); gl.shaderSource(sh,src); gl.compileShader(sh);
  if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)){ try{console.error('shader:',gl.getShaderInfoLog(sh));}catch(_){} return null; } return sh; }
function mkProg(gl,vsSrc,fsSrc){
  const vs=glCompile(gl,gl.VERTEX_SHADER,vsSrc), fs=glCompile(gl,gl.FRAGMENT_SHADER,fsSrc);
  if(!vs||!fs) return null;
  const p=gl.createProgram(); gl.attachShader(p,vs); gl.attachShader(p,fs); gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)){ try{console.error('link:',gl.getProgramInfoLog(p));}catch(_){} return null; }
  const o={p,loc:{},attr:{}};
  const nu=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);
  for(let i=0;i<nu;i++){ const u=gl.getActiveUniform(p,i);
    o.loc[u.name.replace(/\[0\]$/,'')]=gl.getUniformLocation(p,u.name); }
  const na=gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);
  for(let i=0;i<na;i++){ const a=gl.getActiveAttrib(p,i); o.attr[a.name]=gl.getAttribLocation(p,a.name); }
  return o;
}
function mkFloatVAO(gl,arr){                             // 40-byte-stride float layout
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf); gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const A=progF.attr;
  gl.enableVertexAttribArray(A.a_dir);   gl.vertexAttribPointer(A.a_dir,3,gl.FLOAT,false,40,0);
  gl.enableVertexAttribArray(A.a_dist);  gl.vertexAttribPointer(A.a_dist,1,gl.FLOAT,false,40,12);
  gl.enableVertexAttribArray(A.a_mag);   gl.vertexAttribPointer(A.a_mag,1,gl.FLOAT,false,40,16);
  gl.enableVertexAttribArray(A.a_color); gl.vertexAttribPointer(A.a_color,3,gl.FLOAT,false,40,20);
  gl.enableVertexAttribArray(A.a_pm);    gl.vertexAttribPointer(A.a_pm,2,gl.FLOAT,false,40,32);
  gl.bindVertexArray(null);
  return {vao, n:arr.length/10};
}
function initGL(){
  try{
    glcv=document.getElementById('gl'); if(!glcv) return;
    const gl=glcv.getContext('webgl2',{alpha:false,antialias:false,depth:false,stencil:false,
      powerPreference:'high-performance'});
    if(!gl) return;                                      // no WebGL 2 -> Canvas-2D star renderer
    GL=gl;
    if(!glcv.__loss){ glcv.__loss=1;                     // recover from GPU resets / evicted contexts
      glcv.addEventListener('webglcontextlost',e=>{ e.preventDefault(); glOK=false; dirty=true; });
      glcv.addEventListener('webglcontextrestored',()=>{ initGL(); glRestoreClouds(); dirty=true; });
    }
    progF=mkProg(gl,GL_VSF,GL_FSP); progU=mkProg(gl,GL_VSU,GL_FSP); progT=mkProg(gl,TM_VS,TM_FS);
    if(!progF||!progU) return;
    glMaxPt=(gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)||[1,64])[1]||64;
    // HDR accumulation: star fields add up in half-float and get tonemapped, so
    // dense cores saturate softly instead of clipping to flat white
    hdrOK=false;
    if(progT && gl.getExtension('EXT_color_buffer_float')){
      hdrTex=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,hdrTex);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA16F,4,4,0,gl.RGBA,gl.HALF_FLOAT,null);
      hdrFB=gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER,hdrFB);
      gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,hdrTex,0);
      hdrOK=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      if(progT.loc.u_tex){ gl.useProgram(progT.p); gl.uniform1i(progT.loc.u_tex,0); }
    }
    // HYG stars (float layout)
    const arr=new Float32Array(HYG.length*10);
    for(let i=0;i<HYG.length;i++){ const st=HYG[i],o=i*10;
      arr[o]=st.dx;arr[o+1]=st.dy;arr[o+2]=st.dz;arr[o+3]=st.d;arr[o+4]=st.m;
      arr[o+5]=st.c[0]/255;arr[o+6]=st.c[1]/255;arr[o+7]=st.c[2]/255;arr[o+8]=st.pr||0;arr[o+9]=st.pd||0; }
    glBuf=mkFloatVAO(gl,arr);
    // exoplanet hosts — year filter & facility colours run in the shader
    const FACIDX={kepler:0,tess:1,k2:2,rv:3,micro:4,imaging:5,ground:6,other:7};
    const ha=new Float32Array(STARS.length*10);
    for(let i=0;i<STARS.length;i++){ const st2=STARS[i],o=i*10;
      const sr2=st2._sr!==undefined?st2._sr:starRadius(st2);
      ha[o]=st2._dx; ha[o+1]=st2._dy; ha[o+2]=st2._dz; ha[o+3]=st2._r;
      ha[o+4]=sr2?Math.max(0.30,Math.min(4.2,Math.pow(sr2,0.7))):1;   // same curve as radiusScale()
      ha[o+5]=st2._col[0]/255; ha[o+6]=st2._col[1]/255; ha[o+7]=st2._col[2]/255;
      ha[o+8]=FACIDX[st2.fac]!==undefined?FACIDX[st2.fac]:7; ha[o+9]=st2.fy||0; }
    glBufH=mkFloatVAO(gl,ha);
    // pulsars & open clusters as simple GPU point clouds
    const mkPts=(list,mag,cFn)=>{ const a2=new Float32Array(list.length*10);
      for(let i=0;i<list.length;i++){ const q=list[i],o=i*10,c=cFn(q);
        a2[o]=q._dir[0]; a2[o+1]=q._dir[1]; a2[o+2]=q._dir[2]; a2[o+3]=q.d; a2[o+4]=mag;
        a2[o+5]=c[0]/255; a2[o+6]=c[1]/255; a2[o+7]=c[2]/255; a2[o+8]=0; a2[o+9]=0; }
      return mkFloatVAO(gl,a2); };
    glBufP=mkPts(PULSARS,4.6,()=>[150,220,255]);
    glBufC=mkPts(CLUSTERS,4.2,q=>CLU_T[q.ct||0].c);
    gl.useProgram(progF.p);
    const pal=[]; for(const k of ['kepler','tess','k2','rv','micro','imaging','ground','other']){ const c3=FAC[k].c; pal.push(c3[0]/255,c3[1]/255,c3[2]/255); }
    gl.uniform3fv(progF.loc.u_pal,pal);
    gl.clearColor(0.027,0.035,0.070,1.0);
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE);    // premultiplied additive
    glOK=true; glResize();
  }catch(e){ glOK=false; }
}
function glResize(){
  if(!glOK||!glcv) return;
  const raw=devicePixelRatio||1, px=(exactPx&&raw<=2.02)?exactPx:null;
  glcv.width=px?px[0]:Math.round(W*Math.min(raw,2));
  glcv.height=px?px[1]:Math.round(H*Math.min(raw,2));
  glcv.style.width=W+'px'; glcv.style.height=H+'px';
  GLDPR=glcv.width/W;
  GL.viewport(0,0,glcv.width,glcv.height);
  if(hdrOK){ GL.bindTexture(GL.TEXTURE_2D,hdrTex);      // resize the HDR target with the canvas
    GL.texImage2D(GL.TEXTURE_2D,0,GL.RGBA16F,glcv.width,glcv.height,0,GL.RGBA,GL.HALF_FLOAT,null); }
  dirty=true;
}
function glClearCanvas(){ if(!glOK) return;             // GPU layer off -> blank the GL canvas
  GL.bindFramebuffer(GL.FRAMEBUFFER,null); GL.clear(GL.COLOR_BUFFER_BIT); }
function glStars(){ return glOK && S.gpu; }
// ---- binary catalogue layers: raw 8-byte records, decoded in the vertex shader ----
const BELT_COL=[[176,166,148],[160,148,172],[255,150,120],[140,172,224]];  // MBA·Trojan·NEO·TNO
const VAR_COL=[[255,214,120],[200,160,255]];                               // Cepheid gold · RR Lyrae violet
const CLOUD_DEC={                    // dist: pc per unit u16 · mag: [scale,offset] on byte 6 ·
  gaia:   {dist:100,            mag:[28,-2],   mode:1},                    // mode: 0 fixed colour,
  gaiabig:{dist:150,            mag:[28,-2],   mode:1},                    // 1 gaiaCol(byte 7),
  belt:   {dist:120*4.84814e-6, mag:[0,5.6],   mode:2, pal:BELT_COL, belt:1}, // 2 palette[byte 7]
  vars:   {dist:20000,          mag:[0,5.0],   mode:2, pal:VAR_COL},
  ob:     {dist:4000,           mag:[0,5.2],   mode:0, fix:[168,205,255]},
  web:    {dist:600e6,          mag:[16,-5.2], mode:0, fix:[190,200,228]},
  qso:    {dist:13000e6,        mag:[0,5.0],   mode:0, fix:[212,150,255]},
};
function buildCloudBuf(bytes,key){   // raw bytes -> GPU verbatim (uvec4 attribute, stride 8)
  if(!glOK||!bytes||bytes.length<8) return null;
  const gl=GL, n=(bytes.length/8)|0;
  const buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,bytes,gl.STATIC_DRAW);
  const vao=gl.createVertexArray(); gl.bindVertexArray(vao);
  const a=progU.attr.a_rec;
  gl.enableVertexAttribArray(a); gl.vertexAttribIPointer(a,4,gl.UNSIGNED_SHORT,8,0);
  gl.bindVertexArray(null);
  dirty=true; return {vao,n,key};
}
function cloudLabel(id,txt){ if(UI.setLabel){ UI.setLabel(id,txt); return; }
  const el=document.getElementById(id); if(el&&el.querySelector) el.querySelector('span').textContent=txt; }
function buildGaia(bytes){ const r=buildCloudBuf(bytes,'gaia'); if(!r) return;
  CL.G=r; gaiaRaw=bytes; gaiaRange=100;
  cloudLabel('t-gaia','Gaia stars ('+(r.n>=1000?((r.n/1000)|0)+'k':r.n)+' <100 pc)'); }
function buildGaiaBig(bytes){ const r=buildCloudBuf(bytes,'gaiabig'); if(!r) return;
  CL.G=r; gaiaRaw=bytes; gaiaRange=150;
  cloudLabel('t-gaia','Gaia stars ('+(r.n/1e6).toFixed(1)+'M <150 pc)'); }
function buildBelt(bytes){
  if(!bytes||bytes.length<16) return;
  beltEpoch=new DataView(bytes.buffer,bytes.byteOffset,8).getFloat64(0,true)||0;
  bytes=bytes.subarray(8);
  const r=buildCloudBuf(bytes,'belt'); if(!r) return;
  CL.B=r; beltRaw=bytes;
  cloudLabel('t-belt','Asteroid field ('+((r.n/1000)|0)+'k)'); }
function buildVars(bytes){ const r=buildCloudBuf(bytes,'vars'); if(!r) return; CL.V=r; varRaw=bytes;
  cloudLabel('t-var','Variable stars ('+((r.n/1000)|0)+'k Cepheids·RR Lyr)'); }
function buildOB(bytes){ const r=buildCloudBuf(bytes,'ob'); if(!r) return; CL.O=r; obRaw=bytes;
  cloudLabel('t-ob','OB stars ('+((r.n/1000)|0)+'k arm tracers)'); }
function buildWeb(bytes){ const r=buildCloudBuf(bytes,'web'); if(!r) return; CL.W=r; webRaw=bytes;
  cloudLabel('t-web','Cosmic web ('+((r.n/1000)|0)+'k galaxies)'); }
function buildQso(bytes){ if(bytes && CL.Q && (bytes.length/8)<=CL.Q.n) return;
  const r=buildCloudBuf(bytes,'qso'); if(!r) return; CL.Q=r; qsoRaw=bytes;
  cloudLabel('t-qso','Quasars ('+((r.n/1000)|0)+'k)'); }
function glRestoreClouds(){          // re-upload retained raw bytes after a context restore
  if(!glOK) return;
  if(gaiaRaw){ const r=buildCloudBuf(gaiaRaw,gaiaRange>100?'gaiabig':'gaia'); if(r) CL.G=r; }
  if(beltRaw){ const r=buildCloudBuf(beltRaw,'belt'); if(r) CL.B=r; }
  if(webRaw){ const r=buildCloudBuf(webRaw,'web'); if(r) CL.W=r; }
  if(qsoRaw){ const r=buildCloudBuf(qsoRaw,'qso'); if(r) CL.Q=r; }
  if(obRaw){ const r=buildCloudBuf(obRaw,'ob'); if(r) CL.O=r; }
  if(varRaw){ const r=buildCloudBuf(varRaw,'vars'); if(r) CL.V=r; }
}
function loadExtragal(){
  if(!glOK) return;
  try{
    if(typeof window.__WEB_B64__==='string' && window.__WEB_B64__.length){ buildWeb(b64ToBytes(window.__WEB_B64__)); window.__WEB_B64__=null; }
    else fetch('data/cosmicweb.bin').then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildWeb(new Uint8Array(a)); }).catch(()=>{});
    if(typeof window.__QSO_B64__==='string' && window.__QSO_B64__.length){ buildQso(b64ToBytes(window.__QSO_B64__)); window.__QSO_B64__=null; }
    else fetch('data/quasars.bin').then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildQso(new Uint8Array(a)); }).catch(()=>{});
    fetch('data/quasarsbig.bin').then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildQso(new Uint8Array(a)); }).catch(()=>{});
    if(typeof window.__BELT_B64__==='string' && window.__BELT_B64__.length){ buildBelt(b64ToBytes(window.__BELT_B64__)); window.__BELT_B64__=null; }
    else fetch('data/belt.bin').then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildBelt(new Uint8Array(a)); }).catch(()=>{});
    fetch('data/gaiabig.bin').then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildGaiaBig(new Uint8Array(a)); }).catch(()=>{});
    if(typeof window.__OB_B64__==='string' && window.__OB_B64__.length){ buildOB(b64ToBytes(window.__OB_B64__)); window.__OB_B64__=null; }
    else fetch('data/obstars.bin').then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildOB(new Uint8Array(a)); }).catch(()=>{});
    if(typeof window.__VAR_B64__==='string' && window.__VAR_B64__.length){ buildVars(b64ToBytes(window.__VAR_B64__)); window.__VAR_B64__=null; }
    else fetch('data/variables.bin').then(r=>r.ok?r.arrayBuffer():null).then(a=>{ if(a) buildVars(new Uint8Array(a)); }).catch(()=>{});
  }catch(e){}
}
function b64ToBytes(b64){ const bin=atob(b64), len=bin.length, u=new Uint8Array(len);
  for(let i=0;i<len;i++) u[i]=bin.charCodeAt(i); return u; }
function loadGaia(){
  if(!glOK) return;
  try{
    if(typeof window.__GAIA_B64__==='string' && window.__GAIA_B64__.length){
      buildGaia(b64ToBytes(window.__GAIA_B64__)); window.__GAIA_B64__=null; return; }
    fetch('data/gaia.bin').then(r=>r.ok?r.arrayBuffer():null)
      .then(a=>{ if(a) buildGaia(new Uint8Array(a)); }).catch(()=>{});
  }catch(e){}
}
function glShared(L){                // per-frame camera/scale uniforms, per program
  const gl=GL, foc=Math.min(W,H)*0.62;
  gl.uniform1f(L.u_yaw,S.yaw); gl.uniform1f(L.u_pitch,S.pitch); gl.uniform1f(L.u_camZ,S.camZ);
  gl.uniform1f(L.u_foc,foc*GLDPR); gl.uniform1f(L.u_dpr,GLDPR);
  gl.uniform1f(L.u_LOG0,LOG0); gl.uniform1f(L.u_KDEC,KDEC); gl.uniform1f(L.u_REALK,REALK);
  gl.uniform3f(L.u_ctr,ctr.x,ctr.y,ctr.z);
  gl.uniform2f(L.u_res,glcv.width,glcv.height);
  gl.uniform1i(L.u_real,S.realScale?1:0);
  gl.uniform1f(L.u_maxPt,glMaxPt); gl.uniform1f(L.u_alphaK,1);
  if(lensPar && L.u_lensOn){ gl.uniform1f(L.u_lensOn,1);
    gl.uniform4f(L.u_lens, lensPar.x*GLDPR, lensPar.y*GLDPR, lensPar.e*GLDPR, lensPar.depth); }
  else if(L.u_lensOn) gl.uniform1f(L.u_lensOn,0);
}
function drawCloud(h,cull,minPx,alphaK,beltDt){
  const gl=GL, L=progU.loc, d=CLOUD_DEC[h.key];
  gl.uniform1f(L.u_cull,cull); gl.uniform1f(L.u_minPx,minPx); gl.uniform1f(L.u_alphaK,alphaK||1);
  gl.uniform1f(L.u_decDist,d.dist); gl.uniform2f(L.u_decMag,d.mag[0],d.mag[1]);
  gl.uniform1f(L.u_colMode,d.mode);
  if(d.fix) gl.uniform3f(L.u_colFix,d.fix[0]/255,d.fix[1]/255,d.fix[2]/255);
  if(d.pal){ const pa=[]; for(let i=0;i<4;i++){ const c=d.pal[i]||d.pal[0]; pa.push(c[0]/255,c[1]/255,c[2]/255); }
    gl.uniform3fv(L.u_decPal,pa); }
  gl.uniform1f(L.u_isBelt,d.belt?1:0); gl.uniform1f(L.u_beltDt,d.belt?(beltDt||0):0);
  gl.bindVertexArray(h.vao); gl.drawArrays(gl.POINTS,0,h.n);
}
function glRender(){
  const gl=GL;
  if(hdrOK) gl.bindFramebuffer(gl.FRAMEBUFFER,hdrFB);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // raw-byte catalogue layers (decoded in the vertex shader)
  gl.useProgram(progU.p); glShared(progU.loc);
  if(solarA<0.5){
    if(CL.W && S.web) drawCloud(CL.W,0.05,1.1);
    if(CL.Q && S.qso) drawCloud(CL.Q,0.05,1.15);
  }
  if(CL.B && S.belt && solarA>0.05)
    drawCloud(CL.B,0.03,1.05,1, beltEpoch?(solarJD()-beltEpoch):0);
  if(CL.G && S.gaia) drawCloud(CL.G,0.12,1.2, hdrOK?1:0.85);   // HDR tames the dense core itself
  if(solarA<0.5 && sysA<0.5){
    if(CL.O && S.ob) drawCloud(CL.O,0.05,1.0,0.8);
    if(CL.V && S.vars) drawCloud(CL.V,0.05,1.0);
  }
  // float layers: exoplanet hosts (year + facility filters on the GPU), pulsars,
  // open clusters (cosmos view only, matching the 2D gate), HYG stars + halo
  const L=progF.loc;
  gl.useProgram(progF.p); glShared(L);
  gl.uniform1f(L.u_pmYears,(S.pm?S.pmYears:0));
  gl.uniform1f(L.u_hostMode,0); gl.uniform1f(L.u_glow,0);
  if(glBufH){
    gl.uniform1f(L.u_hostMode,1); gl.uniform1f(L.u_year,S.year);
    gl.uniform1f(L.u_facColor,S.facColor?1:0); gl.uniform1f(L.u_sizeOn,S.size?1:0);
    gl.uniform1f(L.u_veil,S.veil?1:0); gl.uniform1f(L.u_bnd,BND);
    const fv=[]; for(const k of ['kepler','tess','k2','rv','micro','imaging','ground','other']) fv.push(S.facHidden.has(k)?0:1);
    gl.uniform1fv(L.u_facVis,fv);
    gl.uniform1f(L.u_cull,0.0); gl.uniform1f(L.u_minPx,0.0);
    gl.bindVertexArray(glBufH.vao); gl.drawArrays(gl.POINTS,0,glBufH.n);
    gl.uniform1f(L.u_hostMode,0);
  }
  if(solarA<0.5 && sysA<0.5){
    gl.uniform1f(L.u_cull,0.05); gl.uniform1f(L.u_minPx,1.0);
    if(glBufP && S.psr){ gl.bindVertexArray(glBufP.vao); gl.drawArrays(gl.POINTS,0,glBufP.n); }
    if(glBufC && S.oclu){ gl.bindVertexArray(glBufC.vao); gl.drawArrays(gl.POINTS,0,glBufC.n); }
  }
  gl.uniform1f(L.u_cull,0.34); gl.uniform1f(L.u_minPx,0.0);
  if(S.hyg && glBuf){ gl.bindVertexArray(glBuf.vao);
    gl.drawArrays(gl.POINTS,0,glBuf.n);
    gl.uniform1f(L.u_glow,1);                            // bright-star halo pass
    gl.drawArrays(gl.POINTS,0,glBuf.n);
    gl.uniform1f(L.u_glow,0); }
  gl.bindVertexArray(null);
  if(hdrOK){                                             // tonemap HDR accumulation -> canvas
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.disable(gl.BLEND);
    gl.useProgram(progT.p);
    gl.bindTexture(gl.TEXTURE_2D,hdrTex);
    gl.drawArrays(gl.TRIANGLES,0,3);
    gl.enable(gl.BLEND);
  }
}

// ---- loop ----
let last=0, lastGw=0;
function frame(t){
  const dt=Math.min(0.05,(t-last)/1000||0); last=t;
  if(FOLLOW){                            // locked body → view centre tracks it every frame
    const w=FOLLOW===SUN?[0,0,0]:navWorld(FOLLOW);
    if(w){ tgtCtr.x=w[0]; tgtCtr.y=w[1]; tgtCtr.z=w[2]; } else FOLLOW=null;
  }
  if(S.autorot&&!dragging) tgtYaw+=dt*0.10;
  if(playing){
    playAcc+=dt;
    if(playAcc>0.42){ playAcc=0;
      if(S.year<2026) setYear(S.year+1); else stopPlay();
    }
  }
  if(solPlaying){                       // run the planets along their orbits (~1 yr/sec)
    S.tOffsetDays+=dt*365;
    if(S.tOffsetDays>36525){ S.tOffsetDays=36525; solStop(); }
    solTime.value=S.tOffsetDays; setSolDate();
  }
  // free-flight thrust (WASD / arrows, R·F up·down) — step scales with zoom level
  if(keys.size){
    if(S.realScale) flySpeed=Math.min(flySpeed*1.06+0.06,150); else flySpeed=1;
    const step=(S.realScale?S.camZ*flySpeed:Math.max(S.camZ,camDist))*0.06; let mx=0,my=0,mz=0;
    if(keys.has('w')){mx+=camFwd[0];my+=camFwd[1];mz+=camFwd[2];}
    if(keys.has('s')){mx-=camFwd[0];my-=camFwd[1];mz-=camFwd[2];}
    if(keys.has('d')){mx+=camRight[0];my+=camRight[1];mz+=camRight[2];}
    if(keys.has('a')){mx-=camRight[0];my-=camRight[1];mz-=camRight[2];}
    if(keys.has('r')){mx+=camUp[0];my+=camUp[1];mz+=camUp[2];}
    if(keys.has('f')){mx-=camUp[0];my-=camUp[1];mz-=camUp[2];}
    tgtCtr.x+=mx*step; tgtCtr.y+=my*step; tgtCtr.z+=mz*step;
    S.autorot=false; S.pinned=null; FOLLOW=null;
  } else flySpeed=1;
  // GW ripples: keep animating at ~14 fps while a GW event is on screen
  if(gwOnScreen && t-lastGw>70){ lastGw=t; dirty=true; }
  // render only when the view is changing or something is dirty (idle → ~0 CPU)
  const cs=Math.abs(ctr.x)+Math.abs(ctr.y)+Math.abs(ctr.z)+1;
  const anim=(S.autorot&&!dragging)||dragging||playing||solPlaying||keys.size>0
    ||Math.abs(tgtYaw-S.yaw)>1e-4||Math.abs(tgtPitch-S.pitch)>1e-4
    ||Math.abs(tgtCamZ-S.camZ)>S.camZ*2e-4+1e-12
    ||(Math.abs(tgtCtr.x-ctr.x)+Math.abs(tgtCtr.y-ctr.y)+Math.abs(tgtCtr.z-ctr.z))>cs*1e-5;
  if(dirty||anim){
    ctr.x+=(tgtCtr.x-ctr.x)*0.18; ctr.y+=(tgtCtr.y-ctr.y)*0.18; ctr.z+=(tgtCtr.z-ctr.z)*0.18;
    S.yaw+=(tgtYaw-S.yaw)*0.12; S.pitch+=(tgtPitch-S.pitch)*0.12;
    // Zoom eases GEOMETRICALLY. The additive lerp moved a fixed fraction of the absolute
    // gap, which over a range spanning 22 orders of magnitude meant the last decades
    // crawled — a hard scroll took hundreds of frames to land. A constant ratio per frame
    // covers each decade in the same time, which is also how a log zoom should feel.
    S.camZ = (S.camZ>0 && tgtCamZ>0) ? S.camZ*Math.pow(tgtCamZ/S.camZ, 0.12)
                                     : S.camZ+(tgtCamZ-S.camZ)*0.12;
    try{ render(); }catch(err){ if(!window.__rerr){ window.__rerr=1; console.error('render error:',err); } }
    dirty=false;
  }
  requestAnimationFrame(frame);
}
// ---- measure tool: physical distance between two picked objects ----
let measureMode=false, measA=null, measB=null;
function physPos(o){                              // object -> physical position (pc, world axes)
  if(o&&o._e) return [o._e[0]*AU_PC, o._e[2]*AU_PC, o._e[1]*AU_PC];   // solar body (ecliptic AU)
  const w=objWorld(o); if(!w) return null;
  const m2=Math.hypot(w[0],w[1],w[2]); if(m2<1e-12) return [0,0,0];
  const r=invScale(m2)/m2; return [w[0]*r,w[1]*r,w[2]*r];
}
function measWorld(P){ const r=Math.hypot(P[0],P[1],P[2]); if(r<1e-15) return [0,0,0];
  const R=scale(r)/r; return [P[0]*R,P[1]*R,P[2]*R]; }
function measName(o){ return o.n||o.h||'object'; }
function drawMeasure(){ LBL.prio=P_HUD;
  if(!measA||!measA.P) return;
  const wA=measWorld(measA.P), pA=project(wA[0],wA[1],wA[2]);
  ctx.beginPath(); ctx.arc(pA.x,pA.y,6,0,6.2832); ctx.strokeStyle='rgba(255,207,107,.9)'; ctx.lineWidth=1.4; ctx.stroke();
  if(!measB||!measB.P) return;
  const wB=measWorld(measB.P), pB=project(wB[0],wB[1],wB[2]);
  if(pA.depth<=NEAR||pB.depth<=NEAR) return;
  ctx.beginPath(); ctx.arc(pB.x,pB.y,6,0,6.2832); ctx.stroke();
  pathBegin(); pathPt(pA); pathPt(pB); pathStroke('rgba(255,207,107,.7)',1.4,[5,4]);
  const dpc=Math.hypot(measA.P[0]-measB.P[0],measA.P[1]-measB.P[1],measA.P[2]-measB.P[2]);
  const txt = dpc<0.001 ? (dpc/AU_PC).toFixed(2)+' AU' : fmt(dpc*PC2LY)+' ly · light needs '+fmt(dpc*PC2LY)+' yr';
  ctx.font='11px ui-monospace,monospace'; ctx.fillStyle='rgba(255,220,140,.95)';
  ctx.fillText(txt,(pA.x+pB.x)/2+8,(pA.y+pB.y)/2-6);
}
function measurePick(hit){
  const P=physPos(hit); if(!P) return;
  if(!measA||measB){ measA={o:hit,P:P}; measB=null; searchMsg.textContent=measName(hit)+' — pick a second object'; }
  else { measB={o:hit,P:P};
    const dpc=Math.hypot(measA.P[0]-P[0],measA.P[1]-P[1],measA.P[2]-P[2]);
    searchMsg.textContent=measName(measA.o)+' ↔ '+measName(hit)+' = '
      +(dpc<0.001?(dpc/AU_PC).toFixed(2)+' AU':fmt(dpc*PC2LY)+' ly'); }
  dirty=true;
}
document.getElementById('measureBtn').addEventListener('click',()=>{
  measureMode=!measureMode; measA=measB=null;
  document.getElementById('measureBtn').classList.toggle('active',measureMode);
  searchMsg.textContent=measureMode?'Measure: click the first object':''; dirty=true;
});
// ---- guided tour: Earth -> the edge of the observable universe ----
const TOUR=[
 {t:'1 · Earth — home',d:'Every planet, dwarf planet and moon here sits at its real position for today\u2019s date (JPL ephemerides). The moons orbit in their true planes \u2014 run the time slider and watch them move.',
  go:()=>{ const e=PLANETS.find(p=>p.n==='Earth'); enterSolar(); S.pinned=e; }},
 {t:'2 · Voyager 1 — the farthest human object',d:'Launched 1977, now ~171 AU out \u2014 a radio signal takes almost a day for the round trip. The blue dashed line is its real outbound trajectory (JPL Horizons). Beyond it: the heliopause, where the Sun\u2019s wind yields to interstellar space.',
  go:()=>{ if(!S.probes){S.probes=true;syncToggle('t-probes',true);} const v=PROBES.find(p=>p.n==='Voyager 1'); enterSolar(); S.pinned=v; }},
 {t:'3 · Proxima Centauri — the nearest star',d:'4.25 light-years away. The gap between our solar system and this red dwarf is the real emptiness of interstellar space \u2014 switch \u201cCompact view\u201d off later to feel it. Proxima hosts at least one Earth-sized planet in its habitable zone.',
  go:()=>{ const h=HYG.find(x=>x.n==='Proxima Centauri'); if(h){ S.pinned=h; focusOnHyg(h); } }},
 {t:'4 · TRAPPIST-1 — seven rocky worlds',d:'A cool red dwarf 40 ly away with seven Earth-sized planets \u2014 several inside the green habitable zone. Their positions on the orbits are the REAL phases for today, computed from the measured transit ephemerides.',
  go:()=>{ const st=STARS.find(x=>x.h==='TRAPPIST-1'); if(st) focusOn(st); }},
 {t:'5 · Orion Nebula — a stellar nursery',d:'1,300 ly away: the nearest massive star-forming region, visible to the naked eye as the middle \u201cstar\u201d of Orion\u2019s sword. The blue dots all around are 131,000 real Gaia OB stars \u2014 hot young stars tracing the spiral arms.',
  go:()=>{ const o=DSO.find(x=>x.n.indexOf('Orion Nebula')>=0); if(o){ S.pinned=o; flyTo(o); } }},
 {t:'6 · Sagittarius A* — our black hole',d:'The 4.3-million-solar-mass black hole at the centre of the Milky Way, 27,000 ly away. The star S2 whips around it every 16 years \u2014 its real measured orbit is drawn here; the 2018 pericentre passage confirmed general relativity.',
  go:()=>{ S.pinned=SGRA; flyTo(SGRA); }},
 {t:'7 · Andromeda — the next galaxy',d:'M31, 2.54 million ly away \u2014 the light you see left it before humans existed. It approaches us at ~110 km/s and will merge with the Milky Way in ~4.5 billion years.',
  go:()=>{ const g=GAL.find(x=>x.n&&x.n.indexOf('Andromeda')>=0); if(g) focusOnGalaxy(g); }},
 {t:'8 · Laniakea — our supercluster',d:'100,000 galaxies, 520 million ly across, all drifting toward the Great Attractor. The faint dots everywhere are 43,000 real galaxies of the 2MRS survey \u2014 the cosmic web.',
  go:()=>{ const o=DSO.find(x=>x.n.indexOf('Laniakea')>=0); if(o){ S.pinned=o; flyTo(o); } }},
 {t:'9 · The edge of the observable universe',d:'The blue shell marks the cosmic microwave background, ~46 billion ly in every direction \u2014 the oldest light there is. Beyond it, the universe continues, but its light hasn\u2019t reached us yet. The purple dots: a million real quasars.',
  go:()=>{ if(!S.edge){S.edge=true;syncToggle('t-edge',true);} S.pinned=null; tgtCtr.x=tgtCtr.y=tgtCtr.z=0; tgtCamZ=16; tgtPitch=-0.35; }},
];
let tourIdx=-1;
function tourShow(i){
  tourIdx=Math.max(0,Math.min(TOUR.length-1,i));
  const st=TOUR[tourIdx]; st.go();
  document.getElementById('tourTitle').textContent=st.t;
  document.getElementById('tourText').textContent=st.d;
  document.getElementById('tourStep').textContent=(tourIdx+1)+' / '+TOUR.length;
  document.getElementById('tourPanel').style.display='block';
  dirty=true;
}
function tourEnd(){ tourIdx=-1; document.getElementById('tourPanel').style.display='none'; S.pinned=null; dirty=true; }
document.getElementById('tourBtn').addEventListener('click',()=>{
  if(S.realScale) clickToggle('t-real');   // tour runs in the compact (log) view
  tourShow(0);
});
document.getElementById('tourNext').addEventListener('click',()=>{ if(tourIdx>=TOUR.length-1) tourEnd(); else tourShow(tourIdx+1); });
document.getElementById('tourPrev').addEventListener('click',()=>tourShow(tourIdx-1));
document.getElementById('tourEnd').addEventListener('click',tourEnd);
// ---- shareable views: encode camera + layers in the URL hash ----
// fixed bit order: the original keys in their historical (sorted) positions,
// later additions appended — so old share links keep decoding correctly
const HASH_KEYS=['ast','autorot','belt','con','dso','edge','freelook','gaia','galaxies',
  'gpu','helio','hyg','hz','moons','mw','mw3d','ob','oclu','probes','psr','qso','rings',
  'size','tno','vars','veil','web','lag','lens','iso','eht','radio','bubble','grid','ggrid'];
function viewHash(){
  const keys=HASH_KEYS;
  let m=0; keys.forEach((k,i)=>{ if(S[k]) m|=(1<<i); });
  return 'v1_'+[S.yaw.toFixed(4),S.pitch.toFixed(4),S.camZ.toExponential(4),
    ctr.x.toExponential(4),ctr.y.toExponential(4),ctr.z.toExponential(4),
    S.realScale?1:0,Math.round(S.tOffsetDays),(m>>>0).toString(36)].join('_');
}
function applyHash(){
  try{
    const h=(typeof location!=='undefined'&&location.hash||'').replace(/^#/,'');
    if(!h.startsWith('v1_')) return;
    const p=h.split('_'); if(p.length<10) return;
    S.yaw=tgtYaw=+p[1]; S.pitch=tgtPitch=+p[2]; S.camZ=tgtCamZ=+p[3];
    ctr.x=tgtCtr.x=+p[4]; ctr.y=tgtCtr.y=+p[5]; ctr.z=tgtCtr.z=+p[6];
    S.realScale=p[7]==='1'; syncToggle('t-real',S.realScale);
    S.tOffsetDays=+p[8]||0;
    const m=parseInt(p[9],36)||0;
    HASH_KEYS.forEach((k,i)=>{ if(!TOGGLE_REG[k]) return;
      const v=!!(m&(1<<i)); S[k]=v; syncToggle(TOGGLE_REG[k],v); });
    document.getElementById('hud-mwmap').style.display=S.mw?'block':'none';
    dirty=true;
  }catch(e){}
}
let lastHash='';
if(typeof history!=='undefined'&&history.replaceState){
  setInterval(()=>{ const h=viewHash();
    if(h!==lastHash){ lastHash=h; try{history.replaceState(null,'','#'+h);}catch(e){} } },2000);
}
document.getElementById('shareBtn').addEventListener('click',()=>{
  const h=viewHash(); try{history.replaceState(null,'','#'+h);}catch(e){}
  const u=(typeof location!=='undefined')?location.href:h;
  const done=()=>{searchMsg.textContent='view link copied ✓';};
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done,()=>{searchMsg.textContent=u;});
  else searchMsg.textContent=u;
});
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
function suggestList(q){                                  // shared by desktop dropdown + mobile sheet
  q=(q||'').trim().toLowerCase();
  if(!q||q.length<2) return [];
  const ix=sugIndex(), out=[];
  for(const e of ix){ if(e[1].startsWith(q)){ out.push(e); if(out.length>=6) break; } }
  if(out.length<6) for(const e of ix){ if(!e[1].startsWith(q)&&e[1].includes(q)){ out.push(e); if(out.length>=6) break; } }
  return out;
}
// ---- collapsible control groups ----
if(document.querySelectorAll) document.querySelectorAll('.ctl-h').forEach(h=>
  h.addEventListener('click',()=>h.parentElement.classList.toggle('closed')));
// ---- collapsible time bar ----
(function(){
  const B=document.body;
  const setMini=v=>{ if(B.classList){ B.classList.toggle('time-mini',v); dirty=true; } };
  if(document.querySelectorAll) document.querySelectorAll('.time-min').forEach(el=>
    el.addEventListener('click',e=>{ if(e.stopPropagation)e.stopPropagation(); setMini(!(B.classList&&B.classList.contains('time-mini'))); }));
  for(const id of ['hud-time','hud-soltime']){ const p=document.getElementById(id);
    if(p&&p.addEventListener) p.addEventListener('click',()=>{ if(B.classList&&B.classList.contains('time-mini')) setMini(false); }); }
})();
// ---- mobile drawers ----
(function(){
  const B=document.body;
  // FAB toggling is inline onclick on the elements (parse-time, mobile-safe)
  try{
    if(matchMedia('(max-width:720px)').matches && B.appendChild)
      B.appendChild(document.getElementById('info'));   // bottom sheet must escape the hidden drawer
  }catch(e){}
})();
api.zoomBy=f=>{ let ax=W/2, ay=H/2;
  if(S.pinned){ const w=objWorld(S.pinned);
    if(w){ const p=project(w[0],w[1],w[2]);
      if(p.depth>NEAR&&p.x>0&&p.x<W&&p.y>0&&p.y<H){ ax=p.x; ay=p.y; } } }
  zoomFactorAt(ax,ay,f); dirty=true; };
// ---- unified timeline: one number line drives solar ephemeris + stellar proper motion ----
const uniEl=document.getElementById('uniTime'), uniVal=document.getElementById('uniVal');
const uniPlayBtn=document.getElementById('uniPlay'), uniNowBtn=document.getElementById('uniNow');
function setUni(v){
  const t=Math.sign(v)*Math.pow(Math.abs(v)/1000,3)*50000;       // cubic: fine control near today
  S.pmYears=Math.round(t); S.pm=(v!==0);
  S.tOffsetDays=Math.max(-36525,Math.min(36525,t*365.25));       // solar ephemeris valid ±100 yr
  if(typeof setSolDate==='function') try{setSolDate();}catch(err){}
  if(uniVal){ const yr=new Date().getFullYear()+t;
    uniVal.textContent = v===0?'today':(Math.abs(t)<200
      ? new Date(Date.now()+t*31557600000).toISOString().slice(0,10)
      : (t>0?'+':'−')+Math.abs(Math.round(t)).toLocaleString('en-US')+' yr ('+Math.round(yr)+')'); }
  dirty=true;
}
let uniTimer=null;
if(uniEl&&uniEl.addEventListener){
  uniEl.addEventListener('input',ev=>setUni(+ev.target.value));
  if(uniPlayBtn) uniPlayBtn.addEventListener('click',()=>{
    if(uniTimer){ clearInterval(uniTimer); uniTimer=null; uniPlayBtn.innerHTML=svgIcon('play',14); }
    else { uniPlayBtn.innerHTML=svgIcon('pause',14);
      uniTimer=setInterval(()=>{ let v=+uniEl.value+2; if(v>1000)v=-1000; uniEl.value=v; setUni(v); },120); }
  });
  if(uniNowBtn) uniNowBtn.addEventListener('click',()=>{ uniEl.value=0; setUni(0);
    if(uniTimer){clearInterval(uniTimer);uniTimer=null;if(uniPlayBtn)uniPlayBtn.innerHTML=svgIcon('play',14);} });
}
api.clickToggle=clickToggle; api.doSearch=doSearch; api.getS=()=>S; api.suggest=suggestList;
api.getCam=()=>({camZ:S.camZ, tgt:tgtCamZ, real:S.realScale});
api.searchMsgText=()=>searchMsg.textContent; api.toggleFac=toggleFac; api.facColorToggle=facColorToggle;
api.facList=()=>facList; api.searchInput=q=>{ if(q&&q.trim().length>2) doSearch(q); };
// live layer: fly to a close-approach NEO from the panel list
api.liveNeoFocus=id=>{
  const o=LIVE.neos.find(n=>n.id===id); if(!o) return;
  if(o.kd){ o._el=keplerSB(o.kd,solarJD()); o._e=orbPoint(o._el,o._el.E);
    const w=eclToWorld(o._e[0],o._e[1],o._e[2]);
    S.pinned=o; aim(w[0],w[1],w[2], scale(2.2*AU_PC)); }
  else { S.pinned=null; enterSolar(); }
  dirty=true;
};
api.liveStats=()=>{ const y=new Date().getFullYear();
  let n=0; for(const st of STARS) if(st.fy===y) n++;
  return {exoY:n, year:y}; };
LIVE.onUpdate=()=>{ dirty=true; };
// headless-verify hook: lets the test harness inspect/inject live-layer state
if(typeof window!=='undefined') window.__ku={api, live:LIVE, redraw:()=>{dirty=true;}};
startLive();
if(UI.fac) UI.fac(facList);
// real scale is the default view — boot into it via the tested toggle conversion,
// unless a share link (hash) decides the scale itself
if(!((typeof location!=='undefined'&&location.hash)||'').includes('v1_')) clickToggle('t-real');
applyHash();
try{console.log('Known Universe build 2026-07-12 11:57');}catch(e){}
initGL();
loadGaia();
loadExtragal();
requestAnimationFrame(frame);
window.__kuapi=api;
