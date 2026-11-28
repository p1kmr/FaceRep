// Brody's looksmax arc (reels/004-day-30): the same Brody with the same face (head, jaw, eyes, nose: brody.js),
// only his hair, clothes and how rested he looks change. brodyDay1: bed hair, a creased grey hoodie and joggers,
// a phone in his hand. brodyMid: the bed hair with a clean tee (before the barber). brodyDay30: a fresh cut, a clean
// navy tee, stone chinos, white trainers. ARC holds the arc's faces; bags and pout are drawn by headExtra here.

import { INK, WHITE, box, group, lerp, line, oval, shape, tone, tube } from './pen.js';
import { hand, torsoPath } from './body.js';
import { brody } from './brody.js';

export const ARC = {
  tired: { eyes: 'lid', brows: 'worried', mouth: 'flat', look: [0.2, 0.8], bags: true, blush: 0.25 },
  proud: { eyes: 'open', brows: 'up', mouth: 'grin', look: [0.1, 0] },
  fish: { eyes: 'open', brows: 'up', mouth: 'fish', suck: 1, look: [0, -0.1] },
  chinLift: { eyes: 'open', brows: 'up', mouth: 'flat', look: [0, -1], pout: true },
};

// Under-eye bags (tired) and the Chin Lift's lower lip pushed up over the top lip (pout).
function headExtra({ spec, fc }) {
  const F = spec.face;
  if (fc.bags) for (const s of [-1, 1]) line(`M ${s * F.eyeX - 20} ${F.eyeY + 38} Q ${s * F.eyeX} ${F.eyeY + 50} ${s * F.eyeX + 20} ${F.eyeY + 38}`, 5, '#8E6A9E', 0.75);
  if (fc.pout) {
    const y = F.mouthY;
    shape(`M -26 ${y + 8} Q 0 ${y - 18} 26 ${y + 8} Q 0 ${y - 2} -26 ${y + 8} Z`, '#E3858C', { off: 0, ink: 6 });
    line(`M -10 ${y + 30} Q 0 ${y + 36} 10 ${y + 30}`, 4, INK, 0.45);
  }
}

// Bed hair: spikes going every way and a fringe in clumps.
function bedHair({ c }) {
  const top = [[-134, -14], [-152, -66], [-120, -80], [-140, -128], [-94, -120], [-90, -172], [-46, -142], [-12, -188],
    [18, -146], [60, -180], [76, -130], [126, -146], [108, -94], [154, -80], [134, -14]];
  const fringe = [[116, -40], [92, -28], [76, -62], [50, -30], [28, -64], [2, -32], [-24, -66], [-50, -34], [-72, -64],
    [-96, -36], [-116, -54]];
  shape(`M ${[...top, ...fringe].map((p) => p.join(' ')).join(' L ')} Z`, c.hair, { off: 12, gloss: 0.12 });
  line('M -70 -110 L -50 -80 M -10 -150 L 0 -100 M 50 -140 L 40 -96 M 100 -110 L 80 -80', 5, tone(c.hair, 0.72), 0.7);
}

// A fresh cut: short faded sides and a textured top swept up and to the right.
function freshCut({ c }) {
  shape('M -124 -6 C -132 -100, -72 -146, 0 -146 C 72 -146, 132 -100, 124 -6 C 118 -40, 108 -62, 92 -70 L -92 -70 ' +
    'C -108 -62, -118 -40, -124 -6 Z', '#D3AC6A', { off: 6, ink: 7 });
  shape('M -104 -66 C -118 -118, -70 -168, 0 -176 C 60 -186, 128 -160, 120 -100 C 114 -74, 84 -62, 56 -72 ' +
    'C 30 -62, -10 -60, -40 -70 C -64 -62, -90 -58, -104 -66 Z', c.hair, { off: 12, gloss: 0.22 });
  line('M -60 -80 C -50 -120, -10 -150, 40 -160 M -20 -76 C -6 -112, 30 -136, 80 -142 M 20 -78 C 40 -104, 70 -118, 104 -116',
    5, tone(c.hair, 0.72), 0.75);
}

