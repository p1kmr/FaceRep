/**
 * App configuration in one place. Only EXPO_PUBLIC_* values exist in the app (they are public by
 * design and end up in the bundle). Secret keys live only in the Worker (see worker/README.md).
 */
export const CONFIG = {
  appName: 'FaceRep',
  /** Full URL of the AI Coach endpoint, e.g. https://facerep-api.<account>.workers.dev/chat */
  aiUrl: process.env.EXPO_PUBLIC_AI_URL ?? '',
  /** RevenueCat public iOS SDK key (appl_...). Empty = purchases off (web, Expo Go): everyone is Free. */
  revenueCatIosKey: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
  /** The RevenueCat entitlement both subscription products unlock. */
  premiumEntitlement: 'premium',
  aiTimeoutMs: 30_000,
  databaseName: 'facerep.db',
} as const;
