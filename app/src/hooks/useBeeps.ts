import { useEffect } from 'react';

import { beeps } from '@/services/beeps';

/** Keeps the beeps loaded while `on` (Sound cues → Beeps on a workout or face scan screen); frees them after. */
export function useBeeps(on: boolean) {
  useEffect(() => {
    if (!on) return;
    beeps.load();
    return () => beeps.unload();
  }, [on]);
}
