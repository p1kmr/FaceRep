import { Text, type TextProps } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';

/** brand: Anton capitals (headlines, big numbers); size it with `style`. */
type Variant = 'brand' | 'display' | 'title' | 'headline' | 'body' | 'footnote' | 'caption';

interface AppTextProps extends TextProps {
  variant?: Variant;
  muted?: boolean;
  center?: boolean;
}

/** All text goes through this (theme colors, type scale, Dynamic Type capped so layouts hold). */
export function AppText({ variant = 'body', muted, center, style, ...rest }: AppTextProps) {
  const styles = useStyles();
  return (
    <Text
      style={[styles[variant], muted && styles.muted, center && styles.center, style]}
      maxFontSizeMultiplier={1.6}
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
