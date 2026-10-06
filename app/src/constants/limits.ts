/** Free-plan limits (Premium removes them). */
export const FREE_LIMITS = {
  /**
   * AI Coach answers per calendar month on the free plan. A small taste so people see the
   * value before paying. Must match FREE_PER_MONTH in worker/src/lib/access.js.
   */
  aiPerMonth: 3,
} as const;

/** Chat sizes, matching the Worker's limits (worker/src/lib/validate.js). */
export const CHAT_LIMITS = {
  questionChars: 500,
  turnChars: 1500,
  historyTurns: 10,
  /** Messages kept in the on-device chat history (older ones are deleted). */
  storedMessages: 200,
} as const;

/** Ask for an App Store rating after this many finished workouts (never more than once per 120 days). */
export const REVIEW_PROMPT = { afterWorkouts: 3, minDaysBetween: 120 } as const;
