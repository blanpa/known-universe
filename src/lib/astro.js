// Positional astronomy, pure: no DOM, no engine state, so Node can check every function
// against astropy/ERFA (tools/astro-check.mjs). Conventions: angles in degrees at the API,
// radians inside; directions are unit vectors [x,y,z] with x → RA 0°, z → the north pole;
// time as Julian Date (UTC unless said otherwise). ICRS is the frame everything is stored
// in; "of date" means true equator and equinox of date (IAU 2006 precession, IAU 2000B
// nutation truncated to its 20 largest terms, frame bias), "apparent" adds annual aberration.
const D2R=Math.PI/180, R2D=180/Math.PI, AS2R=Math.PI/648000;
export const J2000=2451545.0;
export const DELTA_T=69.2;                                 // TT − UTC in seconds, 2026 (37 leap s + 32.184)
export const jdOf=date=>date.getTime()/86400000+2440587.5;
export const dateOf=jd=>new Date((jd-2440587.5)*86400000);
export const juliaYear=jd=>2000+(jd-J2000)/365.25;
export const vec=(ra,dec)=>{ const r=ra*D2R, d=dec*D2R, c=Math.cos(d); return [c*Math.cos(r), c*Math.sin(r), Math.sin(d)]; };
export const radec=v=>{ const l=Math.hypot(v[0],v[1],v[2])||1; return [((Math.atan2(v[1],v[0])*R2D)+360)%360, Math.asin(Math.max(-1,Math.min(1,v[2]/l)))*R2D]; };
const R1=a=>{ const c=Math.cos(a),s=Math.sin(a); return [[1,0,0],[0,c,s],[0,-s,c]]; };
const R3=a=>{ const c=Math.cos(a),s=Math.sin(a); return [[c,s,0],[-s,c,0],[0,0,1]]; };
const mul=(A,B)=>A.map((r,i)=>[0,1,2].map(j=>r[0]*B[0][j]+r[1]*B[1][j]+r[2]*B[2][j]));
export const apply=(M,v)=>[M[0][0]*v[0]+M[0][1]*v[1]+M[0][2]*v[2], M[1][0]*v[0]+M[1][1]*v[1]+M[1][2]*v[2], M[2][0]*v[0]+M[2][1]*v[1]+M[2][2]*v[2]];
export const transpose=M=>[[M[0][0],M[1][0],M[2][0]],[M[0][1],M[1][1],M[2][1]],[M[0][2],M[1][2],M[2][2]]];
// ---- frame bias (ICRS → mean J2000), IAU 2006/2000: η0, ξ0, dα0 ----
export function biasMatrix(){ const dra0=-0.0146*AS2R, xi0=-0.016617*AS2R, eta0=-0.0068192*AS2R;
  return mul(R1(-eta0), mul(R2(xi0), R3(dra0))); }
const R2=a=>{ const c=Math.cos(a),s=Math.sin(a); return [[c,0,-s],[0,1,0],[s,0,c]]; };
// ---- precession, IAU 2006 (Capitaine et al. 2003, the four-angle form) ----
export function precessionAngles(T){                       // T: Julian centuries TT since J2000
  const eps0=84381.406;
  const psiA=(5038.481507+(-1.0790069+(-0.00114045+(0.000132851-0.0000000951*T)*T)*T)*T)*T;
  const omA=eps0+(-0.025754+(0.0512623+(-0.00772503+(-0.000000467+0.0000003337*T)*T)*T)*T)*T;
  const chiA=(10.556403+(-2.3814292+(-0.00121197+(0.000170663-0.0000000560*T)*T)*T)*T)*T;
  return { eps0:eps0*AS2R, psiA:psiA*AS2R, omA:omA*AS2R, chiA:chiA*AS2R };
}
export function precessionMatrix(T){ const a=precessionAngles(T);
  return mul(R3(a.chiA), mul(R1(-a.omA), mul(R3(-a.psiA), R1(a.eps0)))); }   // mean J2000 → mean of date
