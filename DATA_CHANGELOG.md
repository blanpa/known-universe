# Data changelog

One line per catalogue build (`pipeline/build_data.py`, run weekly by `.github/workflows/weekly-data.yml`).
The Gaia point clouds (`gaia*.bin`, 2.10 M sources within 150 pc with ϖ/σ > 3, Bailer-Jones distances, errors,
RUWE, radial velocities) and the JPL Horizons table (`ephem.bin`, 2015–2045) are static releases, rebuilt by hand
with `pipeline/fetch_gaia.py` / `fetch_horizons.py`; the share links carry the app build they were made on.

| built | exoplanet systems | planets | galaxies | HYG stars |
|---|---|---|---|---|
