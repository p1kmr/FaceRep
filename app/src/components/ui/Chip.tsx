import { Pressable } from 'react-native';

import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from './AppText';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/** Selectable pill (programs, suggestions). Without onPress it is a plain tag. */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  const styles = useStyles();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={onPress ? { selected } : undefined}
      disabled={!onPress}
      onPress={() => {
        haptics.select();
        onPress?.();
      }}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <AppText variant="footnote" style={selected ? styles.selectedText : styles.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  chip: {
    minHeight: 34,
    paddingHorizontal: tokens.space.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selected: { backgroundColor: colors.text, borderColor: colors.text },
  pressed: { opacity: 0.8 },
  text: { fontWeight: tokens.font.weight.medium },
  selectedText: { color: colors.background, fontWeight: tokens.font.weight.semibold },
}));
