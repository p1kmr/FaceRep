import { StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';

/** brand: Anton capitals (headlines, big numbers); size it with `style`. */
type Variant = 'brand' | 'display' | 'title' | 'headline' | 'body' | 'footnote' | 'caption';

interface AppTextProps extends TextProps {
  variant?: Variant;
  muted?: boolean;
  center?: boolean;
}

/** Anton's tallest capital in our languages (É, Â, Ú…) above the baseline plus its descent, per point of font size. */
const BRAND_INK = (2254 + 674) / 2048;

/**
 * Anton is taller than its line: iOS takes a short lineHeight off the top of the first line and cuts what sticks out
 * (the Progress streak's digits, the accents in SCHLÄFEN or MANDÍBULA). The missing room goes on top as padding, where
 * iOS still draws, and comes off again as a negative margin, so the layout stays as designed and nothing is cut. Like
 * `overflow: visible` for the letters on the web, which needs nothing (it never cuts).
 */
function brandRoom(style: StyleProp<TextStyle>): TextStyle | null {
  const { fontSize, lineHeight, paddingTop, marginTop } = StyleSheet.flatten(style);
  if (!fontSize || !lineHeight) return null;
  const room = Math.ceil(fontSize * BRAND_INK - lineHeight);
  if (room <= 0) return null;
  return {
    paddingTop: (typeof paddingTop === 'number' ? paddingTop : 0) + room,
    marginTop: (typeof marginTop === 'number' ? marginTop : 0) - room,
  };
}

/** All text goes through this (theme colors, type scale, Dynamic Type capped so layouts hold). */
export function AppText({ variant = 'body', muted, center, style, ...rest }: AppTextProps) {
  const styles = useStyles();
  const all = [styles[variant], muted && styles.muted, center && styles.center, style];
  const room = variant === 'brand' ? brandRoom(all) : null;
  return (
    <Text
      style={room ? [all, room] : all}
      maxFontSizeMultiplier={1.6}
      // The room above reaches over whatever sits there; it mustn't take its taps.
      {...(room && !rest.onPress ? { pointerEvents: 'none' as const } : null)}
      // Marks brand text in the web build (react-native-web renders data-font), so the screenshot capture keeps its font.
      {...(variant === 'brand' ? { dataSet: { font: 'brand' } } : null)}
      {...rest}
    />
  );
}

const useStyles = makeStyles(({ colors, tokens: { font } }) => ({
  brand: { color: colors.text, fontFamily: font.brand, fontSize: 30, lineHeight: 36, letterSpacing: 0.4 },
  display: { color: colors.text, fontSize: font.size.display, lineHeight: font.size.display + 4, fontWeight: font.weight.heavy, letterSpacing: -0.8 },
  title: { color: colors.text, fontSize: font.size.title, lineHeight: font.size.title + 6, fontWeight: font.weight.bold, letterSpacing: -0.4 },
  headline: { color: colors.text, fontSize: font.size.headline, fontWeight: font.weight.semibold },
  body: { color: colors.text, fontSize: font.size.body, lineHeight: font.size.body + 5 },
  footnote: { color: colors.text, fontSize: font.size.footnote, lineHeight: font.size.footnote + 5 },
  caption: { color: colors.text, fontSize: font.size.caption },
  muted: { color: colors.textMuted },
  center: { textAlign: 'center' },
}));
