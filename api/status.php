<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
$ready = false;
try {
    $file = dirname(__DIR__,3) . '/private/ustacebim-config.php';
    if (is_file($file)) {
        $cfg = require $file;
        $required = ['app_url','db_host','db_name','db_user','db_password','smtp_host','smtp_port','smtp_user','smtp_password','mail_from','mailer_autoload','rate_limit_secret'];
        if (is_array($cfg) && count(array_filter($required, static function ($key) use ($cfg) {
            return isset($cfg[$key]) && is_scalar($cfg[$key]) && strlen((string)$cfg[$key]) > 0
                && !str_contains((string)$cfg[$key], 'REPLACE_WITH');
        })) === count($required) && is_file($cfg['mailer_autoload']) && strlen($cfg['rate_limit_secret']) >= 32) {
            $pdo = new PDO('mysql:host='.$cfg['db_host'].';port='.(int)($cfg['db_port']??3306).';dbname='.$cfg['db_name'].';charset=utf8mb4',
                $cfg['db_user'],$cfg['db_password'],
                [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false]);
            $stmt = $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name IN ('email_verification_tokens','auth_rate_limits')");
            $ready = (int)$stmt->fetchColumn() === 2;
        }
    }
} catch (Throwable $exception) {
    error_log('UstaCebim registration status error: '.get_class($exception));
}
echo json_encode(['registration_enabled'=>$ready], JSON_UNESCAPED_UNICODE);
