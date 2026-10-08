import { useCameraPermissions } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { openSystemSettings } from '@/services/notifications/reminder';
import { setMirror } from '@/state/settings/actions';

import { useSettings, useSettingsDispatch } from './useSettings';

/**
 * The workout mirror (front camera). Turning it on asks for the camera the first time; iOS asks only once,
 * so after a "Don't Allow" the way back is the app's page in the Settings app. The camera is only shown,
 * never recorded or saved.
 */
export function useMirror() {
  const { mirror } = useSettings();
  const dispatch = useSettingsDispatch();
  const [permission, requestPermission] = useCameraPermissions();
  const { t } = useTranslation('workout');

  const setOn = async (on: boolean) => {
    if (!on || permission?.granted) {
      dispatch(setMirror(on));
      return;
    }
    if (permission && !permission.canAskAgain) {
      Alert.alert(t('mirrorDenied.title'), t('mirrorDenied.body'), [
        { text: t('mirrorDenied.cancel'), style: 'cancel' },
        { text: t('mirrorDenied.open'), onPress: openSystemSettings },
      ]);
      return;
    }
    // Declining the system prompt just leaves the mirror off: no second "are you sure".
    const answer = await requestPermission();
    if (answer.granted) dispatch(setMirror(true));
  };

  // Off when camera access was taken away in the Settings app since.
  return { on: mirror && permission?.granted === true, setOn };
}
