import { Window } from 'happy-dom';
import fs from 'fs';
const win = new Window({ url: 'http://localhost/' });
const doc = win.document;
doc.body.innerHTML = '<div id="app"></div>';
for (const k of ['document','window','navigator','location','history','customElements',
  'HTMLElement','Element','Node','Event','CustomEvent','MutationObserver','ResizeObserver',
  'requestAnimationFrame','cancelAnimationFrame','getComputedStyle','Text','Comment','DocumentFragment','Document','CharacterData','SVGElement','HTMLInputElement','HTMLButtonElement','HTMLCanvasElement','CSSStyleSheet','DOMParser','NodeFilter','Range','Selection']) {
  if (win[k] !== undefined) globalThis[k] = win[k];
}
globalThis.window = win;
win.fetch = () => new Promise(() => {});   // hold the engine boot — we test the MOUNT only
globalThis.fetch = win.fetch;
win.matchMedia = globalThis.matchMedia = () => ({ matches:false, addEventListener(){}, removeEventListener(){} });
const js = fs.readdirSync('dist/assets').find(f => f.endsWith('.js'));
try {
  await import('../dist/assets/' + js);
  await new Promise(r => setTimeout(r, 300));
  const ids = ['hud-tl','hud-search','hud-ctl','hud-time','tourPanel','mobbar','info','resetBtn'];
  const missing = ids.filter(id => !doc.getElementById(id));
  const toggles = doc.querySelectorAll('.toggle').length;
  console.log('MOUNT OK | missing ids:', missing.length ? missing : 'none', '| toggles rendered:', toggles);
} catch (e) {
  console.log('MOUNT FAILED:', e.message);
  console.log((e.stack||'').split('\n').slice(0,6).join('\n'));
}
