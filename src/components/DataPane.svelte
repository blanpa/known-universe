<script>
  // What is running and what failed: every outside source the app uses, with its state,
  // timing, size, file date and count. Catalogue files of this build, live services,
  // Earth and Sun imagery, sky-survey tiles, catalogue queries.
  import { api } from '../lib/api.js';
  import { sources } from '../lib/sources.js';
  import Icon from './Icon.svelte';
  let { compact = false } = $props();
  const GROUPS = [
    ['catalogue', 'Catalogue files · this build', 'Packed by the pipeline; the date is the file\'s. Not live.'],
    ['live', 'Live services', 'Polled on a schedule: space weather every 5 min, events every 30 min, launches every 2 h, satellites and EPIC every 6 h.'],
    ['earth', 'Earth imagery', 'Loaded when you fly to Earth.'],
    ['sky', 'Sky survey tiles', 'Loaded on demand in the telescope.'],
    ['query', 'Catalogue queries', 'Run from the Sky pane.'],
  ];
  const ago = t => { if (!t) return ''; const s = (Date.now() - t) / 1000; return s < 5 ? 'just now' : s < 60 ? `${s.toFixed(0)} s ago` : s < 3600 ? `${(s / 60).toFixed(0)} min ago` : `${(s / 3600).toFixed(1)} h ago`; };
  const size = b => b == null ? '' : b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : b >= 1024 ? `${(b / 1024).toFixed(0)} kB` : `${b} B`;
  const fileDate = m => { if (!m) return ''; const d = new Date(m); return isNaN(d) ? '' : d.toISOString().slice(0, 10); };
  const num = n => n == null ? '' : n.toLocaleString('en-US');
  let tick = $state(0);
  $effect(() => { const t = setInterval(() => { tick++; }, 5000); return () => clearInterval(t); });
  let rows = $derived(Object.values($sources).sort((a, b) => a.name.localeCompare(b.name)));
  let sum = $derived.by(() => { const o = { busy: 0, ok: 0, error: 0, warn: 0 }; for (const r of rows) if (o[r.state] !== undefined) o[r.state]++; return o; });
  const stateText = r => r.state === 'busy' ? 'running…' : r.state === 'ok' ? 'ok' : r.state === 'warn' ? 'partial' : r.state === 'error' ? 'failed' : r.state === 'absent' ? 'not present' : 'idle';
  // NASA key: kept in this browser only, never sent anywhere but api.nasa.gov
  let key = $state('');
  let keySaved = $state(false);
  $effect(() => { try { keySaved = !!localStorage.getItem('nasa_api_key'); } catch (e) {} });
  function saveKey() { try { if (key.trim()) { localStorage.setItem('nasa_api_key', key.trim()); keySaved = true; key = ''; api.liveRefresh?.(); } } catch (e) {} }
  function clearKey() { try { localStorage.removeItem('nasa_api_key'); keySaved = false; } catch (e) {} }
</script>

<div class="panel" id="hud-data" class:compact>
  <div class="label">Data</div>
  <p class="hint">Every outside source this map uses, and its state right now.</p>
  <div class="src-sum mono">
    <span class="d busy"></span>{sum.busy} running
    <span class="d ok"></span>{sum.ok} ok
    <span class="d warn"></span>{sum.warn} partial
    <span class="d error"></span>{sum.error} failed
  </div>
  <div class="sky-fov">
    <button type="button" class="chip" onclick={() => api.liveRefresh?.()}><Icon name="reset" size={12} />Refresh live data</button>
  </div>
  {#each GROUPS as [g, title, note] (g)}
    {@const list = rows.filter(r => r.group === g)}
    {#if list.length}
      <div class="label lg-sub">{title}</div>
      <p class="hint">{note}</p>
      <ul class="src">
        {#each list as r (r.id)}
          <li class="src-row {r.state}" title={r.host}>
            <span class="d {r.state}" aria-hidden="true"></span>
            <span class="src-n">{r.name}</span>
            <span class="src-s mono">{stateText(r)}{r.state === 'busy' || !r.at ? '' : ' · ' + ago(r.at) + (tick < 0 ? '' : '')}</span>
            <span class="src-d mono">
              {#if r.msg}{r.msg}{/if}
              {#if r.n != null}{r.msg ? ' · ' : ''}{num(r.n)} {r.group === 'sky' ? 'tiles' : r.group === 'catalogue' ? 'records' : 'items'}{/if}
              {#if r.size}{' · '}{size(r.size)}{/if}
              {#if r.modified && r.group === 'catalogue'}{' · file of '}{fileDate(r.modified)}{/if}
              {#if r.ms && r.state !== 'busy'}{' · '}{r.ms >= 1000 ? (r.ms / 1000).toFixed(1) + ' s' : r.ms + ' ms'}{/if}
              {#if !r.msg && r.n == null && !r.size && !r.ms}{r.host}{/if}
            </span>
          </li>
        {/each}
      </ul>
    {/if}
  {/each}

  <div class="label lg-sub">NASA API key</div>
  <p class="hint">NASA's services (asteroid flybys, solar storms, EPIC) run on the shared <span class="mono">DEMO_KEY</span>,
    which allows about 30 requests an hour and then answers 429. A personal key is free at api.nasa.gov; it stays in this
    browser and goes only to api.nasa.gov.</p>
  {#if keySaved}
    <div class="sky-fov"><span class="hint">A key is saved.</span><button type="button" class="chip" onclick={clearKey}>Remove key</button></div>
  {:else}
    <div class="sky-fov">
      <input class="src-key mono" type="password" placeholder="paste your key" bind:value={key} autocomplete="off" />
      <button type="button" class="chip" onclick={saveKey} disabled={!key.trim()}>Save</button>
    </div>
  {/if}
</div>
