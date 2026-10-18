import { Image } from 'expo-image';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Gradient } from '@/components/ui/Gradient';
import { ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SCAN } from '@/constants/faceScan';
import { useFaceScans } from '@/hooks/useFaceScans';
import { useTheme } from '@/hooks/useTheme';
import { change } from '@/services/faceScan/score';
import { scanPhotoUri } from '@/services/faceTracking';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, formatDayMonth } from '@/utils/format';

import { ScanChart } from './ScanChart';
import { signed } from './ScoreRings';

const HISTORY_ROWS = 5;

function Score({ label, value, delta, tint }: { label: string; value: number | null; delta: number | null; tint: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.score} accessible accessibilityLabel={`${label}: ${value ?? '–'}${delta ? `, ${signed(delta)}` : ''}`}>
      <View style={styles.scoreTop}>
        <AppText variant="brand" style={[styles.scoreValue, { color: tint }]}>
          {value ?? '–'}
        </AppText>
        {delta ? (
          <AppText variant="footnote" style={{ color: delta > 0 ? colors.success : colors.textMuted }}>
            {signed(delta)}
          </AppText>
        ) : null}
      </View>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

/**
 * Progress → Face scan: the latest Movement and Balance with their change, the chart of the scans, a New scan button
 * (the paywall when no free scan is left), the progress photos and the scans so far. Hidden on iPhones that can't scan
 * and have no scans.
 */
export function ScanProgressSection() {
  const { t, i18n } = useTranslation('scan');
  const styles = useStyles();
  const { colors } = useTheme();
  const scans = useFaceScans();
  const [all, setAll] = useState(false);
  if (!scans.available && !scans.scans.length) return null;

  const lang = i18n.language;
  const { latest, previous } = scans;
  const open = () => router.push(scans.canScan ? '/scan' : '/paywall');
  const free = Number.isFinite(scans.freeLeft) && scans.freeLeft > 0 ? t('card.freeLeft', { count: scans.freeLeft }) : null;
  const points = scans.scans
    .slice(0, SCAN.chartScans)
    .reverse()
    .map((s) => ({ day: s.day, movement: s.score.movement, balance: s.score.balance }));
  const rows = all ? scans.scans : scans.scans.slice(0, HISTORY_ROWS);
  const firstPhoto = scans.photos[0]?.photo;

  return (
    <>
      <SectionHeader title={t('title')} />
      {latest ? (
        <Card style={styles.card}>
          <View style={styles.scores}>
            <Score
              label={t('result.movement')}
              value={latest.score.movement}
              delta={change(latest.score.movement, previous?.score.movement)}
              tint={colors.primary}
            />
            <Score label={t('result.balance')} value={latest.score.balance} delta={change(latest.score.balance, previous?.score.balance)} tint={colors.info} />
          </View>
          <ScanChart points={points} />
          {scans.available ? (
            <Button title={scans.canScan ? t('card.new') : t('card.unlock')} icon={scans.canScan ? 'faceid' : 'lock.fill'} fullWidth onPress={open} />
          ) : null}
          <AppText variant="footnote" muted center>
            {[t('card.last', { date: formatDayMonth(latest.day, lang) }), free].filter(Boolean).join(' · ')}
          </AppText>
        </Card>
      ) : (
        <Card style={styles.card}>
          <View style={styles.emptyHead}>
            <View style={styles.badge}>
              <Gradient colors={[colors.primaryEnd, colors.primary]} />
              <SymbolView name="faceid" size={28} tintColor={colors.onPrimary} />
            </View>
            <AppText variant="headline" style={styles.flex}>
              {t('card.emptyTitle')}
            </AppText>
          </View>
          <AppText muted>{t('card.emptyBody')}</AppText>
          <Button title={t('card.start')} icon="faceid" fullWidth onPress={open} />
          {free ? (
            <AppText variant="footnote" muted center>
              {free}
            </AppText>
          ) : null}
        </Card>
      )}

      {scans.scans.length ? (
        <Card>
          {scans.photos.length ? (
            <ListRow
              title={t('card.photos')}
              subtitle={t('card.photosCount', { count: scans.photos.length })}
              left={firstPhoto ? <Image source={{ uri: scanPhotoUri(firstPhoto) ?? undefined }} style={styles.thumb} contentFit="cover" /> : null}
              onPress={() => router.push('/scan-photos')}
              chevron
              divider
            />
          ) : null}
          {rows.map((s, i) => (
            <ListRow
              key={s.id}
              title={formatDay(s.day, lang)}
              subtitle={`${t('result.movement')} ${s.score.movement ?? '–'} · ${t('result.balance')} ${s.score.balance ?? '–'}`}
              onPress={() => router.push({ pathname: '/scan-result', params: { id: s.id } })}
              chevron
              divider={i < rows.length - 1 || scans.scans.length > HISTORY_ROWS}
            />
          ))}
          {scans.scans.length > HISTORY_ROWS ? (
            <ListRow title={all ? t('card.fewer') : t('card.history', { count: scans.scans.length })} onPress={() => setAll(!all)} />
          ) : null}
        </Card>
      ) : null}
    </>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  card: { padding: tokens.space.lg, gap: tokens.space.md },
  scores: { flexDirection: 'row', gap: tokens.space.lg },
  score: { flex: 1, gap: 2 },
  scoreTop: { flexDirection: 'row', alignItems: 'baseline', gap: tokens.space.sm },
  scoreValue: { fontSize: 36, lineHeight: 42 },
  emptyHead: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md },
  badge: { width: 52, height: 52, borderRadius: tokens.radius.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  thumb: { width: 36, height: 48, borderRadius: tokens.radius.sm, backgroundColor: colors.surfaceAlt },
}));
