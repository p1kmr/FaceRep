import { GUIDE_IMAGES } from './guideImages.generated';
import { GUIDE_IDS, type GuideId, type GuideImages } from './guides';

export type { ExerciseImages, GuideImages } from './guides';

/**
 * Every picture in the app goes through here. Exercise and hero pictures come per guide (man,
 * woman) from the generated list: add files to assets/guides and run `npm run images`
 * (docs/images.md). Metro can't bundle images from dynamic paths, hence the generated static requires.
 */
const IMAGES: Partial<Record<GuideId, GuideImages>> = GUIDE_IMAGES;

/** Guides whose picture set is complete, so the app can offer them (the choice appears with two). */
export const AVAILABLE_GUIDES: GuideId[] = GUIDE_IDS.filter((g) => IMAGES[g]);

/** A guide's pictures; the man's (always complete) when that set isn't in this build. */
export const guideImages = (guide: GuideId): GuideImages => IMAGES[guide] ?? GUIDE_IMAGES.man;

/** First screen of onboarding, shown before anyone picks a guide. */
export const WELCOME_IMAGE = require('@/assets/brand/welcome.webp');
