---
name: verify
description: How to build, launch and drive Known Universe headlessly to verify engine/UI changes end-to-end
---

# Verifying Known Universe changes

Surface: browser GUI (Canvas2D + WebGL). Mount test alone (`npm run test:mount`) only catches
component/mount errors — runtime rendering, zoom, picking need a real browser.

## Build & serve

```bash
npm run build                                  # → site/ (also what Pages/docker serve)
python3 -m http.server 8917 --bind 127.0.0.1 -d site &   # same-origin ./data works
```

## Drive headlessly (no system chrome installed)

Playwright chromium lives in `~/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell`.
`npm i playwright-core` in a scratch dir, then `chromium.launch({ executablePath, args:['--no-sandbox','--use-angle=swiftshader'] })`.
WebGL works via swiftshader. Treat SwiftShader shader compile/link failures as REAL findings,
not flakiness: SwiftShader enforces strict GLES rules like mobile drivers do ("globe: link failed"
turned out to be a vertex/fragment uniform precision mismatch that also broke the globe on phones,
while desktop ANGLE silently accepted it).

## Proven flows & gotchas

- **Quantitative camera evidence**: `location.hash` is a `v1_yaw_pitch_camZ_ctrX_ctrY_ctrZ_real_...`
  share hash, rewritten every 2 s — read camZ/ctr/realScale from it instead of screenshots.
- **Measurement hooks** (both live, both cheap):
  - `window.__kuapi` — the engine `api` object. `__kuapi.prof(true)` starts the per-layer
    profiler, `__kuapi.prof(false)` returns `{frames, ms:{layer: msPerFrame}}`. Off by default.
  - `window.__solarProj` — the current frame's solar-system projection, `[{o, x, y, px}]`.
    `px` is the glyph radius (floored at 4 for picking), which is how the body-size model
    gets checked without eyeballing screenshots.
- **Do NOT trust wall-clock frame timings from this environment.** SwiftShader rasterises
  in software at ~0.5 fps when the point clouds are on, so per-frame numbers swing 3× run
  to run and per-second work (hash rewrite, live fetches) is divided over a handful of
  frames. Use `__kuapi.prof` with the heavy layers off (the "Solar system" preset) to get
  enough frames for a comparison, and treat only *relative* per-layer numbers from a
  matched configuration as evidence. Idle cost IS reliable: it should be ~0.1 ms/60 fps,
  because render() is skipped unless something changed.
- **Flights do not complete here**: the camera lerps ~0.12/frame, so a fly-to needs ~40
  frames = over a minute at SwiftShader's rate. Apply the "Solar system" preset first to
  drop the GL clouds, or drive the camera with `page.mouse.wheel` over the target.
- Wait ~7 s after `goto` (data fetch + first hash write).
- **Layer toggles live behind the rail now**: `page.locator('#rail .rb', { hasText: 'Layers' }).click()`
  first, then `page.locator('#hud-ctl .toggle', { hasText: 'Compact view' }).click()`. The panes stay
  mounted while hidden, so `getElementById` works without opening, but Playwright clicks need it open.
  Rail buttons: Layers · Legend · Map · Live. `Escape` closes the open pane.
  Toggles are `<button role="switch" aria-checked>` — assert on `aria-checked`, not on a class.
- Presets (`#hud-ctl .preset`) set a whole scene at once; layer state persists in
  `localStorage['ku_layers_v2']` and is restored after boot, so **clear it between runs**
  (`context.clearCookies()` does not cover it — use `page.evaluate(()=>localStorage.clear())`)
  or an earlier run's preset silently changes what the next one renders.
- Mobile sheet has snap points (peek/half/full): open with `#mobbar .mb` (Search·Layers·Time·Tour),
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
- External live APIs 429 on repeated headless runs; GIBS tiles 404 on day-offset fallback — noise,
  not failures.
- Views inside the Gaia point cloud (e.g. flown to a nearby star) run ~4 s/frame in SwiftShader —
  give screenshots there `timeout: 180000` and expect flights to take minutes; it is NOT a bug
  (GL point layers in software; 17 ms/frame with GPU stars off).
- Screenshot timeout = compositor stall: historically caused by Canvas2D paths with projected
  coords in the millions of px (see PLIM guard in engine.js). JS stays responsive (evaluate works),
  only screenshots hang — that signature means a pathological draw op, not a JS loop.
