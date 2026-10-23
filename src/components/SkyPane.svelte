<script>
  // The telescope: the sky as photographed. Park at the Sun, pick a survey, zoom the field
  // of view with the wheel. Blink two epochs and whatever hops between them is a star that
  // moves — the way Pluto and most brown dwarfs were found.
  import { api } from '../lib/api.js';
  import { camera, fieldQuery, movers, selection, survey, userLayer } from '../lib/stores.js';
  import Icon from './Icon.svelte';
  const SURVEYS = [
    { id: 'dss',   n: 'DSS2',       sub: 'photographic plates, 1983–1999', band: 'visible' },
    { id: '2mass', n: '2MASS',      sub: 'near-infrared, 1997–2001',       band: 'J·H·K' },
    { id: 'wise',  n: 'AllWISE',    sub: 'mid-infrared, 2010',             band: 'W1·W2·W4' },
    { id: 'ps1',   n: 'Pan-STARRS', sub: 'DR1, 2010–2014',                 band: 'g·r·z' },
  ];
  const fovText = f => f >= 1 ? `${f.toFixed(f < 10 ? 1 : 0)}°` : f >= 1 / 60 ? `${(f * 60).toFixed(1)}′` : `${(f * 3600).toFixed(0)}″`;
  const hms = ra => { const h = ra / 15, hh = Math.floor(h), m = (h - hh) * 60, mm = Math.floor(m);
    return `${hh}h ${String(mm).padStart(2, '0')}m ${((m - mm) * 60).toFixed(0).padStart(2, '0')}s`; };
  const dms = d => { const s = d < 0 ? '−' : '+', a = Math.abs(d), dd = Math.floor(a), m = (a - dd) * 60;
    return `${s}${dd}° ${String(Math.floor(m)).padStart(2, '0')}′`; };
  let other = $derived($survey.blinkWith === $survey.id ? ($survey.id === 'dss' ? 'ps1' : 'dss') : $survey.blinkWith);
  let fileEl = $state(null);
  async function pickFile(e) { const f = e.target.files?.[0]; if (!f) return; api.importUser?.(await f.text(), f.name); e.target.value = ''; }
  const aladin = () => `https://aladin.cds.unistra.fr/AladinLite/?target=${$camera.ra.toFixed(4)}%20${$camera.dec.toFixed(4)}&fov=${Math.max(0.01, $camera.fov).toFixed(3)}&survey=P%2FDSS2%2Fcolor`;
</script>

