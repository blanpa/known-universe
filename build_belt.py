#!/usr/bin/env python3
"""Bake the small-body *populations* into a GPU point cloud (snapshot at build date):
  main belt (MBA), Jupiter trojans (TJN), near-Earth objects (NEO), TNO field.
Input : sb_mba.json, sb_tjn.json, sb_neo.json, sb_tno.json  (SBDB Query API dumps)
Output: site/data/belt.bin — 8 bytes per object, little-endian:
  uint16 ra'  : pseudo-RA of the *world* direction (app frame) /360
  uint16 dec' : pseudo-Dec (+90)/180
  uint16 dist : heliocentric distance /120 AU
  uint8  H    : absolute magnitude * 10 (clamped 25.5)
  uint8  cls  : 0=MBA 1=TJN 2=NEO 3=TNO
Positions propagated to today via Kepler; world frame matches the app's
eclToWorld convention (ecliptic x,y,z -> world x,z,y).
"""
import json, math, os, struct, time

HERE = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.environ.get("BELT_SRC", HERE)
DST = os.environ.get("BELT_DST", os.path.join(HERE, "site", "data", "belt.bin"))
D2R = math.pi / 180.0
JD_NOW = time.time() / 86400.0 + 2440587.5

SETS = [("sb_mba.json", 0), ("sb_tjn.json", 1), ("sb_neo.json", 2), ("sb_tno.json", 3)]


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def pos_at(jd, a, e, i, om, w, ma, ep):
    n = 0.9856076686 / (a ** 1.5)                     # deg/day
    M = math.radians((ma + n * (jd - ep)) % 360.0)
    E = M + e * math.sin(M) * (1 + e * math.cos(M))
    for _ in range(18):
        dE = (E - e * math.sin(E) - M) / (1 - e * math.cos(E))
        E -= dE
        if abs(dE) < 1e-9:
            break
    xp = a * (math.cos(E) - e)
    yp = a * math.sqrt(1 - e * e) * math.sin(E)
    I, W, O = i * D2R, w * D2R, om * D2R
    cO, sO, cI, sI, cw, sw = math.cos(O), math.sin(O), math.cos(I), math.sin(I), math.cos(W), math.sin(W)
    x = (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp
    y = (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp
    z = (sw * sI) * xp + (cw * sI) * yp
    return x, y, z


def main():
    buf = bytearray(struct.pack("<d", JD_NOW))      # 8-byte header: epoch JD of this snapshot
    counts = {}
    for fn, cls in SETS:
        path = os.path.join(SRC_DIR, fn)
        if not os.path.exists(path):
            print("skip", fn)
            continue
        d = json.load(open(path))
        idx = {f: k for k, f in enumerate(d["fields"])}
        n_ok = 0
        for row in d["data"]:
            try:
                a = float(row[idx["a"]]); e = float(row[idx["e"]])
                i = float(row[idx["i"]]); om = float(row[idx["om"]])
                w = float(row[idx["w"]]); ma = float(row[idx["ma"]])
                ep = float(row[idx["epoch"]])
                H = float(row[idx["H"]]) if row[idx["H"]] else 14.0
            except (TypeError, ValueError):
                continue
            if a <= 0 or e >= 1:
                continue
            xe, ye, ze = pos_at(JD_NOW, a, e, i, om, w, ma, ep)
            r = math.hypot(xe, ye, ze)
            if r <= 0 or r > 120:
                continue
            # app world frame: eclToWorld(x,y,z) = [x, z, y]
            wx, wy, wz = xe / r, ze / r, ye / r
            ra = math.degrees(math.atan2(wy, wx)) % 360.0
            dec = math.degrees(math.asin(clamp(wz, -1, 1)))
            buf += struct.pack("<HHHBB",
                int(round(clamp(ra / 360.0, 0, 1) * 65535)),
                int(round(clamp((dec + 90.0) / 180.0, 0, 1) * 65535)),
                int(round(clamp(r / 120.0, 0, 1) * 65535)),
                int(round(clamp(H * 10.0, 0, 255))),
                cls)
            n_ok += 1
        counts[fn] = n_ok
    open(DST, "wb").write(buf)
    total = (len(buf) - 8) // 8
    print("belt.bin: %d objects (%s), %.0f KB" %
          (total, ", ".join("%s=%d" % (k.replace('sb_', '').replace('.json', ''), v)
                            for k, v in counts.items()), len(buf) / 1024))


if __name__ == "__main__":
    main()
