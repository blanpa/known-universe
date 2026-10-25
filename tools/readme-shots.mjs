// The README's screenshots: the built site in a real browser, one JPEG per view, written
// to docs/screenshots/.  `npm run build && npm run shots:readme`
//
// Browser: $CHROME, else /usr/bin/google-chrome — headless on the GPU, like tools/e2e.mjs.
// Playwright's SwiftShader shell works too but takes seconds per frame in the point clouds.
// The Earth tiles (NASA GIBS) and the sky survey (DSS2 via alasky) need the network.
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { createReadStream, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { homedir } from 'node:os';

const ROOT = resolve(import.meta.dirname, '..'), SITE = join(ROOT, 'site'), OUT = join(ROOT, 'docs', 'screenshots');
mkdirSync(OUT, { recursive: true });
const ONLY = process.argv.slice(2);                       // `node tools/readme-shots.mjs earth tour` redoes only those
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
const shellBin = existsSync(shell) ? readdirSync(shell).filter(d => d.startsWith('chromium_headless_shell')).map(d => join(shell, d, 'chrome-headless-shell-linux64/chrome-headless-shell')).find(existsSync) : null;
const exe = chrome || shellBin;
if (!exe) { console.log('no browser found (set CHROME=/path/to/chrome)'); process.exit(2); }
const gpu = !!chrome;
const args = gpu ? ['--no-sandbox', '--headless=new', '--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=gl-egl', '--enable-gpu-rasterization', '--enable-accelerated-2d-canvas', '--hide-scrollbars']
                 : ['--no-sandbox', '--use-angle=swiftshader', '--hide-scrollbars'];
const browser = await chromium.launch({ executablePath: exe, headless: true, args });
console.log('browser:', exe, gpu ? '(GPU)' : '(SwiftShader — slow, but it works)');

const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 };
let n = 0;
async function open(vp = DESK, { mobile = false, hash = '', dpr = 1 } = {}) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: mobile, isMobile: mobile, deviceScaleFactor: dpr });
  const page = await ctx.newPage();
  page.on('console', m => { if (/GL_INVALID|WebGL: INVALID/.test(m.text())) console.log('  !', m.text().slice(0, 120)); });
  page.on('pageerror', e => console.log('  ! pageerror', e.message.slice(0, 120)));
  await page.goto(BASE + '?r=' + (n++) + (hash ? '#' + hash : ''), { waitUntil: 'load' });
  await page.waitForFunction(() => window.__kuapi && location.hash.includes('v1_'), null, { timeout: 60000 });
  await page.evaluate(() => localStorage.clear());               // an earlier session's preset must not leak in
  await page.waitForTimeout(gpu ? 3500 : 9000);
  return { page, ctx };
}
// flights and zooms ease over frames: wait until the hash rewriter (every 2 s) reports the same camera twice
async function settle(page, first = 3000) {
  await page.waitForTimeout(gpu ? first : first * 2);
  let last = await page.evaluate(() => location.hash);
  for (let i = 0; i < 10; i++) { await page.waitForTimeout(2300); const h = await page.evaluate(() => location.hash); if (h === last) return; last = h; }
}
const shot = (page, name) => page.screenshot({ path: join(OUT, name + '.jpg'), type: 'jpeg', quality: 88, timeout: 180000 }).then(() => console.log('  ✓', name));
const want = (...names) => !ONLY.length || names.some(x => ONLY.includes(x));
// the camera fields of a share hash replaced; the layer mask and the rest stay as they are
function withCam(hash, { yaw, pitch, camZ, ctr, real }) {
  const p = hash.replace(/^#/, '').split('_');
  if (yaw !== undefined) p[1] = yaw.toFixed(4); if (pitch !== undefined) p[2] = pitch.toFixed(4);
  if (camZ !== undefined) p[3] = camZ.toExponential(4);
  if (ctr) { p[4] = ctr[0].toExponential(4); p[5] = ctr[1].toExponential(4); p[6] = ctr[2].toExponential(4); }
  if (real !== undefined) p[7] = real ? '1' : '0';
  return p.join('_');
}
// pin a solar-system body, frame it (`.` centres and follows it), then zoom to a distance in pc
async function atBody(page, body, pc) {
  await page.evaluate(b => window.__kuapi.doSearch(b), body); await page.waitForTimeout(1500);
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.keyboard.press('.'); await settle(page);
  await page.evaluate(d => window.__kuapi.flyToScale(d), pc); await settle(page);
}

// ---- the landing view, and the default layer mask every crafted hash builds on ----
let baseHash;
{ const { page, ctx } = await open(); baseHash = await page.evaluate(() => location.hash);
  if (want('solar-system')) await shot(page, 'solar-system');
  await ctx.close(); }

// ---- one view per scale band: same heading, the Sun at the centre, the framing in pc ----
for (const [name, pc] of [['stellar-neighbourhood', 150], ['milky-way', 2e4], ['cosmic-web', 1.5e8], ['observable-universe', 1e10]]) {
  if (!want(name)) continue;
  const { page, ctx } = await open(DESK, { hash: withCam(baseHash, { yaw: 0.5, pitch: -0.5, camZ: pc, ctr: [0, 0, 0], real: true }) });
  await page.waitForTimeout(2500); await shot(page, name); await ctx.close(); }

// ---- Earth: the lit globe with the stations, then the surface tiles; the card closed ----
if (want('earth', 'earth-surface')) { const { page, ctx } = await open();
  await atBody(page, 'Earth', 6e-10); await page.evaluate(() => window.__kuapi.deselect()); await page.waitForTimeout(1500);
  if (want('earth')) await shot(page, 'earth');
  await page.evaluate(() => window.__kuapi.flyToScale(2e-10)); await settle(page); await page.waitForTimeout(2000);   // the tiles
  if (want('earth-surface')) await shot(page, 'earth-surface');
  await ctx.close(); }

// ---- Saturn with its card ----
if (want('saturn')) { const { page, ctx } = await open(); await atBody(page, 'Saturn', 3e-9); await shot(page, 'saturn'); await ctx.close(); }

// ---- an exoplanet system: search flies beside the host, the orbit diagram fades in within ~100 AU ----
if (want('exoplanet-system')) { const { page, ctx } = await open();
  await page.evaluate(() => window.__kuapi.doSearch('TRAPPIST-1')); await settle(page);
  await page.evaluate(() => window.__kuapi.flyToScale(3e-5)); await settle(page, 4000);
  await shot(page, 'exoplanet-system'); await ctx.close(); }

// ---- the telescope at the Pleiades, DSS2 tiles ----
if (want('sky-pleiades')) { const { page, ctx } = await open();
  await page.evaluate(() => { const a = window.__kuapi; a.skyView(true); a.setSurvey('dss'); a.lookAt(56.75, 24.12); a.setFov(6); });
  await page.waitForTimeout(gpu ? 12000 : 20000); await shot(page, 'sky-pleiades'); await ctx.close(); }

// ---- Sgr A*: the ray tracer bending the galactic disc behind it (the e2e reference view) ----
if (want('sgr-a-star')) { const { page, ctx } = await open(DESK, { hash: 'v1_-2.1808_-1.3808_3.0000e+2_-4.4699e+2_-7.1381e+3_-3.9657e+3_1_0_fahmf99' });
  await page.waitForTimeout(3000); await shot(page, 'sgr-a-star'); await ctx.close(); }

// ---- a course to Mars, the compact view, the Layers pane ----
if (want('course-layers')) { const { page, ctx } = await open();
  await page.evaluate(() => window.__kuapi.doSearch('Mars')); await settle(page);
  await page.evaluate(() => window.__kuapi.setCourse()); await page.waitForTimeout(500);
  await page.locator('#rail .rb', { hasText: 'Layers' }).click(); await page.waitForTimeout(400);
  await page.locator('#hud-ctl .toggle', { hasText: 'Compact view' }).click(); await settle(page);
  await shot(page, 'course-layers'); await ctx.close(); }

// ---- the cosmic tour at its third stop, Proxima Centauri ----
if (want('tour')) { const { page, ctx } = await open();
  await page.evaluate(() => window.__kuapi.tour.start()); await settle(page, 5000);
  await page.evaluate(() => window.__kuapi.tour.next()); await settle(page, 5000);
  await page.evaluate(() => window.__kuapi.tour.next()); await settle(page, 5000);
  await shot(page, 'tour'); await ctx.close(); }

// ---- a phone: the landing view, then a card docked above the bar ----
if (want('phone', 'phone-card')) { const { page, ctx } = await open(PHONE, { mobile: true, dpr: 2 });
  if (want('phone')) await shot(page, 'phone');
  await page.evaluate(() => window.__kuapi.doSearch('Saturn')); await settle(page);
  if (want('phone-card')) await shot(page, 'phone-card');
  await ctx.close(); }

await browser.close(); server.close();
console.log('screenshots in docs/screenshots/');
