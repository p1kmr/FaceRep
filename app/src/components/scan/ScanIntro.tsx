import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToggleRow } from '@/components/settings/ToggleRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Gradient } from '@/components/ui/Gradient';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { useTheme } from '@/hooks/useTheme';
import { makeStyles } from '@/theme/makeStyles';

interface ScanIntroProps {
  /** Settings → scan photos: null until the user answers the question here. */
  photos: boolean | null;
  onPhotos: (on: boolean) => void;
  /** Free scans left (Infinity with Premium). */
  freeLeft: number;
  onStart: () => void;
  onClose: () => void;
}

const TIPS: { key: 'light' | 'hold' | 'private'; icon: SymbolViewProps['name'] }[] = [
  { key: 'light', icon: 'sun.max.fill' },
  { key: 'hold', icon: 'iphone' },
  { key: 'private', icon: 'lock.fill' },
];

/**
 * Before the scan: what it does, three tips for a reading that compares well week to week, and the progress photo.
 * The photo is asked once with its own buttons (nothing is taken until the user says yes); after that it's a switch.
 */
export function ScanIntro({ photos, onPhotos, freeLeft, onStart, onClose }: ScanIntroProps) {
  const { t } = useTranslation('scan');
  const styles = useStyles();
  const { colors } = useTheme();
  // Insets from the app root: inside a full-screen modal SafeAreaView gave no top inset on notch iPhones (as in workout).
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <SheetHeader title={t('title')} onClose={onClose} />
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="never">
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Gradient colors={[colors.primaryEnd, colors.primary]} />
            <SymbolView name="faceid" size={44} tintColor={colors.onPrimary} />
          </View>
          <AppText variant="headline" center>
            {t('intro.body')}
          </AppText>
        </View>

        <Card>
          {TIPS.map((tip, i) => (
            <View key={tip.key} style={[styles.tip, i < TIPS.length - 1 && styles.divider]}>
              <SymbolView name={tip.icon} size={20} tintColor={colors.primary} />
              <AppText style={styles.tipText}>{t(`intro.${tip.key}`)}</AppText>
            </View>
          ))}
        </Card>

        {photos === null ? (
          <Card style={styles.ask}>
            <View style={styles.askHead}>
              <SymbolView name="camera.fill" size={20} tintColor={colors.primary} />
              <AppText variant="headline" style={styles.tipText}>
                {t('photo.askTitle')}
              </AppText>
            </View>
            <AppText variant="footnote" muted>
              {t('photo.askBody')}
            </AppText>
            <View style={styles.askButtons}>
              <Button title={t('photo.no')} variant="secondary" onPress={() => onPhotos(false)} />
              <Button title={t('photo.yes')} onPress={() => onPhotos(true)} />
            </View>
          </Card>
        ) : (
          <Card>
            <ToggleRow title={t('photo.toggle')} subtitle={t('photo.toggleHint')} value={photos} onValueChange={onPhotos} />
          </Card>
        )}

        <AppText variant="footnote" muted center>
          {t('intro.note')}
        </AppText>
      </ScrollView>
      <View style={styles.footer}>
        <Button title={t('intro.start')} size="large" icon="play.fill" fullWidth onPress={onStart} />
        {Number.isFinite(freeLeft) ? (
          <AppText variant="footnote" muted center>
            {t('intro.freeLeft', { count: freeLeft })}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: tokens.space.lg, gap: tokens.space.lg },
  hero: { alignItems: 'center', gap: tokens.space.lg, paddingVertical: tokens.space.sm },
  badge: {
    width: 88,
    height: 88,
    borderRadius: tokens.radius.xl,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md, padding: tokens.space.lg },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  tipText: { flex: 1 },
  ask: { padding: tokens.space.lg, gap: tokens.space.sm },
  askHead: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.md },
  askButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: tokens.space.sm, marginTop: tokens.space.xs },
  footer: { paddingHorizontal: tokens.space.lg, paddingTop: tokens.space.sm, paddingBottom: tokens.space.md, gap: tokens.space.sm },
}));
