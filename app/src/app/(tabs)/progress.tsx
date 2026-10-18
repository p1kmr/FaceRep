import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MonthCalendar } from '@/components/progress/MonthCalendar';
import { PeriodHeader } from '@/components/progress/PeriodHeader';
import { SessionRow } from '@/components/progress/SessionRow';
import { StreakHero } from '@/components/progress/StreakHero';
import { WeekBars } from '@/components/progress/WeekBars';
import { YearMonths } from '@/components/progress/YearMonths';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Segmented } from '@/components/ui/Segmented';
import { StatCard } from '@/components/ui/StatCard';
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
  const [view, setView] = useState<CalendarView>('month');
  const [anchor, setAnchor] = useState<ISODate>(today);
  const [selected, setSelected] = useState<ISODate | null>(null);
  // One workout open at a time (the selected day's and History's), as the week page opens one day.
  const [openRow, setOpenRow] = useState<string | null>(null);
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
  const toggle = (row: string) => setOpenRow(openRow === row ? null : row);
  const showExercise = (id: string) => router.push({ pathname: '/exercise/[id]', params: { id } });
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
      <StreakHero streak={streak} best={best} />
      <View style={styles.tiles}>
        <StatCard
          icon="checkmark.seal.fill"
          tint={colors.success}
          soft={colors.successSoft}
          value={totals.workouts}
          label={t('progress:workouts')}
          a11y={`${t('progress:workouts')}: ${totals.workouts}`}
        />
        <StatCard
          icon="clock.fill"
          tint={colors.info}
          soft={colors.infoSoft}
          value={toMinutes(totals.seconds)}
          label={t('progress:minutes')}
          a11y={`${t('progress:minutes')}: ${toMinutes(totals.seconds)}`}
        />
        <StatCard
          icon="chart.bar.fill"
          tint={colors.primary}
          soft={colors.primarySoft}
          value={totals.reps}
          label={t('progress:reps')}
          a11y={`${t('progress:reps')}: ${totals.reps}`}
        />
      </View>

      <SectionHeader title={t('progress:calendar')} />
      <Card style={styles.calendar}>
        <Segmented options={VIEWS.map((v) => ({ id: v, label: t(`progress:views.${v}`) }))} value={view} onChange={changeView} />
        <PeriodHeader
          title={title}
          onPrevious={() => move(-1)}
          onNext={() => move(1)}
          canGoForward={cal.canGoForward}
          canGoBack={cal.canGoBack}
        />
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
        {view === 'year' ? <YearMonths months={cal.year} today={cal.today} workoutsOn={cal.workoutsOn} onPressMonth={openMonth} /> : null}
        <AppText variant="footnote" muted center accessibilityLiveRegion="polite">
          {summary}
        </AppText>
      </Card>
      {view === 'month' ? (
        selected ? (
          <Card>
            {onSelected.length ? (
              // Each row already starts with the date.
              onSelected.map((s, i) => (
                <SessionRow
                  key={s.id}
                  session={s}
                  open={openRow === `day:${s.id}`}
                  onToggle={() => toggle(`day:${s.id}`)}
                  onExercise={showExercise}
                  divider={i < onSelected.length - 1}
                />
              ))
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
            <SessionRow
              key={s.id}
              session={s}
              open={openRow === `history:${s.id}`}
              onToggle={() => toggle(`history:${s.id}`)}
              onExercise={showExercise}
              divider={i < recent.length - 1}
            />
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
  tiles: { flexDirection: 'row', gap: tokens.space.md },
  calendar: { padding: tokens.space.lg, gap: tokens.space.lg },
  dayEmpty: { padding: tokens.space.lg, gap: tokens.space.xs },
  empty: { padding: tokens.space.lg, gap: tokens.space.xs },
}));
