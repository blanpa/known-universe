---
name: verify
description: How to build, launch and drive Known Universe headlessly to verify engine/UI changes end-to-end
---

# Verifying Known Universe changes

Surface: browser GUI (Canvas2D + WebGL). Mount test alone (`npm run test:mount`) only catches
component/mount errors — runtime rendering, zoom, picking need a real browser.

## The short way

```bash
npm run build && npm run test:e2e      # real browser: boot, chrome, interaction, CPU budget, screenshots
```
`tools/e2e.mjs` serves `site/` itself and uses `/usr/bin/google-chrome` headless **with the GPU**
(`--headless=new --enable-gpu --use-angle=gl-egl`) when present, else Playwright's headless
shell on SwiftShader. Screenshots land in `tools/e2e-out/`. Add a check there rather than
hand-rolling a script when the thing you verify will matter again.

## Build & serve by hand

```bash
npm run build                                  # → site/ (also what Pages/docker serve)
python3 -m http.server 8917 --bind 127.0.0.1 -d site &   # same-origin ./data works
```

## Frame-rate numbers that mean something

- Headless Google Chrome with the GPU flags above renders on the real GPU (check the
  `WEBGL_debug_renderer_info` string: Intel/NVIDIA, not SwiftShader). Its absolute fps
  drifts with CPU/GPU clocks between runs — compare A/B **within one run**, alternating.
- The frame cost depends on the heading: rotate and the same scene swings 2× (what is on
  screen changes). Measure at **fixed headings**: load a share hash, then loop
  `window.__ku.redraw()` + rAF and count frames; never with auto-rotation.
- A visible Chrome tab in the user's own browser is the ground truth, but Chrome throttles
  rAF to 1–3 Hz when the window is occluded — check `idle rAF/s ≈ 60` first.
- Live tuning without a rebuild: `window.__ku.tune = { web: { a: 2, px: 1.6 } }` overrides a
  point layer's alpha factor and minimum size for the next frames.

## Drive headlessly without a system chrome

Playwright's shell lives in `~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`.
`npm i playwright-core` in a scratch dir, then `chromium.launch({ executablePath, args:['--no-sandbox','--use-angle=swiftshader'] })`.
WebGL works via swiftshader. Treat SwiftShader shader compile/link failures as REAL findings,
not flakiness: SwiftShader enforces strict GLES rules like mobile drivers do ("globe: link failed"
turned out to be a vertex/fragment uniform precision mismatch that also broke the globe on phones,
while desktop ANGLE silently accepted it).

## Proven flows & gotchas

- **Quantitative camera evidence**: `location.hash` is a `v1_yaw_pitch_camZ_ctrX_ctrY_ctrZ_real_...`
  share hash, rewritten every 2 s — read camZ/ctr/realScale from it instead of screenshots.
