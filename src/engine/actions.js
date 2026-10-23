// Actions: fly-to, search, presets, facility filters, the year slider.
import { UI } from '../lib/api.js';
import { bindToggle, clickToggle, syncToggle } from './controls.js';
import { GAL, PC2LY, STARS } from './data.js';
import { fmt, showNav } from './hud.js';
import { navWorld } from './nav.js';
import { CLUSTERS, DSO, PULSARS, SGRA } from './sky-data.js';
import { FAC, HYG, PROBES, SMALL, SOLAR_BODIES, SUN, TNOS } from './solar-data.js';
import { ISO } from './solar.js';
import { S, V } from './state.js';
import { solStop } from './timeline.js';
import { computeRoute, computeTransfer } from './transfer.js';
import { DPR, camCosmos, camSolar, compress, invScale, scale, tgtCtr } from './view.js';
// ---- navigation controls ----
document.getElementById('info').addEventListener('click',e=>{
  if(e.target.classList.contains('navset')){ V.navTarget=S.pinned||S.hover; showNav(true); }
  if(e.target.classList.contains('lockset')){ const b=S.pinned||S.hover;
    if(!b) return;
    if(V.FOLLOW===b) V.FOLLOW=null;
    else { const w=b===SUN?[0,0,0]:navWorld(b);
      if(w){ tgtCtr.x=w[0]; tgtCtr.y=w[1]; tgtCtr.z=w[2]; V.FOLLOW=b;
        S.autorot=false; syncToggle('t-rot',false); } }
    V.lastInfo=undefined; V.dirty=true; }
  if(e.target.classList.contains('transferset')){ const b=S.pinned||S.hover;
    if(!b) return;
    if(b.rk!==undefined && (b.k||b.kd)){               // solar-system body → Lambert transfer
      if(V.TRANSFER && V.TRANSFER.to===b){ V.TRANSFER=null; V.lastInfo=undefined; V.dirty=true; }
      else computeTransfer(b);
    } else {                                           // star / galaxy / anything else → 1g route
      if(V.ROUTE && V.ROUTE.o===b){ V.ROUTE=null; V.lastInfo=undefined; V.dirty=true; }
      else computeRoute(b);
    } }
});
document.getElementById('navClose').addEventListener('click',()=>showNav(false));
document.getElementById('navGo').addEventListener('click',()=>{
  if(!V.navTarget) return;
  if(V.navTarget.p&&V.navTarget._dx!==undefined){ V.focusSys=V.navTarget; V.focusSysW=objWorld(V.navTarget); }
  if(objWorld(V.navTarget)) flyTo(V.navTarget);
  else { const w=navWorld(V.navTarget); if(w) aim(w[0],w[1],w[2], scale(3e-6)); }
});
bindToggle('t-mw','mw',()=>{ const el=document.getElementById('hud-mwmap'); if(el) el.style.display=S.mw?'block':'none'; });

// top-down schematic of the Milky Way (spiral arms + bar + "you are here")
function drawMWMap(){
  const cv2=document.getElementById('mwmap'); if(!cv2) return;
  const W2=198,H2=150, cx2=W2/2, cy2=H2*0.54, Rd=68;
  cv2.width=W2*DPR; cv2.height=H2*DPR;
  const g=cv2.getContext('2d'); g.setTransform(DPR,0,0,DPR,0,0);
  g.clearRect(0,0,W2,H2);
  g.save(); g.translate(cx2,cy2); g.scale(1,0.62);            // slight top-down tilt
  g.fillStyle='rgba(90,110,175,0.07)'; g.beginPath(); g.arc(0,0,Rd,0,6.2832); g.fill();
  for(let a=0;a<4;a++){                                        // 4 logarithmic spiral arms
    g.beginPath();
    for(let i=0;i<=130;i++){ const th=i/130*3.7, r=7*Math.exp(0.24*th);
      if(r>Rd)break; const ang=th+a*Math.PI/2, x=Math.cos(ang)*r, y=Math.sin(ang)*r;
      if(i===0)g.moveTo(x,y);else g.lineTo(x,y); }
    g.strokeStyle='rgba(150,180,240,0.32)'; g.lineWidth=3.4; g.stroke();
  }
  g.rotate(0.5); g.fillStyle='rgba(255,222,150,0.5)';         // central bar
  g.beginPath(); g.ellipse(0,0,24,10,0,0,6.2832); g.fill(); g.restore();
  // Sgr A* (centre)
  g.beginPath(); g.arc(cx2,cy2,3,0,6.2832); g.fillStyle='#0a0a12'; g.fill();
  g.strokeStyle='rgba(255,205,130,0.95)'; g.lineWidth=1; g.stroke();
  g.font='9px ui-monospace,monospace'; g.fillStyle='rgba(255,205,150,0.9)'; g.fillText('Sgr A*', cx2+5, cy2-3);
  // Sun (~8 kpc out, in the Orion spur)
  const sr=Rd*0.52, sa=-0.85, sx=cx2+Math.cos(sa)*sr, sy=cy2+Math.sin(sa)*sr*0.62;
  g.beginPath(); g.arc(sx,sy,3,0,6.2832); g.fillStyle='#eafffb'; g.fill();
  g.fillStyle='rgba(233,237,250,0.9)'; g.fillText('Sun', sx+5, sy+3);
}
drawMWMap();

