import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { areasOfAll } from '@/constants/faceMap';
import { useTheme } from '@/hooks/useTheme';
import type { WorkoutResult } from '@/services/workout/timer';
import { makeStyles } from '@/theme/makeStyles';
import { formatClock } from '@/utils/format';

import { FaceMap } from '../faceMap/FaceMap';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Gradient } from '../ui/Gradient';

interface WorkoutCompleteProps {
  result: WorkoutResult;
  streak: number;
  /** Today's workout ended before half of it: its day, which still waits (saved, but not the day's workout yet). */
  waitingDay?: number;
  onDone: () => void;
}

/** After a workout: the face with the areas just worked lit, reps and time, the streak. */
export function WorkoutComplete({ result, streak, waitingDay, onDone }: WorkoutCompleteProps) {
  const { t } = useTranslation(['workout', 'exercises']);
  const { colors } = useTheme();
  const styles = useStyles();
  const any = result.totalReps > 0;
  const areas = areasOfAll(result.exercises.filter((e) => e.reps > 0).map((e) => e.id));
  const areaNames = areas.map((a) => t(`exercises:areas.${a}.name`));
  return (
    <View style={styles.root}>
      <View style={styles.center}>
        {any ? (
          <View style={styles.face}>
            <FaceMap lit={areas} label={`${t('workout:complete.worked')}: ${areaNames.join(', ')}`} />
            <View style={styles.check}>
              <Gradient colors={[colors.primaryEnd, colors.primary]} />
              <View>
                <SymbolView name="checkmark.seal.fill" size={34} tintColor={colors.onPrimary} />
              </View>
            </View>
          </View>
        ) : (
          <SymbolView name="arrow.counterclockwise.circle.fill" size={84} tintColor={colors.primary} />
        )}
        <AppText variant="brand" center accessibilityRole="header" style={styles.title}>
          {t('workout:complete.title').toUpperCase()}
        </AppText>
        <AppText muted center>
          {any ? t('workout:complete.body', { reps: result.totalReps, time: formatClock(result.durationSec) }) : t('workout:complete.nothing')}
        </AppText>
        {any && waitingDay ? (
          <AppText variant="footnote" muted center>
            {t('workout:dayWaits', { day: waitingDay })}
          </AppText>
        ) : null}
        {areas.length ? (
          <AppText variant="footnote" center style={styles.areas}>
            {`${t('workout:complete.worked')}: ${areaNames.join(' · ')}`.toUpperCase()}
          </AppText>
        ) : null}
        {any && streak > 0 ? (
          <View style={styles.streak}>
            <SymbolView name="flame.fill" size={18} tintColor={colors.streak} />
            <AppText variant="headline">{t('workout:complete.streak', { count: streak })}</AppText>
          </View>
        ) : null}
      </View>
      <Button title={t('workout:complete.done')} onPress={onDone} size="large" fullWidth />
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, padding: tokens.space.xl, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: tokens.space.md },
  // Head and neck, cropped, with the check badge on its corner.
  face: { width: 230, aspectRatio: 0.95, borderRadius: tokens.radius.xl, overflow: 'hidden', backgroundColor: colors.plate, marginBottom: tokens.space.sm },
  check: {
    position: 'absolute',
    right: tokens.space.sm,
    bottom: tokens.space.sm,
    width: 56,
    height: 56,
    borderRadius: tokens.radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 38, lineHeight: 44 },
  areas: { color: colors.primary, fontWeight: tokens.font.weight.bold, letterSpacing: 0.6 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.sm,
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.sm,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.streakSoft,
  },
}));
