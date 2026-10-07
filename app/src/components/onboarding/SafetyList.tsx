import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';
import { Card } from '../ui/Card';

const POINTS: { key: string; icon: SymbolViewProps['name'] }[] = [
  { key: 'gentle', icon: 'hand.raised.fill' },
  { key: 'jaw', icon: 'exclamationmark.triangle.fill' },
  { key: 'treatments', icon: 'syringe.fill' },
  { key: 'stop', icon: 'stop.circle.fill' },
  { key: 'results', icon: 'info.circle.fill' },
];

/** The safety points shown in onboarding and in Settings → Exercise safety. */
export function SafetyList() {
  const { t } = useTranslation(['onboarding', 'common']);
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Card style={styles.card}>
      {POINTS.map((p) => (
        <View key={p.key} style={styles.row}>
          <SymbolView name={p.icon} size={20} tintColor={p.key === 'jaw' ? colors.warning : colors.primary} />
          <AppText style={styles.text}>{t(`onboarding:safety.points.${p.key}`)}</AppText>
        </View>
      ))}
      <AppText variant="footnote" muted>
        {t('common:disclaimer')}
      </AppText>
    </Card>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  card: { padding: tokens.space.lg, gap: tokens.space.lg },
  row: { flexDirection: 'row', gap: tokens.space.md, alignItems: 'flex-start' },
  text: { flex: 1 },
}));
