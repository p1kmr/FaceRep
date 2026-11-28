// The render page's start: loads the font and pictures, saves the still pictures (and a sheet of them), then, unless
// only stills were asked for, draws every frame of the reel into an MP4 with its sound. reels/render.mjs serves it.

import { makeSound } from '/page/sound.js';
import { withVoice } from '/page/voice.js';
import { REEL } from '/reel.js';

const W = 1080, H = 1920;
const post = (url, body) => fetch(url, { method: 'POST', body });
const say = (text) => post('/log', text);
const jpg = (canvas) => new Promise((ok) => canvas.toBlob(ok, 'image/jpeg', 0.88));
const png = (canvas) => new Promise((ok) => canvas.toBlob(ok, 'image/png'));

async function picture(src) {
  const img = new Image();
  img.src = src;
  await img.decode().catch(() => {
    throw new Error(`could not load ${src}`);
  });
  return img;
}

// Peak and average (RMS) level of the sound, in dB below full scale, and its quietest half second.
function loudness(buffer) {
  const d = buffer.getChannelData(0), half = buffer.sampleRate / 2, db = (x) => (20 * Math.log10(x)).toFixed(1);
  let peak = 0, sum = 0, quiet = Infinity;
  for (let i = 0; i < d.length; i++) {
    peak = Math.max(peak, Math.abs(d[i]));
    sum += d[i] * d[i];
  }
  for (let i = 0; i + half <= d.length - half; i += half) {
    let s = 0;
    for (let j = i; j < i + half; j++) s += d[j] * d[j];
    quiet = Math.min(quiet, Math.sqrt(s / half));
  }
  return `peak ${db(peak)} dB, average ${db(Math.sqrt(sum / d.length))} dB, quietest half second ${db(quiet)} dB`;
}

async function stills(canvas, draw) {
  const SW = 270, SH = 480;
  const sheet = Object.assign(document.createElement('canvas'), { width: SW * REEL.stills.length, height: SH });
  const s = sheet.getContext('2d');
  for (const [i, t] of REEL.stills.entries()) {
    draw(t);
    await post(`/save/still-${t}.${REEL.png ? 'png' : 'jpg'}`, await (REEL.png ? png : jpg)(canvas)); // png: a sheet
    s.drawImage(canvas, i * SW, 0, SW, SH);
  }
  await post('/save/sheet.jpg', await jpg(sheet));
  await say(`OK   ${REEL.stills.length} still pictures (out/still-<seconds>.jpg) and all of them in out/sheet.jpg`);
}

async function main() {
  const job = await (await fetch('/job')).json();
  document.fonts.add(await new FontFace('Anton', 'url(/font/anton.ttf)').load());
  const img = { icon: await picture('/brand/icon.png') };
  for (const name of REEL.screens) img[name] = await picture(`/screens/${name}.png`);
  for (const name of REEL.art ?? []) img[name] = await picture(`/art/${name}.png`);
  const canvas = Object.assign(document.createElement('canvas'), { width: W, height: H });
  document.body.append(canvas);
  const c = canvas.getContext('2d');
  const draw = (t) => {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, W, H);
    REEL.draw(c, t, img);
  };
  await stills(canvas, draw);
  if (!job.stillsOnly) {
    const beat = await makeSound(REEL);
    const sound = job.voice ? await withVoice(beat, REEL) : beat;
    if (REEL.voice?.length && !job.voice) await say('     no voice clips yet (reels/voice.mjs): the beat alone');
    await say(`     sound level: ${loudness(sound)}`);
    const frames = Math.round(REEL.seconds * job.fps);
    const frameAt = (i) => draw(i / job.fps);
    if (job.ffmpeg) {
      const { viaFfmpeg } = await import('/page/frames.js');
      const took = await viaFfmpeg({ canvas, frames, frameAt, sound });
      await say(`OK   reel.mp4: ${frames} frames, made with ffmpeg in ${took.toFixed(1)} s`);
    } else {
      const { describe, makeMp4 } = await import('/page/encode.js'); // only here: stills work without the encoder
      const { file, took } = await makeMp4({ canvas, frames, fps: job.fps, bits: job.bits, sound, frameAt });
      await post('/save/reel.mp4', file);
      await say(`OK   reel.mp4: ${frames} frames, made in ${took.toFixed(1)} s`);
      await say(`     ${await describe(file)}`);
    }
  }
  await post('/done', 'ok');
}

main().catch(async (e) => {
  await say(`FAIL ${e.stack || e.message}`);
  await post('/done', 'fail');
});
