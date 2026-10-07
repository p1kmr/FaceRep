import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { ASK_BUTTON_ROOM } from '@/constants/limits';
import { makeStyles } from '@/theme/makeStyles';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  /** Center the content vertically (empty and welcome screens). */
  centered?: boolean;
  /** Pinned under the content, e.g. the main button of an onboarding step. */
  footer?: ReactNode;
  edges?: Edge[];
}

/** Every screen's frame: safe areas, theme background, padding, optional pinned footer. */
export function Screen({ children, scroll = true, centered = false, footer, edges }: ScreenProps) {
  const styles = useStyles();
  const content = centered ? [styles.content, styles.centered] : styles.content;
  const safeEdges = edges ?? (footer ? ['top', 'bottom'] : ['top']);
  return (
    <SafeAreaView style={styles.root} edges={safeEdges}>
      {scroll ? (
        <ScrollView contentContainerStyle={[content, styles.scrollEnd]} contentInsetAdjustmentBehavior="automatic">
          {children}
        </ScrollView>
      ) : (
        <View style={content}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, padding: tokens.space.lg, gap: tokens.space.lg },
  // Room for the floating Coach button so it never covers the last row.
  scrollEnd: { paddingBottom: ASK_BUTTON_ROOM },
  centered: { alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: tokens.space.lg, paddingTop: tokens.space.sm, paddingBottom: tokens.space.md, gap: tokens.space.xs },
}));
