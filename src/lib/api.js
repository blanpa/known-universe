// The contract between the UI and the engine, and nothing else: the engine fills `api`
// at boot with the functions the components call (clickToggle, doSearch, zoomBy, lock,
// setCourse, tour.next, …). Components import this module, never the engine, so the
// engine can load after the data does. State flows the other way through the stores.
export const api = {};
