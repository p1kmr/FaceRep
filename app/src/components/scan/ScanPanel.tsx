import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { SCAN_STEPS } from '@/constants/faceScan';
import { useTheme } from '@/hooks/useTheme';
import type { ScanRunView } from '@/services/faceScan/engine';
import { makeStyles } from '@/theme/makeStyles';

interface ScanPanelProps {
  view: ScanRunView;
  photoSaved: boolean;
  saving: boolean;
}

/** What the status line says: a problem first (the face can't be measured), else where the step is. */
function statusKey(view: ScanRunView, saving: boolean): string {
  if (saving) return 'saving';
  if (view.stage === 'done') return 'done';
  if (view.stage === 'find') return view.issue && view.issue !== 'noFace' ? view.issue : 'find';
  if (view.issue) return view.issue;
  if (view.stage === 'countdown') return 'ready';
  if (view.stage === 'release') return 'relax';
  return view.stage === 'hold' ? 'hold' : 'ready';
}

/**
 * The bottom of the scan screen: the move in big letters, how to do it, and a status line (what the scan is waiting
 * for, or "Hold it"). Read out by VoiceOver as it changes.
 */
export function ScanPanel({ view, photoSaved, saving }: ScanPanelProps) {
  const { t } = useTranslation('scan');
  const styles = useStyles();
  const { colors } = useTheme();
  // Before the first move (finding the face, the countdown) the panel shows the first step: relax.
  const step = view.stage === 'release' ? Math.min(view.step + 1, SCAN_STEPS.length - 1) : view.step;
  const id = SCAN_STEPS[step];
  const key = statusKey(view, saving);
  const warn = !!view.issue && view.stage !== 'done' && !saving;

  return (
    <View style={styles.panel}>
      <AppText variant="caption" style={styles.stepOf}>
        {t('stepOf', { step: step + 1, count: SCAN_STEPS.length })}
      </AppText>
      <AppText
        variant="brand"
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
        style={styles.title}
        accessibilityLiveRegion="polite"
        accessibilityRole="header"
      >
        {t(`steps.${id}.title`).toUpperCase()}
      </AppText>
      <AppText variant="footnote" style={styles.hint}>
        {t(`steps.${id}.hint`)}
      </AppText>
      <View style={styles.row}>
        <View style={[styles.status, warn && { backgroundColor: colors.warning }]}>
          <AppText variant="footnote" style={styles.statusText} accessibilityLiveRegion="polite">
            {t(`status.${key}`)}
          </AppText>
        </View>
        {photoSaved ? (
          <View style={styles.status} accessible accessibilityLabel={t('photo.saved')}>
            <SymbolView name="camera.fill" size={13} tintColor={colors.onImage} />
            <AppText variant="footnote" style={styles.statusText}>
              {t('photo.saved')}
            </AppText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  panel: {
    marginHorizontal: tokens.space.lg,
    padding: tokens.space.lg,
    gap: tokens.space.xs,
    borderRadius: tokens.radius.xl,
    backgroundColor: colors.overlay,
  },
  stepOf: { color: colors.onImage, opacity: 0.75, fontWeight: tokens.font.weight.semibold },
  title: { fontSize: 34, lineHeight: 40, color: colors.onImage },
  hint: { color: colors.onImage, opacity: 0.85 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm, marginTop: tokens.space.sm },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.xs,
    paddingHorizontal: tokens.space.md,
    paddingVertical: tokens.space.xs + 2,
    borderRadius: tokens.radius.pill,
    backgroundColor: colors.onImageSoft,
  },
  statusText: { color: colors.onImage, fontWeight: tokens.font.weight.semibold },
}));
