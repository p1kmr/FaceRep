/** Starter questions on the empty Coach screen (i18n: coach:suggestions.<key>): what it can prepare first, then questions. */
export const COACH_SUGGESTIONS = ['routine', 'reminder', 'mewing', 'jawline', 'skincare'] as const;
export type CoachSuggestion = (typeof COACH_SUGGESTIONS)[number];
