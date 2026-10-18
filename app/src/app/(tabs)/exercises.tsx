import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ExerciseGrid } from '@/components/exercise/ExerciseGrid';
import { FaceMapPanel } from '@/components/faceMap/FaceMapPanel';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import type { ExerciseId, Goal } from '@/constants/exercises';
import { exercisesFor, FACE_AREAS, type FaceArea } from '@/constants/faceMap';
import { useProgressState } from '@/hooks/useProgress';
import { useSettings } from '@/hooks/useSettings';
import { useToday } from '@/hooks/useToday';

/** The area the face map opens on: the one the user's focus is about. */
const FIRST_AREA: Record<Goal, FaceArea> = { jawline: 'jaw', cheekbones: 'cheeks', lips: 'lips', eyes: 'eyes', massage: 'jaw', full: 'jaw' };

/**
 * The library, as the face map: tap an area of the face to see its muscles and the exercises that work it. A tap on an
 * exercise shows how it works and starts it on its own. There is no list by program: four of the five programs are face
 * areas under another name, so it listed the same exercises again, grouped a little differently. The programs stay the
 * user's focus (onboarding, Settings, Today's workout).
 */
export default function ExercisesScreen() {
  const { t } = useTranslation('exercises');
  const { goal } = useSettings();
  // ?area=jaw: opened from an area tapped on Today's face.
  const { area: asked } = useLocalSearchParams<{ area?: string }>();
  const [area, setArea] = useState<FaceArea>(FIRST_AREA[goal]);
  // A new ?area= (React's way to update state when an input changes: during render, not in an effect).
  const [seen, setSeen] = useState<string | undefined>(undefined);
  if (asked !== seen) {
    setSeen(asked);
    if (FACE_AREAS.includes(asked as FaceArea)) setArea(asked as FaceArea);
  }
  const { sessions } = useProgressState();
  const today = useToday();
  const doneToday = new Set<ExerciseId>(sessions.filter((s) => s.day === today).flatMap((s) => s.exerciseIds));

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('title')}
      </AppText>
      <AppText muted>{t('map.hint')}</AppText>
      <FaceMapPanel area={area} onSelect={setArea} />
      <AppText variant="headline" accessibilityRole="header">
        {t('map.exercises')}
      </AppText>
      <ExerciseGrid ids={exercisesFor(area)} doneToday={doneToday} />
    </Screen>
  );
}
