import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

interface ScoreRingsProps {
  movement: number | null;
  balance: number | null;
  /** Change since the scan before (null for the first scan, or when a number is missing). */
  movementChange: number | null;
  balanceChange: number | null;
  /** The scan before's date, e.g. "Oct 12". */
  since: string | null;
}

/** "+5", "−3" (a real minus sign). */
export const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}`;

function Ring({ value, label, hint, change, since, gradient }: {
  value: number | null;
  label: string;
  hint: string;
  change: number | null;
  since: string | null;
  gradient?: boolean;
}) {
  const { t } = useTranslation('scan');
  const styles = useStyles();
  const { colors } = useTheme();
  const changeText =
    change === null || !since ? null : change === 0 ? t('result.same', { date: since }) : t('result.since', { change: signed(change), date: since });
  return (
    <View style={styles.item} accessible accessibilityLabel={[label, value === null ? '–' : `${value} / 100`, changeText].filter(Boolean).join('. ')}>
      <ProgressRing progress={(value ?? 0) / 100} size={124} stroke={10} gradient={gradient} color={colors.info}>
        <AppText variant="brand" style={styles.number}>
          {value === null ? '–' : value}
        </AppText>
      </ProgressRing>
      <AppText variant="headline" center>
        {label}
      </AppText>
      <AppText variant="caption" muted center>
        {hint}
      </AppText>
      {changeText ? (
        <AppText variant="footnote" center style={{ color: change && change > 0 ? colors.success : colors.textMuted }}>
          {changeText}
        </AppText>
      ) : null}
    </View>
  );
}

/** The scan's two numbers side by side: Movement (brand ring) and Balance, each with its change since the last scan. */
export function ScoreRings({ movement, balance, movementChange, balanceChange, since }: ScoreRingsProps) {
  const { t } = useTranslation('scan');
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Ring value={movement} label={t('result.movement')} hint={t('result.movementHint')} change={movementChange} since={since} gradient />
      <Ring value={balance} label={t('result.balance')} hint={t('result.balanceHint')} change={balanceChange} since={since} />
    </View>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  row: { flexDirection: 'row', gap: tokens.space.lg, justifyContent: 'center' },
  item: { flex: 1, alignItems: 'center', gap: tokens.space.xs },
  number: { fontSize: 44, lineHeight: 52 },
}));
