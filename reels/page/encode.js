// Puts the reel in an MP4: H.264 picture from the canvas and AAC sound from one AudioBuffer, with Mediabunny (the
// same version and file as Reel Studio's engine/encode.js). Chrome on the Mac encodes both itself. describe() reads
// the file back and says what is in it.

import {
  ALL_FORMATS, AudioBufferSource, BlobSource, BufferTarget, CanvasSource, Input, Mp4OutputFormat, Output, Quality,
  canEncodeAudio, canEncodeVideo,
} from 'mediabunny';

const SOUND_BITS = 160_000;

export async function makeMp4({ canvas, frames, fps, bits, frameAt, sound }) {
  const { width, height } = canvas;
  const audio = { numberOfChannels: sound.numberOfChannels, sampleRate: sound.sampleRate, bitrate: SOUND_BITS };
  if (!(await canEncodeVideo('avc', { width, height, bitrate: bits }))) throw new Error('this Chrome cannot encode H.264');
  if (!(await canEncodeAudio('aac', audio))) throw new Error('this Chrome cannot encode AAC');
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const picture = new CanvasSource(canvas, { codec: 'avc', quality: new Quality({ bitrate: bits }), keyFrameInterval: 1 });
  const track = new AudioBufferSource({ codec: 'aac', quality: new Quality({ bitrate: SOUND_BITS }) });
  output.addVideoTrack(picture, { frameRate: fps });
  output.addAudioTrack(track);
  await output.start();
  const began = performance.now();
  const soundDone = track.add(sound);
  for (let i = 0; i < frames; i++) {
    frameAt(i);
    await picture.add(i / fps, 1 / fps);
  }
  await soundDone;
  await output.finalize();
  return { file: output.target.buffer, took: (performance.now() - began) / 1000 };
}

export async function describe(file) {
  const input = new Input({ source: new BlobSource(new Blob([file], { type: 'video/mp4' })), formats: ALL_FORMATS });
  const v = await input.getPrimaryVideoTrack(), a = await input.getPrimaryAudioTrack();
  return (
    `picture ${await v.getCodecParameterString()} ${v.displayWidth}x${v.displayHeight}, ${(await v.computeDuration()).toFixed(2)} s; ` +
    `sound ${await a.getCodecParameterString()} ${a.sampleRate} Hz, ${(await a.computeDuration()).toFixed(2)} s`
  );
}
