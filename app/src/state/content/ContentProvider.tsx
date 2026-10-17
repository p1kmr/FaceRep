import { createContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react';

import { shownGuide } from '@/constants/exerciseImages';
import { usePremium } from '@/hooks/usePremium';
import { useSettings } from '@/hooks/useSettings';
import { addPremiumTexts } from '@/i18n';
import { fileUrl, requestPack } from '@/services/content/contentApi';
import { contentStore } from '@/services/content/store';
import { syncContent, type SyncDeps } from '@/services/content/sync';

import { contentDownloading, contentFailed, contentFile, contentLoaded, contentReady, type ContentAction } from './actions';
import { contentReducer, initialContentState } from './reducer';
import type { ContentState } from './types';

export const ContentStateContext = createContext<ContentState | null>(null);
export const ContentDispatchContext = createContext<Dispatch<ContentAction> | null>(null);

const DEPS: SyncDeps = { store: contentStore, request: (id) => requestPack(id), addTexts: addPremiumTexts, fileUrl, now: () => Date.now() };

/**
 * The Premium exercises (services/content): while the user has Premium, they come from the device and, when something
 * is missing or a day has passed, from the Worker. Runs again for another guide, after a purchase or restore, and on
 * Try again. Without Premium nothing is asked and nothing shows.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contentReducer, initialContentState);
  const { ready, isPremium, appUserId } = usePremium();
  const guide = shownGuide(useSettings().guide);

  useEffect(() => {
    if (!ready || !isPremium || !appUserId) return;
    let cancelled = false;
    const tell = (action: ContentAction) => {
      if (!cancelled) dispatch(action);
    };
    syncContent({ appUserId, guide }, DEPS, {
      loaded: (pack, sources) => tell(contentLoaded(pack, sources)),
      downloading: (progress) => tell(contentDownloading(progress)),
      file: (path, source, progress) => tell(contentFile(path, source, progress)),
      ready: () => tell(contentReady()),
      failed: (error) => tell(contentFailed(error)),
      cancelled: () => cancelled,
    }).catch(() => tell(contentFailed('server')));
    return () => {
      cancelled = true;
    };
  }, [ready, isPremium, appUserId, guide, state.attempt]);

  return (
    <ContentStateContext.Provider value={state}>
      <ContentDispatchContext.Provider value={dispatch}>{children}</ContentDispatchContext.Provider>
    </ContentStateContext.Provider>
  );
}
