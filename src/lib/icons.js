// The app's inline SVG icon set — 24x24 grid, 1.6 stroke, currentColor.
// Lives in lib/ because both the Svelte components and the engine (which builds the
// info-card buttons as HTML strings) draw from it.
export const ICONS = {
  // --- interface ---
  search:   '<circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8 21 21"/>',
  layers:   '<path d="M12 3 3 7.6l9 4.6 9-4.6z"/><path d="M3 12.2 12 16.8l9-4.6"/><path d="M3 16.6 12 21.2l9-4.6"/>',
  clock:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2V12l3.2 2"/>',
  compass:  '<circle cx="12" cy="12" r="8.5"/><path d="m15.4 8.6-2 4.8-4.8 2 2-4.8z"/>',
  link:     '<path d="M10 13.6a3.6 3.6 0 0 0 5.3.4l2.6-2.6a3.6 3.6 0 0 0-5.1-5.1l-1.5 1.5"/><path d="M14 10.4a3.6 3.6 0 0 0-5.3-.4l-2.6 2.6a3.6 3.6 0 0 0 5.1 5.1l1.5-1.5"/>',
  ruler:    '<path d="m4.8 14.6 9.8-9.8a1.4 1.4 0 0 1 2 0l2.6 2.6a1.4 1.4 0 0 1 0 2l-9.8 9.8a1.4 1.4 0 0 1-2 0l-2.6-2.6a1.4 1.4 0 0 1 0-2z"/><path d="m8.4 11 1.7 1.7M11 8.4l1.7 1.7M13.6 5.8l1.7 1.7M5.8 13.6l1.7 1.7"/>',
  reset:    '<path d="M3.8 12a8.2 8.2 0 1 0 2.5-5.9"/><path d="M3.4 4.6v4.2h4.2"/>',
  close:    '<path d="m6.4 6.4 11.2 11.2M17.6 6.4 6.4 17.6"/>',
  plus:     '<path d="M12 5.6v12.8M5.6 12h12.8"/>',
  minus:    '<path d="M5.6 12h12.8"/>',
  chevron:  '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
  sliders:  '<path d="M4 8h9M17 8h3M4 16h3M11 16h9"/><circle cx="15" cy="8" r="2.1"/><circle cx="9" cy="16" r="2.1"/>',
  scope:    '<circle cx="12" cy="12" r="8.5"/><path d="M12 1.8v3.4M12 18.8v3.4M1.8 12h3.4M18.8 12h3.4"/><circle cx="12" cy="12" r="2"/>',
  live:     '<path d="M2.8 12h3.6l2.6-6.4L12.6 18l2.4-6h6.2"/>',
  legend:   '<circle cx="5.4" cy="6.6" r="2.1"/><path d="M10.6 6.6H21"/><circle cx="5.4" cy="12" r="2.1"/><path d="M10.6 12H21"/><circle cx="5.4" cy="17.4" r="2.1"/><path d="M10.6 17.4H21"/>',
  lock:     '<rect x="4.6" y="10.2" width="14.8" height="9.8" rx="2.2"/><path d="M8 10.2V7.4a4 4 0 0 1 8 0v2.8"/>',
  unlock:   '<rect x="4.6" y="10.2" width="14.8" height="9.8" rx="2.2"/><path d="M8 10.2V7.4a4 4 0 0 1 7.6-1.7"/>',
  play:     '<path d="M7.6 4.8 19 12 7.6 19.2z" fill="currentColor" stroke-linejoin="round"/>',
  pause:    '<rect x="7" y="5" width="3.6" height="14" rx="1.2" fill="currentColor"/><rect x="13.4" y="5" width="3.6" height="14" rx="1.2" fill="currentColor"/>',
  check:    '<path d="m5 12.6 4.6 4.6L19 7.6"/>',
  eyeoff:   '<path d="M3 3l18 18"/><path d="M10.6 6.3A9.6 9.6 0 0 1 12 6.2c5 0 9 5.8 9 5.8a17 17 0 0 1-2.7 3.3M6.6 8.1A17 17 0 0 0 3 12s4 5.8 9 5.8c1.2 0 2.3-.3 3.3-.8"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  // --- astronomy glyphs (used by the quick-jump bar) ---
  sun:      '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.4M12 19v2.4M2.6 12H5M19 12h2.4M5.4 5.4 7 7M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"/>',
  globe:    '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5s-1.2 6.1-3.4 8.5c-2.2-2.4-3.4-5.4-3.4-8.5S9.8 5.9 12 3.5z"/>',
  planet:   '<circle cx="12" cy="12" r="6.4"/><path d="M8.4 8.4a12 12 0 0 1 4.2 3.1 12 12 0 0 1 2.6 4.6" opacity=".55"/>',
  ringed:   '<circle cx="12" cy="11" r="5.2"/><ellipse cx="12" cy="11" rx="10" ry="3.2" transform="rotate(-18 12 11)"/>',
  ice:      '<circle cx="12" cy="12" r="5.6"/><path d="M12 6.4v11.2M7.2 9.2l9.6 5.6M16.8 9.2l-9.6 5.6" opacity=".5"/>',
  probe:    '<path d="M12 8.6V15"/><rect x="3.4" y="8.2" width="5.2" height="7.6" rx="1"/><rect x="15.4" y="8.2" width="5.2" height="7.6" rx="1"/><circle cx="12" cy="7" r="2.2"/>',
  comet:    '<circle cx="16" cy="8" r="3.4"/><path d="m12.6 11.4-8 8M9.4 10.2 5.6 14M13.8 14.6 10 18.4"/>',
  star:     '<path d="m12 3.4 2.5 5.6 6.1.6-4.6 4 1.4 6-5.4-3.2-5.4 3.2 1.4-6-4.6-4 6.1-.6z"/>',
  system:   '<circle cx="12" cy="12" r="2.4"/><ellipse cx="12" cy="12" rx="9" ry="4.4" transform="rotate(-20 12 12)"/><circle cx="20" cy="9.6" r="1.5"/>',
  blackhole:'<circle cx="12" cy="12" r="3.6"/><ellipse cx="12" cy="12" rx="9.4" ry="3" transform="rotate(-14 12 12)" opacity=".8"/>',
  galaxy:   '<circle cx="12" cy="12" r="1.7"/><path d="M13.4 10.4c3.4-1.4 6.6.4 6.6 3 0 3.2-4.2 6-8 6-4.6 0-8-2.4-8-5.4"/><path d="M10.6 13.6c-3.4 1.4-6.6-.4-6.6-3 0-3.2 4.2-6 8-6 4.6 0 8 2.4 8 5.4"/>',
  };
// engine-side helper: the same glyph as an HTML string
export function svgIcon(name, size = 13, stroke = 1.7) {
  return '<svg class="ic" viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="none"'
    + ' stroke="currentColor" stroke-width="' + stroke + '" stroke-linecap="round"'
    + ' stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
}
