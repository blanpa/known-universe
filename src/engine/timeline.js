// Time: one number line drives the solar ephemeris (±100 yr) and the stars' 3D motion
// (±2 Myr). Cubic slider mapping: fine control near today, deep time at the ends.
import { api } from '../lib/api.js';
import { timeline as timelineStore } from '../lib/stores.js';
import { S, V } from './state.js';

let _v=0, _timer=null;
const SPAN=2e6;                                              // years at the slider's ends
export const yearsOf=v=>Math.sign(v)*Math.pow(Math.abs(v)/1000,3)*SPAN;
export const sliderOf=t=>Math.sign(t)*1000*Math.cbrt(Math.min(1,Math.abs(t)/SPAN));
function label(v,t){
  if(v===0) return 'today';
  const sg=t>0?'+':'−', a=Math.abs(t);
  if(a<200) return new Date(Date.now()+t*31557600000).toISOString().slice(0,10);
  if(a>=1e6) return sg+(a/1e6).toFixed(2)+' Myr';
  if(a>=1e4) return sg+(a/1e3).toFixed(0)+',000 yr';
  const yr=new Date().getFullYear()+t;
  return sg+Math.round(a).toLocaleString('en-US')+' yr ('+Math.round(yr)+')';
}
function publish(){ const t=yearsOf(_v);
  timelineStore.set({v:_v, label:label(_v,t), playing:!!_timer}); }
export function setTime(v){                                   // v: −1000 … 1000
  _v=Math.max(-1000,Math.min(1000,+v||0));
  const t=yearsOf(_v);                                        // years from today
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
