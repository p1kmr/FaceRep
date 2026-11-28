// "Looksmax arc" (script.md), 33 s, the bust style (reels/page/bust): day-1 Brody at 6:58 am, round and
// chubby; on the beat drop (3 s) day 1 swipes away to day 30, his jaw angled. Then how it went: the night he quit at
// rep 3, the arc days (his face a little more defined each time), day 12 when he almost quit, the steady hold on
// day 30, Kayla's double take, the end card. 120 bpm, cut on the beat. reel-chibi.js is the earlier chibi version.
//   node reels/render.mjs reels/004-day-30 --stills     (add --ffmpeg in a Claude Code cloud session)

import { bubble } from '/page/bubble.js';
import { checklist, couchBack, couchFront, holdRing, repSign } from '/page/cast/arc-props.js';
import { INK, grain, use } from '/page/cast/pen.js';
import { badge, bottle, clippers, faceWash, glow, moonClock, morning, night, sparkles } from '/page/cast/room.js';
import { dawn } from '/page/cast/dawn.js';
import { backdrop, confetti, rays, repStand, sweat } from '/page/cast/stage.js';
import { brody, kayla } from '/page/bust/people.js';
import { RED, WHITE, background, button, clamp, easeBack, easeOut, flash, pulse, slam, text, words } from '/page/draw.js';

const BEAT = 0.5, DROP = 3, SWIPE = 0.4;
const pop = (s, at, d = 0.25) => easeBack(clamp((s - at) / d));
const bob = (s) => 8 * pulse(s, BEAT);
const kOf = (day) => (day - 1) / 29;
const ME = { x: 540, y: 1100, s: 2.1 };
const DAY1 = { k: 0, clothes: 'hoodie' }, DAY30 = { k: 1, clothes: 'tee' };
const TIRED = { lid: 0.45, look: [0.2, 0.6], brows: 'worried', mouth: 'flat', bags: 1 };
const PROUD = { lid: 0.15, look: [0.1, 0], brows: 'cocky', mouth: 'smirk' };
const ITEMS = ['FACE REPS', 'WATER', 'SLEEP', 'SKINCARE', 'FRESH CUT'];
const DAYS = {
  4: { from: 1, label: 'FISH FACE', habit: '+ WATER', prop: bottle, done: 2, bg: ['#ECE6FF', '#BFB4F2'], wear: 'hoodie', face: { exercise: 'fish' } },
  9: { from: 4, label: 'CHEEK LIFT', habit: '+ LIGHTS OUT AT 11', prop: moonClock, done: 3, bg: ['#E5EEFF', '#B5D0FF'], wear: 'hoodie', face: { exercise: 'cheek' } },
  16: { from: 12, label: 'CHIN LIFT', habit: '+ FACE WASH', prop: faceWash, done: 4, bg: ['#E6FFF0', '#B4EBCB'], wear: 'tee', face: { exercise: 'chin' } },
  23: { from: 16, label: 'FACE REPS', habit: '+ FRESH CUT', prop: clippers, done: 5, bg: ['#FFF1DE', '#FFC59A'], wear: 'tee', face: { mouth: 'grin', brows: 'up' } },
};

function day1(c, s) {
  dawn(c);
  words(c, 'DAY 1 OF MY', { y: 230, size: 110, pop: slam(s, 0.05) });
  words(c, 'LOOKSMAX ARC', { y: 375, size: 130, box: RED, pop: slam(s, 0.5) });
  brody(c, { ...ME, y: ME.y + bob(s), ...DAY1, hand: 'phone', face: TIRED, tilt: 3 });
  glow(c, 720, 1500, s);
}

function day30(c, s) {
  morning(c, s);
  rays(c, 540, 1000, s, 'rgba(255,255,255,0.22)');
  sparkles(c, 540, 980, s, 400);
  brody(c, { ...ME, y: ME.y + bob(s), ...DAY30, face: PROUD, ting: s > 1.6 });
  words(c, 'DAY 30', { y: 220, size: 170, box: RED, pop: slam(s, SWIPE) });
  badge(c, 540, 400, pop(s, 1));
  bubble(c, 'FIVE MINUTES A DAY.', { x: 300, y: 1560, size: 52, tail: [440, 1360], pop: pop(s, 1.3) });
  const hop = Math.abs(Math.sin(s * 2 * Math.PI)) * 40;
  repStand(c, { x: 900, y: 1560 - hop, size: 190 * pop(s, 1.7), eyes: 'open', arms: 'up', legs: 'jump' });
}

