<script>
  // Deep time: the timeline strip, and the stars that will pass (or passed) close to the Sun.
  import { api } from '../lib/api.js';
  import { encounters, timeBar, timeline } from '../lib/stores.js';
  import Icon from './Icon.svelte';
  const PC2LY = 3.261564;
  const when = t => { const a = Math.abs(t), s = t < 0 ? '−' : '+';
    return a >= 1e6 ? `${s}${(a / 1e6).toFixed(2)} Myr` : `${s}${Math.round(a / 1000)},000 yr`; };
  const dist = d => d < 0.3 ? `${(d * 206265).toLocaleString('en-US', { maximumFractionDigits: 0 })} AU` : `${(d * PC2LY).toFixed(2)} ly`;
</script>

<div class="panel" id="hud-time">
  <div class="label">Time</div>
  <p class="hint">One slider for all of time. Within ±100 years the planets and moons run on
    their orbits; beyond that the stars fly along their measured velocities, out to ±2 million years.</p>
  <button type="button" class="toggle" class:on={$timeBar} role="switch" aria-checked={$timeBar}
          onclick={() => timeBar.update(v => !v)}>
    <span class="tg-l">Timeline strip</span><span class="sw" aria-hidden="true"></span></button>
  <div class="tl-now mono">{$timeline.label}</div>

  <div class="label lg-sub">Close encounters</div>
  <p class="hint">Stars whose straight-line path brings them within 1.5 pc of the Sun. Click one to
    jump to the moment and fly there. From HYG proper motions and radial velocities — a catalogue's
    tenth of a milliarcsecond decides the miss distance, so treat the AU as rough.</p>
  <ul class="enc">
    {#each $encounters as e (e.i)}
      <li><button type="button" onclick={() => api.gotoEncounter?.(e.i)}>
        <span class="enc-n">{e.name}</span>
        <span class="enc-t mono">{when(e.t)}</span>
        <span class="enc-d mono">{dist(e.d)}</span>
        <span class="enc-v mono">{Math.round(e.v)} km/s</span>
      </button></li>
    {/each}
  </ul>
  <button type="button" class="enc-reset" onclick={() => api.timeline?.now()}><Icon name="reset" size={13} />Back to today</button>
</div>
