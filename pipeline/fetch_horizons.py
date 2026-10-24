#!/usr/bin/env python3
"""JPL Horizons ephemerides for the planets, Pluto and the Moon, 2015–2045, packed for the
app (site/data/ephem.bin + ephem.json). Planets: heliocentric ICRF vectors, 1-day steps (Mercury 12 h);
Moon: geocentric, 6-hour steps. Positions are converted to the ecliptic J2000 frame the
app's solar system uses (x toward the equinox, z toward the ecliptic pole), in AU, float32.
The app interpolates with a 4-point Lagrange polynomial: Mercury's error stays under 0.1″,
the Moon's under 1″ (checked by tools/ephem-check.mjs against off-grid Horizons samples).
  python3 pipeline/fetch_horizons.py
"""
import json, math, os, struct, sys, urllib.request, urllib.parse, time
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(os.path.dirname(HERE), "site", "data"); RAW = os.path.join(HERE, "raw", "horizons"); os.makedirs(RAW, exist_ok=True)
API = "https://ssd.jpl.nasa.gov/api/horizons.api"
START, STOP = "2015-01-01", "2045-01-02"
BODIES = [("Mercury", "199"), ("Venus", "299"), ("Earth", "399"), ("Mars", "499"), ("Jupiter", "599"), ("Saturn", "699"), ("Uranus", "799"), ("Neptune", "899"), ("Pluto", "999")]
STEP = {"Mercury": "12 h"}                                 # Mercury at 1-day steps interpolates to 70 km (0.13″); 12 h keeps it under 0.02″
EPS0 = math.radians(84381.406 / 3600.0)                   # obliquity J2000 (IAU 2006)
def fetch(cmd, center, step, start=START, stop=STOP):
    key = f"{cmd}_{center.replace('@','at')}_{step.replace(' ','')}_{start}_{stop}.txt"; path = os.path.join(RAW, key)
    if not os.path.exists(path):
        q = {"format": "text", "COMMAND": f"'{cmd}'", "EPHEM_TYPE": "VECTORS", "CENTER": f"'{center}'", "START_TIME": f"'{start}'", "STOP_TIME": f"'{stop}'",
             "STEP_SIZE": f"'{step}'", "VEC_TABLE": "'1'", "REF_PLANE": "'FRAME'", "REF_SYSTEM": "'ICRF'", "OUT_UNITS": "'AU-D'", "CSV_FORMAT": "'YES'", "VEC_LABELS": "'NO'", "OBJ_DATA": "'NO'"}
        for attempt in range(4):
            try:
                with urllib.request.urlopen(API + "?" + urllib.parse.urlencode(q), timeout=600) as r: txt = r.read().decode()
                break
            except Exception as e:
                print("  retry", attempt, e, flush=True); time.sleep(10)
        else: sys.exit("Horizons failed for " + cmd)
        open(path, "w").write(txt)
    txt = open(path).read()
    if "$$SOE" not in txt: sys.exit("no data for " + cmd + ": " + txt[:500])
    rows = []
    for line in txt.split("$$SOE")[1].split("$$EOE")[0].strip().splitlines():
        f = [x.strip() for x in line.split(",")]
        if len(f) < 5: continue
        jd = float(f[0]); x, y, z = float(f[2]), float(f[3]), float(f[4])
        # ICRF equatorial → ecliptic J2000: rotate about x by +ε0
        ye = y * math.cos(EPS0) + z * math.sin(EPS0); ze = -y * math.sin(EPS0) + z * math.cos(EPS0)
        rows.append((jd, x, ye, ze))
    return rows
def main():
    meta = {"frame": "ecliptic J2000, heliocentric (Moon: geocentric)", "unit": "AU", "source": "JPL Horizons, DE441", "fetched": time.strftime("%Y-%m-%d"), "bodies": []}
    blob = bytearray()
    for name, cmd in BODIES:
        rows = fetch(cmd, "500@10", STEP.get(name, "1 d")); jd0 = rows[0][0]; step = rows[1][0] - rows[0][0]
        for i in range(1, len(rows)):
            if abs(rows[i][0] - rows[i-1][0] - step) > 1e-6: sys.exit(f"{name}: uneven step at row {i}")
        meta["bodies"].append({"n": name, "jd0": jd0, "step": step, "count": len(rows), "offset": len(blob)})
        for _, x, y, z in rows: blob += struct.pack("<fff", x, y, z)
        print(f"{name}: {len(rows)} rows from JD {jd0} step {step} d", flush=True)
    moon = []
    for (a, b) in [("2015-01-01", "2025-01-01"), ("2025-01-01", "2035-01-01"), ("2035-01-01", "2045-01-02")]:
        part = fetch("301", "500@399", "6 h", a, b)
        if moon and abs(part[0][0] - moon[-1][0]) < 1e-6: part = part[1:]
        moon += part
    jd0 = moon[0][0]; step = moon[1][0] - moon[0][0]
    for i in range(1, len(moon)):
        if abs(moon[i][0] - moon[i-1][0] - step) > 1e-6: sys.exit(f"Moon: uneven step at row {i} ({moon[i][0]} vs {moon[i-1][0]})")
    meta["bodies"].append({"n": "Moon", "jd0": jd0, "step": step, "count": len(moon), "offset": len(blob)})
    for _, x, y, z in moon: blob += struct.pack("<fff", x, y, z)
    print(f"Moon: {len(moon)} rows from JD {jd0} step {step} d", flush=True)
    open(os.path.join(OUT, "ephem.bin"), "wb").write(blob); json.dump(meta, open(os.path.join(OUT, "ephem.json"), "w"))
    print("wrote", os.path.join(OUT, "ephem.bin"), f"{len(blob)/1048576:.2f} MB")
# --check: off-grid samples (times between the table's rows) for tools/ephem-check.mjs
def samples():
    import random; random.seed(7); out = {"bodies": {}}
    for name, cmd in BODIES + [("Moon", "301")]:
        center = "500@399" if name == "Moon" else "500@10"; rows = []
        for (a, b) in [("2016-03-07 05:17", "2016-03-09 05:17"), ("2026-10-24 13:41", "2026-10-26 13:41"), ("2041-07-01 20:03", "2041-07-03 20:03")]:
            rows += fetch(cmd, center, "97 m", a, b)
        out["bodies"][name] = [[jd, x, y, z] for jd, x, y, z in rows]
        print(name, len(rows), "samples", flush=True)
    dst = os.path.join(os.path.dirname(HERE), "tools", "reference", "ephem-samples.json"); json.dump(out, open(dst, "w")); print("wrote", dst)
if __name__ == "__main__":
    if "--check" in sys.argv: samples()
    else: main()
