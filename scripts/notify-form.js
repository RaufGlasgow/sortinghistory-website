document.querySelectorAll('.notify-form').forEach(function(form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    var button = form.querySelector('button');
    var input = form.querySelector('input[type="email"]');
    var originalText = button.textContent;
    var body = new FormData(form);

    button.textContent = 'Subscribing...';
    button.disabled = true;
    input.disabled = true;

    try {
      var response = await fetch('/api/subscribe', {
        method: 'POST',
        body: body,
      });

      var data = await response.json();

      if (data.success) {
        button.textContent = 'Subscribed!';
        button.classList.add('notify-btn-success');
        input.value = '';
        showMessage(form, data.message, 'success');
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
      showMessage(form, 'Network error. Please try again.', 'error');
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
