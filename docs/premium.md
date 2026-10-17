# Premium handling (handover)

How FaceRep knows who is Premium **without any login**. Same design as Elowa, with the differences marked **(FaceRep)**.
Read this before changing purchases, the paywall, AI limits or the Worker's access check.

## The idea in one paragraph

There are no accounts. On first launch the app makes a **random ID** (a UUID, no personal data) and keeps it in the iOS
Keychain. That ID is the user's identity everywhere: RevenueCat stores purchases under it, and the Cloudflare Worker counts
free Coach answers under it. Apple handles the payment. **RevenueCat is the source of truth** for "is this ID Premium?".
The app asks RevenueCat with the public SDK key; the Worker asks again with the secret key, because anyone could call the
Worker directly. **Apple DeviceCheck** proves a request comes from the app on a real iPhone.

```
                        ┌──────────────── Apple App Store (payment, StoreKit) ───────────────┐
iPhone app ── purchase/restore (react-native-purchases, public appl_ key) ──► RevenueCat ◄────┘
  │  random appUserId (Keychain)                                                ▲
  │  POST /chat { appUserId, deviceToken, question, history, context }          │ GET /v1/subscribers/<appUserId> (sk_ key)
  └──────────────────────────────────────────────► Cloudflare Worker ───────────┘
                                                     │  D1: free_usage (per ID per month), rate_limits (per day)
                                                     ├──► Apple DeviceCheck (token validation only)
                                                     └──► Workers AI (only if access is allowed)
```

## 1. Identity: the app user ID
`app/src/services/purchases/appUserId.ts` → `ensureAppUserId()`
- v4-style UUID on first launch, saved in the app's SQLite `kv` table **and** the Keychain (`facerep.appUserId`, `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`).
- The Keychain copy survives deleting and reinstalling the app. Not synced by iCloud: a new iPhone gets a new ID, and Premium follows through **Restore**.
- The Worker only accepts IDs matching `/^[0-9a-f-]{36}$/`.
- **(FaceRep)** "Delete all data" wipes SQLite (workouts, chat, settings) but keeps the Keychain ID, so Premium keeps working.

## 2. App side
| File | Role |
|---|---|
| `services/purchases/purchases.ts` | **The only file that imports `react-native-purchases`.** Public key `EXPO_PUBLIC_RC_IOS_KEY` (via `constants/config.ts`); entitlement `premium`. |
| `services/purchases/plans.ts` | Store-neutral plans (`$rc_weekly`, `$rc_monthly`, `$rc_annual`), which ones to show, fallback prices, free-trial days, "Save X%" (yearly vs monthly). |
| `state/premium/*` | Reducer: `ready`, `isPremium`, `plans`, `appUserId`, `aiUsage`. Tests in `__tests__/reducer.test.ts`. |
| `state/premium/PremiumProvider.tsx` | Single-flight init. **Always ends with `ready`**, even offline; failures leave the user on Free. |
| `hooks/usePremium.ts`, `hooks/usePaywall.ts` | What screens read; plan cards, buy, restore, double-tap guard. |
| `components/paywall/PaywallView.tsx` | Price, period, trial and auto-renew text next to the button; Restore, Terms (Apple EULA via our page) and Privacy links. |

