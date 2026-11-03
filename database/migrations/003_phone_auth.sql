-- UstaCebim 003_phone_auth.sql
-- MariaDB: run once AFTER 001_initial.sql and 002_social_auth.sql.
-- Do not execute on Cizmece game database.
CREATE TABLE phone_otp_challenges (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  phone_e164 VARCHAR(20) NOT NULL,
  purpose ENUM('sign_in','verify_phone','change_phone') NOT NULL,
  otp_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts SMALLINT UNSIGNED NOT NULL DEFAULT 5,
  consumed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_phone_otp_phone (phone_e164, purpose, created_at),
  KEY idx_phone_otp_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sms_delivery_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  challenge_id BIGINT UNSIGNED NULL,
  provider VARCHAR(40) NOT NULL,
  provider_message_id VARCHAR(160) NULL,
  status ENUM('queued','sent','delivered','failed') NOT NULL DEFAULT 'queued',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (challenge_id) REFERENCES phone_otp_challenges(id) ON DELETE SET NULL,
  KEY idx_sms_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
