/* Theme switcher: Light (default) | Dark | Auto.
   Auto = light from 6:00 AM to 5:59 PM, dark otherwise (re-checked every minute).
   Loaded on every page. Buttons are any element with data-theme-mode="light|dark|auto". */

const Theme = (() => {
  const KEY = 'leyteTheme', MODES = ['light', 'dark', 'auto'];
  const DAY_START = 6, DAY_END = 18;           // change these two numbers to move the day/night cutover
  const listeners = [];
  let mode = 'light', timer;

  try { mode = localStorage.getItem(KEY) || 'light'; } catch (e) {}
  if (!MODES.includes(mode)) mode = 'light';

  function resolve(m) {
    if (m !== 'auto') return m;
    const h = new Date().getHours();
    return h >= DAY_START && h < DAY_END ? 'light' : 'dark';
  }

  function paint() {
    document.documentElement.setAttribute('data-bs-theme', resolve(mode));
    document.querySelectorAll('[data-theme-mode]').forEach(b =>
      b.setAttribute('aria-pressed', String(b.dataset.themeMode === mode)));
    const ico = document.querySelector('.theme-fab-toggle i');
    if (ico) ico.className = 'bi ' + { light: 'bi-sun', dark: 'bi-moon-stars', auto: 'bi-circle-half' }[mode];
    clearInterval(timer);
    if (mode === 'auto') timer = setInterval(paint, 60000);
  }

  // silent = don't notify listeners (used when applying a theme that came from the server)
  function set(m, opts) {
    if (!MODES.includes(m)) return;
    mode = m;
    try { localStorage.setItem(KEY, m); } catch (e) {}
    paint();
    if (!(opts && opts.silent)) listeners.forEach(fn => fn(m));
  }

  // Pages without a theme menu (login, register, ...) get a small floating switcher:
  // one round button showing the current mode; hover it (or tap it on a phone) and Light, Dark and Auto drop down.
  if (!document.querySelector('[data-theme-mode]')) {
    const fab = document.createElement('div');
    fab.className = 'theme-fab';
    fab.innerHTML =
      '<button type="button" class="theme-fab-toggle" aria-haspopup="true" aria-label="Color theme"><i class="bi"></i></button>' +
      '<div class="theme-fab-menu" role="group" aria-label="Color theme">' +
      '<button type="button" class="theme-fab-item" data-theme-mode="light"><i class="bi bi-sun"></i>Light (default)</button>' +
      '<button type="button" class="theme-fab-item" data-theme-mode="dark"><i class="bi bi-moon-stars"></i>Dark</button>' +
      '<button type="button" class="theme-fab-item" data-theme-mode="auto" title="Light from 6 AM to 6 PM, dark otherwise"><i class="bi bi-circle-half"></i>Auto (day &amp; night)</button>' +
      '</div>';
    document.body.appendChild(fab);
  }

  // Tap support for phones (mouse users just hover). Works for the floating switcher and for the one in the dashboard top bar.
  document.addEventListener('click', e => {
    const tog = e.target.closest('.theme-fab-toggle');
    const item = e.target.closest('.theme-fab-item');
    if (item) item.blur();                          // release focus so the menu folds up after you pick a mode
    document.querySelectorAll('.theme-fab.open').forEach(f => {
      if (item || !tog || !f.contains(tog)) f.classList.remove('open');
    });
    if (tog && !item && window.matchMedia('(hover: none)').matches) tog.closest('.theme-fab').classList.toggle('open');
  });

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-theme-mode]');
    if (b) set(b.dataset.themeMode);
  });

  paint();
  return { get: () => mode, set, onChange: fn => listeners.push(fn) };
})();
