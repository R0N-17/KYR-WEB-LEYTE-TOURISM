Add your own photos here to replace the drawn scenes in the login slideshow.

Use these exact file names (JPG, about 1600 px tall, under 500 KB each):

  kalanggaman-island.jpg
  lake-danao.jpg
  san-juanico-bridge.jpg
  cuatro-islas.jpg

A slide with no photo shows its drawn scene instead. To add a slide, copy a
<div class="carousel-item"> block in index.html and a matching indicator button.
Only use photos you took or have permission to use, and credit them where required.


LIVE WEATHER (OpenWeather)
--------------------------
1. Create a free key at https://openweathermap.org/api ("Current Weather Data"). New keys can take up to a couple of hours to activate.
2. Copy includes/config.local.example.php to includes/config.local.php and paste your key
   (or set the environment variable OPENWEATHER_API_KEY).
3. Run the site as before: php -S localhost:8000 router.php

How it works: the dashboard calls api/weather.php (login required). PHP asks OpenWeather for all 11 spots + Tacloban
and caches the result in data/weather-cache.json for 10 minutes (WEATHER_TTL in includes/config.php), so the free
plan is never hit per visitor. The key never reaches the browser. Without a key the dashboard still works and shows the
sample weather from js/data.js, labelled as sample.
Spot coordinates are in includes/weather.php (weather_spots). They are approximate: adjust them if you have exact ones.
If you add a place to js/data.js, add its name and coordinates there too.
