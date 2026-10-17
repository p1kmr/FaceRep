import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';

import { EXERCISE_IDS, EXERCISES, type ExerciseId, type Goal } from '@/constants/exercises';
import { areasOfAll, type FaceArea } from '@/constants/faceMap';
import { PLAN } from '@/constants/plan';
import { useGuideImages } from '@/hooks/useGuide';
import type { usePlan } from '@/hooks/usePlan';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, toMinutes } from '@/utils/format';

import { FaceMap } from '../faceMap/FaceMap';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Gradient } from '../ui/Gradient';

interface TodayCardProps {
  plan: ReturnType<typeof usePlan>;
  goal: Goal;
  isPremium: boolean;
  /** Starts today's plan day (it counts for the plan). */
  onStart: () => void;
  /** Today's day is done: the same exercises again, not counted. */
  onPractice: () => void;
  onUnlock: () => void;
  /** A tap on an area of the face: learn about it in the library's face map. */
  onArea: (area: FaceArea) => void;
}

/** Placeholder thumbnails for a locked day (the real Premium days aren't on the device). */
const teaserIds = (goal: Goal): ExerciseId[] =>
  EXERCISE_IDS.filter((id) => goal === 'full' || EXERCISES[id].program === goal).slice(0, 5);

/** Up to five exercise thumbnails as overlapping circles, then "+n". */
function Avatars({ ids, blurred }: { ids: readonly ExerciseId[]; blurred?: boolean }) {
  const styles = useStyles();
  const images = useGuideImages();
  const shown = ids.slice(0, 5);
  return (
    <View style={styles.avatars} accessible={false}>
      {shown.map((id, i) => (
        <Image
          key={id}
          source={images.exercises[id].thumb}
          style={[styles.avatar, i > 0 && styles.overlap]}
          contentFit="cover"
          blurRadius={blurred ? 10 : 0}
        />
      ))}
      {ids.length > shown.length ? (
        <View style={[styles.avatar, styles.overlap, styles.more]}>
          <AppText variant="caption" style={styles.moreText}>
            +{ids.length - shown.length}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

/** Image shape of the face map (base.webp). */
const MAP_ASPECT = 720 / 974;

/**
 * Today's plan day as the hero: the face with the areas this day works lit in red (tap one to learn about it), the
 * areas as the title, the exercises and one big button. Also the done, locked, loading and error states.
 */
export function TodayCard({ plan, goal, isPremium, onStart, onPractice, onUnlock, onArea }: TodayCardProps) {
  const { t, i18n } = useTranslation(['home', 'common', 'exercises']);
  const styles = useStyles();
  const { colors } = useTheme();
  const { map } = useGuideImages();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const { progress, showing, today } = plan;
  const ready = today.status === 'ready' ? today : null;
  const areas = ready ? areasOfAll(ready.day.ids) : [];
  const areaNames = areas.map((a) => t(`exercises:areas.${a}.name`));
  const title =
    today.status === 'locked'
      ? t('home:plan.locked.title')
      : areas.length && areas.length <= 3
        ? areaNames.join(' · ')
        : t(`common:programs.${goal}`);
  const subtitle = ready?.day.kind === 'light' ? t('home:plan.light') : ready?.day.kind === 'final' ? t('home:plan.final') : t(`home:plan.weeks.${showing.weekName}`);

  // Frame the lit areas: the face is cropped to the card, and moved up so a neck day shows the neck.
  const mapHeight = box.width / MAP_ASPECT;
  let offset = 0;
  if (areas.length && box.height && mapHeight > box.height) {
    const top = Math.min(...areas.map((a) => map.layout.areas[a].box[1]));
    const bottom = Math.max(...areas.map((a) => map.layout.areas[a].box[1] + map.layout.areas[a].box[3]));
    offset = Math.min(Math.max(((top + bottom) / 2) * mapHeight - box.height * 0.42, 0), mapHeight - box.height, Math.max(top * mapHeight - 16, 0));
  }

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
        <View style={styles.row}>
          <SymbolView name="checkmark.circle.fill" size={24} tintColor={colors.success} />
          <AppText style={styles.flex}>{message}</AppText>
        </View>
        {freeWeekDone ? <Button title={t('home:plan.locked.cta')} onPress={onUnlock} size="large" fullWidth /> : null}
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
        <View style={styles.row}>
          <Avatars ids={today.day.ids} />
          <AppText variant="footnote" muted style={styles.flex}>
            {meta}
          </AppText>
        </View>
        <Button
          title={progress.finished ? t('home:plan.startLevel', { level: showing.level }) : t('home:plan.start', { day: showing.day })}
          onPress={onStart}
          icon="play.fill"
          size="large"
          fullWidth
        />
      </>
    );
  } else if (today.status === 'locked') {
    body = (
      <>
        <View style={styles.row}>
          <Avatars ids={teaserIds(goal)} blurred />
          <SymbolView name="lock.fill" size={20} tintColor={colors.textMuted} />
        </View>
        <AppText muted>{t('home:plan.locked.body')}</AppText>
        <Button title={t('home:plan.locked.cta')} onPress={onUnlock} size="large" fullWidth />
      </>
    );
  } else if (today.status === 'loading') {
    body = (
      <View style={styles.row} accessibilityLiveRegion="polite">
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
    <View style={styles.card}>
      <View style={styles.mapBox} onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
        {box.width ? (
          <FaceMap
            lit={areas}
            pulse={!!ready && !progress.doneToday}
            onSelect={onArea}
            label={t('home:focus.a11y', { areas: areaNames.join(', ') || title })}
            style={{ position: 'absolute', top: -offset, left: 0, width: box.width }}
          />
        ) : null}
        <View style={styles.top} pointerEvents="box-none">
          <View style={styles.pill}>
            <AppText variant="caption" style={styles.pillText}>
              {t('home:plan.header', { week: showing.week, day: showing.day, total: PLAN.days }).toUpperCase()}
            </AppText>
          </View>
          <View style={styles.badges}>
            <Badge label={t(`common:programs.${goal}`)} tone="primary" />
            {showing.level > 1 ? <Badge label={t('home:plan.level', { level: showing.level })} /> : null}
          </View>
        </View>
        <View style={styles.caption} pointerEvents="none">
          <Gradient colors={[colors.plateFade, colors.plate]} direction="vertical" />
          <AppText variant="brand" numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7} style={styles.title} accessibilityRole="header">
            {title.toUpperCase()}
          </AppText>
          <AppText variant="footnote" style={styles.subtitle}>
            {subtitle} · {formatDay(showing.date, i18n.language)}
          </AppText>
        </View>
      </View>
      <View style={styles.body}>{body}</View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: {
    borderRadius: tokens.radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    boxShadow: `${tokens.elevation.raised} ${colors.shadow}`,
    overflow: 'hidden',
  },
  mapBox: { aspectRatio: 1.08, overflow: 'hidden', backgroundColor: colors.plate },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: tokens.space.md },
  pill: { paddingHorizontal: tokens.space.sm + 2, paddingVertical: 5, borderRadius: tokens.radius.pill, backgroundColor: colors.overlay },
  pillText: { color: colors.onImage, fontWeight: tokens.font.weight.bold, letterSpacing: 0.6 },
  badges: { alignItems: 'flex-end', gap: tokens.space.xs },
  caption: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 48, paddingHorizontal: tokens.space.lg, paddingBottom: tokens.space.md },
  // Always on the white plate, in both themes.
  title: { color: colors.primary, fontSize: 38, lineHeight: 44 },
  subtitle: { color: colors.onPlateMuted },
  body: { padding: tokens.space.lg, gap: tokens.space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md },
  flex: { flex: 1 },
  avatars: { flexDirection: 'row' },
  avatar: { width: 42, height: 42, borderRadius: tokens.radius.pill, borderWidth: 2, borderColor: colors.surface, backgroundColor: colors.plate },
  overlap: { marginLeft: -12 },
  more: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  moreText: { fontWeight: tokens.font.weight.bold },
}));
