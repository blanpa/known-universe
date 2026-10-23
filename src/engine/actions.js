// Actions: everything a button, a key or a search can ask the engine to do.
import { api } from '../lib/api.js';
import { facColor as facColorStore, searchMsg as searchMsgStore, timeBar as timeBarStore } from '../lib/stores.js';
import { clickToggle, syncToggle } from './controls.js';
import { GAL, PC2LY, STARS } from './data.js';
import { physPos, worldPos } from './entity.js';
import { fmt } from './hud.js';
import { zoomRange } from './interact.js';
import { ENCOUNTERS, hostPos, hygPos, tNow } from './motion.js';
import { CLUSTERS, DSO, PULSARS, SGRA } from './sky-data.js';
import { FAC, HYG, PROBES, SMALL, SOLAR_BODIES, SUN, TNOS } from './solar-data.js';
import { ISO } from './solar.js';
import { S, V } from './state.js';
import { setTime, sliderOf } from './timeline.js';
import { computeRoute, computeTransfer } from './transfer.js';
import { camCosmos, camSolar, compress, invScale, scale, tgtCtr } from './view.js';
// Each is a plain function; the ones the UI needs are published on `api` at the end.

// ---- one-line feedback (search, measure, share) ----
let _lastMsg='';
export function msg(t){ _lastMsg=t||''; searchMsgStore.set(_lastMsg); }
export const msgText=()=>_lastMsg;

// ---- the selected object ----
const current=()=>S.pinned||S.hover;
export function deselect(){ S.pinned=null; S.hover=null; V.FOLLOW=null; V.lastInfo=undefined; V.dirty=true; }
export function lockToggle(){                 // keep it centred while zooming / time-travelling
  const b=current(); if(!b) return;
  if(V.FOLLOW===b) V.FOLLOW=null;
  else { const w=worldPos(b);
    if(w){ tgtCtr.x=w[0]; tgtCtr.y=w[1]; tgtCtr.z=w[2]; V.FOLLOW=b; S.autorot=false; syncToggle('t-rot',false); } }
  V.lastInfo=undefined; V.dirty=true;
}
export function setCourse(){ const b=current(); if(!b||!physPos(b)) return; V.navTarget=b; V.lastInfo=undefined; V.dirty=true; }
export function clearCourse(){ V.navTarget=null; V.lastInfo=undefined; V.dirty=true; }
export function engageCourse(){
  const t=V.navTarget; if(!t) return;
  if(t.p&&t._dx!==undefined){ V.focusSys=t; V.focusSysW=objWorld(t); }
  if(objWorld(t)) flyTo(t);
  else { const w=worldPos(t); if(w) aim(w[0],w[1],w[2], scale(3e-6)); }
}
export function routeToggle(){                // 1g starship to a star / galaxy / anything cosmic
  const b=current(); if(!b) return;
  if(V.ROUTE&&V.ROUTE.o===b){ V.ROUTE=null; V.lastInfo=undefined; V.dirty=true; } else computeRoute(b);
}
export function transferToggle(){             // Lambert transfer Earth → a solar-system body
  const b=current(); if(!b) return;
  if(V.TRANSFER&&V.TRANSFER.to===b){ V.TRANSFER=null; V.lastInfo=undefined; V.dirty=true; } else computeTransfer(b);
}

// ---- camera moves ----
// the compact overview: everything in one view, distances compressed (the tour uses it)
export function goCosmos(){ if(S.realScale) clickToggle('t-real'); V.tgtCamZ=camCosmos(); }
export function enterSolar(){ S.pinned=null; S.hover=null; V.tgtCamZ=camSolar(); V.tgtPitch=-0.5;
  tgtCtr.x=tgtCtr.y=tgtCtr.z=0; }
