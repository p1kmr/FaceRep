import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import type { ReminderKind } from '@/constants/reminders';
import { useReminderText } from '@/hooks/useReminderText';
import { useTheme } from '@/hooks/useTheme';
import type { Reminder } from '@/services/reminders/reminders';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';
import { Toggle } from '../ui/Toggle';

export const REMINDER_ICONS: Record<ReminderKind, SymbolViewProps['name']> = {
  workout: 'flame.fill',
  mewing: 'mouth.fill',
  posture: 'figure.stand',
  custom: 'bell.fill',
};

/** Icon, name, "Weekdays · 10:00 AM" and an on/off switch. Tap to edit. */
export function ReminderRow({
  reminder,
  onPress,
  onToggle,
  divider,
}: {
  reminder: Reminder;
  onPress: () => void;
  onToggle: (on: boolean) => void;
  divider?: boolean;
}) {
  const { t } = useTranslation('reminders');
  const { colors } = useTheme();
  const styles = useStyles();
  const text = useReminderText();
  const name = text.name(reminder);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <SymbolView name={REMINDER_ICONS[reminder.kind]} size={18} tintColor={colors.primary} />
      </View>
      <View style={styles.text}>
        <AppText numberOfLines={1}>{name}</AppText>
        <AppText variant="footnote" muted numberOfLines={2}>
          {text.summary(reminder)}
        </AppText>
      </View>
      <Toggle value={reminder.enabled} onValueChange={onToggle} accessibilityLabel={t('toggle', { title: name })} />
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, padding: tokens.space.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  pressed: { backgroundColor: colors.surfaceAlt },
  icon: { width: 36, height: 36, borderRadius: tokens.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  text: { flex: 1, gap: 2 },
}));
