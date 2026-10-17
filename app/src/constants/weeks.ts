import type { ExerciseId } from './exercises';

/**
 * The weeks of Today's workout (services/workout/weeks.ts). They never end and never show a total: a week is seven
 * days with a finished workout, from the same exercises every week. The steps make the start gentle and stop at a top
 * that stays. Jaw-caution exercises never go above their usual reps or hold.
 */
export const WEEKS = {
  daysPerWeek: 7,
  /**
   * From which week each step trains (the last one stays): percent of each exercise's usual reps, seconds added to its
   * hold (never to a jaw-caution one), and whether jaw-caution exercises are in yet. `note` names it on the Today card.
   */
  steps: [
    { from: 1, note: 'learn', repPct: 70, holdPlusSec: 0, jaw: false },
    { from: 2, note: 'build', repPct: 85, holdPlusSec: 0, jaw: true },
    { from: 3, note: 'full', repPct: 100, holdPlusSec: 0, jaw: true },
    { from: 4, note: 'hold1', repPct: 100, holdPlusSec: 1, jaw: true },
    { from: 8, note: 'hold2', repPct: 100, holdPlusSec: 2, jaw: true },
  ],
  /** The last day of every week: a few gentle exercises, lighter, nothing that loads the jaw. */
  easy: { count: 3, repPct: 70 },
  /** A share of the usual reps never goes below this. */
  minReps: 3,
  /** Weeks whose end gets its own line on Today ("12 weeks of practice"). */
  milestones: [4, 8, 12, 26, 52],
} as const;

/** The easy day picks from these: stretches, the eyes and the massage (topped up from the other gentle ones). */
export const EASY_DAY_IDS: readonly ExerciseId[] = [
  '05-neck-stretch',
  '11-chin-tuck',
  '16-wide-eyes',
  '24-jaw-release',
  '25-jawline-sweep',
  '26-frown-release',
  '27-temple-circles',
];
