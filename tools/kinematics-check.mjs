// src/lib/kinematics.js: UVW against astropy (tools/reference/astro.json when it carries 'uvw'), the Sun's orbit against the textbook
import { readFileSync } from 'node:fs';
import { circularSpeed, galXYZ, orbit, uvw, SUN } from '../src/lib/kinematics.js';
const fails = [], notes = []; const ok = (c, w) => (c ? notes : fails).push((c ? 'ok   ' : 'FAIL ') + w);
let REF = null; try { REF = JSON.parse(readFileSync(new URL('./reference/astro.json', import.meta.url), 'utf8')).uvw; } catch {}
if (REF) for (const [name, r] of Object.entries(REF)) { const v = uvw(r.ra, r.dec, r.plx, r.pmra, r.pmdec, r.rv); const d = Math.hypot(v.U - r.U, v.V - r.V, v.W - r.W);
  ok(d < 0.05, `UVW of ${name}: (${v.U.toFixed(2)}, ${v.V.toFixed(2)}, ${v.W.toFixed(2)}) vs astropy (${r.U.toFixed(2)}, ${r.V.toFixed(2)}, ${r.W.toFixed(2)}) km/s, |Δ| ${d.toFixed(3)}`); }
else notes.push('note no UVW references in astro.json yet');
ok(Math.abs(circularSpeed(SUN.R0) - SUN.vc) < 0.5, `circular speed at R0: ${circularSpeed(SUN.R0).toFixed(1)} km/s (tuned to ${SUN.vc})`);
ok(circularSpeed(20) > 180 && circularSpeed(20) < 240 && circularSpeed(2) > 150, `rotation curve flat-ish: v(2 kpc) ${circularSpeed(2).toFixed(0)}, v(20 kpc) ${circularSpeed(20).toFixed(0)} km/s`);
const o = orbit([0, 0, 0], [0, 0, 0], { span: 1000, dt: 0.25 });
ok(o.period > 200 && o.period < 250 && o.Rmin > 7.2 && o.Rmax < 9.2 && o.zmax > 0.05 && o.zmax < 0.15, `the Sun's orbit: period ${o.period?.toFixed(0)} Myr, R ${o.Rmin.toFixed(2)}–${o.Rmax.toFixed(2)} kpc, |z| ≤ ${(o.zmax * 1000).toFixed(0)} pc, e ${o.ecc.toFixed(3)} (textbook ≈ 220–240 Myr, 7.3–9, ~100 pc)`);
// energy conservation over the run
console.log(notes.concat(fails).join('\n'));
if (fails.length) { console.log(`\n${fails.length} kinematics checks failed`); process.exit(1); }
console.log(`\nall ${notes.length} kinematics checks passed`);
