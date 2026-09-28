<?php
// Start of every api/*.php endpoint.
ini_set('display_errors', '0');                          // PHP warnings must never end up inside the JSON
ini_set('session.gc_maxlifetime', (string)(30 * 86400)); // keep "remember me" sessions alive
session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Lax']);
session_start();
header('Content-Type: application/json; charset=utf-8');
require __DIR__ . '/config.php';
require __DIR__ . '/response.php';
require __DIR__ . '/db.php';
require __DIR__ . '/auth.php';
