-- UstaCebim 008_professional_media.sql
-- Run once ONLY on ustacebim_db AFTER 001_initial.sql.
-- Files are never stored in MariaDB or accessible before moderation.
ALTER TABLE professional_profiles
  ADD COLUMN logo_path VARCHAR(500) NULL AFTER avatar_path,
  ADD COLUMN cover_image_path VARCHAR(500) NULL AFTER logo_path;

-- professional_profiles.avatar_path already stores individual profile photos.
-- professional_portfolio already stores moderated job examples.
-- professional_verification_documents (007) stores PRIVATE document pointers.
--
-- Upload API requirements (NOT provided by this migration):
-- Require authentication and ownership checks, enforce max avatar/logo 2 MB,
-- cover/portfolio 4 MB each, max 6 portfolio images. Validate file contents
-- by MIME and image decoder (not filename), re-encode, strip EXIF, prevent
-- SVG/HTML/script uploads, randomize storage keys, scan if supported, moderate
-- public gallery; keep verification docs in private non-web-accessible storage.
-- Never trust browser-only client checks or localStorage for confidential files.
