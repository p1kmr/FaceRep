import { useContext, useMemo } from 'react';

import { guideImages, shownGuide } from '@/constants/exerciseImages';
import type { GuideId, GuideImages } from '@/constants/guides';
import { ContentStateContext } from '@/state/content/ContentProvider';
import { selectPremiumImages } from '@/state/content/selectors';

import { usePremium } from './usePremium';
import { useSettings } from './useSettings';

/** Who the pictures show: the user's choice when that set is in this build, otherwise the default. */
export function useGuide(): GuideId {
  return shownGuide(useSettings().guide);
}

/**
 * Hero and exercise pictures for the chosen guide: the free exercises from the app, and with Premium the Premium ones
 * that are on the iPhone (services/content). A Premium exercise not in here shows locked.
 */
export function useGuideImages(): GuideImages {
  const guide = useGuide();
  const { isPremium } = usePremium();
  const content = useContext(ContentStateContext);
  return useMemo(() => {
    const bundled = guideImages(guide);
    if (!isPremium || !content?.pack) return bundled;
    return { ...bundled, exercises: { ...bundled.exercises, ...selectPremiumImages(content, guide) } };
  }, [guide, isPremium, content]);
}
