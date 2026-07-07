document.addEventListener('DOMContentLoaded', () => {
  const queryInput = document.getElementById('dealerQuery');
  const searchBtn = document.getElementById('searchDealers');
  const locationBtn = document.getElementById('useLocation');
  const resetBtn = document.getElementById('resetDealers');
  const results = document.getElementById('dealerResults');
  const count = document.getElementById('dealerCount');
  const status = document.getElementById('dealerStatus');
  const empty = document.getElementById('noDealers');

  let dealers = [];
  let userLocation = null;

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

  const normalize = value => String(value || '').toLowerCase().trim();

  const dealerSearchText = dealer => [
    dealer.name,
    dealer.city,
    dealer.state,
    dealer.region,
    dealer.address,
    dealer.coverage,
    Array.isArray(dealer.brands) ? dealer.brands.join(' ') : ''
  ].map(normalize).join(' ');

  const dealerCard = dealer => {
    const distance = userLocation ? getDistanceKm(userLocation, dealer) : null;
    const mapsUrl = dealer.googleMapsUrl || (dealer.lat && dealer.lng ? `https://www.google.com/maps/search/?api=1&query=${dealer.lat},${dealer.lng}` : `https://www.google.com/maps/search/${encodeURIComponent(`${dealer.name || 'Kamla Electrodes dealer'} ${dealer.city || ''} ${dealer.state || ''}`)}`);
    const brands = Array.isArray(dealer.brands) && dealer.brands.length ? dealer.brands.join(', ') : 'Available on request';
    const phone = dealer.phone || 'Available on request';
    const email = dealer.email || 'Available on request';
    const address = dealer.address || 'Available on request';
    const coverage = dealer.coverage || 'Available on request';

    return `
      <article class="card dealer-card">
        <div class="dealer-title-row">
          <div>
            <span class="badge">${dealer.authorised === false ? 'Dealer' : 'Authorised Dealer'}</span>
            <h3>${dealer.name || 'Dealer name available on request'}</h3>
          </div>
          ${distance !== null ? `<span class="distance">${distance.toFixed(1)} km</span>` : ''}
        </div>
        <p class="muted"><strong>Location:</strong> ${[dealer.city, dealer.state].filter(Boolean).join(', ') || 'Available on request'}</p>
        <p class="muted"><strong>Coverage:</strong> ${coverage}</p>
        <p class="muted"><strong>Address:</strong> ${address}</p>
        <p class="muted"><strong>Phone:</strong> ${phone}<br><strong>Email:</strong> ${email}</p>
        <p class="muted"><strong>Products:</strong> ${brands}</p>
        <div class="cta-row">
          <a class="button button-primary" href="${mapsUrl}" target="_blank" rel="noopener">View on Map</a>
          <a class="button button-secondary" href="contact.html">Confirm Availability</a>
        </div>
      </article>`;
  };

  const render = list => {
    const active = list.filter(dealer => dealer.status !== 'inactive');
    results.innerHTML = active.map(dealerCard).join('');
    empty.hidden = active.length > 0;
    count.textContent = active.length
      ? `${active.length} dealer ${active.length === 1 ? 'entry' : 'entries'} found.`
      : 'No public dealer entries available yet.';
  };

  const search = () => {
    const query = normalize(queryInput.value);
    let filtered = dealers.filter(dealer => dealer.status !== 'inactive');

    if (query) {
      filtered = filtered.filter(dealer => dealerSearchText(dealer).includes(query));
    }

    if (userLocation) {
      filtered = filtered.slice().sort((a, b) => {
        const distanceA = getDistanceKm(userLocation, a) ?? Number.POSITIVE_INFINITY;
        const distanceB = getDistanceKm(userLocation, b) ?? Number.POSITIVE_INFINITY;
        return distanceA - distanceB;
      });
    }

    status.textContent = filtered.length
      ? 'Showing available public dealer entries. Please confirm stock and current authorisation before purchase.'
      : 'Dealer information for this area is available on request. Please send an enquiry for confirmation.';
    render(filtered);
  };

  fetch('data/dealers.json', { cache: 'no-store' })
    .then(response => {
      if (!response.ok) throw new Error('Dealer data unavailable');
      return response.json();
    })
    .then(data => {
      dealers = Array.isArray(data.dealers) ? data.dealers : [];
      status.textContent = dealers.length
        ? 'Search by city, state, product brand, or use your current location to find available authorised dealer entries.'
        : 'Dealer list is being updated. You can still send an enquiry for your area.';
      render(dealers);
    })
    .catch(() => {
      dealers = [];
      status.textContent = 'Dealer list is temporarily unavailable. Please contact Kamla Electrodes for dealer assistance.';
      render(dealers);
    });

  searchBtn?.addEventListener('click', search);
  queryInput?.addEventListener('keydown', event => {
    if (event.key === 'Enter') search();
  });

  resetBtn?.addEventListener('click', () => {
    queryInput.value = '';
    userLocation = null;
    status.textContent = dealers.length
      ? 'Showing all available public dealer entries.'
      : 'Dealer list is being updated. You can still send an enquiry for your area.';
    render(dealers);
  });

  locationBtn?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      status.textContent = 'Location search is not supported by this browser. Please search by city or state.';
      return;
    }

    status.textContent = 'Requesting location permission…';
    navigator.geolocation.getCurrentPosition(
      position => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        status.textContent = 'Location accepted. Sorting available dealers by approximate distance.';
        search();
      },
      () => {
        status.textContent = 'Location permission was not granted. You can still search by city, state, or region.';
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  });
});
