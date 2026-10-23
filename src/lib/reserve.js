// Chrome tells the canvas where it is. A panel over the scene is fine; a canvas label
// half under a panel is not. Components mark the rectangles they cover with the
// `reserve` action, and the engine's label pass keeps its words out of them.
export const RESERVED = new Map();           // id -> [x0, y0, x1, y1] in CSS px, or absent
export function reserve(node, id) {
  const report = () => {
    const r = node.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && getComputedStyle(node).display !== 'none') RESERVED.set(id, [r.left, r.top, r.right, r.bottom]);
    else RESERVED.delete(id);
  };
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(report) : null;
  ro?.observe(node);
  window.addEventListener('resize', report);
  report();
  return { destroy() { ro?.disconnect(); window.removeEventListener('resize', report); RESERVED.delete(id); } };
}
