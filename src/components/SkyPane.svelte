<script>
  // The telescope: the sky as photographed. Park at the Sun, pick a survey, zoom the field
  // of view with the wheel. Blink two epochs and whatever hops between them is a star that
  // moves — the way Pluto and most brown dwarfs were found.
  import { api } from '../lib/api.js';
  import { camera, selection, survey } from '../lib/stores.js';
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
  const aladin = () => `https://aladin.cds.unistra.fr/AladinLite/?target=${$camera.ra.toFixed(4)}%20${$camera.dec.toFixed(4)}&fov=${Math.max(0.01, $camera.fov).toFixed(3)}&survey=P%2FDSS2%2Fcolor`;
</script>

<div class="panel" id="hud-sky">
  <div class="label">Sky</div>
  <p class="hint">The sky as the surveys photographed it, under the catalogue. From the Sun the view
    direction is the sky direction, so the stars drawn here sit on their own images. Move the
    timeline off today and they drift away from the fixed photographs by their proper motion.</p>
  <button type="button" class="toggle" class:on={$camera.sky} role="switch" aria-checked={$camera.sky}
          onclick={() => api.skyView?.()}>
    <span class="tg-l">Telescope view</span><span class="sw" aria-hidden="true"></span></button>
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
  <p class="hint src">Tiles: CDS/HiPS (DSS2 © STScI/ROE/AAO/UKSTU, 2MASS/IPAC-Caltech, WISE/NASA-JPL, Pan-STARRS/IfA). Loaded on demand; nothing is stored.</p>
</div>
