<script>
  import TopPanel from './components/TopPanel.svelte';
  import SearchBox from './components/SearchBox.svelte';
  import MwMap from './components/MwMap.svelte';
  import Controls from './components/Controls.svelte';
  import InfoHost from './components/InfoHost.svelte';
  import NavConsole from './components/NavConsole.svelte';
  import PmPanel from './components/PmPanel.svelte';
  import TimeBars from './components/TimeBars.svelte';
  import TourPanel from './components/TourPanel.svelte';
  import MobileNav from './components/MobileNav.svelte';
  import ZoomControl from './components/ZoomControl.svelte';
  import LivePanel from './components/LivePanel.svelte';
</script>

  <canvas id="gl"></canvas>
  <canvas id="sky"></canvas>

<div id="left-col">
  <TopPanel />
  <SearchBox />
  <MwMap />
  <LivePanel />
  <InfoHost />
</div>

<div id="right-col">
  <Controls />
</div>

<NavConsole />
<PmPanel />
<TimeBars />
<TourPanel />
<ZoomControl />
<MobileNav />

<!-- engine-bound hidden action target (proxied by ⟲ Reset in TopPanel) -->
<button id="resetBtn" style="display:none" aria-hidden="true"></button>
