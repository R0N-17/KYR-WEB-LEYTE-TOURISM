<?php
// Saves "Recently viewed" on the signed-in user's account (newest first, max RECENT_MAX places).
require __DIR__ . '/../includes/bootstrap.php';
api_handle(function (array $in) {
    $user = auth_require();
    $name = trim(str_in($in, 'name'));
    if ($name === '' || strlen($name) > 100) throw new ApiError('Invalid place.', 422);

    $old = array_filter((array)($user['recent'] ?? []), 'is_string');
    $recent = array_slice(array_values(array_merge([$name], array_diff($old, [$name]))), 0, RECENT_MAX);
    db_update($user['id'], ['recent' => $recent]);
    return ['recent' => $recent];
});
