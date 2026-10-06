import { createContext, useEffect, useMemo, type ReactNode } from 'react';
import { Appearance, Platform, useColorScheme } from 'react-native';

import { DEFAULT_THEME_ID, THEMES, tokens, type Palette, type Tokens } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';

export interface ThemeValue {
  colors: Palette;
  tokens: Tokens;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { themeMode, themeId } = useSettings();
  const systemScheme = useColorScheme();

  // Native UI (tab bar, alerts, keyboard) follows the app's choice, not only the system.
  useEffect(() => {
    if (Platform.OS === 'web') return; // react-native-web has no setColorScheme
    Appearance.setColorScheme(themeMode === 'system' ? 'unspecified' : themeMode);
  }, [themeMode]);

  const isDark = (themeMode === 'system' ? systemScheme : themeMode) === 'dark';
  const theme = THEMES[themeId] ?? THEMES[DEFAULT_THEME_ID];

  const value = useMemo<ThemeValue>(
    () => ({ colors: isDark ? theme.dark : theme.light, tokens, isDark }),
    [isDark, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
