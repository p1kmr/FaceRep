import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { WeekDayCard } from '@/components/today/WeekDayCard';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useSettings } from '@/hooks/useSettings';
import { useThisWeek } from '@/hooks/useThisWeek';
import { makeStyles } from '@/theme/makeStyles';

/**
 * This week, opened from the Today card's "Week · Day": day 1 to 7 with today's open, so the user sees what is
 * planned. Only this week (never a total); a later day starts after the one before it, so only today has Start.
 */
export default function WeekScreen() {
  const { t } = useTranslation('home');
  const styles = useStyles();
  const { goal } = useSettings();
  const week = useThisWeek();
  const [open, setOpen] = useState(() => week.days.find((d) => d.isToday)?.day ?? 0);

  const start = () => router.push({ pathname: '/workout', params: { kind: 'today' } });
  const showExercise = (id: string) => router.push({ pathname: '/exercise/[id]', params: { id } });

  return (
    <Screen edges={['bottom']}>
      <View style={styles.titles}>
        <AppText variant="brand" style={styles.title} accessibilityRole="header">
          {t('thisWeek.title', { week: week.week }).toUpperCase()}
        </AppText>
        <AppText muted>{t(`today.notes.${week.note}`)}</AppText>
      </View>
      {week.days.map((d) => (
        <WeekDayCard
          key={d.day}
          day={d}
          goal={goal}
          open={open === d.day}
          onToggle={() => setOpen(open === d.day ? 0 : d.day)}
          onExercise={showExercise}
          onStart={start}
        />
      ))}
      <View style={styles.notes}>
        {week.next ? (
          <AppText variant="footnote" muted>
            {t('thisWeek.next', { week: week.week + 1, note: t(`today.notes.${week.next}`) })}
          </AppText>
        ) : null}
        <AppText variant="footnote" muted>
          {t('thisWeek.how')}
        </AppText>
      </View>
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  titles: { gap: tokens.space.xs },
  title: { fontSize: 36, lineHeight: 42 },
  notes: { gap: tokens.space.sm, paddingHorizontal: tokens.space.xs },
}));
