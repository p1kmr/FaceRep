import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { Goal } from '@/constants/exercises';
import { areasOfAll, type FaceArea } from '@/constants/faceMap';
import { useGuideImages } from '@/hooks/useGuide';
import { useTheme } from '@/hooks/useTheme';
import type { useTodayWorkout } from '@/hooks/useTodayWorkout';
import { isMilestone } from '@/services/workout/weeks';
import { makeStyles } from '@/theme/makeStyles';
import { toMinutes } from '@/utils/format';

import { ExerciseAvatars } from '../exercise/ExerciseAvatars';
import { FaceMap } from '../faceMap/FaceMap';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Gradient } from '../ui/Gradient';

interface TodayCardProps {
  workout: ReturnType<typeof useTodayWorkout>;
  goal: Goal;
  isPremium: boolean;
  onStart: () => void;
  onUnlock: () => void;
  /** A tap on "Week · Day": this week's days and their exercises (the week page). */
  onWeek: () => void;
  /** A tap on an area of the face: learn about it in the library's face map. */
  onArea: (area: FaceArea) => void;
}

/** Image shape of the face map (base.webp). */
const MAP_ASPECT = 720 / 974;

/**
 * Today's workout as the hero: where it is in the weeks ("Week 6 · Day 3", never a total), the face with the areas it
 * works lit in red (tap one to learn about it; tap "Week · Day" for the whole week), the areas as the title with the week's step under them, the exercises
 * and one big button. Without Premium it says that more exercises come with it.
 */
export function TodayCard({ workout, goal, isPremium, onStart, onUnlock, onWeek, onArea }: TodayCardProps) {
  const { t } = useTranslation(['home', 'common', 'exercises']);
  const styles = useStyles();
  const { colors } = useTheme();
  const { map } = useGuideImages();
  const [box, setBox] = useState({ width: 0, height: 0 });
  const ids = workout.items.map((i) => i.id);
  const areas = areasOfAll(ids);
  const areaNames = areas.map((a) => t(`exercises:areas.${a}.name`));
  const title = areas.length && areas.length <= 3 ? areaNames.join(' · ') : t(`common:programs.${goal}`);
  const minutes = t('common:minutes', { count: toMinutes(workout.seconds) });
  const { week, day, easy } = workout;
  const where = easy ? t('home:today.weekEasy', { week }) : t('home:today.week', { week, day });
  const note = easy ? t('home:today.easy') : t(`home:today.notes.${workout.note}`);
  const doneText = !easy
    ? t('home:today.doneDay', { day, next: day + 1 })
    : isMilestone(week)
      ? t('home:today.doneMilestone', { weeks: week, next: week + 1 })
      : t('home:today.doneWeek', { week, next: week + 1 });

  // Frame the lit areas: the face is cropped to the card, and moved up so a neck day shows the neck.
  const mapHeight = box.width / MAP_ASPECT;
  let offset = 0;
  if (areas.length && box.height && mapHeight > box.height) {
    const top = Math.min(...areas.map((a) => map.layout.areas[a].box[1]));
    const bottom = Math.max(...areas.map((a) => map.layout.areas[a].box[1] + map.layout.areas[a].box[3]));
    offset = Math.min(Math.max(((top + bottom) / 2) * mapHeight - box.height * 0.42, 0), mapHeight - box.height, Math.max(top * mapHeight - 16, 0));
  }

  return (
    <View style={styles.card}>
      <View style={styles.mapBox} onLayout={(e) => setBox({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
        {box.width ? (
          <FaceMap
            lit={areas}
            pulse={!workout.done}
            onSelect={onArea}
            label={t('home:focus.a11y', { areas: areaNames.join(', ') || title })}
            style={{ position: 'absolute', top: -offset, left: 0, width: box.width }}
          />
        ) : null}
        <View style={styles.top} pointerEvents="box-none">
          <Pressable
            onPress={onWeek}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={where}
            accessibilityHint={t('home:thisWeek.open')}
            style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
          >
            <AppText variant="caption" style={styles.pillText}>
              {where.toUpperCase()}
            </AppText>
            <SymbolView name="chevron.right" size={10} weight="bold" tintColor={colors.onImage} />
          </Pressable>
          <Badge label={t(`common:programs.${goal}`)} tone="primary" />
        </View>
        <View style={styles.caption} pointerEvents="none">
          <Gradient colors={[colors.plateFade, colors.plate]} direction="vertical" />
          <AppText variant="brand" numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7} style={styles.title} accessibilityRole="header">
            {title.toUpperCase()}
          </AppText>
          <AppText variant="footnote" style={styles.subtitle}>
            {note} · {minutes}
          </AppText>
        </View>
      </View>
      <View style={styles.body}>
        {workout.done ? (
          <View style={styles.row}>
            <SymbolView name="checkmark.circle.fill" size={24} tintColor={colors.success} />
            <AppText style={styles.flex}>{doneText}</AppText>
          </View>
        ) : (
          <View style={styles.row}>
            <ExerciseAvatars ids={ids} />
            <AppText variant="footnote" muted style={styles.flex}>
              {t('home:today.meta', { exercises: t('common:exercises', { count: ids.length }), minutes })}
            </AppText>
          </View>
        )}
        <Button
          title={workout.done ? t('home:today.again') : t('home:today.start')}
          variant={workout.done ? 'secondary' : 'primary'}
          onPress={onStart}
          icon={workout.done ? undefined : 'play.fill'}
          size={workout.done ? 'regular' : 'large'}
          disabled={!ids.length}
          fullWidth
        />
        {isPremium ? null : (
          <Button title={t('home:today.unlock')} variant="ghost" onPress={onUnlock} fullWidth />
        )}
      </View>
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
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    paddingHorizontal: tokens.space.sm + 2,
    paddingVertical: 5,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.overlay,
  },
  pressed: { opacity: 0.7 },
  pillText: { color: colors.onImage, fontWeight: tokens.font.weight.bold, letterSpacing: 0.6 },
  caption: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingTop: 48, paddingHorizontal: tokens.space.lg, paddingBottom: tokens.space.md },
  // Always on the white plate, in both themes.
  title: { color: colors.primary, fontSize: 38, lineHeight: 44 },
  subtitle: { color: colors.onPlateMuted },
  body: { padding: tokens.space.lg, gap: tokens.space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md },
  flex: { flex: 1 },
}));
