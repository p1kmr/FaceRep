import { EXERCISE_IDS, EXERCISES, isFreeExercise, WORKOUT, type ExerciseId, type Goal } from '@/constants/exercises';
import { EASY_DAY_IDS, WEEKS } from '@/constants/weeks';

import type { WorkoutItem } from './items';
import { dosedItem, isFreeDay, stepOf, weekDay, workoutsBefore, type WeekDay, type WeekNote } from './weeks';

const rotate = <T>(list: readonly T[], by: number): T[] => {
  if (!list.length) return [];
  const n = ((by % list.length) + list.length) % list.length;
  return [...list.slice(n), ...list.slice(0, n)];
};

/** `count` of `primary` from a window that moves with `n`; when there are fewer, topped up from `others`. */
const pick = (primary: readonly ExerciseId[], others: readonly ExerciseId[], count: number, n: number) =>
  primary.length >= count ? rotate(primary, n * count).slice(0, count) : [...primary, ...rotate(others, n).slice(0, count - primary.length)];

/** In catalog order, so massage stays last as a cool-down. */
const inCatalogOrder = (ids: readonly ExerciseId[]) => EXERCISE_IDS.filter((id) => ids.includes(id));

export interface TodaysWorkout extends WeekDay {
  /** What this week trains (home:today.notes.<note>); the easy day has its own line. */
  note: WeekNote;
  items: WorkoutItem[];
}

/**
 * Today's workout after `done` finished days (services/workout/weeks.ts), from the exercises `allowed` (without
 * Premium, the free ones). Days 1–6: WORKOUT.todayCount exercises of the focus area, a window that moves with every
 * workout day so each one comes up in turn (an area with fewer is topped up from the others; full face goes through
 * them all), at the week's step. Week 1 leaves out the exercises that load the jaw. Day 7 is the easy day: a few
 * gentle ones, lighter, changing every week. Pure: the same days done give the same workout.
 */
export function todaysWorkout(goal: Goal, done: number, allowed: (id: ExerciseId) => boolean): TodaysWorkout {
  const where = weekDay(done);
  const step = stepOf(where.week);
  if (where.easy) {
    const gentle = EXERCISE_IDS.filter((id) => allowed(id) && !EXERCISES[id].jawCaution);
    const ids = pick(
      gentle.filter((id) => EASY_DAY_IDS.includes(id)),
      gentle.filter((id) => !EASY_DAY_IDS.includes(id)),
      WEEKS.easy.count,
      where.week,
    );
    return { ...where, note: step.note, items: inCatalogOrder(ids).map((id) => dosedItem(id, WEEKS.easy.repPct, 0)) };
  }
  const pool = EXERCISE_IDS.filter((id) => allowed(id) && (step.jaw || !EXERCISES[id].jawCaution));
  const ids =
    goal === 'full'
      ? pick(pool, [], WORKOUT.todayCount, workoutsBefore(done))
      : pick(
          pool.filter((id) => EXERCISES[id].program === goal),
          pool.filter((id) => EXERCISES[id].program !== goal),
          WORKOUT.todayCount,
          workoutsBefore(done),
        );
  return { ...where, note: step.note, items: inCatalogOrder(ids).map((id) => dosedItem(id, step.repPct, step.holdPlusSec)) };
}

const anyExercise = () => true;

/**
 * Which exercises the day after `done` finished days is made from: every one with Premium. Without it, the free ones
 * on the free days (WEEKS.freeDays), and every one on a later day: that day shows locked, as it will be once unlocked.
 */
export const dayAllowed = (premium: boolean, done: number): ((id: ExerciseId) => boolean) =>
  premium || !isFreeDay(done) ? anyExercise : isFreeExercise;

/** The one exercise a locked day names, its first free one (the others stay hidden); null when it has none. */
export const previewOf = (items: readonly WorkoutItem[]): WorkoutItem | null => items.find((i) => isFreeExercise(i.id)) ?? null;

/**
 * The week the day after `done` finished days is in, day 1 to 7, each as todaysWorkout makes it from the exercises
 * `allowedFor` that day (dayAllowed): the days before are done, the later ones come one workout at a time. Only this
 * week, never a total.
 */
export function weekWorkouts(goal: Goal, done: number, allowedFor: (dayDone: number) => (id: ExerciseId) => boolean): TodaysWorkout[] {
  const first = (weekDay(done).week - 1) * WEEKS.daysPerWeek;
  return Array.from({ length: WEEKS.daysPerWeek }, (_, i) => todaysWorkout(goal, first + i, allowedFor(first + i)));
}
