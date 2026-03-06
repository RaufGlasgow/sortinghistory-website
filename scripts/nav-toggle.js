document.addEventListener('DOMContentLoaded', function() {
  var toggle = document.querySelector('.nav-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', function() {
    var links = document.querySelector('.nav-links');
    var lang = document.querySelector('.lang-picker');
    var isOpen = links.classList.contains('nav-open');

    links.classList.toggle('nav-open');
    if (lang) lang.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', !isOpen);
    toggle.textContent = isOpen ? '\u2630' : '\u2715';
  });
});
