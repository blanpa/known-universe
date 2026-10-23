"""site/data/catalog.json — the small baked catalogues the app loads next to data.json
(moon ephemerides, probe trajectories, TNOs, numbered comets, pulsars, open clusters,
globulars, FRBs). Builders update their own keys in place; everything else is kept."""
import json, os

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "site", "data", "catalog.json")


def update(**entries):
    cat = json.load(open(OUT)) if os.path.exists(OUT) else {}
    cat.update(entries)
    with open(OUT, "w") as f:
        json.dump(cat, f, separators=(",", ":"), ensure_ascii=False)
    print("catalog.json ← " + ", ".join("%s (%d)" % (k, len(v)) for k, v in entries.items()))
