import { writable } from 'svelte/store';
// engine -> UI state (the engine never touches component DOM)
export const toggleState = writable({});          // layer on/off per toggle id
export const labels = writable({});               // dynamic toggle labels (catalog counts)
export const searchMsg = writable('');            // search/measure/share feedback line
export const facList = writable([]);              // discovery-instrument chips
export const facHidden = writable(new Set());
export const facColor = writable(false);
export const timeBar = writable(false);       // time bar hidden unless enabled in options
