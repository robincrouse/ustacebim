<?php
// SAMPLE ONLY. Copy to <Plesk domain root>/private/ustacebim-config.php.
// NEVER commit the real config or SMTP/DB passwords to GitHub.
return [
    'app_url' => 'https://cizmece.xyz/ustacebim-test',
    'db_host' => 'localhost',
    'db_port' => 3306,
    'db_name' => 'ustacebim_db',
    'db_user' => 'ustacebim',
    'db_password' => 'REPLACE_WITH_DB_PASSWORD',
    'smtp_host' => 'REPLACE_WITH_SMTP_HOST',
    'smtp_port' => 587, // 587 = STARTTLS; 465 = SMTPS
    'smtp_user' => 'REPLACE_WITH_SMTP_USER',
    'smtp_password' => 'REPLACE_WITH_SMTP_PASSWORD',
    'mail_from' => 'info@cizmece.xyz',
    // Composer: composer require phpmailer/phpmailer --no-dev
    // Install outside httpdocs and set absolute path to vendor/autoload.php.
    'mailer_autoload' => '/var/www/vhosts/YOUR-DOMAIN/private/ustacebim-mailer/vendor/autoload.php',
    'rate_limit_secret' => 'REPLACE_WITH_AT_LEAST_32_RANDOM_CHARACTERS_FROM_SECURE_GENERATOR',
];
