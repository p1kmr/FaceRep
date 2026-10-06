import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { makeStyles } from '@/theme/makeStyles';

function Dot({ delay }: { delay: number }) {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const o = useSharedValue(0.3);
  useEffect(() => {
    if (reduceMotion) return;
    o.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 300 }), withTiming(0.3, { duration: 300 })), -1));
  }, [delay, o, reduceMotion]);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.dot, style]} />;
}

export function TypingDots() {
  const { t } = useTranslation('coach');
  const styles = useStyles();
  return (
    <View style={styles.bubble} accessible accessibilityLabel={t('thinking')} accessibilityLiveRegion="polite">
      <Dot delay={0} />
      <Dot delay={150} />
      <Dot delay={300} />
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  bubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md + 2,
    borderRadius: tokens.radius.lg,
    borderBottomLeftRadius: tokens.radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textMuted },
}));
