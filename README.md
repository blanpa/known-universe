# Known Universe

A spatial 3D map of humanity's confirmed exoplanets, the real stars of the
solar neighbourhood **and** the measured galaxies of the local universe — all
in a true coordinate system around the Sun, with a time slider (discovery year)
as a fourth dimension.

- **Data sources (real catalogues):**
  - [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/)
    (`pscomppars`) → 4,708 star systems, 6,292 planets, discoveries 1992–2026,
    incl. discovery instrument (`disc_facility`) and orbital elements.
  - [HYG star catalogue](https://github.com/astronexus/HYG-Database)
    (Hipparcos + Yale Bright Star + Gliese) → 11,604 real stars: every
    naked-eye star (mag ≤ 6.5) plus the solar neighbourhood (< 25 pc, incl.
    Proxima, Barnard's Star), 387 with proper names.
  - [Gaia DR3](https://gea.esac.esa.int/archive/) → **540,859 real stars
    within 100 pc** of the Sun (`parallax > 10 mas`, `parallax_over_error > 5`),
    the dense point cloud you see filling the solar neighbourhood — rendered on
    the GPU (WebGL). Colour from `bp_rp`, apparent size from `phot_g_mean_mag`.
  - [Local Volume galaxy catalogue](https://cdsarc.cds.unistra.fr/viz-bin/cat/J/AJ/145/101)
    (Karachentsev+ 2013, VizieR) → 869 galaxies with *measured* distance
    (0.01–26.2 Mpc), incl. physical size.
  - [2MRS redshift survey](https://cdsarc.cds.unistra.fr/viz-bin/cat/J/ApJS/199/26)
    (Huchra+ 2012) → **43,504 galaxies** tracing the **cosmic web** to ~430 Mpc
    (distance from cz, H₀ = 70). GPU-rendered point cloud.
  - [Million Quasars catalogue](https://cdsarc.cds.unistra.fr/viz-bin/cat/VII/294)
    (Milliquas) → **20,000 quasars**, comoving distance from redshift (flat ΛCDM).
  - [ATNF Pulsar Catalogue](https://www.atnf.csiro.au/research/pulsar/psrcat/)
    (VizieR B/psr) → **2,475 pulsars** with distances from their dispersion measure.
  - [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) → real state vectors for the
    human deep-space probes (Voyager 1/2, Pioneer 10/11, New Horizons, JWST,
    Parker Solar Probe, Gaia) **and the active missions en route** (JUICE,
    BepiColombo, Lucy, Psyche, Europa Clipper), plus **185 moon ephemerides**
    and trans-Neptunian objects / Centaurs.
  - [JPL SBDB Query API](https://ssd-api.jpl.nasa.gov/doc/sbdb_query.html) →
    **48,999-object asteroid field**: 30 k main belt + 8 k Jupiter trojans +
    8 k near-Earth objects + 3 k TNOs, positions propagated to the build date
    (snapshot; the named bodies stay time-aware).
  - [Cantat-Gaudin+ 2020](https://cdsarc.cds.unistra.fr/viz-bin/cat/J/A+A/640/A1)
    → **1,867 open clusters** with Gaia distances, all clickable by name.
  - [Gaia DR3 variables](https://gea.esac.esa.int/archive/) → **2,950 Cepheids +
    31,578 RR Lyrae** (quality parallaxes) as a typed GPU layer.
  - **20 molecular clouds** at their Gaia 3D-dust distances (Zucker+ 2020) and
    **oriented galaxy disks**: 861 Local-Volume galaxies with measured axial
    ratio, 349 with measured position angle (LEDA) — Andromeda tilts for real.
- **Two scales (toggle "Real scale"):**
  - *Logarithmic* (default): everything in one view, distances compressed —
    for comprehension and navigation.
  - *Real*: **true, proportional distances** (1 pc = 1 unit, linear). Space is
    then realistically vast and empty — you fly/zoom through the real gaps and
    never see two scales at once (13 orders of magnitude from the solar system
    to the galaxies). Switching keeps your current viewing distance.
- **One continuous scale, anchored at the solar system:** All layers —
  planets, moons, stars, exoplanets, galaxies — live in *one* space with real
  sky direction and a logarithmic distance (world radius =
  `(log10(distance_pc) − LOG0) · K`). Scrolling flies you continuously across
  ~13 orders of magnitude: from the solar system (AU) through the stellar
  neighbourhood (parsec) to the galaxies (megaparsec). The real emptiness
  between the solar system and the nearest star stays visible as a true gap.
  *(Physical object sizes are necessarily symbolic across 13 decades — glyphs
  scale by real* relative *radius, so e.g. Jupiter > Earth stays recognisable.)*
- **Tech:** a single `index.html` with its own 3D renderer (no external
  libraries). Stars render on the **GPU via WebGL 2**: the binary catalogues
  (Gaia, asteroid field, 2MRS, quasars, …) are uploaded to the GPU
  **byte-for-byte** and decoded in the vertex shader (8 bytes/star — no CPU
  decode, 5× less GPU memory), point layers accumulate in a **half-float HDR
  buffer with tonemapping** (dense star fields saturate softly instead of
  clipping to white), and the renderer **survives GPU context loss** (all
  layers rebuild automatically). Falls back to the Canvas 2D renderer where
  WebGL 2 is unavailable. Data in `site/data/data.json`; the Gaia point cloud
  in `site/data/gaia.bin` (a compact 8-bytes-per-star binary). Toggle
  **GPU stars** / **Gaia stars** in the panel.

## Controls

| Action              | Input                                                    |
|---------------------|----------------------------------------------------------|
| Rotate (orbit)      | Left-drag with the mouse                                 |
| Pan (free)          | Right-drag (or Shift + drag)                             |
| Free flight         | **WASD** / arrow keys, **R/F** up·down                   |
| Free-look flight    | Toggle **Free-look flight** → left-drag turns the camera in place (spaceship style) |
| Travel to           | Click an object → the camera flies there                 |
| Zoom                | Mouse wheel                                              |
| 4th dimension       | Time slider at the bottom + play button                  |
| Search              | Field at the top — finds **everything**: `Sirius`, `TRAPPIST-1`, `Andromeda`, `PSR J0332+5434`, `Melotte 22`, `Voyager 1`, `Sedna` |
| 🧭 Cosmic tour      | Button top-left — a guided 9-stop flight from Earth to the CMB |
| 📏 Measure          | Button top-left — click two objects → real distance & light-travel time |
| Touch               | One finger rotate · two-finger pinch zoom |
| Share a view        | **🔗 Share this view** (top-left) — copies a URL that restores this exact camera position, scale and layer set |
| Into the solar system | Button top-left **☉ Into the solar system** or click the Sun |
| Layers on/off       | Right side: galaxies · stars (HYG) · moons · rings · veil · … |

**Layers & tools**

- **Navigation:** Click an object → **🎯 Set course**. The nav console (top)
  shows **real distance**, **light travel time** (e.g. Andromeda 2.54 million
  years @ c) and the **bearing**. A **reticle** marks the target when in view,
  an **edge arrow** points the way when it's off-screen. **Engage course** flies
  there automatically. Works in both scales.
- **Nebulae & star clusters:** ~33 of the most famous deep-sky objects at their
  real positions — Orion Nebula, Pleiades, Hyades, Crab Nebula, Ring Nebula,
  Lagoon Nebula, Omega Centauri, M13, Helix Nebula … coloured by type (open/
  globular cluster, emission/planetary nebula, supernova remnant), searchable
  and clickable. Toggle **Nebulae & clusters**. *(Representative distances —
  astronomically uncertain for nebulae anyway.)*
- **Milky Way & Sagittarius A\*:** The galactic centre (our supermassive black
  hole, 4.3 million M☉, 8.18 kpc = ~27,000 ly) is marked at its true 3D
  position and clickable. The **galactic plane** is drawn as a great-circle band
  (the Milky Way as we see it from inside). A **top-down schematic** (top-left)
  shows the spiral arms, bar, Sgr A\* and "you are here" (Sun at ~8 kpc). Toggle
  **Milky Way · Sgr A\***.
- **Solar system:** fly from the galactic view right into our solar system —
  Sun, 8 planets, 5 dwarf planets (Pluto, Ceres, Eris, Haumea, Makemake) and the
  major moons (the Moon, Galilean moons, Titan, Triton, Charon …). **Moons**
  toggle. *(Not included: the ~280 tiny minor moons — only the significant ones.)*
  - **Real orbital positions:** All 8 planets (JPL Standish elements) **and** the
    5 dwarf planets (real osculating elements from the JPL Small-Body Database)
    sit at their actual positions — with true elliptical, inclined orbits.
    Verified: Pluto 35.6 AU, Eris 95.5 AU (near aphelion), Earth near aphelion in July.
  - **Time travel:** In the solar system a date slider (±100 years) with play
    appears — the planets and dwarf planets run live along their orbits forward
    and back (~1 year/sec). "today" snaps back to the current date.
  - **Large asteroids & comets** (JPL SBDB, real elements, time-travel aware):
    Vesta, Pallas, Hygiea, Juno, Psyche, Eros, Bennu, Ryugu, plus the comets
    1P/Halley (retrograde), 2P/Encke, 67P, 9P/Tempel 1 and Hale-Bopp (e=0.995,
    nearly polar orbit) — comets with an anti-solar tail. Toggle
    **Asteroids & comets**. Verified: Halley currently 35.2 AU (near aphelion).
  - **Rings & moons:** Saturn with a stepped ring (Cassini division), Uranus with
    its nearly vertical ring system.
  - **Real moon positions:** all 26 major moons sit at their **true orbital phase
    and in their true orbit plane** (JPL Horizons state vectors, circular
    propagation — verified ≤ 1° drift over 10 days for Io/Titan/Titania/Triton;
    the eccentric Earth-Moon wobbles ~10°, Nereid e=0.75 is approximate). The
    Uranus moons visibly orbit sideways, Triton retrograde. In log scale the
    separations are exploded for visibility (phases stay real); in **real scale**
    the separation is the true angular distance. The moons run live along their
    orbits with the time slider (`python3 build_moons.py` re-bakes the epoch).
- **Constellations:** the 89 constellations as line figures on the celestial
  sphere (d3-celestial), with names — the night sky as you know it. Toggle
  **Constellations**.
- **Proper motion:** the **Proper motion** toggle reveals a slider (±50,000
  years) — the stars drift across deep time along their real proper motions
  (HYG pmRA/pmDec); the Big Dipper falls apart, Barnard's Star races away.
- **Habitable zone:** a green band around the Sun and in every foreign system
  view, computed from the real stellar luminosity (`st_lum`, 4,415 systems).
  Verified: TRAPPIST-1 e/f fall inside it. Toggle **Habitable zone**.
- **Enter foreign solar systems:** Click a host star → the camera travels there,
  and as you zoom in **its planets appear on their orbits** — spaced by real
  semi-major axis (JPL: 6,285/6,292 planets), scaled by real radius and coloured
  by size class (rocky · super-Earth · Neptune-like · gas giant). So every
  system is recognisable like ours. Click a planet for its data. *(Phase along
  the orbit is schematic — there are no ephemerides for exoplanets like there
  are for the solar system.)*
- **Stars (HYG):** a real star field, point size by apparent magnitude; famous
  stars labelled.
- **Discovery instrument (in the controls, right):** colour host stars by telescope
  (Kepler / TESS / K2 / radial velocity / microlensing / …) and toggle individual
  instruments — shows each instrument's footprint on the sky.
- **Red veil:** everything beyond the charted neighbourhood (90th percentile of
  distances) is increasingly reddened and hazy.
- **Deep links:** Click an object → info panel with links to **SIMBAD**,
  **Aladin** (sky atlas), **NASA Exoplanet Archive** or **NED**.

## What's *not* (yet) included

"Everything humanity knows" is literally billions of objects and terabytes of
catalogues — impossible to embed in a web page. This map aims for **every *kind*
of object**, with the large catalogues scaled up to 10⁴–10⁶ points. What is still
missing or simplified, honestly:

**Scale / coverage limits**

- **Stars:** 540 k Gaia (browser Artifact) / 1.76 M (Docker, < 150 pc) out of
  Gaia's **1.8 billion**. No individual stars beyond ~150 pc (they'd need
  photometric, not parallax, distances). HYG adds only the bright/near ~11.6 k.
- **Galaxies:** 869 Local Volume (< 26 Mpc) + 43.5 k from 2MRS (cosmic web to
  ~430 Mpc). No deeper redshift surveys (SDSS/DESI, ~10⁶–10⁷ galaxies), nothing
  between ~430 Mpc and the quasar shell.
- **Quasars:** the full ~1.01 M Million-Quasars catalogue on Docker
  (`quasarsbig.bin`); the browser Artifact embeds a 20 k sample.
- **Exoplanets:** confirmed planets only (`pscomppars`); no **candidates**
  (TESS TOIs, Kepler KOIs) and orbital **phase is schematic** — there are no
  ephemerides for exoplanets as there are for solar-system bodies.

**Solar system**

- **Moons:** **185 of the ~290 known** — every satellite JPL Horizons can
  ephemeris (only tiny Daphnis failed). The ~160 small irregular ones appear
  when you zoom close to their planet. Still missing: unnumbered 2020s discoveries.
- **Small bodies:** a 49 k **sample** field (belt/trojans/NEOs/TNOs) of the
  ~1.37 M numbered asteroids. The field carries its epoch in `belt.bin` and
  drifts with the time slider via a circular-orbit approximation (exact
  eccentric orbits only for the named bodies); the updater refreshes the
  snapshot weekly. No comet catalogue beyond the 5 famous ones.
- **No Oort cloud** (it's theoretical/unobserved), no meteor-shower radiants.
- **Spacecraft:** 8 probes (incl. Parker Solar Probe and Gaia at L2) — no
  planetary orbiters (JUICE, Mars fleet, …).

**Stellar / galactic**

- **Supernova remnants:** ~10 famous ones with known distances (Green's 294 SNRs
  lack reliable distances, so the bulk is omitted).
- **Open clusters:** full Cantat-Gaudin catalogue (1,867). **Globulars:** ~40
  curated of the ~157 (the Harris/Baumgardt tables aren't on the VizieR TAP
  mirror used here).
- **White/brown dwarfs:** famous ones only (Sirius B, Luhman 16, WISE 0855, …) —
  no full catalogues, no variable stars, no molecular clouds / dark nebulae.
  The labelled **spiral-arm curves** are still a model (Reid+ 2019), but they
  are now complemented by **131,791 real Gaia OB stars** (hot young arm tracers
  to ~4 kpc, toggle "OB stars"). The star **S2** rides its real measured orbit
  around Sgr A*.

**High-energy / transient / cosmological**

- **Gravitational waves:** 2 landmark events of the ~90+ in GWTC (most have very
  large sky-localisation regions, so they can't be drawn as points).
- **GRBs/FRBs:** landmark events only (GRB 221009A "BOAT", the naked-eye
  GRB 080319B, z=8.2 GRB 090423; repeating FRB 121102, FRB 20200120E in M81) —
  no full Swift/CHIME catalogues, no IceCube neutrinos or TeV sources.
- **Galaxy clusters / superclusters:** ~13 named ones only; no cluster catalogue,
  no explicit filaments/voids.
- The **CMB boundary is a schematic shell** at ~46 Gly, not the actual
  temperature map; no dark-matter / dark-energy representation.

**Data-quality caveats**

- Distances are best-available and **heterogeneous**: pulsar distances from
  dispersion measure, nebula/SNR distances representative, galaxy/quasar
  distances from redshift (assuming H₀ = 70, flat ΛCDM). Positions are real; some
  distances carry large uncertainties.

## Deployment with Docker

```bash
docker compose up -d --build      # web + weekly auto-updater
open http://localhost:8477
```

Snapshot only, without auto-update:

```bash
docker compose up -d --build web  # web service only
# or without Compose at all:
docker build -t galactica .
docker run -d -p 8477:80 --name galactica galactica
```

Stop: `docker compose down`.

## Auto-update

The `updater` service (see `docker-compose.yml`) periodically fetches fresh raw
data from all three sources, runs `build_data.py` and writes a new
`site/data/data.json`, which the web service serves via a bind mount. The map
stays up to date automatically — the NASA archive grows weekly.

- Interval configurable via `UPDATE_INTERVAL` (seconds) in `docker-compose.yml`
  (default `604800` = 7 days).
- Watch progress: `docker compose logs -f updater`.
- The updater runs once immediately on start and then at the chosen interval.

> Note: the browser-only preview (Artifact) **cannot** update — the data is
> embedded there (a snapshot). Auto-update applies only to the Docker deployment.

## Regenerate the data manually

```bash
# Exoplanets (NASA Exoplanet Archive)
curl -G "https://exoplanetarchive.ipac.caltech.edu/TAP/sync" \
  --data-urlencode "query=select pl_name,hostname,ra,dec,sy_dist,disc_year,discoverymethod,disc_facility,st_teff,st_spectype,st_mass,st_lum,st_rad,pl_rade,pl_bmasse,pl_orbsmax,pl_orbper,sy_pnum from pscomppars where sy_dist is not null and ra is not null and dec is not null" \
  --data-urlencode "format=csv" -o data-raw.csv

# Galaxies (Local Volume, VizieR TAP)
curl -G "https://tapvizier.cds.unistra.fr/TAPVizieR/tap/sync" \
  --data-urlencode "REQUEST=doQuery" --data-urlencode "LANG=ADQL" --data-urlencode "FORMAT=csv" \
  --data-urlencode 'QUERY=SELECT * FROM "J/AJ/145/101/catalog" WHERE Dist IS NOT NULL AND Dist>0' \
  -o galaxies-raw.csv

# Stars (full HYG catalogue; build_data.py filters to mag ≤ 6.5 or < 25 pc)
curl -L "https://raw.githubusercontent.com/astronexus/HYG-Database/main/hyg/CURRENT/hygdata_v41.csv" \
  -o hyg-raw.csv

python3 build_data.py   # -> site/data/data.json

# Gaia DR3 point cloud (< 100 pc) — one-off; Gaia DR3 is a static release
curl -G "https://gea.esac.esa.int/tap-server/tap/sync" \
  --data-urlencode "REQUEST=doQuery" --data-urlencode "LANG=ADQL" \
  --data-urlencode "FORMAT=csv" --data-urlencode "MAXREC=4000000" \
  --data-urlencode "QUERY=SELECT ra,dec,parallax,phot_g_mean_mag,bp_rp FROM gaiadr3.gaia_source WHERE parallax>10 AND parallax_over_error>5 AND phot_g_mean_mag IS NOT NULL" \
  -o gaia_100pc.csv
python3 build_gaia.py   # -> site/data/gaia.bin

# Complete outer solar system — human probes + TNOs (JPL Horizons + SBDB, live)
python3 build_solar_extra.py   # prints PROBES / TNOS constants (baked into the template)

# Deep-sky / extragalactic point clouds (VizieR TAP; see the queries in each script)
#   pulsars_raw.csv (ATNF)  -> PULSARS constant (baked in)
#   twomrs_raw.csv (2MRS), quasars_raw.csv (Milliquas)
python3 build_extragal.py      # -> site/data/cosmicweb.bin, site/data/quasars.bin

# Optional millions-of-stars catalogue for the Docker deployment (< 150 pc, ~1.76 M).
# Fetched at runtime as data/gaiabig.bin and shown in place of the 540 k set; the
# browser Artifact keeps the embedded 540 k (it cannot embed a 14 MB binary).
```

**Rendering layers (toggles in the right-hand panel):** GPU stars, Gaia stars,
cosmic web (2MRS), quasars (20 k embedded / 1.01 M on Docker), pulsars, open
clusters (catalog), asteroid field (49 k), spacecraft, trans-Neptunian &
Centaurs, heliosphere, Milky Way structure (3D spiral arms/bar/bulge),
observable universe (CMB shell), plus everything from before (galaxies,
nebulae & clusters, constellations, proper motion, habitable zone, …).

```bash
# Small-body field + open clusters (snapshot; re-run to refresh positions)
python3 build_belt.py          # sb_*.json (SBDB Query API) -> site/data/belt.bin
# quasarsbig.bin: full Milliquas -> Docker-only (see git history for the query)
```

The bundled `*-raw.csv` files are the raw dumps; `site/data/data.json` is
computed from them (RA/Dec/distance → Cartesian coordinates, Sun at the origin).
Constellation lines come from `constlines.json` (d3-celestial).

## License

The code in this repository is released under the [MIT License](LICENSE).

The bundled astronomical data comes from third-party catalogues, each with its
own terms — they are **not** covered by the MIT license:

- **NASA Exoplanet Archive, JPL Horizons / SBDB** — US government data, freely
  usable with acknowledgement.
- **Gaia DR3** — ESA/Gaia/DPAC, [CC BY-SA 3.0 IGO](https://creativecommons.org/licenses/by-sa/3.0/igo/);
  credit: "This work has made use of data from the European Space Agency (ESA)
  mission Gaia, processed by the Gaia Data Processing and Analysis Consortium (DPAC)."
- **HYG database** (astronexus) — [CC BY-SA](https://github.com/astronexus/HYG-Database#license).
- **VizieR catalogues** (Local Volume, 2MRS, Milliquas, ATNF pulsars,
  Cantat-Gaudin clusters, …) — free for scholarly/non-commercial use with
  citation of the original papers (linked above).
- **Constellation lines** — from [d3-celestial](https://github.com/ofrohn/d3-celestial)
  (BSD-3-Clause).
