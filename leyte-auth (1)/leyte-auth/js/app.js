const alertBox = document.getElementById('formAlert');

function showAlert(type, message) {
  alertBox.className = 'alert alert-' + type;
  alertBox.textContent = message;
}
function hideAlert() { alertBox.className = 'alert d-none'; }

// Switch tabs from the text links under each form
document.querySelectorAll('[data-goto]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    bootstrap.Tab.getOrCreateInstance(document.getElementById(link.dataset.goto)).show();
  });
});
document.querySelectorAll('#authTabs button').forEach(tab =>
  tab.addEventListener('shown.bs.tab', hideAlert));

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

// Password strength
const regPassword = document.getElementById('regPassword');
const regConfirm  = document.getElementById('regConfirm');
const bar  = document.getElementById('strengthBar');
const text = document.getElementById('strengthText');

function passwordScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[a-z]/i.test(pw) && /\d/.test(pw)) s++;
  if (pw.length >= 12 || (/[A-Z]/.test(pw) && /[a-z]/.test(pw))) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
regPassword.addEventListener('input', () => {
  const pw = regPassword.value;
  const levels = [
    { w: '0%',   c: '#dbe6e6', t: 'At least 8 characters, with a letter and a number.' },
    { w: '25%',  c: '#dc3545', t: 'Weak' },
    { w: '50%',  c: '#F2A541', t: 'Fair' },
    { w: '75%',  c: '#2FA4A0', t: 'Good' },
    { w: '100%', c: '#198754', t: 'Strong' }
  ];
  const l = levels[pw ? Math.max(1, passwordScore(pw)) : 0];
  bar.style.width = l.w;
  bar.style.backgroundColor = l.c;
  text.textContent = l.t;
  if (regConfirm.value) checkMatch();
});

// Custom checks layered on Bootstrap validation
function checkPasswordRules() {
  const pw = regPassword.value;
  regPassword.setCustomValidity(pw.length >= 8 && /[a-z]/i.test(pw) && /\d/.test(pw) ? '' : 'invalid');
}
function checkMatch() {
  regConfirm.setCustomValidity(regConfirm.value === regPassword.value ? '' : 'mismatch');
}
regPassword.addEventListener('input', checkPasswordRules);
regConfirm.addEventListener('input', checkMatch);

// Login submit
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;

  // TODO: send to your backend, e.g.
  // fetch('login.php', { method: 'POST', body: new FormData(form) })
  showAlert('success', 'Login form is valid. Connect it to your backend to sign in.');
});

// Register submit
document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.target;
  checkPasswordRules();
  checkMatch();
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;

  // TODO: send to your backend, e.g.
  // fetch('register.php', { method: 'POST', body: new FormData(form) })
  // Hash passwords on the server (for example, password_hash() in PHP), never in the browser.
  // After the account is saved successfully, start the preference questionnaire.
  hideAlert();
  openQuestionnaire();
});

/* ---------- Preference questionnaire ---------- */

// Sample data. Replace with records from your destinations table.
// "view" = sunrise on east-facing coasts (Leyte Gulf side), sunset on west-facing coasts (Ormoc Bay / Camotes Sea side).
const PLACES = [
  { name: 'Kalanggaman Island', town: 'Palompon', cats: ['beach', 'nature'], area: 'rural', time: ['morning', 'afternoon'], view: 'sunset',
    blurb: 'A long white sandbar with clear water on both sides.' },
  { name: 'Cuatro Islas', town: 'Inopacan', cats: ['beach', 'nature'], area: 'rural', time: ['morning', 'afternoon'], view: 'sunset',
    blurb: 'Small islands with white sand and calm coves for a day trip.' },
  { name: 'Lake Danao Natural Park', town: 'Ormoc City', cats: ['nature'], area: 'rural', time: ['morning', 'afternoon'], view: null,
    blurb: 'A guitar-shaped mountain lake with cool air and morning mist.' },
  { name: 'Mahagnao Volcano Natural Park', town: 'Burauen', cats: ['nature'], area: 'rural', time: ['morning'], view: null,
    blurb: 'Forest trails around a crater lake.' },
  { name: 'Mount Pangasugan', town: 'Baybay City', cats: ['nature'], area: 'rural', time: ['morning'], view: null,
    blurb: 'A forested mountain in the Leyte range, known for hiking trails.' },
  { name: 'San Juanico Bridge', town: 'Tacloban City', cats: ['landmark'], area: 'urban', time: ['morning', 'afternoon'], view: 'sunrise',
    blurb: 'The long bridge linking Leyte and Samar, best at first light.' },
  { name: 'MacArthur Landing Memorial National Park', town: 'Palo', cats: ['history', 'landmark'], area: 'urban', time: ['morning', 'afternoon'], view: 'sunrise',
    blurb: 'Statues on the shore of Leyte Gulf mark the 1944 landing.' },
  { name: 'Palo Metropolitan Cathedral', town: 'Palo', cats: ['history'], area: 'urban', time: ['morning', 'afternoon'], view: null,
    blurb: 'A centuries-old church in Palo, close to the landing memorial.' },
  { name: 'Santo Niño Shrine and Heritage Museum', town: 'Tacloban City', cats: ['history'], area: 'urban', time: ['morning', 'afternoon'], view: null,
    blurb: 'A heritage museum and shrine in the city center.' },
  { name: 'Price Mansion', town: 'Tacloban City', cats: ['history'], area: 'urban', time: ['morning', 'afternoon'], view: null,
    blurb: 'A historic mansion in Tacloban tied to the 1944 Leyte campaign.' },
  { name: 'Ormoc City Boulevard', town: 'Ormoc City', cats: ['landmark'], area: 'urban', time: ['afternoon', 'evening'], view: 'sunset',
    blurb: 'A seaside promenade on Ormoc Bay for an evening walk.' }
];

