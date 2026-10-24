// Your own data on the map. A CSV or TSV with positions becomes a layer: drawn as
import { userLayer } from '../lib/stores.js';
import { ctx } from './canvas.js';
import { LBL, P_SEL, P_STAR } from './labels.js';
import { tNow, tSince } from './motion.js';
import { S, V } from './state.js';
import { H, W, _pj, compress, projectInto } from './view.js';
// amber rings, picked, searched, kept in localStorage. Meant for raw data — a Gaia or
// SIMBAD cone search, a list of candidates from a blink session, a survey's output —
// so that unlabelled points can be checked against everything else here.
//
// Columns are found by name (RA, Dec, distance or parallax or light-years, magnitude,
// name, proper motions); the order does not matter, a file without a header is read as
// ra, dec, dist, mag, name. RA/Dec in degrees or sexagesimal (03:47:24, +24 07 00).

export const USER={ sets:[], rows:[], warn:'' };     // sets: {name, src, epoch, prefix, text, n, noDist, warn}
export let userProj=[];
export const NO_DIST_PC=1e4;                             // rows without a distance sit on the sky sphere
const KEY='ku_user_v2', MAX_ROWS=50000, MAX_SETS=4;
const COLS={
  ra:   ['ra','ra_deg','radeg','raj2000','_raj2000','ra_icrs','rightascension','ra(deg)','rajd','alpha'],
  dec:  ['dec','de','dec_deg','dedeg','decdeg','dej2000','_dej2000','de_icrs','dec_icrs','declination','dec(deg)','dejd','delta'],
  dist: ['dist','distance','d','d_pc','dist_pc','distance_pc','r_est','rgeo','r_med_geo','pc'],
  ly:   ['ly','dist_ly','distance_ly','lightyears','light_years'],
  plx:  ['plx','parallax','parallax_mas','par','pi','plx_value'],
  mag:  ['mag','vmag','gmag','phot_g_mean_mag','v','g','magnitude','rmag','jmag','kmag','imag','mag_v','mag_g'],
  name: ['name','id','designation','source_id','main_id','object','star','identifier','label','source','target','ident'],
  pmra: ['pmra','pm_ra','pmra_cosdec','pm_ra_cosdec','pmracosdec'],
  pmdec:['pmdec','pm_dec','pmde','pm_de'],
  eplx: ['e_plx','parallax_error','plx_err','e_parallax','plx_error','e_plx_value'],
  epmra:['e_pmra','pmra_error','e_pm_ra','pm_err_maj'],
  epmdec:['e_pmdec','pmdec_error','e_pm_dec','pm_err_min'],
  ruwe: ['ruwe'],
  dlo:  ['b_dist','r_lo_geo','dist_lo','b_rgeo','dist16'],
  dhi:  ['B_dist','r_hi_geo','dist_hi','B_rgeo','dist84'],
};
const norm=h=>h.trim().toLowerCase().replace(/^"|"$/g,'').replace(/[\s]+/g,'').replace(/\[.*?\]$/,'');
export function splitLine(line,sep){                            // quoted fields, doubled quotes
  const out=[]; let cur='', q=false;
  for(let i=0;i<line.length;i++){ const ch=line[i];
    if(q){ if(ch==='"'){ if(line[i+1]==='"'){ cur+='"'; i++; } else q=false; } else cur+=ch; }
    else if(ch==='"') q=true;
    else if(ch===sep){ out.push(cur); cur=''; }
    else cur+=ch; }
  out.push(cur); return out.map(s=>s.trim());
}
// "03:47:24.5", "03 47 24.5", "03h47m24.5s" → degrees (hours×15 when `hours`)
function angle(s,hours){
  if(s===undefined||s===null) return NaN;
  s=String(s).trim(); if(!s) return NaN;
  if(/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(s)) return +s*(hours&&/h$/i.test(s)?15:1);
  const t=s.replace(/[hdms°′″'":]/gi,' ').trim().split(/\s+/).map(Number);
  if(t.some(isNaN)||!t.length) return NaN;
  const neg=/^-/.test(s); let v=Math.abs(t[0])+(t[1]||0)/60+(t[2]||0)/3600;
  if(neg) v=-v;
  return hours? v*15 : v;
}
export function parseUserText(text){
  const lines=text.split(/\r?\n/).filter(l=>l.trim()&&!/^\s*#/.test(l));
  if(!lines.length) return { rows:[], cols:[], warn:'empty file' };
  const head=lines[0];
  const sep=[['\t',(head.match(/\t/g)||[]).length],[';',(head.match(/;/g)||[]).length],[',',(head.match(/,/g)||[]).length],['|',(head.match(/\|/g)||[]).length]]
    .sort((a,b)=>b[1]-a[1])[0][1]>0 ? [['\t',(head.match(/\t/g)||[]).length],[';',(head.match(/;/g)||[]).length],[',',(head.match(/,/g)||[]).length],['|',(head.match(/\|/g)||[]).length]].sort((a,b)=>b[1]-a[1])[0][0] : /\s{2,}/.test(head)?'  ':' ';
  const cells=l=>sep==='  '?l.trim().split(/\s{2,}|\t/):sep===' '?l.trim().split(/\s+/):splitLine(l,sep);
  const first=cells(head).map(norm);
  const known=new Set(Object.values(COLS).flat());
  const hasHeader=first.some(h=>known.has(h)) || first.filter(h=>h&&isNaN(+h)).length>=2;
  const cols=hasHeader?first:['ra','dec','dist','mag','name'].slice(0,first.length);
  const col=k=>{ for(const name of COLS[k]){ const i=cols.indexOf(name); if(i>=0) return i; } return -1; };
  const ira=col('ra'), idec=col('dec'), idist=col('dist'), ily=col('ly'), iplx=col('plx'), imag=col('mag'), iname=col('name'), ipra=col('pmra'), ipde=col('pmdec');
  const ieplx=col('eplx'), iepr=col('epmra'), iepd=col('epmdec'), iruwe=col('ruwe'), idlo=col('dlo'), idhi=col('dhi');
  if(ira<0||idec<0) return { rows:[], cols, warn:'no RA/Dec columns found (looked for ra, dec, raj2000, dej2000, …)' };
  const known2=new Set([ira,idec,idist,ily,iplx,imag,iname,ipra,ipde,ieplx,iepr,iepd,iruwe,idlo,idhi]);
  const extra=cols.map((c,i)=>[c,i]).filter(([c,i])=>!known2.has(i)&&c).slice(0,10);
  const rows=[]; let bad=0;
  for(let li=hasHeader?1:0; li<lines.length && rows.length<MAX_ROWS; li++){
    const f=cells(lines[li]); const ra=angle(f[ira],/[:hms ]/.test(f[ira]||'')&&!/°/.test(f[ira]||'')), dec=angle(f[idec],false);
    if(!isFinite(ra)||!isFinite(dec)||Math.abs(dec)>90){ bad++; continue; }
    let d=NaN;
    if(idist>=0) d=+f[idist];
    if(!(d>0)&&ily>=0) d=(+f[ily])/3.261564;
    if(!(d>0)&&iplx>=0){ const p=+f[iplx]; if(p>0) d=1000/p; }
    const noDist=!(d>0); if(noDist) d=NO_DIST_PC;
    const r=ra*Math.PI/180, q=dec*Math.PI/180, cq=Math.cos(q);
    const row={ usr:true, i:rows.length, n:iname>=0?String(f[iname]||'').replace(/^"|"$/g,'').replace(/\s+/g,' '):'', ra, dec, d, noDist,
      m:imag>=0&&isFinite(+f[imag])?+f[imag]:undefined, pr:ipra>=0?+f[ipra]||0:0, pd:ipde>=0?+f[ipde]||0:0,
      dx:cq*Math.cos(r), dy:cq*Math.sin(r), dz:Math.sin(q), x:{} };
    const num=i=>i>=0&&f[i]!==undefined&&f[i]!==''&&isFinite(+f[i])?+f[i]:undefined;
    row.eplx=num(ieplx); row.epr=num(iepr); row.epd=num(iepd); row.ruwe=num(iruwe);
    if(!noDist){ const lo=num(idlo), hi=num(idhi); if(lo>0&&hi>lo){ row.dlo=lo; row.dhi=hi; }
      else if(row.eplx>0&&iplx>=0&&+f[iplx]>0){ const pl=+f[iplx]; row.dlo=1000/(pl+row.eplx); row.dhi=pl-row.eplx>0?1000/(pl-row.eplx):Infinity; } }   // 1/ϖ bounds: honest only when ϖ/σ is large
    for(const [c,i] of extra) if(f[i]!==undefined&&f[i]!=='') row.x[c]=f[i];
    rows.push(row);
  }
  let warn=''; if(bad) warn+=`${bad} rows skipped (no usable RA/Dec)`; if(lines.length-1>MAX_ROWS) warn+=(warn?' · ':'')+`only the first ${MAX_ROWS} rows kept`;
  return { rows, cols, warn };
}
function rebuild(){
  USER.rows=[]; let i=0;
  for(let k=0;k<USER.sets.length;k++){ const st=USER.sets[k];
    for(const r of st.rows){ r.i=i++; r.set=k; r.ep=st.epoch||2000; r.src=st.src; USER.rows.push(r); } }
  USER.warn=USER.sets.map(st=>st.warn).filter(Boolean).join(' · ');
}
function publish(saved){ userLayer.set({ sets:USER.sets.map(st=>({ name:st.name, src:st.src, n:st.rows.length, noDist:st.rows.filter(r=>r.noDist).length, warn:st.warn })),
  n:USER.rows.length, warn:USER.warn, saved:!!saved }); }
function persist(){
  try{ const s=JSON.stringify({ sets:USER.sets.map(st=>({ name:st.name, src:st.src, epoch:st.epoch, prefix:st.prefix, text:st.text })) });
    if(s.length<4e6){ localStorage.setItem(KEY,s); return true; }
    localStorage.removeItem(KEY); USER.warn+=(USER.warn?' · ':'')+'too large to keep after a reload'; }catch(e){}
  return false;
}
function parseSet(st){
  const r=parseUserText(st.text||'');
  if(st.prefix) for(const row of r.rows) if(row.n&&!row.n.startsWith(st.prefix)) row.n=st.prefix+row.n;
  st.rows=r.rows; st.warn=r.warn; st.n=r.rows.length; st.xm=null;
}
// a file replaces the previous file, a query replaces the previous query from that source
export function importUser(text,name,opts={}){
  const src=opts.src||'file';
  const st={ name:name||'your data', src, epoch:opts.epoch||2000, prefix:opts.prefix||'', text:text||'' };
  parseSet(st);
  USER.sets=USER.sets.filter(x=>x.src!==src); USER.sets.push(st);
  while(USER.sets.length>MAX_SETS) USER.sets.shift();
  rebuild(); const saved=persist();
  if(S.pinned&&S.pinned.usr) S.pinned=null; if(S.hover&&S.hover.usr) S.hover=null;
  publish(saved); V.dirty=true; return st.rows.length;
}
export function removeSet(k){
  USER.sets.splice(k,1); rebuild(); const saved=persist();
  if(S.pinned&&S.pinned.usr) S.pinned=null; if(S.hover&&S.hover.usr) S.hover=null;
  publish(saved); V.dirty=true;
}
export function clearUser(){ USER.sets=[]; rebuild(); try{ localStorage.removeItem(KEY); }catch(e){}
  if(S.pinned&&S.pinned.usr) S.pinned=null; if(S.hover&&S.hover.usr) S.hover=null; publish(false); V.dirty=true; }
export function restoreUser(){
  try{ const s=localStorage.getItem(KEY); if(!s) return; const o=JSON.parse(s); if(!o||!Array.isArray(o.sets)) return;
    USER.sets=o.sets.filter(st=>st&&st.text).map(st=>({ name:st.name||'your data', src:st.src||'file', epoch:st.epoch||2000, prefix:st.prefix||'', text:st.text }));
    for(const st of USER.sets) parseSet(st);
    rebuild(); publish(true); }catch(e){}
}
// ---- drawing ----
const MAS=4.84813681e-9;                                 // mas → rad
export function projectUser(){
  userProj.length=0; if(!S.user||!USER.rows.length) return;
  for(const o of USER.rows){
    let dx=o.dx,dy=o.dy,dz=o.dz;
    const t=tSince(o.ep||2000);                          // the row's epoch → the displayed date
    if(t&&(o.pr||o.pd)){                                 // proper motion on the sky (small angles)
      const cq=Math.hypot(dx,dy)||1e-9, ex=-dy/cq, ey=dx/cq;                 // east
      const nx=-dz*dx/cq, ny=-dz*dy/cq, nz=cq;                              // north
      const a=o.pr*t*MAS, b=o.pd*t*MAS;
      dx+=ex*a+nx*b; dy+=ey*a+ny*b; dz+=nz*b;
      const L=Math.hypot(dx,dy,dz)||1; dx/=L; dy/=L; dz/=L;
    }
    const R=compress(o.d);
    const p=projectInto(dx*R,dy*R,dz*R,_pj);
    if(p.depth<=V.NEAR) continue;
    if(p.x<-40||p.x>W+40||p.y<-40||p.y>H+40) continue;
    o._sx=p.x; o._sy=p.y; o._depth=p.depth; o._z2=p.z2;
    userProj.push(o);
  }
}
export function drawUser(){
  if(!userProj.length) return;
  const many=userProj.length>400, label=S.labels&&userProj.length<=60;   // names for a few; crowds stay rings
  ctx.lineWidth=1.4;
  for(const o of userProj){
    const sel=(o===S.hover||o===S.pinned);
    // after a cross-match: a row without a counterpart is red — that is the row to look at
    const unk=o.xm===null && USER.sets[o.set] && USER.sets[o.set].xm;
    const r=sel?8:many?3.5:5.5;
    ctx.beginPath(); ctx.arc(o._sx,o._sy,r,0,6.2832);
    ctx.strokeStyle=sel?'rgba(79,214,200,0.95)':unk?'rgba(255,96,96,0.95)':'rgba(255,176,96,0.85)'; ctx.stroke();
    if(!many||sel||unk){ ctx.beginPath(); ctx.arc(o._sx,o._sy,1.3,0,6.2832); ctx.fillStyle=sel?'rgba(79,214,200,1)':unk?'rgba(255,120,120,1)':'rgba(255,176,96,0.9)'; ctx.fill(); }
    if(o.n&&(sel||label||unk)){
      ctx.font=(sel?'11px':'9.5px')+' ui-monospace,monospace';
      ctx.fillStyle=sel?'rgba(79,214,200,1)':unk?'rgba(255,150,150,0.9)':'rgba(255,196,130,0.8)';
      LBL.prio=sel?P_SEL:P_STAR; ctx.fillText(o.n, o._sx+r+4, o._sy+3); LBL.prio=P_STAR;
    }
  }
}
