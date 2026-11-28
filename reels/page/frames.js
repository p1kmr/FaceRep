// The cloud way to make the MP4 (node reels/render.mjs <reel> --ffmpeg): in a Claude Code cloud session the page
// can't load its encoder (jsdelivr is blocked), so it sends the sound as a WAV and every frame as a JPEG, and
// render.mjs pipes them into the ffmpeg that is already on the machine (Reel Studio's rules allow that one there).

const post = (url, body) => fetch(url, { method: 'POST', body });

// The sound as a 16-bit stereo WAV file.
export function wav(buffer) {
  const n = buffer.length, ch = buffer.numberOfChannels, data = n * ch * 2;
  const view = new DataView(new ArrayBuffer(44 + data));
  const tag = (at, s) => [...s].forEach((x, i) => view.setUint8(at + i, x.charCodeAt(0)));
  tag(0, 'RIFF');
  view.setUint32(4, 36 + data, true);
  tag(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, ch, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * ch * 2, true);
  view.setUint16(32, ch * 2, true);
  view.setUint16(34, 16, true);
  tag(36, 'data');
  view.setUint32(40, data, true);
  const chans = [...Array(ch)].map((_, i) => buffer.getChannelData(i));
  for (let i = 0, at = 44; i < n; i++) {
    for (const d of chans) {
      view.setInt16(at, Math.max(-1, Math.min(1, d[i])) * 0x7fff, true);
      at += 2;
    }
  }
  return view.buffer;
}

// Sends the sound, then every frame in order; render.mjs answers 'ok' once ffmpeg has written out/reel.mp4.
export async function viaFfmpeg({ canvas, frames, frameAt, sound }) {
  const began = performance.now();
  await post('/save/sound.wav', wav(sound));
  for (let i = 0; i < frames; i++) {
    frameAt(i);
    await post('/frame', await new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.95)));
  }
  const answer = await (await post('/frames/end', '')).text();
  if (answer !== 'ok') throw new Error(`ffmpeg: ${answer}`);
  return (performance.now() - began) / 1000;
}
