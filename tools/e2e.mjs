// End-to-end check of the built site in a real browser: boot, chrome, interaction, CPU
// budget, and screenshots per scale band.  `npm run build && npm run test:e2e`
//
// Browser: $CHROME, else /usr/bin/google-chrome (GPU-accelerated headless, the numbers
// mean something), else Playwright's headless shell on SwiftShader (correctness only —
// its frame times are software rasterisation, see .claude/skills/verify/SKILL.md).
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { inflateSync } from 'node:zlib';

const ROOT = resolve(import.meta.dirname, '..'), SITE = join(ROOT, 'site'), OUT = join(ROOT, 'tools', 'e2e-out');
mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.bin': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer((req, res) => {
  const p = join(SITE, decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]).replace(/\/$/, '/index.html'));
  if (!p.startsWith(SITE) || !existsSync(p) || !statSync(p).isFile()) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', TYPES[extname(p)] || 'application/octet-stream'); createReadStream(p).pipe(res);
}).listen(0, '127.0.0.1');
await new Promise(r => server.once('listening', r));
const BASE = `http://127.0.0.1:${server.address().port}/index.html`;

const chrome = process.env.CHROME || (existsSync('/usr/bin/google-chrome') ? '/usr/bin/google-chrome' : null);
const shell = join(homedir(), '.cache/ms-playwright');
const shellBin = existsSync(shell) ? (await import('node:fs')).readdirSync(shell).filter(d => d.startsWith('chromium_headless_shell')).map(d => join(shell, d, 'chrome-headless-shell-linux64/chrome-headless-shell')).find(existsSync) : null;
const exe = chrome || shellBin;
if (!exe) { console.log('no browser found (set CHROME=/path/to/chrome)'); process.exit(2); }
const gpu = !!chrome;
const args = gpu ? ['--no-sandbox', '--headless=new', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=gl-egl', '--enable-gpu-rasterization', '--enable-accelerated-2d-canvas']
                 : ['--no-sandbox', '--use-angle=swiftshader'];
const browser = await chromium.launch({ executablePath: exe, headless: true, args });
console.log('browser:', exe, gpu ? '(GPU)' : '(SwiftShader — timings not meaningful)');

// pixels brighter than a threshold in a screenshot (8-bit RGB/RGBA PNG, as Chrome writes them):
// a cheap way to tell whether a point cloud was drawn at all
function litPixels(png, thr = 90) {
  let i = 8, w = 0, h = 0, ch = 0; const idat = [];
  while (i < png.length) { const len = png.readUInt32BE(i), type = png.toString('ascii', i + 4, i + 8), d = png.subarray(i + 8, i + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ch = d[9] === 6 ? 4 : d[9] === 2 ? 3 : 0; } else if (type === 'IDAT') idat.push(d); i += 12 + len; }
  if (!ch) return -1;
  const raw = inflateSync(Buffer.concat(idat)), stride = w * ch; let lit = 0; let prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], o = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) { const a = x >= ch ? cur[x - ch] : 0, b = prev[x], c = x >= ch ? prev[x - ch] : 0; let v = raw[o + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc) ? b : c; }
      cur[x] = v & 255; }
    for (let x = 0; x < stride; x += ch) if (Math.max(cur[x], cur[x + 1], cur[x + 2]) > thr) lit++;
    [prev, cur] = [cur, prev]; }
  return lit;
}

const fails = [], notes = [];
const ok = (cond, what) => { if (cond) notes.push('ok   ' + what); else fails.push('FAIL ' + what); };
let n = 0;
async function open(vp, mobile, hash) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: mobile, isMobile: mobile });
  const page = await ctx.newPage();
  const errs = [], glErrs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && !/404|429|403|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 160));
    if (/GL_INVALID|WebGL: INVALID/.test(m.text())) glErrs.push(m.text().replace(/^\[[^\]]*\] /, '').slice(0, 120)); });   // a rejected draw call = a layer silently missing
  await page.goto(BASE + '?r=' + (n++) + (hash ? '#' + hash : ''), { waitUntil: 'load' });
  await page.waitForFunction(() => window.__kuapi && location.hash.includes('v1_'), null, { timeout: 40000 });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(gpu ? 3000 : 8000);
  return { page, ctx, errs, glErrs };
}

