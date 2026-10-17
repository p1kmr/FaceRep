/**
 * App configuration in one place. Only EXPO_PUBLIC_* values exist in the app (they are public by
 * design and end up in the bundle). Secret keys live only in the Worker (see worker/README.md).
 */
const AI_URL = process.env.EXPO_PUBLIC_AI_URL ?? '';
/** The same Worker serves the Premium exercises: https://…/chat → https://…/content. */
const CONTENT_URL = AI_URL.endsWith('/chat') ? `${AI_URL.slice(0, -'/chat'.length)}/content` : '';

export const CONFIG = {
  appName: 'FaceRep',
  /** Full URL of the AI Coach endpoint, e.g. https://facerep-api.<account>.workers.dev/chat */
  aiUrl: AI_URL,
  /** RevenueCat public iOS SDK key (appl_...). Empty = purchases off (web, Expo Go): everyone is Free. */
  revenueCatIosKey: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
  /** The RevenueCat entitlement both subscription products unlock. */
  premiumEntitlement: 'premium',
  aiTimeoutMs: 30_000,
  /**
   * POST: the Premium exercises' pack and a download token, after the Worker checked Premium with RevenueCat. Each file
   * is then GET <contentUrl>/files/<path> with the token.
   */
  contentUrl: CONTENT_URL,
  /** For the pack request. */
  contentTimeoutMs: 20_000,
  /** With every Premium exercise on the iPhone, the Worker is asked again for updates at most this often. */
  contentRefreshMs: 24 * 60 * 60 * 1000,
  /** Files downloaded at the same time. */
  contentParallel: 4,
  databaseName: 'facerep.db',
} as const;
