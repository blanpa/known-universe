// HUD: scale readout, course reticle, stats, nav panel.
import { svgIcon } from '../lib/icons.js';
import { syncSolarBtn } from './actions.js';
import { ctx } from './canvas.js';
import { PC2LY } from './data.js';
import { showInfo } from './info.js';
import { LBL, P_HUD, P_STAR } from './labels.js';
import { camXY, fmtLight, navDistPc, navPhys, navWorld } from './nav.js';
import { farD, nearD, visPl, visSys } from './render.js';
import { SUN } from './solar-data.js';
import { S, V } from './state.js';
import { AU_PC, H, KDEC, W, camDist, camFwd, camPos, invScale } from './view.js';
// ---- scale readout ---------------------------------------------------------
// A linear scale bar would be a lie in the compact view: that projection is
// logarithmic and radial, so a fixed screen length is a fixed *ratio*, not a fixed
// distance. So we draw the honest thing for each mode — a decade ladder in the
// compact view, a real 1-2-5 bar when distances are proportional.
function fmtDist(pc){
  if(!isFinite(pc)||pc<=0) return '0';
  const au=pc/AU_PC;
  if(au<0.02) return (au*1.496e8).toFixed(0)+' km';
  if(au<2000) return (au<10?au.toFixed(2):fmt(au))+' AU';
  const ly=pc*PC2LY;
  if(ly<1e3) return (ly<10?ly.toFixed(2):fmt(ly))+' ly';
  if(ly<1e6) return (ly/1e3).toFixed(ly<1e4?2:1)+' kly';
  if(ly<1e9) return (ly/1e6).toFixed(ly<1e7?2:1)+' Mly';
  return (ly/1e9).toFixed(2)+' Gly';
}
function niceLen(v){                      // round down to the nearest 1 / 2 / 5 × 10^n
  const e=Math.pow(10,Math.floor(Math.log10(v))), m=v/e;
  return (m>=5?5:m>=2?2:1)*e;
}
export function drawScaleBar(){
  if(!S.labels) return;
  const narrow = W<=720;
  // the docked timeline strip owns the bottom edge when it is on
  const strip = document.body.classList.contains('show-time') ? 48 : 0;
  const x0 = 16, y0 = H - (narrow?92:30) - strip;
  const dim='rgba(154,163,184,0.85)', ink='rgba(232,235,244,0.95)';
  LBL.prio=P_HUD;
  ctx.textAlign='left'; ctx.textBaseline='alphabetic';
  // how far out the camera itself sits — the "where am I" number
  const here = camDist>1e-9 ? invScale(camDist) : 0;
  ctx.font='10px ui-monospace,monospace'; ctx.fillStyle=dim;
  ctx.fillText(here>0 ? 'eye · '+fmtDist(here)+' from the Sun' : 'eye · at the Sun', x0, y0-22);

  if(S.realScale){                        // proportional space → a true scale bar
    const pcPerPx=S.camZ/V.foc;
    let L=niceLen(pcPerPx*(narrow?90:150));
    let px=L/pcPerPx;
    if(px<40){ L=niceLen(pcPerPx*220); px=L/pcPerPx; }
    if(!isFinite(px)||px<8) return;
    px=Math.min(px, W*0.4);
    ctx.strokeStyle=dim; ctx.lineWidth=1.2; ctx.beginPath();
    ctx.moveTo(x0,y0-9); ctx.lineTo(x0,y0-3); ctx.lineTo(x0+px,y0-3); ctx.lineTo(x0+px,y0-9);
    ctx.stroke();
    ctx.font='11px ui-monospace,monospace'; ctx.fillStyle=ink;
    ctx.fillText(fmtDist(L), x0, y0+9);
  } else {                                // logarithmic space → a decade ladder
    const dec=KDEC*V.foc/S.camZ;            // screen px for one factor of 10
    if(!isFinite(dec)||dec<2) return;
    let k=1; while(dec*k<64 && k<12) k++;
    let px=dec*k;
    if(px>W*0.42){ px=dec; k=1; }
    if(px<18) return;
    ctx.strokeStyle=dim; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(x0,y0-9); ctx.lineTo(x0,y0-3); ctx.lineTo(x0+px,y0-3); ctx.lineTo(x0+px,y0-9); ctx.stroke();
    if(k===1 && dec>26){                  // room for the intermediate decade ticks
      for(let i=1;i<10;i++){ const tx=x0+Math.log10(i+1)*dec;
        ctx.beginPath(); ctx.moveTo(tx,y0-3); ctx.lineTo(tx,y0-6.5); ctx.stroke(); }
    }
    ctx.font='11px ui-monospace,monospace'; ctx.fillStyle=ink;
    ctx.fillText('×'+(k===1?'10':'10^'+k)+' distance', x0, y0+9);
  }
  LBL.prio=P_STAR;
}
export function drawNav(){ LBL.prio=P_HUD;
  if(!V.navTarget) return;
  const w=navWorld(V.navTarget); if(!w) return;
  const c=camXY(w[0],w[1],w[2]);
  let onscreen=false, sx=0, sy=0;
  if(c.depth>V.NEAR){ sx=V.cx+V.foc*c.x1/c.depth; sy=V.cy-V.foc*c.y2/c.depth;
    onscreen=(sx>12&&sx<W-12&&sy>12&&sy<H-12); }
  ctx.strokeStyle='rgba(79,214,200,0.9)'; ctx.fillStyle='rgba(79,214,200,0.9)'; ctx.lineWidth=1.4;
  if(onscreen){                              // course line + targeting reticle
    ctx.save(); ctx.setLineDash([6,6]); ctx.strokeStyle='rgba(79,214,200,0.4)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(V.cx,V.cy); ctx.lineTo(sx,sy); ctx.stroke(); ctx.restore();
    ctx.strokeStyle='rgba(79,214,200,0.9)';
    const r=13;
    ctx.beginPath(); ctx.arc(sx,sy,r,0,6.2832); ctx.globalAlpha=0.5; ctx.stroke(); ctx.globalAlpha=1;
    for(const [ex,ey] of [[-1,-1],[1,-1],[1,1],[-1,1]]){
      ctx.beginPath(); ctx.moveTo(sx+ex*r,sy+ey*r*0.4); ctx.lineTo(sx+ex*r,sy+ey*r);
      ctx.lineTo(sx+ex*r*0.4,sy+ey*r); ctx.stroke(); }
  } else {                                   // off-screen edge arrow toward the target
    let dx=c.x1, dy=-c.y2; if(c.depth<=V.NEAR){ dx=-c.x1; dy=c.y2; }
    const L=Math.hypot(dx,dy)||1; dx/=L; dy/=L;
    const rad=Math.min(W,H)*0.4, ax=V.cx+dx*rad, ay=V.cy+dy*rad;
    ctx.save(); ctx.setLineDash([6,6]); ctx.strokeStyle='rgba(79,214,200,0.35)'; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.moveTo(V.cx,V.cy); ctx.lineTo(ax,ay); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(ax,ay); ctx.rotate(Math.atan2(dy,dx));
    ctx.beginPath(); ctx.moveTo(11,0); ctx.lineTo(-6,7); ctx.lineTo(-6,-7); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.font='10px ui-monospace,monospace'; ctx.textAlign='center';
    ctx.fillText(V.navTarget.n||V.navTarget.h||'Target', ax-dx*18, ay-dy*18+3); ctx.textAlign='left';
  }
}

