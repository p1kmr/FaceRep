// More of the office for reel 009-lunch-break: the break room's doorway seen from the table (a hallway with
// cubicles behind it), an iced coffee held in a hand, and the boss's mug.

import { wall } from './office.js';

export function doorway(c) {
  wall(c);
  const x0 = 220, x1 = 860, top = 430;
  const hall = c.createLinearGradient(0, top, 0, 1920);
  hall.addColorStop(0, '#E9EEF3');
  hall.addColorStop(1, '#CBD3DC');
  c.fillStyle = hall;
  c.fillRect(x0, top, x1 - x0, 1920 - top);
  c.fillStyle = '#B7C0CA';
  c.fillRect(x0, 1480, x1 - x0, 440);
  c.fillStyle = '#FFFFFF';
  for (const x of [300, 520, 740]) c.fillRect(x, top + 30, 120, 18);
  c.fillStyle = '#8FA3B8';
  for (const [x, w] of [[x0, 200], [x0 + 230, 180], [x0 + 440, 200]]) c.fillRect(x, 1120, w, 360);
  c.fillStyle = '#7A8EA3';
  for (const [x, w] of [[x0, 200], [x0 + 230, 180], [x0 + 440, 200]]) c.fillRect(x, 1120, w, 20);
  // the door, open towards us on the left, and the frame
  c.fillStyle = '#B98A5E';
  c.beginPath();
  c.moveTo(x0 - 10, top);
  c.lineTo(60, top - 60);
  c.lineTo(60, 1980);
  c.lineTo(x0 - 10, 1920);
  c.fill();
  c.fillStyle = '#E4C08C';
  c.beginPath();
  c.arc(110, 1150, 16, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#FFFFFF';
  c.lineWidth = 34;
  c.beginPath();
  c.moveTo(x0 - 6, 1920);
  c.lineTo(x0 - 6, top - 6);
  c.lineTo(x1 + 6, top - 6);
  c.lineTo(x1 + 6, 1920);
  c.stroke();
  c.fillStyle = '#2B1D2E';
  c.beginPath();
  c.roundRect(430, top - 150, 220, 74, 14);
  c.fill();
  c.fillStyle = '#FFFFFF';
  c.font = '40px Anton';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText('BREAK ROOM', 540, top - 111);
}

function hand(c, x, y, skin, s, thumb = true) {
  c.fillStyle = skin;
  c.strokeStyle = '#4A2C22';
  c.lineWidth = 3;
  for (const dy of [-30, -6, 18, 40]) {
    c.beginPath();
    c.ellipse(x - 34 * s, y + dy * s, 26 * s, 13 * s, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();
  }
  if (!thumb) return;
  c.beginPath();
  c.ellipse(x + 34 * s, y - 20 * s, 14 * s, 24 * s, 0.3, 0, Math.PI * 2);
  c.fill();
  c.stroke();
}

// An iced coffee held up in a hand: x, y the cup's middle, s its size.
export function heldCup(c, x, y, skin, s = 1) {
  c.save();
  c.fillStyle = 'rgba(255,255,255,0.75)';
  c.strokeStyle = '#4A2C22';
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(x - 60 * s, y - 110 * s);
  c.lineTo(x + 60 * s, y - 110 * s);
  c.lineTo(x + 46 * s, y + 110 * s);
  c.lineTo(x - 46 * s, y + 110 * s);
  c.closePath();
  c.fill();
  c.stroke();
  c.fillStyle = '#A0673F';
  c.beginPath();
  c.moveTo(x - 55 * s, y - 50 * s);
  c.lineTo(x + 55 * s, y - 50 * s);
  c.lineTo(x + 46 * s, y + 104 * s);
  c.lineTo(x - 46 * s, y + 104 * s);
  c.fill();
  c.fillStyle = '#FFFFFF';
  c.fillRect(x - 64 * s, y - 126 * s, 128 * s, 18 * s);
  c.strokeStyle = '#2FA36B';
  c.lineWidth = 12 * s;
  c.beginPath();
  c.moveTo(x + 10 * s, y - 126 * s);
  c.lineTo(x + 30 * s, y - 220 * s);
  c.stroke();
  c.restore();
  hand(c, x, y + 20 * s, skin, s);
}

// The boss's mug in his hand.
export function bossMug(c, x, y, skin, s = 1) {
  c.save();
  c.fillStyle = '#FFFFFF';
  c.strokeStyle = '#2B1D2E';
  c.lineWidth = 6;
  c.beginPath();
  c.roundRect(x - 110 * s, y - 120 * s, 220 * s, 250 * s, 26 * s);
  c.fill();
  c.stroke();
  c.lineWidth = 22 * s;
  c.beginPath();
  c.arc(x + 120 * s, y, 56 * s, -1.2, 1.2);
  c.stroke();
  c.fillStyle = '#2B1D2E';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.font = `${34 * s}px Anton`;
  c.fillText("WORLD'S", x, y - 60 * s);
  c.fillStyle = '#E5322D';
  c.font = `${50 * s}px Anton`;
  c.fillText('OKAYEST', x, y);
  c.fillStyle = '#2B1D2E';
  c.font = `${44 * s}px Anton`;
  c.fillText('BOSS', x, y + 58 * s);
  c.restore();
  hand(c, x - 86 * s, y + 40 * s, skin, s, false);
}
