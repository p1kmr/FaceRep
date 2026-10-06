import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { EXERCISE_IMAGES } from '@/constants/exerciseImages';
import type { ExerciseId, Goal } from '@/constants/exercises';
import { makeStyles } from '@/theme/makeStyles';
import { toMinutes } from '@/utils/format';

import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface RoutineCardProps {
  ids: ExerciseId[];
  seconds: number;
  goal: Goal;
  doneToday: boolean;
  onStart: () => void;
}

/** Today's routine: focus, length, the exercises as thumbnails, one big Start button. */
export function RoutineCard({ ids, seconds, goal, doneToday, onStart }: RoutineCardProps) {
  const { t } = useTranslation(['home', 'common']);
  const styles = useStyles();
  const meta = t('home:routine.meta', {
    exercises: t('common:exercises', { count: ids.length }),
    minutes: t('common:minutes', { count: toMinutes(seconds) }),
  });
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="headline" accessibilityRole="header">
            {t('home:routine.title')}
          </AppText>
          <AppText variant="footnote" muted>
            {meta}
          </AppText>
        </View>
        <Badge label={t(`common:programs.${goal}`)} tone="primary" />
      </View>
      <View style={styles.thumbs} accessible={false}>
        {ids.map((id) => (
          <Image key={id} source={EXERCISE_IMAGES[id].thumb} style={styles.thumb} contentFit="cover" />
        ))}
      </View>
      <Button
        title={doneToday ? t('home:routine.again') : t('home:routine.start')}
        variant={doneToday ? 'secondary' : 'primary'}
        onPress={onStart}
        fullWidth
      />
    </Card>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: { padding: tokens.space.lg, gap: tokens.space.lg },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: tokens.space.md },
  headerText: { flex: 1, gap: 2 },
  thumbs: { flexDirection: 'row', gap: tokens.space.sm },
  thumb: { flex: 1, aspectRatio: 1, borderRadius: tokens.radius.md, backgroundColor: colors.plate },
}));
