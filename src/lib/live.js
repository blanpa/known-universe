// live layer: space weather (NOAA SWPC + NASA DONKI), NEO close approaches (NASA NeoWs),
// satellites (CelesTrak + SGP4), active solar regions (SWPC), GW events + fireballs
// (via live-extra.json proxy — GraceDB/JPL have no CORS), EPIC Earth photo, launches.
// All failures are silent — a layer simply stays empty.
import { writable } from 'svelte/store';
import * as satellite from 'satellite.js';

export const liveData = writable(null);            // → LivePanel.svelte
export const LIVE = { cmes: [], neos: [], wx: null, sats: [], regions: [],
  extra: null, epic: null, launches: [], onUpdate: null };  // → engine (plain state)

const LD_KM = 384400, AU_KM = 1.496e8;
function nasaKey(){ try{ return localStorage.getItem('nasa_api_key') || 'DEMO_KEY'; }catch(e){ return 'DEMO_KEY'; } }
function j(url){ return fetch(url).then(r => r.ok ? r.json() : null).catch(() => null); }
function day(off){ return new Date(Date.now() + off * 86400000).toISOString().slice(0, 10); }

function publish(){
  liveData.set({ wx: LIVE.wx, cmes: LIVE.cmes, neos: LIVE.neos, regions: LIVE.regions,
    sats: LIVE.sats.length, extra: LIVE.extra, launches: LIVE.launches, ts: Date.now() });
  if (LIVE.onUpdate) LIVE.onUpdate();
}

// ---- NOAA SWPC: Kp, solar wind, GOES X-ray flux ----
async function fetchWeather(){
  const B = 'https://services.swpc.noaa.gov/';
  const [kp, sp, mag, xr] = await Promise.all([
    j(B + 'products/noaa-planetary-k-index.json'),
    j(B + 'products/summary/solar-wind-speed.json'),
    j(B + 'products/summary/solar-wind-mag-field.json'),
    j(B + 'json/goes/primary/xrays-6-hour.json'),
  ]);
  const wx = {};
  if (kp && kp.length){ const l = kp[kp.length - 1]; wx.kp = +l.Kp; wx.kpTime = l.time_tag; }
  if (sp && sp[0]) wx.wind = +sp[0].proton_speed;
  if (mag && mag[0]){ wx.bt = +mag[0].bt; wx.bz = +mag[0].bz_gsm; }
  if (xr && xr.length){
    const lng = xr.filter(e => e.energy === '0.1-0.8nm');
    const f = lng.length ? lng[lng.length - 1].flux : null;
    if (f != null){
      const cls = f >= 1e-4 ? ['X', 1e-4] : f >= 1e-5 ? ['M', 1e-5] : f >= 1e-6 ? ['C', 1e-6]
                : f >= 1e-7 ? ['B', 1e-7] : ['A', 1e-8];
      wx.xray = cls[0] + (f / cls[1]).toFixed(1);
      wx.xflux = f;
    }
  }
  if (Object.keys(wx).length) LIVE.wx = wx;
}

// ---- NASA DONKI: CME analyses of the last 5 days ----
async function fetchCmes(){
  const d = await j(`https://api.nasa.gov/DONKI/CMEAnalysis?startDate=${day(-5)}&endDate=${day(0)}`
    + `&mostAccurateOnly=true&api_key=${nasaKey()}`);
  if (!d || !Array.isArray(d)) return;
  LIVE.cmes = d.filter(c => c.time21_5 && c.speed && c.latitude != null && c.longitude != null)
    .map(c => {
      const t = Date.parse(c.time21_5);
      const earthDir = Math.abs(c.longitude) <= (c.halfAngle || 30);
      return { t, lat: +c.latitude, lon: +c.longitude, half: +(c.halfAngle || 30), v: +c.speed,
        type: c.type || '?', earthDir,
        eta: earthDir ? t + (AU_KM * 0.9) / c.speed * 1000 : null };   // ballistic from 21.5 R☉ (~0.1 AU)
    })
    .sort((a, b) => b.t - a.t);
}

