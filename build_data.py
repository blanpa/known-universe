#!/usr/bin/env python3
"""Builds data.json from three raw dumps:

  data-raw.csv      NASA Exoplanet Archive   -> star systems + planets (+ instrument)
  galaxies-raw.csv  Local Volume catalogue   -> nearby galaxies
  hyg-raw.csv       HYG (Hipparcos+Yale+Gliese) -> real stars of the neighbourhood

Positions: RA/Dec/distance -> Cartesian coordinates (Sun at the origin).
Paths can be overridden via env vars SRC/GSRC/HSRC/DST (for the
auto-update container).
"""
import csv, json, math, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.environ.get("SRC",  os.path.join(HERE, "data-raw.csv"))
GSRC = os.environ.get("GSRC", os.path.join(HERE, "galaxies-raw.csv"))
HSRC = os.environ.get("HSRC", os.path.join(HERE, "hyg-raw.csv"))
DST  = os.environ.get("DST",  os.path.join(HERE, "site", "data", "data.json"))


# ---------- Colours ----------
def temp_color(t):
    if not t: return [150, 160, 190]
    if t >= 30000: return [155, 176, 255]
    if t >= 10000: return [170, 191, 255]
    if t >= 7500:  return [202, 215, 255]
    if t >= 6000:  return [248, 247, 255]
    if t >= 5200:  return [255, 244, 232]
    if t >= 3700:  return [255, 210, 161]
    return [255, 181, 108]

def teff_from_bv(bv):
    # Ballesteros 2012
    try: bv = float(bv)
    except (ValueError, TypeError): return 0
    return 4600 * (1 / (0.92 * bv + 1.7) + 1 / (0.92 * bv + 0.62))


# ---------- Discovery instrument -> category ----------
def facility_cat(method, facility):
    m = (method or "").lower(); f = facility or ""
    if "microlens" in m: return "micro"
    if "imaging" in m:   return "imaging"
    if "radial velocity" in m: return "rv"
    if "transit" in m:
        if "K2" in f: return "k2"
        if "Kepler" in f: return "kepler"
        if "TESS" in f: return "tess"
        return "ground"
    if "K2" in f: return "k2"
    if "Kepler" in f: return "kepler"
    if "TESS" in f: return "tess"
    return "other"


# ---------- Exoplanets ----------
def build_stars():
    stars = {}
    with open(SRC) as f:
        for row in csv.DictReader(f):
            try:
                ra = float(row["ra"]); dec = float(row["dec"]); d = float(row["sy_dist"])
            except (ValueError, KeyError):
                continue
            rr, dr = math.radians(ra), math.radians(dec)
            x = d * math.cos(dr) * math.cos(rr)
            y = d * math.cos(dr) * math.sin(rr)
            z = d * math.sin(dr)
            host = row["hostname"]
            try:    yr = int(row["disc_year"])
            except (ValueError, KeyError): yr = 0
            try:    teff = float(row["st_teff"])
            except (ValueError, KeyError): teff = 0
            cat = facility_cat(row.get("discoverymethod"), row.get("disc_facility"))
            pl = {"n": row["pl_name"], "y": yr, "m": row["discoverymethod"], "fc": cat}
            for key, s in (("r", "pl_rade"), ("ma", "pl_bmasse")):
                try: pl[key] = round(float(row[s]), 2)
                except (ValueError, KeyError): pass
            # semi-major axis (AU): measured, else Kepler's 3rd law from period + stellar mass
            a_au = None
            try:
                a_au = float(row["pl_orbsmax"])
            except (ValueError, KeyError):
                try:
                    per_yr = float(row["pl_orbper"]) / 365.25
                    try: mass = float(row["st_mass"]) or 1.0
                    except (ValueError, KeyError, TypeError): mass = 1.0
                    a_au = (mass * per_yr * per_yr) ** (1.0 / 3.0)
                except (ValueError, KeyError):
                    pass
            if a_au:
                pl["a"] = round(a_au, 5)
            # transit ephemeris -> real orbital phase (t0 = BJD mid-transit)
            try: pl["per"] = round(float(row["pl_orbper"]), 5)
            except (ValueError, KeyError): pass
            try: pl["t0"] = round(float(row["pl_tranmid"]), 4)
            except (ValueError, KeyError): pass
            if host not in stars:
                # stellar luminosity (solar) for the habitable zone
                lum = None
                try:
                    lum = 10.0 ** float(row["st_lum"])
                except (ValueError, KeyError, TypeError):
                    try:
                        rad = float(row["st_rad"])
                        lum = rad * rad * (teff / 5772.0) ** 4 if teff else None
                    except (ValueError, KeyError, TypeError):
                        lum = None
                stars[host] = {"h": host, "x": round(x, 2), "y": round(y, 2),
                               "z": round(z, 2), "d": round(d, 2), "t": teff,
                               "sp": row["st_spectype"], "p": []}
                if lum:
                    stars[host]["lum"] = round(lum, 4)
            stars[host]["p"].append(pl)
    out = []
    for s in stars.values():
        yrs = [p["y"] for p in s["p"] if p["y"]]
        s["fy"] = min(yrs) if yrs else 0
        # most common instrument category of the system
        cnt = {}
        for p in s["p"]: cnt[p["fc"]] = cnt.get(p["fc"], 0) + 1
        s["fac"] = max(cnt, key=cnt.get)
        out.append(s)
    out.sort(key=lambda s: s["d"])
    return out


