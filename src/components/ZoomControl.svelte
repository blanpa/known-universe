<script>
  import { api } from '../lib/engine.js';
  let timer=null, lastY=0, jogging=false;
  function hold(f){ stop(); api.zoomBy&&api.zoomBy(f); timer=setInterval(()=>api.zoomBy&&api.zoomBy(f),40); }
  function stop(){ if(timer){clearInterval(timer);timer=null;} }
  function jogDown(e){ jogging=true; lastY=e.clientY; e.target.setPointerCapture&&e.target.setPointerCapture(e.pointerId); }
  function jogMove(e){ if(!jogging) return; const dy=e.clientY-lastY; lastY=e.clientY;
    if(dy&&api.zoomBy) api.zoomBy(Math.exp(dy*0.006)); }
  function jogUp(){ jogging=false; }
</script>

<div id="zoomctl">
  <button onpointerdown={()=>hold(0.965)} onpointerup={stop} onpointerleave={stop} onpointercancel={stop}>＋</button>
  <div class="jog" onpointerdown={jogDown} onpointermove={jogMove} onpointerup={jogUp} onpointercancel={jogUp}>
    <span></span><span></span><span></span><span></span><span></span>
  </div>
  <button onpointerdown={()=>hold(1.036)} onpointerup={stop} onpointerleave={stop} onpointercancel={stop}>−</button>
</div>
