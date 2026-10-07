/**
 * App configuration in one place. Only EXPO_PUBLIC_* values exist in the app (they are public by
 * design and end up in the bundle). Secret keys live only in the Worker (see worker/README.md).
 */
const AI_URL = process.env.EXPO_PUBLIC_AI_URL ?? '';
const CHAT_PATH = /\/chat\/?$/;

export const CONFIG = {
  appName: 'FaceRep',
  /** Full URL of the AI Coach endpoint, e.g. https://facerep-api.<account>.workers.dev/chat */
  aiUrl: AI_URL,
  /** The Premium plan endpoint on the same Worker (…/plan next to …/chat). */
  planUrl: CHAT_PATH.test(AI_URL) ? AI_URL.replace(CHAT_PATH, '/plan') : '',
  /** RevenueCat public iOS SDK key (appl_...). Empty = purchases off (web, Expo Go): everyone is Free. */
  revenueCatIosKey: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
  /** The RevenueCat entitlement both subscription products unlock. */
  premiumEntitlement: 'premium',
  aiTimeoutMs: 30_000,
  planTimeoutMs: 15_000,
  databaseName: 'facerep.db',
} as const;
