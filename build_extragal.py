#!/usr/bin/env python3
"""Pack the extragalactic point clouds for the WebGL renderer:
  - 2MRS redshift survey  -> the cosmic web / large-scale structure (dist from cz)
  - Milliquas quasar sample -> the distant universe (comoving distance from z)
Output: site/data/cosmicweb.bin and site/data/quasars.bin (8 bytes/object):
  uint16 ra, uint16 dec, uint16 dist, uint8 b6, uint8 b7   (little-endian)
Distances are decoded in JS to parsec. cz uses H0=70; z uses flat LCDM comoving.
"""
import csv, math, os, struct

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "site", "data")
H0 = 70.0
C = 299792.458            # km/s
DH = C / H0               # Hubble distance, Mpc (~4283)

WEB_MAX = 600.0           # Mpc full-scale for 2MRS distance
QSO_MAX = 13000.0         # Mpc full-scale for quasar comoving distance


def clamp(v, lo, hi):
    return lo if v < lo else hi if v > hi else v


def comoving_mpc(z):
    # flat LCDM, Om=0.3, OL=0.7 — Simpson integration of 1/E(z')
    n = 64
    s = 0.0
    for i in range(n + 1):
        zp = z * i / n
        E = math.sqrt(0.3 * (1 + zp) ** 3 + 0.7)
        w = 1.0 if (i == 0 or i == n) else (4.0 if i % 2 else 2.0)
        s += w / E
    return DH * (z / n) / 3.0 * s


def pack_web(src=os.path.join(HERE, "twomrs_raw.csv"),
             dst=os.path.join(DATA, "cosmicweb.bin")):
    buf = bytearray(); n = 0
    with open(src) as f:
        for r in csv.DictReader(f):
            try:
                ra = float(r["RAJ2000"]); dec = float(r["DEJ2000"]); cz = float(r["cz"])
            except (ValueError, KeyError):
                continue
            if cz <= 0:
                continue
            dist = cz / H0                          # Mpc
            if dist > WEB_MAX or dist <= 0:
                continue
            try:
                k = float(r["Kcmag"])
            except (ValueError, KeyError):
                k = 11.0
            buf += struct.pack("<HHHBB",
                int(round(clamp(ra / 360.0, 0, 1) * 65535)),
                int(round(clamp((dec + 90.0) / 180.0, 0, 1) * 65535)),
                int(round(clamp(dist / WEB_MAX, 0, 1) * 65535)),
                int(round(clamp(k / 16.0, 0, 1) * 255)), 0)
            n += 1
    open(dst, "wb").write(buf)
    print("cosmic web: %d galaxies -> %s (%d B)" % (n, dst, len(buf)))
    return n


def pack_qso(src=os.path.join(HERE, "quasars_raw.csv"),
             dst=os.path.join(DATA, "quasars.bin")):
    buf = bytearray(); n = 0
    with open(src) as f:
        for r in csv.DictReader(f):
            try:
                ra = float(r["RAJ2000"]); dec = float(r["DEJ2000"]); z = float(r["z"])
            except (ValueError, KeyError):
                continue
            if z <= 0:
                continue
            dist = comoving_mpc(z)                  # Mpc
            if dist <= 0 or dist > QSO_MAX:
                continue
            buf += struct.pack("<HHHBB",
                int(round(clamp(ra / 360.0, 0, 1) * 65535)),
                int(round(clamp((dec + 90.0) / 180.0, 0, 1) * 65535)),
                int(round(clamp(dist / QSO_MAX, 0, 1) * 65535)),
                int(round(clamp(z * 20.0, 0, 255))), 0)     # z*20 -> byte
            n += 1
    open(dst, "wb").write(buf)
    print("quasars: %d -> %s (%d B)" % (n, dst, len(buf)))
    return n


if __name__ == "__main__":
    os.makedirs(DATA, exist_ok=True)
    pack_web()
    pack_qso()
