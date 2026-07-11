import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { UI, runEngine } from './lib/engine.js';
import { toggleState, labels, searchMsg, facList } from './lib/stores.js';

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

// engine -> UI bridge (stores only; components own the DOM)
UI.syncToggle = (id, on) => toggleState.update(m => ({ ...m, [id]: on }));
UI.setLabel   = (id, txt) => labels.update(m => ({ ...m, [id]: txt }));
UI.msg        = txt => searchMsg.set(txt);
UI.fac        = list => facList.set(list);

// boot: embedded data (artifact) or fetch (Pages/Docker)
if (window.__DATA__) runEngine();
else fetch('data/data.json').then(r => r.json())
  .then(d => { window.__DATA__ = d; runEngine(); })
  .catch(e => { document.body.innerHTML = '<p style="color:#e9edfa;font-family:monospace;padding:2em">Error loading data: ' + e + '</p>'; });
