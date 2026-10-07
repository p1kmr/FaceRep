// Writes the free week (Level 1, days 1–7) into the app, which ships it so Week 1 works offline.
// Run after changing lib/plan.js: npm run plan:export (a test fails while the two differ).
import { writeFileSync } from 'node:fs';

import { freeWeek } from '../src/lib/plan.js';

const target = new URL('../../app/src/constants/planFreeWeek.json', import.meta.url);
writeFileSync(target, `${JSON.stringify(freeWeek(), null, 2)}\n`);
console.log(`Wrote ${target.pathname}`);
