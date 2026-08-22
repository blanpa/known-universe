<script>
  import TopPanel from './components/TopPanel.svelte';
  import SearchBox from './components/SearchBox.svelte';
  import MwMap from './components/MwMap.svelte';
  import Controls from './components/Controls.svelte';
  import Legend from './components/Legend.svelte';
  import InfoHost from './components/InfoHost.svelte';
  import NavConsole from './components/NavConsole.svelte';
  import PmPanel from './components/PmPanel.svelte';
  import TimeBars from './components/TimeBars.svelte';
  import TourPanel from './components/TourPanel.svelte';
  import MobileNav from './components/MobileNav.svelte';
  import ZoomControl from './components/ZoomControl.svelte';
  import LivePanel from './components/LivePanel.svelte';
  import PoiBar from './components/PoiBar.svelte';
  import Icon from './components/Icon.svelte';

  // Desktop chrome is now on-demand: a 52 px icon rail, and one overlay panel at a time.
  // The old fixed 440 px column ate a third of the screen even when nobody was reading it —
  // and it was what the zoom control kept colliding with.
  const RAIL = [
    { k: 'layers', icon: 'layers', label: 'Layers' },
    { k: 'legend', icon: 'legend', label: 'Legend' },
    { k: 'map',    icon: 'galaxy', label: 'Map' },
    { k: 'live',   icon: 'live',   label: 'Live' },
  ];
  let panel = $state(null);
  // the quick-jump bar shortens itself when a panel is out, so the two never overlap
  $effect(() => { document.body.classList.toggle('rail-open', !!panel); });
  function pick(k) { panel = panel === k ? null : k; }
  function esc(e) { if (e.key === 'Escape' && panel) panel = null; }
</script>

<svelte:window onkeydown={esc} />

<canvas id="gl"></canvas>
<canvas id="sky"></canvas>

<PoiBar variant="top" />

<div id="left-col">
  <TopPanel />
  <SearchBox />
</div>

<!-- the info card is its own layer: inside #left-col it inherited that column's
     display:none on phones, so tapping an object showed nothing there -->
<InfoHost />

<div id="rail-wrap">
  <!-- every pane stays mounted: the engine binds to these ids, and a hidden pane
       keeps its scroll position and its canvas alive -->
  <div id="railpanel" class:open={!!panel}>
    <div class="rp-pane" class:on={panel === 'layers'}><Controls /></div>
    <div class="rp-pane" class:on={panel === 'legend'}><Legend /></div>
    <div class="rp-pane" class:on={panel === 'map'}><MwMap collapsible={false} /></div>
    <div class="rp-pane" class:on={panel === 'live'}><LivePanel collapsible={false} /></div>
  </div>

  <nav id="rail" aria-label="Panels">
    {#each RAIL as r (r.k)}
      <button type="button" class="rb" class:on={panel === r.k} aria-pressed={panel === r.k}
              title={r.label} onclick={() => pick(r.k)}>
        <Icon name={r.icon} size={19} /><span class="rb-l">{r.label}</span>
      </button>
    {/each}
    <div class="rail-gap"></div>
    <ZoomControl variant="rail" />
  </nav>
</div>

<ZoomControl variant="float" />

<NavConsole />
<PmPanel />
<TimeBars />
<TourPanel />
<MobileNav />

<!-- engine-bound hidden action target (proxied by Reset in TopPanel) -->
<button id="resetBtn" style="display:none" aria-hidden="true" tabindex="-1"></button>
