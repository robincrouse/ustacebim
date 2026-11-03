-- UstaCebim / MariaDB 10.6+ / 001_initial.sql
-- Run ONCE on a dedicated, empty database. Never run on the Cizmece game database.
-- Use utf8mb4 throughout. Application must use prepared statements and server-side authorization.
SET NAMES utf8mb4;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id CHAR(36) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone_e164 VARCHAR(20) NULL,
  password_hash VARCHAR(255) NULL,
  display_name VARCHAR(120) NOT NULL,
  account_type ENUM('customer','professional','both') NOT NULL DEFAULT 'customer',
  status ENUM('pending','active','suspended','deleted') NOT NULL DEFAULT 'pending',
  email_verified_at DATETIME NULL,
  phone_verified_at DATETIME NULL,
  terms_accepted_at DATETIME NULL,
  privacy_notice_ack_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_users_public_id (public_id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_phone (phone_e164),
  KEY idx_users_status (status),
  KEY idx_users_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE roles (
  id SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(40) NOT NULL UNIQUE,
  label VARCHAR(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_id SMALLINT UNSIGNED NOT NULL,
  granted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE professions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parent_id INT UNSIGNED NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(500) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  FOREIGN KEY (parent_id) REFERENCES professions(id) ON DELETE RESTRICT,
  KEY idx_professions_active (active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE locations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parent_id INT UNSIGNED NULL,
  location_type ENUM('province','district') NOT NULL,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(20) NULL,
  FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_location_parent_name (parent_id, name),
  KEY idx_locations_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE professional_profiles (
  user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  business_name VARCHAR(160) NULL,
  profile_slug VARCHAR(160) NULL UNIQUE,
  bio TEXT NULL,
  experience_years SMALLINT UNSIGNED NULL,
  avatar_path VARCHAR(500) NULL,
  verification_status ENUM('unverified','pending','verified','rejected') NOT NULL DEFAULT 'unverified',
  verification_note VARCHAR(500) NULL,
  visible TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_professional_verify (verification_status, visible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE professional_professions (
  professional_id BIGINT UNSIGNED NOT NULL,
  profession_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (professional_id, profession_id),
  FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
  FOREIGN KEY (profession_id) REFERENCES professions(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE professional_areas (
  professional_id BIGINT UNSIGNED NOT NULL,
  location_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (professional_id, location_id),
  FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE professional_portfolio (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  professional_id BIGINT UNSIGNED NOT NULL,
  media_path VARCHAR(500) NOT NULL,
  caption VARCHAR(250) NULL,
  moderation_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
  KEY idx_portfolio_owner (professional_id, moderation_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE service_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  profession_id INT UNSIGNED NOT NULL,
  location_id INT UNSIGNED NOT NULL,
  title VARCHAR(180) NOT NULL,
  details TEXT NOT NULL,
  budget_min DECIMAL(12,2) NULL,
  budget_max DECIMAL(12,2) NULL,
  desired_date DATE NULL,
  status ENUM('draft','pending','open','matched','completed','cancelled','rejected') NOT NULL DEFAULT 'pending',
  max_quotes SMALLINT UNSIGNED NOT NULL DEFAULT 5,
  accepted_quote_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at DATETIME NULL,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (profession_id) REFERENCES professions(id) ON DELETE RESTRICT,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  KEY idx_requests_search (status, profession_id, location_id, created_at),
  KEY idx_requests_customer (customer_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE request_attachments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  media_path VARCHAR(500) NOT NULL,
  moderation_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE quotes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  professional_id BIGINT UNSIGNED NOT NULL,
  price_amount DECIMAL(12,2) NULL,
  price_type ENUM('fixed','estimated','on_site') NOT NULL DEFAULT 'estimated',
  currency CHAR(3) NOT NULL DEFAULT 'TRY',
  message TEXT NOT NULL,
  status ENUM('sent','withdrawn','accepted','declined') NOT NULL DEFAULT 'sent',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE RESTRICT,
  FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE RESTRICT,
  UNIQUE KEY uq_quote_per_professional (request_id, professional_id),
  KEY idx_quotes_professional (professional_id, created_at),
  KEY idx_quotes_request (request_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE service_requests
  ADD CONSTRAINT fk_request_accepted_quote FOREIGN KEY (accepted_quote_id) REFERENCES quotes(id) ON DELETE SET NULL;

CREATE TABLE conversations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  professional_id BIGINT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE RESTRICT,
  UNIQUE KEY uq_conversation_pair (request_id, professional_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE messages (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT UNSIGNED NOT NULL,
  sender_id BIGINT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE RESTRICT,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
  KEY idx_messages_conversation (conversation_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subscription_plans (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  monthly_price DECIMAL(12,2) NOT NULL,
  yearly_price DECIMAL(12,2) NOT NULL,
  monthly_quote_allowance SMALLINT UNSIGNED NOT NULL,
  category_limit SMALLINT UNSIGNED NOT NULL,
  area_limit SMALLINT UNSIGNED NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  currency CHAR(3) NOT NULL DEFAULT 'TRY'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  professional_id BIGINT UNSIGNED NOT NULL,
  plan_id INT UNSIGNED NOT NULL,
  billing_period ENUM('monthly','yearly') NOT NULL,
  status ENUM('pending','active','past_due','cancelled','expired') NOT NULL DEFAULT 'pending',
  starts_at DATETIME NULL,
  current_period_start DATETIME NULL,
  current_period_end DATETIME NULL,
  next_allowance_at DATETIME NULL,
  auto_renew TINYINT(1) NOT NULL DEFAULT 0,
  cancelled_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE RESTRICT,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT,
  KEY idx_subscriptions_owner (professional_id, status),
  KEY idx_subscriptions_renewal (status, next_allowance_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE extra_quote_packages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  quote_count SMALLINT UNSIGNED NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'TRY',
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payment_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  professional_id BIGINT UNSIGNED NOT NULL,
  order_type ENUM('subscription','extra_quotes') NOT NULL,
  subscription_id BIGINT UNSIGNED NULL,
  extra_package_id INT UNSIGNED NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'TRY',
  payment_method ENUM('bank_transfer','payment_provider') NOT NULL,
  status ENUM('pending','under_review','paid','rejected','refunded','cancelled') NOT NULL DEFAULT 'pending',
  transfer_reference VARCHAR(120) NULL,
  bank_transaction_id VARCHAR(150) NULL,
  provider_reference VARCHAR(180) NULL,
  verified_by BIGINT UNSIGNED NULL,
  verified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE RESTRICT,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE RESTRICT,
  FOREIGN KEY (extra_package_id) REFERENCES extra_quote_packages(id) ON DELETE RESTRICT,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_bank_transaction (bank_transaction_id),
  UNIQUE KEY uq_provider_reference (provider_reference),
  KEY idx_payment_status (status, created_at),
  KEY idx_payment_owner (professional_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Append-only quote credit movement records. Never expose direct client writes.
CREATE TABLE quote_credit_ledger (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  professional_id BIGINT UNSIGNED NOT NULL,
  subscription_id BIGINT UNSIGNED NULL,
  payment_order_id BIGINT UNSIGNED NULL,
  quote_id BIGINT UNSIGNED NULL,
  movement_kind ENUM('monthly_grant','extra_grant','quote_spend','refund','expiry','adjustment') NOT NULL,
  credit_delta INT NOT NULL,
  idempotency_key VARCHAR(160) NOT NULL UNIQUE,
  reason VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE RESTRICT,
  FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE RESTRICT,
  FOREIGN KEY (payment_order_id) REFERENCES payment_orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE RESTRICT,
  KEY idx_credit_owner (professional_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE invoices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  payment_order_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('e_invoice','e_archive') NULL,
  invoice_no VARCHAR(100) NULL,
  issued_at DATETIME NULL,
  invoice_status ENUM('pending','issued','cancelled','error') NOT NULL DEFAULT 'pending',
  external_document_id VARCHAR(180) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_order_id) REFERENCES payment_orders(id) ON DELETE RESTRICT,
  UNIQUE KEY uq_invoice_payment (payment_order_id),
  UNIQUE KEY uq_invoice_number (invoice_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  professional_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NULL,
  status ENUM('pending','published','hidden') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES service_requests(id) ON DELETE RESTRICT,
  FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE RESTRICT,
  UNIQUE KEY uq_review_by_customer (request_id, customer_id),
  KEY idx_review_pro (professional_id, status),
  CONSTRAINT chk_rating_range CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT UNSIGNED NOT NULL,
  subject_type ENUM('profile','request','quote','message','review') NOT NULL,
  subject_id BIGINT UNSIGNED NOT NULL,
  reason VARCHAR(120) NOT NULL,
  details TEXT NULL,
  status ENUM('open','reviewing','resolved','dismissed') NOT NULL DEFAULT 'open',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT,
  KEY idx_reports_status (status, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(80) NOT NULL,
  target_id BIGINT UNSIGNED NULL,
  metadata_json LONGTEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT,
  KEY idx_audit_created (created_at),
  CONSTRAINT chk_audit_json CHECK (metadata_json IS NULL OR JSON_VALID(metadata_json))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