const CATS = [
  ['beach', 'bi-water', 'Beaches & islands'],
  ['nature', 'bi-tree', 'Nature & lakes'],
  ['history', 'bi-bank', 'Historical & cultural'],
  ['landmark', 'bi-geo-alt', 'Landmarks & viewpoints']
];
const AREAS = [
  ['urban', 'bi-buildings', 'Urban', 'City and town centers'],
  ['rural', 'bi-tree-fill', 'Rural', 'Countryside, islands, and mountains'],
  ['either', 'bi-shuffle', 'Either', 'Show me both']
];
const TIMES = [
  ['morning', 'bi-sunrise', 'Morning', 'Cooler air and sunrise views'],
  ['afternoon', 'bi-sun', 'Afternoon', 'Full daylight for touring'],
  ['evening', 'bi-sunset', 'Evening', 'Golden hour and sunset views']
];
const label = (list, v) => list.find(x => x[0] === v)[2];

function optionCards(list, type, name) {
  return list.map(([v, icon, title, sub]) =>
    `<div class="col-sm-6"><input class="btn-check" type="${type}" name="${name}" id="${name}-${v}" value="${v}">
      <label class="pref-opt" for="${name}-${v}"><i class="bi ${icon}"></i>
      <span><strong>${title}</strong>${sub ? `<small class="d-block text-secondary">${sub}</small>` : ''}</span></label></div>`).join('');
}
document.getElementById('catOpts').innerHTML  = optionCards(CATS, 'checkbox', 'cat');
document.getElementById('areaOpts').innerHTML = optionCards(AREAS, 'radio', 'area');
document.getElementById('timeOpts').innerHTML = optionCards(TIMES, 'radio', 'time');

const prefModal = new bootstrap.Modal(document.getElementById('prefModal'));
const steps = document.querySelectorAll('.pref-step');
const nextBtn = document.getElementById('nextBtn');
const backBtn = document.getElementById('backBtn');
let step = 0;
const prefs = { cats: [], area: null, time: null };

function openQuestionnaire() { step = 0; showStep(); prefModal.show(); }

function readPrefs() {
  prefs.cats = [...document.querySelectorAll('input[name=cat]:checked')].map(i => i.value);
  prefs.area = (document.querySelector('input[name=area]:checked') || {}).value || null;
  prefs.time = (document.querySelector('input[name=time]:checked') || {}).value || null;
}
function stepReady() {
  readPrefs();
  return [prefs.cats.length > 0, !!prefs.area, !!prefs.time, true][step];
}
function showStep() {
  steps.forEach((s, i) => s.classList.toggle('d-none', i !== step));
  const results = step === 3;
  document.getElementById('prefBar').style.width = (results ? 100 : (step + 1) * 33) + '%';
  document.getElementById('stepLabel').textContent = results ? 'All set' : `Question ${step + 1} of 3`;
  document.getElementById('skipBtn').classList.toggle('d-none', results);
  backBtn.classList.toggle('d-none', step === 0 || results);
  nextBtn.textContent = step === 2 ? 'See my picks' : results ? 'Go to my dashboard' : 'Next';
  nextBtn.disabled = !stepReady();
}

