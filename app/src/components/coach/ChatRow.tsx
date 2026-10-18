import { SymbolView } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { useTheme } from '@/hooks/useTheme';
import type { ChatSummary } from '@/state/chat/types';
import { makeStyles } from '@/theme/makeStyles';
import { addDays, toISODate, type ISODate } from '@/utils/dates';
import { formatDay, formatTimeOf } from '@/utils/format';

import { AppText } from '../ui/AppText';

interface ChatRowProps {
  chat: ChatSummary;
  /** The chat open in the Coach: a check. */
  open: boolean;
  today: ISODate;
  onPress: () => void;
  /** The screen asks first. */
  onDelete: () => void;
  divider?: boolean;
}

/**
 * One chat in the Coach's history: its first question and when its last answer came (the time today, "Yesterday", or
 * the date). Tap to open it; swipe left for Delete, or long-press (VoiceOver: the Delete action).
 */
export function ChatRow({ chat, open, today, onPress, onDelete, divider }: ChatRowProps) {
  const { t, i18n } = useTranslation('coach');
  const { colors } = useTheme();
  const styles = useStyles();
  const day = toISODate(new Date(chat.updatedAt));
  const when =
    day === today ? formatTimeOf(chat.updatedAt, i18n.language) : day === addDays(today, -1) ? t('history.yesterday') : formatDay(day, i18n.language);
  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      overshootRight={false}
      containerStyle={divider && styles.divider}
      renderRightActions={(_progress, _translation, swipeable) => (
        <Pressable
          onPress={() => {
            swipeable.close();
            onDelete();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('history.delete')}
          style={({ pressed }) => [styles.delete, pressed && styles.deletePressed]}
        >
          <SymbolView name="trash.fill" size={18} tintColor={colors.onPrimary} />
          <AppText variant="caption" style={styles.deleteText}>
            {t('history.delete')}
          </AppText>
        </Pressable>
      )}
    >
      <Pressable
        onPress={onPress}
        onLongPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={`${chat.title}, ${when}`}
        accessibilityState={{ selected: open }}
        accessibilityActions={[{ name: 'delete', label: t('history.delete') }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'delete') onDelete();
        }}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.text}>
          <AppText numberOfLines={1}>{chat.title}</AppText>
          <AppText variant="footnote" muted>
            {when}
          </AppText>
        </View>
        {open ? <SymbolView name="checkmark" size={15} weight="semibold" tintColor={colors.primary} /> : null}
      </Pressable>
    </ReanimatedSwipeable>
  );
}

const useStyles = makeStyles(({ colors, tokens }) => ({
  // Opaque: the Delete button waits behind the row until it is swiped.
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.space.md,
    paddingHorizontal: tokens.space.lg,
    paddingVertical: tokens.space.md,
    backgroundColor: colors.surface,
  },
  pressed: { backgroundColor: colors.surfaceAlt },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  text: { flex: 1, gap: 2 },
  delete: { width: 88, alignItems: 'center', justifyContent: 'center', gap: 2, backgroundColor: colors.danger },
  deletePressed: { opacity: 0.85 },
  deleteText: { color: colors.onPrimary, fontWeight: tokens.font.weight.semibold },
}));
