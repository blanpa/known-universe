#!/usr/bin/env python3
"""Pack the extragalactic point clouds for the WebGL renderer:
  - 2MRS redshift survey  -> the cosmic web / large-scale structure (dist from cz)
  - Milliquas quasar sample -> the distant universe (comoving distance from z)
Output: site/data/cosmicweb.bin and site/data/quasars.bin (8 bytes/object):
  uint16 ra, uint16 dec, uint16 dist, uint8 b6, uint8 b7   (little-endian)
Distances are decoded in JS to parsec. Both are flat-LCDM comoving distances (H0=70,
Om=0.3); the 2MRS heliocentric cz is first moved to the CMB rest frame (Planck 2018
dipole: 369.82 km/s toward l=264.021°, b=48.253°), which removes a systematic of up to
±370 km/s — several Mpc for the nearby web. Peculiar velocities remain (±300 km/s).
"""
import csv, math, os, struct

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)                  # repo root
RAW  = os.path.join(HERE, "raw")              # downloaded catalogue dumps (gitignored)
IN   = os.path.join(HERE, "inputs")           # curated, hand-maintained inputs
OUT  = os.path.join(ROOT, "site", "data")     # what the app is served from
DATA = OUT
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


# Solar motion with respect to the CMB (Planck 2018): 369.82 km/s toward l=264.021 b=48.253
V_CMB, L_APEX, B_APEX = 369.82, math.radians(264.021), math.radians(48.253)


def cz_cmb(cz, glon, glat):
    l, b = math.radians(glon), math.radians(glat)
    cosang = math.sin(b) * math.sin(B_APEX) + math.cos(b) * math.cos(B_APEX) * math.cos(l - L_APEX)
    return cz + V_CMB * cosang


def pack_web(src=os.path.join(RAW, "twomrs_raw.csv"),
             dst=os.path.join(DATA, "cosmicweb.bin")):
    buf = bytearray(); n = 0
    with open(src) as f:
        for r in csv.DictReader(f):
            try:
                ra = float(r["RAJ2000"]); dec = float(r["DEJ2000"]); cz = float(r["cz"])
                glon = float(r["GLON"]); glat = float(r["GLAT"])
            except (ValueError, KeyError):
                continue
            if cz <= 0:
                continue
            v = cz_cmb(cz, glon, glat)
            if v <= 0:
                continue
            dist = comoving_mpc(v / C)              # Mpc, flat LCDM
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


def pack_qso(src=os.path.join(RAW, "quasars_raw.csv"),
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
