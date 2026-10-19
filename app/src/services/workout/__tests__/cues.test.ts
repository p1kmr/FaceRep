import { EXERCISES, WORKOUT } from '@/constants/exercises';

import { beepFor, cueFor, speechLanguage, type Beep, type Cue } from '../cues';
import { defaultItem } from '../items';
import { createWorkout, workoutReducer, type WorkoutAction, type WorkoutState } from '../timer';

/** Runs a workout to the end and collects every cue the voice would say. */
function cuesOf(ids: Parameters<typeof defaultItem>[0][], actions: (s: WorkoutState) => WorkoutAction = () => ({ type: 'tick' })) {
  let s = createWorkout(ids.map(defaultItem));
  const cues: Cue[] = [];
  const first = cueFor(null, s);
  if (first) cues.push(first);
  while (s.phase !== 'done') {
    const next = workoutReducer(s, actions(s));
    const cue = cueFor(s, next);
    if (cue) cues.push(cue);
    s = next;
  }
  return cues;
}

describe('voice cues', () => {
  it('announces the first exercise, every squeeze and relax, the last rep, what is next, and the end', () => {
    const lips = EXERCISES['18-lip-press'];
    const cues = cuesOf(['09-brow-lift', '18-lip-press']);
    const brow = EXERCISES['09-brow-lift'];
    expect(cues[0]).toEqual({ kind: 'start', exercise: 'browLift' });
    expect(cues[1]).toEqual({ kind: 'hold', last: false, massage: false });
    expect(cues[2]).toEqual({ kind: 'relax' });
    const holds = cues.filter((c) => c.kind === 'hold');
    expect(holds).toHaveLength(brow.reps + lips.reps);
    expect(holds.filter((c) => c.kind === 'hold' && c.last)).toHaveLength(2);
    expect(cues.filter((c) => c.kind === 'relax')).toHaveLength(brow.reps - 1 + lips.reps - 1);
    expect(cues).toContainEqual({ kind: 'next', exercise: lips.key });
    expect(cues.at(-1)).toEqual({ kind: 'done' });
  });

  it('says "massage" instead of "squeeze" for the massage program', () => {
    const cues = cuesOf(['27-temple-circles']);
    expect(cues.filter((c) => c.kind === 'hold').every((c) => c.kind === 'hold' && c.massage)).toBe(true);
  });

  it('stays quiet on ticks, pause and resume', () => {
    const s = createWorkout([defaultItem('09-brow-lift')]);
    const ticked = workoutReducer(s, { type: 'tick' });
    expect(ticked.remaining).toBe(WORKOUT.getReadySec - 1);
    expect(cueFor(s, ticked)).toBeNull();
    const paused = workoutReducer(ticked, { type: 'pause' });
    expect(cueFor(ticked, paused)).toBeNull();
    expect(cueFor(paused, workoutReducer(paused, { type: 'resume' }))).toBeNull();
  });

  it('announces the next exercise after a skip, even from a rest', () => {
    let s = createWorkout(['09-brow-lift', '10-eye-squeeze', '16-wide-eyes'].map((id) => defaultItem(id as never)));
    let next = workoutReducer(s, { type: 'skip' });
    expect(cueFor(s, next)).toEqual({ kind: 'next', exercise: 'eyeSqueeze' });
    s = next;
    next = workoutReducer(s, { type: 'skip' });
    expect(cueFor(s, next)).toEqual({ kind: 'next', exercise: 'wideEyes' });
    expect(cueFor(next, workoutReducer(next, { type: 'skip' }))).toEqual({ kind: 'done' });
  });

  it('says nothing for an empty workout or when opened mid-way', () => {
    expect(cueFor(null, createWorkout([]))).toBeNull();
    const s = workoutReducer(createWorkout([defaultItem('09-brow-lift')]), { type: 'skip' });
    expect(cueFor(null, s)).toBeNull();
  });

  it("uses the device's regional voice when it speaks the app's language", () => {
    expect(speechLanguage('en', ['en-GB', 'de-DE'])).toBe('en-GB');
    expect(speechLanguage('en', ['de-DE', 'en-IN'])).toBe('en-IN');
    expect(speechLanguage('en', ['de-DE'])).toBe('en-US');
    expect(speechLanguage('pt-BR', ['pt-PT'])).toBe('pt-BR');
    expect(speechLanguage('de', [])).toBe('de-DE');
    expect(speechLanguage('xx', [])).toBe('xx');
  });
});

/** Runs a workout to the end, a tick at a time, and collects what each second sounds like with beeps. */
function beepsOf(ids: Parameters<typeof defaultItem>[0][]) {
  let s = createWorkout(ids.map(defaultItem));
  const beeps: (Beep | null)[] = [beepFor(null, s)];
  while (s.phase !== 'done') {
    const next = workoutReducer(s, { type: 'tick' });
    beeps.push(beepFor(s, next));
    s = next;
  }
  return beeps;
}

type Timing = { reps: number; holdSec: number; relaxSec: number };
const quiet = (seconds: number) => Array<null>(seconds).fill(null);
/** One squeeze: go, then a tick for each of its other seconds. */
const squeeze = (e: Timing): Beep[] => ['go', ...Array<Beep>(e.holdSec - 1).fill('tick')];
/** An exercise from its first squeeze to its last, with release and the quiet seconds of relaxing in between. */
const reps = (e: Timing) => [
  ...Array.from({ length: e.reps - 1 }, () => [...squeeze(e), 'release', ...quiet(e.relaxSec - 1)]).flat(),
  ...squeeze(e),
];
const countdown: Beep[] = ['count', 'count', 'count'];

describe('beeps', () => {
  it('count down 3, 2, 1, then go, tick through each squeeze, release, stay quiet while relaxing, and end with done', () => {
    const brow = EXERCISES['09-brow-lift'];
    expect(beepsOf(['09-brow-lift'])).toEqual([...quiet(WORKOUT.getReadySec - 3), ...countdown, ...reps(brow), 'done']);
  });

  it('release after the last squeeze, then count down to the next exercise at the end of the rest', () => {
    const [brow, lips] = [EXERCISES['09-brow-lift'], EXERCISES['18-lip-press']];
    expect(beepsOf(['09-brow-lift', '18-lip-press'])).toEqual([
      ...quiet(WORKOUT.getReadySec - 3),
      ...countdown,
      ...reps(brow),
      'release',
      ...quiet(WORKOUT.restSec - 4),
      ...countdown,
      ...reps(lips),
      'done',
    ]);
  });

  it('stay quiet on pause and resume, and while paused', () => {
    const s = workoutReducer(createWorkout([defaultItem('09-brow-lift')]), { type: 'tick' });
    const paused = workoutReducer(s, { type: 'pause' });
    expect(beepFor(s, paused)).toBeNull();
    expect(beepFor(paused, workoutReducer(paused, { type: 'tick' }))).toBeNull();
    expect(beepFor(paused, workoutReducer(paused, { type: 'resume' }))).toBeNull();
  });

  it('release on a skip, and say nothing for an empty workout or one opened mid-way', () => {
    let s = createWorkout(['09-brow-lift', '10-eye-squeeze'].map((id) => defaultItem(id as never)));
    while (s.phase !== 'hold') s = workoutReducer(s, { type: 'tick' });
    const skipped = workoutReducer(s, { type: 'skip' });
    expect(beepFor(s, skipped)).toBe('release');
    expect(beepFor(skipped, workoutReducer(skipped, { type: 'skip' }))).toBe('done');
    expect(beepFor(null, createWorkout([]))).toBeNull();
    expect(beepFor(null, skipped)).toBeNull();
  });
});