// Neither of these changes the scale mode: "Back out" and "Reset" used to jump to the
// compact overview, so switching the compact view off never stuck — it came back with
// the next button. The mode is the user's choice; only the tour and the far rungs of
// the ladder (beyond what real scale can hold) switch it, and say so.
export function toggleSolar(){                 // fly in / back out — a pure camera move along the scale
  if(V.solarA>0.5){                            // out to the nearest stars, in the current mode
    V.FOLLOW=null; V.focusSys=null; V.tgtPitch=-0.35; tgtCtr.x=tgtCtr.y=tgtCtr.z=0; V.tgtCamZ=scale(6); }
  else enterSolar();
  S.pinned=null; V.dirty=true;
}
export function resetView(){                   // the view you started with
  V.tgtYaw=0.5; V.tgtPitch=-0.5; S.focusStar=null; S.pinned=null; S.hover=null;
  V.focusSys=null; V.FOLLOW=null; V.navTarget=null; V.ROUTE=null; V.TRANSFER=null;
  tgtCtr.x=tgtCtr.y=tgtCtr.z=0;                    // back to the Sun
  if(!S.realScale) clickToggle('t-real');          // the start is real scale …
  V.tgtCamZ=camSolar();                            // … framing Neptune's orbit
  S.autorot=false; syncToggle('t-rot',false); V.lastInfo=undefined; V.dirty=true;
}
// the scale ladder: frame `pc` parsec around the current centre, keeping the heading
// and the scale mode (real scale reaches the CMB, so no rung needs the compact view).
export function flyToScale(pc){
  if(!(pc>0)) return;
  const zr=zoomRange(); V.FOLLOW=null;
  V.tgtCamZ=Math.max(zr[0],Math.min(zr[1],scale(pc))); V.dirty=true;
}

// ---- discovery instruments: colour switch + filter chips ----
export function facColorToggle(){ S.facColor=!S.facColor; facColorStore.set(S.facColor); V.dirty=true; return S.facColor; }
const facCount={}; for(const s of STARS) facCount[s.fac]=(facCount[s.fac]||0)+1;
export const facList=Object.keys(FAC).filter(k=>facCount[k]).sort((a,b)=>facCount[b]-facCount[a])
  .map(k=>({k, l:FAC[k].l, c:FAC[k].c, n:facCount[k]}));
export function toggleFac(k){ if(S.facHidden.has(k)) S.facHidden.delete(k); else S.facHidden.add(k);
  V.dirty=true; return S.facHidden.has(k); }

