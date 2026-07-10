document.addEventListener('DOMContentLoaded', () => {
  const queryInput = document.getElementById('dealerQuery');
  const searchBtn = document.getElementById('searchDealers');
  const locationBtn = document.getElementById('useLocation');
  const resetBtn = document.getElementById('resetDealers');
  const results = document.getElementById('dealerResults');
  const count = document.getElementById('dealerCount');
  const status = document.getElementById('dealerStatus');
  const empty = document.getElementById('noDealers');

  const companyPhoneDisplay = '+91 94122 05763';
  const companyEmail = 'contact@kamlaelectrodes.com';
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
    const name = dealer.name || 'Dealer details available on request';
    const cityState = [dealer.city, dealer.state].filter(Boolean).join(', ') || 'Location available on request';
    const mapsUrl = dealer.googleMapsUrl || (dealer.lat && dealer.lng
      ? `https://www.google.com/maps/search/?api=1&query=${dealer.lat},${dealer.lng}`
      : `https://www.google.com/maps/search/${encodeURIComponent(`${name} ${dealer.city || ''} ${dealer.state || ''}`)}`);
    const brands = Array.isArray(dealer.brands) && dealer.brands.length ? dealer.brands.join(', ') : 'Product details available on request';
    const phone = dealer.phone || 'Available on request';
    const email = dealer.email || 'Available on request';
    const phoneHref = phone !== 'Available on request' ? cleanPhoneHref(phone) : '';
    const emailMarkup = email !== 'Available on request'
      ? `<a href="mailto:${encodeURIComponent(email)}">${escapeHtml(email)}</a>`
      : escapeHtml(email);
    const phoneMarkup = phoneHref ? `<a href="${phoneHref}">${escapeHtml(phone)}</a>` : escapeHtml(phone);

    return `
      <article class="card dealer-card">
        <div class="dealer-title-row">
          <div><span class="badge">${dealer.authorised === false ? 'Dealer Listing' : 'Authorised Distribution Partner'}</span><h3>${escapeHtml(name)}</h3></div>
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
      ? 'Showing current public distribution entries. Confirm stock and commercial terms before purchase.'
      : 'No public authorised entry matched. Use the national enquiry route for direct product and quotation support.';
    renderDealers(filtered);
  };

  fetch('data/dealers.json', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Dealer data unavailable');
      return response.json();
    })
    .then(data => {
      dealers = Array.isArray(data.dealers) ? data.dealers : [];
      if (status) status.textContent = dealers.length
        ? 'Search by location, state, region or product brand.'
        : `The public dealer list is being updated. Call ${companyPhoneDisplay} or use the national enquiry route.`;
      renderDealers(dealers);
    })
    .catch(() => {
      dealers = [];
      if (status) status.textContent = `The public dealer list is temporarily unavailable. Call ${companyPhoneDisplay} or use the national enquiry route.`;
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
      : 'The public dealer list is being updated. Use the national enquiry route for direct support.';
    renderDealers(dealers);
  });

  locationBtn?.addEventListener('click', () => {
    if (!status) return;
    if (!navigator.geolocation) {
      status.textContent = 'Location search is not supported by this browser. Search by state or region instead.';
      return;
    }
    status.textContent = 'Requesting location permission…';
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        status.textContent = 'Location accepted. Sorting public entries by approximate distance.';
        search();
      },
      () => { status.textContent = 'Location permission was not granted. Search by state or region instead.'; },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });
});
