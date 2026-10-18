import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MoveList } from '@/components/scan/MoveList';
import { ScoreRings } from '@/components/scan/ScoreRings';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SheetHeader } from '@/components/ui/SheetHeader';
import type { FaceArea } from '@/constants/faceMap';
import { useFaceScanActions, useFaceScans } from '@/hooks/useFaceScans';
import { useTheme } from '@/hooks/useTheme';
import { change, smallestMove } from '@/services/faceScan/score';
import { scanPhotoUri } from '@/services/faceTracking';
import { makeStyles } from '@/theme/makeStyles';
import { formatDay, formatDayMonth, formatTimeOf } from '@/utils/format';

/**
 * One face scan's numbers (docs/face-scan.md): Movement and Balance with the change since the scan before, every
 * move, the photo if one was saved, and how it's measured. ?id=<scan id>; &fresh=1 right after the scan (a Done
 * button).
 */
export default function ScanResultScreen() {
  const { id, fresh } = useLocalSearchParams<{ id?: string; fresh?: string }>();
  const { t, i18n } = useTranslation(['scan', 'common']);
  const styles = useStyles();
  const { colors } = useTheme();
  const { scans } = useFaceScans();
  const actions = useFaceScanActions();
  const index = scans.findIndex((s) => s.id === id);
  const scan = index >= 0 ? scans[index] : null;
  const previous = index >= 0 ? (scans[index + 1] ?? null) : null;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/progress'));
  const lang = i18n.language;

  if (!scan) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <SheetHeader title={t('scan:title')} onClose={close} />
        <AppText muted center style={styles.missing}>
          {t('scan:result.notFound')}
        </AppText>
      </SafeAreaView>
    );
  }

  const { score } = scan;
  const smallest = smallestMove(score);
  const photo = scan.photo ? scanPhotoUri(scan.photo) : null;

  const practice = (area: FaceArea) => {
    router.dismissAll();
    router.navigate({ pathname: '/exercises', params: { area } });
  };

  const confirmDelete = () =>
    Alert.alert(t('scan:result.deleteTitle'), t('scan:result.deleteBody'), [
      { text: t('common:cancel'), style: 'cancel' },
      {
        text: t('scan:result.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          await actions.remove(scan);
          close();
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <SheetHeader title={t('scan:title')} onClose={close}>
        <IconButton icon="trash" onPress={confirmDelete} accessibilityLabel={t('scan:result.delete')} />
      </SheetHeader>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText muted>{`${formatDay(scan.day, lang)} · ${formatTimeOf(scan.takenAt, lang)}`}</AppText>
        <ScoreRings
          movement={score.movement}
          balance={score.balance}
          movementChange={change(score.movement, previous?.score.movement)}
          balanceChange={change(score.balance, previous?.score.balance)}
          since={previous ? formatDayMonth(previous.day, lang) : null}
        />
        {previous ? null : (
          <Card style={styles.note}>
            <SymbolView name="flag.fill" size={18} tintColor={colors.primary} />
            <AppText variant="footnote" style={styles.flex}>
              {t('scan:result.first')}
            </AppText>
          </Card>
        )}
        {photo ? (
          <Pressable onPress={() => router.push('/scan-photos')} accessibilityRole="button" style={({ pressed }) => pressed && styles.pressed}>
            <Card style={styles.photoRow}>
              <Image source={{ uri: photo }} style={styles.thumb} contentFit="cover" accessibilityIgnoresInvertColors />
              <AppText style={styles.flex}>{t('scan:result.photo')}</AppText>
              <SymbolView name="chevron.right" size={14} weight="semibold" tintColor={colors.textMuted} />
            </Card>
          </Pressable>
        ) : null}

        <SectionHeader title={t('scan:result.moves')} />
        <MoveList moves={score.moves} smallest={smallest?.id ?? null} onPractice={practice} />

        <Card style={styles.how}>
          <AppText variant="headline">{t('scan:result.how')}</AppText>
          <AppText variant="footnote" muted>
            {t('scan:result.howBody')}
          </AppText>
        </Card>
      </ScrollView>
      {fresh ? (
        <View style={styles.footer}>
          <Button title={t('scan:result.done')} size="large" fullWidth onPress={close} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: tokens.space.lg, gap: tokens.space.lg, paddingBottom: tokens.space.xxl },
  missing: { padding: tokens.space.xl },
  note: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, padding: tokens.space.lg },
  flex: { flex: 1 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, padding: tokens.space.md },
  thumb: { width: 56, height: 72, borderRadius: tokens.radius.sm, backgroundColor: colors.surfaceAlt },
  pressed: { opacity: 0.8 },
  how: { padding: tokens.space.lg, gap: tokens.space.sm },
  footer: { paddingHorizontal: tokens.space.lg, paddingTop: tokens.space.sm, paddingBottom: tokens.space.md },
}));
