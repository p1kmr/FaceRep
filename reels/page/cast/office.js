// The office break room at lunch (reel 009-lunch-break): a warm wall, a window on a sunny city, the wall clock at
// 12:30, a coffee machine on the counter. breakRoom(c, t) is behind the people; table(c) and lunch(c) in front.

import { line } from './pen.js';

export function wall(c) {
  const g = c.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#F6EBDD');
  g.addColorStop(1, '#E8D6C2');
  c.fillStyle = g;
  c.fillRect(0, 0, 1080, 1920);
  c.fillStyle = '#D9C3AA';
  c.fillRect(0, 1180, 1080, 16);
}

function window_(c) {
  const x = 620, y = 400, w = 400, h = 560;
  const sky = c.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, '#7FC4F5');
  sky.addColorStop(1, '#D4EEFF');
  c.fillStyle = sky;
  c.fillRect(x, y, w, h);
  c.fillStyle = '#A9C3DA';
  for (const [bx, bw, bh] of [[0, 90, 260], [80, 70, 360], [150, 110, 220], [250, 80, 400], [320, 90, 300]]) c.fillRect(x + bx, y + h - bh, bw, bh);
  c.fillStyle = 'rgba(255,255,255,0.55)';
  for (let r = 0; r < 12; r++) for (const bx of [270, 285, 300]) c.fillRect(x + bx, y + h - 380 + r * 30, 8, 14);
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.beginPath();
  c.moveTo(x + 40, y);
  c.lineTo(x + 140, y);
  c.lineTo(x + 20, y + h);
  c.lineTo(x - 80, y + h);
  c.fill();
  c.strokeStyle = '#FFFFFF';
  c.lineWidth = 22;
  c.strokeRect(x, y, w, h);
  c.lineWidth = 12;
  c.beginPath();
  c.moveTo(x + w / 2, y);
  c.lineTo(x + w / 2, y + h);
  c.stroke();
}

// The wall clock at x, y, r its radius; minutes past 12:00 (30 = 12:30).
export function clock(c, x, y, r = 95, minutes = 30) {
  c.save();
  c.translate(x, y);
  c.scale(r / 95, r / 95);
  c.fillStyle = '#FFFFFF';
  c.strokeStyle = '#2B1D2E';
  c.lineWidth = 10;
  c.beginPath();
  c.arc(0, 0, 95, 0, Math.PI * 2);
  c.fill();
  c.stroke();
  c.fillStyle = '#2B1D2E';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    c.beginPath();
    c.arc(Math.sin(a) * 74, -Math.cos(a) * 74, i % 3 ? 4 : 7, 0, Math.PI * 2);
    c.fill();
  }
  const m = ((minutes % 60) / 60) * Math.PI * 2, h = ((minutes % 720) / 720) * Math.PI * 2;
  line(`M 0 0 L ${Math.sin(m) * 72} ${-Math.cos(m) * 72}`, 7, '#2B1D2E');
  line(`M 0 0 L ${Math.sin(h) * 40} ${-Math.cos(h) * 40}`, 15, '#2B1D2E');
  c.fillStyle = '#E5322D';
  c.beginPath();
  c.arc(0, 0, 9, 0, Math.PI * 2);
  c.fill();
  c.restore();
}

function counter(c) {
  c.fillStyle = '#B8C4CC';
  c.fillRect(0, 1120, 470, 60);
  c.fillStyle = '#8E9BA5';
  c.fillRect(0, 1180, 470, 340);
  // the coffee machine
  c.fillStyle = '#2E2C33';
  c.beginPath();
  c.roundRect(40, 900, 200, 225, 18);
  c.fill();
  c.fillStyle = '#4A4852';
  c.fillRect(80, 1010, 120, 70);
  c.fillStyle = '#F4F4F4';
  c.fillRect(115, 1040, 50, 70);
  c.fillStyle = '#5EE07A';
  c.beginPath();
  c.arc(200, 940, 9, 0, Math.PI * 2);
  c.fill();
}

function plant(c, x, y) {
  c.fillStyle = '#E9A36B';
  c.beginPath();
  c.moveTo(x - 50, y);
  c.lineTo(x + 50, y);
  c.lineTo(x + 38, y + 90);
  c.lineTo(x - 38, y + 90);
  c.fill();
  c.fillStyle = '#4E9C5A';
  for (const [dx, dy, r] of [[-40, -40, 40], [30, -60, 45], [0, -110, 42], [55, -10, 32], [-60, 0, 30]]) {
    c.beginPath();
    c.ellipse(x + dx, y + dy, r, r * 0.55, dx / 80, 0, Math.PI * 2);
    c.fill();
  }
}

export function breakRoom(c) {
  wall(c);
  window_(c);
  clock(c, 200, 560);
  counter(c);
  plant(c, 960, 1110);
}

// The table's top across the bottom of the frame.
export function table(c) {
  c.fillStyle = '#C08A5B';
  c.fillRect(0, 1600, 1080, 320);
  c.fillStyle = '#D9A574';
  c.fillRect(0, 1590, 1080, 26);
  c.fillStyle = 'rgba(80,40,20,0.12)';
  for (const y of [1680, 1760, 1850]) c.fillRect(0, y, 1080, 6);
}

// A sandwich on its wrap and an iced coffee.
export function lunch(c) {
  c.fillStyle = '#FFFFFF';
  c.beginPath();
  c.ellipse(250, 1700, 190, 60, 0, 0, Math.PI * 2);
  c.fill();
  for (const dx of [-60, 70]) {
    c.fillStyle = '#E8C28A';
    c.beginPath();
    c.moveTo(250 + dx - 80, 1700);
    c.lineTo(250 + dx + 80, 1700);
    c.lineTo(250 + dx, 1590);
    c.closePath();
    c.fill();
    c.fillStyle = '#7CC26A';
    c.fillRect(250 + dx - 70, 1690, 140, 10);
    c.fillStyle = '#E8604C';
    c.fillRect(250 + dx - 60, 1682, 120, 8);
  }
  c.fillStyle = 'rgba(255,255,255,0.8)';
  c.beginPath();
  c.moveTo(580, 1500);
  c.lineTo(680, 1500);
  c.lineTo(665, 1700);
  c.lineTo(595, 1700);
  c.fill();
  c.fillStyle = '#A0673F';
  c.beginPath();
  c.moveTo(586, 1560);
  c.lineTo(674, 1560);
  c.lineTo(665, 1690);
  c.lineTo(595, 1690);
  c.fill();
  c.strokeStyle = '#2FA36B';
  c.lineWidth = 12;
  c.beginPath();
  c.moveTo(640, 1500);
  c.lineTo(660, 1420);
  c.stroke();
}

// A work badge on a lanyard. x, y: the badge's centre.
export function badge(c, x, y, from = 70) {
  c.strokeStyle = '#2F6FE4';
  c.lineWidth = 12;
  c.beginPath();
  c.moveTo(x - from, y - 190);
  c.lineTo(x, y - 40);
  c.lineTo(x + from, y - 190);
  c.stroke();
  c.fillStyle = '#FFFFFF';
  c.strokeStyle = '#2B1D2E';
  c.lineWidth = 5;
  c.beginPath();
  c.roundRect(x - 45, y - 45, 90, 120, 10);
  c.fill();
  c.stroke();
  c.fillStyle = '#2F6FE4';
  c.fillRect(x - 45, y - 45, 90, 28);
  c.fillStyle = '#C7CDD6';
  c.fillRect(x - 25, y, 50, 40);
}
