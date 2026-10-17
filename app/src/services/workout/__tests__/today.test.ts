import { EXERCISE_IDS, EXERCISES, isFreeExercise, PROGRAMS, WORKOUT } from '@/constants/exercises';
import { addDays } from '@/utils/dates';

import { todaysWorkout } from '../today';

const all = () => true;
const ids = (items: { id: string }[]) => items.map((i) => i.id);

describe("today's workout", () => {
  it('is the same all day, and another set tomorrow', () => {
    const day = '2026-10-17';
    expect(todaysWorkout('jawline', day, all)).toEqual(todaysWorkout('jawline', day, all));
    expect(ids(todaysWorkout('jawline', addDays(day, 1), all))).not.toEqual(ids(todaysWorkout('jawline', day, all)));
  });

  it("takes the area's exercises, with their usual reps, in catalog order", () => {
    const items = todaysWorkout('jawline', '2026-10-17', all);
    expect(items).toHaveLength(WORKOUT.todayCount);
    expect(items.every((i) => EXERCISES[i.id].program === 'jawline')).toBe(true);
    expect(items[0]).toEqual({ id: items[0].id, reps: EXERCISES[items[0].id].reps, holdSec: EXERCISES[items[0].id].holdSec, relaxSec: EXERCISES[items[0].id].relaxSec });
    const order = items.map((i) => EXERCISE_IDS.indexOf(i.id));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("brings every exercise of an area up within a few days", () => {
    for (const goal of PROGRAMS) {
      const seen = new Set<string>();
      for (let d = 0; d < 7; d++) for (const i of todaysWorkout(goal, addDays('2026-10-17', d), all)) seen.add(i.id);
      for (const id of EXERCISE_IDS.filter((x) => EXERCISES[x].program === goal)) expect(seen.has(id)).toBe(true);
    }
  });

  it('without Premium uses only the free exercises, topping up a small area from the others', () => {
    for (const goal of [...PROGRAMS, 'full' as const]) {
      const items = todaysWorkout(goal, '2026-10-17', isFreeExercise);
      expect(items).toHaveLength(WORKOUT.todayCount);
      expect(items.every((i) => isFreeExercise(i.id))).toBe(true);
    }
    const lips = todaysWorkout('lips', '2026-10-17', isFreeExercise);
    expect(lips.some((i) => EXERCISES[i.id].program === 'lips')).toBe(true);
  });

  it('works before its start date and with nothing allowed', () => {
    expect(todaysWorkout('eyes', '2025-03-01', all)).toHaveLength(WORKOUT.todayCount);
    expect(todaysWorkout('eyes', '2026-10-17', () => false)).toEqual([]);
  });
});
