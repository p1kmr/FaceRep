import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { SessionSummary } from '@/services/progress/stats';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, toMinutes } from '@/utils/format';

import { AppText } from '../ui/AppText';

export function SessionRow({ session, divider }: { session: SessionSummary; divider?: boolean }) {
  const { t, i18n } = useTranslation(['progress', 'common']);
  const styles = useStyles();
  const meta = t(session.plan ? 'progress:sessionPlan' : 'progress:session', {
    day: session.plan?.day,
    exercises: t('common:exercises', { count: session.exerciseIds.length }),
    minutes: t('common:minutes', { count: toMinutes(session.durationSec) }),
  });
  return (
    <View style={[styles.row, divider && styles.divider]}>
      <View style={styles.text}>
        <AppText>{formatDay(session.day, i18n.language)}</AppText>
        <AppText variant="footnote" muted>
          {meta}
        </AppText>
      </View>
      <AppText variant="footnote" muted>
        {t('progress:repsCount', { count: session.totalReps })}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, paddingHorizontal: tokens.space.lg, paddingVertical: tokens.space.md },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  text: { flex: 1, gap: 2 },
}));
