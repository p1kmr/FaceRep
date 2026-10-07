import { EXERCISES, WORKOUT, type Exercise, type ExerciseId } from '@/constants/exercises';

import type { WorkoutItem } from './items';

/**
 * The workout as a pure state machine, ticked once per second by useWorkout().
 * ready (first exercise only) → hold → relax → hold … → rest (preview next) → hold … → done
 */
export type Phase = 'ready' | 'hold' | 'relax' | 'rest' | 'done';

export interface WorkoutState {
  /** The exercises with this session's reps and timing (a plan day can change them). */
  queue: WorkoutItem[];
  index: number;
  /** 1-based rep of the current exercise. */
  rep: number;
  phase: Phase;
  /** Whole seconds left in this phase. */
  remaining: number;
  paused: boolean;
  /** Seconds spent working out (pauses excluded). */
  elapsedSec: number;
  /** Reps finished per queue index. */
  completedReps: number[];
}

export type WorkoutAction = { type: 'tick' } | { type: 'pause' } | { type: 'resume' } | { type: 'skip' };

export function createWorkout(queue: WorkoutItem[]): WorkoutState {
  return {
    queue,
    index: 0,
    rep: 1,
    phase: queue.length ? 'ready' : 'done',
    remaining: queue.length ? WORKOUT.getReadySec : 0,
    paused: false,
    elapsedSec: 0,
    completedReps: queue.map(() => 0),
  };
}

/** The current exercise with this session's reps and timing. */
export const currentExercise = (s: WorkoutState): Exercise | null =>
  s.phase === 'done' ? null : { ...EXERCISES[s.queue[s.index].id], ...s.queue[s.index] };

/** Length of the current phase, for progress rings. */
export function phaseDuration(s: WorkoutState): number {
  const e = currentExercise(s);
  if (!e) return 0;
  if (s.phase === 'ready') return WORKOUT.getReadySec;
  if (s.phase === 'rest') return WORKOUT.restSec;
  return s.phase === 'hold' ? e.holdSec : e.relaxSec;
}

function nextExercise(s: WorkoutState): WorkoutState {
  if (s.index + 1 >= s.queue.length) return { ...s, phase: 'done', remaining: 0 };
  return { ...s, index: s.index + 1, rep: 1, phase: 'rest', remaining: WORKOUT.restSec };
}

function advance(s: WorkoutState): WorkoutState {
  const e = s.queue[s.index];
  switch (s.phase) {
    case 'ready':
    case 'rest':
      return { ...s, phase: 'hold', remaining: e.holdSec };
    case 'hold': {
      const completedReps = s.completedReps.map((r, i) => (i === s.index ? s.rep : r));
      const next = { ...s, completedReps };
      return s.rep < e.reps ? { ...next, phase: 'relax', remaining: e.relaxSec } : nextExercise(next);
    }
    case 'relax':
      return { ...s, rep: s.rep + 1, phase: 'hold', remaining: e.holdSec };
    default:
      return s;
  }
}

export function workoutReducer(s: WorkoutState, action: WorkoutAction): WorkoutState {
  if (s.phase === 'done') return s;
  switch (action.type) {
    case 'tick': {
      if (s.paused) return s;
      const ticked = { ...s, remaining: s.remaining - 1, elapsedSec: s.elapsedSec + 1 };
      return ticked.remaining > 0 ? ticked : advance(ticked);
    }
    case 'pause':
      return { ...s, paused: true };
    case 'resume':
      return { ...s, paused: false };
    case 'skip':
      return nextExercise({ ...s, paused: false });
    default:
      return s;
  }
}

export interface WorkoutResult {
  exercises: { id: ExerciseId; reps: number }[];
  totalReps: number;
  durationSec: number;
}

/** What gets saved: only exercises with at least one finished rep. */
export function workoutResult(s: WorkoutState): WorkoutResult {
  const exercises = s.queue.map(({ id }, i) => ({ id, reps: s.completedReps[i] })).filter((e) => e.reps > 0);
  return { exercises, totalReps: exercises.reduce((n, e) => n + e.reps, 0), durationSec: s.elapsedSec };
}
