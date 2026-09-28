<?php
// JSON helpers. Every response is {ok: true, ...} or {ok: false, message: "..."}.
class ApiError extends Exception {
    public function __construct(string $message, public int $status = 400) { parent::__construct($message); }
}

function json_out(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Reads a text field from the request body ('' when missing or not text).
function str_in(array $in, string $key): string {
    return is_string($in[$key] ?? null) ? $in[$key] : '';
}

// Runs one endpoint. The callback gets the decoded JSON body and returns an array.
function api_handle(callable $fn): void {
    try {
        if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST')
            throw new ApiError('Use POST.', 405);
        // Requiring JSON blocks plain cross-site form posts (basic CSRF protection).
        if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0)
            throw new ApiError('Send JSON.', 415);
        $body = json_decode(file_get_contents('php://input'), true);
        json_out(['ok' => true] + $fn(is_array($body) ? $body : []));
    } catch (ApiError $e) {
        json_out(['ok' => false, 'message' => $e->getMessage()], $e->status);
    }
}
