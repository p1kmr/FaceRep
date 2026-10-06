import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/** False while the app is in the background (pause animations to save battery). */
export function useAppActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setActive(s === 'active'));
    return () => sub.remove();
  }, []);
  return active;
}
