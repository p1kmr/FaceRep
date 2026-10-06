import { useContext } from 'react';

import { SettingsDispatchContext, SettingsStateContext } from '@/state/settings/SettingsProvider';

export function useSettingsState() {
  const state = useContext(SettingsStateContext);
  if (!state) throw new Error('useSettingsState must be used inside <SettingsProvider>');
  return state;
}

export function useSettingsDispatch() {
  const dispatch = useContext(SettingsDispatchContext);
  if (!dispatch) throw new Error('useSettingsDispatch must be used inside <SettingsProvider>');
  return dispatch;
}

export function useSettings() {
  return useSettingsState().settings;
}
