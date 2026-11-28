// Option 4, Maddie, 20: the cozy study girl. Brown hair in a claw-clip twist with curtain bangs, big round
// glasses, a cream cardigan over a white tee, light wide-leg jeans, hugging her books. Shy, a bit awkward, does her
// face reps in the library when nobody is looking (somebody always is).

import { INK, WHITE, box, group, lerp, line, oval, shape, tone, tube } from './pen.js';
import { torsoPath } from './body.js';

export const maddie = {
  name: 'Maddie',
  body: { headW: 228, headH: 254, jaw: 0, thigh: 124, shin: 116, ankle: 28, torso: 188, neck: 22, neckW: 44, sw: 88,
    hw: 80, hipJoint: 40, armIn: 14, upper: 100, fore: 90, armW: 44, legW: 50, hand: 26 },
  c: { skin: '#F5CFB6', skinShade: '#E2AB8F', hair: '#6E4532', brow: '#57362A', top: '#F2E3C6', tee: '#FFFFFF',
    bottom: '#9DBCE0', shoe: '#FFFFFF', shoeAccent: '#C9A27A', clip: '#EE9DB4' },
  face: { eyeX: 44, eyeY: 18, eyeRx: 23, eyeRy: 28, mouthY: 90, iris: '#7A5232', lashes: true, lip: '#D97C85',
    fringe: true, brow: { t: 9, w: 46, y: -36 }, blush: 1.4 },
  pose: { arms: { L: [-16, 124], R: [16, -124] }, tilt: 6 },
  mood: { eyes: 'open', brows: 'worried', mouth: 'smile', blush: 1.6, look: [0.35, 0.25] },

  hairBack({ c }) {
    shape('M -118 20 C -138 -120, 138 -120, 118 20 L 100 60 L -100 60 Z', c.hair, { off: 10 });
    oval(-8, -150, 70, 44, c.hair, { off: 12 });
    line('M -50 -160 C -20 -180, 20 -176, 46 -156', 5, tone(c.hair, 0.72));
    group(-8, -176, -6, 1, () => { // the claw clip
      box(-48, -20, 96, 34, 14, c.clip, { off: 6, gloss: 0.3 });
      for (let x = -36; x <= 36; x += 18) line(`M ${x} 12 L ${x} 26`, 9, c.clip);
    });
  },
  leg({ b, c }, g) { // wide-leg jeans
    shape(tube([g.start, g.mid, g.end], [b.legW * 0.6, b.legW * 0.66, b.legW * 0.78]), c.bottom, { off: 10 });
    line(`M ${g.mid[0] - 6} ${g.mid[1] - 30} L ${g.end[0] - 8} ${g.end[1] - 10}`, 3, INK, 0.25);
  },
  bottom({ b, c, hipY }) {
    box(-b.hw - 14, hipY - 34, 2 * (b.hw + 14), 50, 14, c.bottom, { off: 8 });
  },
  top({ b, c, sY, hipY }) {
    shape(torsoPath(b, sY, hipY, 4), c.tee, { off: 10 });
    for (const s of [-1, 1]) { // the open cardigan, each side
      shape(`M ${s * 26} ${sY + 4} L ${s * (b.sw - 30)} ${sY} C ${s * b.sw} ${sY + 8}, ${s * (b.sw + 4)} ${sY + 120}, ${s * (b.hw + 20)} ${hipY + 40} ` +
        `L ${s * 30} ${hipY + 40} C ${s * 30} ${hipY - 60}, ${s * 34} ${sY + 80}, ${s * 26} ${sY + 4} Z`, c.top, { off: 12 });
      for (const y of [sY + 90, sY + 140, sY + 190]) oval(s * 40, y, 6, 6, tone(c.top, 0.7), { off: 0, ink: 3 });
    }
  },
  front({ sY }) { // her books, hugged to her chest
    group(0, sY + 122, -8, 1, () => {
      box(-82, -12, 164, 40, 6, '#E4787C', { off: 6 });
      box(-76, -52, 150, 40, 6, '#8CB89A', { off: 6 });
      box(-70, -88, 140, 36, 6, '#F3C96B', { off: 6 });
      for (const y of [8, -32, -70]) line(`M -60 ${y} L 50 ${y}`, 4, WHITE, 0.6);
    });
  },
  arm({ b, c }, a) {
    shape(tube([a.start, a.mid, lerp(a.mid, a.end, 0.8)], [b.armW * 0.58, b.armW * 0.56, b.armW * 0.6]), c.top, { off: 8 });
  },
  hairFront({ c }) {
    for (const s of [-1, 1]) {
      shape(`M ${s * 4} -146 C ${s * 70} -150, ${s * 128} -110, ${s * 122} -10 C ${s * 126} 40, ${s * 116} 90, ${s * 124} 120 ` +
        `C ${s * 104} 100, ${s * 98} 40, ${s * 100} -8 C ${s * 96} -50, ${s * 62} -64, ${s * 26} -56 C ${s * 14} -86, ${s * 8} -110, ${s * 4} -146 Z`,
      c.hair, { off: 10, gloss: 0.15 });
    }
    line('M -60 -120 C -30 -134, -10 -136, 0 -140', 5, tone(c.hair, 1.4), 0.5);
  },
  headExtra({ spec }) { // big round glasses
    const F = spec.face, r = 36;
    for (const s of [-1, 1]) {
      const p = new Path2D();
      p.arc(s * F.eyeX, F.eyeY + 2, r, 0, Math.PI * 2);
      line(p, 7, '#5A3A2C');
      line(`M ${s * (F.eyeX + 14)} ${F.eyeY - 22} l ${s * 10} 10`, 5, WHITE, 0.8);
    }
    line(`M -10 ${F.eyeY - 2} Q 0 ${F.eyeY - 10} 10 ${F.eyeY - 2}`, 6, '#5A3A2C');
  },
};
