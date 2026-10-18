import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { FaceArea } from '@/constants/faceMap';
import { SCAN_MOVE_IDS, SCAN_MOVES, type ScanMoveId } from '@/constants/faceScan';
import { useTheme } from '@/hooks/useTheme';
import type { MoveScore } from '@/services/faceScan/score';
import { makeStyles } from '@/theme/makeStyles';

interface MoveListProps {
  moves: MoveScore[];
  /** The move with the lowest score: tagged, with a link to the exercises for its area. */
  smallest: ScanMoveId | null;
  onPractice: (area: FaceArea) => void;
}

/** Every move of the scan: its score as a bar, left and right for the moves with sides, "not read" when it wasn't. */
export function MoveList({ moves, smallest, onPractice }: MoveListProps) {
  const { t } = useTranslation('scan');
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Card>
      {SCAN_MOVE_IDS.map((id, i) => {
        const move = moves.find((m) => m.id === id);
        const name = t(`moves.${id}`);
        const sides = move && move.left !== null && move.right !== null ? t('result.sides', { left: move.left, right: move.right }) : null;
        const a11y = move ? [`${name}: ${move.score} / 100`, sides].filter(Boolean).join('. ') : `${name}: ${t('result.notRead')}`;
        return (
          <View key={id} style={[styles.row, i < SCAN_MOVE_IDS.length - 1 && styles.divider]}>
            <View style={styles.head} accessible accessibilityLabel={a11y}>
              <AppText style={styles.name}>{name}</AppText>
              {smallest === id ? <Badge label={t('result.smallest')} tone="primary" /> : null}
              <View style={styles.flex} />
              <AppText variant="brand" style={styles.score}>
                {move ? move.score : '–'}
              </AppText>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${move?.score ?? 0}%` }]} />
            </View>
            {move ? (
              sides ? (
                <AppText variant="footnote" muted>
                  {sides}
                </AppText>
              ) : null
            ) : (
              <AppText variant="footnote" muted>
                {t('result.notRead')}
              </AppText>
            )}
            {smallest === id ? (
              <Pressable
                onPress={() => onPractice(SCAN_MOVES[id].area)}
                accessibilityRole="link"
                style={({ pressed }) => [styles.link, pressed && styles.pressed]}
                hitSlop={8}
              >
                <AppText variant="footnote" style={styles.linkText}>
                  {t('result.practice')}
                </AppText>
                <SymbolView name="chevron.right" size={12} weight="semibold" tintColor={colors.primary} />
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </Card>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { padding: tokens.space.lg, gap: tokens.space.sm },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  head: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
  name: { fontWeight: tokens.font.weight.semibold },
  flex: { flex: 1 },
  score: { fontSize: 24, lineHeight: 30 },
  track: { height: 8, borderRadius: tokens.radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  fill: { height: 8, borderRadius: tokens.radius.pill, backgroundColor: colors.primary },
  link: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.xs, alignSelf: 'flex-start' },
  linkText: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
  pressed: { opacity: 0.6 },
}));
