import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';

import type { ExerciseId } from '@/constants/exercises';
import { MOTION } from '@/constants/motion';
import { useGuideImages } from '@/hooks/useGuide';
import { makeStyles } from '@/theme/makeStyles';

interface ExerciseFramesProps {
  id: ExerciseId;
  /** Show the exercise pose (muscle in red) instead of the relaxed one. */
  squeeze: boolean;
  /** Accessibility description of what's on screen. */
  label: string;
  /** Fill the space left by other content (the player) instead of keeping the image's aspect ratio. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The 3D figure: relaxed and exercise renders stacked, crossfading on every squeeze/release.
 * Two still frames keep the app small and the face identical (no video needed).
 */
export function ExerciseFrames({ id, squeeze, label, fill, style }: ExerciseFramesProps) {
  const styles = useStyles();
  const reduceMotion = useReducedMotion();
  const visible = useSharedValue(squeeze ? 1 : 0);
  const images = useGuideImages().exercises[id];

  useEffect(() => {
    visible.value = reduceMotion ? (squeeze ? 1 : 0) : withTiming(squeeze ? 1 : 0, { duration: MOTION.crossfadeMs });
  }, [squeeze, reduceMotion, visible]);

  const exerciseStyle = useAnimatedStyle(() => ({ opacity: visible.value }));

  return (
    <View style={[styles.plate, fill ? styles.fill : styles.ratio, style]} accessible accessibilityRole="image" accessibilityLabel={label}>
      <Image source={images.relaxed} style={StyleSheet.absoluteFill} contentFit="contain" transition={0} />
      <Animated.View style={[StyleSheet.absoluteFill, exerciseStyle]}>
        <Image source={images.exercise} style={StyleSheet.absoluteFill} contentFit="contain" transition={0} />
      </Animated.View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  plate: { alignSelf: 'stretch', borderRadius: tokens.radius.xl, overflow: 'hidden', backgroundColor: colors.plate },
  ratio: { aspectRatio: 757 / 1024 },
  fill: { flex: 1 },
}));
