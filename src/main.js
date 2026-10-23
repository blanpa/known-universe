import { mount } from 'svelte';
import { count, tfetch } from './lib/sources.js';
import './app.css';
import App from './App.svelte';
import { restore } from './lib/prefs.js';

// visible error reporter — a phone has no console
function showErr(msg){
  let b=document.getElementById('errbar');
  if(!b){ b=document.createElement('div'); b.id='errbar';
    b.style.cssText='position:fixed;top:0;left:0;right:0;z-index:9999;background:#7f1d1d;color:#fff;'+
      'font:12px monospace;padding:8px 12px;white-space:pre-wrap;max-height:40vh;overflow:auto';
    document.body.appendChild(b); }
  b.textContent += msg + '\n';
}
window.addEventListener('error', e => showErr('⚠ ' + (e.message||e.type) + ' @ ' + (e.filename||'').split('/').pop() + ':' + e.lineno));
window.addEventListener('unhandledrejection', e => showErr('⚠ promise: ' + (e.reason && e.reason.message || e.reason)));

mount(App, { target: document.getElementById('app') });

// boot: embedded data (artifact) or fetch (Pages/Docker).
// Layer state is restored AFTER the engine booted — setToggle runs each layer's real
// side effect, so a restored session is the real state, not just repainted switches.
// the engine module runs at import time, so it is imported only once the data is there
function boot() { return import('./engine/index.js').then(() => { try { restore(); } catch (e) {} }); }
const getJSON = (u, id, name) => tfetch(id, { name, group: 'catalogue' }, u).then(r => { if (!r.ok) throw new Error(u + ' → HTTP ' + r.status); return r.json(); });
const fail = e => { document.body.innerHTML = '<p style="color:#e9edfa;font-family:monospace;padding:2em">Error loading data: ' + e + '</p>'; };
if (window.__DATA__) boot().catch(fail);
else Promise.all([getJSON('data/data.json?b=' + __BUILD__, 'data-json', 'data.json · stars, exoplanets, galaxies'), getJSON('data/catalog.json?b=' + __BUILD__, 'catalog-json', 'catalog.json · solar system, deep sky, pulsars')])
  .then(([d, c]) => { window.__DATA__ = d; window.__CATALOG__ = c; const m = d.meta || {}; count('data-json', (m.nHyg || 0) + (m.nStars || 0) + (m.nGal || 0)); count('catalog-json', Object.keys(c || {}).length); return boot(); })
  .catch(fail);
