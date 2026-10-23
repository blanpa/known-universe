// Canvas labels: halo, priority queue, collision declutter.
import { ctx } from './canvas.js';
import { S } from './state.js';
import { H, W } from './view.js';
// ---- label pipeline: halo + priority declutter -------------------------------
// Every canvas label goes through ctx.fillText. Instead of painting immediately we
// queue it, then flush once per frame highest-priority-first, dropping any label whose
// box overlaps one already placed. Two consequences, both wanted: labels never bury each
// other in dense fields, and they all land on top of the geometry.
const _rawFillText = ctx.fillText.bind(ctx);
export const LBL = { q: [], on: true, prio: 50, grid: new Map(), cell: 48 };
const LBLW = new Map();                 // font+text -> measured width
// priority tiers — higher wins a collision. Set LBL.prio before a draw section.
export const P_HUD = 100, P_SEL = 92, P_SOLAR = 80, P_PROBE = 70, P_DEEP = 62,
      P_STAR = 52, P_SMALL = 40, P_GAL = 30, P_GRID = 14;
// The halo is eight 1-px-offset fills, not a strokeText: filled glyphs come from the
// glyph cache (a bitmap blit each), a stroked glyph is an outline path rasterised per
// frame — the difference is what makes ~80 labels affordable in a software canvas.
const HALO_DX = [1, -1, 0, 0, 1, 1, -1, -1], HALO_DY = [0, 0, 1, -1, 1, -1, 1, -1];
function _paint(s, x, y, mw, st) {
  ctx.font = st.f; ctx.textAlign = st.a; ctx.textBaseline = st.b;
  ctx.globalAlpha = st.g;
  ctx.fillStyle = 'rgba(5,7,14,0.6)';
  for (let k = 0; k < 8; k++) _rawFillText(s, x + HALO_DX[k], y + HALO_DY[k], mw);
  ctx.fillStyle = st.c;
  _rawFillText(s, x, y, mw);
}
ctx.fillText = (s, x, y, mw) => {
  if (!S.labels) return;                          // clean view: one switch kills all text
  const st = { f: ctx.font, c: ctx.fillStyle, a: ctx.textAlign, b: ctx.textBaseline, g: ctx.globalAlpha };
  if (!LBL.on) { _paint(s, x, y, mw, st); ctx.globalAlpha = st.g; return; }
  LBL.q.push({ s, x, y, mw, p: LBL.prio, st });
};
export function lblReset() { LBL.q.length = 0; LBL.grid.clear(); LBL.prio = P_STAR; }
// uniform-grid occupancy test — labels are small and clustered, so a hash beats an O(n²) sweep
function lblFits(x0, y0, x1, y1, place) {
  const c = LBL.cell;
  const gx0 = Math.floor(x0 / c), gx1 = Math.floor(x1 / c),
        gy0 = Math.floor(y0 / c), gy1 = Math.floor(y1 / c);
  for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
    const bucket = LBL.grid.get(gx * 8192 + gy); if (!bucket) continue;
    for (let i = 0; i < bucket.length; i++) { const b = bucket[i];
      if (x0 < b[2] && x1 > b[0] && y0 < b[3] && y1 > b[1]) return false; }
  }
  if (place) { const box = [x0, y0, x1, y1];
    for (let gx = gx0; gx <= gx1; gx++) for (let gy = gy0; gy <= gy1; gy++) {
      const k = gx * 8192 + gy; let bucket = LBL.grid.get(k);
      if (!bucket) LBL.grid.set(k, bucket = []); bucket.push(box); } }
  return true;
}
export function lblFlush() {
  if (!LBL.q.length) return;
  const q = LBL.q;
  // stable sort by priority, high first — draw order breaks ties inside a tier
  for (let i = 0; i < q.length; i++) q[i]._i = i;
  q.sort((a, b) => (b.p - a.p) || (a._i - b._i));
  const pf = ctx.font, pc = ctx.fillStyle, pa = ctx.textAlign, pb = ctx.textBaseline, pg = ctx.globalAlpha;
  for (let i = 0; i < q.length; i++) {
    const it = q[i], st = it.st;
    ctx.font = st.f;
    const fs = parseFloat(st.f) || 10;
    // measureText is the expensive part of decluttering and the same strings recur every
    // frame — cache by font+text, and bound the map so a time slider cannot grow it forever
    const mk = st.f + '\u0000' + it.s;
    let w = LBLW.get(mk);
    if (w === undefined) { if (LBLW.size > 4000) LBLW.clear();
      w = ctx.measureText(it.s).width; LBLW.set(mk, w); }
    if (it.mw !== undefined && w > it.mw) w = it.mw;
    let x0 = it.x;
    if (st.a === 'center') x0 = it.x - w / 2; else if (st.a === 'right' || st.a === 'end') x0 = it.x - w;
    let y0 = it.y - fs * 0.80, y1 = it.y + fs * 0.26;
    if (st.b === 'top' || st.b === 'hanging') { y0 = it.y; y1 = it.y + fs * 1.06; }
    else if (st.b === 'middle') { y0 = it.y - fs * 0.53; y1 = it.y + fs * 0.53; }
    // off-screen labels neither draw nor block anything on screen; a label that would
    // be sliced by the right edge is dropped rather than shown as a truncated word
    if (x0 > W || x0 + w < 0 || y0 > H || y1 < 0) continue;
    if (it.p < P_HUD && (x0 + w > W - 2 || x0 < -2)) continue;
    if (!lblFits(x0 - 1, y0 - 1, x0 + w + 1, y1 + 1, true) && it.p < P_HUD) continue;
    _paint(it.s, it.x, it.y, it.mw, st);
  }
  ctx.font = pf; ctx.fillStyle = pc; ctx.textAlign = pa; ctx.textBaseline = pb; ctx.globalAlpha = pg;
}
