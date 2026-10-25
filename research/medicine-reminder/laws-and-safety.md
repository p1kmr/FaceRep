# Laws and safety

Not legal advice: this says where the lines are so the design stays on the safe side. Get the one-hour regulatory
consult (README §4) before launch.

## 1. Is it a medical device?
Everywhere the test is the **intended purpose**: what the app, its store text and its marketing say it does. The App
Store Connect declaration (apple-rules.md §3) is a public "No" for the US, UK and EU, so this section is what keeps it
true.

| Region | What the rules say | What it means here |
|---|---|---|
| US (FDA) | "Software functions that keep track of medications and provide user-configured reminders for improved medication adherence" are on FDA's enforcement-discretion list: low risk, FDA doesn't enforce device rules. Looking up a pill by the shape, color or imprint the user types is listed as not a device | Reminders the person configures. The scan is data entry that the person confirms ("user-configured") |
| EU (MDR; MDCG 2019-11 rev. 1, June 2025; Borderline Manual, September 2025) | No example for reminder apps. Software that acts on data beyond storing, communicating or simple search, for an individual patient's care, can be a device; clinical calculators are devices "even where the calculations are simple" | Store, remind, copy the label. Never calculate, recommend or interpret |
| UK (MHRA) | Dose calculators and prescribing aids (contraindications, interactions, excessive doses; the CJEU's Snitem v Philips case) are devices; purely administrative software is unlikely to be | Same |

**What would make it a device** (leave out, or plan a regulatory route first): dose calculation (mg to tablets,
weight-based, tapering), "this dose is too high", interaction or contraindication checks, telling people what to do
after a missed dose, changing schedules from symptoms or measurements, and treatment claims for a condition.

**The intended-purpose sentence** for the store text, the review notes and the Terms: "<App> helps you remember to take
your medicines the way your doctor or pharmacist told you. It does not give medical advice."

## 2. Privacy laws for health data
The rule of thumb: if nothing leaves the iPhone, the developer collects nothing and most duties shrink. Everything
changes the day data goes to a server (sync, cloud AI, analytics, crash reports).

| Where | Law | When it applies | What it asks |
|---|---|---|---|
| US | FTC Health Breach Notification Rule (amended, in force 29 July 2024) | Health apps not covered by HIPAA. An app that can draw health data from more than one source (the person plus the Health app) can be a "personal health record" | Sharing without permission counts as a breach (an analytics SDK sending health data is enough); notify within 60 days; penalties per violation (GoodRx paid $1.5M in 2023) |
| US, Washington State (others have similar laws) | My Health My Data Act (since 31 March 2024) | Collecting or processing "consumer health data" | Separate consent to collect and to share, a separate health-data privacy policy, deletion rights; people can sue |
| US | HIPAA | Only doctors, insurers, pharmacies and their vendors | Not a consumer app, unless a pharmacy or clinic partner comes in |
| EU/EEA, UK | GDPR / UK GDPR, Article 9 (health is a special category) | Processing by us: server, sync, cloud AI | Explicit consent, contracts with processors, transfer rules, usually an impact assessment |
| India | DPDP Act 2023 and DPDP Rules (13 November 2025; main duties from about 13 May 2027) | Digital personal data | Notice and consent, breach reporting, people's rights |
| Japan | APPI | Medical history is "special care-required" information | Consent before collecting it |
| Brazil | LGPD | Health is sensitive data | Specific, highlighted consent |
| Canada, Australia | PIPEDA; Privacy Act (health information is sensitive) | Collection | Consent, security |

**Consequence:** version 1 is local-only. Later, sync means end-to-end encryption; cloud AI means text only (never the
photo), names removed, explicit consent (5.1.2(i)) and a processing contract, with a consent screen like FaceRep's
Coach.

## 3. Safety rules for the design
1. **The scan fills in, the person decides.** The photo shows a highlight for each field, unsure fields are marked, and
   nothing is saved without Save.
2. **Never guess unclear directions.** "As directed", "as needed", "1–2 tablets", "every 4–6 hours": the person sets the
   times. As-needed medicines get a log button, not reminders.
3. **Copy, don't explain.** "Take with food" shows as the label's own note. No medical explanations, no side effects.
4. **No advice after a missed dose:** "Not sure what to do? Check the leaflet or ask your pharmacist." (in all six
   languages, never stronger than the English).
5. **Lock screen privacy:** notifications don't name medicines unless the person turns that on (4.5.4).
6. **Reminders never stop because of money.** If Premium ends, every reminder keeps firing.
7. **Time zones and daylight saving:** keep the person's clock times; after travel, ask (like Apple Health).
8. **Losing data is a safety problem:** confirm before deleting, offer an export, work offline.
9. **"Check with your doctor or pharmacist"** in onboarding and Settings → Safety (1.4.1), like FaceRep's safety points.
10. **No children's doses,** no "for kids" marketing.
11. **Tests for the schedule math:** daylight saving, month ends, every N hours across midnight, cycles, end dates
    (pure engine, like FaceRep's `workout/timer.ts` tests).
12. **Words:** no promises or numbers in claims ("never miss a dose again", "improves adherence by 50%"). A
    `review:check` word list like FaceRep's catches them in all six languages.

## Sources
- [FDA: examples of software functions under enforcement discretion](https://www.fda.gov/medical-devices/device-software-functions-including-mobile-medical-applications/examples-software-functions-which-fda-will-exercise-enforcement-discretion) (example 11),
  [FDA: examples of software functions that are not devices](https://www.fda.gov/medical-devices/device-software-functions-including-mobile-medical-applications/examples-software-functions-are-not-medical-devices)
- [MDCG 2019-11 rev. 1 summary](https://gmpinsiders.com/mdcg-2019-11-rev1-mdr-ivdr/),
  [EU Borderline Manual update, September 2025](https://health.ec.europa.eu/latest-updates/update-manual-borderline-and-classification-under-regulations-eu-2017745-and-2017746-september-2025-2025-09-12_en),
  [software examples from the update](https://quickbirdmedical.com/en/news/eu-borderline-manual-updated-software-examples/)
- [MHRA software guidance (CMS summary)](https://cms.law/en/gbr/legal-updates/mhra-releases-updated-guidance-on-medical-device-software-and-apps)
- [FTC Health Breach Notification Rule (Inside Privacy)](https://www.insideprivacy.com/health-privacy/ftc-issues-final-rule-to-expand-scope-of-the-health-breach-notification-rule/),
  [Morrison Foerster](https://www.mofo.com/pdf/resources/insights/240514-ftc-issues-final-rule-to-expand)
- [Washington My Health My Data Act (Fenwick)](https://www.fenwick.com/insights/publications/washingtons-my-health-my-data-act-a-roadmap-for-compliance),
  [private right of action (BakerHostetler)](https://www.bakerlaw.com/insights/examining-the-private-right-of-action-in-washingtons-my-health-my-data-act)
- [India DPDP Rules notified, phased (Exterro)](https://www.exterro.com/resources/india-notifies-final-dpdpa-rules-phased-enforcement-begins),
  [PIB document](https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf)
