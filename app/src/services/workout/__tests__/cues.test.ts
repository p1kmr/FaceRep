import { EXERCISES, WORKOUT } from '@/constants/exercises';

import { cueFor, speechLanguage, type Cue } from '../cues';
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
