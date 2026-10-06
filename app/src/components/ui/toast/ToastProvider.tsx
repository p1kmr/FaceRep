import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../AppText';

export interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

export const ToastContext = createContext<((toast: ToastOptions) => void) | null>(null);

/** One toast at a time at the bottom of the screen, e.g. "All data deleted". */
export function ToastProvider({ children }: { children: ReactNode }) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<(ToastOptions & { key: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback((options: ToastOptions) => {
    setToast({ ...options, key: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), toast.durationMs ?? 4000);
    return () => clearTimeout(timer.current);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={[styles.host, { bottom: insets.bottom + 72 }]}>
          <Animated.View
            key={toast.key}
            entering={FadeInDown}
            exiting={FadeOutDown}
            style={styles.toast}
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
          >
            <AppText style={styles.message}>{toast.message}</AppText>
            {toast.actionLabel && toast.onAction ? (
              <Pressable
                accessibilityRole="button"
                hitSlop={12}
                onPress={() => {
                  toast.onAction?.();
                  setToast(null);
                }}
              >
                <AppText style={styles.action}>{toast.actionLabel}</AppText>
              </Pressable>
            ) : null}
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  host: { position: 'absolute', left: tokens.space.lg, right: tokens.space.lg },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.lg,
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    borderRadius: tokens.radius.md,
    backgroundColor: colors.text,
  },
  message: { flex: 1, color: colors.background },
  action: { color: colors.primary, fontWeight: tokens.font.weight.bold },
}));
