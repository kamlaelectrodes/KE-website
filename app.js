document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.nav-toggle');
  const menu = document.querySelector('nav ul');
  const whatsappNumbers = ['919760975890', '919412205763'];

  if (!document.querySelector('link[href="site-enhancements.css?v=1"]')) {
    const enhancementStyles = document.createElement('link');
    enhancementStyles.rel = 'stylesheet';
    enhancementStyles.href = 'site-enhancements.css?v=1';
    document.head.appendChild(enhancementStyles);
  }

  if (menu && !menu.querySelector('a[href="dealer-locator.html"]')) {
    const dealerItem = document.createElement('li');
    dealerItem.innerHTML = '<a href="dealer-locator.html">Find Dealer</a>';
    const technicalLink = menu.querySelector('a[href="technical-resources.html"]');
    const contactLink = menu.querySelector('a[href="contact.html"]');
    const insertBefore = technicalLink?.closest('li') || contactLink?.closest('li') || null;
    menu.insertBefore(dealerItem, insertBefore);
  }

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
    if (cleaned !== notice.textContent) {
      notice.textContent = cleaned;
    }
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
    if (target && !target.querySelector('.commercial-strip')) {
      target.insertAdjacentHTML('beforeend', commercialCopy[pageName].html);
    }
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
    if (!form.querySelector('.form-status')) {
      form.insertAdjacentHTML('beforeend', '<p class="form-status" aria-live="polite"></p>');
    }
    if (!form.querySelector('.wa-fallback')) {
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
      if (status) status.textContent = 'Submitting your enquiry securely…';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.success === false) {
          throw new Error(data.message || 'Submission failed');
        }
        if (status) status.textContent = 'Thank you. Your enquiry has been sent. WhatsApp will open as an additional confirmation channel.';
        openWhatsapp(buildFormSummary(form));
        form.reset();
      } catch (error) {
        if (status) status.textContent = 'Email submission could not be confirmed. Please use WhatsApp or call our team directly.';
        openWhatsapp(buildFormSummary(form));
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
