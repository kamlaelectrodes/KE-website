document.addEventListener('DOMContentLoaded', () => {
  const whatsappNumbers = ['919760975890', '919412205763', '918979090370'];
  const contacts = [
    { name: 'Arun Kumar Mittal', role: 'Managing Partner', phone: '+91 94122 05763', tel: '+919412205763' },
    { name: 'Mani Mittal', role: 'Partner', phone: '+91 97609 75890', tel: '+919760975890' },
    { name: 'Purshottam Mittal', role: 'Partner', phone: '+91 89790 90370', tel: '+918979090370' }
  ];
  const googleProfiles = {
    plant: 'https://share.google/cPMTybP8TIPuiNzU8',
    headOffice: 'https://share.google/YtWdOuhbiAWm51v8w'
  };

  if (!document.querySelector('link[href="site-enhancements.css?v=3"]')) {
    const enhancementStyles = document.createElement('link');
    enhancementStyles.rel = 'stylesheet';
    enhancementStyles.href = 'site-enhancements.css?v=3';
    document.head.appendChild(enhancementStyles);
  }

  const nav = document.querySelector('nav');
  const menu = document.querySelector('nav ul');
  const btn = document.querySelector('.nav-toggle');

  const navItems = [
    ['index.html', 'Home'],
    ['about.html', 'About'],
    ['products.html', 'Products'],
    ['quality-standards.html', 'Quality'],
    ['infrastructure.html', 'Infrastructure'],
    ['industries-served.html', 'Industries'],
    ['dealer-locator.html', 'Find Dealer'],
    ['technical-resources.html', 'Technical'],
    ['contact.html', 'Contact']
  ];

  if (menu) {
    menu.innerHTML = navItems.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('');
  }

  if (nav) {
    let navActions = nav.querySelector('.nav-actions');
    if (!navActions) {
      navActions = document.createElement('div');
      navActions.className = 'nav-actions';
      nav.appendChild(navActions);
    }
    navActions.innerHTML = '<a class="button button-primary" href="get-a-quote.html">Get a Quote</a>';
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

  const publicSafeNotice = (text) => {
    if (!text.includes('Needs final')) return text;
    if (text.includes('asset upload')) {
      return 'Available on request: product sheets, technical documents, and verified revision details can be shared by the Kamla Electrodes team while updated downloads are organized.';
    }
    if (text.includes('asset input')) {
      return 'Available on request: facility photos, equipment details, capacity information, and QC lab details can be shared for relevant buyer, dealer, and institutional enquiries.';
    }
    if (text.includes('business input')) {
      return 'Available on request: detailed commercial, technical, compliance, and support information can be shared by the Kamla Electrodes team for relevant enquiries.';
    }
    if (text.includes('compliance input')) {
      return 'Available on request: compliance certificates, test references, and applicable quality documents can be shared for verified buyer and institutional requirements.';
    }
    return 'Available on request: additional details can be shared by the Kamla Electrodes team for relevant enquiries.';
  };

  document.querySelectorAll('.notice').forEach((notice) => {
    const cleaned = publicSafeNotice(notice.textContent || '');
    if (cleaned !== notice.textContent) notice.textContent = cleaned;
  });

  const pageName = window.location.pathname.split('/').pop() || 'index.html';

  const commercialCopy = {
    'get-a-quote.html': {
      selector: 'aside.card',
      html: '<div class="commercial-strip"><strong>Direct bulk quotation:</strong> minimum 50 boxes. Pricing is aligned to product specification, quantity, destination, packaging, and current raw-material conditions.</div>'
    },
    'become-a-dealer.html': {
      selector: 'aside.card',
      html: '<div class="commercial-strip"><strong>Dealer development benchmark:</strong> applicants should be prepared for an estimated minimum purchase capacity of 300 boxes per month, subject to territory, product mix, and commercial alignment.</div>'
    }
  };

  if (commercialCopy[pageName]) {
    const target = document.querySelector(commercialCopy[pageName].selector);
    if (target && !target.querySelector('.commercial-strip')) target.insertAdjacentHTML('beforeend', commercialCopy[pageName].html);
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
    const url = `https://wa.me/${preferredNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  };

  document.querySelectorAll('form[action*="web3forms.com/submit"]').forEach((form) => {
    if (!form.querySelector('[name="from_name"]')) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'from_name';
      input.value = 'KamlaElectrodes.com';
      form.appendChild(input);
    }
    if (!form.querySelector('[name="botcheck"]')) {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'botcheck';
      input.className = 'hidden';
      input.style.display = 'none';
      form.appendChild(input);
    }
    if (!form.querySelector('.form-status')) form.insertAdjacentHTML('beforeend', '<p class="form-status" aria-live="polite"></p>');

    const existingWhatsappButton = form.querySelector('#waBtn, .wa-fallback');
    if (existingWhatsappButton) {
      existingWhatsappButton.addEventListener('click', () => openWhatsapp(buildFormSummary(form)));
    } else {
      const row = form.querySelector('.cta-row') || form;
      const waButton = document.createElement('button');
      waButton.type = 'button';
      waButton.className = 'button button-secondary wa-fallback';
      waButton.textContent = 'Send via WhatsApp';
      waButton.addEventListener('click', () => openWhatsapp(buildFormSummary(form)));
      row.appendChild(waButton);
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector('[type="submit"]');
      const status = form.querySelector('.form-status');
      const originalText = submitButton?.textContent;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
      }
      if (status) status.textContent = 'Submitting your enquiry by email…';

      try {
        const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) throw new Error(data.message || 'Submission failed');
        if (status) status.textContent = 'Thank you. Your enquiry has been sent to Kamla Electrodes by email.';
        form.reset();
      } catch (error) {
        if (status) status.textContent = 'Email submission could not be confirmed. Please use the WhatsApp button or call our team directly.';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText || 'Submit';
        }
      }
    });
  });

  document.querySelectorAll('footer').forEach((footer) => {
    footer.innerHTML = `
      <div class="container footer-grid">
        <div>
          <img src="logo-gear.png" alt="Kamla Electrodes icon" style="height:38px">
          <p><strong>Kamla Electrodes (India)</strong><br><span class="muted">Forging Lasting Bonds since 1989.</span></p>
          <p class="muted">Reliable welding electrode manufacturing for dealers, fabricators, procurement teams, and industrial buyers across India.</p>
        </div>
        <div>
          <strong>Direct Contacts</strong>
          <p class="muted">${contacts.map(contact => `<a href="tel:${contact.tel}">${contact.name}</a><br><small>${contact.role} · ${contact.phone}</small>`).join('<br>')}</p>
        </div>
        <div>
          <strong>Locations</strong>
          <p class="muted"><strong>Head Office:</strong><br>217, Chhipi Tank, Meerut, UP – 250001<br><a href="${googleProfiles.headOffice}" target="_blank" rel="noopener">View Head Office on Google</a></p>
          <p class="muted"><strong>Plant:</strong><br>68, Achronda Industrial Area, Partapur, Meerut, UP<br><a href="${googleProfiles.plant}" target="_blank" rel="noopener">View Plant on Google</a></p>
        </div>
        <div>
          <strong>Business Links</strong>
          <p><a href="products.html">Products</a><br><a href="get-a-quote.html">Get a Quote</a><br><a href="dealer-locator.html">Find Dealer</a><br><a href="become-a-dealer.html">Become a Dealer</a><br><a href="technical-resources.html">Technical Resources</a></p>
          <p class="muted"><strong>Email:</strong><br><a href="mailto:kamlaelectrodes@gmail.com">kamlaelectrodes@gmail.com</a></p>
        </div>
      </div>`;
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
