// "Looksmax arc" (script.md), 33 s: day-1 Brody at 2 am, a hand swipes to day 30 on the beat drop (3 s),
// then how it went: the night he quit at rep 3, the arc days, day 12 when he almost quit, the steady hold on day 30,
// Kayla's double take, the end card. 120 bpm, cut on the beat. His face's shape is the same in every shot. His looks
// are in page/cast/brody-arc.js, the rooms in room.js, the props in arc-props.js.
//   node reels/render.mjs reels/004-day-30 --stills     (add --ffmpeg in a Claude Code cloud session)

import { bubble } from '/page/bubble.js';
import { checklist, chipsHold, couchBack, couchFront, holdRing, repSign, swipeHand } from '/page/cast/arc-props.js';
import { ARC, brodyDay1, brodyDay30, brodyMid } from '/page/cast/brody-arc.js';
import { FACES } from '/page/cast/face.js';
import { kayla } from '/page/cast/kayla.js';
import { INK, grain, use } from '/page/cast/pen.js';
import { badge, bottle, clippers, faceWash, glow, moonClock, morning, night, sparkles } from '/page/cast/room.js';
import { backdrop, confetti, rays, repStand, stand, sweat } from '/page/cast/stage.js';
import { RED, WHITE, background, button, clamp, easeBack, easeOut, flash, pulse, slam, text, words } from '/page/draw.js';

const BEAT = 0.5, DROP = 3, SWIPE = 0.4;
const pop = (s, at, d = 0.25) => easeBack(clamp((s - at) / d));
const bob = (s) => 1 - 0.035 * pulse(s, BEAT);
const SLOUCH = { arms: { L: [-6, 4], R: [22, 188] }, hands: { L: 'open' }, tilt: 8 };
const EASY = { arms: { L: [-12, 10], R: [12, -10] }, hands: { L: 'fist', R: 'fist' }, tilt: 0 };
const FLOP = { arms: { L: [-70, 20], R: [70, -20] }, hands: { L: 'open', R: 'open' }, tilt: -10 };
const SIT = { arms: { L: [-8, 6], R: [20, -120] }, hands: { L: 'open' }, tilt: 6 };
const SHRUG = { arms: { L: [-30, -110], R: [30, 110] }, hands: { L: 'open', R: 'open' }, tilt: -5 };
const noPhone = { ...brodyDay1, holds: undefined };
const ITEMS = ['FACE REPS', 'WATER', 'SLEEP', 'SKINCARE', 'FRESH CUT'];
const DAYS = {
  4: { from: 1, label: 'FISH FACE', habit: '+ WATER', spec: noPhone, face: ARC.fish, prop: bottle, done: 2, bg: ['#ECE6FF', '#BFB4F2'] },
  9: { from: 4, label: 'CHEEK LIFT', habit: '+ LIGHTS OUT AT 11', spec: noPhone, face: FACES.cheekLift, prop: moonClock, done: 3, bg: ['#E5EEFF', '#B5D0FF'] },
  16: { from: 12, label: 'CHIN LIFT', habit: '+ FACE WASH', spec: brodyMid, face: ARC.chinLift, prop: faceWash, done: 4, bg: ['#E6FFF0', '#B4EBCB'] },
  23: { from: 16, label: 'FACE REPS', habit: '+ FRESH CUT', spec: brodyDay30, face: FACES.star, prop: clippers, done: 5, bg: ['#FFF1DE', '#FFC59A'] },
};

function day1(c, s) {
  night(c, s);
  words(c, 'DAY 1 OF MY', { y: 230, size: 110, pop: slam(s, 0.05) });
  words(c, 'LOOKSMAX ARC', { y: 375, size: 130, box: RED, pop: slam(s, 0.5) });
  stand(c, brodyDay1, { x: 560, y: 1730, scale: 1.25, pose: SLOUCH, face: ARC.tired, tilt: 4, sy: 0.97 * bob(s), t: s });
  glow(c, 660, 1190, s);
}

