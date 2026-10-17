import { Directory, File, Paths } from 'expo-file-system';

import { fileInfo, localName, parsePack, type PackFileInfo } from './pack';
import type { ContentStore } from './store';

/**
 * The Premium exercises on the iPhone, in the app's Caches folder: Apple's place for files the app can download again
 * (they aren't backed up; iOS may clear them when storage runs low, and the app then downloads them again).
 *   premium/pack.json                        the pack and when it was last checked
 *   premium/<guide>/<id>/<kind>-<hash>.<ext> one file per pack file (pack.ts localName)
 */
const root = () => new Directory(Paths.cache, 'premium');
const fileOf = (f: PackFileInfo) => new File(root(), f.guide, f.id, localName(f));

export const contentStore: ContentStore = {
  read() {
    try {
      const file = new File(root(), 'pack.json');
      if (!file.exists) return null;
      const saved = JSON.parse(file.textSync()) as { pack?: unknown; checkedAt?: unknown };
      const pack = parsePack(saved?.pack);
      return pack && typeof saved.checkedAt === 'number' ? { pack, checkedAt: saved.checkedAt } : null;
    } catch {
      return null;
    }
  },

  write(saved) {
    const dir = root();
    dir.create({ intermediates: true, idempotent: true });
    const file = new File(dir, 'pack.json');
    if (!file.exists) file.create();
    file.write(JSON.stringify(saved));
  },

  local(f) {
    const file = fileOf(f);
    return file.exists && file.size === f.size ? file.uri : null;
  },

  async download(f, url, token) {
    const dir = new Directory(root(), f.guide, f.id);
    dir.create({ intermediates: true, idempotent: true });
    const file = new File(dir, localName(f));
    // iOS downloads to a temporary file and moves it here only when complete, so a cut connection leaves nothing.
    await File.downloadFileAsync(url, file, { headers: { Authorization: `Bearer ${token}` }, idempotent: true });
    if (file.size !== f.size) {
      file.delete();
      throw new Error('content: wrong size');
    }
    return file.uri;
  },

  prune(pack) {
    const keep = new Set(
      pack.files
        .map(fileInfo)
        .filter((f): f is PackFileInfo => !!f)
        .map((f) => `${f.guide}/${f.id}/${localName(f)}`),
    );
    const dir = root();
    if (!dir.exists) return;
    for (const guide of dir.list()) {
      if (!(guide instanceof Directory)) continue;
      for (const exercise of guide.list()) {
        if (!(exercise instanceof Directory)) continue;
        for (const item of exercise.list()) {
          if (!keep.has(`${guide.name}/${exercise.name}/${item.name}`)) item.delete();
        }
        if (!exercise.list().length) exercise.delete();
      }
    }
  },
};
