<script>
  import { api } from '../lib/engine.js';
  import Icon from './Icon.svelte';
  // variant 'rail' sits inside the desktop rail (so it can never overlap a panel);
  // 'float' is the phone's free-standing control.
  let { variant = 'float' } = $props();
  let timer = null, lastY = 0, jogging = false;
  function hold(f) { stop(); api.zoomBy && api.zoomBy(f); timer = setInterval(() => api.zoomBy && api.zoomBy(f), 40); }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function jogDown(e) { jogging = true; lastY = e.clientY; e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); }
  function jogMove(e) { if (!jogging) return; const dy = e.clientY - lastY; lastY = e.clientY;
    if (dy && api.zoomBy) api.zoomBy(Math.exp(dy * 0.006)); }
  function jogUp() { jogging = false; }
  function key(e, f) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); api.zoomBy && api.zoomBy(f); } }
</script>

<div class="zoomctl zoom-{variant}" role="group" aria-label="Zoom">
  <button type="button" aria-label="Zoom in" onkeydown={e => key(e, 0.965)}
          onpointerdown={() => hold(0.965)} onpointerup={stop} onpointerleave={stop} onpointercancel={stop}>
    <Icon name="plus" size={17} stroke={1.8} /></button>
  <div class="jog" role="slider" tabindex="0" aria-label="Zoom wheel" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"
       onkeydown={e => { if (e.key === 'ArrowUp') key({ key: 'Enter', preventDefault(){} }, 0.9);
                         if (e.key === 'ArrowDown') key({ key: 'Enter', preventDefault(){} }, 1.1); }}
       onpointerdown={jogDown} onpointermove={jogMove} onpointerup={jogUp} onpointercancel={jogUp}>
    <span></span><span></span><span></span><span></span><span></span>
  </div>
  <button type="button" aria-label="Zoom out" onkeydown={e => key(e, 1.036)}
          onpointerdown={() => hold(1.036)} onpointerup={stop} onpointerleave={stop} onpointercancel={stop}>
    <Icon name="minus" size={17} stroke={1.8} /></button>
</div>
