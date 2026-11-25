// Draws one cast member from a spec (sizes, colours, face, clothes and hair as functions), a pose and a face.
// pose: { arms: { L: [shoulder, elbow], R }, legs: { L: [hip, knee], R }, tilt (head, degrees) }. Angles in degrees:
// 0 points straight down, plus turns toward the right of the picture. L is the left of the picture. Feet on y = 0.
// The spec's hooks get ctx = { spec, b, c, hipY, sY, neckTop, headCY, legs, arms, pose, fc }.

import { INK, box, group, line, limb, oval, shape, tube } from './pen.js';
import { drawBrows, drawFace } from './face.js';

const REST = { arms: { L: [-10, 8], R: [10, -8] }, legs: { L: [-3, 2], R: [3, -2] }, tilt: 0 };

// The head outline: a round top, full cheeks and a small chin. jaw (0 to 1) squares it; pinch draws the cheeks in.
export function headPath(w, h, jaw = 0, pinch = 0) {
  const r = w / 2, t = -h / 2, b = h / 2, jx = r * (0.5 + 0.14 * jaw) - 8 * pinch, jy = b - 10 - 4 * jaw;
  const cx = r * 0.86 + 8 * jaw - 14 * pinch;
  return `M 0 ${t} C ${r * 0.6} ${t}, ${r} ${t * 0.75}, ${r} ${-h * 0.08} C ${r} ${h * 0.2}, ${cx} ${h * 0.36}, ${jx} ${jy} ` +
    `C ${r * 0.3} ${b + 2}, ${-r * 0.3} ${b + 2}, ${-jx} ${jy} C ${-cx} ${h * 0.36}, ${-r} ${h * 0.2}, ${-r} ${-h * 0.08} ` +
    `C ${-r} ${t * 0.75}, ${-r * 0.6} ${t}, 0 ${t} Z`;
}

// A mitten hand at the end of an arm, turned along the forearm. kind: open | fist | peace | spread (jazz hands).
export function hand(at, dir, skin, s = 26, side = 1, kind = 'open') {
  group(at[0], at[1], -dir, 1, () => {
    const fingers = { peace: [-14, 14], spread: [-48, -18, 12, 42] }[kind] ?? [];
    for (const a of fingers) group(0, s * 0.4, a, 1, () => shape(tube([[0, 0], [0, s * 1.4]], [s * 0.22, s * 0.19]), skin, { ink: 6, off: 4 }));
    oval(0, s * 0.42, s * 0.66, s * (kind === 'fist' ? 0.62 : 0.78), skin, { ink: 7, off: 5 });
    shape(tube([[-side * s * 0.45, s * 0.1], [-side * s * 0.82, s * 0.5]], [s * 0.26, s * 0.22]), skin, { ink: 6, off: 3 });
    if (kind === 'fist') line(`M ${-s * 0.4} ${s * 0.72} Q 0 ${s * 0.86} ${s * 0.4} ${s * 0.72}`, 4, INK, 0.6);
  });
}

// A chunky sneaker at the ankle; side -1 points the toe left, 1 right.
export function sneaker(ctx, at, side) {
  const c = ctx.c, a = ctx.b.ankle;
  group(at[0], at[1], 0, side, () => {
    shape(`M -24 ${-a} C -26 ${-a * 1.5}, 24 ${-a * 1.5}, 28 ${-a * 0.6} C 52 ${-a * 0.5}, 64 ${a * 0.1}, 60 ${a * 0.55} ` +
      `L -30 ${a * 0.55} C -36 ${a * 0.1}, -30 ${-a * 0.5}, -24 ${-a} Z`, c.shoe, { off: 7, ink: 7 });
    box(-34, a * 0.42, 98, a * 0.6, a * 0.28, c.sole ?? '#E4DDD2', { off: 4, ink: 7 });
    if (c.shoeAccent) line(`M -6 ${-a * 0.55} C 8 ${-a * 0.1}, 24 ${a * 0.05}, 42 ${-a * 0.05}`, 7, c.shoeAccent);
  }, 1);
}