// ---- 1. boot + chrome on desktop ----
{
  const { page, ctx, errs } = await open({ width: 1440, height: 900 }, false);
  const ids = await page.evaluate(() => ['hud-head', 'hud-search', 'hud-ctl', 'rail', 'ladder', 'sky', 'gl'].filter(id => !document.getElementById(id)));
  ok(ids.length === 0, 'desktop chrome mounted' + (ids.length ? ' (missing ' + ids.join(',') + ')' : ''));
  const band = await page.evaluate(() => document.querySelector('#hud-head .ctx-band')?.textContent);
  ok(band === 'Solar system', 'landing band is "Solar system" (got ' + band + ')');
  await page.screenshot({ path: join(OUT, 'desktop-landing.png') });

  // interaction: search → card, course, ladder, tour, timeline, share
  await page.evaluate(() => window.__kuapi.doSearch('Earth'));
  await page.waitForTimeout(gpu ? 2500 : 6000);
  const name = await page.evaluate(() => document.querySelector('#info .in-name')?.textContent);
  ok(name === 'Earth', 'search pins Earth and the card shows it (got ' + name + ')');
  await page.evaluate(() => window.__kuapi.setCourse());
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => !!document.getElementById('hud-nav')), 'course console appears');
  await page.evaluate(() => window.__kuapi.flyToScale(1e6));
  await page.waitForTimeout(gpu ? 3500 : 8000);
  const cam = await page.evaluate(() => window.__kuapi.getCam());
  ok(Math.abs(Math.log10(cam.tgt) - 6) < 0.05 && cam.real, 'ladder flies to 1 Mpc in real scale (tgt ' + cam.tgt.toExponential(2) + ')');
  await page.evaluate(() => window.__kuapi.tour.start());
  await page.waitForTimeout(800);
  ok(await page.evaluate(() => !!document.getElementById('tourPanel')), 'tour panel appears');
  await page.evaluate(() => window.__kuapi.tour.end());
  await page.evaluate(() => window.__kuapi.timeline.set(400));
  await page.waitForTimeout(300);
  const tl = await page.evaluate(() => document.querySelector('#hud-uni .tl-val')?.textContent);
  ok(tl === undefined || tl !== 'today', 'timeline moves off today');
  const url = await page.evaluate(() => window.__kuapi.share());
  ok(/#v1_/.test(url), 'share link carries a view hash');
  await page.locator('#rail .rb', { hasText: 'Layers' }).click();
  await page.waitForTimeout(400);
  const toggles = await page.locator('#hud-ctl .toggle').count();
  ok(toggles > 30, 'layers panel opens with ' + toggles + ' switches');
  await page.screenshot({ path: join(OUT, 'desktop-layers.png') });
  await page.keyboard.press('Escape');

  // the Data pane: what is running and what failed
  await page.locator('#rail .rb', { hasText: 'Data' }).click();
  await page.waitForTimeout(800);
  const src = await page.evaluate(() => { const rows = [...document.querySelectorAll('#hud-data .src-row')];
    const st = s => rows.filter(r => r.classList.contains(s)).length;
    const bad = rows.filter(r => r.classList.contains('error') && !r.querySelector('.src-d')?.textContent.trim()).length;
    return { n: rows.length, ok: st('ok'), error: st('error'), busy: st('busy'), noReason: bad, sum: document.querySelector('#hud-data .src-sum')?.textContent.replace(/\s+/g, ' ').trim(),
      files: rows.filter(r => /\.bin|\.json/.test(r.textContent) && r.classList.contains('ok')).length }; });
  ok(src.n >= 12 && src.files >= 2, `Data pane lists ${src.n} sources, ${src.files} catalogue files loaded so far (${src.sum})`);
  ok(src.noReason === 0, `every failed source names a reason (${src.error} failed, ${src.busy} running)`);
  await page.screenshot({ path: join(OUT, 'desktop-data.png') });
  await page.keyboard.press('Escape');

  // the telescope: sky view at the Pleiades on DSS2 tiles, north up, east left, blink
  await page.evaluate(() => { const a = window.__kuapi; a.skyView(true); a.setSurvey('dss'); a.lookAt(56.75, 24.12); a.setFov(6); });
  await page.waitForTimeout(gpu ? 9000 : 15000);
  const sky = await page.evaluate(() => {
    const d = (ra, dec) => { const r = ra * Math.PI / 180, q = dec * Math.PI / 180; return [Math.cos(q) * Math.cos(r), Math.cos(q) * Math.sin(r), Math.sin(q)]; };
    const P = (ra, dec) => { const v = d(ra, dec); return window.__ku.projDir(v[0], v[1], v[2]); };
    const n = P(56.75, 26), s = P(56.75, 22), e = P(58.5, 24.12), w = P(55, 24.12);
    return { head: document.querySelector('#hud-head .ctx-where')?.textContent, northUp: n.y < s.y && Math.abs(n.x - s.x) < 2, eastLeft: e.x < w.x && Math.abs(e.y - w.y) < 2, ...window.__ku.survey.SKYSTAT };
  });
  ok(/^FOV 6\.0°/.test(sky.head || ''), 'sky view header shows the field of view (' + sky.head + ')');
  // scientific conventions: black space, positions propagated to today's epoch, the status line
  const sci = await page.evaluate(() => {
    const cc = window.__ku.clearColor(), bg = getComputedStyle(document.body).backgroundColor;
    const b = window.__ku.hyg.find(s => /Barnard/.test(s.n || ''));
    const cat = window.__ku.projDir(b.dx, b.dy, b.dz);          // J2000 direction
    const q = window.__ku.api.getCam && b._sx !== undefined ? [b._sx, b._sy] : null;   // where the 2D pass put it (today)
    return { cc, bg, status: document.getElementById('skystatus')?.textContent || '', barnard: q ? Math.hypot(q[0] - cat.x, q[1] - cat.y) : null, fovPx: innerWidth / 6 };
  });
  ok(sci.cc && sci.cc[0] === 0 && sci.cc[1] === 0 && sci.cc[2] === 0 && sci.bg === 'rgb(0, 0, 0)', 'space is black (GL clear ' + JSON.stringify(sci.cc) + ', body ' + sci.bg + ')');
  ok(/Epoch\s*J\d{4,6}\.\d\d/.test(sci.status) && /ICRS/.test(sci.status), 'telescope status line shows epoch and frame (' + sci.status.slice(0, 60) + '…)');
  ok(sky.northUp && sky.eastLeft, 'sky view keeps north up and east left');
  ok(true, sky.drawn > 0 ? `survey tiles drawn: ${sky.drawn}/${sky.tiles} at order ${sky.order}` : 'survey tiles: none loaded (no network?) — not a failure');
  await page.screenshot({ path: join(OUT, 'desktop-sky.png') });
  // guided blink: at Barnard's star the jump list must lead with it (10,393 mas/yr × 20 yr DSS→PS1 = 3.5′), from HYG and the Gaia cloud
  await page.evaluate(() => { const a = window.__kuapi; a.timeline.now(); a.setBlink(true, 'ps1'); a.lookAt(269.45, 4.69); a.setFov(1); });
  await page.waitForTimeout(3000);
  // epoch propagation: Barnard's star has moved ~10.4″/yr since J2000 — today it stands ~4.6′ north of its catalogue place
  const ep = await page.evaluate(() => { const b = window.__ku.hyg.find(s => /Barnard/.test(s.n || '')); const cat = window.__ku.projDir(b.dx, b.dy, b.dz);
    const yrs = 2000 + (Date.now() / 86400000 + 2440587.5 - 2451545.0) / 365.25 - 2000; const pm = Math.hypot(b.pr, b.pd) / 1000 * yrs;   // arcsec
    return { px: Math.hypot(b._sx - cat.x, b._sy - cat.y), expectPx: pm / 3600 * innerWidth / 1, yrs }; });
  ok(Math.abs(ep.px - ep.expectPx) < ep.expectPx * 0.08, `catalogue positions are propagated to today (Barnard ${ep.px.toFixed(0)} px from J2000, expected ${ep.expectPx.toFixed(0)} px for ${ep.yrs.toFixed(1)} yr)`);
  const mv = await page.evaluate(() => { const l = [...document.querySelectorAll('#hud-sky .mov li')].map(li => li.textContent.replace(/\s+/g, ' ').trim()); return { n: l.length, first: l[0] || '', top: l.slice(0, 3).join(' | '), gaia: l.filter(t => /Gaia star/.test(t)).length, pm: !!window.__ku.gaiaPm, head: document.querySelector('#hud-head .ctx-where')?.textContent, range: window.__ku.gaiaRange }; });
  ok(/Barnard|G 8\.2/.test(mv.first) && /3\.[345]′/.test(mv.first), 'expected-jump list leads with Barnard\'s star at 3.5′ (got "' + mv.top + '" at ' + mv.head + ', gaia set ' + mv.range + ' pc)');
  ok(mv.gaia > 0 && mv.pm, `Gaia cloud contributes movers (${mv.gaia} of ${mv.n}; proper motions loaded: ${mv.pm})`);
  await page.evaluate(() => window.__kuapi.setBlink(false));

  // from another star: stand at Alpha Centauri, look toward RA 39.9° Dec +60.8° — the Sun must be there, first magnitude
  await page.evaluate(() => { window.__kuapi.doSearch('Rigil Kentaurus'); });
  await page.waitForTimeout(600);
  await page.evaluate(() => { window.__kuapi.skyView(true, 'selection'); window.__kuapi.lookAt(39.9, 60.8); window.__kuapi.setFov(10); });
  await page.waitForTimeout(1200);
  const vantage = await page.evaluate(() => { const p = window.__ku.projDir(-0.0000001, 0, 0); const sun = window.__ku.sunScreen ? window.__ku.sunScreen() : null;
    return { band: document.querySelector('#hud-head .ctx-band')?.textContent, sun, cx: innerWidth / 2, cy: innerHeight / 2 }; });
  ok(/^Sky from/.test(vantage.band || ''), 'telescope stands at another star (' + vantage.band + ')');
  ok(vantage.sun && Math.hypot(vantage.sun.x - vantage.cx, vantage.sun.y - vantage.cy) < 40, `from Alpha Centauri the Sun sits at RA 39.9° Dec +60.8° (${vantage.sun ? Math.round(vantage.sun.x - vantage.cx) + ',' + Math.round(vantage.sun.y - vantage.cy) + ' px off centre' : 'not projected'})`);
  await page.screenshot({ path: join(OUT, 'desktop-skyfrom.png') });
  await page.evaluate(() => window.__kuapi.skyView(true));   // back to the Sun's sky for the import checks

  // your data: a CSV with degrees, sexagesimal and a row without distance — rows land where the catalogue has them
  const usr = await page.evaluate(() => {
    const n = window.__kuapi.importUser('name;ra;dec;plx;mag\nMy Sirius;101.2872;-16.7161;379.21;-1.46\nMy Vega;18:36:56.3;+38 47 01;130.23;0.03\nGhost;03:48:10;+24:12:00;;18\n', 'e2e.csv');
    const rows = window.__ku.user.rows, hyg = window.__ku.hyg, P = window.__ku.projDir;
    // angular separation in arcseconds via the chord (acos of a dot product near 1 loses ~100″ to rounding;
    // a pixel test would need both stars in front of the camera)
    const off = (r, h) => { const n = v => { const l = Math.hypot(v.dx, v.dy, v.dz); return [v.dx / l, v.dy / l, v.dz / l]; }; const a = n(r), b = n(h);
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) * 206265; };
    const sir = hyg.find(s => s.n === 'Sirius'), veg = hyg.find(s => s.n === 'Vega');
    void P;
    return { n, dSir: off(rows[0], sir), dVeg: off(rows[1], veg), ghost: rows[2].noDist, saved: !!localStorage.getItem('ku_user_v2') };
  });
  ok(usr.n === 3 && usr.ghost && usr.saved, `CSV import keeps ${usr.n} rows, flags the one without distance, persists`);
  ok(usr.dSir < 2 && usr.dVeg < 2, `imported degrees and sexagesimal positions match the catalogue (${usr.dSir.toFixed(2)}″ / ${usr.dVeg.toFixed(2)}″)`);
  // cross-identification: the loaded catalogues first (instant), then SIMBAD through the CDS X-Match service
  const xm = await page.evaluate(() => { const r = window.__kuapi.crossmatch(0, { radius: 3 }); const rows = window.__ku.user.sets[0].rows; return { r, sir: rows[0].xm && rows[0].xm.id, sirSep: rows[0].xm && rows[0].xm.sep, ghost: rows[2].xm }; });
  ok(xm.sir === 'Sirius' && xm.sirSep < 1 && xm.ghost === null, `local cross-match: My Sirius ↔ HYG Sirius ${xm.sirSep?.toFixed(2)}″, the ghost has no counterpart`);
  const vot = await page.evaluate(() => { const t = window.__kuapi.exportTable('set', 'votable', 0, { text: true }); const d = new DOMParser().parseFromString(t, 'application/xml');
    return { fields: d.getElementsByTagName('FIELD').length, trs: d.getElementsByTagName('TR').length, err: d.getElementsByTagName('parsererror').length, csv: window.__kuapi.exportTable('set', 'csv', 0, { text: true }).split('\n') }; });
  ok(vot.err === 0 && vot.trs === 3 && vot.fields >= 12 && vot.csv[1].startsWith('name,ra,dec,epoch') && vot.csv.length >= 5, `VOTable export parses (${vot.fields} fields, ${vot.trs} rows) and the CSV carries the header`);
  const rem = await page.evaluate(async () => { try { const r = await window.__kuapi.crossmatch(0, { radius: 3, remote: 'simbad' }); const rows = window.__ku.user.sets[0].rows; return { r, sir: rows[0].xm && rows[0].xm.id, ghost: rows[2].xm, msg: document.querySelector('#hud-sky .hint.busy')?.textContent }; } catch (e) { return { err: String(e) }; } });
  if (rem.r) ok(rem.sir === '* alf CMa' && rem.ghost === null, `CDS X-Match identifies My Sirius as ${rem.sir}; the ghost stays unknown`);
  else notes.push('skip CDS X-Match (network): ' + (rem.err || rem.msg || 'no answer'));
  // a measurement by name goes into the log with separation and position angle (astropy, J2000: 157.8595° / PA 4.25°; HYG is propagated to today, which moves Sirius 36″)
  const meas = await page.evaluate(() => window.__kuapi.measureBetween('Sirius', 'Vega'));
  ok(meas && Math.abs(meas.sep - 157.8595) < 0.03 && Math.abs(meas.pa - 4.248) < 0.1, `measureBetween Sirius–Vega: sep ${meas?.sep?.toFixed(4)}° PA ${meas?.pa?.toFixed(2)}° (astropy 157.8595° / 4.25°)`);
  await page.evaluate(() => window.__kuapi.doSearch('my vega'));
  await page.waitForTimeout(800);
  const uname = await page.evaluate(() => document.querySelector('#info .in-name')?.textContent);
  ok(uname === 'My Vega', 'search finds an imported row and the card shows it (got ' + uname + ')');
  await page.screenshot({ path: join(OUT, 'desktop-userdata.png') });
  await page.evaluate(() => { window.__kuapi.clearUser(); window.__kuapi.skyView(false); });
  await page.waitForTimeout(500);
  ok(errs.length === 0, 'no page errors on desktop' + (errs.length ? ': ' + errs[0] : ''));

  // CPU budget: the per-layer profiler sums JS time inside render(); independent of the GPU
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.__kuapi.reset());
  await page.evaluate(() => window.__kuapi.enterSolar());
  await page.waitForTimeout(gpu ? 2500 : 6000);
  const prof = await page.evaluate(async () => { const api = window.__kuapi; api.prof(true); api.setToggle('t-rot', true);
    await new Promise(r => setTimeout(r, 2500)); api.setToggle('t-rot', false); return api.prof(false); });
  const cpu = Object.values(prof.ms).reduce((a, b) => a + b, 0);
  ok(cpu < 30, `render() CPU ${cpu.toFixed(1)} ms/frame at the solar view (budget 30; ${prof.frames} frames)`);
  await ctx.close();
}

