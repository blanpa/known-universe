<script>
  import SearchBox from './SearchBox.svelte';
  import Controls from './Controls.svelte';
  import LivePanel from './LivePanel.svelte';
  import { timeBar } from '../lib/stores.js';
  let mobPanel = $state(null);
  
  function openSheet(w) { mobPanel = (mobPanel === w) ? null : w; }
  function toggleTime() { timeBar.update(v => !v); mobPanel = null; }
  $effect(() => { document.body.classList.toggle('show-time', $timeBar); });
  function press(id) { const b = document.getElementById(id); if (b) b.click(); mobPanel = null; }
</script>

<div id="mobbar">
  <div class="mb" class:active={mobPanel==='search'} onclick={() => openSheet('search')}><span>🔍</span>Search</div>
  <div class="mb" class:active={mobPanel==='layers'} onclick={() => openSheet('layers')}><span>☰</span>Layers</div>
  <div class="mb" class:active={$timeBar} onclick={toggleTime}><span>🕐</span>Time</div>
  <div class="mb" onclick={() => press('tourBtn')}><span>🧭</span>Tour</div>
</div>

{#if mobPanel}
<div id="mobsheet">
  <div class="ms-head">
    <span>{mobPanel === 'layers' ? '☰ Layers' : '🔍 Search'} <small style="opacity:.5">· b11:51</small></span>
    <button class="ms-x" onclick={() => { mobPanel = null; }}>✕ Close</button>
  </div>
  <div class="ms-body">
    {#if mobPanel === 'layers'}
      <Controls legend={false} />
    {:else}
      <SearchBox mode="sheet" onpick={() => { mobPanel = null; }} />
      <div class="ms-actions">
        <button onclick={() => press('solarBtn')}>☉ Solar system</button>
        <button onclick={() => press('tourBtn')}>🧭 Cosmic tour</button>
        <button onclick={() => press('shareBtn')}>🔗 Share view</button>
        <button onclick={() => press('resetBtn')}>⟲ Reset view</button>
      </div>
      <LivePanel onpick={() => { mobPanel = null; }} />
    {/if}
  </div>
</div>
{/if}
