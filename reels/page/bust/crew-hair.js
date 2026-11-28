// Hair for the office crew (reels/page/bust/crew.js), in the bust's units. Mia: long dark hair with a centre part
// (miaBack behind her, drawn first; miaFront over her head and down past her shoulders, drawn last). Greg: short
// hair, grey at the temples, and a short full beard (beard() goes after the skin and before the mouth).

import { clip, fill, stroke } from './pen.js';

export function miaBack(pal) {
  const d = 'M -100 -110 C -132 -40, -146 80, -156 200 C -160 260, -146 300, -126 330 L 126 330 C 146 300, 160 260, 156 200 ' +
    'C 146 80, 132 -40, 100 -110 C 78 -164, -78 -164, -100 -110 Z';
  fill(d, pal.shade);
  stroke(d, 3, pal.line);
}

export function miaFront(pal) {
  const cap = 'M -98 -20 C -108 -112, -62 -166, 0 -166 C 62 -166, 108 -112, 98 -20 C 92 -72, 62 -108, 8 -120 L 0 -110 ' +
    'L -8 -120 C -62 -108, -92 -72, -98 -20 Z';
  fill(cap, pal.base);
  clip(cap, () => {
    fill('M 0 -200 L 140 -200 L 140 0 L 0 0 Z', pal.shade, 0.55);
    stroke('M -6 -122 C -40 -130, -76 -100, -90 -50 M 6 -122 C 40 -130, 76 -100, 90 -50', 2.4, pal.shade, 0.9);
    stroke('M -84 -84 C -70 -130, -40 -152, -10 -156', 9, pal.light, 0.7);
  });
  stroke(cap, 3, pal.line);
  for (const s of [-1, 1]) {
    const d = `M ${s * 98} -40 C ${s * 114} 40, ${s * 108} 150, ${s * 128} 270 C ${s * 132} 300, ${s * 118} 318, ${s * 100} 314 ` +
      `C ${s * 90} 230, ${s * 82} 130, ${s * 84} 30 C ${s * 84} 0, ${s * 88} -24, ${s * 98} -40 Z`;
    fill(d, pal.base);
    fill(d, pal.shade, s > 0 ? 0.55 : 0.1);
    stroke(`M ${s * 96} 0 C ${s * 104} 80, ${s * 102} 170, ${s * 114} 260`, 2.2, pal.shade, 0.9);
    stroke(d, 3, pal.line);
  }
}

export function gregHair(pal) {
  const d = 'M -96 -30 C -104 -104, -70 -164, 0 -168 C 70 -164, 104 -104, 96 -30 C 92 -66, 84 -92, 66 -106 ' +
    'C 40 -118, 10 -112, -20 -120 C -52 -116, -80 -98, -90 -72 C -94 -58, -95 -44, -96 -30 Z';
  fill(d, pal.base);
  clip(d, () => {
    fill('M 20 -180 L 140 -180 L 140 0 L 40 0 Z', pal.shade, 0.6);
    for (const s of [-1, 1]) fill(`M ${s * 70} -100 L ${s * 120} -100 L ${s * 120} 0 L ${s * 80} 0 Z`, pal.gray, 0.85);
    stroke('M -78 -110 C -50 -150, -10 -160, 30 -156', 8, pal.light, 0.6);
    stroke('M -40 -120 C -20 -140, 10 -150, 50 -146 M 0 -116 C 20 -132, 50 -138, 80 -124', 2.2, pal.shade, 0.9);
  });
  stroke(d, 3, pal.line);
}

// The beard on the head H: the cheeks below the sideburns, the jaw, a little below the chin, and a moustache.
export function beard(H, pal) {
  const area = 'M -130 6 L -94 6 C -92 46, -76 66, -48 68 C -28 70, -14 66, 0 68 C 14 66, 28 70, 48 68 ' +
    'C 76 66, 92 46, 94 6 L 130 6 L 130 260 L -130 260 Z';
  clip(H.d, () => clip(area, () => {
    fill(area, pal.base);
    fill('M 40 -60 L 160 -60 L 160 260 L 50 260 Z', pal.shade, 0.5);
    for (let i = 0; i < 26; i++) {
      const x = -84 + ((i * 37) % 168), y = 80 + ((i * 53) % 70);
      stroke(`M ${x} ${y} l ${x > 0 ? 3 : -3} 9`, 2, i % 4 ? pal.shade : pal.gray, 0.8);
    }
  }));
  const chin = 'M -60 122 C -52 160, -26 172, 0 174 C 26 172, 52 160, 60 122 C 40 140, -40 140, -60 122 Z';
  fill(chin, pal.base);
  fill(chin, pal.shade, 0.35);
  stroke(chin, 2.6, pal.line);
  stroke('M -94 6 C -92 46, -76 66, -48 68 C -28 70, 28 70, 48 68 C 76 66, 92 46, 94 6', 2.4, pal.line, 0.5);
  const tache = 'M -36 74 C -22 62, -6 64, 0 68 C 6 64, 22 62, 36 74 C 22 78, 8 76, 0 76 C -8 76, -22 78, -36 74 Z';
  fill(tache, pal.base);
  stroke(tache, 2.2, pal.line);
}