// the overview is only reachable in the compact view — real scale tops out at 6e7 pc,
// a thousandth of the way to the CMB shell
function goCosmos(){ if(S.realScale) clickToggle('t-real'); V.tgtCamZ=camCosmos(); }
document.getElementById('resetBtn').addEventListener('click',()=>{
  V.tgtYaw=0.5;V.tgtPitch=-0.35;S.focusStar=null;S.pinned=null;V.focusSys=null;
  tgtCtr.x=tgtCtr.y=tgtCtr.z=0;                    // back to the Sun
  goCosmos();                                      // overview: the whole universe
  S.autorot=false;syncToggle('t-rot',false);
});

// instrument colour switch + filter chips
export function facColorToggle(){ S.facColor=!S.facColor; if(UI.facColor) UI.facColor(S.facColor); V.dirty=true; return S.facColor; }
{ const tf=document.getElementById('t-fac');
  if(tf&&tf.addEventListener) tf.addEventListener('click',e=>{ facColorToggle(); if(e.currentTarget.classList) e.currentTarget.classList.toggle('on',S.facColor); }); }
// fly into / out of the solar system — pure camera move along the unified scale
const solarBtn=document.getElementById('solarBtn');
export function enterSolar(){ S.pinned=null; S.hover=null; V.tgtCamZ=camSolar(); V.tgtPitch=-0.5;
  tgtCtr.x=tgtCtr.y=tgtCtr.z=0; }
solarBtn.addEventListener('click',()=>{
  if(V.solarA>0.5){ goCosmos(); V.tgtPitch=-0.35;                  // fly back out
    tgtCtr.x=tgtCtr.y=tgtCtr.z=0; }
  else enterSolar();                                             // fly in
  S.pinned=null;
});
let _wasSolar=null;
export function syncSolarBtn(){
  const inS=V.solarA>0.5;
  if(inS!==_wasSolar){ _wasSolar=inS;
    solarBtn.textContent=inS?'← Back to space':'☉ Into the solar system';
    solarBtn.classList.toggle('active',inS);
    document.getElementById('hud-time').style.display=inS?'none':'flex';
    document.getElementById('hud-soltime').style.display=inS?'flex':'none';
    if(inS) stopPlay(); else solStop();          // swap the two time controls
  }
}

const facCount={}; for(const s of STARS) facCount[s.fac]=(facCount[s.fac]||0)+1;
export const facList=Object.keys(FAC).filter(k=>facCount[k]).sort((a,b)=>facCount[b]-facCount[a])
  .map(k=>({k, l:FAC[k].l, c:FAC[k].c, n:facCount[k]}));
export function toggleFac(k){ if(S.facHidden.has(k)) S.facHidden.delete(k); else S.facHidden.add(k);
  V.dirty=true; return S.facHidden.has(k); }
if(UI.fac) UI.fac(facList);
const facEl=document.getElementById('facChips');
if(!UI.fac&&facEl&&facEl.appendChild) Object.keys(FAC).filter(k=>facCount[k]).sort((a,b)=>facCount[b]-facCount[a]).forEach(k=>{
  const f=FAC[k], div=document.createElement('div');
  div.className='chip'; div.dataset.k=k;
  div.innerHTML=`<span class="cdot" style="background:rgb(${f.c[0]},${f.c[1]},${f.c[2]})"></span>`+
    `<span>${f.l}</span><span class="cn">${facCount[k].toLocaleString('en-US')}</span>`;
  div.addEventListener('click',()=>{
    if(S.facHidden.has(k)){S.facHidden.delete(k);div.classList.remove('off');}
    else{S.facHidden.add(k);div.classList.add('off');}
  });
  facEl.appendChild(div);
});

// year slider
const yearEl=document.getElementById('year'), yrVal=document.getElementById('yrVal'),
  yrMeta=document.getElementById('yrMeta');
