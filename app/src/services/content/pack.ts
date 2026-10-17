import { EXERCISES, isExerciseId, isFreeExercise, type ExerciseId } from '@/constants/exercises';
import type { ExerciseImages, GuideId } from '@/constants/guides';
import { SUPPORTED_LANGUAGES } from '@/constants/i18n';

/**
 * The Premium exercises as the Worker sends them after it has asked RevenueCat (POST /content, worker/scripts/content.js):
 * their texts in every language and their drawings and clips. They are never in the app, so a patched app that claims
 * Premium still has none of them. Everything here is pure; services/content/store keeps the pack on the iPhone.
 */

/** One exercise's texts in one language, the same shape as exercises:items.<key> in the app's locales. */
export interface ExerciseText {
  name: string;
  cue: string;
  steps: string[];
}

/** One file: "<guide>/<exercise id>/<relaxed|exercise|thumb>.webp" or ".../clip.mp4", its size and content hash. */
export interface PackFile {
  path: string;
  hash: string;
  size: number;
}

export interface Pack {
  v: 1;
  /** Changes whenever a text or a file changes. */
  version: string;
  /** language → i18n key (EXERCISES[id].key) → texts. */
  texts: Record<string, Record<string, ExerciseText>>;
  files: PackFile[];
}

export type FileKind = 'relaxed' | 'exercise' | 'thumb' | 'clip';

export interface PackFileInfo extends PackFile {
  guide: GuideId;
  id: ExerciseId;
  kind: FileKind;
}

const PATH = /^(man|woman)\/(\d{2}-[a-z]+(?:-[a-z]+)*)\/(?:(relaxed|exercise|thumb)\.webp|(clip)\.mp4)$/;
const HASH = /^[0-9a-f]{12}$/;
const LIMITS = { files: 400, fileBytes: 25_000_000, textChars: 300, stepChars: 500, steps: 10 };

/** A pack file's guide, exercise and kind; null for anything that isn't a Premium exercise's file. */
export function fileInfo(f: PackFile): PackFileInfo | null {
  const m = PATH.exec(f.path);
  if (!m || !isExerciseId(m[2]) || isFreeExercise(m[2])) return null;
  return { ...f, guide: m[1] as GuideId, id: m[2], kind: (m[3] ?? m[4]) as FileKind };
}

const isText = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

function parseText(v: unknown): ExerciseText | null {
  const t = v as Partial<ExerciseText> | null;
  if (!t || typeof t !== 'object' || !isText(t.name, LIMITS.textChars) || !isText(t.cue, LIMITS.textChars)) return null;
  if (!Array.isArray(t.steps) || !t.steps.length || t.steps.length > LIMITS.steps || !t.steps.every((s) => isText(s, LIMITS.stepChars))) return null;
  return { name: t.name, cue: t.cue, steps: [...t.steps] };
}

/** The i18n keys of the Premium exercises: the only texts a pack may bring. */
const PREMIUM_KEYS = new Set(Object.values(EXERCISES).filter((e) => !isFreeExercise(e.id)).map((e) => e.key));

/**
 * The pack, checked like everything else from a server: unknown languages, exercises and files are dropped, never
 * shown. Null when its shape is wrong.
 */
export function parsePack(value: unknown): Pack | null {
  const p = value as Partial<Pack> | null;
  if (!p || typeof p !== 'object' || p.v !== 1 || typeof p.version !== 'string' || !HASH.test(p.version)) return null;
  if (!p.texts || typeof p.texts !== 'object' || !Array.isArray(p.files) || p.files.length > LIMITS.files) return null;
  const texts: Pack['texts'] = {};
  for (const lang of SUPPORTED_LANGUAGES) {
    const items = (p.texts as Record<string, unknown>)[lang];
    if (!items || typeof items !== 'object') continue;
    texts[lang] = {};
    for (const [key, item] of Object.entries(items as Record<string, unknown>)) {
      const text = PREMIUM_KEYS.has(key) ? parseText(item) : null;
      if (text) texts[lang][key] = text;
    }
  }
  const files = p.files.filter(
    (f): f is PackFile =>
      !!f &&
      typeof f === 'object' &&
      typeof f.path === 'string' &&
      typeof f.hash === 'string' &&
      HASH.test(f.hash) &&
      Number.isInteger(f.size) &&
      f.size > 0 &&
      f.size <= LIMITS.fileBytes &&
      !!fileInfo(f),
  );
  return { v: 1, version: p.version, texts, files: files.map(({ path, hash, size }) => ({ path, hash, size })) };
}

/** One guide's files. */
export const filesOf = (pack: Pack, guide: GuideId): PackFileInfo[] =>
  pack.files.map(fileInfo).filter((f): f is PackFileInfo => !!f && f.guide === guide);

/** The name a file is kept under: with its hash, so a changed file is a new download and the old one can go. */
export const localName = (f: PackFileInfo) => `${f.kind}-${f.hash}.${f.kind === 'clip' ? 'mp4' : 'webp'}`;

/** Share of a guide's bytes that are on the device, 0 to 1 (1 when there is nothing to get). */
export function progressOf(files: readonly PackFileInfo[], sources: Readonly<Record<string, string>>): number {
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (!total) return 1;
  return files.reduce((sum, f) => sum + (sources[f.path] ? f.size : 0), 0) / total;
}

/**
 * Each Premium exercise of a guide whose pictures (and clip, when it has one) are on the device and whose texts are in
 * the pack, as the app's ExerciseImages. An exercise missing anything is left out: it shows locked until it's there.
 */
export function packImages(pack: Pack, guide: GuideId, sources: Readonly<Record<string, string>>): Partial<Record<ExerciseId, ExerciseImages>> {
  const byId = new Map<ExerciseId, Partial<Record<FileKind, string>>>();
  const wanted = new Map<ExerciseId, Set<FileKind>>();
  for (const f of filesOf(pack, guide)) {
    wanted.set(f.id, (wanted.get(f.id) ?? new Set()).add(f.kind));
    const source = sources[f.path];
    if (source) byId.set(f.id, { ...byId.get(f.id), [f.kind]: source });
  }
  const out: Partial<Record<ExerciseId, ExerciseImages>> = {};
  const english = pack.texts.en ?? {};
  for (const [id, kinds] of wanted) {
    const got = byId.get(id) ?? {};
    const complete = kinds.has('relaxed') && kinds.has('exercise') && kinds.has('thumb') && [...kinds].every((k) => got[k]);
    if (!complete || !english[EXERCISES[id].key]) continue;
    out[id] = {
      relaxed: { uri: got.relaxed },
      exercise: { uri: got.exercise },
      thumb: { uri: got.thumb },
      ...(got.clip ? { clip: got.clip } : {}),
    };
  }
  return out;
}