function day30(c, s) {
  morning(c, s);
  rays(c, 540, 1100, s, 'rgba(255,255,255,0.22)');
  sparkles(c, 540, 1180, s);
  const wave = { arms: { L: [-40, 96], R: [125, 35 + 20 * Math.sin(s * 9)] }, hands: { L: 'fist', R: 'peace' }, tilt: -3 };
  stand(c, brodyDay30, { x: 540, y: 1730, scale: 1.25, pose: wave, face: ARC.proud, sy: bob(s), t: s });
  words(c, 'DAY 30', { y: 250, size: 180, box: RED, pop: slam(s, SWIPE) });
  badge(c, 540, 440, pop(s, 1));
  bubble(c, 'FIVE MINUTES A DAY.', { x: 600, y: 610, size: 54, tail: [580, 730], pop: pop(s, 1.3) });
  const hop = Math.abs(Math.sin(s * 2 * Math.PI)) * 40;
  repStand(c, { x: 900, y: 1500 - hop, size: 190 * pop(s, 1.7), eyes: 'open', arms: 'up', legs: 'jump' });
}

// On the drop a hand sweeps across and day 30 shows behind it. s: seconds since the drop.
function reveal(c, s) {
  if (s >= SWIPE) return day30(c, s);
  const x = 1080 - 1300 * easeOut(s / SWIPE);
  day1(c, s + DROP);
  c.save();
  c.beginPath();
  c.rect(x + 150, 0, 2400, 1920);
  c.clip();
  day30(c, s);
  c.restore();
  swipeHand(x);
}

// Day 1, how it started: Rep pops out of the phone, Brody tries Chin Lift, shakes, and flops at rep 3.
function howItStarted(c, s) {
  night(c, s);
  words(c, 'HOW IT STARTED', { y: 230, size: 110, pop: slam(s, 0.05) });
  words(c, 'DAY 1', { y: 375, size: 100, box: RED, pop: slam(s, 0.3) });
  const quit = s >= 2.4;
  if (s < 0.9) {
    const face = s < 0.4 ? ARC.tired : { ...ARC.tired, eyes: 'wide', mouth: 'o' };
    stand(c, brodyDay1, { x: 400, y: 1760, scale: 1.2, pose: SLOUCH, face, tilt: 4, sy: bob(s), t: s });
    glow(c, 496, 1242, s);
  } else if (!quit) {
    stand(c, noPhone, { x: 400, y: 1760, scale: 1.2, pose: EASY, face: { ...ARC.chinLift, brows: 'worried' }, shake: 9, sy: bob(s), t: s });
    sweat(c, 400, 1060, s, 145);
  } else {
    stand(c, noPhone, { x: 460, y: 1760, scale: 1.2, pose: FLOP, face: { eyes: 'closed', brows: 'worried', mouth: 'o' }, tilt: -12, sy: 0.94, t: s });
  }
  const k = clamp((s - 0.35) / 0.35);
  if (k > 0) {
    const out = easeOut(k);
    repStand(c, { x: 496 + 304 * out, y: 1242 - 202 * out, size: 230 * easeBack(k), eyes: quit ? 'flat' : 'open', arms: s < 0.9 ? 'up' : 'down' });
  }
  const n = s >= 2 ? 3 : s >= 1.5 ? 2 : s >= 1 ? 1 : 0;
  if (quit) words(c, 'QUIT AT REP 3', { x: 740, y: 1520, size: 80, box: RED, pop: slam(s, 2.4) });
  else if (n) words(c, `REP ${n}/10`, { x: 740, y: 1440, size: 80, color: INK, box: WHITE, pop: slam(s, [1, 1.5, 2][n - 1]) });
  bubble(c, 'BRO.', { x: 820, y: 800, size: 62, tail: [805, 900], pop: pop(s, 2.7) });
}

function arcDay(c, s, day) {
  const d = DAYS[day];
  backdrop(c, d.bg, s);
  const n = Math.round(d.from + (day - d.from) * easeOut(clamp(s / 0.2)));
  words(c, `DAY ${n}`, { y: 270, size: 170, color: INK, pop: slam(s, 0) });
  words(c, d.label, { y: 430, size: 70, box: RED, pop: slam(s, 0.05) });
  words(c, d.habit, { y: 535, size: 56, color: INK, pop: slam(s, BEAT) });
  stand(c, d.spec, { x: 320, y: 1790, scale: 1.32, pose: EASY, face: d.face, sy: bob(s), t: s });
  d.prop(c, 830, 830, pop(s, BEAT));
  checklist(c, ITEMS, d.done, s, BEAT);
}

