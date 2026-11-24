// FaceRep reel 001, "looksmaxxing, but make it a workout" (script.md): 10 s, 1080 x 1920, cut on a 128 BPM beat.
// Each shot draws itself from its own start, in seconds (s). Screens: the store's Simulator screenshots (English).

import {
  INK, RED, WHITE, background, button, clamp, easeBack, flash, icon, liftCard, liftCircle, phone, pulse, shake, slam,
  text, words,
} from '/page/draw.js';

const BPM = 128;
const B = 60 / BPM; // one beat: 0.469 s
const at = (beats) => beats * B;

function hook(c, s, img) {
  background(c, 'dark', 1 + 0.3 * pulse(s, B));
  const rise = easeBack(clamp(s / 0.45)); // starts half in view, so the first frame (the cover) shows the app
  phone(c, img['exercise-man'], { x: 540, y: 1900 - 480 * rise, w: 600, rot: -0.08 + 0.02 * rise });
  words(c, 'LOOKSMAXXING', { y: 300, size: 160, maxW: 860, pop: slam(s, 0), shake: shake(s, 0) });
  words(c, 'BUT MAKE IT A', { y: 455, size: 84, alpha: 0.9, pop: slam(s, at(1)) });
  words(c, 'WORKOUT', { y: 595, size: 150, box: RED, pop: slam(s, at(2)), shake: shake(s, at(2)) });
}

function muscle(c, s, img) {
  background(c, 'red');
  phone(c, img['exercise-man'], { x: 470, y: 1420, w: 600, rot: -0.06, scale: 1 + 0.05 * (s / at(4)) });
  liftCircle(c, img['exercise-man'], { sx: 657, sy: 1330, sr: 330, x: 775, y: 1060, r: 250, pop: clamp((s - at(0.5)) / 0.3) });
  words(c, 'SEE THE MUSCLE', { y: 290, size: 120, pop: slam(s, 0) });
  words(c, 'YOU TRAIN', { y: 440, size: 160, color: INK, pop: slam(s, at(1)), shake: shake(s, at(1)) });
}

const REPS = [
  ['SQUEEZE', WHITE, null],
  ['HOLD', RED, null],
  ['RELAX', WHITE, null],
  ['REPEAT', WHITE, RED],
];

function reps(c, s, img) {
  background(c, 'dark', 1 + 0.4 * pulse(s, B));
  phone(c, img['workout-man'], { x: 590, y: 1440, w: 600, rot: 0.06 });
  const k = Math.min(REPS.length - 1, Math.floor(s / B));
  const [word, color, box] = REPS[k];
  words(c, word, { y: 380, size: 210, color, box, pop: slam(s, at(k)), shake: shake(s, at(k)) });
  const r = 185 * (1 + 0.05 * pulse(s, B));
  liftCircle(c, img['workout-man'], { sx: 657, sy: 2499, sr: 205, x: 250, y: 1250, r, pop: clamp((s - at(0.25)) / 0.3) });
}

function streak(c, s, img) {
  background(c, 'red');
  phone(c, img.progress, { x: 540, y: 1460, w: 600, rot: -0.05 });
  const card = { sx: 49, sy: 384, sw: 1222, sh: 328, x: 540, y: 1045, w: 900, rot: 0.03 }; // over its own place
  liftCard(c, img.progress, { ...card, pop: clamp((s - at(0.5)) / 0.3) });
  words(c, "DON'T BREAK", { y: 290, size: 130, pop: slam(s, 0) });
  words(c, 'THE STREAK', { y: 445, size: 170, color: INK, pop: slam(s, at(1)), shake: shake(s, at(1)) });
}

function end(c, s, img) {
  background(c, 'dark', 1.3 + 0.3 * pulse(s, B));
  words(c, 'YOUR FACE', { y: 290, size: 130, pop: slam(s, 0) });
  words(c, 'HAS A GYM NOW', { y: 440, size: 120, box: RED, pop: slam(s, at(1)), shake: shake(s, at(1)) });
  const last = s >= at(4) ? Math.exp(-(s - at(4)) / 0.12) : 0; // the last hit of the beat
  icon(c, img.icon, { x: 540, y: 820, size: 340 * easeBack(clamp((s - at(0.5)) / 0.4)) * (1 + 0.05 * last) });
  words(c, 'FACEREP', { y: 1095, size: 120, pop: slam(s, at(2)) });
  if (s >= at(2)) text(c, 'Lips, Cheeks & Mewing Workouts', { y: 1180, size: 42, alpha: 0.85 });
  button(c, 'ON THE APP STORE', { y: 1340, w: 640, h: 124, pop: clamp((s - at(3)) / 0.3) });
}

const SHOTS = [hook, muscle, reps, streak, end]; // 4 beats each; the last one runs to the end
const START = SHOTS.map((_, i) => at(4 * i)); // 0, 1.875, 3.75, 5.625, 7.5

export const REEL = {
  seconds: 10,
  bpm: BPM,
  screens: ['exercise-man', 'workout-man', 'progress'],
  stills: [0, 1.2, 2.9, 4.5, 6.6, 9.2],
  // For page/sound.js: deep hits, a whoosh into each cut, a ding when the streak card pops out, and the beat at
  // which the pattern stops on one last hit.
  cues: { hits: [0, START[4]], cuts: START.slice(1), dings: [START[3] + at(0.5)], end: at(20) },
  draw(c, t, img) {
    const i = START.findLastIndex((from) => t >= from);
    const s = t - START[i];
    const zoom = i > 0 ? 1 + 0.06 * (1 - clamp(s / 0.15)) : 1; // each cut punches in a little
    c.save();
    c.translate(540, 960);
    c.scale(zoom, zoom);
    c.translate(-540, -960);
    SHOTS[i](c, s, img);
    c.restore();
    if (i > 0) flash(c, s);
  },
};
