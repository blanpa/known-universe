# Data changelog

One line per catalogue build (`pipeline/build_data.py`, run weekly by `.github/workflows/weekly-data.yml`);
the names of what came in are in `site/data/changelog.json` (`pipeline/data_history.py` derives both from git).
The Gaia point clouds (`gaia*.bin`, 2.10 M sources within 150 pc with ϖ/σ > 3, Bailer-Jones distances, errors,
RUWE, radial velocities) and the JPL Horizons table (`ephem.bin`, 2015–2045) are static releases, rebuilt by hand
with `pipeline/fetch_gaia.py` / `fetch_horizons.py`; the share links carry the app build they were made on.

| date | exoplanet systems | planets | galaxies | HYG stars | what changed |
|---|---|---|---|---|---|
| 2026-10-24 | 4,819 | 6,423 | 869 | 11,604 (8,081 from Gaia) | rebuilt, same contents |
| 2026-10-19 | 4,819 (+5) | 6,423 (+6) | 869 | 11,604 (0 from Gaia) | new systems: Elias 2-24, TIC 219893931, TIC 237254473, TOI-5120, TOI-5699 |
| 2026-10-12 | 4,814 (+62) | 6,417 (+70) | 869 | 11,604 (0 from Gaia) | new systems: TOI-1154, TOI-1245, TOI-1262, TOI-1281, TOI-1432, TOI-1435… |
| 2026-10-05 | 4,752 (+1) | 6,347 (+3) | 869 | 11,604 (0 from Gaia) | new systems: HD 148797 |
| 2026-09-28 | 4,751 (+4) | 6,344 (+6) | 869 | 11,604 (0 from Gaia) | new systems: KMT-2023-BLG-0084L, KMT-2023-BLG-1118L, KMT-2023-BLG-1810L, TOI-426 |
| 2026-09-14 | 4,747 (+6) | 6,338 (+6) | 869 | 11,604 (0 from Gaia) | new systems: HD 278555, HD 715, KMT-2025-BLG-0026L, KMT-2025-BLG-0030L, KMT-2025-BLG-2272L, OGLE-2016-BLG-0261L |
| 2026-09-07 | 4,741 (+4) | 6,332 (+5) | 869 | 11,604 (0 from Gaia) | new systems: KMT-2025-BLG-0975L, KMT-2025-BLG-1160L, TOI-3053, TOI-3278, TOI-4409, 1 systems dropped |
| 2026-08-31 | 4,737 (+15) | 6,327 (+18) | 869 | 11,604 (0 from Gaia) | new systems: Gl 725 B, HIP 81991, KOI-319, MOA-2020-BLG-108L, TOI-2114, TOI-4492… |
| 2026-08-10 | 4,722 (+2) | 6,309 (+3) | 869 | 11,604 (0 from Gaia) | new systems: HD 60779, TOI-5628 A |
| 2026-08-03 | 4,720 (+9) | 6,306 (+9) | 869 | 11,604 (0 from Gaia) | new systems: Gaia23braL, Gliese 48, HAT-P-47, NGTS-39, TOI-2040, TOI-2049… |
| 2026-07-20 | 4,711 (+3) | 6,297 (+5) | 869 | 11,604 (0 from Gaia) | new systems: TOI-1533, TOI-6884, TOI-791 |
| 2026-07-11 | 4,708 | 6,292 | 869 | 11,604 (0 from Gaia) | first build |
