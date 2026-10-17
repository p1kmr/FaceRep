import { EXERCISE_IDS, EXERCISES, isFreeExercise, PROGRAMS, WORKOUT, type ExerciseId, type Goal } from '@/constants/exercises';
import { EASY_DAY_IDS, WEEKS } from '@/constants/weeks';

import { todaysWorkout } from '../today';

const all = () => true;
const ids = (w: { items: { id: ExerciseId }[] }) => w.items.map((i) => i.id);
/** Days done before day `day` of week `week`. */
const at = (week: number, day: number) => (week - 1) * WEEKS.daysPerWeek + day - 1;
const GOALS_ALL: Goal[] = [...PROGRAMS, 'full'];

describe("today's workout", () => {
  it('is the same for the same days done, and another set after the next workout', () => {
    expect(todaysWorkout('jawline', at(3, 2), all)).toEqual(todaysWorkout('jawline', at(3, 2), all));
    expect(ids(todaysWorkout('jawline', at(3, 3), all))).not.toEqual(ids(todaysWorkout('jawline', at(3, 2), all)));
  });

  it('says where it is: week, day and the week’s step', () => {
    expect(todaysWorkout('eyes', at(1, 1), all)).toMatchObject({ week: 1, day: 1, easy: false, note: 'learn' });
    expect(todaysWorkout('eyes', at(4, 7), all)).toMatchObject({ week: 4, day: 7, easy: true, note: 'hold1' });
    expect(todaysWorkout('eyes', at(30, 2), all)).toMatchObject({ week: 30, day: 2, note: 'hold2' });
  });

  it("takes the area's exercises, in catalog order, at full reps from week 3", () => {
    const w = todaysWorkout('jawline', at(3, 1), all);
    expect(w.items).toHaveLength(WORKOUT.todayCount);
    expect(w.items.every((i) => EXERCISES[i.id].program === 'jawline')).toBe(true);
    for (const i of w.items) expect(i).toEqual({ id: i.id, reps: EXERCISES[i.id].reps, holdSec: EXERCISES[i.id].holdSec, relaxSec: EXERCISES[i.id].relaxSec });
    const order = w.items.map((i) => EXERCISE_IDS.indexOf(i.id));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('leaves the jaw-caution exercises out of week 1, with fewer reps', () => {
    for (const goal of GOALS_ALL) {
      for (let d = 1; d <= 6; d++) {
        const w = todaysWorkout(goal, at(1, d), all);
        expect(w.items.some((i) => EXERCISES[i.id].jawCaution)).toBe(false);
        for (const i of w.items) expect(i.reps).toBeLessThan(EXERCISES[i.id].reps);
      }
    }
  });

  it('brings the jaw exercises in from week 2, never above their usual reps or hold', () => {
    const seen = new Set<ExerciseId>();
    for (let d = 1; d <= 6; d++) for (const id of ids(todaysWorkout('jawline', at(2, d), all))) seen.add(id);
    expect(seen.has('01-jaw-clench') && seen.has('03-jaw-jut')).toBe(true);
    for (const goal of GOALS_ALL) {
      for (let done = 0; done < 7 * 60; done++) {
        for (const i of todaysWorkout(goal, done, all).items) {
          if (!EXERCISES[i.id].jawCaution) continue;
          expect(i.reps).toBeLessThanOrEqual(EXERCISES[i.id].reps);
          expect(i.holdSec).toBe(EXERCISES[i.id].holdSec);
        }
      }
    }
  });

  it('holds 1 second longer from week 4 and 2 from week 8, then stays there', () => {
    const plus = (week: number) => {
      const i = todaysWorkout('eyes', at(week, 1), all).items[0];
      return i.holdSec - EXERCISES[i.id].holdSec;
    };
    expect([3, 4, 7, 8, 9, 100].map(plus)).toEqual([0, 1, 1, 2, 2, 2]);
  });

  it('brings every exercise of an area up within the six workout days of a week', () => {
    for (const goal of PROGRAMS) {
      const seen = new Set<ExerciseId>();
      for (let d = 1; d <= 6; d++) for (const id of ids(todaysWorkout(goal, at(5, d), all))) seen.add(id);
      for (const id of EXERCISE_IDS.filter((x) => EXERCISES[x].program === goal)) expect(seen.has(id)).toBe(true);
    }
  });

  it('makes day 7 an easy day: a few gentle exercises, lighter, never the jaw ones, changing weekly', () => {
    const weeks = [1, 2, 3, 9].map((week) => todaysWorkout('jawline', at(week, 7), all));
    for (const w of weeks) {
      expect(w.easy).toBe(true);
      expect(w.items).toHaveLength(WEEKS.easy.count);
      for (const i of w.items) {
        expect(EASY_DAY_IDS).toContain(i.id);
        expect(EXERCISES[i.id].jawCaution).toBeFalsy();
        expect(i.reps).toBeLessThan(EXERCISES[i.id].reps);
        expect(i.holdSec).toBe(EXERCISES[i.id].holdSec);
      }
    }
    expect(ids(weeks[1])).not.toEqual(ids(weeks[0]));
  });

  it('without Premium uses only the free exercises, topping up a small area or the easy day from the others', () => {
    for (const goal of GOALS_ALL) {
      for (const done of [at(1, 1), at(3, 4), at(3, 7), at(12, 2)]) {
        const w = todaysWorkout(goal, done, isFreeExercise);
        expect(w.items).toHaveLength(w.easy ? WEEKS.easy.count : WORKOUT.todayCount);
        expect(w.items.every((i) => isFreeExercise(i.id))).toBe(true);
      }
    }
    expect(todaysWorkout('lips', at(3, 1), isFreeExercise).items.some((i) => EXERCISES[i.id].program === 'lips')).toBe(true);
  });

  it('is empty when nothing is allowed', () => {
    expect(todaysWorkout('eyes', at(2, 3), () => false).items).toEqual([]);
    expect(todaysWorkout('eyes', at(2, 7), () => false).items).toEqual([]);
  });
});