export const meanObliquity=T=>(84381.406+(-46.836769+(-0.0001831+(0.00200340+(-0.000000576-0.0000000434*T)*T)*T)*T)*T)*AS2R;
// ---- nutation, IAU 2000B truncated: the 20 largest luni-solar terms (of 77) + the planetary
// offsets; the dropped terms sum to < 0.1″ ----
const NUT=[ // l l' F D Ω · ψ ψ' · ε ε'  (units 0.1 mas, 0.1 mas/century)
 [0,0,0,0,1, -172064161,-174666, 92052331,9086],
 [0,0,2,-2,2, -13170906,-1675, 5730336,-3015],
 [0,0,2,0,2, -2276413,-234, 978459,-485],
 [0,0,0,0,2, 2074554,207, -897492,470],
 [0,1,0,0,0, 1475877,-3633, 73871,-184],
 [0,1,2,-2,2, -516821,1226, 224386,-677],
 [1,0,0,0,0, 711159,73, -6750,0],
 [0,0,2,0,1, -387298,-367, 200728,18],
 [1,0,2,0,2, -301461,-36, 129025,-63],
 [0,-1,2,-2,2, 215829,-494, -95929,299],
 [0,0,2,-2,1, 128227,137, -68982,-9],
 [-1,0,2,0,2, 123457,11, -53311,32],
 [-1,0,0,2,0, 156994,10, -1235,0],
 [1,0,0,0,1, 63110,63, -33228,0],
 [-1,0,0,0,1, -57976,-63, 31429,0],
 [-1,0,2,2,2, -59641,-11, 25543,-11],
 [1,0,2,0,1, -51613,-42, 26366,0],
 [-2,0,2,0,1, 45893,50, -24236,-10],
 [0,0,0,2,0, 63384,11, -1220,0],
 [0,0,2,2,2, -38571,-1, 16452,-11] ];
export function fundamentalArgs(T){                        // Delaunay arguments, IAU 2000 (radians)
  const n=x=>((x%1296000)+1296000)%1296000*AS2R;
  return { l:n(485868.249036+1717915923.2178*T), lp:n(1287104.79305+129596581.0481*T), F:n(335779.526232+1739527262.8478*T),
           D:n(1072260.70369+1602961601.2090*T), Om:n(450160.398036-6962890.5431*T) };
}
export function nutation(T){                               // → { dpsi, deps } in radians
  const a=fundamentalArgs(T); let dpsi=0, deps=0;
  for(const t of NUT){ const arg=t[0]*a.l+t[1]*a.lp+t[2]*a.F+t[3]*a.D+t[4]*a.Om;
    dpsi+=(t[5]+t[6]*T)*Math.sin(arg); deps+=(t[7]+t[8]*T)*Math.cos(arg); }
  return { dpsi:(dpsi*1e-7-0.000135)*AS2R, deps:(deps*1e-7+0.000388)*AS2R };   // 0.1 mas → arcsec, + planetary offsets
}
export function nutationMatrix(T){ const e=meanObliquity(T), n=nutation(T);
  return mul(R1(-(e+n.deps)), mul(R3(-n.dpsi), R1(e))); }   // mean of date → true of date
// ICRS → true equator and equinox of date (bias · precession · nutation)
export function icrsToDateMatrix(jdTT){ const T=(jdTT-J2000)/36525;
  return mul(nutationMatrix(T), mul(precessionMatrix(T), biasMatrix())); }
