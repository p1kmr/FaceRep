// A reel's own pictures (REEL.art: pictures made outside the code, like the AI pictures from Figma in 010 and 011):
// painting() fills the 1080 x 1920 frame with one, shade() darkens a band at the top or the bottom so words read on
// any picture.

import { clamp } from '/page/draw.js';

// zoom 1 = just covers the frame; fx, fy: the point of the picture (0 to 1) kept in the middle; blur in pixels;
// dark: 0 to 1, a dark layer on top.
export function painting(c, pic, { zoom = 1, fx = 0.5, fy = 0.5, blur = 0, dark = 0 }) {
  const k = Math.max(1080 / pic.width, 1920 / pic.height) * zoom, w = pic.width * k, h = pic.height * k;
  const x = clamp(540 - fx * w, 1080 - w, 0), y = clamp(960 - fy * h, 1920 - h, 0);
  c.save();
  if (blur) c.filter = `blur(${blur}px)`;
  c.drawImage(pic, x, y, w, h);
  c.restore();
  if (dark) {
    c.fillStyle = `rgba(12,10,24,${dark})`;
    c.fillRect(0, 0, 1080, 1920);
  }
}

// A soft dark band, 560 pixels tall, at the top (or the bottom) of the frame.
export function shade(c, top = true) {
  const g = top ? c.createLinearGradient(0, 0, 0, 560) : c.createLinearGradient(0, 1920, 0, 1360);
  g.addColorStop(0, 'rgba(10,8,20,0.45)');
  g.addColorStop(1, 'rgba(10,8,20,0)');
  c.fillStyle = g;
  c.fillRect(0, top ? 0 : 1360, 1080, 560);
}
