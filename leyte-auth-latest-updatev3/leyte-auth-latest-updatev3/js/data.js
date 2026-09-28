/* Shared destination + preference data. Used by register.js and dashboard.js.
   Replace PLACES with records from your destinations table. */
// Sample data. Replace with records from your destinations table.
// "view" = sunrise on east-facing coasts (Leyte Gulf side), sunset on west-facing coasts (Ormoc Bay / Camotes Sea side).
const PLACES = [
  { name: 'Kalanggaman Island', feeAmt: 150, stay: ['full', 'overnight'], town: 'Palompon', cats: ['beach', 'nature'], area: 'rural', time: ['morning', 'afternoon'], view: 'sunset', fee: '₱150 environmental fee', hours: '6:00 AM – 5:00 PM', facilities: ['Cottages', 'Restrooms', 'Boat landing'], weather: { condition: 'sunny', tempC: 31, tip: 'Great beach weather. Bring sunscreen and plenty of water.' },
    blurb: 'A long white sandbar with clear water on both sides.' },
  { name: 'Cuatro Islas', feeAmt: 100, stay: ['full', 'overnight'], town: 'Inopacan', cats: ['beach', 'nature'], area: 'rural', time: ['morning', 'afternoon'], view: 'sunset', fee: '₱100 environmental fee', hours: '6:00 AM – 5:00 PM', facilities: ['Boat landing', 'Cottages'], weather: { condition: 'partly', tempC: 30, tip: 'Good conditions for island hopping.' },
    blurb: 'Small islands with white sand and calm coves for a day trip.' },
  { name: 'Lake Danao Natural Park', feeAmt: 50, stay: ['half', 'full'], town: 'Ormoc City', cats: ['nature'], area: 'rural', time: ['morning', 'afternoon'], view: null, fee: '₱50 entrance fee', hours: '6:00 AM – 5:00 PM', facilities: ['Kayak rental', 'Cottages', 'Parking'], weather: { condition: 'cloudy', tempC: 24, tip: 'Cool and misty. Bring a light jacket.' },
    blurb: 'A guitar-shaped mountain lake with cool air and morning mist.' },
  { name: 'Mahagnao Volcano Natural Park', feeAmt: 60, stay: ['full', 'overnight'], town: 'Burauen', cats: ['nature'], area: 'rural', time: ['morning'], view: null, fee: '₱60 entrance fee', hours: '6:00 AM – 4:00 PM', facilities: ['Guides available', 'Camping area'], weather: { condition: 'rain', tempC: 23, tip: 'Trails may be slippery. Check conditions before hiking.' },
    blurb: 'Forest trails around a crater lake.' },
  { name: 'Mount Pangasugan', feeAmt: 50, stay: ['full', 'overnight'], town: 'Baybay City', cats: ['nature'], area: 'rural', time: ['morning'], view: null, fee: '₱50 registration fee', hours: '6:00 AM – 3:00 PM', facilities: ['Guides required', 'Camping area'], weather: { condition: 'cloudy', tempC: 24, tip: 'Overcast with cooler air on the trail.' },
    blurb: 'A forested mountain in the Leyte range, known for hiking trails.' },
  { name: 'San Juanico Bridge', feeAmt: 0, stay: ['half'], town: 'Tacloban City', cats: ['landmark'], area: 'urban', time: ['morning', 'afternoon'], view: 'sunrise', fee: 'Free', hours: 'Open 24 hours', facilities: ['Viewing deck', 'Parking'], weather: { condition: 'sunny', tempC: 29, tip: 'Clear skies, good visibility for photos.' },
    blurb: 'The long bridge linking Leyte and Samar, best at first light.' },
  { name: 'MacArthur Landing Memorial National Park', feeAmt: 20, stay: ['half'], town: 'Palo', cats: ['history', 'landmark'], area: 'urban', time: ['morning', 'afternoon'], view: 'sunrise', fee: '₱20 entrance fee', hours: '8:00 AM – 5:00 PM', facilities: ['Parking', 'Restrooms', 'Souvenir shops'], weather: { condition: 'sunny', tempC: 30, tip: 'Warm and clear, good for a morning visit.' },
    blurb: 'Statues on the shore of Leyte Gulf mark the 1944 landing.' },
  { name: 'Palo Metropolitan Cathedral', feeAmt: 0, stay: ['half'], town: 'Palo', cats: ['history'], area: 'urban', time: ['morning', 'afternoon'], view: null, fee: 'Free', hours: '6:00 AM – 6:00 PM', facilities: ['Parking', 'Restrooms'], weather: { condition: 'sunny', tempC: 30, tip: 'Pleasant for a walk around the plaza.' },
    blurb: 'A centuries-old church in Palo, close to the landing memorial.' },
  { name: 'Santo Niño Shrine and Heritage Museum', feeAmt: 75, stay: ['half'], town: 'Tacloban City', cats: ['history'], area: 'urban', time: ['morning', 'afternoon'], view: null, fee: '₱75 entrance fee', hours: '9:00 AM – 5:00 PM, closed Mondays', facilities: ['Guided tours', 'Restrooms', 'Gift shop'], weather: { condition: 'partly', tempC: 29, tip: 'Comfortable for walking between the shrine and museum.' },
    blurb: 'A heritage museum and shrine in the city center.' },
  { name: 'Price Mansion', feeAmt: 50, stay: ['half'], town: 'Tacloban City', cats: ['history'], area: 'urban', time: ['morning', 'afternoon'], view: null, fee: '₱50 entrance fee', hours: '9:00 AM – 5:00 PM, closed Mondays', facilities: ['Guided tours', 'Restrooms'], weather: { condition: 'partly', tempC: 29, tip: 'Fine conditions for a short visit.' },
    blurb: 'A historic mansion in Tacloban tied to the 1944 Leyte campaign.' },
  { name: 'Ormoc City Boulevard', feeAmt: 0, stay: ['half'], town: 'Ormoc City', cats: ['landmark'], area: 'urban', time: ['afternoon', 'evening'], view: 'sunset', fee: 'Free', hours: 'Open 24 hours', facilities: ['Food stalls', 'Parking', 'Benches'], weather: { condition: 'sunny', tempC: 28, tip: 'Clear skies expected toward sunset.' },
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
const BUDGETS = [
  ['free', 'bi-gift', 'Free only', 'No entrance or environmental fee'],
  ['50', 'bi-cash', 'Up to ₱50', 'Low-cost places'],
  ['100', 'bi-cash-stack', 'Up to ₱100', 'Most places fit'],
  ['any', 'bi-infinity', 'Any budget', 'Show me everything']
];
const TRIPS = [
  ['half', 'bi-hourglass-split', 'Half day', 'A few hours at one or two stops'],
  ['full', 'bi-brightness-high', 'Full day', 'Spend the whole day out'],
  ['overnight', 'bi-moon-stars', 'Overnight', 'Camping or staying over']
];
const BUDGET_MAX = { free: 0, '50': 50, '100': 100, any: Infinity };
// Shared match helpers so register.js and dashboard.js score the same way.
const budgetOk = (p, budget) => p.feeAmt <= (BUDGET_MAX[budget] ?? Infinity);
const tripOk = (p, trip) => p.stay.includes(trip);
const label = (list, v) => list.find(x => x[0] === v)[2];


// Small helper so cards can show category-tinted thumbnail art without a real photo.
function placeThumb(p, size) {
  const cat = p.cats[0];
  const icon = (CATS.find(c => c[0] === cat) || [,'bi-geo-alt'])[1];
  const cls = size === 'sm' ? 'place-thumb place-thumb-sm' : 'place-thumb';
  return `<div class="${cls} cat-${cat}"><i class="bi ${icon}"></i></div>`;
}

const WEATHER_ICONS = { sunny: 'bi-brightness-high-fill', partly: 'bi-cloud-sun-fill', cloudy: 'bi-cloud-fill', rain: 'bi-cloud-rain-fill' };
const WEATHER_LABELS = { sunny: 'Sunny', partly: 'Partly cloudy', cloudy: 'Cloudy', rain: 'Light rain' };
