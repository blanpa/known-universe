// What leaves the app as a table: a data set (file or field query), its cross-match,
// the expected-jump list, the measurement log. CSV for spreadsheets, VOTable for
// TOPCAT, Aladin and astropy. The same rows and columns feed both formats.
import { api } from '../lib/api.js';
import { csvOf, download, safeName, votableOf } from '../lib/export.js';
import { MEAS } from './measure.js';
import { epochNow } from './motion.js';
import { MOVERS } from './movers.js';
import { USER } from './userdata.js';
const D2R=Math.PI/180;
const POS=[ { k:'ra', n:'ra', t:'double', u:'deg', ucd:'pos.eq.ra;meta.main', d:'ICRS right ascension at the row epoch' },
            { k:'dec', n:'dec', t:'double', u:'deg', ucd:'pos.eq.dec;meta.main', d:'ICRS declination at the row epoch' } ];
const SETCOLS=[ { k:'name', n:'name', t:'char', ucd:'meta.id;meta.main' }, ...POS,
  { k:'epoch', n:'epoch', t:'double', u:'yr', ucd:'time.epoch', d:'Julian epoch of the position' },
  { k:'dist_pc', n:'dist_pc', t:'double', u:'pc', ucd:'pos.distance' }, { k:'plx', n:'plx_mas', t:'double', u:'mas', ucd:'pos.parallax' },
  { k:'mag', n:'mag', t:'double', u:'mag', ucd:'phot.mag' },
  { k:'pmra', n:'pmra', t:'double', u:'mas/yr', ucd:'pos.pm;pos.eq.ra', d:'proper motion in RA × cos(Dec)' }, { k:'pmdec', n:'pmdec', t:'double', u:'mas/yr', ucd:'pos.pm;pos.eq.dec' },
  { k:'xm_src', n:'counterpart_catalogue', t:'char', d:'cross-match: catalogue of the nearest counterpart' },
  { k:'xm_id', n:'counterpart_id', t:'char', ucd:'meta.id.cross' }, { k:'xm_sep', n:'counterpart_sep_arcsec', t:'double', u:'arcsec', ucd:'pos.angDistance' },
  { k:'xm_plx', n:'counterpart_plx_mas', t:'double', u:'mas' }, { k:'xm_eplx', n:'counterpart_e_plx_mas', t:'double', u:'mas' },
  { k:'xm_pmra', n:'counterpart_pmra', t:'double', u:'mas/yr' }, { k:'xm_pmdec', n:'counterpart_pmdec', t:'double', u:'mas/yr' },
  { k:'xm_mag', n:'counterpart_mag', t:'double', u:'mag' }, { k:'xm_ruwe', n:'counterpart_ruwe', t:'double' }, { k:'xm_otype', n:'counterpart_type', t:'char' } ];
function setRows(st){
  return st.rows.map(o=>{ const r={ name:o.n, ra:o.ra, dec:o.dec, epoch:o.ep||2000, dist_pc:o.noDist?undefined:o.d, plx:o.noDist?undefined:1000/o.d, mag:o.m, pmra:o.pr||undefined, pmdec:o.pd||undefined };
    if(st.xm){ r.xm_src=o.xm?o.xm.src:'none within '+st.xm.radius+'"'; if(o.xm){ r.xm_id=o.xm.id; r.xm_sep=+o.xm.sep.toFixed(3); r.xm_plx=o.xm.plx; r.xm_eplx=o.xm.eplx; r.xm_pmra=o.xm.pr; r.xm_pmdec=o.xm.pd; r.xm_mag=o.xm.mag; r.xm_ruwe=o.xm.ruwe; r.xm_otype=o.xm.otype; } }
    for(const [kx,vx] of Object.entries(o.x||{})) r['x_'+kx]=vx; return r; });
}
const MOVCOLS=[ { k:'name', n:'name', t:'char', ucd:'meta.id;meta.main' }, ...POS, { k:'pm', n:'pm_total_mas_yr', t:'double', u:'mas/yr', ucd:'pos.pm' },
  { k:'jump', n:'jump_arcsec', t:'double', u:'arcsec', d:'expected displacement between the two blink epochs' }, { k:'px', n:'jump_px', t:'double', u:'pix' },
  { k:'ea', n:'epoch_a', t:'double', u:'yr' }, { k:'eb', n:'epoch_b', t:'double', u:'yr' }, { k:'src', n:'catalogue', t:'char' } ];
const MEASCOLS=[ { k:'a', n:'object_a', t:'char' }, { k:'b', n:'object_b', t:'char' }, { k:'dist_pc', n:'distance_pc', t:'double', u:'pc' }, { k:'dist_au', n:'distance_au', t:'double', u:'AU' },
  { k:'dist_ly', n:'distance_ly', t:'double', u:'ly' }, { k:'sep', n:'separation_deg', t:'double', u:'deg', ucd:'pos.angDistance' }, { k:'pa', n:'position_angle_deg', t:'double', u:'deg', ucd:'pos.posAng' },
  { k:'vantage', n:'vantage', t:'char', d:'where the angular values are measured from' }, { k:'epoch', n:'epoch', t:'double', u:'yr' }, { k:'at', n:'measured_at', t:'char' } ];
// kind: 'set' (k = set index) · 'movers' · 'measure'. Returns the text; downloads unless opts.text
export function exportTable(kind, fmt='csv', k=0, opts={}){
  let rows=[], cols=[], name='table', desc='', epoch=2000, info=[];
  if(kind==='set'){ const st=USER.sets[k]; if(!st) return ''; rows=setRows(st); epoch=st.epoch||2000;
    const extra=new Set(); for(const r of rows) for(const key of Object.keys(r)) if(key.startsWith('x_')) extra.add(key);
    cols=[...SETCOLS.filter(c=>!c.k.startsWith('xm_')||st.xm), ...[...extra].map(key=>({ k:key, n:key.slice(2), t:'char' }))];
    name=safeName(st.name); desc=`Known Universe · ${st.name} · ${st.rows.length} rows${st.xm?` · cross-matched against ${st.xm.remote||'the loaded catalogues'} within ${st.xm.radius}″`:''}`;
    info=[['source', st.src], ['row_epoch', 'J'+epoch.toFixed(1)]]; }
  else if(kind==='movers'){ rows=MOVERS.map(m=>({ name:m.name, ra:(Math.atan2(m.o.dy,m.o.dx)/D2R+360)%360, dec:Math.asin(m.o.dz)/D2R, pm:m.pm, jump:m.jump, px:m.px, ea:m.ea, eb:m.eb, src:m.usr?'your data':m.src||'catalogue' }));
    cols=MOVCOLS; name='expected-jumps'; desc='Known Universe · stars expected to jump between the two blink epochs in this field'; }
  else if(kind==='measure'){ rows=MEAS.log; cols=MEASCOLS; name='measurements'; desc='Known Universe · measurement log'; epoch=epochNow(); }
  const text = fmt==='votable' ? votableOf(rows, cols, { name, description:desc, epoch, info }) : csvOf(rows, cols, [desc]);
  if(!opts.text) download(`${name}.${fmt==='votable'?'xml':'csv'}`, text, fmt==='votable'?'application/x-votable+xml':'text/csv');
  return text;
}
api.exportTable=exportTable;
