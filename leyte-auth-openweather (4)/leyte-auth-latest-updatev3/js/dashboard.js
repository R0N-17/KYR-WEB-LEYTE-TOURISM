/* dashboard.html only. Needs js/data.js loaded first (PLACES, CATS, AREAS, TIMES, label). */

/* ---------- Session guard ----------
   Not signed in (or just logged out and pressed Back)? Go to the login page. */
// The server decides who is logged in (see the loader at the bottom of this file).
window.addEventListener('pageshow', e => { if (e.persisted) window.location.reload(); });

/* ---------- SCRUM-7: Log out ---------- */
document.getElementById('confirmLogout').addEventListener('click', e => {
  e.preventDefault();
  api('logout.php').finally(Session.toLogin);
});

/* ---------- Success notification (toast) ----------
   Pops at the bottom of the screen after a successful save, even after the modal that triggered it is closed. */
const toastStack = document.getElementById('toastStack');
function notifySuccess(message, sub) {
  const el = document.createElement('div');
  el.className = 'dm-toast';
  el.setAttribute('role', 'status');
  el.innerHTML = `<i class="bi bi-check-circle-fill dm-toast-icon"></i>
    <span class="dm-toast-text">${escapeHtml(message)}${sub ? `<small>${escapeHtml(sub)}</small>` : ''}</span>
    <button type="button" class="dm-toast-close" aria-label="Dismiss"><i class="bi bi-x"></i></button>`;
  toastStack.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));

  let timer = setTimeout(() => dismiss(), 4000);
  function dismiss() {
    clearTimeout(timer);
    el.classList.add('hide');
    el.classList.remove('show');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }
  el.querySelector('.dm-toast-close').addEventListener('click', dismiss);
  el.addEventListener('mouseenter', () => clearTimeout(timer));
  el.addEventListener('mouseleave', () => { timer = setTimeout(dismiss, 1500); });
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

let openPlace = null;   // place currently shown in the details popup (so live weather can refresh it)

// Filled in from the server (api/me.php) by the loader at the bottom of this file.
const currentUser = { firstName: '', lastName: '', email: '' };

// Starter picks, used until the user saves their own (api/preferences.php).
let savedPrefs = { cats: ['beach', 'nature'], area: 'rural', time: 'morning', budget: 'any', trip: 'full' };

/* ---------- Live date & time ---------- */
function paintClock() {
  const now = new Date();
  const date = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
  document.getElementById('liveDateTime').innerHTML = `<i class="bi bi-calendar3 me-1"></i>${date} &nbsp;·&nbsp; <i class="bi bi-clock me-1"></i>${time}`;
}
paintClock();
setInterval(paintClock, 1000);

/* ---------- Header + profile fields ---------- */
function initials(first, last) { return ((first[0] || '') + (last[0] || '')).toUpperCase(); }

function applyUser(u) {
  currentUser.firstName = u.first_name;
  currentUser.lastName = u.last_name;
  currentUser.email = u.email;
  paintUser();
}

