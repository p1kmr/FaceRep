const fs = require('node:fs');
const path = require('node:path');

const { DIR, SOUNDS, files } = require('../sounds');

describe('beeps', () => {
  it('are the files scripts/sounds.js makes (npm run sounds), one for each beep', () => {
    expect(fs.readdirSync(DIR).sort()).toEqual(Object.keys(SOUNDS).map((name) => `${name}.wav`).sort());
    for (const [name, data] of files()) expect(fs.readFileSync(path.join(DIR, name)).equals(data)).toBe(true);
  });
});
