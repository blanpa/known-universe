#!/usr/bin/env python3
"""Pack the Gaia DR3 solar-neighbourhood sample (< 100 pc) into a compact
binary point cloud for the WebGL star renderer.

Input : gaia_100pc.csv  (ra, dec, parallax, phot_g_mean_mag, bp_rp)
Output: site/data/gaia.bin  — 8 bytes per star, little-endian:
          uint16 ra   : ra/360      * 65535
          uint16 dec  : (dec+90)/180 * 65535
          uint16 dist : dist_pc/100  * 65535   (dist = 1000/parallax)
          uint8  mag   : (G+2)/28     * 255      (range -2 .. 26)
          uint8  bp_rp : (bp_rp+1)/6  * 255      (range -1 .. 5)
Colour is derived from bp_rp at load time (Ballesteros -> Teff -> buckets),
identical to the HYG star colours, so no colour bytes are stored.
"""
import csv, os, struct, base64

HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(HERE, "gaia_100pc.csv")
DST  = os.path.join(HERE, "site", "data", "gaia.bin")


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def pack(src=SRC, dst=DST):
    buf = bytearray()
    n = 0
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
            if dist > 100.0 or dist <= 0:
                continue
            try:
                bprp = float(r["bp_rp"])
            except (ValueError, KeyError):
                bprp = 1.0                           # missing -> sun-like
            u_ra   = int(round(clamp(ra / 360.0, 0, 1) * 65535))
            u_dec  = int(round(clamp((dec + 90.0) / 180.0, 0, 1) * 65535))
            u_dist = int(round(clamp(dist / 100.0, 0, 1) * 65535))
            u_mag  = int(round(clamp((mag + 2.0) / 28.0, 0, 1) * 255))
            u_bp   = int(round(clamp((bprp + 1.0) / 6.0, 0, 1) * 255))
            buf += struct.pack("<HHHBB", u_ra, u_dec, u_dist, u_mag, u_bp)
            n += 1
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, "wb") as f:
        f.write(buf)
    print(f"packed {n} Gaia stars -> {dst}  ({len(buf)} bytes, "
          f"{len(buf)/1048576:.2f} MB; base64 ~{len(buf)*4/3/1048576:.2f} MB)")
    return n, bytes(buf)


if __name__ == "__main__":
    pack()
