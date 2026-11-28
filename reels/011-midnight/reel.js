// "Midnight" (script.md), 29 s. 11:55 PM: Leo's 29 day streak ends at midnight and he forgot today's workout.
// Hand-painted anime pictures of Leo (art/, made in Figma from the same words for Leo as 010, see script.md) under a
// deadpan movie-trailer narrator; code adds the clock, the app's real reminder and workout screen, Rep, the words and
// the end card. 120 bpm, cut on the beat; the beat stops for the last squeeze (a clock ticks, a heart beats) and
// comes back on "STREAK SAVED". The narrator's take was cut by hand at its pauses (voice.mjs's cutter split lines 4
// to 7 in the wrong places); n-10 is reel 010's "Download FaceRep" clip, the same narrator, because this take said
// "Face-Rap".
//   node reels/render.mjs reels/011-midnight --stills

import { painting, shade } from '/page/art.js';
import { clock, notice, streak, vignette } from '/page/cast/hud.js';
import { grain, use } from '/page/cast/pen.js';
import { repStand } from '/page/cast/stage.js';
import { RED, WHITE, background, button, clamp, easeBack, easeOut, flash, icon, liftCircle, phone, shake, slam, text, words } from '/page/draw.js';

// When each narrator clip starts, and where words begin inside a clip (measured in the clips).
const V = { 1: 0.3, 2: 5.1, 3: 7.1, 4: 9.55, 5: 11.55, 6: 13.55, 7: 15.6, 8: 19.3, 9: 22.7, 10: 23.95 };
const THREE = V[7] + 0.84, TWO = V[7] + 1.69, ONE = V[7] + 2.5; // "Hold it... three... two... one..."
const HEARTS = [5.6, 6.2, 15.6, 16.15, 16.7, 17.25, 17.8, 18.35];

const pop = (t, at, d = 0.25) => easeBack(clamp((t - at) / d));
const beat = (t) => Math.max(0, ...HEARTS.map((h) => (t >= h ? Math.exp(-(t - h) / 0.15) : 0)));

// Every shot gets s (seconds since its cut) and t (seconds since the start).
function couch(c, s, img, t) {
  painting(c, img['01-couch'], { zoom: 1 + 0.1 * easeOut(clamp(s / 5)), fy: 0.36 });
  shade(c);
  clock(c, '11:55 PM', { y: 170, pop: slam(t, 0) });
  notice(c, img.icon, { y: 420, drop: clamp((t - 1) / 0.35), title: 'Time for your face workout', body: '5 minutes keeps your streak alive.' });
  streak(c, 29, { y: 600, pop: pop(t, V[1] + 2.7) });
}

function shock(c, s, img, t) {
  painting(c, img['02-shock'], { zoom: 1.04 + 0.05 * (s / 2), fy: 0.45 });
  vignette(c, '229,50,45', 0.35 * beat(t));
  shade(c, false);
  clock(c, '11:55 PM', { y: 170 });
  const at = V[2] + 0.45; // "forgot"
  words(c, 'HE FORGOT.', { y: 1530, size: 150, box: RED, pop: slam(t, at), shake: shake(t, at) });
}

function go(c, s, img, t) {
  painting(c, img['03-leap'], { zoom: 1.1 - 0.06 * easeOut(clamp(s / 0.4)), fy: 0.5 });
  shade(c);
  clock(c, '11:56 PM', { y: 170, pop: slam(t, 7) });
  words(c, '5 MINUTES.', { y: 340, size: 130, box: RED, pop: slam(t, V[3] + 0.05) });
  words(c, 'ONE CHANCE.', { y: 490, size: 96, pop: slam(t, V[3] + 1.03) });
}

// A punch in on the beat, the clock a minute later, the move's name (lower down when his head is high; never below
// y 1600, where Instagram's caption sits).
const exercise = (pic, time, name, cut, { fy = 0.4, low = false } = {}) => (c, s, img, t) => {
  painting(c, img[pic], { zoom: 1.1 - 0.07 * easeOut(clamp(s / 0.3)) + 0.02 * (s / 2), fy });
  shade(c);
  if (low) shade(c, false);
  clock(c, time, { y: 170, pop: slam(t, cut) });
  words(c, name, { y: low ? 1520 : 340, size: 130, box: RED, pop: slam(t, cut + 0.12) });
};

