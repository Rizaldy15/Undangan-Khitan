(function () {
  'use strict';

  var body = document.body;
  var opening = document.getElementById('opening');
  var openButton = document.getElementById('open-invitation');
  var header = document.getElementById('site-header');
  var toTop = document.getElementById('to-top');

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  window.addEventListener('pageshow', function () {
    window.scrollTo(0, 0);
  });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('Copy failed'));
      } catch (error) {
        reject(error);
      }
      textarea.remove();
    });
  }

  function getGuestName() {
    var params = new URLSearchParams(window.location.search);
    var name = params.get('nama') || params.get('to') || params.get('kepada') || '';
    return name.trim().replace(/\s+/g, ' ').slice(0, 100);
  }

  var guestName = getGuestName();
  if (guestName) {
    document.getElementById('guest-name').textContent = guestName;
    document.querySelectorAll('[data-guest-name]').forEach(function (element) {
      element.textContent = guestName;
    });
    document.title = 'Undangan untuk ' + guestName + ' — Tasyakuran Khitan Thifal & Zafran';
    var rsvpName = document.querySelector('#rsvp-form input[name="name"]');
    if (rsvpName) rsvpName.value = guestName;
  }

  body.classList.add('is-locked');
  openButton.addEventListener('click', function () {
    window.scrollTo(0, 0);
    opening.classList.add('is-opened');
    body.classList.remove('is-locked');
    window.setTimeout(function () { opening.setAttribute('hidden', ''); }, 850);
  });

  function updateChrome() {
    var scrolled = window.scrollY > 40;
    header.classList.toggle('is-scrolled', scrolled);
    toTop.classList.toggle('is-visible', window.scrollY > 700);
  }
  updateChrome();
  window.addEventListener('scroll', updateChrome, { passive: true });
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  var revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px' });
  document.querySelectorAll('.reveal').forEach(function (element) { revealObserver.observe(element); });

  var navLinks = Array.from(document.querySelectorAll('.desktop-nav a, .mobile-nav a'));
  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var id = entry.target.id;
      navLinks.forEach(function (link) {
        link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
      });
    });
  }, { rootMargin: '-35% 0px -55%', threshold: 0 });
  document.querySelectorAll('[data-section]').forEach(function (section) { sectionObserver.observe(section); });

  var countdown = document.querySelector('[data-countdown]');
  if (countdown) {
    var target = new Date(countdown.dataset.countdown).getTime();
    var fields = {
      days: countdown.querySelector('[data-days]'),
      hours: countdown.querySelector('[data-hours]'),
      minutes: countdown.querySelector('[data-minutes]'),
      seconds: countdown.querySelector('[data-seconds]')
    };
    var pad = function (number, size) { return String(number).padStart(size || 2, '0'); };
    var tick = function () {
      var distance = Math.max(0, target - Date.now());
      fields.days.textContent = pad(Math.floor(distance / 86400000), 3);
      fields.hours.textContent = pad(Math.floor((distance % 86400000) / 3600000));
      fields.minutes.textContent = pad(Math.floor((distance % 3600000) / 60000));
      fields.seconds.textContent = pad(Math.floor((distance % 60000) / 1000));
      if (distance === 0) countdown.setAttribute('aria-label', 'Acara sedang atau telah berlangsung');
    };
    tick();
    window.setInterval(tick, 1000);
  }

  document.getElementById('add-calendar').addEventListener('click', function () {
    var calendar = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tasyakuran Khitan//ID',
      'BEGIN:VEVENT', 'UID:tasyakuran-khitan-thifal-zafran-2026',
      'DTSTAMP:20260802T090000Z', 'DTSTART;TZID=Asia/Jakarta:20261225T110000',
      'DTEND;TZID=Asia/Jakarta:20261225T140000', 'SUMMARY:Tasyakuran Khitan Thifal & Zafran',
      'LOCATION:Jl. Tawes II No. 262, Kayuringin Jaya, Bekasi Selatan, Kota Bekasi',
      'DESCRIPTION:Tasyakuran Khitan Thifal dan Zafran.',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tasyakuran-khitan-thifal-zafran.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  });

  var copyButton = document.getElementById('copy-address');
  copyButton.addEventListener('click', function () {
    var address = 'Jl. Tawes II No. 262, Kayuringin Jaya, Bekasi Selatan, Kota Bekasi';
    copyText(address).then(function () {
      copyButton.textContent = 'Alamat tersalin ✓';
      window.setTimeout(function () { copyButton.textContent = 'Salin alamat'; }, 2200);
    }).catch(function () {
      copyButton.textContent = address;
    });
  });

  var galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = lightbox.querySelector('img');
  var lightboxCaption = lightbox.querySelector('figcaption');
  var lightboxIndex = 0;
  var lastFocused;

  function showImage(index) {
    lightboxIndex = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[lightboxIndex];
    lightboxImage.src = item.dataset.src;
    lightboxImage.alt = item.querySelector('img').alt;
    lightboxCaption.textContent = item.dataset.caption || '';
  }
  function openLightbox(index) {
    lastFocused = document.activeElement;
    showImage(index);
    lightbox.hidden = false;
    body.classList.add('is-locked');
    requestAnimationFrame(function () { lightbox.classList.add('is-visible'); });
    lightbox.querySelector('.lightbox__close').focus();
  }
  function closeLightbox() {
    lightbox.classList.remove('is-visible');
    body.classList.remove('is-locked');
    window.setTimeout(function () {
      lightbox.hidden = true;
      lightboxImage.src = '';
      if (lastFocused) lastFocused.focus();
    }, 260);
  }
  galleryItems.forEach(function (item, index) { item.addEventListener('click', function () { openLightbox(index); }); });
  lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox__nav--prev').addEventListener('click', function () { showImage(lightboxIndex - 1); });
  lightbox.querySelector('.lightbox__nav--next').addEventListener('click', function () { showImage(lightboxIndex + 1); });
  lightbox.addEventListener('click', function (event) { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function (event) {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') showImage(lightboxIndex - 1);
    if (event.key === 'ArrowRight') showImage(lightboxIndex + 1);
  });

  var rsvpForm = document.getElementById('rsvp-form');
  var formResult = document.getElementById('form-result');
  rsvpForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(rsvpForm);
    var submitButton = rsvpForm.querySelector('button[type="submit"]');
    var endpoint = window.RSVP_GOOGLE_SCRIPT_URL || '';
    var payload = {
      invitedGuest: guestName || 'Tamu umum',
      name: String(data.get('name') || '').trim(),
      attendance: String(data.get('attendance') || ''),
      message: String(data.get('message') || '').trim(),
      website: String(data.get('website') || ''),
      pageUrl: window.location.href.slice(0, 500)
    };

    if (!endpoint || endpoint.indexOf('script.google.com/macros/s/') === -1) {
      formResult.textContent = 'Google Sheets belum dihubungkan. Masukkan URL Apps Script pada js/config.js.';
      formResult.classList.add('is-visible');
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Mengirim...';
    formResult.classList.remove('is-visible');

    fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function () {
      formResult.textContent = 'Reservasi berhasil dikirim. Terima kasih atas konfirmasinya.';
      formResult.classList.add('is-visible');
      rsvpForm.reset();
      var rsvpName = rsvpForm.querySelector('input[name="name"]');
      if (guestName && rsvpName) rsvpName.value = guestName;
    }).catch(function () {
      formResult.textContent = 'Reservasi belum berhasil dikirim. Periksa koneksi lalu coba kembali.';
      formResult.classList.add('is-visible');
    }).then(function () {
      submitButton.disabled = false;
      submitButton.textContent = 'Kirim Reservasi';
    });
  });
}());
