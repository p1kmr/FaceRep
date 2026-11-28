// "Every rep" (script.md), 30 s. After the gym Leo shouts "Every single rep!"; his gym friend Maya: "And face? You
// forgot your face reps, man." The beat stops on his horror ("I forgot face day...", a heartbeat) and comes back when
// she sits him down with the app: Fish Face, Chin Lift, Brow Lift on the bench, then "Now it's every rep." End card:
// DON'T SKIP FACE DAY. Hand-painted anime pictures (art/, made in Figma from the same words for Leo as 010 and 011,
// see script.md); code adds the words, the app's real workout screen, Rep and the end card. Voices: Gemini
// (voice.json); Leo's take was cut by hand at its pauses (voice.mjs's cutter put "Legs" into the next line); n-1 is
// reel 010's narrator clip, "Download FaceRep. On the App Store."
//   node reels/render.mjs reels/012-every-rep --stills

import { painting, shade } from '/page/art.js';
import { vignette } from '/page/cast/hud.js';
import { grain, use } from '/page/cast/pen.js';
import { repStand } from '/page/cast/stage.js';
import { RED, WHITE, background, button, clamp, easeBack, easeOut, flash, icon, liftCircle, phone, shake, slam, text, words } from '/page/draw.js';

// When each clip starts (word onsets inside the clips were measured with whisper and the pauses).
const V = { 'l-1': 0.3, 'm-1': 3.2, 'l-2': 5.2, 'm-2': 8.2, 'l-3': 11.9, 'm-3': 14.2, 'm-4': 16.6, 'm-5': 18.6, 'm-6': 20.6, 'l-4': 22.7, 'm-7': 25.2, 'n-1': 26.5 };
const RING = V['m-3'] + 1.3; // the app's ring lifts out after "Five minutes."
const HEARTS = [11.6, 12.15, 12.7, 13.25, 13.8];

const pop = (t, at, d = 0.25) => easeBack(clamp((t - at) / d));
const beat = (t) => Math.max(0, ...HEARTS.map((h) => (t >= h ? Math.exp(-(t - h) / 0.15) : 0)));
// Leo's words are white on red, Maya's red on white: who is talking reads with the sound off.
const leo = (c, t, str, y, at, size = 120) => words(c, str, { y, size, box: RED, pop: slam(t, at) });
const maya = (c, t, str, y, at, size = 120) => words(c, str, { y, size, color: RED, box: WHITE, pop: slam(t, at) });

// Every shot gets s (seconds since its cut) and t (seconds since the start). His head is high in most pictures: the
// words go low, never below y 1600 (Instagram's caption).
function victory(c, s, img, t) {
  painting(c, img['01-victory'], { zoom: 1.1 - 0.07 * easeOut(clamp(s / 0.4)) + 0.03 * (s / 3), fy: 0.4 });
  shade(c, false);
  const at = V['l-1'];
  leo(c, t, 'EVERY', 1200, at + 0.8, 110);
  leo(c, t, 'SINGLE', 1340, at + 1.05, 110);
  leo(c, t, 'REP!', 1500, at + 1.45, 150);
}

function doubt(c, s, img, t) {
  painting(c, img['02-doubt'], { zoom: 1.04 + 0.04 * (s / 2), fy: 0.4 });
  shade(c, false);
  maya(c, t, 'EVERY REP?', 1480, V['m-1'] + 0.05, 140);
}

function flex(c, s, img, t) {
  painting(c, img['03-flex'], { zoom: 1.04 + 0.05 * (s / 3), fy: 0.4 });
  shade(c, false);
  const at = V['l-2'];
  leo(c, t, 'CHEST.', 1200, at + 0.06, 110);
  leo(c, t, 'BACK.', 1340, at + 1.13, 110);
  leo(c, t, 'LEGS.', 1490, at + 2.04, 130);
}

function point(c, s, img, t) {
  painting(c, img['04-point'], { zoom: 1.12 - 0.08 * easeOut(clamp(s / 0.3)) + 0.03 * (s / 3.5), fy: 0.4 });
  shade(c, false);
  const at = V['m-2'];
  maya(c, t, 'AND FACE?', 1180, at + 0.06, 110);
  words(c, 'YOU FORGOT YOUR', { y: 1340, size: 92, pop: slam(t, at + 1.56) });
  words(c, 'FACE REPS.', { y: 1490, size: 150, color: RED, box: WHITE, pop: slam(t, at + 2.3), shake: shake(t, at + 2.3) });
}

// The beat stops: a heartbeat, the room goes cold, a slow push in on his face.
function shock(c, s, img, t) {
  painting(c, img['05-shock'], { zoom: 1 + 0.14 * easeOut(clamp(s / 2.5)), fy: 0.4, dark: 0.1 });
  vignette(c, '25,45,120', 0.3 + 0.35 * beat(t));
  shade(c, false);
  const at = V['l-3'] + 0.3; // "forgot"
  words(c, 'I FORGOT FACE DAY.', { y: 1480, size: 110, box: RED, pop: slam(t, at), shake: shake(t, at) });
}

