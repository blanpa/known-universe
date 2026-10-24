#!/usr/bin/env python3
"""Pack the Gaia DR3 solar neighbourhood into the point-cloud files the renderer reads.

Input : pipeline/raw/gaia_150pc_q.csv from fetch_gaia.py (source_id, ra, dec, parallax,
        parallax_error, pmra, pmdec, pmra_error, pmdec_error, ruwe, phot_g_mean_mag, bp_rp,
        radial_velocity, r_med_geo, r_lo_geo, r_hi_geo); the older gaia_100pc_pm.csv
        (ra, dec, parallax, phot_g_mean_mag, bp_rp, pmra, pmdec) still works, without the
        quality file.
Output, three files per set, one record per star in the same order:
  gaia.bin     8 B  <HHHBB  ra/360·65535, (dec+90)/180·65535, dist/maxd·65535, (G+2)/28·255, (BP−RP+1)/6·255
               dist is the Bailer-Jones geometric median r_med_geo when present, else 1000/ϖ
  gaia_pm.bin  4 B  <hh     pmRA*, pmDec in mas/yr (±32767)
  gaia_q.bin  12 B  <HHBBHHh e_ϖ ×100 (0.01 mas), e_μ ×100 (0.01 mas/yr, hypot of both), RUWE ×20,
                           flags (bit0 Bailer-Jones distance, bit1 radial velocity), dist 16th and
                           84th percentile /maxd·65535 (from r_lo/r_hi_geo, else ϖ ± σ), RV ×10 km/s
The default set is everything within 100 pc (ϖ > 10 mas); --big writes the 150 pc set
(gaiabig*.bin, dist scaled to 150 pc) for the Docker image.
"""
import csv, os, struct, sys

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
RAW = os.path.join(HERE, "raw"); OUT = os.path.join(ROOT, "site", "data")
def clamp(v, lo, hi): return lo if v < lo else hi if v > hi else v
def num(r, k):
    try: v = float(r[k]); return v if v == v else None
    except (ValueError, KeyError, TypeError): return None

def pack(src, dst, dst_pm, dst_q, maxd):
    buf = bytearray(); pm = bytearray(); q = bytearray(); n = n_bj = n_rv = 0
    with open(src) as f:
        rd = csv.DictReader(f); hasq = "parallax_error" in rd.fieldnames
        for r in rd:
            ra = num(r, "ra"); dec = num(r, "dec"); plx = num(r, "parallax"); mag = num(r, "phot_g_mean_mag")
            if None in (ra, dec, plx, mag) or plx <= 0: continue
            bj = num(r, "r_med_geo"); dist = bj if bj and bj > 0 else 1000.0 / plx
            if dist > maxd or dist <= 0: continue
            bprp = num(r, "bp_rp"); bprp = 1.0 if bprp is None else bprp
            buf += struct.pack("<HHHBB", int(round(clamp(ra / 360.0, 0, 1) * 65535)), int(round(clamp((dec + 90.0) / 180.0, 0, 1) * 65535)),
                               int(round(clamp(dist / maxd, 0, 1) * 65535)), int(round(clamp((mag + 2.0) / 28.0, 0, 1) * 255)), int(round(clamp((bprp + 1.0) / 6.0, 0, 1) * 255)))
            pra = num(r, "pmra") or 0.0; pde = num(r, "pmdec") or 0.0
            pm += struct.pack("<hh", int(clamp(round(pra), -32767, 32767)), int(clamp(round(pde), -32767, 32767)))
            if hasq:
                eplx = num(r, "parallax_error") or 0.0; epr = num(r, "pmra_error") or 0.0; epd = num(r, "pmdec_error") or 0.0
                ruwe = num(r, "ruwe") or 0.0; rv = num(r, "radial_velocity"); lo = num(r, "r_lo_geo"); hi = num(r, "r_hi_geo")
                flags = 0
                if bj and bj > 0 and lo and hi: flags |= 1
                else: lo = 1000.0 / (plx + eplx); hi = 1000.0 / (plx - eplx) if plx - eplx > 0 else maxd
                if rv is not None: flags |= 2; n_rv += 1
                if flags & 1: n_bj += 1
                q += struct.pack("<HHBBHHh", int(clamp(round(eplx * 100), 0, 65535)), int(clamp(round((epr * epr + epd * epd) ** 0.5 * 100), 0, 65535)),
                                 int(clamp(round(ruwe * 20), 0, 255)), flags, int(round(clamp(lo / maxd, 0, 1) * 65535)), int(round(clamp(hi / maxd, 0, 1) * 65535)),
                                 int(clamp(round((rv or 0.0) * 10), -32767, 32767)))
            n += 1
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    open(dst, "wb").write(buf); open(dst_pm, "wb").write(pm)
    if hasq: open(dst_q, "wb").write(q)
    elif os.path.exists(dst_q): os.remove(dst_q)
    print(f"packed {n} Gaia stars -> {dst} ({len(buf)/1048576:.2f} MB), {dst_pm} ({len(pm)/1048576:.2f} MB)"
          + (f", {dst_q} ({len(q)/1048576:.2f} MB; Bailer-Jones distance for {n_bj}, radial velocity for {n_rv})" if hasq else " — no quality columns in the input"))
    return n

if __name__ == "__main__":
    src = os.path.join(RAW, "gaia_150pc_q.csv")
    if not os.path.exists(src): src = os.path.join(RAW, "gaia_150pc_pm.csv" if "--big" in sys.argv else "gaia_100pc_pm.csv")
    if "--big" in sys.argv:
        pack(src, os.path.join(OUT, "gaiabig.bin"), os.path.join(OUT, "gaiabig_pm.bin"), os.path.join(OUT, "gaiabig_q.bin"), 150.0)
    else:
        pack(src, os.path.join(OUT, "gaia.bin"), os.path.join(OUT, "gaia_pm.bin"), os.path.join(OUT, "gaia_q.bin"), 100.0)
