/* Shared by login.html and register.html */

/* Login sessions are handled by the PHP server (api/*.php). The browser only holds the session cookie.
   "Keep me logged in" makes that cookie last 30 days; otherwise it ends when the browser closes. */
const Session = {
  // replace() keeps the dashboard out of the Back button history
  toLogin() { window.location.replace('login.html'); }
};

/* Calls api/<endpoint> with a JSON body. Always resolves to { ok, message, ...data }. */
async function api(endpoint, body) {
  let res;
  try {
    res = await fetch('api/' + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(body || {})
    });
  } catch (err) {
    return { ok: false, offline: true,
      message: "Can't reach the server. Start it with `php -S localhost:8000 router.php` in the project folder, then open http://localhost:8000/login.html (not as a file)." };
  }
  try {
    return await res.json();
  } catch (err) {
    // The server answered, but not with JSON: PHP isn't running for this address (Live Server, XAMPP path, etc.) or PHP crashed.
    return { ok: false, offline: true,
      message: "The server answered, but PHP didn't run (HTTP " + res.status + "). Open the site through PHP, for example http://localhost:8000/login.html, not with Live Server." };
  }
}

const alertBox = document.getElementById('formAlert');

function showAlert(type, message) {
  alertBox.className = 'alert alert-' + type;
  alertBox.textContent = message;
}
function hideAlert() { alertBox.className = 'alert d-none'; }

/* Toggle a submit button between its normal label and a spinner, so a click feels like it did something. */
function setLoading(btn, loading, loadingText) {
  if (loading) {
    btn.dataset.label = btn.dataset.label || btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${loadingText}`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.label || btn.innerHTML;
  }
}

// Show / hide password
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    btn.innerHTML = '<i class="bi bi-eye' + (show ? '-slash' : '') + '"></i>';
  });
});

/* ---------- Gmail detection ---------- */
document.querySelectorAll('input[type=email]').forEach(input => {
  const note = document.createElement('div');
  note.className = 'gmail-note small d-none';
  note.setAttribute('aria-live', 'polite');
  input.insertAdjacentElement('afterend', note);

  input.addEventListener('input', () => {
    const domain = input.value.includes('@') ? input.value.trim().split('@').pop().toLowerCase() : '';
    const isGmail = /^gmail(\.(c|co|com)?)?$/.test(domain);   // turns green as soon as "@gmail" is typed
    const complete = domain === 'gmail.com';
    input.classList.toggle('is-gmail', isGmail);
    note.classList.toggle('d-none', !isGmail);
    note.innerHTML = '<i class="bi bi-google"></i> ' + (complete ? 'Gmail address detected' : 'Gmail detected. Finish with @gmail.com');
    input.setCustomValidity(isGmail && !complete ? 'Finish typing @gmail.com' : '');
  });
});

/* ---------- Place slideshow ---------- */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  bootstrap.Carousel.getOrCreateInstance('#placeCarousel').pause();   // no auto-advance for people who prefer less motion
}

/* Remove a slide photo if its file is missing, so the drawn scene shows instead */
document.querySelectorAll('.slide-photo').forEach(img => {
  if (img.complete && !img.naturalWidth) img.remove();
  else img.addEventListener('error', () => img.remove());
});

/* ---------- Royal UI interactions (visual only, safe on every page) ---------- */
// Ripple on any button click
document.addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn || btn.disabled) return;
  const r = btn.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const dot = document.createElement('span');
  dot.className = 'ripple';
  dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
  btn.appendChild(dot);
  dot.addEventListener('animationend', () => dot.remove());
});

// Spotlight that follows the mouse across cards
document.addEventListener('mousemove', e => {
  const card = e.target.closest('.place-card, .quick-card');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
  card.style.setProperty('--my', (e.clientY - r.top) + 'px');
});

// Nav gains a shadow once the page scrolls
const dashNav = document.querySelector('.dash-nav');
if (dashNav) {
  const onScroll = () => dashNav.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
