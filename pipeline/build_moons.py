#!/usr/bin/env python3
"""Real moon ephemerides: fetch each major moon's state vector relative to its
parent planet (JPL Horizons), and bake a circular-orbit propagation model:
  unit position at epoch, orbit normal (from r x v), angular rate (rad/day).
Gives the true orbital PHASE and PLANE for every moon (exact for near-circular
orbits; Nereid e=0.75 is the one poor fit). Emits `const MOON_EPH={...};` JS.
"""
import json, math, re, sys, urllib.request

EPOCH = "2026-07-11"

# app moon name -> (Horizons id, parent center id)
# exact sidereal periods (days) — the circular model then keeps phase long-term
PERIODS = {
    "Moon": 27.321661, "Phobos": 0.31891, "Deimos": 1.262441,
    "Amalthea": 0.498179, "Io": 1.769138, "Europa": 3.551181,
    "Ganymede": 7.154553, "Callisto": 16.689017,
    "Mimas": 0.942422, "Enceladus": 1.370218, "Tethys": 1.887802,
    "Dione": 2.736915, "Rhea": 4.5175, "Titan": 15.945421, "Iapetus": 79.330183,
    "Miranda": 1.413479, "Ariel": 2.520379, "Umbriel": 4.144177,
    "Titania": 8.705872, "Oberon": 13.463239,
    "Proteus": 1.122315, "Triton": 5.876854, "Nereid": 360.13619,
    "Charon": 6.38723, "Nix": 24.856, "Hydra": 38.202,
}

MOONS = {
    "Moon": (301, 399),
    "Phobos": (401, 499), "Deimos": (402, 499),
    "Amalthea": (505, 599), "Io": (501, 599), "Europa": (502, 599),
    "Ganymede": (503, 599), "Callisto": (504, 599),
    "Mimas": (601, 699), "Enceladus": (602, 699), "Tethys": (603, 699),
    "Dione": (604, 699), "Rhea": (605, 699), "Titan": (606, 699), "Iapetus": (608, 699),
    "Miranda": (705, 799), "Ariel": (701, 799), "Umbriel": (702, 799),
    "Titania": (703, 799), "Oberon": (704, 799),
    "Proteus": (808, 899), "Triton": (801, 899), "Nereid": (802, 899),
    "Charon": (901, 999), "Nix": (902, 999), "Hydra": (903, 999),
}


def fetch_vec(hid, center):
    url = ("https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND='%d'"
           "&EPHEM_TYPE=VECTORS&CENTER='500@%d'&START_TIME='%s'&STOP_TIME='2026-07-12'"
           "&STEP_SIZE='1d'&VEC_TABLE='2'&OUT_UNITS='KM-D'&REF_PLANE='ECLIPTIC'"
           % (hid, center, EPOCH))
    with urllib.request.urlopen(url, timeout=90) as r:
        txt = r.read().decode("utf-8", "replace")
    block = re.search(r"\$\$SOE(.*?)\$\$EOE", txt, re.S).group(1)
    jd = float(re.search(r"([\d.]+) = A\.D\.", block).group(1))
    def g(name):
        return float(re.search(name + r"\s*=\s*(-?[\d.]+E[+-]\d+)", block).group(1))
    return jd, [g("X"), g("Y"), g("Z")], [g("VX"), g("VY"), g("VZ")]


def cross(a, b):
    return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]


def norm(v):
    m = math.hypot(v[0], v[1], v[2])
    return [v[0]/m, v[1]/m, v[2]/m], m


def main():
    out = {}
    for name, (hid, center) in MOONS.items():
        try:
            jd, r, v = fetch_vec(hid, center)
            rhat, rmag = norm(r)
            nvec, _ = norm(cross(r, v))
            # angular rate: component of v perpendicular to r, over |r|  (rad/day)
            vr = sum(v[i]*rhat[i] for i in range(3))
            vperp = math.sqrt(max(0.0, sum(x*x for x in v) - vr*vr))
            w = 2*math.pi/PERIODS[name] if name in PERIODS else vperp/rmag
            per = 2*math.pi/w
            out[name] = dict(p=[round(x, 6) for x in rhat],
                             n=[round(x, 6) for x in nvec],
                             w=round(w, 8), ep=jd, rkm=round(rmag))
            print("// %-10s r=%8.0f km  P=%7.2f d  n=(%.2f,%.2f,%.2f)"
                  % (name, rmag, per, *nvec), file=sys.stderr)
        except Exception as ex:
            print("// FAIL %s: %s" % (name, ex), file=sys.stderr)
    print("const MOON_EPH=" + json.dumps(out, separators=(",", ":")) + ";")


if __name__ == "__main__":
    main()