// ---- NASA NeoWs: close approaches today → +7 d; orbital elements for the nearest ones ----
function cachedKd(id){ try{ const s = localStorage.getItem('ku_neokd_' + id); return s ? JSON.parse(s) : null; }catch(e){ return null; } }
function storeKd(id, kd){ try{ localStorage.setItem('ku_neokd_' + id, JSON.stringify(kd)); }catch(e){} }

async function lookupKd(id){
  const hit = cachedKd(id);
  if (hit) return hit;
  const d = await j(`https://api.nasa.gov/neo/rest/v1/neo/${id}?api_key=${nasaKey()}`);
  const o = d && d.orbital_data;
  if (!o || !+o.semi_major_axis || !+o.mean_motion) return null;
  const kd = { a: +o.semi_major_axis, e: +o.eccentricity, i: +o.inclination,
    om: +o.ascending_node_longitude, w: +o.perihelion_argument,
    ma: +o.mean_anomaly, n: +o.mean_motion, ep: +o.epoch_osculation };
  storeKd(id, kd);
  return kd;
}

async function fetchNeos(){
  const d = await j(`https://api.nasa.gov/neo/rest/v1/feed?start_date=${day(0)}&end_date=${day(7)}&api_key=${nasaKey()}`);
  if (!d || !d.near_earth_objects) return;
  const out = [];
  for (const date of Object.keys(d.near_earth_objects))
    for (const o of d.near_earth_objects[date]){
      const ca = (o.close_approach_data || []).find(c => c.orbiting_body === 'Earth') || (o.close_approach_data || [])[0];
      if (!ca) continue;
      const dia = o.estimated_diameter && o.estimated_diameter.meters;
      const ld = +ca.miss_distance.lunar, vk = +ca.relative_velocity.kilometers_per_second;
      const pha = !!o.is_potentially_hazardous_asteroid, sentry = !!o.is_sentry_object;
      const ldStr = ld < 10 ? ld.toFixed(1) : Math.round(ld);
      out.push({
        id: o.id, n: (o.name || '').replace(/[()]/g, ''),
        t: ca.epoch_date_close_approach,
        ld, km: +ca.miss_distance.kilometers, vkms: vk,
        dia: dia ? (dia.estimated_diameter_min + dia.estimated_diameter_max) / 2 : null,
        pha, sentry,
        rk: dia ? (dia.estimated_diameter_min + dia.estimated_diameter_max) / 4000 : 0.05,  // est. radius, km
        kind: 'Near-Earth object', c: [255, 178, 96],
        note: `closest approach ${new Date(ca.epoch_date_close_approach).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}`
          + ` · ${ldStr} LD · ${vk.toFixed(1)} km/s`
          + (pha ? ' · potentially hazardous (PHA)' : '') + (sentry ? ' · Sentry risk list' : ''),
      });
    }
  out.sort((a, b) => a.t - b.t);
  // keep old kd references when the same object is still in the window
  const old = new Map(LIVE.neos.map(o => [o.id, o]));
  for (const o of out){ const p = old.get(o.id); if (p && p.kd) o.kd = p.kd; }
  LIVE.neos = out;
  publish();
  // orbital elements (localStorage-cached) for the closest passes — drawn as real time-aware orbits
  const want = out.slice().sort((a, b) => a.ld - b.ld).filter(o => o.ld <= 30).slice(0, 10);
  for (const o of want) if (!o.kd) o.kd = await lookupKd(o.id);
}