// Day 12: sunk in the couch with chips; Rep holds up 5:00; "Ugh. Fine." and he gets up.
function almostQuit(c, s) {
  backdrop(c, ['#2E2752', '#6E52A3'], s);
  const n = Math.round(9 + 3 * easeOut(clamp(s / 0.2)));
  words(c, `DAY ${n}`, { y: 270, size: 170, pop: slam(s, 0) });
  words(c, 'ALMOST QUIT', { y: 430, size: 80, box: RED, pop: slam(s, 0.05) });
  const SEAT = 1560, up = s >= 2.45;
  couchBack(SEAT);
  if (!up) {
    const face = s < 0.9 ? ARC.tired : { eyes: 'lid', brows: 'angry', mouth: 'flat', look: [0.7, -0.2] };
    stand(c, { ...noPhone, holds: chipsHold }, { x: 420, y: 1900, scale: 1.15, pose: SIT, face, sy: 0.96 * bob(s), t: s });
  }
  couchFront(SEAT);
  if (up) {
    const hop = 120 * Math.sin(Math.PI * clamp((s - 2.45) / 0.3));
    stand(c, noPhone, { x: 400, y: 1820 - hop, scale: 1.15, pose: EASY, face: { eyes: 'open', brows: 'angry', mouth: 'smirk' }, sy: bob(s), t: s });
  }
  repSign(c, { x: 1250 - 430 * easeOut(clamp((s - 0.5) / 0.3)), y: 1380, size: 240 });
  bubble(c, 'UGH. FINE.', { x: 360, y: 820, size: 60, tail: [410, 960], pop: pop(s, 1.0) });
}

// Day 30: Chin Lift held steady, the hold ring counting down (sped up: 5 s in 2.5 s), then confetti.
function hold(c, s) {
  morning(c, s);
  rays(c, 330, 1150, s, 'rgba(255,255,255,0.2)');
  words(c, 'DAY 30', { y: 250, size: 150, color: INK, pop: slam(s, 0.05) });
  words(c, 'CHIN LIFT', { y: 400, size: 80, box: RED, pop: slam(s, 0.2) });
  const done = s >= 2.7;
  stand(c, brodyDay30, { x: 330, y: 1780, scale: 1.2, pose: EASY, face: done ? ARC.proud : ARC.chinLift, sy: bob(s), t: s });
  holdRing(c, 790, 1010, s - 0.2, easeBack(clamp((s - 0.1) / 0.3)), 2.5);
  words(c, 'REP 10/10', { x: 790, y: 1260, size: 64, color: INK, pop: slam(s, 0.3) });
  bubble(c, 'TEN FOR TEN. NO SHAKING.', { x: 540, y: 660, size: 46, tail: [370, 850], pop: pop(s, 0.6) });
  confetti(c, 790, 1010, s - 2.7);
}

// Kayla walks past, stops, backs up: "Wait… did you glow up?" Brody shrugs, then Rep keeps count.
function doubleTake(c, s) {
  backdrop(c, ['#FFF0E4', '#FFC2D6'], s);
  words(c, 'THE DOUBLE TAKE', { y: 210, size: 80, box: INK, pop: slam(s, 1.25) });
  const talk = s >= 4 && s < 6.6;
  stand(c, brodyDay30, { x: 770, y: 1720, scale: 1, pose: talk ? SHRUG : EASY, face: s < 4 ? FACES.smile : FACES.smirk, sy: bob(s), t: s });
  const walk = s < 1, w = Math.sin(s * 14);
  const x = walk ? 1400 - 1750 * clamp((s - 0.1) / 0.9) : -350 + 640 * easeOut(clamp((s - 1) / 0.3));
  const face = walk ? { ...FACES.smile, look: [-0.7, 0] } : s < 2.3 ? { ...FACES.hype, look: [0.8, -0.1] } : { ...FACES.grin, look: [0.7, 0] };
  const pose = { arms: { L: walk ? [-10 + 14 * w, 8] : [-70, -40], R: [16, -142] }, hands: { L: walk ? 'open' : 'spread' }, tilt: walk ? 3 * w : -4 };
  stand(c, kayla, { x, y: 1745 - (walk ? 20 * Math.abs(w) : 0), scale: 0.95, pose, face, sy: walk ? 1 : bob(s), t: s });
  bubble(c, 'WAIT… DID YOU GLOW UP?', { x: 370, y: 800, size: 48, tail: [300, 1000], pop: pop(s, 1.25) });
  bubble(c, 'I SLEEP NOW. AND I DO MY FACE REPS.', { x: 620, y: 560, size: 40, tail: [770, 950], pop: pop(s, 4) });
  repStand(c, { x: 530, y: 1600, size: 170 * pop(s, 6.2), eyes: 'flat', arms: 'down' });
  bubble(c, 'DAY 31.', { x: 530, y: 1390, size: 50, tail: [530, 1490], pop: pop(s, 6.45) });
}

