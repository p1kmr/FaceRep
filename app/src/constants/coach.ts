/** Starter questions on the empty Coach screen (i18n: coach:suggestions.<key>). */
export const COACH_SUGGESTIONS = ['jawline', 'mewing', 'reminder', 'skincare', 'doubleChin'] as const;
export type CoachSuggestion = (typeof COACH_SUGGESTIONS)[number];
