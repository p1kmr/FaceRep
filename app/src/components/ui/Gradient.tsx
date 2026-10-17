import { useId } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

interface GradientProps {
  /** Two or more colors from the theme, first to last. */
  colors: readonly string[];
  /** diagonal: top left → bottom right (default). */
  direction?: 'diagonal' | 'vertical' | 'horizontal';
}

/**
 * Fills its parent with a linear gradient (React Native has no CSS gradients; react-native-svg draws it). Put it first
 * inside a View that has the border radius and overflow: 'hidden'.
 */
export function Gradient({ colors, direction = 'diagonal' }: GradientProps) {
  // SVG ids can't hold the colons React puts in useId().
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [x2, y2] = direction === 'vertical' ? [0, 1] : direction === 'horizontal' ? [1, 0] : [1, 1];
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id={id} x1={0} y1={0} x2={x2} y2={y2}>
          {colors.map((c, i) => (
            <Stop key={i} offset={colors.length > 1 ? i / (colors.length - 1) : 0} stopColor={c} />
          ))}
        </LinearGradient>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