function end(c, s) {
  background(c, 'red');
  words(c, 'IT STARTED WITH', { y: 330, size: 90, pop: slam(s, 0.05) });
  words(c, '5 MINUTES A DAY', { y: 470, size: 116, color: RED, box: WHITE, pop: slam(s, 0.3) });
  const hop = Math.abs(Math.sin(s * 2 * Math.PI)) * 60;
  repStand(c, { x: 540, y: 900 - hop, size: 300 * pop(s, 0.1), eyes: 'open', arms: 'up', legs: 'jump' });
  words(c, 'FACEREP', { y: 1290, size: 120, pop: slam(s, 0.5) });
  if (s > 0.5) text(c, 'Face Yoga & Jawline', { y: 1385, size: 46, alpha: 0.92 });
  button(c, 'ON THE APP STORE', { y: 1600, w: 640, h: 124, pop: clamp((s - 0.8) / 0.3) });
  words(c, 'FOLLOW FOR MORE', { y: 1775, size: 56, pop: slam(s, 2.5) });
}

const day = (n) => (c, s) => arcDay(c, s, n);
const SHOTS = [[0, day1], [DROP, reveal], [6, howItStarted], [9.5, day(4)], [10.5, day(9)], [11.5, almostQuit],
  [14.5, day(16)], [15.5, day(23)], [16.5, hold], [20, doubleTake], [29, end]];
const END = 29;

export const REEL = {
  seconds: 33,
  bpm: 120,
  screens: [],
  stills: [1.5, 3.2, 5.2, 6.6, 7.6, 8.9, 10.7, 12.9, 14.3, 15.9, 18.0, 19.6, 20.5, 21.5, 25.0, 27.5, 32],
  // For page/sound.js: hits on the first frame, the drop, the flop and the double take; a whoosh into each cut; a
  // ding for the streak badge and the finished hold; the beat stops on "FOLLOW FOR MORE".
  cues: { hits: [0, DROP, 8.4, 21.25], cuts: SHOTS.slice(1).map(([at]) => at), dings: [DROP + 1, 19.2], end: END + 2.5 },
  // The voice clips (voice.json, made by reels/voice.mjs), each at its bubble.
  voice: [
    { id: 'brody-1', at: 0.3 }, { id: 'brody-2', at: DROP + 1.3 }, { id: 'rep-1', at: 8.7 }, { id: 'brody-3', at: 12.5 },
    { id: 'brody-4', at: 17.1 }, { id: 'kayla-1', at: 21.25 }, { id: 'brody-5', at: 24 }, { id: 'rep-2', at: 26.45 },
  ],
  draw(c, t) {
    use(c);
    const i = SHOTS.findLastIndex(([at]) => t >= at), s = t - SHOTS[i][0];
    // the hook pushes in slowly; every later cut punches in a little
    const zoom = i === 0 ? 1 + 0.05 * clamp(t / DROP) : i > 1 ? 1 + 0.05 * (1 - clamp(s / 0.15)) : 1;
    c.save();
    c.translate(540, 960);
    c.scale(zoom, zoom);
    c.translate(-540, -960);
    SHOTS[i][1](c, s);
    c.restore();
    if (i > 1) flash(c, s);
    grain(c, 0.05);
  },
};
