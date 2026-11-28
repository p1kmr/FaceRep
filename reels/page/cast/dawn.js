// Brody's room on day 1 at 6:58 am (reels/004-day-30), drawn with the cast's pen (call use(c) first): a dim wall in
// the first light, the sun coming up in the window, the alarm clock, and last night's chip bags and can on the floor.
// (night in room.js is the earlier 2 am version, kept as a design.)

import { box, group, line, oval, flat } from './pen.js';
import { TEXT, chips, fill } from './room.js';

export function dawn(c) {
  fill(c, ['#46548A', '#B98A8C']);
  box(730, 520, 280, 340, 18, '#6E78AC', { off: 8 });
  box(750, 540, 240, 300, 10, '#FFD7A6', { off: 0, ink: 5 });
  flat('M 750 760 L 990 760 L 990 840 L 750 840 Z', '#FFB98A');
  oval(930, 770, 44, 44, '#FF9B45', { off: 0, ink: 5 });
  line('M 870 540 L 870 840 M 750 690 L 990 690', 10, '#6E78AC');
  flat('M 0 1600 L 1080 1600 L 1080 1920 L 0 1920 Z', '#5A4E7A');
  box(60, 540, 300, 130, 24, '#15121F', { off: 0, ink: 6 });
  c.save();
  c.shadowColor = '#FF3B3B';
  c.shadowBlur = 24;
  TEXT('6:58 AM', 210, 608, 80, '#FF5050');
  c.restore();
  chips(150, 1700, -14, '#FF8A3D');
  chips(930, 1750, 16, '#E5322D');
  group(300, 1790, 70, 1, () => {
    box(-28, -84, 56, 110, 12, '#4CD38A', { off: 6 });
    box(-24, -92, 48, 14, 6, '#C9CED8', { off: 0, ink: 5 });
  });
}
