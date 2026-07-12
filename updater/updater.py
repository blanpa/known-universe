#!/usr/bin/env python3
"""Auto-updater for the Known Universe container.

Two loops:
  - weekly (UPDATE_INTERVAL): fresh catalogues -> data.json + belt.bin
    (download/build logic shared with the weekly-data GitHub Action,
    see tools/refresh_data.py, mounted at /app/refresh_data.py)
  - hourly: live-extra.json (GW superevents + fireballs — APIs without CORS)

Environment variables:
  UPDATE_INTERVAL  seconds between catalogue updates (default 604800 = 7 days)
  DST              target path of data.json (default /out/data.json)
"""
import os, sys, time, threading

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

INTERVAL = int(os.environ.get("UPDATE_INTERVAL", "604800"))
DST  = os.environ.get("DST", "/out/data.json")
WORK = "/work"


# live-extra: GW superevents + fireballs, hourly (their APIs lack CORS → proxied here)
def live_loop():
    import json
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


threading.Thread(target=live_loop, daemon=True).start()

import refresh_data

while True:
    try:
        print("update running…", flush=True)
        refresh_data.refresh(WORK, DST, "/app")
        print("update done ->", DST, flush=True)
    except Exception as e:
        print("update failed:", repr(e), flush=True)
    time.sleep(INTERVAL)
