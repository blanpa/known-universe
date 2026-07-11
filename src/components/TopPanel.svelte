<script>
  function resetView(){ const b=document.getElementById('resetBtn'); if(b) b.click(); }
</script>

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
