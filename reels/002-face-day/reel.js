// Episode 1, "Face day" (script.md): Brody maxxes Fish Face like a deadlift, Rep is not impressed, Kayla shows the
// app's way (its real steps and 5-second hold), Brody tries it gently, end card. 19 s at 120 bpm, cut on the beat.
//   node reels/render.mjs reels/002-face-day --stills     (add --ffmpeg in a Claude Code cloud session)

import { bubble } from '/page/bubble.js';
import { brody } from '/page/cast/brody.js';
import { FACES } from '/page/cast/face.js';
import { kayla } from '/page/cast/kayla.js';
import { INK, grain, use } from '/page/cast/pen.js';
import { backdrop, confetti, rays, repStand, stand, sweat } from '/page/cast/stage.js';
import { RED, WHITE, background, button, clamp, easeBack, easeOut, flash, icon, pulse, slam, text, words } from '/page/draw.js';

const BEAT = 0.5;
const pop = (s, at, d = 0.25) => easeBack(clamp((s - at) / d));
const bob = (s) => 1 - 0.035 * pulse(s, BEAT); // squash on every beat
const BRODY_BG = ['#FFE2D4', '#FF9E8A'], KAYLA_BG = ['#F1E8FF', '#FFC4D9'];
const STRAIN = { eyes: 'squeeze', brows: 'angry', mouth: 'fish', suck: 1, blush: 3 };
const CALM_FISH = { eyes: 'happy', brows: 'up', mouth: 'fish', suck: 1 };
const RELAXED = { arms: { L: [-12, 10], R: [12, -10] }, hands: { L: 'fist', R: 'fist' }, tilt: 0 };
const STEPS = ['Suck your cheeks in between your teeth.', 'Pucker your lips like a fish.', 'Hold, then release and relax.'];

function caption(c, str, s, size = 78) {
  words(c, str, { y: 210, size, box: INK, pop: slam(s, 0.05), maxW: 980 });
}

function hook(c, s) {
  backdrop(c, BRODY_BG, s);
  words(c, 'GYM BRO TRIES', { y: 230, size: 116, color: INK, pop: slam(s, 0.05) });
  words(c, 'FACE WORKOUTS', { y: 380, size: 132, box: RED, pop: slam(s, 0.5) });
  const p = pulse(s, BEAT);
  const pose = { ...brody.pose, arms: { L: brody.pose.arms.L, R: [112, 70 + 14 * p] } };
  stand(c, brody, { x: 540, y: 1760, scale: 1.3 * easeBack(clamp(s / 0.35)), pose, sy: bob(s), t: s });
  bubble(c, "FACE DAY? I'LL MAX IT.", { x: 610, y: 650, size: 54, tail: [560, 800], pop: pop(s, 0.9) });
}

function tryHard(c, s) {
  backdrop(c, ['#FFD3C2', '#FF7A66'], s);
  rays(c, 400, 1050, s, 'rgba(255,255,255,0.18)');
  caption(c, "FISH FACE: BRODY'S WAY", s);
  const shake = 6 + 5 * pulse(s, BEAT);
  const pose = { arms: { L: [-100, -80], R: [100, 80] }, hands: { L: 'fist', R: 'fist' }, tilt: 0 };
  stand(c, brody, { x: 400, y: 1760, scale: 1.25, pose, face: STRAIN, shake, t: s, sy: bob(s) });
  if (s > 0.2) sweat(c, 400, 940, s, 150);
  c.save();
  c.translate(5 * Math.sin(s * 71), 4 * Math.cos(s * 53));
  bubble(c, 'ONE. MORE. REP!!!', { x: 470, y: 680, size: 64, tail: [430, 830], pop: pop(s, 0.3) });
  c.restore();
  const enter = easeOut(clamp((s - 1.6) / 0.35));
  if (enter > 0) repStand(c, { x: 1240 - 420 * enter, y: 1430, size: 210, eyes: 'flat', arms: 'point' });
  bubble(c, "IT'S NOT A DEADLIFT.", { x: 740, y: 1180, size: 46, tail: [800, 1290], pop: pop(s, 2.05) });
}

// The app's hold: a ring that fills in 5 s with the seconds left in the middle.
function holdRing(c, x, y, s, k) {
  if (k <= 0) return;
  c.save();
  c.translate(x, y);
  c.scale(k, k);
  c.beginPath();
  c.arc(0, 0, 165, 0, Math.PI * 2);
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.fill();
  c.lineWidth = 26;
  c.strokeStyle = 'rgba(43,29,46,0.1)';
  c.beginPath();
  c.arc(0, 0, 140, 0, Math.PI * 2);
  c.stroke();
  const g = c.createLinearGradient(-140, -140, 140, 140);
  g.addColorStop(0, '#FF6B2C');
  g.addColorStop(1, RED);
  c.strokeStyle = g;
  c.lineCap = 'round';
  c.beginPath();
  c.arc(0, 0, 140, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(s / 5, 0.001));
  c.stroke();
  c.restore();
  words(c, 'HOLD', { x, y: y - 82, size: 40, color: INK, pop: k });
  words(c, String(Math.max(1, 5 - Math.floor(s))), { x, y: y + 12, size: 130, color: INK, pop: k * (1 + 0.08 * pulse(s, 1)) });
}

