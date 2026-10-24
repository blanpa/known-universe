<script>
  // Analysis: the archive's light curves for the pinned star, with a period search and a transit
  // search; later sections hold the field diagrams and the kinematics. Plots are plain canvases.
  import { api } from '../lib/api.js';
  import { camera, fielddiag, kinematics, lightcurve, selection } from '../lib/stores.js';
  import Icon from './Icon.svelte';
  let lcEl = $state(null), pgEl = $state(null), foldEl = $state(null);
  const W = 300, H = 120;
  function axes(c, w, h) { c.clearRect(0, 0, w, h); c.fillStyle = '#0b0e16'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 1; c.strokeRect(0.5, 0.5, w - 1, h - 1); }
  function plotLc() { if (!lcEl || !$lightcurve.data) return; const s = api.lcSamples?.(); if (!s || !s.t.length) return;
    const c = lcEl.getContext('2d'), dpr = devicePixelRatio || 1; lcEl.width = W * dpr; lcEl.height = H * dpr; c.scale(dpr, dpr); axes(c, W, H);
    const t0 = s.t[0], t1 = s.t[s.t.length - 1]; const ys = s.y.slice().sort((a, b) => a - b), lo = ys[Math.floor(ys.length * 0.005)], hi = ys[Math.floor(ys.length * 0.995)], span = (hi - lo) || 1e-4;
    c.fillStyle = 'rgba(79,214,200,0.75)'; for (let i = 0; i < s.t.length; i++) { const x = 4 + (s.t[i] - t0) / ((t1 - t0) || 1) * (W - 8), y = H - 6 - (s.y[i] - lo) / span * (H - 12); c.fillRect(x, y, 1.2, 1.2); }
    c.fillStyle = 'rgba(233,237,250,0.6)'; c.font = '9px ui-monospace,monospace'; c.fillText(`${(t1 - t0).toFixed(1)} d`, W - 34, H - 8); c.fillText(`±${((hi - lo) / 2 * 100).toFixed(2)} %`, 4, 10); }
  function plotPg() { const a = $lightcurve.analysis; if (!pgEl || !a?.pg) return;
    const c = pgEl.getContext('2d'), dpr = devicePixelRatio || 1; pgEl.width = W * dpr; pgEl.height = H * dpr; c.scale(dpr, dpr); axes(c, W, H);
    const f = a.pg.f, p = a.pg.p, fmin = Math.log10(f[0]), fmax = Math.log10(f[f.length - 1]), pmax = Math.max(...p) || 1;
    c.strokeStyle = 'rgba(79,214,200,0.9)'; c.beginPath(); for (let i = 0; i < f.length; i++) { const x = 4 + (Math.log10(f[i]) - fmin) / ((fmax - fmin) || 1) * (W - 8), y = H - 6 - p[i] / pmax * (H - 14); if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
    if (a.blsSr) { const q = a.blsSr.periods.map(v => 1 / v), s = a.blsSr.sr, smax = Math.max(...s) || 1; c.strokeStyle = 'rgba(255,207,107,0.8)'; c.beginPath();
      for (let i = 0; i < q.length; i++) { const x = 4 + (Math.log10(q[i]) - fmin) / ((fmax - fmin) || 1) * (W - 8), y = H - 6 - s[i] / smax * (H - 14); if (x < 4 || x > W - 4) continue; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); }
    c.fillStyle = 'rgba(233,237,250,0.6)'; c.font = '9px ui-monospace,monospace'; c.fillText(`${(1 / f[0]).toFixed(1)} d`, 4, H - 8); c.fillText(`${(1 / f[f.length - 1]).toFixed(2)} d`, W - 40, H - 8); c.fillText('Lomb–Scargle · BLS', 4, 10); }
  function plotFold() { const a = $lightcurve.analysis; if (!foldEl || !a?.fold) return;
    const c = foldEl.getContext('2d'), dpr = devicePixelRatio || 1; foldEl.width = W * dpr; foldEl.height = H * dpr; c.scale(dpr, dpr); axes(c, W, H);
    const b = a.fold.bins.filter(v => v === v), lo = Math.min(...b), hi = Math.max(...b), span = (hi - lo) || 1e-4;
    c.strokeStyle = 'rgba(255,207,107,0.95)'; c.beginPath(); let started = false;
    for (let i = 0; i < a.fold.bins.length; i++) { const v = a.fold.bins[i]; if (v !== v) continue; const x = 4 + (i + 0.5) / a.fold.bins.length * (W - 8), y = H - 6 - (v - lo) / span * (H - 14); if (started) c.lineTo(x, y); else c.moveTo(x, y); started = true; } c.stroke();
    c.fillStyle = 'rgba(233,237,250,0.6)'; c.font = '9px ui-monospace,monospace'; c.fillText(`folded at ${a.bls.period.toFixed(4)} d · transit centred`, 4, 10); c.fillText(`${((hi - lo) * 100).toFixed(3)} %`, W - 46, H - 8); }
  $effect(() => { $lightcurve.data; plotLc(); });
  $effect(() => { $lightcurve.analysis; plotPg(); plotFold(); });
  const fmtFap = v => v === undefined ? '' : v < 1e-4 ? v.toExponential(1) : v.toFixed(3);
  // field diagrams
  let cmdEl = $state(null), vpdEl = $state(null); let drag = null;
  const VR = { pr0: -150, pr1: 150, pd0: -150, pd1: 150 };          // VPD axes, mas/yr
  const vx = v => 4 + (v - VR.pr0) / (VR.pr1 - VR.pr0) * (W - 8), vy = v => H - 6 - (v - VR.pd0) / (VR.pd1 - VR.pd0) * (H - 12);
  function plotCmd() { const f = $fielddiag; if (!cmdEl) return; const c = cmdEl.getContext('2d'), dpr = devicePixelRatio || 1; cmdEl.width = W * dpr; cmdEl.height = H * 1.4 * dpr; c.scale(dpr, dpr); axes(c, W, H * 1.4);
    const x0 = -0.5, x1 = 4, y0 = 16, y1 = -4; const px = v => 4 + (v - x0) / (x1 - x0) * (W - 8), py = v => 4 + (v - y0) / (y1 - y0) * (H * 1.4 - 8);
    c.fillStyle = 'rgba(79,214,200,0.45)'; for (const [b, m] of f.cmd) c.fillRect(px(b), py(m), 1.2, 1.2);
    if (f.memberCmd) { c.fillStyle = 'rgba(196,170,255,0.95)'; for (const [b, m] of f.memberCmd) c.fillRect(px(b) - 1, py(m) - 1, 2.4, 2.4); }
    c.fillStyle = 'rgba(233,237,250,0.6)'; c.font = '9px ui-monospace,monospace'; c.fillText('M_G', 4, 10); c.fillText('BP−RP →', W - 50, H * 1.4 - 6); c.fillText(`${y0}`, 4, H * 1.4 - 6); c.fillText(`${y1}`, 4, 20); }
  function plotVpd() { const f = $fielddiag; if (!vpdEl) return; const c = vpdEl.getContext('2d'), dpr = devicePixelRatio || 1; vpdEl.width = W * dpr; vpdEl.height = H * 1.4 * dpr; c.scale(dpr, dpr); axes(c, W, H * 1.4);
    const vy2 = v => H * 1.4 - 6 - (v - VR.pd0) / (VR.pd1 - VR.pd0) * (H * 1.4 - 12);
    c.strokeStyle = 'rgba(255,255,255,0.1)'; c.beginPath(); c.moveTo(vx(0), 4); c.lineTo(vx(0), H * 1.4 - 4); c.moveTo(4, vy2(0)); c.lineTo(W - 4, vy2(0)); c.stroke();
    c.fillStyle = 'rgba(79,214,200,0.45)'; for (const [a, b] of f.vpd) { if (a < VR.pr0 || a > VR.pr1 || b < VR.pd0 || b > VR.pd1) continue; c.fillRect(vx(a), vy2(b), 1.2, 1.2); }
    if (f.box) { c.strokeStyle = 'rgba(196,170,255,0.95)'; c.strokeRect(vx(f.box.pr0), vy2(f.box.pd1), vx(f.box.pr1) - vx(f.box.pr0), vy2(f.box.pd0) - vy2(f.box.pd1)); }
    c.fillStyle = 'rgba(233,237,250,0.6)'; c.font = '9px ui-monospace,monospace'; c.fillText('μδ ↑  mas/yr', 4, 10); c.fillText('μα* →', W - 36, H * 1.4 - 6); c.fillText(`±${VR.pr1}`, W - 30, 10); }
  function vpdPos(e) { const r = vpdEl.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * (H * 1.4);
    return { pr: VR.pr0 + (x - 4) / (W - 8) * (VR.pr1 - VR.pr0), pd: VR.pd0 + (H * 1.4 - 6 - y) / (H * 1.4 - 12) * (VR.pd1 - VR.pd0) }; }
  function vpdDown(e) { drag = vpdPos(e); e.preventDefault(); }
  function vpdUp(e) { if (!drag) return; const b = vpdPos(e); const box = { pr0: Math.min(drag.pr, b.pr), pr1: Math.max(drag.pr, b.pr), pd0: Math.min(drag.pd, b.pd), pd1: Math.max(drag.pd, b.pd) }; drag = null;
    if (box.pr1 - box.pr0 < 2 && box.pd1 - box.pd0 < 2) api.selectBox?.(null); else api.selectBox?.(box); }
  $effect(() => { $fielddiag; plotCmd(); plotVpd(); });
</script>

<div class="panel" id="hud-analysis">
  <div class="label">Analysis</div>
  <div class="label lg-sub">Light curve</div>
  <p class="hint">TESS (2-minute SPOC) and Kepler light curves for the pinned star, straight from MAST and the public STScI bucket
    into this page: PDCSAP flux, quality 0, normalised per file. Lomb–Scargle finds periodic signals, a box search finds transits;
    the fold shows the transit at the BLS period.</p>
  <div class="sky-fov">
    <button type="button" class="chip" disabled={!$selection || !!$lightcurve.busy} onclick={() => api.lcSearch?.()}><Icon name="search" size={12} />Find light curves of {$selection?.card?.title ?? 'the pinned object'}</button>
  </div>
  {#if $lightcurve.msg}<p class="hint" class:busy={!!$lightcurve.busy}>{$lightcurve.msg}</p>{/if}
  {#if $lightcurve.obs.length}
    <div class="sky-fov lc-obs">
      {#each $lightcurve.obs as ob, k (ob.obsid)}
        <button type="button" class="chip" class:on={$lightcurve.data && $lightcurve.data.mission === ob.mission && $lightcurve.data.sector === ob.sector} disabled={!!$lightcurve.busy} onclick={() => api.lcLoad?.(k)}>{ob.mission}{ob.sector ? ` s${ob.sector}` : ' · all quarters'}{ob.days ? ` · ${ob.days.toFixed(0)} d` : ''}</button>
      {/each}
    </div>
  {/if}
  {#if $lightcurve.data}
    <canvas class="lc-plot" bind:this={lcEl} width={W} height={H} style="width:{W}px;height:{H}px"></canvas>
    <div class="sky-fov">
      <button type="button" class="chip" disabled={!!$lightcurve.busy} onclick={() => api.lcAnalyse?.()}>Search periods and transits</button>
      <button type="button" class="chip" onclick={() => api.lcExport?.()}>CSV</button>
    </div>
    {#if $lightcurve.analysis}
      <canvas class="lc-plot" bind:this={pgEl} width={W} height={H} style="width:{W}px;height:{H}px"></canvas>
      <div class="sky-ro mono lc-res">
        {#if $lightcurve.analysis.ls}<span>LS {$lightcurve.analysis.ls.period.toFixed(4)} d</span><span>power {$lightcurve.analysis.ls.power.toFixed(3)}</span><span>FAP {fmtFap($lightcurve.analysis.ls.fap)}</span>{/if}
      </div>
      {#if $lightcurve.analysis.bls}
        <div class="sky-ro mono lc-res"><span class="lc-bls">BLS {$lightcurve.analysis.bls.period.toFixed(4)} d</span><span>depth {($lightcurve.analysis.bls.depth * 100).toFixed(3)} %</span><span>{($lightcurve.analysis.bls.duration * 24).toFixed(1)} h</span><span>{$lightcurve.analysis.bls.nIn} pts in</span></div>
        <canvas class="lc-plot" bind:this={foldEl} width={W} height={H} style="width:{W}px;height:{H}px"></canvas>
        <p class="hint">A depth of d % means a radius ratio of √(d/100); a real transit repeats at every multiple of the period, is flat-bottomed and
          has the same depth at odd and even events. One sector proves nothing by itself: load another and the period must hold.</p>
      {/if}
    {/if}
  {/if}
  <div class="label lg-sub">Field diagrams</div>
  <p class="hint">The Gaia stars on screen as a colour–magnitude diagram (absolute G from the Bailer-Jones distance against BP−RP) and a
    vector-point diagram of proper motions. A cluster is a clump in the VPD and a sequence in the CMD: drag a box on the VPD to pick
    its members — they are ringed on the sky, drawn in the CMD, and can become a set to export or identify.</p>
  <div class="sky-fov">
    <button type="button" class="chip" disabled={!$camera.sky} onclick={() => api.scanField?.()}>Scan this field</button>
    {#if $fielddiag.members}<button type="button" class="chip" onclick={() => api.membersAsSet?.()}>Members → set ({$fielddiag.members})</button>
      <button type="button" class="chip" onclick={() => api.selectBox?.(null)}>Clear box</button>{/if}
  </div>
  {#if $fielddiag.msg}<p class="hint">{$fielddiag.msg}</p>{/if}
  {#if $fielddiag.n}
    <canvas class="lc-plot" bind:this={vpdEl} width={W} height={H * 1.4} style="width:{W}px;height:{H * 1.4}px;cursor:crosshair" onpointerdown={vpdDown} onpointerup={vpdUp}></canvas>
    {#if $fielddiag.members}<div class="sky-ro mono lc-res"><span>{$fielddiag.members} members</span><span>mean d {$fielddiag.meanD.toFixed(1)} pc</span><span>μ box {$fielddiag.box.pr0.toFixed(0)}…{$fielddiag.box.pr1.toFixed(0)} / {$fielddiag.box.pd0.toFixed(0)}…{$fielddiag.box.pd1.toFixed(0)}</span></div>{/if}
    <canvas class="lc-plot" bind:this={cmdEl} width={W} height={H * 1.4} style="width:{W}px;height:{H * 1.4}px"></canvas>
  {/if}

  <div class="label lg-sub">Kinematics</div>
  <p class="hint">U, V, W from parallax, proper motion and radial velocity (Johnson &amp; Soderblom 1987 in the Hipparcos Galactic frame,
    agrees with astropy to 1 m/s), and the star's orbit through the Galaxy for ±500 Myr in a disc + bulge + halo potential tuned
    to 232.8 km/s at the Sun (R₀ 8.122 kpc). The orbit is drawn on the map: dashed for the past, solid for the future.</p>
  <div class="sky-fov">
    <button type="button" class="chip" disabled={!$selection} onclick={() => api.kinematics?.()}>Orbit of {$selection?.card?.title ?? 'the pinned star'}</button>
    {#if $kinematics.star}<button type="button" class="chip" onclick={() => api.clearKinematics?.()}>Clear</button>{/if}
  </div>
  {#if $kinematics.msg}<p class="hint warn">{$kinematics.msg}</p>{/if}
  {#if $kinematics.star}
    <div class="sky-ro mono lc-res"><span>U {$kinematics.U.toFixed(1)}</span><span>V {$kinematics.V.toFixed(1)}</span><span>W {$kinematics.W.toFixed(1)} km/s</span><span>|v| {$kinematics.speed.toFixed(1)}</span></div>
    <div class="sky-ro mono lc-res"><span>R {$kinematics.Rmin.toFixed(2)}–{$kinematics.Rmax.toFixed(2)} kpc</span><span>|z| ≤ {($kinematics.zmax * 1000).toFixed(0)} pc</span><span>e {$kinematics.ecc.toFixed(3)}</span>{#if $kinematics.period}<span>period {$kinematics.period.toFixed(0)} Myr</span>{/if}</div>
    <p class="hint">The Sun on the same potential: R 8.0–9.2 kpc, |z| ≤ 110 pc, e 0.07, 228 Myr. A thick-disc or halo star shows in a large |z|, a large eccentricity, or a V far below the rotation.</p>
  {/if}
  <p class="hint src">MAST · STScI; TESS SPOC (Jenkins et al. 2016), Kepler (Borucki et al. 2010). Nothing is stored.</p>
</div>
