/* =========================================================
   Tony's Window Cleaning : measurement tags

   This file is loaded on every page, after the content, so adding
   Google Analytics 4 or a Google Ads conversion tag is a one file
   change instead of editing fifty pages.

   HOW TO TURN ON GA4
   1. Create the GA4 property at analytics.google.com and copy the
      Measurement ID. It looks like G-XXXXXXXXXX.
   2. Paste it into GA4_ID below. Nothing else changes.

   HOW TO TURN ON GOOGLE ADS CONVERSION TRACKING
   1. In Google Ads: Goals > Conversions > New conversion action >
      Website. Create two actions: "Phone click" and "Quote form".
   2. Copy the conversion ID (AW-XXXXXXXXX) into ADS_ID and the two
      labels into the matching fields below.
   Phone clicks fire on every tel: link. The form event fires when a
   quote form is submitted.
   ========================================================= */
(function () {
  'use strict';
  var GA4_ID = '';            // e.g. 'G-XXXXXXXXXX'
  var ADS_ID = '';            // e.g. 'AW-123456789'
  var ADS_LABEL_PHONE = '';   // e.g. 'AbCdEfGhIj'
  var ADS_LABEL_FORM = '';    // e.g. 'KlMnOpQrSt'

  if (!GA4_ID && !ADS_ID) return;

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + (GA4_ID || ADS_ID);
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  if (GA4_ID) gtag('config', GA4_ID);
  if (ADS_ID) gtag('config', ADS_ID);

  function conv(label) {
    if (ADS_ID && label) gtag('event', 'conversion', { send_to: ADS_ID + '/' + label });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="tel:"]');
    if (!a) return;
    if (GA4_ID) gtag('event', 'phone_click', { link_url: a.getAttribute('href') });
    conv(ADS_LABEL_PHONE);
  });

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.classList || !f.classList.contains('quote-form')) return;
    if (GA4_ID) gtag('event', 'generate_lead', { form_page: location.pathname });
    conv(ADS_LABEL_FORM);
  });
})();
