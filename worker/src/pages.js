/**
 * Public pages the App Store needs (privacy policy, terms, support), served by the same Worker
 * so no separate website is required. English only for v1.
 * Contact details come from Worker vars (`LEGAL_NAME`, `SUPPORT_EMAIL` in wrangler.jsonc).
 */
import { FREE_PER_MONTH } from './lib/access.js';
import { LIMITS } from './lib/ratelimit.js';

const UPDATED = 'October 9, 2026';

const escape = (text) =>
  String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function contact(env) {
  const email = escape(env.SUPPORT_EMAIL || 'support email not set');
  const app = escape(env.APP_NAME || 'FaceRep');
  return { app, name: escape(env.LEGAL_NAME || `the developer of ${app}`), email, mail: `<a href="mailto:${email}">${email}</a>` };
}

function layout(title, body, app) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · ${app}</title>
<style>
  :root { --bg: #f4f5f7; --text: #111418; --muted: #5d6672; --accent: #c7261f; --card: #ffffff; --border: #dce0e6; }
  @media (prefers-color-scheme: dark) { :root { --bg: #0b0d10; --text: #f2f4f7; --muted: #9aa3af; --accent: #ff6b66; --card: #15181d; --border: #2a2f37; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 17px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  main { max-width: 720px; margin: 0 auto; padding: 32px 16px 64px; }
  h1 { font-size: 30px; line-height: 1.2; margin: 0 0 4px; }
  h2 { font-size: 20px; margin: 32px 0 8px; }
  p, li { color: var(--text); }
  .muted { color: var(--muted); font-size: 15px; }
  a { color: var(--accent); }
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px 20px; margin: 16px 0; }
  table { width: 100%; border-collapse: collapse; font-size: 15px; }
  th, td { text-align: left; vertical-align: top; padding: 8px; border-top: 1px solid var(--border); }
  nav { display: flex; gap: 16px; margin-bottom: 24px; font-size: 15px; }
</style>
</head>
<body><main>
<nav><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/support">Support</a></nav>
${body}
</main></body>
</html>`;
}

function privacy(env) {
  const c = contact(env);
  return layout(
    'Privacy policy',
    `<h1>Privacy policy</h1>
<p class="muted">Last updated ${UPDATED}</p>

<div class="card">
<strong>In short:</strong> ${c.app} has no account, no ads and no trackers. Your workouts, Coach chat and settings are
stored only on your iPhone. Only three things ever leave it: the questions you send to the AI Coach (after you agree), a
request for the Premium part of your workout plan (with Premium only), and the purchase details Apple and RevenueCat need to
process a subscription. We never sell or share your data for advertising.
</div>

<h2>Who we are</h2>
<p>${c.app} is published by ${c.name} ("we"). Contact: ${c.mail}. For EU and UK users, we are the data controller.</p>

<h2>Data that stays on your iPhone</h2>
<p>Your workout history (date, exercises, reps and duration), your Coach chat history, your focus area, who the exercise
pictures show (man or woman), your reminders and app settings are stored only in ${c.app}'s database on your device. We cannot see them. Reminders are scheduled locally by
iOS; their names, times and days only leave your iPhone with a Coach question (see below).</p>
<p>The optional workout mirror shows your front camera on the screen while you exercise, so you can check your form. The
picture is never recorded, saved or sent anywhere, and the camera is on only while the mirror is shown. Voice cues are
spoken by your iPhone's built-in voice, on the device. ${c.app} does not use your photos, microphone, contacts or location.</p>

<h2>Data that leaves your iPhone</h2>
<table>
<tr><th>What</th><th>When</th><th>Sent to</th><th>Why</th></tr>
<tr>
  <td><strong>Your Coach question</strong>: the text you type, the last few messages of the chat, an anonymous training
  context (your focus area, your current streak and how many workouts you did in the last 7 days), the names, times and
  days of your reminders (so the Coach can suggest changes to them, which you confirm in the app), the app language and a
  random app ID.<br><em>Please don't include your name or other details that identify you in questions.</em></td>
  <td>Only when you send a question, after you allowed the AI Coach on the consent screen</td>
  <td>Our server on Cloudflare, which has the answer written by an AI model that also runs on Cloudflare (Cloudflare
  Workers AI). The app ID and your IP address are not given to the model.</td>
  <td>To answer your question</td>
</tr>
<tr>
  <td><strong>Premium plan request</strong>: the random app ID, your focus area, your plan level and the version of the exercise list in your app (so the plan only uses exercises your app has). No workout history, and not who the exercise pictures show.</td>
  <td>With Premium only, when your plan needs Weeks 2 to 4 or a new level (about once per level; the answer is then kept on
  your iPhone)</td>
  <td>Our server on Cloudflare, which asks RevenueCat whether the app ID has an active subscription</td>
  <td>To send the Premium part of the plan only to subscribers</td>
</tr>
<tr>
  <td><strong>Purchase data</strong>: the random app ID, App Store transaction and receipt details, device and app version</td>
  <td>When you view plans, buy, or restore purchases</td>
  <td>Apple (payment) and RevenueCat (subscription management)</td>
  <td>To sell and verify Premium</td>
</tr>
</table>

<h2>What our server keeps</h2>
<p>Our server does not store your questions or the AI answers, and it never logs request contents. Cloudflare states that
it does not use customer content sent to Workers AI to train models. To prevent abuse our server keeps two daily counters:
one keyed by the random app ID and one keyed by a one-way, secret-keyed hash of your IP address (the IP itself is never
stored). They are deleted automatically after about two days. For the free plan's monthly allowance it also keeps a count of
free answers per random app ID, deleted after about two months. The same kind of daily counters limit plan requests. Cloudflare processes your IP address to deliver the request.</p>
<p>To check that a request really comes from ${c.app} on an iPhone, the app sends a one-time Apple DeviceCheck token, which
our server passes to Apple and never stores. Apple lets us keep one yes/no mark per iPhone: whether its free Coach answers
for the month are used up, so deleting and reinstalling the app doesn't reset them. The mark contains nothing about you. To
check Premium (for the Coach and for the Premium plan), our server asks RevenueCat whether the random app ID has an active
subscription.</p>

<h2>Service providers</h2>
<ul>
  <li><strong>Cloudflare, Inc.</strong>: hosts our server and runs the AI model (Workers AI).</li>
  <li><strong>RevenueCat, Inc.</strong>: manages subscriptions and purchases.</li>
  <li><strong>Apple Inc.</strong>: App Store payments, DeviceCheck (the free-answers mark above), and optional crash reports
  and app analytics you choose to share with developers in iOS settings.</li>
</ul>
<p>We share data with these providers only to run ${c.app}, and each of them protects it at least as well as this
policy describes (the same or equal protection). They may process data in the United States and other countries.
Where required, transfers rely on the providers' Standard Contractual Clauses or equivalent safeguards.</p>

<h2>Legal bases (EU/UK)</h2>
<ul>
  <li>AI Coach: your <strong>consent</strong> (Art. 6(1)(a) GDPR). You can withdraw it any time in Settings → Allow AI Coach.</li>
  <li>Purchases and the Premium plan: <strong>performance of a contract</strong> (Art. 6(1)(b)).</li>
  <li>Abuse prevention counters: our <strong>legitimate interest</strong> in keeping the service available and costs under control (Art. 6(1)(f)).</li>
</ul>

<h2>Your choices and rights</h2>
<ul>
  <li><strong>Delete your data:</strong> Settings → Delete all data, or delete the app. This erases your workouts, chat and
  settings from your iPhone. A random app ID stays in the iPhone's Keychain so your subscription keeps working.</li>
  <li><strong>Stop AI processing:</strong> turn off Settings → Allow AI Coach. ${c.app} then sends no Coach questions to our server.</li>
  <li><strong>Subscriptions:</strong> manage or cancel in your Apple Account settings.</li>
  <li>Depending on where you live, you may have rights to access, correct, delete or port your data, to object or restrict
  processing, and to complain to your data protection authority. Because we don't keep an account or your workout data,
  most requests are fulfilled by the in-app controls above; for anything else, email ${c.mail}.</li>
</ul>

<h2>AI-generated images</h2>
<p>The exercise drawings and the photos in ${c.app} are AI-generated and show fictional people.</p>

<h2>Children</h2>
<p>${c.app} is not directed to children under 13, and we do not knowingly collect data from them.</p>

<h2>Not medical advice</h2>
<p>${c.app} is a fitness and wellness app. It does not diagnose or treat any condition. The AI Coach gives general tips and
can be wrong.</p>

<h2>Changes</h2>
<p>If we change this policy, we'll update this page and the date above.</p>`,
    c.app,
  );
}

