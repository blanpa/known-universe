// Guided tour.
import { enterSolar, flyTo, focusOn, focusOnGalaxy, focusOnHyg } from './actions.js';
import { clickToggle, syncToggle } from './controls.js';
import { GAL, STARS } from './data.js';
import { DSO, SGRA } from './sky-data.js';
import { HYG, PLANETS, PROBES } from './solar-data.js';
import { S, V } from './state.js';
import { tgtCtr } from './view.js';
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
  go:()=>{ if(!S.edge){S.edge=true;syncToggle('t-edge',true);} S.pinned=null; tgtCtr.x=tgtCtr.y=tgtCtr.z=0; V.tgtCamZ=16; V.tgtPitch=-0.35; }},
];
let tourIdx=-1;
function tourShow(i){
  tourIdx=Math.max(0,Math.min(TOUR.length-1,i));
  const st=TOUR[tourIdx]; st.go();
  document.getElementById('tourTitle').textContent=st.t;
  document.getElementById('tourText').textContent=st.d;
  document.getElementById('tourStep').textContent=(tourIdx+1)+' / '+TOUR.length;
  document.getElementById('tourPanel').style.display='block';
  V.dirty=true;
}
function tourEnd(){ tourIdx=-1; document.getElementById('tourPanel').style.display='none'; S.pinned=null; V.dirty=true; }
document.getElementById('tourBtn').addEventListener('click',()=>{
  if(S.realScale) clickToggle('t-real');   // tour runs in the compact (log) view
  tourShow(0);
});
document.getElementById('tourNext').addEventListener('click',()=>{ if(tourIdx>=TOUR.length-1) tourEnd(); else tourShow(tourIdx+1); });
document.getElementById('tourPrev').addEventListener('click',()=>tourShow(tourIdx-1));
document.getElementById('tourEnd').addEventListener('click',tourEnd);
