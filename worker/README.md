# FaceRep API (Cloudflare Worker)

Three jobs:
- `POST /content` and `GET /content/files/…`: the Premium exercises (texts in every language, drawings, clips), which
  are never in the app. `/content` checks Premium with RevenueCat and hands out the list (`pack.json`) and a token that
  is valid for an hour; each file needs the token. The files are this Worker's private static assets, built into
  `.content/` by `npm run content` (it runs before `npm run deploy` and `npm run dev`) from the app's
  `assets/guides/` and `content/locales/<lang>/exercises.json` (`src/lib/content.js`, `scripts/content.js`,
  docs/premium.md §2b). Free users' Coach names only the free exercises.
- `POST /chat`: the AI Coach. With the user's reminder list it can also propose reminder changes (function calling, `src/lib/reminders.js`), and it can propose saving a workout the user did without the app or a short routine to start (`src/lib/workouts.js`); the app shows each for the user to confirm. Receives a question (+ the last few turns and an anonymous training context), checks it, applies daily limits and the Premium / free-allowance check, asks a **Workers AI** model and returns a cleaned-up answer.
- `GET /privacy`, `/terms`, `/support`: the public pages App Store Connect asks for (`src/pages.js`), so no separate website is needed.

```
iPhone app ──(question + anonymous context)──► Cloudflare Worker ──► Workers AI (model runs on Cloudflare)
                                                 • strict input check (validate.js)
                                                 • fair-use ceiling: 100/day per app ID, 300/day per IP (D1)
                                                 • Premium? RevenueCat REST (secret key)
                                                 • free: 3 answers/month per app ID; DeviceCheck token must be valid
```

| Where | What | Cost at the start |
|---|---|---|
| **Cloudflare Workers** | Runs the API | Free plan: ~100k requests/day |
| **Cloudflare D1** | Counters only (never question text, never raw IPs) | Free plan |
| **Workers AI** | The model (`@cf/google/gemma-4-26b-a4b-it`, fallback `@cf/zai-org/glm-4.7-flash`) | 10,000 free neurons/day, then $0.011 per 1,000 neurons. One Coach answer is roughly $0.0002 |

No third-party AI key: the model is called through the `AI` binding. Cloudflare states it does not train on customer content sent to Workers AI.

---

## One-time setup (about 15 minutes)

Every command runs from `worker/` with `npx` (nothing global).

### A. Cloudflare
```bash
cd worker
npm install
npx wrangler login                       # opens the browser once
# Already done on 2026-10-07 (D1 "facerep-limits" created, tables applied, id in wrangler.jsonc):
# npx wrangler d1 create facerep-limits && npm run db:migrate
npx wrangler secret put IP_HASH_SECRET   # paste any long random text
```
In `wrangler.jsonc` → `vars`: set `APP_NAME` (your final app name), `SUPPORT_EMAIL` (a dedicated inbox; it is public), optionally `LEGAL_NAME`.

```bash
npm run deploy    # prints https://facerep-api.<your-subdomain>.workers.dev
```
Open `/privacy`, `/terms`, `/support` on that URL to check the pages.

### B. Point the app at it
- Done: `app/eas.json` → `EXPO_PUBLIC_AI_URL` = `https://facerep-api.elowa-app.workers.dev/chat` and FaceRep's own `EXPO_PUBLIC_RC_IOS_KEY`; `app/src/constants/links.ts` → `SITE`.
- Done: support address `kindcodelabs@gmail.com` in `links.ts` (`supportEmail`) and `wrangler.jsonc` (`SUPPORT_EMAIL`).
- Local dev: `app/.env` (copy `app/.env.example`).

> ⚠️ This cloud environment has **Elowa's** `EXPO_PUBLIC_AI_URL` and `EXPO_PUBLIC_RC_IOS_KEY` set as environment variables. FaceRep must never use those: give FaceRep its own values (expo.dev → project → Environment variables, and `eas.json`).

### C. Test it
```bash
curl -X POST "https://facerep-api.<your-subdomain>.workers.dev/chat" -H "Content-Type: application/json" \
  -d '{"appUserId":"0f8fad5b-d9cb-469f-a165-70867728950e","locale":"en","question":"How do I do mewing correctly?","history":[],"context":{"goal":"jawline","streak":2,"workoutsLast7Days":3}}'
```
Logs: Cloudflare dashboard → Workers & Pages → `facerep-api` → **Logs** (outcomes only, never request bodies).

### D. Premium and free limits (do this before release)

Until this is done, anyone who finds the URL can use the Coach (only the daily limits stop them).

1. **RevenueCat secret key**: RevenueCat → FaceRep project → API keys → **+ New secret API key** (API **v1**, name `facerep-worker`):
   ```bash
   npx wrangler secret put REVENUECAT_SECRET_KEY    # sk_... never in the app or the repo
   ```
2. **DeviceCheck key**: developer.apple.com → Keys → **+** → name `FaceRep DeviceCheck`, tick **DeviceCheck** → download the `.p8` (once!) and note the Key ID:
   ```bash
   npx wrangler secret put DEVICECHECK_KEY_ID
   npx wrangler secret put DEVICECHECK_KEY < AuthKey_XXXXXXXXXX.p8
   ```
   Set `APPLE_TEAM_ID` in `wrangler.jsonc`. You can reuse the Elowa DeviceCheck key (keys are per team).

   **Different from Elowa:** FaceRep only *validates* the token (proves a real iPhone running the app). It never reads or
   writes the two DeviceCheck bits, because Apple keeps one pair of bits per iPhone **per developer team, shared by all your
   apps**, and Elowa already uses bit0 for its free answers. The free count is per app ID, which lives in the Keychain and
   survives reinstalls.
3. `npm run deploy`.

Turn on step 2 only once the app build that sends DeviceCheck tokens is the one people use (the Simulator and old builds send no token and free users would get "couldn't verify this iPhone"; Premium is never affected).

## Settings you can change without an app update

`wrangler.jsonc` → `vars`, then `npm run deploy`:

| Variable | Default | Meaning |
|---|---|---|
| `AI_MODEL` | `@cf/google/gemma-4-26b-a4b-it` | Main model |
| `AI_FALLBACK_MODEL` | `@cf/zai-org/glm-4.7-flash` | Tried once when the main model fails or is slower than 15 s |
| `AI_MAX_OUTPUT_TOKENS` | `700` | Answer length cap |
| `APP_NAME` | `FaceRep` | Shown in the Coach's persona and on the legal pages |
| `SUPPORT_EMAIL` | `kindcodelabs@gmail.com` | Support address, shown on the legal pages |
| `LEGAL_NAME` | empty (optional) | Your name or business; empty shows "the developer of FaceRep" |

The free allowance is `FREE_PER_MONTH` in `src/lib/access.js` and must match `FREE_LIMITS.aiPerMonth` in the app.
The free days are `FREE_DAYS` in `src/pages.js` (the Terms) and must match `WEEKS.freeDays` in the app.

**Premium exercises:** a new or changed Premium exercise (texts in `content/locales/<lang>/exercises.json`, pictures
and clip in `app/assets/guides/`) reaches the apps with the next `npm run deploy`; the apps pick it up within a day
(only the changed files download). Each download is one request plus one per file (about 80 per picture set), on the
same daily request allowance as the Coach.

## Develop and test locally
```bash
npm test                     # no accounts needed (it also checks the Premium pack is complete)
npm run content              # builds .content/ (the Premium exercises) by itself
npx wrangler dev --remote    # Workers AI needs Cloudflare; --remote runs against your account
```
