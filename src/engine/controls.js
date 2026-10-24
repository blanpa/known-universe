// Layer toggles: the registry the UI drives.
import { api } from '../lib/api.js';
import { toggleState } from '../lib/stores.js';
import { objWorld } from './actions.js';
import { zoomRange } from './interact.js';
import { S, V } from './state.js';
import { KDEC, LOG0, REALK, ctr, scale, tgtCtr } from './view.js';
// ---- controls ----
export function syncToggle(id,on){ toggleState.update(m => ({ ...m, [id]: on })); }
export const TOGGLE_REG={}, TOGGLE_ACT={};
export function bindToggle(id,key,fn){ TOGGLE_REG[key]=id; TOGGLE_ACT[id]={key,fn}; }
export function clickToggle(id){ const t=TOGGLE_ACT[id]; if(!t) return;
  S[t.key]=!S[t.key]; syncToggle(id,S[t.key]); if(t.fn)t.fn(); V.dirty=true; }
// set a toggle to an explicit value (presets + restored session state) — no-op if already there
function setToggle(id,on){ const t=TOGGLE_ACT[id]; if(!t) return; if(!!S[t.key]===!!on) return; clickToggle(id); }
api.setToggle=setToggle;
api.toggleIds=()=>Object.keys(TOGGLE_ACT);
api.readToggles=()=>{ const o={}; for(const id in TOGGLE_ACT) o[id]=!!S[TOGGLE_ACT[id].key]; return o; };
bindToggle('t-rot','autorot');
bindToggle('t-freelook','freelook');
bindToggle('t-hyg','hyg');
bindToggle('t-user','user');
bindToggle('t-gpu','gpu');
bindToggle('t-gaia','gaia');
bindToggle('t-ruwe','ruwe');
bindToggle('t-web','web');
bindToggle('t-ob','ob');
bindToggle('t-var','vars');
bindToggle('t-qso','qso');
bindToggle('t-edge','edge');
bindToggle('t-size','size');
bindToggle('t-veil','veil');
bindToggle('t-rings','rings');
bindToggle('t-gal','galaxies');
bindToggle('t-dso','dso');
bindToggle('t-mw3d','mw3d');
bindToggle('t-psr','psr');
bindToggle('t-oclu','oclu');
// real ↔ logarithmic scale — remap camera to keep the same physical framing
bindToggle('t-real','realScale',()=>{
  const wasReal=!S.realScale;                       // clickToggle already flipped S
  const inv=v=> wasReal ? v/REALK : Math.pow(10, v/KDEC + LOG0);
  // Convert the zoom TARGET as well as the current value. camZ lerps toward V.tgtCamZ, so
  // during a fast scroll they are far apart; converting only camZ (as this did) left
  // V.tgtCamZ in the old mode's units and threw the camera to the opposite end of the
  // scale — the "zoom suddenly goes somewhere else" symptom.
  const physCam=inv(S.camZ), physTgt=inv(V.tgtCamZ);
  const cm=Math.hypot(ctr.x,ctr.y,ctr.z), physCtr=cm>0?inv(cm):0;
  // clamp both ends: deep real zoom maps below the log-scale zero, and a compact camZ
  // near the ceiling maps above real's (camZ=0 or an out-of-range camZ breaks projection)
  const zr=zoomRange(), cl=v=>Math.max(zr[0],Math.min(zr[1],v));
  S.camZ=cl(scale(physCam)); V.tgtCamZ=cl(scale(physTgt));
  if(cm>0){ const nm=scale(physCtr)/cm; ctr.x*=nm;ctr.y*=nm;ctr.z*=nm;
    tgtCtr.x=ctr.x;tgtCtr.y=ctr.y;tgtCtr.z=ctr.z; }
  if(V.focusSys) V.focusSysW=objWorld(V.focusSys);
});
bindToggle('t-con','con');
bindToggle('t-hz','hz');
bindToggle('t-moons','moons');
bindToggle('t-ast','ast');
bindToggle('t-tno','tno');
bindToggle('t-probes','probes');
bindToggle('t-helio','helio');
bindToggle('t-belt','belt');
bindToggle('t-lag','lag');
bindToggle('t-lens','lens');
bindToggle('t-iso','iso');
bindToggle('t-eht','eht');
bindToggle('t-labels','labels');
bindToggle('t-radio','radio');
bindToggle('t-bubble','bubble');
bindToggle('t-grid','grid');
bindToggle('t-ggrid','ggrid');
bindToggle('t-cme','cme');
bindToggle('t-neo','neo');
bindToggle('t-sat','sat');
bindToggle('t-sun','sunAR');
bindToggle('t-met','met');
// proper motion: driven by the unified timeline (S.pmYears); the flag just gates the layer
bindToggle('t-pm','pm',()=>{ if(!S.pm) S.pmYears=0; });
bindToggle('t-mw','mw');
