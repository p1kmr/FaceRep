import { useContext } from 'react';

import { ChatContext } from '@/state/chat/ChatProvider';

export function useChat() {
  const value = useContext(ChatContext);
  if (!value) throw new Error('useChat must be used inside <ChatProvider>');
  return value;
}