// ---- satellites: CelesTrak GP elements (TLE) → SGP4 satrecs ----
// CelesTrak temp-bans IPs that re-query a group more often than ~hourly, so the
// TLE text is cached for 6 h in localStorage (and used stale if the fetch fails).
function tleCache(){ try{ return JSON.parse(localStorage.getItem('ku_tle') || 'null'); }catch(e){ return null; } }
const SAT_GROUPS = ['visual', 'stations', 'starlink', 'oneweb', 'gnss', 'geo'];
async function fetchSats(){
  let c = tleCache();
  if (!c || typeof c.groups !== 'object' || !c.groups) c = { groups: {} };   // migrate old {ts,txt} cache
  let changed = false;
  for (const g of SAT_GROUPS){
    const e = c.groups[g];
    if (e && Date.now() - e.ts < 6 * 3600e3) continue;   // per-group TTL: one failed group
    const t = await fetch(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${g}&FORMAT=tle`)
      .then(r => r.ok ? r.text() : null).catch(() => null);
    if (t && t[0] !== '<'){ c.groups[g] = { ts: Date.now(), txt: t }; changed = true; }   // 403 ban page is HTML
  }                                                      // doesn't block the others (stale-if-error per group)
  if (changed){ try{ localStorage.setItem('ku_tle', JSON.stringify(c)); }catch(e){} }
  const txt = SAT_GROUPS.map(g => c.groups[g] ? c.groups[g].txt : '').join('\n');
  if (!txt.trim()) return;
  const seen = new Set(), sats = [];
  {
    const lines = txt.split(/\r?\n/);
    for (let i = 0; i + 2 < lines.length + 1; i++){
      if (!lines[i + 1] || lines[i + 1][0] !== '1' || !lines[i + 2] || lines[i + 2][0] !== '2') continue;
      try{
        const rec = satellite.twoline2satrec(lines[i + 1], lines[i + 2]);
        if (seen.has(rec.satnum)) { i += 2; continue; }
        seen.add(rec.satnum);
        const n = lines[i].trim();
        sats.push({ n, rec, iss: /ISS \(ZARYA\)/.test(n), hst: /^HST$/.test(n),
          css: /CSS \(TIANHE\)/.test(n), sl: /^STARLINK/i.test(n), ow: /^ONEWEB/i.test(n) });
        i += 2;
      }catch(e){}
    }
  }
  if (sats.length) LIVE.sats = sats;
}
// TEME/ECI position (km, equatorial) → ecliptic km, Earth-centred; null when stale or decayed
const OBL = 23.43928 * Math.PI / 180, cOB = Math.cos(OBL), sOB = Math.sin(OBL);
export function satEcl(s, jd){
  if (Math.abs(jd - s.rec.jdsatepoch) > 12) return null;   // SGP4 degrades fast
  const pv = satellite.sgp4(s.rec, (jd - s.rec.jdsatepoch) * 1440);
  if (!pv || !pv.position) return null;
  const p = pv.position;
  return [p.x, p.y * cOB + p.z * sOB, p.z * cOB - p.y * sOB];
}
// geodetic lat/lon (deg) at a UTC ms timestamp → ecliptic unit direction from Earth's centre
export function groundEcl(latDeg, lonDeg, ms){
  const gmst = satellite.gstime(new Date(ms));
  const ecf = satellite.geodeticToEcf({ latitude: latDeg * Math.PI / 180, longitude: lonDeg * Math.PI / 180, height: 0 });
  const p = satellite.ecfToEci(ecf, gmst);
  const e = [p.x, p.y * cOB + p.z * sOB, p.z * cOB - p.y * sOB];
  const l = Math.hypot(e[0], e[1], e[2]) || 1;
  return [e[0] / l, e[1] / l, e[2] / l];
}

// ---- SWPC active solar regions (sunspots) ----
async function fetchRegions(){
  const d = await j('https://services.swpc.noaa.gov/json/solar_regions.json');
  if (!d || !d.length) return;
  let latest = '';
  for (const r of d) if (r.observed_date > latest) latest = r.observed_date;
  LIVE.regions = d.filter(r => r.observed_date === latest && r.region != null && r.latitude != null)
    .map(r => ({ no: r.region, lat: +r.latitude, lon: -(+r.longitude),   // SWPC is east-positive → Stonyhurst west-positive
      area: +r.area || 0, cls: r.spot_class || '', mag: r.mag_class || '',
      spots: +r.number_spots || 0,
      cp: +r.c_flare_probability || 0, mp: +r.m_flare_probability || 0, xp: +r.x_flare_probability || 0,
      cx: +r.c_xray_events || 0, mx: +r.m_xray_events || 0, xx: +r.x_xray_events || 0, date: latest }))
    .filter(r => Math.abs(r.lon) <= 92);
}

// ---- live-extra.json: GW superevents + fireballs (proxied — no CORS at the sources) ----
async function fetchExtra(){
  let d = await j('data/live-extra.json');                                  // docker (nginx + updater)
  if (!d) d = await j('https://raw.githubusercontent.com/blanpa/known-universe/live-data/live-extra.json'); // Pages (Action)
  if (d && (d.gw || d.fireballs)) LIVE.extra = d;
}

// ---- EPIC: today's real photo of Earth (DSCOVR, L1) ----
async function fetchEpic(){
  const d = await j(`https://api.nasa.gov/EPIC/api/natural?api_key=${nasaKey()}`);
  if (!d || !d.length) return;
  const it = d[d.length - 1], dd = it.date.slice(0, 10).replace(/-/g, '/');
  LIVE.epic = { url: `https://api.nasa.gov/EPIC/archive/natural/${dd}/jpg/${it.image}.jpg?api_key=${nasaKey()}`,
    date: it.date };
}

// ---- upcoming rocket launches (Launch Library 2 — free tier: 15 req/h, so 2 h cadence) ----
async function fetchLaunches(){
  const d = await j('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5&mode=list');
  if (d && d.results) LIVE.launches = d.results.map(l => ({
    n: l.name, t: Date.parse(l.net), status: l.status ? (l.status.abbrev || '') : '' }));
}

// ---- meteor showers: static IMO calendar — "live" by today's date, no API needed ----
export const SHOWERS = [
  { n: 'Quadrantids', from: [12, 28], to: [1, 12], peak: 'Jan 3', ra: 230, dec: 49, zhr: 110 },
  { n: 'Lyrids', from: [4, 14], to: [4, 30], peak: 'Apr 22', ra: 271, dec: 34, zhr: 18 },
  { n: 'η-Aquariids', from: [4, 19], to: [5, 28], peak: 'May 6', ra: 338, dec: -1, zhr: 50 },
  { n: 'α-Capricornids', from: [7, 3], to: [8, 15], peak: 'Jul 30', ra: 307, dec: -10, zhr: 5 },
  { n: 'S δ-Aquariids', from: [7, 12], to: [8, 23], peak: 'Jul 30', ra: 340, dec: -16, zhr: 25 },
  { n: 'Perseids', from: [7, 17], to: [8, 24], peak: 'Aug 13', ra: 48, dec: 58, zhr: 100 },
  { n: 'Orionids', from: [10, 2], to: [11, 7], peak: 'Oct 21', ra: 95, dec: 16, zhr: 20 },
  { n: 'Draconids', from: [10, 6], to: [10, 10], peak: 'Oct 8', ra: 262, dec: 54, zhr: 10 },
  { n: 'S Taurids', from: [9, 10], to: [11, 20], peak: 'Oct 10', ra: 32, dec: 9, zhr: 5 },
  { n: 'N Taurids', from: [10, 20], to: [12, 10], peak: 'Nov 12', ra: 58, dec: 22, zhr: 5 },
  { n: 'Leonids', from: [11, 6], to: [11, 30], peak: 'Nov 17', ra: 152, dec: 22, zhr: 15 },
  { n: 'Geminids', from: [12, 4], to: [12, 17], peak: 'Dec 14', ra: 112, dec: 33, zhr: 150 },
  { n: 'Ursids', from: [12, 17], to: [12, 26], peak: 'Dec 22', ra: 217, dec: 76, zhr: 10 },
];
export function activeShowers(ms){
  const d = new Date(ms), key = (d.getMonth() + 1) * 100 + d.getDate();
  return SHOWERS.filter(s => { const a = s.from[0] * 100 + s.from[1], b = s.to[0] * 100 + s.to[1];
    return a <= b ? (key >= a && key <= b) : (key >= a || key <= b); });
}

let started = false;
export function startLive(){
  if (started) return;
  started = true;
  const wx = () => fetchWeather().then(publish, () => {});
  const ev = () => Promise.allSettled([fetchCmes(), fetchNeos(), fetchRegions()]).then(publish);
  const midi = () => Promise.allSettled([fetchExtra(), fetchLaunches()]).then(publish);
  const slow = () => Promise.allSettled([fetchSats(), fetchEpic()]).then(publish);
  wx(); ev(); midi(); slow();
  setInterval(wx, 5 * 60 * 1000);
  setInterval(ev, 30 * 60 * 1000);
  setInterval(midi, 2 * 60 * 60 * 1000);
  setInterval(slow, 6 * 60 * 60 * 1000);
}
