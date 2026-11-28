// Reads and writes plain wav files (16-bit, not compressed).

// wav file bytes -> { rate, pcm }. pcm is one channel of 16-bit samples; a stereo file is mixed down.
export function readWav(bytes) {
  const buf = Buffer.from(bytes);
  if (buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WAVE') {
    throw new Error('not a wav file');
  }
  let at = 12;
  let fmt = null;
  while (at + 8 <= buf.length) {
    const id = buf.toString('latin1', at, at + 4);
    // Some programs write a wrong (too large) size for the last block, so it is capped.
    const size = Math.min(buf.readUInt32LE(at + 4), buf.length - at - 8);
    const start = at + 8;
    if (id === 'fmt ') {
      fmt = { kind: buf.readUInt16LE(start), channels: buf.readUInt16LE(start + 2), rate: buf.readUInt32LE(start + 4), bits: buf.readUInt16LE(start + 14) };
      // macOS sometimes writes the longer "extensible" header, which names the real kind further in.
      if (fmt.kind === 0xfffe && size >= 26) fmt.kind = buf.readUInt16LE(start + 24);
    } else if (id === 'data') {
      if (!fmt || fmt.kind !== 1 || fmt.bits !== 16) throw new Error('only 16-bit wav files are supported');
      const count = Math.floor(size / 2 / fmt.channels);
      const pcm = new Int16Array(count);
      for (let i = 0; i < count; i++) {
        let sum = 0;
        for (let c = 0; c < fmt.channels; c++) sum += buf.readInt16LE(start + (i * fmt.channels + c) * 2);
        pcm[i] = Math.round(sum / fmt.channels);
      }
      return { rate: fmt.rate, pcm };
    }
    at = start + size + (size % 2);
  }
  throw new Error('the wav file has no sound data');
}

// One channel of 16-bit samples -> wav file bytes.
export function writeWav(pcm, rate) {
  const data = Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}
