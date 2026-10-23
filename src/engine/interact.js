// Pointer, wheel, touch and keyboard interaction.
import { resetView } from './actions.js';
import { aim, enterSolar, flyTo, objWorld } from './actions.js';
import { cv } from './canvas.js';
import { clickToggle, syncToggle } from './controls.js';
import { SURF, surfPan } from './earth.js';
import { measureMode, measurePick } from './measure.js';
import { navWorld } from './nav.js';
import { gpuPick, pick } from './pick.js';
import { SUN, SUNHIT } from './solar-data.js';
import { S, V } from './state.js';
import { H, W, camBasis, camDist, camPos, camRight, camUp, ctr, keys, project, scale, tgtCtr } from './view.js';
// ---- interaction ----
export let dragging=false,panning=false,lx=0,ly=0,moved=0;
cv.addEventListener('contextmenu',e=>e.preventDefault());
const ptrs=new Map(); let pinching=false, pinchD=0;
cv.addEventListener('pointerdown',e=>{
  ptrs.set(e.pointerId,[e.clientX,e.clientY]);
  if(ptrs.size===2){ pinching=true; dragging=false;
    const p2=[...ptrs.values()]; pinchD=Math.hypot(p2[0][0]-p2[1][0],p2[0][1]-p2[1][1]); return; }
  dragging=true;moved=0;lx=e.clientX;ly=e.clientY;
  panning=(e.button===2||e.button===1||e.shiftKey);
  cv.setPointerCapture(e.pointerId);cv.classList.add('drag');
  if(!panning){S.autorot=false;syncToggle('t-rot',false);}});
