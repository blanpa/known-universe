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
  {#if $camera.sky}
    <div class="ctx-where mono">FOV {$camera.fov >= 1 ? $camera.fov.toFixed($camera.fov < 10 ? 1 : 0) + '°' : $camera.fov >= 1/60 ? ($camera.fov * 60).toFixed(1) + '′' : ($camera.fov * 3600).toFixed(0) + '″'}<span class="ctx-mode">{' · '}RA {($camera.ra / 15).toFixed(2)}h · Dec {$camera.dec >= 0 ? '+' : ''}{$camera.dec.toFixed(1)}°</span></div>
  {:else}
    <div class="ctx-where mono">{$camera.distText}{$camera.distText && $camera.distText !== 'at the Sun' ? ' from the Sun' : ''}<span class="ctx-mode">{' · '}{$camera.real ? 'real scale' : 'compact view'}</span></div>
  {/if}
  {#if !compact && $camera.sky}
    <button type="button" class="ctx-solar on" onclick={() => api.skyView?.(false)}>
      <Icon name="scope" size={15} />Leave the telescope</button>
  {:else if !compact}
    <button type="button" class="ctx-solar" class:on={$camera.inSolar} onclick={() => api.toggleSolar()}>
      <Icon name={$camera.inSolar ? 'scope' : 'sun'} size={15} />{$camera.inSolar ? 'Back out to the stars' : 'Into the solar system'}</button>
  {/if}
</div>
