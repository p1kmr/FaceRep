// Draws something as a die-cut sticker: a white border all round it and a soft shadow under it, the look of the
// cast cards. draw(g) paints with the pen on a spare canvas that has the caller's transform; the result goes on c.

import { use } from './pen.js';

let A = null, B = null;
const spare = (c) => Object.assign(document.createElement('canvas'), { width: c.canvas.width, height: c.canvas.height });

export function sticker(c, draw, { border = 14, shadow = 0.22 } = {}) {
  A ??= spare(c);
  B ??= spare(c);
  const a = A.getContext('2d'), b = B.getContext('2d');
  a.setTransform(1, 0, 0, 1, 0, 0);
  a.clearRect(0, 0, A.width, A.height);
  a.setTransform(c.getTransform());
  use(a);
  draw(a);
  use(c);
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.clearRect(0, 0, B.width, B.height);
  b.drawImage(A, 0, 0);
  b.globalCompositeOperation = 'source-in';
  b.fillStyle = '#FFFFFF';
  b.fillRect(0, 0, B.width, B.height);
  b.globalCompositeOperation = 'source-over';
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  if (shadow) {
    c.shadowColor = `rgba(43, 29, 46, ${shadow})`;
    c.shadowBlur = 44;
    c.shadowOffsetY = 22;
    c.drawImage(B, 0, 0);
    c.shadowColor = 'transparent';
  }
  for (let i = 0; i < 24; i++) {
    const t = (i / 24) * Math.PI * 2;
    c.drawImage(B, Math.cos(t) * border, Math.sin(t) * border);
  }
  c.drawImage(A, 0, 0);
  c.restore();
}
