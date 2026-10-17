import { SymbolView } from 'expo-symbols';
import { useEffect, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, useWindowDimensions, View, type LayoutRectangle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings, useSettingsDispatch } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/services/haptics';
import { setTileSpot } from '@/state/settings/actions';
import { makeStyles } from '@/theme/makeStyles';
import { pointToSpot, spotToPoint } from '@/utils/spot';

interface PlayerStageProps {
  /** The frame on the screen (measured): where the big one goes. */
  area: LayoutRectangle;
  figure: ReactNode;
  /** The mirror, or null when it's off. */
  mirror: ReactNode;
  /** The mirror is big and the figure is the small tile. */
  mirrorBig: boolean;
  onSwap: () => void;
  onCloseMirror: () => void;
}

/** The small tile: this share of the frame's width, 3:4 like the front camera. */
const TILE_SHARE = 0.38;
const spring = { damping: 18, stiffness: 220 };
/** The round buttons on the tile (swap, close). */
const ROUND = 22;
const STILL = { transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }] };

/**
 * The workout's figure and mirror. One is big in the frame, the other a small tile: tap the tile to swap them, drag it
 * anywhere on the screen (the spot is remembered, like the Coach button), × closes the mirror. It's a layer over the
 * whole screen, so the tile can leave the frame and still take taps; the figure and the mirror stay mounted when they
 * swap (only their boxes change), so the camera and the move check keep running.
 */
export function PlayerStage({ area, figure, mirror, mirrorBig, onSwap, onCloseMirror }: PlayerStageProps) {
  const { t } = useTranslation('workout');
  const styles = useStyles();
  const { colors, tokens } = useTheme();
  const { tileSpot } = useSettings();
  const dispatch = useSettingsDispatch();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const gap = tokens.space.md;
  const tileWidth = Math.round(area.width * TILE_SHARE);
  const tileHeight = Math.round((tileWidth * 4) / 3);
  const bounds = {
    minX: insets.left + gap,
    maxX: width - insets.right - gap - tileWidth,
    minY: insets.top + gap,
    maxY: height - insets.bottom - gap - tileHeight,
  };
  // Until it's dragged: the frame's bottom-right corner.
  const rest = tileSpot ? spotToPoint(tileSpot, bounds) : { x: area.x + area.width - gap - tileWidth, y: area.y + area.height - gap - tileHeight };

  const x = useSharedValue(rest.x);
  const y = useSharedValue(rest.y);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const lifted = useSharedValue(1);

  // Follow a new frame size (first layout, rotation) and the saved spot.
  useEffect(() => {
    x.set(withSpring(rest.x, spring));
    y.set(withSpring(rest.y, spring));
  }, [rest.x, rest.y, x, y]);

  const save = (px: number, py: number) => {
    haptics.tap();
    dispatch(setTileSpot(pointToSpot({ x: px, y: py }, bounds)));
  };

  const pan = Gesture.Pan()
    .minDistance(6)
    .onStart(() => {
      startX.set(x.get());
      startY.set(y.get());
      lifted.set(withSpring(1.05, spring));
    })
    .onUpdate((e) => {
      x.set(Math.min(bounds.maxX, Math.max(bounds.minX, startX.get() + e.translationX)));
      y.set(Math.min(bounds.maxY, Math.max(bounds.minY, startY.get() + e.translationY)));
    })
    .onEnd(() => {
      lifted.set(withSpring(1, spring));
      runOnJS(save)(x.get(), y.get());
    });
  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(onSwap)();
  });

  // Both boxes always carry their moving style (still while big), so swapping never leaves a stale offset behind.
  const figureSmall = !!mirror && mirrorBig;
  const tileMove = useAnimatedStyle(() => ({ transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: lifted.get() }] }));
  const figureMove = useAnimatedStyle(() =>
    figureSmall ? { transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: lifted.get() }] } : STILL,
  );
  const mirrorMove = useAnimatedStyle(() =>
    figureSmall ? STILL : { transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: lifted.get() }] },
  );

  const frame = { left: area.x, top: area.y, width: area.width, height: area.height };
  const tile = [styles.tile, { width: tileWidth, height: tileHeight }];
  const close = (
    <Pressable onPress={onCloseMirror} hitSlop={11} accessibilityRole="button" accessibilityLabel={t('mirrorClose')} style={styles.round}>
      <SymbolView name="xmark" size={10} weight="bold" tintColor={colors.onImage} />
    </Pressable>
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.box, figureSmall ? tile : frame, figureMove]}>{figure}</Animated.View>
      {mirror ? (
        <Animated.View style={[styles.box, mirrorBig ? [frame, styles.bigMirror] : tile, mirrorMove]}>{mirror}</Animated.View>
      ) : null}
      {mirror ? (
        <Animated.View style={[styles.box, styles.over, { width: tileWidth, height: tileHeight }, tileMove]} pointerEvents="box-none">
          <GestureDetector gesture={Gesture.Exclusive(pan, tap)}>
            <View
              style={StyleSheet.absoluteFill}
              accessible
              accessibilityRole="button"
              accessibilityLabel={mirrorBig ? t('figureBigger') : t('mirrorBigger')}
              accessibilityActions={[{ name: 'activate' }]}
              onAccessibilityAction={onSwap}
            >
              <View style={[styles.round, styles.swap]}>
                <SymbolView name="arrow.up.left.and.arrow.down.right" size={11} weight="bold" tintColor={colors.onImage} />
              </View>
            </View>
          </GestureDetector>
          {mirrorBig ? null : <View style={styles.closeAt}>{close}</View>}
        </Animated.View>
      ) : null}
      {mirror && mirrorBig ? <View style={[styles.box, styles.over, { top: area.y + gap, left: area.x + area.width - gap - ROUND }]}>{close}</View> : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  box: { position: 'absolute', top: 0, left: 0 },
  bigMirror: { borderRadius: tokens.radius.xl, overflow: 'hidden' },
  // The plate color fills the corners the figure's rounder plate leaves open (the mirror covers it).
  tile: { zIndex: 1, borderRadius: tokens.radius.lg, overflow: 'hidden', borderWidth: 2, borderColor: colors.background, backgroundColor: colors.plate },
  over: { zIndex: 2 },
  round: {
    width: ROUND,
    height: ROUND,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  swap: { position: 'absolute', top: tokens.space.xs, left: tokens.space.xs },
  closeAt: { position: 'absolute', top: tokens.space.xs, right: tokens.space.xs },
}));
