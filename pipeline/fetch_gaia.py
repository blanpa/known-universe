#!/usr/bin/env python3
"""Pull the Gaia DR3 solar neighbourhood from the ESA archive with its uncertainties.

One asynchronous TAP job (anonymous jobs may return a few million rows) for every
source within 150 pc (parallax > 6.6667 mas) with a basic quality cut
(parallax_over_error > 3), joined with the Bailer-Jones distances
(external.gaiaedr3_distance). Columns:
  source_id, ra, dec (deg, J2016.0), parallax, parallax_error (mas), pmra, pmdec,
  pmra_error, pmdec_error (mas/yr), ruwe, phot_g_mean_mag, bp_rp, radial_velocity
  (km/s), r_med_geo, r_lo_geo, r_hi_geo (pc; 50th, 16th, 84th percentile).
Output: pipeline/raw/gaia_150pc_q.csv (the 100 pc set is the subset parallax > 10).

Also the Hipparcos cross-match (gaiadr3.hipparcos2_best_neighbour) with Gaia astrometry,
so the HYG stars can be placed from DR3: pipeline/raw/hip_gaia.csv.

  python3 pipeline/fetch_gaia.py [--count]   # --count only sizes the sets
"""
import os, sys, time, urllib.request, urllib.parse, xml.etree.ElementTree as ET

TAP = "https://gea.esac.esa.int/tap-server/tap"
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.path.join(HERE, "raw"); os.makedirs(RAW, exist_ok=True)
Q_MAIN = ("SELECT g.source_id, g.ra, g.dec, g.parallax, g.parallax_error, g.pmra, g.pmdec, g.pmra_error, g.pmdec_error, g.ruwe, "
          "g.phot_g_mean_mag, g.bp_rp, g.radial_velocity, d.r_med_geo, d.r_lo_geo, d.r_hi_geo "
          "FROM gaiadr3.gaia_source AS g LEFT JOIN external.gaiaedr3_distance AS d ON g.source_id = d.source_id "
          "WHERE g.parallax > 6.6667 AND g.parallax_over_error > 3")
Q_HIP = ("SELECT h.original_ext_source_id AS hip, g.source_id, g.ra, g.dec, g.parallax, g.parallax_error, g.pmra, g.pmdec, "
         "g.pmra_error, g.pmdec_error, g.ruwe, g.radial_velocity, g.phot_g_mean_mag "
         "FROM gaiadr3.hipparcos2_best_neighbour AS h JOIN gaiadr3.gaia_source AS g ON g.source_id = h.source_id")

def sync(query):
    u = TAP + "/sync?" + urllib.parse.urlencode({"REQUEST": "doQuery", "LANG": "ADQL", "FORMAT": "csv", "QUERY": query})
    with urllib.request.urlopen(u, timeout=600) as r: return r.read().decode()

def async_job(query, dst):
    data = urllib.parse.urlencode({"REQUEST": "doQuery", "LANG": "ADQL", "FORMAT": "csv", "PHASE": "RUN", "MAXREC": "1000000", "QUERY": query}).encode()
    req = urllib.request.Request(TAP + "/async", data=data)
    with urllib.request.urlopen(req, timeout=120) as r: job = r.url            # 303 → the job URL
    print("job", job, flush=True)
    t0 = time.time()
    while True:
        with urllib.request.urlopen(job + "/phase", timeout=60) as r: phase = r.read().decode().strip()
        if phase in ("COMPLETED", "ERROR", "ABORTED"): break
        time.sleep(10); print(f"  {phase} {time.time()-t0:.0f}s", flush=True)
    if phase != "COMPLETED":
        with urllib.request.urlopen(job, timeout=60) as r: xmlt = r.read().decode()
        sys.exit("job ended in " + phase + ": " + xmlt[:800])
    with urllib.request.urlopen(job + "/results/result", timeout=3600) as r, open(dst, "wb") as f:
        n = 0
        while True:
            chunk = r.read(1 << 20)
            if not chunk: break
            f.write(chunk); n += len(chunk)
            if n % (50 << 20) < (1 << 20): print(f"  {n/1e6:.0f} MB", flush=True)
    print("saved", dst, f"{n/1e6:.1f} MB in {time.time()-t0:.0f}s", flush=True)

# The archive drops anonymous jobs that run too long: the neighbourhood is pulled in RA bands
# (15° → at most ~250k rows each) and the Hipparcos table in HIP-number ranges, then joined.
def chunked(query_fn, chunks, dst):
    # one part file per chunk, so an aborted run resumes where it stopped
    parts = dst + ".parts"; os.makedirs(parts, exist_ok=True)
    for lo, hi in chunks:
        part = os.path.join(parts, f"{lo}_{hi}.csv")
        if os.path.exists(part) and os.path.getsize(part) > 0: continue
        async_job(query_fn(lo, hi), part + ".tmp"); os.replace(part + ".tmp", part)
    with open(dst, "w") as out:
        for i, (lo, hi) in enumerate(chunks):
            with open(os.path.join(parts, f"{lo}_{hi}.csv")) as f:
                for j, line in enumerate(f):
                    if j == 0 and i > 0: continue          # one header
                    out.write(line)
    n = sum(1 for _ in open(dst)) - 1
    print(dst, n, "rows", flush=True)

if __name__ == "__main__":
    if "--count" in sys.argv:
        for q in ("SELECT COUNT(*) AS n150 FROM gaiadr3.gaia_source WHERE parallax > 6.6667 AND parallax_over_error > 3",
                  "SELECT COUNT(*) AS n100 FROM gaiadr3.gaia_source WHERE parallax > 10 AND parallax_over_error > 3",
                  "SELECT COUNT(*) AS n150_all FROM gaiadr3.gaia_source WHERE parallax > 6.6667",
                  "SELECT COUNT(*) AS nhip FROM gaiadr3.hipparcos2_best_neighbour"):
            print(sync(q).strip().replace("\n", " = "), flush=True)
        sys.exit(0)
    chunked(lambda lo, hi: Q_HIP + f" WHERE h.original_ext_source_id >= {lo} AND h.original_ext_source_id < {hi}",
            [(0, 40000), (40000, 80000), (80000, 200000)], os.path.join(RAW, "hip_gaia.csv"))
    chunked(lambda lo, hi: Q_MAIN + f" AND g.ra >= {lo} AND g.ra < {hi}",
            [(a, a + 5) for a in range(0, 360, 5)], os.path.join(RAW, "gaia_150pc_q.csv"))   # 5°: the densest band (galactic centre) stays under the job limit
