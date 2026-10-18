import type { ReactNode } from 'react';

import { ToastProvider } from '@/components/ui/toast/ToastProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';

import { ChatProvider } from './chat/ChatProvider';
import { ContentProvider } from './content/ContentProvider';
import { FaceScanProvider } from './faceScan/FaceScanProvider';
import { PremiumProvider } from './premium/PremiumProvider';
import { ProgressProvider } from './progress/ProgressProvider';
import { SettingsProvider } from './settings/SettingsProvider';

/**
 * Settings → Theme → Progress → Face scans → Premium → Content (the Premium exercises) → Chat → Toast (i18n is
 * initialised on import).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <ProgressProvider>
          <FaceScanProvider>
            <PremiumProvider>
              <ContentProvider>
                <ChatProvider>
                  <ToastProvider>{children}</ToastProvider>
                </ChatProvider>
              </ContentProvider>
            </PremiumProvider>
          </FaceScanProvider>
        </ProgressProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
