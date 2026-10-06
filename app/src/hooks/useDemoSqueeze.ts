import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

/** Flips between relaxed and squeeze every `ms` (exercise previews). Off with Reduce Motion. */
export function useDemoSqueeze(ms = 1800): boolean {
  const reduceMotion = useReducedMotion();
  const [squeeze, setSqueeze] = useState(false);
  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(() => setSqueeze((s) => !s), ms);
    return () => clearInterval(timer);
  }, [ms, reduceMotion]);
  return squeeze;
}
