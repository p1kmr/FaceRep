// Hair for the busts (reels/page/bust). pal: { base, shade, light, line, fade }. Brody: bed hair (day 1 to the
// barber) and an undercut quiff (short sides, the top swept up from a left part, the front edge in locks).
// Kayla: a high ponytail behind her head (kaylaBack, drawn first), the hair pulled back, a pink scrunchie and two
// face-framing strands (kaylaFront, drawn last).

import { P, clip, ell, fill, stroke } from './pen.js';

export function bedHair(pal) {
  const out = [[-104, -28], [-118, -70], [-104, -96], [-122, -128], [-88, -140], [-94, -178], [-50, -166], [-30, -204],
    [2, -170], [40, -200], [52, -162], [96, -178], [90, -136], [124, -124], [104, -96], [118, -66], [104, -28]];
  const fringe = [[90, -40], [74, -62], [62, -44], [44, -70], [28, -48], [8, -72], [-12, -50], [-30, -72], [-48, -46],
    [-64, -66], [-80, -42], [-94, -58]];
  const pts = [...out, ...fringe], mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const d = `M ${P(mid(pts.at(-1), pts[0]))} ` + pts.map((p, i) => `Q ${P(p)} ${P(mid(p, pts[(i + 1) % pts.length]))}`).join(' ') + ' Z';
  fill(d, pal.base);
  clip(d, () => {
    fill('M 20 -120 L 160 -160 L 160 0 L 0 0 Z', pal.shade, 0.75);
    stroke('M -70 -150 L -50 -110 M -20 -170 L -10 -110 M 30 -170 L 22 -110 M 70 -150 L 50 -110', 3, pal.shade, 0.8);
    stroke('M -90 -120 Q -60 -160 -30 -170', 7, pal.light, 0.7);
  });
  stroke(d, 3, pal.line);
}

export function quiff(pal) {
  const d ='M -88 -50 C -96 -80, -98 -140, -82 -168 C -68 -190, -44 -206, -16 -208 C 20 -210, 60 -198, 84 -178 ' +
    'C 100 -162, 100 -120, 92 -50 C 88 -62, 86 -74, 84 -84 C 76 -94, 68 -100, 58 -102 C 50 -110, 42 -112, 34 -110 ' +
    'C 24 -116, 12 -116, 4 -110 C -6 -112, -16 -108, -22 -100 C -32 -106, -44 -106, -50 -98 C -60 -100, -72 -94, -84 -84 ' +
    'C -86 -74, -87 -62, -88 -50 Z';
  fill(d, pal.base);
  clip(d, () => {
    fill('M -100 -84 C -60 -106, 40 -120, 110 -96 L 110 -126 C 40 -146, -60 -132, -100 -112 Z', pal.shade, 0.6);
    fill('M 30 -130 C 60 -150, 90 -170, 130 -190 L 130 -60 L 30 -60 Z', pal.shade, 0.55);
    for (const s of [-1, 1]) {
      fill(`M ${s * 74} -40 L ${s * 110} -40 L ${s * 110} -130 L ${s * 80} -122 Z`, pal.fade, 0.85);
      for (let y = -118; y < -50; y += 9) stroke(`M ${s * 78} ${y} l ${s * 16} 3`, 1.6, pal.shade, 0.6);
    }
    stroke('M -84 -128 C -68 -170, -36 -196, 10 -204', 13, pal.light, 0.75);
    stroke('M -70 -100 C -66 -140, -40 -176, -2 -192 M -40 -104 C -30 -140, -6 -168, 36 -182 M -8 -110 C 6 -138, 34 -160, 74 -168 ' +
      'M 24 -112 C 40 -132, 66 -146, 96 -146', 2.6, pal.shade, 0.9);
    stroke('M -76 -120 C -62 -156, -34 -182, 4 -196 M -54 -112 C -42 -146, -18 -170, 20 -184', 2.4, pal.light, 0.9);
    stroke('M -52 -98 C -50 -132, -44 -164, -32 -196', 2.4, pal.line, 0.55);
  });
  stroke(d, 3.2, pal.line);
  const lock = 'M -46 -100 C -60 -128, -48 -166, -14 -188 C -34 -160, -40 -132, -30 -104 Z';
  fill(lock, pal.light, 0.9);
  stroke(lock, 2.2, pal.line, 0.8);
}

// The ponytail rises from the crown and falls behind her right shoulder (the right of the picture).
export function kaylaBack(pal, swing = 0) {
  const w = swing;
  const d = `M 10 -150 C 30 -204, 112 -232, 152 -184 C ${186 + w} -138, ${162 + w} -60, ${174 + w} 10 ` +
    `C ${182 + w} 60, ${172 + w} 110, ${150 + w} 150 C ${140 + w} 90, ${138 + w} 30, 122 -30 C 110 -80, 80 -130, 40 -150 Z`;
  fill(d, pal.base);
  clip(d, () => {
    fill('M 120 -200 L 260 -200 L 260 200 L 140 200 Z', pal.shade, 0.6);
    stroke(`M 60 -160 C 110 -200, 150 -170, ${156 + w} -100 M 100 -150 C 140 -150, ${150 + w} -60, ${160 + w} 40`, 2.6, pal.shade, 0.8);
    stroke('M 40 -176 C 80 -210, 130 -210, 150 -186', 8, pal.light, 0.7);
  });
  stroke(d, 3, pal.line);
}

export function kaylaFront(pal, scrunchie) {
  const d = 'M -92 -36 C -102 -110, -58 -160, 4 -160 C 66 -160, 102 -112, 92 -36 C 86 -70, 68 -94, 40 -102 ' +
    'C 18 -106, -10 -106, -36 -102 C -64 -94, -86 -70, -92 -36 Z';
  fill(d, pal.base);
  clip(d, () => {
    fill('M 30 -170 L 120 -170 L 120 0 L 50 0 Z', pal.shade, 0.55);
    stroke('M -60 -96 C -40 -130, 0 -150, 38 -158 M -24 -103 C 0 -130, 26 -146, 46 -156 M 30 -101 C 44 -124, 50 -140, 54 -154', 2.4, pal.shade, 0.8);
    stroke('M -80 -80 C -66 -126, -30 -150, 10 -156', 9, pal.light, 0.7);
  });
  stroke(d, 3, pal.line);
  for (const s of [-1, 1]) {
    const lock = `M ${s * 80} -66 C ${s * 100} -24, ${s * 88} 18, ${s * 98} 58 C ${s * 104} 90, ${s * 96} 118, ${s * 104} 142 ` +
      `L ${s * 92} 144 C ${s * 86} 118, ${s * 92} 90, ${s * 86} 58 C ${s * 78} 18, ${s * 88} -20, ${s * 70} -62 Z`;
    fill(lock, pal.base);
    fill(lock, pal.shade, s > 0 ? 0.5 : 0.15);
    stroke(lock, 2.4, pal.line);
  }
  for (const [x, y] of [[26, -164], [36, -180], [54, -184], [66, -170], [56, -156], [38, -154]]) {
    fill(ell(x, y, 12, 10), scrunchie);
    stroke(ell(x, y, 12, 10), 2.2, pal.line);
  }
  fill(ell(46, -170, 13, 9), scrunchie);
}
