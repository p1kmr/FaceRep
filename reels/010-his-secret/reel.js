// "His secret" (script.md), 28 s. Hand-painted anime pictures of Leo (art/, made in Figma from the same words for
// Leo every time, see script.md) under a serious movie narrator; code adds the words, the app's real workout screen,
// Rep and the end card. 120 bpm, cut on the beat. The narrator (voice.json) starts each line just after its cut.
//   node reels/render.mjs reels/010-his-secret --stills

import { painting, shade } from '/page/art.js';
import { grain, use } from '/page/cast/pen.js';
import { repStand } from '/page/cast/stage.js';
import { RED, WHITE, background, button, clamp, easeBack, easeOut, flash, icon, liftCircle, phone, slam, text, words } from '/page/draw.js';

const pop = (s, at, d = 0.25) => easeBack(clamp((s - at) / d));

// The narrator's words at the bottom, for people watching with the sound off.
const caption = (c, str, s, at) => s >= at && words(c, str, { y: 1640, size: 76, pop: slam(s, at) });

function hook(c, s, img) {
  painting(c, img['01-sunrise'], { zoom: 1 + 0.06 * (s / 4), fy: 0.55 });
  shade(c);
  words(c, 'HE HAS A SECRET.', { y: 250, size: 110, box: RED, pop: slam(s, 0.1) });
}

function serious(c, s, img) {
  painting(c, img['02-serious'], { zoom: 1.04 + 0.06 * (s / 3), fy: 0.38 });
  shade(c, false);
  caption(c, 'LEO TRAINS IN SECRET.', s, 0.2);
}

// A punch in on the beat: he's doing it.
function fish(c, s, img) {
  painting(c, img['03-fish-face'], { zoom: 1.14 - 0.08 * easeOut(clamp(s / 0.3)), fy: 0.38 });
  shade(c);
  words(c, 'FISH FACE', { y: 250, size: 130, box: RED, pop: slam(s, 0.25) });
  words(c, 'HOLD 5 SECONDS', { y: 400, size: 64, pop: slam(s, 1.4) });
}

function gym(c, s, img) {
  painting(c, img['05-gym-chin-lift'], { zoom: 1.03 + 0.05 * (s / 3), fy: 0.35 });
  shade(c, false); // his head is near the top: the words go at the bottom
  words(c, 'AFTER THE GYM', { y: 1520, size: 76, pop: slam(s, 0.3) });
  words(c, 'CHIN LIFT', { y: 1670, size: 130, box: RED, pop: slam(s, 1.5) });
}

function sunset(c, s, img) {
  painting(c, img['06-sunset-brow-lift'], { zoom: 1.03 + 0.05 * (s / 3), fy: 0.4 });
  shade(c);
  words(c, 'AT SUNSET', { y: 230, size: 76, pop: slam(s, 0.3) });
  words(c, 'BROW LIFT', { y: 370, size: 130, box: RED, pop: slam(s, 1.45) });
}

// His phone comes up out of the sunset: the app's real workout screen (Brow Lift), its ring lifted out, Rep cheering.
function app(c, s, img) {
  painting(c, img['06-sunset-brow-lift'], { zoom: 1.12, fy: 0.4, blur: 16, dark: 0.4 });
  const up = easeOut(clamp(s / 0.4));
  phone(c, img['workout-man'], { x: 540, y: 1060 + 900 * (1 - up), w: 590, rot: -0.03 * (1 - up) });
  liftCircle(c, img['workout-man'], { sx: 537, sy: 2036, sr: 170, x: 820, y: 1460, r: 170, pop: clamp((s - 1.1) / 0.3) });
  repStand(c, { x: 190, y: 1690, size: 210 * pop(s, 0.7), eyes: 'open', arms: 'up' });
  words(c, 'IT COUNTS EVERY REP', { y: 200, size: 96, box: RED, pop: slam(s, 0.3) });
}

function night(c, s, img) {
  painting(c, img['07-night'], { zoom: 1.03 + 0.04 * (s / 3.5), fy: 0.4 });
  shade(c);
  shade(c, false);
  words(c, '5 MINUTES A DAY.', { y: 250, size: 110, box: RED, pop: slam(s, 0.3) });
  caption(c, "THAT'S THE WHOLE SECRET.", s, 1.7);
}

function end(c, s, img) {
  background(c, 'red');
  words(c, 'DOWNLOAD', { y: 290, size: 110, pop: slam(s, 0.5) });
  words(c, 'FACEREP', { y: 440, size: 150, color: RED, box: WHITE, pop: slam(s, 0.9) });
  icon(c, img.icon, { x: 540, y: 790, size: 300 * pop(s, 0.1) });
  if (s > 0.9) text(c, 'Face Yoga & Jawline', { y: 1010, size: 50, alpha: 0.92 });
  button(c, 'ON THE APP STORE', { y: 1220, w: 680, h: 130, pop: clamp((s - 1.6) / 0.3) });
  words(c, 'FOLLOW FOR MORE', { y: 1420, size: 60, pop: slam(s, 3.0) });
  const hop = Math.abs(Math.sin(s * 2 * Math.PI)) * 40;
  repStand(c, { x: 540, y: 1720 - hop, size: 200 * pop(s, 0.3), eyes: 'open', arms: 'up', legs: 'jump' });
}

// [start, shot, soft]: a soft cut fades in from the shot before; the others cut hard on the beat with a flash.
const SHOTS = [[0, hook], [4, serious, true], [7, fish], [10, gym], [13, sunset], [16, app], [19.5, night], [23, end]];
const FADE = 0.5;

export const REEL = {
  seconds: 28,
  bpm: 120,
  screens: ['workout-man'],
  art: ['01-sunrise', '02-serious', '03-fish-face', '05-gym-chin-lift', '06-sunset-brow-lift', '07-night'],
  stills: [2, 5.5, 8.5, 12, 15, 18.5, 21.5, 26],
  // For page/sound.js: hits on the first frame, the Fish Face punch and the end card; a whoosh into each cut; a ding
  // as the ring lifts out; the beat stops on "FOLLOW FOR MORE".
  cues: { hits: [0, 7, 23], cuts: SHOTS.slice(1).map(([at]) => at), dings: [17.1], end: 26 },
  voice: [
    { id: 'n-1', at: 0.3 }, { id: 'n-2', at: 4.1 }, { id: 'n-3', at: 7.2 }, { id: 'n-4', at: 10.3 },
    { id: 'n-5', at: 13.3 }, { id: 'n-6', at: 16.4 }, { id: 'n-7', at: 19.8 }, { id: 'n-8', at: 23.5 },
  ],
  draw(c, t, img) {
    use(c);
    const i = SHOTS.findLastIndex(([at]) => t >= at), s = t - SHOTS[i][0], soft = SHOTS[i][2];
    const zoom = i === 0 || soft ? 1 : 1 + 0.05 * (1 - clamp(s / 0.15));
    const fading = soft && s < FADE;
    // A soft cut: the shot before stays underneath while this one fades in over it (words() sets its own alpha, so
    // the new shot's words pop in as usual).
    if (fading) SHOTS[i - 1][1](c, SHOTS[i][0] - SHOTS[i - 1][0] + s, img);
    c.save();
    if (fading) c.globalAlpha = s / FADE;
    c.translate(540, 960);
    c.scale(zoom, zoom);
    c.translate(-540, -960);
    SHOTS[i][1](c, s, img);
    c.restore();
    if (i > 0 && !soft) flash(c, s);
    grain(c, 0.035);
  },
};