// The beat stops. His phone with the app's real Brow Lift screen; the clock ticks to 11:59:59 on the narrator's
// "three... two... one...", and on "one" the ring ("1 SQUEEZE") lifts out.
function last(c, s, img, t) {
  painting(c, img['06-brow-lift'], { zoom: 1.15, fy: 0.4, blur: 18, dark: 0.45 });
  vignette(c, '229,50,45', 0.25 + 0.4 * beat(t));
  const up = easeOut(clamp(s / 0.4));
  phone(c, img['workout-man'], { x: 540, y: 1130 + 900 * (1 - up), w: 560, rot: -0.03 * (1 - up) });
  liftCircle(c, img['workout-man'], { sx: 537, sy: 2036, sr: 170, x: 800, y: 1540, r: 170, pop: clamp((t - ONE) / 0.3) });
  const [sec, flip] = t < THREE ? [56, 15.5] : t < TWO ? [57, THREE] : t < ONE ? [58, TWO] : [59, ONE];
  clock(c, `11:59:${sec}`, { y: 210, size: 170, pop: slam(t, flip), shake: shake(t, flip) });
  words(c, 'HOLD IT...', { y: 390, size: 80, pop: slam(t, V[7] + 0.05) });
}

// His grin is near the top of this picture: the words go on his body, below the phone on his chest.
function saved(c, s, img, t) {
  painting(c, img['07-saved'], { zoom: 1.12 - 0.08 * easeOut(clamp(s / 0.5)), fy: 0.5 });
  shade(c);
  if (t < 19.9) clock(c, '11:59:59', { y: 170 });
  else clock(c, '12:00 AM', { y: 170, color: WHITE, glow: 'rgba(255,255,255,0.6)', pop: slam(t, 19.9) });
  words(c, 'STREAK SAVED.', { y: 1180, size: 130, box: RED, pop: slam(t, V[8] + 0.06) });
  streak(c, 30, { y: 1350, pop: pop(t, V[8] + 1.41) });
  repStand(c, { x: 190, y: 1690, size: 200 * pop(t, 21), eyes: 'open', arms: 'up' });
}

function end(c, s, img, t) {
  background(c, 'red');
  words(c, "DON'T BREAK YOURS.", { y: 230, size: 84, pop: slam(t, V[9] + 0.06) });
  words(c, 'DOWNLOAD', { y: 390, size: 110, pop: slam(t, V[10] + 0.06) });
  words(c, 'FACEREP', { y: 540, size: 150, color: RED, box: WHITE, pop: slam(t, V[10] + 0.5) });
  icon(c, img.icon, { x: 540, y: 870, size: 280 * pop(t, V[10]) });
  if (t > V[10] + 0.5) text(c, 'Face Yoga & Jawline', { y: 1075, size: 50, alpha: 0.92 });
  button(c, 'ON THE APP STORE', { y: 1260, w: 680, h: 130, pop: clamp((t - (V[10] + 1.61)) / 0.3) });
  words(c, 'FOLLOW FOR MORE', { y: 1450, size: 60, pop: slam(t, 26.7) });
  const hop = Math.abs(Math.sin(s * 2 * Math.PI)) * 40;
  repStand(c, { x: 540, y: 1735 - hop, size: 200 * pop(t, 22.8), eyes: 'open', arms: 'up', legs: 'jump' });
}

// Every cut is hard, on the beat, with a 5% zoom kick and a flash.
const SHOTS = [
  [0, couch], [5, shock], [7, go],
  [9.5, exercise('04-fish-face', '11:57 PM', 'FISH FACE', 9.5, { fy: 0.38 })],
  [11.5, exercise('05-chin-lift', '11:58 PM', 'CHIN LIFT', 11.5, { fy: 0.35, low: true })],
  [13.5, exercise('06-brow-lift', '11:59 PM', 'BROW LIFT', 13.5, { fy: 0.42 })],
  [15.5, last], [19, saved], [22.5, end],
];

export const REEL = {
  seconds: 29,
  bpm: 120,
  screens: ['workout-man'],
  art: ['01-couch', '02-shock', '03-leap', '04-fish-face', '05-chin-lift', '06-brow-lift', '07-saved'],
  stills: [4.2, 6.2, 8.6, 10.6, 12.6, 14.6, 18.4, 21.3, 26.9],
  // For page/sound.js: hits on the first frame, "HE FORGOT", "STREAK SAVED" and the end card; a whoosh into each
  // cut; a ding for the reminder and the ring; no beat for the last squeeze, only ticks and a heartbeat.
  cues: {
    hits: [0, 5, 19, 22.5],
    cuts: SHOTS.slice(1).map(([at]) => at),
    dings: [1, ONE + 0.05],
    ticks: [15.55, THREE, TWO, ONE],
    hearts: HEARTS,
    quiet: [[15.5, 19]],
    end: 27,
  },
  voice: Object.entries(V).map(([n, at]) => ({ id: `n-${n}`, at })),
  draw(c, t, img) {
    use(c);
    const i = SHOTS.findLastIndex(([at]) => t >= at), s = t - SHOTS[i][0];
    const zoom = i === 0 ? 1 : 1 + 0.05 * (1 - clamp(s / 0.15));
    c.save();
    c.translate(540, 960);
    c.scale(zoom, zoom);
    c.translate(-540, -960);
    SHOTS[i][1](c, s, img, t);
    c.restore();
    if (i > 0) flash(c, s);
    grain(c, 0.035);
  },
};