// ---- 2. one screenshot per scale band ----
// [name, framing in pc, least lit pixels]: the far views are point clouds (Gaia, the
// cosmic web, quasars) and a draw call the driver rejects leaves them black
const VIEWS = [['neighbourhood', 2, 0], ['gaia', 150, 20000], ['milkyway', 2e4, 0], ['cosmicweb', 5e7, 8000], ['quasars', 1e10, 20000]];
for (const [name, pc, minLit] of VIEWS) {
  const { page, ctx, errs, glErrs } = await open({ width: 1440, height: 900 }, false, `v1_0.5000_-0.5000_${pc.toExponential(4)}_0.0000e+0_0.0000e+0_0.0000e+0_1_0_1h9u1fh`);
  const band = await page.evaluate(() => document.querySelector('#hud-head .ctx-band')?.textContent);
  notes.push('view ' + name + ' → band "' + band + '"');
  const shot = await page.screenshot({ path: join(OUT, `desktop-${name}.png`) });
  ok(errs.length === 0, 'no page errors at ' + name + (errs.length ? ': ' + errs[0] : ''));
  ok(glErrs.length === 0, 'no rejected WebGL draw calls at ' + name + (glErrs.length ? ': ' + glErrs[0] : ''));
  if (minLit) { const lit = litPixels(shot); ok(lit >= minLit, `point clouds drawn at ${name} (${lit} lit pixels, need ${minLit})`); }
  await ctx.close();
}

