document.addEventListener('DOMContentLoaded', () => {
  const whatsappNumbers = ['919760975890', '919412205763', '918979090370'];
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
        if (status) status.textContent = 'Email submission could not be confirmed. Please use the WhatsApp button or call directly.';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalText || 'Submit';
        }
      }
    });
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