const hoodie = {
  top({ b, c, sY, hipY }) {
    shape(`M -92 ${sY + 24} C -104 ${sY - 44}, 104 ${sY - 44}, 92 ${sY + 24} Z`, tone(c.top, 0.9), { off: 8 }); // the hood
    shape(torsoPath(b, sY, hipY, 34, 6), c.top, { off: 14 });
    line(`M -46 ${sY + 4} Q 0 ${sY + 42} 46 ${sY + 4}`, 7, INK);
    for (const s of [-1, 1]) {
      line(`M ${s * 20} ${sY + 26} q ${s * 6} 50 ${-s * 2} 92`, 5, '#EDEDED');
      oval(s * 19, sY + 122, 6, 8, '#EDEDED', { off: 0, ink: 4 });
    }
    shape(`M -72 ${hipY - 58} Q 0 ${hipY - 76} 72 ${hipY - 58} L 88 ${hipY + 12} L -88 ${hipY + 12} Z`, tone(c.top, 0.95), { off: 6, ink: 6 });
    line(`M -64 ${sY + 74} q 20 10 36 -4 M 40 ${sY + 92} q 14 12 30 2 M -30 ${hipY - 96} q 18 8 40 -2`, 4, INK, 0.3);
    line(`M ${-b.hw - 14} ${hipY + 28} L ${b.hw + 14} ${hipY + 28}`, 6, tone(c.top, 0.7));
  },
  arm({ b, c }, a) {
    const e = lerp(a.mid, a.end, 0.84);
    shape(tube([a.start, a.mid, e], [b.armW * 0.64, b.armW * 0.58, b.armW * 0.54]), c.top, { off: 8 });
    shape(tube([lerp(a.mid, a.end, 0.7), e], [b.armW * 0.52, b.armW * 0.52]), tone(c.top, 0.85), { off: 0, ink: 6 });
  },
};

const tee = {
  top({ b, c, sY, hipY }) {
    shape(torsoPath(b, sY, hipY, 10), c.top, { off: 14 });
    line(`M -40 ${sY + 2} Q 0 ${sY + 36} 40 ${sY + 2}`, 9, tone(c.top, 0.7));
    line(`M -40 ${sY + 2} Q 0 ${sY + 36} 40 ${sY + 2}`, 3, INK, 0.6);
    line(`M -50 ${sY + 110} q 18 8 34 0`, 4, INK, 0.2);
  },
  arm({ b, c }, a) {
    shape(tube([a.start, a.mid, a.end], [b.armW * 0.55, b.armW * 0.5, b.armW * 0.44]), c.skin, { shade: c.skinShade });
    shape(tube([a.start, lerp(a.start, a.mid, 0.6)], [b.armW * 0.68, b.armW * 0.64]), c.top, { off: 8 });
  },
};

// Long trousers (joggers or chinos): the hips, two legs and a cuff at each ankle. belt: chinos have one.
function trousers(belt) {
  return {
    leg({ b, c }, g) {
      shape(tube([g.start, g.mid, g.end], [b.legW * 0.62, b.legW * 0.54, b.legW * 0.44]), c.bottom, { off: 8 });
      shape(tube([lerp(g.mid, g.end, 0.86), g.end], [b.legW * 0.46, b.legW * 0.46]), tone(c.bottom, belt ? 0.92 : 0.8), { off: 0, ink: 6 });
    },
    bottom({ b, c, hipY }) {
      shape(`M ${-b.hw - 8} ${hipY - 32} L ${b.hw + 8} ${hipY - 32} L ${b.hw + 4} ${hipY + 64} L ${-b.hw - 4} ${hipY + 64} Z`, c.bottom, { off: 8 });
      if (belt) box(-b.hw - 8, hipY - 6, 2 * b.hw + 16, 18, 6, '#6B4A2E', { off: 0, ink: 5 });
    },
  };
}

// The phone in his right hand, its back to us (its screen faces him: no screen is drawn).
const phone = {
  R(ctx, a, sg) {
    const [x, y] = a.end;
    group(x, y, -22, 1, () => {
      box(-32, -78, 64, 116, 14, '#1F2333', { off: 4, ink: 7 });
      oval(-14, -60, 7, 7, '#454B66', { off: 0, ink: 3 });
    });
    hand(a.end, a.dir, ctx.c.skin, ctx.b.hand, sg, 'fist');
    return true;
  },
};

const base = { ...brody, hairBack: undefined, headExtra, leg: undefined };

export const brodyDay1 = {
  ...base, ...hoodie, ...trousers(false), hairFront: bedHair, holds: phone,
  c: { ...brody.c, top: '#8E919C', bottom: '#5B5F6B', shoe: '#E6E0D6', shoeAccent: '#9A9AA4' },
};

export const brodyDay30 = {
  ...base, ...tee, ...trousers(true), hairFront: freshCut,
  c: { ...brody.c, top: '#24324F', bottom: '#D9C8A6', shoe: WHITE, shoeAccent: '#E5322D' },
};

export const brodyMid = { ...brodyDay30, hairFront: bedHair };
