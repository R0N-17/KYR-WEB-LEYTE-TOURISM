/* Runs in <head> before the page paints, so there is never a flash of the wrong theme.
   Keep the 6 AM to 6 PM rule in sync with js/theme.js. */
(function () {
  var mode = 'light';
  try { mode = localStorage.getItem('leyteTheme') || 'light'; } catch (e) {}
  var h = new Date().getHours();
  var dark = mode === 'dark' || (mode === 'auto' && (h < 6 || h >= 18));
  document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
})();
