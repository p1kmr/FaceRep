import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { EXERCISE_IMAGES } from '@/constants/exerciseImages';
import { EXERCISE_IDS, EXERCISES, type ExerciseId, type Goal } from '@/constants/exercises';
import { PLAN } from '@/constants/plan';
import type { usePlan } from '@/hooks/usePlan';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, toMinutes } from '@/utils/format';

import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PlanCardProps {
  plan: ReturnType<typeof usePlan>;
  goal: Goal;
  isPremium: boolean;
  /** Starts today's plan day (it counts for the plan). */
  onStart: () => void;
  /** Today's day is done: the same exercises again, not counted. */
  onPractice: () => void;
  onUnlock: () => void;
}

/** Placeholder thumbnails for a locked day (the real Premium days aren't on the device). */
const teaserIds = (goal: Goal): ExerciseId[] =>
  EXERCISE_IDS.filter((id) => goal === 'full' || EXERCISES[id].program === goal).slice(0, 5);

function Thumbs({ ids, blurred }: { ids: readonly ExerciseId[]; blurred?: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.thumbs} accessible={false}>
      {ids.map((id) => (
        <Image key={id} source={EXERCISE_IMAGES[id].thumb} style={styles.thumb} contentFit="cover" blurRadius={blurred ? 14 : 0} />
      ))}
      {blurred ? (
        <View style={styles.lock}>
          <SymbolView name="lock.fill" size={26} tintColor={colors.text} />
        </View>
      ) : null}
    </View>
  );
}

/** Today's plan day: Week · Day header, the exercises, one button. Also the locked, loading and done states. */
export function PlanCard({ plan, goal, isPremium, onStart, onPractice, onUnlock }: PlanCardProps) {
  const { t, i18n } = useTranslation(['home', 'common']);
  const styles = useStyles();
  const { colors } = useTheme();
  const { progress, showing, today } = plan;
  const ready = today.status === 'ready' ? today : null;
  const subtitle = ready?.day.kind === 'light' ? t('home:plan.light') : ready?.day.kind === 'final' ? t('home:plan.final') : t(`home:plan.weeks.${showing.weekName}`);

  let body: ReactNode;
  if (progress.doneToday) {
    const freeWeekDone = !isPremium && showing.level === 1 && showing.day === PLAN.freeDays;
    const message = progress.finished
      ? t('home:plan.doneLevelToday', { level: progress.level, next: progress.level + 1 })
      : freeWeekDone
        ? t('home:plan.doneFreeWeek')
        : t('home:plan.doneToday', { day: showing.day, next: showing.day + 1 });
    body = (
      <>
        <View style={styles.done}>
          <SymbolView name="checkmark.circle.fill" size={22} tintColor={colors.success} />
          <AppText style={styles.doneText}>{message}</AppText>
        </View>
        {freeWeekDone ? <Button title={t('home:plan.locked.cta')} onPress={onUnlock} fullWidth /> : null}
        {ready ? <Button title={t('home:plan.practice')} variant="secondary" onPress={onPractice} fullWidth /> : null}
      </>
    );
  } else if (today.status === 'ready') {
    const meta = t('home:plan.meta', {
      exercises: t('common:exercises', { count: today.items.length }),
      minutes: t('common:minutes', { count: toMinutes(today.seconds) }),
    });
    body = (
      <>
        {progress.finished ? <AppText>{t('home:plan.levelDone', { level: progress.level })}</AppText> : null}
        <AppText variant="footnote" muted>
          {meta}
        </AppText>
        <Thumbs ids={today.day.ids} />
        <Button
          title={progress.finished ? t('home:plan.startLevel', { level: showing.level }) : t('home:plan.start', { day: showing.day })}
          onPress={onStart}
          fullWidth
        />
      </>
    );
  } else if (today.status === 'locked') {
    body = (
      <>
        <Thumbs ids={teaserIds(goal)} blurred />
        <View style={styles.lockedText}>
          <AppText variant="headline">{t('home:plan.locked.title')}</AppText>
          <AppText muted>{t('home:plan.locked.body')}</AppText>
        </View>
        <Button title={t('home:plan.locked.cta')} onPress={onUnlock} fullWidth />
      </>
    );
  } else if (today.status === 'loading') {
    body = (
      <View style={styles.status} accessibilityLiveRegion="polite">
        <ActivityIndicator />
        <AppText muted>{t('home:plan.loading')}</AppText>
      </View>
    );
  } else {
    const key = today.error === 'offline' || today.error === 'premium' ? today.error : 'server';
    body = (
      <>
        <AppText muted>{t(`home:plan.error.${key}`)}</AppText>
        <Button title={t('home:plan.error.retry')} variant="secondary" onPress={plan.retry} fullWidth />
      </>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="headline" accessibilityRole="header">
            {t('home:plan.header', { week: showing.week, day: showing.day, total: PLAN.days })}
          </AppText>
          <AppText variant="footnote" muted>
            {subtitle} · {formatDay(showing.date, i18n.language)}
          </AppText>
        </View>
        <View style={styles.badges}>
          <Badge label={t(`common:programs.${goal}`)} tone="primary" />
          {showing.level > 1 ? <Badge label={t('home:plan.level', { level: showing.level })} /> : null}
        </View>
      </View>
      {body}
    </Card>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: { padding: tokens.space.lg, gap: tokens.space.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: tokens.space.md },
  headerText: { flex: 1, gap: 2 },
  badges: { alignItems: 'flex-end', gap: tokens.space.xs },
  thumbs: { flexDirection: 'row', gap: tokens.space.sm },
  thumb: { flex: 1, aspectRatio: 1, borderRadius: tokens.radius.md, backgroundColor: colors.plate },
  lock: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' },
  lockedText: { gap: tokens.space.xs },
  done: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  doneText: { flex: 1 },
  status: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, paddingVertical: tokens.space.sm },
}));
