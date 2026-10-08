import { CameraView } from 'expo-camera';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppActive } from '@/hooks/useAppActive';
import { makeStyles } from '@/theme/makeStyles';

/**
 * The front camera as a mirror next to the figure, to check the pose. Only a live preview: nothing is
 * recorded, saved or sent. The camera stops while the app is in the background.
 */
export function MirrorView({ style }: { style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  const { t } = useTranslation('workout');
  const active = useAppActive();
  return (
    <View style={[styles.box, style]} accessible accessibilityRole="image" accessibilityLabel={t('mirrorA11y')}>
      <CameraView style={StyleSheet.absoluteFill} facing="front" active={active} animateShutter={false} />
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  box: {
    aspectRatio: 3 / 4,
    borderRadius: tokens.radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.background,
  },
}));
