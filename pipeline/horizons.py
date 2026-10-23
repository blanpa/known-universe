"""JPL Horizons: osculating orbital elements at an epoch, as the app's `kd` elements
{a, e, i, om, w, ma, n, ep}  (a in the unit asked for, angles in degrees, n in deg/day,
ep the JD of the elements). The engine propagates them with Kepler's equation."""
import json, re, urllib.parse, urllib.request


def elements(command, center, epoch, units="AU-D"):
    q = {"format": "json", "COMMAND": "'%s'" % command, "CENTER": "'%s'" % center,
         "EPHEM_TYPE": "ELEMENTS", "START_TIME": "'%s'" % epoch, "STOP_TIME": "'%s 00:01'" % epoch,
         "STEP_SIZE": "'1d'", "OUT_UNITS": "'%s'" % units, "REF_PLANE": "ECLIPTIC",
         "REF_SYSTEM": "ICRF", "CSV_FORMAT": "YES"}
    url = "https://ssd.jpl.nasa.gov/api/horizons.api?" + urllib.parse.urlencode(q)
    with urllib.request.urlopen(url, timeout=120) as r:
        txt = json.load(r)["result"]
    head = re.search(r"JDTDB,([^\n]*)\n", txt).group(1)
    cols = [c.strip() for c in head.split(",") if c.strip()][1:]   # drop "Calendar Date": values start after it
    row = re.search(r"\$\$SOE\s*\n([^\n]*)", txt).group(1).split(",")
    jd = float(row[0]); vals = dict(zip(cols, [v.strip() for v in row[2:]]))
    f = lambda k: float(vals[k])
    return {"a": f("A"), "e": f("EC"), "i": f("IN"), "om": f("OM"), "w": f("W"),
            "ma": f("MA"), "n": f("N"), "ep": jd}
