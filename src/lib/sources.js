// What is running and what failed: every outside call the app makes — catalogue files,
// live services, imagery, sky tiles, field queries — reports here, and the Data pane
// shows it. A row is {id, name, group, host, state, at, ms, n, msg, size, modified}.
// States: idle · busy · ok · warn · error · absent (an optional file that is not there).
import { writable } from 'svelte/store';

export const sources = writable({});
const REG = {};
let _t = null;
function publish(){ if (_t) return; _t = setTimeout(() => { _t = null; sources.set({ ...REG }); }, 60); }
export function declare(id, meta = {}){
  if (!REG[id]) REG[id] = { id, name: id, group: 'live', host: '', state: 'idle', at: 0, ms: 0, n: null, msg: '', size: null, modified: '', optional: false };
  for (const k of Object.keys(meta)) if (meta[k] !== undefined) REG[id][k] = meta[k];
  publish(); return REG[id];
}
export function mark(id, patch){ const s = REG[id] || declare(id); Object.assign(s, patch); s.at = Date.now(); publish(); }
export function count(id, n){ if (REG[id] && n !== undefined && n !== null) { REG[id].n = n; publish(); } }
const hostOf = u => { try { return new URL(u, location.href).host; } catch (e) { return ''; } };
// fetch with a status: resolves to the Response like fetch; records HTTP status, timing,
// Last-Modified and Content-Length. A network or CORS failure rejects, as fetch does.
export async function tfetch(id, meta, url, init){
  declare(id, { host: meta.host || hostOf(url), ...meta });
  const t0 = performance.now(); mark(id, { state: 'busy', msg: '' });
  try {
    const r = await fetch(url, init), ms = Math.round(performance.now() - t0);
    if (!r.ok) {
      const why = r.status === 429 ? 'rate limit' : r.status === 403 ? 'forbidden' : r.status === 404 ? 'not found' : r.status >= 500 ? 'server error' : '';
      mark(id, { state: REG[id].optional && r.status === 404 ? 'absent' : 'error', ms, msg: 'HTTP ' + r.status + (why ? ' · ' + why : '') });
      return r;
    }
    mark(id, { state: 'ok', ms, modified: r.headers.get('last-modified') || REG[id].modified, size: +(r.headers.get('content-length') || 0) || REG[id].size });
    return r;
  } catch (e) {
    mark(id, { state: 'error', ms: Math.round(performance.now() - t0), msg: e && e.name === 'AbortError' ? 'timeout' : 'no answer (network or CORS)' });
    throw e;
  }
}
// a job that is not one request: `fn` returns a value; `{__stat}` on it feeds n/msg
export async function tracked(id, meta, fn){
  declare(id, meta); const t0 = performance.now(); mark(id, { state: 'busy', msg: '' });
  try { const r = await fn(); const st = r && r.__stat ? r.__stat : {};
    mark(id, { state: st.state || 'ok', ms: Math.round(performance.now() - t0), ...st }); return r; }
  catch (e) { mark(id, { state: 'error', ms: Math.round(performance.now() - t0), msg: String(e && e.message || e) }); throw e; }
}
// an <img> load: wrap its handlers, keep theirs
export function timg(id, meta, im){
  declare(id, meta); const ol = im.onload, oe = im.onerror; const t0 = performance.now();
  mark(id, { state: 'busy', msg: '' });
  im.onload = e => { mark(id, { state: 'ok', ms: Math.round(performance.now() - t0), size: im.naturalWidth ? im.naturalWidth * im.naturalHeight : null, msg: im.naturalWidth ? im.naturalWidth + '×' + im.naturalHeight + ' px' : '' }); if (ol) ol(e); };
  im.onerror = e => { mark(id, { state: 'error', ms: Math.round(performance.now() - t0), msg: 'image failed (not found, or no CORS)' }); if (oe) oe(e); };
}