function steps(c, s) {
  const k = easeOut(clamp((s - 0.5) / 0.3));
  if (k <= 0) return;
  c.save();
  c.globalAlpha = k;
  c.shadowColor = 'rgba(43,29,46,0.18)';
  c.shadowBlur = 40;
  c.shadowOffsetY = 14;
  c.beginPath();
  c.roundRect(50, 1335 + 40 * (1 - k), 980, 290, 44);
  c.fillStyle = 'rgba(255,255,255,0.94)';
  c.fill();
  c.restore();
  words(c, 'FISH FACE · THE STEPS IN THE APP', { y: 1385, size: 34, color: INK, pop: k, maxW: 900 });
  STEPS.forEach((str, i) => {
    const a = clamp((s - 0.8 - i * 0.5) / 0.25);
    if (a <= 0) return;
    const y = 1450 + i * 64;
    c.save();
    c.globalAlpha = a;
    c.beginPath();
    c.arc(112, y, 24, 0, Math.PI * 2);
    c.fillStyle = RED;
    c.fill();
    c.restore();
    words(c, String(i + 1), { x: 112, y, size: 30, pop: a });
    c.save();
    c.globalAlpha = a;
    c.font = '600 36px "Helvetica Neue", Arial, sans-serif';
    c.textBaseline = 'middle';
    c.fillStyle = INK;
    c.fillText(str, 156, y + 2);
    c.restore();
  });
}

function rightWay(c, s) {
  backdrop(c, KAYLA_BG, s);
  caption(c, 'FISH FACE: DONE RIGHT', s);
  const pose = { arms: { L: [-12, 10], R: [16, -142] }, tilt: 3 };
  stand(c, kayla, { x: 320, y: 1290, scale: 0.95, pose, face: CALM_FISH, tilt: 1.5 * Math.sin(s * 2), sy: bob(s), t: s });
  bubble(c, 'GENTLE. NO STRAIN.', { x: 390, y: 460, size: 50, tail: [350, 590], pop: pop(s, 0.4) });
  holdRing(c, 800, 820, s, easeBack(clamp((s - 0.2) / 0.3)));
  steps(c, s);
}

function again(c, s) {
  backdrop(c, ['#FFE9DE', '#E9D8FF'], s);
  caption(c, 'SAME EXERCISE. LESS DRAMA.', s, 72);
  const DONE = 2.15; // Kayla's "Told ya." (her voice clip starts here)
  const done = s >= DONE;
  stand(c, brody, { x: 320, y: 1640, scale: 1, pose: RELAXED, face: done ? FACES.star : { ...CALM_FISH, eyes: 'lid' }, sy: bob(s), t: s });
  const kPose = done ? kayla.pose : { arms: { L: [-12, 10], R: [16, -142] }, tilt: 3 };
  stand(c, kayla, { x: 770, y: 1640, scale: 0.95, pose: kPose, face: done ? FACES.wink : CALM_FISH, sy: bob(s), t: s });
  bubble(c, "OH… THAT'S ACTUALLY CHILL.", { x: 420, y: 760, size: 44, tail: [330, 880], pop: pop(s, 0.2) });
  bubble(c, 'TOLD YA.', { x: 830, y: 860, size: 48, tail: [790, 950], pop: pop(s, DONE) });
  confetti(c, 545, 1460, s - DONE);
  const hop = done ? Math.abs(Math.sin((s - DONE) * 6)) * 50 : 0;
  repStand(c, { x: 545, y: 1500 - hop, size: 150 * pop(s, 2.0), eyes: 'open', arms: done ? 'up' : 'down', legs: done ? 'jump' : 'stand' });
}

function end(c, s, img) {
  background(c, 'red');
  icon(c, img.icon, { x: 540, y: 760, size: 300 * easeBack(clamp(s / 0.4)) });
  words(c, 'FACEREP', { y: 1010, size: 130, pop: slam(s, 0.3) });
  if (s > 0.3) text(c, 'Face Yoga & Jawline', { y: 1105, size: 46, alpha: 0.92 });
  if (s > 0.6) text(c, 'Fish Face is free in the app', { y: 1170, size: 38, alpha: 0.8 });
  button(c, 'ON THE APP STORE', { y: 1330, w: 640, h: 124, pop: clamp((s - 0.9) / 0.3) });
  words(c, 'Follow for episode 2', { y: 1500, size: 40, color: WHITE, pop: slam(s, 1.6), alpha: 0.9 });
}

const SHOTS = [hook, tryHard, rightWay, again, end];
const START = [0, 3, 7.5, 12.5, 16];

export const REEL = {
  seconds: 19,
  bpm: 120,
  screens: [],
  stills: [1.6, 5.6, 11.1, 15, 18],
  // For page/sound.js: a hit on the first frame, a whoosh into each cut, a ding when Brody gets it, and the beat
  // stops on one last hit as the end card comes in.
  cues: { hits: [0], cuts: START.slice(1), dings: [14.65], end: 16 },
  // The voice clips (voice.json, made by reels/voice.mjs), each at its bubble.
  voice: [
    { id: 'brody-1', at: 0.9 }, { id: 'brody-2', at: 3.3 }, { id: 'rep-1', at: 5.05 },
    { id: 'kayla-1', at: 7.9 }, { id: 'brody-3', at: 12.7 }, { id: 'kayla-2', at: 14.65 },
  ],
  draw(c, t, img) {
    use(c);
    const i = START.findLastIndex((from) => t >= from);
    const s = t - START[i];
    const zoom = i > 0 ? 1 + 0.05 * (1 - clamp(s / 0.15)) : 1; // each cut punches in a little
    c.save();
    c.translate(540, 960);
    c.scale(zoom, zoom);
    c.translate(-540, -960);
    SHOTS[i](c, s, img);
    c.restore();
    if (i > 0) flash(c, s);
    grain(c, 0.05);
  },
};
