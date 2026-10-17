import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseGrid } from '@/components/exercise/ExerciseGrid';
import { FaceMapPanel } from '@/components/faceMap/FaceMapPanel';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { Segmented } from '@/components/ui/Segmented';
import { exercisesOf, programsFor, type ExerciseId, type Goal, type ProgramId } from '@/constants/exercises';
import { exercisesFor, FACE_AREAS, type FaceArea } from '@/constants/faceMap';
import { useGuide } from '@/hooks/useGuide';
import { useProgressState } from '@/hooks/useProgress';
import { useSettings } from '@/hooks/useSettings';
import { useToday } from '@/hooks/useToday';
import { makeStyles } from '@/theme/makeStyles';

/** The area the face map opens on: the one the user's focus is about. */
const FIRST_AREA: Record<Goal, FaceArea> = { jawline: 'jaw', cheekbones: 'cheeks', lips: 'lips', eyes: 'eyes', massage: 'jaw', full: 'jaw' };

/**
 * The library. Face map: tap an area of the face to see its muscles and the exercises that work it. Programs: the
 * exercises of a program. A tap on an exercise shows how it works and starts it on its own.
 */
export default function ExercisesScreen() {
  const { t } = useTranslation(['exercises', 'common']);
  const styles = useStyles();
  const { goal } = useSettings();
  const programs = programsFor(useGuide());
  // ?area=jaw: opened from an area tapped on Today's face.
  const { area: asked } = useLocalSearchParams<{ area?: string }>();
  const [view, setView] = useState<'map' | 'programs'>('map');
  const [area, setArea] = useState<FaceArea>(FIRST_AREA[goal]);
  // A new ?area= (React's way to update state when an input changes: during render, not in an effect).
  const [seen, setSeen] = useState<string | undefined>(undefined);
  if (asked !== seen) {
    setSeen(asked);
    if (FACE_AREAS.includes(asked as FaceArea)) {
      setArea(asked as FaceArea);
      setView('map');
    }
  }
  const [program, setProgram] = useState<ProgramId>(goal === 'full' ? programs[0] : goal);
  const { sessions } = useProgressState();
  const today = useToday();
  const doneToday = new Set<ExerciseId>(sessions.filter((s) => s.day === today).flatMap((s) => s.exerciseIds));

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('exercises:title')}
      </AppText>
      <Segmented
        options={[
          { id: 'map', label: t('exercises:view.map') },
          { id: 'programs', label: t('exercises:view.programs') },
        ]}
        value={view}
        onChange={setView}
      />
      {view === 'map' ? (
        <>
          <FaceMapPanel area={area} onSelect={setArea} />
          <AppText variant="headline" accessibilityRole="header">
            {t('exercises:map.exercises')}
          </AppText>
          <ExerciseGrid ids={exercisesFor(area)} doneToday={doneToday} />
        </>
      ) : (
        <>
          <View style={styles.chips}>
            {programs.map((p) => (
              <Chip key={p} label={t(`common:programs.${p}`)} selected={p === program} onPress={() => setProgram(p)} />
            ))}
          </View>
          <AppText muted>{t(`exercises:programIntro.${program}`)}</AppText>
          <ExerciseGrid ids={exercisesOf(program).map((e) => e.id)} doneToday={doneToday} />
        </>
      )}
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
}));
