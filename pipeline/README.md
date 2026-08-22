# Data pipeline

Everything that produces `site/data/`. Nothing here runs in the browser.

```
pipeline/
├── build_data.py         raw dumps      -> site/data/data.json   (the main dataset)
├── build_belt.py         sb_*.json      -> site/data/belt.bin     (small-body field)
├── build_gaia.py         gaia_100pc.csv -> site/data/gaia.bin     (star point cloud)
├── build_extragal.py     2MRS/Milliquas -> site/data/cosmicweb.bin, quasars.bin
├── build_moons.py        JPL Horizons   -> prints `const MOON_EPH=…;`  (paste into engine.js)
├── build_solar_extra.py  JPL Horizons   -> prints `const PROBES=…;`    (paste into engine.js)
├── refresh_data.py       download + run build_data + build_belt in one go
├── fetch_live_extra.py   GraceDB + CNEOS -> live-extra.json (run by CI, not by hand)
├── inputs/               curated, hand-maintained, version-controlled
└── raw/                  downloaded catalogue dumps — gitignored, regenerable
```

Every builder resolves its paths from its own location, so they work from any
working directory:

| constant | resolves to        |
|----------|--------------------|
| `RAW`    | `pipeline/raw`     |
| `IN`     | `pipeline/inputs`  |
| `OUT`    | `site/data`        |

`build_data.py` and `build_belt.py` additionally honour `SRC` / `GSRC` / `HSRC` /
`DST` and `BELT_SRC` / `BELT_DST` — that is how `refresh_data.py` and the Docker
updater point them at a scratch directory.

## The two kinds of output

**Files** — `data.json` and the `*.bin` clouds are written straight into
`site/data/` and shipped as-is.

**Pasted constants** — `build_moons.py` and `build_solar_extra.py` print JS
`const` declarations to stdout. They are baked into `src/lib/engine.js` by hand
because they are effectively static (moon ephemerides, probe trajectories); re-run
them only when you want a newer epoch.

## Running the whole refresh

```bash
python3 pipeline/refresh_data.py /tmp/work site/data/data.json pipeline
```

Downloads fresh catalogues into `/tmp/work`, then rebuilds `data.json` and
`belt.bin`. This is exactly what the `weekly-data` workflow and the Docker
updater run.

## inputs/

| file               | read by         | what it is                                        |
|--------------------|-----------------|---------------------------------------------------|
| `constlines.json`  | `build_data.py` | constellation line segments (d3-celestial)        |
| `galaxy_pa.json`   | `build_data.py` | measured position angles (LEDA) for oriented disks |
| `sat_ids.json`     | — nothing       | JPL Horizons natural-satellite IDs; superseded by the inline `MOONS` table in `build_moons.py`. Kept as a reference list; safe to delete. |

## raw/

Gitignored — a couple of hundred MB of catalogue dumps, all regenerable. The
fetch commands live in the repository README under *Regenerate the data
manually*; `refresh_data.py` automates the three that change weekly.

## Gotcha

`build_data.py` is a flat top-level script with no `if __name__ == "__main__"`
guard: **importing it rebuilds and overwrites `data.json`.** Always invoke it as
a subprocess (`python3 pipeline/build_data.py`), which is what every caller does.
