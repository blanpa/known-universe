<script>
  import { api } from '../lib/engine.js';
  import { liveData, activeShowers } from '../lib/live.js';
  let { onpick = null } = $props();
  let showAll = $state(false);
  let open = $state(false);

  const kpCol = k => k >= 6 ? '#ff7676' : k >= 4 ? '#ffd27a' : '#7fe08a';
  const xrCol = x => !x ? 'var(--dim)' : x[0] === 'X' ? '#ff7676' : x[0] === 'M' ? '#ffab6e' : x[0] === 'C' ? '#ffd27a' : '#9fb0d0';
  const dt = t => new Date(t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const dts = t => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const ldf = ld => ld < 10 ? ld.toFixed(1) : Math.round(ld);
  const dia = d => d == null ? '?' : d >= 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m';
  const farYr = f => { if (!f) return ''; const y = 1 / (f * 86400 * 365.25);
    return y >= 1e6 ? '1/' + (y / 1e6).toFixed(0) + ' Myr' : y >= 1 ? '1/' + Math.round(y) + ' yr' : '1/' + Math.max(1, Math.round(y * 365)) + ' d'; };
  const inRel = t => { const h = (t - Date.now()) / 3600000;
    return h < 0 ? 'now' : h < 1 ? Math.round(h * 60) + ' min' : h < 48 ? Math.round(h) + ' h' : Math.round(h / 24) + ' d'; };

  let active = $derived($liveData ? $liveData.cmes.filter(c => {
    const r = 0.1 + c.v * (Date.now() - c.t) / 1000 / 1.496e8;
    return r > 0 && r < 2.6;
  }) : []);
  let neos = $derived($liveData ? (showAll ? $liveData.neos : $liveData.neos.slice(0, 5)) : []);
  let maxM = $derived($liveData?.regions?.length ? Math.max(...$liveData.regions.map(r => r.mp)) : 0);
  let gw = $derived($liveData?.extra?.gw ?? []);
  let fbs = $derived(($liveData?.extra?.fireballs ?? []).filter(f => Date.now() - f.t < 30 * 86400000));
  let biggestFb = $derived(fbs.length ? Math.max(...fbs.map(f => f.kt)) : 0);
  let showers = $derived($liveData ? activeShowers(Date.now()) : []);
  let stats = $derived($liveData && api.liveStats ? api.liveStats() : null);

  function go(id){ if (api.liveNeoFocus) api.liveNeoFocus(id); if (onpick) onpick(); }
</script>

{#if $liveData}
<div class="panel live-panel" class:mini={!open}>
  <div class="label lbl-btn" onclick={() => open = !open} role="button" tabindex="0"
       onkeydown={e => e.key === 'Enter' && (open = !open)}>
    🌞 Space weather · live <span class="caret">{open ? '▾' : '▸'}</span></div>
  {#if $liveData.wx}
    <div class="lv-wx">
      <span class="lv-chip">Kp <b style="color:{kpCol($liveData.wx.kp ?? 0)}">{$liveData.wx.kp?.toFixed(1) ?? '–'}</b></span>
      <span class="lv-chip">wind <b>{$liveData.wx.wind ? Math.round($liveData.wx.wind) : '–'}</b> km/s</span>
      <span class="lv-chip">Bz <b style="color:{($liveData.wx.bz ?? 0) <= -5 ? '#ff7676' : 'var(--ink)'}">{$liveData.wx.bz ?? '–'}</b> nT</span>
      <span class="lv-chip">X-ray <b style="color:{xrCol($liveData.wx.xray)}">{$liveData.wx.xray ?? '–'}</b></span>
    </div>
  {/if}
  {#if !open && active.some(c => c.earthDir)}
    <div class="lv-sub"><b style="color:#ffab6e">⚠ Earth-directed CME in flight</b></div>
  {/if}
  {#if open}
  {#if $liveData.regions?.length}
    <div class="lv-sub">☀ {$liveData.regions.length} active regions on the Sun{maxM ? ` · M-flare odds ${maxM}%` : ''}</div>
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
  {#if fbs.length}
    <div class="lv-sub">💥 {fbs.length} fireballs in 30 d · biggest {biggestFb} kt — marked on Earth</div>
  {/if}

  {#if gw.length}
    <div class="label" style="margin-top:10px">🌊 Gravitational waves</div>
    {#each gw.slice(0, 3) as g (g.id)}
      <div class="lv-row">
        <span class="lv-dot" style="background:#9fb8ff"></span>
        <span class="lv-nm">{g.id}</span>
        <span class="lv-val">{dts(g.t)} · FAR {farYr(g.far)}</span>
      </div>
    {/each}
  {/if}

  {#if $liveData.launches?.length}
    <div class="label" style="margin-top:10px">🚀 Next launches</div>
    {#each $liveData.launches.slice(0, 3) as l (l.n + l.t)}
      <div class="lv-row">
        <span class="lv-dot" style="background:#c9d6f2"></span>
        <span class="lv-nm lv-trunc">{l.n}</span>
        <span class="lv-val">in {inRel(l.t)}</span>
      </div>
    {/each}
  {/if}

  {#if showers.length}
    <div class="lv-sub" style="margin-top:8px">🌠 active showers: {showers.map(s => `${s.n} (ZHR ${s.zhr})`).join(' · ')}</div>
  {/if}
  {#if $liveData.sats}
    <div class="lv-sub">🛰 {$liveData.sats} satellites tracked — zoom to Earth</div>
  {/if}
  {#if stats?.exoY}
    <div class="lv-sub">🪐 {stats.exoY} systems discovered in {stats.year}</div>
  {/if}
  <div class="lv-src">SWPC · DONKI · NeoWs · CelesTrak · GraceDB · CNEOS · LL2</div>
  {/if}
</div>
{/if}
