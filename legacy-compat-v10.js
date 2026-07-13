(function () {
  'use strict';

  function placeFinalStylesheetLast() {
    var link = document.querySelector('link[href*="professional-fixes-v10.css"]');
    if (link && link.parentNode === document.head) document.head.appendChild(link);
  }

  function supportsWebP() {
    try {
      var canvas = document.createElement('canvas');
      if (!canvas.getContext) return false;
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (error) {
      return false;
    }
  }

  function normaliseStockImages() {
    var format = supportsWebP() ? 'webp' : 'jpg';
    var images = document.querySelectorAll('img[src*="images.unsplash.com"]');
    Array.prototype.forEach.call(images, function (image) {
      try {
        var url = new URL(image.src, window.location.href);
        url.searchParams.set('fm', format);
        url.searchParams.set('auto', 'format');
        url.searchParams.set('fit', 'crop');
        if (!url.searchParams.has('w') || Number(url.searchParams.get('w')) > 1200) {
          url.searchParams.set('w', '1200');
        }
        url.searchParams.set('q', '72');
        image.src = url.toString();
      } catch (error) {
        /* Keep the original image URL if URL parsing is unavailable. */
      }
    });
  }

  function cssImageValue(variableName) {
    var raw = window.getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    if (!raw) return '';
    var match = raw.match(/^url\(["']?(.*?)["']?\)$/i);
    return match ? match[1] : raw;
  }

  var lightbox;
  var lightboxSource;
  var lightboxImage;
  var lightboxCaption;
  var lastTrigger;

  function ensureLightbox() {
    if (lightbox) return lightbox;
    lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.hidden = true;
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Facility image viewer');
    lightbox.innerHTML = '<div class="image-lightbox-dialog">' +
      '<button class="image-lightbox-close" type="button" aria-label="Close image viewer">×</button>' +
      '<picture><source type="image/webp"><img alt=""></picture>' +
      '<p class="image-lightbox-caption"></p>' +
      '</div>';
    document.body.appendChild(lightbox);
    lightboxSource = lightbox.querySelector('source');
    lightboxImage = lightbox.querySelector('img');
    lightboxCaption = lightbox.querySelector('.image-lightbox-caption');

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.classList.remove('image-lightbox-open');
      if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
    }

    lightbox.querySelector('.image-lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && lightbox && !lightbox.hidden) closeLightbox();
    });
    return lightbox;
  }

  function openLightbox(trigger, asset) {
    ensureLightbox();
    lastTrigger = trigger;
    lightboxSource.setAttribute('srcset', asset.webp);
    lightboxImage.setAttribute('src', asset.fallback);
    lightboxImage.setAttribute('alt', asset.alt);
    lightboxCaption.textContent = asset.caption;
    lightbox.hidden = false;
    document.body.classList.add('image-lightbox-open');
    lightbox.querySelector('.image-lightbox-close').focus();
  }

  function buildPictureButton(node, asset) {
    if (node.classList.contains('facility-photo-button')) return;
    if (!asset.fallback) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'facility-photo facility-photo-button ' + asset.className;
    button.setAttribute('aria-label', 'Open larger image: ' + asset.alt);
    button.style.setProperty('--facility-position', asset.position);

    var picture = document.createElement('picture');
    var source = document.createElement('source');
    source.type = 'image/webp';
    source.srcset = asset.webp;
    var image = document.createElement('img');
    image.src = asset.fallback;
    image.alt = asset.alt;
    image.width = asset.width;
    image.height = asset.height;
    image.loading = node.closest && node.closest('.home-facility') ? 'eager' : 'lazy';
    image.decoding = 'async';
    image.style.objectPosition = asset.position;
    image.addEventListener('error', function () {
      if (source.parentNode) source.parentNode.removeChild(source);
      if (image.getAttribute('src') !== asset.fallback) image.setAttribute('src', asset.fallback);
    });
    picture.appendChild(source);
    picture.appendChild(image);
    button.appendChild(picture);
    button.addEventListener('click', function () { openLightbox(button, asset); });
    node.parentNode.replaceChild(button, node);
  }

  function hydrateFacilityImages() {
    var assets = [
      {
        selector: '.facility-photo.plant-photo,.ke-hydrated-photo.plant-photo',
        className: 'plant-photo',
        webp: 'plant-partapur.webp',
        fallback: cssImageValue('--ke-plant-image'),
        width: 1000,
        height: 308,
        position: 'center',
        alt: 'Kamla Electrodes manufacturing plant at Partapur, Meerut',
        caption: 'Kamla Electrodes manufacturing plant — Partapur, Meerut'
      },
      {
        selector: '.facility-photo.office-photo,.ke-hydrated-photo.office-photo',
        className: 'office-photo',
        webp: 'head-office-chhipi-tank.webp',
        fallback: cssImageValue('--ke-office-image'),
        width: 480,
        height: 711,
        position: 'center 22%',
        alt: 'Kamla Complex head office at Chhipi Tank, Meerut',
        caption: 'Kamla Complex head office — Chhipi Tank, Meerut'
      }
    ];

    assets.forEach(function (asset) {
      var nodes = document.querySelectorAll(asset.selector);
      Array.prototype.forEach.call(nodes, function (node) {
        buildPictureButton(node, asset);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    placeFinalStylesheetLast();
    normaliseStockImages();
    hydrateFacilityImages();
    window.setTimeout(function () {
      placeFinalStylesheetLast();
      hydrateFacilityImages();
    }, 350);
    window.setTimeout(function () {
      placeFinalStylesheetLast();
      hydrateFacilityImages();
    }, 1200);
    window.setTimeout(function () {
      placeFinalStylesheetLast();
      hydrateFacilityImages();
    }, 2400);
  });
})();