export function setYear(y,fromInput){
  S.year=+y; yrVal.textContent=y; if(!fromInput)yearEl.value=y;
  const pct=((y-1992)/(2026-1992))*100;
  yearEl.style.setProperty('--pct',pct+'%');
  // cumulative counts
  let sys=0,pl=0;
  for(const s of STARS){ if(s.fy<=y&&s.fy!==0){sys++;} }
  for(const s of STARS) for(const p of s.p) if(p.y<=y&&p.y!==0) pl++;
  yrMeta.innerHTML=`${fmt(sys)} systems · ${fmt(pl)} planets<br>by end of ${y}`;
}
yearEl.addEventListener('input',e=>{setYear(e.target.value,true);stopPlay();});
setYear(2026);

// play
export let playing=false;
const playIcon=document.getElementById('playIcon');
export function stopPlay(){playing=false;playIcon.innerHTML='<path d="M3 2l11 6L3 14z"/>';}
function startPlay(){
  if(S.year>=2026) setYear(1992);
  playing=true; playIcon.innerHTML='<path d="M3 2h4v12H3zM9 2h4v12H9z"/>';
}
document.getElementById('play').addEventListener('click',()=>{playing?stopPlay():startPlay();});

// search
let _lastMsg='';
export const searchMsg={ set textContent(v){ _lastMsg=v; if(UI.msg) UI.msg(v);
    const el=document.getElementById('searchMsg'); if(el&&!UI.msg) el.textContent=v; },
  get textContent(){ return _lastMsg; } };
