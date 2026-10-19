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
import { SOUND_CUES } from '@/constants/sounds';
import { useGuide } from '@/hooks/useGuide';
import { useScanPhotosSetting } from '@/hooks/useScanPhotosSetting';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { faceTrackingSupported } from '@/services/faceTracking';
import { setGoal, setGuide, setHaptics, setMoveCheck, setSoundCues } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';

import { ToggleRow } from './ToggleRow';

/**
 * Settings → Training: focus, exercise pictures, sound cues (voice, beeps or off), reminders, haptics, the move check
 * and the face scan's progress photos. The mirror itself is turned on and off in the workout (the person button). The move
 * check and scan photo rows only show on iPhones with Apple's face tracking (docs/face-tracking.md, docs/face-scan.md).
 */
export function TrainingCard() {
  const { t } = useTranslation(['settings', 'common']);
  const styles = useStyles();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const guide = useGuide();
  const scanPhotos = useScanPhotosSetting();
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
      <View style={styles.block}>
        <AppText variant="footnote" muted>
          {t('settings:soundCues')}
        </AppText>
        <Segmented
          options={SOUND_CUES.map((c) => ({ id: c, label: t(`settings:soundCuesOption.${c}`) }))}
          value={settings.soundCues}
          onChange={(c) => dispatch(setSoundCues(c))}
        />
        {settings.soundCues === 'off' ? null : (
          <AppText variant="footnote" muted>
            {t(`settings:soundCuesHint.${settings.soundCues}`)}
          </AppText>
        )}
      </View>
      <ListRow
        title={t('settings:reminders')}
        subtitle={t('settings:remindersOn', { count: settings.reminders.filter((r) => r.enabled).length })}
        onPress={() => router.push('/reminders')}
        chevron
        divider
      />
      <ToggleRow
        title={t('settings:haptics')}
        value={settings.haptics}
        onValueChange={(on) => dispatch(setHaptics(on))}
        divider={faceTrackingSupported || scanPhotos.available}
      />
      {faceTrackingSupported ? (
        <ToggleRow
          title={t('settings:moveCheck')}
          subtitle={t('settings:moveCheckHint')}
          value={settings.moveCheck}
          onValueChange={(on) => dispatch(setMoveCheck(on))}
          divider={scanPhotos.available}
        />
      ) : null}
      {scanPhotos.available ? (
        <ToggleRow title={t('settings:scanPhotos')} subtitle={t('settings:scanPhotosHint')} value={scanPhotos.on} onValueChange={scanPhotos.set} />
      ) : null}
    </Card>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  block: { padding: tokens.space.lg, gap: tokens.space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
}));
