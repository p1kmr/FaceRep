// First import: initialises i18n before any screen renders.
import '@/i18n';

import { useFonts } from 'expo-font';
import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AskBubble } from '@/components/coach/AskBubble';
import { useHydration } from '@/hooks/useHydration';
import { useNavigationTheme } from '@/hooks/useNavigationTheme';
import { useReminderSync } from '@/hooks/useReminderSync';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { configureNotifications } from '@/services/notifications/reminder';
import { AppProviders } from '@/state/AppProviders';

SplashScreen.preventAutoHideAsync();
configureNotifications();

function RootNavigator() {
  const hydrated = useHydration();
  // The brand font (Anton, for headlines and numbers). If it fails to load, text falls back to the system font.
  const [fontLoaded, fontError] = useFonts({ Anton: require('@/assets/fonts/Anton-Regular.ttf') });
  const ready = hydrated && (fontLoaded || !!fontError);
  const { onboardingDone } = useSettings();
  const { isDark } = useTheme();
  const navigationTheme = useNavigationTheme();
  const { t } = useTranslation(['settings', 'exercises', 'reminders']);
  useReminderSync();

  // Keep the splash until every store and the font are loaded: no flash of the wrong theme, screen or font.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
        <Stack.Protected guard={!onboardingDone}>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={onboardingDone}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="exercise/[id]" options={{ title: '', headerTransparent: true }} />
          <Stack.Screen name="week" options={{ title: '' }} />
          <Stack.Screen name="workout" options={{ presentation: 'fullScreenModal', headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="paywall" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="ai-consent" options={{ presentation: 'modal', title: '' }} />
          <Stack.Screen name="coach" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="coach-history" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="reminders" options={{ title: t('reminders:title') }} />
          <Stack.Screen name="reminder" options={{ presentation: 'modal', title: '' }} />
          <Stack.Screen name="safety" options={{ presentation: 'modal', title: t('settings:safety') }} />
        </Stack.Protected>
      </Stack>
      {/* The floating Coach button, over every main screen (like Elowa's Ask button). */}
      {onboardingDone ? <AskBubble /> : null}
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={StyleSheet.absoluteFill}>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
