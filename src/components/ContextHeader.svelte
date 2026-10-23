<script>
  // Where am I: the band of the map the camera is in, and how far from the Sun.
  // Replaces the identity panel with its exoplanet counters, which meant nothing in
  // the solar system view.
  import { api } from '../lib/api.js';
  import { camera } from '../lib/stores.js';
  import Icon from './Icon.svelte';
  let { compact = false } = $props();
</script>

<div class="panel ctx" id="hud-head" class:compact>
  <div class="ctx-app"><span class="dot" aria-hidden="true"></span>Known Universe</div>
  <div class="ctx-band">{$camera.band || '…'}</div>
  <div class="ctx-where mono">{$camera.distText}{$camera.distText && $camera.distText !== 'at the Sun' ? ' from the Sun' : ''}<span class="ctx-mode"> · {$camera.real ? 'real scale' : 'compact view'}</span></div>
  {#if !compact}
    <button type="button" class="ctx-solar" class:on={$camera.inSolar} onclick={() => api.toggleSolar()}>
      <Icon name={$camera.inSolar ? 'scope' : 'sun'} size={15} />{$camera.inSolar ? 'Back out to the stars' : 'Into the solar system'}</button>
  {/if}
</div>
