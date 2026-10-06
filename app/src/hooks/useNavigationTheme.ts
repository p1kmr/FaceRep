import { DarkTheme, DefaultTheme } from 'expo-router';
import { useMemo } from 'react';

import { useTheme } from './useTheme';

/** Maps our palette to React Navigation's theme (headers, backgrounds). */
export function useNavigationTheme() {
  const { colors, isDark } = useTheme();
  return useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [colors, isDark]);
}
