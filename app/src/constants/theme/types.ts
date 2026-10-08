export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  /** Brand red: the "working muscle" color in the exercise renders. */
  primary: string;
  onPrimary: string;
  /** Soft tint of primary for selected chips and badges. */
  primarySoft: string;
  /** Background behind the white exercise drawings (matches the image edges). */
  plate: string;
  /** Streak flame and "today done" highlights. */
  streak: string;
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
