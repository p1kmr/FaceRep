import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { TimeOfDay } from '@/state/settings/types';

import { AppText } from '../ui/AppText';
import { ListRow } from '../ui/ListRow';

function toDate(time: TimeOfDay) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function fromDate(d: Date): TimeOfDay {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Row with the iOS compact time picker (shows the time in the user's 12/24h format). */
export function TimeRow({
  title,
  value,
  onChange,
  divider,
}: {
  title: string;
  value: TimeOfDay;
  onChange: (value: TimeOfDay) => void;
  divider?: boolean;
}) {
  const { colors, isDark } = useTheme();
  return (
    <ListRow
      title={title}
      divider={divider}
      right={
        Platform.OS === 'ios' ? (
          <DateTimePicker
            value={toDate(value)}
            mode="time"
            display="compact"
            accentColor={colors.primary}
            themeVariant={isDark ? 'dark' : 'light'}
            onChange={(_, date) => date && onChange(fromDate(date))}
            accessibilityLabel={title}
          />
        ) : (
          <AppText muted>{value}</AppText>
        )
      }
    />
  );
}
