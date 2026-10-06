import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

import type { ThemeValue } from './ThemeProvider';

/** Creates a hook that returns theme-aware styles: `const useStyles = makeStyles((t) => ({...}))`. */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: ThemeValue) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
