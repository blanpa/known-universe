// The info card for every object type.
import { svgIcon } from '../lib/icons.js';
import { PC2LY } from './data.js';
import { fmt } from './hud.js';
import { links, radec, radecRow } from './pick.js';
import { CLU_T, DSO_T } from './sky-data.js';
import { FAC, dateStr } from './solar-data.js';
import { S, V } from './state.js';
import { planetColor } from './system.js';
import { fmtYears, route1g } from './transfer.js';
const GTYPE={Sp:'Spiral galaxy',E:'Elliptical galaxy',S0:'Lenticular galaxy',
  Irr:'Irregular galaxy',dSph:'Dwarf galaxy'};
export function showInfo(s){
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
      h+=`<button class="transferset">${V.TRANSFER&&V.TRANSFER.to===s?svgIcon('close')+'Clear transfer orbit':svgIcon('probe')+'Transfer Earth → '+s.n}</button>`;
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
