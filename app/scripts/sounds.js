/**
 * Makes the beeps of Settings → Sound cues → Beeps (services/beeps.ts, docs/architecture.md "The workout player"):
 * plain tones worked out here, so nothing is downloaded or licensed. Never edit the WAV files by hand: change this
 * script and run it (a test checks the files match it).
 *
 *   npm run sounds    writes assets/sounds/<beep>.wav (44.1 kHz, 16-bit, mono)
 *
 *   count    3, 2, 1 before an exercise starts: short, in the middle
 *   go       start squeezing: higher and longer, the main cue
 *   tick     every second of a squeeze: short and soft, like a clock
 *   release  relax: two notes going down
 *   done     the workout is finished: four notes going up
 */
const fs = require('node:fs');
const path = require('node:path');

const DIR = path.resolve(__dirname, '../assets/sounds');
const RATE = 44100;

/** Overtones of a plain beep and of a wooden tick: [multiple of the note, loudness]. */
const BEEP = [[1, 1], [2, 0.2], [3, 0.05]];
const WOOD = [[1, 1], [2.1, 0.25]];

/**
 * Each sound: its notes (Hz, start and length in seconds, `fade`: seconds to fall to about a third) and the loudest
 * it gets (1 = full scale). The tick stays quiet: it plays every second of a squeeze.
 */
const SOUNDS = {
  count: { peak: 0.6, notes: [{ hz: 880, len: 0.12, fade: 0.06, tones: BEEP }] },
  go: { peak: 0.85, notes: [{ hz: 1318.5, len: 0.4, fade: 0.15, tones: BEEP }] },
  tick: {
    peak: 0.3,
    notes: [
      { hz: 1900, len: 0.045, fade: 0.012, tones: WOOD },
      { hz: 950, len: 0.045, fade: 0.02, gain: 0.5 },
    ],
  },
  release: {
    peak: 0.65,
    notes: [
      { hz: 987.8, len: 0.14, fade: 0.08, tones: BEEP },
      { hz: 659.3, at: 0.12, len: 0.3, fade: 0.12, tones: BEEP },
    ],
  },
  done: {
    peak: 0.75,
    notes: [784, 987.8, 1174.7, 1568].map((hz, i) => ({ hz, at: i * 0.11, len: i === 3 ? 0.7 : 0.35, fade: i === 3 ? 0.3 : 0.15, tones: BEEP })),
  },
};

/** The sound as samples from -1 to 1: every note faded in over 4 ms and out over its last 10 ms, so nothing clicks. */
function render({ peak, notes }) {
  const length = Math.max(...notes.map((n) => (n.at ?? 0) + n.len));
  const out = new Float64Array(Math.round(length * RATE));
  for (const { hz, at = 0, len, fade, gain = 1, tones = [[1, 1]] } of notes) {
    const start = Math.round(at * RATE);
    const count = Math.round(len * RATE);
    for (let i = 0; i < count && start + i < out.length; i++) {
      const t = i / RATE;
      const envelope = Math.min(1, t / 0.004) * Math.min(1, (len - t) / 0.01) * Math.exp(-t / fade);
      let v = 0;
      for (const [multiple, loudness] of tones) v += loudness * Math.sin(2 * Math.PI * hz * multiple * t);
      out[start + i] += gain * envelope * v;
    }
  }
  const max = out.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  return out.map((v) => (v / max) * peak);
}

/** A 16-bit mono PCM WAV file. */
function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.round(v * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

/** Every sound's file name and contents. */
const files = () => Object.entries(SOUNDS).map(([name, sound]) => [`${name}.wav`, wav(render(sound))]);

if (require.main === module) {
  fs.mkdirSync(DIR, { recursive: true });
  for (const [name, data] of files()) {
    fs.writeFileSync(path.join(DIR, name), data);
    console.log(`assets/sounds/${name}  ${(data.length / 1024).toFixed(1)} KB`);
  }
}

module.exports = { DIR, SOUNDS, files };
