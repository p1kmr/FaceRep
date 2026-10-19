import { useCameraPermissions } from 'expo-camera';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, Alert, AppState, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FaceGuide } from '@/components/scan/FaceGuide';
import { ScanCamera } from '@/components/scan/ScanCamera';
import { ScanIntro } from '@/components/scan/ScanIntro';
import { ScanPanel } from '@/components/scan/ScanPanel';
import { ScanStepDots } from '@/components/scan/ScanStepDots';
import { IconButton } from '@/components/ui/IconButton';
import { useFaceScanActions, useFaceScans } from '@/hooks/useFaceScans';
import { useScanRun } from '@/hooks/useScanRun';
import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import type { RawScan } from '@/services/faceScan/score';
import { deleteScanPhoto, faceScanMode, simulatorCamera } from '@/services/faceTracking';
import { haptics } from '@/services/haptics';
import { openSystemSettings } from '@/services/notifications/reminder';
import { voice } from '@/services/voice';
import { setScanPhotos } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';
import { createId } from '@/utils/ids';

const KEEP_AWAKE_TAG = 'face-scan';
/** ARError.Code.cameraUnauthorized. */
const CAMERA_UNAUTHORIZED = 103;
/** ARError.Code.sensorUnavailable and sensorFailed. */
const SENSOR_ERRORS = [101, 102];

/**
 * The face scan (docs/face-scan.md): the intro (tips, the progress photo question), then about 35 seconds in front of
 * the camera, one move at a time, then the results (scan-result). Free users get FREE_LIMITS.scans in all; with none
 * left this opens the paywall instead. Leaving the app or closing the scan stops it and saves nothing.
 * ?start=1 starts at once, only in the Simulator (its pretend face), for tests and screenshot captures without taps.
 */
