import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ALL_DAYS } from '@/constants/reminders';
import { useFirstWeekday } from '@/hooks/useFirstWeekday';
import { daysPattern } from '@/services/reminders/reminders';
import { makeStyles } from '@/theme/makeStyles';
import { weekdayShortOf } from '@/utils/format';

import { Chip } from '../ui/Chip';

const PRESETS = { everyDay: [...ALL_DAYS], weekdays: [1, 2, 3, 4, 5] } as const;

/** Every day / Weekdays, then the seven days (in the user's week order) to pick any mix. */
export function DayPicker({ value, onChange }: { value: number[]; onChange: (days: number[]) => void }) {
  const { t, i18n } = useTranslation('reminders');
  const first = useFirstWeekday();
  const styles = useStyles();
  const pattern = daysPattern(value);
  const week = Array.from({ length: 7 }, (_, i) => (first + i) % 7);
  const toggle = (d: number) => onChange(value.includes(d) ? value.filter((x) => x !== d) : [...value, d].sort());

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((p) => (
          <Chip key={p} label={t(`days.${p}`)} selected={pattern === p} onPress={() => onChange([...PRESETS[p]])} />
        ))}
      </View>
      <View style={styles.row}>
        {week.map((d) => (
          <Chip key={d} label={weekdayShortOf(d, i18n.language)} selected={value.includes(d)} onPress={() => toggle(d)} />
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  root: { gap: tokens.space.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.xs },
}));
