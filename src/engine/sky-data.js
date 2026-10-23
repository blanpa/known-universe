// Deep-sky catalogues: Sgr A*, galactic frame, nebulae, pulsars, clusters, constellations.
import { CAT, DATA } from './data.js';
// ---- Milky Way: galactic centre (Sgr A*) + the galactic plane ----
export function dirOf(raDeg,decDeg){ const r=raDeg*Math.PI/180, d=decDeg*Math.PI/180;
  return [Math.cos(d)*Math.cos(r), Math.cos(d)*Math.sin(r), Math.sin(d)]; }
export const SGRA={n:'Sagittarius A*', sgra:true, kind:'galactic centre', d:8178,
  desc:'supermassive black hole · 4.3 million solar masses'};
SGRA._dir=dirOf(266.41684,-29.00781);              // world position computed per frame
// galactic plane basis: two orthonormal in-plane vectors (⊥ to the North Galactic Pole)
export const NGP=dirOf(192.85948,27.12825), GC=SGRA._dir;
export const GPv=(function(){ const c=[NGP[1]*GC[2]-NGP[2]*GC[1], NGP[2]*GC[0]-NGP[0]*GC[2], NGP[0]*GC[1]-NGP[1]*GC[0]];
  const n=Math.hypot(c[0],c[1],c[2]); return [c[0]/n,c[1]/n,c[2]/n]; })();
export const GPu=GC;                             // one in-plane axis points at the galactic centre

// ---- famous deep-sky objects: nebulae & star clusters (curated, real positions) ----
export const DSO_T={
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
export const DSO=[
 {n:'Pleiades · M45',t:'OC',ra:56.75,dec:24.12,d:136},   {n:'Hyades',t:'OC',ra:66.75,dec:15.87,d:47},
 {n:'Praesepe · M44',t:'OC',ra:130.05,dec:19.67,d:187},  {n:'Double Cluster',t:'OC',ra:34.74,dec:57.13,d:2300},
 {n:'Wild Duck · M11',t:'OC',ra:282.77,dec:-6.27,d:1900},{n:'Ptolemy · M7',t:'OC',ra:268.46,dec:-34.79,d:300},
 {n:'Butterfly · M6',t:'OC',ra:265.08,dec:-32.21,d:490},{n:'M35',t:'OC',ra:92.27,dec:24.33,d:860},
 {n:'M67',t:'OC',ra:132.83,dec:11.81,d:800},
 {n:'M13 · Hercules',t:'GC',ra:250.42,dec:36.46,d:7700}, {n:'M22',t:'GC',ra:279.10,dec:-23.90,d:3200},
 {n:'Omega Centauri',t:'GC',ra:201.70,dec:-47.48,d:5200},{n:'47 Tucanae',t:'GC',ra:6.02,dec:-72.08,d:4450},
 {n:'M5',t:'GC',ra:229.64,dec:2.08,d:7500},              {n:'M15',t:'GC',ra:322.49,dec:12.17,d:10400},
 {n:'M3',t:'GC',ra:205.55,dec:28.38,d:10200},            {n:'M4',t:'GC',ra:245.90,dec:-26.53,d:1850},
 {n:'M92',t:'GC',ra:259.28,dec:43.14,d:8200},
 {n:'Orion Nebula · M42',t:'EN',ra:83.82,dec:-5.39,d:388}, {n:'Lagoon Nebula · M8',t:'EN',ra:270.92,dec:-24.38,d:1250},
 {n:'Eagle Nebula · M16',t:'EN',ra:274.70,dec:-13.81,d:1740},{n:'Trifid Nebula · M20',t:'EN',ra:270.60,dec:-23.03,d:1550},
 {n:'Omega Nebula · M17',t:'EN',ra:275.20,dec:-16.17,d:1700},{n:'Carina Nebula',t:'EN',ra:161.27,dec:-59.87,d:2300},
 {n:'Rosette Nebula',t:'EN',ra:97.98,dec:4.95,d:1600},   {n:'North America Nebula',t:'EN',ra:314.75,dec:44.31,d:800},
 {n:'Tarantula Nebula',t:'EN',ra:84.68,dec:-69.10,d:49000},
 {n:'Ring Nebula · M57',t:'PN',ra:283.40,dec:33.03,d:787},{n:'Dumbbell Nebula · M27',t:'PN',ra:299.90,dec:22.72,d:380},
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
 {n:'2M1207 · has a planet',t:'BD',ra:181.89,dec:-39.55,d:64.4},{n:'Teide 1 · Pleiades',t:'BD',ra:56.9,dec:24.36,d:120},
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
 {n:'Epsilon Indi Ba',t:'BD',ra:330.84,dec:-56.786,d:3.64},
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
export const PULSARS=CAT.pulsars;
PULSARS.forEach(q=>{ q.psr=true; q._dir=dirOf(q[0],q[1]); q.n=q[3]; q.d=q[2]; });
// ---- open clusters (Cantat-Gaudin 2020, Gaia distances) ----
export const CLUSTERS=CAT.clusters;
CLUSTERS.forEach(c=>{ c.oclu=true; c.ct=0; c._dir=dirOf(c[0],c[1]); c.n=c[3]; c.d=c[2]; });
// globular clusters (Baumgardt/Gaia) + CHIME FRBs share the layer, typed by ct
const GLOBS=CAT.globs;
const FRBS=CAT.frbs;
export const CLU_T=[{c:[150,190,255],l:'Open cluster · Cantat-Gaudin 2020 (Gaia)'},
             {c:[255,215,140],l:'Globular cluster · Baumgardt (Gaia)'},
             {c:[170,255,190],l:'Fast radio burst · CHIME (distance estimated from DM)'}];
GLOBS.concat(FRBS).forEach(c=>{ c.oclu=true; c.ct=c[4]||0; c._dir=dirOf(c[0],c[1]); c.n=c[3]; c.d=c[2]; CLUSTERS.push(c); });

// ---- constellation stick-figures (drawn on a fixed sky sphere) ----
export const CONS=DATA.constellations||[];
CONS.forEach(k=>{ k._L=k.L.map(pl=>{ const a=[]; for(let i=0;i<pl.length;i+=2) a.push(dirOf(pl[i],pl[i+1])); return a; }); });
export const CON_NAME={Ori:'Orion',UMa:'Ursa Major',UMi:'Ursa Minor',Cas:'Cassiopeia',Cyg:'Cygnus',
  Lyr:'Lyra',Aql:'Aquila',Sco:'Scorpius',Sgr:'Sagittarius',Leo:'Leo',Tau:'Taurus',Gem:'Gemini',
  Cnc:'Cancer',Vir:'Virgo',And:'Andromeda',Per:'Perseus',Aur:'Auriga',Boo:'Bootes',
  Cru:'Crux',Cen:'Centaurus',CMa:'Canis Major',CMi:'Canis Minor',Peg:'Pegasus',Ari:'Aries',
  Psc:'Pisces',Aqr:'Aquarius',Cap:'Capricornus',Dra:'Draco',Her:'Hercules',Oph:'Ophiuchus',
  Car:'Carina',Vel:'Vela',Cae:'Caelum',Del:'Delphinus',Crv:'Corvus',Cvn:'Canes Venatici'};
