import { GUIDE_IMAGES } from './guideImages.generated';
import { DEFAULT_GUIDE, GUIDE_IDS, type GuideId, type GuideImages } from './guides';

export type { ExerciseImages, GuideImages } from './guides';

/**
 * Every picture in the app goes through here. Exercise and hero pictures come per guide (man,
 * woman) from the generated list: add files to assets/guides and run `npm run images`
 * (docs/images.md). Metro can't bundle images from dynamic paths, hence the generated static requires.
 */
const IMAGES: Partial<Record<GuideId, GuideImages>> = GUIDE_IMAGES;

/** Guides whose picture set is complete, so the app can offer them (the choice appears with two). */
export const AVAILABLE_GUIDES: GuideId[] = GUIDE_IDS.filter((g) => IMAGES[g]);

/** The guide whose pictures show: the chosen one when its set is in this build, otherwise the default. */
export const shownGuide = (guide: GuideId): GuideId => (AVAILABLE_GUIDES.includes(guide) ? guide : DEFAULT_GUIDE);

/**
 * A guide's bundled pictures: the hero, the face map and the free exercises (the Premium ones aren't in the app; with
 * Premium they come from the Worker, hooks/useGuide.ts). The man's (always complete) when that set isn't in this build.
 */
export const guideImages = (guide: GuideId): GuideImages => IMAGES[guide] ?? GUIDE_IMAGES.man;

/** First screen of onboarding, shown before anyone picks a guide. */
export const WELCOME_IMAGE = require('@/assets/brand/welcome.webp');

/**
 * The app's mark alone (made by brand/logo.mjs), on a locked Premium exercise's card: the same for every locked one,
 * never a picture of an exercise.
 */
export const MARK_IMAGE = require('@/assets/brand/mark.png');
/** mark.png's width ÷ height (658 × 401). */
export const MARK_ASPECT = 658 / 401;
