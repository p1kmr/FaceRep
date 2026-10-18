import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';
import type { ISODate } from '@/utils/dates';
import { formatDayMonth } from '@/utils/format';

export interface ChartPoint {
  day: ISODate;
  movement: number | null;
  balance: number | null;
}

interface ScanChartProps {
  /** Oldest first. */
  points: ChartPoint[];
}

const HEIGHT = 168;
const PAD = { left: 30, right: 18, top: 16, bottom: 24 };
const GRID = [0, 50, 100];

/** The line through a series' points; a missing number breaks it. */
function linePath(xs: number[], ys: (number | null)[]): string {
  let d = '';
  let pen = false;
  ys.forEach((y, i) => {
    if (y === null) {
      pen = false;
      return;
    }
    d += `${pen ? 'L' : 'M'} ${xs[i]} ${y} `;
    pen = true;
  });
  return d.trim();
}

/**
 * The face scans over time: Movement and Balance (0–100) for each scan, oldest on the left, with the newest values
 * named. Drawn with react-native-svg (no chart library).
 */
export function ScanChart({ points }: ScanChartProps) {
  const { t, i18n } = useTranslation('scan');
  const styles = useStyles();
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const n = points.length;
  const xs = points.map((_, i) => PAD.left + (n === 1 ? plotW / 2 : (i * plotW) / (n - 1)));
  const yOf = (v: number | null) => (v === null ? null : PAD.top + (1 - v / 100) * plotH);
  const series = [
    { key: 'movement' as const, color: colors.primary, ys: points.map((p) => yOf(p.movement)) },
    { key: 'balance' as const, color: colors.info, ys: points.map((p) => yOf(p.balance)) },
  ];
  const last = points[n - 1];
  const labels = n > 1 ? [0, n - 1] : [0];
  const summary = last
    ? t('card.chartA11y', { count: n, movement: last.movement ?? '–', balance: last.balance ?? '–' })
    : undefined;

  return (
    <View>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessible accessibilityRole="image" accessibilityLabel={summary}>
        {width > 0 ? (
          <Svg width={width} height={HEIGHT}>
            {GRID.map((g) => {
              const y = yOf(g) as number;
              return (
                <Line key={g} x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} stroke={colors.border} strokeWidth={1} strokeDasharray={g === 0 ? undefined : '3 5'} />
              );
            })}
            {GRID.map((g) => (
              <SvgText key={`l${g}`} x={PAD.left - 8} y={(yOf(g) as number) + 4} fontSize={11} fill={colors.textMuted} textAnchor="end">
                {g}
              </SvgText>
            ))}
            {series.map((s) => (
              <Path key={s.key} d={linePath(xs, s.ys)} stroke={s.color} strokeWidth={3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
            ))}
            {series.map((s) =>
              s.ys.map((y, i) =>
                y === null ? null : (
                  <Circle key={`${s.key}${i}`} cx={xs[i]} cy={y} r={i === n - 1 ? 5.5 : 4} fill={s.color} stroke={colors.surface} strokeWidth={2} />
                ),
              ),
            )}
            {series.map((s) => {
              const y = s.ys[n - 1];
              const value = last?.[s.key];
              if (y === null || value === null || value === undefined) return null;
              // The newest value above its dot (below when the other line's label would sit on it).
              const other = series.find((o) => o.key !== s.key)?.ys[n - 1] ?? null;
              const below = other !== null && other < y && y - other < 18;
              return (
                <SvgText key={`v${s.key}`} x={xs[n - 1]} y={below ? y + 18 : y - 10} fontSize={12} fontWeight="bold" fill={s.color} textAnchor="middle">
                  {value}
                </SvgText>
              );
            })}
            {labels.map((i) => (
              <SvgText
                key={`x${i}`}
                x={xs[i]}
                y={HEIGHT - 6}
                fontSize={11}
                fill={colors.textMuted}
                textAnchor={n === 1 ? 'middle' : i === 0 ? 'start' : 'end'}
              >
                {formatDayMonth(points[i].day, i18n.language)}
              </SvgText>
            ))}
          </Svg>
        ) : (
          <View style={{ height: HEIGHT }} />
        )}
      </View>
      <View style={styles.legend} importantForAccessibility="no-hide-descendants">
        {series.map((s) => (
          <View key={s.key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <AppText variant="caption" muted>
              {t(`result.${s.key}`)}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  legend: { flexDirection: 'row', justifyContent: 'center', gap: tokens.space.lg, marginTop: tokens.space.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
}));
