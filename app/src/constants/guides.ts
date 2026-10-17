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
 * clip (a bundled MP4, from videos/tools/app.py) when it has one.
 */
export interface ExerciseImages {
  relaxed: ImageSourcePropType;
  exercise: ImageSourcePropType;
  thumb: ImageSourcePropType;
  clip?: number;
}

/** The face map: the grey face, where each area is, and each area's red layer (cut to its box). */
export interface FaceMapImages {
  base: ImageSourcePropType;
  layout: FaceMapLayout;
  areas: Record<FaceArea, ImageSourcePropType>;
}

/** One guide's full set: the hero photos, the face map and every exercise of the catalog. */
export interface GuideImages {
  hero: { home: ImageSourcePropType; paywall: ImageSourcePropType };
  map: FaceMapImages;
  exercises: Record<ExerciseId, ExerciseImages>;
}
