-- UstaCebim / 005_marketplace_flow.sql
-- Apply ONLY to ustacebim_db AFTER 001_initial.sql and 004_trial_membership.sql.
-- One-time migration. Existing records are preserved.
SET NAMES utf8mb4;

-- A request is offered to each eligible professional; this is NOT a quote.
CREATE TABLE request_matches (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  professional_id BIGINT UNSIGNED NOT NULL,
  state ENUM('new','viewed','dismissed','quoted','closed') NOT NULL DEFAULT 'new',
  notified_at DATETIME NULL,
  viewed_at DATETIME NULL,
  dismissed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_request_match (request_id, professional_id),
  KEY idx_professional_inbox (professional_id, state, created_at),
  CONSTRAINT fk_match_request FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- App notification inbox. Push delivery is a separate optional channel.
CREATE TABLE notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  recipient_id BIGINT UNSIGNED NOT NULL,
  kind ENUM('new_opportunity','quote_received','quote_accepted','request_completed','repeat_invite','system') NOT NULL,
  request_id BIGINT UNSIGNED NULL,
  quote_id BIGINT UNSIGNED NULL,
  title VARCHAR(160) NOT NULL,
  body VARCHAR(500) NOT NULL,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_request FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
  CONSTRAINT fk_notifications_quote FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
  KEY idx_notifications_inbox (recipient_id, read_at, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Keep favoured workers in the customer's account; no quote or fee.
CREATE TABLE customer_favorite_professionals (
  customer_id BIGINT UNSIGNED NOT NULL,
  professional_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id, professional_id),
  CONSTRAINT fk_fav_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Repeat invitations bypass paid bidding, but can only target an eligible
-- professional with a PREVIOUS accepted job for the same customer.
CREATE TABLE repeat_service_invitations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  professional_id BIGINT UNSIGNED NOT NULL,
  prior_request_id BIGINT UNSIGNED NOT NULL,
  new_request_id BIGINT UNSIGNED NULL,
  message VARCHAR(1000) NULL,
  state ENUM('sent','accepted','declined','expired','cancelled') NOT NULL DEFAULT 'sent',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME NULL,
  CONSTRAINT fk_repeat_customer FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_repeat_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_repeat_prior_request FOREIGN KEY (prior_request_id) REFERENCES service_requests(id) ON DELETE RESTRICT,
  CONSTRAINT fk_repeat_new_request FOREIGN KEY (new_request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
  KEY idx_repeat_professional (professional_id, state, created_at),
  KEY idx_repeat_customer (customer_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Completion is confirmed separately by customer and worker.
CREATE TABLE job_completions (
  request_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  customer_confirmed_at DATETIME NULL,
  professional_confirmed_at DATETIME NULL,
  resolved_by BIGINT UNSIGNED NULL,
  resolved_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_completion_request FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE RESTRICT,
  CONSTRAINT fk_completion_moderator FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log phone reveals without storing the number again.
CREATE TABLE contact_access_audit (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  accessed_by BIGINT UNSIGNED NOT NULL,
  accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_contact_request FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE RESTRICT,
  CONSTRAINT fk_contact_actor FOREIGN KEY (accessed_by) REFERENCES users(id) ON DELETE RESTRICT,
  KEY idx_contact_audit_request (request_id, accessed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Prices agreed for PILOT DISPLAY ONLY. Enable payment only after the business
-- confirms taxes, invoices, subscriptions and terms. Idempotent updates.
UPDATE subscription_plans SET
  monthly_quote_allowance=20,
  monthly_price=299.00,
  yearly_price=2870.00
WHERE slug='starter';
UPDATE subscription_plans SET
  monthly_quote_allowance=50,
  monthly_price=599.00,
  yearly_price=5750.00
WHERE slug='pro';
UPDATE subscription_plans SET
  monthly_quote_allowance=100,
  monthly_price=999.00,
  yearly_price=9590.00
WHERE slug='business';

-- BACKEND REQUIREMENTS (not enforced by SQL alone):
-- 1. Publish request: verified customer, moderated open request. In one
--    transaction match approved professionals by profession and location,
--    create request_matches + notifications with no customer phone in payload.
-- 2. Quote: a successful server-side POST with fixed price and note
--    decrements one credit. Do NOT decrement on view, dismiss or push open.
--    Lock request and credit owner rows, validate allowance + max_quotes,
--    then atomically create quotes, quote_credit_ledger(-1) and status=quoted.
--    Idempotency key required; retries never double-charge.
-- 3. Customer acceptance: lock request; ensure quote belongs to it and owner;
--    set matched + accepted quote exactly once. Other quotes cannot win.
-- 4. Contact endpoint: phone only after accepted quote, to selected worker
--    and its customer. Never expose via feeds, notifications or public HTML.
-- 5. Repeat invites: customer/worker must have a PREVIOUS accepted job;
--    no quote creation / no credit charge; no public telephone disclosure.
-- 6. Clients NEVER control account role, verified status, credit balance,
--    notification recipient or the quote owner.
