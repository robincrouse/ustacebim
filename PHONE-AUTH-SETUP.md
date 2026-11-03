# UstaCebim - SMS ile giriş

- Kullanıcı giriş seçenekleri: Google, Apple, e-posta/şifre ve SMS doğrulama kodu.
- `database/migrations/003_phone_auth.sql`, UstaCebim'in ayrı veritabanında, bir kez çalıştırılmalıdır.
- `users.phone_e164` alanı zaten benzersizdir; telefon girişinden sonra doğrulanmış numara `phone_verified_at` ile işaretlenir.
- Kodlar rastgele üretilmeli; veritabanında yalnızca sunucu gizli anahtarıyla HMAC/SHA-256 türevi saklanmalı. Kodların kendisi, SMS içeriği ve kullanıcı API anahtarı loglara yazılmamalıdır.
- Kodlar 3-5 dakika geçerli, en fazla 5 doğrulama denemeli, başarılı kullanımda tek kullanımlık olmalıdır.
- Telefon numarası ve IP başına oran sınırı, tekrar SMS gönderme bekleme süresi, gün bazında SMS bütçesi ve kötüye kullanım uyarıları gereklidir.
- Başarısız veya süresi dolmuş kodlar oturum oluşturamaz. Kod doğrulama, tek transaction ile kayıt tüketimi ve oturum üretimi yapmalıdır.
- Telefon numarası daha önce bir kullanıcıya bağlıysa yeni hesap açılmamalı; diğer OAuth hesaplarını telefon eşleşmesine göre sessizce birleştirmek yasak olmalıdır. Hesap bağlamak için kullanıcının mevcut hesabında ek doğrulaması gerekir.
- SMS ile giriş meslek/kimlik doğrulaması anlamına gelmez. Usta profil onay akışı ayrı olacaktır.
- SMS sağlayıcısı örneğin Netgsm olabilir. SMS gönderim API'si, kimlik bilgileri ve başlık onayı ayrıca kurulacaktır.
- Uygulama canlıya alınmadan önce SMS sağlayıcısıyla sözleşme, KVKK aydınlatma ve ilgili mesaj türüne göre ileti yönetimi yükümlülükleri incelenmelidir. Kimlik doğrulama mesajı pazarlama izni yerine kullanılamaz.
- Bu aşamada yalnız **veritabanı şeması** hazırlanmıştır; gerçek SMS gönderimi ve telefonla giriş API'si henüz çalışmamaktadır.
