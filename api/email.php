<?php
declare(strict_types=1);
// Hizmet Her Yerde email registration + verification endpoint (PHP 8.1+).
// /api/email.php : POST {action:"register"|"resend",...}; GET ?token=... ; POST verify.
ini_set('display_errors', '0');
header('Cache-Control: no-store, private');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('X-Frame-Options: DENY');
header('Content-Security-Policy: default-src \'none\'; style-src \'unsafe-inline\'; form-action \'self\'; base-uri \'none\'; frame-ancestors \'none\'');

function reply(int $status, array $data): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function cfg(): array {
    // Supports both /httpdocs/api (new domain) and /httpdocs/ustacebim-test/api (old test).
    $candidates = [
        dirname(__DIR__, 2) . '/private/ustacebim-config.php',
        dirname(__DIR__, 3) . '/private/ustacebim-config.php',
    ];
    $path = null;
    foreach ($candidates as $candidate) {
        if (is_file($candidate)) { $path = $candidate; break; }
    }
    if ($path === null) reply(503, ['ok'=>false,'message'=>'E-posta hizmeti henüz yapılandırılmadı.']);
    $data = require $path;
    if (!is_array($data)) reply(503, ['ok'=>false,'message'=>'E-posta hizmeti kullanılamıyor.']);
    return $data;
}
function db(array $config): PDO {
    return new PDO(
        'mysql:host=' . $config['db_host'] . ';port=' . (int)($config['db_port'] ?? 3306) . ';dbname=' . $config['db_name'] . ';charset=utf8mb4',
        $config['db_user'], $config['db_password'],
        [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_EMULATE_PREPARES=>false, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]
    );
}
function cleanEmail(string $email): string {
    return strtolower(trim($email));
}
function limiter(PDO $pdo, array $config, string $action, string $identity, int $max): bool {
    // 15-minute fixed window; HMAC hides phone/email/IP from the limiter table.
    $secret = $config['rate_limit_secret'] ?? '';
    if (strlen($secret) < 32) throw new RuntimeException('Rate limit secret missing');
    $bucket = intdiv(time(), 900) * 900;
    $window = gmdate('Y-m-d H:i:s', $bucket);
    $hash = hash_hmac('sha256', $identity, $secret);
    $q = $pdo->prepare('INSERT INTO auth_rate_limits (action,subject_hash,window_start,attempt_count) VALUES (?,?,?,1) ON DUPLICATE KEY UPDATE attempt_count=attempt_count+1');
    $q->execute([$action,$hash,$window]);
    $q = $pdo->prepare('SELECT attempt_count FROM auth_rate_limits WHERE action=? AND subject_hash=? AND window_start=?');
    $q->execute([$action,$hash,$window]);
    return (int)$q->fetchColumn() <= $max;
}
function mailVerify(array $cfg, string $address, string $name, string $token): void {
    $path = $cfg['mailer_autoload'] ?? '';
    if (!is_string($path) || !is_file($path)) throw new RuntimeException('Mailer not installed');
    require_once $path;
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $cfg['smtp_host'];
    $mail->Port = (int)$cfg['smtp_port'];
    $mail->SMTPAuth = true;
    $mail->Username = $cfg['smtp_user'];
    $mail->Password = $cfg['smtp_password'];
    $mail->SMTPSecure = ((int)$cfg['smtp_port'] === 465)
        ? \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS
        : \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($cfg['mail_from'], 'Hizmet Her Yerde');
    $mail->addAddress($address, $name);
    $mail->Subject = 'Hizmet Her Yerde - E-posta adresini doğrula';
    $base = rtrim($cfg['app_url'], '/');
    $url = $base . '/api/email.php?token=' . urlencode($token);
    $safe = htmlspecialchars($url, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $mail->isHTML(true);
    $mail->Body = '<div style="font:16px Arial,sans-serif;max-width:580px;margin:auto;color:#17384b">'
        . '<h2>Hizmet Her Yerde hesabını doğrula</h2><p>E-posta adresini doğrulamak için aşağıdaki düğmeyi kullan.</p>'
        . '<p><a href="' . $safe . '" style="display:inline-block;background:#0e8179;color:white;padding:13px 20px;border-radius:8px;text-decoration:none">E-postamı Doğrula</a></p>'
        . '<p>Bağlantı 30 dakika geçerlidir. Bu işlemi sen başlatmadıysan mesajı görmezden gelebilirsin.</p></div>';
    $mail->AltBody = "Hizmet Her Yerde hesabını doğrula:\n" . $url . "\nBu bağlantı 30 dakika geçerlidir.";
    $mail->send();
}
function createToken(PDO $pdo, int $userId): string {
    $token = bin2hex(random_bytes(32));
    $hash = hash('sha256', $token);
    // Any older link becomes invalid when a new link is created.
    $del = $pdo->prepare('DELETE FROM email_verification_tokens WHERE user_id=?');
    $del->execute([$userId]);
    $q = $pdo->prepare('INSERT INTO email_verification_tokens (user_id,token_hash,expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE))');
    $q->execute([$userId,$hash]);
    return $token;
}
function formData(): array {
    $type = $_SERVER['CONTENT_TYPE'] ?? '';
    if (str_contains($type, 'application/json')) {
        $raw = file_get_contents('php://input', false, null, 0, 8193);
        if (strlen($raw) > 8192) reply(413,['ok'=>false,'message'=>'İstek çok büyük.']);
        $input = json_decode($raw, true);
        if (!is_array($input)) reply(400,['ok'=>false,'message'=>'Geçersiz istek.']);
        return $input;
    }
    return $_POST;
}
function guardOrigin(array $cfg): void {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '') {
        $expected = parse_url($cfg['app_url'], PHP_URL_SCHEME) . '://' . parse_url($cfg['app_url'], PHP_URL_HOST);
        $port = parse_url($cfg['app_url'], PHP_URL_PORT);
        if ($port) $expected .= ':' . $port;
        if (!hash_equals($expected, $origin)) reply(403,['ok'=>false,'message'=>'İsteğe izin verilmedi.']);
    }
    if (($_SERVER['HTTP_SEC_FETCH_SITE'] ?? '') === 'cross-site') reply(403,['ok'=>false,'message'=>'İsteğe izin verilmedi.']);
}
function verifyPage(string $token): never {
    header('Content-Type: text/html; charset=utf-8');
    $safe = htmlspecialchars($token, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    echo '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Hizmet Her Yerde · E-posta doğrulama</title></head><body style="margin:0;background:#f5f8f9;font:16px Arial,sans-serif;color:#17384b"><main style="max-width:430px;margin:12vh auto;padding:30px;background:white;border:1px solid #dce8e8;border-radius:16px"><h1>E-postanı doğrula</h1><p>Hesabının e-posta adresini doğrulamak için devam et.</p><form method="post" action="email.php"><input type="hidden" name="action" value="verify"><input type="hidden" name="token" value="' . $safe . '"><button style="border:0;border-radius:9px;background:#0e8179;color:white;padding:13px 22px;font-weight:bold;cursor:pointer">E-postamı doğrula</button></form><p style="color:#71818a;font-size:12px">Bu işlem giriş yapmaz; yalnızca e-posta adresini onaylar.</p></main></body></html>';
    exit;
}
try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $token = $_GET['token'] ?? '';
        if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/', $token)) reply(400,['ok'=>false,'message'=>'Bağlantı geçersiz.']);
        verifyPage($token);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(405,['ok'=>false,'message'=>'İzin verilmeyen yöntem.']);
    $cfg = cfg();
    guardOrigin($cfg);
    $input = formData();
    $action = $input['action'] ?? '';
    if (!in_array($action, ['register','resend','verify'], true)) reply(400,['ok'=>false,'message'=>'Geçersiz işlem.']);
    $pdo = db($cfg);
    if ($action === 'verify') {
        $token = $input['token'] ?? '';
        if (!is_string($token) || !preg_match('/^[a-f0-9]{64}$/', $token)) reply(400,['ok'=>false,'message'=>'Bağlantı geçersiz.']);
        $hash = hash('sha256', $token);
        $pdo->beginTransaction();
        $q = $pdo->prepare('SELECT id,user_id FROM email_verification_tokens WHERE token_hash=? AND consumed_at IS NULL AND expires_at>UTC_TIMESTAMP() FOR UPDATE');
        $q->execute([$hash]);
        $record = $q->fetch();
        if (!$record) {
            $pdo->rollBack();
            reply(400,['ok'=>false,'message'=>'Bu bağlantı geçersiz veya süresi dolmuş.']);
        }
        $q = $pdo->prepare("UPDATE users SET email_verified_at=UTC_TIMESTAMP(),status='active' WHERE id=? AND status='pending'");
        $q->execute([(int)$record['user_id']]);
        $q = $pdo->prepare('UPDATE email_verification_tokens SET consumed_at=UTC_TIMESTAMP() WHERE id=?');
        $q->execute([(int)$record['id']]);
        $pdo->commit();
        // Browser form submission gets human readable HTML, not raw JSON.
        if (!str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
            header('Content-Type: text/html; charset=utf-8');
            echo '<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hizmet Her Yerde · Doğrulandı</title><body style="background:#f5f8f9;font:16px Arial,sans-serif;color:#17384b"><main style="max-width:430px;margin:12vh auto;background:white;padding:30px;border-radius:15px"><h1>E-posta doğrulandı ✓</h1><p>Adresin onaylandı. Giriş sistemi etkinleştirildiğinde hesabına giriş yapabileceksin.</p><a href="../#giris">Hizmet Her Yerde’e dön</a></main></body></html>';
            exit;
        }
        reply(200,['ok'=>true,'message'=>'E-posta adresin doğrulandı.']);
    }
    $email = cleanEmail((string)($input['email'] ?? ''));
    if (strlen($email) > 254 || !filter_var($email,FILTER_VALIDATE_EMAIL)) reply(422,['ok'=>false,'message'=>'Geçerli bir e-posta adresi gir.']);
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (!limiter($pdo,$cfg,$action.'-ip',$ip,8) || !limiter($pdo,$cfg,$action.'-email',$email,3)) reply(429,['ok'=>false,'message'=>'Çok fazla deneme yapıldı. Daha sonra tekrar dene.']);
    $q = $pdo->prepare('SELECT id,status,email_verified_at FROM users WHERE email=? LIMIT 1');
    $q->execute([$email]);
    $existing = $q->fetch();
    if ($action === 'register' && !$existing) {
        $name = trim((string)($input['name'] ?? ''));
        $password = (string)($input['password'] ?? '');
        if (mb_strlen($name) < 2 || mb_strlen($name) > 120 || strlen($password) < 12 || strlen($password) > 128)
            reply(422,['ok'=>false,'message'=>'Adını ve en az 12 karakterlik bir şifre gir.']);
        if (($input['terms'] ?? false) !== true) reply(422,['ok'=>false,'message'=>'Kullanım koşullarını kabul etmelisin.']);
        $id = sprintf('%s-%s-%s-%s-%s',bin2hex(random_bytes(4)),bin2hex(random_bytes(2)),bin2hex(random_bytes(2)),bin2hex(random_bytes(2)),bin2hex(random_bytes(6)));
        try {
            $insert = $pdo->prepare("INSERT INTO users (public_id,email,display_name,password_hash,account_type,status,terms_accepted_at,privacy_notice_ack_at) VALUES (?,?,?,?,'customer','pending',UTC_TIMESTAMP(),UTC_TIMESTAMP())");
            $insert->execute([$id,$email,$name,password_hash($password,PASSWORD_DEFAULT)]);
            $userId = (int)$pdo->lastInsertId();
        } catch (PDOException $e) {
            if ($e->getCode() !== '23000') throw $e;
            reply(200,['ok'=>true,'message'=>'Bu adres için işlem uygunsa doğrulama bağlantısı gönderilecektir.']);
        }
    } elseif (!$existing || $existing['email_verified_at'] !== null || $existing['status'] !== 'pending') {
        reply(200,['ok'=>true,'message'=>'Bu adres için işlem uygunsa doğrulama bağlantısı gönderilecektir.']);
    } else {
        $userId = (int)$existing['id'];
    }
    $q = $pdo->prepare('SELECT display_name FROM users WHERE id=?');
    $q->execute([$userId]);
    $displayName = (string)$q->fetchColumn();
    $token = createToken($pdo, $userId);
    mailVerify($cfg,$email,$displayName,$token);
    reply(200,['ok'=>true,'message'=>'Doğrulama bağlantısı için e-posta kutunu kontrol et.']);
} catch (Throwable $e) {
    error_log('Hizmet Her Yerde email flow failed: '.get_class($e)); // NEVER log email, passwords, tokens or SMTP secrets
    reply(503,['ok'=>false,'message'=>'E-posta hizmeti şu anda kullanılamıyor. Daha sonra tekrar dene.']);
}