- **Measurement hooks** (both live, both cheap):
  - `window.__kuapi` — the engine `api` object: `doSearch`, `setToggle`/`readToggles`,
    `flyToScale(pc)`, `lock`, `setCourse`/`engage`, `route`, `transfer`, `tour.start/next/end`,
    `timeline.set(v)/play/now`, `share()`, `measure()`, `reset()`, `toggleSolar()`, `getCam()`.
    `__kuapi.prof(true)` starts the per-layer profiler, `__kuapi.prof(false)` returns
    `{frames, ms:{layer: msPerFrame}}` — JS time inside render(), reliable in any environment.
  - `__kuapi.skyView(on)` · `setSurvey(id|null)` · `lookAt(ra,dec)` · `setFov(deg)` · `setBlink(on, withId)`
    drive the telescope. `window.__ku.survey` exposes `ST` (survey state), `SKYSTAT`
    (`{order, tiles, drawn}` of the last frame) and `cacheSize()`; `__ku.projDir(x,y,z)` projects a
    sky direction with the live camera (incl. FOV zoom and the north-up roll), `__ku.hyg` is the
    catalogue. Tile orientation is checked by *measuring*: switch the star layers off, render,
    sample screenshot brightness at the catalogue positions of the brightest stars in the field —
    the right mapping scores ~650/765, a wrong one ~320 (scratch script `orient.mjs`). Tiles come
    from alasky.cds.unistra.fr; without network `SKYSTAT.drawn` stays 0 (e2e treats that as a note).
  - `__kuapi.importUser(text, name)` / `clearUser()` drive the CSV layer; `__ku.user.rows` are the
    parsed rows (`dx,dy,dz,d,noDist,m,pr,pd,x`), `__ku.userProj` the ones on screen. Position
    checks: project an imported row and the matching HYG star with `__ku.projDir` and compare px.
  - `__kuapi.queryField('gaia'|'simbad')` runs a live cone query (needs network; VizieR is slow at
    times, SIMBAD answers in well under a second). The movers list is `#hud-sky .mov li`; it needs
    no network: HYG + `__ku.gaiaPm` (the Gaia proper-motion side file). The Gaia cloud's motion is
    checked by sampling screenshot brightness at the predicted shifted position (scratch `gaiapm.mjs`).
  - The Data pane (`#rail .rb` "Data" → `#hud-data .src-row.{idle|busy|ok|warn|error|absent}`) is the
    quickest way to see which outside call failed and why in a headless run; `.src-d` carries the reason.
  - `__kuapi.getCam()` — `{camZ, tgt, real}`. Assert on **tgt**, not camZ: camZ eases toward
    it, so a burst of zoom input leaves camZ orders of magnitude behind and a test that
    reads camZ concludes "zoom is stuck" when it is merely still travelling. Physical
    framing in pc is `real ? tgt : 10**(tgt-6)`, which is comparable across both modes.
  - `window.__solarProj` — the current frame's solar-system projection, `[{o, x, y, px}]`,
    set every frame (it used to be set only while the Sun was in front of the camera, so a
    view from beside the Earth read as "no planets"). `px` is the glyph radius (floored at 4
    for picking), which is how the body-size model gets checked without eyeballing
    screenshots; moons carry `o.parent`, the irregular ones `o.minor`.
  - `window.__ku.bodyWorld('Jupiter')` — a planet's world position this frame, in the
    current scale mode, which is how a test pins the camera on it via a share hash
    (`v1_yaw_pitch_camZ_x_y_z_real_t_mask`) without waiting for a flight.
- **Do NOT trust wall-clock frame timings from this environment.** SwiftShader rasterises
  in software at ~0.5 fps when the point clouds are on, so per-frame numbers swing 3× run
  to run and per-second work (hash rewrite, live fetches) is divided over a handful of
  frames. Use `__kuapi.prof` with the heavy layers off (the "Solar system" preset) to get
  enough frames for a comparison, and treat only *relative* per-layer numbers from a
  matched configuration as evidence. Idle cost IS reliable: it should be ~0.1 ms/60 fps,
  because render() is skipped unless something changed.
- **Zoom spans both scale modes.** Compact covers 1e-4..16 world units, real covers
  1e-12..6e7 pc, and the wheel hands over between them at the limits (see zoomFactorAt),
  so a zoom test must expect `real` to flip mid-sweep. One handoff per direction is
  correct; more than one means it is oscillating.
- **Flights do not complete here**: the camera lerps ~0.12/frame, so a fly-to needs ~40
  frames = over a minute at SwiftShader's rate. Apply the "Solar system" preset first to
  drop the GL clouds, or drive the camera with `page.mouse.wheel` over the target.
- Wait ~7 s after `goto` (data fetch + first hash write).
- **Layer toggles live behind the rail**: `page.locator('#rail .rb', { hasText: 'Layers' }).click()`
  first, then `page.locator('#hud-ctl .toggle', { hasText: 'Compact view' }).click()`. The panes stay
  mounted while hidden, so `getElementById` works without opening, but Playwright clicks need it open.
  Rail buttons: Layers · Legend · Map · Live, then Tour · Measure · Share · Reset at the bottom.
  `Escape` closes the open pane. Toggles are `<button role="switch" aria-checked>` — assert on
  `aria-checked`, not on a class.
