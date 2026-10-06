import { View } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';

/** One pip per rep: done, current, still to go. */
export function RepPips({ total, done, current }: { total: number; done: number; current: number }) {
  const styles = useStyles();
  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.pip, i < done && styles.done, i === current - 1 && i >= done && styles.current]} />
      ))}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', gap: 5, justifyContent: 'center', flexWrap: 'wrap' },
  pip: { width: 18, height: 5, borderRadius: tokens.radius.pill, backgroundColor: colors.surfaceAlt },
  done: { backgroundColor: colors.primary },
  current: { backgroundColor: colors.textMuted },
}));
