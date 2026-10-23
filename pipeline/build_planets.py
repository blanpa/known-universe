#!/usr/bin/env python3
"""Osculating elements of the eight planets at a recent epoch (JPL Horizons, heliocentric,
ecliptic J2000). Near the epoch these beat the long-term Standish formulas by an order of
magnitude (Mercury: 0.7° → arcminutes); the engine uses them within ±2 years of the epoch
and falls back to Standish beyond, where perturbations would drift a Kepler orbit.
Writes the `planetsOsc` key of site/data/catalog.json."""
import datetime, sys
import catalog, horizons

PLANETS = {"Mercury": 199, "Venus": 299, "Earth": 399, "Mars": 499,
           "Jupiter": 599, "Saturn": 699, "Uranus": 799, "Neptune": 899}


def main():
    epoch = datetime.date.today().isoformat()
    out = {}
    for name, hid in PLANETS.items():
        try:
            kd = horizons.elements(hid, "500@10", epoch, "AU-D")
            kd = {k: (round(v, 9) if k != "ep" else v) for k, v in kd.items()}
            out[name] = kd
            print("// %-8s a=%.5f AU e=%.5f i=%.3f  epoch JD %.1f" % (name, kd["a"], kd["e"], kd["i"], kd["ep"]), file=sys.stderr)
        except Exception as ex:
            print("// FAIL %s: %s" % (name, ex), file=sys.stderr)
    catalog.update(planetsOsc=out)


if __name__ == "__main__":
    main()
