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

const fails = [], notes = [];
const ok = (cond, what) => { if (cond) notes.push('ok   ' + what); else fails.push('FAIL ' + what); };
let n = 0;
async function open(vp, mobile, hash) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: mobile, isMobile: mobile });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message.slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error' && !/404|429|403|Failed to load resource/.test(m.text())) errs.push(m.text().slice(0, 160)); });
  await page.goto(BASE + '?r=' + (n++) + (hash ? '#' + hash : ''), { waitUntil: 'load' });
  await page.waitForFunction(() => window.__kuapi && location.hash.includes('v1_'), null, { timeout: 40000 });
  await page.evaluate(() => localStorage.clear());
  await page.waitForTimeout(gpu ? 3000 : 8000);
  return { page, ctx, errs };
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
const VIEWS = [['neighbourhood', 2], ['gaia', 150], ['milkyway', 2e4], ['cosmicweb', 5e7]];
for (const [name, pc] of VIEWS) {
  const { page, ctx, errs } = await open({ width: 1440, height: 900 }, false, `v1_0.5000_-0.5000_${pc.toExponential(4)}_0.0000e+0_0.0000e+0_0.0000e+0_1_0_1h9u1fh`);
  const band = await page.evaluate(() => document.querySelector('#hud-head .ctx-band')?.textContent);
  notes.push('view ' + name + ' → band "' + band + '"');
  await page.screenshot({ path: join(OUT, `desktop-${name}.png`) });
  ok(errs.length === 0, 'no page errors at ' + name + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();
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
