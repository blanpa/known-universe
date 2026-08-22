<script>
  import { api } from '../lib/engine.js';
  import Icon from './Icon.svelte';
  let { variant = '', onpick = () => {} } = $props();
  // every entry resolves through the regular search — same fly-to as typing it
  const POIS = [
    ['sun', 'Sun'], ['globe', 'Earth'], ['planet', 'Mars'], ['planet', 'Jupiter'], ['ringed', 'Saturn'],
    ['ice', 'Pluto'], ['probe', 'Voyager 1'], ['comet', '3I/ATLAS'],
    ['star', 'Proxima Centauri'], ['system', 'TRAPPIST-1'], ['blackhole', 'Sgr A*'], ['galaxy', 'Andromeda'],
  ];
  function go(n) { if (api.doSearch) api.doSearch(n); onpick(n); }
</script>

<div class="poibar {variant ? 'poibar-' + variant : ''}" role="group" aria-label="Jump to">
  {#each POIS as [ic, n] (n)}
    <button type="button" class="poi" onclick={() => go(n)} title="Fly to {n}">
      <Icon name={ic} size={13} />{n}</button>
  {/each}
</div>
