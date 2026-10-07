import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useReminderText } from '@/hooks/useReminderText';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import type { ProposedAction } from '@/state/chat/types';
import { makeStyles } from '@/theme/makeStyles';

import { REMINDER_ICONS } from '../reminders/ReminderRow';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';

/**
 * One reminder change the Coach proposed: what will happen, and Confirm / No thanks (same as Elowa's
 * cards). Nothing is saved until the user taps Confirm.
 */
export function ReminderActionCard({ proposed, onResolve }: { proposed: ProposedAction; onResolve: (accept: boolean) => void }) {
  const { t } = useTranslation('coach');
  const { colors } = useTheme();
  const styles = useStyles();
  const text = useReminderText();
  const { reminders } = useSettings();
  const { action, status } = proposed;

  const existing = action.type === 'create' ? undefined : reminders.find((r) => r.id === action.id);
  // What the reminder will look like after the change (or what gets deleted).
  const shown = action.type === 'create' ? action : action.type === 'update' && existing ? { ...existing, ...action } : existing;
  // "Pause" / "Turn back on" only when that's the whole change; anything more is "Change reminder".
  const onlyOnOff = action.type === 'update' && Object.keys(action).length === 3 && action.enabled !== undefined;
  const heading = onlyOnOff ? t(action.enabled ? 'actions.resume' : 'actions.pause') : t(`actions.${action.type}`);
  // Already gone (deleted meanwhile): nothing to confirm.
  const missing = action.type !== 'create' && !existing && status === 'pending';

  return (
    <View style={styles.card} accessibilityLabel={heading}>
      <View style={styles.header}>
        <SymbolView
          name={action.type === 'delete' ? 'trash.fill' : shown ? REMINDER_ICONS[shown.kind] : 'bell.fill'}
          size={16}
          tintColor={colors.primary}
        />
        <AppText variant="footnote" style={styles.heading}>
          {heading}
        </AppText>
      </View>
      {shown ? (
        <View style={styles.body}>
          <AppText variant="headline">{text.name(shown)}</AppText>
          <AppText variant="footnote" muted>
            {text.summary(shown)}
          </AppText>
        </View>
      ) : null}
      {missing ? (
        <AppText variant="footnote" muted>
          {t('actions.missing')}
        </AppText>
      ) : status === 'pending' ? (
        <View style={styles.buttons}>
          <View style={styles.button}>
            <Button title={t('actions.confirm')} onPress={() => onResolve(true)} fullWidth />
          </View>
          <View style={styles.button}>
            <Button title={t('actions.decline')} variant="secondary" onPress={() => onResolve(false)} fullWidth />
          </View>
        </View>
      ) : status === 'done' ? (
        <Pressable onPress={() => router.push('/reminders')} accessibilityRole="button" style={styles.result}>
          <AppText variant="footnote" style={styles.done}>
            {t('actions.done')}
          </AppText>
          <AppText variant="footnote" style={styles.link}>
            {t('actions.open')}
          </AppText>
        </Pressable>
      ) : (
        <AppText variant="footnote" muted>
          {t('actions.declined')}
        </AppText>
      )}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: {
    gap: tokens.space.md,
    padding: tokens.space.lg,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  heading: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
  body: { gap: 2 },
  buttons: { flexDirection: 'row', gap: tokens.space.sm },
  button: { flex: 1 },
  result: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  done: { color: colors.success, fontWeight: tokens.font.weight.semibold },
  link: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
}));