<div class="panel" id="hud-sky">
  <div class="label">Sky</div>
  <p class="hint">The sky as the surveys photographed it, under the catalogue. From the Sun the view
    direction is the sky direction. Catalogue positions are propagated to the displayed epoch
    (HYG from J2000, Gaia from 2016, your rows from their own), the photographs keep theirs —
    so a fast star stands off its plate by its motion since. The arrows say how far.</p>
  <button type="button" class="toggle" class:on={$camera.sky} role="switch" aria-checked={$camera.sky}
          onclick={() => api.skyView?.()}>
    <span class="tg-l">Telescope view</span><span class="sw" aria-hidden="true"></span></button>
  {#if $camera.sky && $camera.skyFrom}
    <p class="hint">Standing at <b>{$camera.skyFrom}</b>: every star's brightness follows its distance from there, the Sun
      is one of them. The photographs, the jump list and the catalogue queries belong to the Sun's sky and stay off here.</p>
    <button type="button" class="sky-aim" onclick={() => api.skyView?.(true)}><Icon name="sun" size={13} />Back to the Sun's sky</button>
  {/if}
  {#if $selection && ($selection.card?.kind === 'star' || $selection.card?.kind === 'host' || $selection.card?.kind === 'gpick' || $selection.card?.kind === 'user')}
    <button type="button" class="sky-aim" onclick={() => api.skyView?.(true, 'selection')}><Icon name="scope" size={13} />Stand at {$selection.card?.title ?? 'selection'} and look around</button>
  {/if}
  {#if $camera.sky}
    <div class="sky-ro mono">
      <span>FOV {fovText($camera.fov)}</span>
      <span>RA {hms($camera.ra)}</span>
      <span>Dec {dms($camera.dec)}</span>
    </div>
    <div class="sky-fov">
      {#each [60, 10, 2, 0.5, 0.1] as f (f)}
        <button type="button" class="chip" onclick={() => api.setFov?.(f)}>{fovText(f)}</button>
      {/each}
    </div>
    {#if $selection}
      <button type="button" class="sky-aim" onclick={() => api.lookAtSelection?.()}><Icon name="scope" size={13} />Point at {$selection.card?.title ?? 'selection'}</button>
    {/if}
  {:else if $selection}
    <button type="button" class="sky-aim" onclick={() => api.lookAtSelection?.()}><Icon name="scope" size={13} />Point the telescope at {$selection.card?.title ?? 'selection'}</button>
  {/if}

  <div class="label lg-sub">Survey</div>
  <div class="sky-list">
    <button type="button" class="sky-sv" class:on={!$survey.id} onclick={() => api.setSurvey?.(null)}>
      <span class="sv-n">None</span><span class="sv-s">catalogue only</span></button>
    {#each SURVEYS as s (s.id)}
      <button type="button" class="sky-sv" class:on={$survey.id === s.id} onclick={() => api.setSurvey?.(s.id)}>
        <span class="sv-n">{s.n}<span class="sv-b mono">{s.band}</span></span><span class="sv-s">{s.sub}</span></button>
    {/each}
  </div>

  <div class="label lg-sub">Blink</div>
  <p class="hint">Alternate two epochs. A star that jumps between them has a large proper motion:
    close, or fast, or both. Nearby brown dwarfs and white dwarfs still turn up this way.</p>
  <button type="button" class="toggle" class:on={$survey.blink} role="switch" aria-checked={$survey.blink}
          disabled={!$survey.id} onclick={() => api.setBlink?.(!$survey.blink, other)}>
    <span class="tg-l">Blink {SURVEYS.find(s => s.id === $survey.id)?.n ?? '…'} ↔ {SURVEYS.find(s => s.id === other)?.n}</span><span class="sw" aria-hidden="true"></span></button>
  <div class="sky-fov">
    {#each SURVEYS.filter(s => s.id !== $survey.id) as s (s.id)}
      <button type="button" class="chip" class:on={other === s.id} onclick={() => api.setBlink?.($survey.blink, s.id)}>{s.n}</button>
    {/each}
  </div>
  {#if $camera.sky && $survey.id && !$camera.skyFrom}
    <div class="label lg-sub">Expected jumps</div>
    <p class="hint">Where a catalogued star must hop between {$movers.a} ({$movers.ea}) and {$movers.b} ({$movers.eb}): proper
      motion × {Math.abs($movers.dt).toFixed(0)} years. Arrows on the sky run from the first epoch to the second. A hop that is
      not in this list is the find.</p>
    {#if $movers.list.length}
      <ul class="enc mov">
        {#each $movers.list as m (m.name + m.ra)}
          <li><button type="button" onclick={() => api.lookAt?.(m.ra, m.dec)}>
            <span class="enc-n" class:usr={m.usr}>{m.name}</span>
            <span class="enc-t mono">{m.jump >= 60 ? (m.jump / 60).toFixed(1) + '′' : m.jump.toFixed(1) + '″'}</span>
            <span class="enc-d mono">{m.px >= 1 ? m.px.toFixed(0) + ' px' : '< 1 px'}</span>
            <span class="enc-v mono">{m.pm.toFixed(0)} mas/yr</span>
          </button></li>
        {/each}
      </ul>
    {:else}
      <p class="hint">Nothing in this field moves by half an arcsecond or more — or zoom in: only stars on screen are listed.</p>
    {/if}
  {/if}

  {#if $camera.sky}
    <div class="label lg-sub">Go deeper</div>
    <p class="hint">
      <a href={aladin()} target="_blank" rel="noopener">Open this field in Aladin Lite</a> for every survey and catalogue the CDS holds.
      Hunt for moving objects with real data at
      <a href="https://www.zooniverse.org/projects/marckuchner/backyard-worlds-planet-9" target="_blank" rel="noopener">Backyard Worlds</a>
      (WISE blinks) or transits at
      <a href="https://www.zooniverse.org/projects/nora-dot-eisner/planet-hunters-tess" target="_blank" rel="noopener">Planet Hunters TESS</a>.
    </p>
  {/if}
  <div class="label lg-sub">Your data</div>
  <p class="hint">Drop a CSV or TSV anywhere on the map, or pick a file. Columns by name: <span class="mono">ra, dec</span>
    (degrees or 03:47:24 / +24 07 00), a distance (<span class="mono">dist</span> pc, <span class="mono">plx</span> mas or
    <span class="mono">ly</span>), <span class="mono">mag</span>, <span class="mono">name</span>, <span class="mono">pmra, pmdec</span>.
    Rows become amber rings you can click, search and point the telescope at; the file stays in this browser only.</p>
  {#each $userLayer.sets as st, k (st.src + st.name)}
    <div class="usr-row">
      <span class="usr-n" title={st.name}>{st.name}</span>
      <span class="usr-c mono">{st.n} rows{st.noDist ? ` · ${st.noDist} no dist` : ''}</span>
      <button type="button" class="usr-x" aria-label="Remove {st.name}" onclick={() => api.removeSet?.(k)}><Icon name="close" size={12} /></button>
    </div>
  {/each}
  {#if $userLayer.n && !$userLayer.saved}<p class="hint warn">Not kept after a reload: too large for this browser's storage.</p>{/if}
  {#if $userLayer.warn}<p class="hint warn">{$userLayer.warn}</p>{/if}
  <div class="sky-fov">
    <input type="file" accept=".csv,.tsv,.txt,text/csv,text/plain" bind:this={fileEl} onchange={pickFile} hidden />
    <button type="button" class="chip" onclick={() => fileEl?.click()}>Import a file…</button>
    <a class="chip" href="./data/sample-stars.csv" download>Example CSV</a>
  </div>
  <div class="label lg-sub">Ask the catalogues</div>
  <p class="hint">Fetch what Gaia DR3 or SIMBAD hold in the field the telescope shows, straight from the CDS into this
    layer: positions, parallaxes, proper motions, magnitudes. Gaia returns the brightest 4,000 of the cone, SIMBAD 2,000.</p>
  <div class="sky-fov">
    <button type="button" class="chip" disabled={!$camera.sky || !!$camera.skyFrom || !!$fieldQuery.busy} onclick={() => api.queryField?.('gaia')}>Gaia DR3 in this field</button>
    <button type="button" class="chip" disabled={!$camera.sky || !!$camera.skyFrom || !!$fieldQuery.busy} onclick={() => api.queryField?.('simbad')}>SIMBAD in this field</button>
  </div>
  {#if $fieldQuery.msg}<p class="hint" class:busy={$fieldQuery.busy}>{$fieldQuery.msg}</p>{/if}
  {#if !$camera.sky}<p class="hint">Switch the telescope on to ask for a field.</p>{/if}
  <p class="hint src">Tiles: CDS/HiPS (DSS2 © STScI/ROE/AAO/UKSTU, 2MASS/IPAC-Caltech, WISE/NASA-JPL, Pan-STARRS/IfA). Loaded on demand; nothing is stored.</p>
</div>
