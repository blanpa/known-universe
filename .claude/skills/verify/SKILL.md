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
WebGL works via swiftshader but is flaky: the 3D Earth globe shader occasionally fails to link
("globe: link failed") — rerun before blaming the change.

## Proven flows & gotchas

- **Quantitative camera evidence**: `location.hash` is a `v1_yaw_pitch_camZ_ctrX_ctrY_ctrZ_real_...`
  share hash, rewritten every 2 s — read camZ/ctr/realScale from it instead of screenshots.
- Wait ~7 s after `goto` (data fetch + first hash write).
- Toggles: `page.locator('#hud-ctl .toggle', { hasText: 'Real scale' }).click()` — works for all layer toggles.
- Search: fill `#hud-search .searchIn`, press Enter. Then `document.activeElement.blur()` before
  keyboard shortcuts (keydown handler ignores INPUT focus).
- `.` frames the pinned object and FOLLOWs it — the reliable way to center Earth before zooming.
- **Wheel zoom needs the pointer over the canvas** — panel clicks move Playwright's virtual mouse,
  so `page.mouse.move(640, 430)` before `page.mouse.wheel(...)`, else you scroll the panel.
- Zoom lerps: wait ~100 ms between wheel events, ~1 s after a burst before reading the hash.
- External live APIs 429 on repeated headless runs; GIBS tiles 404 on day-offset fallback — noise,
  not failures.
- Screenshot timeout = compositor stall: historically caused by Canvas2D paths with projected
  coords in the millions of px (see PLIM guard in engine.js). JS stays responsive (evaluate works),
  only screenshots hang — that signature means a pathological draw op, not a JS loop.
