// Renders endcard.html into endcard_base.png (background, icon, name, tagline) and
// endcard_pill.png (transparent: "Available on the App Store" + search line).
// Run from the repo root: node promo-sample/reel/render_endcard.js   (needs Playwright + Chromium)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const dir = __dirname;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(dir, 'endcard.html'));
  await page.evaluate(() => document.fonts.ready);
  for (const mode of ['base', 'pill']) {
    await page.evaluate((m) => {
      document.body.className = m;
      document.querySelector('.layer-base').style.display = m === 'base' ? '' : 'none';
      document.querySelector('.layer-pill').style.display = m === 'pill' ? '' : 'none';
    }, mode);
    await page.waitForTimeout(150);
    await page.screenshot({ path: path.join(dir, `endcard_${mode}.png`), omitBackground: mode === 'pill' });
  }
  await browser.close();
})();
