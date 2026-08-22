// Layer presets + session persistence.
// 39 switches, all on, no memory was a lot to ask of a first-time visitor. Presets set a
// whole scene in one tap; whatever you end up with is remembered for the next visit.
import { api } from './engine.js';
import { toggleState } from './stores.js';

const KEY = 'ku_layers_v2';

// the "View" group holds preferences, not content — presets never touch it
export const VIEW_IDS = ['t-real','t-rot','t-freelook','t-veil','t-rings','t-labels',
                         't-grid','t-ggrid','t-eht','t-timebar'];

const SOLAR = ['t-moons','t-ast','t-belt','t-tno','t-probes','t-iso','t-helio','t-lag',
               't-cme','t-neo','t-sat','t-sun','t-size'];
const STARS = ['t-hyg','t-gpu','t-gaia','t-ob','t-var','t-radio'];
const DEEP  = ['t-dso','t-oclu','t-psr','t-con','t-met','t-bubble','t-mw','t-mw3d','t-lens','t-hz'];
const COSMOS= ['t-gal','t-web','t-qso','t-edge'];
export const CONTENT_IDS = [...SOLAR, ...STARS, ...DEEP, ...COSMOS];

// each preset lists what is ON; every other content layer goes off
export const PRESETS = [
  { k:'solar',  n:'Solar system', icon:'sun',
    on:[...SOLAR, 't-hyg', 't-mw'] },
  { k:'near',   n:'Neighbourhood', icon:'star',
    on:[...STARS, 't-bubble','t-con','t-hz','t-size','t-mw','t-moons','t-probes'] },
  { k:'deep',   n:'Deep sky', icon:'galaxy',
    on:[...DEEP, 't-hyg','t-gpu'] },
  { k:'cosmos', n:'Cosmos', icon:'scope',
    on:[...COSMOS, 't-mw','t-mw3d','t-qso'] },
  { k:'all',    n:'Everything', icon:'layers',
    on:CONTENT_IDS },
];

export function applyPreset(k) {
  const p = PRESETS.find(x => x.k === k); if (!p || !api.setToggle) return;
  const on = new Set(p.on);
  for (const id of CONTENT_IDS) api.setToggle(id, on.has(id));
  save();
}

// which preset (if any) the current layer set matches exactly
export function matchPreset(state) {
  for (const p of PRESETS) {
    const on = new Set(p.on);
    if (CONTENT_IDS.every(id => !!state[id] === on.has(id))) return p.k;
  }
  return null;
}

export function save() {
  if (!api.readToggles) return;
  try { localStorage.setItem(KEY, JSON.stringify(api.readToggles())); } catch (e) {}
}

// restore after the engine booted — setToggle runs each layer's side effect, so the
// restored state is the real state, not just a repainted switch
export function restore() {
  if (!api.setToggle || !api.readToggles) return;
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!saved) return;
  const live = api.readToggles();
  for (const id in saved) {
    if (!(id in live)) continue;
    if (id === 't-real') continue;          // scale mode follows the view, not the session
    api.setToggle(id, !!saved[id]);
  }
  toggleState.set(api.readToggles());
}
