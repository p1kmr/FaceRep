import { CONFIG } from '@/constants/config';

import { parsePack, type Pack } from './pack';

/** premium: the Worker says this app ID has no active subscription (RevenueCat), so it sends nothing. */
export type ContentError = 'notConfigured' | 'offline' | 'premium' | 'rateLimited' | 'server';

export class ContentRequestError extends Error {
  constructor(readonly kind: ContentError) {
    super(kind);
  }
}

export interface PackReply {
  pack: Pack;
  /** For the file downloads, valid until `expires` (ms). */
  token: string;
  expires: number;
}

/** Where one pack file is downloaded from (with the token). */
export const fileUrl = (path: string) => `${CONFIG.contentUrl}/files/${path}`;

/**
 * Asks our Worker for the Premium exercises. The Worker checks the subscription with RevenueCat itself, so a patched
 * app still gets nothing. Only the random app ID is sent.
 */
export async function requestPack(appUserId: string, fetchImpl: typeof fetch = fetch): Promise<PackReply> {
  if (!CONFIG.contentUrl) throw new ContentRequestError('notConfigured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.contentTimeoutMs);
  let response: Response;
  try {
    response = await fetchImpl(CONFIG.contentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appUserId }),
      signal: controller.signal,
    });
  } catch {
    throw new ContentRequestError('offline');
  } finally {
    clearTimeout(timer);
  }
  if (response.status === 402) throw new ContentRequestError('premium');
  if (response.status === 429) throw new ContentRequestError('rateLimited');
  if (!response.ok) throw new ContentRequestError('server');
  const body = (await response.json().catch(() => null)) as { pack?: unknown; token?: unknown; expires?: unknown } | null;
  const pack = parsePack(body?.pack);
  if (!pack || typeof body?.token !== 'string' || !body.token || typeof body.expires !== 'number') throw new ContentRequestError('server');
  return { pack, token: body.token, expires: body.expires };
}
