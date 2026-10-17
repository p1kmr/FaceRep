import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { useToday } from '@/hooks/useToday';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay } from '@/utils/format';

import { AppText } from '../ui/AppText';

/** Morning until noon, afternoon until 6 PM, then evening (the iPhone's clock; display only). */
const partOfDay = (hour: number) => (hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening');

/** Today's date, a greeting for the time of day, and the streak. */
export function TodayHeader({ streak }: { streak: number }) {
  const { t, i18n } = useTranslation('home');
  const styles = useStyles();
  const { colors } = useTheme();
  const today = useToday();
  const streakLabel = streak > 0 ? t('streak', { count: streak }) : t('noStreak');
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="footnote" muted>
          {formatDay(today, i18n.language)}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {t(`hello.${partOfDay(new Date().getHours())}`)}
        </AppText>
      </View>
      <View style={styles.streak} accessible accessibilityLabel={streakLabel}>
        <SymbolView name="flame.fill" size={18} tintColor={colors.streak} />
        <AppText variant="brand" style={styles.streakNumber}>
          {streak}
        </AppText>
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md },
  text: { flex: 1 },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    paddingHorizontal: tokens.space.md,
    height: 40,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.streakSoft,
  },
  streakNumber: { fontSize: 22, lineHeight: 28, color: colors.streak },
}));
