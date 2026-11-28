// Two suspense sounds for page/sound.js, made in code like the rest of the beat (no recordings): a clock tick
// (REEL.cues.ticks) and a heartbeat, a low double thump (REEL.cues.hearts). `s` is sound.js's { ctx, out }.

// A sine that starts at `freq` and falls to about half of it while it fades out in `decay` seconds.
function thump(s, t, freq, peak, decay) {
  const o = s.ctx.createOscillator(), g = s.ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.55, t + decay);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  o.connect(g).connect(s.out);
  o.start(t);
  o.stop(t + decay + 0.02);
}

// A clock tick: a short, bright wooden click, every second one a little lower (tick, tock). i: its number.
export function tick(s, t, i = 0) {
  const f = i % 2 ? 1700 : 2200;
  thump(s, t, f, 0.55, 0.04);
  thump(s, t, f * 2.7, 0.2, 0.015);
}

// A heartbeat: "lub", then a softer "dub" 0.17 s later. The 140 Hz part keeps it audible on a phone's speaker.
export function heart(s, t) {
  for (const [d, k] of [[0, 1], [0.17, 0.7]]) {
    thump(s, t + d, 70, 0.85 * k, 0.18);
    thump(s, t + d, 140, 0.35 * k, 0.12);
  }
}
