-- 007_professional_business.sql
-- Run ONCE against ustacebim_db after 001_initial.sql.
-- Store private legal/tax data separately from the public professional profile.
CREATE TABLE professional_business_details (
  professional_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  provider_type ENUM('individual','sole_proprietor','company') NOT NULL DEFAULT 'individual',
  legal_business_name VARCHAR(180) NULL,
  tax_office VARCHAR(120) NULL,
  tax_id_encrypted VARBINARY(512) NULL,
  trade_registry_no_encrypted VARBINARY(512) NULL,
  business_city VARCHAR(100) NULL,
  business_district VARCHAR(100) NULL,
  public_website VARCHAR(250) NULL,
  established_year SMALLINT UNSIGNED NULL,
  verification_status ENUM('not_submitted','pending','verified','rejected') NOT NULL DEFAULT 'not_submitted',
  verification_checked_at DATETIME NULL,
  verification_checked_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_biz_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_biz_verifier FOREIGN KEY (verification_checked_by) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_biz_verification (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Files must be uploaded via authenticated API to NON-PUBLIC storage;
-- this table keeps only a pointer, never a public URL or document content.
CREATE TABLE professional_verification_documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  professional_id BIGINT UNSIGNED NOT NULL,
  document_type ENUM('tax_certificate','trade_registry','qualification','identity_check','other') NOT NULL,
  storage_key VARCHAR(255) NOT NULL,
  review_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  reviewer_id BIGINT UNSIGNED NULL,
  reviewed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_verification_document_professional FOREIGN KEY (professional_id) REFERENCES professional_profiles(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_verification_document_reviewer FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_verification_docs_professional (professional_id,review_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Notes: encrypt identifiers in application with server-held key, limit access to
-- owner and authorized verification staff, redact in logs, define retention,
-- do not expose documents, tax identifiers, personal phone or address publicly.
-- Individual providers are not required to supply company tax details;
-- every provider still needs verified account + approved professional profile.
