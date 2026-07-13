const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const base = process.env.AUDIT_LOCAL_BASE || 'http://127.0.0.1:4173/';
const pages = fs.readdirSync(root).filter(name => name.endsWith('.html')).sort();
const expectedMenuHref = new Map([
  ['index.html', 'index.html'], ['about.html', 'about.html'], ['products.html', 'products.html'],
  ['dealer-locator.html', 'dealer-locator.html'], ['contact.html', 'contact.html'],
  ['quality-standards.html', 'quality-standards.html'], ['quality.html', 'quality-standards.html'],
  ['infrastructure.html', 'infrastructure.html'], ['industries-served.html', 'industries-served.html'],
  ['research-development.html', 'research-development.html'], ['case-study.html', 'case-study.html'],
  ['csr.html', 'csr.html'], ['technical-resources.html', 'technical-resources.html'],
  ['download-product-data.html', 'download-product-data.html'], ['get-a-quote.html', 'get-a-quote.html'],
  ['become-a-dealer.html', 'become-a-dealer.html'], ['faq.html', 'faq.html'],
  ['privacy-policy.html', 'privacy-policy.html'], ['terms-and-conditions.html', 'terms-and-conditions.html'],
  ['official-notice.html', 'official-notice.html']
]);
const menuOptionalPages = new Set(['404.html', 'thank-you.html']);
const errors = [];
const results = [];

function record(page, message) {
  errors.push(`${page}: ${message}`);
}

async function fillRequiredFields(page) {
  const controls = page.locator('form[action*="web3forms.com/submit"] [required]');
  const count = await controls.count();
  for (let i = 0; i < count; i += 1) {
    const control = controls.nth(i);
    const tag = await control.evaluate(el => el.tagName.toLowerCase());
    const type = (await control.getAttribute('type') || '').toLowerCase();
    const name = (await control.getAttribute('name') || '').toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
      await control.check();
      continue;
    }
    if (tag === 'select') {
      const values = await control.locator('option').evaluateAll(options => options.map(option => option.value).filter(Boolean));
      if (values.length) await control.selectOption(values[0]);
      continue;
    }
    let value = 'Website audit test';
    if (type === 'email' || name.includes('email')) value = 'contact@kamlaelectrodes.com';
    else if (type === 'tel' || name.includes('phone')) value = '9999999999';
    else if (name.includes('company')) value = 'Kamla Electrodes Website QA';
    else if (name.includes('location')) value = 'Meerut, Uttar Pradesh 250001';
    else if (name.includes('quantity')) value = '300 boxes/month';
    else if (name.includes('territory')) value = 'Meerut and surrounding markets — browser audit only';
    else if (name.includes('current_lines')) value = 'Welding consumables and industrial products';
    else if (name.includes('message')) value = 'Automated browser form test. Please ignore.';
    await control.fill(value);
  }
}

(async () => {
  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_CHANNEL) launchOptions.channel = process.env.PLAYWRIGHT_CHANNEL;
  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });

  for (const file of pages) {
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error' && !/favicon|ERR_BLOCKED_BY_CLIENT|Failed to load resource/i.test(msg.text())) {
        pageErrors.push(`console: ${msg.text()}`);
      }
    });

    await page.route('https://api.web3forms.com/**', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Browser audit accepted' }) });
    });

    const url = new URL(file === 'index.html' ? '' : file, base).toString();
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (!response || response.status() >= 400) {
        record(file, `HTTP ${response ? response.status() : 'no response'}`);
        continue;
      }
      await page.waitForTimeout(250);

      const title = await page.title();
      if (!title.trim()) record(file, 'Missing title');

      const menuButton = page.locator('.site-menu-button');
      const menuButtonCount = await menuButton.count();
      if (menuButtonCount !== 1 && !menuOptionalPages.has(file)) {
        record(file, `Expected exactly one site menu button, found ${menuButtonCount}`);
      }
      if (menuButtonCount === 1) {
        await menuButton.click();
        const menu = page.locator('.site-menu-links');
        await menu.waitFor({ state: 'visible', timeout: 5000 });
        const rdCount = await menu.locator('a[href="research-development.html"]').count();
        const caseCount = await menu.locator('a[href="case-study.html"]').count();
        if (rdCount !== 1) record(file, `R&D menu link count is ${rdCount}, expected 1`);
        if (caseCount !== 1) record(file, `Case-study menu link count is ${caseCount}, expected 1`);
        const currentLinks = await menu.locator('a[aria-current="page"]').count();
        const expectedHref = expectedMenuHref.get(file);
        const expectedCurrent = expectedHref ? 1 : 0;
        if (currentLinks !== expectedCurrent) record(file, `Current menu link count is ${currentLinks}, expected ${expectedCurrent}`);
        if (expectedCurrent && currentLinks) {
          const currentHref = await menu.locator('a[aria-current="page"]').first().getAttribute('href');
          if (currentHref !== expectedHref) record(file, `Current menu href is ${currentHref}, expected ${expectedHref}`);
        }
        await page.locator('.site-menu-close').click();
      }

      const facility = page.locator('.plant-photo,.office-photo');
      const facilityCount = await facility.count();
      for (let i = 0; i < facilityCount; i += 1) {
        const node = facility.nth(i);
        const info = await node.evaluate(el => {
          const webpSource = el.querySelector ? el.querySelector('source[type="image/webp"]') : null;
          const fallbackImage = el.querySelector ? el.querySelector('img') : null;
          const src = el.getAttribute('src') || '';
          const background = getComputedStyle(el).backgroundImage || '';
          const pictureSource = webpSource ? (webpSource.getAttribute('srcset') || '') : '';
          const fallback = fallbackImage ? (fallbackImage.getAttribute('src') || '') : '';
          return {
            hasWebP: /\.webp/i.test(`${src} ${background} ${pictureSource}`),
            isPictureButton: el.classList.contains('facility-photo-button'),
            hasJpegFallback: /^data:image\/jpeg/i.test(fallback) || /\.jpe?g(?:$|[?#])/i.test(fallback)
          };
        });
        if (!info.hasWebP) record(file, 'Facility image does not expose a WebP source');
        if (info.isPictureButton && !info.hasJpegFallback) {
          record(file, 'Facility picture button does not expose a JPEG fallback');
        }
      }

      const form = page.locator('form[action*="web3forms.com/submit"]');
      if (await form.count()) {
        await fillRequiredFields(page);
        const status = form.locator('.form-status');
        await form.locator('[type="submit"]').click();
        await page.waitForTimeout(300);
        const statusText = await status.textContent();
        if (!/thank you|sent/i.test(statusText || '')) record(file, `Intercepted form did not report success: ${statusText || '(blank)'}`);
      }

      if (file === 'dealer-locator.html') {
        const searchButton = page.locator('#searchDealers');
        if (await searchButton.count()) {
          await page.locator('#dealerQuery').fill('Meerut');
          await searchButton.click();
          await page.waitForTimeout(350);
          const countText = await page.locator('#dealerCount').textContent();
          if (!countText || /loading/i.test(countText)) record(file, 'Distribution search remained in loading state');
        }
      }

      pageErrors.forEach(message => record(file, message));
      results.push({ file, title, forms: await form.count(), facilityCount });
    } catch (error) {
      record(file, error.stack || error.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(root, 'browser-audit-report.json'), JSON.stringify({ base, pages: results, errors }, null, 2));
  console.log(`Browser pages checked: ${results.length}`);
  if (errors.length) {
    console.error(`Browser audit errors: ${errors.length}`);
    errors.forEach(error => console.error(`- ${error}`));
    process.exit(1);
  }
  console.log('Browser audit passed.');
})();
