-- Run AFTER 001_initial.sql; initial demo catalog and plan prices.
-- Prices are placeholders and must be approved before accepting payments.
INSERT INTO roles (slug, label) VALUES
('customer','Müşteri'),('professional','Hizmet Veren'),('moderator','Moderatör'),('admin','Yönetici');

INSERT INTO professions (slug,name,sort_order) VALUES
('elektrik','Elektrikçi',10),
('su-tesisati','Su Tesisatçısı',20),
('boya-badana','Boya ve Badana',30),
('ev-temizligi','Ev Temizliği',40),
('klima-servisi','Klima Servisi',50),
('nakliyat','Ev ve Ofis Nakliyesi',60),
('mobilya-montaj','Mobilya Montajı',70),
('beyaz-esya-servisi','Beyaz Eşya Servisi',80),
('bilgisayar-teknoloji','Bilgisayar ve Teknoloji',90),
('kamera-guvenlik','Kamera ve Güvenlik Sistemleri',100),
('bahce-peyzaj','Bahçe ve Peyzaj',110),
('ozel-ders','Özel Ders',120),
('organizasyon','Organizasyon',130),
('web-tasarim','Web Tasarım',140),
('diger','Diğer Hizmetler',990);

INSERT INTO locations (parent_id,location_type,name,code) VALUES
(NULL,'province','Ankara','06');
SET @ankara_id = LAST_INSERT_ID();

INSERT INTO locations (parent_id,location_type,name) VALUES
(@ankara_id,'district','Altındağ'),
(@ankara_id,'district','Çankaya'),
(@ankara_id,'district','Etimesgut'),
(@ankara_id,'district','Gölbaşı'),
(@ankara_id,'district','Keçiören'),
(@ankara_id,'district','Mamak'),
(@ankara_id,'district','Sincan'),
(@ankara_id,'district','Yenimahalle');

INSERT INTO subscription_plans (slug,name,monthly_price,yearly_price,monthly_quote_allowance,category_limit,area_limit) VALUES
('starter','Başlangıç',299.00,2870.00,10,1,1),
('pro','Profesyonel',599.00,5750.00,30,3,5),
('business','Kurumsal',999.00,9590.00,70,10,999);

INSERT INTO extra_quote_packages (quote_count,price) VALUES
(5,199.00),(15,499.00),(30,899.00);
