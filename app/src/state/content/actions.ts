import type { ContentError } from '@/services/content/contentApi';
import type { Pack } from '@/services/content/pack';

export const CONTENT_LOADED = 'content/loaded';
export const CONTENT_DOWNLOADING = 'content/downloading';
export const CONTENT_FILE = 'content/file';
export const CONTENT_READY = 'content/ready';
export const CONTENT_FAILED = 'content/failed';
export const CONTENT_RETRY = 'content/retry';

export type ContentAction =
  | { type: typeof CONTENT_LOADED; payload: { pack: Pack; sources: Record<string, string> } }
  | { type: typeof CONTENT_DOWNLOADING; payload: { progress: number } }
  | { type: typeof CONTENT_FILE; payload: { path: string; source: string; progress: number } }
  | { type: typeof CONTENT_READY }
  | { type: typeof CONTENT_FAILED; payload: { error: ContentError } }
  | { type: typeof CONTENT_RETRY };

/** A pack (from the device or the Worker) and which of its files are on the device. */
export const contentLoaded = (pack: Pack, sources: Record<string, string>): ContentAction => ({ type: CONTENT_LOADED, payload: { pack, sources } });
export const contentDownloading = (progress: number): ContentAction => ({ type: CONTENT_DOWNLOADING, payload: { progress } });
export const contentFile = (path: string, source: string, progress: number): ContentAction => ({
  type: CONTENT_FILE,
  payload: { path, source, progress },
});
export const contentReady = (): ContentAction => ({ type: CONTENT_READY });
export const contentFailed = (error: ContentError): ContentAction => ({ type: CONTENT_FAILED, payload: { error } });
/** Try again after a failed download. */
export const retryContent = (): ContentAction => ({ type: CONTENT_RETRY });
