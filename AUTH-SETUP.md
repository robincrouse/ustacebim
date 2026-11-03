# Google / Apple ile giriş

## Kurulum
`database/migrations/002_social_auth.sql` dosyası, daha önce yüklenen 001 şemasından sonra **yalnız UstaCebim veritabanında** bir kere çalıştırılır. Şema kimlik sağlayıcılarını bir `users` hesabıyla ilişkilendirir.

## Uygulama davranışı
- İki giriş seçeneği: Google ile devam et / Apple ile devam et. E-posta/şifre de korunur.
- Kayıt sonrası hesap türü seçimi: Müşteri veya Hizmet Veren; sonradan `both` ile ikisi birden olabilir. Rol değişimi doğrulamalı, yönetici yetkisi asla OAuth ile verilmez.
- Google/Apple tarafından gelen ID token, sunucuda doğrulanır: imza/JWKS, issuer, audience, expiry, nonce (uygunsa). Kalıcı anahtar `provider + subject (sub)` olmalı, yalnız e-posta değil.
- Aynı e-posta görüldüğünde **sessizce hesap birleştirme yapılmaz**. Mevcut hesaba giriş ve ek doğrulama ile kullanıcı açıkça bağlamalı; aksi halde hesap ele geçirme riski vardır.
- Apple özel e-posta gizleme (`privaterelay.appleid.com`) adresleri ile gelebilir; ad/e-posta her girişte tekrar dönmeyebilir. İlk girişte kaydedilen doğrulanmış bilgiler ve sonradan kullanıcının verdiği profil bilgileri esas alınır.
- CSRF için state, tekrar saldırılarını azaltmak için nonce, kısa süreli tek kullanımlık kod ve güvenli `httpOnly`, `Secure`, `SameSite` oturum çerezleri kullanılmalı.
- Kullanıcıları doğrulanmış e-posta ve onaylı hesap politikası olmadan `active` yapmayın. Google/Apple ile giriş, mesleki yeterlilik/işletme kimliği doğrulaması **değildir**.
- Gizli bilgiler (Google client secret, Apple private key, session secrets) yalnız sunucu ortam değişkenlerinde saklanmalı. GitHub'a veya `index.html` dosyasına eklenmemeli.

## Sağlayıcı kurulumu
Google Cloud Console: OAuth web client / consent screen / allowed origins ve callback URL'leri, tam üretim alan adıyla kayıt. Resmi kaynak: https://developers.google.com/identity/gsi/web/guides/overview

Apple Developer: Sign in with Apple-capable primary App ID ile ilişkili Services ID, domain ve return URL ve private key. Apple web kurulumuna bağlı olarak Apple Developer Program ve uygun bir App ID gerekir. Resmi kaynak: https://developer.apple.com/help/account/capabilities/configure-sign-in-with-apple-for-the-web/

## Durum
Bu adım **veritabanı altyapısını** ekler. OAuth düğmeleri henüz canlı giriş sağlamaz: API, sağlayıcı kimlik bilgileri ve callback uçları ayrı geliştirilecek. Geçici domain değişince iki sağlayıcıdaki URL kayıtları güncellenecek.
