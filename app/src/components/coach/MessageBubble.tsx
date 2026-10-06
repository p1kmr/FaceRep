import { View } from 'react-native';

import { makeStyles } from '@/theme/makeStyles';

import { AppText } from '../ui/AppText';

export function MessageBubble({ role, text }: { role: 'user' | 'assistant'; text: string }) {
  const styles = useStyles();
  const mine = role === 'user';
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      <AppText style={mine ? styles.mineText : undefined} selectable>
        {text}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  bubble: { maxWidth: '86%', paddingHorizontal: tokens.space.md + 2, paddingVertical: tokens.space.sm + 2, borderRadius: tokens.radius.lg },
  mine: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: tokens.radius.sm },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: tokens.radius.sm,
  },
  mineText: { color: colors.onPrimary },
}));
