<script>
  import { api } from '../lib/api.js';
  import { toggleState, labels, facList, facHidden, facColor, timeBar } from '../lib/stores.js';
  import { PRESETS, applyPreset, matchPreset, save } from '../lib/prefs.js';
  import Icon from './Icon.svelte';
  import Toggle from './Toggle.svelte';
  let { legend = true } = $props();   // legend=false -> no #hud-ctl id (mobile sheet copy)
  const groups = [
    { h: 'Solar system', icon: 'sun', items: [
      { id: 't-moons', label: 'Moons', on: true },
      { id: 't-ast', label: 'Asteroids &amp; comets', on: true },
      { id: 't-belt', label: 'Asteroid field', on: true },
      { id: 't-tno', label: 'Trans-Neptunian objects', on: true },
      { id: 't-probes', label: 'Spacecraft', on: true },
      { id: 't-iso', label: 'Interstellar visitors', on: true },
      { id: 't-helio', label: 'Heliosphere', on: true },
      { id: 't-lag', label: 'Lagrange points · Hill spheres', on: true },
      { id: 't-cme', label: 'Solar storms · live', on: true },
      { id: 't-neo', label: 'Asteroid flybys · live', on: true },
      { id: 't-sat', label: 'Satellites · live', on: true },
      { id: 't-sun', label: 'Sunspots · live', on: true },
      { id: 't-size', label: 'Star size by real radius', on: true }] },
    { h: 'Stars', icon: 'star', items: [
      { id: 't-hyg', label: 'Bright stars · HYG', on: true },
      { id: 't-user', label: 'Your data · imported CSV', on: true },
      { id: 't-gaia', label: 'Gaia stars · 100 pc', on: true },
      { id: 't-ob', label: 'OB stars · spiral-arm tracers', on: true },
      { id: 't-var', label: 'Variable stars', on: true },
      { id: 't-radio', label: 'Our radio bubble', on: true }] },
    { h: 'Deep sky &amp; galaxy', icon: 'galaxy', items: [
      { id: 't-dso', label: 'Nebulae &amp; famous clusters', on: true },
      { id: 't-oclu', label: 'Open clusters · globulars · FRBs', on: true },
      { id: 't-psr', label: 'Pulsars', on: true },
      { id: 't-con', label: 'Constellations', on: true },
      { id: 't-met', label: 'Meteor showers · active now', on: true },
      { id: 't-bubble', label: 'Local Bubble', on: true },
      { id: 't-mw', label: 'Milky Way · Sgr A*', on: true },
      { id: 't-mw3d', label: 'Milky Way structure', on: true },
      { id: 't-lens', label: 'Lensing at Sgr A*', on: true },
      { id: 't-hz', label: 'Habitable zone', on: true }] },
    { h: 'Cosmos', icon: 'scope', items: [
      { id: 't-gal', label: 'Galaxies · Local Volume', on: true },
      { id: 't-web', label: 'Cosmic web · 2MRS', on: true },
      { id: 't-qso', label: 'Quasars', on: true },
      { id: 't-edge', label: 'Observable universe · CMB', on: true }] },
    { h: 'View', icon: 'sliders', items: [
      { id: 't-real', label: 'Compact view · distances compressed', on: false, inv: 1 },
      { id: 't-rot', label: 'Auto-rotate', on: false },
      { id: 't-freelook', label: 'Free-look flight', on: false },
      { id: 't-veil', label: 'Red veil beyond the charted stars', on: true },
      { id: 't-rings', label: 'Distance rings', on: true },
      { id: 't-labels', label: 'Labels', on: true },
      { id: 't-grid', label: 'Celestial grid', on: false },
      { id: 't-ggrid', label: 'Galactic grid', on: false },
      { id: 't-eht', label: 'Sgr A* as the EHT image', on: false },
      { id: 't-timebar', label: 'Timeline', on: false, ui: 1 }] },
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
    Drag to orbit · right-drag to pan · scroll to zoom · double-click to focus<br>WASD to fly · [.] frame selection · [Home] reset · [Esc] release
  </div>
</div>
