import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { EXERCISES } from '@/constants/exercises';
import { useChat } from '@/hooks/useChat';
import { useTheme } from '@/hooks/useTheme';
import type { LogAction, RoutineAction } from '@/services/ai/types';
import { defaultItem, workoutSeconds } from '@/services/workout/items';
import type { ProposedAction } from '@/state/chat/types';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, toMinutes } from '@/utils/format';

import { ExerciseAvatars } from '../exercise/ExerciseAvatars';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';

interface WorkoutActionCardProps {
  proposed: ProposedAction & { action: LogAction | RoutineAction };
  onResolve: (accept: boolean) => void;
}

/**
 * A workout the Coach proposed: one done without the app, to save, or a routine to start now. The card shows what the
 * app will do, worked out from its own data (services/progress/log.ts), and nothing happens until Save or Start.
 */
export function WorkoutActionCard({ proposed, onResolve }: WorkoutActionCardProps) {
  const { t, i18n } = useTranslation(['coach', 'common', 'exercises']);
  const { colors } = useTheme();
  const styles = useStyles();
  const { previewLog } = useChat();
  const { action, status } = proposed;
  const log = action.type === 'log' ? action : null;
  const saving = log ? previewLog(log) : null;
  const ids = log ? (saving?.items.map((i) => i.id) ?? []) : action.type === 'routine' ? action.exercises : [];
  const seconds = log ? (saving?.durationSec ?? 0) : workoutSeconds(ids.map(defaultItem));
  const names = ids.map((id) => t(`exercises:items.${EXERCISES[id].key}.name`));
  const listed = names.length > 4 ? [...names.slice(0, 3), t('coach:actions.more', { count: names.length - 3 })] : names;
  const meta = [ids.length ? t('common:exercises', { count: ids.length }) : '', seconds ? t('common:minutes', { count: toMinutes(seconds) }) : '']
    .filter(Boolean)
    .join(' · ');
  const heading = log ? t('coach:actions.log') : t('coach:actions.routine');
  const title = log
    ? log.daysAgo === 0
      ? t('coach:actions.today')
      : log.daysAgo === 1
        ? t('coach:actions.yesterday')
        : saving
          ? formatDay(saving.day, i18n.language)
          : ''
    : (action.type === 'routine' && action.title) || t('coach:actions.routineTitle');

  let footer;
  if (status === 'pending') {
    footer =
      log && !saving ? (
        <>
          <AppText variant="footnote" muted>
            {t('coach:actions.nothing')}
          </AppText>
          <Button title={t('coach:actions.decline')} variant="secondary" onPress={() => onResolve(false)} fullWidth />
        </>
      ) : (
        <View style={styles.buttons}>
          <View style={styles.button}>
            <Button
              title={log ? t('coach:actions.save') : t('coach:actions.start')}
              icon={log ? undefined : 'play.fill'}
              onPress={() => onResolve(true)}
              fullWidth
            />
          </View>
          <View style={styles.button}>
            <Button title={t('coach:actions.decline')} variant="secondary" onPress={() => onResolve(false)} fullWidth />
          </View>
        </View>
      );
  } else if (status === 'done') {
    footer = log ? (
      <Pressable onPress={() => router.push('/progress')} accessibilityRole="button" style={styles.result}>
        <AppText variant="footnote" style={styles.done}>
          {t('coach:actions.done')}
        </AppText>
        <AppText variant="footnote" style={styles.link}>
          {t('coach:actions.openProgress')}
        </AppText>
      </Pressable>
    ) : (
      <AppText variant="footnote" style={styles.done}>
        {t('coach:actions.started')}
      </AppText>
    );
  } else {
    footer = (
      <AppText variant="footnote" muted>
        {log ? t('coach:actions.declined') : t('coach:actions.notStarted')}
      </AppText>
    );
  }

  return (
    <View style={styles.card} accessibilityLabel={heading}>
      <View style={styles.header}>
        <SymbolView name={log ? 'checkmark.circle.fill' : 'play.fill'} size={16} tintColor={colors.primary} />
        <AppText variant="footnote" style={styles.heading}>
          {heading}
        </AppText>
      </View>
      {title ? <AppText variant="headline">{title}</AppText> : null}
      {saving?.plan ? (
        <AppText variant="footnote" style={styles.done}>
          {t('coach:actions.countsFor', { day: saving.plan.day })}
        </AppText>
      ) : log?.plan && saving ? (
        <AppText variant="footnote" muted>
          {t('coach:actions.extra')}
        </AppText>
      ) : null}
      {ids.length ? (
        <View style={styles.exercises}>
          <ExerciseAvatars ids={ids} />
          <View style={styles.flex}>
            <AppText variant="footnote" numberOfLines={2}>
              {listed.join(', ')}
            </AppText>
            {meta ? (
              <AppText variant="caption" muted>
                {meta}
              </AppText>
            ) : null}
          </View>
        </View>
      ) : meta ? (
        <AppText variant="footnote" muted>
          {meta}
        </AppText>
      ) : null}
      {footer}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: {
    gap: tokens.space.md,
    padding: tokens.space.lg,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.surface,
    boxShadow: `${tokens.elevation.card} ${colors.shadow}`,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  heading: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
  exercises: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md },
  flex: { flex: 1, gap: 2 },
  buttons: { flexDirection: 'row', gap: tokens.space.sm },
  button: { flex: 1 },
  result: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  done: { color: colors.success, fontWeight: tokens.font.weight.semibold },
  link: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
}));
