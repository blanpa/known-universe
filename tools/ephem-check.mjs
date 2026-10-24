// The packed Horizons table (site/data/ephem.bin) interpolated at off-grid times against
// Horizons itself (tools/reference/ephem-samples.json). `node tools/ephem-check.mjs`
import { readFileSync } from 'node:fs';
import { ephemTable } from '../src/lib/ephem.js';
const root = new URL('..', import.meta.url);
const meta = JSON.parse(readFileSync(new URL('site/data/ephem.json', root), 'utf8')), bytes = readFileSync(new URL('site/data/ephem.bin', root));
const tab = ephemTable(meta, new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength));
const ref = JSON.parse(readFileSync(new URL('tools/reference/ephem-samples.json', root), 'utf8'));
const fails = [], notes = []; const AU_KM = 149597870.7;
for (const [name, rows] of Object.entries(ref.bodies)) {
  let worstKm = 0, worstAS = 0, n = 0;
  for (const [jd, x, y, z] of rows) { const p = tab.at(name, jd); if (!p) continue; n++;
    const dkm = Math.hypot(p[0] - x, p[1] - y, p[2] - z) * AU_KM; worstKm = Math.max(worstKm, dkm);
    // the error as seen from the Earth (planets) or from the Earth's centre (Moon): km across / distance
    const dist = name === 'Moon' || name === 'Earth' ? Math.hypot(x, y, z) : (() => { const e = tab.at('Earth', jd); return e ? Math.hypot(x - e[0], y - e[1], z - e[2]) : 1; })();   // the Earth itself: as seen from the Sun
    worstAS = Math.max(worstAS, dkm / (dist * AU_KM) * 206265); }
  const tol = name === 'Moon' ? 1.0 : 0.1;
  (worstAS <= tol && n === rows.length ? notes : fails).push(`${worstAS <= tol && n === rows.length ? 'ok  ' : 'FAIL'} ${name.padEnd(8)} ${n}/${rows.length} samples · worst ${worstKm.toFixed(1)} km = ${worstAS.toFixed(4)}″ as seen from ${name === 'Earth' ? 'the Sun' : 'Earth'} (tolerance ${tol}″)`);
}
console.log(notes.concat(fails).join('\n'));
if (fails.length) { console.log(`\n${fails.length} ephemeris checks failed`); process.exit(1); }
console.log(`\nall ${notes.length} ephemeris checks passed (table ${meta.source}, fetched ${meta.fetched})`);
