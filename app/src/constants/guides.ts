import type { ImageSourcePropType } from 'react-native';

import type { ExerciseId } from './exercises';
import type { FaceArea, FaceMapLayout } from './faceMap';

/**
 * Who the exercise pictures show. Only a display choice: it changes the pictures and a few words,
 * never the plan, and it stays on the device (it's not sent to the Worker).
 */
export const GUIDE_IDS = ['man', 'woman'] as const;
export type GuideId = (typeof GUIDE_IDS)[number];

/** Always complete (the image check fails without it); used until the user picks another one. */
export const DEFAULT_GUIDE: GuideId = 'man';

export const isGuideId = (v: unknown): v is GuideId => typeof v === 'string' && (GUIDE_IDS as readonly string[]).includes(v);

/**
 * The two frames the player crossfades between, the square thumbnail cut from the exercise frame, and the exercise's
 * clip (an MP4 from videos/tools/app.py) when it has one. Free exercises: bundled (static require). Premium ones: files
 * the Worker sent after purchase, kept on the iPhone (services/content), so the clip is then a file URI.
 */
export interface ExerciseImages {
  relaxed: ImageSourcePropType;
  exercise: ImageSourcePropType;
  thumb: ImageSourcePropType;
  clip?: number | string;
}

/** The face map: the grey face, where each area is, and each area's red layer (cut to its box). */
export interface FaceMapImages {
  base: ImageSourcePropType;
  layout: FaceMapLayout;
  areas: Record<FaceArea, ImageSourcePropType>;
}

/**
 * One guide's set: the hero photos, the face map and the exercises the app can show: in the app the free ones, plus,
 * with Premium, the Premium ones once they're on the iPhone (hooks/useGuide.ts useGuideImages).
 */
export interface GuideImages {
  hero: { home: ImageSourcePropType; paywall: ImageSourcePropType };
  map: FaceMapImages;
  exercises: Partial<Record<ExerciseId, ExerciseImages>>;
}
