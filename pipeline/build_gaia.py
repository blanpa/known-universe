#!/usr/bin/env python3
"""Pack the Gaia DR3 solar-neighbourhood sample (< 100 pc) into a compact
binary point cloud for the WebGL star renderer.

Input : gaia_100pc.csv  (ra, dec, parallax, phot_g_mean_mag, bp_rp[, pmra, pmdec])
Output: site/data/gaia.bin  — 8 bytes per star, little-endian:
          uint16 ra   : ra/360      * 65535
          uint16 dec  : (dec+90)/180 * 65535
          uint16 dist : dist_pc/100  * 65535   (dist = 1000/parallax)
          uint8  mag   : (G+2)/28     * 255      (range -2 .. 26)
          uint8  bp_rp : (bp_rp+1)/6  * 255      (range -1 .. 5)
Colour is derived from bp_rp at load time (Ballesteros -> Teff -> buckets),
identical to the HYG star colours, so no colour bytes are stored.
        site/data/gaia_pm.bin — 4 bytes per star, the same order: int16 pmra, int16 pmdec
          in mas/yr (clamped to ±32767; Gaia's fastest is Barnard's star at 10,393).
          A second, optional file so gaia.bin keeps its format (the picker and the
          larger Docker set read 8-byte records); missing proper motions are 0.
"""
import csv, os, struct, base64

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                  # repo root
RAW  = os.path.join(HERE, "raw")              # downloaded catalogue dumps (gitignored)
IN   = os.path.join(HERE, "inputs")           # curated, hand-maintained inputs
OUT  = os.path.join(ROOT, "site", "data")     # what the app is served from
SRC  = os.path.join(RAW, "gaia_100pc_pm.csv") if os.path.exists(os.path.join(RAW, "gaia_100pc_pm.csv")) else os.path.join(RAW, "gaia_100pc.csv")
DST  = os.path.join(OUT, "gaia.bin")
DST_PM = os.path.join(OUT, "gaia_pm.bin")


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def pack(src=SRC, dst=DST, dst_pm=DST_PM, maxd=100.0):
    buf = bytearray()
    pm = bytearray()
    n = 0; n_pm = 0
    with open(src) as f:
        for r in csv.DictReader(f):
            try:
                ra = float(r["ra"]); dec = float(r["dec"])
                plx = float(r["parallax"]); mag = float(r["phot_g_mean_mag"])
            except (ValueError, KeyError):
                continue
            if plx <= 0:
                continue
            dist = 1000.0 / plx                      # parsec
            if dist > maxd or dist <= 0:
                continue
            try:
                bprp = float(r["bp_rp"])
            except (ValueError, KeyError):
                bprp = 1.0                           # missing -> sun-like
            u_ra   = int(round(clamp(ra / 360.0, 0, 1) * 65535))
            u_dec  = int(round(clamp((dec + 90.0) / 180.0, 0, 1) * 65535))
            u_dist = int(round(clamp(dist / maxd, 0, 1) * 65535))
            u_mag  = int(round(clamp((mag + 2.0) / 28.0, 0, 1) * 255))
            u_bp   = int(round(clamp((bprp + 1.0) / 6.0, 0, 1) * 255))
            buf += struct.pack("<HHHBB", u_ra, u_dec, u_dist, u_mag, u_bp)
            try:
                pra = float(r["pmra"]); pde = float(r["pmdec"]); n_pm += 1
            except (ValueError, KeyError):
                pra = pde = 0.0
            pm += struct.pack("<hh", int(clamp(round(pra), -32767, 32767)), int(clamp(round(pde), -32767, 32767)))
            n += 1
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "wb") as f:
        f.write(buf)
    with open(dst_pm, "wb") as f:
        f.write(pm)
    print(f"packed {n} Gaia stars -> {dst}  ({len(buf)} bytes, "
          f"{len(buf)/1048576:.2f} MB; base64 ~{len(buf)*4/3/1048576:.2f} MB)")
    print(f"proper motions for {n_pm} of them -> {dst_pm} ({len(pm)} bytes)")
    return n, bytes(buf)


if __name__ == "__main__":
    import sys
    if "--big" in sys.argv:
        # the Docker set: < 150 pc (parallax > 6.667 mas), same cuts, dist scaled to 150 pc
        pack(src=os.path.join(RAW, "gaia_150pc_pm.csv"), dst=os.path.join(OUT, "gaiabig.bin"),
             dst_pm=os.path.join(OUT, "gaiabig_pm.bin"), maxd=150.0)
    else:
        pack()
