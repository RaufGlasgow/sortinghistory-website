// CTA click tracking — instruments links with data-cta attribute
document.querySelectorAll('[data-cta]').forEach(function(el) {
  el.addEventListener('click', function() {
    if (typeof gtag === 'function') {
      gtag('event', 'cta_click', {
        cta_type: el.dataset.cta,
        cta_url: el.href || '',
        page: location.pathname,
        language: document.documentElement.lang || 'en'
      });
    }
  });
});
