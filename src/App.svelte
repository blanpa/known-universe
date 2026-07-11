<script>
  import { toggleState } from './lib/stores.js';
  import { api } from './lib/engine.js';
  const groups = [{"h": "☀️ Solar system", "items": [{"id": "t-moons", "label": "Moons (solar system)", "on": true}, {"id": "t-ast", "label": "Asteroids &amp; comets", "on": true}, {"id": "t-belt", "label": "Asteroid field", "on": true}, {"id": "t-tno", "label": "Trans-Neptunian &amp; Centaurs", "on": true}, {"id": "t-probes", "label": "Spacecraft (Voyager…)", "on": true}, {"id": "t-helio", "label": "Heliosphere", "on": true}, {"id": "t-size", "label": "Size = planet radius", "on": true}]}, {"h": "⭐ Stars", "items": [{"id": "t-hyg", "label": "Stars (HYG)", "on": true}, {"id": "t-gpu", "label": "GPU stars", "on": true}, {"id": "t-gaia", "label": "Gaia stars (&lt;100 pc)", "on": true}, {"id": "t-ob", "label": "OB stars (arm tracers)", "on": true}, {"id": "t-var", "label": "Variable stars", "on": true}, {"id": "t-pm", "label": "Proper motion", "on": false}]}, {"h": "💫 Deep sky &amp; galaxy", "items": [{"id": "t-dso", "label": "Nebulae &amp; clusters", "on": true}, {"id": "t-oclu", "label": "Clusters · globulars · FRBs", "on": true}, {"id": "t-psr", "label": "Pulsars (neutron stars)", "on": true}, {"id": "t-con", "label": "Constellations", "on": true}, {"id": "t-mw", "label": "Milky Way · Sgr A*", "on": true}, {"id": "t-mw3d", "label": "Milky Way structure (3D)", "on": true}, {"id": "t-hz", "label": "Habitable zone", "on": true}]}, {"h": "🔭 Cosmos", "items": [{"id": "t-gal", "label": "Show galaxies", "on": true}, {"id": "t-web", "label": "Cosmic web (2MRS)", "on": true}, {"id": "t-qso", "label": "Quasars", "on": true}, {"id": "t-edge", "label": "Observable universe (CMB)", "on": true}]}, {"h": "🎛️ View", "items": [{"id": "t-real", "label": "Real scale", "on": false}, {"id": "t-rot", "label": "Auto-rotation", "on": false}, {"id": "t-freelook", "label": "Free-look flight", "on": false}, {"id": "t-veil", "label": "Red veil", "on": true}, {"id": "t-rings", "label": "Distance rings", "on": true}]}];
  let closed = $state({});
  function mob(c){ const B=document.body.classList;
    for(const x of ['mob-left','mob-right','mob-time']) if(x!==c) B.remove(x);
    B.toggle(c); }
  function startTour(){ const B=document.body.classList;
    B.remove('mob-left','mob-right','mob-time');
    const b=document.getElementById('tourBtn'); if(b) b.click(); }
  function resetView(){ const b=document.getElementById('resetBtn'); if(b) b.click(); }
</script>



