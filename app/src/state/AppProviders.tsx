import type { ReactNode } from 'react';

import { ToastProvider } from '@/components/ui/toast/ToastProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { ChatProvider } from './chat/ChatProvider';
import { PlanProvider } from './plan/PlanProvider';
import { PremiumProvider } from './premium/PremiumProvider';
import { ProgressProvider } from './progress/ProgressProvider';
import { SettingsProvider } from './settings/SettingsProvider';

/** Settings → Theme → Progress → Premium → Plan → Chat → Toast (i18n is initialised on import). */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <ProgressProvider>
          <PremiumProvider>
            <PlanProvider>
              <ChatProvider>
                <ToastProvider>{children}</ToastProvider>
              </ChatProvider>
            </PlanProvider>
          </PremiumProvider>
        </ProgressProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
