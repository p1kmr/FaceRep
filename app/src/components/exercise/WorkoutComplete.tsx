import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { WorkoutResult } from '@/services/workout/timer';
import { makeStyles } from '@/theme/makeStyles';
import { formatClock } from '@/utils/format';

import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';

export function WorkoutComplete({ result, streak, onDone }: { result: WorkoutResult; streak: number; onDone: () => void }) {
  const { t } = useTranslation('workout');
  const { colors } = useTheme();
  const styles = useStyles();
  const any = result.totalReps > 0;
  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <SymbolView name={any ? 'checkmark.seal.fill' : 'arrow.counterclockwise.circle.fill'} size={84} tintColor={colors.primary} />
        <AppText variant="title" center accessibilityRole="header">
          {t('complete.title')}
        </AppText>
        <AppText muted center>
          {any ? t('complete.body', { reps: result.totalReps, time: formatClock(result.durationSec) }) : t('complete.nothing')}
        </AppText>
        {any && streak > 0 ? (
          <View style={styles.streak}>
            <SymbolView name="flame.fill" size={18} tintColor={colors.streak} />
            <AppText variant="headline">{t('complete.streak', { count: streak })}</AppText>
          </View>
        ) : null}
      </View>
      <Button title={t('complete.done')} onPress={onDone} fullWidth />
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, padding: tokens.space.xl, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: tokens.space.md },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
}));