function terms(env) {
  const c = contact(env);
  return layout(
    'Terms of use',
    `<h1>Terms of use</h1>
<p class="muted">Last updated ${UPDATED}</p>

<p>These terms apply to the ${c.app} app, published by ${c.name}. By using ${c.app} you agree to them and to
<a href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/">Apple's Standard License Agreement (EULA)</a>.
If the two conflict, Apple's EULA applies.</p>

<h2>Exercise safety and no medical advice</h2>
<p>${c.app} offers general facial exercises for fitness and wellness. It is <strong>not a medical device</strong> and does
not diagnose, treat or prevent any condition. Exercises can tone muscles and improve posture; they do not change bone
structure, and results differ from person to person. Move gently and stop right away if anything hurts. If you have jaw
pain, clicking or a jaw joint problem (TMJ), or any medical condition, ask a doctor or dentist before doing jaw exercises.
AI Coach answers are generated automatically and may be wrong.</p>

<h2>Premium subscriptions and purchases</h2>
<ul>
  <li>Premium is offered as auto-renewing weekly, monthly and yearly subscriptions. Prices are shown in the app before you buy.</li>
  <li>Week 1 of the 28-day plan and every single exercise are free. Premium adds Weeks 2 to 4, Levels 2 and 3 and up to
  ${LIMITS.perUser} AI Coach answers a day. The Premium part of the plan is loaded from our server, so the first time
  it needs an internet connection.</li>
  <li>Payment is charged to your Apple Account at confirmation of purchase.</li>
  <li>Subscriptions renew automatically unless cancelled at least 24 hours before the end of the current period. Your account is charged for renewal within 24 hours before the end of the period.</li>
  <li>You can manage and cancel subscriptions in your Apple Account settings after purchase.</li>
  <li>If a free trial is offered, any unused part of it is forfeited when you buy a subscription.</li>
  <li>Refunds are handled by Apple under its policies.</li>
</ul>

<h2>Free Coach answers and fair use</h2>
<p>Without Premium you get ${FREE_PER_MONTH} AI Coach answers per month; with Premium, up to ${LIMITS.perUser} a day. These limits keep the
service available for everyone. We may
change or discontinue AI features, for example if a provider changes its service.</p>

<h2>Your data</h2>
<p>Your workouts and chat stay on your device. See our <a href="/privacy">privacy policy</a>.</p>

<h2>Acceptable use</h2>
<p>Don't misuse the app or our server, for example by automating requests, trying to bypass limits, or reverse engineering
the service beyond what the law allows.</p>

<h2>Liability</h2>
<p>${c.app} is provided "as is". To the extent the law allows, we are not liable for indirect or consequential damages, or
for injuries from exercises done against the safety guidance. Nothing in these terms limits rights you have under consumer
protection laws that cannot be waived.</p>

<h2>Changes and contact</h2>
<p>We may update these terms; the date above shows the latest version. Questions: ${c.mail}.</p>`,
    c.app,
  );
}

