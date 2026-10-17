import { router } from 'expo-router';
import { View } from 'react-native';

import type { ExerciseId } from '@/constants/exercises';
import { makeStyles } from '@/theme/makeStyles';

import { ExerciseTile } from './ExerciseTile';

/** Exercises as a two-column grid; a tap opens the exercise page. A locked one shows locked (ExerciseTile). */
export function ExerciseGrid({ ids, doneToday }: { ids: readonly ExerciseId[]; doneToday: ReadonlySet<ExerciseId> }) {
  const styles = useStyles();
  return (
    <View style={styles.grid}>
      {ids.map((id) => (
        <ExerciseTile
          key={id}
          id={id}
          done={doneToday.has(id)}
          onPress={() => router.push({ pathname: '/exercise/[id]', params: { id } })}
        />
      ))}
    </View>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: tokens.space.md },
}));
