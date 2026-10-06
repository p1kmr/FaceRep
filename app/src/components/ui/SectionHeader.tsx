import { makeStyles } from '@/theme/makeStyles';

import { AppText } from './AppText';

export function SectionHeader({ title }: { title: string }) {
  const styles = useStyles();
  return (
    <AppText variant="footnote" muted style={styles.header} accessibilityRole="header">
      {title.toUpperCase()}
    </AppText>
  );
}

const useStyles = makeStyles(({ tokens }) => ({
  header: { marginBottom: -tokens.space.sm, marginLeft: tokens.space.lg },
}));