function support(env) {
  const c = contact(env);
  return layout(
    'Support',
    `<h1>${c.app} support</h1>
<p>Questions, bugs or feedback? Email ${c.mail}. We usually reply within 2 business days.</p>

<h2>Common questions</h2>
<p><strong>Where is my data?</strong> Only on your iPhone. ${c.app} has no account, so we can't recover it for you.</p>
<p><strong>Restore Premium.</strong> Settings → Restore purchases, signed in with the same Apple Account you bought with. This
also moves Premium to a new iPhone.</p>
<p><strong>Cancel a subscription.</strong> iPhone Settings → your name → Subscriptions → ${c.app}.</p>
<p><strong>The reminder doesn't show.</strong> Check iPhone Settings → Notifications → ${c.app}, and that the reminder is on in ${c.app} → Settings.</p>
<p><strong>Report an AI answer.</strong> Long-press the answer in the Coach, or email ${c.mail}.</p>
<p><strong>Delete everything.</strong> Settings → Delete all data, or delete the app.</p>

<p class="muted">${c.app} is a fitness and wellness app, not medical advice.
<a href="/privacy">Privacy policy</a> · <a href="/terms">Terms of use</a></p>`,
    c.app,
  );
}

const PAGES = { '/privacy': privacy, '/terms': terms, '/support': support };

/** Returns an HTML Response for a public page, or null if the path isn't one. */
export function renderPage(pathname, env) {
  const page = PAGES[pathname.replace(/\/+$/, '') || '/'] ?? (pathname === '/' ? support : null);
  if (!page) return null;
  return new Response(page(env), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'",
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