cv.addEventListener('pointermove',e=>{
  if(pinching){
    if(ptrs.has(e.pointerId)) ptrs.set(e.pointerId,[e.clientX,e.clientY]);
    if(ptrs.size===2){
      const p2=[...ptrs.values()]; const d=Math.hypot(p2[0][0]-p2[1][0],p2[0][1]-p2[1][1]);
      if(pinchD>4&&d>4){
        let ax=(p2[0][0]+p2[1][0])/2, ay=(p2[0][1]+p2[1][1])/2;   // pinch midpoint
        if(S.pinned){ const w=objWorld(S.pinned);                  // selected star/planet wins
          if(w){ const pp=project(w[0],w[1],w[2]);
            if(pp.depth>V.NEAR&&pp.x>0&&pp.x<W&&pp.y>0&&pp.y<H){ ax=pp.x; ay=pp.y; } } }
        zoomFactorAt(ax,ay,pinchD/d);
      }
      pinchD=d;
    }
    return;
  }
  if(dragging){
    const dx=e.clientX-lx,dy=e.clientY-ly;moved+=Math.abs(dx)+Math.abs(dy);
    if(SURF.on){ surfPan(dx,dy); lx=e.clientX; ly=e.clientY; return; }   // surface map: drag pans
    if(e.ctrlKey||e.metaKey){                      // CAD dolly: Ctrl+drag zooms (up = in)
      zoomFactorAt(e.clientX,e.clientY,Math.exp(dy*(S.realScale?0.008:0.003)));
      lx=e.clientX; ly=e.clientY; return;
    }
    if(panning){                                   // free pan — move the view centre (breaks the lock)
      V.FOLLOW=null;
      const sc=Math.max(S.camZ,camDist)/V.foc;
      tgtCtr.x+=(-camRight[0]*dx+camUp[0]*dy)*sc;
      tgtCtr.y+=(-camRight[1]*dx+camUp[1]*dy)*sc;
      tgtCtr.z+=(-camRight[2]*dx+camUp[2]*dy)*sc;
      S.pinned=null;
    } else if(S.freelook){                         // free-look: turn the camera in place
      camBasis();
      const px=camPos[0],py=camPos[1],pz=camPos[2];
      S.yaw=V.tgtYaw=V.tgtYaw+dx*0.005;
      S.pitch=V.tgtPitch=Math.max(-1.45,Math.min(1.45,V.tgtPitch+dy*0.005));
      const c=Math.cos(S.yaw),sn=Math.sin(S.yaw),cp=Math.cos(S.pitch),sp=Math.sin(S.pitch);
      tgtCtr.x=ctr.x=px+sn*S.camZ; tgtCtr.y=ctr.y=py+(-sp*c)*S.camZ; tgtCtr.z=ctr.z=pz+(cp*c)*S.camZ;
      S.focusStar=null;
    } else {                                       // orbit around the centre
      V.tgtYaw+=dx*0.005; V.tgtPitch+=dy*0.005;
      V.tgtPitch=Math.max(-1.45,Math.min(1.45,V.tgtPitch));
      S.focusStar=null;
    }
    lx=e.clientX;ly=e.clientY;
  } else {
    const h=pick(e.clientX,e.clientY);
    S.hover = (h===SUNHIT)?null:h;
    cv.style.cursor=h?'pointer':'grab';
  }
});
let lastTap={t:0,x:0,y:0}, lastTapFocusT=0;   // touch double-tap (dblclick is unreliable on mobile)
cv.addEventListener('pointerup',e=>{
  ptrs.delete(e.pointerId); if(ptrs.size<2){ pinching=false; pinchD=0; }
  dragging=false;panning=false;cv.classList.remove('drag');
  if(moved<5){
    if(e.pointerType==='touch'&&!measureMode&&!SURF.on){
      const now=performance.now();
      if(now-lastTap.t<350 && Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<40){
        lastTap.t=0; lastTapFocusT=now; focusAt(e.clientX,e.clientY); return; }
      lastTap={t:now,x:e.clientX,y:e.clientY};
    }
    const hit=pick(e.clientX,e.clientY) || gpuPick(e.clientX,e.clientY);
    if(measureMode){ if(hit&&hit!==SUNHIT) measurePick(hit); return; }
    if(hit===SUNHIT){ V.focusSys=null; enterSolar(); return; }
    S.pinned = hit || null;
    if(hit){
      if(hit.p && hit._dx!==undefined){ V.focusSys=hit; V.focusSysW=objWorld(hit); flyTo(hit); } // host → its system
      else if(hit.sgra || hit.dso || hit.psr || hit.oclu || hit.gpick || hit.mpc!==undefined || (hit.m!==undefined && hit.dx!==undefined)){ V.focusSys=null; flyTo(hit); }
      // system planets & solar bodies: just select, no travel
    }
  }
});
// keyboard free-flight (WASD / arrows, R·F up·down)
// frame the selection — CAD-style "zoom to fit" on the picked object
function frameSelection(){
  const b=S.pinned||S.hover; if(!b) return;
  if(b===SUN){ enterSolar(); return; }
  const w=navWorld(b); if(!w) return;
  const isSolar=b._e!==undefined||b.rk!==undefined;
  aim(w[0],w[1],w[2], isSolar?Math.min(V.tgtCamZ,scale(3e-6)):Math.max(scale(3e-6),V.tgtCamZ*0.5));
  if(b._e!==undefined||b===SUN){ V.FOLLOW=b; V.lastInfo=undefined; }   // solar body: frame = track it
  V.dirty=true;
}
addEventListener('keydown',e=>{
  const ae=document.activeElement; if(ae&&ae.tagName==='INPUT') return;
  const k=e.key.toLowerCase();
  if('wasdrf'.includes(k)||e.key.startsWith('Arrow')){ keys.add(k==='arrowup'?'w':k==='arrowdown'?'s':k==='arrowleft'?'a':k==='arrowright'?'d':k); e.preventDefault(); }
  else if(e.key==='.'){ frameSelection(); e.preventDefault(); }
  else if(e.key==='Home'){ resetView(); e.preventDefault(); }
  else if(e.key==='Escape'){ S.pinned=null; S.hover=null; V.FOLLOW=null; V.lastInfo=undefined; V.dirty=true; }
});
addEventListener('keyup',e=>{ const k=e.key.toLowerCase();
  keys.delete(k); keys.delete(k==='arrowup'?'w':k==='arrowdown'?'s':k==='arrowleft'?'a':k==='arrowright'?'d':k); });