# ---------- Galaxies ----------
COMMON = {
 'MESSIER031':'Andromeda · M31','MESSIER033':'Triangulum · M33',
 'MESSIER081':"Bode's Galaxy · M81",'MESSIER082':'Cigar Galaxy · M82',
 'MESSIER101':'Pinwheel · M101','MESSIER051':'Whirlpool · M51',
 'NGC5194':'Whirlpool · M51','MESSIER104':'Sombrero · M104',
 'NGC4594':'Sombrero · M104','LMC':'Large Magellanic Cloud',
 'SMC':'Small Magellanic Cloud','NGC0253':'Sculptor Galaxy',
 'NGC5128':'Centaurus A','MESSIER032':'M32','NGC0205':'M110',
 'MESSIER049':'M49','MESSIER087':'M87 · Virgo A','NGC0300':'NGC 300',
 'NGC0055':'NGC 55','NGC0247':'NGC 247','IC0342':'IC 342',
 'MESSIER094':'M94','NGC4736':'M94','MESSIER083':'Southern Pinwheel · M83',
 'NGC5236':'Southern Pinwheel · M83','MESSIER106':'M106','NGC4258':'M106',
 'MESSIER064':'Black Eye · M64','NGC4826':'Black Eye · M64',
 'NGC6822':"Barnard's Galaxy",'IC0010':'IC 10','NGC0224':'Andromeda · M31',
}

def gtype(t):
    try: t = float(t)
    except (ValueError, TypeError): return ('dSph', [150, 170, 205])
    if t <= -3:   return ('E',  [255, 222, 176])
    if t <= -0.5: return ('S0', [255, 233, 205])
    if t < 9.5:   return ('Sp', [199, 219, 255])
    return ('Irr', [172, 198, 238])

def pretty(nm):
    m = re.match(r'^([A-Za-z]+)0*(\d+.*)$', nm)
    return m.group(1).upper() + ' ' + m.group(2) if m else nm

def build_galaxies():
    gals = []
    if not os.path.exists(GSRC): return gals
    # measured position angles (LEDA match, see galaxy_pa.json) for oriented disks
    pa_map = {}
    pa_path = os.path.join(HERE, "galaxy_pa.json")
    if os.path.exists(pa_path):
        pa_map = json.load(open(pa_path))
    with open(GSRC) as f:
        for r in csv.DictReader(f):
            try:
                ra = float(r["RAJ2000"]); dec = float(r["DEJ2000"]); d = float(r["Dist"])
            except (ValueError, KeyError):
                continue
            rr, dr = math.radians(ra), math.radians(dec)
            dx = math.cos(dr) * math.cos(rr); dy = math.cos(dr) * math.sin(rr); dz = math.sin(dr)
            cat, col = gtype(r.get("TT"))
            try: kpc = round(float(r["A26"]), 1)
            except (ValueError, KeyError): kpc = 0
            nm = r["Name"]; fam = nm in COMMON
            rec = {"n": COMMON.get(nm, pretty(nm)), "id": pretty(nm),
                   "f": 1 if fam else 0, "dx": round(dx, 4), "dy": round(dy, 4),
                   "dz": round(dz, 4), "mpc": round(d, 3), "kpc": kpc,
                   "c": col, "t": cat, "ra": round(ra, 3), "de": round(dec, 3)}
            try:
                ba = float(r["b/a"])
                if 0 < ba <= 1: rec["ba"] = round(ba, 2)
            except (ValueError, KeyError, TypeError):
                pass
            if nm in pa_map: rec["pa"] = pa_map[nm]
            gals.append(rec)
    gals.sort(key=lambda g: (-g["f"], g["mpc"]))
    return gals