// ---- search ----
export function doSearch(q){
  q=q.trim().toLowerCase(); if(!q){msg('');return;}
  const eq=s=>s&&s.toLowerCase()===q, has=s=>s&&s.toLowerCase().includes(q);
  const cands=[];
  const push=(t,o)=>{ if(o) cands.push([t,o]); };
  // the galactic centre is a special object, not in any catalogue list
  if(/^(sgr ?a\*?|sagittarius a\*?|galactic cent(er|re))$/.test(q)){
    msg('→ Sgr A* · galactic centre');
    if(!S.mw){S.mw=true;syncToggle('t-mw',true);}
    V.focusSys=null; S.pinned=SGRA; flyTo(SGRA); return; }
  // exact first
  push('iso', ISO.find(o=>eq(o.n)));
  push('small',SMALL.find(o=>eq(o.n)));
  push('dso', DSO.find(o=>eq(o.n)));
  push('hyg', HYG.find(s=>eq(s.n)));
  push('gal', GAL.find(g=>eq(g.n)||eq(g.id)));
  push('star',STARS.find(s=>eq(s.h)));
  push('body',SOLAR_BODIES.find(b=>eq(b.n))||(eq('sun')?SUN:null));
  push('probe',PROBES.find(p=>eq(p.n)));
  push('tno2',TNOS.find(t2=>eq(t2.n)));
  push('psr',PULSARS.find(o=>eq(o.n)));
  push('clu',CLUSTERS.find(c=>eq(c.n)));
  // substring fallback — ISO first: "borisov"/"atlas" should hit 2I/3I, not namesake comets
  push('iso', ISO.find(o=>has(o.n)));
  push('small',SMALL.find(o=>has(o.n)));
  push('dso', DSO.find(o=>has(o.n)));
  push('hyg', HYG.find(s=>has(s.n)));
  push('gal', GAL.find(g=>has(g.n)||has(g.id)));
  push('star',STARS.find(s=>s._search.includes(q)));
  push('body',SOLAR_BODIES.find(b=>has(b.n)));
  push('probe',PROBES.find(p=>has(p.n)));
  push('tno2',TNOS.find(t2=>has(t2.n)));
  push('psr',PULSARS.find(o=>has(o.n)));
  push('clu',CLUSTERS.find(c=>has(c.n)));
  if(!cands.length){msg('nothing found');return;}
  const [t,o]=cands[0];
  if(t==='iso'){ msg('→ '+o.n+' (interstellar)');
    if(!S.iso){S.iso=true;syncToggle('t-iso',true);} V.focusSys=null; enterSolar(); S.pinned=o; return; }
  if(t==='small'){ msg('→ '+o.n+' ('+o.kind+')');
    if(!S.ast){S.ast=true;syncToggle('t-ast',true);} V.focusSys=null; enterSolar(); S.pinned=o; return; }
  if(t==='body'){ msg('→ '+o.n+' ('+(o.kind||'')+')');
    V.focusSys=null; enterSolar(); S.pinned=o; return; }   // pin AFTER enterSolar — it clears the pin
  if(t==='probe'||t==='tno2'){ msg('→ '+o.n+' ('+(o.kind||'')+')');
    if(t==='probe'&&!S.probes){S.probes=true;syncToggle('t-probes',true);}
    if(t==='tno2'&&!S.tno){S.tno=true;syncToggle('t-tno',true);}
    V.focusSys=null; enterSolar(); S.pinned=o; return; }
  if(t==='psr'||t==='clu'){ msg('→ '+o.n+' · '+fmt(o.d*PC2LY)+' ly');
    if(t==='psr'&&!S.psr){S.psr=true;syncToggle('t-psr',true);}
    if(t==='clu'&&!S.oclu){S.oclu=true;syncToggle('t-oclu',true);}
    V.focusSys=null; S.pinned=o;
    const R=scale(o.d); aim(o._dir[0]*R,o._dir[1]*R,o._dir[2]*R, scale(o.d*0.25)); return; }
  if(t==='dso'){ msg('→ '+o.n+' · '+fmt(o.d*PC2LY)+' ly');
    V.focusSys=null; S.pinned=o; if(!S.dso){S.dso=true;syncToggle('t-dso',true);}
    const R=scale(o.d); aim(o._dir[0]*R,o._dir[1]*R,o._dir[2]*R, scale(o.d*0.25)); }
  else if(t==='gal'){ msg('→ '+o.n+' · '+fmt(o.mpc*3.2616)+' Mly'); focusOnGalaxy(o); }
  else if(t==='hyg'){ msg('→ '+(o.n||'star')+' · '+fmt(o.d*PC2LY)+' ly'); focusOnHyg(o); }
  else { msg('→ '+o.h+' · '+fmt(o.d*PC2LY)+' ly'); focusOn(o); }
}

