import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { faceScanMode } from '@/services/faceTracking';
import { setScanPhotos } from '@/state/settings/actions';

import { useSettings, useSettingsDispatch } from './useSettings';

/**
 * The face scan's progress photo switch (Settings, the photos screen). Turning it on always shows what it means first
 * (one photo per scan, only in the app on this iPhone, not in backups) and needs a yes; turning it off is immediate
 * and keeps the photos already taken.
 */
export function useScanPhotosSetting() {
  const { scanPhotos } = useSettings();
  const dispatch = useSettingsDispatch();
  const { t } = useTranslation('scan');
  const set = (on: boolean) => {
    if (!on) {
      dispatch(setScanPhotos(false));
      return;
    }
    Alert.alert(t('photo.askTitle'), t('photo.askBody'), [
      { text: t('photo.no'), style: 'cancel', onPress: () => dispatch(setScanPhotos(false)) },
      { text: t('photo.yes'), onPress: () => dispatch(setScanPhotos(true)) },
    ]);
  };
  return { on: scanPhotos === true, set, available: faceScanMode !== null };
}
