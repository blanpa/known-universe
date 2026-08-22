<script>
  import Icon from './Icon.svelte';
  function press(id) { const b = document.getElementById(id); if (b) b.click(); }
</script>

<div class="panel" id="hud-tl">
  <h1><span class="dot" aria-hidden="true"></span>Known Universe</h1>
  <div class="stats">
    <div class="stat"><div class="k mono" id="s-sys">0</div><div class="l">Systems visible</div></div>
    <div class="stat"><div class="k mono" id="s-pl">0</div><div class="l">Planets</div></div>
    <div class="stat"><div class="k mono" id="s-near">—</div><div class="l">Nearest (ly)</div></div>
    <div class="stat"><div class="k mono" id="s-far">—</div><div class="l">Farthest (ly)</div></div>
  </div>
  <button type="button" id="solarBtn"><Icon name="sun" size={15} />Into the solar system</button>
  <div id="btnGrid">
    <button type="button" id="tourBtn" title="A guided flight from Earth to the edge of the observable universe">
      <Icon name="compass" size={15} />Tour</button>
    <button type="button" id="shareBtn" title="Copy a link to this exact view">
      <Icon name="link" size={15} />Share</button>
    <button type="button" id="measureBtn" title="Click two objects to measure the real distance between them">
      <Icon name="ruler" size={15} />Measure</button>
    <button type="button" id="resetBtn2" title="Back to the full view" onclick={() => press('resetBtn')}>
      <Icon name="reset" size={15} />Reset</button>
  </div>
</div>
