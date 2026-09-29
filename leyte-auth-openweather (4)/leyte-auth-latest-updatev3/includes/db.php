<?php
// Text-file "database": one JSON user per line in data/users.txt.
// Fine for a demo. Swap these functions for MySQL later; nothing else needs to change.
function db_all(): array {
    if (!file_exists(DB_FILE)) return [];
    $users = [];
    foreach (file(DB_FILE, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $u = json_decode($line, true);
        if ($u) $users[$u['id']] = $u;
    }
    return $users;
}

function db_save(array $users): void {
    $lines = array_map('json_encode', array_values($users));
    file_put_contents(DB_FILE, $lines ? implode("\n", $lines) . "\n" : '', LOCK_EX);
}

function db_find(string $id): ?array {
    return db_all()[$id] ?? null;
}

function db_find_by_email(string $email): ?array {
    foreach (db_all() as $u)
        if (strcasecmp($u['email'], $email) === 0) return $u;
    return null;
}

function db_insert(array $user): void {
    $users = db_all();
    $users[$user['id']] = $user;
    db_save($users);
}

function db_update(string $id, array $changes): void {
    $users = db_all();
    if (!isset($users[$id])) return;
    $users[$id] = array_merge($users[$id], $changes);
    db_save($users);
}

function db_delete(string $id): void {
    $users = db_all();
    unset($users[$id]);
    db_save($users);
}
