import type { ExerciseId } from '@/constants/exercises';
import type { ExerciseImages, GuideId } from '@/constants/guides';
import { packImages } from '@/services/content/pack';

import type { ContentState } from './types';

/** The Premium exercises of a guide that are complete on the device (texts, pictures, clip), as ExerciseImages. */
export const selectPremiumImages = (s: ContentState, guide: GuideId): Partial<Record<ExerciseId, ExerciseImages>> =>
  s.pack ? packImages(s.pack, guide, s.sources) : {};
