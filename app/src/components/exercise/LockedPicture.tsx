import { Image } from 'expo-image';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { standInFor } from '@/constants/exerciseImages';
import type { ExerciseId } from '@/constants/exercises';
import type { ExerciseLock } from '@/hooks/useContent';
import { useGuideImages } from '@/hooks/useGuide';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

export const LOCK_ICONS: Record<ExerciseLock, SymbolViewProps['name']> = {
  premium: 'lock.fill',
  downloading: 'arrow.down.circle.fill',
  failed: 'exclamationmark.arrow.circlepath',
};

interface LockedPictureProps {
  id: ExerciseId;
  lock: ExerciseLock;
  /** thumb: the square crop (rows, avatars); exercise: the full drawing (library tiles). */
  kind?: 'thumb' | 'exercise';
  /** Size of the lock; 0 for none (small avatars). */
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A locked exercise's picture: a free exercise of the same area, blurred past recognition, with a lock (or how its
 * download is going). The Premium exercise's own picture isn't on the iPhone before purchase, so nothing of it shows.
 */
export function LockedPicture({ id, lock, kind = 'thumb', iconSize = 14, style }: LockedPictureProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const source = useGuideImages().exercises[standInFor(id)]?.[kind];
  return (
    <View style={[styles.box, style]}>
      <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" blurRadius={kind === 'thumb' ? 14 : 28} />
      {iconSize ? (
        <View style={[styles.icon, { width: iconSize * 2, height: iconSize * 2 }]}>
          <SymbolView name={LOCK_ICONS[lock]} size={iconSize} tintColor={colors.onImage} />
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  box: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.plate },
  icon: { borderRadius: tokens.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.overlay },
}));
