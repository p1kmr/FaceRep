import { StyleSheet, View, type NativeSyntheticEvent } from 'react-native';

import { FaceTrackingView, type NativeFaceEvent } from '@/services/faceTracking';
import { makeStyles } from '@/theme/makeStyles';

interface ScanCameraProps {
  active: boolean;
  onFace: (event: NativeSyntheticEvent<NativeFaceEvent>) => void;
}

/**
 * The scan's camera: the front camera with Apple's face tracking, full screen and mirrored. In the Simulator (no
 * camera) a dark background; the pretend face sends its samples from useScanRun instead.
 */
export function ScanCamera({ active, onFace }: ScanCameraProps) {
  const styles = useStyles();
  return (
    <View style={[StyleSheet.absoluteFill, styles.box]} importantForAccessibility="no-hide-descendants">
      {FaceTrackingView ? <FaceTrackingView style={StyleSheet.absoluteFill} active={active} onFace={onFace} /> : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors }) => ({
  box: { backgroundColor: colors.heroBackground },
}));