// ---- the Sun (Meeus ch. 25, 0.01°) and the Earth's velocity for aberration ----
export function sunGeometric(jdTT){                         // geocentric ecliptic longitude (rad, of date), radius (AU)
  const T=(jdTT-J2000)/36525, L0=(280.46646+36000.76983*T+0.0003032*T*T)*D2R, M=(357.52911+35999.05029*T-0.0001537*T*T)*D2R, e=0.016708634-0.000042037*T-0.0000001267*T*T;
  const C=((1.914602-0.004817*T-0.000014*T*T)*Math.sin(M)+(0.019993-0.000101*T)*Math.sin(2*M)+0.000289*Math.sin(3*M))*D2R;
  const lon=L0+C, nu=M+C, R=1.000001018*(1-e*e)/(1+e*Math.cos(nu));
  return { lon, R, M, e };
}
export function sunApparentDir(jdTT){                       // apparent (of date) direction of the Sun, equatorial
  const s=sunGeometric(jdTT), T=(jdTT-J2000)/36525, Om=(125.04-1934.136*T)*D2R, lam=s.lon-(0.00569+0.00478*Math.sin(Om))*D2R;
  const eps=meanObliquity(T)+0.00256*D2R*Math.cos(Om);
  return [Math.cos(lam), Math.sin(lam)*Math.cos(eps), Math.sin(lam)*Math.sin(eps)];
}
export function earthVelocity(jdTT){                        // heliocentric, AU/day, ICRS axes
  // Meeus' Sun is referred to the equinox of date; the velocity is rotated back to J2000/ICRS
  // (precession turns the frame by 0.36° by 2026, which would bend the aberration by 0.13″)
  const h=0.5, T=(jdTT-J2000)/36525, Pt=transpose(precessionMatrix(T));
  const p=t=>{ const s=sunGeometric(t), e=meanObliquity((t-J2000)/36525); const x=-s.R*Math.cos(s.lon), y=-s.R*Math.sin(s.lon);
    return [x, y*Math.cos(e), y*Math.sin(e)]; };                               // Earth = −Sun, equatorial of date
  const a=p(jdTT-h), b=p(jdTT+h); return apply(Pt,[(b[0]-a[0])/(2*h),(b[1]-a[1])/(2*h),(b[2]-a[2])/(2*h)]);
}
const C_AUD=173.1446326846693;                              // speed of light, AU/day
export function aberrate(dir,v){                            // annual aberration, classical first order (v/c ≈ 1e-4: < 0.001″ from the relativistic form)
  const bx=v[0]/C_AUD, by=v[1]/C_AUD, bz=v[2]/C_AUD, d=dir[0]*bx+dir[1]*by+dir[2]*bz;
  const o=[dir[0]+bx-dir[0]*d, dir[1]+by-dir[1]*d, dir[2]+bz-dir[2]*d], l=Math.hypot(o[0],o[1],o[2]); return [o[0]/l,o[1]/l,o[2]/l];
}
// ICRS direction → apparent place of date (precession-nutation + annual aberration; light deflection by the Sun, ≤ 0.004″ away from it, is left out)
export function apparentOf(dirICRS, jdUTC){ const jdTT=jdUTC+DELTA_T/86400;
  return apply(icrsToDateMatrix(jdTT), aberrate(dirICRS, earthVelocity(jdTT))); }
export function dateOfICRS(dirICRS, jdUTC){ return apply(icrsToDateMatrix(jdUTC+DELTA_T/86400), dirICRS); }   // of date, no aberration
export function icrsOfDate(dirDate, jdUTC){ return apply(transpose(icrsToDateMatrix(jdUTC+DELTA_T/86400)), dirDate); }
// ---- sidereal time (IAU 2006; UT1 ≈ UTC, ΔUT1 < 1 s ≈ 15″ of hour angle, below the display's resolution) ----
export function era(jdUT1){ const t=jdUT1-J2000; return ((0.7790572732640+1.00273781191135448*t)%1+1)%1*2*Math.PI; }
// UT1 is taken as UTC: the difference (|ΔUT1| < 0.9 s, published by the IERS week by week)
// shifts hour angles by up to 13″ — below what the display resolves, and not knowable ahead
export function gmst(jdUT1){ const T=(jdUT1+DELTA_T/86400-J2000)/36525;
  return (era(jdUT1)+(0.014506+(4612.156534+(1.3915817+(-0.00000044+(-0.000029956-0.0000000368*T)*T)*T)*T)*T)*AS2R)%(2*Math.PI); }
export function gast(jdUT1){ const T=(jdUT1+DELTA_T/86400-J2000)/36525, n=nutation(T);
  return (gmst(jdUT1)+n.dpsi*Math.cos(meanObliquity(T)+n.deps)+2*Math.PI)%(2*Math.PI); }
