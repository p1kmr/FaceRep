import { forge } from './themes/forge';
import type { Theme } from './types';

export const THEMES: Record<string, Theme> = { [forge.id]: forge };
export const DEFAULT_THEME_ID = forge.id;

export { tokens } from './tokens';
export type { Tokens } from './tokens';
export type { Palette, Theme, ThemeMode } from './types';
