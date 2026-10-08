// SF Symbol look-alikes (24 × 24) used only while filming the web build, where SF Symbols don't exist.
// Paths separated by "|": "S …" = stroked in the tint colour, "W …" = stroked white (on a filled shape),
// anything else = filled in the tint colour.
const FLAME = 'M12 1.8c.6 3.3 2.6 5.2 4.4 7.3 1.6 1.8 2.9 3.8 2.9 6.4A7.3 7.3 0 0 1 12 22.3a7.3 7.3 0 0 1-7.3-6.8c-.2-2.6 1-4.9 2.7-6.6.3 1.7 1 2.9 2.3 3.6-.4-4.3.5-7.9 2.3-10.7Z';
const CIRCLE = 'M12 1.5a10.5 10.5 0 1 1 0 21 10.5 10.5 0 0 1 0-21Z';
const GEAR = (() => {
  let d = '';
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2 - Math.PI / 2, r = i % 4 < 2 ? 11 : 8.6;
    d += (i ? 'L' : 'M') + (12 + r * Math.cos(a)).toFixed(2) + ' ' + (12 + r * Math.sin(a)).toFixed(2);
  }
  return d + 'Z';
})();
const GRID = (r) => [[3, 3], [13, 3], [3, 13], [13, 13]].map(([x, y]) => `M${x + r} ${y}h${8 - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${8 - 2 * r}a${r} ${r} 0 0 1-${r} ${r}h-${8 - 2 * r}a${r} ${r} 0 0 1-${r}-${r}v-${8 - 2 * r}a${r} ${r} 0 0 1 ${r}-${r}Z`).join(' ');

