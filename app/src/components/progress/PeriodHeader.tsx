import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

interface PeriodHeaderProps {
  title: string;
  onPrevious: () => void;
  onNext: () => void;
  /** False for the current period: there is nothing to see in the future. */
  canGoForward: boolean;
  /** False for the period of the first workout: there is nothing before it. */
  canGoBack: boolean;
}

/** ‹ October 2026 › */
export function PeriodHeader({ title, onPrevious, onNext, canGoForward, canGoBack }: PeriodHeaderProps) {
  const { t } = useTranslation('progress');
  const { colors } = useTheme();
  const styles = useStyles();
  const arrow = (dir: 'left' | 'right', onPress: () => void, enabled: boolean, label: string) => (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !enabled }}
      hitSlop={10}
      style={({ pressed }) => [styles.arrow, !enabled && styles.hidden, pressed && styles.pressed]}
    >
      <SymbolView
        name={`chevron.${dir}`}
        size={17}
        weight="semibold"
        tintColor={colors.primary}
        fallback={<AppText style={styles.fallback}>{dir === 'left' ? '‹' : '›'}</AppText>}
      />
    </Pressable>
  );
  return (
    <View style={styles.row}>
      {arrow('left', onPrevious, canGoBack, t('previous'))}
      <AppText variant="headline" center style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      {arrow('right', onNext, canGoForward, t('next'))}
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  title: { flex: 1 },
  arrow: { width: 36, height: 36, borderRadius: tokens.radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceAlt },
  hidden: { opacity: 0 },
  pressed: { opacity: 0.6 },
  fallback: { color: colors.primary, fontSize: tokens.font.size.headline, fontWeight: tokens.font.weight.bold },
}));
