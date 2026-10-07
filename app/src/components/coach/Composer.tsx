import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { CHAT_LIMITS } from '@/constants/limits';
import { useTheme } from '@/hooks/useTheme';
import { haptics } from '@/services/haptics';
import { makeStyles } from '@/theme/makeStyles';

/** Text field + send. `onSend` returns false when the message didn't go out (keeps the draft). */
export function Composer({ onSend, disabled, initialText = '' }: { onSend: (text: string) => boolean; disabled: boolean; initialText?: string }) {
  const { t } = useTranslation('coach');
  const { colors } = useTheme();
  const styles = useStyles();
  const [text, setText] = useState(initialText.slice(0, CHAT_LIMITS.questionChars));
  const canSend = !disabled && text.trim().length > 0;

  const send = () => {
    if (!canSend) return;
    haptics.tap();
    if (onSend(text)) setText('');
  };

  return (
    <View style={styles.row}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={t('placeholder')}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        multiline
        maxLength={CHAT_LIMITS.questionChars}
        accessibilityLabel={t('placeholder')}
        submitBehavior="blurAndSubmit"
        onSubmitEditing={send}
        returnKeyType="send"
      />
      <Pressable
        onPress={send}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel={t('send')}
        style={[styles.send, !canSend && styles.sendOff]}
      >
        <SymbolView name="arrow.up" size={18} weight="bold" tintColor={colors.onPrimary} />
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: tokens.space.sm },
  input: {
    flex: 1,
    minHeight: tokens.hitSize,
    maxHeight: 120,
    paddingHorizontal: tokens.space.lg,
    paddingTop: tokens.space.md,
    paddingBottom: tokens.space.md,
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: tokens.font.size.body,
  },
  send: {
    width: tokens.hitSize,
    height: tokens.hitSize,
    borderRadius: tokens.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  sendOff: { opacity: 0.35 },
}));
