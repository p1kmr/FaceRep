import type { ReactNode } from 'react';

import { ToastProvider } from '@/components/ui/toast/ToastProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { ChatProvider } from './chat/ChatProvider';
import { PremiumProvider } from './premium/PremiumProvider';
import { ProgressProvider } from './progress/ProgressProvider';
import { SettingsProvider } from './settings/SettingsProvider';

/** Settings → Theme → Progress → Premium → Chat → Toast (i18n is initialised on import). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <ProgressProvider>
          <PremiumProvider>
            <ChatProvider>
              <ToastProvider>{children}</ToastProvider>
            </ChatProvider>
          </PremiumProvider>
        </ProgressProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
