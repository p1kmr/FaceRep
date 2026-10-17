import type { ContentError } from '@/services/content/contentApi';
import type { Pack } from '@/services/content/pack';

/** idle: nothing asked yet (or no Premium). downloading: getting the pack or files. failed: something is missing. */
export type ContentStatus = 'idle' | 'downloading' | 'ready' | 'failed';

/** The Premium exercises on this device (services/content). Only shown while the user has Premium. */
export interface ContentState {
  /** Their texts and file list: from the device first, then from the Worker. */
  pack: Pack | null;
  /** Pack files on the device: path → where it is (a file URI; a URL in the web build). */
  sources: Record<string, string>;
  status: ContentStatus;
  /** Share of the current guide's files on the device, 0 to 1. */
  progress: number;
  error: ContentError | null;
  /** Raised by Try again: the provider asks the Worker again. */
  attempt: number;
}