// ---- the observer: apparent (ra, dec) of date → altitude, azimuth (from north through east), hour angle ----
export function altaz(raDeg, decDeg, jdUTC, latDeg, lonDeg){
  const H=gast(jdUTC)+lonDeg*D2R-raDeg*D2R, phi=latDeg*D2R, dec=decDeg*D2R;
  const sa=Math.sin(phi)*Math.sin(dec)+Math.cos(phi)*Math.cos(dec)*Math.cos(H), alt=Math.asin(Math.max(-1,Math.min(1,sa)));
  const az=Math.atan2(-Math.cos(dec)*Math.sin(H), Math.sin(dec)*Math.cos(phi)-Math.cos(dec)*Math.sin(phi)*Math.cos(H));
  return { alt:alt*R2D, az:((az*R2D)+360)%360, ha:(((H*R2D+180)%360+360)%360-180)/15 };
}
export const airmass=altDeg=>{ if(altDeg<=0) return Infinity; const z=90-altDeg; return 1/(Math.cos(z*D2R)+0.50572*Math.pow(96.07995-z,-1.6364)); };   // Kasten & Young 1989
export const refraction=altDeg=>altDeg<-1?0:1.02/Math.tan((altDeg+10.3/(altDeg+5.11))*D2R)/60;   // Bennett 1982, degrees, 1010 hPa 10 °C
// rise / transit / set of an ICRS direction on the UTC day of jd for the standard altitude h0 (°): −0.5667 stars, −0.8333 Sun, −6/−12/−18 twilight
export function riseSet(dirICRS, jdUTC, latDeg, lonDeg, h0=-0.5667){
  const day0=Math.floor(jdUTC-0.5)+0.5; const altAt=t=>{ const a=radec(apparentOf(dirICRS,t)); return altaz(a[0],a[1],t,latDeg,lonDeg).alt; };
  const out={ rise:null, transit:null, set:null, alwaysUp:false, neverUp:false };
  let prev=altAt(day0), tPrev=day0, best=-Infinity;
  for(let k=1;k<=96;k++){ const t=day0+k/96, a=altAt(t); if(a>best){ best=a; out.transit=t; }
    if(prev<h0&&a>=h0&&out.rise===null) out.rise=bisect(altAt,tPrev,t,h0);
    if(prev>=h0&&a<h0&&out.set===null) out.set=bisect(altAt,tPrev,t,h0);
    prev=a; tPrev=t; }
  // refine the transit around the best sample
  if(out.transit!==null){ let lo=out.transit-1/96, hi=out.transit+1/96; for(let i=0;i<30;i++){ const m1=lo+(hi-lo)/3, m2=hi-(hi-lo)/3; if(altAt(m1)<altAt(m2)) lo=m1; else hi=m2; } out.transit=(lo+hi)/2; }
  if(out.rise===null&&out.set===null){ if(best>=h0) out.alwaysUp=true; else out.neverUp=true; }
  return out;
}
function bisect(f,a,b,h0){ for(let i=0;i<40;i++){ const m=(a+b)/2; if((f(a)-h0)*(f(m)-h0)<=0) b=m; else a=m; } return (a+b)/2; }
// twilight and the Sun for the day: the Sun's apparent direction is already "of date" — the ICRS form is recovered for riseSet
export function sunRiseSet(jdUTC, latDeg, lonDeg, h0=-0.8333){
  const sunICRS=t=>icrsOfDate(sunApparentDir(t+DELTA_T/86400), t);
  const day0=Math.floor(jdUTC-0.5)+0.5, dir=sunICRS(day0+0.5);     // the Sun moves 1°/day: one direction per day is within 0.5° ≈ 2 min of rise time
  return riseSet(dir, jdUTC, latDeg, lonDeg, h0);
}
export const fmtHM=jd=>{ if(jd===null||jd===undefined) return '—'; const d=dateOf(jd); return String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0')+' UT'; };
