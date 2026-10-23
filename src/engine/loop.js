// The animation loop: easing, flight, idle skipping.
import { dragging } from './interact.js';
import { navWorld } from './nav.js';
import { render } from './render.js';
import { SUN } from './solar-data.js';
import { S, V } from './state.js';
import { camDist, camFwd, camRight, camUp, ctr, keys, tgtCtr } from './view.js';
// ---- loop ----
let last=0, lastGw=0;
export function frame(t){
  const dt=Math.min(0.05,(t-last)/1000||0); last=t;
  if(V.FOLLOW){                            // locked body → view centre tracks it every frame
    const w=V.FOLLOW===SUN?[0,0,0]:navWorld(V.FOLLOW);
    if(w){ tgtCtr.x=w[0]; tgtCtr.y=w[1]; tgtCtr.z=w[2]; } else V.FOLLOW=null;
  }
  if(S.autorot&&!dragging) V.tgtYaw+=dt*0.10;
  // free-flight thrust (WASD / arrows, R·F up·down) — step scales with zoom level
  if(keys.size){
    if(S.realScale) V.flySpeed=Math.min(V.flySpeed*1.06+0.06,150); else V.flySpeed=1;
    const step=(S.realScale?S.camZ*V.flySpeed:Math.max(S.camZ,camDist))*0.06; let mx=0,my=0,mz=0;
    if(keys.has('w')){mx+=camFwd[0];my+=camFwd[1];mz+=camFwd[2];}
    if(keys.has('s')){mx-=camFwd[0];my-=camFwd[1];mz-=camFwd[2];}
    if(keys.has('d')){mx+=camRight[0];my+=camRight[1];mz+=camRight[2];}
    if(keys.has('a')){mx-=camRight[0];my-=camRight[1];mz-=camRight[2];}
    if(keys.has('r')){mx+=camUp[0];my+=camUp[1];mz+=camUp[2];}
    if(keys.has('f')){mx-=camUp[0];my-=camUp[1];mz-=camUp[2];}
    tgtCtr.x+=mx*step; tgtCtr.y+=my*step; tgtCtr.z+=mz*step;
    S.autorot=false; S.pinned=null; V.FOLLOW=null;
  } else V.flySpeed=1;
  // GW ripples: keep animating at ~14 fps while a GW event is on screen
  if(V.gwOnScreen && t-lastGw>70){ lastGw=t; V.dirty=true; }
  // render only when the view is changing or something is V.dirty (idle → ~0 CPU)
  const cs=Math.abs(ctr.x)+Math.abs(ctr.y)+Math.abs(ctr.z)+1;
  const anim=(S.autorot&&!dragging)||dragging||keys.size>0
    ||Math.abs(V.tgtYaw-S.yaw)>1e-4||Math.abs(V.tgtPitch-S.pitch)>1e-4
    ||Math.abs(V.tgtCamZ-S.camZ)>S.camZ*2e-4+1e-12
    ||(Math.abs(tgtCtr.x-ctr.x)+Math.abs(tgtCtr.y-ctr.y)+Math.abs(tgtCtr.z-ctr.z))>cs*1e-5;
  if(V.dirty||anim){
    ctr.x+=(tgtCtr.x-ctr.x)*0.18; ctr.y+=(tgtCtr.y-ctr.y)*0.18; ctr.z+=(tgtCtr.z-ctr.z)*0.18;
    S.yaw+=(V.tgtYaw-S.yaw)*0.12; S.pitch+=(V.tgtPitch-S.pitch)*0.12;
    // Zoom eases GEOMETRICALLY. The additive lerp moved a fixed fraction of the absolute
    // gap, which over a range spanning 22 orders of magnitude meant the last decades
    // crawled — a hard scroll took hundreds of frames to land. A constant ratio per frame
    // covers each decade in the same time, which is also how a log zoom should feel.
    S.camZ = (S.camZ>0 && V.tgtCamZ>0) ? S.camZ*Math.pow(V.tgtCamZ/S.camZ, 0.12)
                                     : S.camZ+(V.tgtCamZ-S.camZ)*0.12;
    try{ render(); }catch(err){ if(!window.__rerr){ window.__rerr=1; console.error('render error:',err); } }
    V.dirty=false;
  }
  requestAnimationFrame(frame);
}
