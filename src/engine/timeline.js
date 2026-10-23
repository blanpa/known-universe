// Time: the unified timeline and the legacy solar-time controls.
import { api } from '../lib/api.js';
import { svgIcon } from '../lib/icons.js';
import { LIVE } from '../lib/live.js';
import { aim, doSearch, enterSolar, facColorToggle, facList, searchMsg, toggleFac } from './actions.js';
import { clickToggle } from './controls.js';
import { STARS } from './data.js';
import { suggestList } from './search.js';
import { dateStr, eclToWorld, keplerSB, orbPoint, solarJD } from './solar-data.js';
import { S, V } from './state.js';
import { AU_PC, scale } from './view.js';
// ---- solar-system time travel ----
export const solTime=document.getElementById('solTime'), solDate=document.getElementById('solDate'),
      solIcon=document.getElementById('solIcon');
export let solPlaying=false, solAcc=0;
export function setSolDate(){ solDate.textContent=dateStr(solarJD());
  solTime.style.setProperty('--pct',((S.tOffsetDays+36525)/73050*100)+'%'); }
export function solStop(){ solPlaying=false; solIcon.innerHTML='<path d="M3 2l11 6L3 14z"/>'; }
function solStart(){ if(S.tOffsetDays>=36525) {S.tOffsetDays=-36525;solTime.value=-36525;}
  solPlaying=true; solIcon.innerHTML='<path d="M3 2h4v12H3zM9 2h4v12H9z"/>'; }
solTime.addEventListener('input',e=>{ S.tOffsetDays=+e.target.value; setSolDate(); solStop(); });
document.getElementById('solPlay').addEventListener('click',()=>{ solPlaying?solStop():solStart(); });
document.getElementById('solNow').addEventListener('click',()=>{ S.tOffsetDays=0; solTime.value=0; setSolDate(); solStop(); });
setSolDate();

// ---- unified timeline: one number line drives solar ephemeris + stellar proper motion ----
const uniEl=document.getElementById('uniTime'), uniVal=document.getElementById('uniVal');
const uniPlayBtn=document.getElementById('uniPlay'), uniNowBtn=document.getElementById('uniNow');
function setUni(v){
  const t=Math.sign(v)*Math.pow(Math.abs(v)/1000,3)*50000;       // cubic: fine control near today
  S.pmYears=Math.round(t); S.pm=(v!==0);
  S.tOffsetDays=Math.max(-36525,Math.min(36525,t*365.25));       // solar ephemeris valid ±100 yr
  if(typeof setSolDate==='function') try{setSolDate();}catch(err){}
  if(uniVal){ const yr=new Date().getFullYear()+t;
    uniVal.textContent = v===0?'today':(Math.abs(t)<200
      ? new Date(Date.now()+t*31557600000).toISOString().slice(0,10)
      : (t>0?'+':'−')+Math.abs(Math.round(t)).toLocaleString('en-US')+' yr ('+Math.round(yr)+')'); }
  V.dirty=true;
}
let uniTimer=null;
if(uniEl&&uniEl.addEventListener){
  uniEl.addEventListener('input',ev=>setUni(+ev.target.value));
  if(uniPlayBtn) uniPlayBtn.addEventListener('click',()=>{
    if(uniTimer){ clearInterval(uniTimer); uniTimer=null; uniPlayBtn.innerHTML=svgIcon('play',14); }
    else { uniPlayBtn.innerHTML=svgIcon('pause',14);
      uniTimer=setInterval(()=>{ let v=+uniEl.value+2; if(v>1000)v=-1000; uniEl.value=v; setUni(v); },120); }
  });
  if(uniNowBtn) uniNowBtn.addEventListener('click',()=>{ uniEl.value=0; setUni(0);
    if(uniTimer){clearInterval(uniTimer);uniTimer=null;if(uniPlayBtn)uniPlayBtn.innerHTML=svgIcon('play',14);} });
}
api.clickToggle=clickToggle; api.doSearch=doSearch; api.getS=()=>S; api.suggest=suggestList;
api.getCam=()=>({camZ:S.camZ, tgt:V.tgtCamZ, real:S.realScale});
api.searchMsgText=()=>searchMsg.textContent; api.toggleFac=toggleFac; api.facColorToggle=facColorToggle;
api.facList=()=>facList; api.searchInput=q=>{ if(q&&q.trim().length>2) doSearch(q); };
// live layer: fly to a close-approach NEO from the panel list
api.liveNeoFocus=id=>{
  const o=LIVE.neos.find(n=>n.id===id); if(!o) return;
  if(o.kd){ o._el=keplerSB(o.kd,solarJD()); o._e=orbPoint(o._el,o._el.E);
    const w=eclToWorld(o._e[0],o._e[1],o._e[2]);
    S.pinned=o; aim(w[0],w[1],w[2], scale(2.2*AU_PC)); }
  else { S.pinned=null; enterSolar(); }
  V.dirty=true;
};
api.liveStats=()=>{ const y=new Date().getFullYear();
  let n=0; for(const st of STARS) if(st.fy===y) n++;
  return {exoY:n, year:y}; };
LIVE.onUpdate=()=>{ V.dirty=true; };
