import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatRow } from '@/components/coach/ChatRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SheetHeader } from '@/components/ui/SheetHeader';
import { useChat } from '@/hooks/useChat';
import { useToday } from '@/hooks/useToday';
import { makeStyles } from '@/theme/makeStyles';

/**
 * The Coach's chat history, a sheet over the Coach (its clock button): tap a chat to go back to it, swipe one away or
 * delete them all. Chats stay on this iPhone only.
 */
export default function CoachHistoryScreen() {
  const { t } = useTranslation('coach');
  const styles = useStyles();
  const chat = useChat();
  const today = useToday();

  const confirm = (title: string, button: string, onConfirm: () => void) =>
    Alert.alert(title, t('history.deleteBody'), [
      { text: t('common:cancel'), style: 'cancel' },
      { text: button, style: 'destructive', onPress: onConfirm },
    ]);

  const open = async (id: string) => {
    await chat.openChat(id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <SheetHeader title={t('history.title')} onClose={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        {chat.chats.length ? (
          <>
            <Card>
              {chat.chats.map((c, i) => (
                <ChatRow
                  key={c.id}
                  chat={c}
                  open={c.id === chat.chatId}
                  today={today}
                  onPress={() => open(c.id)}
                  onDelete={() => confirm(t('history.deleteTitle'), t('history.delete'), () => chat.deleteChat(c.id))}
                  divider={i < chat.chats.length - 1}
                />
              ))}
            </Card>
            <AppText variant="footnote" muted center>
              {t('history.note')}
            </AppText>
            <Button
              title={t('history.deleteAll')}
              variant="ghost"
              onPress={() => confirm(t('history.deleteAllTitle'), t('history.deleteAll'), chat.deleteAll)}
            />
          </>
        ) : (
          <AppText muted center style={styles.empty}>
            {t('history.empty')}
          </AppText>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: tokens.space.lg, gap: tokens.space.md },
  empty: { paddingTop: tokens.space.xxl, paddingHorizontal: tokens.space.lg },
}));
