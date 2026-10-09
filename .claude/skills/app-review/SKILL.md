---
name: app-review
description: Check a FaceRep change against Apple's App Review Guidelines before it ships, and say clearly when something would be rejected. Use when adding or changing a feature, screen, text or translation, the paywall or subscriptions, a permission, notifications, data sent to the Worker or a third party, the AI Coach, a package or SDK, screenshots, the icon or App Store text; before a build or a submission; and when asked whether something is allowed on the App Store.
---

# App Review check (FaceRep)

The rules live in `docs/app-review.md` (§1 by area, §2 the automatic check, §3 the 1.0 audit). This skill is the
procedure for using them.

1. **List what the change touches**: files, user-visible texts (all six languages), data that leaves the iPhone,
   permissions, purchases, server responses, store metadata, screenshots.
2. **Go through every matching area in `docs/app-review.md` §1.** Read the real code and text; don't assume. For words,
   read the translations too: a translation is never stronger than the English.
3. **Run the checks:**
   - from `app/`: `npm run review:check`, then `npm run lint && npm run typecheck && npm test`;
   - from `worker/`, if the Worker changed: `npm test`.
4. **List the follow-ups the change causes** (the same change does them, or docs/publish-todo.md lists them for the
   owner):
   - new data or a new third party: the consent screen, the privacy page (`worker/src/pages.js`, then deploy), App
     Privacy in App Store Connect, `privacyManifests` in `app.json`, the review notes;
   - a new paid feature: the PREMIUM list in docs/store-listing.md, the review notes, the Premium label on screenshots;
   - a new permission: the purpose string in all six `app/locales-native/*.json`, asked only when used;
   - a changed screen shown in the screenshots: re-capture (store-screenshots/README.md);
   - anything in the binary (icon, `app.json`, native code, texts): it only reaches the store with a new build.
5. **Unsure, or a rule seems missing?** Fetch https://developer.apple.com/app-store/review/guidelines/ and compare the
   "Last Updated" date with the one in `docs/app-review.md`. Quote the rule you rely on. If Apple changed something,
   update `docs/app-review.md` (and the check, if words are involved).
6. **Report**:
   - either "App Review: no issues found", plus the areas you checked;
   - or each issue with its guideline number, where it is (`file:line`) and the fix. Fix code and text issues in the
     same change.

**Don't just agree.** If the owner asks for something that would be rejected, say so with the number and offer the
allowed version. Examples:
- "say it removes a double chin" (1.4.1, 2.3.1) → describe the muscles it works;
- "give a free week for a 5-star review" (3.2.2(x), 5.6.1) → Apple's rating prompt only;
- "link to our website to pay less" (3.1.1) → in-app purchase only;
- "ask for notifications on the first screen" (4.5.4, 5.1.1(iv)) → ask when a reminder is turned on;
- "add analytics" (CLAUDE.md, 5.1.2) → don't; if it's ever needed, the owner decides, and the labels and policy change
  first.

Never weaken `app/scripts/review-check.js` to make a change pass. Reword the text instead, or add an honest exact
sentence to `ALLOWED`, with a reason.
