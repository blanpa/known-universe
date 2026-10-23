<script>
  import ContextHeader from './components/ContextHeader.svelte';
  import SearchBox from './components/SearchBox.svelte';
  import InfoCard from './components/InfoCard.svelte';
  import MwMap from './components/MwMap.svelte';
  import Controls from './components/Controls.svelte';
  import Legend from './components/Legend.svelte';
  import NavConsole from './components/NavConsole.svelte';
  import Timeline from './components/Timeline.svelte';
  import TourPanel from './components/TourPanel.svelte';
  import MobileNav from './components/MobileNav.svelte';
  import ScaleLadder from './components/ScaleLadder.svelte';
  import LivePanel from './components/LivePanel.svelte';
  import PoiBar from './components/PoiBar.svelte';
  import Icon from './components/Icon.svelte';
  import { api } from './lib/api.js';
  import { measure, timeBar, toggleState } from './lib/stores.js';

  // Desktop chrome is on-demand: a 56 px icon rail, one overlay panel at a time.
  const RAIL = [
    { k: 'layers', icon: 'layers', label: 'Layers' },
    { k: 'legend', icon: 'legend', label: 'Legend' },
    { k: 'map',    icon: 'galaxy', label: 'Map' },
    { k: 'live',   icon: 'live',   label: 'Live' },
  ];
  let panel = $state(null);
  // the quick-jump bar and the ladder yield when a panel is out, so nothing overlaps
  $effect(() => { document.body.classList.toggle('rail-open', !!panel); });
  $effect(() => { document.body.classList.toggle('show-time', $timeBar); });
  function pick(k) { panel = panel === k ? null : k; }
  function esc(e) { if (e.key === 'Escape' && panel) panel = null; }
</script>

<svelte:window onkeydown={esc} />

<canvas id="gl"></canvas>
<canvas id="sky"></canvas>

<PoiBar variant="top" />

<div id="left-col">
  <ContextHeader />
  <SearchBox />
  <InfoCard />
</div>

<NavConsole />

<div id="rail-wrap">
  <!-- every pane stays mounted: a hidden pane keeps its scroll position -->
  <div id="railpanel" class:open={!!panel}>
    <div class="rp-pane" class:on={panel === 'layers'}><Controls /></div>
    <div class="rp-pane" class:on={panel === 'legend'}><Legend /></div>
    <div class="rp-pane" class:on={panel === 'map'}>{#if $toggleState['t-mw'] !== false}<MwMap />{:else}<div class="panel"><div class="label">Milky Way</div><div class="hint">Switch the “Milky Way · Sgr A*” layer on to see the map.</div></div>{/if}</div>
    <div class="rp-pane" class:on={panel === 'live'}><LivePanel collapsible={false} /></div>
  </div>

  <nav id="rail" aria-label="Panels and tools">
    {#each RAIL as r (r.k)}
      <button type="button" class="rb" class:on={panel === r.k} aria-pressed={panel === r.k}
              title={r.label} onclick={() => pick(r.k)}>
        <Icon name={r.icon} size={19} /><span class="rb-l">{r.label}</span>
      </button>
    {/each}
    <div class="rail-gap"></div>
    <button type="button" class="rb" title="A guided flight from Earth to the edge of the observable universe" onclick={() => api.tour?.start()}>
      <Icon name="compass" size={19} /><span class="rb-l">Tour</span></button>
    <button type="button" class="rb" class:on={$measure} aria-pressed={$measure} title="Click two objects to measure the real distance between them" onclick={() => api.measure?.()}>
      <Icon name="ruler" size={19} /><span class="rb-l">Measure</span></button>
    <button type="button" class="rb" title="Copy a link to this exact view" onclick={() => api.share?.()}>
      <Icon name="link" size={19} /><span class="rb-l">Share</span></button>
    <button type="button" class="rb" title="Back to the full view (Home)" onclick={() => api.reset?.()}>
      <Icon name="reset" size={19} /><span class="rb-l">Reset</span></button>
  </nav>
</div>

<ScaleLadder variant="edge" />
<ScaleLadder variant="strip" />

{#if $timeBar}<Timeline />{/if}
<TourPanel />
<MobileNav />
