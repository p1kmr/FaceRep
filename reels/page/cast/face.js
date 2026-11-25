// The cast's faces: big eyes, brows, nose, mouth and blush, drawn at the head's middle (head about 236 x 260).
// FACES holds the expressions; the three exercise faces are the app's free exercises (Fish Face, Brow Lift, Cheek
// Lift), so a reel can show their real exercise pages. drawFace() draws all but the brows; drawBrows() goes over
// the hair, the cartoon way, so a fringe never hides an expression.

import { INK, WHITE, ctx, flat, line, oval, shape, tone } from './pen.js';

export const FACES = {
  smile: { eyes: 'open', brows: 'flat', mouth: 'smile' },
  smirk: { eyes: 'lid', brows: 'cocky', mouth: 'smirk', look: [0.25, 0] },
  grin: { eyes: 'open', brows: 'up', mouth: 'grin' },
  wink: { eyes: 'wink', brows: 'up', mouth: 'grin' },
  star: { eyes: 'sparkle', brows: 'up', mouth: 'bigSmile' },
  shy: { eyes: 'open', brows: 'worried', mouth: 'smile', blush: 1.6, look: [0.35, 0.3] },
  hype: { eyes: 'wide', brows: 'up', mouth: 'o', look: [0, -0.2] },
  fishFace: { eyes: 'wide', brows: 'up', mouth: 'fish', suck: 1 },
  browLift: { eyes: 'wide', brows: 'lift', mouth: 'o', wrinkles: true },
  cheekLift: { eyes: 'happy', brows: 'up', mouth: 'bigSmile', blush: 1.5 },
};

// [inner, outer] heights of each brow end, plus a lift of the whole brow. cocky: the left brow down, the right up.
const BROWS = { flat: [0, 0], up: [-8, -6], lift: [-28, -24], worried: [-12, 6], angry: [12, -6] };

function eye(spec, fc, side) {
  const F = spec.face, cx = side * F.eyeX, cy = F.eyeY, kind = fc.eyes === 'wink' ? (side < 0 ? 'happy' : 'open') : fc.eyes;
  const rx = F.eyeRx * (kind === 'wide' ? 1.1 : 1), ry = F.eyeRy * (kind === 'wide' ? 1.12 : 1);
  if (kind === 'happy' || kind === 'closed') {
    const up = kind === 'happy' ? -1 : 1;
    line(`M ${cx - rx} ${cy + 6} Q ${cx} ${cy + 6 + up * 26} ${cx + rx} ${cy + 6}`, 9);
    if (F.lashes) line(`M ${cx + side * rx} ${cy + 6} l ${side * 10} -8`, 6);
    return;
  }
  const lid = kind === 'lid' ? 0.42 : 0;
  const sclera = new Path2D();
  sclera.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  shape(sclera, WHITE, { off: 0, ink: 3 });
  const c = ctx(); // the iris, pupil and glints stay inside the white
  c.save();
  c.clip(sclera);
  const [lx, ly] = fc.look ?? [0, 0], ir = rx * (kind === 'wide' ? 0.56 : 0.72);
  const ix = cx + lx * (rx - ir * 0.8), iy = cy + 3 + ly * (ry - ir * 0.9);
  oval(ix, iy, ir, ir * 1.08, F.iris, { off: 0, ink: 0 });
  oval(ix, iy - ir * 0.45, ir * 1.05, ir * 0.7, tone(F.iris, 0.6), { off: 0, ink: 0, alpha: 0.55 });
  oval(ix, iy, ir * 0.5, ir * 0.55, INK, { off: 0, ink: 0 });
  oval(ix - ir * 0.38, iy - ir * 0.42, ir * 0.3, ir * 0.3, WHITE, { off: 0, ink: 0 });
  oval(ix + ir * 0.36, iy + ir * 0.4, ir * 0.13, ir * 0.13, WHITE, { off: 0, ink: 0 });
  if (kind === 'sparkle') {
    for (const [dx, dy, s] of [[-0.35, -0.4, 0.5], [0.4, 0.35, 0.28]]) {
      const x = ix + ir * dx, y = iy + ir * dy, r = ir * s;
      flat(`M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} Q ${x} ${y} ${x - r} ${y} Q ${x} ${y} ${x} ${y - r} Z`, WHITE);
    }
  }
  flat(`M ${cx - rx} ${cy - ry} L ${cx + rx} ${cy - ry} L ${cx + rx} ${cy - ry * 0.55} Q ${cx} ${cy - ry * 0.85} ${cx - rx} ${cy - ry * 0.55} Z`, 'rgba(60,30,60,0.14)');
  if (lid) flat(`M ${cx - rx - 2} ${cy - ry - 2} L ${cx + rx + 2} ${cy - ry - 2} L ${cx + rx + 2} ${cy - ry + 2 * ry * lid} Q ${cx} ${cy - ry + 2 * ry * lid + 6} ${cx - rx - 2} ${cy - ry + 2 * ry * lid} Z`, spec.c.skin);
  c.restore();
  const top = lid ? cy - ry + 2 * ry * lid : cy - ry * 0.35;
  if (lid) line(`M ${cx - rx} ${top} Q ${cx} ${top + 6} ${cx + rx} ${top}`, 9);
  else line(`M ${cx - side * rx * 0.95} ${cy - ry * 0.3} C ${cx - side * rx * 0.6} ${cy - ry * 1.08}, ${cx + side * rx * 0.6} ${cy - ry * 1.1}, ${cx + side * rx * 1.04} ${cy - ry * 0.4}`, 9);
  if (F.lashes) {
    line(`M ${cx + side * rx * 0.98} ${cy - ry * 0.45} l ${side * 13} -11`, 7);
    line(`M ${cx + side * rx * 0.75} ${cy - ry * 0.85} l ${side * 9} -12`, 6);
  }
}

