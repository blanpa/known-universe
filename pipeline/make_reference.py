#!/usr/bin/env python3
"""Reference values from astropy/ERFA for tools/astro-check.mjs (the app's own astrometry
must agree with them). Needs astropy; run on demand, the JSON is committed:
  python3 pipeline/make_reference.py
"""
import json, os
import numpy as np, erfa
from astropy.time import Time
from astropy.coordinates import SkyCoord, EarthLocation, AltAz, TETE, GCRS, get_sun, get_body, solar_system_ephemeris
import astropy.units as u
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(os.path.dirname(HERE), "tools", "reference", "astro.json")
dates = ["2000-01-01T12:00:00", "2010-06-15T03:20:00", "2026-10-24T20:30:00", "2033-02-01T00:00:00", "2045-12-31T23:59:00"]
stars = {"Sirius": (101.287155, -16.716116), "Vega": (279.234735, 38.783689), "Polaris": (37.954561, 89.264109), "Alcyone": (56.871152, 24.105136), "Antares": (247.351915, -26.432003), "Acrux": (186.649563, -63.099093)}
sites = {"Munich": (48.137, 11.575, 520.0), "Cape Town": (-33.925, 18.424, 25.0), "Mauna Kea": (19.8207, -155.4681, 4205.0)}
out = {"dates": [], "stars": stars, "sites": sites}
for ds in dates:
    t = Time(ds, scale="utc"); tt = t.tt; T = (tt.jd - 2451545.0) / 36525.0
    rec = {"utc": ds, "jd_utc": t.jd, "jd_tt": tt.jd, "delta_t_s": float((tt.jd - t.jd) * 86400)}
    dpsi, deps = erfa.nut00b(tt.jd1, tt.jd2); rec["nut00b"] = {"dpsi_arcsec": float(np.degrees(dpsi) * 3600), "deps_arcsec": float(np.degrees(deps) * 3600)}
    dpsiA, depsA = erfa.nut06a(tt.jd1, tt.jd2); rec["nut06a"] = {"dpsi_arcsec": float(np.degrees(dpsiA) * 3600), "deps_arcsec": float(np.degrees(depsA) * 3600)}
    rec["pnm06a"] = np.asarray(erfa.pnm06a(tt.jd1, tt.jd2)).tolist()           # bias-precession-nutation matrix (IAU 2006/2000A)
    rec["pmat06"] = np.asarray(erfa.pmat06(tt.jd1, tt.jd2)).tolist()           # precession only (J2000 → date)
    rec["obl06_arcsec"] = float(np.degrees(erfa.obl06(tt.jd1, tt.jd2)) * 3600)
    rec["gast_deg"] = float(t.sidereal_time("apparent", "greenwich").deg); rec["gmst_deg"] = float(t.sidereal_time("mean", "greenwich").deg)
    rec["era_deg"] = float(np.degrees(erfa.era00(t.ut1.jd1, t.ut1.jd2)))
    s = get_sun(t); rec["sun_gcrs"] = {"ra": float(s.ra.deg), "dec": float(s.dec.deg)}
    st = s.transform_to(TETE(obstime=t)); rec["sun_tete"] = {"ra": float(st.ra.deg), "dec": float(st.dec.deg)}
    # planets and the Moon: geocentric apparent (TETE) from the JPL DE440s kernel when jplephem has it, else astropy's built-in (erfa, ~arcsec)
    rec["planets"] = {}
    try: solar_system_ephemeris.set("de440s"); rec["planet_ephemeris"] = "de440s"
    except Exception: rec["planet_ephemeris"] = "builtin"
    for body in ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "moon"]:
        try:
            b = get_body(body, t); bt = b.transform_to(TETE(obstime=t))
            rec["planets"][body.capitalize()] = {"ra": float(bt.ra.deg), "dec": float(bt.dec.deg), "dist_au": float(b.distance.to(u.au).value), "gcrs_ra": float(b.ra.deg), "gcrs_dec": float(b.dec.deg)}
        except Exception as e: rec["planets"][body.capitalize()] = {"error": str(e)[:100]}
    rec["stars"] = {}
    for n, (ra, dec) in stars.items():
        c = SkyCoord(ra * u.deg, dec * u.deg, frame="icrs")
        te = c.transform_to(TETE(obstime=t)); gc = c.transform_to(GCRS(obstime=t))
        e = {"tete": {"ra": float(te.ra.deg), "dec": float(te.dec.deg)}, "gcrs": {"ra": float(gc.ra.deg), "dec": float(gc.dec.deg)}, "altaz": {}}
        for sn, (lat, lon, h) in sites.items():
            loc = EarthLocation(lat=lat * u.deg, lon=lon * u.deg, height=h * u.m)
            aa = c.transform_to(AltAz(obstime=t, location=loc, pressure=0 * u.hPa))
            e["altaz"][sn] = {"alt": float(aa.alt.deg), "az": float(aa.az.deg)}
        rec["stars"][n] = e
    out["dates"].append(rec)
json.dump(out, open(OUT, "w"), indent=1)
print("wrote", OUT, "with", len(dates), "dates ×", len(stars), "stars ×", len(sites), "sites")
