<?php
// OpenWeather helper: one reading per tourist spot, cached on disk so 11 spots cost 11 calls per WEATHER_TTL, not per visitor.

// Coordinates are kept on the server so the browser can't ask for arbitrary locations with your key.
// Approximate points (weather grids are ~km wide). Names must match PLACES[].name in js/data.js.
function weather_spots(): array {
    return [
        'Kalanggaman Island'                     => [11.1830, 124.3420],
        'Cuatro Islas'                           => [10.4300, 124.6800],
        'Lake Danao Natural Park'                => [10.9856, 124.7075],
        'Mahagnao Volcano Natural Park'          => [10.9700, 124.9500],
        'Mount Pangasugan'                       => [10.7500, 124.8300],
        'San Juanico Bridge'                     => [11.2960, 124.9800],
        'MacArthur Landing Memorial National Park' => [11.1500, 125.0100],
        'Palo Metropolitan Cathedral'            => [11.1580, 124.9900],
        'Santo Niño Shrine and Heritage Museum'  => [11.2420, 125.0060],
        'Price Mansion'                          => [11.2450, 125.0040],
        'Ormoc City Boulevard'                   => [11.0060, 124.6070],
        'Tacloban City'                          => [11.2444, 125.0048],   // dashboard header badge
    ];
}

function weather_key(): string {
    $k = getenv('OPENWEATHER_API_KEY');
    if (!$k && defined('OPENWEATHER_API_KEY')) $k = OPENWEATHER_API_KEY;
    $k = trim((string)$k);
    return $k === 'PASTE_YOUR_KEY_HERE' ? '' : $k;
}

function weather_cache_read(): ?array {
    $raw = @file_get_contents(WEATHER_CACHE_FILE);
    $c = $raw ? json_decode($raw, true) : null;
    return is_array($c) && isset($c['time'], $c['data']) ? $c : null;
}

function weather_cache_write(array $c): void {
    @file_put_contents(WEATHER_CACHE_FILE, json_encode($c), LOCK_EX);
}

// GETs several URLs at once. Returns [key => [httpStatus, body]].
function http_get_many(array $urls): array {
    $out = [];
    if (function_exists('curl_multi_init')) {
        $mh = curl_multi_init();
        $handles = [];
        foreach ($urls as $k => $u) {
            $ch = curl_init($u);
            curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4]);
            curl_multi_add_handle($mh, $ch);
            $handles[$k] = $ch;
        }
        do {
            $st = curl_multi_exec($mh, $active);
            if ($active) curl_multi_select($mh, 1.0);
        } while ($active && $st === CURLM_OK);
        foreach ($handles as $k => $ch) {
            $out[$k] = [(int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE), (string)curl_multi_getcontent($ch)];
            curl_multi_remove_handle($mh, $ch);
        }
        curl_multi_close($mh);
        return $out;
    }
    // No cURL extension: fall back to one request at a time.
    $ctx = stream_context_create(['http' => ['timeout' => 8, 'ignore_errors' => true]]);
    foreach ($urls as $k => $u) {
        $body = @file_get_contents($u, false, $ctx);
        $status = isset($http_response_header[0]) && preg_match('#\s(\d{3})\s#', $http_response_header[0], $m) ? (int)$m[1] : 0;
        $out[$k] = [$status, (string)$body];
    }
    return $out;
}

// Keeps only what the dashboard shows.
function weather_normalize(array $j): ?array {
    $w = $j['weather'][0] ?? null;
    if (!isset($j['main']['temp']) || !isset($w['id'])) return null;
    return [
        'tempC'    => (int)round($j['main']['temp']),
        'feelsC'   => (int)round($j['main']['feels_like'] ?? $j['main']['temp']),
        'humidity' => (int)($j['main']['humidity'] ?? 0),
        'windKph'  => (int)round(((float)($j['wind']['speed'] ?? 0)) * 3.6),   // OpenWeather gives m/s
        'rainMm'   => round((float)($j['rain']['1h'] ?? 0), 1),
        'clouds'   => (int)($j['clouds']['all'] ?? 0),
        'id'       => (int)$w['id'],                                          // OpenWeather condition code
        'desc'     => ucfirst((string)($w['description'] ?? '')),
        'night'    => str_ends_with((string)($w['icon'] ?? ''), 'n'),
        'observed' => (int)($j['dt'] ?? time()),
    ];
}

// Returns ['data' => [placeName => reading], 'time' => unixTime, 'stale' => bool].
function weather_get_all(): array {
    $cache = weather_cache_read();
    if ($cache && time() - $cache['time'] < WEATHER_TTL) return $cache + ['stale' => false];

    $key = weather_key();
    if ($key === '') throw new ApiError('Live weather is not set up yet. Add your OpenWeather API key (see README).', 503);

    $urls = [];
    foreach (weather_spots() as $name => [$lat, $lon])
        $urls[$name] = OWM_ENDPOINT . '?' . http_build_query(['lat' => $lat, 'lon' => $lon, 'units' => 'metric', 'appid' => $key]);

    $raw  = http_get_many($urls);
    $data = $cache['data'] ?? [];      // start from the old readings so one failed spot doesn't blank the page
    $got = 0; $unauthorized = 0;
    foreach ($raw as $name => [$status, $body]) {
        if ($status === 401) { $unauthorized++; continue; }
        $reading = $status === 200 ? weather_normalize((array)json_decode($body, true)) : null;
        if ($reading) { $data[$name] = $reading; $got++; }
    }

    if ($got === 0) {
        if ($unauthorized === count($urls))
            throw new ApiError('OpenWeather rejected the API key. A brand-new key can take up to a couple of hours to start working.', 502);
        if (!$data) throw new ApiError('The weather service is not reachable right now. Try again in a moment.', 502);
        // Everything failed but we have old readings: serve them and retry in about a minute.
        weather_cache_write(['time' => time() - WEATHER_TTL + 60, 'data' => $data]);
        return ['time' => $cache['time'], 'data' => $data, 'stale' => true];
    }
    $fresh = ['time' => time(), 'data' => $data];
    weather_cache_write($fresh);
    return $fresh + ['stale' => false];
}
