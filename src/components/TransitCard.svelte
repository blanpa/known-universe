<script>
  // What a telescope sees: the host star's brightness as its planets cross it. Depth from
  // the planet's and star's radii, duration from the orbit; the dips sit where the transit
  // epochs put them — the same clock that places the planets on their orbits.
  import { transit } from '../lib/stores.js';
  const W = 300, H = 92, PAD = 26, HALF = 10;             // ±10 days around now
  let view = $derived.by(() => {
    const t = $transit; if (!t) return null;
    const dips = [];
    for (const p of t.planets) {
      if (!(p.per > 0 && p.t0 > 0 && p.depth > 0)) continue;
      const k0 = Math.floor((t.now - HALF - p.t0) / p.per), k1 = Math.ceil((t.now + HALF - p.t0) / p.per);
      for (let k = k0; k <= k1; k++) { const tc = p.t0 + k * p.per - t.now; if (Math.abs(tc) <= HALF + p.dur) dips.push({ n: p.n.replace(t.host, '').trim(), tc, dur: p.dur, ing: p.ing, depth: p.depth }); }
    }
    const maxDepth = Math.max(1e-5, ...dips.map(d => d.depth));
    const x = d => PAD + (d + HALF) / (2 * HALF) * (W - 2 * PAD);
    const y = f => 8 + (1 - f) / maxDepth * (H - 30);
    // sample the light curve
    const pts = []; const N = 480;
    for (let i = 0; i <= N; i++) { const td = -HALF + i / N * 2 * HALF; let f = 1;
      for (const d of dips) { const a = Math.abs(td - d.tc), h = d.dur / 2;
        if (a < h) f -= d.depth * (a > h - d.ing ? (h - a) / d.ing : 1); }
      pts.push(`${x(td).toFixed(1)},${y(f).toFixed(1)}`); }
    const inWin = dips.filter(d => Math.abs(d.tc) <= HALF);
    const labels = inWin.length <= 12 ? inWin.map(d => ({ n: d.n, x: x(d.tc), y: y(1 - d.depth) + 10 })) : [];
    const pct = maxDepth >= 0.001 ? (maxDepth * 100).toFixed(2) + ' %' : Math.round(maxDepth * 1e6) + ' ppm';
    return { pts: pts.join(' '), labels, pct, x, y, n: dips.length, rstar: t.rstar };
  });
</script>

{#if view}
  <section class="panel tcard" aria-label="Transit light curve">
    <div class="label">What a telescope sees</div>
    <svg viewBox="0 0 {W} {H}" width="100%" role="img" aria-label="Brightness of the star over twenty days">
      <line x1={view.x(0)} y1="4" x2={view.x(0)} y2={H - 16} class="tc-now" />
      <line x1={PAD} y1={view.y(1)} x2={W - PAD} y2={view.y(1)} class="tc-base" />
      <polyline points={view.pts} class="tc-curve" />
      {#each view.labels as l (l.n + l.x)}<text x={l.x} y={l.y} class="tc-pl">{l.n}</text>{/each}
      <text x={PAD} y={H - 4} class="tc-ax">−10 d</text>
      <text x={view.x(0)} y={H - 4} class="tc-ax" text-anchor="middle">now</text>
      <text x={W - PAD} y={H - 4} class="tc-ax" text-anchor="end">+10 d</text>
      <text x={W - PAD} y="12" class="tc-ax" text-anchor="end">dip {view.pct}</text>
    </svg>
    <div class="hint">{view.n ? `${view.n} transit${view.n === 1 ? '' : 's'} in these 20 days` : 'no transit in these 20 days'} · star {view.rstar.toFixed(2)} R☉ · depth = (R planet / R star)²</div>
  </section>
{/if}
