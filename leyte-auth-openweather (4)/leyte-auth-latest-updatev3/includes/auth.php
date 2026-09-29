<?php
// Accounts, validation and the login session.
function public_user(array $u): array {
    return [
        'first_name' => $u['first_name'],
        'last_name'  => $u['last_name'],
        'email'      => $u['email'],
        'theme'      => $u['theme'] ?? DEFAULT_THEME,
        'prefs'      => $u['prefs'] ?? null,
        'recent'     => array_values((array)($u['recent'] ?? [])),
    ];
}

function clean_name(string $v, string $label): string {
    $v = trim($v);
    if ($v === '' || strlen($v) > 100) throw new ApiError("Enter your $label.", 422);
    return $v;
}

function clean_email(string $v): string {
    $v = strtolower(trim($v));
    if (!filter_var($v, FILTER_VALIDATE_EMAIL)) throw new ApiError('Enter a valid email address.', 422);
    return $v;
}

function check_password(string $pw): void {
    if (strlen($pw) < 8 || !preg_match('/[a-z]/i', $pw) || !preg_match('/\d/', $pw))
        throw new ApiError('Use at least 8 characters with a letter and a number.', 422);
}

function auth_register(array $in): array {
    $email = clean_email(str_in($in, 'email'));
    $pass  = str_in($in, 'password');
    check_password($pass);
    if (db_find_by_email($email))
        throw new ApiError('That email is already registered. Try logging in instead.', 409);

    $theme = str_in($in, 'theme');
    $user = [
        'id'         => bin2hex(random_bytes(8)),
        'first_name' => clean_name(str_in($in, 'first_name'), 'first name'),
        'last_name'  => clean_name(str_in($in, 'last_name'), 'last name'),
        'email'      => $email,
        'password'   => password_hash($pass, PASSWORD_DEFAULT),
        'theme'      => in_array($theme, THEMES, true) ? $theme : DEFAULT_THEME,
        'prefs'      => null,
        'recent'     => [],
        'created'    => date('c'),
    ];
    db_insert($user);
    auth_start_session($user, false);
    return $user;
}

function auth_login(array $in): array {
    $user = db_find_by_email(trim(str_in($in, 'email')));
    if (!$user || !password_verify(str_in($in, 'password'), $user['password']))
        throw new ApiError('Incorrect email or password. Try again or reset your password.', 401);
    auth_start_session($user, !empty($in['remember']));
    return $user;
}

// "Keep me logged in" = a 30-day cookie. Otherwise the cookie ends when the browser closes.
function auth_start_session(array $user, bool $remember): void {
    session_regenerate_id(true);
    $_SESSION['uid'] = $user['id'];
    if ($remember) {
        setcookie(session_name(), session_id(), [
            'expires'  => time() + REMEMBER_DAYS * 86400,
            'path'     => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }
}

function auth_current(): ?array {
    return isset($_SESSION['uid']) ? db_find($_SESSION['uid']) : null;
}

function auth_require(): array {
    return auth_current() ?? throw new ApiError('Please log in.', 401);
}

function auth_logout(): void {
    $_SESSION = [];
    session_destroy();
}
