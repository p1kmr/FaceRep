import { router, usePathname } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ASK_HINT } from '@/constants/limits';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/services/haptics';
import { setAskButton } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';
import { AskHint, type AskHintChoice } from './AskHint';

const SIZE = 56;
const MARGIN = 12;
/** Room for the tab bar so the button never covers it. */
const TAB_BAR = 64;
/** Screens where the button would be in the way (or is the Coach itself). */
const HIDDEN = ['/coach', '/workout', '/paywall', '/ai-consent', '/onboarding', '/plan-day', '/safety'];
const spring = { damping: 18, stiffness: 220 };
/** The first-time hint shows at most once per app launch. */
let hintShownThisLaunch = false;

/**
 * Floating Coach button on every main screen (same as Elowa's Ask button): tap to open the Coach,
 * drag to move it. On release it snaps to the nearest side, and the spot is remembered.
 * Lives outside the navigator (root layout), so it shows over every tab.
 */
export function AskBubble() {
  const { t } = useTranslation('coach');
  const styles = useStyles();
  const pathname = usePathname();
  const { askButton } = useSettings();
  const { colors } = useTheme();
  const dispatch = useSettingsDispatch();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const minY = insets.top + MARGIN;
  const maxY = height - insets.bottom - TAB_BAR - SIZE - MARGIN;
  const leftX = MARGIN;
  const rightX = width - SIZE - MARGIN;
  const restX = askButton.side === 'left' ? leftX : rightX;
  const restY = minY + askButton.y * Math.max(0, maxY - minY);

  const x = useSharedValue(restX);
  const y = useSharedValue(restY);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const lifted = useSharedValue(1);
  const wave = useSharedValue(0);
  const [hint, setHint] = useState(false);
  const hidden = !askButton.visible || HIDDEN.some((p) => pathname.startsWith(p));

  // First app opens: the button wiggles and a speech bubble says what the Coach can do.
  // Counted per launch, up to ASK_HINT.maxShows.
  const canHint = !hidden && askButton.hintShows < ASK_HINT.maxShows;
  useEffect(() => {
    if (!canHint || hintShownThisLaunch) return;
    const timer = setTimeout(() => {
      hintShownThisLaunch = true;
      setHint(true);
      wave.set(withSequence(...[-12, 10, -6, 0].map((deg) => withTiming(deg, { duration: 140 }))));
      dispatch(setAskButton({ hintShows: askButton.hintShows + 1 }));
    }, ASK_HINT.delayMs);
    return () => clearTimeout(timer);
  }, [canHint, askButton.hintShows, dispatch, wave]);

  useEffect(() => {
    if (!hint) return;
    const timer = setTimeout(() => setHint(false), ASK_HINT.visibleMs);
    return () => clearTimeout(timer);
  }, [hint]);

  /** The user got it (used the button or a shortcut): never show the hint again. */
  const hintDone = () => {
    setHint(false);
    if (askButton.hintShows < ASK_HINT.maxShows) dispatch(setAskButton({ hintShows: ASK_HINT.maxShows }));
  };

  // Follow screen size changes and restored settings.
  useEffect(() => {
    x.set(withSpring(restX, spring));
    y.set(withSpring(restY, spring));
  }, [restX, restY, x, y]);

  const openCoach = () => {
    haptics.tap();
    hintDone();
    router.push('/coach');
  };

  const choose = (choice: AskHintChoice) => {
    haptics.tap();
    hintDone();
    router.push(choice === 'ask' ? '/coach' : { pathname: '/coach', params: { q: t(`hint.${choice}Prompt`) } });
  };

  const save = (side: 'left' | 'right', newY: number) => {
    haptics.tap();
    setHint(false);
    dispatch(setAskButton({ side, y: maxY > minY ? (newY - minY) / (maxY - minY) : 1 }));
  };

  const pan = Gesture.Pan()
    .minDistance(6)
    .onStart(() => {
      startX.set(x.get());
      startY.set(y.get());
      lifted.set(withSpring(1.12, spring));
    })
    .onUpdate((e) => {
      x.set(startX.get() + e.translationX);
      y.set(Math.min(maxY, Math.max(minY, startY.get() + e.translationY)));
    })
    .onEnd((e) => {
      const side = x.get() + SIZE / 2 + e.velocityX * 0.1 < width / 2 ? 'left' : 'right';
      x.set(withSpring(side === 'left' ? leftX : rightX, spring));
      lifted.set(withSpring(1, spring));
      runOnJS(save)(side, y.get());
    });

  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(openCoach)();
  });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: lifted.get() }, { rotate: `${wave.get()}deg` }],
  }));

  if (hidden) return null;

  // The hint opens toward the middle of the screen: above the button in the lower half.
  const below = restY < height / 2;
  const hintPosition = {
    ...(askButton.side === 'right' ? { right: MARGIN } : { left: MARGIN }),
    ...(below ? { top: restY + SIZE + 8 } : { bottom: height - restY + 8 }),
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
        <Animated.View
          style={[styles.bubble, style]}
          accessible
          accessibilityRole="button"
          accessibilityLabel={t('bubble.open')}
          accessibilityHint={t('bubble.openHint')}
          accessibilityActions={[{ name: 'activate' }]}
          onAccessibilityAction={openCoach}
        >
          <SymbolView
            name="sparkles"
            size={24}
            tintColor={colors.onPrimary}
            fallback={<AppText style={styles.fallback}>✦</AppText>}
          />
        </Animated.View>
      </GestureDetector>
      {hint ? <AskHint position={hintPosition} side={askButton.side} onChoose={choose} onClose={hintDone} /> : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  bubble: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    boxShadow: `0 6px 16px ${colors.shadow}`,
  },
  fallback: { color: colors.onPrimary, fontSize: tokens.font.size.headline },
}));