<div id="stage">
  <canvas id="gl"></canvas>
  <canvas id="sky"></canvas>

  <div id="left-col">
  <div class="panel" id="hud-tl">
    <h1><span class="dot"></span>Known Universe</h1>
    <div class="sub">One scale from the solar system to the galaxies — <b style="color:var(--ink);font-weight:600">scroll</b> to cross the orders of magnitude. Data: NASA · HYG · Local Volume.</div>
    <div class="stats">
      <div class="stat"><div class="k mono" id="s-sys">0</div><div class="l">Systems visible</div></div>
      <div class="stat"><div class="k mono" id="s-pl">0</div><div class="l">Planets</div></div>
      <div class="stat"><div class="k mono" id="s-near">—</div><div class="l">Nearest (ly)</div></div>
      <div class="stat"><div class="k mono" id="s-far">—</div><div class="l">Farthest (ly)</div></div>
    </div>
    <button id="solarBtn">☉ Into the solar system</button>
    <div id="btnGrid">
      <button id="tourBtn" title="A guided flight from Earth to the edge of the observable universe">🧭 Tour</button>
      <button id="shareBtn" title="Copy a link to this exact view">🔗 Share</button>
      <button id="measureBtn" title="Click two objects to measure the real distance between them">📏 Measure</button>
      <button id="resetBtn2" title="Back to the full view" onclick={resetView}>⟲ Reset</button>
    </div>
  </div>

  <div class="panel" id="hud-search">
    <input id="search" placeholder="Search… Sirius, TRAPPIST-1, Andromeda" autocomplete="off" spellcheck="false">
    <div id="suggest"></div>
    <div id="searchMsg"></div>
  </div>

  <div class="panel" id="hud-mwmap">
    <div class="label">Milky Way · top-down</div>
    <canvas id="mwmap" width="198" height="150" style="width:198px;height:150px;display:block"></canvas>
    <div class="mwcap">Schematic · ~100,000 light-years across</div>
  </div>
  </div>

  <div id="right-col">
  <div class="panel" id="hud-tr">
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

  <div class="panel" id="hud-ctl">
    {#each groups as g, gi}
    <div class="ctl-group" class:closed={closed[gi]}>
      <div class="ctl-h" onclick={()=>{closed[gi]=!closed[gi]}}>{@html g.h}</div>
      {#each g.items as d (d.id)}
        <div class="toggle" class:on={$toggleState[d.id] ?? d.on} id={d.id}
             onclick={()=>api.clickToggle && api.clickToggle(d.id)}>
          <span>{@html d.label}</span><span class="sw"></span>
        </div>
      {/each}
    </div>
    {/each}
    <button id="resetBtn" style="display:none">Reset view</button>
    <div class="ctl-inst">
      <div class="label" style="margin-bottom:8px">Discovery instrument</div>
      <div class="colby" id="t-fac"><span>colour by it</span><span class="sw"></span></div>
      <div class="chips" id="facChips"></div>
    </div>
    <div class="hint" style="font-size:10px;color:var(--dim);margin-top:6px;font-style:italic;line-height:1.6">
      Drag rotate · right-drag pan · WASD fly<br>Scroll/pinch zoom to cursor · click to travel<br>🧭 tour · 📏 measure · 🔗 share view
    </div>
  </div>
  </div>

  <div class="panel" id="hud-time">
    <div class="time-head">
      <div class="yr">Year <span class="live" id="yrVal">2026</span></div>
      <div class="meta" id="yrMeta"></div>
      <div class="time-min" title="Minimize">–</div>
    </div>
    <div class="time-row">
      <button id="play" aria-label="Play time"><svg id="playIcon" viewBox="0 0 16 16"><path d="M3 2l11 6L3 14z"/></svg></button>
      <div class="track">
        <input type="range" id="year" min="1992" max="2026" value="2026" step="1">
        <div class="ticks"><span>1992</span><span>2000</span><span>2009</span><span>2017</span><span>2026</span></div>
      </div>
    </div>
  </div>

  <div class="panel" id="hud-soltime" style="display:none">
    <div class="time-head">
      <div class="yr">Solar system · <span class="live" id="solDate">–</span></div>
      <div class="meta">Time travel · planets on their orbits</div>
      <div class="time-min" title="Minimize">–</div>
    </div>
    <div class="time-row">
      <button id="solPlay" aria-label="Play time"><svg id="solIcon" viewBox="0 0 16 16"><path d="M3 2l11 6L3 14z"/></svg></button>
      <div class="track">
        <input type="range" id="solTime" min="-36525" max="36525" value="0" step="1">
        <div class="ticks"><span>−100 yr</span><span>−50</span><span>today</span><span>+50</span><span>+100 yr</span></div>
      </div>
      <button id="solNow">today</button>
    </div>
  </div>

  <div class="panel" id="hud-pm" style="display:none">
    <div class="pm-head"><span class="label" style="margin:0">Night sky · proper motion</span>
      <span class="mono" id="pmVal">today</span></div>
    <input type="range" id="pmTime" min="-50000" max="50000" value="0" step="100">
    <div class="ticks"><span>−50,000 yr</span><span>today</span><span>+50,000 yr</span></div>
  </div>

  <div class="panel" id="hud-nav" style="display:none">
    <div class="nav-head"><span class="label" style="margin:0">▸ Navigation · course</span>
      <span id="navClose" title="Clear course">✕</span></div>
    <div id="navName">–</div>
    <div class="nav-cells">
      <div class="nav-cell"><div id="navDist" class="mono nv">–</div><div class="nl">Distance</div></div>
      <div class="nav-cell"><div id="navLight" class="mono nv">–</div><div class="nl">Light travel time</div></div>
      <div class="nav-cell"><div id="navHead" class="mono nv">–</div><div class="nl">Bearing</div></div>
    </div>
    <button id="navGo">Engage course ▸</button>
  </div>

  <div class="panel" id="info"></div>

</div>
<div id="mobbar">
  <div class="mb" id="mbSearch" onclick={()=>mob("mob-left")}><span>🔍</span>Search</div>
  <div class="mb" id="mbLayers" onclick={()=>mob("mob-right")}><span>☰</span>Layers</div>
  <div class="mb" id="mbTime" onclick={()=>mob("mob-time")}><span>🕐</span>Time</div>
  <div class="mb" id="mbTour" onclick={startTour}><span>🧭</span>Tour</div>
</div>
<div id="tourPanel" style="display:none;position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:60;
  max-width:520px;background:rgba(10,14,28,.92);border:1px solid rgba(120,140,190,.35);border-radius:10px;
  padding:12px 16px;font-family:ui-monospace,monospace;color:#e9edfa;backdrop-filter:blur(4px)">
  <div id="tourTitle" style="font-size:13px;color:#ffcf6b;letter-spacing:.06em;margin-bottom:5px"></div>
  <div id="tourText" style="font-size:11.5px;line-height:1.55;color:#c8cfE2"></div>
  <div style="display:flex;gap:8px;margin-top:9px;align-items:center">
    <button id="tourPrev" class="tbtn">◀</button>
    <span id="tourStep" style="font-size:10px;color:#8a93ad"></span>
    <button id="tourNext" class="tbtn">Next ▶</button>
    <span style="flex:1"></span>
    <button id="tourEnd" class="tbtn">✕ End tour</button>
  </div>
</div>


