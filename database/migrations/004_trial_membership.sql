-- 004_trial_membership.sql
-- UstaCebim: run ONCE on ustacebim_db after 001_initial.sql.
-- New tables only. Does not change existing subscriptions or prices.
-- Entitlements are created on the SERVER, only after professional approval
-- and verified phone ownership. Never trust client-side trial state.

CREATE TABLE professional_trials (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  professional_id BIGINT UNSIGNED NOT NULL,
  phone_fingerprint CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  status ENUM('pending','active','expired','revoked') NOT NULL DEFAULT 'pending',
  credit_limit SMALLINT UNSIGNED NOT NULL DEFAULT 15,
  category_limit SMALLINT UNSIGNED NOT NULL DEFAULT 2,
  area_limit SMALLINT UNSIGNED NOT NULL DEFAULT 3,
  approved_by BIGINT UNSIGNED NULL,
  approved_at DATETIME NULL,
  started_at DATETIME NULL,
  ends_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_trial_professional (professional_id),
  UNIQUE KEY uq_trial_phone_fingerprint (phone_fingerprint),
  KEY idx_trial_status_end (status, ends_at),
  CONSTRAINT fk_trial_professional FOREIGN KEY (professional_id)
    REFERENCES professional_profiles(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_trial_approver FOREIGN KEY (approved_by)
    REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_trial_credit_limit CHECK (credit_limit = 15),
  CONSTRAINT chk_trial_date_order CHECK (ends_at IS NULL OR started_at IS NULL OR ends_at > started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE trial_abuse_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  professional_id BIGINT UNSIGNED NULL,
  trial_id BIGINT UNSIGNED NULL,
  event_type ENUM('duplicate_phone','suspicious_signup','quote_spam','user_report','manual_review','revoked') NOT NULL,
  note VARCHAR(500) NULL,
  reviewed_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE SET NULL,
  FOREIGN KEY (trial_id) REFERENCES professional_trials(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_trial_abuse_event (event_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Important: phone_fingerprint is HMAC-SHA-256(normalized E.164 phone)
-- with a server-only secret; do not store raw phone hashes here.
-- Activation in a transaction: verify user, professional approval,
-- uniqueness of fingerprint, then started_at=UTC_TIMESTAMP(),
-- ends_at=DATE_ADD(started_at, INTERVAL 30 DAY), status='active',
-- and add +15 to quote_credit_ledger with unique idempotency key.
-- Trial credit must be spent ONLY during [started_at,ends_at).
-- Ledger grant alone must not authorize spending after expiry.
