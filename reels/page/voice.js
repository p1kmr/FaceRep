// Mixes a reel's voice clips (<reel>/voice/<id>.wav, made by reels/voice.mjs) over its beat. REEL.voice lists
// { id, at }: each clip starts at `at` seconds, the beat ducks under it so the words stay clear, and a limiter on the
// end keeps the mix from clipping. render.mjs says whether the reel has a voice folder yet; without one the reel
// keeps its beat alone.

const DUCK = 0.32; // the beat's level under a voice (about -10 dB)
const VOICE = 1.0;

export async function withVoice(beat, reel) {
  const lines = [...(reel.voice ?? [])].sort((a, b) => a.at - b.at);
  if (!lines.length) return beat;
  const ctx = new OfflineAudioContext(2, beat.length, beat.sampleRate);
  const clips = await Promise.all(lines.map(async ({ id }) => {
    const res = await fetch(`/voice/${id}.wav`);
    if (!res.ok) throw new Error(`voice clip ${id}.wav is missing: run node reels/voice.mjs <reel>`);
    return ctx.decodeAudioData(await res.arrayBuffer());
  }));
  const limit = ctx.createDynamicsCompressor();
  limit.threshold.value = -3;
  limit.knee.value = 0;
  limit.ratio.value = 20;
  limit.attack.value = 0.002;
  limit.release.value = 0.1;
  limit.connect(ctx.destination);
  const bed = ctx.createBufferSource(), duck = ctx.createGain();
  bed.buffer = beat;
  bed.connect(duck).connect(limit);
  duck.gain.setValueAtTime(1, 0);
  lines.forEach(({ at }, i) => {
    duck.gain.setTargetAtTime(DUCK, Math.max(0, at - 0.08), 0.03);
    duck.gain.setTargetAtTime(1, at + clips[i].duration + 0.05, 0.15);
    const v = ctx.createBufferSource(), g = ctx.createGain();
    v.buffer = clips[i];
    g.gain.value = VOICE;
    v.connect(g).connect(limit);
    v.start(at);
  });
  bed.start(0);
  return ctx.startRendering();
}
