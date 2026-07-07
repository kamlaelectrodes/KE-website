document.addEventListener('DOMContentLoaded', () => {
  const whatsappNumbers = ['919760975890', '919412205763', '918979090370'];
  const nav = document.querySelector('nav');
  const menu = document.querySelector('nav ul');
  const btn = document.querySelector('.nav-toggle');
  const primaryNav = [
    ['index.html', 'Home'],
    ['about.html', 'About'],
    ['products.html', 'Products'],
    ['dealer-locator.html', 'Find Dealer'],
    ['contact.html', 'Contact']
  ];
  const gearLinks = [
    ['quality-standards.html', 'Quality & Standards'],
    ['infrastructure.html', 'Infrastructure'],
    ['industries-served.html', 'Industries Served'],
    ['technical-resources.html', 'Technical Resources'],
    ['download-product-data.html', 'Product Data'],
    ['get-a-quote.html', 'Get a Quote'],
    ['become-a-dealer.html', 'Become a Dealer'],
    ['faq.html', 'FAQs'],
    ['privacy-policy.html', 'Privacy Policy'],
    ['terms-and-conditions.html', 'Terms & Conditions'],
    ['official-notice.html', 'Official Notice']
  ];

  if (menu) {
    menu.innerHTML = primaryNav.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('');
  }

  if (nav) {
    let navActions = nav.querySelector('.nav-actions');
    if (!navActions) {
      navActions = document.createElement('div');
      navActions.className = 'nav-actions';
      nav.appendChild(navActions);
    }
    navActions.innerHTML = '<a class="button button-primary" href="get-a-quote.html">Get a Quote</a><button class="gear-menu-button" type="button" aria-label="Open site menu" aria-expanded="false">⚙<span>Menu</span></button>';
  }

  document.querySelectorAll('.topbar .container').forEach((bar) => {
    bar.innerHTML = '<div>Meerut, Uttar Pradesh · Manufacturing since 1989</div><div><a href="tel:+919412205763">+91 94122 05763</a> · <a href="tel:+919760975890">+91 97609 75890</a></div>';
  });

  if (btn && menu) {
    btn.innerHTML = '<span>Menu</span><span aria-hidden="true">◆</span>';
    btn.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  const gearOverlay = document.createElement('div');
  gearOverlay.className = 'gear-overlay';
  gearOverlay.innerHTML = `
    <button class="gear-close" type="button" aria-label="Close menu">×</button>
    <div class="gear-panel" role="dialog" aria-modal="true" aria-label="Kamla Electrodes site menu">
      <div class="gear-core"><span>KE</span><small>Site Menu</small></div>
      <div class="gear-links">
        ${gearLinks.map(([href, label]) => `<a href="${href}">${label}</a>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(gearOverlay);

  const gearButton = document.querySelector('.gear-menu-button');
  const closeGear = () => {
    gearOverlay.classList.remove('is-open');
    gearButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };
  gearButton?.addEventListener('click', () => {
    gearOverlay.classList.add('is-open');
    gearButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  gearOverlay.querySelector('.gear-close')?.addEventListener('click', closeGear);
  gearOverlay.addEventListener('click', (event) => { if (event.target === gearOverlay) closeGear(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeGear(); });

  document.querySelectorAll('.notice').forEach((notice) => {
    const text = notice.textContent || '';
    if (!text.includes('Needs final')) return;
    notice.textContent = 'Available on request: additional business, technical, compliance, facility, and product information can be shared by the Kamla Electrodes team for relevant enquiries.';
  });

  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  const commercialCopy = {
    'get-a-quote.html': '<div class="commercial-strip"><strong>Direct bulk quotation:</strong> minimum 50 boxes. Pricing is aligned to product specification, quantity, destination, packaging, and current raw-material conditions.</div>',
    'become-a-dealer.html': '<div class="commercial-strip"><strong>Dealer development benchmark:</strong> applicants should be prepared for an estimated minimum purchase capacity of 300 boxes per month, subject to territory, product mix, and commercial alignment.</div>'
  };
  if (commercialCopy[pageName]) {
    const target = document.querySelector('aside.card');
    if (target && !target.querySelector('.commercial-strip')) target.insertAdjacentHTML('beforeend', commercialCopy[pageName]);
  }

  const buildFormSummary = (form) => {
    const formData = new FormData(form);
    const visibleEntries = [];
    formData.forEach((value, key) => {
      if (!value || ['access_key', 'redirect', 'subject', 'from_name', 'botcheck'].includes(key)) return;
      visibleEntries.push(`${key.replaceAll('_', ' ')}: ${value}`);
    });
    const subject = formData.get('subject') || document.title || 'Kamla Electrodes website enquiry';
    return [`${subject}`, `Page: ${window.location.href}`, ...visibleEntries].join('\n');
  };

  const openWhatsapp = (message, preferredNumber = whatsappNumbers[0]) => {
    window.open(`https://wa.me/${preferredNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  };

  document.querySelectorAll('form[action*="web3forms.com/submit"]').forEach((form) => {
    if (!form.querySelector('[name="from_name"]')) form.insertAdjacentHTML('beforeend', '<input type="hidden" name="from_name" value="KamlaElectrodes.com">');
    if (!form.querySelector('[name="botcheck"]')) form.insertAdjacentHTML('beforeend', '<input type="checkbox" name="botcheck" class="hidden" style="display:none">');
    if (!form.querySelector('.form-status')) form.insertAdjacentHTML('beforeend', '<p class="form-status" aria-live="polite"></p>');

    const whatsappButton = form.querySelector('#waBtn, .wa-fallback');
    if (whatsappButton) {
      whatsappButton.addEventListener('click', () => openWhatsapp(buildFormSummary(form)));
    } else {
      const row = form.querySelector('.cta-row') || form;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button button-secondary wa-fallback';
      button.textContent = 'Send via WhatsApp';
      button.addEventListener('click', () => openWhatsapp(buildFormSummary(form)));
      row.appendChild(button);
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('[type="submit"]');
      const status = form.querySelector('.form-status');
      const originalText = submitButton?.textContent;
      if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Sending…'; }
      if (status) status.textContent = 'Submitting your enquiry by email…';
      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) throw new Error(data.message || 'Submission failed');
        if (status) status.textContent = 'Thank you. Your enquiry has been sent to Kamla Electrodes by email.';
        form.reset();
      } catch (error) {
        if (status) status.textContent = 'Email submission could not be confirmed. Please use the WhatsApp button or call directly.';
      } finally {
        if (submitButton) { submitButton.disabled = false; submitButton.textContent = originalText || 'Submit'; }
      }
    });
  });

  const helper = document.createElement('div');
  helper.className = 'floating-helper';
  helper.innerHTML = `
    <button class="helper-main" type="button" aria-expanded="false"><span>💬</span><strong>Help</strong></button>
    <div class="helper-panel" aria-live="polite">
      <h3>How can we help?</h3>
      <p class="muted">Choose a quick route. This helper answers basic website FAQs and directs serious enquiries to the right page.</p>
      <div class="helper-options">
        <button data-answer="quote">Bulk quote</button>
        <button data-answer="dealer">Find dealer</button>
        <button data-answer="become">Become dealer</button>
        <button data-answer="products">Products</button>
        <button data-answer="docs">Documents</button>
        <button data-answer="contact">Contact team</button>
      </div>
      <div class="helper-answer">Select an option above.</div>
      <div class="cta-row"><a class="button button-primary" href="get-a-quote.html">Get Quote</a><a class="button button-secondary" href="contact.html">Contact</a></div>
    </div>`;
  document.body.appendChild(helper);
  const helperMain = helper.querySelector('.helper-main');
  const helperPanel = helper.querySelector('.helper-panel');
  const helperAnswer = helper.querySelector('.helper-answer');
  const answers = {
    quote: 'For direct bulk quotes, please share product type, size, quantity and delivery location. Minimum direct quote quantity starts from 50 boxes.',
    dealer: 'Use the dealer locator to search available authorised dealer entries by city, state, region or product brand. If your area is not listed, send a dealer availability enquiry.',
    become: 'Dealer applications are reviewed by market area, monthly purchase capacity, product interest and commercial fit. Minimum expected purchase capacity is 300 boxes per month.',
    products: 'The active portfolio includes Kmatic, Kmatic Gold, Kmatic X-45, Mahagun, Golden Arc, Lotus, Electra, Koko Tawa Gold, JK, Saurabh 6013 and Electra CocoTawa. Special ranges are available on request.',
    docs: 'Product data, compliance references, TDS and SDS/MSDS documents can be shared through official communication channels for verified enquiries.',
    contact: 'Use the contact page or call the direct numbers shown in the footer for urgent requirements, technical support and dealership conversations.'
  };
  helperMain?.addEventListener('click', () => {
    const open = helper.classList.toggle('is-open');
    helperMain.setAttribute('aria-expanded', String(open));
  });
  helperPanel?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-answer]');
    if (!button) return;
    helperAnswer.textContent = answers[button.dataset.answer] || 'Please contact Kamla Electrodes for assistance.';
  });

  const current = pageName;
  document.querySelectorAll('nav ul a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
});
