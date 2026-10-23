// Engine entry: wires the modules together and boots.
import { api } from '../lib/api.js';
import { LIVE, startLive } from '../lib/live.js';
import { facList as facListStore } from '../lib/stores.js';
import { facList, objWorld } from './actions.js';
import { clickToggle } from './controls.js';
import { STARS } from './data.js';
import { SKYSTAT, gaiaPm, gaiaRange, initGL, loadExtragal, loadGaia } from './gl.js';
import { zoomFactorAt } from './interact.js';
import { frame } from './loop.js';
import { suggestList } from './search.js';
import { applyHash } from './share.js';
import { HYG } from './solar-data.js';
import { S, V } from './state.js';
import { SKY_R_PC, ST, cacheSize } from './survey.js';
import { USER, restoreUser, userProj } from './userdata.js';
import { H, W, project, projectInto, scale } from './view.js';
// This module runs at import time and expects the data to be there: main.js imports it
// dynamically once data.json and catalog.json have arrived (or were embedded).
import './timeline.js';
import './tour.js';
import './measure.js';
import './solar-live.js';   // live layers register their draw hooks

api.clickToggle=clickToggle; api.suggest=suggestList; api.getS=()=>S;
api.getCam=()=>({camZ:S.camZ, tgt:V.tgtCamZ, real:S.realScale});
api.searchInput=q=>{ if(q&&q.trim().length>2) api.doSearch(q); };
api.zoomBy=f=>{ let ax=W/2, ay=H/2;
  if(S.pinned){ const w=objWorld(S.pinned);
    if(w){ const p=project(w[0],w[1],w[2]);
      if(p.depth>V.NEAR&&p.x>0&&p.x<W&&p.y>0&&p.y<H){ ax=p.x; ay=p.y; } } }
  zoomFactorAt(ax,ay,f); V.dirty=true; };
api.liveStats=()=>{ const y=new Date().getFullYear();
  let n=0; for(const st of STARS) if(st.fy===y) n++;
  return {exoY:n, year:y}; };
LIVE.onUpdate=()=>{ V.dirty=true; };
// headless-verify hook: lets the test harness inspect/inject live-layer state
restoreUser();
window.__ku={api, live:LIVE, redraw:()=>{V.dirty=true;}, survey:{ST, SKYSTAT, cacheSize}, user:USER, userProj, hyg:HYG, projDir:(x,y,z)=>{ const R=scale(SKY_R_PC), o={}; projectInto(x*R,y*R,z*R,o); return o; }, get gaiaPm(){ return gaiaPm; }, get gaiaRange(){ return gaiaRange; }, sunScreen:()=>{ const o={}; projectInto(0,0,0,o); return o; }};
window.__kuapi=api;

facListStore.set(facList);
startLive();
// real scale is the default view — boot into it via the tested toggle conversion,
// unless a share link (hash) decides the scale itself
if(!(location.hash||'').includes('v1_')) clickToggle('t-real');
applyHash();
initGL();
loadGaia();
loadExtragal();
requestAnimationFrame(frame);
