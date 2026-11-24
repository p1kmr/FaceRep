// The reel's sound, made in code (no recordings, no AI, nothing downloaded): a phonk-style beat at the reel's tempo
// (808 bass, kick, clap, hats and a cowbell riff with an echo), a whoosh into each cut, deep hits and a ding where
// the reel's cues ask, and one last hit where the pattern stops. Returns one stereo AudioBuffer as long as the reel.

const RATE = 48000;
const KICK = [0, 10], CLAP = [4, 12], HATS = [0, 2, 4, 6, 8, 10, 12, 14, 15]; // 16th steps of a bar
// [step, semitones from D] for the cowbell; two bars that repeat. The 808 follows: [step, semitones, steps long].
const BELL = [
  [[0, 0], [3, 0], [6, 3], [8, 0], [10, 7], [12, 5], [14, 3]],
  [[0, 0], [3, 0], [6, 3], [8, 0], [10, 10], [12, 8], [14, 7]],
];
const BASS = [
  [[0, 0, 8], [10, 0, 6]],
  [[0, -4, 8], [10, -2, 6]],
];
const D5 = 587.33, D2 = 73.42;
const note = (base, semis) => base * 2 ** (semis / 12);

export async function makeSound(reel) {
  const ctx = new OfflineAudioContext(2, Math.ceil(reel.seconds * RATE), RATE);
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  comp.attack.value = 0.004;
  comp.release.value = 0.12;
  comp.connect(ctx.destination);
  const s = { ctx, out: comp, noise: noise(ctx) };
  s.bells = echo(ctx, comp, (60 / reel.bpm) * 0.75);
  const step = 60 / reel.bpm / 4;
  for (let i = 0; i * step < reel.cues.end - 1e-6; i++) {
    const t = i * step, bar = Math.floor(i / 16) % 2, k = i % 16;
    if (KICK.includes(k)) kick(s, t);
    if (CLAP.includes(k)) clap(s, t);
    if (HATS.includes(k)) hat(s, t, k === 14);
    for (const [at, semis] of BELL[bar]) if (at === k) bell(s, t, note(D5, semis));
    for (const [at, semis, len] of BASS[bar]) if (at === k) bass(s, t, note(D2, semis), len * step);
  }
  const end = reel.cues.end;
  kick(s, end);
  bass(s, end, D2, reel.seconds - end);
  bell(s, end, D5);
  for (const t of [...reel.cues.hits, end]) impact(s, t);
  for (const t of reel.cues.cuts) whoosh(s, t);
  for (const t of reel.cues.dings) ding(s, t);
  return level(await ctx.startRendering());
}

// Peak at 0.9, a 3 ms fade in and a 0.2 s fade out, so nothing clicks.
function level(buffer) {
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) for (const v of buffer.getChannelData(ch)) peak = Math.max(peak, Math.abs(v));
  const gain = peak > 0 ? 0.9 / peak : 1, n = buffer.length, fadeIn = 0.003 * RATE, fadeOut = 0.2 * RATE;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const d = buffer.getChannelData(ch);
    for (let i = 0; i < n; i++) d[i] *= gain * Math.min(1, i / fadeIn, (n - 1 - i) / fadeOut);
  }
  return buffer;
}

function noise(ctx) {
  const b = ctx.createBuffer(1, RATE * 2, RATE), d = b.getChannelData(0);
  let x = 12345;
  for (let i = 0; i < d.length; i++) {
    x = (Math.imul(x, 1103515245) + 12345) | 0;
    d[i] = ((x >>> 0) / 2 ** 32) * 2 - 1;
  }
  return b;
}

function echo(ctx, out, time) {
  const bus = ctx.createGain(), delay = ctx.createDelay(1), back = ctx.createGain(), tone = ctx.createBiquadFilter(), wet = ctx.createGain();
  delay.delayTime.value = time;
  back.gain.value = 0.35;
  tone.type = 'lowpass';
  tone.frequency.value = 2400;
  wet.gain.value = 0.5;
  bus.connect(out);
  bus.connect(delay).connect(tone).connect(back).connect(delay);
  tone.connect(wet).connect(out);
  return bus;
}