// The beat is back: she sits him down. His phone with the app's real workout screen; its ring lifts out.
function app(c, s, img, t) {
  painting(c, img['06-fish-face'], { zoom: 1.2, fx: 0.5, fy: 0.3, blur: 18, dark: 0.4 });
  const up = easeOut(clamp(s / 0.4));
  phone(c, img['workout-man'], { x: 540, y: 1150 + 900 * (1 - up), w: 560, rot: -0.03 * (1 - up) });
  liftCircle(c, img['workout-man'], { sx: 537, sy: 2036, sr: 170, x: 800, y: 1560, r: 170, pop: clamp((t - RING) / 0.3) });
  maya(c, t, 'SIT.', 230, V['m-3'] + 0.06, 110);
  maya(c, t, '5 MINUTES.', 390, V['m-3'] + 0.89, 130);
}

// A punch in on the beat and the move's name, called by Maya.
const exercise = (pic, name, at, { zoom = 1, fx = 0.5, fy = 0.4, y = 1500 } = {}) => (c, s, img, t) => {
  painting(c, img[pic], { zoom: zoom * (1.08 - 0.06 * easeOut(clamp(s / 0.3))) + 0.02 * (s / 2), fx, fy });
  shade(c, false);
  maya(c, t, name, y, at, 130);
};

function fist(c, s, img, t) {
  painting(c, img['09-fist-bump'], { zoom: 1.1 - 0.07 * easeOut(clamp(s / 0.5)), fy: 0.4 });
  shade(c, false);
  const at = V['l-4'];
  words(c, "NOW IT'S", { y: 1320, size: 96, pop: slam(t, at + 0.06) });
  leo(c, t, 'EVERY REP.', 1480, at + 0.4, 150);
  repStand(c, { x: 190, y: 1690, size: 200 * pop(t, at + 1.1), eyes: 'open', arms: 'up' });
}

function end(c, s, img, t) {
  background(c, 'red');
  words(c, "DON'T SKIP", { y: 190, size: 96, pop: slam(t, V['m-7'] + 0.06) });
  words(c, 'FACE DAY.', { y: 320, size: 130, color: RED, box: WHITE, pop: slam(t, V['m-7'] + 0.5) });
  words(c, 'DOWNLOAD', { y: 490, size: 96, pop: slam(t, V['n-1'] + 0.06) });
  words(c, 'FACEREP', { y: 630, size: 140, color: RED, box: WHITE, pop: slam(t, V['n-1'] + 0.5) });
  icon(c, img.icon, { x: 540, y: 910, size: 260 * pop(t, V['n-1']) });
  if (t > V['n-1'] + 0.5) text(c, 'Face Yoga & Jawline', { y: 1100, size: 50, alpha: 0.92 });
  button(c, 'ON THE APP STORE', { y: 1280, w: 680, h: 130, pop: clamp((t - (V['n-1'] + 1.61)) / 0.3) });
  words(c, 'FOLLOW FOR MORE', { y: 1450, size: 60, pop: slam(t, 29) });
  const hop = Math.abs(Math.sin(s * 2 * Math.PI)) * 40;
  repStand(c, { x: 540, y: 1735 - hop, size: 200 * pop(t, 25.3), eyes: 'open', arms: 'up', legs: 'jump' });
}

// Every cut is hard, on the beat, with a 5% zoom kick and a flash.
const SHOTS = [
  [0, victory], [3, doubt], [5, flex], [8, point], [11.5, shock], [14, app],
  [16.5, exercise('06-fish-face', 'FISH FACE', V['m-4'] + 0.02, { zoom: 1.3, fy: 0.3 })],
  [18.5, exercise('07-chin-lift', 'CHIN LIFT', V['m-5'] + 0.02)],
  [20.5, exercise('08-brow-lift', 'BROW LIFT', V['m-6'] + 0.02)],
  [22.5, fist], [25, end],
];

export const REEL = {
  seconds: 30,
  bpm: 120,
  screens: ['workout-man'],
  art: ['01-victory', '02-doubt', '03-flex', '04-point', '05-shock', '06-fish-face', '07-chin-lift', '08-brow-lift', '09-fist-bump'],
  stills: [2.2, 4.2, 7.6, 10.9, 13.2, 15.9, 17.6, 19.6, 21.6, 24.2, 29.3],
  // For page/sound.js: hits on the first frame, the shock, the app, the fist bump and the end card; a whoosh into
  // each cut; a ding as the ring lifts out; no beat on the shock, only a heartbeat.
  cues: {
    hits: [0, 11.5, 14, 22.5, 25],
    cuts: SHOTS.slice(1).map(([at]) => at),
    dings: [RING + 0.05],
    hearts: HEARTS,
    quiet: [[11.5, 14]],
    end: 29,
  },
  voice: Object.entries(V).map(([id, at]) => ({ id, at })),
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
