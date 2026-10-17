import { CameraView } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Exercise } from '@/constants/exercises';
import { MOVES } from '@/constants/moves';
import { useAppActive } from '@/hooks/useAppActive';
import { useMoveCheck } from '@/hooks/useMoveCheck';
import { useSettings } from '@/hooks/useSettings';
import { FaceTrackingView } from '@/services/faceTracking';
import type { MovePhase } from '@/services/workout/moveCheck';
import { makeStyles } from '@/theme/makeStyles';

import { MoveMeter } from './MoveMeter';

interface MirrorViewProps {
  style?: StyleProp<ViewStyle>;
  /** For the move check: the exercise on screen (this session's reps and hold), its number in the workout, the phase. */
  exercise: Exercise;
  index: number;
  phase: MovePhase;
  rep: number;
  /** The big mirror, with the figure as the small tile in its corner. */
  large?: boolean;
}

/**
 * The front camera as a mirror next to the figure, to check the pose. Only a live preview: nothing is recorded,
 * saved or sent, and the camera stops while the app is in the background. On iPhones with Apple's face tracking
 * (and Settings → Move check on) the mirror also shows when it sees the exercise's move (docs/face-tracking.md).
 */
export function MirrorView({ style, exercise, index, phase, rep, large = false }: MirrorViewProps) {
  const styles = useStyles();
  const { t } = useTranslation('workout');
  const active = useAppActive();
  const { moveCheck } = useSettings();
  const Tracking = moveCheck ? FaceTrackingView : null;
  const { view, onFace } = useMoveCheck({ move: Tracking ? MOVES[exercise.id] : null, exercise: index, phase, rep, holdSec: exercise.holdSec });
  return (
    <View style={[styles.box, style]}>
      <View style={StyleSheet.absoluteFill} accessible accessibilityRole="image" accessibilityLabel={t('mirrorA11y')}>
        {Tracking ? (
          <Tracking style={StyleSheet.absoluteFill} active={active} onFace={onFace} />
        ) : (
          <CameraView style={StyleSheet.absoluteFill} facing="front" active={active} animateShutter={false} />
        )}
      </View>
      {view ? <MoveMeter view={view} reps={exercise.reps} large={large} /> : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  box: { overflow: 'hidden', backgroundColor: colors.surfaceAlt },
}));
