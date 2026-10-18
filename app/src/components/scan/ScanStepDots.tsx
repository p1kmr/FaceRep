import { View } from 'react-native';

import { SCAN_STEPS } from '@/constants/faceScan';
import { makeStyles } from '@/theme/makeStyles';

/** One dot per step: done ones full, the current one long, the rest faint. */
export function ScanStepDots({ step, done }: { step: number; done: boolean }) {
  const styles = useStyles();
  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants">
      {SCAN_STEPS.map((id, i) => (
        <View key={id} style={[styles.dot, (i < step || done) && styles.done, i === step && !done && styles.current]} />
      ))}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.xs + 2 },
  dot: { width: 8, height: 8, borderRadius: tokens.radius.pill, backgroundColor: colors.onImageSoft },
  done: { backgroundColor: colors.onImage },
  current: { width: 22, backgroundColor: colors.primary },
}));
