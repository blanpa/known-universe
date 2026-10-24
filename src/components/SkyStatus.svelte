<script>
  // The telescope's status line: the sky position under the pointer, the field, the plate
  // scale, the epoch and the frame — what a chart or a FITS header would say.
  import { camera, skyCursor } from '../lib/stores.js';
  const hms = ra => { ra = ((ra % 360) + 360) % 360; const h = ra / 15, hh = Math.floor(h), m = (h - hh) * 60, mm = Math.floor(m), s = (m - mm) * 60;
    return `${String(hh).padStart(2, '0')}h${String(mm).padStart(2, '0')}m${s.toFixed(1).padStart(4, '0')}s`; };
  const dms = d => { const sg = d < 0 ? '−' : '+', a = Math.abs(d), dd = Math.floor(a), m = (a - dd) * 60, mm = Math.floor(m), s = (m - mm) * 60;
    return `${sg}${String(dd).padStart(2, '0')}°${String(mm).padStart(2, '0')}′${s.toFixed(0).padStart(2, '0')}″`; };
  const fovText = f => f >= 1 ? `${f.toFixed(f < 10 ? 2 : 1)}°` : f >= 1 / 60 ? `${(f * 60).toFixed(2)}′` : `${(f * 3600).toFixed(1)}″`;
  const scaleText = s => s >= 60 ? `${(s / 60).toFixed(2)}′/px` : `${s.toFixed(s < 1 ? 3 : 2)}″/px`;
</script>

{#if $camera.sky}
  <div id="skystatus" class="mono" aria-live="off">
    {#if $skyCursor}
      <span class="ss-k">Cursor</span>
      {#if $camera.frame === 'date'}
        <span>α {hms($skyCursor.raDate ?? $skyCursor.ra)}</span><span>δ {dms($skyCursor.decDate ?? $skyCursor.dec)}</span>
      {:else}
        <span>α {hms($skyCursor.ra)}</span><span>δ {dms($skyCursor.dec)}</span>
      {/if}
      <span class="ss-dim">l {$skyCursor.l.toFixed(3)}° b {$skyCursor.b >= 0 ? '+' : '−'}{Math.abs($skyCursor.b).toFixed(3)}°</span>
      {#if $camera.obs && $skyCursor.alt !== undefined}
        <span class="ss-dim" class:ss-down={$skyCursor.alt < 0}>alt {$skyCursor.alt.toFixed(1)}° az {$skyCursor.az.toFixed(1)}°{$skyCursor.alt > 0 ? ` X ${$skyCursor.airmass.toFixed(2)}` : ' · below the horizon'}</span>
      {/if}
      <span class="ss-sep" aria-hidden="true"></span>
    {/if}
    <span class="ss-k">Field</span>
    <span>{fovText($camera.fov)}</span><span>{scaleText($camera.pxScale)}</span>
    {#if $camera.obs && $camera.alt !== null && $camera.alt !== undefined}
      <span class="ss-dim" class:ss-down={$camera.alt < 0}>alt {$camera.alt.toFixed(1)}° az {$camera.az.toFixed(1)}°{$camera.alt > 0 ? ` · airmass ${$camera.airmass.toFixed(2)}` : ' · below the horizon'}</span>
    {/if}
    <span class="ss-sep" aria-hidden="true"></span>
    <span class="ss-k">Epoch</span><span>J{$camera.epoch.toFixed(2)}</span>
    <span class="ss-dim">{$camera.frame === 'date' ? 'apparent · true equator & equinox of date' : 'ICRS · J2000 axes'}{$camera.skyFrom ? ` · from ${$camera.skyFrom}` : $camera.obs ? ` · ${$camera.obsName}` : ' · from the Sun'}</span>
  </div>
{/if}
