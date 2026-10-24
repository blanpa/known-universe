// Stellar kinematics, pure. Heliocentric Galactic space velocities U, V, W from ICRS position,
// parallax, proper motion and radial velocity (Johnson & Soderblom 1987 with the Hipparcos
// Galactic frame), and an orbit in a three-component Milky Way potential (Miyamoto–Nagai
// disc, Hernquist bulge, NFW halo, tuned to 235 km/s at the Sun) integrated with a leapfrog.
// Checked by tools/kinematics-check.mjs: UVW against astropy, the Sun's orbit against the
// textbook period and excursions.
const D2R=Math.PI/180, K=4.740470463;                       // km/s per (mas/yr · kpc)… with distance in pc: 4.74047 × μ[″/yr] × d[pc]
// ICRS → Galactic rotation (Hipparcos/ESA 1997, the matrix astropy uses)
export const AG=[[-0.0548755604162154,-0.8734370902348850,-0.4838350155487132],[0.4941094278755837,-0.4448296299600112,0.7469822444972189],[-0.8676661490190047,-0.1980763734312015,0.4559837761750669]];
// U toward the Galactic centre, V along rotation, W toward the north Galactic pole; right-handed
export function uvw(raDeg, decDeg, plxMas, pmraMasYr, pmdecMasYr, rvKms){
  const a=raDeg*D2R, d=decDeg*D2R, ca=Math.cos(a), sa=Math.sin(a), cd=Math.cos(d), sd=Math.sin(d);
  const T=AG, A=[[ca*cd,-sa,-ca*sd],[sa*cd,ca,-sa*sd],[sd,0,cd]];                       // (ra,dec) → equatorial Cartesian derivatives
  const B=[0,1,2].map(i=>[0,1,2].map(j=>T[i][0]*A[0][j]+T[i][1]*A[1][j]+T[i][2]*A[2][j]));
  const k=K/plxMas, v=[rvKms, k*pmraMasYr, k*pmdecMasYr];                                 // km/s along the line of sight and the two tangential axes
  return { U:B[0][0]*v[0]+B[0][1]*v[1]+B[0][2]*v[2], V:B[1][0]*v[0]+B[1][1]*v[1]+B[1][2]*v[2], W:B[2][0]*v[0]+B[2][1]*v[1]+B[2][2]*v[2] };
}
// Galactic Cartesian heliocentric position (kpc) from ICRS direction and distance
export function galXYZ(dir, distPc){ const g=[0,1,2].map(i=>AG[i][0]*dir[0]+AG[i][1]*dir[1]+AG[i][2]*dir[2]); return [g[0]*distPc/1000, g[1]*distPc/1000, g[2]*distPc/1000]; }
// the Sun: R0 = 8.122 kpc (GRAVITY 2018), z0 = 20.8 pc (Bennett & Bovy 2019), peculiar motion (11.1, 12.24, 7.25) km/s
// (Schönrich 2010), circular speed 232.8 km/s (McMillan 2017)
export const SUN={ R0:8.122, z0:0.0208, U:11.1, V:12.24, W:7.25, vc:232.8 };
// potential: kpc, km/s; G = 4.30091e-6 kpc (km/s)² / Msun
const G=4.30091e-6;
export const MW={ disc:{ M:6.8e10, a:3.0, b:0.28 }, bulge:{ M:0.5e10, a:0.5 }, halo:{ rs:16.0, rho0:0 } };
(function tune(){ // set the halo density so the circular speed at R0 is SUN.vc
  const R=SUN.R0, vd2=vcDisc2(R,0), vb2=vcBulge2(R); const need=SUN.vc*SUN.vc-vd2-vb2; MW.halo.rho0=1; const vh2=vcHalo2(R); MW.halo.rho0=need/vh2; })();