Rules
- `isPremium` is only written from RevenueCat results.
- Without a RevenueCat key (web, Expo Go) everything works, as Free.
- **(FaceRep)** Free: **the weekly workouts with the free exercises** (`FREE_EXERCISE_IDS`: one or two per area, none that loads the jaw), streaks and progress, 3 Coach answers a month. Premium: **every exercise**, in the weeks and in the library, and **unlimited AI Coach answers** (the Worker's `LIMITS` stop only abuse: 100 a day per app ID, far beyond normal use; the Terms mention fair use, the app never shows the number).
- `FREE_LIMITS.aiPerMonth = 3` (`constants/limits.ts`), refilled on the 1st. The app's count is for display and to open the paywall early; the Worker is the authority. A 402 `freeUsed` syncs the app to "all used".
- **(FaceRep)** AI consent (guideline 5.1.2(i)) comes before the first question, and the paywall also says the Coach uses Cloudflare Workers AI, so nobody pays before knowing where questions go.

## 2b. What the app unlocks by itself
Every exercise ships in the app (drawings, clips, texts), and the weeks are worked out on the iPhone
(`services/workout/today.ts`), so the app decides which exercises a free user gets (`isFreeExercise`). A patched app
that flips `isPremium` to true can therefore unlock the Premium exercises; it can't get unlimited Coach answers, because
the Worker asks RevenueCat itself. That trade-off is accepted: no plan has to come from the server, everything works
offline, and nothing about the workouts is sent.

## 3. Buying and restoring
Same as Elowa: Paywall → StoreKit → RevenueCat records `premium` under the app user ID. Restore on a new iPhone moves the
purchase to the new ID; this needs RevenueCat **Restore behavior = "Transfer to new App User ID"** (the default). Don't change it.

## 4. Server side: the Worker's access check
Order for every `POST /chat` (`worker/src/lib/handler.js`):
1. Method, size, strict JSON shape (`validate.js`). Bodies are never logged.
2. **Daily rate limit** in D1: 40 per ID / 120 per IP per day. IPs only as a daily HMAC. D1 down → 503 (fail closed).
3. **Access** (`access.js`):
   - **Premium?** RevenueCat REST v1 with `REVENUECAT_SECRET_KEY`. RevenueCat unreachable → 503.
   - **Free, DeviceCheck configured:** no `deviceToken` → 403; Apple says invalid → 403.
   - **Free:** D1 `free_usage` for (ID, month) ≥ 3 → 402.
4. Workers AI answers → `commit()` adds 1 to the free count. A failed model call is not counted.

**(FaceRep) DeviceCheck bits are not used.** Apple keeps one pair of bits per iPhone **per developer team, shared by all
your apps**. Elowa uses bit0 for "free answers used this month", so FaceRep only validates the token and never reads or
writes the bits. Any future app of yours must make the same choice, or agree on a shared meaning for the bits.

Status codes the app understands (`app/src/services/ai/client.ts`): 429 `rateLimited`, 402 `freeUsed`, 403 `device`, other `server`, network `offline`, no URL `notConfigured`.

### Switches
| Worker secret / var | If missing |
|---|---|
| `AI` binding + `AI_MODEL` | 503 `unconfigured` |
| `REVENUECAT_SECRET_KEY` (`sk_…`) | `/chat`: **gate open**, everyone gets unlimited Coach answers (only daily limits). Don't ship like this. |
| `DEVICECHECK_KEY`, `DEVICECHECK_KEY_ID`, `APPLE_TEAM_ID` | No iPhone check |
| `IP_HASH_SECRET` | IP hash falls back to plain SHA-256 (weaker) |

## 5. Keys: what lives where
| Key | Where | Secret? |
|---|---|---|
| RevenueCat public SDK key `appl_…` (FaceRep's own project) | `EXPO_PUBLIC_RC_IOS_KEY` in `app/eas.json` | No |
| RevenueCat secret key `sk_…` | Worker secret `REVENUECAT_SECRET_KEY` | **Yes** |
| DeviceCheck `.p8` | Worker secret `DEVICECHECK_KEY` | **Yes** |
| Worker URL | `EXPO_PUBLIC_AI_URL` in `app/eas.json` | No |

⚠️ The cloud environment these files were written in has Elowa's `EXPO_PUBLIC_AI_URL` and `EXPO_PUBLIC_RC_IOS_KEY` set. FaceRep needs its own values.

## 6. Store setup (outside the code)
- App Store Connect: subscription group **FaceRep Premium** with three plans, attached to the first app version:

  | Plan | Product ID | Price | Trial | Why |
  |---|---|---|---|---|
  | Weekly | `facerep_premium_weekly` | **$1.99** | none | A short try. About $8.60 a month if kept (52 weeks ÷ 12). |
  | Monthly | `facerep_premium_monthly` | **$3.99** | none | Less than half the cost of paying weekly. |
  | Yearly | `facerep_premium_yearly` | **$29.99** | 7 days free | About $2.50 a month, 37% under monthly. Pre-selected. |

  Rank them in the group Yearly, Monthly, Weekly (Apple uses the order for upgrades and downgrades). Other
  countries: Apple's price equalization from the US price, or set them by hand.
- App Store Connect status (2026-10-08, written through the RevenueCat MCP): all three are **READY_TO_SUBMIT**.
  Prices in all 175 territories (Apple's equalization from the US price, so not the same number everywhere:
  Yearly is €34.99 in the eurozone and £29.99 in the UK; "Save X%" is computed from each storefront's prices).
  The 1-week free trial is live in every territory. Names and descriptions, and the group name "FaceRep Premium",
  in en-US, es-MX, es-ES, pt-BR, de-DE, fr-FR and it. Review notes and a review screenshot (the paywall rendered
  from the web build at 1290×2796; replace it with an iPhone screenshot from a TestFlight build if you like).
  The first subscriptions must be submitted together with app version 1.0.
- Paywall rules for the weekly plan: it shows only its billed price ("$1.99 per week", never a per-month figure
  that could read as the price); it has no trial; "Save X%" on yearly is measured against **monthly**, never weekly
  (vs weekly it would say 71%, which would be a misleading anchor). A plan the store doesn't return is hidden
  (`visiblePlanIds`), so the app can ship before the weekly product exists in App Store Connect.
- RevenueCat (**done via MCP**, monthly/yearly 2026-10-07, weekly 2026-10-08): project **FaceRep** (`proj88dfbdbb`),
  App Store app `com.p1kmr.facerep`, entitlement `premium` on products **`facerep_premium_weekly`**,
  **`facerep_premium_monthly`** and **`facerep_premium_yearly`**, current offering `default` with `$rc_weekly`,
  `$rc_monthly` and `$rc_annual`. RevenueCat has the App Store Connect API key and the In-App Purchase key; the
  Worker has the **v1 secret key** (`REVENUECAT_SECRET_KEY`).
- The App Store Connect product IDs must be exactly `facerep_premium_weekly`, `facerep_premium_monthly` and
  `facerep_premium_yearly`.
- Prices and "Save X%" come from the store; `FALLBACK_PRICES` only show while loading and never claim a trial.

## 7. Known limits
- No cross-device sync of workout history (on-device by design); Premium moves with Restore.
- `isPremium` can be faked on a jailbroken phone; that unlocks the Premium exercises (they ship in the app, §2b), never the unlimited Coach, which the Worker checks with RevenueCat.
- RevenueCat outage = no Coach for anyone (503).
- Free-count months are UTC on the server and local in the app; the server wins.
- Without DeviceCheck bits, someone who erases the iPhone (wiping the Keychain) gets 3 new free answers. Acceptable.

## 8. Tests
- App: `state/premium/__tests__/reducer.test.ts`, `services/purchases/__tests__/*.test.ts`, `services/ai/__tests__/client.test.ts`, `state/chat/__tests__/reducer.test.ts`, `services/workout/__tests__/today.test.ts` (the free exercises only, without Premium).
- Worker (`cd worker && npm test`): `test/access.test.js` (Premium, free count, DeviceCheck token), `test/chat.test.js` (handler, model fallback, prompt rules, rate limits, pages), `test/catalog.test.js` (the Coach's exercise list matches the app).
