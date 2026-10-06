import { useProgressState } from './useProgress';
import { useSettingsState } from './useSettings';

/** True once every persisted store has loaded; the splash screen stays up until then. */
export function useHydration(): boolean {
  const { hydrated: settings } = useSettingsState();
  const { hydrated: progress } = useProgressState();
  return settings && progress;
}
