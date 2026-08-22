<script>
  import { api } from '../lib/engine.js';
  import { searchMsg } from '../lib/stores.js';
  import Icon from './Icon.svelte';
  let { mode = 'desktop', onpick = () => {} } = $props();
  let q = $state('');
  let sel = $state(-1);
  let sugs = $derived(q.trim().length >= 2 && api.suggest ? api.suggest(q) : []);
  function go(name) {
    if (api.doSearch) api.doSearch(name);
    q = ''; sel = -1; onpick(name);
  }
  function key(e) {
    if (e.key === 'ArrowDown' && sugs.length) { e.preventDefault(); sel = (sel + 1) % sugs.length; return; }
    if (e.key === 'ArrowUp' && sugs.length) { e.preventDefault(); sel = (sel - 1 + sugs.length) % sugs.length; return; }
    if (e.key === 'Enter') { const pick = sel >= 0 && sugs[sel] ? sugs[sel][0] : q.trim(); if (pick) go(pick); }
    if (e.key === 'Escape') { q = ''; sel = -1; }
  }
</script>

<!-- the field IS the surface — no panel wrapper, which used to double the border -->
<div class="searchwrap" id={mode === 'desktop' ? 'hud-search' : undefined}>
  <div class="searchfield">
    <Icon name="search" size={15} />
    <input class="searchIn" type="text" spellcheck="false" role="combobox"
           aria-expanded={sugs.length > 0} aria-controls="search-sugs" aria-autocomplete="list"
           aria-label="Search for an object"
           placeholder="Search Earth, Sirius, TRAPPIST-1…"
           bind:value={q} onkeydown={key}>
    {#if q}
      <button type="button" class="s-x" aria-label="Clear search" onclick={() => { q = ''; sel = -1; }}>
        <Icon name="close" size={14} /></button>
    {/if}
  </div>
  {#if sugs.length}
    <div class="sugbox" id="search-sugs" role="listbox">
      {#each sugs as sg, si (si)}
        <button type="button" role="option" aria-selected={si === sel} class:sel={si === sel}
                onclick={() => go(sg[0])} onpointerenter={() => sel = si}>
          <span class="sg-n">{sg[0]}</span><span class="sg-k">{sg[2]}</span></button>
      {/each}
    </div>
  {/if}
  {#if $searchMsg}<div class="searchMsg" role="status">{$searchMsg}</div>{/if}
</div>
