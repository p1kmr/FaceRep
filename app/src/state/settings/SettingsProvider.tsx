import { createContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { setHapticsEnabled } from '@/services/haptics';
import { createDebouncedSave, load } from '@/services/storage/kv';

import { hydrateSettings, type SettingsAction } from './actions';
import { initialSettingsState, settingsReducer } from './reducer';
import type { SavedSettings, Settings, SettingsState } from './types';

const VERSION = 1;

export const SettingsStateContext = createContext<SettingsState | null>(null);
export const SettingsDispatchContext = createContext<Dispatch<SettingsAction> | null>(null);

/** Settings live in the SQLite kv table: hydrate once, then save (debounced) on every change. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialSettingsState);
  const persist = useMemo(() => createDebouncedSave<Settings>(STORAGE_KEYS.settings, VERSION), []);

  useEffect(() => {
    load<SavedSettings>(STORAGE_KEYS.settings, VERSION).then((saved) => dispatch(hydrateSettings(saved)));
  }, []);

  useEffect(() => {
    if (state.hydrated) persist(state.settings);
  }, [state.hydrated, state.settings, persist]);

  useEffect(() => {
    setHapticsEnabled(state.settings.haptics);
  }, [state.settings.haptics]);

  return (
    <SettingsStateContext.Provider value={state}>
      <SettingsDispatchContext.Provider value={dispatch}>{children}</SettingsDispatchContext.Provider>
    </SettingsStateContext.Provider>
  );
}
