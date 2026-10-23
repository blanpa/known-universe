<script>
  // The map's one idea made navigable: thirteen orders of magnitude on a ladder.
  // The marker shows the camera's framing; a rung flies there, dragging zooms.
  import { api } from '../lib/api.js';
  import { camera } from '../lib/stores.js';
  import { reserve } from '../lib/reserve.js';
  let { variant = 'edge' } = $props();          // 'edge' (desktop, labelled) · 'strip' (phone)
  const PC_AU = 4.84814e-6, PC_LY = 1 / 3.261564;
  const RUNGS = [
    { pc: 1 * PC_AU, l: '1 AU' }, { pc: 100 * PC_AU, l: '100 AU' },
    { pc: 1 * PC_LY, l: '1 ly' }, { pc: 100 * PC_LY, l: '100 ly' },
    { pc: 1e4 * PC_LY, l: '10 kly' }, { pc: 1e6 * PC_LY, l: '1 Mly' },
    { pc: 1e8 * PC_LY, l: '100 Mly' }, { pc: 1e10 * PC_LY, l: '10 Gly' },
    { pc: 1.43e10, l: 'CMB' },           // the observable edge, ~46 Gly
  ];
  const LO = Math.log10(RUNGS[0].pc) - 1, HI = Math.log10(RUNGS[RUNGS.length - 1].pc) + 0.3;
  const pos = pc => 1 - (Math.log10(Math.max(1e-12, pc)) - LO) / (HI - LO);   // 0 top … 1 bottom
  // the framing the camera shows, in parsec, comparable across both scale modes
  let framing = $derived($camera.real ? $camera.camZ : Math.pow(10, $camera.camZ - 6));
  let y = $derived(Math.max(0, Math.min(1, pos(framing))));
  let track;
  let dragging = false;
  function pcAt(e) {
    const r = track.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    return Math.pow(10, LO + (1 - t) * (HI - LO));
  }
  function down(e) { dragging = true; track.setPointerCapture?.(e.pointerId); api.flyToScale?.(pcAt(e)); }
  function move(e) { if (dragging) api.flyToScale?.(pcAt(e)); }
  function up() { dragging = false; }
  function key(e) {
    const f = e.key === 'ArrowUp' ? 0.5 : e.key === 'ArrowDown' ? 2 : null;
    if (f) { e.preventDefault(); api.flyToScale?.(framing * f); }
  }
</script>

<div class="ladder ladder-{variant}" id={variant === 'edge' ? 'ladder' : undefined} role="group" aria-label="Scale" use:reserve={'ladder-' + variant}>
  <div class="ld-track" bind:this={track} role="slider" tabindex="0" aria-label="Scale ladder"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round((1 - y) * 100)}
       onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up} onkeydown={key}>
    {#each RUNGS as r (r.l)}
      <button type="button" class="ld-rung" style="top:{pos(r.pc) * 100}%" title="Frame {r.l}"
              onclick={(e) => { e.stopPropagation(); api.flyToScale?.(r.pc); }} onpointerdown={(e) => e.stopPropagation()}>
        <span class="ld-tick"></span><span class="ld-l">{r.l}</span></button>
    {/each}
    <div class="ld-mark" style="top:{y * 100}%" aria-hidden="true"></div>
  </div>
</div>
