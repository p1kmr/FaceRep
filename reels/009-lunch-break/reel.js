// "Lunch break" (script.md), 28 s, the bust style. 12:30 in the office break room: Brody does Fish Face over lunch,
// Kayla and Mia catch him and laugh; the next day they're doing it too, then the boss. Rep cheers, the end card.
// 120 bpm, cut on the beat. The voices (voice.json, reels/voice.mjs) start with their bubbles; the bubbles stay.
//   node reels/render.mjs reels/009-lunch-break --stills

import { bubble } from '/page/bubble.js';
import { grain, use } from '/page/cast/pen.js';
import { appPhone } from '/page/cast/app-phone.js';
import { badge, breakRoom, clock, lunch, table, wall } from '/page/cast/office.js';
import { bossMug, doorway, heldCup } from '/page/cast/office-props.js';
import { confetti, repStand } from '/page/cast/stage.js';
import { brody, kayla } from '/page/bust/people.js';
import { greg, mia } from '/page/bust/crew.js';
import { RED, WHITE, background, button, clamp, easeBack, easeOut, flash, icon, slam, text, words } from '/page/draw.js';

const INK = '#2B1D2E';
const SKIN = { brody: '#F2C4A0', kayla: '#F7D3BE', mia: '#E3B08A', greg: '#EDBB98' };
const FISH = { exercise: 'fish' };
const FROZEN = { kind: 'wide', mouth: 'o', brows: 'up', look: [0, 0.2] };
const LAUGH = { kind: 'happy', mouth: 'big', brows: 'up' };
const pop = (s, at, d = 0.25) => easeBack(clamp((s - at) / d));
const dim = (c, a) => {
  c.fillStyle = `rgba(30,20,35,${a})`;
  c.fillRect(0, 0, 1080, 1920);
};

function hook(c, s) {
  breakRoom(c);
  brody(c, { x: 540, y: 1040, s: 2.0, k: 0.6, clothes: 'tee', face: FISH });
  badge(c, 540, 1510);
  table(c);
  lunch(c);
  appPhone(c, { x: 840, y: 1450, s: 0.4 + s });
  words(c, 'POV:', { y: 150, size: 90, color: INK, pop: slam(s, 0.05) });
  words(c, 'LUNCH BREAK FACE WORKOUT', { y: 270, size: 92, box: RED, pop: slam(s, 0.3) });
}

// The phone fills the frame: the hold ring and the step; Rep counts along.
function ring(c, s) {
  breakRoom(c);
  dim(c, 0.55);
  // the ring shows 4 and then 3 as Rep says them (rep-1 starts at 0.4 s: "four" at about 1.7 s, "three" at 2.75 s)
  appPhone(c, { x: 540, y: 820, s: 0.2 + 0.9 * s, k: 2 * pop(s, 0, 0.3), deg: 0 });
  const k = pop(s, 0.4);
  if (k > 0) {
    c.save();
    c.globalAlpha = clamp(k);
    c.fillStyle = WHITE;
    c.beginPath();
    c.roundRect(70, 1390, 940, 170, 30);
    c.fill();
    c.restore();
    words(c, 'STEP 1', { y: 1430, size: 34, color: RED, pop: k });
    text(c, 'Suck your cheeks in between your teeth.', { y: 1500, size: 42, color: INK, weight: 700 });
  }
  repStand(c, { x: 200, y: 1750, size: 240 * pop(s, 0.2), eyes: 'open', arms: 'up' });
  bubble(c, 'HOLD IT. FOUR… THREE…', { x: 650, y: 1720, size: 52, tail: [340, 1740], pop: pop(s, 0.4) });
}

