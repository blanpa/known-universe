#!/usr/bin/env python3
"""Download the fresh source catalogues and rebuild data.json + belt.bin.

Sources: NASA Exoplanet Archive (pscomppars), Local Volume galaxies (VizieR),
HYG star catalogue, JPL SBDB small-body populations. Shared by the docker
updater (hot loop) and the weekly-data GitHub Action (Pages refresh) so the
queries live in exactly one place.

Usage: refresh_data.py <work_dir> <data_json_dst> [builders_dir]
"""
import os, shutil, subprocess, sys, urllib.parse, urllib.request

EXO_Q = ("select pl_name,hostname,ra,dec,sy_dist,disc_year,discoverymethod,"
         "disc_facility,st_teff,st_spectype,st_mass,st_lum,st_rad,pl_rade,"
         "pl_bmasse,pl_orbsmax,pl_orbper,pl_tranmid,sy_pnum "
         "from pscomppars where sy_dist is not null and ra is not null and dec is not null")
GAL_Q = 'SELECT * FROM "J/AJ/145/101/catalog" WHERE Dist IS NOT NULL AND Dist>0'
SBDB = ("https://ssd-api.jpl.nasa.gov/sbdb_query.api"
        "?fields=a,e,i,om,w,ma,epoch,H&")


def urls(work):
    return {
        os.path.join(work, "data-raw.csv"):
            "https://exoplanetarchive.ipac.caltech.edu/TAP/sync?"
            + urllib.parse.urlencode({"query": EXO_Q, "format": "csv"}),
        os.path.join(work, "galaxies-raw.csv"):
            "https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync?"
            + urllib.parse.urlencode({"REQUEST": "doQuery", "LANG": "ADQL",
                                      "FORMAT": "csv", "QUERY": GAL_Q}),
        os.path.join(work, "hyg-raw.csv"):
            "https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv",
        # small-body populations (positions are a snapshot -> refresh them each run)
        os.path.join(work, "sb_mba.json"): SBDB + "sb-class=MBA&limit=30000",
        os.path.join(work, "sb_tjn.json"): SBDB + "sb-class=TJN&limit=8000",
        os.path.join(work, "sb_neo.json"): SBDB + "sb-group=neo&limit=8000",
        os.path.join(work, "sb_tno.json"): SBDB + "sb-class=TNO&limit=3000",
    }


def download(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "galactica-updater"})
    with urllib.request.urlopen(req, timeout=300) as r, open(path, "wb") as f:
        shutil.copyfileobj(r, f)


def refresh(work, dst, builders="/app"):
    os.makedirs(work, exist_ok=True)
    for path, url in urls(work).items():
        print("fetch", url.split("?")[0], flush=True)
        download(url, path)
    env = dict(os.environ,
               SRC=os.path.join(work, "data-raw.csv"),
               GSRC=os.path.join(work, "galaxies-raw.csv"),
               HSRC=os.path.join(work, "hyg-raw.csv"),
               DST=dst)
    subprocess.run([sys.executable, os.path.join(builders, "build_data.py")], env=env, check=True)
    env2 = dict(os.environ, BELT_SRC=work,
                BELT_DST=os.path.join(os.path.dirname(dst), "belt.bin"))
    subprocess.run([sys.executable, os.path.join(builders, "build_belt.py")], env=env2, check=True)


if __name__ == "__main__":
    work = sys.argv[1] if len(sys.argv) > 1 else "/tmp/galactica-work"
    dst = sys.argv[2] if len(sys.argv) > 2 else "site/data/data.json"
    builders = sys.argv[3] if len(sys.argv) > 3 else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    refresh(work, os.path.abspath(dst), builders)
