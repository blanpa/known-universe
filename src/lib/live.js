// live layer: space weather (NOAA SWPC + NASA DONKI) and NEO close approaches (NASA NeoWs).
// All endpoints are CORS-open; every failure is silent — the layer simply stays empty.
import { writable } from 'svelte/store';

export const liveData = writable(null);            // → LivePanel.svelte
export const LIVE = { cmes: [], neos: [], wx: null, onUpdate: null };  // → engine (plain state)

const LD_KM = 384400, AU_KM = 1.496e8;
function nasaKey(){ try{ return localStorage.getItem('nasa_api_key') || 'DEMO_KEY'; }catch(e){ return 'DEMO_KEY'; } }
function j(url){ return fetch(url).then(r => r.ok ? r.json() : null).catch(() => null); }
function day(off){ return new Date(Date.now() + off * 86400000).toISOString().slice(0, 10); }

function publish(){
  liveData.set({ wx: LIVE.wx, cmes: LIVE.cmes, neos: LIVE.neos, ts: Date.now() });
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

let started = false;
export function startLive(){
  if (started) return;
  started = true;
  const wx = () => fetchWeather().then(publish, () => {});
  const ev = () => Promise.allSettled([fetchCmes(), fetchNeos()]).then(publish);
  wx(); ev();
  setInterval(wx, 5 * 60 * 1000);
  setInterval(ev, 30 * 60 * 1000);
}