// ---- travel ----
export function aim(x,y,z,margin){        // move the view centre onto the target
  if(!isFinite(x+y+z+margin)) return;              // a NaN camera is a black screen
  V.FOLLOW=null;
  tgtCtr.x=x; tgtCtr.y=y; tgtCtr.z=z;
  V.tgtCamZ=Math.max(scale(3e-6), margin);
  S.autorot=false; syncToggle('t-rot',false);
}
// world position of a clickable cosmic object (null for solar bodies → handled by zoom)
export function objWorld(o){
  // compute from direction × distance — the cached _x is only set once the layer
  // has drawn, which never happens while parked in the solar system (NaN camera)
  if((o.psr||o.oclu||o.gpick||o.sgra||o.dso)&&o._dir&&o.d!==undefined){
    const R=scale(o.d); return [o._dir[0]*R,o._dir[1]*R,o._dir[2]*R]; }
  if(o.sgra||o.dso) return [o._x,o._y,o._z];                     // Sgr A* / deep-sky (fallback)
  if(o.mpc!==undefined) return [o._x,o._y,o._z];                       // galaxy
  const t=tNow();
  if(o.p && o._dx!==undefined){                                         // exoplanet host
    if(t){ const q=hostPos(o,t), L=Math.hypot(q[0],q[1],q[2])||1e-9, d=compress(L)/L; return [q[0]*d,q[1]*d,q[2]*d]; }
    const d=compress(o._r); return [o._dx*d,o._dy*d,o._dz*d]; }
  if(o.m!==undefined && o.dx!==undefined){                              // HYG star
    if(t){ const q=hygPos(o,t), L=Math.hypot(q[0],q[1],q[2])||1e-9, d=compress(L)/L; return [q[0]*d,q[1]*d,q[2]*d]; }
    const d=compress(o.d); return [o.dx*d,o.dy*d,o.dz*d]; }
  return null;
}
export function flyTo(o){
  const w=objWorld(o); if(!w) return;
  const physPc=invScale(Math.hypot(w[0],w[1],w[2]))||1;
  let m;
  if(o.p) m=S.realScale?scale(physPc*0.12):scale(3e-5);   // host: beside it (real) / into its system (log)
  else if(o.m!==undefined&&o.dx!==undefined) m=scale(physPc*0.2);   // field star
  else m=scale(physPc*0.25);                          // galaxy / DSO / Sgr A*
  aim(w[0],w[1],w[2],m);
}
export function focusOn(s){                       // exoplanet host → fly in & open its system
  S.pinned=s; S.focusStar=s; V.focusSys=s; V.focusSysW=objWorld(s);
  aim(V.focusSysW[0],V.focusSysW[1],V.focusSysW[2], S.realScale?scale(s._r*0.12):scale(3e-5));
}
export function focusOnGalaxy(g){
  if(!S.galaxies){S.galaxies=true;syncToggle('t-gal',true);}
  S.pinned=g; S.focusStar=null; V.focusSys=null;
  const R=scale(g.mpc*1e6);
  aim(g.dx*R,g.dy*R,g.dz*R, scale(g.mpc*1e6*0.25));
}
export function focusOnHyg(s){
  if(!S.hyg){S.hyg=true;syncToggle('t-hyg',true);}
  S.pinned=s; S.focusStar=null; V.focusSys=null;
  const dr=compress(s.d); aim(s.dx*dr,s.dy*dr,s.dz*dr, scale(s.d*0.2));
}

// a close stellar encounter: set the clock to the moment of closest approach and fly to the star
export function gotoEncounter(i){
  const e=ENCOUNTERS[i]; if(!e) return;
  timeBarStore.set(true);
  setTime(sliderOf(e.t));
  if(!S.hyg){S.hyg=true;syncToggle('t-hyg',true);}
  S.pinned=e.s; S.focusStar=null; V.focusSys=null; V.FOLLOW=null;
  const q=hygPos(e.s,e.t), L=Math.hypot(q[0],q[1],q[2])||1e-9, d=compress(L)/L;
  aim(q[0]*d,q[1]*d,q[2]*d, scale(Math.max(L*0.35, 3e-5)));
}
Object.assign(api, { gotoEncounter, lock:lockToggle, setCourse, clearCourse, engage:engageCourse, route:routeToggle,
  transfer:transferToggle, deselect, reset:resetView, toggleSolar, enterSolar, flyToScale,
  doSearch, toggleFac, facColorToggle, facList:()=>facList, msgText });
