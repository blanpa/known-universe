<script>
  // Course readout: real distance, light-travel time, bearing. Engine → nav store.
  import { api } from '../lib/api.js';
  import { nav } from '../lib/stores.js';
  import Icon from './Icon.svelte';
  import { reserve } from '../lib/reserve.js';
</script>

{#if $nav}
  <div class="panel navc" id="hud-nav" role="status" use:reserve={'nav'}>
    <span class="nv-name"><Icon name="scope" size={14} />{$nav.name}</span>
    <span class="nv-cell"><b class="mono">{$nav.dist}</b><small>distance</small></span>
    <span class="nv-cell"><b class="mono">{$nav.light}</b><small>at light speed</small></span>
    <span class="nv-cell"><b class="mono">{$nav.bearing}</b><small>bearing</small></span>
    <button type="button" class="nv-go" onclick={() => api.engage()}>Engage</button>
    <button type="button" class="ib" aria-label="Clear course" onclick={() => api.clearCourse()}><Icon name="close" size={14} /></button>
  </div>
{/if}
