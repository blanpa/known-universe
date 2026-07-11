import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { UI, runEngine } from './lib/engine.js';
import { toggleState } from './lib/stores.js';

mount(App, { target: document.getElementById('app') });

// engine -> UI bridge
UI.syncToggle = (id, on) => toggleState.update(m => ({ ...m, [id]: on }));

// boot: embedded data (artifact) or fetch (Pages/Docker)
if (window.__DATA__) runEngine();
else fetch('data/data.json').then(r => r.json())
  .then(d => { window.__DATA__ = d; runEngine(); })
  .catch(e => { document.body.innerHTML = '<p style="color:#e9edfa;font-family:monospace;padding:2em">Error loading data: ' + e + '</p>'; });
