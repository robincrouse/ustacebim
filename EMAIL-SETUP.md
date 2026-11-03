# UstaCebim – E-posta doğrulama kurulumu

Bu dosyalar **GitHub'a eklenmiştir, fakat gerçek SMTP bağlantısı henüz açılmamıştır**. UstaCebim'in e-posta göndericisi olarak geçici olarak `info@cizmece.xyz` kullanılacaktır. GitHub/Plesk e-posta hesabı düzenleme bağlantısı, SMTP kimlik bilgilerini otomatik olarak sağlamaz.

## 1. MariaDB
Plesk > `ustacebim_db` > phpMyAdmin > İçe Aktar bölümünde **bir kez** `database/migrations/006_email_verification.sql` yüklenir. Yalnızca `email_verification_tokens` ve `auth_rate_limits` adlı yeni tabloları ekler. Önceki SQL dosyalarını tekrar yüklemeyin.

## 2. Plesk ve sunucu
- Site dizini: `httpdocs/ustacebim-test/`. Kod: `api/email.php`, `api/status.php`.
- PHP 8.1+, `pdo_mysql`, `openssl`, `mbstring` etkin olmalı.
- SMTP/DB parolaları ve `rate_limit_secret` **kesinlikle GitHub'a veya web köküne konmamalı**. Alan adı kökündeki `private/ustacebim-config.php` gibi web dışı konum kullanılmalı.
- GitHub'daki `config/ustacebim-config.example.php` yalnızca bir şablondur. Gerçek parola, kullanıcı adı ve rastgele en az 32 karakterlik `rate_limit_secret` özel dosyada tutulur. `api/email.php` içindeki `dirname(__DIR__, 3) . '/private/ustacebim-config.php'` bu Plesk dizin düzenini varsayar; farklı kurulumda yol düzeltilmelidir.
- PHPMailer, Composer ile örneğin `composer require phpmailer/phpmailer --no-dev` komutuyla **web kökü dışında** yüklenir. `mailer_autoload` bu Composer kurulumundaki `vendor/autoload.php` dosyasına işaret eder.
- Plesk > cizmece.xyz > Mail > info@cizmece.xyz üzerinden **gerçek SMTP sunucusu adı**, portu, TLS yöntemi ve hesap yetkisi doğrulanır. `localhost` veya uydurma SMTP sunucusu yazılmaz.
- Plesk alan adı için SPF, DKIM, DMARC kayıtları ve gönderici itibarını kontrol edin. `info@cizmece.xyz` adresi doğrulama amaçlıdır; reklam izni için kullanılmaz.

## 3. E-posta doğrulama akışı
1. Kullanıcı `#giris` içindeki `Kayıt Ol` ekranında adını, e-postasını, en az 12 karakterlik şifresini girer.
2. Sunucu MariaDB'de `users.status='pending'` hesabını, güvenli parola özetini ve **yalnızca SHA-256 özeti saklanan** tek kullanımlık e-posta kodunu oluşturur.
3. SMTP ile gönderen `info@cizmece.xyz`: konu `UstaCebim - E-posta adresini doğrula`. Onay linki 30 dakika geçerlidir.
4. Kullanıcı bağlantıyı açıp `E-postamı doğrula` butonuna basar. Böylece `users.email_verified_at` doldurulur ve `status='active'` olur.
5. Doğrulama kullanıcıyı otomatik olarak giriş yapmış saymaz. **Şifreyle oturum açma henüz kodlanmamıştır**; OAuth, SMS ve teklif sistemi de kapalıdır.

### Notlar
- `api/status.php`, yapılandırma/şema eksikse `registration_enabled: false` döner; giriş formu kayıt alanlarını devre dışı tutar. Bu durum güvenli bir varsayılandır.
- `api/email.php` istekleri aynı kaynaktan kabul eder; kayıt ve yeniden gönderim için e-posta/IP bazlı sınırlama bulunur. Üretimde ters proxy IP doğrulaması, captcha/risk kontrolü, teslimat logları, e-posta değişikliği ve tekrar gönderim deneyimi de değerlendirilmelidir.
- `config/ustacebim-config.example.php` dosyasını doğrudan sunucuda gerçek bilgilerle doldurmayın: Git ile dağıtımda bu dosya **web kökünün altında bulunur**. Gerçek bilgiler yalnız ayrı `private` dizininde tutulur.
- `cizmece.com` oyun sitesinin dosyalarına ve veritabanına dokunmayın.

## 4. Test
1. `006_email_verification.sql` başarıyla yüklendiğini phpMyAdmin'de doğrulayın.
2. SMTP gönderici bilgileri ve PHPMailer kurulumu tamamlanınca Plesk'te Git → `ustacebim-test` → Dağıt.
3. `https://cizmece.xyz/ustacebim-test/api/status.php` açıldığında `{"registration_enabled":true}` görünmeli. Bu, sadece temel kurulum kontrolüdür; gerçek e-posta teslimini kanıtlamaz.
4. Kendi test e-posta adresinizle kayıt olun ve `info@cizmece.xyz` gönderenli doğrulama e-postasının geldiğini kontrol edin.
5. Onay linkinin yalnız bir kez çalıştığını ve 30 dakika sonra süresinin dolduğunu test edin. SMTP bilgilerinde sorun varsa e-posta gitmez; kullanıcıya sahte başarı mesajı göstermeyin.
