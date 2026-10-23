// Time: one number line drives the solar ephemeris (±100 yr) and stellar proper
// motion (±50,000 yr). Cubic slider mapping: fine control near today, deep time at the ends.
import { api } from '../lib/api.js';
import { timeline as timelineStore } from '../lib/stores.js';
import { S, V } from './state.js';

let _v=0, _timer=null;
function label(v,t){
  if(v===0) return 'today';
  if(Math.abs(t)<200) return new Date(Date.now()+t*31557600000).toISOString().slice(0,10);
  const yr=new Date().getFullYear()+t;
  return (t>0?'+':'−')+Math.abs(Math.round(t)).toLocaleString('en-US')+' yr ('+Math.round(yr)+')';
}
function publish(){ const t=Math.sign(_v)*Math.pow(Math.abs(_v)/1000,3)*50000;
  timelineStore.set({v:_v, label:label(_v,t), playing:!!_timer}); }
export function setTime(v){                                   // v: −1000 … 1000
  _v=Math.max(-1000,Math.min(1000,+v||0));
  const t=Math.sign(_v)*Math.pow(Math.abs(_v)/1000,3)*50000;  // years from today
  S.pmYears=Math.round(t); S.pm=(_v!==0);
  S.tOffsetDays=Math.max(-36525,Math.min(36525,t*365.25));   // solar ephemeris valid ±100 yr
  publish(); V.dirty=true;
}
function play(){
  if(_timer){ clearInterval(_timer); _timer=null; publish(); return; }
  _timer=setInterval(()=>{ let v=_v+2; if(v>1000) v=-1000; setTime(v); },120);
  publish();
}
function now(){ if(_timer){ clearInterval(_timer); _timer=null; } setTime(0); }
api.timeline={ set:setTime, play, now };
