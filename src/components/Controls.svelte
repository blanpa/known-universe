<script>
  import { api } from '../lib/engine.js';
  import { toggleState, labels, facList, facHidden, facColor, timeBar } from '../lib/stores.js';
  import { PRESETS, applyPreset, matchPreset, save } from '../lib/prefs.js';
  import Icon from './Icon.svelte';
  import Toggle from './Toggle.svelte';
  let { legend = true } = $props();   // legend=false -> no #hud-ctl id (mobile sheet copy)
  const groups = [
    { h: 'Solar system', icon: 'sun', items: [
      { id: 't-moons', label: 'Moons (solar system)', on: true },
      { id: 't-ast', label: 'Asteroids &amp; comets', on: true },
      { id: 't-belt', label: 'Asteroid field', on: true },
      { id: 't-tno', label: 'Trans-Neptunian &amp; Centaurs', on: true },
      { id: 't-probes', label: 'Spacecraft (Voyager…)', on: true },
      { id: 't-iso', label: 'Interstellar visitors (1I·2I·3I)', on: true },
      { id: 't-helio', label: 'Heliosphere', on: true },
      { id: 't-lag', label: 'Lagrange points &amp; Hill spheres', on: true },
      { id: 't-cme', label: 'CME storms (live)', on: true },
      { id: 't-neo', label: 'NEO flybys (live)', on: true },
      { id: 't-sat', label: 'Satellites (live)', on: true },
      { id: 't-sun', label: 'Sunspots (live)', on: true },
      { id: 't-size', label: 'Size = planet radius', on: true }] },
    { h: 'Stars', icon: 'star', items: [
      { id: 't-hyg', label: 'Stars (HYG)', on: true },
      { id: 't-gpu', label: 'GPU stars', on: true },
      { id: 't-gaia', label: 'Gaia stars (&lt;100 pc)', on: true },
      { id: 't-ob', label: 'OB stars (arm tracers)', on: true },
      { id: 't-var', label: 'Variable stars', on: true },
      { id: 't-radio', label: 'Radio bubble (our signals)', on: true }] },
    { h: 'Deep sky &amp; galaxy', icon: 'galaxy', items: [
      { id: 't-dso', label: 'Nebulae &amp; clusters', on: true },
      { id: 't-oclu', label: 'Clusters · globulars · FRBs', on: true },
      { id: 't-psr', label: 'Pulsars (neutron stars)', on: true },
      { id: 't-con', label: 'Constellations', on: true },
      { id: 't-met', label: 'Meteor showers (active)', on: true },
      { id: 't-bubble', label: 'Local Bubble (ISM)', on: true },
      { id: 't-mw', label: 'Milky Way · Sgr A*', on: true },
      { id: 't-mw3d', label: 'Milky Way structure (3D)', on: true },
      { id: 't-lens', label: 'Lensing at Sgr A*', on: true },
      { id: 't-hz', label: 'Habitable zone', on: true }] },
    { h: 'Cosmos', icon: 'scope', items: [
      { id: 't-gal', label: 'Show galaxies', on: true },
      { id: 't-web', label: 'Cosmic web (2MRS)', on: true },
      { id: 't-qso', label: 'Quasars', on: true },
      { id: 't-edge', label: 'Observable universe (CMB)', on: true }] },
    { h: 'View', icon: 'sliders', items: [
      { id: 't-real', label: 'Compact view (distances compressed)', on: false, inv: 1 },
      { id: 't-rot', label: 'Auto-rotation', on: false },
      { id: 't-freelook', label: 'Free-look flight', on: false },
      { id: 't-veil', label: 'Red veil', on: true },
      { id: 't-rings', label: 'Distance rings', on: true },
      { id: 't-labels', label: 'Labels &amp; text', on: true },
      { id: 't-grid', label: 'Celestial grid (RA·Dec)', on: false },
      { id: 't-ggrid', label: 'Galactic grid (l·b)', on: false },
      { id: 't-eht', label: 'Sgr A*: real EHT image (2022)', on: false },
      { id: 't-timebar', label: 'Time bar', on: false, ui: 1 }] },
  ];
  let closed = $state({ 0: true, 1: true, 2: true, 3: true });   // only View open by default
  let filter = $state('');

  // strip the entity markup so the filter matches what the eye reads
  const plain = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').toLowerCase();
  let q = $derived(filter.trim().toLowerCase());
  function shown(g) {
    if (!q) return g.items;
    return g.items.filter(d => plain($labels[d.id] ?? d.label).includes(q));
  }
  let active = $derived(matchPreset($toggleState));

  function isOn(d) {                 // NB: must not be called `state` — that shadows the $state rune
    if (d.ui) return $timeBar;
    const v = $toggleState[d.id] ?? d.on;
    return d.inv ? !v : v;
  }
  function tgl(id) {
    if (id === 't-timebar') { timeBar.update(v => !v); return; }
    if (api.clickToggle) api.clickToggle(id);
    save();
  }
  function chip(k) {
    if (!api.toggleFac) return;
    const hidden = api.toggleFac(k);
    facHidden.update(s => { const n = new Set(s); hidden ? n.add(k) : n.delete(k); return n; });
  }
  function colby() { if (api.facColorToggle) facColor.set(api.facColorToggle()); }