export function drawFace(spec, fc) {
  const F = spec.face, my = F.mouthY, blush = (fc.blush ?? 1) * (F.blush ?? 1);
  for (const s of [-1, 1]) oval(s * (F.eyeX + 20), F.eyeY + 44, 22, 12, '#FF7F86', { off: 0, ink: 0, alpha: 0.28 * blush });
  if (F.freckles) for (const [x, y] of F.freckles) oval(x, y, 2.6, 2.6, tone(spec.c.skinShade, 0.8), { off: 0, ink: 0, alpha: 0.7 });
  if (fc.suck) for (const s of [-1, 1]) line(`M ${s * 80} ${my - 52} C ${s * 60} ${my - 30}, ${s * 58} ${my - 8}, ${s * 70} ${my + 14}`, 5, INK, 0.7);
  eye(spec, fc, -1);
  eye(spec, fc, 1);
  const ny = F.eyeY + 38;
  line(`M 3 ${ny - 14} C -10 ${ny + 4}, -6 ${ny + 10}, 8 ${ny + 8}`, 5, INK, 0.6);
  mouth(spec, fc.mouth, my);
}

function mouth(spec, m, my) {
  const lip = spec.face.lip, dark = '#6B2234', tongue = '#F27C8C';
  if (m === 'smile') line(`M -22 ${my - 4} Q 0 ${my + 14} 22 ${my - 4}`, 7);
  if (m === 'smirk') line(`M -20 ${my + 4} Q 6 ${my + 10} 26 ${my - 8}`, 7);
  if (m === 'flat') line(`M -16 ${my + 2} L 16 ${my + 2}`, 7);
  if (m === 'grin' || m === 'bigSmile') {
    const w = m === 'grin' ? 30 : 42, d = m === 'grin' ? 30 : 40;
    const p = `M ${-w} ${my - 6} Q 0 ${my - 2} ${w} ${my - 6} C ${w - 2} ${my + d * 0.7}, ${-w + 2} ${my + d * 0.7}, ${-w} ${my - 6} Z`;
    shape(p, dark, { off: 0, ink: 6 });
    const c = ctx();
    c.save();
    c.clip(new Path2D(p));
    flat(`M ${-w} ${my - 12} L ${w} ${my - 12} L ${w} ${my + 6} Q 0 ${my + 10} ${-w} ${my + 6} Z`, WHITE);
    oval(0, my + d * 0.62, w * 0.55, d * 0.3, tongue, { off: 0, ink: 0 });
    c.restore();
    line(p, 6);
  }
  if (m === 'o') shape(`M 0 ${my - 14} C 16 ${my - 14}, 16 ${my + 18}, 0 ${my + 18} C -16 ${my + 18}, -16 ${my - 14}, 0 ${my - 14} Z`, dark, { off: 0, ink: 6 });
  if (m === 'fish') {
    oval(0, my, 15, 20, lip ?? '#E3858C', { ink: 6, off: 4 });
    oval(0, my, 5, 9, dark, { off: 0, ink: 0 });
  }
  if (lip && (m === 'smile' || m === 'smirk')) line(`M -8 ${my + 10} Q 0 ${my + 14} 8 ${my + 10}`, 5, lip, 0.8);
}

export function drawBrows(spec, fc) {
  const F = spec.face, B = { y: -34, w: 52, t: 12, ...F.brow };
  for (const side of [-1, 1]) {
    let [inner, outer] = BROWS[fc.brows] ?? BROWS.flat;
    if (fc.brows === 'cocky') [inner, outer] = side < 0 ? [8, 0] : [-10, -14];
    const ix = side * (F.eyeX - B.w / 2), ox = side * (F.eyeX + B.w / 2);
    line(`M ${ix} ${B.y + inner} Q ${side * F.eyeX} ${B.y + Math.min(inner, outer) - 10} ${ox} ${B.y + outer}`, B.t, spec.c.brow);
  }
  if (fc.wrinkles && !spec.face.fringe) {
    for (const y of [B.y - 46, B.y - 58]) line(`M -30 ${y + 4} Q 0 ${y - 4} 30 ${y + 4}`, 4, INK, 0.5);
  }
}
