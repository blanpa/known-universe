// The contract between the UI and the engine, and nothing else.
//   api  — engine → filled at boot with the functions the components call
//          (clickToggle, doSearch, suggest, zoomBy, …). Components import this module,
//          never the engine, so the engine can load after the data does.
//   UI   — UI → set by main.js before the engine runs: the few callbacks the engine
//          uses to push state into the Svelte stores.
export const api = {};
export const UI = {};