</script>

<div class="panel" id={legend ? "hud-ctl" : undefined}>
  <!-- presets first: one tap for a whole scene, before the 39 individual switches -->
  <div class="presets" role="group" aria-label="Layer presets">
    {#each PRESETS as p (p.k)}
      <button type="button" class="preset" class:on={active === p.k}
              aria-pressed={active === p.k} title="Show only: {p.n}"
              onclick={() => { applyPreset(p.k); toggleState.set(api.readToggles ? api.readToggles() : {}); }}>
        <Icon name={p.icon} size={14} /><span>{p.n}</span>
      </button>
    {/each}
  </div>

  <div class="lfilter">
    <Icon name="search" size={13} />
    <input type="text" spellcheck="false" placeholder="Filter layers…" aria-label="Filter layers" bind:value={filter}>
    {#if filter}
      <button type="button" class="lf-x" aria-label="Clear filter" onclick={() => filter = ''}><Icon name="close" size={13} /></button>
    {/if}
  </div>

  {#each groups as g, gi}
    {@const items = shown(g)}
    {#if items.length}
    <div class="ctl-group" class:closed={closed[gi] && !q}>
      <button type="button" class="ctl-h" aria-expanded={!(closed[gi] && !q)}
              onclick={() => { closed[gi] = !closed[gi]; }}>
        <span class="ctl-hl"><Icon name={g.icon} size={14} />{@html g.h}</span>
        <span class="caret"><Icon name="chevron" size={12} /></span>
      </button>
      {#each items as d (d.id)}
        <Toggle checked={isOn(d)} label={$labels[d.id] ?? d.label} onchange={() => tgl(d.id)} />
      {/each}
    </div>
    {/if}
  {/each}
  {#if q && groups.every(g => !shown(g).length)}
    <div class="lf-none">No layer matches “{filter}”.</div>
  {/if}

  <div class="ctl-inst">
    <div class="label" style="margin-bottom:8px">Discovery instrument</div>
    <button type="button" class="colby" class:on={$facColor} role="switch" aria-checked={$facColor} onclick={colby}>
      <span>colour by it</span><span class="sw" aria-hidden="true"></span></button>
    <div class="chips">
      {#each $facList as f (f.k)}
        <button type="button" class="chip" class:off={$facHidden.has(f.k)}
                aria-pressed={!$facHidden.has(f.k)} onclick={() => chip(f.k)}>
          <span class="cdot" style="background:rgb({f.c[0]},{f.c[1]},{f.c[2]})"></span>
          <span class="cl">{f.l}</span><span class="cn">{f.n.toLocaleString('en-US')}</span>
        </button>
      {/each}
    </div>
  </div>
  <div class="hint">
    Drag orbit · right/middle-drag pan · Ctrl+drag dolly<br>Scroll zoom to cursor · dbl-click/tap focus · WASD fly<br>[.] frame selection · [Home] reset · [Esc] deselect
  </div>
</div>
