<script>
  import { api } from '../lib/engine.js';
  import { toggleState, labels, facList, facHidden, facColor, timeBar } from '../lib/stores.js';
  let { legend = true } = $props();
  const groups = [{"h": "☀️ Solar system", "items": [{"id": "t-moons", "label": "Moons (solar system)", "on": true}, {"id": "t-ast", "label": "Asteroids &amp; comets", "on": true}, {"id": "t-belt", "label": "Asteroid field", "on": true}, {"id": "t-tno", "label": "Trans-Neptunian &amp; Centaurs", "on": true}, {"id": "t-probes", "label": "Spacecraft (Voyager…)", "on": true}, {"id": "t-helio", "label": "Heliosphere", "on": true}, {"id": "t-lag", "label": "Lagrange points &amp; Hill spheres", "on": true}, {"id": "t-size", "label": "Size = planet radius", "on": true}]}, {"h": "⭐ Stars", "items": [{"id": "t-hyg", "label": "Stars (HYG)", "on": true}, {"id": "t-gpu", "label": "GPU stars", "on": true}, {"id": "t-gaia", "label": "Gaia stars (&lt;100 pc)", "on": true}, {"id": "t-ob", "label": "OB stars (arm tracers)", "on": true}, {"id": "t-var", "label": "Variable stars", "on": true}]}, {"h": "💫 Deep sky &amp; galaxy", "items": [{"id": "t-dso", "label": "Nebulae &amp; clusters", "on": true}, {"id": "t-oclu", "label": "Clusters · globulars · FRBs", "on": true}, {"id": "t-psr", "label": "Pulsars (neutron stars)", "on": true}, {"id": "t-con", "label": "Constellations", "on": true}, {"id": "t-mw", "label": "Milky Way · Sgr A*", "on": true}, {"id": "t-mw3d", "label": "Milky Way structure (3D)", "on": true}, {"id": "t-lens", "label": "Lensing at Sgr A*", "on": true}, {"id": "t-hz", "label": "Habitable zone", "on": true}]}, {"h": "🔭 Cosmos", "items": [{"id": "t-gal", "label": "Show galaxies", "on": true}, {"id": "t-web", "label": "Cosmic web (2MRS)", "on": true}, {"id": "t-qso", "label": "Quasars", "on": true}, {"id": "t-edge", "label": "Observable universe (CMB)", "on": true}]}, {"h": "🎛️ View", "items": [{"id": "t-real", "label": "Real scale", "on": false}, {"id": "t-rot", "label": "Auto-rotation", "on": false}, {"id": "t-freelook", "label": "Free-look flight", "on": false}, {"id": "t-veil", "label": "Red veil", "on": true}, {"id": "t-rings", "label": "Distance rings", "on": true}, {"id": "t-timebar", "label": "Time bar", "on": false, "ui": 1}]}];
  let closed = $state({});
  function tgl(id) { if (id === 't-timebar') { timeBar.update(v => !v); return; } if (api.clickToggle) api.clickToggle(id); }
  function chip(k) {
    if (!api.toggleFac) return;
    const hidden = api.toggleFac(k);
    facHidden.update(s => { const n = new Set(s); hidden ? n.add(k) : n.delete(k); return n; });
  }
  function colby() { if (api.facColorToggle) facColor.set(api.facColorToggle()); }
</script>

{#if legend}
<div class="panel" id={legend ? "hud-tr" : undefined}>
    <div class="label">Star colour = temperature</div>
    <div class="spectrum"></div>
    <div class="spectrum-ax"><span>hot · 30,000 K</span><span>cool · 3,000 K</span></div>
    <div class="leg-row"><span style="display:flex;align-items:center;gap:5px;flex:0 0 auto"><span class="mk" style="width:4px;height:4px;background:var(--dim)"></span><span class="mk" style="width:11px;height:11px;background:var(--dim)"></span></span>Size = planet radius</div>
    <div class="leg-row"><span class="mk" style="background:#eafffb;box-shadow:0 0 8px #fff"></span>Sun — you are here</div>
    <div class="leg-row"><span class="mk" style="background:var(--cyan)"></span>discovered in the selected year</div>
    <div class="leg-row"><span class="mk" style="background:#e6473c;box-shadow:0 0 8px #e6473c"></span>beyond the neighbourhood</div>
    <div class="leg-row"><span class="mk" style="width:5px;height:5px;background:#cfe0ff"></span>real stars · HYG catalogue</div>
    <div class="leg-row" style="margin-top:13px;border-top:1px solid var(--line);padding-top:11px;flex-wrap:wrap">
      <span style="display:flex;gap:5px;flex:0 0 auto">
        <span class="mk" style="background:#c7dbff"></span>
        <span class="mk" style="background:#ffdeb0"></span>
        <span class="mk" style="background:#acc6ee"></span>
      </span>Galaxies: spiral · elliptical · irregular</div>
    <div class="leg-row" style="flex-wrap:wrap">
      <span style="display:flex;gap:5px;flex:0 0 auto">
        <span class="mk" style="background:#ce966c"></span><span class="mk" style="background:#6ec4b8"></span>
        <span class="mk" style="background:#6e96e0"></span><span class="mk" style="background:#e2b484"></span>
      </span>Planets: rocky · super-Earth · Neptune · gas giant</div>
    <div class="leg-row" style="flex-wrap:wrap">
      <span style="display:flex;gap:5px;flex:0 0 auto">
        <span class="mk" style="background:#96beff"></span><span class="mk" style="background:#ffe2a0"></span>
        <span class="mk" style="background:#ff7676"></span><span class="mk" style="background:#6ee6c6"></span>
      </span>Deep-sky: open · globular · nebula · planetary</div>
  </div>
{/if}

<div class="panel" id={legend ? "hud-ctl" : undefined}>
  {#each groups as g, gi}
    <div class="ctl-group" class:closed={closed[gi]}>
      <div class="ctl-h" onclick={() => { closed[gi] = !closed[gi]; }}>{@html g.h}</div>
      {#each g.items as d (d.id)}
        <div class="toggle" class:on={d.ui ? $timeBar : ($toggleState[d.id] ?? d.on)} onclick={() => tgl(d.id)}>
          <span>{@html $labels[d.id] ?? d.label}</span><span class="sw"></span>
        </div>
      {/each}
    </div>
  {/each}
  <div class="ctl-inst">
    <div class="label" style="margin-bottom:8px">Discovery instrument</div>
    <div class="colby" class:on={$facColor} onclick={colby}><span>colour by it</span><span class="sw"></span></div>
    <div class="chips">
      {#each $facList as f (f.k)}
        <div class="chip" class:off={$facHidden.has(f.k)} onclick={() => chip(f.k)}>
          <span class="cdot" style="background:rgb({f.c[0]},{f.c[1]},{f.c[2]})"></span>
          <span>{f.l}</span><span class="cn">{f.n.toLocaleString('en-US')}</span>
        </div>
      {/each}
    </div>
  </div>
  <div class="hint" style="font-size:10px;color:var(--dim);margin-top:6px;font-style:italic;line-height:1.6">
    Drag rotate · right-drag pan · WASD fly<br>Scroll/pinch zoom to cursor · click to travel<br>🧭 tour · 📏 measure · 🔗 share view
  </div>
</div>
