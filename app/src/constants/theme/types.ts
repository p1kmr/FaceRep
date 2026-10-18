export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  /** Card edge: a hairline in light (the shadow does the rest), a visible border in dark. */
  cardBorder: string;
  text: string;
  textMuted: string;
  textInverse: string;
  /** Brand red: the "working muscle" color in the exercise renders. */
  primary: string;
  /** Second stop of the brand gradient (primary → primaryEnd): main buttons, the timer ring, highlights. */
  primaryEnd: string;
  /** Colored shadow under the main button and around the figure while it squeezes. */
  glow: string;
  onPrimary: string;
  /** Soft tint of primary for selected chips and badges. */
  primarySoft: string;
  /** Background behind the white exercise drawings (matches the image edges). */
  plate: string;
  /** The plate color, fully transparent: the start of a fade into the plate. */
  plateFade: string;
  /** Text drawn on the plate (same in both themes: the plate is always white). */
  onPlate: string;
  onPlateMuted: string;
  /** Streak flame and "today done" highlights. */
  streak: string;
  /** Soft backgrounds behind the streak, success and info icons (stat cards). */
  streakSoft: string;
  successSoft: string;
  /** Second accent (time, minutes) and its soft background. */
  info: string;
  infoSoft: string;
  /** A locked Premium exercise's card, top to bottom, under the app's mark (same in both themes: the dark icon's graphite). */
  locked: string;
  lockedEnd: string;
  /** Behind and on top of the dark hero photos (same in both themes: the photos are dark). */
  heroBackground: string;
  onImage: string;
  onImageSoft: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
  shadow: string;
}

export interface Theme {
  id: string;
  light: Palette;
  dark: Palette;
}

export type ThemeMode = 'system' | 'light' | 'dark';
