import { Image } from 'expo-image';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { MARK_ASPECT, MARK_IMAGE } from '@/constants/exerciseImages';
import type { ExerciseLock } from '@/hooks/useContent';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { Gradient } from '../ui/Gradient';

export const LOCK_ICONS: Record<ExerciseLock, SymbolViewProps['name']> = {
  premium: 'lock.fill',
  downloading: 'arrow.down.circle.fill',
  failed: 'exclamationmark.arrow.circlepath',
};

interface LockedPictureProps {
  lock: ExerciseLock;
  /** thumb: a small square (rows, avatars); exercise: the size of an exercise drawing (library tiles, its page). */
  kind?: 'thumb' | 'exercise';
  /** Size of the lock; 0 for none (small avatars). */
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * A locked exercise's picture: the app's mark on the dark icon's graphite, with a lock (or how its download is going).
 * The same card for every locked exercise and never a picture of one: the Premium exercise's own picture isn't on the
 * iPhone before purchase, and a free exercise's picture blurred in its place made the locked ones look like copies of it.
 */
export function LockedPicture({ lock, kind = 'thumb', iconSize = 14, style }: LockedPictureProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const mark = kind === 'exercise' ? styles.mark : iconSize ? styles.markSmall : styles.markOnly;
  return (
    <View style={[styles.box, kind === 'thumb' && styles.thumbBox, style, styles.fill]}>
      <Gradient colors={[colors.locked, colors.lockedEnd]} direction="vertical" />
      <Image source={MARK_IMAGE} style={mark} contentFit="contain" />
      {iconSize ? (
        <View style={[styles.icon, { width: iconSize * 2, height: iconSize * 2 }]}>
          <SymbolView name={LOCK_ICONS[lock]} size={iconSize} tintColor={colors.onImage} />
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  box: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center', gap: tokens.space.md },
  // Last, over the caller's background (the white plate of a drawing showed as a line under the gradient).
  fill: { backgroundColor: colors.lockedEnd },
  thumbBox: { gap: 3 },
  mark: { width: '44%', aspectRatio: MARK_ASPECT },
  markSmall: { width: '56%', aspectRatio: MARK_ASPECT },
  markOnly: { width: '66%', aspectRatio: MARK_ASPECT },
  icon: { borderRadius: tokens.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.onImageSoft },
}));
