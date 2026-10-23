// View state: S (layer flags + camera angles) and V (cross-module runtime state).
// ---- state ----
export const S={ yaw:0.5, pitch:-0.5, camZ:2.47, year:2026, tOffsetDays:0,
  autorot:false, freelook:false, rings:true, veil:true, size:true, galaxies:true,
  hyg:true, user:true, gpu:true, gaia:true, web:true, qso:true, ob:true, vars:true, edge:true, facColor:false, facHidden:new Set(),
  solar:true, moons:true, mw:true, mw3d:true, dso:true, psr:true, oclu:true, ast:true, tno:true, probes:true, helio:true, belt:true, con:true, hz:true, lag:true, lens:true, pm:false, pmYears:0,
  cme:true, neo:true, sat:true, sunAR:true, met:true, iso:true, eht:false, labels:true,
  radio:true, bubble:true, grid:false, ggrid:false,
  realScale:false,
  hover:null, pinned:null, focusStar:null, focusT:0,
  skyMode:false };

// Runtime state written from more than one module. A plain object, so every
// cross-module write is an explicit V.x = … rather than a hidden shared binding.
export const V = {
  fovK: 1,
  roll: 0,          // screen roll (sky view keeps celestial north up); 0 on the map          // telescope zoom: the projection's focal length × this (1 = the 78° view)
  FOLLOW: null,   // state
  GLDPR: 1,   // view
  NEAR: 0.05,   // state
  ROUTE: null,   // transfer
  TRANSFER: null,   // transfer
  _earthScr: null,   // earth
  _globeOn: false,   // earth
  cx: undefined,   // view
  cy: undefined,   // view
  dirty: true,   // state
  flySpeed: 1,   // state
  foc: undefined,   // view
  focusSys: null,   // state
  focusSysW: null,   // state
  gwOnScreen: false,   // deep
  lastInfo: undefined,   // hud
  navTarget: null,   // state
  playAcc: 0,   // actions
  solarA: 0,   // state
  sysA: 0,   // state
  tgtCamZ: S.camZ,   // view
  tgtPitch: S.pitch,   // view
  tgtYaw: S.yaw,   // view
};