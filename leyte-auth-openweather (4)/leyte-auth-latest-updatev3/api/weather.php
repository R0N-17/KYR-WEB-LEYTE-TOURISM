<?php
// Live weather for every tourist spot (plus Tacloban for the header badge). Signed-in users only.
require __DIR__ . '/../includes/bootstrap.php';
require __DIR__ . '/../includes/weather.php';
api_handle(function () {
    auth_require();
    session_write_close();   // don't hold the session lock while waiting on OpenWeather
    $w = weather_get_all();
    return ['weather' => $w['data'], 'updated' => $w['time'], 'stale' => $w['stale']];
});