function paintUser() {
  document.getElementById('navAvatar').textContent = initials(currentUser.firstName, currentUser.lastName);
  document.getElementById('navName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
  document.getElementById('navEmail').textContent = currentUser.email;
  document.getElementById('welcomeName').textContent = currentUser.firstName;
  document.getElementById('pfFirstName').value = currentUser.firstName;
  document.getElementById('pfLastName').value = currentUser.lastName;
  document.getElementById('pfEmail').value = currentUser.email;
}
paintUser();

/* ---------- SCRUM-8: Manage User Profile ---------- */
const pfNewPw = document.getElementById('pfNewPw');
const pfConfirmPw = document.getElementById('pfConfirmPw');
function pfCheckMatch() { pfConfirmPw.setCustomValidity(pfNewPw.value === pfConfirmPw.value ? '' : 'mismatch'); }
pfNewPw.addEventListener('input', pfCheckMatch);
pfConfirmPw.addEventListener('input', pfCheckMatch);

document.getElementById('profileForm').addEventListener('submit', async e => {
  e.preventDefault();
  const form = e.target;
  pfCheckMatch();
  form.classList.add('was-validated');
  if (!form.checkValidity()) return;

  const saveBtn = document.querySelector('button[form=profileForm]');
  setLoading(saveBtn, true, 'Saving…');

  const alertBox = document.getElementById('profileAlert');
  const passwordChanged = pfNewPw.value !== '';
  const res = await api('profile.php', {
    first_name: document.getElementById('pfFirstName').value,
    last_name: document.getElementById('pfLastName').value,
    email: document.getElementById('pfEmail').value,
    current_password: document.getElementById('pfCurrentPw').value,
    new_password: pfNewPw.value
  });
  setLoading(saveBtn, false);
  if (!res.ok) {
    alertBox.className = 'alert alert-danger py-2 small';
    alertBox.textContent = res.message;
    return;
  }
  applyUser(res.user);
  alertBox.className = 'alert alert-success py-2 small';
  alertBox.textContent = 'Profile updated.';
  document.getElementById('pfCurrentPw').value = '';
  pfNewPw.value = ''; pfConfirmPw.value = '';
  form.classList.remove('was-validated');
  hidePfPasswords();
  notifySuccess(passwordChanged ? 'Password updated' : 'Profile updated', passwordChanged ? 'Your new password now works for signing in.' : undefined);
});

// Put every eye back to "hidden" (after saving, and whenever the profile window is closed).
function hidePfPasswords() {
  document.querySelectorAll('#profileModal .toggle-pw').forEach(btn => {
    document.getElementById(btn.dataset.target).type = 'password';
    btn.setAttribute('aria-label', 'Show password');
    btn.innerHTML = '<i class="bi bi-eye"></i>';
  });
}
document.getElementById('profileModal').addEventListener('hidden.bs.modal', hidePfPasswords);

/* ---------- SCRUM-9: Save User Preferences ---------- */
function optionCards(list, type, name, checkedValues) {
  return list.map(([v, icon, title, sub]) => {
    const checked = checkedValues.includes(v) ? 'checked' : '';
    return `<div class="col-sm-6"><input class="btn-check" type="${type}" name="dash-${name}" id="dash-${name}-${v}" value="${v}" ${checked}>
      <label class="pref-opt" for="dash-${name}-${v}"><i class="bi ${icon}"></i>
      <span><strong>${title}</strong>${sub ? `<small class="d-block text-secondary">${sub}</small>` : ''}</span></label></div>`;
  }).join('');
}
function paintPrefsForm() {
  document.getElementById('dashCatOpts').innerHTML  = optionCards(CATS, 'checkbox', 'cat', savedPrefs.cats);
  document.getElementById('dashAreaOpts').innerHTML = optionCards(AREAS, 'radio', 'area', [savedPrefs.area]);
  document.getElementById('dashTimeOpts').innerHTML = optionCards(TIMES, 'radio', 'time', [savedPrefs.time]);
  document.getElementById('dashBudgetOpts').innerHTML = optionCards(BUDGETS, 'radio', 'budget', [savedPrefs.budget]);
  document.getElementById('dashTripOpts').innerHTML = optionCards(TRIPS, 'radio', 'trip', [savedPrefs.trip]);
}
paintPrefsForm();

document.getElementById('savePrefsBtn').addEventListener('click', async () => {
  const cats = [...document.querySelectorAll('input[name="dash-cat"]:checked')].map(i => i.value);
  const area = (document.querySelector('input[name="dash-area"]:checked') || {}).value;
  const time = (document.querySelector('input[name="dash-time"]:checked') || {}).value;
  const budget = (document.querySelector('input[name="dash-budget"]:checked') || {}).value;
  const trip = (document.querySelector('input[name="dash-trip"]:checked') || {}).value;
  if (!cats.length || !area || !time || !budget || !trip) {
    const alertBox = document.getElementById('prefsAlert');
    alertBox.className = 'alert alert-danger py-2 small';
    alertBox.textContent = 'Pick at least one place type, plus a setting, time of day, budget, and trip length.';
    return;
  }

  const res = await api('preferences.php', { cats, area, time, budget, trip });
  const alertBox = document.getElementById('prefsAlert');
  if (!res.ok) {
    alertBox.className = 'alert alert-danger py-2 small';
    alertBox.textContent = res.message;
    return;
  }
  savedPrefs = res.prefs;
  renderRecommended();

  alertBox.className = 'alert alert-success py-2 small';
  alertBox.textContent = 'Preferences saved. Your recommendations were updated.';
  notifySuccess('Preferences updated', 'Your recommendations were refreshed to match.');
});

/* ---------- SCRUM-26: Home Dashboard ---------- */
function placeCard(p, rank) {
  const topPick = rank === 0;
  const greatMatch = rank === 1 || rank === 2;
  return `<div class="col-sm-6 col-lg-4"><div class="place-card h-100 ${topPick ? 'is-top-pick' : ''}" role="button" tabindex="0" data-place="${p.name}">
    <div class="dm-thumb-wrap">
      ${placeThumb(p)}
      <span class="wx-chip d-none" data-wx="${p.name}"></span>
      ${topPick ? `<span class="top-pick-ribbon"><i class="bi bi-star-fill"></i> Top pick for you</span>` : ''}
    </div>
    <div class="place-body">
    <h3 class="h6 fw-bold mb-0">${p.name}</h3><div class="small text-secondary mb-2">${p.town}</div>
    <p class="small mb-0">${p.blurb}</p>
    <div class="d-flex flex-wrap gap-1 mt-2">
      ${greatMatch ? `<span class="badge rank-badge"><i class="bi bi-check-circle-fill me-1"></i>Great match</span>` : ''}
      ${p.view ? `<span class="badge text-bg-warning"><i class="bi bi-${p.view}"></i> Good ${p.view} spot</span>` : ''}
      <span data-wx-alert="${p.name}"></span>
    </div>
    </div>
  </div></div>`;
}
function renderRecommended() {
  const scored = PLACES.map(p => {
    const hits = p.cats.filter(c => savedPrefs.cats.includes(c)).length;
    const areaOk = savedPrefs.area === 'either' || p.area === savedPrefs.area;
    const timeOk = p.time.includes(savedPrefs.time);
    const wx = Weather.info(p.name);
    const weatherHit = wx && wx.wet && p.cats.some(c => c === 'beach' || c === 'nature') ? -3 : 0;   // rain or rough seas: outdoor spots slip down
    return { ...p, score: weatherHit + hits * 3 + (areaOk ? 2 : 0) + (timeOk ? 1 : 0) + (budgetOk(p, savedPrefs.budget) ? 2 : 0) + (tripOk(p, savedPrefs.trip) ? 1 : 0) };
  }).sort((a, b) => b.score - a.score).slice(0, 6);
  const sig = scored.map(p => p.name).join('|');
  const box = document.getElementById('recommended');
  if (box.dataset.sig !== sig) {                       // only rebuild the cards when the order really changed (keeps animations calm)
    box.dataset.sig = sig;
    box.innerHTML = scored.map((p, i) => placeCard(p, i)).join('');
  }
  paintWeather();
}
renderRecommended();

// Recently viewed / favorites: this function can be called again any time the underlying list changes.
function simpleList(id, names, empty) {
  const el = document.getElementById(id);
  if (!names.length) {
    el.className = 'empty-state';
    el.innerHTML = `<i class="bi ${empty.icon}"></i>
      <p class="fw-semibold mb-1">${empty.title}</p>
      <p class="small text-secondary mb-3">${empty.text}</p>
      <a href="#allSpotsList" class="btn btn-sm btn-outline-secondary">Browse destinations</a>`;
    return;
  }
  el.className = 'list-group';
  el.innerHTML = names.map(n => {
    const p = PLACES.find(x => x.name === n);
    return `<a href="#" class="list-group-item list-group-item-action d-flex align-items-center gap-3" data-place="${p.name}">
      ${placeThumb(p, 'sm')}
      <span><span class="fw-semibold d-block">${p.name}</span><span class="small text-secondary">${p.town}</span></span>
    </a>`;
  }).join('');
}

// Recently viewed: empty for a new account. Fills in only as the user actually opens a destination.
const RECENT_MAX = 6;
let recentlyViewed = [];
function renderRecent() {
  simpleList('recentList', recentlyViewed,
    { icon: 'bi-clock-history', title: 'Nothing viewed yet', text: "Places you look at will show up here." });
  document.getElementById('clearRecentBtn').classList.toggle('d-none', !recentlyViewed.length);   // nothing to clear when empty
}
function markViewed(name) {
  recentlyViewed = [name, ...recentlyViewed.filter(n => n !== name)].slice(0, RECENT_MAX);
  renderRecent();
  api('recent.php', { name });               // saved on the account, so it is still here after logging out and back in
}
renderRecent();

// "Clear history": wipes the saved list on the account, then empties the list on screen.
document.getElementById('confirmClearRecent').addEventListener('click', async function () {
  const btn = this, err = document.getElementById('clearRecentError');
  err.classList.add('d-none');
  setLoading(btn, true, 'Clearing…');
  const res = await api('recent-clear.php');
  setLoading(btn, false);
  if (!res.ok) { err.textContent = res.message || "Couldn't clear your history. Try again."; err.classList.remove('d-none'); return; }
  recentlyViewed = [];
  renderRecent();
  bootstrap.Modal.getInstance(document.getElementById('clearRecentModal')).hide();
});

simpleList('favList', [],
  { icon: 'bi-heart', title: 'No favorites yet', text: "Tap the heart on a destination to save it here." });

/* ---------- Delete account ---------- */
document.getElementById('confirmDeleteAccount').addEventListener('click', function () {
  setLoading(this, true, 'Deleting…');
  api('delete.php').finally(Session.toLogin);
});

/* ---------- Full destination list ---------- */
function renderAllSpots() {
  document.getElementById('spotCount').textContent = `${PLACES.length} destinations`;
  const byTown = [...PLACES].sort((a, b) => a.town.localeCompare(b.town) || a.name.localeCompare(b.name));
  document.getElementById('allSpotsList').innerHTML = byTown.map(p => `
    <a href="#" class="list-group-item list-group-item-action d-flex align-items-center gap-3" data-place="${p.name}">
      ${placeThumb(p, 'sm')}
      <span class="flex-grow-1">
        <span class="fw-semibold d-block">${p.name}</span>
        <span class="small text-secondary">${p.town}</span>
      </span>
      <span class="d-none d-sm-flex flex-wrap gap-1 justify-content-end">
        ${p.cats.map(c => `<span class="chip">${label(CATS, c)}</span>`).join('')}
      </span>
      <span class="wx-inline d-none" data-wx="${p.name}"></span>
    </a>`).join('');
}
renderAllSpots();

/* ---------- Destination Details popup ---------- */
const detailsModal = new bootstrap.Modal(document.getElementById('detailsModal'));

function weatherIcon(condition) {
  return { sunny: 'bi-sun', partly: 'bi-cloud-sun', cloudy: 'bi-clouds', rain: 'bi-cloud-rain' }[condition] || 'bi-cloud';
}

const weatherModalEl = document.getElementById('weatherModal');
function openDetails(name) {
  const p = PLACES.find(x => x.name === name);
  if (!p) return;
  // Opened from inside the weather list? Close that popup first, then open this one.
  if (weatherModalEl.classList.contains('show')) {
    weatherModalEl.addEventListener('hidden.bs.modal', () => openDetails(name), { once: true });
    bootstrap.Modal.getInstance(weatherModalEl).hide();
    return;
  }
  openPlace = p;

  document.getElementById('dmThumbWrap').innerHTML = placeThumb(p);
  document.getElementById('dmName').textContent = p.name;
  document.getElementById('dmTown').innerHTML = `<i class="bi bi-geo-alt me-1"></i>${p.town}, Leyte`;
  document.getElementById('dmCats').innerHTML = p.cats.map(c => `<span class="chip">${label(CATS, c)}</span>`).join('')
    + (p.view ? `<span class="badge text-bg-warning"><i class="bi bi-${p.view}"></i> Good ${p.view} spot</span>` : '');
  document.getElementById('dmBlurb').textContent = p.blurb;
  document.getElementById('dmFee').textContent = p.fee;
  document.getElementById('dmHours').textContent = p.hours;
  document.getElementById('dmFacilities').innerHTML = p.facilities.map(f => `<li>${f}</li>`).join('');

  paintDetailsWeather(p);

  detailsModal.show();
  markViewed(p.name);
}

document.getElementById('detailsModal').addEventListener('hidden.bs.modal', () => { openPlace = null; });

// Fills the weather box in the popup: live OpenWeather reading, or the sample text from data.js when live weather isn't connected.
function paintDetailsWeather(p) {
  const wx = Weather.info(p.name);
  const $ = id => document.getElementById(id);
  if (wx) {
    $('dmWeatherIcon').className = `bi ${wx.icon}`;
    $('dmWeatherTemp').textContent = `${wx.tempC}°C`;
    $('dmWeatherCond').textContent = wx.desc;
    $('dmWeatherMeta').innerHTML = `<i class="bi bi-thermometer-half"></i> Feels like ${wx.feelsC}°C &nbsp;·&nbsp; <i class="bi bi-droplet-half"></i> ${wx.humidity}% &nbsp;·&nbsp; <i class="bi bi-wind"></i> ${wx.windKph} km/h`
      + (wx.rainMm > 0 ? ` &nbsp;·&nbsp; <i class="bi bi-cloud-rain"></i> ${wx.rainMm} mm/h` : '');
    $('dmWeatherTip').textContent = wx.tip;
    $('dmWeatherSrc').textContent = Weather.stamp();
  } else {
    const s = p.weather;
    $('dmWeatherIcon').className = `bi ${weatherIcon(s.condition)}`;
    $('dmWeatherTemp').textContent = `${s.tempC}°C`;
    $('dmWeatherCond').textContent = WEATHER_LABELS[s.condition] || '';
    $('dmWeatherMeta').textContent = '';
    $('dmWeatherTip').textContent = s.tip;
    $('dmWeatherSrc').textContent = 'Sample weather. Live weather is not connected yet.';
  }
}

// Event delegation: any element with data-place, anywhere on the page, opens its details.
document.addEventListener('click', e => {
  const el = e.target.closest('[data-place]');
  if (!el) return;
  e.preventDefault();
  openDetails(el.dataset.place);
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const el = e.target.closest('[data-place]');
  if (!el) return;
  e.preventDefault();
  openDetails(el.dataset.place);
});

/* ---------- Live weather (OpenWeather, via api/weather.php) ---------- */
// Updates every weather spot on the page in place: card chips, list chips, "rain now" badges, header badge,
// the weather popup and (if open) the details popup.
function paintWeather() {
  document.querySelectorAll('[data-wx]').forEach(el => {
    const wx = Weather.info(el.dataset.wx);
    el.classList.toggle('d-none', !wx);
    el.innerHTML = wx ? `<i class="bi ${wx.icon}"></i> ${wx.tempC}°` : '';
    if (wx) el.title = wx.desc;
  });
  document.querySelectorAll('[data-wx-alert]').forEach(el => {
    const wx = Weather.info(el.dataset.wxAlert);
    const pl = PLACES.find(p => p.name === el.dataset.wxAlert);
    const bad = wx && pl && wx.wet && pl.cats.some(c => c === 'beach' || c === 'nature');
    el.innerHTML = bad ? `<span class="badge text-bg-info"><i class="bi bi-cloud-rain me-1"></i>${wx.group === 'thunder' ? 'Storm now' : wx.group === 'rain' ? 'Rain now' : 'Rough weather'}</span>` : '';
  });

  const badge = document.getElementById('liveWeather'), tac = Weather.info('Tacloban City');
  badge.innerHTML = tac
    ? `<i class="bi ${tac.icon} me-1"></i>${tac.tempC}°C, ${Weather.esc(tac.desc)} in Tacloban City`
    : (Weather.error ? `<i class="bi bi-cloud-slash me-1"></i>Weather unavailable` : `<i class="bi bi-cloud me-1"></i>Loading weather…`);
  if (!tac && Weather.error) badge.title = Weather.error;

  renderWeatherList();
  if (openPlace) paintDetailsWeather(openPlace);
}

// "Check weather" popup: every spot, grouped by town.
function renderWeatherList() {
  const list = document.getElementById('weatherList');
  const note = document.getElementById('weatherNote');
  if (!Weather.live) {
    list.innerHTML = `<div class="empty-state"><i class="bi bi-cloud-slash"></i><p class="fw-semibold mb-1">Live weather isn't available</p><p class="small text-secondary mb-0">${Weather.esc(Weather.error || 'Loading…')}</p></div>`;
    note.textContent = '';
    return;
  }
  const byTown = [...PLACES].sort((a, b) => a.town.localeCompare(b.town) || a.name.localeCompare(b.name));
  list.innerHTML = byTown.map(p => {
    const wx = Weather.info(p.name);
    return `<a href="#" class="list-group-item list-group-item-action d-flex align-items-center gap-3" data-place="${p.name}">
      ${placeThumb(p, 'sm')}
      <span class="flex-grow-1"><span class="fw-semibold d-block">${p.name}</span>
        <span class="small text-secondary">${p.town}${wx ? ` · ${Weather.esc(wx.desc)}` : ''}</span></span>
      ${wx ? `<span class="text-end"><span class="fw-bold"><i class="bi ${wx.icon} me-1"></i>${wx.tempC}°C</span>
        <span class="d-block small text-secondary"><i class="bi bi-wind"></i> ${wx.windKph} km/h</span></span>` : '<span class="small text-secondary">No data</span>'}
    </a>`;
  }).join('');
  note.textContent = Weather.stamp();
}

let weatherTimer = null;
async function refreshWeather() {
  const ok = await Weather.load();
  if (ok) renderRecommended();      // ranking may change (rain moves outdoor spots down); also repaints
  else paintWeather();
}
document.getElementById('refreshWeatherBtn').addEventListener('click', async function () {
  setLoading(this, true, 'Refreshing…');
  await refreshWeather();
  setLoading(this, false);
});
function startWeather() {
  refreshWeather();
  clearInterval(weatherTimer);
  weatherTimer = setInterval(refreshWeather, 10 * 60 * 1000);   // matches the server cache (WEATHER_TTL)
}

/* ---------- Load the signed-in user from the server ---------- */
// Remember the theme choice on the account (light | dark | auto).
Theme.onChange(mode => { api('theme.php', { theme: mode }); });

(async function () {
  const res = await api('me.php');
  if (!res.ok) { Session.toLogin(); return; }      // not logged in: back to the login page

  applyUser(res.user);
  startWeather();
  if (res.user.prefs) savedPrefs = res.user.prefs;
  recentlyViewed = (res.user.recent || []).filter(n => PLACES.some(p => p.name === n)).slice(0, RECENT_MAX);   // load the saved list
  renderRecent();
  paintPrefsForm();
  renderRecommended();
  Theme.set(res.user.theme, { silent: true });     // use the theme saved on the account

  // First visit after registering says "Welcome, Name". Later visits say "Welcome back, Name".
  if (sessionStorage.getItem('leyteNewUser')) {
    sessionStorage.removeItem('leyteNewUser');
    document.getElementById('welcomeBack').classList.add('d-none');
  }
  document.body.classList.remove('auth-pending');
})();
