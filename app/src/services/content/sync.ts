import { CONFIG } from '@/constants/config';
import type { GuideId } from '@/constants/guides';

import { ContentRequestError, type ContentError, type PackReply } from './contentApi';
import { fileInfo, filesOf, progressOf, type Pack, type PackFileInfo } from './pack';
import type { ContentStore } from './store';

export interface SyncDeps {
  store: ContentStore;
  request: (appUserId: string) => Promise<PackReply>;
  /** Puts the texts into i18n before anything can show them. */
  addTexts: (texts: Pack['texts']) => void;
  fileUrl: (path: string) => string;
  now: () => number;
}

/** What the sync tells the app as it goes (state/content dispatches each one). */
export interface SyncEvents {
  loaded(pack: Pack, sources: Record<string, string>): void;
  downloading(progress: number): void;
  file(path: string, source: string, progress: number): void;
  ready(): void;
  failed(error: ContentError): void;
  /** True once the app no longer wants this sync (another guide, Premium ended): it stops telling. */
  cancelled(): boolean;
}

/** Every pack file already on the device: path → where it is. */
function localSources(store: ContentStore, pack: Pack): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of pack.files.map(fileInfo)) {
    const source = f && store.local(f);
    if (f && source) out[f.path] = source;
  }
  return out;
}

/** Runs `job` on each item, at most `parallel` at a time; rejects on the first failure. */
async function inBatches<T>(items: readonly T[], parallel: number, job: (item: T) => Promise<void>) {
  let next = 0;
  const lane = async () => {
    while (next < items.length) await job(items[next++]);
  };
  await Promise.all(Array.from({ length: Math.min(parallel, items.length) }, lane));
}

/**
 * Makes the Premium exercises of `guide` available (only call it with Premium):
 * 1. what the device has shows at once (works offline);
 * 2. the Worker is asked when something is missing, or at most once a day for updates (it checks RevenueCat);
 * 3. missing or changed files download, old ones are deleted.
 * A failure with every file of the guide on the device still ends `ready`: only something missing is a failure.
 */
export async function syncContent({ appUserId, guide }: { appUserId: string; guide: GuideId }, deps: SyncDeps, on: SyncEvents) {
  const saved = deps.store.read();
  if (saved) {
    deps.addTexts(saved.pack.texts);
    on.loaded(saved.pack, localSources(deps.store, saved.pack));
  }
  const complete = !!saved && filesOf(saved.pack, guide).every((f) => deps.store.local(f));
  if (saved && complete && deps.now() - saved.checkedAt < CONFIG.contentRefreshMs) return on.ready();

  on.downloading(saved ? progressOf(filesOf(saved.pack, guide), localSources(deps.store, saved.pack)) : 0);
  let reply: PackReply;
  try {
    reply = await deps.request(appUserId);
  } catch (e) {
    if (on.cancelled()) return;
    return complete ? on.ready() : on.failed(e instanceof ContentRequestError ? e.kind : 'server');
  }
  if (on.cancelled()) return;
  deps.store.write({ pack: reply.pack, checkedAt: deps.now() });
  deps.addTexts(reply.pack.texts);
  const sources = localSources(deps.store, reply.pack);
  on.loaded(reply.pack, sources);

  const files = filesOf(reply.pack, guide);
  try {
    await inBatches(
      files.filter((f) => !sources[f.path]),
      CONFIG.contentParallel,
      async (f: PackFileInfo) => {
        if (on.cancelled()) return;
        sources[f.path] = await deps.store.download(f, deps.fileUrl(f.path), reply.token);
        if (!on.cancelled()) on.file(f.path, sources[f.path], progressOf(files, sources));
      },
    );
  } catch {
    if (!on.cancelled()) on.failed('offline');
    return;
  }
  if (on.cancelled()) return;
  deps.store.prune(reply.pack);
  on.ready();
}