function zoomAt(mx,my,delta,deltaMode){
  // delta-proportional zoom: one mouse notch (~100px) ≈ 9% (log) / 30% (real);
  // trackpads fire many small deltas and now scale down instead of over-zooming
  let d = delta===true?-100 : delta===false?100 : delta*(deltaMode===1?33:deltaMode===2?400:1);
  d=Math.max(-200,Math.min(200,d));
  // real mode spans many orders → faster zoom; deep log dive (<0.45) doubles the rate
  const k=S.realScale?0.0026:(V.tgtCamZ<0.45?0.0019:0.00088);
  zoomFactorAt(mx,my,Math.exp(k*d));
}
// Each scale mode covers only part of the range: compact spans 1e-4..16 world units
// (log decades), real spans 1e-12..2e10 pc. The app boots in real mode and camCosmos() is
// 3e7 there, so "Reset" left you one notch below the ceiling and the wheel simply stopped
// — no way to reach the galaxies by zooming, only by finding the Compact view switch.
// The two ranges overlap by orders of magnitude, so hand over at the limit instead:
// clickToggle('t-real') already remaps camZ and ctr through physical distance, which
// makes the switch invisible. Zoom is one continuous range from the CMB to a planet.
// Real scale reaches past the CMB shell (14.3 Gpc): zooming out never has to leave it.
// JS projects in doubles; the GL clouds work in float32 but nothing out there needs
// better than ~1 kpc, and the near solar system is sub-pixel at those framings anyway.
export function zoomRange(){ return S.realScale ? [1e-12, 2e10] : [1e-4, 16]; }
export function zoomFactorAt(mx,my,f){
  let [zmin,zmax]=zoomRange();
  // Zooming out never changes the mode: real scale reaches past the CMB and simply
  // stops there. Zooming in below the compact view's floor hands over to real scale
  // (that is where the detail is), remapping the camera so the framing is preserved.
  if(V.tgtCamZ*f<zmin && f<1 && !S.realScale){
    clickToggle('t-real');
    S.camZ=V.tgtCamZ;                                   // never lerp across the boundary:
    [zmin,zmax]=zoomRange();                          // the two modes' units are unrelated
  }
  const before=V.tgtCamZ;
  V.tgtCamZ*=f;
  V.tgtCamZ=Math.max(zmin,Math.min(zmax,V.tgtCamZ));
  if(SURF.on){                                   // surface map: keep the geo point under the cursor
    const eff=V.tgtCamZ/before;
    surfPan(-(mx-V.cx)*(1-eff), -(my-V.cy)*(1-eff));
    return;
  }
  if(V.tgtCamZ<before && !V.FOLLOW){                 // zoom in → anchor on the cursor, not the centre (unless locked)
    const k=V.tgtCamZ/before;
    const x1=(mx-V.cx)*before/V.foc, y2=(V.cy-my)*before/V.foc;   // cursor on the focal plane (camera space)
    // camera->world needs the ROWS of the view rotation (camRight/camUp are its columns)
    const cyw=Math.cos(S.yaw), syw=Math.sin(S.yaw), cpp=Math.cos(S.pitch), spp=Math.sin(S.pitch);
    const Px=tgtCtr.x + cyw*x1     + spp*syw*y2;
    const Py=tgtCtr.y +              cpp*y2;
    const Pz=tgtCtr.z + syw*x1     - spp*cyw*y2;
    tgtCtr.x+=(Px-tgtCtr.x)*(1-k); tgtCtr.y+=(Py-tgtCtr.y)*(1-k); tgtCtr.z+=(Pz-tgtCtr.z)*(1-k);
  }
}
// CAD-style double-click / double-tap: focus the object under the cursor (planets: focus = lock)
function focusAt(x,y){
  if(SURF.on) return;
  const hit=pick(x,y)||gpuPick(x,y);
  if(!hit) return;
  if(hit===SUNHIT||hit===SUN){ V.focusSys=null; enterSolar(); return; }
  if(!hit.gpick) S.pinned=hit;
  if(hit.p&&hit._dx!==undefined){ V.focusSys=hit; V.focusSysW=objWorld(hit); flyTo(hit); return; }
  if(objWorld(hit)){ flyTo(hit); return; }
  const w=navWorld(hit);
  if(w){ aim(w[0],w[1],w[2], Math.min(V.tgtCamZ, scale(3e-6)));
    if(hit._e!==undefined){ V.FOLLOW=hit; V.lastInfo=undefined; } }
  V.dirty=true;
}
cv.addEventListener('dblclick',e=>{
  if(performance.now()-lastTapFocusT<500) return;   // touch path already handled this pair of taps
  focusAt(e.clientX,e.clientY);
});
cv.addEventListener('pointercancel',e=>{ ptrs.delete(e.pointerId); if(ptrs.size<2){pinching=false;pinchD=0;} dragging=false; });
cv.addEventListener('wheel',e=>{e.preventDefault();
  zoomAt(e.clientX,e.clientY,e.deltaY,e.deltaMode);
},{passive:false});
['pointerdown','pointermove','pointerup','wheel','keydown','keyup','click','input'].forEach(ev=>
  addEventListener(ev,()=>{V.dirty=true;},{capture:true,passive:true}));
