// Not used: driving scenes are banned (reels/README.md, rules). Kept as an earlier design.
// The car (the dropped red-light idea): the camera sits on the dash and looks at the driver. Behind him the rear window shows a
// US street at sunset (palm trees, a red traffic light); the roof, pillars and seat frame him; the steering wheel and
// the phone on its dash mount sit in front. cabin(c, t) draws what is behind the driver, front(c, o) what is in front.


function sky(c) {
  const g = c.createLinearGradient(0, 200, 0, 1300);
  g.addColorStop(0, '#6D5AA8');
  g.addColorStop(0.45, '#F2879A');
  g.addColorStop(0.8, '#FFB673');
  g.addColorStop(1, '#FFD9A0');
  c.fillStyle = g;
  c.fillRect(0, 0, 1080, 1920);
  const sun = c.createRadialGradient(300, 1080, 10, 300, 1080, 260);
  sun.addColorStop(0, 'rgba(255,240,200,1)');
  sun.addColorStop(0.25, 'rgba(255,210,140,0.9)');
  sun.addColorStop(1, 'rgba(255,190,120,0)');
  c.fillStyle = sun;
  c.fillRect(0, 700, 700, 800);
}

function palm(c, x, base, h, lean) {
  c.save();
  c.fillStyle = '#3B2547';
  c.strokeStyle = '#3B2547';
  c.lineCap = 'round';
  c.lineWidth = 16;
  const tx = x + lean, ty = base - h;
  c.beginPath();
  c.moveTo(x, base);
  c.quadraticCurveTo(x + lean * 0.2, base - h * 0.6, tx, ty);
  c.stroke();
  for (const a of [-2.7, -2.2, -1.7, -1.2, -0.6, -0.1, 0.4]) {
    const ex = tx + Math.cos(a) * 130, ey = ty + Math.sin(a) * 60 + 50;
    c.beginPath();
    c.moveTo(tx, ty);
    c.quadraticCurveTo((tx + ex) / 2, ty - 50, ex, ey);
    c.quadraticCurveTo((tx + ex) / 2, ty - 15, tx, ty);
    c.fill();
  }
  c.restore();
}

function street(c, t) {
  c.fillStyle = '#4A3354';
  c.fillRect(0, 1150, 1080, 800);
  c.fillStyle = '#5B3F62';
  for (const [x, w, h] of [[0, 220, 120], [230, 160, 80], [640, 260, 140], [910, 200, 100]]) c.fillRect(x, 1150 - h, w, h);
  palm(c, 230, 1160, 720, -20);
  palm(c, 330, 1160, 560, 30);
  palm(c, 700, 1160, 640, -10);
  // the traffic light on its pole, red lit
  c.fillStyle = '#2A1C30';
  c.fillRect(826, 640, 14, 520);
  c.beginPath();
  c.roundRect(800, 520, 66, 180, 14);
  c.fill();
  const on = 0.85 + 0.15 * Math.sin(t * 6);
  const glow = c.createRadialGradient(833, 560, 4, 833, 560, 110);
  glow.addColorStop(0, `rgba(255,70,60,${on})`);
  glow.addColorStop(1, 'rgba(255,70,60,0)');
  c.fillStyle = glow;
  c.fillRect(700, 440, 260, 260);
  c.fillStyle = '#FF4A3E';
  c.beginPath();
  c.arc(833, 560, 20, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#4C3A3A';
  for (const y of [610, 660]) {
    c.beginPath();
    c.arc(833, y, 18, 0, Math.PI * 2);
    c.fill();
  }
}

// The cabin around the rear window: roof, pillars, the seat and its headrest.
export function cabin(c, t) {
  sky(c);
  street(c, t);
  c.save();
  c.fillStyle = '#2C2733';
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(1080, 0);
  c.lineTo(1080, 1920);
  c.lineTo(940, 1920);
  c.lineTo(900, 520);
  c.quadraticCurveTo(880, 330, 700, 320);
  c.lineTo(380, 320);
  c.quadraticCurveTo(200, 330, 180, 520);
  c.lineTo(140, 1920);
  c.lineTo(0, 1920);
  c.closePath();
  c.fill('evenodd');
  // the window's rubber edge
  c.strokeStyle = '#16131A';
  c.lineWidth = 14;
  c.beginPath();
  c.moveTo(150, 1920);
  c.lineTo(188, 520);
  c.quadraticCurveTo(208, 338, 380, 330);
  c.lineTo(700, 330);
  c.quadraticCurveTo(872, 338, 892, 520);
  c.lineTo(930, 1920);
  c.stroke();
  // seat back and headrest
  c.fillStyle = '#3A3542';
  c.beginPath();
  c.roundRect(170, 1250, 740, 800, 120);
  c.fill();
  c.fillStyle = '#433D4C';
  c.beginPath();
  c.roundRect(360, 560, 360, 300, 90);
  c.fill();
  c.fillStyle = '#25212B';
  c.fillRect(420, 850, 22, 160);
  c.fillRect(638, 850, 22, 160);
  // the sunset's warm light on the cabin
  c.fillStyle = 'rgba(255,150,100,0.08)';
  c.fillRect(0, 0, 1080, 1920);
  c.restore();
}

// The seat belt over his left shoulder (the viewer's right).
export function belt(c) {
  c.save();
  c.strokeStyle = '#1E1B22';
  c.lineWidth = 78;
  c.beginPath();
  c.moveTo(860, 1330);
  c.lineTo(330, 1960);
  c.stroke();
  c.strokeStyle = '#3B3742';
  c.lineWidth = 62;
  c.stroke();
  c.restore();
}

// The steering wheel, its top arc across the bottom of the frame.
export function wheel(c) {
  c.save();
  c.lineWidth = 70;
  c.strokeStyle = '#18151B';
  c.beginPath();
  c.ellipse(540, 2150, 560, 470, 0, Math.PI * 1.08, Math.PI * 1.92);
  c.stroke();
  c.lineWidth = 16;
  c.strokeStyle = 'rgba(255,190,150,0.25)';
  c.beginPath();
  c.ellipse(540, 2128, 560, 470, 0, Math.PI * 1.2, Math.PI * 1.6);
  c.stroke();
  c.restore();
}