export function doSearch(q){
  q=q.trim().toLowerCase(); if(!q){searchMsg.textContent='';return;}
  const eq=s=>s&&s.toLowerCase()===q, has=s=>s&&s.toLowerCase().includes(q);
  const cands=[];
  const push=(t,o)=>{ if(o) cands.push([t,o]); };
  // the galactic centre is a special object, not in any catalogue list
  if(/^(sgr ?a\*?|sagittarius a\*?|galactic cent(er|re))$/.test(q)){
    searchMsg.textContent='→ Sgr A* · galactic centre';
    if(!S.mw){S.mw=true;syncToggle('t-mw',true);}
    V.focusSys=null; S.pinned=SGRA; flyTo(SGRA); return; }
  // exact first
  push('iso', ISO.find(o=>eq(o.n)));
  push('small',SMALL.find(o=>eq(o.n)));
  push('dso', DSO.find(o=>eq(o.n)));
  push('hyg', HYG.find(s=>eq(s.n)));
  push('gal', GAL.find(g=>eq(g.n)||eq(g.id)));
  push('star',STARS.find(s=>eq(s.h)));
  push('body',SOLAR_BODIES.find(b=>eq(b.n))||(eq('sun')?SUN:null));
  push('probe',PROBES.find(p=>eq(p.n)));
  push('tno2',TNOS.find(t2=>eq(t2.n)));
  push('psr',PULSARS.find(o=>eq(o.n)));
  push('clu',CLUSTERS.find(c=>eq(c.n)));
  // substring fallback — ISO first: "borisov"/"atlas" should hit 2I/3I, not namesake comets
  push('iso', ISO.find(o=>has(o.n)));
  push('small',SMALL.find(o=>has(o.n)));
  push('dso', DSO.find(o=>has(o.n)));
  push('hyg', HYG.find(s=>has(s.n)));
  push('gal', GAL.find(g=>has(g.n)||has(g.id)));
  push('star',STARS.find(s=>s._search.includes(q)));
  push('body',SOLAR_BODIES.find(b=>has(b.n)));
  push('probe',PROBES.find(p=>has(p.n)));
  push('tno2',TNOS.find(t2=>has(t2.n)));
  push('psr',PULSARS.find(o=>has(o.n)));
  push('clu',CLUSTERS.find(c=>has(c.n)));
  if(!cands.length){searchMsg.textContent='nothing found';return;}
  const [t,o]=cands[0];
  if(t==='iso'){ searchMsg.textContent='→ '+o.n+' (interstellar)';
    if(!S.iso){S.iso=true;syncToggle('t-iso',true);} V.focusSys=null; enterSolar(); S.pinned=o; return; }
  if(t==='small'){ searchMsg.textContent='→ '+o.n+' ('+o.kind+')';
    if(!S.ast){S.ast=true;syncToggle('t-ast',true);} V.focusSys=null; enterSolar(); S.pinned=o; return; }
  if(t==='body'){ searchMsg.textContent='→ '+o.n+' ('+(o.kind||'')+')';
    V.focusSys=null; enterSolar(); S.pinned=o; return; }   // pin AFTER enterSolar — it clears the pin
  if(t==='probe'||t==='tno2'){ searchMsg.textContent='→ '+o.n+' ('+(o.kind||'')+')';
    if(t==='probe'&&!S.probes){S.probes=true;syncToggle('t-probes',true);}
    if(t==='tno2'&&!S.tno){S.tno=true;syncToggle('t-tno',true);}
    V.focusSys=null; enterSolar(); S.pinned=o; return; }
  if(t==='psr'||t==='clu'){ searchMsg.textContent='→ '+o.n+' · '+fmt(o.d*PC2LY)+' ly';
    if(t==='psr'&&!S.psr){S.psr=true;syncToggle('t-psr',true);}
    if(t==='clu'&&!S.oclu){S.oclu=true;syncToggle('t-oclu',true);}
    V.focusSys=null; S.pinned=o;
    const R=scale(o.d); aim(o._dir[0]*R,o._dir[1]*R,o._dir[2]*R, scale(o.d*0.25)); return; }
  if(t==='dso'){ searchMsg.textContent='→ '+o.n+' · '+fmt(o.d*PC2LY)+' ly';
    V.focusSys=null; S.pinned=o; if(!S.dso){S.dso=true;syncToggle('t-dso',true);}
    const R=scale(o.d); aim(o._dir[0]*R,o._dir[1]*R,o._dir[2]*R, scale(o.d*0.25)); }
  else if(t==='gal'){ searchMsg.textContent='→ '+o.n+' · '+fmt(o.mpc*3.2616)+' Mly'; focusOnGalaxy(o); }
  else if(t==='hyg'){ searchMsg.textContent='→ '+(o.n||'Stern')+' · '+fmt(o.d*PC2LY)+' ly'; focusOnHyg(o); }
  else { searchMsg.textContent='→ '+o.h+' · '+fmt(o.d*PC2LY)+' ly';
         if(o.fy>S.year&&o.fy!==0) setYear(o.fy); focusOn(o); }
}
export function aim(x,y,z,margin){        // travel: move the view centre onto the target
  if(!isFinite(x+y+z+margin)) return;              // a NaN camera is a black screen
  V.FOLLOW=null;
  tgtCtr.x=x; tgtCtr.y=y; tgtCtr.z=z;
  V.tgtCamZ=Math.max(scale(3e-6), margin);
  S.autorot=false; syncToggle('t-rot',false);
}
// world position of a clickable cosmic object (null for solar bodies → handled by zoom)
export function objWorld(o){
  // compute from direction × distance — the cached _x is only set once the layer
  // has drawn, which never happens while parked in the solar system (NaN camera)
  if((o.psr||o.oclu||o.gpick||o.sgra||o.dso)&&o._dir&&o.d!==undefined){
    const R=scale(o.d); return [o._dir[0]*R,o._dir[1]*R,o._dir[2]*R]; }
  if(o.sgra||o.dso) return [o._x,o._y,o._z];                     // Sgr A* / deep-sky (fallback)
  if(o.mpc!==undefined) return [o._x,o._y,o._z];                       // galaxy
  if(o.p && o._dx!==undefined){ const d=compress(o._r); return [o._dx*d,o._dy*d,o._dz*d]; } // exoplanet host
  if(o.m!==undefined && o.dx!==undefined){ const d=compress(o.d); return [o.dx*d,o.dy*d,o.dz*d]; } // HYG star
  return null;
}
export function flyTo(o){
  const w=objWorld(o); if(!w) return;
  const physPc=invScale(Math.hypot(w[0],w[1],w[2]))||1;
  let m;
  if(o.p) m=S.realScale?scale(physPc*0.12):scale(3e-5);   // host: beside it (real) / into its system (log)
  else if(o.m!==undefined&&o.dx!==undefined) m=scale(physPc*0.2);   // field star
  else m=scale(physPc*0.25);                          // galaxy / DSO / Sgr A*
  aim(w[0],w[1],w[2],m);
}
export function focusOn(s){                       // exoplanet host → fly in & open its system
  S.pinned=s; S.focusStar=s; V.focusSys=s; V.focusSysW=objWorld(s);
  aim(V.focusSysW[0],V.focusSysW[1],V.focusSysW[2], S.realScale?scale(s._r*0.12):scale(3e-5));
}
export function focusOnGalaxy(g){
  if(!S.galaxies){S.galaxies=true;syncToggle('t-gal',true);}
  S.pinned=g; S.focusStar=null; V.focusSys=null;
  const R=scale(g.mpc*1e6);
  aim(g.dx*R,g.dy*R,g.dz*R, scale(g.mpc*1e6*0.25));
}
export function focusOnHyg(s){
  if(!S.hyg){S.hyg=true;syncToggle('t-hyg',true);}
  S.pinned=s; S.focusStar=null; V.focusSys=null;
  const dr=compress(s.d); aim(s.dx*dr,s.dy*dr,s.dz*dr, scale(s.d*0.2));
}
