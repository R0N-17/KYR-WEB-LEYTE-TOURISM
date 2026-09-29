<?php
// Only for `php -S localhost:8000 router.php`. Blocks direct access to /data and /includes.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
if (preg_match('#^/(data|includes)(/|$)#', $path)) {
    http_response_code(403);
    exit('Forbidden');
}
return false;   // serve everything else normally