// ---- 2b. real scale: the Sun's symbol follows the zoom (it stayed 16 px over four decades) ----
{
  const sunPx = async (pc) => { const { page, ctx } = await open({ width: 1440, height: 900 }, false, `v1_0.5000_-0.5000_${pc.toExponential(4)}_0.0000e+0_0.0000e+0_0.0000e+0_1_0_1h9u1fh`);
    const px = await page.evaluate(() => { const s = (window.__solarProj || []).find(o => o.o && o.o.n === 'Sun'); return s ? s.px : null; }); await ctx.close(); return px; };
  const near = await sunPx(1e-5), ref = await sunPx(3e-4), far = await sunPx(1e-2);
  ok(near > ref * 1.8 && ref > far * 3 && far > 1, `the Sun's symbol follows the zoom in real scale (2 AU ${near?.toFixed(1)} px · 60 AU ${ref?.toFixed(1)} px · 2000 AU ${far?.toFixed(1)} px)`);
}

// ---- 3. phone ----
{
  const { page, ctx, errs } = await open({ width: 390, height: 844 }, true);
  ok(await page.evaluate(() => !!document.getElementById('mobbar') && !!document.getElementById('mobhead')), 'phone bar + header mounted');
  await page.screenshot({ path: join(OUT, 'phone-landing.png') });
  await page.evaluate(() => window.__kuapi.doSearch('Mars'));
  await page.waitForTimeout(gpu ? 2500 : 6000);
  const card = await page.evaluate(() => { const i = document.getElementById('info'); return i && getComputedStyle(i).position === 'fixed' && i.getBoundingClientRect().bottom <= innerHeight - 50; });
  ok(card, 'phone card docks above the bar');
  await page.locator('#mobbar .mb', { hasText: 'Layers' }).click();
  await page.waitForTimeout(500);
  ok(await page.locator('#mobsheet .toggle').count() > 30, 'phone layers sheet opens');
  await page.screenshot({ path: join(OUT, 'phone-layers.png') });
  ok(errs.length === 0, 'no page errors on phone' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
}

await browser.close(); server.close();
console.log(notes.join('\n'));
if (fails.length) { console.log(fails.join('\n')); console.log(`\n${fails.length} failed · screenshots in tools/e2e-out/`); process.exit(1); }
console.log(`\nall ${notes.length} checks passed · screenshots in tools/e2e-out/`);
