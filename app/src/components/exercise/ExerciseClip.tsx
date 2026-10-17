import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import type { ExerciseId } from '@/constants/exercises';
import { useAppActive } from '@/hooks/useAppActive';
import { useGuideImages } from '@/hooks/useGuide';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

/**
 * The exercise's clip, or null when it has none (Chin Lift) or Reduce Motion is on: then show the drawings
 * (ExerciseFrames) instead (docs/videos.md).
 */
export function useExerciseClip(id: ExerciseId): number | null {
  const clip = useGuideImages().exercises[id].clip;
  const reduceMotion = useReducedMotion();
  return clip && !reduceMotion ? clip : null;
}

interface ExerciseClipProps {
  id: ExerciseId;
  /** From useExerciseClip. */
  clip: number;
  /** Accessibility description of what's on screen. */
  label: string;
  /** A pause / play button on the clip (the exercise page). */
  controls?: boolean;
  /** Held still from outside (a paused workout). */
  paused?: boolean;
  /** Fill the space left by other content (the player) instead of keeping the drawing's shape. */
  fill?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * One rep of the exercise as a silent loop, made from its two drawings (videos/). The relaxed drawing shows until the
 * clip's first frame is on screen. It mixes with the user's music, and it stops while its screen is covered, while the
 * app is in the background and when the user pauses it.
 */
export function ExerciseClip({ id, clip, label, controls, paused = false, fill, style }: ExerciseClipProps) {
  const { t } = useTranslation('exercises');
  const styles = useStyles();
  const { colors } = useTheme();
  const relaxed = useGuideImages().exercises[id].relaxed;
  const active = useAppActive();
  const [focused, setFocused] = useState(true);
  const [stopped, setStopped] = useState(false);
  const [shown, setShown] = useState(false);
  const player = useVideoPlayer(clip, (p) => {
    p.loop = true;
    p.muted = true;
    p.audioMixingMode = 'mixWithOthers';
  });

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  const playing = active && focused && !paused && !stopped;
  useEffect(() => {
    if (playing) player.play();
    else player.pause();
  }, [playing, player]);

  return (
    <View style={[styles.plate, fill ? styles.fill : styles.ratio, style]}>
      <View style={StyleSheet.absoluteFill} accessible accessibilityRole="image" accessibilityLabel={label}>
        <Image source={relaxed} style={StyleSheet.absoluteFill} contentFit="contain" transition={0} />
        <VideoView
          player={player}
          style={[styles.video, !shown && styles.hidden]}
          contentFit="contain"
          nativeControls={false}
          allowsPictureInPicture={false}
          fullscreenOptions={{ enable: false }}
          onFirstFrameRender={() => setShown(true)}
        />
      </View>
      {controls ? (
        <Pressable
          onPress={() => setStopped((s) => !s)}
          accessibilityRole="button"
          accessibilityLabel={stopped ? t('detail.playVideo') : t('detail.pauseVideo')}
          hitSlop={8}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <SymbolView name={stopped ? 'play.fill' : 'pause.fill'} size={14} weight="bold" tintColor={colors.onImage} />
        </Pressable>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  plate: { alignSelf: 'stretch', borderRadius: tokens.radius.xl, overflow: 'hidden', backgroundColor: colors.plate },
  ratio: { aspectRatio: 757 / 1024 },
  fill: { flex: 1 },
  // Sized, not only pinned: on the web the style goes straight onto a <video>, which keeps its own size otherwise.
  video: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: colors.plate },
  hidden: { opacity: 0 },
  button: {
    position: 'absolute',
    right: tokens.space.md,
    bottom: tokens.space.md,
    width: 36,
    height: 36,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  pressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
}));
