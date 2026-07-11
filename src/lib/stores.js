import { writable } from 'svelte/store';
// visual on/off state of the layer toggles — the engine drives it via UI.syncToggle
export const toggleState = writable({});
