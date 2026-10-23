#!/usr/bin/env python3
"""Real moon orbits: osculating elements of each major moon about its parent planet
(JPL Horizons, planetocentric, ecliptic J2000), propagated in the app with Kepler's
equation — true phase, plane AND eccentricity (the Moon's 5 % e, Nereid's 0.75).
Writes the `moonEph` key of site/data/catalog.json:  {name: {a (km), e, i, om, w, ma, n, ep}}.
Re-run for a fresh epoch; perturbations drift the regular moons by well under a degree
over a year, the irregular ones (Nereid) by a few."""
import catalog, horizons
import datetime, sys

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


def main():
    epoch = datetime.date.today().isoformat()
    out = {}
    for name, (hid, center) in MOONS.items():
        try:
            kd = horizons.elements(hid, "500@%d" % center, epoch, "KM-D")
            kd = {k: (round(v, 8) if k != "ep" else v) for k, v in kd.items()}
            kd["a"] = round(kd["a"], 1)
            out[name] = kd
            print("// %-10s a=%9.0f km  e=%.4f  P=%6.2f d" % (name, kd["a"], kd["e"], 360.0 / kd["n"]), file=sys.stderr)
        except Exception as ex:
            print("// FAIL %s: %s" % (name, ex), file=sys.stderr)
    catalog.update(moonEph=out)


if __name__ == "__main__":
    main()
