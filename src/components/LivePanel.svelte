<script>
  import { api } from '../lib/engine.js';
  import { liveData } from '../lib/live.js';
  let { onpick = null } = $props();
  let showAll = $state(false);

  const kpCol = k => k >= 6 ? '#ff7676' : k >= 4 ? '#ffd27a' : '#7fe08a';
  const xrCol = x => !x ? 'var(--dim)' : x[0] === 'X' ? '#ff7676' : x[0] === 'M' ? '#ffab6e' : x[0] === 'C' ? '#ffd27a' : '#9fb0d0';
  const dt = t => new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const ldf = ld => ld < 10 ? ld.toFixed(1) : Math.round(ld);
  const dia = d => d == null ? '?' : d >= 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m';

  let active = $derived($liveData ? $liveData.cmes.filter(c => {
    const r = 0.1 + c.v * (Date.now() - c.t) / 1000 / 1.496e8;
    return r > 0 && r < 2.6;
  }) : []);
  let neos = $derived($liveData ? (showAll ? $liveData.neos : $liveData.neos.slice(0, 5)) : []);

  function go(id){ if (api.liveNeoFocus) api.liveNeoFocus(id); if (onpick) onpick(); }
</script>

{#if $liveData}
<div class="panel live-panel">
  <div class="label">🌞 Space weather · live</div>
  {#if $liveData.wx}
    <div class="lv-wx">
      <span class="lv-chip">Kp <b style="color:{kpCol($liveData.wx.kp ?? 0)}">{$liveData.wx.kp?.toFixed(1) ?? '–'}</b></span>
      <span class="lv-chip">wind <b>{$liveData.wx.wind ? Math.round($liveData.wx.wind) : '–'}</b> km/s</span>
      <span class="lv-chip">Bz <b style="color:{($liveData.wx.bz ?? 0) <= -5 ? '#ff7676' : 'var(--ink)'}">{$liveData.wx.bz ?? '–'}</b> nT</span>
      <span class="lv-chip">X-ray <b style="color:{xrCol($liveData.wx.xray)}">{$liveData.wx.xray ?? '–'}</b></span>
    </div>
  {/if}
  {#if active.length}
    <div class="lv-sub">{active.length} CME{active.length > 1 ? 's' : ''} in flight
      {#if active.some(c => c.earthDir)}<b style="color:#ffab6e"> · Earth-directed!</b>{/if}</div>
    {#each active.slice(0, 3) as c (c.t + '' + c.lon)}
      <div class="lv-row">
        <span class="lv-dot" style="background:{c.v >= 800 ? '#ff6050' : c.v >= 500 ? '#ff9650' : '#ffc86e'}"></span>
        <span class="lv-nm">{dt(c.t)}</span>
        <span class="lv-val">{Math.round(c.v)} km/s{c.earthDir ? ` · Earth ~ ${dt(c.eta)}` : ''}</span>
      </div>
    {/each}
  {:else}
    <div class="lv-sub">no CME currently in flight</div>
  {/if}

  {#if $liveData.neos.length}
    <div class="label" style="margin-top:10px">☄️ Earth flybys · next 7 days</div>
    {#each neos as o (o.id)}
      <div class="lv-row lv-click" class:lv-off={!o.kd} onclick={() => go(o.id)} role="button" tabindex="0"
           onkeydown={e => e.key === 'Enter' && go(o.id)}>
        <span class="lv-dot" style="background:{o.pha || o.sentry ? '#ff6e5a' : '#ffb260'}"></span>
        <span class="lv-nm">{o.n}{o.pha ? ' ⚠' : ''}</span>
        <span class="lv-val">{dt(o.t)} · {ldf(o.ld)} LD · {dia(o.dia)}</span>
      </div>
    {/each}
    {#if $liveData.neos.length > 5}
      <div class="lv-more" onclick={() => showAll = !showAll} role="button" tabindex="0"
           onkeydown={e => e.key === 'Enter' && (showAll = !showAll)}>
        {showAll ? '– fewer' : `+ ${$liveData.neos.length - 5} more`}</div>
    {/if}
  {/if}
  <div class="lv-src">NOAA SWPC · NASA DONKI · NeoWs</div>
</div>
{/if}
