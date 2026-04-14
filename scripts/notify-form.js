var messages = {
  en: { subscribing: 'Subscribing...', subscribed: 'Subscribed!', error: 'Network error. Please try again.' },
  pt: { subscribing: 'A subscrever...', subscribed: 'Subscrito!', error: 'Erro de rede. Tente novamente.' },
  de: { subscribing: 'Wird abonniert...', subscribed: 'Abonniert!', error: 'Netzwerkfehler. Bitte versuchen Sie es erneut.' },
  nl: { subscribing: 'Bezig met inschrijven...', subscribed: 'Ingeschreven!', error: 'Netwerkfout. Probeer het opnieuw.' },
  es: { subscribing: 'Suscribiendo...', subscribed: '¡Suscrito!', error: 'Error de red. Inténtalo de nuevo.' },
};

document.querySelectorAll('.notify-form').forEach(function(form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    var button = form.querySelector('button');
    var input = form.querySelector('input[type="email"]');
    var originalText = button.textContent;
    var lang = document.documentElement.lang || 'en';
    lang = lang.substring(0, 2);
    var msg = messages[lang] || messages.en;
    var body = new FormData(form);
    body.append('lang', lang);

    button.textContent = msg.subscribing;
    button.disabled = true;
    input.disabled = true;

    try {
      var response = await fetch('/api/subscribe', {
        method: 'POST',
        body: body,
      });

      var data = await response.json();

      if (data.success) {
        button.textContent = msg.subscribed;
        button.classList.add('notify-btn-success');
        input.value = '';
        showMessage(form, data.message, 'success');
        if (typeof gtag === 'function') {
          var emailVal = body.get('email') || '';
          gtag('event', 'email_signup', {
            email_domain: emailVal.split('@')[1] || '',
            page: location.pathname,
            language: lang
          });
        }
      } else {
        button.textContent = originalText;
        button.disabled = false;
        input.disabled = false;
        showMessage(form, data.error, 'error');
      }
    } catch (error) {
      button.textContent = originalText;
      button.disabled = false;
      input.disabled = false;
      showMessage(form, msg.error, 'error');
    }
  });
});

function showMessage(form, text, type) {
  var existing = form.parentElement.querySelector('.notify-message');
  if (existing) existing.remove();

  var msg = document.createElement('p');
  msg.className = 'notify-message notify-message-' + type;
  msg.textContent = text;
  form.parentElement.insertBefore(msg, form.nextSibling);

  if (type === 'error') {
    setTimeout(function() { msg.remove(); }, 5000);
  }
}
