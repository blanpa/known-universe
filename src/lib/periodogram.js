// Period search, pure. Generalised Lomb–Scargle (Zechmeister & Kürster 2009: floating mean,
// optional weights) on an unevenly sampled series, a box-least-squares transit search, and
// phase folding. Checked by tools/periodogram-check.mjs on synthetic series.
export function lombScargle(t, y, { fmin, fmax, ofac=5, w=null, nmax=20000 }={}){
  const n=t.length; if(n<4) return { f:[], p:[] };
  let tmin=Infinity, tmax=-Infinity; for(let i=0;i<n;i++){ if(t[i]<tmin) tmin=t[i]; if(t[i]>tmax) tmax=t[i]; }
  const base=Math.max(tmax-tmin,1e-9);
  if(fmin===undefined) fmin=1/base; if(fmax===undefined){ let dt=Infinity; const s=Array.from(t).sort((a,b)=>a-b); for(let i=1;i<n;i++) dt=Math.min(dt,s[i]-s[i-1]||Infinity); fmax=Math.min(0.5/Math.max(dt,1e-6), 50/base*n/2); }
  const df=1/(ofac*base); let nf=Math.floor((fmax-fmin)/df)+1; if(nf>nmax){ nf=nmax; }
  const dff=(fmax-fmin)/Math.max(nf-1,1);
  // weights normalised to 1
  const W=new Float64Array(n); let ws=0; for(let i=0;i<n;i++){ W[i]=w?w[i]:1; ws+=W[i]; } for(let i=0;i<n;i++) W[i]/=ws;
  let Y=0; for(let i=0;i<n;i++) Y+=W[i]*y[i]; let YY=0; for(let i=0;i<n;i++) YY+=W[i]*(y[i]-Y)*(y[i]-Y);
  const f=new Float64Array(nf), p=new Float64Array(nf), tc=new Float64Array(n); for(let i=0;i<n;i++) tc[i]=t[i]-tmin;
  for(let k=0;k<nf;k++){ const fr=fmin+k*dff, om=2*Math.PI*fr; let C=0,S=0,CC=0,SS=0,CS=0,YC=0,YS=0;
    for(let i=0;i<n;i++){ const a=om*tc[i], c=Math.cos(a), s=Math.sin(a), wi=W[i], yi=y[i]-Y; C+=wi*c; S+=wi*s; CC+=wi*c*c; SS+=wi*s*s; CS+=wi*c*s; YC+=wi*yi*c; YS+=wi*yi*s; }
    const cc=CC-C*C, ss=SS-S*S, cs=CS-C*S, D=cc*ss-cs*cs;
    f[k]=fr; p[k]=D>0 ? (ss*YC*YC+cc*YS*YS-2*cs*YC*YS)/(YY*D) : 0; }
  return { f, p, fmin, fmax, n:nf };
}
export function bestPeak(f, p, skip=0){                     // the highest power and its period; skip = ignore the first k bins (red noise)
  let k=-1, best=-1; for(let i=skip;i<p.length;i++) if(p[i]>best){ best=p[i]; k=i; }
  if(k<0) return null;
  // parabolic refinement between neighbours
  let fr=f[k]; if(k>0&&k<p.length-1){ const d=(p[k-1]-p[k+1])/(2*(p[k-1]-2*p[k]+p[k+1])); if(isFinite(d)&&Math.abs(d)<1) fr=f[k]+d*(f[k+1]-f[k]); }
  return { f:fr, period:1/fr, power:best, k };
}
// false-alarm probability (Baluev 2008, the "number of independent frequencies" estimate for a quick verdict)
export function fap(power, nPoints, nFreq){ const z=power, N=nPoints; if(N<4) return 1; const pf=Math.pow(Math.max(0,1-z),(N-3)/2); return Math.min(1, 1-Math.pow(1-pf, Math.max(1,nFreq))); }
export function fold(t, y, period, t0=0){ const ph=new Float64Array(t.length); for(let i=0;i<t.length;i++){ let q=((t[i]-t0)/period)%1; if(q<0) q+=1; ph[i]=q; } return ph; }
// binned, folded curve (for the plot and the transit depth)
export function binned(ph, y, nb=100){ const s=new Float64Array(nb), c=new Int32Array(nb); for(let i=0;i<ph.length;i++){ const b=Math.min(nb-1,Math.floor(ph[i]*nb)); s[b]+=y[i]; c[b]++; } return Array.from(s,(v,i)=>c[i]?v/c[i]:NaN); }
// Box least squares (Kovács et al. 2002), coarse: durations as fractions of the period, phases on a grid
export function bls(t, y, { pmin=0.5, pmax, nP=2000, qs=[0.01,0.02,0.03,0.05,0.08], nPhase=200 }={}){
  const n=t.length; if(n<10) return null; let tmin=Infinity, tmax=-Infinity; for(let i=0;i<n;i++){ if(t[i]<tmin) tmin=t[i]; if(t[i]>tmax) tmax=t[i]; }
  const base=tmax-tmin; if(pmax===undefined) pmax=base/2; if(pmax<=pmin) return null;
  let mean=0; for(let i=0;i<n;i++) mean+=y[i]; mean/=n; const yc=new Float64Array(n); for(let i=0;i<n;i++) yc[i]=y[i]-mean;
  let best=null; const periods=new Float64Array(nP), sr=new Float64Array(nP);
  for(let k=0;k<nP;k++){ const P=1/(1/pmin+(1/pmax-1/pmin)*k/(nP-1)); periods[k]=P;
    const s=new Float64Array(nPhase), c=new Int32Array(nPhase);
    for(let i=0;i<n;i++){ let q=((t[i]-tmin)/P)%1; const b=Math.floor(q*nPhase); s[b]+=yc[i]; c[b]++; }
    let bp=0;
    for(const q of qs){ const nb=Math.max(1,Math.round(q*nPhase));
      let ss=0, cc=0; for(let b=0;b<nb;b++){ ss+=s[b]; cc+=c[b]; }
      for(let i0=0;i0<nPhase;i0++){ const r=cc/n; if(cc>0&&r<1){ const v=ss*ss/(cc*(1-r)); if(v>bp&&ss<0){ bp=v; if(!best||v>best.v) best={ v, P, phase:i0/nPhase, q, depth:-ss/cc, nIn:cc }; } }
        const out=(i0+nb)%nPhase; ss+=s[out]-s[i0]; cc+=c[out]-c[i0]; } }
    sr[k]=Math.sqrt(bp/n); }
  if(!best) return null;
  return { period:best.P, phase:best.phase, duration:best.q*best.P, depth:best.depth, nIn:best.nIn, periods, sr, t0:tmin+best.phase*best.P };
}
