import type { Pack, PackFileInfo } from './pack';

/** The pack as kept on the device, and when the Worker was last asked for it (ms). */
export interface SavedPack {
  pack: Pack;
  checkedAt: number;
}

/** Where the Premium exercises are kept. iPhone: store.native.ts (files in Caches). Web: this file (memory). */
export interface ContentStore {
  read(): SavedPack | null;
  write(saved: SavedPack): void;
  /** Where a pack file already is on the device, or null when it has to be downloaded. */
  local(f: PackFileInfo): string | null;
  /** Gets one file with the download token; resolves to where it is now (a file URI, or a URL on the web). */
  download(f: PackFileInfo, url: string, token: string): Promise<string>;
  /** Deletes kept files the pack no longer lists (an updated drawing or clip). */
  prune(pack: Pack): void;
}

let saved: SavedPack | null = null;

/**
 * The web build (store screenshots, browser checks) has no file system: the pack stays in memory for the session and
 * the pictures load from the Worker with the token in the URL (a web picture can't send a header).
 */
export const contentStore: ContentStore = {
  read: () => saved,
  write: (next) => {
    saved = next;
  },
  local: () => null,
  download: async (_f, url, token) => `${url}?t=${encodeURIComponent(token)}`,
  prune: () => {},
};
