document.addEventListener('DOMContentLoaded', () => {
  const CONTACTS = {
    arun: { name: 'Arun Kumar Mittal', role: 'Managing Partner', display: '+91 94122 05763', dial: '+919412205763' },
    mani: { name: 'Mani Mittal', role: 'Partner', display: '+91 97609 75890', dial: '+919760975890', wa: '919760975890' },
    purshottam: { name: 'Purshottam Mittal', role: 'Partner', display: '+91 89790 90370', dial: '+918979090370', wa: '918979090370' },
    email: 'contact@kamlaelectrodes.com'
  };

  const rawPageName = window.location.pathname.split('/').pop();
  const pageName = rawPageName || 'index.html';

  const primaryNav = [
    ['index.html', 'Home'],
    ['about.html', 'About'],
    ['products.html', 'Products'],
    ['dealer-locator.html', 'Distribution Map'],
    ['contact.html', 'Contact']
  ];

  const secondaryNav = [
    ['quality-standards.html', 'Quality & Standards'],
    ['infrastructure.html', 'Infrastructure'],
    ['industries-served.html', 'Industries Served'],
    ['research-development.html', 'R&D & Product Development'],
    ['case-study.html', '8 Gauge Short Case Study'],
    ['csr.html', 'Community & CSR'],
    ['technical-resources.html', 'Technical Resources'],
    ['download-product-data.html', 'Product Data'],
    ['get-a-quote.html', 'Get a Quote'],
    ['become-a-dealer.html', 'Become a Distribution Partner'],
    ['faq.html', 'FAQs'],
    ['privacy-policy.html', 'Privacy Policy'],
    ['terms-and-conditions.html', 'Terms & Conditions'],
    ['official-notice.html', 'Official Notice']
  ];

  const allMenuLinks = [...primaryNav, ...secondaryNav];
  const electrodeBrands = [
    'Kmatic Gold', 'Kmatic X-45', 'Mahagun', 'Golden Arc', 'Lotus', 'Electra',
    'Koko Tawa Gold', 'JK', 'Saurabh 6013', 'Electra CocoTawa', 'Kmatic H 600', 'Kmatic 6013'
  ];

  const isCurrent = href =>
    href === pageName || (pageName === 'index.html' && href === 'index.html');

  document.body.classList.add(`page-${pageName.replace(/\.html$/i, '').replace(/[^a-z0-9-]/gi, '-')}`);

  const loadCss = href => {
    if ([...document.styleSheets].some(sheet => {
      try { return sheet.href && new URL(sheet.href).pathname.endsWith(new URL(href, location.href).pathname); }
      catch (_) { return false; }
    })) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  [
    'menu-fixes.css?v=3',
    'ke-assets.css?v=1',
    'content-enhancements.css?v=5',
    'site-fixes.css?v=6',
    'photo-layout-fix.css?v=2',
    'hygiene-v4.css?v=1',
    'experience-v5.css?v=1',
    'correction-v6.css?v=1',
    'hygiene-v7.css?v=1',
    'site-corrections-v8.css?v=2'
  ].forEach(loadCss);

  document.querySelectorAll('img[src*="images.unsplash.com"]').forEach(image => {
    try {
      const url = new URL(image.src, window.location.href);
      url.searchParams.set('fm', 'webp');
      url.searchParams.set('auto', 'format');
      url.searchParams.set('fit', 'crop');
      if (!url.searchParams.has('w') || Number(url.searchParams.get('w')) > 1200) url.searchParams.set('w', '1200');
      url.searchParams.set('q', '72');
      image.src = url.toString();
      image.loading = image.closest('.page-header,.hero') ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
    } catch (_) {}
  });

  const enforceFacilityWebP = () => {
    const apply = (selector, src, position, width, height) => {
      document.querySelectorAll(selector).forEach(node => {
        node.classList.remove('photo-load-failed');
        if (node.tagName === 'IMG') {
          if (!node.src.endsWith(`/${src}`)) node.src = src;
          node.width = width;
          node.height = height;
          node.loading = node.closest('.home-facility') ? 'eager' : 'lazy';
          node.decoding = 'async';
          node.style.objectPosition = position;
        } else {
          node.style.backgroundImage = `url("${src}")`;
          node.style.backgroundPosition = position;
          node.style.backgroundSize = 'cover';
          node.style.backgroundRepeat = 'no-repeat';
        }
      });
    };
    apply('.facility-photo.plant-photo,.ke-hydrated-photo.plant-photo', 'plant-partapur.webp', 'center', 1000, 308);
    apply('.facility-photo.office-photo,.ke-hydrated-photo.office-photo', 'head-office-chhipi-tank.webp', 'center 22%', 480, 711);
  };
  enforceFacilityWebP();
  window.addEventListener('load', enforceFacilityWebP, { once: true });
  [150, 600, 1400].forEach(delay => window.setTimeout(enforceFacilityWebP, delay));

  const nav = document.querySelector('nav');
  const navList = nav?.querySelector('ul');
  document.querySelector('.nav-toggle')?.remove();

  if (navList) {
    navList.innerHTML = primaryNav
      .map(([href, label]) => `<li><a href="${href}"${isCurrent(href) ? ' class="active" aria-current="page"' : ''}>${label}</a></li>`)
      .join('');
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

  document.querySelectorAll('.topbar .container').forEach(bar => {
    bar.innerHTML = `<div>Meerut, Uttar Pradesh · Manufacturing since 1989</div><div><a href="tel:${CONTACTS.arun.dial}">${CONTACTS.arun.display}</a> · <a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a></div>`;
  });

  const header = document.querySelector('header');
  const syncMobileQuickNav = () => {
    const existing = document.querySelector('.mobile-quick-nav');
    const shouldExist = window.matchMedia('(max-width: 1024px)').matches;
    if (!shouldExist) {
      existing?.remove();
      return;
    }
    if (!header) return;
    const markup = primaryNav
      .map(([href, label]) => `<a href="${href}"${isCurrent(href) ? ' class="active" aria-current="page"' : ''}>${label}</a>`)
      .join('');
    if (existing) existing.innerHTML = markup;
    else {
      const mobileQuick = document.createElement('div');
      mobileQuick.className = 'mobile-quick-nav';
      mobileQuick.innerHTML = markup;
      header.insertAdjacentElement('afterend', mobileQuick);
    }
  };
  syncMobileQuickNav();
  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(syncMobileQuickNav, 120);
  }, { passive: true });

  document.querySelector('.site-menu-overlay')?.remove();
  const menuOverlay = document.createElement('div');
  menuOverlay.className = 'site-menu-overlay';
  menuOverlay.innerHTML = `
    <button class="site-menu-close" type="button" aria-label="Close menu">×</button>
    <div class="site-menu-panel" role="dialog" aria-modal="true" aria-label="Kamla Electrodes site menu">
      <div class="electrode-fan" aria-hidden="true">${electrodeBrands.map((brand, index) => `<span style="--i:${index};">${brand}</span>`).join('')}</div>
      <div class="site-menu-content">
        <p class="site-menu-kicker">Kamla Electrodes</p>
        <h2>Site Menu</h2>
        <p class="site-menu-subtext">Company, products, quality, R&amp;D, documentation, distribution and commercial support.</p>
        <div class="site-menu-links">${allMenuLinks.map(([href, label]) => `<a href="${href}"${isCurrent(href) ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('')}</div>
      </div>
    </div>`;
  document.body.appendChild(menuOverlay);

  const siteMenuButton = document.querySelector('.site-menu-button');
  const closeMenu = () => {
    menuOverlay.classList.remove('is-open');
    siteMenuButton?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };
  siteMenuButton?.addEventListener('click', () => {
    menuOverlay.classList.add('is-open');
    siteMenuButton.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  menuOverlay.querySelector('.site-menu-close')?.addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', event => {
    if (event.target === menuOverlay) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  document.querySelectorAll('a[href="become-a-dealer.html"]').forEach(link => {
    if (/apply for distributorship|become a dealer|dealer application/i.test((link.textContent || '').trim())) {
      link.textContent = 'Become a Distribution Partner';
    }
  });

  document.querySelectorAll('.transparency-note,.transparency-panel,.csr-disclosure').forEach(node => {
    if (/does not claim|audited impact|transparency/i.test(node.textContent || '')) {
      node.textContent = 'Additional documents and programme details are available on request.';
      node.classList.add('document-note');
    }
  });
  document.querySelectorAll('.visual-credit').forEach(node => node.remove());

  const buildFormSummary = form => {
    const formData = new FormData(form);
    const visibleEntries = [];
    formData.forEach((value, key) => {
      if (!value || ['access_key', 'redirect', 'subject', 'from_name', 'botcheck'].includes(key)) return;
      visibleEntries.push(`${key.replace(/_/g, ' ')}: ${value}`);
    });
    return [
      formData.get('subject') || document.title || 'Kamla Electrodes website enquiry',
      `Page: ${window.location.href}`,
      ...visibleEntries
    ].join('\n');
  };

  const openWhatsapp = (message, number = CONTACTS.mani.wa) => {
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  };

  document.querySelectorAll('form[action*="web3forms.com/submit"]').forEach(form => {
    if (!form.querySelector('[name="from_name"]')) {
      form.insertAdjacentHTML('beforeend', '<input type="hidden" name="from_name" value="KamlaElectrodes.com">');
    }
    if (!form.querySelector('[name="botcheck"]')) {
      form.insertAdjacentHTML('beforeend', '<input type="checkbox" name="botcheck" class="hidden" style="display:none">');
    }
    if (!form.querySelector('.form-status')) {
      form.insertAdjacentHTML('beforeend', '<p class="form-status" aria-live="polite"></p>');
    }

    let whatsappButton = form.querySelector('#waBtn, .wa-fallback');
    if (!whatsappButton) {
      const row = form.querySelector('.cta-row') || form;
      whatsappButton = document.createElement('button');
      whatsappButton.type = 'button';
      whatsappButton.className = 'button button-secondary wa-fallback';
      whatsappButton.textContent = 'Send via WhatsApp';
      row.appendChild(whatsappButton);
    }
    whatsappButton.addEventListener('click', () => openWhatsapp(buildFormSummary(form)));

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const submitButton = form.querySelector('[type="submit"]');
      const status = form.querySelector('.form-status');
      const originalText = submitButton?.textContent;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
      }
      if (status) status.textContent = 'Submitting your enquiry…';
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) throw new Error(data.message || 'Submission failed');
        if (status) status.textContent = 'Thank you. Your enquiry has been sent to Kamla Electrodes.';
        form.reset();
      } catch (_) {
        if (status) status.textContent = 'Submission could not be confirmed. Please use WhatsApp or contact the team directly.';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText || 'Submit';
        }
      }
    });
  });

  document.querySelectorAll('footer').forEach(footer => {
    footer.innerHTML = `<div class="container footer-grid">
      <div><img src="logo-gear.png" alt="Kamla Electrodes icon" width="38" height="38"><p><strong>Kamla Electrodes (India)</strong><br><span class="muted">Forging Lasting Bonds since 1989.</span></p><p class="muted">Welding electrode manufacturing, product development, distribution support and technical communication across India.</p></div>
      <div><strong>Team Contacts</strong><p class="muted"><a href="tel:${CONTACTS.arun.dial}"><strong>${CONTACTS.arun.name}</strong></a><br><small>${CONTACTS.arun.role} · ${CONTACTS.arun.display}</small><br><br><a href="https://wa.me/${CONTACTS.mani.wa}" target="_blank" rel="noopener"><strong>${CONTACTS.mani.name}</strong></a><br><small>${CONTACTS.mani.role} · ${CONTACTS.mani.display} · WhatsApp</small><br><br><a href="https://wa.me/${CONTACTS.purshottam.wa}" target="_blank" rel="noopener"><strong>${CONTACTS.purshottam.name}</strong></a><br><small>${CONTACTS.purshottam.role} · ${CONTACTS.purshottam.display} · WhatsApp</small><br><br><a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a></p></div>
      <div><strong>Locations</strong><p class="muted"><strong>Head Office:</strong><br>217, Chhipi Tank, Meerut, UP – 250001<br><a href="https://share.google/YtWdOuhbiAWm51v8w" target="_blank" rel="noopener">View Head Office on Google</a></p><p class="muted"><strong>Plant:</strong><br>68, Achronda Industrial Area, Partapur, Meerut, UP<br><a href="https://share.google/cPMTybP8TIPuiNzU8" target="_blank" rel="noopener">View Plant on Google</a></p></div>
      <div><strong>Business Links</strong><p><a href="products.html">Products</a><br><a href="research-development.html">R&amp;D &amp; Product Development</a><br><a href="case-study.html">8 Gauge Short Case Study</a><br><a href="get-a-quote.html">Get a Quote</a><br><a href="dealer-locator.html">Distribution Map</a><br><a href="become-a-dealer.html">Become a Distribution Partner</a><br><a href="technical-resources.html">Technical Resources</a><br><a href="faq.html">FAQs</a></p><p class="footer-legal"><a href="privacy-policy.html">Privacy Policy</a><br><a href="terms-and-conditions.html">Terms &amp; Conditions</a><br><a href="official-notice.html">Official Notice</a></p></div>
    </div>`;
  });

  if (['privacy-policy.html', 'terms-and-conditions.html', 'official-notice.html', 'faq.html'].includes(pageName)) {
    document.querySelectorAll('aside.callout, aside.card').forEach(aside => {
      aside.classList.add('support-rail');
      aside.querySelectorAll('.badge').forEach(badge => {
        if (/sticky buyer desk/i.test(badge.textContent || '')) badge.remove();
      });
    });
  }

  document.querySelectorAll('.expand-card').forEach(card => {
    let hint = card.querySelector('.expand-hint');
    if (!hint) {
      card.insertAdjacentHTML('beforeend', '<span class="expand-hint">View details →</span>');
      hint = card.querySelector('.expand-hint');
    }
    const syncHint = () => {
      if (hint) hint.textContent = card.classList.contains('is-open') ? '' : 'View details →';
      card.setAttribute('aria-expanded', String(card.classList.contains('is-open')));
    };
    syncHint();
    card.addEventListener('click', event => {
      if (event.target.closest('a,button')) return;
      document.querySelectorAll('.expand-card.is-open').forEach(openCard => {
        if (openCard !== card) {
          openCard.classList.remove('is-open');
          const openHint = openCard.querySelector('.expand-hint');
          if (openHint) openHint.textContent = 'View details →';
          openCard.setAttribute('aria-expanded', 'false');
        }
      });
      card.classList.toggle('is-open');
      syncHint();
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.click();
      }
    });
    if (!card.hasAttribute('tabindex')) card.tabIndex = 0;
  });

  document.querySelector('.floating-helper')?.remove();
  const helper = document.createElement('div');
  helper.className = 'floating-helper';
  helper.innerHTML = '<button class="helper-main" type="button" aria-expanded="false"><span>💬</span><strong>Help</strong></button><div class="helper-panel" aria-live="polite"><h3>Quick Help</h3><p class="muted">Choose a topic and continue to the relevant page.</p><div class="helper-options"><button data-answer="quote">Quote</button><button data-answer="distribution">Distribution</button><button data-answer="partnership">Partnership</button><button data-answer="products">Products</button><button data-answer="docs">Documents</button><button data-answer="technical">Technical help</button></div><div class="helper-answer">Select a topic above, or open the FAQ for detailed answers.</div><div class="cta-row"><a class="button button-primary" href="faq.html">Open FAQ</a><a class="button button-secondary" href="contact.html">Contact</a></div></div>';
  document.body.appendChild(helper);

  const answers = {
    quote: '<strong>Quote help</strong><br>Share brand or product, electrode size, quantity, location, GST/company details and buying timeline. <br><a href="get-a-quote.html">Open quote form →</a>',
    distribution: '<strong>Distribution support</strong><br>Search public authorised partners or use the national enquiry route. <br><a href="dealer-locator.html">Open Distribution Map →</a>',
    partnership: '<strong>Distribution partnership</strong><br>Share firm name, market area, current lines, warehouse capability and sustainable monthly purchase capacity. <br><a href="become-a-dealer.html">Open partnership application →</a>',
    products: '<strong>Product help</strong><br>Open the Product Range and expand a product block for use cases and technical information. <br><a href="products.html">View products →</a>',
    docs: '<strong>Documents</strong><br>TDS, SDS/MSDS, compliance records and product details are available through official channels. <br><a href="download-product-data.html">Product data page →</a>',
    technical: '<strong>Technical support</strong><br>Share base material, electrode size, welding position, current setting and issue photographs. <br><a href="technical-resources.html">Technical resources →</a>'
  };

  const helperMain = helper.querySelector('.helper-main');
  const helperAnswer = helper.querySelector('.helper-answer');
  helperMain?.addEventListener('click', () => {
    const open = helper.classList.toggle('is-open');
    helperMain.setAttribute('aria-expanded', String(open));
  });
  helper.addEventListener('click', event => {
    const button = event.target.closest('button[data-answer]');
    if (button) helperAnswer.innerHTML = answers[button.dataset.answer] || 'Please contact Kamla Electrodes for assistance.';
  });

  document.querySelector('.back-to-top')?.remove();
  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label', 'Back to top');
  backToTop.textContent = '↑';
  document.body.appendChild(backToTop);
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let scrollFrame = 0;
  const updateScrollEffects = () => {
    scrollFrame = 0;
    backToTop.classList.toggle('is-visible', window.scrollY > 520);
    if (!reduceMotion) document.documentElement.style.setProperty('--ke-gear-angle', `${window.scrollY * 0.095}deg`);
  };
  if (!reduceMotion) document.documentElement.classList.add('gear-scroll-linked');
  window.addEventListener('scroll', () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();

  if (pageName === 'index.html' && !document.querySelector('.motion-rail')) {
    const hero = document.querySelector('.hero');
    const items = ['Manufacturing since 1989', 'Multi-brand electrode portfolio', 'Quality-led production', 'Distribution support', 'Technical assistance', 'Commercial responsiveness'];
    if (hero) {
      const rail = document.createElement('div');
      rail.className = 'motion-rail';
      rail.innerHTML = `<div class="motion-rail-track">${[...items, ...items].map(item => `<span>${item}</span>`).join('')}</div>`;
      hero.insertAdjacentElement('afterend', rail);
    }
  }

  const revealTargets = document.querySelectorAll('.section .card, .section .callout, .industry-story, .csr-story, .facility-visual, .stock-visual, .visual-path-card, .editorial-visual, .national-enquiry-panel');
  revealTargets.forEach(target => target.classList.add('reveal-on-scroll'));
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealTargets.forEach(target => target.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -36px' });
    revealTargets.forEach(target => observer.observe(target));
  }
});
