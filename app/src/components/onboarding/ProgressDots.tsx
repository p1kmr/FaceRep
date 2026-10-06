import { View } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';

export function ProgressDots({ current, total }: { current: number; total: number }) {
  const styles = useStyles();
  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i === current && styles.active, i < current && styles.done]} />
      ))}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', justifyContent: 'center', gap: tokens.space.sm },
  dot: { width: 8, height: 8, borderRadius: tokens.radius.pill, backgroundColor: colors.border },
  active: { width: 24, backgroundColor: colors.primary },
  done: { backgroundColor: colors.textMuted },
}));
