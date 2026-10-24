<script>
  // The telescope: the sky as photographed. Park at the Sun, pick a survey, zoom the field
  // of view with the wheel. Blink two epochs and whatever hops between them is a star that
  // moves — the way Pluto and most brown dwarfs were found.
  import { api } from '../lib/api.js';
  import { camera, crossmatch, fieldQuery, measureLog, movers, observer, samp, selection, survey, userLayer } from '../lib/stores.js';
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
  const svName = id => SURVEYS.find(s => s.id === id)?.n ?? (id === 'fits' ? 'your image' : '…');
  let fitsEl = $state(null);
  async function pickFits(e) { const f = e.target.files?.[0]; if (!f) return; api.importFits?.(await f.arrayBuffer(), f.name); e.target.value = ''; }
  let fileEl = $state(null);
  let xmRadius = $state(3);
  // observer + instrument inputs (committed on change)
  let oLat = $state(''), oLon = $state(''), oElev = $state(''), oName = $state('');
  let iFl = $state(''), iSw = $state(''), iSh = $state(''), iPx = $state(''), iPa = $state('');
  $effect(() => { const o = $observer; oLat = o.on ? String(o.lat) : oLat; oLon = o.on ? String(o.lon) : oLon; oElev = String(o.elev); oName = o.name; iFl = String(o.fl); iSw = String(o.sw); iSh = String(o.sh); iPx = String(o.px); iPa = String(o.pa); });
  const PRESETS = [
    { n: 'APS-C DSLR · 200 mm' }, { n: 'APS-C · 80 mm refractor (f/6)' }, { n: 'ASI533MC · 8″ SCT (f/10)' }, { n: 'ASI294MC · 8″ Newton (f/5)' }, { n: 'Full frame · 135 mm' }, { n: '1.2 m Schmidt plate (6.4°)' } ];
  const fovT = v => v >= 1 ? `${v.toFixed(2)}°` : `${(v * 60).toFixed(1)}′`;                                   // cross-match radius, arcsec
  const sepText = v => v === null || v === undefined ? '' : v >= 60 ? (v / 60).toFixed(1) + '′' : v.toFixed(2) + '″';
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
    {#if $survey.fits}
      <button type="button" class="sky-sv" class:on={$survey.id === 'fits'} onclick={() => api.setSurvey?.('fits')}>
        <span class="sv-n">Your image<span class="sv-b mono">FITS</span></span>
        <span class="sv-s">{$survey.fits.name} · {$survey.fits.nx}×{$survey.fits.ny} px · {$survey.fits.scale.toFixed(2)}″/px{$survey.fits.epoch ? ` · ${$survey.fits.epoch.toFixed(2)}` : ''}</span></button>
    {/if}
  </div>
  <div class="sky-fov">
    <input type="file" accept=".fits,.fit,.fts,application/fits" bind:this={fitsEl} onchange={pickFits} hidden />
    <button type="button" class="chip" onclick={() => fitsEl?.click()}>{$survey.fits ? 'Replace your image…' : 'Your image (FITS with WCS)…'}</button>
    {#if $survey.fits}<button type="button" class="chip" onclick={() => api.clearFits?.()}>Remove</button>
      <button type="button" class="chip" onclick={() => api.lookAt?.($survey.fits.ra, $survey.fits.dec)}>Point at it</button>{/if}
  </div>
  {#if $survey.fitsMsg}<p class="hint warn">{$survey.fitsMsg}</p>{/if}
  <p class="hint">A FITS image with a TAN WCS (any plate-solved exposure: astrometry.net, PixInsight, a survey cutout) is drawn on the
    sky like a survey and can be blinked against one. Your exposure's epoch comes from DATE-OBS, so the expected jumps are computed against it.</p>

  <div class="label lg-sub">Blink</div>
  <p class="hint">Alternate two epochs. A star that jumps between them has a large proper motion:
    close, or fast, or both. Nearby brown dwarfs and white dwarfs still turn up this way.</p>
  <button type="button" class="toggle" class:on={$survey.blink} role="switch" aria-checked={$survey.blink}
          disabled={!$survey.id} onclick={() => api.setBlink?.(!$survey.blink, other)}>
    <span class="tg-l">Blink {svName($survey.id)} ↔ {svName(other)}</span><span class="sw" aria-hidden="true"></span></button>
  <div class="sky-fov">
    {#each SURVEYS.filter(s => s.id !== $survey.id) as s (s.id)}
      <button type="button" class="chip" class:on={other === s.id} onclick={() => api.setBlink?.($survey.blink, s.id)}>{s.n}</button>
    {/each}
    {#if $survey.fits && $survey.id !== 'fits'}
      <button type="button" class="chip" class:on={other === 'fits'} onclick={() => api.setBlink?.($survey.blink, 'fits')}>Your image</button>
    {/if}
  </div>
  {#if $camera.sky && $survey.id && !$camera.skyFrom}
    <div class="label lg-sub">Expected jumps</div>
    <p class="hint">Where a catalogued star must hop between {$movers.a} ({$movers.ea}) and {$movers.b} ({$movers.eb}): proper
      motion × {Math.abs($movers.dt).toFixed(0)} years. Arrows on the sky run from the first epoch to the second. A hop that is
      not in this list is the find.</p>
    {#if $movers.list.length}
      <ul class="enc mov">
        {#each $movers.list as m, i (i)}
          <li><button type="button" onclick={() => api.lookAt?.(m.ra, m.dec)}>
            <span class="enc-n" class:usr={m.usr}>{m.name}</span>
            <span class="enc-t mono">{m.jump >= 60 ? (m.jump / 60).toFixed(1) + '′' : m.jump.toFixed(1) + '″'}{m.ejump !== undefined ? ` ± ${m.ejump >= 1 ? m.ejump.toFixed(1) : m.ejump.toFixed(2)}″` : ''}</span>
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
    <div class="sky-fov xm-tools">
      <button type="button" class="chip" onclick={() => api.exportTable?.('set', 'csv', k)}>CSV</button>
      <button type="button" class="chip" onclick={() => api.exportTable?.('set', 'votable', k)}>VOTable</button>
      <button type="button" class="chip" disabled={!!$crossmatch.busy} onclick={() => api.crossmatch?.(k, { radius: xmRadius })}>Check against loaded catalogues</button>
      <button type="button" class="chip" disabled={!!$crossmatch.busy} onclick={() => api.crossmatch?.(k, { radius: xmRadius, remote: 'gaia' })}>Identify · Gaia DR3</button>
      <button type="button" class="chip" disabled={!!$crossmatch.busy} onclick={() => api.crossmatch?.(k, { radius: xmRadius, remote: 'simbad' })}>Identify · SIMBAD</button>
    </div>
  {/each}
  {#if $userLayer.sets.length}
    <label class="xm-r mono">radius <input type="number" min="0.1" max="60" step="0.5" bind:value={xmRadius} /> ″</label>
    <p class="hint">Cross-identification: each row is compared with the loaded HYG and Gaia clouds at once, or sent to the CDS X-Match
      service for Gaia DR3 (J2016.0) or SIMBAD (J2000.0) identifiers. Rows with proper motion are moved to the catalogue's epoch
      first; rows without one need a radius that covers their motion. A row with no counterpart is drawn <span class="xm-unk">red</span>.</p>
  {/if}
  {#if $crossmatch.msg}<p class="hint" class:busy={$crossmatch.busy}>{$crossmatch.msg}</p>{/if}
  {#if $crossmatch.set >= 0 && $crossmatch.n && !$crossmatch.busy}
    <div class="sky-ro mono xm-sum"><span class="xm-unk">{$crossmatch.unknown} without counterpart</span><span>{$crossmatch.known - ($crossmatch.coarse || 0)} {$crossmatch.remote ? 'identified in ' + $crossmatch.remote : 'known'}</span>{#if $crossmatch.coarse}<span>{$crossmatch.coarse} coarse</span>{/if}{#if $crossmatch.doubt}<span class="xm-doubt">{$crossmatch.doubt} doubtful</span>{/if}<span>r {$crossmatch.radius}″</span></div>
    {#if $crossmatch.rows.length}
      <ul class="enc mov xm-list">
        {#each $crossmatch.rows.slice(0, 60) as r (r.i)}
          <li><button type="button" onclick={() => api.lookAt?.(r.ra, r.dec)}>
            <span class="enc-n" class:xm-unk={!r.src}>{r.n}</span>
            <span class="enc-t mono">{r.src ? sepText(r.sep) : 'no match'}</span>
            <span class="enc-d mono" class:xm-doubt={r.doubt}>{r.src ? r.id + (r.doubt ? ' · ' + r.doubt : '') : `nothing within ${$crossmatch.radius}″`}</span>
            <span class="enc-v mono">{r.src ?? ''}</span>
          </button></li>
        {/each}
      </ul>
    {/if}
  {/if}
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
  <div class="label lg-sub">Observer</div>
  <p class="hint">A place on Earth turns the telescope into an instrument that knows where up is: altitude, azimuth and airmass for the
    field, the cursor and every card; rise, transit and set; the horizon across the sky. The clock is the timeline's. The maths is
    IAU 2006/2000B, checked against astropy (<span class="mono">npm run test:astro</span>).</p>
  <div class="obs-grid">
    <label class="mono">lat <input type="number" step="0.0001" min="-90" max="90" placeholder="48.137" bind:value={oLat} onchange={() => api.setObserver?.({ lat: +oLat, lon: +oLon || 0 })} /></label>
    <label class="mono">lon <input type="number" step="0.0001" min="-180" max="180" placeholder="11.575 (east +)" bind:value={oLon} onchange={() => api.setObserver?.({ lat: +oLat || 0, lon: +oLon })} /></label>
    <label class="mono">elev <input type="number" step="1" placeholder="m" bind:value={oElev} onchange={() => api.setObserver?.({ elev: +oElev })} /></label>
    <label class="mono">name <input type="text" placeholder="Munich" bind:value={oName} onchange={() => api.setObserver?.({ name: oName })} /></label>
  </div>
  <div class="sky-fov">
    <button type="button" class="chip" onclick={() => api.observerHere?.()}>Use my location</button>
    <button type="button" class="chip" class:on={$observer.on} onclick={() => api.setObserver?.({ on: !$observer.on })}>{$observer.on ? 'Observer on' : 'Observer off'}</button>
    <button type="button" class="chip" class:on={$observer.frame === 'date'} onclick={() => api.setObserver?.({ frame: $observer.frame === 'date' ? 'icrs' : 'date' })}>Coordinates {$observer.frame === 'date' ? 'of date (apparent)' : 'ICRS J2000'}</button>
    <button type="button" class="chip" class:on={$observer.refract} onclick={() => api.setObserver?.({ refract: !$observer.refract })}>Refraction {$observer.refract ? 'on' : 'off'}</button>
  </div>
  {#if $observer.msg}<p class="hint warn">{$observer.msg}</p>{/if}
  {#if $camera.sky && $observer.on && $camera.alt !== null && $camera.alt !== undefined}
    <div class="sky-ro mono"><span>alt {$camera.alt.toFixed(1)}°</span><span>az {$camera.az.toFixed(1)}°</span>{#if $camera.alt > 0}<span>airmass {$camera.airmass.toFixed(2)}</span>{:else}<span class="xm-unk">below the horizon</span>{/if}</div>
  {/if}

  <div class="label lg-sub">Instrument</div>
  <p class="hint">Your telescope and camera as a frame on the sky, and a finder chart to take to the eyepiece: the field as drawn,
    with north, east, centre, scale and time in a strip below.</p>
  <div class="sky-fov">
    {#each PRESETS as p, i (p.n)}<button type="button" class="chip" class:on={$observer.instr === p.n} onclick={() => api.setInstrument?.({ preset: i })}>{p.n}</button>{/each}
  </div>
  <div class="obs-grid">
    <label class="mono">f <input type="number" step="1" min="1" bind:value={iFl} onchange={() => api.setInstrument?.({ fl: +iFl, instr: '' })} /> mm</label>
    <label class="mono">sensor <input type="number" step="0.1" min="0.1" bind:value={iSw} onchange={() => api.setInstrument?.({ sw: +iSw, instr: '' })} /> × <input type="number" step="0.1" min="0.1" bind:value={iSh} onchange={() => api.setInstrument?.({ sh: +iSh, instr: '' })} /> mm</label>
    <label class="mono">pixel <input type="number" step="0.01" min="0.1" bind:value={iPx} onchange={() => api.setInstrument?.({ px: +iPx })} /> µm</label>
    <label class="mono">PA <input type="number" step="1" bind:value={iPa} onchange={() => api.setInstrument?.({ pa: +iPa })} /> °</label>
  </div>
  <div class="sky-fov">
    <button type="button" class="chip" class:on={$observer.frameOn} onclick={() => api.setInstrument?.({ frameOn: !$observer.frameOn })}>Frame {$observer.frameOn ? 'shown' : 'hidden'}</button>
    {#if $observer.fov}<span class="mono obs-fov">{fovT($observer.fov.w)} × {fovT($observer.fov.h)} · {$observer.fov.scale.toFixed(2)}″/px</span>{/if}
    <button type="button" class="chip" disabled={!$camera.sky} onclick={() => api.finderChart?.($selection?.card?.title)}>Finder chart · PNG</button>
  </div>

  <div class="label lg-sub">Export</div>
  <p class="hint">Tables leave as CSV or VOTable (TOPCAT, Aladin, astropy). Positions are ICRS at the stated epoch.</p>
  <div class="sky-fov">
    <button type="button" class="chip" disabled={!$movers.list.length} onclick={() => api.exportTable?.('movers', 'csv')}>Expected jumps · CSV</button>
    <button type="button" class="chip" disabled={!$movers.list.length} onclick={() => api.exportTable?.('movers', 'votable')}>VOTable</button>
    <button type="button" class="chip" disabled={!$measureLog.length} onclick={() => api.exportTable?.('measure', 'csv')}>Measurements ({$measureLog.length}) · CSV</button>
    <button type="button" class="chip" disabled={!$measureLog.length} onclick={() => api.exportTable?.('measure', 'votable')}>VOTable</button>
    <button type="button" class="chip" onclick={() => api.exportSvg?.()}>View → SVG</button>
  </div>
  <p class="hint">SVG: the view as a vector drawing — every line, ring, grid, orbit and label stays editable, the point clouds and the sky
    image sit underneath as one raster. For figures.</p>
  <div class="label lg-sub">SAMP · TOPCAT, Aladin, DS9</div>
  <p class="hint">A hub on this machine (TOPCAT and Aladin start one) links the tools: the telescope's field goes out as
    <span class="mono">coord.pointAt.sky</span>, a set as <span class="mono">table.load.votable</span>, and a point sent by
    another tool turns the telescope. The hub asks for your permission in its own window.</p>
  <div class="sky-fov">
    {#if $samp.state === 'on'}
      <button type="button" class="chip on" onclick={() => api.sampDisconnect?.()}>Disconnect</button>
      <button type="button" class="chip" disabled={!$camera.sky} onclick={() => api.sampPointAt?.()}>Point hub clients here</button>
      {#each $userLayer.sets as st, k (st.src + st.name)}
        <button type="button" class="chip" onclick={() => api.sampSendSet?.(k)}>Send “{st.name.length > 24 ? st.name.slice(0, 24) + '…' : st.name}”</button>
      {/each}
    {:else}
      <button type="button" class="chip" disabled={$samp.state === 'connecting'} onclick={() => api.sampConnect?.()}>Connect to the hub</button>
    {/if}
  </div>
  {#if $samp.msg}<p class="hint samp-{$samp.state}" class:busy={$samp.state === 'connecting'}>{$samp.msg}</p>{/if}
  <p class="hint src">Tiles: CDS/HiPS (DSS2 © STScI/ROE/AAO/UKSTU, 2MASS/IPAC-Caltech, WISE/NASA-JPL, Pan-STARRS/IfA). Loaded on demand; nothing is stored.</p>
</div>
