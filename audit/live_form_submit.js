const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const base = process.env.AUDIT_LIVE_BASE || 'https://kamlaelectrodes.com/';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const targets = ['become-a-dealer.html', 'contact.html', 'get-a-quote.html'];
const report = { timestamp, base, submissions: [] };

async function fillRequired(form) {
  const controls = form.locator('[required]');
  for (let i = 0; i < await controls.count(); i += 1) {
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
    else if (name.includes('minimum_monthly_purchase_quantity')) value = '300 boxes/month';
    else if (name.includes('quantity')) value = '50 boxes';
    else if (name.includes('territory')) value = 'Meerut and surrounding markets — live form audit only';
    else if (name.includes('current_lines')) value = 'Welding consumables and industrial products';
    else if (name.includes('message')) value = `Automated live website form test at ${timestamp}. Please ignore.`;
    await control.fill(value);
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    colorScheme: 'dark',
    locale: 'en-IN',
  });

  let failures = 0;
  for (const file of targets) {
    const page = await context.newPage();
    const subject = `[TEST] KE Website Audit — ${file} — ${timestamp}`;
    const entry = { file, subject, accepted: false, responseStatus: null, responseBody: '', statusText: '', finalUrl: '' };
    try {
      const url = new URL(file, base);
      url.searchParams.set('qa', timestamp);
      const initial = await page.goto(url.toString(), { waitUntil: 'domcontentloaded', timeout: 45000 });
      if (!initial || initial.status() >= 400) throw new Error(`Page returned HTTP ${initial ? initial.status() : 'no response'}`);
      await page.waitForTimeout(600);

      const form = page.locator('form[action*="web3forms.com/submit"]').first();
      if (!await form.count()) throw new Error('Web3Forms form not found');
      await fillRequired(form);
      await form.evaluate((element, value) => {
        const subjectField = element.querySelector('[name="subject"]');
        if (subjectField) subjectField.value = value;
        let fromName = element.querySelector('[name="from_name"]');
        if (!fromName) {
          fromName = document.createElement('input');
          fromName.type = 'hidden';
          fromName.name = 'from_name';
          element.appendChild(fromName);
        }
        fromName.value = 'KamlaElectrodes.com Website Audit';
      }, subject);

      const responsePromise = page.waitForResponse(response => response.url().includes('api.web3forms.com/submit'), { timeout: 45000 });
      await form.locator('[type="submit"]').click();
      const response = await responsePromise;
      entry.responseStatus = response.status();
      entry.responseBody = (await response.text().catch(() => '')).slice(0, 1500);
      await page.waitForTimeout(1200);
      entry.statusText = await form.locator('.form-status').textContent().catch(() => '') || '';
      entry.finalUrl = page.url();

      let payload = null;
      try { payload = JSON.parse(entry.responseBody); } catch (_) {}
      entry.accepted = Boolean(
        response.ok() && (
          payload?.success === true ||
          /thank you|success|submitted|sent/i.test(entry.statusText) ||
          /thank-you\.html/i.test(entry.finalUrl)
        )
      );
      if (!entry.accepted) {
        failures += 1;
        entry.error = `Submission not confirmed; HTTP ${entry.responseStatus}; status text: ${entry.statusText || '(blank)'}`;
      }
    } catch (error) {
      failures += 1;
      entry.error = error.stack || error.message;
      entry.finalUrl = page.url();
    } finally {
      report.submissions.push(entry);
      await page.close();
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(process.cwd(), 'live-form-submission-report.json'), JSON.stringify(report, null, 2));
  for (const item of report.submissions) {
    console.log(`${item.accepted ? '[ACCEPTED]' : '[FAILED]'} ${item.subject}`);
    console.log(`  HTTP: ${item.responseStatus}; status: ${item.statusText || '(blank)'}`);
    if (item.error) console.error(`  ${item.error}`);
  }
  if (failures) process.exit(1);
})();
