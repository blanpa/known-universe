import { writable } from 'svelte/store';
// Engine → UI. The engine publishes what changed; the components render it. The engine
// never touches panel DOM (its only elements are the two canvases).
export const toggleState = writable({});          // layer on/off per toggle id
export const labels = writable({});               // dynamic toggle labels (catalogue counts)
export const searchMsg = writable('');            // one-line feedback: search, measure, share
export const facList = writable([]);              // discovery-instrument chips
export const facHidden = writable(new Set());
export const facColor = writable(false);
export const timeBar = writable(false);           // timeline strip shown (a UI preference)

export const selection = writable(null);   // {card, lockable, navigable, routable, transferable, locked, isNav, routeOn, transferOn, pinned}
export const stats = writable({ sys: 0, pl: 0, nearLy: null, farLy: null });   // exoplanet systems in view
export const camera = writable({ distPc: 0, distText: '', band: '', real: true, inSolar: false, camZ: 0 , sky: false, skyFrom: null, fov: 0, ra: 0, dec: 0 });
export const nav = writable(null);         // {name, dist, light, bearing} while a course is set
export const tour = writable(null);        // {idx, total, title, text} while the tour runs
export const timeline = writable({ v: 0, label: 'today', playing: false });   // v: −1000…1000 slider units
export const measure = writable(false);    // measure tool armed
export const encounters = writable([]);    // close stellar encounters within ±2 Myr (motion.js)
export const transit = writable(null);          // the focused system's transits: {host, rstar, now, planets:[…]}
export const survey = writable({ id: null, blink: false, blinkWith: 'ps1' });   // sky-survey backdrop state
export const userLayer = writable({ sets: [], n: 0, warn: '', saved: false });   // the imported rows: files and field queries
export const fieldQuery = writable({ busy: null, msg: '' });                       // live Gaia/SIMBAD cone query state
export const skyCursor = writable(null);     // sky view: the sky position under the pointer {ra,dec,l,b}
export const movers = writable({ list: [], a: '', b: '', ea: 0, eb: 0, dt: 0 });   // predicted jumps between the blink epochs
export const crossmatch = writable({ busy: null, msg: '', set: -1, radius: 3, remote: null, known: 0, unknown: 0, n: 0, rows: [] });   // cross-identification of a set
export const measureLog = writable([]);     // every completed measurement, for export
export const samp = writable({ state: 'off', msg: '', hub: null, clients: 0, sent: 0, received: 0 });   // SAMP hub connection (TOPCAT, Aladin)
