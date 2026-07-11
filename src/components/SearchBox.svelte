<script>
  import { api } from '../lib/engine.js';
  import { searchMsg } from '../lib/stores.js';
  let { mode = 'desktop', onpick = () => {} } = $props();
  let q = $state('');
  let sugs = $derived(q.trim().length >= 2 && api.suggest ? api.suggest(q) : []);
  function go(name) {
    if (api.doSearch) api.doSearch(name);
    q = ''; onpick(name);
  }
  function key(e) {
    if (e.key === 'Enter' && q.trim()) go(q.trim());
    if (e.key === 'Escape') q = '';
  }
</script>

<div class={mode === 'desktop' ? 'panel' : ''} id={mode === 'desktop' ? 'hud-search' : undefined}>
  <input class="searchIn" type="text" spellcheck="false"
         placeholder="Search: Earth, Sirius, TRAPPIST-1, PSR J0332…"
         bind:value={q} onkeydown={key}>
  {#if sugs.length}
    <div class="sugbox">
      {#each sugs as sg (sg[0] + sg[2])}
        <div onclick={() => go(sg[0])}>{sg[0]}<span>{sg[2]}</span></div>
      {/each}
    </div>
  {/if}
  {#if $searchMsg}<div class="searchMsg">{$searchMsg}</div>{/if}
</div>
