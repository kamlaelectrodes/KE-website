document.addEventListener('DOMContentLoaded', () => {
  const contacts = {
    arun: { name: 'Arun Kumar Mittal', role: 'Managing Partner', display: '+91 94122 05763', dial: '+919412205763' },
    mani: { name: 'Mani Mittal', role: 'Partner', display: '+91 97609 75890', dial: '+919760975890', wa: '919760975890' },
    purshottam: { name: 'Purshottam Mittal', role: 'Partner', display: '+91 89790 90370', dial: '+918979090370', wa: '918979090370' },
    email: 'contact@kamlaelectrodes.com'
  };

  /* Replace every facility placeholder or legacy hydrated JPEG with the standalone WebP asset. */
  const enforceFacilityWebP = () => {
    document.querySelectorAll('.plant-photo').forEach(photo => {
      if (photo.tagName === 'IMG') {
        if (!photo.src.endsWith('/plant-partapur.webp')) photo.src = 'plant-partapur.webp';
        photo.width = 1000;
        photo.height = 308;
        photo.loading = photo.closest('.home-facility') ? 'eager' : 'lazy';
        photo.decoding = 'async';
      } else {
        photo.style.backgroundImage = "url('plant-partapur.webp')";
        photo.style.backgroundPosition = 'center';
        photo.style.backgroundSize = 'cover';
        photo.style.backgroundRepeat = 'no-repeat';
      }
      photo.classList.remove('photo-load-failed');
    });
    document.querySelectorAll('.office-photo').forEach(photo => {
      if (photo.tagName === 'IMG') {
        if (!photo.src.endsWith('/head-office-chhipi-tank.webp')) photo.src = 'head-office-chhipi-tank.webp';
        photo.width = 480;
        photo.height = 711;
        photo.loading = 'lazy';
        photo.decoding = 'async';
      } else {
        photo.style.backgroundImage = "url('head-office-chhipi-tank.webp')";
        photo.style.backgroundPosition = 'center 22%';
        photo.style.backgroundSize = 'cover';
        photo.style.backgroundRepeat = 'no-repeat';
      }
      photo.classList.remove('photo-load-failed');
    });
  };
  enforceFacilityWebP();
  window.addEventListener('load', enforceFacilityWebP, { once: true });
  [100, 500, 1200].forEach(delay => window.setTimeout(enforceFacilityWebP, delay));

  /* Keep user-facing terminology at distribution-partner level. */
  document.querySelectorAll('a[href="become-a-dealer.html"]').forEach(link => {
    const text = (link.textContent || '').trim();
    if (/apply for distributorship|become a dealer|dealer application/i.test(text)) link.textContent = 'Become a Distribution Partner';
  });

  const menuLinks = document.querySelector('.site-menu-links');
  if (menuLinks) {
    if (!menuLinks.querySelector('a[href="research-development.html"]')) {
      const rd = document.createElement('a');
      rd.href = 'research-development.html';
      rd.textContent = 'R&D & Product Development';
      menuLinks.insertBefore(rd, menuLinks.querySelector('a[href="technical-resources.html"]') || null);
    }
    if (!menuLinks.querySelector('a[href="case-study.html"]')) {
      const caseLink = document.createElement('a');
      caseLink.href = 'case-study.html';
      caseLink.textContent = '8 Gauge Short Case Study';
      menuLinks.insertBefore(caseLink, menuLinks.querySelector('a[href="technical-resources.html"]') || null);
    }
  }

  /* Named people and responsibilities belong on the public contact surface. */
  document.querySelectorAll('footer').forEach(footer => {
    footer.innerHTML = `<div class="container footer-grid">
      <div><img src="logo-gear.png" alt="Kamla Electrodes icon" width="38" height="38"><p><strong>Kamla Electrodes (India)</strong><br><span class="muted">Forging Lasting Bonds since 1989.</span></p><p class="muted">Welding electrode manufacturing, product development, distribution support and technical communication across India.</p></div>
      <div><strong>Team Contacts</strong><p class="muted"><a href="tel:${contacts.arun.dial}"><strong>${contacts.arun.name}</strong></a><br><small>${contacts.arun.role} · ${contacts.arun.display}</small><br><br><a href="https://wa.me/${contacts.mani.wa}" target="_blank" rel="noopener"><strong>${contacts.mani.name}</strong></a><br><small>${contacts.mani.role} · ${contacts.mani.display} · WhatsApp</small><br><br><a href="https://wa.me/${contacts.purshottam.wa}" target="_blank" rel="noopener"><strong>${contacts.purshottam.name}</strong></a><br><small>${contacts.purshottam.role} · ${contacts.purshottam.display} · WhatsApp</small><br><br><a href="mailto:${contacts.email}">${contacts.email}</a></p></div>
      <div><strong>Locations</strong><p class="muted"><strong>Head Office:</strong><br>217, Chhipi Tank, Meerut, UP – 250001<br><a href="https://share.google/YtWdOuhbiAWm51v8w" target="_blank" rel="noopener">View Head Office on Google</a></p><p class="muted"><strong>Plant:</strong><br>68, Achronda Industrial Area, Partapur, Meerut, UP<br><a href="https://share.google/cPMTybP8TIPuiNzU8" target="_blank" rel="noopener">View Plant on Google</a></p></div>
      <div><strong>Business Links</strong><p><a href="products.html">Products</a><br><a href="research-development.html">R&D & Product Development</a><br><a href="case-study.html">8 Gauge Short Case Study</a><br><a href="get-a-quote.html">Get a Quote</a><br><a href="dealer-locator.html">Distribution Map</a><br><a href="become-a-dealer.html">Become a Distribution Partner</a><br><a href="technical-resources.html">Technical Resources</a><br><a href="faq.html">FAQs</a></p><p class="footer-legal"><a href="privacy-policy.html">Privacy Policy</a><br><a href="terms-and-conditions.html">Terms & Conditions</a><br><a href="official-notice.html">Official Notice</a></p></div>
    </div>`;
  });
});