// A torso as path text: shoulders `sw` wide each side at sY, down to the hem below the hips. flare widens the hem.
export function torsoPath(b, sY, hipY, hem = 30, flare = 0) {
  const { sw, hw } = b;
  return `M ${-sw} ${sY + 36} C ${-sw} ${sY + 8}, ${-sw + 20} ${sY}, ${-sw + 46} ${sY} L ${sw - 46} ${sY} ` +
    `C ${sw - 20} ${sY}, ${sw} ${sY + 8}, ${sw} ${sY + 36} C ${sw + 2} ${sY + 110}, ${hw + 10 + flare} ${hipY - 30}, ${hw + 12 + flare} ${hipY + hem} ` +
    `L ${-hw - 12 - flare} ${hipY + hem} C ${-hw - 10 - flare} ${hipY - 30}, ${-sw - 2} ${sY + 110}, ${-sw} ${sY + 36} Z`;
}

export function drawHead(spec, fc, ctx) {
  const b = spec.body, c = spec.c, ey = spec.face.eyeY;
  for (const side of [-1, 1]) {
    const x = side * (b.headW / 2 - 6);
    shape(`M ${x} ${ey - 14} C ${x + side * 32} ${ey - 26}, ${x + side * 36} ${ey + 36}, ${x - side * 2} ${ey + 32} Z`, c.skin, { shade: c.skinShade, off: 6, ink: 7 });
    line(`M ${x + side * 4} ${ey - 4} C ${x + side * 18} ${ey - 4}, ${x + side * 18} ${ey + 18}, ${x + side * 4} ${ey + 20}`, 5, INK, 0.45);
  }
  shape(headPath(b.headW, b.headH, b.jaw, fc.suck ?? 0), c.skin, { shade: c.skinShade, off: 14, ink: 9 });
  drawFace(spec, fc);
  spec.hairFront?.(ctx);
  drawBrows(spec, fc);
  spec.headExtra?.(ctx);
}

export function drawPerson(spec, pose = spec.pose ?? {}, fc = spec.mood, { shadow = true } = {}) {
  const p = { ...REST, ...pose, arms: { ...REST.arms, ...pose.arms }, legs: { ...REST.legs, ...pose.legs } };
  const b = spec.body, c = spec.c;
  const hipY = -(b.thigh + b.shin + b.ankle), sY = hipY - b.torso, neckTop = sY - b.neck;
  const headCY = neckTop - b.headH * 0.42;
  const legs = {}, arms = {};
  for (const [side, sg] of [['L', -1], ['R', 1]]) {
    const [h, k] = p.legs[side], [sh, el] = p.arms[side];
    legs[side] = limb([sg * b.hipJoint, hipY], h, b.thigh, k, b.shin);
    arms[side] = limb([sg * (b.sw - b.armIn), sY + b.armW * 0.5], sh, b.upper, el, b.fore);
  }
  const ctx = { spec, b, c, hipY, sY, neckTop, headCY, legs, arms, pose: p, fc };
  const head = (draw) => group(0, headCY, p.tilt, 1, draw);
  if (shadow) oval(0, 8, b.sw * 1.5, 18, 'rgba(43,29,46,0.22)', { off: 0, ink: 0 });
  if (spec.hairBack) head(() => spec.hairBack(ctx));
  for (const [side, sg] of [['L', -1], ['R', 1]]) {
    const g = legs[side];
    if (spec.leg) spec.leg(ctx, g, sg);
    else shape(tube([g.start, g.mid, g.end], [b.legW * 0.55, b.legW * 0.5, b.legW * 0.42]), c.bottom);
  }
  for (const [side, sg] of [['L', -1], ['R', 1]]) (spec.shoe ?? sneaker)(ctx, legs[side].end, sg);
  spec.bottom?.(ctx);
  shape(`M ${-b.neckW / 2} ${neckTop - 40} L ${b.neckW / 2} ${neckTop - 40} L ${b.neckW / 2} ${sY + 16} L ${-b.neckW / 2} ${sY + 16} Z`, c.skinShade, { off: 0 });
  spec.top(ctx);
  spec.front?.(ctx);
  for (const [side, sg] of [['L', -1], ['R', 1]]) {
    const a = arms[side];
    if (spec.arm) spec.arm(ctx, a, sg);
    else shape(tube([a.start, a.mid, a.end], [b.armW * 0.55, b.armW * 0.5, b.armW * 0.45]), c.top);
    if (!spec.holds?.[side]?.(ctx, a, sg)) hand(a.end, a.dir, c.skin, b.hand, sg, p.hands?.[side]);
  }
  head(() => drawHead(spec, fc, ctx));
  spec.after?.(ctx);
  return ctx;
}
