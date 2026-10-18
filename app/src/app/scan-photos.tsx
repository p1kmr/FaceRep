import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ToggleRow } from '@/components/settings/ToggleRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { useFaceScanActions, useFaceScans } from '@/hooks/useFaceScans';
import { useScanPhotosSetting } from '@/hooks/useScanPhotosSetting';
import type { FaceScan } from '@/services/faceScan/scansRepo';
import { scanPhotoUri } from '@/services/faceTracking';
import { makeStyles } from '@/theme/makeStyles';
import { formatDayMonth } from '@/utils/format';

const COLUMNS = 3;

/**
 * The face scan's progress photos (docs/face-scan.md), only in the app on this iPhone: the first and the latest side
 * by side, then every photo. Tap one to see it big or delete it.
 */
export default function ScanPhotosScreen() {
  const { t, i18n } = useTranslation(['scan', 'common']);
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const { photos } = useFaceScans();
  const actions = useFaceScanActions();
  const scanPhotos = useScanPhotosSetting();
  const [open, setOpen] = useState<FaceScan | null>(null);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/progress'));
  const lang = i18n.language;
  const cell = (width - 32 - 8 * (COLUMNS - 1)) / COLUMNS;
  const first = photos[photos.length - 1];
  const latest = photos[0];
  const uri = (scan: FaceScan) => (scan.photo ? (scanPhotoUri(scan.photo) ?? undefined) : undefined);

  const deleteAll = () =>
    Alert.alert(t('scan:photos.deleteAllTitle'), t('scan:photos.deleteAllBody'), [
      { text: t('common:cancel'), style: 'cancel' },
      { text: t('scan:photos.deleteConfirm'), style: 'destructive', onPress: () => actions.removeAllPhotos() },
    ]);

  const deleteOne = (scan: FaceScan) => {
    setOpen(null);
    actions.removePhoto(scan);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <SheetHeader title={t('scan:photos.title')} onClose={close} />
      <ScrollView contentContainerStyle={styles.content}>
        {photos.length >= 2 ? (
          <View style={styles.compare}>
            {[first, latest].map((scan, i) => (
              <Pressable key={scan.id} style={styles.flex} onPress={() => setOpen(scan)} accessibilityRole="imagebutton">
                <Image source={{ uri: uri(scan) }} style={styles.big} contentFit="cover" accessibilityIgnoresInvertColors />
                <AppText variant="footnote" muted center>
                  {`${i === 0 ? t('scan:photos.first') : t('scan:photos.latest')} · ${formatDayMonth(scan.day, lang)}`}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}

        {photos.length ? (
          <View style={styles.grid}>
            {photos.map((scan) => (
              <Pressable
                key={scan.id}
                onPress={() => setOpen(scan)}
                accessibilityRole="imagebutton"
                accessibilityLabel={formatDayMonth(scan.day, lang)}
                style={{ width: cell }}
              >
                <Image source={{ uri: uri(scan) }} style={[styles.small, { width: cell, height: cell * 1.33 }]} contentFit="cover" />
                <AppText variant="caption" muted center>
                  {formatDayMonth(scan.day, lang)}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : (
          <AppText muted center style={styles.empty}>
            {t('scan:photos.empty')}
          </AppText>
        )}

        {scanPhotos.available ? (
          <Card>
            <ToggleRow title={t('scan:photo.toggle')} subtitle={t('scan:photo.toggleHint')} value={scanPhotos.on} onValueChange={scanPhotos.set} />
          </Card>
        ) : null}
        <AppText variant="footnote" muted center>
          {t('scan:photos.note')}
        </AppText>
        {photos.length ? <Button title={t('scan:photos.deleteAll')} variant="ghost" onPress={deleteAll} /> : null}
      </ScrollView>

      <Modal visible={open !== null} animationType="fade" presentationStyle="fullScreen" onRequestClose={() => setOpen(null)}>
        <SafeAreaView style={styles.viewer} edges={['top', 'bottom']}>
          {open ? (
            <>
              <Image source={{ uri: uri(open) }} style={styles.flex} contentFit="contain" accessibilityIgnoresInvertColors />
              <AppText center style={styles.viewerText}>
                {formatDayMonth(open.day, lang)}
              </AppText>
              <View style={styles.viewerButtons}>
                <Button title={t('scan:photos.delete')} variant="danger" onPress={() => deleteOne(open)} />
                <Button title={t('scan:photos.close')} variant="secondary" onPress={() => setOpen(null)} />
              </View>
            </>
          ) : null}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: tokens.space.lg, gap: tokens.space.lg, paddingBottom: tokens.space.xxl },
  flex: { flex: 1 },
  compare: { flexDirection: 'row', gap: tokens.space.md },
  big: { width: '100%', aspectRatio: 3 / 4, borderRadius: tokens.radius.md, backgroundColor: colors.surfaceAlt, marginBottom: tokens.space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
  small: { borderRadius: tokens.radius.sm, backgroundColor: colors.surfaceAlt, marginBottom: 2 },
  empty: { paddingVertical: tokens.space.xl },
  viewer: { flex: 1, backgroundColor: colors.heroBackground, gap: tokens.space.md, paddingBottom: tokens.space.md },
  viewerText: { color: colors.onImage },
  viewerButtons: { flexDirection: 'row', justifyContent: 'center', gap: tokens.space.md },
}));
