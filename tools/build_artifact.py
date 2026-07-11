#!/usr/bin/env python3
"""Assemble the self-contained Claude Artifact HTML:
vite single-file bundle + embedded catalogues (module scripts defer, so the
plain data <script> below is guaranteed to run first)."""
import base64, os
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(HERE, "dist-artifact", "index.html")).read()
data = open(os.path.join(HERE, "site", "data", "data.json")).read()
def b64(fn):
    return base64.b64encode(open(os.path.join(HERE, "site", "data", fn), "rb").read()).decode()
inject = ("<script>window.__DATA__=" + data + ";"
          + 'window.__GAIA_B64__="' + b64("gaia.bin") + '";'
          + 'window.__WEB_B64__="' + b64("cosmicweb.bin") + '";'
          + 'window.__QSO_B64__="' + b64("quasars.bin") + '";'
          + 'window.__BELT_B64__="' + b64("belt.bin") + '";'
          + 'window.__OB_B64__="' + b64("obstars.bin") + '";'
          + 'window.__VAR_B64__="' + b64("variables.bin") + '";</script>')
assert "</head>" in html
html = html.replace("</head>", inject + "\n</head>", 1)
out = os.path.join(HERE, "dist-artifact", "artifact.html")
open(out, "w").write(html)
print("artifact:", out, round(len(html) / 1048576, 2), "MB")