// Kayla and Mia in the doorway, iced coffees in hand, frozen.
function caught(c, s) {
  doorway(c);
  mia(c, { x: 720, y: 1180, s: 1.6, face: FROZEN });
  kayla(c, { x: 380, y: 1160, s: 1.6, face: FROZEN, swing: 6 * Math.sin(s * 3) });
  heldCup(c, 210, 1600, SKIN.kayla, 0.9);
  heldCup(c, 890, 1620, SKIN.mia, 0.9);
  words(c, 'CAUGHT.', { y: 190, size: 120, box: RED, pop: slam(s, 0.1) });
  bubble(c, '…IS HE OKAY?', { x: 380, y: 720, size: 58, tail: [400, 890], pop: pop(s, 0.5) });
}

// Brody turns to them, still holding Fish Face; they burst out laughing.
function eyeContact(c, s) {
  doorway(c);
  const laugh = s >= 1.2, j = laugh ? 4 : 0;
  kayla(c, { x: 960, y: 1000, s: 1.25, face: laugh ? LAUGH : FROZEN, shake: j, t: s + 1 });
  mia(c, { x: 700, y: 1010, s: 1.25, face: laugh ? LAUGH : FROZEN, shake: j, t: s });
  table(c);
  dim(c, 0.12);
  brody(c, { x: 290, y: 1270, s: 1.75, k: 0.6, clothes: 'tee', tilt: 4, face: { ...FISH, look: [1, 0] } });
  badge(c, 290, 1681, 61);
  bubble(c, "IT'S A REP.", { x: 280, y: 760, size: 60, tail: [360, 920], pop: pop(s, 0.3) });
  if (laugh) {
    words(c, 'HA', { x: 600, y: 640, size: 70, color: RED, pop: slam(s, 1.2) });
    words(c, 'HAHA', { x: 930, y: 620, size: 70, color: RED, pop: slam(s, 1.45) });
  }
}

// The clock spins a whole day back round to 12:30.
function nextDay(c, s) {
  wall(c);
  const p = clamp(s / 1.4), e = p < 0.5 ? 2 * p * p : 1 - 2 * (1 - p) ** 2;
  clock(c, 540, 960, 330, 30 + 1440 * e);
  words(c, 'NEXT DAY', { y: 380, size: 130, box: RED, pop: slam(s, 0.05) });
  words(c, '12:30 PM', { y: 1440, size: 110, color: INK, pop: slam(s, 1.4) });
}

// Kayla and Mia at the table, both in Fish Face, phones on stands.
function day2(c, s) {
  breakRoom(c);
  kayla(c, { x: 330, y: 1080, s: 1.55, face: FISH });
  mia(c, { x: 760, y: 1090, s: 1.55, face: FISH });
  table(c);
  appPhone(c, { x: 130, y: 1480, s: 1 + s, k: 0.6, deg: 4 });
  appPhone(c, { x: 950, y: 1480, s: 0.6 + s, k: 0.6, deg: -4 });
  words(c, 'DAY 2', { y: 200, size: 140, color: INK, pop: slam(s, 0.05) });
  bubble(c, "DON'T LOOK AT US.", { x: 700, y: 560, size: 56, tail: [760, 790], pop: pop(s, 0.6) });
}

// The boss leans into the doorway, his mug in hand, also in Fish Face.
function boss(c, s) {
  doorway(c);
  const e = easeOut(clamp(s / 0.35));
  greg(c, { x: 540 + 560 * (1 - e), y: 1040, s: 1.9, tilt: -10 * (1 - e), face: FISH });
  bossMug(c, 800 + 560 * (1 - e), 1640, SKIN.greg, 0.95);
  words(c, 'THE BOSS??', { y: 150, size: 110, box: RED, pop: slam(s, 0.45) });
  bubble(c, 'HOLD. YOUR. REP.', { x: 540, y: 540, size: 60, tail: [560, 720], pop: pop(s, 0.9) });
}

