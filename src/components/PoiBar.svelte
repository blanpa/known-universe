<script>
  import { api } from '../lib/engine.js';
  let { variant = '', onpick = () => {} } = $props();
  // every entry resolves through the regular search — same fly-to as typing it
  const POIS = [
    ['☉', 'Sun'], ['🌍', 'Earth'], ['🔴', 'Mars'], ['🟠', 'Jupiter'], ['💍', 'Saturn'],
    ['🧊', 'Pluto'], ['🛰', 'Voyager 1'], ['🌠', '3I/ATLAS'],
    ['✨', 'Proxima Centauri'], ['🪐', 'TRAPPIST-1'], ['⚫', 'Sgr A*'], ['🌀', 'Andromeda'],
  ];
  function go(n) { if (api.doSearch) api.doSearch(n); onpick(n); }
</script>

<div class="poibar {variant ? 'poibar-' + variant : ''}">
  {#each POIS as [ic, n] (n)}
    <button class="poi" onclick={() => go(n)} title="Fly to {n}"><span>{ic}</span>{n}</button>
  {/each}
</div>
