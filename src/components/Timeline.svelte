<script>
  // One number line for all of time: ±100 yr of planets on their orbits, ±50,000 yr of
  // stellar proper motion. Cubic mapping — fine near today, deep time at the ends.
  import { api } from '../lib/api.js';
  import { timeline } from '../lib/stores.js';
  import Icon from './Icon.svelte';
  import { reserve } from '../lib/reserve.js';
</script>

<div class="panel tl" id="hud-uni" role="group" aria-label="Time" use:reserve={'timeline'}>
  <button type="button" class="ib" aria-label={$timeline.playing ? 'Pause' : 'Play time'} onclick={() => api.timeline?.play()}>
    <Icon name={$timeline.playing ? 'pause' : 'play'} size={15} /></button>
  <button type="button" class="ib" aria-label="Back to today" title="Back to today" onclick={() => api.timeline?.now()}><Icon name="reset" size={14} /></button>
  <span class="tl-val mono">{$timeline.label}</span>
  <input type="range" class="tl-range" min="-1000" max="1000" step="1" value={$timeline.v} aria-label="Time"
         oninput={(e) => api.timeline?.set(+e.target.value)}>
  <span class="tl-cap">−2 Myr · +2 Myr</span>
</div>
