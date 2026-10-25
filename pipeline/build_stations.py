#!/usr/bin/env python3
"""catalog.json ← stations: humanity's crewed space stations (pipeline/stations.json, hand-compiled).

    python3 pipeline/build_stations.py
"""
import json, os
from catalog import update

HERE = os.path.dirname(os.path.abspath(__file__))
src = json.load(open(os.path.join(HERE, "stations.json")))["stations"]
for s in src:
    for k in ("n", "op", "from", "mass", "alt", "inc", "wiki"):
        assert k in s, (s.get("n"), k)
    assert s["to"] is None or s["to"] > s["from"], s["n"]
update(stations=src)
