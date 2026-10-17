import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { MOVE_CHECK } from '@/constants/moves';
import { useTheme } from '@/hooks/useTheme';
import type { MoveCheckView } from '@/services/workout/moveCheck';
import { makeStyles } from '@/theme/makeStyles';

/**
 * The move check on top of the mirror: a level that fills and turns green when the camera sees the move, and a line
 * saying how many holds it saw, or that it can't see the face. It never asks for more: the level is full as soon as
 * the move counts. In the small mirror they sit on the right and at the bottom; in the big one on the left and at the
 * top, clear of the figure's tile in the bottom-right corner.
 */
export function MoveMeter({ view, reps, large = false }: { view: MoveCheckView; reps: number; large?: boolean }) {
  const { t } = useTranslation('workout');
  const { colors } = useTheme();
  const styles = useStyles();
  const text =
    view.status === 'starting'
      ? t('moveCheck.starting')
      : view.status === 'noFace'
        ? t('moveCheck.noFace')
        : view.hint
          ? t(`moveCheck.hint.${view.hint}`)
          : t('moveCheck.seen', { seen: view.seen, reps });
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {view.status === 'tracking' ? (
        <View style={[styles.track, large ? styles.trackLarge : styles.trackSmall]}>
          <View style={[styles.level, view.inPose && styles.levelOn, { height: `${Math.round(Math.min(view.level / MOVE_CHECK.enter, 1) * 100)}%` }]} />
        </View>
      ) : null}
      <View style={[styles.pill, large ? styles.pillLarge : styles.pillSmall]}>
        {view.inPose && !view.hint ? <SymbolView name="checkmark" size={12} weight="bold" tintColor={colors.success} /> : null}
        <AppText variant="caption" numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.text}>
          {text}
        </AppText>
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  track: {
    position: 'absolute',
    width: 6,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.onImageSoft,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trackSmall: { top: tokens.space.xxl, bottom: tokens.space.xxl + tokens.space.lg, right: tokens.space.sm },
  trackLarge: { top: tokens.space.xxl + tokens.space.xl, bottom: tokens.space.xl, left: tokens.space.md },
  level: { width: '100%', borderRadius: tokens.radius.pill, backgroundColor: colors.onImage },
  levelOn: { backgroundColor: colors.success },
  pill: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.space.xs,
    paddingHorizontal: tokens.space.sm,
    paddingVertical: tokens.space.xs,
    borderRadius: tokens.radius.md,
    backgroundColor: colors.overlay,
  },
  pillSmall: { left: tokens.space.sm, right: tokens.space.sm, bottom: tokens.space.sm },
  pillLarge: { top: tokens.space.md, alignSelf: 'center', maxWidth: '80%' },
  text: { flexShrink: 1, color: colors.onImage, textAlign: 'center', fontWeight: tokens.font.weight.semibold },
}));
