import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { ListRow } from '@/components/ui/ListRow';
import { AppText } from '@/components/ui/AppText';
import { Segmented } from '@/components/ui/Segmented';
import { AVAILABLE_GUIDES } from '@/constants/exerciseImages';
import { goalsFor } from '@/constants/exercises';
import { useGuide } from '@/hooks/useGuide';
import { useMirror } from '@/hooks/useMirror';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { setGoal, setGuide, setHaptics, setVoiceCues } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

import { ToggleRow } from './ToggleRow';

/** Settings → Training: focus, exercise pictures, reminders, and how workouts guide you (haptics, voice, mirror). */
export function TrainingCard() {
  const { t } = useTranslation(['settings', 'common']);
  const styles = useStyles();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const guide = useGuide();
  const mirror = useMirror();
  return (
    <Card>
      <View style={styles.block}>
        <AppText variant="footnote" muted>
          {t('settings:goal')}
        </AppText>
        {/* Six focus areas don't fit a segmented control: wrapping chips instead. */}
        <View style={styles.chips} accessibilityRole="radiogroup">
          {goalsFor(guide).map((g) => (
            <Chip key={g} label={t(`common:programs.${g}`)} selected={settings.goal === g} onPress={() => dispatch(setGoal(g))} />
          ))}
        </View>
      </View>
      {AVAILABLE_GUIDES.length > 1 ? (
        <View style={styles.block}>
          <AppText variant="footnote" muted>
            {t('settings:guide')}
          </AppText>
          <Segmented
            options={AVAILABLE_GUIDES.map((g) => ({ id: g, label: t(`common:guides.${g}`) }))}
            value={guide}
            onChange={(g) => dispatch(setGuide(g))}
          />
        </View>
      ) : null}
      <ListRow
        title={t('settings:reminders')}
        subtitle={t('settings:remindersOn', { count: settings.reminders.filter((r) => r.enabled).length })}
        onPress={() => router.push('/reminders')}
        chevron
        divider
      />
      <ToggleRow title={t('settings:haptics')} value={settings.haptics} onValueChange={(on) => dispatch(setHaptics(on))} divider />
      <ToggleRow
        title={t('settings:voiceCues')}
        subtitle={t('settings:voiceCuesHint')}
        value={settings.voiceCues}
        onValueChange={(on) => dispatch(setVoiceCues(on))}
        divider
      />
      <ToggleRow title={t('settings:mirror')} subtitle={t('settings:mirrorHint')} value={mirror.on} onValueChange={mirror.setOn} />
    </Card>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  block: { padding: tokens.space.lg, gap: tokens.space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
}));
