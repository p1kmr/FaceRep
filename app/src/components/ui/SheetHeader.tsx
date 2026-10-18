import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';

import { AppText } from './AppText';
import { IconButton } from './IconButton';

interface SheetHeaderProps {
  title: string;
  onClose: () => void;
  /** Icon buttons before the close button. */
  children?: ReactNode;
}

/** The top of a sheet without a navigation bar (the Coach, its chat history): a big title, its buttons and ×. */
export function SheetHeader({ title, onClose, children }: SheetHeaderProps) {
  const { t } = useTranslation('common');
  const styles = useStyles();
  return (
    <View style={styles.header}>
      <AppText variant="title" accessibilityRole="header" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.title}>
        {title}
      </AppText>
      <View style={styles.actions}>
        {children}
        <IconButton icon="xmark" onPress={onClose} accessibilityLabel={t('close')} />
      </View>
    </View>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    paddingTop: tokens.space.lg,
    paddingBottom: tokens.space.sm,
  },
  title: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: tokens.space.sm },
}));
