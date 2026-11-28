// The phone showing the app's hold ring, standing on a small desk stand. o: { x, y (the phone's centre), s (seconds
// into the hold), k (pop), label, secs (the hold), rep }.

import { RED, clamp } from '/page/draw.js';
import { INK } from './pen.js';

export function appPhone(c, { x, y, s, k = 1, label = 'FISH FACE', secs = 5, rep = 'REP 3/8', deg = -4, done = false }) {
  if (k <= 0) return;
  c.save();
  c.translate(x, y);
  c.rotate((deg * Math.PI) / 180);
  c.scale(k, k);
  c.fillStyle = '#3A3A40';
  c.beginPath();
  c.moveTo(-90, 250);
  c.lineTo(90, 250);
  c.lineTo(60, 200);
  c.lineTo(-60, 200);
  c.closePath();
  c.fill();
  c.fillStyle = '#121014';
  c.beginPath();
  c.roundRect(-135, -260, 270, 500, 44);
  c.fill();
  const g = c.createLinearGradient(0, -240, 0, 240);
  g.addColorStop(0, '#FFF4EC');
  g.addColorStop(1, '#FFE2D2');
  c.fillStyle = g;
  c.beginPath();
  c.roundRect(-120, -245, 240, 470, 34);
  c.fill();
  c.fillStyle = INK;
  c.font = '38px Anton';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(label, 0, -170);
  const p = done ? 1 : clamp(s / secs, 0.001), left = Math.max(1, Math.ceil(secs - s));
  c.lineWidth = 18;
  c.strokeStyle = 'rgba(43,29,46,0.12)';
  c.beginPath();
  c.arc(0, 0, 82, 0, Math.PI * 2);
  c.stroke();
  const r = c.createLinearGradient(-80, -80, 80, 80);
  r.addColorStop(0, '#FF6B2C');
  r.addColorStop(1, RED);
  c.strokeStyle = r;
  c.lineCap = 'round';
  c.beginPath();
  c.arc(0, 0, 82, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p);
  c.stroke();
  if (done) {
    c.strokeStyle = RED;
    c.lineWidth = 20;
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(-36, 4);
    c.lineTo(-8, 32);
    c.lineTo(40, -24);
    c.stroke();
  } else {
    c.fillStyle = INK;
    c.font = '84px Anton';
    c.fillText(String(left), 0, 6);
  }
  c.fillStyle = INK;
  c.font = '28px Anton';
  c.fillText(done ? 'DONE' : 'HOLD', 0, 130);
  c.fillStyle = RED;
  c.beginPath();
  c.roundRect(-90, 165, 180, 34, 17);
  c.fill();
  c.fillStyle = '#FFFFFF';
  c.font = '22px Anton';
  c.fillText(rep, 0, 183);
  c.restore();
}
