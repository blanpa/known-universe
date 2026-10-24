// src/lib/periodogram.js on synthetic series: a sinusoid with gaps and noise, and a box transit. `node tools/periodogram-check.mjs`
import { bestPeak, bls, lombScargle, fold, binned } from '../src/lib/periodogram.js';
let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());
const fails = [], notes = []; const ok = (c, w) => (c ? notes : fails).push((c ? 'ok   ' : 'FAIL ') + w);
// 1. a 3.7-day sinusoid, 27 days at 10-minute cadence with a 2-day gap, amplitude 1 %, noise 0.5 %
const t = [], y = []; const P = 3.7;
for (let x = 0; x < 27; x += 1 / 144) { if (x > 12 && x < 14) continue; t.push(x); y.push(1 + 0.01 * Math.sin(2 * Math.PI * x / P + 0.4) + 0.005 * gauss()); }
const ls = lombScargle(t, y, { fmin: 1 / 27, fmax: 20 }); const pk = bestPeak(ls.f, ls.p);
ok(Math.abs(pk.period - P) / P < 0.01, `Lomb–Scargle recovers a 3.7 d sinusoid: ${pk.period.toFixed(4)} d, power ${pk.power.toFixed(3)} (${ls.n} frequencies, ${t.length} points)`);
// 2. a transit: period 2.15 d, duration 3 h, depth 0.8 %, same cadence, noise 0.2 %
const t2 = [], y2 = []; const P2 = 2.15, dur = 3 / 24, dep = 0.008, t0 = 0.63;
for (let x = 0; x < 27; x += 1 / 144) { const ph = ((x - t0) / P2) % 1; const inT = ph < dur / P2 / 2 || ph > 1 - dur / P2 / 2; t2.push(x); y2.push(1 - (inT ? dep : 0) + 0.002 * gauss()); }
const b = bls(t2, y2, { pmin: 0.5, pmax: 13 });
ok(b && Math.abs(b.period - P2) / P2 < 0.005 && Math.abs(b.depth - dep) / dep < 0.3, `BLS finds the transit: P ${b?.period.toFixed(4)} d (true ${P2}), depth ${(b?.depth * 100).toFixed(2)} % (true ${dep * 100}), duration ${(b?.duration * 24).toFixed(1)} h (true 3)`);
const ph = fold(t2, y2, b.period, b.t0 + b.duration / 2), bn = binned(ph, y2, 50); const minB = Math.min(...bn.filter(v => v === v));
ok(1 - minB > dep * 0.6, `folded and binned at the BLS period the transit dips ${((1 - minB) * 100).toFixed(2)} %`);
// 3. no signal → low power
const y3 = y.map(() => 1 + 0.005 * gauss()); const pk3 = bestPeak(lombScargle(t, y3, { fmin: 1 / 27, fmax: 20 }).f, lombScargle(t, y3, { fmin: 1 / 27, fmax: 20 }).p);
ok(pk3.power < 0.02, `pure noise: top power ${pk3.power.toFixed(4)} (a real 1 % signal gave ${pk.power.toFixed(3)})`);
console.log(notes.concat(fails).join('\n'));
if (fails.length) { console.log(`\n${fails.length} periodogram checks failed`); process.exit(1); }
console.log(`\nall ${notes.length} periodogram checks passed`);
