// The pen of the bust style (reels/page/bust): flat colours, shade shapes and a thin brown line, the light from the
// top left. Units are the bust's own: the eye line is y 0, the chin about y 140, the top of the hair about y -210.
// use(c) picks the canvas; the people (people.js) call it themselves.

let G = null;
export const use = (c) => {
  G = c;
};
export const ctx = () => G;

export const LINE = '#4A2C22';
export const L = (a, b, k) => a + (b - a) * k;
export const LP = (p, q, k) => [L(p[0], q[0], k), L(p[1], q[1], k)];
export const cl = (x) => Math.max(0, Math.min(1, x));
export const P = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
export const M = ([x, y]) => [-x, y];
const path = (d) => (typeof d === 'string' ? new Path2D(d) : d);

export function fill(d, color, alpha = 1) {
  G.save();
  G.globalAlpha *= alpha;
  G.fillStyle = color;
  G.fill(path(d));
  G.restore();
}

export function stroke(d, w, color = LINE, alpha = 1) {
  G.save();
  G.globalAlpha *= alpha;
  G.lineWidth = w;
  G.strokeStyle = color;
  G.lineCap = 'round';
  G.lineJoin = 'round';
  G.stroke(path(d));
  G.restore();
}

// Draw inside a shape only.
export function clip(d, draw) {
  G.save();
  G.clip(path(d));
  draw();
  G.restore();
}

export function ell(x, y, rx, ry) {
  const p = new Path2D();
  p.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  return p;
}

// A four-point twinkle with a thin edge.
export function sparkle(x, y, r) {
  const d = `M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} Q ${x} ${y} ${x - r} ${y} Q ${x} ${y} ${x} ${y - r} Z`;
  fill(d, '#FFFFFF');
  stroke(d, 2, LINE, 0.8);
}