// Everyone done: smiles, check marks, Rep jumping on the table.
function cheer(c, s) {
  breakRoom(c);
  const happy = { kind: 'happy', mouth: 'grin', brows: 'up' };
  greg(c, { x: 540, y: 780, s: 0.9, face: { mouth: 'smile', brows: 'up' } });
  kayla(c, { x: 270, y: 1040, s: 0.95, face: happy });
  mia(c, { x: 810, y: 1040, s: 0.95, face: happy });
  brody(c, { x: 540, y: 1190, s: 1.05, k: 0.6, clothes: 'tee', face: { mouth: 'grin', brows: 'up' } });
  table(c);
  appPhone(c, { x: 140, y: 1470, s: 5, k: 0.55, deg: 4, done: true, rep: 'REP 8/8' });
  appPhone(c, { x: 940, y: 1470, s: 5, k: 0.55, deg: -4, done: true, rep: 'REP 8/8' });
  const hop = Math.abs(Math.sin(s * 2 * Math.PI)) * 50;
  repStand(c, { x: 540, y: 1560 - hop, size: 280 * pop(s, 0.1), eyes: 'open', arms: 'up', legs: 'jump' });
  confetti(c, 540, 700, s);
  words(c, 'FIVE MINUTES.', { y: 200, size: 110, color: INK, pop: slam(s, 0.3) });
  words(c, 'ANY BREAK.', { y: 340, size: 110, box: RED, pop: slam(s, 2.0) }); // as Rep says it
}

function end(c, s, img) {
  background(c, 'red');
  words(c, 'LUNCH BREAK', { y: 300, size: 100, pop: slam(s, 0.05) });
  words(c, 'FACE WORKOUT', { y: 430, size: 110, color: RED, box: WHITE, pop: slam(s, 0.3) });
  const hop = Math.abs(Math.sin(s * 2 * Math.PI)) * 50;
  repStand(c, { x: 540, y: 790 - hop, size: 260 * pop(s, 0.1), eyes: 'open', arms: 'up', legs: 'jump' });
  icon(c, img.icon, { x: 540, y: 1120, size: 200 * pop(s, 0.4) });
  words(c, 'FACEREP', { y: 1330, size: 120, pop: slam(s, 0.5) });
  if (s > 0.5) text(c, 'Face Yoga & Jawline', { y: 1425, size: 46, alpha: 0.92 });
  button(c, 'ON THE APP STORE', { y: 1600, w: 640, h: 124, pop: clamp((s - 0.8) / 0.3) });
  words(c, 'FOLLOW FOR MORE', { y: 1775, size: 56, pop: slam(s, 1.5) });
}

const SHOTS = [[0, hook], [2.5, ring], [6, caught], [9, eyeContact], [12, nextDay], [14, day2], [18, boss], [22, cheer], [25, end]];

export const REEL = {
  seconds: 28,
  bpm: 120,
  screens: [],
  stills: [1.5, 4.5, 7.5, 11, 13.2, 16.5, 20.5, 24, 27],
  // For page/sound.js: hits on the first frame, the laugh and the boss; a whoosh into each cut; a ding when every
  // ring finishes; the beat stops on "FOLLOW FOR MORE".
  cues: { hits: [0, 10.2, 18.45], cuts: SHOTS.slice(1).map(([at]) => at), dings: [22.1], end: 26.5 },
  // The voice clips, each with its bubble (rep-1 and rep-2 were re-cut by hand from rep-take.wav, no extra request).
  voice: [
    { id: 'rep-1', at: 2.9 }, { id: 'kayla-1', at: 6.5 }, { id: 'brody-1', at: 9.3 }, { id: 'mia-1', at: 14.6 },
    { id: 'greg-1', at: 18.9 }, { id: 'rep-2', at: 22.3 },
  ],
  draw(c, t, img) {
    use(c);
    const i = SHOTS.findLastIndex(([at]) => t >= at), s = t - SHOTS[i][0];
    const zoom = i === 0 ? 1 + 0.05 * clamp(t / 2.5) : 1 + 0.05 * (1 - clamp(s / 0.15));
    c.save();
    c.translate(540, 960);
    c.scale(zoom, zoom);
    c.translate(-540, -960);
    SHOTS[i][1](c, s, img);
    c.restore();
    if (i > 0) flash(c, s);
    grain(c, 0.05);
  },
};
