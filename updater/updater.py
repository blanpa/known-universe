#!/usr/bin/env python3
"""Auto-updater for the Known Universe container.

Periodically fetches fresh raw data (exoplanets, galaxies, HYG stars), runs
build_data.py and writes data.json into the shared volume that
nginx serves. Runs as an endless loop.

Environment variables:
  UPDATE_INTERVAL  seconds between updates (default 604800 = 7 days)
  DST              target path of data.json (default /out/data.json)
"""
import os, time, shutil, subprocess, urllib.request, urllib.parse

INTERVAL = int(os.environ.get("UPDATE_INTERVAL", "604800"))
DST  = os.environ.get("DST", "/out/data.json")
WORK = "/work"
os.makedirs(WORK, exist_ok=True)

EXO_Q = ("select pl_name,hostname,ra,dec,sy_dist,disc_year,discoverymethod,"
         "disc_facility,st_teff,st_spectype,st_mass,st_lum,st_rad,pl_rade,"
         "pl_bmasse,pl_orbsmax,pl_orbper,pl_tranmid,sy_pnum "
         "from pscomppars where sy_dist is not null and ra is not null and dec is not null")
GAL_Q = 'SELECT * FROM "J/AJ/145/101/catalog" WHERE Dist IS NOT NULL AND Dist>0'
SBDB = ("https://ssd-api.jpl.nasa.gov/sbdb_query.api"
        "?fields=a,e,i,om,w,ma,epoch,H&")

URLS = {
    WORK + "/data-raw.csv":
        "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?"
        + urllib.parse.urlencode({"query": EXO_Q, "format": "csv"}),
    WORK + "/galaxies-raw.csv":
        "https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync?"
        + urllib.parse.urlencode({"REQUEST": "doQuery", "LANG": "ADQL",
                                  "FORMAT": "csv", "QUERY": GAL_Q}),
    WORK + "/hyg-raw.csv":
        "https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv",
    # small-body populations (positions are a snapshot -> refresh them each run)
    WORK + "/sb_mba.json": SBDB + "sb-class=MBA&limit=30000",
    WORK + "/sb_tjn.json": SBDB + "sb-class=TJN&limit=8000",
    WORK + "/sb_neo.json": SBDB + "sb-group=neo&limit=8000",
    WORK + "/sb_tno.json": SBDB + "sb-class=TNO&limit=3000",
}


def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "galactica-updater"})
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f:
        shutil.copyfileobj(r, f)


def run_once():
    for path, url in URLS.items():
        download(url, path)
    env = dict(os.environ,
               SRC=WORK + "/data-raw.csv",
               GSRC=WORK + "/galaxies-raw.csv",
               HSRC=WORK + "/hyg-raw.csv",
               DST=DST)
    subprocess.run(["python", "/app/build_data.py"], env=env, check=True)
    env2 = dict(os.environ, BELT_SRC=WORK,
                BELT_DST=os.path.join(os.path.dirname(DST), "belt.bin"))
    subprocess.run(["python", "/app/build_belt.py"], env=env2, check=True)


# live-extra: GW superevents + fireballs, hourly (their APIs lack CORS → proxied here)
def live_loop():
    import json, sys, threading
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    try:
        import fetch_live_extra
    except Exception as e:
        print("live-extra disabled:", repr(e), flush=True)
        return
    dst = os.path.join(os.path.dirname(DST), "live-extra.json")
    while True:
        try:
            data = fetch_live_extra.build()
            tmp = dst + ".tmp"
            with open(tmp, "w") as f:
                json.dump(data, f)
            os.replace(tmp, dst)
            print("live-extra ->", dst, flush=True)
        except Exception as e:
            print("live-extra failed:", repr(e), flush=True)
        time.sleep(3600)


import threading
threading.Thread(target=live_loop, daemon=True).start()

while True:
    try:
        print("update running…", flush=True)
        run_once()
        print("update done ->", DST, flush=True)
    except Exception as e:
        print("update failed:", repr(e), flush=True)
    time.sleep(INTERVAL)
