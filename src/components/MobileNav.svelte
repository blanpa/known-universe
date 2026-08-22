<script>
  import SearchBox from './SearchBox.svelte';
  import Controls from './Controls.svelte';
  import LivePanel from './LivePanel.svelte';
  import PoiBar from './PoiBar.svelte';
  import Icon from './Icon.svelte';
  import { timeBar } from '../lib/stores.js';

  // Bottom sheet with snap points. The old sheet was inset:0 and opaque, so flipping a
  // layer was a blind action — you could not see what it did. Now the scene stays
  // visible above the sheet and you can drag it down to watch, up to read.
  const SNAP = { peek: 0.34, half: 0.60, full: 0.92 };   // visible fraction of the viewport
  const ORDER = ['peek', 'half', 'full'];
  const SHEET_H = 0.92;

  let mobPanel = $state(null);
  let snap = $state('half');
  let dragPx = $state(0);
  let dragging = $state(false);
  let start = 0, vh = 800, moved = false;

  let visible = $derived(SNAP[snap]);
  let shiftPx = $derived((SHEET_H - visible) * vh + dragPx);

  function openSheet(w) {
    if (mobPanel === w) { mobPanel = null; return; }
    mobPanel = w; snap = 'half'; dragPx = 0;
  }
  function toggleTime() { timeBar.update(v => !v); mobPanel = null; }
  $effect(() => { document.body.classList.toggle('show-time', $timeBar); });
  function press(id) { const b = document.getElementById(id); if (b) b.click(); mobPanel = null; }

  function down(e) {
    vh = window.innerHeight;
    dragging = true; moved = false; start = e.clientY; dragPx = 0;
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e) {
    if (!dragging) return;
    const dy = e.clientY - start;
    if (Math.abs(dy) > 4) moved = true;
    // clamp: cannot go above 'full', can be dragged a little past 'peek' to dismiss
    const max = (SHEET_H - SNAP.peek) * vh;
    dragPx = Math.max(-(SHEET_H - SNAP.full) * vh - (SHEET_H - visible) * vh, Math.min(dy, max * 0.55 + (max - (SHEET_H - visible) * vh)));
    dragPx = Math.max(dragPx, ((SHEET_H - SNAP.full) * vh) - (SHEET_H - visible) * vh);
  }
  function up() {
    if (!dragging) return;
    dragging = false;
    const nowVis = visible - dragPx / vh;
    if (nowVis < SNAP.peek * 0.62) { mobPanel = null; dragPx = 0; return; }   // flung down → close
    let best = ORDER[0], bd = Infinity;
    for (const k of ORDER) { const d = Math.abs(SNAP[k] - nowVis); if (d < bd) { bd = d; best = k; } }
    snap = best; dragPx = 0;
  }
  function cycle() { snap = ORDER[(ORDER.indexOf(snap) + 1) % ORDER.length]; }
  function grabClick() { if (!moved) cycle(); }     // a tap on the handle steps through the sizes
  function grabKey(e) {
    const i = ORDER.indexOf(snap);
    if (e.key === 'ArrowUp')   { e.preventDefault(); snap = ORDER[Math.min(ORDER.length - 1, i + 1)]; }
    if (e.key === 'ArrowDown') { e.preventDefault(); snap = ORDER[Math.max(0, i - 1)]; }
  }
</script>

<nav id="mobbar" aria-label="Main">
  <button type="button" class="mb" class:active={mobPanel === 'search'} aria-pressed={mobPanel === 'search'}
          onclick={() => openSheet('search')}><Icon name="search" size={20} />Search</button>
  <button type="button" class="mb" class:active={mobPanel === 'layers'} aria-pressed={mobPanel === 'layers'}
          onclick={() => openSheet('layers')}><Icon name="layers" size={20} />Layers</button>
  <button type="button" class="mb" class:active={$timeBar} aria-pressed={$timeBar}
          onclick={toggleTime}><Icon name="clock" size={20} />Time</button>
  <button type="button" class="mb" onclick={() => press('tourBtn')}><Icon name="compass" size={20} />Tour</button>
</nav>

{#if mobPanel}
<div id="mobsheet" class:full={snap === 'full'} class:dragging
     style="transform:translateY({shiftPx}px)"
     role="dialog" aria-modal="false" aria-label={mobPanel === 'layers' ? 'Layers' : 'Search'}>
  <div class="ms-head">
    <button type="button" class="ms-grab" aria-label="Sheet size — drag, or press to cycle"
            onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}
            onclick={grabClick} onkeydown={grabKey}><span></span></button>
    <div class="ms-headrow">
      <span class="ms-title">
        <Icon name={mobPanel === 'layers' ? 'layers' : 'search'} size={15} />
        {mobPanel === 'layers' ? 'Layers' : 'Search'}
        <small>· {__BUILD__}</small>
      </span>
      <span class="ms-btns">
        <button type="button" class="ms-x" aria-label="Expand or collapse" onclick={cycle}>
          <Icon name="chevron" size={15} /></button>
        <button type="button" class="ms-x" aria-label="Close" onclick={() => { mobPanel = null; }}>
          <Icon name="close" size={15} /></button>
      </span>
    </div>
  </div>
  <div class="ms-body">
    {#if mobPanel === 'layers'}
      <Controls legend={false} />
    {:else}
      <SearchBox mode="sheet" onpick={() => { mobPanel = null; }} />
      <PoiBar onpick={() => { mobPanel = null; }} />
      <div class="ms-actions">
        <button type="button" onclick={() => press('solarBtn')}><Icon name="sun" size={15} />Solar system</button>
        <button type="button" onclick={() => press('tourBtn')}><Icon name="compass" size={15} />Cosmic tour</button>
        <button type="button" onclick={() => press('shareBtn')}><Icon name="link" size={15} />Share view</button>
        <button type="button" onclick={() => press('resetBtn')}><Icon name="reset" size={15} />Reset view</button>
      </div>
      <LivePanel onpick={() => { mobPanel = null; }} />
    {/if}
  </div>
</div>
{/if}