export default {
  sparkles: 'M10 2.5c.5 4.3 2.7 6.5 7 7-4.3.5-6.5 2.7-7 7-.5-4.3-2.7-6.5-7-7 4.3-.5 6.5-2.7 7-7Z M18.5 13.5c.3 2.1 1.4 3.2 3.5 3.5-2.1.3-3.2 1.4-3.5 3.5-.3-2.1-1.4-3.2-3.5-3.5 2.1-.3 3.2-1.4 3.5-3.5Z M18 1.5c.2 1.4.9 2.1 2.3 2.3-1.4.2-2.1.9-2.3 2.3-.2-1.4-.9-2.1-2.3-2.3 1.4-.2 2.1-.9 2.3-2.3Z',
  'arrow.up': 'S M12 20V4.5 M5.5 11 12 4.5 18.5 11',
  'chevron.right': 'S M9 4.5 16.5 12 9 19.5',
  'chevron.left': 'S M15 4.5 7.5 12 15 19.5',
  checkmark: 'S M4.5 12.5 9.5 17.5 19.5 6.5',
  'checkmark.circle.fill': `${CIRCLE}|W M7.5 12.3l3 3 6-6.3`,
  'checkmark.seal.fill': 'M12 1.5l2.4 1.8 3-.2.9 2.9 2.5 1.7-1 2.8 1 2.8-2.5 1.7-.9 2.9-3-.2L12 22.5l-2.4-1.8-3 .2-.9-2.9-2.5-1.7 1-2.8-1-2.8 2.5-1.7.9-2.9 3 .2Z|W M8 12.2l2.7 2.7 5.3-5.6',
  xmark: 'S M6 6l12 12 M18 6 6 18',
  'lock.fill': 'M12 2a5 5 0 0 1 5 5v3h.5A2.5 2.5 0 0 1 20 12.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 19.5v-7A2.5 2.5 0 0 1 6.5 10H7V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3Z',
  'hand.raised.fill': 'M8 11V5a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-5a1.5 1.5 0 0 1 3 0v8l1-2a1.5 1.5 0 0 1 2.6 1.4L17.5 19a5 5 0 0 1-4.5 3h-1.5A5.5 5.5 0 0 1 6 16.5V8a1 1 0 0 1 2 0Z',
  'speaker.wave.2.fill': 'M3 9h3.5L11 5v14l-4.5-4H3Z|S M14.5 9a4 4 0 0 1 0 6 M17 6.5a7.5 7.5 0 0 1 0 11',
  'speaker.slash.fill': 'M3 9h3.5L11 5v14l-4.5-4H3Z|S M15 9.5l5 5 M20 9.5l-5 5',
  'bell.fill': 'M12 3a6 6 0 0 1 6 6v4l2 3H4l2-3V9a6 6 0 0 1 6-6Zm-2.5 15h5a2.5 2.5 0 0 1-5 0Z',
  flame: `S ${FLAME}`,
  'flame.fill': FLAME,
  'play.fill': 'M7 4.2v15.6c0 .9 1 1.4 1.7.9l11.4-7.8c.6-.4.6-1.4 0-1.8L8.7 3.3C8 2.8 7 3.3 7 4.2Z',
  pause: 'S M8 5v14 M16 5v14',
  'pause.fill': 'M6.5 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm8 0h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z',
  'forward.end.fill': 'M4 5.2v13.6c0 .8.9 1.3 1.6.8l9.9-6.8c.6-.4.6-1.2 0-1.6L5.6 4.4C4.9 3.9 4 4.4 4 5.2Z M17.5 4h1.5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z',
  'stop.circle.fill': `${CIRCLE}|W M9 9h6v6H9Z`,
  'person.crop.square': 'S M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z M12 7.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z M6.5 20a6 6 0 0 1 11 0',
  'lightbulb.fill': 'M12 2a7 7 0 0 1 4.2 12.6c-.7.5-1.2 1.3-1.2 2.2v.7H9v-.7c0-.9-.5-1.7-1.2-2.2A7 7 0 0 1 12 2Zm-3 17h6v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2Z',
  'exclamationmark.triangle.fill': 'M10.3 3.2a2 2 0 0 1 3.4 0l8.4 14.6a2 2 0 0 1-1.7 3H3.6a2 2 0 0 1-1.7-3Z|W M12 9v4.5 M12 16.8v.2',
  'info.circle.fill': `${CIRCLE}|W M12 11v6 M12 7.5v.2`,
  'trash.fill': 'M9 2.5h6a1 1 0 0 1 1 1V5h4a1 1 0 0 1 0 2h-1l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 7H4a1 1 0 0 1 0-2h4V3.5a1 1 0 0 1 1-1Z',
  'mouth.fill': 'M2.5 11.5C5 8 8.5 7 12 9c3.5-2 7-1 9.5 2.5C19 16.5 15.5 18 12 18s-7-1.5-9.5-6.5Z|W M5.5 12c3.8 1.6 9.2 1.6 13 0',
  'figure.stand': 'M12 1.8a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6Z|S M8.5 9h7 M12 9v6 M12 15l-2.5 7 M12 15l2.5 7 M8.5 9 6.5 14 M15.5 9l2 5',
  'syringe.fill': 'S M15 3l6 6 M18 6 7.5 16.5 M5 19l2.5-2.5 M3 21l2-2 M10 8l6 6',
  calendar: 'S M5 4.5h14a2 2 0 0 1 2 2V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2Z M3 9.5h18 M8 2.5v4 M16 2.5v4',
  'chart.bar.fill': 'M4 13h3.5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Zm6.3-5h3.4a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-3.4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Zm6.2-5H20a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-3.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z',
  'chart.line.uptrend.xyaxis': 'S M3 3v18h18 M6.5 15.5l4-4 3 3 6-6.5 M15.5 8h4v4',
  'arrow.counterclockwise.circle.fill': `${CIRCLE}|W M8 11.5a4.5 4.5 0 1 1 1.3 3.7 M8 8v3.5h3.5`,
  'square.grid.2x2': `S ${GRID(2)}`,
  'square.grid.2x2.fill': GRID(2),
  gearshape: `S ${GEAR} M12 8.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z`,
  'gearshape.fill': `${GEAR}|W M12 8.6a3.4 3.4 0 1 1 0 6.8 3.4 3.4 0 0 1 0-6.8Z`,
};
