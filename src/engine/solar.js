// Our solar system: Sun, planets, moons, probes, interstellar visitors, small bodies.
import { declare, timg } from '../lib/sources.js';
import { ephemMoon } from './ephem.js';
import { ctx } from './canvas.js';
import { drawHalo, haloSprite, offscr, pathBegin, pathBreak, pathPt, pathStroke } from './draw.js';
import { PTEX, _gbl, bodyGlobe, earthGlobe, earthImage } from './earth.js';
import { LBL, P_PROBE, P_SEL, P_SMALL, P_SOLAR } from './labels.js';
import { drawLagrange } from './lagrange.js';
import { D2R, MOON_EPH, PROBES, SMALL, SOLAR_BODIES, SUN, dateStr, eclToWorld, keplerSB, moonAt, moonOrbitPoint, orbPoint, solarJD, updateSolarPositions } from './solar-data.js';
import { drawCME, drawFireballs, drawLiveNeo, drawSats, drawSunspots } from './solar-live.js';
import { S, V } from './state.js';
import { drawTransfer } from './transfer.js';
import { AU_PC, H, W, _d2x, _d2y, camDir2i, project, scale } from './view.js';
// ---- solar system (positioned on the SAME unified scale: orbit radius = rlog(a·AU)) ----
export let solarProj=[];
function orbitR(a){ return scale(a*AU_PC); }
// Bodies are drawn at their TRUE relative radii: the Sun really is 109 Earths across
// and the Moon really is a quarter of one. (The old model raised the ratio to the 0.42
// and added a constant, which squeezed the Sun down to ~5 Earths and puffed the Moon up
// to almost one — everything ended up looking the same size.) Positions stay compressed;
// only the sizes are honest, with a pixel floor so small moons remain clickable.
// One shared factor, so the ratios above stay EXACT at every zoom. Its value is set by
// the one constraint the compressed map imposes: the Sun's disc has to stay inside
// Earth's orbit. In compact mode 1 AU is a fixed 0.686 world units, so
//     109.3 · K · 0.02  ≤  0.30 · 0.686   →   K ≤ 0.094.
// Pick that, and everything else follows from its true radius. (Distances are
// compressed here and sizes are not, which is why a factor is needed at all — in real
// scale mode truePx below takes over and both are honest together.)
// Symbolic body size at the framing distance. Every body in view is sub-pixel at its
// true angular size, so a symbol stands in — and the symbol used to be LINEAR in the real
// radius: the Sun got 36 px, Jupiter 3.7, and Earth, Mars, the Moon all sat on the
// 1.7-px floor. The eye read "one big ball, some dust". A power law keeps the real
// ordering with a legible spread: Sun 16 · Jupiter 7 · Saturn 6.5 · Earth 3 · Mars 2.4 ·
// Moon 1.9 (at a 900-px viewport). Perspective still applies: nearer than the framing
// distance a body grows, and in real scale its true disc takes over as you fly at it.
// The Sun is the one exception: by radius its symbol would be 5× Earth's, and with its halo
// that disc swallowed the orbits of the inner planets from every framing out to Neptune's.
// It is capped at 4× Earth's (the radius whose symbol is 4× Earth's is 335,000 km).
const SYM_PX=3.0, SYM_K=0.35, SYM_MIN=1.3, SYM_RKMAX=335000, MOON_MIN=2.0, KM_PC=3.2408e-14;
export function symPx(rk,de){ return Math.max(SYM_MIN, SYM_PX*Math.pow(Math.min(rk,SYM_RKMAX)/6371,SYM_K)*(3.2/de)*(V.foc/560)); }
// Real scale normalises every body to the framing distance, which took the zoom itself
// out of the symbol: the Sun stayed 16 px from a 2-AU framing to a 6000-AU one and read
// as "it never gets smaller" while the orbits shrank into it. Zooming OUT past the Neptune
// framing (60 AU) the symbols contract (√: 60 AU → 6000 AU is a tenth), until the origin
// marker takes over at 0.1 pc. Zooming IN they stay put: a symbol is a marker for a body
// that is not resolved yet, and a marker that grew with the zoom (an earlier version let it
// grow as the 0.3 power) ended up 84 px across from 2 AU with the planets' moons inside it.
// Its true disc takes over below (bodyPx), which is the only honest growth there is.
// The compact map needs none of this: its log depth shrinks them.
const SYM_REF=3e-4;                                        // pc
function zoomK(){ if(!S.realScale) return 1; const r=SYM_REF/S.camZ; return r>1 ? 1 : Math.sqrt(r); }
export function bodyPx(rk,depth){
  const de = S.realScale ? (depth/S.camZ)*3.2 : depth;   // real: normalise to the framing distance
  // cap 4× the viewport: diving in takes you past full disc INTO the imagery (clouds fill the view)
  let sym = Math.min(Math.min(W,H)*4, Math.max(SYM_MIN, symPx(rk,de)*zoomK()));
  if(!S.realScale){
    // the compact map has no room inside Mercury's orbit (its log radius is 0 at 0.2 AU), so
    // the Sun's ball — a tenth of Earth's orbit there — grew to a quarter of Mercury's as you
    // zoomed into the inner system. It alone shrinks with the zoom in from the Neptune framing.
    if(rk>=SYM_RKMAX) sym*=Math.min(1, Math.sqrt(S.camZ/2.48));
    return sym;
  }
  // real scale: once the TRUE angular size is resolvable it wins — fly at a
  // planet and it grows to a disc, exactly as it would in reality
  const truePx = V.foc*(rk*KM_PC)/depth;                   // rk km -> pc, perspective size
  return Math.min(Math.max(sym, truePx), Math.min(W,H)*0.75);
}
// Saturn's rings, split at the planet: the far half hides behind the globe, the
// near half passes in front — drawn via a half-plane clip in the ring's tilt frame
function saturnRings(x,y,px,A,near){
  const R=px*2.35+Math.max(1,px*0.11);
  ctx.save(); ctx.translate(x,y); ctx.rotate(-0.42);
  ctx.beginPath(); ctx.rect(-R, near?0:-R, 2*R, R); ctx.clip();
  for(const rr of [2.35,1.98,1.55]){                    // Cassini-division gap between rings
    ctx.beginPath(); ctx.ellipse(0,0,px*rr,px*rr*0.34,0,0,6.2832);
    ctx.strokeStyle=`rgba(226,208,160,${A*(rr>2?0.7:0.4)})`;
    ctx.lineWidth=Math.max(1,px*0.11); ctx.stroke(); }
  ctx.restore();
}
// lit-sphere shading: planets used to be flat colour discs, which the real-scale
// deep zoom turns into screen-filling flat circles. Radial gradient offset toward
// the Sun's screen position → correct terminator side + limb darkening.
let _ballSun=null;                                    // set per frame by drawSolar
let _sunPx=0;
// an object whose glyph still sits inside the Sun's glyph is not resolved at this zoom:
// its label would only pile up on the Sun (the inner system from 60 AU out, say)
export function nearSun(x,y){ return !!_ballSun && Math.hypot(x-_ballSun.x,y-_ballSun.y) < _sunPx+10; }
function ballFill(x,y,r,c,A){
  ctx.beginPath(); ctx.arc(x,y,r,0,6.2832);
  if(r<5){ ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${A})`; ctx.fill(); return; }
  let lx=-0.5, ly=-0.5;                               // sun invisible (behind camera) → full phase-ish
  if(_ballSun){ const dx=_ballSun.x-x, dy=_ballSun.y-y, l=Math.hypot(dx,dy);
    if(l>1){ lx=dx/l; ly=dy/l; } else { lx=0; ly=0; } }
  const hi=c.map(v=>Math.min(255,Math.round(v*0.62+255*0.38)));
  const lo=c.map(v=>Math.round(v*0.16));
  const g=ctx.createRadialGradient(x+lx*r*0.48,y+ly*r*0.48,r*0.08, x+lx*r*0.14,y+ly*r*0.14,r*1.12);
  g.addColorStop(0,`rgba(${hi[0]},${hi[1]},${hi[2]},${A})`);
  g.addColorStop(0.45,`rgba(${c[0]},${c[1]},${c[2]},${A})`);
  g.addColorStop(0.8,`rgba(${Math.round(c[0]*0.55)},${Math.round(c[1]*0.55)},${Math.round(c[2]*0.55)},${A})`);
  g.addColorStop(1,`rgba(${lo[0]},${lo[1]},${lo[2]},${A})`);
  ctx.fillStyle=g; ctx.fill();
}
function orbitRing(r,style,dash){
  pathBegin();
  for(let k=0;k<=96;k++){ const th=k/96*6.2832; pathPt(project(Math.cos(th)*r,0,Math.sin(th)*r)); }
  pathStroke(style,1,dash);
}
export function drawOrbitEllipse(el,style){        // true (eccentric, inclined) orbit on the unified scale
  pathBegin();
  for(let j=0;j<=120;j++){ const q=orbPoint(el,j/120*6.2832), w=eclToWorld(q[0],q[1],q[2]);
    pathPt(project(w[0],w[1],w[2])); }
  pathStroke(style,1);
}
// live Sun: GOES SUVI 304 Å (chromosphere, prominences) — SWPC serves it with CORS
let _suvi={im:null,ok:false,t:0,loading:false};
declare('suvi', {name:'NOAA SWPC · SUVI 304 Å solar image', host:'services.swpc.noaa.gov', group:'live'});
function suviImage(){
  if(!_suvi.loading && Date.now()-_suvi.t>10*60e3){
    _suvi.loading=true;
    const im=new Image(); im.crossOrigin='anonymous';
    im.onload=()=>{ _suvi.im=im; _suvi.ok=true; _suvi.t=Date.now(); _suvi.loading=false; V.dirty=true; };
    im.onerror=()=>{ _suvi.t=Date.now(); _suvi.loading=false; };   // keep the last good frame
    timg('suvi', {name:'NOAA SWPC · SUVI 304 Å solar image', host:'services.swpc.noaa.gov', group:'live'}, im);
    im.src='https://services.swpc.noaa.gov/images/animations/suvi/primary/304/latest.png';
  }
  return _suvi.ok?_suvi.im:null;
}
export function drawSolar(alpha){ LBL.prio=P_SOLAR;
  ctx.globalAlpha=alpha; solarProj.length=0;
  if(typeof window!=='undefined') window.__solarProj=solarProj;   // the test hook: every frame, not only when the Sun is in front of the camera
  const A=alpha;
  updateSolarPositions(solarJD());               // real positions for the selected date
  // reference belts
  orbitRing(orbitR(2.7),`rgba(150,140,120,${A*0.16})`,[2,4]);   // Asteroid belt
  orbitRing(orbitR(43),`rgba(120,150,190,${A*0.13})`,[2,5]);    // Kuiper belt
  if(S.hz){                                                     // habitable zone (Sun, L=1)
    orbitRing(orbitR(0.95),`rgba(110,230,150,${A*0.30})`);
    orbitRing(orbitR(1.67),`rgba(110,230,150,${A*0.30})`);
    const hp=project(orbitR(1.28),0,0), h0=project(0,0,0);
    if(hp.depth>V.NEAR && Math.hypot(hp.x-h0.x,hp.y-h0.y)>34){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(120,230,150,${A*0.72})`;
      ctx.fillText('habitable zone', hp.x+4, hp.y-3); }
  }
  // orbits — true (eccentric, inclined) ellipses for planets AND dwarfs
  for(const b of SOLAR_BODIES){
    if(outerHidden(b)) continue;
    const faint=b.kind!=='Planet';
    if(b._el) drawOrbitEllipse(b._el, faint?`rgba(150,160,195,${A*0.18})`:`rgba(150,170,210,${A*0.30})`);
  }
  // Sun
  const sp=project(0,0,0);
  _ballSun = sp.depth>V.NEAR ? {x:sp.x,y:sp.y} : null;   // light source for lit-sphere shading
  if(sp.depth>V.NEAR && !S.skyMode){                      // the telescope stands at the Sun: no glyph
    const spx=bodyPx(SUN.rk,sp.depth);
    // the glow is a glow, not a second disc: it used to hold half its strength out to the disc's
    // own radius again (0.35 at 40% of a 3.2× halo), which read as a Sun twice its size
    drawHalo(haloSprite('sun',[[0,'rgba(255,240,190,0.85)'],[.35,'rgba(255,210,120,0.22)'],[1,'rgba(255,180,80,0)']],512),
             sp.x,sp.y,spx*2.6,A);
    ctx.beginPath(); ctx.arc(sp.x,sp.y,spx,0,6.2832);
    ctx.fillStyle=`rgba(255,240,190,${A})`; ctx.fill();
    if(spx>=11){                                   // live chromosphere on the disc
      const im=suviImage();
      if(im){ const s=im.width*0.30;               // SUVI disc ≈ 60% of the frame — crop to it
        ctx.save(); ctx.beginPath(); ctx.arc(sp.x,sp.y,spx,0,6.2832); ctx.clip();
        ctx.drawImage(im, im.width/2-s, im.height/2-s, s*2, s*2, sp.x-spx, sp.y-spx, spx*2, spx*2);
        ctx.restore();
        if(spx>46){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(255,200,140,${A*0.7})`;
          ctx.fillText('GOES SUVI 304 Å · live (~4 min)', sp.x+spx+4, sp.y+16); } }
    }
    _sunPx=spx;
    solarProj.push({o:SUN,x:sp.x,y:sp.y,px:spx});
    ctx.font='11px ui-monospace,monospace'; ctx.fillStyle=`rgba(255,238,178,${A*0.9})`;
    ctx.fillText('Sun', sp.x+spx+4, sp.y+3);
    // the date line belongs to the planets: only once Earth's orbit is wider than the Sun's glyph
    const au1=project(orbitR(1),0,0);
    if(au1.depth>V.NEAR && Math.hypot(au1.x-sp.x,au1.y-sp.y)>spx+30){
      ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(200,208,225,${A*0.6})`;
      ctx.fillText('Orbital positions · '+dateStr(solarJD()), sp.x+spx+4, sp.y+16); }
    if(S.sunAR) drawSunspots(A, sp, spx);
  }
  // planets & dwarfs at their real positions (painter: sort by depth)
  const drawn=[];
  SOLAR_BODIES.forEach(b=>{
    if(!b._e || outerHidden(b)) return;
    const w=eclToWorld(b._e[0],b._e[1],b._e[2]);
    const p=project(w[0],w[1],w[2]);
    if(p.depth<=V.NEAR) return;
    b._p=p; b._w=w; drawn.push(b);
  });
  drawn.sort((a,b)=>a._p.z2-b._p.z2);
  for(const b of drawn){
    const p=b._p, px=bodyPx(b.rk,p.depth), c=b.c;
    const sel=(b===S.hover||b===S.pinned);
    if(b.ring) saturnRings(p.x,p.y,px,A,false);   // far half — behind the globe
    if(b.uring){  // Uranus — rings nearly perpendicular (the planet is tipped on its side)
      for(const rr of [1.95,1.55]){
        ctx.beginPath(); ctx.ellipse(p.x,p.y,px*rr*0.32,px*rr,0.36,0,6.2832);
        ctx.strokeStyle=`rgba(190,214,220,${A*(rr>1.8?0.5:0.32)})`;
        ctx.lineWidth=Math.max(1,px*0.09); ctx.stroke(); }
    }
    ballFill(p.x,p.y,px,c,A);
    if(b.n==='Earth') V._earthScr = px>Math.min(W,H)*0.5 ? {x:p.x,y:p.y,r:px} : null;
    if(b.n==='Earth' && px>=16){                       // the real Earth: 3D globe > GOES > EPIC
      let credit=null;
      V._globeOn=false;
      if(px>=26){
        const gcv=earthGlobe(px, solarJD());
        if(gcv){ ctx.drawImage(gcv, p.x-px, p.y-px, px*2, px*2);
          V._globeOn=true; credit=`3D · GIBS VIIRS ${_gbl.texDate} · drag to rotate — the terminator is real`; }
      }
      if(!V._globeOn){
        const {im,live}=earthImage(px);
        if(im){ ctx.save(); ctx.beginPath(); ctx.arc(p.x,p.y,px,0,6.2832); ctx.clip();
          ctx.drawImage(im, p.x-px, p.y-px, px*2, px*2); ctx.restore();
          credit=(live?'GOES-East GEOCOLOR · live (~10 min)':'NASA EPIC (DSCOVR) · daily')
            +(_gbl&&_gbl.gl&&!_gbl.texReady?' — 3D globe loading…'
              :_gbl&&!_gbl.gl?' — fixed view (3D globe unavailable: WebGL)':''); }
      }
      if(credit && px>70){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(160,200,240,${A*0.7})`;
        if(p.x+px+8<W) ctx.fillText(credit, p.x+px+4, p.y+16);
        else ctx.fillText(credit, 16, H-64);           // limb off-screen → pin to the corner
      }
    }
    else if(px>=26 && PTEX[b.n]){                      // textured planets: same sphere pass
      const gcv=bodyGlobe(b,px,solarJD());
      if(gcv){ ctx.drawImage(gcv, p.x-px, p.y-px, px*2, px*2);
        if(px>70){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(160,200,240,${A*0.7})`;
          const cr='texture · Solar System Scope (CC-BY)';
          if(p.x+px+8<W) ctx.fillText(cr, p.x+px+4, p.y+16); else ctx.fillText(cr, 16, H-64); } }
    }
    if(b.ring) saturnRings(p.x,p.y,px,A,true);         // near half — in front of the globe
    if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,px+7,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    solarProj.push({o:b,x:p.x,y:p.y,px:px});
    const faint=b.kind!=='Planet';
    // a body still inside the Sun's glyph is not resolved — its label would just pile up there
    if(sel || Math.hypot(p.x-sp.x,p.y-sp.y)>px+10){
      ctx.font=(sel?'11px':'10px')+' ui-monospace,monospace';
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${A*(faint?0.72:0.95)})`;
      ctx.fillText(b.n, p.x+px+4, p.y+3); }
    // moons. Real scale: each one is projected where it really is (the planet's position plus
    // its true offset) and drawn only once it clears the planet's glyph — a glyph is a symbol
    // 10–100× the true disc from any distance, and the moons used to be painted INSIDE it (Io
    // piled on Jupiter from 0.5 AU out, Saturn speckled with sixty irregulars at the Neptune
    // framing). Compact map: an exploded ring in WORLD units, so it zooms with the map (it was
    // a fixed 12–130 screen px, and the Moon sat half an Earth orbit from Earth). Sizes are the
    // true ratio to the planet's glyph — Io a fortieth of Jupiter whatever the glyph is, not a
    // quarter — with a floor so a moon is still a dot.
    if(S.moons && b.moons.length){
      // the moon list is static, but this used to map+slice+sort it on every frame for
      // every planet — Jupiter alone has 66 moons, so it was ~300 array allocations and
      // a full sort per frame before a single moon was drawn
      if(!b._ms){ b._ms=b.moons.slice().sort((x,y)=>x.am-y.am);
        b._amMax=b.moons.reduce((a,m)=>m.am>a?m.am:a, 0); }
      const amMax=b._amMax, ms=b._ms, jdM=solarJD(), w=b._w;
      const truePx=V.foc*(b.rk*KM_PC)/p.depth;                        // the planet's true disc
      const selHere=(S.pinned&&S.pinned.parent===b.n)||(S.hover&&S.hover.parent===b.n);
      // compact ring: radii in world units, derived from the glyph's own world radius (which
      // is zoom-invariant), so the ring and the glyph scale together
      const Rp=px*p.depth/V.foc, Rout=Math.max(0.05, 2.5*Rp), Rin=1.3*Rp+0.004, wpx=V.foc/p.depth;
      const outerPx = S.realScale ? amMax*1000*V.foc*KM_PC/p.depth : Rout*wpx;
      // even the outermost moon inside the glyph: the system is unresolved, nothing to draw or pick
      const vmin=Math.min(W,H);                                        // thresholds as a share of the view, not device pixels
      if(outerPx > px+MOON_MIN+2 || selHere) ms.forEach((m,mi)=>{
        const msel=(m===S.hover||m===S.pinned);
        // the small irregulars (km-sized, 20th magnitude): only once the planet itself is a disc
        if(m.minor && !msel && (S.realScale ? truePx<vmin*0.007 : Rout*wpx<vmin*0.04)) return;
        const eph=MOON_EPH[m.n];
        const mp = eph&&eph.a ? ((m.n==='Moon'&&ephemMoon(jdM))||moonAt(eph,jdM)) : null;   // the Moon from Horizons when the table covers the date
        let mx,my,mdepth=p.depth,sepPx,kmPx=0;
        const ang=mi*2.24+0.7;                                         // a schematic place for a moon without elements
        if(S.realScale){
          if(mp){ const mw=[w[0]+mp.dir[0]*mp.r*KM_PC, w[1]+mp.dir[1]*mp.r*KM_PC, w[2]+mp.dir[2]*mp.r*KM_PC];
            const q=project(mw[0],mw[1],mw[2]); if(q.depth<=V.NEAR) return;
            mx=q.x; my=q.y; mdepth=q.depth; sepPx=Math.hypot(mx-p.x,my-p.y); }
          else { sepPx=m.am*1000*V.foc*KM_PC/p.depth; mx=p.x+Math.cos(ang)*sepPx; my=p.y+Math.sin(ang)*sepPx*0.9; }
          if(sepPx>50*Math.max(W,H)) return;                           // far outside the view either way
        } else {
          const t=Math.log10(m.am+1)/Math.log10(amMax+1);              // 0..1 by true distance (log)
          sepPx=Math.min((Rin+t*(Rout-Rin))*wpx, 8*Math.max(W,H));
          if(mp){ kmPx=sepPx/(m.am*1000||eph.a);                       // the eccentric orbit keeps its shape
            camDir2i(mp.dir[0],mp.dir[1],mp.dir[2]); mx=p.x+_d2x*mp.r*kmPx; my=p.y+_d2y*mp.r*kmPx; }
          else { mx=p.x+Math.cos(ang)*sepPx; my=p.y+Math.sin(ang)*sepPx*0.9; }
        }
        let mpx=Math.max(MOON_MIN, px*m.rk/b.rk);                      // the true ratio to the planet's glyph
        if(S.realScale) mpx=Math.min(Math.max(mpx, V.foc*(m.rk*KM_PC)/mdepth), Math.min(W,H)*4);   // its own disc, up close
        // inside the glyph it is not resolved: nothing to draw, nothing to pick — except a moon
        // crossing in front of a planet that is itself a disc already (a transit)
        if(!msel && sepPx < px+mpx+2 && !(S.realScale && truePx>=20 && mdepth<p.depth)) return;
        // the orbit outline, sampled in eccentric anomaly, once it is more than a dot
        if(mp && sepPx>=7 && sepPx<4*Math.max(W,H)){
          const seg = sepPx<40 ? 12 : 24, pts=[];
          for(let k=0;k<=seg;k++){ const rp=moonOrbitPoint(eph, k/seg*6.2832);
            if(S.realScale){ const q=project(w[0]+rp[0]*KM_PC, w[1]+rp[1]*KM_PC, w[2]+rp[2]*KM_PC); if(q.depth<=V.NEAR){ pts.length=0; break; } pts.push(q.x,q.y); }
            else { camDir2i(rp[0],rp[1],rp[2]); pts.push(p.x+_d2x*kmPx, p.y+_d2y*kmPx); } }
          if(pts.length){ ctx.beginPath(); ctx.moveTo(pts[0],pts[1]);
            for(let k=2;k<pts.length;k+=2) ctx.lineTo(pts[k],pts[k+1]);
            ctx.strokeStyle=`rgba(160,175,205,${A*0.15})`; ctx.lineWidth=0.6; ctx.stroke(); }
        } else if(!mp && sepPx>=7){                                      // no elements: a schematic ring
          ctx.beginPath(); ctx.ellipse(p.x,p.y,sepPx,sepPx*0.9,-0.3,0,6.2832);
          ctx.strokeStyle=`rgba(160,175,205,${A*0.13})`; ctx.lineWidth=0.6; ctx.stroke();
        }
        ballFill(mx,my,mpx,m.c,A);
        if(m.n==='Moon'&&mpx>=26){                 // the Moon gets its real face up close
          const gcv=bodyGlobe({n:'Moon',_e:b._e},mpx,jdM);
          if(gcv) ctx.drawImage(gcv,mx-mpx,my-mpx,mpx*2,mpx*2);
        }
        if(msel){ ctx.beginPath(); ctx.arc(mx,my,mpx+5,0,6.2832);
          ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1; ctx.stroke(); }
        solarProj.push({o:m,x:mx,y:my,px:Math.max(4,mpx)});
        if((px>vmin*0.004||msel)&&(!m.minor||msel)&&(msel||sepPx>px+mpx+8)){ ctx.font='9px ui-monospace,monospace';
          ctx.fillStyle=`rgba(${m.c[0]},${m.c[1]},${m.c[2]},${A*0.8})`;
          ctx.fillText(m.n, mx+mpx+3, my+3); }
      });
    }
  }
  if(S.lag) drawLagrange(A);
  // belt labels
  const bl=project(orbitR(2.7),0,0);
  if(bl.depth>V.NEAR){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(170,158,130,${A*0.6})`;
    ctx.fillText('Asteroid belt', bl.x+4, bl.y-3); }
  if(S.ast) drawSmall(A, solarJD());
  if(S.helio){
    // faint blue shell between the termination shock and the heliopause
    const rTS=orbitR(90), rHP=orbitR(122), sunp=project(0,0,0);
    if(sunp.depth>V.NEAR){ const rr=Math.abs(project(rHP,0,0).x-sunp.x)||0;
      drawHalo(haloSprite('helio',[[0,'rgba(90,140,220,0)'],[.72,'rgba(90,150,225,0.05)'],[1,'rgba(120,170,235,0.11)']]),
               sunp.x,sunp.y,rr,A); }
    orbitRing(rTS,`rgba(135,195,238,${A*0.5})`,[3,5]);
    orbitRing(rHP,`rgba(165,180,242,${A*0.62})`,[2,5]);
    const ts=project(rTS,0,0), hp2=project(rHP,0,0);
    ctx.font='9px ui-monospace,monospace';
    if(ts.depth>V.NEAR){ ctx.fillStyle=`rgba(145,200,238,${A*0.8})`; ctx.fillText('termination shock ~90 AU', ts.x+4, ts.y+11); }
    if(hp2.depth>V.NEAR){ ctx.fillStyle=`rgba(172,190,244,${A*0.85})`; ctx.fillText('heliopause ~120 AU', hp2.x+4, hp2.y-3); }
  }
  if(S.probes) drawProbes(A);
  if(S.iso) drawISO(A);
  if(S.cme) drawCME(A);
  if(S.neo){ drawLiveNeo(A); drawFireballs(A); }
  if(S.sat) drawSats(A);
  if(V.TRANSFER) drawTransfer(A);
  ctx.globalAlpha=1;
}
function outerHidden(b){ return (b.kind==='Trans-Neptunian object'||b.kind==='Centaur') && !S.tno; }
function drawProbes(A){ LBL.prio=P_PROBE;
  const sun=project(0,0,0);
  const drawn=PROBES.map(p=>{ const w=eclToWorld(p._e[0],p._e[1],p._e[2]); return {p,pr:project(w[0],w[1],w[2])}; })
    .filter(d=>d.pr.depth>V.NEAR).sort((a,b)=>a.pr.z2-b.pr.z2);
  for(const {p,pr} of drawn){
    const c=p.c, sel=(p===S.hover||p===S.pinned);
    pathBegin(); pathPt(sun); pathPt(pr); pathStroke(`rgba(${c[0]},${c[1]},${c[2]},${A*0.16})`,0.7,[2,4]);
    const sz=4.5;
    ctx.beginPath(); ctx.moveTo(pr.x,pr.y-sz); ctx.lineTo(pr.x+sz,pr.y); ctx.lineTo(pr.x,pr.y+sz); ctx.lineTo(pr.x-sz,pr.y); ctx.closePath();
    ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${A})`; ctx.fill();
    if(sel){ ctx.beginPath(); ctx.arc(pr.x,pr.y,sz+6,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.2; ctx.stroke(); }
    solarProj.push({o:p,x:pr.x,y:pr.y,px:Math.max(7,sz+3)});
    ctx.font=(sel?'10px':'9px')+' ui-monospace,monospace'; ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${A*0.92})`;
    if(sel||!nearSun(pr.x,pr.y)) ctx.fillText(p.n, pr.x+sz+4, pr.y+3);
  }
}
// ---- interstellar visitors: the only known objects from beyond the solar system ----
// hyperbolic elements (JPL SBDB) solved via the hyperbolic Kepler equation, so the
// time slider replays each passage (1I: 2017, 2I: 2019, 3I: 2025)
export const ISO=[
 {n:'1I/ʻOumuamua', q:0.255343,e:1.20113,i:122.7417,om:24.5997, w:241.8105,tp:2458005.99,rk:0.11,
  note:'first interstellar visitor (2017) — elongated, tumbling, origin still debated'},
 {n:'2I/Borisov',   q:2.00664, e:3.3565, i:44.0526, om:308.1490,w:209.1246,tp:2458826.05,rk:0.4,
  note:'first clearly cometary interstellar visitor (2019)'},
 {n:'3I/ATLAS',     q:1.35638, e:6.1395, i:175.1131,om:322.1577,w:127.9889,tp:2460978.03,rk:1.4,
  note:'third interstellar visitor (2025) — fastest yet, ~58 km/s hyperbolic excess'},
];
ISO.forEach(o=>{ o.kind='Interstellar object'; o.c=[110,255,180]; o.iso=true; });
function isoEcl(o,jd){
  const a=o.q/(1-o.e), M=0.01720209895/Math.sqrt(-a*a*a)*(jd-o.tp);
  let H=Math.sign(M||1)*Math.log(2*Math.abs(M)/o.e+1.8);
  for(let k=0;k<40;k++){ const d=(o.e*Math.sinh(H)-H-M)/(o.e*Math.cosh(H)-1);
    H-=d; if(Math.abs(d)<1e-12) break; }
  const nu=2*Math.atan(Math.sqrt((o.e+1)/(o.e-1))*Math.tanh(H/2)), r=a*(1-o.e*Math.cosh(H));
  const xw=r*Math.cos(nu), yw=r*Math.sin(nu);
  const cw=Math.cos(o.w*D2R),sw=Math.sin(o.w*D2R),ci=Math.cos(o.i*D2R),si=Math.sin(o.i*D2R),
        cO=Math.cos(o.om*D2R),sO=Math.sin(o.om*D2R);
  return [(cO*cw-sO*sw*ci)*xw+(-cO*sw-sO*cw*ci)*yw,
          (sO*cw+cO*sw*ci)*xw+(-sO*sw+cO*cw*ci)*yw,
          (sw*si)*xw+(cw*si)*yw];
}
function drawISO(A){ LBL.prio=P_PROBE;
  const jd=solarJD();
  for(const o of ISO){
    o._e=isoEcl(o,jd); o._r=Math.hypot(o._e[0],o._e[1],o._e[2]);
    if(!o._path){ o._path=[];                    // the hyperbola is fixed in space — sample once
      for(let k=0;k<=120;k++){ const e2=isoEcl(o, o.tp-1460+k/120*2920);
        o._path.push(Math.hypot(e2[0],e2[1],e2[2])<=35?e2:null); } }
    pathBegin();
    for(const e2 of o._path){
      if(!e2){ pathBreak(); continue; }
      const w=eclToWorld(e2[0],e2[1],e2[2]); pathPt(project(w[0],w[1],w[2]));
    }
    pathStroke(`rgba(110,255,180,${A*0.42})`,1,[4,4]);
    const w=eclToWorld(o._e[0],o._e[1],o._e[2]), p=project(w[0],w[1],w[2]);
    if(p.depth<=V.NEAR||offscr(p)) continue;
    const sel=(o===S.hover||o===S.pinned), sz=sel?6:5;
    ctx.beginPath(); ctx.moveTo(p.x,p.y-sz); ctx.lineTo(p.x+sz,p.y); ctx.lineTo(p.x,p.y+sz); ctx.lineTo(p.x-sz,p.y); ctx.closePath();
    ctx.fillStyle=`rgba(110,255,180,${A})`; ctx.fill();
    ctx.beginPath(); ctx.arc(p.x,p.y,sz+4,0,6.2832);
    ctx.strokeStyle=`rgba(110,255,180,${A*(sel?0.9:0.45)})`; ctx.lineWidth=1.1; ctx.stroke();
    solarProj.push({o,x:p.x,y:p.y,px:sz+5});
    ctx.font=(sel?'10px':'9px')+' ui-monospace,monospace';
    ctx.fillStyle=`rgba(150,255,200,${A*0.95})`;
    if(sel||!nearSun(p.x,p.y)) ctx.fillText(o.n+' · interstellar', p.x+sz+4, p.y+3);
  }
}
// large asteroids & comets on their real orbits (time-aware)
function drawSmall(A, jd){ LBL.prio=P_SMALL;
  const sun=project(0,0,0);
  for(const o of SMALL){
    o._el=keplerSB(o.kd,jd); o._e=orbPoint(o._el,o._el.E); o._r=Math.hypot(o._e[0],o._e[1],o._e[2]);
    const com=o.t==='COM', bulk=o.t==='COM2';
    if(!bulk || o===S.hover || o===S.pinned)
      drawOrbitEllipse(o._el, (com||bulk)?`rgba(120,210,228,${A*(bulk?0.30:0.26)})`:`rgba(172,166,150,${A*0.18})`);
  }
  const drawn=SMALL.map(o=>{ const w=eclToWorld(o._e[0],o._e[1],o._e[2]); return {o,p:project(w[0],w[1],w[2])}; })
    .filter(d=>d.p.depth>V.NEAR).sort((a,b)=>a.p.z2-b.p.z2);
  for(const {o,p} of drawn){
    const com=o.t==='COM', bulk=o.t==='COM2';
    const c=com?[135,222,234]:bulk?[110,190,205]:[190,180,158];
    const px=bulk?1.8:Math.max(2.2, Math.min(6, 3*A + (com?1:0)));
    if(com && sun.depth>V.NEAR){                 // simple anti-solar tail
      let tx=p.x-sun.x, ty=p.y-sun.y, tl=Math.hypot(tx,ty)||1; tx/=tl; ty/=tl;
      const g=ctx.createLinearGradient(p.x,p.y,p.x+tx*22,p.y+ty*22);
      g.addColorStop(0,`rgba(150,230,240,${A*0.6})`); g.addColorStop(1,'rgba(150,230,240,0)');
      ctx.strokeStyle=g; ctx.lineWidth=2.4; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+tx*22,p.y+ty*22); ctx.stroke();
    }
    const sel=(o===S.hover||o===S.pinned);
    ctx.beginPath(); ctx.arc(p.x,p.y,px,0,6.2832); ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${A})`; ctx.fill();
    if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,px+5,0,6.2832); ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    solarProj.push({o,x:p.x,y:p.y,px:Math.max(6,px)});
    if((A>0.5||sel)&&(!bulk||sel)&&(sel||!nearSun(p.x,p.y))){ ctx.font=(sel?'10px':'8.5px')+' ui-monospace,monospace';
      ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${sel?1:0.72})`;
      LBL.prio=sel?P_SEL:P_SMALL; ctx.fillText(o.n, p.x+px+3, p.y+3); LBL.prio=P_SMALL; }
  }
}
// a body's world position in the current frame (tests pin the camera on it)
export function bodyWorld(n){ const b=SOLAR_BODIES.find(b=>b.n===n); return b&&b._w ? b._w.slice() : null; }
