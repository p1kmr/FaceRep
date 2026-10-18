import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

interface FaceGuideProps {
  /** 0–1: the ring around the face fills while a move is measured. */
  progress: number;
  /** good: a face is seen and measured; warn: it can't be measured (turned away, too far); none: no face. */
  tone: 'good' | 'warn' | 'none';
  /** 3, 2, 1 in the middle of the oval. */
  countdown: number | null;
  /** A line under the oval (the Simulator's note). */
  caption?: string;
}

/** Where the oval sits, as shares of the screen: a little above the middle, so the panel below doesn't cover the chin. */
const OVAL = { centerY: 0.4, width: 0.72, ratio: 1.32 };

/** The oval as a path that starts at the top and goes clockwise, so the ring fills from the top. */
const ovalPath = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx} ${cy - ry} A ${rx} ${ry} 0 1 1 ${cx} ${cy + ry} A ${rx} ${ry} 0 1 1 ${cx} ${cy - ry} Z`;

/** Ramanujan's formula for the perimeter of an ellipse. */
const perimeter = (rx: number, ry: number) => Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));

/**
 * The face guide over the camera: the screen dims outside an oval (where the face goes), and the oval's ring fills
 * as each move is measured, like Face ID's setup.
 */
export function FaceGuide({ progress, tone, countdown, caption }: FaceGuideProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const { width, height } = size;
  const rx = (width * OVAL.width) / 2;
  const ry = rx * OVAL.ratio;
  const cx = width / 2;
  const cy = height * OVAL.centerY;
  const oval = ovalPath(cx, cy, rx, ry);
  const length = perimeter(rx, ry);
  const ring = tone === 'warn' ? colors.warning : colors.onImage;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none" onLayout={(e) => setSize(e.nativeEvent.layout)}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Path d={`M 0 0 H ${width} V ${height} H 0 Z ${oval}`} fill={colors.overlay} fillRule="evenodd" />
          {/* Remounted when the tone changes: react-native-svg keeps a dash pattern after the prop is removed. */}
          <Path
            key={tone === 'none' ? 'dashed' : 'solid'}
            d={oval}
            fill="none"
            stroke={ring}
            strokeOpacity={tone === 'none' ? 0.5 : 0.85}
            strokeWidth={3}
            {...(tone === 'none' ? { strokeDasharray: '10 12' } : null)}
          />
          {progress > 0 ? (
            <Path
              d={oval}
              fill="none"
              stroke={colors.success}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={`${length * Math.min(1, progress)} ${length}`}
            />
          ) : null}
        </Svg>
      ) : null}
      {countdown !== null && width > 0 ? (
        <View style={[styles.center, { top: cy - 60 }]}>
          <AppText variant="brand" style={styles.countdown}>
            {countdown}
          </AppText>
        </View>
      ) : null}
      {caption && width > 0 ? (
        <View style={[styles.center, { top: cy + ry + 12 }]}>
          <AppText variant="caption" center style={styles.caption}>
            {caption}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  center: { position: 'absolute', left: tokens.space.xl, right: tokens.space.xl, alignItems: 'center' },
  countdown: { fontSize: 96, lineHeight: 120, color: colors.onImage },
  caption: { color: colors.onImage, opacity: 0.8 },
}));