function vcDisc2(R,z){ const {M,a,b}=MW.disc, s=a+Math.sqrt(z*z+b*b); return G*M*R*R/Math.pow(R*R+s*s,1.5); }
function vcBulge2(r){ const {M,a}=MW.bulge; return G*M*r/((r+a)*(r+a)); }
function vcHalo2(r){ const {rs,rho0}=MW.halo, x=r/rs; return 4*Math.PI*G*rho0*rs*rs*rs*(Math.log(1+x)-x/(1+x))/r; }
export function circularSpeed(R){ return Math.sqrt(vcDisc2(R,0)+vcBulge2(R)+vcHalo2(R)); }
export function accel(p){                                 // kpc/Myr² from km/s² units: 1 km/s per Myr = 1.0227e-3 kpc/Myr → keep km/s and kpc, convert at the integrator
  const [x,y,z]=p, R2=x*x+y*y, r=Math.sqrt(R2+z*z)||1e-9;
  const {M:Md,a,b}=MW.disc, zb=Math.sqrt(z*z+b*b), s=a+zb, D=Math.pow(R2+s*s,1.5);
  const ax=-G*Md*x/D, ay=-G*Md*y/D, az=-G*Md*z*s/(zb*D);
  const {M:Mb,a:ab}=MW.bulge, fb=-G*Mb/((r+ab)*(r+ab)*r);
  const {rs,rho0}=MW.halo, xh=r/rs, Mh=4*Math.PI*rho0*rs*rs*rs*(Math.log(1+xh)-xh/(1+xh)), fh=-G*Mh/(r*r*r);
  return [ax+fb*x+fh*x, ay+fb*y+fh*y, az+fb*z+fh*z];     // (km/s)²/kpc
}
const KPC_PER_KMS_MYR=1.0227121650e-3;                   // 1 km/s × 1 Myr in kpc
// orbit of a star given its heliocentric Galactic position (kpc) and velocity (km/s), ±span Myr, step dt Myr; returns Galactocentric points
export function orbit(posHelio, velHelio, { span=500, dt=0.5 }={}){
  // to the Galactocentric frame: the Sun at (−R0, 0, z0), moving with (U☉, V☉ + vc, W☉); x toward the Galactic centre from the Sun → GC at origin
  const p0=[posHelio[0]-SUN.R0, posHelio[1], posHelio[2]+SUN.z0], v0=[velHelio[0]+SUN.U, velHelio[1]+SUN.V+SUN.vc, velHelio[2]+SUN.W];
  const run=(sign)=>{ const pts=[]; let p=p0.slice(), v=v0.slice(), a=accel(p); const h=sign*dt;
    for(let t=0; Math.abs(t)<span; t+=h){
      for(let i=0;i<3;i++) v[i]+=0.5*h*a[i]*KPC_PER_KMS_MYR;           // kick (a in (km/s)²/kpc → km/s per Myr needs × KPC… : dv[km/s] = a[(km/s)²/kpc] × dt[Myr] × 1.0227e-3)
      for(let i=0;i<3;i++) p[i]+=h*v[i]*KPC_PER_KMS_MYR;               // drift
      a=accel(p); for(let i=0;i<3;i++) v[i]+=0.5*h*a[i]*KPC_PER_KMS_MYR;
      pts.push({ t:t+h, x:p[0], y:p[1], z:p[2], R:Math.hypot(p[0],p[1]) }); }
    return pts; };
  const fwd=run(1), back=run(-1).reverse();
  const all=back.concat([{ t:0, x:p0[0], y:p0[1], z:p0[2], R:Math.hypot(p0[0],p0[1]) }], fwd);
  let Rmin=Infinity, Rmax=0, zmax=0; for(const q of all){ if(q.R<Rmin) Rmin=q.R; if(q.R>Rmax) Rmax=q.R; if(Math.abs(q.z)>zmax) zmax=Math.abs(q.z); }
  // the azimuthal period from the unwrapped angle over the forward run
  let ang=0, prev=Math.atan2(p0[1],p0[0]); for(const q of fwd){ const a2=Math.atan2(q.y,q.x); let d=a2-prev; if(d>Math.PI) d-=2*Math.PI; if(d<-Math.PI) d+=2*Math.PI; ang+=d; prev=a2; }
  const period=ang!==0?Math.abs(2*Math.PI/ang*span):null;
  return { pts:all, Rmin, Rmax, zmax, ecc:(Rmax-Rmin)/(Rmax+Rmin), period, Rg:(Rmax+Rmin)/2, vc:circularSpeed(SUN.R0) };
}
// Galactocentric (kpc) → heliocentric ICRS direction and distance (pc), for drawing the orbit on the map
export function toHelioICRS(q){ const h=[q.x+SUN.R0, q.y, q.z-SUN.z0]; const d=Math.hypot(h[0],h[1],h[2])*1000||1e-9;
  const g=[h[0]*1000/d,h[1]*1000/d,h[2]*1000/d]; return { dir:[AG[0][0]*g[0]+AG[1][0]*g[1]+AG[2][0]*g[2], AG[0][1]*g[0]+AG[1][1]*g[1]+AG[2][1]*g[2], AG[0][2]*g[0]+AG[1][2]*g[1]+AG[2][2]*g[2]], d }; }
