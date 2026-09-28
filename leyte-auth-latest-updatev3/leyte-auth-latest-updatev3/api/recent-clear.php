<?php
// Empties "Recently viewed" on the signed-in user's account.
require __DIR__ . '/../includes/bootstrap.php';
api_handle(function () {
    $user = auth_require();
    db_update($user['id'], ['recent' => []]);
    return ['recent' => []];
});
