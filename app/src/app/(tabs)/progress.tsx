import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MonthCalendar } from '@/components/progress/MonthCalendar';
import { PeriodHeader } from '@/components/progress/PeriodHeader';
import { SessionRow } from '@/components/progress/SessionRow';
import { StatTile } from '@/components/progress/StatTile';
import { WeekBars } from '@/components/progress/WeekBars';
import { YearBars } from '@/components/progress/YearBars';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { useProgressCalendar } from '@/hooks/useProgressCalendar';
import { useProgressState, useProgressSummary } from '@/hooks/useProgress';
import { useTheme } from '@/hooks/useTheme';
import { useToday } from '@/hooks/useToday';
import { shiftAnchor, type CalendarView } from '@/services/progress/calendar';
import { makeStyles } from '@/theme/makeStyles';
import type { ISODate } from '@/utils/dates';
import { formatDay, formatDayMonth, formatMonthYear, toMinutes } from '@/utils/format';

const HISTORY_ROWS = 30;
const VIEWS: CalendarView[] = ['week', 'month', 'year'];

export default function ProgressScreen() {
  const { t, i18n } = useTranslation(['progress', 'common']);
  const { colors } = useTheme();
  const styles = useStyles();
  const { sessions } = useProgressState();
  const { streak, best, totals } = useProgressSummary();
  const today = useToday();
  const [view, setView] = useState<CalendarView>('week');
  const [anchor, setAnchor] = useState<ISODate>(today);
  const [selected, setSelected] = useState<ISODate | null>(null);
  const cal = useProgressCalendar(view, anchor);
  const recent = sessions.slice(0, HISTORY_ROWS);
  const onSelected = selected ? sessions.filter((s) => s.day === selected) : [];

  const lang = i18n.language;
  const title =
    view === 'week'
      ? `${formatDayMonth(cal.period.from, lang)} – ${formatDayMonth(cal.period.to, lang)}`
      : view === 'month'
        ? formatMonthYear(cal.period.from, lang)
        : cal.period.from.slice(0, 4);
  const minutes = t('common:minutes', { count: toMinutes(cal.summary.seconds) });
  const summary =
    view === 'week'
      ? t('progress:summaryWeek', { days: cal.summary.days, minutes })
      : t('progress:summaryPeriod', {
          workouts: t('progress:workoutCount', { count: cal.summary.workouts }),
          days: t('progress:dayCount', { count: cal.summary.days }),
          minutes,
        });

  const changeView = (next: CalendarView) => {
    setView(next);
    setAnchor(today);
    setSelected(null);
  };
  const move = (by: number) => {
    setAnchor(shiftAnchor(anchor, view, by));
    setSelected(null);
  };
  const openMonth = (month: ISODate) => {
    setView('month');
    setAnchor(month);
    setSelected(null);
  };

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('progress:title')}
      </AppText>
      <Card style={styles.streakCard}>
        <SymbolView name="flame.fill" size={34} tintColor={colors.streak} />
        <View style={styles.streakText}>
          <AppText variant="caption" muted>
            {t('progress:streak')}
          </AppText>
          <AppText variant="title">{t('progress:days', { count: streak })}</AppText>
        </View>
        <View style={styles.best}>
          <AppText variant="caption" muted>
            {t('progress:best')}
          </AppText>
          <AppText variant="headline">{t('progress:days', { count: best })}</AppText>
        </View>
      </Card>
      <View style={styles.tiles}>
        <StatTile label={t('progress:workouts')} value={String(totals.workouts)} />
        <StatTile label={t('progress:minutes')} value={String(toMinutes(totals.seconds))} />
        <StatTile label={t('progress:reps')} value={String(totals.reps)} />
      </View>

      <SectionHeader title={t('progress:calendar')} />
      <Card style={styles.calendar}>
        <Segmented options={VIEWS.map((v) => ({ id: v, label: t(`progress:views.${v}`) }))} value={view} onChange={changeView} />
        <PeriodHeader title={title} onPrevious={() => move(-1)} onNext={() => move(1)} canGoForward={cal.canGoForward} />
        {view === 'week' ? <WeekBars week={cal.week} /> : null}
        {view === 'month' ? (
          <MonthCalendar
            weeks={cal.month}
            weekdays={cal.weekdays}
            today={cal.today}
            selected={selected}
            workoutsOn={cal.workoutsOn}
            onPressDay={(day) => setSelected(day === selected ? null : day)}
          />
        ) : null}
        {view === 'year' ? <YearBars months={cal.year} today={cal.today} onPressMonth={openMonth} /> : null}
        <AppText variant="footnote" muted center accessibilityLiveRegion="polite">
          {summary}
        </AppText>
      </Card>
      {view === 'month' ? (
        selected ? (
          <Card>
            {onSelected.length ? (
              // Each row already starts with the date.
              onSelected.map((s, i) => <SessionRow key={s.id} session={s} divider={i < onSelected.length - 1} />)
            ) : (
              <View style={styles.dayEmpty}>
                <AppText variant="headline">{formatDay(selected, lang)}</AppText>
                <AppText muted>{t('progress:noWorkoutDay')}</AppText>
              </View>
            )}
          </Card>
        ) : (
          <AppText variant="footnote" muted center>
            {t('progress:tapDay')}
          </AppText>
        )
      ) : null}

      <SectionHeader title={t('progress:history')} />
      {recent.length ? (
        <Card>
          {recent.map((s, i) => (
            <SessionRow key={s.id} session={s} divider={i < recent.length - 1} />
          ))}
        </Card>
      ) : (
        <Card style={styles.empty}>
          <AppText variant="headline">{t('progress:empty.title')}</AppText>
          <AppText muted>{t('progress:empty.body')}</AppText>
        </Card>
      )}
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  streakCard: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.lg, padding: tokens.space.lg },
  streakText: { flex: 1 },
  best: { alignItems: 'flex-end' },
  tiles: { flexDirection: 'row', gap: tokens.space.sm },
  calendar: { padding: tokens.space.lg, gap: tokens.space.lg },
  dayEmpty: { padding: tokens.space.lg, gap: tokens.space.xs },
  empty: { padding: tokens.space.lg, gap: tokens.space.xs },
}));
