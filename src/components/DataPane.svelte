<script>
  // What is running and what failed: every outside source the app uses, with its state,
  // timing, size, file date and count. Catalogue files of this build, live services,
  // Earth and Sun imagery, sky-survey tiles, catalogue queries.
  import { api } from '../lib/api.js';
  import { count, sources, tfetch } from '../lib/sources.js';
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
  // What came in, and when: every build of the catalogue file, diffed by name (site/data/changelog.json,
  // written by pipeline/data_history.py from git; the weekly workflow refreshes it).
  let log = $state(null);
  let logErr = $state('');
  $effect(() => { if (log !== null) return;
    tfetch('changelog-json', { name: 'changelog.json · what came in, and when', group: 'catalogue' }, 'data/changelog.json?b=' + __BUILD__)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(j => { log = j; count('changelog-json', (j.builds || []).length); })
      .catch(e => { logErr = e.message; log = { builds: [] }; }); });
  const kind = e => /weekly/i.test(e.subject) || e.commit === 'pending' ? 'weekly refresh' : 'rebuild';
  const sgn = n => n > 0 ? `+${num(n)}` : num(n);
  const plus = (e, k) => e.delta && e.delta[k] ? ` (${sgn(e.delta[k])})` : '';
  const names = (e, k) => (e.added && e.added[k]) || [];
  const more = (e, k) => Math.max(0, ((e.nAdded || {})[k] || 0) - names(e, k).length);
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

  <div class="label lg-sub">Data updates · what came in, and when</div>
  <p class="hint">Every build of the catalogue file, newest first, diffed by name against the one before: the exoplanet
    systems, planets and galaxies that arrived (NASA Exoplanet Archive weekly, Monday 05:23 UTC). The Gaia clouds and the
    Horizons table are static releases; the live feeds above refresh on their own schedules and are not builds.</p>
  {#if log === null}
    <p class="hint mono">loading changelog.json…</p>
  {:else if !log.builds.length}
    <p class="hint mono">no changelog in this build{logErr ? ' · ' + logErr : ''}</p>
  {:else}
    <ul class="src dl" id="data-log">
      {#each log.builds as e (e.commit + e.date)}
        {@const sys = names(e, 'systems')}
        {@const gal = names(e, 'galaxies')}
        {@const pl = names(e, 'planets')}
        <li class="dl-row">
          <div class="dl-head mono"><span class="dl-date">{e.date}</span><span class="dl-kind">{kind(e)}</span>
            <span class="dl-n">{num(e.counts.systems)} systems{plus(e, 'systems')} · {num(e.counts.planets)} planets{plus(e, 'planets')} · {num(e.counts.galaxies)} galaxies{plus(e, 'galaxies')} · {num(e.counts.hyg)} HYG{plus(e, 'hyg')}</span></div>
          {#if sys.length || gal.length}
            <details class="dl-det">
              <summary class="mono">{#if sys.length}{sys.length + more(e, 'systems')} new system{sys.length + more(e, 'systems') === 1 ? '' : 's'}{/if}{#if sys.length && gal.length}{' · '}{/if}{#if gal.length}{gal.length + more(e, 'galaxies')} new galax{gal.length + more(e, 'galaxies') === 1 ? 'y' : 'ies'}{/if}{#if pl.length}{' · '}{pl.length + more(e, 'planets')} planet{pl.length + more(e, 'planets') === 1 ? '' : 's'}{/if}</summary>
              {#if sys.length}<p class="dl-names mono">{sys.join(' · ')}{more(e, 'systems') ? ` · +${more(e, 'systems')} more` : ''}</p>{/if}
              {#if pl.length}<p class="dl-names mono dim">{pl.join(' · ')}{more(e, 'planets') ? ` · +${more(e, 'planets')} more` : ''}</p>{/if}
              {#if gal.length}<p class="dl-names mono">{gal.join(' · ')}</p>{/if}
            </details>
          {:else if e.delta}
            <p class="dl-names mono dim">{e.nRemoved && (e.nRemoved.systems || e.nRemoved.planets) ? `${e.nRemoved.systems || 0} systems / ${e.nRemoved.planets || 0} planets dropped` : e.delta.hyg ? `HYG ${sgn(e.delta.hyg)}` : 'rebuilt · same contents, new positions or fields'}</p>
          {:else}
            <p class="dl-names mono dim">first build in the history</p>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

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
