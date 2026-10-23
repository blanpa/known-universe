<script>
  // Top-down schematic of the Milky Way: spiral arms, bar, Sgr A*, "you are here".
  // A picture, not data — so the component draws it itself.
  import { onMount } from 'svelte';
  let { collapsible = true } = $props();
  let cv;
  onMount(() => {
    const W2 = 198, H2 = 150, cx = W2 / 2, cy = H2 * 0.54, Rd = 68, dpr = window.devicePixelRatio || 1;
    cv.width = W2 * dpr; cv.height = H2 * dpr;
    const g = cv.getContext('2d'); if (!g) return;   // no canvas in the mount test
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.save(); g.translate(cx, cy); g.scale(1, 0.62);
    g.fillStyle = 'rgba(90,110,175,0.07)'; g.beginPath(); g.arc(0, 0, Rd, 0, 6.2832); g.fill();
    for (let a = 0; a < 4; a++) {
      g.beginPath();
      for (let i = 0; i <= 130; i++) { const th = i / 130 * 3.7, r = 7 * Math.exp(0.24 * th);
        if (r > Rd) break; const ang = th + a * Math.PI / 2, x = Math.cos(ang) * r, y = Math.sin(ang) * r;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y); }
      g.strokeStyle = 'rgba(150,180,240,0.32)'; g.lineWidth = 3.4; g.stroke();
    }
    g.rotate(0.5); g.fillStyle = 'rgba(255,222,150,0.5)';
    g.beginPath(); g.ellipse(0, 0, 24, 10, 0, 0, 6.2832); g.fill(); g.restore();
    g.beginPath(); g.arc(cx, cy, 3, 0, 6.2832); g.fillStyle = '#0a0a12'; g.fill();
    g.strokeStyle = 'rgba(255,205,130,0.95)'; g.lineWidth = 1; g.stroke();
    g.font = '9px ui-monospace,monospace'; g.fillStyle = 'rgba(255,205,150,0.9)'; g.fillText('Sgr A*', cx + 5, cy - 3);
    const sr = Rd * 0.52, sa = -0.85, sx = cx + Math.cos(sa) * sr, sy = cy + Math.sin(sa) * sr * 0.62;
    g.beginPath(); g.arc(sx, sy, 3, 0, 6.2832); g.fillStyle = '#eafffb'; g.fill();
    g.fillStyle = 'rgba(233,237,250,0.9)'; g.fillText('Sun', sx + 5, sy + 3);
  });
</script>

<div class="panel" id="hud-mwmap">
  <div class="label">Milky Way · top-down</div>
  <canvas bind:this={cv} style="width:198px;height:150px;display:block"
          aria-label="Schematic top-down map of the Milky Way with the Sun marked"></canvas>
  <div class="mwcap">Schematic · ~100,000 light-years across</div>
</div>
