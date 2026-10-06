import { useContext } from 'react';

import { ToastContext } from '@/components/ui/toast/ToastProvider';

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error('useToast must be used inside <ToastProvider>');
  return show;
}
