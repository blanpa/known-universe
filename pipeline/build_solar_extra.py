#!/usr/bin/env python3
"""Fetch real positions for the 'complete solar system' layer:
  - human deep-space probes  (JPL Horizons state vectors, heliocentric ecliptic AU)
  - trans-Neptunian objects & Centaurs (JPL SBDB osculating elements)
Emits ready-to-paste JS constants (PROBES, TNOS) on stdout.
Horizons/SBDB are queried live; results are baked into the template as constants.
"""
import json, re, sys, urllib.parse, urllib.request

EPOCH = "2026-07-11"

PROBES = [  # Horizons id, name, symbolic render radius (km-equiv glyph), colour, launch year, target/note
    (-31,  "Voyager 1",    9, [120, 230, 255], 1977, "farthest human object — interstellar space"),
    (-32,  "Voyager 2",    9, [120, 210, 255], 1977, "interstellar space (since 2018)"),
    (-23,  "Pioneer 10",   8, [200, 180, 255], 1972, "toward Aldebaran"),
    (-24,  "Pioneer 11",   8, [200, 180, 255], 1973, "first Saturn flyby"),
    (-98,  "New Horizons", 8, [255, 210, 140], 2006, "Pluto & Arrokoth flyby"),
    (-170, "JWST",         6, [255, 170, 120], 2021, "Sun–Earth L2 observatory"),
    (-96,  "Parker Solar Probe", 6, [255, 200, 90], 2018, "fastest human object — grazing the Sun"),
    (-139479, "Gaia",      6, [190, 220, 255], 2013, "at L2 — mapped 1.8 billion stars"),
    (-28,  "JUICE",        6, [160, 235, 190], 2023, "en route to Jupiter\u2019s icy moons (2031)"),
    (-121, "BepiColombo",  6, [255, 190, 140], 2018, "en route to Mercury orbit"),
    (-49,  "Lucy",         6, [220, 200, 150], 2021, "touring the Jupiter trojans"),
    (-255, "Psyche",       6, [200, 190, 230], 2023, "to the metal asteroid Psyche (2029)"),
    (-159, "Europa Clipper",6,[170, 215, 255], 2024, "to Europa\u2019s subsurface ocean (2030)"),
]

# TNOs & Centaurs: SBDB designation -> (render radius km, colour, note)
TNOS = [
    ("Sedna",     500, [220, 130, 110], "extreme detached TNO (aphelion ~937 AU)"),
    ("Quaoar",    545, [200, 170, 150], "TNO with ring & moon Weywot"),
    ("Gonggong",  615, [210, 140, 120], "scattered-disc dwarf, moon Xiangliu"),
    ("Orcus",     460, [180, 190, 210], "plutino, moon Vanth"),
    ("Varuna",    335, [205, 175, 150], "classical TNO"),
    ("Ixion",     310, [200, 160, 140], "plutino"),
    ("Salacia",   430, [190, 195, 205], "TNO, moon Actaea"),
    ("307261",    400, [205, 180, 160], "2002 MS4, large classical TNO"),
    ("Arrokoth",  18,  [210, 160, 130], "New Horizons 2019 flyby (contact binary)"),
    ("Chariklo",  129, [180, 200, 210], "largest Centaur, has rings"),
    ("Chiron",    105, [190, 205, 215], "Centaur / comet 95P"),
    ("Pholus",    100, [210, 150, 120], "very red Centaur"),
]


def http_text(url):
    with urllib.request.urlopen(url, timeout=90) as r:
        return r.read().decode("utf-8", "replace")


def fetch_probe(hid):
    url = ("https://ssd.jpl.nasa.gov/api/horizons.api?format=text&COMMAND='%d'"
           "&EPHEM_TYPE=VECTORS&CENTER='500@10'&START_TIME='%s'&STOP_TIME='2026-07-12'"
           "&STEP_SIZE='1d'&VEC_TABLE='2'&OUT_UNITS='AU-D'" % (hid, EPOCH))
    txt = http_text(url)
    block = re.search(r"\$\$SOE(.*?)\$\$EOE", txt, re.S).group(1)
    jd = float(re.search(r"([\d.]+) = A\.D\.", block).group(1))
    def g(name):
        return float(re.search(name + r"\s*=\s*(-?[\d.]+E[+-]\d+)", block).group(1))
    return jd, [g("X"), g("Y"), g("Z")], [g("VX"), g("VY"), g("VZ")]


def fetch_tno(des):
    url = "https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=%s&full-prec=false" % urllib.parse.quote(des)
    d = json.loads(http_text(url))
    orb = d["orbit"]
    ep = float(orb["epoch"])
    el = {e["name"]: e["value"] for e in orb["elements"]}
    name = d["object"].get("shortname") or d["object"].get("fullname") or des
    # SBDB gives a,e,i,om,w,ma; n (mean motion, deg/day) may be present, else derive
    a = float(el["a"]); e = float(el["e"])
    n = float(el["n"]) if "n" in el and el["n"] else 0.9856076686 / (a ** 1.5)  # deg/day
    return name, dict(a=a, e=e, i=float(el["i"]), om=float(el["om"]),
                      w=float(el["w"]), ma=float(el["ma"]), n=n, ep=ep)


def main():
    probes = []
    for hid, name, rk, c, yr, note in PROBES:
        try:
            jd, p, v = fetch_probe(hid)
            probes.append(dict(n=name, rk=rk, c=c, launch=yr, note=note,
                               p=[round(x, 4) for x in p], v=[round(x, 8) for x in v], ep=jd))
            print("// probe OK: %-14s r=%.1f AU" % (name, sum(x*x for x in p) ** .5), file=sys.stderr)
        except Exception as ex:
            print("// probe FAIL %s: %s" % (name, ex), file=sys.stderr)
    tnos = []
    for des, rk, c, note in TNOS:
        try:
            name, kd = fetch_tno(des)
            short = name.split("(")[0].strip()
            short = re.sub(r"^\d+\s+", "", short)  # strip leading number
            kd = {k: round(v, 8) for k, v in kd.items()}
            tnos.append(dict(n=short, rk=rk, c=c, note=note, kd=kd))
            print("// tno OK: %-12s a=%.1f AU e=%.2f" % (short, kd["a"], kd["e"]), file=sys.stderr)
        except Exception as ex:
            print("// tno FAIL %s: %s" % (des, ex), file=sys.stderr)

    def js(o):
        return json.dumps(o, separators=(",", ":"), ensure_ascii=False)
    print("const PROBES=" + js(probes) + ";")
    print("const TNOS=" + js(tnos) + ";")


if __name__ == "__main__":
    main()
