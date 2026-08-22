<script>
  import Icon from './Icon.svelte';
  import { untrack } from 'svelte';
  let { collapsible = true } = $props();
  let open = $state(untrack(() => !collapsible));   // initial value on purpose
</script>

<div class="panel" id="hud-mwmap" class:mini={collapsible && !open}>
  {#if collapsible}
    <button type="button" class="label lbl-btn" aria-expanded={open} onclick={() => open = !open}>
      <span>Milky Way · top-down</span>
      <span class="caret" class:open><Icon name="chevron" size={13} /></span></button>
  {:else}
    <div class="label">Milky Way · top-down</div>
  {/if}
  <canvas id="mwmap" width="198" height="150"
          style="width:198px;height:150px;display:{open ? 'block' : 'none'}"
          aria-label="Schematic top-down map of the Milky Way with the Sun marked"></canvas>
  {#if open}<div class="mwcap">Schematic · ~100,000 light-years across</div>{/if}
</div>
