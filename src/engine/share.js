// Shareable views (URL hash).
import { searchMsg } from './actions.js';
import { TOGGLE_REG, syncToggle } from './controls.js';
import { S, V } from './state.js';
import { ctr, tgtCtr } from './view.js';
// ---- shareable views: encode camera + layers in the URL hash ----
// fixed bit order: the original keys in their historical (sorted) positions,
// later additions appended — so old share links keep decoding correctly
const HASH_KEYS=['ast','autorot','belt','con','dso','edge','freelook','gaia','galaxies',
  'gpu','helio','hyg','hz','moons','mw','mw3d','ob','oclu','probes','psr','qso','rings',
  'size','tno','vars','veil','web','lag','lens','iso','eht','radio','bubble','grid','ggrid'];
function viewHash(){
  const keys=HASH_KEYS;
  let m=0; keys.forEach((k,i)=>{ if(S[k]) m|=(1<<i); });
  return 'v1_'+[S.yaw.toFixed(4),S.pitch.toFixed(4),S.camZ.toExponential(4),
    ctr.x.toExponential(4),ctr.y.toExponential(4),ctr.z.toExponential(4),
    S.realScale?1:0,Math.round(S.tOffsetDays),(m>>>0).toString(36)].join('_');
}
export function applyHash(){
  try{
    const h=(typeof location!=='undefined'&&location.hash||'').replace(/^#/,'');
    if(!h.startsWith('v1_')) return;
    const p=h.split('_'); if(p.length<10) return;
    S.yaw=V.tgtYaw=+p[1]; S.pitch=V.tgtPitch=+p[2]; S.camZ=V.tgtCamZ=+p[3];
    ctr.x=tgtCtr.x=+p[4]; ctr.y=tgtCtr.y=+p[5]; ctr.z=tgtCtr.z=+p[6];
    S.realScale=p[7]==='1'; syncToggle('t-real',S.realScale);
    S.tOffsetDays=+p[8]||0;
    const m=parseInt(p[9],36)||0;
    HASH_KEYS.forEach((k,i)=>{ if(!TOGGLE_REG[k]) return;
      const v=!!(m&(1<<i)); S[k]=v; syncToggle(TOGGLE_REG[k],v); });
    document.getElementById('hud-mwmap').style.display=S.mw?'block':'none';
    V.dirty=true;
  }catch(e){}
}
let lastHash='';
if(typeof history!=='undefined'&&history.replaceState){
  setInterval(()=>{ const h=viewHash();
    if(h!==lastHash){ lastHash=h; try{history.replaceState(null,'','#'+h);}catch(e){} } },2000);
}
document.getElementById('shareBtn').addEventListener('click',()=>{
  const h=viewHash(); try{history.replaceState(null,'','#'+h);}catch(e){}
  const u=(typeof location!=='undefined')?location.href:h;
  const done=()=>{searchMsg.textContent='view link copied ✓';};
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(done,()=>{searchMsg.textContent=u;});
  else searchMsg.textContent=u;
});
