document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.nav-toggle');
  const menu = document.querySelector('nav ul');

  if (menu && !menu.querySelector('a[href="dealer-locator.html"]')) {
    const dealerItem = document.createElement('li');
    dealerItem.innerHTML = '<a href="dealer-locator.html">Find Dealer</a>';
    const technicalLink = menu.querySelector('a[href="technical-resources.html"]');
    const contactLink = menu.querySelector('a[href="contact.html"]');
    const insertBefore = technicalLink?.closest('li') || contactLink?.closest('li') || null;
    menu.insertBefore(dealerItem, insertBefore);
  }

  if (btn && menu) {
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

  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav ul a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
});
