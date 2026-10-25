#!/usr/bin/env python3
"""What came into the catalogues, and when.

Walks the git history of site/data/data.json (every commit that changed it, the weekly
refreshes among them), diffs consecutive builds by NAME — exoplanet systems, planets,
galaxies, HYG stars — and writes

  site/data/changelog.json   newest first, for the Data pane
  DATA_CHANGELOG.md          one table row per build

If the working-tree data.json differs from HEAD's (the weekly workflow runs this before
it commits), that build is listed first as today's.

    python3 pipeline/data_history.py            # from the repo root
"""
import json, os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = "site/data/data.json"
OUT = os.path.join(ROOT, "site/data/changelog.json")
MD = os.path.join(ROOT, "DATA_CHANGELOG.md")
NAMES_MAX = 120          # names kept per list per build (the counts are always complete)


def git(*a):
    return subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True, check=True).stdout


def digest(d):
    stars = d.get("stars", [])
    return {
        "systems": {s["h"] for s in stars},
        "planets": {p["n"] for s in stars for p in s.get("p", [])},
        "galaxies": {g["n"] for g in d.get("galaxies", [])},
        "nHyg": len(d.get("hyg", [])),               # HYG rows carry no stable key in old builds: counts only
        "meta": d.get("meta", {}),
    }


def load_commit(sha):
    try:
        return json.loads(git("show", f"{sha}:{DATA}"))
    except Exception:
        return None


def main():
    log = git("log", "--format=%H%x09%ad%x09%s", "--date=short", "--", DATA).strip().splitlines()
    commits = [l.split("\t", 2) for l in log]            # newest first
    commits.reverse()                                     # oldest first
    builds = []
    for sha, date, subject in commits:
        d = load_commit(sha)
        if d is None: continue
        builds.append((sha[:7], date, subject, digest(d)))
    # the working tree, if it is ahead of HEAD
    try:
        cur = json.load(open(os.path.join(ROOT, DATA)))
        head = load_commit("HEAD")
        if head is None or json.dumps(cur.get("meta"), sort_keys=True) != json.dumps(head.get("meta"), sort_keys=True) \
           or digest(cur)["planets"] != digest(head)["planets"]:
            builds.append(("pending", time.strftime("%Y-%m-%d"), "Weekly data refresh (this run)", digest(cur)))
    except Exception:
        pass
    entries, prev = [], None
    for sha, date, subject, dg in builds:
        m = dg["meta"]
        counts = {"systems": len(dg["systems"]), "planets": len(dg["planets"]), "galaxies": len(dg["galaxies"]),
                  "hyg": m.get("nHyg") or dg["nHyg"], "hygGaia": m.get("nHygGaia", 0)}
        e = {"date": date, "commit": sha, "subject": subject, "built": m.get("built"), "counts": counts}
        if prev is not None:
            e["delta"] = {k: counts[k] - prev["counts"][k] for k in ("systems", "planets", "galaxies", "hyg")}
            e["added"] = {k: sorted(dg[k] - prev["dg"][k])[:NAMES_MAX] for k in ("systems", "planets", "galaxies")}
            e["removed"] = {k: sorted(prev["dg"][k] - dg[k])[:NAMES_MAX] for k in ("systems", "planets", "galaxies")}
            e["nAdded"] = {k: len(dg[k] - prev["dg"][k]) for k in ("systems", "planets", "galaxies")}
            e["nRemoved"] = {k: len(prev["dg"][k] - dg[k]) for k in ("systems", "planets", "galaxies")}
            changed = any(e["delta"].values()) or any(e["nAdded"].values()) or any(e["nRemoved"].values()) \
                or (m.get("built") != prev["built"])
            if not changed:
                prev = {"counts": counts, "dg": dg, "built": m.get("built")}
                continue                                 # a commit that touched the file without moving the data
        entries.append(e)
        prev = {"counts": counts, "dg": dg, "built": m.get("built")}
    entries.reverse()                                     # newest first
    out = {"generated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "file": DATA, "builds": entries}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(out, open(OUT, "w"), separators=(",", ":"), ensure_ascii=False)
    # the markdown table: keep the header text, rewrite the rows
    header = ("# Data changelog\n\n"
              "One line per catalogue build (`pipeline/build_data.py`, run weekly by `.github/workflows/weekly-data.yml`);\n"
              "the names of what came in are in `site/data/changelog.json` (`pipeline/data_history.py` derives both from git).\n"
              "The Gaia point clouds (`gaia*.bin`, 2.10 M sources within 150 pc with ϖ/σ > 3, Bailer-Jones distances, errors,\n"
              "RUWE, radial velocities) and the JPL Horizons table (`ephem.bin`, 2015–2045) are static releases, rebuilt by hand\n"
              "with `pipeline/fetch_gaia.py` / `fetch_horizons.py`; the share links carry the app build they were made on.\n\n"
              "| date | exoplanet systems | planets | galaxies | HYG stars | what changed |\n|---|---|---|---|---|---|\n")
    rows = []
    for e in entries:
        c, dl = e["counts"], e.get("delta", {})
        f = lambda k: f"{c[k]:,}" + (f" ({dl[k]:+,})" if dl.get(k) else "")
        what = ", ".join(x for x in [
            (lambda a: f"new systems: {', '.join(a[:6])}{'…' if len(a) > 6 else ''}")(e.get("added", {}).get("systems", [])) if e.get("added", {}).get("systems") else "",
            f"{e['nRemoved']['systems']} systems dropped" if e.get("nRemoved", {}).get("systems") else "",
            f"HYG {dl['hyg']:+,}" if dl.get("hyg") else "",
        ] if x) or ("first build" if "delta" not in e else "rebuilt, same contents")
        rows.append(f"| {e['date']} | {f('systems')} | {f('planets')} | {f('galaxies')} | {c['hyg']:,} ({c['hygGaia']:,} from Gaia) | {what} |\n")
    open(MD, "w").write(header + "".join(rows))
    print(f"{len(entries)} builds → {OUT} and DATA_CHANGELOG.md")
    for e in entries[:12]:
        dl = e.get("delta", {})
        print(f"  {e['date']} {e['commit']:8} systems {e['counts']['systems']:,} ({dl.get('systems', 0):+}) planets {e['counts']['planets']:,} ({dl.get('planets', 0):+}) gal {e['counts']['galaxies']} hyg {e['counts']['hyg']:,} ({dl.get('hyg', 0):+})  {e['subject'][:50]}")
        a = e.get("added", {})
        if a.get("systems"): print("      + " + ", ".join(a["systems"][:10]) + ("…" if len(a["systems"]) > 10 else ""))


if __name__ == "__main__":
    main()
