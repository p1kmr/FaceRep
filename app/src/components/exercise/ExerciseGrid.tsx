import { router } from 'expo-router';
import { View } from 'react-native';

import { isFreeExercise, type ExerciseId } from '@/constants/exercises';
import { usePremium } from '@/hooks/usePremium';
import { makeStyles } from '@/theme/makeStyles';

import { ExerciseTile } from './ExerciseTile';

/** Exercises as a two-column grid; a tap opens the exercise page. Without Premium the locked ones show a lock. */
export function ExerciseGrid({ ids, doneToday }: { ids: readonly ExerciseId[]; doneToday: ReadonlySet<ExerciseId> }) {
  const styles = useStyles();
  const { isPremium } = usePremium();
  return (
    <View style={styles.grid}>
      {ids.map((id) => (
        <ExerciseTile
          key={id}
          id={id}
          done={doneToday.has(id)}
          locked={!isPremium && !isFreeExercise(id)}
          onPress={() => router.push({ pathname: '/exercise/[id]', params: { id } })}
        />
      ))}
    </View>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: tokens.space.md },
}));
