<script>
  let open = $state(false);
</script>

<div class="panel" id="hud-mwmap" class:mini={!open}>
    <div class="label lbl-btn" onclick={() => open = !open} role="button" tabindex="0"
         onkeydown={e => e.key === 'Enter' && (open = !open)}>
      Milky Way · top-down <span class="caret">{open ? '▾' : '▸'}</span></div>
    <canvas id="mwmap" width="198" height="150" style="width:198px;height:150px;display:{open ? 'block' : 'none'}"></canvas>
    {#if open}<div class="mwcap">Schematic · ~100,000 light-years across</div>{/if}
  </div>
