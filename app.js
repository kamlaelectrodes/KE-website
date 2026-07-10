document.addEventListener('DOMContentLoaded', () => {
  const CONTACTS = {
    callPrimary: { display: '+91 94122 05763', dial: '+919412205763' },
    callSecondary: [
      { display: '+91 97609 75890', dial: '+919760975890' },
      { display: '+91 89790 90370', dial: '+918979090370' }
    ],
    whatsappPrimary: { display: '+91 97609 75890', wa: '919760975890' },
    whatsappSecondary: { display: '+91 89790 90370', wa: '918979090370' },
    email: 'contact@kamlaelectrodes.com'
  };

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
    ['csr.html','Community & CSR'],
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
  const electrodeBrands = ['Kmatic Gold','Kmatic X-45','Mahagun','Golden Arc','Lotus','Electra','Koko Tawa Gold','JK','Saurabh 6013','Electra CocoTawa','Kmatic H 600','Kmatic 6013'];

  document.body.classList.add(`page-${pageName.replace(/\.html$/,'').replace(/[^a-z0-9-]/gi,'-')}`);

  const loadCss = href => {
    if (document.querySelector(`link[href="${href}"]`)) return;
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
    'hygiene-v7.css?v=1'
  ].forEach(loadCss);

  /* Optimise externally hosted editorial images for a smaller WebP response. */
  document.querySelectorAll('img[src*="images.unsplash.com"]').forEach(image => {
    try {
      const url = new URL(image.src, window.location.href);
      url.searchParams.set('fm','webp');
      url.searchParams.set('auto','format');
      url.searchParams.set('fit','crop');
      if (!url.searchParams.has('w') || Number(url.searchParams.get('w')) > 1200) url.searchParams.set('w','1200');
      url.searchParams.set('q','72');
      image.src = url.toString();
      image.loading = 'lazy';
      image.decoding = 'async';
      image.referrerPolicy = 'no-referrer';
    } catch (_) {}
  });

  /* Supplied office and plant photographs are embedded in ke-assets.css. Convert the
     data URI to an object URL so Safari renders a normal image element reliably. */
  const objectUrls = [];
  const extractCssUrl = value => {
    let source = String(value || '').trim();
    if (!source) return '';
    source = source.replace(/^url\(/i,'').replace(/\)$/,'').trim();
    if ((source.startsWith('"') && source.endsWith('"')) || (source.startsWith("'") && source.endsWith("'"))) source = source.slice(1,-1);
    return source.replace(/\\(["'])/g,'$1').trim();
  };
  const dataUriToObjectUrl = dataUri => {
    if (!/^data:/i.test(dataUri)) return dataUri;
    const comma = dataUri.indexOf(',');
    if (comma < 0) return dataUri;
    const meta = dataUri.slice(5,comma);
    const payload = dataUri.slice(comma + 1);
    try {
      const binary = /;base64/i.test(meta) ? window.atob(payload.replace(/\s+/g,'')) : decodeURIComponent(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: meta.split(';')[0] || 'image/jpeg' }));
      objectUrls.push(url);
      return url;
    } catch (_) {
      return dataUri;
    }
  };
  const hydrateFacilityPhotos = () => {
    const rootStyle = getComputedStyle(document.documentElement);
    [
      { className:'plant-photo', variable:'--ke-plant-image', width:1200, height:750, alt:'Kamla Electrodes manufacturing plant at Partapur, Meerut' },
      { className:'office-photo', variable:'--ke-office-image', width:720, height:900, alt:'Kamla Complex head office at Chhipi Tank, Meerut' }
    ].forEach(({ className, variable, width, height, alt }) => {
      const rawSource = extractCssUrl(rootStyle.getPropertyValue(variable));
      if (!rawSource) return;
      const usableSource = dataUriToObjectUrl(rawSource);
      document.querySelectorAll(`.facility-photo.${className}`).forEach(holder => {
        if (holder.tagName === 'IMG' || holder.dataset.hydrating === 'true') return;
        holder.dataset.hydrating = 'true';
        holder.style.backgroundImage = `url("${usableSource}")`;
        holder.style.backgroundPosition = className === 'office-photo' ? 'center 22%' : 'center';
        holder.style.backgroundSize = 'cover';
        const image = new Image();
        image.className = `${holder.className} ke-hydrated-photo`;
        image.alt = holder.getAttribute('aria-label') || alt;
        image.width = width;
        image.height = height;
        image.decoding = 'async';
        image.loading = holder.closest('.home-facility') ? 'eager' : 'lazy';
        if (holder.closest('.home-facility')) image.fetchPriority = 'high';
        image.onload = () => holder.replaceWith(image);
        image.onerror = () => {
          holder.classList.add('photo-load-failed');
          delete holder.dataset.hydrating;
        };
        image.src = usableSource;
      });
    });
  };
  hydrateFacilityPhotos();
  window.addEventListener('load', hydrateFacilityPhotos, { once:true });
  window.setTimeout(hydrateFacilityPhotos, 700);
  window.addEventListener('pagehide', () => objectUrls.forEach(url => URL.revokeObjectURL(url)), { once:true });

  /* Shared navigation and contact priority. */
  const nav = document.querySelector('nav');
  const navList = nav?.querySelector('ul');
  document.querySelector('.nav-toggle')?.remove();
  if (navList) navList.innerHTML = primaryNav.map(([href,label]) => `<li><a href="${href}">${label}</a></li>`).join('');
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
    bar.innerHTML = `<div>Meerut, Uttar Pradesh · Manufacturing since 1989</div><div><a href="tel:${CONTACTS.callPrimary.dial}">${CONTACTS.callPrimary.display}</a> · <a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a></div>`;
  });

  const header = document.querySelector('header');
  const syncMobileQuickNav = () => {
    const existing = document.querySelector('.mobile-quick-nav');
    const shouldExist = window.matchMedia('(max-width: 1024px)').matches;
    if (!shouldExist) { existing?.remove(); return; }
    if (!header || existing) return;
    const mobileQuick = document.createElement('div');
    mobileQuick.className = 'mobile-quick-nav';
    mobileQuick.innerHTML = primaryNav.map(([href,label]) => `<a href="${href}"${href === pageName ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('');
    header.insertAdjacentElement('afterend', mobileQuick);
  };
  syncMobileQuickNav();
  let resizeTimer;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(syncMobileQuickNav, 120);
  }, { passive:true });

  const menuOverlay = document.createElement('div');
  menuOverlay.className = 'site-menu-overlay';
  menuOverlay.innerHTML = `
    <button class="site-menu-close" type="button" aria-label="Close menu">×</button>
    <div class="site-menu-panel" role="dialog" aria-modal="true" aria-label="Kamla Electrodes site menu">
      <div class="electrode-fan" aria-hidden="true">${electrodeBrands.map((brand,index) => `<span style="--i:${index};">${brand}</span>`).join('')}</div>
      <div class="site-menu-content">
        <p class="site-menu-kicker">Kamla Electrodes</p><h2>Site Menu</h2>
        <p class="site-menu-subtext">Company, product, quality, documentation, distribution and commercial support.</p>
        <div class="site-menu-links">${allMenuLinks.map(([href,label]) => `<a href="${href}"${href === pageName ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('')}</div>
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
  menuOverlay.addEventListener('click', event => { if (event.target === menuOverlay) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

  /* Compact any remaining defensive copy left in older pages. */
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
    formData.forEach((value,key) => {
      if (!value || ['access_key','redirect','subject','from_name','botcheck'].includes(key)) return;
      visibleEntries.push(`${key.replace(/_/g,' ')}: ${value}`);
    });
    return [formData.get('subject') || document.title || 'Kamla Electrodes website enquiry', `Page: ${window.location.href}`, ...visibleEntries].join('\n');
  };
  const openWhatsapp = (message, number = CONTACTS.whatsappPrimary.wa) => {
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  };
  document.querySelectorAll('form[action*="web3forms.com/submit"]').forEach(form => {
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
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const submitButton = form.querySelector('[type="submit"]');
      const status = form.querySelector('.form-status');
      const originalText = submitButton?.textContent;
      if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Sending…'; }
      if (status) status.textContent = 'Submitting your enquiry…';
      try {
        const response = await fetch(form.action, { method:'POST', body:new FormData(form), headers:{ Accept:'application/json' } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) throw new Error(data.message || 'Submission failed');
        if (status) status.textContent = 'Thank you. Your enquiry has been sent to Kamla Electrodes.';
        form.reset();
      } catch (_) {
        if (status) status.textContent = 'Submission could not be confirmed. Please use WhatsApp or call the primary number.';
      } finally {
        if (submitButton) { submitButton.disabled = false; submitButton.textContent = originalText || 'Submit'; }
      }
    });
  });

  /* Correct legacy WhatsApp links to the approved primary number. */
  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
    const message = new URL(link.href).searchParams.get('text') || '';
    if (!link.dataset.secondaryWhatsapp) link.href = `https://wa.me/${CONTACTS.whatsappPrimary.wa}?text=${encodeURIComponent(message)}`;
  });

  document.querySelectorAll('footer').forEach(footer => {
    footer.innerHTML = `<div class="container footer-grid">
      <div><img src="logo-gear.png" alt="Kamla Electrodes icon" width="38" height="38"><p><strong>Kamla Electrodes (India)</strong><br><span class="muted">Forging Lasting Bonds since 1989.</span></p><p class="muted">Welding electrode manufacturing, distribution development, technical communication and commercial support across India.</p></div>
      <div><strong>Contact Priority</strong><p class="muted"><a href="tel:${CONTACTS.callPrimary.dial}"><strong>${CONTACTS.callPrimary.display}</strong></a><br><small>Primary calling number</small><br><br><a href="https://wa.me/${CONTACTS.whatsappPrimary.wa}" target="_blank" rel="noopener"><strong>${CONTACTS.whatsappPrimary.display}</strong></a><br><small>Primary WhatsApp</small><br><br><a href="tel:${CONTACTS.callSecondary[0].dial}">${CONTACTS.callSecondary[0].display}</a> · <a href="tel:${CONTACTS.callSecondary[1].dial}">${CONTACTS.callSecondary[1].display}</a><br><small>Secondary calling numbers</small><br><br><a href="https://wa.me/${CONTACTS.whatsappSecondary.wa}" target="_blank" rel="noopener">${CONTACTS.whatsappSecondary.display}</a><br><small>Secondary WhatsApp</small><br><br><a href="mailto:${CONTACTS.email}">${CONTACTS.email}</a></p></div>
      <div><strong>Locations</strong><p class="muted"><strong>Head Office:</strong><br>217, Chhipi Tank, Meerut, UP – 250001<br><a href="https://share.google/YtWdOuhbiAWm51v8w" target="_blank" rel="noopener">View Head Office on Google</a></p><p class="muted"><strong>Plant:</strong><br>68, Achronda Industrial Area, Partapur, Meerut, UP<br><a href="https://share.google/cPMTybP8TIPuiNzU8" target="_blank" rel="noopener">View Plant on Google</a></p></div>
      <div><strong>Business Links</strong><p><a href="products.html">Products</a><br><a href="get-a-quote.html">Get a Quote</a><br><a href="dealer-locator.html">Distribution Map</a><br><a href="become-a-dealer.html">Apply for Distributorship</a><br><a href="technical-resources.html">Technical Resources</a><br><a href="faq.html">FAQs</a></p><p class="footer-legal"><a href="privacy-policy.html">Privacy Policy</a><br><a href="terms-and-conditions.html">Terms & Conditions</a><br><a href="official-notice.html">Official Notice</a></p></div>
    </div>`;
  });

  if (['privacy-policy.html','terms-and-conditions.html','official-notice.html','faq.html'].includes(pageName)) {
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
      card.insertAdjacentHTML('beforeend','<span class="expand-hint">View details →</span>');
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
          openCard.setAttribute('aria-expanded','false');
        }
      });
      card.classList.toggle('is-open');
      syncHint();
    });
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); card.click(); }
    });
    if (!card.hasAttribute('tabindex')) card.tabIndex = 0;
  });

  const helper = document.createElement('div');
  helper.className = 'floating-helper';
  helper.innerHTML = '<button class="helper-main" type="button" aria-expanded="false"><span>💬</span><strong>Help</strong></button><div class="helper-panel" aria-live="polite"><h3>Quick Help</h3><p class="muted">Choose a topic and continue to the relevant page.</p><div class="helper-options"><button data-answer="quote">Quote</button><button data-answer="distribution">Distribution</button><button data-answer="distributorship">Distributorship</button><button data-answer="products">Products</button><button data-answer="docs">Documents</button><button data-answer="technical">Technical help</button></div><div class="helper-answer">Select a topic above, or open the FAQ for detailed answers.</div><div class="cta-row"><a class="button button-primary" href="faq.html">Open FAQ</a><a class="button button-secondary" href="contact.html">Contact</a></div></div>';
  document.body.appendChild(helper);
  const answers = {
    quote:'<strong>Quote help</strong><br>Share brand or product, electrode size, quantity, location, GST/company details and buying timeline. Quotations are ex-factory unless freight is included in writing. <br><a href="get-a-quote.html">Open quote form →</a>',
    distribution:'<strong>Distribution support</strong><br>Search public authorised partners. For any other product requirement, use the national enquiry route. <br><a href="dealer-locator.html">Open Distribution Map →</a>',
    distributorship:'<strong>Distributorship enquiry</strong><br>Share firm name, market area, current lines, warehouse capability and expected business capacity. <br><a href="become-a-dealer.html">Apply for Distributorship →</a>',
    products:'<strong>Product help</strong><br>Open Product Range and expand a product block for use cases and technical information. <br><a href="products.html">View products →</a>',
    docs:'<strong>Documents</strong><br>TDS, SDS/MSDS, compliance records and product details are available through official channels. <br><a href="download-product-data.html">Product data page →</a>',
    technical:'<strong>Technical support</strong><br>Share base material, electrode size, welding position, current setting and issue photographs. <br><a href="technical-resources.html">Technical resources →</a>'
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

  const backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  backToTop.type = 'button';
  backToTop.setAttribute('aria-label','Back to top');
  backToTop.textContent = '↑';
  document.body.appendChild(backToTop);
  backToTop.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

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
  }, { passive:true });
  updateScrollEffects();

  if (pageName === 'index.html' && !document.querySelector('.motion-rail')) {
    const hero = document.querySelector('.hero');
    const items = ['Manufacturing since 1989','Multi-brand electrode portfolio','Quality-led production','Distribution support','Technical assistance','Commercial responsiveness'];
    if (hero) {
      const rail = document.createElement('div');
      rail.className = 'motion-rail';
      rail.innerHTML = `<div class="motion-rail-track">${[...items,...items].map(item => `<span>${item}</span>`).join('')}</div>`;
      hero.insertAdjacentElement('afterend', rail);
    }
  }

  const revealTargets = document.querySelectorAll('.section .card, .section .callout, .industry-story, .csr-story, .facility-visual, .stock-visual, .visual-path-card, .editorial-visual, .national-enquiry-panel');
  revealTargets.forEach(target => target.classList.add('reveal-on-scroll'));
  if (!('IntersectionObserver' in window) || reduceMotion) revealTargets.forEach(target => target.classList.add('is-visible'));
  else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold:.1, rootMargin:'0px 0px -36px' });
    revealTargets.forEach(target => observer.observe(target));
  }

  document.querySelectorAll('nav ul a').forEach(link => {
    if (link.getAttribute('href') === pageName || (pageName === 'index.html' && link.getAttribute('href') === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current','page');
    }
  });
});
