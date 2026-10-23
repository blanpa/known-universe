// Shareable views (URL hash).
import { api } from '../lib/api.js';
import { msg } from './actions.js';
import { TOGGLE_REG, syncToggle } from './controls.js';
import { S, V } from './state.js';
import { ST, setBlink, setSurvey } from './survey.js';
import { ctr, tgtCtr } from './view.js';
// ---- shareable views: encode camera + layers in the URL hash ----
// fixed bit order: the original keys in their historical (sorted) positions,
// later additions appended — so old share links keep decoding correctly
const HASH_KEYS=['ast','autorot','belt','con','dso','edge','freelook','gaia','galaxies',
  'gpu','helio','hyg','hz','moons','mw','mw3d','ob','oclu','probes','psr','qso','rings',
  'size','tno','vars','veil','web','lag','lens','iso','eht','radio','bubble','grid','ggrid'];
// BigInt: 35 layer bits do not fit a 32-bit shift (`1<<33` is 2, so 'bubble' used to
// land on the 'ast' bit). The low 31 bits are unchanged, so older links still decode.
function viewHash(){
  let m=0n; HASH_KEYS.forEach((k,i)=>{ if(S[k]) m|=(1n<<BigInt(i)); });
  const parts=[S.yaw.toFixed(4),S.pitch.toFixed(4),S.camZ.toExponential(4),
    ctr.x.toExponential(4),ctr.y.toExponential(4),ctr.z.toExponential(4),
    S.realScale?1:0,Math.round(S.tOffsetDays),m.toString(36)];
  // the telescope, appended so older links stay valid: s<zoom>-<survey>-<blink partner or 0>
  if(S.skyMode) parts.push('s'+V.fovK.toPrecision(4)+'-'+(ST.on?ST.id:'0')+'-'+(ST.blink?ST.blinkWith:'0'));
  return 'v1_'+parts.join('_');
}
function parse36(s){ let m=0n; for(const ch of s){ const d=parseInt(ch,36); if(isNaN(d)) return 0n; m=m*36n+BigInt(d); } return m; }
export function applyHash(){
  try{
    const h=(typeof location!=='undefined'&&location.hash||'').replace(/^#/,'');
    if(!h.startsWith('v1_')) return;
    const p=h.split('_'); if(p.length<10) return;
    S.yaw=V.tgtYaw=+p[1]; S.pitch=V.tgtPitch=+p[2]; S.camZ=V.tgtCamZ=+p[3];
    ctr.x=tgtCtr.x=+p[4]; ctr.y=tgtCtr.y=+p[5]; ctr.z=tgtCtr.z=+p[6];
    S.realScale=p[7]==='1'; syncToggle('t-real',S.realScale);
    S.tOffsetDays=+p[8]||0;
    const m=parse36(p[9]);
    HASH_KEYS.forEach((k,i)=>{ if(!TOGGLE_REG[k]) return;
      const v=!!(m&(1n<<BigInt(i))); S[k]=v; syncToggle(TOGGLE_REG[k],v); });
    if(p[10]&&p[10][0]==='s'){                            // a shared telescope field
      const q=p[10].slice(1).split('-');
      S.skyMode=true; V.fovK=Math.max(1,Math.min(6000,+q[0]||1));
      setSurvey(q[1]&&q[1]!=='0'?q[1]:null); if(q[2]&&q[2]!=='0') setBlink(true,q[2]);
    }
    V.dirty=true;
  }catch(e){}
}
let lastHash='';
if(typeof history!=='undefined'&&history.replaceState){
  setInterval(()=>{ const h=viewHash();
    if(h!==lastHash){ lastHash=h; try{history.replaceState(null,'','#'+h);}catch(e){} } },2000);
}
export function share(){
  const h=viewHash(); try{history.replaceState(null,'','#'+h);}catch(e){}
  const u=(typeof location!=='undefined')?location.href:h;
  if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(u).then(()=>msg('View link copied'),()=>msg(u));
  else msg(u);
  return u;
}
api.share=share;
