# UstaCebim

Hizmet arayanlarla hizmet verenleri buluşturan bağımsız platform. **Henüz geliştirme/önizleme sürümüdür.**

## Ön yüz — hazır sayfalar
- `#anasayfa` — ana sayfa, öne çıkan kategoriler, hizmet akışı
- `#hizmetler` — tüm meslekler ve arama
- `#talepler` — örnek iş talepleri, kategori/ilçe filtreleme
- `#talep-olustur` — istemci tarafında talep taslağı
- `#ustalar`, `#usta-detay` — örnek usta listesi ve profil detayları
- `#giris` — e-posta/Google/Apple giriş arayüzü, **devre dışı**
- `#telefon-giris` — telefon giriş arayüzü; **SMS gönderimi devre dışı**
- `#usta-kayit` — usta profili taslağı (bu tarayıcıda saklanır)
- `#paketler` — örnek aylık/yıllık plan fiyatları ve ek haklar; **ödeme yok**
- `#panel` — yerel taslak talep ve profil paneli

## Çalıştırma / yayın
`index.html` ile birlikte `assets/style.css` ve `assets/app.js` dosyalarını **aynı klasör yapısıyla** web köküne kopyalayın. Statik HTML/CSS/JS olduğundan herhangi bir sunucu teknolojisi gerektirmez. URL hash yönlendirmesi kullanır; `/ustacebim-test/` gibi alt dizinde de açılır.

Önerilen test adresi: `https://cizmece.xyz/ustacebim-test/`.

Bu dosyaların GitHub'a eklenmesi, **Plesk sunucusuna dağıtıldıkları anlamına gelmez**. Plesk'te Git entegrasyonu veya dosya yükleme ayrı tamamlanmalı. `cizmece.com` ve Çizmece oyun dosyalarına dokunmayın.

## Gerçek MariaDB yapısı
`database/migrations/001_initial.sql`, `002_social_auth.sql`, `003_phone_auth.sql` dosyaları; `database/seeds/001_catalog.sql` başlangıç verileri. SQL şeması Plesk'teki `ustacebim_db` için ayrıdır. İlk iki kurulumdan sonra `003_phone_auth.sql` henüz Plesk üzerinde çalıştırılmadıysa, diğer dosyaların ardından bir defa yüklenmelidir.

**Şu an statik ön yüz MariaDB'ye bağlanmaz.** Sonraki geliştirme Node.js API, güvenli kayıt/giriş, Google/Apple OAuth, sunucu oturumları, DB sorguları ve Netgsm SMS OTP adaptörüdür.

Netgsm hesabı mevcut, ancak OTP paketi henüz alınmadı. Paket ve gönderici başlığı etkinleşene kadar SMS gönderimi ve gerçek kimlik doğrulaması **kapalı kalmalıdır**. Test için gerçek müşteri telefonu veya özel bilgileri kullanmayın.

## Demo veri güvenliği
Yerel taslaklar `localStorage` içinde yalnız açık tarayıcıda tutulur. Bu gerçek üyelik, kişisel veri güvenliği veya müşteriden gizli depolama sağlamaz. Üretim için HTTPS, kimlik doğrulama, yetki kontrolü, API doğrulama, ayrı dosya depolama, KVKK metinleri, uygulama logları ve yedekleme gereklidir.

İş/eleman ilanları daha sonraki fazda.
