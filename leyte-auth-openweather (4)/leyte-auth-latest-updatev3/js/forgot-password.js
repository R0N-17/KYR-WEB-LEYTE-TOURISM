/* forgot-password.html only */

const forgotForm = document.getElementById('forgotForm');
const requestStep = document.getElementById('requestStep');
const sentStep = document.getElementById('sentStep');

forgotForm.addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;

  const email = document.getElementById('forgotEmail').value.trim();
  const submitBtn = form.querySelector('button[type=submit]');
  setLoading(submitBtn, true, 'Sending…');

  // TODO: send to your backend, e.g.
  // fetch('request_password_reset.php', { method: 'POST', body: new FormData(form) })
  //   .then(() => showSent(email))
  //   .catch(() => { setLoading(submitBtn, false); showAlert('danger', 'Something went wrong. Try again.'); });
  setTimeout(() => showSent(email), 500);
});

function showSent(email) {
  document.getElementById('sentToEmail').textContent = email;
  requestStep.classList.add('d-none');
  sentStep.classList.remove('d-none');
}

document.getElementById('resendBtn').addEventListener('click', function () {
  setLoading(this, true, 'Resending…');
  // TODO: send to your backend to resend the same link.
  setTimeout(() => {
    setLoading(this, false);
    showAlert('success', 'Reset link sent again.');
  }, 500);
});
