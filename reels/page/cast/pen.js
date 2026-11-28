// The cast's pen (reels/page/cast): every shape is filled, cel-shaded (a darker edge on the side away from the
// light, which comes from the top left) and outlined in a soft plum ink, like a polished cartoon. Paths are SVG path
// text or Path2D. Units: a person is about 780 tall, feet on y = 0, y grows downward. use(c) picks the canvas.

export const INK = '#2B1D2E', LW = 8, WHITE = '#FFFFFF';
let G = null;
export const use = (c) => {
  G = c;
};
export const ctx = () => G;

const rad = (d) => (d * Math.PI) / 180;
const toPath = (d) => (typeof d === 'string' ? new Path2D(d) : d);

// A darker (k < 1) or lighter (k > 1) version of a colour.
export function tone(hex, k = 0.84) {
  const n = parseInt(hex.slice(1), 16), ch = [n >> 16, (n >> 8) & 255, n & 255];
  const out = ch.map((v, i) => Math.round(k < 1 ? v * k * (i === 0 ? 1.04 : 1) : v + (255 - v) * (k - 1)));
  return `rgb(${out.map((v) => Math.max(0, Math.min(255, v))).join(',')})`;
}

// Fill a path with a cel shade and an outline. shade: the dark colour (default: a darker fill); off: how far the
// light side is pushed to the top left; ink: the outline's width (0 for none); gloss: a soft highlight.
export function shape(d, fill, { shade = tone(fill), off = 12, ink = LW, gloss = 0, alpha = 1 } = {}) {
  const p = toPath(d);
  G.save();
  G.globalAlpha *= alpha;
  if (ink) {
    G.lineWidth = ink * 2;
    G.strokeStyle = INK;
    G.lineJoin = 'round';
    G.stroke(p);
  }
  G.fillStyle = off ? shade : fill;
  G.fill(p);
  if (off) {
    G.clip(p);
    G.translate(-off, -off * 0.8);
    G.fillStyle = fill;
    G.fill(p);
    if (gloss) {
      G.translate(-off * 0.6, -off * 0.6);
      G.globalAlpha *= gloss;
      G.lineWidth = off;
      G.strokeStyle = WHITE;
      G.stroke(p);
    }
  }
  G.restore();
}

export const flat = (d, fill, alpha = 1) => shape(d, fill, { off: 0, ink: 0, alpha });

export function line(d, width = 6, color = INK, alpha = 1) {
  G.save();
  G.globalAlpha *= alpha;
  G.lineWidth = width;
  G.strokeStyle = color;
  G.lineCap = 'round';
  G.lineJoin = 'round';
  G.stroke(toPath(d));
  G.restore();
}

export function oval(cx, cy, rx, ry, fill, opts = {}) {
  const p = new Path2D();
  p.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  shape(p, fill, opts);
}

export function box(x, y, w, h, r, fill, opts = {}) {
  const p = new Path2D();
  p.roundRect(x, y, w, h, r);
  shape(p, fill, opts);
}

// Draw inside a moved, turned (degrees) and scaled frame.
export function group(x, y, deg, s, draw, sy = s) {
  G.save();
  G.translate(x, y);
  if (deg) G.rotate(rad(deg));
  if (s !== 1 || sy !== 1) G.scale(s, sy);
  draw();
  G.restore();
}

// A two-piece limb from a joint. Angles in degrees: 0 points straight down, plus turns toward +x.
export function limb(start, a1, l1, a2, l2) {
  const t1 = rad(a1), t2 = rad(a1 + a2);
  const mid = [start[0] + Math.sin(t1) * l1, start[1] + Math.cos(t1) * l1];
  const end = [mid[0] + Math.sin(t2) * l2, mid[1] + Math.cos(t2) * l2];
  return { start, mid, end, dir: a1 + a2 };
}

export const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

// A smooth tube through points with a radius at each point and round ends, as a Path2D.
export function tube(pts, rs) {
  const p = new Path2D(), n = pts.length, L = [], R = [];
  const dir = (i) => {
    const [a, b] = i < n - 1 ? [pts[i], pts[i + 1]] : [pts[i - 1], pts[i]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  };
  for (let i = 0; i < n; i++) {
    let [dx, dy] = dir(i);
    if (i > 0 && i < n - 1) {
      const [px, py] = dir(i - 1), m = Math.hypot(dx + px, dy + py) || 1;
      [dx, dy] = [(dx + px) / m, (dy + py) / m];
    }
    L.push([pts[i][0] - dy * rs[i], pts[i][1] + dx * rs[i]]);
    R.push([pts[i][0] + dy * rs[i], pts[i][1] - dx * rs[i]]);
  }
  const angle = (i) => Math.atan2(dir(i)[1], dir(i)[0]);
  p.moveTo(...L[0]);
  for (let i = 1; i < n; i++) p.lineTo(...L[i]);
  p.arc(...pts[n - 1], rs[n - 1], angle(n - 1) + Math.PI / 2, angle(n - 1) - Math.PI / 2, true);
  for (let i = n - 2; i >= 0; i--) p.lineTo(...R[i]);
  p.arc(...pts[0], rs[0], angle(0) - Math.PI / 2, angle(0) + Math.PI / 2, true);
  p.closePath();
  return p;
}

// A film grain over the whole canvas, the same every time (no randomness between renders).
let grainTile = null;
export function grain(c, amount = 0.07) {
  if (!grainTile) {
    grainTile = Object.assign(document.createElement('canvas'), { width: 256, height: 256 });
    const g = grainTile.getContext('2d'), img = g.createImageData(256, 256);
    let s = 12345;
    for (let i = 0; i < img.data.length; i += 4) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const v = (s >> 16) & 255;
      img.data.set([v, v, v, 255], i);
    }
    g.putImageData(img, 0, 0);
  }
  c.save();
  c.globalAlpha = amount;
  c.globalCompositeOperation = 'overlay';
  c.fillStyle = c.createPattern(grainTile, 'repeat');
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);
  c.restore();
}
