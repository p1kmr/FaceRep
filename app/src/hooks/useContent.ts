import { useContext, useMemo } from 'react';

import type { ExerciseId } from '@/constants/exercises';
import { retryContent } from '@/state/content/actions';
import { ContentDispatchContext, ContentStateContext } from '@/state/content/ContentProvider';

import { useGuideImages } from './useGuide';
import { usePremium } from './usePremium';

/** The Premium download (services/content): how far it is, what went wrong, and Try again. */
export function usePremiumContent() {
  const state = useContext(ContentStateContext);
  const dispatch = useContext(ContentDispatchContext);
  if (!state || !dispatch) throw new Error('usePremiumContent must be used inside <ContentProvider>');
  return { status: state.status, progress: state.progress, error: state.error, retry: () => dispatch(retryContent()) };
}

/**
 * Why an exercise shows locked: it needs Premium; or the user has Premium and it isn't on this iPhone yet
 * (downloading), or its download failed.
 */
export type ExerciseLock = 'premium' | 'downloading' | 'failed';

/**
 * Which exercises a screen may show and start: the free ones always, a Premium one with Premium once its texts and
 * pictures are on the iPhone (useGuideImages has it then). Everything else shows locked, without its name or picture.
 */
export function useExerciseAccess() {
  const images = useGuideImages();
  const { isPremium } = usePremium();
  const { status } = usePremiumContent();
  return useMemo(() => {
    const canUse = (id: ExerciseId) => !!images.exercises[id];
    const lockOf = (id: ExerciseId): ExerciseLock | null => (canUse(id) ? null : !isPremium ? 'premium' : status === 'failed' ? 'failed' : 'downloading');
    return { canUse, lockOf };
  }, [images, isPremium, status]);
}
