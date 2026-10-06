import { Pressable, View } from 'react-native';

import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from './AppText';

interface SegmentedProps<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}

/** iOS-style segmented control (e.g. Month | Year). */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const styles = useStyles();
  return (
    <View style={styles.root} accessibilityRole="tablist">
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => {
              if (selected) return;
              haptics.tap();
              onChange(o.id);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.item, selected && styles.selected]}
          >
            <AppText variant="footnote" style={selected ? styles.labelSelected : undefined}>
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flexDirection: 'row', padding: 2, borderRadius: tokens.radius.pill, backgroundColor: colors.surfaceAlt },
  item: { paddingVertical: 6, paddingHorizontal: tokens.space.md, borderRadius: tokens.radius.pill },
  selected: {
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  labelSelected: { fontWeight: tokens.font.weight.semibold },
}));
