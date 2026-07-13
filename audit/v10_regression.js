const { chromium } = require('playwright');
const fs = require('fs');

const base = process.env.AUDIT_LOCAL_BASE || 'http://127.0.0.1:4173/';
const findings = [];
const checks = [];
let stage = 'initialisation';

function fail(page, message) {
  findings.push(`${page}: ${message}`);
}

function writeReport(error = null) {
  fs.writeFileSync('v10-regression-report.json', JSON.stringify({
    base,
    stage,
    checks,
    findings,
    error: error ? (error.stack || error.message || String(error)) : null
  }, null, 2));
}

async function openPage(context, file) {
  stage = `open ${file}`;
  const page = await context.newPage();
  const response = await page.goto(new URL(file, base).toString(), { waitUntil: 'networkidle', timeout: 30000 });
  if (!response || response.status() >= 400) fail(file, `HTTP ${response ? response.status() : 'no response'}`);
  return page;
}

(async () => {
  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_CHANNEL) launchOptions.channel = process.env.PLAYWRIGHT_CHANNEL;
  const browser = await chromium.launch(launchOptions);

  stage = 'light menu';
  const light = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
  let page = await openPage(light, 'index.html');
  await page.locator('.site-menu-button').click();
  const lightMenu = await page.locator('.site-menu-panel').evaluate(el => getComputedStyle(el).backgroundImage);
  const lightLink = await page.locator('.site-menu-links a').first().evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundImage }));
  if (/37, 45, 58|43, 51, 65|#252d3a|#2b3341/i.test(lightMenu)) fail('index.html', 'Light-mode menu retained a dark-mode panel background');
  if (/rgb\(244, 233, 233\)|rgb\(247, 249, 252\)/i.test(lightLink.color)) fail('index.html', 'Light-mode menu link text remained light');
  checks.push({ check: 'light menu', lightMenu, lightLink });
  await page.close();

  stage = 'contact and facility fallback';
  page = await openPage(light, 'contact.html');
  const contactStyle = await page.locator('.contact-team-card').evaluate(el => ({ position: getComputedStyle(el).position, overflowY: getComputedStyle(el).overflowY, maxHeight: getComputedStyle(el).maxHeight }));
  if (contactStyle.position === 'sticky') fail('contact.html', 'Contact team card is still sticky');
  if (contactStyle.overflowY === 'auto' || contactStyle.overflowY === 'scroll') fail('contact.html', 'Contact team card still has an independent scroll container');
  if ((await page.locator('body').innerText()).includes('anonymous priority numbers')) fail('contact.html', 'Internal comparison wording remains public');
  const facilityButton = page.locator('.facility-photo-button').first();
  if (await facilityButton.count() === 0) {
    fail('contact.html', 'Facility picture fallback button was not created');
  } else {
    const sourceState = await facilityButton.evaluate(el => {
      const img = el.querySelector('img');
      const source = el.querySelector('source[type="image/webp"]');
      const imgSrc = img ? (img.getAttribute('src') || '') : '';
      const webpSrc = source ? (source.getAttribute('srcset') || '') : '';
      return {
        hasJpegFallback: /^data:image\/jpeg/i.test(imgSrc) || /\.jpe?g(?:$|[?#])/i.test(imgSrc),
        hasWebPSource: /\.webp/i.test(webpSrc)
      };
    });
    if (!sourceState.hasJpegFallback) fail('contact.html', 'Facility fallback is not a JPEG source');
    if (!sourceState.hasWebPSource) fail('contact.html', 'Facility picture does not expose a WebP source');
    await facilityButton.click();
    if (await page.locator('.image-lightbox:not([hidden])').count() !== 1) fail('contact.html', 'Facility image lightbox did not open');
  }
  checks.push({ check: 'contact and facility fallback', contactStyle });
  await page.close();

  stage = 'R&D image text';
  page = await openPage(light, 'research-development.html');
  const visualText = await page.locator('.editorial-visual .visual-copy h3').evaluate(el => ({ color: getComputedStyle(el).color, shadow: getComputedStyle(el).textShadow }));
  if (!/rgb\(255, 255, 255\)/.test(visualText.color)) fail('research-development.html', 'Image caption heading is not white');
  if (visualText.shadow === 'none') fail('research-development.html', 'Image caption lacks contrast reinforcement');
  checks.push({ check: 'R&D image text', visualText });
  await page.close();

  stage = 'product table';
  page = await openPage(light, 'products.html');
  const productText = await page.locator('table').innerText();
  if (/8 Gauge Short/i.test(productText)) fail('products.html', 'Market nickname remains in the technical size table');
  const rows = await page.locator('table tbody tr').allTextContents();
  const shortRow = rows.find(row => /4\.00\s*[×x]\s*350\s*mm/i.test(row));
  if (!shortRow || !/140[–-]180\s*A/i.test(shortRow)) fail('products.html', '4.00 × 350 mm does not use the full-length current range');
  checks.push({ check: 'product table', shortRow });
  await page.close();

  stage = 'dark menu';
  const dark = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  page = await openPage(dark, 'index.html');
  await page.locator('.site-menu-button').click();
  const darkLink = await page.locator('.site-menu-links a').first().evaluate(el => ({ color: getComputedStyle(el).color, background: getComputedStyle(el).backgroundImage }));
  if (!/rgb\(247, 249, 252\)|rgb\(244, 233, 233\)|rgb\(255, 255, 255\)/i.test(darkLink.color)) fail('index.html', 'Dark-mode menu link text is not light');
  checks.push({ check: 'dark menu', darkLink });
  await page.close();

  await light.close();
  await dark.close();
  await browser.close();

  stage = 'complete';
  writeReport();
  if (findings.length) {
    findings.forEach(item => console.error(`- ${item}`));
    process.exit(1);
  }
  console.log('V10 regression audit passed.');
})().catch(error => {
  writeReport(error);
  console.error(`V10 regression crashed during ${stage}:`, error);
  process.exit(1);
});