function env(param, t, peak, attack, decay) {
  param.setValueAtTime(0.0001, t);
  param.exponentialRampToValueAtTime(peak, t + attack);
  param.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function osc({ ctx }, t, type, freq, to, glide) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + glide);
  return o;
}

function play(o, t, len) {
  o.start(t);
  o.stop(t + len);
}

function kick(s, t) {
  const g = s.ctx.createGain(), o = osc(s, t, 'sine', 150, 45, 0.12);
  env(g.gain, t, 0.9, 0.003, 0.3);
  o.connect(g).connect(s.out);
  play(o, t, 0.4);
}

function bass(s, t, freq, len) {
  const g = s.ctx.createGain(), shape = s.ctx.createWaveShaper(), o = osc(s, t, 'sine', freq * 1.6, freq, 0.06);
  shape.curve = drive(2.2);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.5, t + 0.006);
  g.gain.setValueAtTime(0.5, t + len * 0.5);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(shape).connect(g).connect(s.out);
  play(o, t, len + 0.02);
}

function burst(s, t, { type, freq, q = 1, peak, decay }) {
  const src = s.ctx.createBufferSource(), f = s.ctx.createBiquadFilter(), g = s.ctx.createGain();
  src.buffer = s.noise;
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  env(g.gain, t, peak, 0.002, decay);
  src.connect(f).connect(g).connect(s.out);
  src.start(t, (t * 7.3) % 1.5);
  src.stop(t + decay + 0.05);
}

function clap(s, t) {
  [0, 0.011, 0.022].forEach((d, i) => burst(s, t + d, { type: 'bandpass', freq: 1500, q: 0.8, peak: 0.45, decay: i === 2 ? 0.16 : 0.012 }));
}

function hat(s, t, open) {
  burst(s, t, { type: 'highpass', freq: 7500, peak: 0.16, decay: open ? 0.16 : 0.03 });
}

function bell(s, t, freq) {
  const f = s.ctx.createBiquadFilter(), g = s.ctx.createGain();
  f.type = 'bandpass';
  f.frequency.value = freq * 2;
  f.Q.value = 0.9;
  env(g.gain, t, 0.2, 0.002, 0.3);
  f.connect(g).connect(s.bells);
  for (const m of [1, 1.48]) {
    const o = osc(s, t, 'square', freq * m);
    o.connect(f);
    play(o, t, 0.36);
  }
}

function whoosh(s, cut) {
  const t = cut - 0.34, src = s.ctx.createBufferSource(), f = s.ctx.createBiquadFilter(), g = s.ctx.createGain();
  src.buffer = s.noise;
  f.type = 'bandpass';
  f.Q.value = 1.3;
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(5200, cut);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.4, cut - 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, cut + 0.07);
  src.connect(f).connect(g).connect(s.out);
  src.start(t, 0.2);
  src.stop(cut + 0.1);
}

function impact(s, t) {
  const g = s.ctx.createGain(), o = osc(s, t, 'sine', 95, 30, 0.5);
  env(g.gain, t, 0.85, 0.003, 0.7);
  o.connect(g).connect(s.out);
  play(o, t, 0.8);
  burst(s, t, { type: 'lowpass', freq: 900, peak: 0.45, decay: 0.3 });
}

function ding(s, t) {
  for (const [m, peak] of [[1, 0.16], [2, 0.07], [3.01, 0.035]]) {
    const g = s.ctx.createGain(), o = osc(s, t, 'sine', 1318.5 * m);
    env(g.gain, t, peak, 0.002, 0.55);
    o.connect(g).connect(s.out);
    play(o, t, 0.6);
  }
}

function drive(k) {
  const n = 1024, curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(k * x) / Math.tanh(k);
  }
  return curve;
}
