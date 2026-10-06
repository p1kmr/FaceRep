import { View } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

export function StatTile({ label, value, unit }: { label: string; value: string; unit?: string }) {
  const styles = useStyles();
  return (
    <View style={styles.tile} accessible accessibilityLabel={`${label}: ${value} ${unit ?? ''}`}>
      <AppText variant="caption" muted numberOfLines={2}>
        {label}
      </AppText>
      <AppText variant="headline" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {value}
        {unit ? <AppText variant="footnote" muted>{` ${unit}`}</AppText> : null}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  tile: {
    flex: 1,
    gap: tokens.space.xs,
    padding: tokens.space.md,
    borderRadius: tokens.radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
}));
