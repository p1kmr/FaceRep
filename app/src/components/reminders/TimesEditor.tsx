import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { REMINDER } from '@/constants/reminders';
import { makeStyles } from '@/theme/makeStyles';
import { formatTime } from '@/utils/format';

import { TimeRow } from '../settings/TimeRow';
import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';

/** One time picker per time (1–6), remove buttons, "Add a time" and an "every 2 hours" shortcut. */
export function TimesEditor({ value, onChange }: { value: string[]; onChange: (times: string[]) => void }) {
  const { t, i18n } = useTranslation('reminders');
  const styles = useStyles();
  const set = (i: number, time: string) => onChange([...new Set(value.map((x, j) => (j === i ? time : x)))].sort());
  const nextFree = () => {
    // One hour after the last time, or the earliest free hour.
    const last = Number(value[value.length - 1]?.slice(0, 2) ?? 8);
    const hour = Array.from({ length: 24 }, (_, k) => (last + 1 + k) % 24).find((h) => !value.includes(`${String(h).padStart(2, '0')}:00`));
    return `${String(hour ?? 9).padStart(2, '0')}:00`;
  };

  return (
    <View style={styles.root}>
      <Card>
        {value.map((time, i) => (
          <View key={`${i}-${time}`} style={styles.row}>
            <View style={styles.picker}>
              <TimeRow title={t('edit.time', { n: i + 1 })} value={time} onChange={(x) => set(i, x)} divider={i < value.length - 1} />
            </View>
            {value.length > 1 ? (
              <Pressable
                onPress={() => onChange(value.filter((_, j) => j !== i))}
                accessibilityRole="button"
                accessibilityLabel={t('edit.removeTime', { time: formatTime(time, i18n.language) })}
                hitSlop={8}
                style={styles.remove}
              >
                <AppText style={styles.removeText}>−</AppText>
              </Pressable>
            ) : null}
          </View>
        ))}
      </Card>
      <View style={styles.chips}>
        {value.length < REMINDER.maxTimes ? <Chip label={t('edit.addTime')} onPress={() => onChange([...value, nextFree()].sort())} /> : null}
        <Chip label={t('edit.everyTwoHours')} onPress={() => onChange([...REMINDER.everyTwoHours])} />
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { gap: tokens.space.sm },
  row: { flexDirection: 'row', alignItems: 'center' },
  picker: { flex: 1 },
  remove: {
    width: 28,
    height: 28,
    marginRight: tokens.space.md,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  removeText: { color: colors.danger, fontWeight: tokens.font.weight.bold },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.xs },
}));
