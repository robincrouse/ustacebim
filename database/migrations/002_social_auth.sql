-- 002_social_auth.sql
-- Run ONCE after 001_initial.sql; dedicated UstaCebim database only.
-- Google and Apple identities attach to ONE user account, not separate customer/pro profiles.
CREATE TABLE oauth_identities (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  provider ENUM('google','apple') NOT NULL,
  provider_subject VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  provider_email VARCHAR(254) NULL,
  provider_email_verified TINYINT(1) NOT NULL DEFAULT 0,
  linked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  UNIQUE KEY uq_oauth_provider_subject (provider, provider_subject),
  UNIQUE KEY uq_oauth_user_provider (user_id, provider),
  KEY idx_oauth_user (user_id),
  CONSTRAINT fk_oauth_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Holds temporary login attempts. Only hashed state/nonce values, never plaintext auth codes.
CREATE TABLE oauth_login_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  provider ENUM('google','apple') NOT NULL,
  state_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  nonce_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL,
  destination_path VARCHAR(255) NOT NULL DEFAULT '/',
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_oauth_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