- **The chrome is store-driven**: the info card is `#info` (`.in-name`, `.in-actions button`),
  the course bar `#hud-nav`, the tour `#tourPanel`, the timeline `#hud-uni`, the header
  `#hud-head` (`.ctx-band` = Solar system · Stellar neighbourhood · Milky Way · …), the scale
  ladder `#ladder`. There is no `#solarBtn`/`#tourBtn`/`#resetBtn` any more — call `api.*`.
- Presets (`#hud-ctl .preset`) set a whole scene at once; layer state persists in
  `localStorage['ku_layers_v2']` and is restored after boot, so **clear it between runs**
  (`context.clearCookies()` does not cover it — use `page.evaluate(()=>localStorage.clear())`)
  or an earlier run's preset silently changes what the next one renders.
- Phone: `#mobhead` shows band + distance; the card `#info` docks above `#mobbar`; the ladder is
  the `.ladder-strip`. The sheet has snap points (peek/half/full): open with `#mobbar .mb` (Search·Layers·Time·Tour),
  drag `#mobsheet .ms-grab` to resize, tap it to cycle. The scene stays visible above it.
- Search: fill `#hud-search .searchIn`, press Enter. Then `document.activeElement.blur()` before
  keyboard shortcuts (keydown handler ignores INPUT focus).
- `.` frames the pinned object and FOLLOWs it — the reliable way to center Earth before zooming.
- **Wheel zoom needs the pointer over the canvas** — panel clicks move Playwright's virtual mouse,
  so `page.mouse.move(640, 430)` before `page.mouse.wheel(...)`, else you scroll the panel.
- Zoom lerps: wait ~100 ms between wheel events, ~1 s after a burst before reading the hash.
- **Pin the camera via a crafted share hash** instead of waiting for slow lerps — but `page.goto`
  to the same URL with only the hash changed is a same-document navigation (applyHash runs at boot
  only): hop through `about:blank` first. Flight-settle detection: the hash rewriter ticks every
  2 s, so polling must see 2 identical reads ≥4 s apart or it declares mid-flight hashes stable.
- SwiftShader renders `backdrop-filter` panels as white blocks in full-page screenshots sometimes —
  verify suspicious "white panels" with an element screenshot / computed style before fixing.
- **A rejected WebGL draw call is silent**: Chrome logs `GL_INVALID_OPERATION: glDrawArrays: Vertex
  shader input type does not match…` as a console *warning* and skips the whole draw — a point cloud
  simply vanishes (the integer `a_pm` attribute did this to quasars/web/belt). The e2e run now fails on
  any `GL_INVALID` console message and counts lit pixels per far view; when probing by hand, listen to
  every console type, not only `error`.
- **Reference checks without a browser**: `npm run test:astro` (src/lib/astro.js vs astropy/ERFA,
  tools/reference/astro.json) and `npm run test:ephem` (the Horizons table vs off-grid samples).
  Regenerate the references with the scratch venv that has astropy (`pipeline/make_reference.py`,
  `pipeline/fetch_horizons.py --check`). Counters for the e2e run: `__ku.errStat` (bars, ellipses),
  `__ku.obsStat` (horizon points, frame), `__ku.obs` (observer state), `__ku.fits`, `__ku.fieldCentre()`,
  `__ku.kin` (orbit path), `__ku.fd` (field-diagram rows/members). Light-curve checks hit MAST + the STScI
  bucket (~30 s search, 2 MB file): the e2e skips them on network failure, never fails on it.
- External live APIs 429 on repeated headless runs; GIBS tiles 404 on day-offset fallback — noise,
  not failures.
- Views inside the Gaia point cloud (e.g. flown to a nearby star) run ~4 s/frame in SwiftShader —
  give screenshots there `timeout: 180000` and expect flights to take minutes; it is NOT a bug
  (GL point layers in software; 17 ms/frame with GPU stars off).
- Screenshot timeout = compositor stall: historically caused by Canvas2D paths with projected
  coords in the millions of px (see the PLIM guard in src/engine/draw.js). JS stays responsive (evaluate works),
  only screenshots hang — that signature means a pathological draw op, not a JS loop.
