# Terms of the bundled data

The code of Known Universe is MIT-licensed (`LICENSE` at the repository root).
The files in this directory are **not**: they are packed from third-party
catalogues and keep the terms of their sources. This list travels with the data
so that every copy of the site — GitHub Pages, the Docker image — carries it.

## File by file

| File | Source | Terms |
|---|---|---|
| `data.json` | NASA Exoplanet Archive (`pscomppars`); HYG v4.1 (astronexus), placed from Gaia DR3 astrometry via the Hipparcos cross-match; Local Volume galaxy catalogue (Karachentsev+ 2013, VizieR J/AJ/145/101) with LEDA axial ratios and position angles; constellation lines from d3-celestial; the hand-curated context layers of `pipeline/inputs/` | NASA: US government data, acknowledgement requested · HYG: [CC BY-SA](https://github.com/astronexus/HYG-Database#license) · Gaia: CC BY-SA 3.0 IGO · VizieR: scholarly use with citation of the paper · d3-celestial: BSD-3-Clause · the curated layers are this repository's own work (MIT) |
| `gaia.bin` `gaia_pm.bin` `gaia_q.bin` `gaiabig.bin` `gaiabig_pm.bin` `gaiabig_q.bin` | Gaia DR3 (ESA/Gaia/DPAC) with the Bailer-Jones+ 2021 distances | [CC BY-SA 3.0 IGO](https://creativecommons.org/licenses/by-sa/3.0/igo/) |
| `obstars.bin` | Gaia DR3, the OB stars | CC BY-SA 3.0 IGO |
| `variables.bin` | Gaia DR3 variability tables (Cepheids, RR Lyrae) | CC BY-SA 3.0 IGO |
| `catalog.json` | JPL Horizons and SBDB (moon ephemerides, probes, trans-Neptunian objects, comets); ATNF Pulsar Catalogue (Manchester+ 2005, VizieR B/psr); open clusters (Cantat-Gaudin+ 2020, VizieR J/A+A/640/A1); the curated deep-sky, station, brown-dwarf and molecular-cloud lists | JPL: US government data · VizieR: scholarly use with citation · the curated lists are this repository's own work (MIT) |
| `belt.bin` | JPL Small-Body Database Query API (main belt, Jupiter trojans, near-Earth objects, TNOs) | US government data |
| `ephem.bin` `ephem.json` | JPL Horizons, DE441 state vectors 2015–2045 | US government data |
| `cosmicweb.bin` | 2MASS Redshift Survey (Huchra+ 2012, VizieR J/ApJS/199/26) | VizieR: scholarly use with citation |
| `quasars.bin` `quasarsbig.bin` | Million Quasars catalogue (Milliquas, Flesch, VizieR VII/294) | VizieR: scholarly use with citation |
| `tex/*.jpg` | [Solar System Scope](https://www.solarsystemscope.com/textures/) planet and Moon maps | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `changelog.json` `sample-stars.csv` | this repository | MIT |
| `live-extra.json` | written at run time by the updater from the live services the Data pane lists; not part of the repository | each service's own terms |

The Gaia-derived files are adaptations of a ShareAlike database: pass them on
under CC BY-SA 3.0 IGO, with the credit below. The VizieR-hosted catalogues are
for scholarly use; cite the papers, not only this map.

## Credits to carry

- *This work has made use of data from the European Space Agency (ESA) mission
  Gaia (<https://www.cosmos.esa.int/gaia>), processed by the Gaia Data Processing
  and Analysis Consortium (DPAC, <https://www.cosmos.esa.int/web/gaia/dpac/consortium>).
  Funding for the DPAC has been provided by national institutions, in particular
  the institutions participating in the Gaia Multilateral Agreement.*
- *This research has made use of the NASA Exoplanet Archive, which is operated by
  the California Institute of Technology, under contract with the National
  Aeronautics and Space Administration under the Exoplanet Exploration Program.*
- *This research has made use of the VizieR catalogue access tool, CDS,
  Strasbourg, France (DOI: 10.26093/cds/vizier).*
- HYG database: David Nash, astronexus.com. Planet textures: Solar System Scope.
- Ephemerides and small-body data: JPL Solar System Dynamics, NASA.

## Services used at run time

The app also queries services as you use it — SIMBAD and VizieR (CDS), the
HiPS sky surveys served by CDS, NASA GIBS, EPIC, DONKI and NEO, NOAA SWPC,
CelesTrak, MAST — and stores nothing from them in this repository. Their terms
apply to what you fetch; the Data pane names each one.
