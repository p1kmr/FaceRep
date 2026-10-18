/** Free-plan limits (Premium removes them). */
export const FREE_LIMITS = {
  /**
   * AI Coach answers per calendar month on the free plan. A small taste so people see the
   * value before paying. Must match FREE_PER_MONTH in worker/src/lib/access.js.
   */
  aiPerMonth: 3,
  /**
   * Face scans in all (not per month) on the free plan. The scan runs only on the iPhone, so this is the one limit the
   * app itself keeps (docs/face-scan.md). Must match FREE_SCANS in worker/src/pages.js (the Terms).
   */
  scans: 3,
} as const;

// Premium Coach answers are unlimited. The Worker's daily ceiling (LIMITS in worker/src/lib/ratelimit.js) only stops
// abuse and is never shown in the app (docs/app-review.md).

/** Chat sizes, matching the Worker's limits (worker/src/lib/validate.js). */
export const CHAT_LIMITS = {
  questionChars: 500,
  turnChars: 1500,
  historyTurns: 10,
  /** Messages kept of each chat on the iPhone (older ones are deleted). */
  storedMessages: 200,
  /** Chats kept in History (the ones with the oldest last answer are deleted). */
  storedChats: 100,
} as const;

/** Ask for an App Store rating after this many finished workouts (never more than once per 120 days). */
export const REVIEW_PROMPT = { afterWorkouts: 3, minDaysBetween: 120 } as const;

/** Space kept free under every scrolling screen so the floating Coach button never covers the last row. */
export const ASK_BUTTON_ROOM = 88;

/** The first-time speech bubble next to the floating Coach button. */
export const ASK_HINT = {
  /** Shown on this many app opens at most, then never again. */
  maxShows: 3,
  delayMs: 1200,
  /** Hides by itself after this long. */
  visibleMs: 9000,
} as const;
