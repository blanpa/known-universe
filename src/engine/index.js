// Engine entry: wires the modules together and boots.
import { UI, api } from '../lib/api.js';
import { LIVE, startLive } from '../lib/live.js';
import { doSearch, facColorToggle, facList, objWorld, toggleFac } from './actions.js';
import { clickToggle } from './controls.js';
import { initGL, loadExtragal, loadGaia } from './gl.js';
import { zoomFactorAt } from './interact.js';
import { frame } from './loop.js';
import { suggestList } from './search.js';
import { applyHash } from './share.js';
import { S, V } from './state.js';
import { H, W, project } from './view.js';
// Known Universe engine — the renderer + app logic (framework-free by design).
// Svelte owns the DOM structure; this module binds to it by element id.

// This module runs at import time and expects the data to be there: main.js imports it
// dynamically once data.json and catalog.json have arrived (or were embedded).
// UI api FIRST: layer toggles + search stay usable even if a later boot step fails
api.clickToggle=clickToggle; api.doSearch=doSearch; api.suggest=suggestList;
api.toggleFac=toggleFac; api.facColorToggle=facColorToggle;
// ---- collapsible control groups ----
if(document.querySelectorAll) document.querySelectorAll('.ctl-h').forEach(h=>
  h.addEventListener('click',()=>h.parentElement.classList.toggle('closed')));
// ---- collapsible time bar ----
(function(){
  const B=document.body;
  const setMini=v=>{ if(B.classList){ B.classList.toggle('time-mini',v); V.dirty=true; } };
  if(document.querySelectorAll) document.querySelectorAll('.time-min').forEach(el=>
    el.addEventListener('click',e=>{ if(e.stopPropagation)e.stopPropagation(); setMini(!(B.classList&&B.classList.contains('time-mini'))); }));
  for(const id of ['hud-time','hud-soltime']){ const p=document.getElementById(id);
    if(p&&p.addEventListener) p.addEventListener('click',()=>{ if(B.classList&&B.classList.contains('time-mini')) setMini(false); }); }
})();
// ---- mobile drawers ----
(function(){
  const B=document.body;
  // FAB toggling is inline onclick on the elements (parse-time, mobile-safe)
  try{
    if(matchMedia('(max-width:720px)').matches && B.appendChild)
      B.appendChild(document.getElementById('info'));   // bottom sheet must escape the hidden drawer
  }catch(e){}
})();
api.zoomBy=f=>{ let ax=W/2, ay=H/2;
  if(S.pinned){ const w=objWorld(S.pinned);
    if(w){ const p=project(w[0],w[1],w[2]);
      if(p.depth>V.NEAR&&p.x>0&&p.x<W&&p.y>0&&p.y<H){ ax=p.x; ay=p.y; } } }
  zoomFactorAt(ax,ay,f); V.dirty=true; };
// headless-verify hook: lets the test harness inspect/inject live-layer state
if(typeof window!=='undefined') window.__ku={api, live:LIVE, redraw:()=>{V.dirty=true;}};
startLive();
if(UI.fac) UI.fac(facList);
// real scale is the default view — boot into it via the tested toggle conversion,
// unless a share link (hash) decides the scale itself
if(!((typeof location!=='undefined'&&location.hash)||'').includes('v1_')) clickToggle('t-real');
applyHash();
try{console.log('Known Universe build 2026-07-12 11:57');}catch(e){}
initGL();
loadGaia();
loadExtragal();
requestAnimationFrame(frame);
window.__kuapi=api;
