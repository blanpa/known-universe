// Live solar-system layers: CMEs, NEO flybys, sunspots, satellites, fireballs.
import { api } from '../lib/api.js';
import { LIVE, groundEcl, satEcl } from '../lib/live.js';
import { aim, enterSolar } from './actions.js';
import { ctx } from './canvas.js';
import { offscr, pathBegin, pathPt, pathStroke } from './draw.js';
import { LBL, P_SMALL } from './labels.js';
import { D2R, PLANETS, eclToWorld, keplerSB, orbPoint, solarJD } from './solar-data.js';
import { bodyPx, drawOrbitEllipse, solarProj } from './solar.js';
import { S, V } from './state.js';
import { AU_PC, camDir2, project, scale } from './view.js';
// ---- live layer: CME fronts (NASA DONKI) + upcoming NEO flybys (NASA NeoWs) ----
// CME direction: DONKI lat/lon are Stonyhurst (Earth at lon 0, west positive).
// Frame: x̂ = Sun→Earth (ecliptic), ŷ = ẑ×x̂ (solar west ≈ Earth's orbital motion), ẑ = ecliptic north.
export function cmeSolarMs(){ return (solarJD()-2440587.5)*86400000; }
export function drawCME(A){ LBL.prio=P_SMALL;
  if(!LIVE.cmes.length) return;
  const earth=PLANETS.find(p=>p.n==='Earth'); if(!earth||!earth._e) return;
  const nowMs=cmeSolarMs(), lamE=Math.atan2(earth._e[1],earth._e[0]);
  const cE=Math.cos(lamE), sE=Math.sin(lamE);
  for(const c of LIVE.cmes){
    const dt=(nowMs-c.t)/1000; if(dt<=0) continue;               // not yet erupted at this sim time
    const rAU=0.1 + c.v*dt/1.496e8; if(rAU>2.6) continue;        // front left the inner system
    const fade=Math.max(0,Math.min(1,(2.6-rAU)/0.7));
    const la=c.lat*D2R, lo=c.lon*D2R, cb=Math.cos(la);
    const hx=cb*Math.cos(lo), hy=cb*Math.sin(lo), hz=Math.sin(la);
    const d=[hx*cE-hy*sE, hx*sE+hy*cE, hz];                      // axis in ecliptic coords
    // rim basis ⟂ axis
    let u=[-d[1],d[0],0]; const ul=Math.hypot(u[0],u[1],u[2])||1; u=[u[0]/ul,u[1]/ul,u[2]/ul];
    const v=[d[1]*u[2]-d[2]*u[1], d[2]*u[0]-d[0]*u[2], d[0]*u[1]-d[1]*u[0]];
    const col=c.v>=800?[255,96,80]:c.v>=500?[255,150,80]:[255,200,110];
    const H=Math.min(1.2,c.half*D2R), cH=Math.cos(H), sH=Math.sin(H);
    if(rAU<0.11) continue;
    // a CME is a directed plasma cone, so draw one: translucent fan from the Sun
    // that brightens toward the shock front — not a stack of concentric rings
    const sunp=project(0,0,0);
    const fw=eclToWorld(rAU*d[0],rAU*d[1],rAU*d[2]), fp=project(fw[0],fw[1],fw[2]);
    const rim=[]; let rimVis=0;
    for(let k=0;k<=48;k++){ const th=k/48*6.2832, ct=Math.cos(th), st=Math.sin(th);
      const ex=rAU*(cH*d[0]+sH*(ct*u[0]+st*v[0])), ey=rAU*(cH*d[1]+sH*(ct*u[1]+st*v[1])), ez=rAU*(cH*d[2]+sH*(ct*u[2]+st*v[2]));
      const w=eclToWorld(ex,ey,ez), p=project(w[0],w[1],w[2]);
      if(p.depth<=V.NEAR||offscr(p)){ rim.push(null); continue; }
      rim.push(p); rimVis++;
    }
    if(sunp.depth>V.NEAR && !offscr(sunp) && fp.depth>V.NEAR && !offscr(fp) && rimVis===49){
      const g=ctx.createLinearGradient(sunp.x,sunp.y,fp.x,fp.y);
      g.addColorStop(0,`rgba(${col[0]},${col[1]},${col[2]},0)`);
      g.addColorStop(0.6,`rgba(${col[0]},${col[1]},${col[2]},${A*fade*0.09})`);
      g.addColorStop(0.93,`rgba(${col[0]},${col[1]},${col[2]},${A*fade*0.26})`);
      g.addColorStop(1,`rgba(${col[0]},${col[1]},${col[2]},0)`);
      ctx.beginPath(); ctx.moveTo(sunp.x,sunp.y);
      for(const p of rim) ctx.lineTo(p.x,p.y);
      ctx.closePath(); ctx.fillStyle=g; ctx.fill();
    }
    if(sunp.depth>V.NEAR){                     // radial streaks: the direction reads at a glance
      ctx.lineWidth=1.1; ctx.strokeStyle=`rgba(${col[0]},${col[1]},${col[2]},${A*fade*0.38})`;
      ctx.beginPath();
      for(let i=0;i<12;i++){
        const th=i/12*6.2832+0.35, ct=Math.cos(th), st=Math.sin(th);
        const mH=H*(0.25+((i*17)%13)/13*0.72), cM=Math.cos(mH), sM=Math.sin(mH);
        const dx=cM*d[0]+sM*(ct*u[0]+st*v[0]), dy=cM*d[1]+sM*(ct*u[1]+st*v[1]), dz=cM*d[2]+sM*(ct*u[2]+st*v[2]);
        const r2=rAU*(0.72+((i*37)%23)/23*0.2), r1=r2*0.42;
        const w1=eclToWorld(r1*dx,r1*dy,r1*dz), p1=project(w1[0],w1[1],w1[2]);
        const w2=eclToWorld(r2*dx,r2*dy,r2*dz), p2=project(w2[0],w2[1],w2[2]);
        if(p1.depth>V.NEAR&&p2.depth>V.NEAR&&!offscr(p1)&&!offscr(p2)){ ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); }
      }
      ctx.stroke();
    }
    ctx.beginPath(); let first=true;         // the shock front itself: one bright rim + soft glow
    for(const p of rim){ if(!p){first=true;continue;}
      if(first){ctx.moveTo(p.x,p.y);first=false;}else ctx.lineTo(p.x,p.y); }
    ctx.strokeStyle=`rgba(${col[0]},${col[1]},${col[2]},${A*fade*0.14})`;
    ctx.lineWidth=5.5; ctx.stroke();
    ctx.strokeStyle=`rgba(${col[0]},${col[1]},${col[2]},${A*fade*0.75})`;
    ctx.lineWidth=1.7; ctx.stroke();
    // label + pick target at the front's centre
    const tw=eclToWorld(rAU*d[0],rAU*d[1],rAU*d[2]), tp=project(tw[0],tw[1],tw[2]);
    if(tp.depth>V.NEAR){
      if(!c._o) c._o={cme:c, n:'Coronal mass ejection', c:col};
      const sel=(c._o===S.hover||c._o===S.pinned);
      ctx.font=(sel?'10px':'9px')+' ui-monospace,monospace';
      ctx.fillStyle=`rgba(${col[0]},${col[1]},${col[2]},${A*fade*(sel?1:0.85)})`;
      ctx.fillText(`CME · ${Math.round(c.v)} km/s${c.earthDir?' · → Earth':''}`, tp.x+6, tp.y-4);
      if(sel){ ctx.beginPath(); ctx.arc(tp.x,tp.y,9,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
      solarProj.push({o:c._o,x:tp.x,y:tp.y,px:12});
    }
  }
}
export function drawLiveNeo(A){ LBL.prio=P_SMALL;
  if(!LIVE.neos.length) return;
  const jd=solarJD(), nowMs=cmeSolarMs();
  const earth=PLANETS.find(p=>p.n==='Earth');
  let ep=null;
  if(earth&&earth._e){ const w=eclToWorld(earth._e[0],earth._e[1],earth._e[2]); const p=project(w[0],w[1],w[2]); if(p.depth>V.NEAR) ep=p; }
  for(const o of LIVE.neos){
    if(!o.kd) continue;
    o._el=keplerSB(o.kd,jd); o._e=orbPoint(o._el,o._el.E); o._r=Math.hypot(o._e[0],o._e[1],o._e[2]);
    const sel=(o===S.hover||o===S.pinned);
    drawOrbitEllipse(o._el, `rgba(255,168,88,${A*(sel?0.55:0.20)})`);
    const w=eclToWorld(o._e[0],o._e[1],o._e[2]), p=project(w[0],w[1],w[2]);
    if(p.depth<=V.NEAR) continue;
    const dtd=(o.t-nowMs)/86400000;                        // days until closest approach (sim time)
    if(ep && Math.abs(dtd)<5){                             // approach window: tie to Earth
      pathBegin(); pathPt(ep); pathPt(p); pathStroke(`rgba(255,168,88,${A*0.30})`,0.8,[3,4]);
    }
    const px=sel?6:4.5;                                    // diamond marker
    ctx.beginPath(); ctx.moveTo(p.x,p.y-px); ctx.lineTo(p.x+px,p.y); ctx.lineTo(p.x,p.y+px); ctx.lineTo(p.x-px,p.y); ctx.closePath();
    ctx.strokeStyle=`rgba(255,178,96,${A*(sel?1:0.9)})`; ctx.lineWidth=1.3; ctx.stroke();
    if(o.pha||o.sentry){ ctx.beginPath(); ctx.arc(p.x,p.y,px+3.5,0,6.2832);
      ctx.strokeStyle=`rgba(255,110,90,${A*0.7})`; ctx.lineWidth=0.9; ctx.stroke(); }
    if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,px+7,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    const rel=Math.abs(dtd)<0.04?'now':dtd>0?`in ${dtd>=1?Math.floor(dtd)+'d ':''}${Math.round(dtd%1*24)}h`:`${Math.abs(dtd).toFixed(1)}d ago`;
    const ldStr=o.ld<10?o.ld.toFixed(1):Math.round(o.ld);
    ctx.font=(sel?'10px':'9px')+' ui-monospace,monospace';
    ctx.fillStyle=`rgba(255,190,120,${A*(sel?1:0.8)})`;
    ctx.fillText(`${o.n} · ${rel} · ${ldStr} LD`, p.x+px+4, p.y+3);
    solarProj.push({o,x:p.x,y:p.y,px:Math.max(8,px+3)});
  }
}
// ---- live sunspots: SWPC active regions on the Sun glyph (orthographic on the disc) ----
// screen-plane components of a world direction = orthographic sphere projection, and its
// camera-z component tells front (visible) from far side.
function dirScreen(u){
  const cyw=Math.cos(S.yaw),syw=Math.sin(S.yaw),cp2=Math.cos(S.pitch),sp2=Math.sin(S.pitch);
  const x1=u[0]*cyw+u[2]*syw, z1=-u[0]*syw+u[2]*cyw;
  return [x1, -(u[1]*cp2-z1*sp2), u[1]*sp2+z1*cp2];   // [screen x, screen y, toward-camera]
}
function stonyhurstEcl(latDeg,lonDeg,lamE){            // Stonyhurst (W+) → ecliptic unit vector
  const la=latDeg*D2R, lo=lonDeg*D2R, cb=Math.cos(la);
  const hx=cb*Math.cos(lo), hy=cb*Math.sin(lo), hz=Math.sin(la);
  const cE=Math.cos(lamE), sE=Math.sin(lamE);
  return [hx*cE-hy*sE, hx*sE+hy*cE, hz];
}
export function drawSunspots(A, sp, spx){ LBL.prio=P_SMALL;
  if(!LIVE.regions.length || spx<10) return;
  const earth=PLANETS.find(p=>p.n==='Earth'); if(!earth||!earth._e) return;
  const lamE=Math.atan2(earth._e[1],earth._e[0]);
  for(const r of LIVE.regions){
    const e=stonyhurstEcl(r.lat,r.lon,lamE);
    const d=dirScreen([e[0],e[2],e[1]]);               // ecl → world axis swap
    if(d[2]<=0.05) continue;                           // far side / limb
    const x=sp.x+d[0]*spx*0.94, y=sp.y+d[1]*spx*0.94;
    const rr=Math.max(1.2, Math.sqrt(r.area||20)*spx/280);
    const hot=r.xp>=5||r.mp>=40||r.xx>0;
    ctx.beginPath(); ctx.arc(x,y,rr,0,6.2832);
    ctx.fillStyle=`rgba(96,48,22,${A*0.92})`; ctx.fill();
    if(hot){ ctx.beginPath(); ctx.arc(x,y,rr+1.6,0,6.2832);
      ctx.strokeStyle=`rgba(255,90,60,${A*0.85})`; ctx.lineWidth=1; ctx.stroke(); }
    if(!r._o) r._o={spot:r, n:'AR '+r.no};
    const sel=(r._o===S.hover||r._o===S.pinned);
    if(sel){ ctx.beginPath(); ctx.arc(x,y,rr+5,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    if(spx>34||sel){ ctx.font='8.5px ui-monospace,monospace';
      ctx.fillStyle=`rgba(70,35,15,${A*0.95})`; ctx.fillText('AR'+r.no, x+rr+2, y+3); }
    solarProj.push({o:r._o,x,y,px:Math.max(7,rr+3)});
  }
}
// ---- live satellites: CelesTrak TLEs, SGP4-propagated around the Earth glyph ----
let SATCUR=0;                                          // rotating SGP4 budget cursor
export function drawSats(A){ LBL.prio=P_SMALL;
  if(!LIVE.sats.length) return;
  const earth=PLANETS.find(p=>p.n==='Earth');
  if(!earth||!earth._e||!earth._p) return;
  const ep=earth._p, px=bodyPx(earth.rk,ep.depth);
  if(px<10) return;
  const jd=solarJD(); let drawn=0, nSl=0, nDeb=0;
  const LOG_LO=Math.log10(6600), LOG_HI=Math.log10(50000);
  // SGP4 for the full catalogue (Starlink!) is too hot for every frame — propagate a
  // rotating batch and draw the rest from last frame's position (full refresh ≲0.1 s)
  const N=LIVE.sats.length, BUD=Math.min(N,1500);
  const cNamed=`rgba(150,235,255,${A})`, cDef=`rgba(140,215,250,${A*0.7})`,
        cSl=`rgba(168,196,232,${A*0.5})`, cOw=`rgba(196,176,232,${A*0.55})`,
        cDeb=`rgba(160,158,168,${A*0.38})`;
  for(let k=0;k<N;k++){
    const s=LIVE.sats[k];
    let e;
    if(((k-SATCUR+N)%N)<BUD){ e=satEcl(s,jd); s._e3=e||null; }
    else e=s._e3;                               // outside the batch: cached, or wait for it
    if(!e) continue;
    const l=Math.hypot(e[0],e[1],e[2]); if(!isFinite(l)||l<6400) continue;
    let x,y;
    if(S.realScale){
      const K=1.496e8;
      const w=eclToWorld(earth._e[0]+e[0]/K, earth._e[1]+e[1]/K, earth._e[2]+e[2]/K);
      const p=project(w[0],w[1],w[2]); if(p.depth<=V.NEAR) continue;
      x=p.x; y=p.y;
    } else {                                           // exploded shells by log(orbit radius), like the moons
      const u=[e[0]/l,e[2]/l,e[1]/l], d2=camDir2(u);
      const t=Math.min(1.25,Math.max(0,(Math.log10(l)-LOG_LO)/(LOG_HI-LOG_LO)));
      const sep=px+5+t*(px*2.0+36);
      x=ep.x+d2[0]*sep; y=ep.y+d2[1]*sep;
    }
    const named=s.iss||s.hst||s.css, sel=(s===S.hover||s===S.pinned);
    s.alt=l-6371; s.sat=true; s.kind='Satellite';
    if(s.sl) nSl++; if(s.deb) nDeb++;
    if(named){ ctx.beginPath(); ctx.arc(x,y,2.4,0,6.2832); ctx.fillStyle=cNamed; ctx.fill(); }
    else { ctx.fillStyle=s.deb?cDeb:s.sl?cSl:s.ow?cOw:cDef; ctx.fillRect(x-0.9,y-0.9,1.8,1.8); }
    if(sel){ ctx.beginPath(); ctx.arc(x,y,7,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    if(named||sel){ ctx.font='8.5px ui-monospace,monospace'; ctx.fillStyle=`rgba(160,230,255,${A*0.9})`;
      ctx.fillText(s.iss?'ISS':s.css?'CSS':s.hst?'Hubble':s.n, x+4, y-3); }
    solarProj.push({o:s,x,y,px:named?7:4});
    drawn++;
  }
  SATCUR=N?(SATCUR+BUD)%N:0;
  if(drawn){
    if(px>13){ ctx.font='8.5px ui-monospace,monospace'; ctx.fillStyle=`rgba(140,215,250,${A*0.55})`;
      ctx.fillText(drawn.toLocaleString('en-US')+' satellites · live'
        +(nSl?' · '+nSl.toLocaleString('en-US')+' Starlink':'')
        +(nDeb?' · '+nDeb.toLocaleString('en-US')+' debris':''), ep.x+px+4, ep.y+16); }
    V.dirty=true;                                        // they really move — keep animating while visible
  }
}
// ---- fireballs: recent atmospheric impacts (JPL, via live-extra proxy) on the Earth glyph ----
export function drawFireballs(A){ LBL.prio=P_SMALL;
  const fb=LIVE.extra&&LIVE.extra.fireballs; if(!fb||!fb.length) return;
  const earth=PLANETS.find(p=>p.n==='Earth');
  if(!earth||!earth._p) return;
  const ep=earth._p, px=bodyPx(earth.rk,ep.depth);
  if(px<12) return;
  const nowMs=cmeSolarMs();
  for(const f of fb){
    if(f.lat==null||f.lon==null) continue;
    const age=(nowMs-f.t)/86400000; if(age<0||age>30) continue;
    const e=groundEcl(f.lat,f.lon,f.t);
    const d=dirScreen([e[0],e[2],e[1]]);
    if(d[2]<=0.05) continue;                           // far side
    const x=ep.x+d[0]*px*0.97, y=ep.y+d[1]*px*0.97;
    const rr=Math.max(1.6, 2.2+Math.log10(f.kt||0.1));
    ctx.beginPath(); ctx.arc(x,y,rr,0,6.2832);
    ctx.fillStyle=`rgba(255,150,60,${A*(age<7?0.95:0.55)})`; ctx.fill();
    ctx.beginPath(); ctx.arc(x,y,rr+1.8,0,6.2832);
    ctx.strokeStyle=`rgba(255,110,50,${A*0.4})`; ctx.lineWidth=0.8; ctx.stroke();
    if(!f._o) f._o={fb:f, n:'Fireball'};
    const sel=(f._o===S.hover||f._o===S.pinned);
    if(sel){ ctx.beginPath(); ctx.arc(x,y,rr+5,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    solarProj.push({o:f._o,x,y,px:Math.max(6,rr+3)});
  }
}

// fly to a close-approach NEO from the live panel list
api.liveNeoFocus=id=>{
  const o=LIVE.neos.find(n=>n.id===id); if(!o) return;
  if(o.kd){ o._el=keplerSB(o.kd,solarJD()); o._e=orbPoint(o._el,o._el.E);
    const w=eclToWorld(o._e[0],o._e[1],o._e[2]);
    S.pinned=o; aim(w[0],w[1],w[2], scale(2.2*AU_PC)); }
  else { S.pinned=null; enterSolar(); }
  V.dirty=true;
};
