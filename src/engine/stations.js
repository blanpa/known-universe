// Humanity's space stations. The two in orbit today (ISS, Tiangong) are placed from
// CelesTrak elements like every other satellite; the eleven that came before are placed
// on a schematic orbit — altitude, inclination and period real, the phase not — whenever
// the map's date lies within their lifetime, so Mir is there in 1995 and Skylab in 1975.
// Outside their window the live ones fall back to the schematic orbit too (SGP4 is good
// for days, not decades). Each is a pickable object with a card; the search knows them.
import { LIVE, satEcl } from '../lib/live.js';
import { ctx } from './canvas.js';
import { CAT } from './data.js';
import { PLANETS, eclToWorld, solarJD } from './solar-data.js';
import { bodyPx, solarProj } from './solar.js';
import { S, V } from './state.js';
import { camDir2, project } from './view.js';

const GM=398600.4418, RE=6371;                                 // km³/s², km
const jdOfDate=d=>Date.UTC(+d.slice(0,4),+d.slice(5,7)-1,+d.slice(8,10))/86400000+2440587.5;
const nodeOf=n=>{ let h=0; for(const c of n) h=(h*31+c.charCodeAt(0))%360; return h*Math.PI/180; };   // a fixed, arbitrary node per station
export const STATIONS=(CAT.stations||[]).map(s=>({ ...s, station:true, kind:'Space station',
  jd0:jdOfDate(s.from), jd1:s.to?jdOfDate(s.to)+1:Infinity, node:nodeOf(s.n), _live:null, _alt:s.alt }));
export function periodMin(st){ const R=RE+(st._alt||st.alt); return 2*Math.PI*Math.sqrt(R*R*R/GM)/60; }
export function inOrbitAt(st,jd){ return jd>=st.jd0 && jd<=st.jd1; }
const OBL=23.43928*Math.PI/180, cO=Math.cos(OBL), sO=Math.sin(OBL);
function schematic(st,jd){                                     // circular orbit → ecliptic km from the Earth's centre
  const R=RE+st.alt, n=Math.sqrt(GM/(R*R*R)), u=n*(jd-st.jd0)*86400, i=st.inc*Math.PI/180, O=st.node;
  const cu=Math.cos(u), su=Math.sin(u), ci=Math.cos(i), si=Math.sin(i), cN=Math.cos(O), sN=Math.sin(O);
  const x=R*(cN*cu-sN*su*ci), y=R*(sN*cu+cN*su*ci), z=R*su*si;  // equatorial
  return [x, y*cO+z*sO, z*cO-y*sO];
}
function liveRec(st){                                          // the CelesTrak record, looked up once per catalogue load
  if(!st.norad) return null;
  if(st._sats!==LIVE.sats){ st._sats=LIVE.sats; st._rec=LIVE.sats.find(x=>x.rec&&+x.rec.satnum===st.norad)||null; }
  return st._rec;
}
// where it is on a date: ecliptic km from the Earth's centre, or null when not in orbit
export function stationEcl(st,jd){
  if(!inOrbitAt(st,jd)) return null;
  const s=liveRec(st);
  if(s){ const e=satEcl(s,jd); if(e){ st._live=s; return e; } }
  st._live=null; return schematic(st,jd);
}
export function drawStations(A){
  if(!STATIONS.length) return;
  const earth=PLANETS.find(p=>p.n==='Earth'); if(!earth||!earth._e||!earth._p) return;
  const ep=earth._p, px=bodyPx(earth.rk,ep.depth); if(px<10) return;
  const jd=solarJD(), K=1.496e8;
  const LOG_LO=Math.log10(6600), LOG_HI=Math.log10(50000);
  const place=e=>{                                             // the satellite layer's placement, so both agree
    const l=Math.hypot(e[0],e[1],e[2]);
    if(S.realScale){ const w=eclToWorld(earth._e[0]+e[0]/K, earth._e[1]+e[1]/K, earth._e[2]+e[2]/K);
      const p=project(w[0],w[1],w[2]); return p.depth>V.NEAR?[p.x,p.y]:null; }
    const u=[e[0]/l,e[2]/l,e[1]/l], d2=camDir2(u);              // compact: exploded shells by log(orbit radius)
    const t=Math.min(1.25,Math.max(0,(Math.log10(l)-LOG_LO)/(LOG_HI-LOG_LO))), sep=px+5+t*(px*2.0+36);
    return [ep.x+d2[0]*sep, ep.y+d2[1]*sep];
  };
  const g=Math.max(1,Math.min(2.6,px/60));                     // the glyph grows a little with the Earth
  let any=false;
  for(const st of STATIONS){
    const e=stationEcl(st,jd); if(!e) continue;
    st._alt=Math.hypot(e[0],e[1],e[2])-RE;
    const xy=place(e); if(!xy) continue; const [x,y]=xy;
    // one revolution of its orbit, from the same source as the point
    const P=periodMin(st)/1440, N=48, pts=[];
    for(let k=0;k<=N;k++){ const q=st._live?satEcl(st._live,jd+k/N*P):schematic(st,jd+k/N*P);
      const z=q&&place(q); if(!z){ pts.length=0; break; } pts.push(z); }
    if(pts.length){ ctx.beginPath(); pts.forEach((p,k)=>k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));
      ctx.strokeStyle=`rgba(255,222,150,${A*(st._live?0.3:0.2)})`; ctx.lineWidth=0.8;
      ctx.setLineDash(st._live?[]:[3,4]); ctx.stroke(); ctx.setLineDash([]); }
    const sel=(st===S.hover||st===S.pinned);
    ctx.fillStyle=`rgba(255,226,160,${A*0.95})`; ctx.fillRect(x-6*g,y-1.1*g,12*g,2.2*g);   // a truss with its arrays
    ctx.fillStyle=`rgba(255,255,255,${A})`; ctx.beginPath(); ctx.arc(x,y,2.1*g,0,6.2832); ctx.fill();
    if(sel){ ctx.beginPath(); ctx.arc(x,y,7*g+2,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    ctx.font=`${sel?'10px':'9px'} ui-monospace,monospace`; ctx.fillStyle=`rgba(255,232,180,${A*0.95})`;
    ctx.fillText(st.n+(st._live?` · ${st._alt.toFixed(0)} km`:''), x+7*g+3, y-3);
    solarProj.push({o:st,x,y,px:Math.max(6,4*g)});
    any=true;
  }
  if(any) V.dirty=true;                                        // they move — keep animating while visible
}
