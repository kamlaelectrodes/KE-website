document.addEventListener('DOMContentLoaded', () => {
  const whatsappNumbers = ['919760975890', '919412205763', '918979090370'];
  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  const primaryNav = [
    ['index.html','Home'],
    ['about.html','About'],
    ['products.html','Products'],
    ['dealer-locator.html','Distribution Map'],
    ['contact.html','Contact']
  ];
  const secondaryNav = [
    ['quality-standards.html','Quality & Standards'],
    ['infrastructure.html','Infrastructure'],
    ['industries-served.html','Industries Served'],
    ['technical-resources.html','Technical Resources'],
    ['download-product-data.html','Product Data'],
    ['get-a-quote.html','Get a Quote'],
    ['become-a-dealer.html','Apply for Distributorship'],
    ['faq.html','FAQs'],
    ['privacy-policy.html','Privacy Policy'],
    ['terms-and-conditions.html','Terms & Conditions'],
    ['official-notice.html','Official Notice']
  ];
  const allMenuLinks = [...primaryNav, ...secondaryNav];
  const electrodeBrands = ['Kmatic 6013','Kmatic Gold','Kmatic X-45','Mahagun','Golden Arc','Lotus','Electra','Koko Tawa','JK','Saurabh 6013','Electra CocoTawa','Kmatic H 600'];

  const loadCss = (href) => {
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  };
  loadCss('menu-fixes.css?v=3');
  loadCss('ke-assets.css?v=1');
  loadCss('content-enhancements.css?v=5');
  loadCss('site-fixes.css?v=1');

  const nav = document.querySelector('nav');
  const menu = document.querySelector('nav ul');
  document.querySelector('.nav-toggle')?.remove();

  if (menu) {
    menu.innerHTML = primaryNav.map(([href,label]) => `<li><a href="${href}">${label}</a></li>`).join('');
  }
  if (nav) {
    let navActions = nav.querySelector('.nav-actions');
    if (!navActions) {
      navActions = document.createElement('div');
      navActions.className = 'nav-actions';
      nav.appendChild(navActions);
    }
    navActions.innerHTML = '<a class="button button-primary" href="get-a-quote.html">Get a Quote</a><button class="site-menu-button" type="button" aria-label="Open full site menu" aria-expanded="false"><span>Menu</span></button>';
  }

  document.querySelectorAll('.topbar .container').forEach((bar) => {
    bar.innerHTML = '<div>Meerut, Uttar Pradesh · Manufacturing since 1989</div><div><a href="tel:+919412205763">+91 94122 05763</a> · <a href="tel:+919760975890">+91 97609 75890</a></div>';
  });

  const header = document.querySelector('header');
  if (header && !document.querySelector('.mobile-quick-nav')) {
    const mobileQuick = document.createElement('div');
    mobileQuick.className = 'mobile-quick-nav';
    mobileQuick.innerHTML = primaryNav.map(([href,label]) => `<a href="${href}"${href === pageName ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('');
    header.insertAdjacentElement('afterend', mobileQuick);
  }

  const menuOverlay = document.createElement('div');
  menuOverlay.className = 'site-menu-overlay';
  menuOverlay.innerHTML = `
    <button class="site-menu-close" type="button" aria-label="Close menu">×</button>
    <div class="site-menu-panel" role="dialog" aria-modal="true" aria-label="Kamla Electrodes site menu">
      <div class="electrode-fan" aria-hidden="true">
        ${electrodeBrands.map((brand, index) => `<span style="--i:${index};">${brand}</span>`).join('')}
      </div>
      <div class="site-menu-content">
        <p class="site-menu-kicker">Kamla Electrodes</p>
        <h2>Site Menu</h2>
        <p class="site-menu-subtext">Navigate company, product, quality, documentation and distribution support.</p>
        <div class="site-menu-links">
          ${allMenuLinks.map(([href,label]) => `<a href="${href}"${href === pageName ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('')}
        </div>
      </div>
    </div>`;
  document.body.appendChild(menuOverlay);
  const siteMenuButton = document.querySelector('.site-menu-button');
  const closeMenu = () => {
    menuOverlay.classList.remove('is-open');
    siteMenuButton?.setAttribute('aria-expanded','false');
    document.body.classList.remove('menu-open');
  };
  siteMenuButton?.addEventListener('click', () => {
    menuOverlay.classList.add('is-open');
    siteMenuButton.setAttribute('aria-expanded','true');
    document.body.classList.add('menu-open');
  });
  menuOverlay.querySelector('.site-menu-close')?.addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', (event) => { if (event.target === menuOverlay) closeMenu(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  document.querySelectorAll('.notice').forEach((notice) => {
    const text = notice.textContent || '';
    if (text.includes('Needs final')) notice.textContent = 'Available on request: additional business, technical, compliance, facility, and product information can be shared by the Kamla Electrodes team for relevant enquiries.';
  });

  const commercialCopy = {
    'get-a-quote.html': '<div class="commercial-strip"><strong>Direct bulk quotation:</strong> minimum 50 boxes. Pricing is aligned to product specification, quantity, destination, packaging, and current raw-material conditions.</div>',
    'become-a-dealer.html': '<div class="commercial-strip"><strong>Distributorship benchmark:</strong> applicants should be prepared for an estimated minimum purchase capacity of 300 boxes per month, subject to territory, product mix, and commercial alignment.</div>'
  };
  if (commercialCopy[pageName]) {
    const target = document.querySelector('aside.card, aside.callout');
    if (target && !target.querySelector('.commercial-strip')) target.insertAdjacentHTML('beforeend', commercialCopy[pageName]);
  }

  const buildFormSummary = (form) => {
    const formData = new FormData(form);
    const visibleEntries = [];
    formData.forEach((value,key) => {
      if (!value || ['access_key','redirect','subject','from_name','botcheck'].includes(key)) return;
      visibleEntries.push(`${key.replaceAll('_',' ')}: ${value}`);
    });
    const subject = formData.get('subject') || document.title || 'Kamla Electrodes website enquiry';
    return [`${subject}`, `Page: ${window.location.href}`, ...visibleEntries].join('\n');
  };
  const openWhatsapp = (message, preferredNumber = whatsappNumbers[0]) => {
    window.open(`https://wa.me/${preferredNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  };
  document.querySelectorAll('form[action*="web3forms.com/submit"]').forEach((form) => {
    if (!form.querySelector('[name="from_name"]')) form.insertAdjacentHTML('beforeend','<input type="hidden" name="from_name" value="KamlaElectrodes.com">');
    if (!form.querySelector('[name="botcheck"]')) form.insertAdjacentHTML('beforeend','<input type="checkbox" name="botcheck" class="hidden" style="display:none">');
    if (!form.querySelector('.form-status')) form.insertAdjacentHTML('beforeend','<p class="form-status" aria-live="polite"></p>');
    const whatsappButton = form.querySelector('#waBtn, .wa-fallback');
    if (whatsappButton) whatsappButton.addEventListener('click', () => openWhatsapp(buildFormSummary(form)));
    else {
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

  document.querySelectorAll('footer').forEach((footer) => {
    footer.innerHTML = `<div class="container footer-grid"><div><img src="logo-gear.png" alt="Kamla Electrodes icon" style="height:38px"><p><strong>Kamla Electrodes (India)</strong><br><span class="muted">Forging Lasting Bonds since 1989.</span></p><p class="muted">Reliable welding electrode manufacturing for authorised distribution partners, fabricators, procurement teams and industrial buyers across India.</p></div><div><strong>Direct Contacts</strong><p class="muted"><a href="tel:+919412205763">Arun Kumar Mittal</a><br><small>Managing Partner · +91 94122 05763</small><br><br><a href="tel:+919760975890">Mani Mittal</a><br><small>Partner · +91 97609 75890</small><br><br><a href="tel:+918979090370">Purshottam Mittal</a><br><small>Partner · +91 89790 90370</small></p></div><div><strong>Locations</strong><p class="muted"><strong>Head Office:</strong><br>217, Chhipi Tank, Meerut, UP – 250001<br><a href="https://share.google/YtWdOuhbiAWm51v8w" target="_blank" rel="noopener">View Head Office on Google</a></p><p class="muted"><strong>Plant:</strong><br>68, Achronda Industrial Area, Partapur, Meerut, UP<br><a href="https://share.google/cPMTybP8TIPuiNzU8" target="_blank" rel="noopener">View Plant on Google</a></p></div><div><strong>Business Links</strong><p><a href="products.html">Products</a><br><a href="get-a-quote.html">Get a Quote</a><br><a href="dealer-locator.html">Distribution Map</a><br><a href="become-a-dealer.html">Apply for Distributorship</a><br><a href="technical-resources.html">Technical Resources</a></p><p class="footer-legal"><a href="privacy-policy.html">Privacy Policy</a><br><a href="terms-and-conditions.html">Terms & Conditions</a><br><a href="official-notice.html">Official Notice</a></p></div></div>`;
  });

  if (['privacy-policy.html','terms-and-conditions.html','official-notice.html'].includes(pageName)) {
    document.querySelectorAll('aside.callout, aside.card').forEach((aside) => {
      if (!aside.querySelector('.legal-support-stack')) {
        aside.insertAdjacentHTML('beforeend', `<div class="legal-support-stack"><div class="mini-card"><strong>Official enquiry route</strong><p class="muted">Use formal channels for quotes, authorisation checks, compliance records and product documents.</p></div><div class="mini-card"><strong>Product confidence</strong><p class="muted">Portfolio, safety guidance, size ranges and technical data are published or available on request for relevant buyers.</p></div><div class="mini-card"><strong>Quick paths</strong><p><a href="products.html">Products</a><br><a href="download-product-data.html">Product Data</a><br><a href="dealer-locator.html">Distribution Map</a></p></div></div>`);
      }
    });
  }

  document.querySelectorAll('.expand-card').forEach((card) => {
    if (!card.querySelector('.expand-hint')) card.insertAdjacentHTML('beforeend','<span class="expand-hint">Click to expand details →</span>');
    card.addEventListener('click', (event) => {
      if (event.target.closest('a,button')) return;
      document.querySelectorAll('.expand-card.is-open').forEach((openCard) => { if (openCard !== card) openCard.classList.remove('is-open'); });
      card.classList.toggle('is-open');
    });
  });

  const helper = document.createElement('div');
  helper.className = 'floating-helper';
  helper.innerHTML = `
    <button class="helper-main" type="button" aria-expanded="false"><span>💬</span><strong>Help</strong></button>
    <div class="helper-panel" aria-live="polite">
      <h3>Quick Help</h3><p class="muted">Choose a topic. The helper will guide you and route you to the right page.</p>
      <div class="helper-options"><button data-answer="quote">Quote</button><button data-answer="distribution">Distribution Map</button><button data-answer="distributorship">Distributorship</button><button data-answer="products">Products</button><button data-answer="docs">Documents</button><button data-answer="technical">Technical help</button></div>
      <div class="helper-answer">Select a topic above, or open the FAQ for detailed answers.</div>
      <div class="cta-row"><a class="button button-primary" href="faq.html">Open FAQ</a><a class="button button-secondary" href="contact.html">Contact</a></div>
    </div>`;
  document.body.appendChild(helper);
  const answers = {
    quote: '<strong>Quote help</strong><br>Share brand/product, electrode size, quantity, delivery city and GST/company details. Direct quote starts from 50 boxes. <br><a href="get-a-quote.html">Open quote form →</a>',
    distribution: '<strong>Distribution support</strong><br>Search your city/state in the Distribution Map. If not listed, ask us for availability. <br><a href="dealer-locator.html">Open Distribution Map →</a>',
    distributorship: '<strong>Distributorship enquiry</strong><br>Share firm name, market area, current lines and monthly capacity. Benchmark is around 300 boxes/month. <br><a href="become-a-dealer.html">Apply for Distributorship →</a>',
    products: '<strong>Product help</strong><br>Open Product Range and click each product block for usage, coding, current range and safety information. <br><a href="products.html">View products →</a>',
    docs: '<strong>Documents</strong><br>TDS, SDS/MSDS, compliance records and product data are available through official channels for verified enquiries. <br><a href="download-product-data.html">Product data page →</a>',
    technical: '<strong>Technical support</strong><br>Share base material, electrode size, welding position, current setting and issue photos. <br><a href="technical-resources.html">Technical resources →</a>'
  };
  const helperMain = helper.querySelector('.helper-main');
  const helperAnswer = helper.querySelector('.helper-answer');
  helperMain?.addEventListener('click', () => {
    const open = helper.classList.toggle('is-open');
    helperMain.setAttribute('aria-expanded', String(open));
  });
  helper.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-answer]');
    if (!button) return;
    helperAnswer.innerHTML = answers[button.dataset.answer] || 'Please contact Kamla Electrodes for assistance.';
  });

  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.textContent = '↑';
  document.body.appendChild(backToTop);
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => backToTop.classList.toggle('is-visible', window.scrollY > 520), { passive: true });

  document.querySelectorAll('nav ul a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === pageName || (pageName === 'index.html' && href === 'index.html')) {
      link.classList.add('active'); link.setAttribute('aria-current','page');
    }
  });
});
