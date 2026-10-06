import type { ImageSourcePropType } from 'react-native';

import type { ExerciseId } from './exercises';

export interface ExerciseImages {
  relaxed: ImageSourcePropType;
  exercise: ImageSourcePropType;
  thumb: ImageSourcePropType;
}

// Static requires only: Metro can't bundle images from dynamic paths.
export const EXERCISE_IMAGES: Record<ExerciseId, ExerciseImages> = {
  '01-jaw-clench': {
    relaxed: require('@/assets/exercises/01-jaw-clench-relaxed.webp'),
    exercise: require('@/assets/exercises/01-jaw-clench-exercise.webp'),
    thumb: require('@/assets/exercises/01-jaw-clench-thumb.webp'),
  },
  '02-chin-lift': {
    relaxed: require('@/assets/exercises/02-chin-lift-relaxed.webp'),
    exercise: require('@/assets/exercises/02-chin-lift-exercise.webp'),
    thumb: require('@/assets/exercises/02-chin-lift-thumb.webp'),
  },
  '03-jaw-jut': {
    relaxed: require('@/assets/exercises/03-jaw-jut-relaxed.webp'),
    exercise: require('@/assets/exercises/03-jaw-jut-exercise.webp'),
    thumb: require('@/assets/exercises/03-jaw-jut-thumb.webp'),
  },
  '04-mewing': {
    relaxed: require('@/assets/exercises/04-mewing-relaxed.webp'),
    exercise: require('@/assets/exercises/04-mewing-exercise.webp'),
    thumb: require('@/assets/exercises/04-mewing-thumb.webp'),
  },
  '05-neck-stretch': {
    relaxed: require('@/assets/exercises/05-neck-stretch-relaxed.webp'),
    exercise: require('@/assets/exercises/05-neck-stretch-exercise.webp'),
    thumb: require('@/assets/exercises/05-neck-stretch-thumb.webp'),
  },
  '06-cheek-lift': {
    relaxed: require('@/assets/exercises/06-cheek-lift-relaxed.webp'),
    exercise: require('@/assets/exercises/06-cheek-lift-exercise.webp'),
    thumb: require('@/assets/exercises/06-cheek-lift-thumb.webp'),
  },
  '07-fish-face': {
    relaxed: require('@/assets/exercises/07-fish-face-relaxed.webp'),
    exercise: require('@/assets/exercises/07-fish-face-exercise.webp'),
    thumb: require('@/assets/exercises/07-fish-face-thumb.webp'),
  },
  '08-cheek-puff': {
    relaxed: require('@/assets/exercises/08-cheek-puff-relaxed.webp'),
    exercise: require('@/assets/exercises/08-cheek-puff-exercise.webp'),
    thumb: require('@/assets/exercises/08-cheek-puff-thumb.webp'),
  },
  '09-brow-lift': {
    relaxed: require('@/assets/exercises/09-brow-lift-relaxed.webp'),
    exercise: require('@/assets/exercises/09-brow-lift-exercise.webp'),
    thumb: require('@/assets/exercises/09-brow-lift-thumb.webp'),
  },
  '10-eye-squeeze': {
    relaxed: require('@/assets/exercises/10-eye-squeeze-relaxed.webp'),
    exercise: require('@/assets/exercises/10-eye-squeeze-exercise.webp'),
    thumb: require('@/assets/exercises/10-eye-squeeze-thumb.webp'),
  },
};

export const HERO_IMAGES = {
  home: require('@/assets/images/hero-home.webp'),
  onboarding: require('@/assets/images/hero-onboarding.webp'),
  paywall: require('@/assets/images/hero-paywall.webp'),
} as const;