export default function ScanScreen() {
  const { t, i18n } = useTranslation('scan');
  const params = useLocalSearchParams<{ start?: string }>();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const scans = useFaceScans();
  const actions = useFaceScanActions();
  const settings = useSettings();
  const dispatch = useSettingsDispatch();
  const [permission, requestPermission] = useCameraPermissions();
  // Decided when the screen opens: finishing this scan may use the last free one.
  const [allowed] = useState(scans.canScan);
  const [phase, setPhase] = useState<'intro' | 'scanning' | 'saving'>('intro');
  const [id, setId] = useState(createId);
  const scanning = phase === 'scanning';
  // The Simulator says under the oval that a pretend face does the moves, except behind the store screenshots'
  // stand-in picture (ScanCamera).
  const [standIn] = useState(() => (faceScanMode === 'simulated' ? simulatorCamera('scan') : null));

  const onDone = async (readings: RawScan | null, photo: string | null) => {
    if (!readings) {
      if (photo) deleteScanPhoto(photo).catch(() => {});
      haptics.warning();
      Alert.alert(t('tooFew.title'), t('tooFew.body'), [
        { text: t('tooFew.close'), style: 'cancel', onPress: () => router.back() },
        { text: t('tooFew.retry'), onPress: () => setId(createId()) },
      ]);
      return;
    }
    setPhase('saving');
    haptics.success();
    if (settings.voiceCues) voice.say(t('status.done'), i18n.language);
    await actions.save({ id, moves: readings, photo });
    router.replace({ pathname: '/scan-result', params: { id, fresh: '1' } });
  };

  const run = useScanRun({ running: scanning, id, photo: settings.scanPhotos === true, onDone });
  const { view, discard } = run;

  // Opened without a free scan left (or on an iPhone that can't scan): the paywall instead.
  useEffect(() => {
    if (!allowed) router.replace(scans.available ? '/paywall' : '/');
  }, [allowed, scans.available]);

  // Leaving the app stops the scan: back to the intro, nothing saved. Only 'background' counts: 'inactive' also comes
  // with system alerts and Control Center, and then the camera just pauses (the scan waits for the face).
  useEffect(() => {
    if (!scanning) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'background') return;
      discard();
      voice.stop();
      setPhase('intro');
      setId(createId());
    });
    return () => sub.remove();
  }, [scanning, discard]);

  useEffect(() => {
    if (!scanning) return;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [scanning]);

  // VoiceOver reads each move instead of the voice cue, so the two never talk over each other.
  const [screenReader, setScreenReader] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader, () => {});
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    return () => sub.remove();
  }, []);

  // Each move is said once when it's shown and felt when its measuring starts and ends.
  const lastCue = useRef('');
  useEffect(() => {
    if (!scanning) return;
    const cue = `${view.stage}:${view.step}`;
    if (cue === lastCue.current) return;
    lastCue.current = cue;
    if (view.stage === 'prepare') {
      const title = t(`steps.${view.stepId}.title`);
      if (screenReader) AccessibilityInfo.announceForAccessibility(title);
      else if (settings.voiceCues) voice.say(title, i18n.language);
    } else if (view.stage === 'hold') haptics.squeeze();
    else if (view.stage === 'release') haptics.release();
  }, [scanning, view.stage, view.step, view.stepId, settings.voiceCues, screenReader, t, i18n.language]);

  useEffect(() => {
    if (run.photoSaved) haptics.tap();
  }, [run.photoSaved]);

  // ARKit stopped after its own retries (FaceTrackingView.swift). The code is Apple's ARError: 103 is no camera
  // permission; the others are shown so a failure on someone's iPhone can be looked up.
  useEffect(() => {
    if (run.failed === null) return;
    discard();
    voice.stop();
    if (run.failed === CAMERA_UNAUTHORIZED) {
      Alert.alert(t('noCamera.title'), t('noCamera.body'), [
        { text: t('noCamera.cancel'), style: 'cancel', onPress: () => router.back() },
        { text: t('noCamera.open'), onPress: openSystemSettings },
      ]);
      return;
    }
    // A sensor error usually means the TrueDepth camera (Face ID's) isn't working, while the plain camera still does.
    const texts = SENSOR_ERRORS.includes(run.failed) ? 'noTracking' : 'failed';
    Alert.alert(t(`${texts}.title`), t(`${texts}.body`, { code: run.failed }), [
      { text: t('failed.close'), style: 'cancel', onPress: () => router.back() },
      {
        text: t('failed.retry'),
        onPress: () => {
          lastCue.current = '';
          setId(createId());
        },
      },
    ]);
  }, [run.failed, discard, t]);

  const autoStarted = useRef(false);
  useEffect(() => {
    if (params.start !== '1' || faceScanMode !== 'simulated' || !allowed || autoStarted.current) return;
    autoStarted.current = true;
    lastCue.current = '';
    setPhase('scanning');
  }, [params.start, allowed]);

  const close = () => {
    discard();
    voice.stop();
    router.back();
  };

  const start = async () => {
    if (faceScanMode === 'camera' && !permission?.granted) {
      const answer = permission && !permission.canAskAgain ? permission : await requestPermission();
      if (!answer.granted) {
        Alert.alert(t('noCamera.title'), t('noCamera.body'), [
          { text: t('noCamera.cancel'), style: 'cancel' },
          { text: t('noCamera.open'), onPress: openSystemSettings },
        ]);
        return;
      }
    }
    lastCue.current = '';
    setPhase('scanning');
  };

  if (!allowed) return <View style={styles.root} />;

  if (phase === 'intro') {
    return (
      <ScanIntro
        photos={settings.scanPhotos}
        onPhotos={(on) => dispatch(setScanPhotos(on))}
        freeLeft={scans.freeLeft}
        onStart={start}
        onClose={close}
      />
    );
  }

  const tone = view.issue && view.stage !== 'find' ? 'warn' : view.stage === 'find' ? 'none' : 'good';
  return (
    <View style={styles.root}>
      {/* A new native view (and ARKit session) for each run, so "Try again" after a failure starts the camera fresh. */}
      <ScanCamera key={id} active={scanning} onFace={run.onFace} />
      <FaceGuide
        progress={view.stage === 'hold' ? view.progress : 0}
        tone={tone}
        countdown={view.countdown}
        caption={faceScanMode === 'simulated' && !standIn ? t('simulator') : undefined}
      />
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <IconButton icon="xmark" onPress={close} accessibilityLabel={t('cancel')} />
        <ScanStepDots step={view.step} done={view.stage === 'done'} />
        <View style={styles.spacer} />
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12 }]}>
        <ScanPanel view={view} photoSaved={run.photoSaved} saving={phase === 'saving'} />
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.heroBackground },
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.space.lg,
  },
  spacer: { width: 36 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0 },
}));