// ---- HUD ----
export function fmt(n){return Math.round(n).toLocaleString('en-US');}
export let lastInfoNav=false, lastStat=['','','',''];
function setStat(id,v,i){ if(lastStat[i]!==v){ lastStat[i]=v; document.getElementById(id).textContent=v; } }
export function updateHUD(){
  setStat('s-sys',fmt(visSys),0); setStat('s-pl',fmt(visPl),1);
  setStat('s-near', isFinite(nearD)?fmt(nearD*PC2LY):'—',2);
  setStat('s-far', farD?fmt(farD*PC2LY):'—',3);
  const s=S.pinned||S.hover, info=document.getElementById('info'), isNav=(s===V.navTarget);
  if(s!==V.lastInfo || isNav!==lastInfoNav){       // rebuild only on change (keeps the button clickable)
    V.lastInfo=s; lastInfoNav=isNav;
    if(s){ showInfo(s);
      if(s===SUN||navWorld(s)) info.insertAdjacentHTML('beforeend',
        `<button class="lockset">${V.FOLLOW===s?svgIcon('unlock')+'Unlock view':svgIcon('lock')+'Lock & zoom'}</button>`);
      if(navPhys(s)) info.insertAdjacentHTML('beforeend',
        `<button class="navset">${isNav?svgIcon('check')+'Target set':svgIcon('scope')+'Set course'}</button>`);
      // interstellar route button on every cosmic target (solar bodies get Lambert instead)
      if(navPhys(s) && s._e===undefined && s.rk===undefined && !s.lp && !s.iroute && !s.xfer)
        info.insertAdjacentHTML('beforeend',
          `<button class="transferset">${V.ROUTE&&V.ROUTE.o===s?svgIcon('close')+'Clear route':svgIcon('probe')+'Route from Earth · 1g ship'}</button>`);
    } else info.classList.remove('show');
  }
  updateNavPanel();
  syncSolarBtn();
}
function updateNavPanel(){
  const nav=document.getElementById('hud-nav');
  if(!V.navTarget){ if(nav.style.display!=='none') showNav(false); return; }
  document.getElementById('navName').textContent=V.navTarget.n||V.navTarget.h||'Target';
  const dpc=navDistPc();
  document.getElementById('navDist').textContent=fmtDist(dpc);
  document.getElementById('navLight').textContent=fmtLight(dpc);
  const w=navWorld(V.navTarget); let head='–';
  if(w){ const tv=[w[0]-camPos[0],w[1]-camPos[1],w[2]-camPos[2]], tl=Math.hypot(tv[0],tv[1],tv[2])||1;
    const dot=(tv[0]*camFwd[0]+tv[1]*camFwd[1]+tv[2]*camFwd[2])/tl;
    const ang=Math.acos(Math.max(-1,Math.min(1,dot)))*57.2958;
    head=ang<3?'on target':fmt(ang)+'° off'; }
  document.getElementById('navHead').textContent=head;
}
export function showNav(on){
  document.getElementById('hud-nav').style.display=on?'block':'none';
  document.getElementById('hud-pm').style.top=on?'132px':'16px';
  if(!on) V.navTarget=null;
}
