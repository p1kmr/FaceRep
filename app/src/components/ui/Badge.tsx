import { View } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';

import { AppText } from './AppText';

type Tone = 'primary' | 'neutral';

/** Small static label, e.g. a muscle name on an exercise or "Premium". */
export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const styles = useStyles();
  return (
    <View style={[styles.badge, tone === 'primary' && styles.primary]}>
      <AppText variant="caption" style={[styles.text, tone === 'primary' && styles.primaryText]}>
        {label}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: tokens.space.sm + 2,
    paddingVertical: 3,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  primary: { backgroundColor: colors.primarySoft },
  text: { color: colors.textMuted, fontWeight: tokens.font.weight.semibold },
  primaryText: { color: colors.primary },
}));
