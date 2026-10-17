import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { FACE_AREAS, type FaceArea } from '@/constants/faceMap';
import { MOTION } from '@/constants/motion';
import { useGuideImages } from '@/hooks/useGuide';
import { areaAt } from '@/services/faceMap/hit';
import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

interface FaceMapProps {
  /** Areas drawn in red. */
  lit: readonly FaceArea[];
  /** The area picked: drawn in full, the other lit areas faint. */
  selected?: FaceArea | null;
  /** Tapping the face picks the area under the finger. */
  onSelect?: (area: FaceArea) => void;
  /** The lit areas breathe slowly (Today). Off with Reduce Motion. */
  pulse?: boolean;
  /** Accessibility description (say which areas are lit). */
  label: string;
  style?: StyleProp<ViewStyle>;
}

/** One area's red layer, placed on its box, fading to `level`. */
function AreaLayer({ area, level }: { area: FaceArea; level: number }) {
  const { map } = useGuideImages();
  const reduceMotion = useReducedMotion();
  const opacity = useSharedValue(level);
  useEffect(() => {
    opacity.value = reduceMotion ? level : withTiming(level, { duration: MOTION.crossfadeMs });
  }, [level, reduceMotion, opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const [x, y, w, h] = map.layout.areas[area].box;
  return (
    <Animated.View style={[{ position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` }, animated]}>
      <Image source={map.areas[area]} style={StyleSheet.absoluteFill} contentFit="fill" transition={0} />
    </Animated.View>
  );
}

/**
 * The face map: the chosen guide's face in grey with the red muscle shading of the lit areas (made from the exercise
 * drawings, videos/tools/facemap.py). It keeps the picture's shape; a parent with overflow hidden can crop it.
 */
export function FaceMap({ lit, selected = null, onSelect, pulse = false, label, style }: FaceMapProps) {
  const styles = useStyles();
  const { map } = useGuideImages();
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const touchArea = useRef<View>(null);
  const breath = useSharedValue(1);

  useEffect(() => {
    if (!pulse || reduceMotion) {
      cancelAnimation(breath);
      breath.value = 1;
      return;
    }
    breath.value = withRepeat(withTiming(0.7, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
    return () => cancelAnimation(breath);
  }, [pulse, reduceMotion, breath]);
  const breathing = useAnimatedStyle(() => ({ opacity: breath.value }));

  const levelOf = (area: FaceArea) => (selected ? (area === selected ? 1 : lit.includes(area) ? 0.22 : 0) : lit.includes(area) ? 1 : 0);

  const picture = (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image source={map.base} style={StyleSheet.absoluteFill} contentFit="fill" transition={0} />
      <Animated.View style={[StyleSheet.absoluteFill, breathing]}>
        {FACE_AREAS.map((area) => (
          <AreaLayer key={area} area={area} level={levelOf(area)} />
        ))}
      </Animated.View>
    </View>
  );

  return (
    <View
      style={[styles.plate, { aspectRatio: map.layout.width / map.layout.height }, style]}
      onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
    >
      {onSelect ? (
        <Pressable
          ref={touchArea}
          style={StyleSheet.absoluteFill}
          accessibilityRole="image"
          accessibilityLabel={label}
          onPress={(e) => {
            const pick = (x: number, y: number) => {
              if (!size.width || !size.height) return;
              const area = areaAt(map.layout, x / size.width, y / size.height);
              if (!area) return;
              haptics.select();
              onSelect(area);
            };
            const { locationX, locationY, pageX, pageY } = e.nativeEvent;
            // iOS gives the spot in the view; the web build only the page position.
            if (typeof locationX === 'number' && typeof locationY === 'number') pick(locationX, locationY);
            else touchArea.current?.measure((_x, _y, _w, _h, left, top) => pick(pageX - left, pageY - top));
          }}
        >
          {picture}
        </Pressable>
      ) : (
        <View style={StyleSheet.absoluteFill} accessible accessibilityRole="image" accessibilityLabel={label}>
          {picture}
        </View>
      )}
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  plate: { alignSelf: 'stretch', backgroundColor: colors.plate },
}));
