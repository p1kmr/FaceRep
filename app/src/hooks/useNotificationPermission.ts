import { useEffect, useState } from 'react';

import { notificationPermission } from '@/services/notifications/reminder';

import { useAppActive } from './useAppActive';

/** Notification permission, checked again whenever the app comes back (the user may have changed it in Settings). */
export function useNotificationPermission() {
  const active = useAppActive();
  const [status, setStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  useEffect(() => {
    if (!active) return;
    notificationPermission()
      .then(setStatus)
      .catch(() => {});
  }, [active]);
  return status;
}
