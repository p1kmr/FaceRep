import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, TextInput, View } from 'react-native';

import { DayPicker } from '@/components/reminders/DayPicker';
import { TimesEditor } from '@/components/reminders/TimesEditor';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { REMINDER, REMINDER_KINDS } from '@/constants/reminders';
import { useReminders } from '@/hooks/useReminders';
import { useTheme } from '@/hooks/useTheme';
import type { Reminder } from '@/services/reminders/reminders';
import { makeStyles } from '@/theme/makeStyles';
import { createId } from '@/utils/ids';

const NEW: Omit<Reminder, 'id'> = { kind: 'mewing', title: '', enabled: true, times: [...REMINDER.everyTwoHours], days: [1, 2, 3, 4, 5] };

/** Add or edit one reminder: type, name, times, days. ?id= edits an existing one. */
export default function ReminderScreen() {
  const { t } = useTranslation(['reminders', 'common']);
  const { colors } = useTheme();
  const styles = useStyles();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { reminders, save, remove } = useReminders();
  const existing = reminders.find((r) => r.id === id);
  const [draft, setDraft] = useState<Reminder>(() => existing ?? { id: createId(), ...NEW });
  const set = (patch: Partial<Reminder>) => setDraft((d) => ({ ...d, ...patch }));

  const onSave = async () => {
    if (!draft.days.length) {
      Alert.alert(t('reminders:edit.days'), t('reminders:errors.noDays'));
      return;
    }
    // A new reminder starts on; an edited one keeps its on/off.
    if (await save({ ...draft, enabled: existing ? draft.enabled : true })) router.back();
  };

  const onDelete = () =>
    Alert.alert(t('reminders:edit.deleteConfirm'), undefined, [
      { text: t('common:cancel'), style: 'cancel' },
      {
        text: t('reminders:edit.delete'),
        style: 'destructive',
        onPress: () => {
          remove(draft.id);
          router.back();
        },
      },
    ]);

  return (
    <Screen edges={['bottom']} footer={<Button title={t('reminders:edit.save')} onPress={onSave} fullWidth />}>
      <Stack.Screen options={{ title: existing ? t('reminders:edit.editTitle') : t('reminders:edit.newTitle') }} />
      <View style={styles.block}>
        <AppText variant="footnote" muted>
          {t('reminders:edit.type')}
        </AppText>
        <View style={styles.chips}>
          {REMINDER_KINDS.map((k) => (
            <Chip key={k} label={t(`reminders:kinds.${k}`)} selected={draft.kind === k} onPress={() => set({ kind: k })} />
          ))}
        </View>
      </View>
      <View style={styles.block}>
        <AppText variant="footnote" muted>
          {t('reminders:edit.name')}
        </AppText>
        <TextInput
          value={draft.title}
          onChangeText={(title) => set({ title })}
          placeholder={t(`reminders:kinds.${draft.kind}`)}
          placeholderTextColor={colors.textMuted}
          maxLength={REMINDER.titleMax}
          style={styles.input}
          accessibilityLabel={t('reminders:edit.name')}
          returnKeyType="done"
        />
      </View>
      <View style={styles.block}>
        <AppText variant="footnote" muted>
          {t('reminders:edit.times')}
        </AppText>
        <TimesEditor value={draft.times} onChange={(times) => set({ times })} />
      </View>
      <View style={styles.block}>
        <AppText variant="footnote" muted>
          {t('reminders:edit.days')}
        </AppText>
        <DayPicker value={draft.days} onChange={(days) => set({ days })} />
      </View>
      {existing ? <Button title={t('reminders:edit.delete')} variant="danger" onPress={onDelete} fullWidth /> : null}
    </Screen>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  block: { gap: tokens.space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.xs },
  input: {
    minHeight: 48,
    paddingHorizontal: tokens.space.lg,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: tokens.font.size.body,
  },
}));
