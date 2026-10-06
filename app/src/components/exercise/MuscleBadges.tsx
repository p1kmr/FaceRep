import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { MuscleId } from '@/constants/exercises';
import { makeStyles } from '@/theme/makeStyles';

import { Badge } from '../ui/Badge';

export function MuscleBadges({ muscles }: { muscles: MuscleId[] }) {
  const { t } = useTranslation('exercises');
  const styles = useStyles();
  return (
    <View style={styles.row}>
      {muscles.map((m) => (
        <Badge key={m} label={t(`muscles.${m}`)} tone="primary" />
      ))}
    </View>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.xs },
}));
