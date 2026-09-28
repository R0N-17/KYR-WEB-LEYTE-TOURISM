<?php
// Saves the signed-in user's theme: light | dark | auto
require __DIR__ . '/../includes/bootstrap.php';
api_handle(function (array $in) {
    $user = auth_require();
    $theme = str_in($in, 'theme');
    if (!in_array($theme, THEMES, true)) throw new ApiError('Invalid theme.', 422);
    db_update($user['id'], ['theme' => $theme]);
    return ['theme' => $theme];
});