// On the drop day 1 slides away to the left and day 30 slides in, a white streak between. s: seconds since the drop.
function reveal(c, s) {
  if (s >= SWIPE) return day30(c, s);
  const e = easeOut(s / SWIPE);
  c.save();
  c.translate(-1080 * e, 0);
  day1(c, s + DROP);
  c.restore();
  c.save();
  c.translate(1080 * (1 - e), 0);
  day30(c, s);
  c.restore();
  c.fillStyle = WHITE;
  for (const [y, h, d] of [[300, 18, 0], [760, 30, 60], [1180, 14, 20], [1500, 26, 90], [1760, 16, 40]]) {
    c.globalAlpha = 0.8 * (1 - e);
    c.fillRect(1080 * (1 - e) - 420 + d, y, 380, h);
  }
  c.globalAlpha = 1;
}

// Day 1, how it started: Rep pops out of the phone, Brody tries Chin Lift, shakes, and flops at rep 3.
function howItStarted(c, s) {
  dawn(c);
  words(c, 'HOW IT STARTED', { y: 230, size: 110, pop: slam(s, 0.05) });
  words(c, 'DAY 1', { y: 375, size: 100, box: RED, pop: slam(s, 0.3) });
  const quit = s >= 2.4;
  if (s < 0.9) {
    const face = s < 0.4 ? TIRED : { kind: 'wide', mouth: 'o', brows: 'up', look: [0.7, 0.4] };
    brody(c, { ...ME, y: ME.y + bob(s), ...DAY1, hand: 'phone', face, tilt: 3 });
    glow(c, 720, 1500, s);
  } else if (!quit) {
    brody(c, { ...ME, ...DAY1, face: { exercise: 'chin', brows: 'worried' }, shake: 7, t: s });
    sweat(c, 540, 980, s, 230);
  } else {
    const drop = 150 * easeOut(clamp((s - 2.4) / 0.25));
    brody(c, { ...ME, y: ME.y + drop, ...DAY1, tilt: -9, face: { kind: 'closed', mouth: 'o', brows: 'worried' } });
  }
  const k = clamp((s - 0.35) / 0.35);
  if (k > 0) {
    const out = easeOut(k);
    repStand(c, { x: 855 + 25 * out, y: 1688 - 360 * out, size: 220 * easeBack(k), eyes: quit ? 'flat' : 'open', arms: s < 0.9 ? 'up' : 'down' });
  }
  const n = s >= 2 ? 3 : s >= 1.5 ? 2 : s >= 1 ? 1 : 0;
  if (quit) words(c, 'QUIT AT REP 3', { y: 480, size: 72, box: RED, pop: slam(s, 2.4) });
  else if (n) words(c, `REP ${n}/10`, { y: 480, size: 72, color: INK, box: WHITE, pop: slam(s, [1, 1.5, 2][n - 1]) });
  bubble(c, 'BRO.', { x: 880, y: 1110, size: 62, tail: [880, 1210], pop: pop(s, 2.7) });
}

function arcDay(c, s, day) {
  const d = DAYS[day];
  backdrop(c, d.bg, s);
  const n = Math.round(d.from + (day - d.from) * easeOut(clamp(s / 0.2)));
  words(c, `DAY ${n}`, { y: 270, size: 170, color: INK, pop: slam(s, 0) });
  words(c, d.label, { y: 430, size: 70, box: RED, pop: slam(s, 0.05) });
  words(c, d.habit, { y: 535, size: 56, color: INK, pop: slam(s, BEAT) });
  brody(c, { x: 330, y: 1160 + bob(s), s: 1.9, k: kOf(day), clothes: d.wear, face: d.face });
  d.prop(c, 880, 820, pop(s, BEAT));
  checklist(c, ITEMS, d.done, s, BEAT);
}

