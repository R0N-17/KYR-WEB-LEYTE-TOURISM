<?php
// Saves the travel-preference questionnaire answers.
require __DIR__ . '/../includes/bootstrap.php';
api_handle(function (array $in) {
    $user = auth_require();
    $cats = array_values(array_intersect(array_filter((array)($in['cats'] ?? []), 'is_string'), PREF_CATS));
    $ok = $cats
        && in_array($in['area']   ?? '', PREF_AREAS, true)
        && in_array($in['time']   ?? '', PREF_TIMES, true)
        && in_array($in['budget'] ?? '', PREF_BUDGETS, true)
        && in_array($in['trip']   ?? '', PREF_TRIPS, true);
    if (!$ok) throw new ApiError('Choose at least one place type, plus a setting, time of day, budget and trip length.', 422);
    $prefs = ['cats' => $cats, 'area' => $in['area'], 'time' => $in['time'], 'budget' => $in['budget'], 'trip' => $in['trip']];
    db_update($user['id'], ['prefs' => $prefs]);
    return ['prefs' => $prefs];
});
