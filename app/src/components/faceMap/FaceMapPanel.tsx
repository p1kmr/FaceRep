import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { FACE_AREAS, musclesIn, type FaceArea } from '@/constants/faceMap';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { MuscleBadges } from '../exercise/MuscleBadges';
import { AppText } from '../ui/AppText';
import { Chip } from '../ui/Chip';
import { Gradient } from '../ui/Gradient';
import { FaceMap } from './FaceMap';

/** The library's face map: the face (tap an area), the areas as chips, and what the picked area is. */
export function FaceMapPanel({ area, onSelect }: { area: FaceArea; onSelect: (area: FaceArea) => void }) {
  const { t } = useTranslation('exercises');
  const styles = useStyles();
  const { colors } = useTheme();
  const name = t(`areas.${area}.name`);
  // Keep the picked area's chip in view (a tap on the face can pick one that is scrolled away).
  const chips = useRef<ScrollView>(null);
  const chipX = useRef<Partial<Record<FaceArea, number>>>({});
  useEffect(() => {
    const x = chipX.current[area];
    if (x !== undefined) chips.current?.scrollTo({ x: Math.max(0, x - 24), animated: true });
  }, [area]);
  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <FaceMap lit={FACE_AREAS} selected={area} onSelect={onSelect} label={t('map.a11y', { area: name })} />
        {/* The picked area's name over the bottom of the face, on a fade to the card. */}
        <View style={styles.caption} pointerEvents="none">
          <Gradient colors={[colors.plateFade, colors.plate]} direction="vertical" />
          <AppText variant="brand" style={styles.area}>
            {name.toUpperCase()}
          </AppText>
        </View>
      </View>
      <ScrollView ref={chips} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {FACE_AREAS.map((a) => (
          <View
            key={a}
            onLayout={(e) => {
              chipX.current[a] = e.nativeEvent.layout.x;
              if (a === area) chips.current?.scrollTo({ x: Math.max(0, e.nativeEvent.layout.x - 24), animated: false });
            }}
          >
            <Chip label={t(`areas.${a}.name`)} selected={a === area} onPress={() => onSelect(a)} />
          </View>
        ))}
      </ScrollView>
      <View style={styles.info}>
        <AppText muted>{t(`areas.${area}.about`)}</AppText>
        <MuscleBadges muscles={musclesIn(area)} />
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { gap: tokens.space.md },
  // Head and upper neck: the map is cropped at the bottom.
  card: {
    aspectRatio: 0.92,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.plate,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  caption: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 84, justifyContent: 'flex-end', padding: tokens.space.lg },
  area: { color: colors.primary, fontSize: 40, lineHeight: 46 },
  chips: { gap: tokens.space.sm, paddingRight: tokens.space.lg },
  info: { gap: tokens.space.sm },
}));
