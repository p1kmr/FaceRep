import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseRow } from '@/components/exercise/ExerciseRow';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { exercisesOf, PROGRAMS, type ProgramId } from '@/constants/exercises';
import { useProgressState } from '@/hooks/useProgress';
import { useSettings } from '@/hooks/useSettings';
import { useToday } from '@/hooks/useToday';
import { makeStyles } from '@/theme/makeStyles';

/** The library: pick a program, tap an exercise to see how it works and try it alone. */
export default function ExercisesScreen() {
  const { t } = useTranslation(['exercises', 'common']);
  const styles = useStyles();
  const { goal } = useSettings();
  const [program, setProgram] = useState<ProgramId>(goal === 'full' ? 'jawline' : goal);
  const { sessions } = useProgressState();
  const today = useToday();
  const doneToday = new Set(sessions.filter((s) => s.day === today).flatMap((s) => s.exerciseIds));
  const list = exercisesOf(program);

  return (
    <Screen>
      <AppText variant="title" accessibilityRole="header">
        {t('exercises:title')}
      </AppText>
      <View style={styles.chips}>
        {PROGRAMS.map((p) => (
          <Chip key={p} label={t(`common:programs.${p}`)} selected={p === program} onPress={() => setProgram(p)} />
        ))}
      </View>
      <AppText muted>{t(`exercises:programIntro.${program}`)}</AppText>
      <Card>
        {list.map((e, i) => (
          <ExerciseRow
            key={e.id}
            id={e.id}
            done={doneToday.has(e.id)}
            divider={i < list.length - 1}
            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: e.id } })}
          />
        ))}
      </Card>
    </Screen>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
}));
