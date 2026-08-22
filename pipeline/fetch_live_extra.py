#!/usr/bin/env python3
"""Build live-extra.json: GW superevents (GraceDB) + recent fireballs (JPL CNEOS).

Both APIs lack CORS headers, so the browser cannot call them directly. This runs
server-side instead: hourly in the updater container (docker), and on a schedule
in the live-data GitHub Action (served to Pages via raw.githubusercontent.com).

Usage: fetch_live_extra.py [outfile]   (stdout when no outfile)
"""
import json, os, sys, urllib.request
from datetime import datetime, timezone

GPS_UTC = 315964782   # GPS epoch 1980-01-06 as Unix time, minus 18 leap seconds


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "galactica-live"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def build():
    out = {"ts": int(datetime.now(timezone.utc).timestamp() * 1000)}
    try:
        # production events only (no MDC/test), keep the significant ones (FAR < ~1/3 yr)
        d = get("https://gracedb.ligo.org/api/superevents/"
                "?query=category:%20production&count=60&format=json")
        out["gw"] = [{
            "id": s.get("superevent_id"),
            "t": int((float(s.get("t_0") or 0) + GPS_UTC) * 1000),
            "far": s.get("far"),
            "labels": (s.get("labels") or [])[:6],
        } for s in d.get("superevents", [])
            if (s.get("far") or 1) < 1e-8][:10]
    except Exception as e:
        print("gracedb failed:", repr(e), file=sys.stderr)
    try:
        d = get("https://ssd-api.jpl.nasa.gov/fireball.api?limit=30")
        fi = {k: i for i, k in enumerate(d["fields"])}
        fbs = []
        for row in d["data"]:
            if row[fi["lat"]] is None or row[fi["lon"]] is None:
                continue
            t = datetime.strptime(row[fi["date"]], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
            fbs.append({
                "t": int(t.timestamp() * 1000),
                "kt": float(row[fi["impact-e"]] or 0),
                "lat": float(row[fi["lat"]]) * (1 if row[fi["lat-dir"]] == "N" else -1),
                "lon": float(row[fi["lon"]]) * (1 if row[fi["lon-dir"]] == "E" else -1),
                "vel": float(row[fi["vel"]]) if row[fi["vel"]] else None,
            })
        out["fireballs"] = fbs
    except Exception as e:
        print("fireballs failed:", repr(e), file=sys.stderr)
    return out


if __name__ == "__main__":
    data = build()
    if len(sys.argv) > 1:
        tmp = sys.argv[1] + ".tmp"
        with open(tmp, "w") as f:
            json.dump(data, f)
        os.replace(tmp, sys.argv[1])
    else:
        json.dump(data, sys.stdout)
