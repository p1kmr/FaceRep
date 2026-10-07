import { AVAILABLE_GUIDES, guideImages } from '@/constants/exerciseImages';
import { DEFAULT_GUIDE, type GuideId } from '@/constants/guides';

import { useSettings } from './useSettings';

/** Who the pictures show: the user's choice when that set is in this build, otherwise the default. */
export function useGuide(): GuideId {
  const { guide } = useSettings();
  return AVAILABLE_GUIDES.includes(guide) ? guide : DEFAULT_GUIDE;
}

/** Hero and exercise pictures for the chosen guide. */
export function useGuideImages() {
  return guideImages(useGuide());
}
