// The observer: a place on Earth and a clock turn the telescope into an instrument that
// knows where up is. Altitude, azimuth, airmass, hour angle for the field, the cursor and
// every card; rise, transit and set; twilight; the horizon drawn across the sky; apparent
// coordinates of date on request; an instrument's field as a frame; a finder chart as PNG.
// All the maths is src/lib/astro.js (checked against astropy); this file is the plumbing.
import { api } from '../lib/api.js';
import { airmass, altaz, apparentOf, dateOfICRS, fmtHM, icrsOfDate, jdOf, radec, refraction, riseSet, sunRiseSet, vec } from '../lib/astro.js';
import { observer as store } from '../lib/stores.js';
import { ctx, cv } from './canvas.js';
import { pathBegin, pathPt, pathStroke } from './draw.js';
import { glcv } from './gl.js';
import { LBL, P_GRID, P_HUD } from './labels.js';
import { SKY_R_PC, fovDeg } from './survey.js';
import { S, V } from './state.js';
import { H, W, camDist, camFwd, project, scale } from './view.js';
const KEY='ku_observer_v1';
export const OBS={ on:false, lat:0, lon:0, elev:0, name:'', frame:'icrs', refract:true,
  frameOn:false, fl:1000, sw:23.5, sh:15.6, px:3.76, pa:0, instr:'' };
