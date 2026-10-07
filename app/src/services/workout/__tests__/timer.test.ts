import { EXERCISES, WORKOUT } from '@/constants/exercises';

import { defaultItem, workoutSeconds } from '../items';
import { createWorkout as create, currentExercise, workoutReducer, workoutResult, type WorkoutState } from '../timer';

const createWorkout = (ids: Parameters<typeof defaultItem>[0][]) => create(ids.map(defaultItem));

const tick = (s: WorkoutState, n = 1) => {
  let out = s;
  for (let i = 0; i < n; i++) out = workoutReducer(out, { type: 'tick' });
  return out;
};

describe('workout timer', () => {
  const brow = EXERCISES['09-brow-lift'];

  it('starts with a get-ready countdown, then holds and relaxes', () => {
    let s = createWorkout(['09-brow-lift']);
    expect(s).toMatchObject({ phase: 'ready', remaining: WORKOUT.getReadySec, rep: 1 });
    s = tick(s, WORKOUT.getReadySec);
    expect(s).toMatchObject({ phase: 'hold', remaining: brow.holdSec, rep: 1 });
    s = tick(s, brow.holdSec);
    expect(s).toMatchObject({ phase: 'relax', rep: 1 });
    expect(s.completedReps).toEqual([1]);
    s = tick(s, brow.relaxSec);
    expect(s).toMatchObject({ phase: 'hold', rep: 2 });
  });

  it('runs to done in exactly workoutSeconds ticks', () => {
    const queue = ['09-brow-lift', '10-eye-squeeze'] as const;
    let s = createWorkout([...queue]);
    const total = workoutSeconds(queue.map(defaultItem));
    s = tick(s, total - 1);
    expect(s.phase).not.toBe('done');
    s = tick(s);
    expect(s.phase).toBe('done');
    expect(s.elapsedSec).toBe(total);
    expect(workoutResult(s)).toEqual({
      exercises: [
        { id: '09-brow-lift', reps: brow.reps },
        { id: '10-eye-squeeze', reps: EXERCISES['10-eye-squeeze'].reps },
      ],
      totalReps: brow.reps + EXERCISES['10-eye-squeeze'].reps,
      durationSec: total,
    });
  });

  it('shows a rest (next up) between exercises', () => {
    let s = createWorkout(['09-brow-lift', '10-eye-squeeze']);
    s = tick(s, WORKOUT.getReadySec + brow.reps * (brow.holdSec + brow.relaxSec) - brow.relaxSec);
    expect(s).toMatchObject({ phase: 'rest', index: 1, rep: 1, remaining: WORKOUT.restSec });
  });

  it('pause stops time; resume continues', () => {
    let s = tick(createWorkout(['09-brow-lift']));
    s = workoutReducer(s, { type: 'pause' });
    const paused = tick(s, 10);
    expect(paused.remaining).toBe(s.remaining);
    expect(paused.elapsedSec).toBe(s.elapsedSec);
    expect(tick(workoutReducer(paused, { type: 'resume' })).remaining).toBe(s.remaining - 1);
  });

  it('skip moves on and keeps finished reps only', () => {
    let s = tick(createWorkout(['09-brow-lift', '10-eye-squeeze']), WORKOUT.getReadySec + brow.holdSec);
    s = workoutReducer(s, { type: 'skip' });
    expect(s).toMatchObject({ index: 1, phase: 'rest' });
    s = workoutReducer(s, { type: 'skip' });
    expect(s.phase).toBe('done');
    expect(workoutResult(s).exercises).toEqual([{ id: '09-brow-lift', reps: 1 }]);
  });

  it("uses the session's reps and hold time (a plan day changes them)", () => {
    let s = create([{ id: '09-brow-lift', reps: 2, holdSec: brow.holdSec + 2, relaxSec: brow.relaxSec }]);
    expect(currentExercise(s)).toMatchObject({ key: brow.key, reps: 2, holdSec: brow.holdSec + 2 });
    s = tick(s, WORKOUT.getReadySec);
    expect(s).toMatchObject({ phase: 'hold', remaining: brow.holdSec + 2 });
    s = tick(s, 2 * (brow.holdSec + 2) + brow.relaxSec);
    expect(s.phase).toBe('done');
    expect(workoutResult(s).exercises).toEqual([{ id: '09-brow-lift', reps: 2 }]);
  });

  it('an empty queue is done right away', () => {
    expect(createWorkout([]).phase).toBe('done');
  });
});
