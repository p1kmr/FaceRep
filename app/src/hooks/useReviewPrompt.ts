import { useCallback } from 'react';

import { REVIEW_PROMPT } from '@/constants/limits';
import { requestReview } from '@/services/review';
import { reviewPrompted } from '@/state/settings/actions';
import { diffInDays } from '@/utils/dates';

import { useProgressState } from './useProgress';
import { useSettings, useSettingsDispatch } from './useSettings';
import { useToday } from './useToday';

/** Call after a finished workout: asks for a rating at a happy moment, rarely. */
export function useReviewPrompt() {
  const { lastReviewPromptOn } = useSettings();
  const dispatch = useSettingsDispatch();
  const { sessions } = useProgressState();
  const today = useToday();

  return useCallback(() => {
    if (sessions.length + 1 < REVIEW_PROMPT.afterWorkouts) return;
    if (lastReviewPromptOn && diffInDays(today, lastReviewPromptOn) < REVIEW_PROMPT.minDaysBetween) return;
    dispatch(reviewPrompted(today));
    setTimeout(requestReview, 800);
  }, [sessions.length, lastReviewPromptOn, today, dispatch]);
}