document.getElementById('prefModal').addEventListener('change', () => { nextBtn.disabled = !stepReady(); });
backBtn.addEventListener('click', () => { step--; showStep(); });
nextBtn.addEventListener('click', () => {
  if (step === 2) { readPrefs(); renderResults(); }
  if (step === 3) {
    // TODO: save preferences, then go to the dashboard, e.g.
    // fetch('save_preferences.php', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(prefs) })
    //   .then(() => location.href = 'dashboard.html');
    prefModal.hide();
    showAlert('success', 'Account created and preferences saved. Redirect to your dashboard here.');
    return;
  }
  step++; showStep();
});
document.getElementById('skipBtn').addEventListener('click', () => {
  prefModal.hide();
  showAlert('success', 'Account created. You can set your preferences later from your profile.');
});

function renderResults() {
  const byScore = (a, b) => b.score - a.score;
  const scored = PLACES.map(p => {
    const hits = p.cats.filter(c => prefs.cats.includes(c));
    const areaOk = prefs.area === 'either' || p.area === prefs.area;
    const timeOk = p.time.includes(prefs.time);
    return { ...p, hits, areaOk, timeOk, score: (hits.length ? 3 + hits.length : 0) + (areaOk ? 2 : 0) + (timeOk ? 2 : 0) };
  });

  // Three tiers: really close, nearly close, and something different they might enjoy
  const closest = scored.filter(p => p.hits.length && p.areaOk && p.timeOk).sort(byScore);
  const nearly  = scored.filter(p => p.hits.length && !(p.areaOk && p.timeOk)).sort(byScore);
  const explore = scored.filter(p => !p.hits.length).sort((a, b) => (b.areaOk + b.timeOk + !!b.view) - (a.areaOk + a.timeOk + !!a.view) || byScore(a, b));

  // Best sunrise / sunset spot for the chosen time of day
  const wanted = prefs.time === 'morning' ? 'sunrise' : 'sunset';
  const ranked = [...closest, ...nearly, ...explore];
  const close = [...closest, ...nearly];   // prefer spots that fit the user's picks before unrelated ones
  const star = close.find(p => p.view === wanted) || close.find(p => p.view) || ranked.find(p => p.view === wanted) || ranked.find(p => p.view);
  const without = list => list.filter(p => p !== star);

  const chip = (ok, text) => `<span class="chip ${ok ? 'ok' : ''}"><i class="bi bi-${ok ? 'check-lg' : 'dash'}"></i> ${text}</span>`;
  const card = (p, note) => `<div class="col-sm-6"><div class="place-card p-3 h-100">
      <h4 class="h6 fw-bold mb-0">${p.name}</h4><div class="small text-secondary mb-2">${p.town}</div>
      <p class="small mb-2">${p.blurb}</p>
      <div class="d-flex flex-wrap gap-1">${chip(p.hits.length, 'Type')}${chip(p.areaOk, 'Setting')}${chip(p.timeOk, 'Time')}</div>
      ${note ? `<div class="small mt-2 fw-medium">${note}</div>` : ''}
      ${p.view ? `<span class="badge text-bg-warning mt-2"><i class="bi bi-${p.view}"></i> Good ${p.view} spot</span>` : ''}
    </div></div>`;
  const section = (title, sub, list, noteFn) => list.length ? `<h3 class="h6 fw-bold mb-0 mt-4">${title}</h3>
      <p class="small text-secondary mb-3">${sub}</p><div class="row g-3">${list.map(p => card(p, noteFn && noteFn(p))).join('')}</div>` : '';

  let html = '';
  if (star) {
    const tip = star.view === 'sunrise' ? 'Arrive before sunrise to catch the first light.'
      : prefs.time === 'morning' ? 'Best views come at sunset, so plan to stay into the late afternoon.'
      : prefs.time === 'evening' ? 'Plan to be there in time for golden hour.'
      : 'Arrive by late afternoon to stay for the sunset.';
    html += `<div class="star-pick d-flex gap-3 p-3">
      <i class="bi bi-${star.view}"></i>
      <div><div class="fw-semibold small text-secondary">Best for ${star.view} for you</div>
      <h3 class="h5 fw-bold mb-1">${star.name} <span class="fw-normal text-secondary fs-6">${star.town}</span></h3>
      <p class="mb-1">${star.blurb}</p><p class="small mb-0 fw-medium">${tip}</p></div></div>`;
  }
  html += section('Closest to your picks', 'Matches your place type, setting, and time of day.', without(closest));
  html += section('Nearly a match', 'Fits your place type, but differs in setting or time of day.', without(nearly));
  html += section('You might also like', 'Outside your picks, but worth a look.', without(explore).slice(0, 4),
    p => p.view ? `A favorite for ${p.view} views.` : `Try something different: ${p.cats.map(c => label(CATS, c).toLowerCase()).join(', ')}.`);
  document.getElementById('results').innerHTML = html;
}

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
