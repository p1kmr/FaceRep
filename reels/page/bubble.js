// A comic speech bubble: Anton words in a white bubble with an ink edge and a tail pointing at the speaker
// (the reels have no voice: the characters' words are bubbles). x, y is the bubble's middle; tail: [x, y] of its tip.

const INK = '#0B0D10', WHITE = '#FFFFFF';

export function bubble(c, str, { x, y, size = 48, tail = null, color = INK, pop = 1 }) {
  if (pop <= 0) return;
  c.save();
  c.font = `${size}px Anton`;
  const w = c.measureText(str).width + size * 0.9, h = size * 1.5;
  c.translate(x, y);
  c.scale(pop, pop);
  c.beginPath();
  c.roundRect(-w / 2, -h / 2, w, h, h / 2);
  if (tail) {
    const [tx, ty] = [tail[0] - x, tail[1] - y], side = Math.sign(tx) || 1;
    c.moveTo(side * size * 0.1, h / 2 - 4);
    c.lineTo(tx, ty);
    c.lineTo(side * size * 0.75, h / 2 - 4);
  }
  c.fillStyle = WHITE;
  c.strokeStyle = INK;
  c.lineWidth = Math.max(3, size * 0.09);
  c.lineJoin = 'round';
  c.stroke();
  c.fill();
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = color;
  c.fillText(str, 0, size * 0.05);
  c.restore();
}