# ---------- HYG stars ----------
def build_hyg():
    out = []
    if not os.path.exists(HSRC): return out
    with open(HSRC) as f:
        for r in csv.DictReader(f):
            try:
                ra = float(r["ra"]) * 15.0            # hours -> degrees
                dec = float(r["dec"]); d = float(r["dist"]); mag = float(r["mag"])
            except (ValueError, KeyError):
                continue
            if d <= 0: continue
            if mag > 6.5 and d > 25: continue         # naked eye OR neighbourhood
            rr, dr = math.radians(ra), math.radians(dec)
            dx = math.cos(dr) * math.cos(rr); dy = math.cos(dr) * math.sin(rr); dz = math.sin(dr)
            teff = teff_from_bv(r.get("ci"))
            rec = {"dx": round(dx, 4), "dy": round(dy, 4), "dz": round(dz, 4),
                   "d": round(d, 2), "m": round(mag, 2), "c": temp_color(teff)}
            try: rec["pr"] = round(float(r["pmra"]), 1)      # proper motion (mas/yr)
            except (ValueError, KeyError): pass
            try: rec["pd"] = round(float(r["pmdec"]), 1)
            except (ValueError, KeyError): pass
            if r.get("proper"):
                rec["n"] = r["proper"]
                if r.get("con"): rec["con"] = r["con"]
            out.append(rec)
    out.sort(key=lambda s: s["m"])                    # hellste zuerst
    return out


# ---------- Constellation lines ----------
def build_constellations():
    path = os.path.join(HERE, "constlines.json")
    if not os.path.exists(path):
        return []
    data = json.load(open(path))
    out = []
    for feat in data.get("features", []):
        cid = feat.get("id", "?")
        geom = feat["geometry"]
        lines = geom["coordinates"] if geom["type"] == "MultiLineString" else [geom["coordinates"]]
        polylines = []
        sx = sy = sz = 0.0; n = 0
        for line in lines:
            pl = []
            for pt in line:
                ra, dec = float(pt[0]), float(pt[1])
                pl += [round(ra, 2), round(dec, 2)]
                rr, dr = math.radians(ra), math.radians(dec)
                sx += math.cos(dr) * math.cos(rr); sy += math.cos(dr) * math.sin(rr); sz += math.sin(dr); n += 1
            polylines.append(pl)
        if n:
            L = math.sqrt(sx * sx + sy * sy + sz * sz) or 1.0
            cen = [round(sx / L, 3), round(sy / L, 3), round(sz / L, 3)]
        else:
            cen = [0, 0, 0]
        out.append({"id": cid, "L": polylines, "c": cen})
    return out


# ---------- Assemble ----------
stars = build_stars()
gals  = build_galaxies()
hyg   = build_hyg()
cons  = build_constellations()

years = sorted({p["y"] for s in stars for p in s["p"] if p["y"]})
meta = {"nStars": len(stars), "nPlanets": sum(len(s["p"]) for s in stars),
        "minYear": years[0], "maxYear": years[-1],
        "maxDist": round(max(s["d"] for s in stars), 1)}
if gals:
    meta.update({"nGal": len(gals),
                 "minMpc": round(min(g["mpc"] for g in gals), 3),
                 "maxMpc": round(max(g["mpc"] for g in gals), 1),
                 "nFamous": sum(g["f"] for g in gals)})
if hyg:
    meta.update({"nHyg": len(hyg), "nHygNamed": sum(1 for s in hyg if s.get("n"))})
if cons:
    meta["nCons"] = len(cons)
meta["nLum"] = sum(1 for s in stars if "lum" in s)

os.makedirs(os.path.dirname(DST), exist_ok=True)
with open(DST, "w") as f:
    json.dump({"meta": meta, "stars": stars, "galaxies": gals, "hyg": hyg,
               "constellations": cons}, f, separators=(",", ":"))
print("written:", DST)
print(json.dumps(meta, indent=2))
