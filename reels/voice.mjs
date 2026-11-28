// Makes a reel's character voices with Gemini, through lib/gemini.mjs (copied from Reel Studio): one request
// per character, saying all of that character's lines with a pause between them, cut at the longest pauses into one
// clip per line: <reel>/voice/<line id>.wav. <reel>/voice.json says who says what, in which Gemini voice and style;
// reel.js says when each clip starts (REEL.voice). Each character costs one of the owner's free Gemini requests: run
// it once, and again only when the owner asks.
//   node reels/voice.mjs reels/002-face-day                    every character
//   node reels/voice.mjs reels/002-face-day --only brody       one character again
//   node reels/voice.mjs reels/002-face-day --only brody --from take.wav   cut a recording you already have
// The key: in a Claude Code cloud session a network secret (host generativelanguage.googleapis.com, header
// x-goog-api-key); on the Mac, run it as  node --env-file=.env reels/voice.mjs …  (this file never reads .env).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { speak } from './lib/gemini.mjs';
import { estimateTimings, findPauses } from './lib/timings.mjs';
import { readWav, writeWav } from './lib/wav.mjs';

const args = process.argv.slice(2);
const opt = (name) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : null);
const reel = resolve(args.find((a, i) => !a.startsWith('--') && !['--only', '--from'].includes(args[i - 1])) ?? '');
if (!existsSync(join(reel, 'voice.json'))) {
  console.log('Use: node reels/voice.mjs reels/NNN-name [--only <who>] [--from <take.wav>]  (needs <reel>/voice.json)');
  process.exit(1);
}
const { cast, lines } = JSON.parse(readFileSync(join(reel, 'voice.json'), 'utf8'));
const model = 'gemini-3.8-flash-tts'; // the same model as Reel Studio's voice/voices.json (english.gemini)
const PAD = 0.06; // seconds of quiet kept before and after each clip
const MAX_GAP = 0.45; // a longer pause inside a line is shortened to this (reels are fast)
const who = opt('only') ? [opt('only')] : Object.keys(cast);
if (opt('from') && who.length !== 1) {
  console.log('FAIL --from cuts one character\'s recording: add --only <who>.');
  process.exit(1);
}

// Cuts one take into one clip per line. Reel Studio's estimate of where each line ends picks, for each line break,
// the pause nearest to it (the longest pauses can be inside a line: "Oh... that's actually chill.").
function cut(pcm, rate, texts) {
  const { start, end, pauses } = findPauses(pcm, rate);
  const guess = estimateTimings(pcm, rate, texts).lines;
  const free = [...pauses], bounds = [start];
  for (let i = 0; i < texts.length - 1; i++) {
    const at = (guess[i].end + guess[i + 1].start) / 2;
    if (!free.length) throw new Error(`the take has fewer pauses than line breaks`);
    const k = free.reduce((best, g, j) => (Math.abs((g.start + g.end) / 2 - at) < Math.abs((free[best].start + free[best].end) / 2 - at) ? j : best), 0);
    bounds.push(free[k].start, free[k].end);
    free.splice(0, k + 1); // later breaks come after this one
  }
  bounds.push(end);
  return texts.map((_, i) => tighten(pcm.slice(Math.max(0, Math.round((bounds[2 * i] - PAD) * rate)), Math.round((bounds[2 * i + 1] + PAD) * rate)), rate));
}

// Shortens every pause inside a clip to MAX_GAP.
function tighten(clip, rate) {
  const keep = [];
  let from = 0;
  for (const g of findPauses(clip, rate).pauses) {
    if (g.end - g.start <= MAX_GAP) continue;
    keep.push(clip.slice(from, Math.round((g.start + MAX_GAP / 2) * rate))); // half of MAX_GAP on each side
    from = Math.round((g.end - MAX_GAP / 2) * rate);
  }
  keep.push(clip.slice(from));
  const out = new Int16Array(keep.reduce((n, k) => n + k.length, 0));
  keep.reduce((at, k) => (out.set(k, at), at + k.length), 0);
  return out;
}

mkdirSync(join(reel, 'voice'), { recursive: true });
for (const name of who) {
  const mine = lines.filter((l) => l.who === name);
  if (!cast[name] || !mine.length) throw new Error(`no voice or no lines for "${name}" in voice.json`);
  const { voice, style } = cast[name];
  let take;
  if (opt('from')) take = readWav(readFileSync(resolve(opt('from'))));
  else {
    console.log(`${name}: asking Gemini (${voice}) for ${mine.length} line(s), one request…`);
    take = await speak(mine.map((l) => l.text).join('\n\n'), { model, voice, style: `${style}. Leave a long pause between lines.` });
  }
  writeFileSync(join(reel, 'voice', `${name}-take.wav`), writeWav(take.pcm, take.rate));
  let clips;
  try {
    clips = cut(take.pcm, take.rate, mine.map((l) => l.text));
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message}. The whole take is in voice/${name}-take.wav; cut it by hand or ask again.`);
    process.exitCode = 1;
    continue;
  }
  mine.forEach((l, i) => {
    writeFileSync(join(reel, 'voice', `${l.id}.wav`), writeWav(clips[i], take.rate));
    console.log(`OK   voice/${l.id}.wav  ${(clips[i].length / take.rate).toFixed(2)} s  "${l.text}"`);
  });
}
