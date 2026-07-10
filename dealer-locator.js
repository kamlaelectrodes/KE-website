document.addEventListener('DOMContentLoaded', () => {
  const queryInput = document.getElementById('dealerQuery');
  const searchBtn = document.getElementById('searchDealers');
  const locationBtn = document.getElementById('useLocation');
  const resetBtn = document.getElementById('resetDealers');
  const results = document.getElementById('dealerResults');
  const count = document.getElementById('dealerCount');
  const status = document.getElementById('dealerStatus');
  const empty = document.getElementById('noDealers');
  const cityCoverage = document.getElementById('cityCoverage');

  const companyPhoneDisplay = '+91 94122 05763';
  const companyPhoneDial = '+919412205763';
  const companyWhatsApp = '919412205763';
  const companyEmail = 'contact@kamlaelectrodes.com';

  const cityEnquiries = [
    ['Meerut','Uttar Pradesh','North India'],
    ['Ghaziabad','Uttar Pradesh','Delhi NCR'],
    ['Noida & Greater Noida','Uttar Pradesh','Delhi NCR'],
    ['Delhi NCR','Delhi','North India'],
    ['Hapur','Uttar Pradesh','North India'],
    ['Modinagar','Uttar Pradesh','North India'],
    ['Muzaffarnagar','Uttar Pradesh','North India'],
    ['Baghpat','Uttar Pradesh','North India'],
    ['Budaun','Uttar Pradesh','North India'],
    ['Hathras','Uttar Pradesh','North India'],
    ['Agra','Uttar Pradesh','North India'],
    ['Mathura','Uttar Pradesh','North India'],
    ['Bareilly','Uttar Pradesh','North India'],
    ['Moradabad','Uttar Pradesh','North India'],
    ['Lucknow','Uttar Pradesh','Central UP'],
    ['Kanpur','Uttar Pradesh','Central UP'],
    ['Prayagraj','Uttar Pradesh','Eastern UP'],
    ['Varanasi','Uttar Pradesh','Eastern UP'],
    ['Gorakhpur','Uttar Pradesh','Eastern UP'],
    ['Dehradun','Uttarakhand','North India'],
    ['Haridwar','Uttarakhand','North India'],
    ['Rishikesh','Uttarakhand','North India'],
    ['Rudrapur','Uttarakhand','North India'],
    ['Patna','Bihar','East India'],
    ['Ranchi','Jharkhand','East India'],
    ['Jamshedpur','Jharkhand','East India'],
    ['Dhanbad','Jharkhand','East India'],
    ['Kolkata','West Bengal','East India']
  ];

  let dealers = [];
  let userLocation = null;

  const escapeHtml = value => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const normalize = value => String(value || '').toLowerCase().trim();
  const toRad = value => (value * Math.PI) / 180;
  const getDistanceKm = (a, b) => {
    if (!a || !b || typeof b.lat !== 'number' || typeof b.lng !== 'number') return null;
    const earthRadiusKm = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const sinLat = Math.sin(dLat / 2);
    const sinLng = Math.sin(dLng / 2);
    const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    return 2 * earthRadiusKm * Math.asin(Math.sqrt(h));
  };

  const dealerSearchText = dealer => [
    dealer.name,
    dealer.city,
    dealer.state,
    dealer.region,
    dealer.address,
    dealer.coverage,
    Array.isArray(dealer.brands) ? dealer.brands.join(' ') : ''
  ].map(normalize).join(' ');

  const cleanPhoneHref = phone => {
    const cleaned = String(phone || '').replace(/[^+\d]/g, '');
    return cleaned && /\d/.test(cleaned) ? `tel:${cleaned}` : '';
  };

  const dealerCard = dealer => {
    const distance = userLocation ? getDistanceKm(userLocation, dealer) : null;
    const name = dealer.name || 'Dealer name available on request';
    const cityState = [dealer.city, dealer.state].filter(Boolean).join(', ') || 'Available on request';
    const mapsUrl = dealer.googleMapsUrl || (dealer.lat && dealer.lng
      ? `https://www.google.com/maps/search/?api=1&query=${dealer.lat},${dealer.lng}`
      : `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${dealer.city || ''} ${dealer.state || ''}`)}`);
    const brands = Array.isArray(dealer.brands) && dealer.brands.length ? dealer.brands.join(', ') : 'Available on request';
    const phone = dealer.phone || 'Available on request';
    const email = dealer.email || 'Available on request';
    const phoneHref = phone !== 'Available on request' ? cleanPhoneHref(phone) : '';
    const emailMarkup = email !== 'Available on request'
      ? `<a href="mailto:${encodeURIComponent(email)}">${escapeHtml(email)}</a>`
      : escapeHtml(email);
    const phoneMarkup = phoneHref
      ? `<a href="${phoneHref}">${escapeHtml(phone)}</a>`
      : escapeHtml(phone);

    return `
      <article class="card dealer-card">
        <div class="dealer-title-row">
          <div>
            <span class="badge">${dealer.authorised === false ? 'Dealer Listing' : 'Authorised Distribution Partner'}</span>
            <h3>${escapeHtml(name)}</h3>
          </div>
          ${distance !== null ? `<span class="distance">${distance.toFixed(1)} km</span>` : ''}
        </div>
        <p class="muted"><strong>Location:</strong> ${escapeHtml(cityState)}</p>
        <p class="muted"><strong>Coverage:</strong> ${escapeHtml(dealer.coverage || 'Available on request')}</p>
        <p class="muted"><strong>Address:</strong> ${escapeHtml(dealer.address || 'Available on request')}</p>
        <p class="muted"><strong>Phone:</strong> ${phoneMarkup}<br><strong>Email:</strong> ${emailMarkup}</p>
        <p class="muted"><strong>Products:</strong> ${escapeHtml(brands)}</p>
        <div class="cta-row">
          <a class="button button-primary" href="${escapeHtml(mapsUrl)}" target="_blank" rel="noopener">View on Map</a>
          <a class="button button-secondary" href="mailto:${companyEmail}?subject=${encodeURIComponent(`Confirm Kamla Electrodes availability - ${cityState}`)}">Confirm Availability</a>
        </div>
      </article>`;
  };

  const renderDealers = list => {
    if (!results || !count || !empty) return;
    const active = list.filter(dealer => dealer.status !== 'inactive');
    results.innerHTML = active.map(dealerCard).join('');
    empty.hidden = active.length > 0;
    count.textContent = active.length
      ? `${active.length} public ${active.length === 1 ? 'entry' : 'entries'} found.`
      : 'No public authorised entry matched this search.';
  };

  const renderCityDirectory = () => {
    if (!cityCoverage) return;
    cityCoverage.innerHTML = cityEnquiries.map(([city, state, region]) => {
      const subject = `Welding electrode supply enquiry - ${city}, ${state}`;
      const message = `Hello Kamla Electrodes, I need welding electrode supply guidance for ${city}, ${state}. Please contact me regarding product/brand, size, quantity and the nearest available supply route.`;
      return `<article class="city-enquiry-card">
        <span class="badge">City Enquiry Desk</span>
        <h3>${escapeHtml(city)}</h3>
        <p>${escapeHtml(state)} · ${escapeHtml(region)}</p>
        <p>This route connects directly to Kamla Electrodes while verified local distribution details are expanded.</p>
        <div class="city-enquiry-actions">
          <a href="tel:${companyPhoneDial}" aria-label="Call Kamla Electrodes for ${escapeHtml(city)}">Call</a>
          <a href="mailto:${companyEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}">Email</a>
          <a href="https://wa.me/${companyWhatsApp}?text=${encodeURIComponent(message)}" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </article>`;
    }).join('');
  };

  const search = () => {
    if (!queryInput || !status) return;
    const query = normalize(queryInput.value);
    let filtered = dealers.filter(dealer => dealer.status !== 'inactive');
    if (query) filtered = filtered.filter(dealer => dealerSearchText(dealer).includes(query));
    if (userLocation) {
      filtered = filtered.slice().sort((a, b) => {
        const distanceA = getDistanceKm(userLocation, a) ?? Number.POSITIVE_INFINITY;
        const distanceB = getDistanceKm(userLocation, b) ?? Number.POSITIVE_INFINITY;
        return distanceA - distanceB;
      });
    }
    status.textContent = filtered.length
      ? 'Showing public distribution entries. Please confirm current stock and authorisation before purchase.'
      : 'No public authorised entry matched. Use the city enquiry directory below or contact Kamla Electrodes directly.';
    renderDealers(filtered);
  };

  renderCityDirectory();

  fetch('data/dealers.json', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Dealer data unavailable');
      return response.json();
    })
    .then(data => {
      dealers = Array.isArray(data.dealers) ? data.dealers : [];
      if (status) status.textContent = dealers.length
        ? 'Search by city, state, region or product brand. City enquiry routes remain available below.'
        : `The public dealer list is being updated. Call ${companyPhoneDisplay} or use the city enquiry directory.`;
      renderDealers(dealers);
    })
    .catch(() => {
      dealers = [];
      if (status) status.textContent = `The public dealer list is temporarily unavailable. Call ${companyPhoneDisplay} or use the city enquiry directory.`;
      renderDealers(dealers);
    });

  searchBtn?.addEventListener('click', search);
  queryInput?.addEventListener('keydown', event => { if (event.key === 'Enter') search(); });

  resetBtn?.addEventListener('click', () => {
    if (!queryInput || !status) return;
    queryInput.value = '';
    userLocation = null;
    status.textContent = dealers.length
      ? 'Showing all current public distribution entries.'
      : 'The public dealer list is being updated. City enquiry routes remain available below.';
    renderDealers(dealers);
  });

  locationBtn?.addEventListener('click', () => {
    if (!status) return;
    if (!navigator.geolocation) {
      status.textContent = 'Location search is not supported by this browser. Search by city/state or use the city directory.';
      return;
    }
    status.textContent = 'Requesting location permission…';
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        status.textContent = 'Location accepted. Sorting public entries by approximate distance.';
        search();
      },
      () => {
        status.textContent = 'Location permission was not granted. Search by city/state or use the city enquiry directory.';
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });
});
