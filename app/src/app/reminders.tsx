import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ReminderRow } from '@/components/reminders/ReminderRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { REMINDER } from '@/constants/reminders';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { useReminders } from '@/hooks/useReminders';
import { openSystemSettings } from '@/services/notifications/reminder';
import { makeStyles } from '@/theme/makeStyles';

/** Settings → Reminders: the list with on/off switches; tap one to edit, or add a new one. */
export default function RemindersScreen() {
  const { t } = useTranslation('reminders');
  const styles = useStyles();
  const { reminders, save, canAdd } = useReminders();
  const permission = useNotificationPermission();
  const anyOn = reminders.some((r) => r.enabled);

  return (
    <Screen edges={['bottom']}>
      <AppText muted>{t('intro')}</AppText>
      {permission === 'denied' && anyOn ? (
        <Card style={styles.notice}>
          <AppText>{t('permission.off')}</AppText>
          <Button title={t('permission.open')} variant="secondary" onPress={openSystemSettings} />
        </Card>
      ) : null}
      {reminders.length ? (
        <Card>
          {reminders.map((r, i) => (
            <ReminderRow
              key={r.id}
              reminder={r}
              divider={i < reminders.length - 1}
              onPress={() => router.push({ pathname: '/reminder', params: { id: r.id } })}
              onToggle={(on) => save({ ...r, enabled: on })}
            />
          ))}
        </Card>
      ) : (
        <AppText muted center>
          {t('empty')}
        </AppText>
      )}
      <View style={styles.footer}>
        <Button title={t('add')} onPress={() => router.push('/reminder')} disabled={!canAdd} fullWidth />
        <AppText variant="footnote" muted center>
          {t('count', { count: reminders.length, max: REMINDER.max })}
        </AppText>
      </View>
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  notice: { padding: tokens.space.lg, gap: tokens.space.md },
  footer: { gap: tokens.space.sm },
}));
