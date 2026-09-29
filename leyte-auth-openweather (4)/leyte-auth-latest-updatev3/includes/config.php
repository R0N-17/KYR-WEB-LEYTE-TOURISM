<?php
// Settings only.
const DB_FILE       = __DIR__ . '/../data/users.txt';   // temporary "database"
const THEMES        = ['light', 'dark', 'auto'];
const DEFAULT_THEME = 'light';
const REMEMBER_DAYS = 30;
const RECENT_MAX    = 6;    // how many "Recently viewed" places are kept per account

// Allowed answers for the travel-preference questionnaire (match js/data.js)
const PREF_CATS    = ['beach', 'nature', 'history', 'landmark'];
const PREF_AREAS   = ['urban', 'rural', 'either'];
const PREF_TIMES   = ['morning', 'afternoon', 'evening'];
const PREF_BUDGETS = ['free', '50', '100', 'any'];
const PREF_TRIPS   = ['half', 'full', 'overnight'];

// OpenWeather (https://openweathermap.org/api). The key is NEVER sent to the browser: api/weather.php calls OpenWeather for you.
// Set it in ONE of these ways:  1) environment variable OPENWEATHER_API_KEY   2) copy includes/config.local.example.php to includes/config.local.php
const WEATHER_TTL        = 600;                                   // seconds a fetched reading is reused (saves your free-plan quota)
const WEATHER_CACHE_FILE = __DIR__ . '/../data/weather-cache.json';
const OWM_ENDPOINT       = 'https://api.openweathermap.org/data/2.5/weather';
if (is_file(__DIR__ . '/config.local.php')) require __DIR__ . '/config.local.php';
