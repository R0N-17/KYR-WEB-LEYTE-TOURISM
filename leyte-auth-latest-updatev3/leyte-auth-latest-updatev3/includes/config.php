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