export const OBSSTAT={ horizon:0, frame:0 };                 // what the last frame drew (the e2e run reads it)
export const PRESETS=[
  { n:'APS-C DSLR · 200 mm',  fl:200,  sw:23.5, sh:15.6, px:3.9 },
  { n:'APS-C · 80 mm refractor (f/6)', fl:480, sw:23.5, sh:15.6, px:3.9 },
  { n:'ASI533MC · 8″ SCT (f/10)', fl:2032, sw:11.3, sh:11.3, px:3.76 },
  { n:'ASI294MC · 8″ Newton (f/5)', fl:1000, sw:19.1, sh:13.0, px:4.63 },
  { n:'Full frame · 135 mm', fl:135, sw:36, sh:24, px:5.9 },
  { n:'1.2 m Schmidt plate (6.4°)', fl:3070, sw:355, sh:355, px:15 },
];
// the clock: the real one, shifted by the timeline (the solar ephemeris and the stars' motion use the same offset)
export const jdNow=()=>jdOf(new Date())+(S.tOffsetDays||0);
function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(OBS)); }catch(_){} }
export function restoreObserver(){ try{ const o=JSON.parse(localStorage.getItem(KEY)||'null'); if(o&&typeof o==='object') Object.assign(OBS,o); }catch(_){} publish(); }
function publish(){ store.set({ ...OBS, fov:frameFov() }); V.dirty=true; }
export function setObserver(o={}){
  if(o.lat!==undefined){ OBS.lat=Math.max(-90,Math.min(90,+o.lat||0)); OBS.on=true; }
  if(o.lon!==undefined){ OBS.lon=((+o.lon||0)+540)%360-180; OBS.on=true; }
  if(o.elev!==undefined) OBS.elev=+o.elev||0;
  if(o.name!==undefined) OBS.name=String(o.name).slice(0,60);
  if(o.on!==undefined) OBS.on=!!o.on;
  if(o.frame!==undefined) OBS.frame=o.frame==='date'?'date':'icrs';
  if(o.refract!==undefined) OBS.refract=!!o.refract;
  persist(); publish();
}
export function observerHere(){
  return new Promise(res=>{ if(!navigator.geolocation){ store.update(s=>({...s, msg:'this browser has no geolocation'})); return res(false); }
    navigator.geolocation.getCurrentPosition(p=>{ setObserver({ lat:p.coords.latitude, lon:p.coords.longitude, elev:p.coords.altitude||0, name:'here' }); res(true); },
      e=>{ store.update(s=>({...s, msg:'location refused: '+e.message})); res(false); }, { timeout:10000 }); });
}
export function setInstrument(o={}){
  if(o.preset!==undefined){ const p=PRESETS[o.preset]; if(p){ OBS.fl=p.fl; OBS.sw=p.sw; OBS.sh=p.sh; OBS.px=p.px; OBS.instr=p.n; OBS.frameOn=true; } }
  for(const k of ['fl','sw','sh','px','pa']) if(o[k]!==undefined&&isFinite(+o[k])) OBS[k]=+o[k];
  if(o.frameOn!==undefined) OBS.frameOn=!!o.frameOn;
  if(o.instr!==undefined) OBS.instr=String(o.instr);
  persist(); publish();
}
export function frameFov(){ const w=2*Math.atan(OBS.sw/2/OBS.fl)*57.29578, h=2*Math.atan(OBS.sh/2/OBS.fl)*57.29578; return { w, h, scale:206.265*OBS.px/OBS.fl }; }   // deg, deg, ″/px
// ---- readouts ----
export function skyOf(dirICRS, jd=jdNow()){                   // everything an observer wants for one direction
  const ap=radec(apparentOf(dirICRS,jd)), out={ ra:ap[0], dec:ap[1] };
  if(OBS.on){ const a=altaz(ap[0],ap[1],jd,OBS.lat,OBS.lon); out.alt=a.alt; out.az=a.az; out.ha=a.ha;
    out.altRef=OBS.refract?a.alt+refraction(a.alt):a.alt; out.airmass=airmass(out.altRef); }
  return out;
}
export const compass=az=>['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(az/22.5)%16];
const hms=ra=>{ ra=((ra%360)+360)%360; const h=ra/15, hh=Math.floor(h), m=(h-hh)*60, mm=Math.floor(m), s=(m-mm)*60; return `${String(hh).padStart(2,'0')}h${String(mm).padStart(2,'0')}m${s.toFixed(1).padStart(4,'0')}s`; };
const dms=d=>{ const sg=d<0?'−':'+', a=Math.abs(d), dd=Math.floor(a), m=(a-dd)*60, mm=Math.floor(m), s=(m-mm)*60; return `${sg}${String(dd).padStart(2,'0')}°${String(mm).padStart(2,'0')}′${s.toFixed(0).padStart(2,'0')}″`; };
// card rows for an ICRS direction: apparent place, and with an observer alt/az, airmass, rise/transit/set
export function observeRows(dirICRS){
  const jd=jdNow(), sk=skyOf(dirICRS,jd), rows=[];
  rows.push(['Apparent place',`${hms(sk.ra)} ${dms(sk.dec)} · equinox of date, aberration applied · ${new Date((jd-2440587.5)*86400000).toISOString().slice(0,16).replace('T',' ')} UT`]);
  if(!OBS.on) return rows;
  const up=sk.altRef>0;
  rows.push([`From ${OBS.name||OBS.lat.toFixed(2)+'°, '+OBS.lon.toFixed(2)+'°'}`, `${up?'up':'below the horizon'} · alt ${sk.altRef.toFixed(1)}° · az ${sk.az.toFixed(1)}° (${compass(sk.az)})${up?` · airmass ${sk.airmass.toFixed(2)}`:''} · HA ${sk.ha>=0?'+':'−'}${Math.abs(sk.ha).toFixed(2)}h`]);
  const rs=riseSet(dirICRS,jd,OBS.lat,OBS.lon,-0.5667);
  rows.push(['Rise · transit · set', rs.alwaysUp?`circumpolar · transit ${fmtHM(rs.transit)}`: rs.neverUp?'never rises here' : `${fmtHM(rs.rise)} · ${fmtHM(rs.transit)} · ${fmtHM(rs.set)} (today, UTC)`]);
  const tw=sunRiseSet(jd,OBS.lat,OBS.lon,-18), sun=sunRiseSet(jd,OBS.lat,OBS.lon,-0.8333);
  rows.push(['Sun · dark sky', `set ${fmtHM(sun.set)} · rise ${fmtHM(sun.rise)}${tw.alwaysUp?' · no astronomical darkness':tw.neverUp?' · dark all day':` · astronomical night ${fmtHM(tw.set)} – ${fmtHM(tw.rise)}`}`]);
  return rows;
}
// ---- drawing (sky view only): the horizon, cardinal points, the instrument frame ----
export function drawObserver(){
  OBSSTAT.horizon=0; OBSSTAT.frame=0;
  if(!S.skyMode||camDist>1e-4) return;
  const jd=jdNow(), R=scale(SKY_R_PC);
  if(OBS.on){
    // the horizon: alt 0 (refracted: −34′ is where things actually rise) around the azimuth
    LBL.prio=P_GRID; pathBegin(); const N=180; const pts=[];
    for(let i=0;i<=N;i++){ const az=i/N*360; const d=horizonDir(az,OBS.refract?-0.5667:0,jd); const p=project(d[0]*R,d[1]*R,d[2]*R); pathPt(p); pts.push([az,p]); }
    pathStroke('rgba(120,220,160,0.55)',1.4,[6,4]); OBSSTAT.horizon=pts.filter(q=>q[1].depth>V.NEAR&&q[1].x>0&&q[1].x<W&&q[1].y>0&&q[1].y<H).length;
    ctx.font='10px ui-monospace,monospace'; ctx.fillStyle='rgba(140,230,170,0.85)';
    for(const [az,lab] of [[0,'N'],[90,'E'],[180,'S'],[270,'W']]){ const d=horizonDir(az,0,jd), p=project(d[0]*R,d[1]*R,d[2]*R);
      if(p.depth>V.NEAR&&p.x>-20&&p.x<W+20&&p.y>-20&&p.y<H+20) ctx.fillText(lab, p.x+4, p.y-4); }
    // the zenith
    const z=horizonDir(0,90,jd), pz=project(z[0]*R,z[1]*R,z[2]*R);
    if(pz.depth>V.NEAR&&pz.x>0&&pz.x<W&&pz.y>0&&pz.y<H){ ctx.strokeStyle='rgba(140,230,170,0.7)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(pz.x-6,pz.y); ctx.lineTo(pz.x+6,pz.y); ctx.moveTo(pz.x,pz.y-6); ctx.lineTo(pz.x,pz.y+6); ctx.stroke(); ctx.fillText('zenith', pz.x+8, pz.y+4); }
  }
  if(OBS.frameOn){
    const f=frameFov(), pxPerDeg=Math.max(W,H)/fovDeg(), w=f.w*pxPerDeg, h=f.h*pxPerDeg, cx=V.cx, cy=V.cy;
    if(w>4&&h>4&&w<8*W){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(-OBS.pa*Math.PI/180);          // PA east of north: north up, east left → counter-clockwise on screen
      ctx.strokeStyle='rgba(255,207,107,0.9)'; ctx.lineWidth=1.2; ctx.setLineDash([]); ctx.strokeRect(-w/2,-h/2,w,h);
      ctx.strokeStyle='rgba(255,207,107,0.35)'; ctx.beginPath(); ctx.moveTo(-w/2,0); ctx.lineTo(-w/2+12,0); ctx.moveTo(w/2,0); ctx.lineTo(w/2-12,0); ctx.moveTo(0,-h/2); ctx.lineTo(0,-h/2+12); ctx.moveTo(0,h/2); ctx.lineTo(0,h/2-12); ctx.stroke();
      ctx.restore(); LBL.prio=P_HUD; ctx.font='10px ui-monospace,monospace'; ctx.fillStyle='rgba(255,220,140,0.9)';
      const ft=v=>v>=1?v.toFixed(2)+'°':(v*60).toFixed(1)+'′';
      ctx.fillText(`${OBS.instr||OBS.fl+' mm · '+OBS.sw+'×'+OBS.sh+' mm'} · ${ft(f.w)} × ${ft(f.h)} · ${f.scale.toFixed(2)}″/px${OBS.pa?` · PA ${OBS.pa}°`:''}`, cx-w/2, cy-h/2-6); OBSSTAT.frame=1; }
  }
}
// ICRS direction of the point at (azimuth, altitude) for the observer at jd
export function horizonDir(azDeg, altDeg, jd){
  // alt/az → hour angle/dec (of date) → ra of date → ICRS
  const D=Math.PI/180, phi=OBS.lat*D, az=azDeg*D, alt=altDeg*D;
  const sd=Math.sin(alt)*Math.sin(phi)+Math.cos(alt)*Math.cos(phi)*Math.cos(az), dec=Math.asin(Math.max(-1,Math.min(1,sd)));
  const H=Math.atan2(-Math.sin(az)*Math.cos(alt), Math.sin(alt)*Math.cos(phi)-Math.cos(alt)*Math.sin(phi)*Math.cos(az));
  const ra=(gastDeg(jd)+OBS.lon-H/D); return icrsOfDate(vec(ra, dec/D), jd);
}
import { gast } from '../lib/astro.js';
const gastDeg=jd=>gast(jd)*57.29577951;
// ---- the finder chart: both canvases plus a legend, as a PNG download ----
export function finderChart(title){
  const W2=cv.width, H2=cv.height, leg=Math.round(74*(W2/W)), out=document.createElement('canvas'); out.width=W2; out.height=H2+leg;
  const c=out.getContext('2d'); c.fillStyle='#000'; c.fillRect(0,0,out.width,out.height);
  V.dirty=true; if(api.renderNow) api.renderNow();                 // a fresh frame, read before the compositor clears the GL buffer
  try{ c.drawImage(glcv,0,0,W2,H2); }catch(_){}
  c.drawImage(cv,0,0,W2,H2);
  const jd=jdNow(), f=[Math.atan2(camFwd[1],camFwd[0])*57.29578, Math.asin(Math.max(-1,Math.min(1,camFwd[2])))*57.29578], ap=radec(dateOfICRS(camFwd,jd)), k=W2/W;
  c.fillStyle='#0b0e16'; c.fillRect(0,H2,W2,leg); c.fillStyle='#e9edfa'; c.font=`${Math.round(13*k)}px ui-monospace,monospace`;
  const fov=fovDeg(), ft=v=>v>=1?v.toFixed(2)+'°':(v*60).toFixed(1)+'′';
  c.fillText(`${title||'Field'} · centre α ${hms((f[0]+360)%360)} δ ${dms(f[1])} (ICRS)  ·  of date α ${hms(ap[0])} δ ${dms(ap[1])}`, 12*k, H2+22*k);
  c.fillText(`field ${ft(fov)} across the long side · ${(fov*3600/Math.max(W,H)).toFixed(2)}″/px · ${new Date((jd-2440587.5)*86400000).toISOString().slice(0,16).replace('T',' ')} UT${OBS.on?` · observer ${OBS.name||OBS.lat.toFixed(3)+'°, '+OBS.lon.toFixed(3)+'°'}`:''}${OBS.frameOn?` · frame ${OBS.instr||OBS.fl+' mm'}`:''}`, 12*k, H2+44*k);
  c.fillText('north up · east left · Known Universe', 12*k, H2+64*k);
  // N/E arrows
  const ax=W2-60*k, ay=H2+40*k; c.strokeStyle='#e9edfa'; c.lineWidth=1.5*k; c.beginPath(); c.moveTo(ax,ay); c.lineTo(ax,ay-24*k); c.moveTo(ax,ay); c.lineTo(ax-24*k,ay); c.stroke(); c.fillText('N',ax-4*k,ay-28*k); c.fillText('E',ax-38*k,ay+5*k);
  out.toBlob(b=>{ if(!b) return; const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`finder-${(title||'field').replace(/[^\w.-]+/g,'_')}.png`; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500); },'image/png');
  return { w:out.width, h:out.height };
}
Object.assign(api,{ setObserver, observerHere, setInstrument, finderChart, skyOf:(ra,dec)=>skyOf(vec(ra,dec)) });
