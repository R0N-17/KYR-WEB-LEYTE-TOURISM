/* Live weather from OpenWeather (through api/weather.php, so the API key stays on the server).
   Load after common.js and data.js, before dashboard.js. */
const Weather = (() => {
  let data = null, updated = 0, stale = false, error = '';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // OpenWeather condition code -> simple group
  function group(id) {
    if (id >= 200 && id < 300) return 'thunder';
    if (id >= 300 && id < 400) return 'drizzle';
    if (id >= 500 && id < 600) return 'rain';
    if (id >= 700 && id < 800) return 'mist';
    if (id === 800) return 'clear';
    if (id === 801 || id === 802) return 'partly';
    return 'cloudy';
  }
  function icon(id, night) {
    switch (group(id)) {
      case 'thunder': return 'bi-cloud-lightning-rain';
      case 'drizzle': return 'bi-cloud-drizzle';
      case 'rain':    return id >= 502 ? 'bi-cloud-rain-heavy' : 'bi-cloud-rain';
      case 'mist':    return 'bi-cloud-fog2';
      case 'clear':   return night ? 'bi-moon-stars' : 'bi-sun';
      case 'partly':  return night ? 'bi-cloud-moon' : 'bi-cloud-sun';
      default:        return 'bi-clouds';
    }
  }
  const isWet = g => g === 'thunder' || g === 'rain';

  // A short, place-aware tip built from the live reading.
  function tip(w, place) {
    const g = w.group, outdoors = place && place.cats.some(c => c === 'beach' || c === 'nature');
    const beach = place && place.cats.includes('beach');
    if (g === 'thunder') return 'Thunderstorm nearby. Postpone boat trips and hikes, and stay indoors if you can.';
    if (g === 'rain')    return outdoors ? 'Rain now. Trails and boat rides can be slippery or unsafe; consider a museum or church instead.' : 'Rainy right now. Bring an umbrella.';
    if (g === 'drizzle') return 'Light drizzle. Bring a rain jacket.';
    if (beach && w.windKph >= 35) return 'Windy. The sea may be rough, so check with boat operators before going.';
    if (w.feelsC >= 38)  return 'Feels very hot. Go early or late in the day and bring water and sun protection.';
    if (g === 'clear' && !w.night) return beach ? 'Great beach weather. Bring sunscreen and plenty of water.' : 'Clear skies and good visibility.';
    if (w.tempC <= 25 && outdoors) return 'Cool air. A light jacket is a good idea.';
    return 'Comfortable conditions for a visit.';
  }

  // Everything the UI needs for one place (null when there is no live reading).
  function info(name) {
    const r = data && data[name];
    if (!r) return null;
    const place = (typeof PLACES !== 'undefined') && PLACES.find(p => p.name === name);
    const w = { ...r, group: group(r.id) };
    w.icon = icon(r.id, r.night);
    w.wet = isWet(w.group) || (place && place.cats.includes('beach') && r.windKph >= 40);
    w.tip = tip(w, place);
    return w;
  }

  function stamp() {
    if (!updated) return '';
    const t = new Date(updated * 1000).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    return `Live from OpenWeather · updated ${t}${stale ? ' (temporarily showing older readings)' : ''}`;
  }

  async function load() {
    const res = await api('weather.php');
    if (res.ok) { data = res.weather; updated = res.updated; stale = !!res.stale; error = ''; }
    else error = res.message || 'Weather unavailable.';
    return res.ok;
  }

  return { load, info, stamp, esc, get live() { return !!data; }, get error() { return error; } };
})();
