// Works out when each word is spoken, for a voice engine that gives no timings
// (ElevenLabs through its Claude tools, and Gemini).
// It finds the pauses in the sound, ties them to the line ends, full stops and commas of the
// text, and shares the time between two pauses out by the length of each word.

const STEP = 0.01; // the sound is measured in steps of this many seconds
const MIN_PAUSE = 0.12; // a quiet stretch shorter than this is part of a word, not a pause

// Where speech starts and ends, and the pauses in between. Times are in seconds.
export function findPauses(pcm, rate) {
  const size = Math.round(rate * STEP);
  const steps = Math.floor(pcm.length / size);
  const level = new Float32Array(steps);
  for (let s = 0; s < steps; s++) {
    let sum = 0;
    for (let i = s * size; i < (s + 1) * size; i++) sum += pcm[i] * pcm[i];
    level[s] = Math.sqrt(sum / size);
  }
  // "Quiet" is measured against a typical loud moment, so it works for soft and loud voices.
  const loud = Float32Array.from(level).sort()[Math.floor(steps * 0.95)] || 0;
  const quiet = Math.max(loud * 0.05, 30);
  let first = 0;
  while (first < steps && level[first] < quiet) first++;
  let last = steps - 1;
  while (last > first && level[last] < quiet) last--;
  const pauses = [];
  let from = -1;
  for (let s = first; s <= last; s++) {
    if (level[s] < quiet) {
      if (from < 0) from = s;
    } else if (from >= 0) {
      if ((s - from) * STEP >= MIN_PAUSE) pauses.push({ start: from * STEP, end: s * STEP });
      from = -1;
    }
  }
  return { start: first * STEP, end: (last + 1) * STEP, pauses };
}

// How long a word takes to say, compared with other words: its letters and its beats (vowel groups).
// These numbers gave the smallest error against Edge TTS's real word times (see plan/phase1.md).
// A number is said as words ("2" is "do", "20" is "bees"), so its digits count like a short word.
function weightOf(word) {
  const letters = word.replace(/[^\p{L}\p{N}]/gu, '');
  const beats = (letters.match(/[aeiouy]+/gi) || []).length;
  const digits = (letters.match(/\p{N}/gu) || []).length;
  return Math.max(0.5, (letters.length - digits) * 0.5 + beats * 1.5 + (digits ? 1.4 + 1.2 * digits : 0));
}

// How strong a pause the text asks for after a word: 3 line end, 2 sentence end, 1 comma, 0 none.
function pauseAfter(word, lastInLine) {
  if (lastInLine) return 3;
  if (/[.?!।…]["'”’)]*$/.test(word)) return 2;
  if (/[,;:—–]["'”’)]*$/.test(word)) return 1;
  return 0;
}

// Places words[i0..i1) inside the time from t0 to t1.
function place(words, i0, i1, t0, t1, pauses) {
  let total = 0;
  for (let i = i0; i < i1; i++) total += words[i].weight;
  const inside = pauses.filter((p) => p.start > t0 && p.end < t1);

  // Find the pause that best fits a place where the text asks for one, and split there.
  const reach = Math.min(2, 0.3 + 0.08 * (t1 - t0));
  let best = null;
  let run = 0;
  for (let b = i0 + 1; b < i1; b++) {
    run += words[b - 1].weight;
    const strength = words[b - 1].pause;
    if (!strength) continue;
    const expected = t0 + (run / total) * (t1 - t0);
    for (const p of inside) {
      const off = Math.abs((p.start + p.end) / 2 - expected);
      if (off > reach) continue;
      const score = (p.end - p.start) * strength * (1 - off / reach);
      if (!best || score > best.score) best = { b, p, score };
    }
  }
  if (best) {
    place(words, i0, best.b, t0, best.p.start, pauses);
    place(words, best.b, i1, best.p.end, t1, pauses);
    return;
  }

  // No such pause: share the spoken time out by word length, stepping over any pause left inside.
  const spoken = t1 - t0 - inside.reduce((sum, p) => sum + p.end - p.start, 0);
  let before = 0;
  const jumps = inside.map((p) => {
    const at = p.start - t0 - before; // where the pause sits, counted in spoken time
    before += p.end - p.start;
    return { at, length: p.end - p.start };
  });
  const clock = (u, wordStart) => {
    let t = t0 + u;
    for (const j of jumps) if (wordStart ? j.at <= u + 1e-6 : j.at < u - 1e-6) t += j.length;
    return t;
  };
  let done = 0;
  for (let i = i0; i < i1; i++) {
    words[i].start = clock((done / total) * spoken, true);
    done += words[i].weight;
    words[i].end = clock((done / total) * spoken, false);
  }
}

// pcm: one channel of 16-bit samples. lines: the caption text of each line, in order.
// Returns { seconds, lines: [{ start, end, words: [{ text, start, end }] }] }.
export function estimateTimings(pcm, rate, lines, weight = weightOf) {
  const words = [];
  lines.forEach((text, line) => {
    const parts = text.trim().split(/\s+/).filter(Boolean);
    parts.forEach((w, i) => words.push({ text: w, line, weight: weight(w), pause: pauseAfter(w, i === parts.length - 1) }));
  });
  const speech = findPauses(pcm, rate);
  place(words, 0, words.length, speech.start, speech.end, speech.pauses);
  const round = (x) => Math.round(x * 1000) / 1000;
  return {
    seconds: round(pcm.length / rate),
    lines: lines.map((_, line) => {
      const mine = words.filter((w) => w.line === line).map((w) => ({ text: w.text, start: round(w.start), end: round(w.end) }));
      return { start: mine[0]?.start ?? 0, end: mine.at(-1)?.end ?? 0, words: mine };
    }),
  };
}
