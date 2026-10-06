import { router } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Composer } from '@/components/coach/Composer';
import { MessageBubble } from '@/components/coach/MessageBubble';
import { TypingDots } from '@/components/coach/TypingDots';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { COACH_SUGGESTIONS } from '@/constants/coach';
import { LINKS } from '@/constants/links';
import { useChat } from '@/hooks/useChat';
import { useFreeAiLabel } from '@/hooks/useFreeAiLabel';
import { usePremium } from '@/hooks/usePremium';
import { makeStyles } from '@/theme/makeStyles';

/** The AI Coach (Premium; a few free answers a month). Long-press an answer to report it. */
export default function CoachScreen() {
  const { t } = useTranslation('coach');
  const styles = useStyles();
  const chat = useChat();
  const { isPremium } = usePremium();
  const freeLabel = useFreeAiLabel();
  const scroll = useRef<ScrollView>(null);
  const empty = !chat.messages.length && !chat.pending;

  const confirmClear = () =>
    Alert.alert(t('clear'), t('clearConfirm'), [
      { text: t('common:cancel'), style: 'cancel' },
      { text: t('clear'), style: 'destructive', onPress: chat.clear },
    ]);

  // Reporting an answer: a pre-filled mail to support (good practice for generative AI features).
  const report = (text: string) =>
    Linking.openURL(
      `mailto:${LINKS.supportEmail}?subject=${encodeURIComponent(t('reportSubject'))}&body=${encodeURIComponent(text.slice(0, 1000))}`,
    ).catch(() => {});

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {t('title')}
        </AppText>
        {chat.messages.length ? (
          <Pressable onPress={confirmClear} accessibilityRole="button" hitSlop={8}>
            <AppText style={styles.link}>{t('clear')}</AppText>
          </Pressable>
        ) : null}
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <ScrollView
          ref={scroll}
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: true })}
        >
          {empty ? (
            <View style={styles.empty}>
              <AppText muted>{t('intro')}</AppText>
              <View style={styles.chips}>
                {COACH_SUGGESTIONS.map((k) => (
                  <Chip key={k} label={t(`suggestions.${k}`)} onPress={() => chat.send(t(`suggestions.${k}`))} />
                ))}
              </View>
            </View>
          ) : null}
          {chat.messages.map((m) => (
            <Pressable
              key={m.id}
              onLongPress={m.role === 'assistant' ? () => report(m.text) : undefined}
              accessibilityHint={m.role === 'assistant' ? t('reportHint') : undefined}
            >
              <MessageBubble role={m.role} text={m.text} />
            </Pressable>
          ))}
          {chat.pending ? <MessageBubble role="user" text={chat.pending.text} /> : null}
          {chat.thinking ? <TypingDots /> : null}
          {chat.error ? (
            <View style={styles.error}>
              <AppText>{t(`errors.${chat.error}`)}</AppText>
              {chat.error === 'freeUsed' ? (
                <Button title={t('unlock')} onPress={() => router.push('/paywall')} />
              ) : chat.error !== 'notConfigured' ? (
                <Button title={t('errors.retry')} variant="secondary" onPress={chat.retry} />
              ) : null}
            </View>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          {!isPremium && freeLabel ? (
            <Pressable onPress={() => router.push('/paywall')} accessibilityRole="button">
              <AppText variant="caption" muted center>
                {freeLabel} · <AppText variant="caption" style={styles.link}>{t('unlock')}</AppText>
              </AppText>
            </Pressable>
          ) : null}
          <Composer onSend={chat.send} disabled={chat.thinking} />
          <AppText variant="caption" muted center>
            {t('aiNote')}
          </AppText>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.space.lg,
    paddingTop: tokens.space.lg,
    paddingBottom: tokens.space.sm,
  },
  content: { padding: tokens.space.lg, gap: tokens.space.md },
  empty: { gap: tokens.space.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.space.sm },
  error: {
    gap: tokens.space.md,
    padding: tokens.space.lg,
    borderRadius: tokens.radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: { paddingHorizontal: tokens.space.lg, paddingBottom: tokens.space.md, gap: tokens.space.sm },
  link: { color: colors.primary, fontWeight: tokens.font.weight.semibold },
}));
