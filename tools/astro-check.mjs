// The app's astrometry (src/lib/astro.js) against astropy/ERFA reference values
// (tools/reference/astro.json from pipeline/make_reference.py). Exit 1 when a tolerance
// is exceeded. `node tools/astro-check.mjs`
import { readFileSync } from 'node:fs';
import { aberrate, altaz, biasMatrix, apparentOf, apply, dateOfICRS, earthVelocity, era, gast, gmst, icrsToDateMatrix, meanObliquity, nutation, precessionMatrix, radec, sunApparentDir, vec, J2000 } from '../src/lib/astro.js';
import { ephemTable, planetApparent } from '../src/lib/ephem.js';
const REF = JSON.parse(readFileSync(new URL('./reference/astro.json', import.meta.url), 'utf8'));
const EPH = (() => { try { const m = JSON.parse(readFileSync(new URL('../site/data/ephem.json', import.meta.url), 'utf8')), b = readFileSync(new URL('../site/data/ephem.bin', import.meta.url)); return ephemTable(m, new Uint8Array(b.buffer, b.byteOffset, b.byteLength)); } catch { return null; } })();
const R2D = 180 / Math.PI, fails = [], notes = [];
const sepAS = (a, b) => { const x = vec(a[0], a[1]), y = vec(b[0], b[1]); return 2 * Math.asin(Math.min(1, Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]) / 2)) * R2D * 3600; };
const ok = (cond, what) => (cond ? notes : fails).push((cond ? 'ok   ' : 'FAIL ') + what);
const worst = {};
const note = (k, v) => { worst[k] = Math.max(worst[k] || 0, v); };
for (const d of REF.dates) {
  const jd = d.jd_utc, jdTT = d.jd_tt, T = (jdTT - J2000) / 36525;
  const n = nutation(T); note('nutation dψ (vs 2000B) ″', Math.abs(n.dpsi * R2D * 3600 - d.nut00b.dpsi_arcsec)); note('nutation dε (vs 2000B) ″', Math.abs(n.deps * R2D * 3600 - d.nut00b.deps_arcsec));
  note('mean obliquity ″', Math.abs(meanObliquity(T) * R2D * 3600 - d.obl06_arcsec));
  for (const [n2, s] of Object.entries(REF.stars)) {
    const v = vec(s[0], s[1]);
    const pP = radec(apply(precessionMatrix(T), apply(biasMatrix(), v))), pR = radec(apply(d.pmat06, v)); note('bias+precession (vs pmat06) ″', sepAS(pP, pR));   // ERFA's pmat06 includes the frame bias
    const pN = radec(apply(icrsToDateMatrix(jdTT), v)), pRN = radec(apply(d.pnm06a, v)); note('bias+precession+nutation (vs pnm06a) ″', sepAS(pN, pRN));
    const ap = radec(apparentOf(v, jd)); note('apparent place (vs astropy TETE) ″', sepAS(ap, [d.stars[n2].tete.ra, d.stars[n2].tete.dec]));
    const ab = radec(aberrate(v, earthVelocity(jdTT))); note('aberration (vs astropy GCRS) ″', sepAS(ab, [d.stars[n2].gcrs.ra, d.stars[n2].gcrs.dec]));
    for (const [sn, site] of Object.entries(REF.sites)) { const a = altaz(ap[0], ap[1], jd, site[0], site[1]), r = d.stars[n2].altaz[sn];
      const dAlt = Math.abs(a.alt - r.alt) * 3600, dAz = Math.abs(((a.az - r.az + 540) % 360) - 180) * 3600 * Math.cos(r.alt / R2D); note('alt/az (vs astropy, no refraction) ″', Math.hypot(dAlt, dAz)); }
  }
  note('ERA ″', Math.abs(era(jd) * R2D - d.era_deg) * 3600); note('GMST ″', Math.abs(gmst(jd) * R2D - d.gmst_deg) * 3600); note('GAST ″', Math.abs(gast(jd) * R2D - d.gast_deg) * 3600);
  const su = radec(sunApparentDir(jdTT)); note('Sun apparent (vs astropy TETE) ″', sepAS(su, [d.sun_tete.ra, d.sun_tete.dec]));
  if (EPH && d.planets) for (const [name, r] of Object.entries(d.planets)) { if (r.error) continue; const a = planetApparent(EPH, name, jd); if (!a) continue;
    note(`${name === 'Moon' ? 'Moon' : 'planets'} apparent (table vs astropy ${d.planet_ephemeris}) ″`, sepAS(radec(a.dir), [r.ra, r.dec])); }
}
// sidereal time and alt/az are compared without ΔUT1 (UT1 − UTC, up to 0.9 s = 13.5″ of hour angle; the
// app takes UT1 = UTC): the tolerance is that, not the maths
const TOL = { 'nutation dψ (vs 2000B) ″': 0.12, 'nutation dε (vs 2000B) ″': 0.05, 'mean obliquity ″': 0.001, 'bias+precession (vs pmat06) ″': 0.002, 'bias+precession+nutation (vs pnm06a) ″': 0.15,
  'apparent place (vs astropy TETE) ″': 0.1, 'aberration (vs astropy GCRS) ″': 0.05, 'alt/az (vs astropy, no refraction) ″': 14, 'ERA ″': 14, 'GMST ″': 14, 'GAST ″': 14, 'Sun apparent (vs astropy TETE) ″': 40,
  'planets apparent (table vs astropy de440s) ″': 0.3, 'Moon apparent (table vs astropy de440s) ″': 1.0, 'planets apparent (table vs astropy builtin) ″': 3, 'Moon apparent (table vs astropy builtin) ″': 10 };
for (const [k, v] of Object.entries(worst)) ok(v <= TOL[k], `${k}: worst ${v.toFixed(4)} (tolerance ${TOL[k]})`);
console.log(notes.concat(fails).join('\n'));
if (fails.length) { console.log(`\n${fails.length} astrometry checks failed`); process.exit(1); }
console.log(`\nall ${notes.length} astrometry checks passed over ${REF.dates.length} dates, ${Object.keys(REF.stars).length} stars, ${Object.keys(REF.sites).length} sites`);
