import { useId, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { splitAlpha } from '@/utils/color';

interface GradientProps {
  /** Two or more colors from the theme, first to last. See-through ones ('rgba(…, 0)') fade. */
  colors: readonly string[];
  /** diagonal: top left → bottom right (default). */
  direction?: 'diagonal' | 'vertical' | 'horizontal';
}

/**
 * Fills its parent with a linear gradient (React Native has no CSS gradients; react-native-svg draws it). Put it first
 * inside a View that has the border radius and overflow: 'hidden'.
 *
 * Two things only the iPhone shows (the web preview draws both right): the native SVG view keeps drawing at the size of
 * its first layout when its box changes later (the Today title's fade stayed a strip in the card's top-left), so the box
 * is measured and the SVG drawn at that size, new for each size; and a color's alpha goes into stopOpacity, because
 * native stops ignore the alpha inside stopColor.
 */
export function Gradient({ colors, direction = 'diagonal' }: GradientProps) {
  // SVG ids can't hold the colons React puts in useId().
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [x2, y2] = direction === 'vertical' ? [0, 1] : direction === 'horizontal' ? [1, 0] : [1, 1];
  const onLayout = ({ nativeEvent: { layout } }: LayoutChangeEvent) =>
    setSize((s) => (s && s.width === layout.width && s.height === layout.height ? s : { width: layout.width, height: layout.height }));
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={onLayout}>
      {/* '100%' only until the first measure, so a button never shows a frame without its gradient. */}
      <Svg
        key={size ? `${size.width}x${size.height}` : 'fill'}
        width={size?.width ?? '100%'}
        height={size?.height ?? '100%'}
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
      >
        <Defs>
          <LinearGradient id={id} x1={0} y1={0} x2={x2} y2={y2}>
            {colors.map((c, i) => {
              const stop = splitAlpha(c);
              return <Stop key={i} offset={colors.length > 1 ? i / (colors.length - 1) : 0} stopColor={stop.color} stopOpacity={stop.opacity} />;
            })}
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={1} height={1} fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
