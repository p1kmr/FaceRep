// Option 1, Brody, 20: the gym bro. Golden hair under a backwards red cap, a red tank with a small white barbell
// smile, black gym shorts, white crew socks and trainers. Loud, sure of himself, maxxes everything.

import { INK, LW, WHITE, box, lerp, line, oval, shape, tube } from './pen.js';
import { torsoPath } from './body.js';

export const brody = {
  name: 'Brody',
  body: { headW: 236, headH: 258, jaw: 0.5, thigh: 122, shin: 112, ankle: 30, torso: 196, neck: 18, neckW: 60, sw: 114,
    hw: 76, hipJoint: 42, armIn: 20, upper: 104, fore: 96, armW: 54, legW: 56, hand: 32 },
  c: { skin: '#F2C4A0', skinShade: '#DB9F7B', hair: '#E9BE66', brow: '#B4843A', top: '#E5322D', bottom: '#23262E',
    shoe: '#FFFFFF', shoeAccent: '#E5322D', cap: '#E5322D' },
  face: { eyeX: 46, eyeY: 14, eyeRx: 23, eyeRy: 27, mouthY: 88, iris: '#3F8FE0', brow: { t: 14, w: 56 } },
  pose: { arms: { L: [-40, 96], R: [112, 70] }, hands: { L: 'fist', R: 'fist' }, tilt: -4 },
  mood: { eyes: 'lid', brows: 'cocky', mouth: 'smirk', look: [0.3, 0] },

  leg({ b, c }, g) {
    shape(tube([g.start, g.mid, g.end], [b.legW * 0.55, b.legW * 0.48, b.legW * 0.4]), c.skin, { shade: c.skinShade });
    const s0 = lerp(g.mid, g.end, 0.45);
    shape(tube([s0, g.end], [b.legW * 0.46, b.legW * 0.44]), WHITE, { off: 6 });
    for (const k of [0.1, 0.28]) {
      const p = lerp(s0, g.end, k);
      line(`M ${p[0] - b.legW * 0.42} ${p[1]} L ${p[0] + b.legW * 0.42} ${p[1]}`, 6, c.top);
    }
  },
  bottom({ b, c, hipY, legs }) {
    const kL = lerp(legs.L.start, legs.L.mid, 0.62), kR = lerp(legs.R.start, legs.R.mid, 0.62), hw = b.hw;
    shape(`M ${-hw - 10} ${hipY - 30} L ${hw + 10} ${hipY - 30} L ${kR[0] + 40} ${kR[1]} Q ${kR[0]} ${kR[1] + 10} ${kR[0] - 36} ${kR[1] + 4} ` +
      `L 0 ${hipY + 46} L ${kL[0] + 36} ${kL[1] + 4} Q ${kL[0]} ${kL[1] + 10} ${kL[0] - 40} ${kL[1]} Z`, c.bottom);
    line(`M ${hw + 8} ${hipY - 24} L ${kR[0] + 37} ${kR[1] - 6}`, 7, WHITE);
    line(`M ${-hw - 8} ${hipY - 24} L ${kL[0] - 37} ${kL[1] - 6}`, 7, WHITE);
  },
  top({ b, c, sY, hipY }) {
    const { sw, hw } = b;
    shape(torsoPath(b, sY, hipY, 0), c.skin, { shade: c.skinShade });
    shape(`M ${-sw + 34} ${sY - 2} L ${-sw + 62} ${sY - 2} Q 0 ${sY + 74} ${sw - 62} ${sY - 2} L ${sw - 34} ${sY - 2} ` +
      `C ${sw - 26} ${sY + 60}, ${sw - 4} ${sY + 92}, ${sw - 2} ${sY + 118} C ${hw + 16} ${hipY - 50}, ${hw + 12} ${hipY - 10}, ${hw + 12} ${hipY + 6} ` +
      `L ${-hw - 12} ${hipY + 6} C ${-hw - 12} ${hipY - 10}, ${-hw - 16} ${hipY - 50}, ${-sw + 2} ${sY + 118} C ${-sw + 4} ${sY + 92}, ${-sw + 26} ${sY + 60}, ${-sw + 34} ${sY - 2} Z`,
    c.top, { off: 14 });
    line(`M -46 ${sY + 104} Q -22 ${sY + 120} -2 ${sY + 106} M 2 ${sY + 106} Q 22 ${sY + 120} 46 ${sY + 104}`, 4, INK, 0.3);
    const y = sY + 150; // the barbell smile, small, on the chest
    for (const s of [-1, 1]) box(s > 0 ? 16 : -24, y - 10, 8, 20, 3, WHITE, { off: 0, ink: 0 });
    line(`M -16 ${y} Q 0 ${y + 10} 16 ${y}`, 5, WHITE);
  },
  arm({ b, c }, a) {
    const bi = lerp(a.start, a.mid, 0.5);
    shape(tube([a.start, bi, a.mid, a.end], [b.armW * 0.55, b.armW * 0.6, b.armW * 0.46, b.armW * 0.44]), c.skin, { shade: c.skinShade });
    if (a.dir > 120) { // the flexed arm: a round biceps on top of the upper arm
      const [x, y] = lerp(a.start, a.mid, 0.58), w = b.armW;
      oval(x, y - w * 0.3, w * 0.56, w * 0.46, c.skin, { ink: 0, off: 0 });
      const p = new Path2D();
      p.ellipse(x, y - w * 0.3, w * 0.56, w * 0.46, 0, Math.PI * 1.08, Math.PI * 1.92);
      line(p, LW);
      line(`M ${x + w * 0.1} ${y - w * 0.55} q 10 6 8 18`, 4, INK, 0.35);
    }
  },
  hairFront({ c }) {
    for (const s of [-1, 1]) shape(`M ${s * 122} -48 L ${s * 98} -54 C ${s * 100} -30, ${s * 104} -12, ${s * 116} 0 Z`, c.hair, { ink: 6, off: 4 });
    shape('M -128 -40 C -134 -156, 134 -156, 128 -40 C 66 -62, -66 -62, -128 -40 Z', c.cap, { off: 14, gloss: 0.18 });
    line('M -124 -48 C -64 -70, 64 -70, 124 -48', 12, '#B9221E');
    shape('M -38 -58 C -36 -98, 36 -98, 38 -58 Z', c.hair, { ink: 6, off: 6 });
    line('M -18 -66 Q -10 -84 -4 -70 M 2 -70 Q 12 -88 18 -66', 4, '#C79A45');
    box(-32, -70, 64, 12, 5, '#2A2A30', { ink: 5, off: 0 });
    line('M 0 -150 L 0 -100', 4, INK, 0.25);
    oval(0, -150, 9, 6, c.cap, { ink: 5, off: 0 });
  },
};