// Day 12: sunk in the couch with chips; Rep holds up 5:00; "Ugh. Fine." and he gets up.
function almostQuit(c, s) {
  backdrop(c, ['#2E2752', '#6E52A3'], s);
  const n = Math.round(9 + 3 * easeOut(clamp(s / 0.2)));
  words(c, `DAY ${n}`, { y: 270, size: 170, pop: slam(s, 0) });
  words(c, 'ALMOST QUIT', { y: 430, size: 80, box: RED, pop: slam(s, 0.05) });
  const SEAT = 1560, up = s >= 2.45, k = clamp((s - 2.45) / 0.3);
  const rise = up ? 260 * easeOut(k) + 90 * Math.sin(Math.PI * k) : 0;
  couchBack(SEAT);
  const face = up ? { brows: 'angry', mouth: 'smirk', look: [0.3, 0] }
    : s < 0.9 ? TIRED : { lid: 0.35, brows: 'angry', mouth: 'flat', look: [0.8, -0.1] };
  brody(c, { x: 420, y: 1250 - rise + (up ? 0 : bob(s)), s: 1.9, k: kOf(12), clothes: 'hoodie', tilt: up ? 0 : 6,
    hand: up ? null : 'chips', handAt: [-110, 120], face });
  couchFront(SEAT);
  repSign(c, { x: 1250 - 430 * easeOut(clamp((s - 0.5) / 0.3)), y: 1380, size: 240 });
  bubble(c, 'UGH. FINE.', { x: 380, y: 760, size: 60, tail: [440, 880], pop: pop(s, 1.0) });
}

// Day 30: Chin Lift held steady, the hold ring counting down (sped up: 5 s in 2.5 s), then confetti.
function hold(c, s) {
  morning(c, s);
  rays(c, 330, 1150, s, 'rgba(255,255,255,0.2)');
  words(c, 'DAY 30', { y: 250, size: 150, color: INK, pop: slam(s, 0.05) });
  words(c, 'CHIN LIFT', { y: 400, size: 80, box: RED, pop: slam(s, 0.2) });
  const done = s >= 2.7;
  brody(c, { x: 330, y: 1160 + bob(s), s: 1.9, ...DAY30, face: done ? PROUD : { exercise: 'chin' }, ting: done });
  holdRing(c, 800, 1000, s - 0.2, easeBack(clamp((s - 0.1) / 0.3)), 2.5);
  words(c, 'REP 10/10', { x: 800, y: 1260, size: 64, color: INK, pop: slam(s, 0.3) });
  bubble(c, 'TEN FOR TEN. NO SHAKING.', { x: 700, y: 1480, size: 44, tail: [520, 1330], pop: pop(s, 0.6) });
  confetti(c, 800, 1000, s - 2.7);
}

// Kayla walks past, stops, backs up: "Wait… did you glow up?" Brody shrugs, then Rep keeps count.
function doubleTake(c, s) {
  backdrop(c, ['#FFF0E4', '#FFC2D6'], s);
  words(c, 'THE DOUBLE TAKE', { y: 210, size: 80, box: INK, pop: slam(s, 1.25) });
  const talk = s >= 4 && s < 6.6, shrug = talk ? Math.sin(Math.PI * clamp((s - 4) / 2.6)) : 0;
  brody(c, { x: 760, y: 1180 + bob(s), s: 1.6, ...DAY30, shrug,
    face: s < 4 ? { mouth: 'smile', look: [-0.6, 0] } : { mouth: 'smirk', brows: 'cocky', lid: 0.15, look: [-0.5, 0] } });
  const walk = s < 1, w = Math.sin(s * 14);
  const x = walk ? 1400 - 1750 * clamp((s - 0.1) / 0.9) : -350 + 640 * easeOut(clamp((s - 1) / 0.3));
  const face = walk ? { mouth: 'smile', look: [-0.8, 0] } : s < 2.3 ? { kind: 'wide', mouth: 'o', brows: 'up', look: [0.8, 0] }
    : { mouth: 'grin', brows: 'up', look: [0.7, 0] };
  kayla(c, { x, y: 1200 - (walk ? 10 * Math.abs(w) : 0), s: 1.55, tilt: walk ? 2 * w : -3, swing: walk ? 10 * w : 0, face });
  bubble(c, 'WAIT… DID YOU GLOW UP?', { x: 330, y: 660, size: 48, tail: [300, 850], pop: pop(s, 1.25) });
  bubble(c, 'I SLEEP NOW. AND I DO MY FACE REPS.', { x: 600, y: 540, size: 40, tail: [760, 830], pop: pop(s, 4) });
  repStand(c, { x: 540, y: 1720, size: 190 * pop(s, 6.2), eyes: 'flat', arms: 'down' });
  bubble(c, 'DAY 31.', { x: 540, y: 1530, size: 50, tail: [540, 1620], pop: pop(s, 6.45) });
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
  stills: [1.5, 3.2, 5.2, 6.6, 7.6, 8.9, 10.0, 11.0, 12.9, 14.3, 15.0, 16.0, 18.0, 19.6, 20.5, 21.5, 25.0, 27.5, 32],
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
