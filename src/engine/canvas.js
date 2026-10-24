// The two canvases: #sky (2D, everything with lines and text) sits over #gl (points).
// `ctx` is a live binding: the SVG export swaps a recording context in for one frame.
export const cv = document.getElementById('sky');
export let ctx = cv.getContext('2d');
export const ctx2d = ctx;
export function swapContext(c){ ctx = c || ctx2d; }
