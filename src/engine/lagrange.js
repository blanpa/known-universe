// Lagrange points and Hill spheres.
import { ctx } from './canvas.js';
import { pathBegin, pathPt, pathStroke } from './draw.js';
import { LBL, P_SMALL } from './labels.js';
import { SOLAR_BODIES, eclToWorld } from './solar-data.js';
import { solarProj } from './solar.js';
import { S, V } from './state.js';
import { H, W, project } from './view.js';
// ---- gravity structure: Lagrange points + Hill spheres (real, time-aware) ----
// mass ratio m = M_planet/M_sun → Hill radius r_H = r·(m/3)^(1/3); the L-points
// derive from the same ratio and the planets' true current positions.
const MASS_RATIO={Mercury:1.66e-7,Venus:2.447e-6,Earth:3.003e-6,Mars:3.227e-7,
  Jupiter:9.545e-4,Saturn:2.858e-4,Uranus:4.366e-5,Neptune:5.151e-5};
const LAG_NOTE={
  'L1 · Sun–Earth':'sunward · SOHO & DSCOVR station here',
  'L2 · Sun–Earth':'anti-sunward · JWST & Gaia orbit here',
  'L3 · Sun–Earth':'forever hidden behind the Sun',
  'L4 · Sun–Earth':'stable · leads Earth by 60°',
  'L5 · Sun–Earth':'stable · trails Earth by 60°',
  'L4 · Sun–Jupiter':'the "Greek camp" — thousands of trojans gather here',
  'L5 · Sun–Jupiter':'the "Trojan camp" — thousands of trojans gather here'};
const LAG_PTS=[];   // persistent objects so hover/pin identity survives frames
for(const [pl,pts] of [['Earth',['L1','L2','L3','L4','L5']],['Jupiter',['L4','L5']]])
  for(const L of pts) LAG_PTS.push({n:L+' · Sun–'+pl, lp:true, pl, L,
    kind:'Lagrange point', note:LAG_NOTE[L+' · Sun–'+pl]});
export function drawLagrange(A){ LBL.prio=P_SMALL;
  const byName={}; for(const b of SOLAR_BODIES) byName[b.n]=b;
  // Hill spheres: dashed circle in the ecliptic plane, TRUE radius — sub-pixel
  // from afar (as in reality), grows into view as you zoom toward a planet
  for(const b of SOLAR_BODIES){
    const m=MASS_RATIO[b.n]; if(!m||!b._e) continue;
    const rH=b._r*Math.cbrt(m/3);
    const pc=project.apply(null,eclToWorld(b._e[0],b._e[1],b._e[2]));
    if(pc.depth<=V.NEAR) continue;
    const edge=project.apply(null,eclToWorld(b._e[0]+rH,b._e[1],b._e[2]));
    const rp=Math.hypot(edge.x-pc.x,edge.y-pc.y);
    if(rp<6 || rp>Math.min(W,H)*6) continue;     // invisible at this zoom / camera deep inside
                                                 // (dashing a 30k-px circle stalls the rasterizer)
    pathBegin();
    for(let k=0;k<=48;k++){ const th=k/48*6.2832;
      const w=eclToWorld(b._e[0]+Math.cos(th)*rH, b._e[1]+Math.sin(th)*rH, b._e[2]);
      pathPt(project(w[0],w[1],w[2]));
    }
    pathStroke(`rgba(150,205,255,${A*0.4})`,1,[3,5]);
    if(rp>30){ ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(150,205,255,${A*0.7})`;
      const km=rH*149.6;                         // AU → million km
      ctx.fillText('Hill sphere · '+(km<1?Math.round(km*1000).toLocaleString('en-US')+',000 km':km.toFixed(1)+' M km'),
        pc.x+rp*0.72, pc.y-rp*0.72); }
  }
  // Lagrange points of the Sun–Earth and Sun–Jupiter systems
  const c60=0.5, s60=0.8660254;
  for(const q of LAG_PTS){
    const b=byName[q.pl]; if(!b||!b._e){ q._e=null; continue; }
    const m=MASS_RATIO[q.pl], f=Math.cbrt(m/3), e=b._e;
    q._e = q.L==='L1' ? [e[0]*(1-f),e[1]*(1-f),e[2]*(1-f)]
         : q.L==='L2' ? [e[0]*(1+f),e[1]*(1+f),e[2]*(1+f)]
         : q.L==='L3' ? [-e[0]*(1+7*m/12),-e[1]*(1+7*m/12),-e[2]*(1+7*m/12)]
         : q.L==='L4' ? [e[0]*c60-e[1]*s60, e[0]*s60+e[1]*c60, e[2]]   // 60° ahead
         :              [e[0]*c60+e[1]*s60,-e[0]*s60+e[1]*c60, e[2]];  // 60° behind
    const w=eclToWorld(q._e[0],q._e[1],q._e[2]), p=project(w[0],w[1],w[2]);
    if(p.depth<=V.NEAR) continue;
    if(q.L==='L1'||q.L==='L2'){                  // hug the planet — draw only when resolvable
      const pp=project.apply(null,eclToWorld(e[0],e[1],e[2]));
      if(pp.depth>V.NEAR && Math.hypot(p.x-pp.x,p.y-pp.y)<13) continue;
    }
    const sel=(q===S.hover||q===S.pinned), r=sel?4.5:3;
    ctx.beginPath(); ctx.moveTo(p.x,p.y-r); ctx.lineTo(p.x+r,p.y); ctx.lineTo(p.x,p.y+r); ctx.lineTo(p.x-r,p.y); ctx.closePath();
    ctx.strokeStyle=`rgba(196,170,255,${A*0.9})`; ctx.lineWidth=1.1; ctx.stroke();
    if(sel){ ctx.beginPath(); ctx.arc(p.x,p.y,r+5,0,6.2832);
      ctx.strokeStyle='rgba(79,214,200,.9)'; ctx.lineWidth=1.1; ctx.stroke(); }
    solarProj.push({o:q,x:p.x,y:p.y,px:7});
    ctx.font='9px ui-monospace,monospace'; ctx.fillStyle=`rgba(196,170,255,${A*(sel?1:0.78)})`;
    ctx.fillText(q.L+(q.pl==='Jupiter'?' · Jupiter':''), p.x+r+3, p.y+3);
  }
}
