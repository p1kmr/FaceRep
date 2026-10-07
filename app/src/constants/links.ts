/**
 * Public pages, served by the FaceRep Worker (`worker/src/pages.js`). The same URLs go into
 * App Store Connect (Privacy Policy URL, Support URL). Change SITE when the Worker is deployed
 * or you move to your own domain.
 */
const SITE = 'https://facerep-api.elowa-app.workers.dev';

export const LINKS = {
  privacy: `${SITE}/privacy`,
  terms: `${SITE}/terms`,
  support: `${SITE}/support`,
  /** Where "report this answer" and support mails go. TODO before release: your real support address. */
  supportEmail: 'support@example.com',
  /** Apple's own page for cancelling or changing a subscription. */
  manageSubscriptions: 'https://apps.apple.com/account/subscriptions',
} as const;
