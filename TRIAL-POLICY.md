# UstaCebim — İlk 30 gün ücretsiz deneme ve teklif politikası (v1)
Durum: Ücretsiz deneme için **15 teklif hakkı kararlaştırıldı**. Bu dosya iş kuralları ve API kabul kriteridir; statik web arayüzündeki butonlar henüz gerçek üyelik başlatmaz. Ücretli paketlerin fiyatı/limitleri kesinleşmemiş taslaktır.

## 1. Ücretsiz deneme: kesinleşen kurallar
- Yalnız **hizmet veren (usta)** hesapları için: **30 x 24 saat**, **toplam 15 teklif hakkı**, **2 meslek kategorisi**, **3 hizmet ilçesi**.
- Kullanıcının hesap açtığı anda başlamaz. Telefonu doğrulanıp usta profili onaylandığı ve **ilk kez etkinleştirildiği anda** başlar. Tarihler UTC'de kaydedilir. `ends_at = started_at + INTERVAL 30 DAY`.
- Bir kullanıcı / doğrulanmış telefon için **bir kez** verilir. Yeni Google/Apple hesabı bağlamak, e-postayı değiştirmek veya kullanıcı profilini silip yeniden açmak yeni deneme kazandırmaz.
- 15 hak **30 günlük toplam hak**tır, günlük ya da haftalık yenilenmez. Kullanılmayan haklar sürenin sonunda geçersiz olur, ücretli pakete taşınmaz veya paraya çevrilmez.
- Kredi kartı ve ödeme yöntemi gerekmez; 30 gün sonunda **otomatik ücretli üyeliğe geçiş veya tahsilat yoktur**.
- Deneme bittikten sonra profil ve iş ilanlarını görüntüleme mümkün olabilir; yeni teklif atmak için geçerli ücretli paket/hak gerekecek. Gönderilmiş tekliflere ait görüşmeler erişilebilir kalır, yönetim/kötüye kullanım kararları saklıdır.

## 2. Teklif kredisi tüketimi ve geri iade
- İlan aramak, ilan görüntülemek, profil düzenlemek veya mesajları okumak **hak harcamaz**.
- İlk kez bir ilana **başarıyla teklif gönderildiğinde** 1 teklif hakkı düşer. Bir usta aynı ilana ikinci teklif gönderemez. Var olan teklifini izin verilen sınırlar içinde düzenlemek **ek hak düşürmez**.
- Teklif oluşturma + hak düşümü + talepte `max_quotes` sınırı kontrolü tek atomik veritabanı transaction'ında yapılır; benzersiz `idempotency_key` ile tekrar gönderim aynı haktan bir daha düşmez.
- Usta teklifi kendi isteğiyle geri çekerse hak otomatik iade edilmez (suistimali önlemek için).
- Talep platform kaynaklı hatayla veya sahte/tekrarlı ilan olarak moderatörce iptal edilirse **yönetici denetimiyle** hak iade edilebilir. Gerekçe ve denetim kaydı zorunludur.
- Bir iş talebi için `max_quotes` kadar teklif varsa yeni teklifler durur. Talep açık/uygun meslek ve bölge eşleşmesi gerekir.
- Deneme kredisi yalnızca deneme süresi içinde harcanabilir; `quote_credit_ledger` toplamının pozitif olması tek başına süresi dolan denemede harcama yetkisi vermez.

## 3. Ücretli abonelikler (henüz onaylanmamış taslak)
- Mevcut önizleme: Başlangıç **299 TL / ay, 10 hak / ay**; Profesyonel **599 TL / ay, 30 hak / ay**; Kurumsal **999 TL / ay, 70 hak / ay**. Yıllık tutarlar ve ek paketler de taslaktır.
- 15 tekliflik ücretsiz başlangıçtan sonra 10 haklık ücretli Başlangıç paketi algısal olarak zayıf kalabilir. **Fiyat ve hak sayıları canlı tahsilat açılmadan ayrı kararlaştırılmalıdır**. Şimdilik veritabanındaki tutarları değiştirmeyin.
- Ücretli aylık haklar her dönem başında bir kez grant edilir. Yıllık aboneliklerde 12 aylık hak tek seferde verilmez; her ay yenilenir. Ek hak satın alma kuralları ayrıca netleştirilir.
- Ödeme alınmadan `active` üyelik açılmaz. Havale dekontu tek başına ödeme onayı değildir.

## 4. Kötüye kullanım önlemleri
1. Telefon OTP doğrulaması; numara `+90...` şeklinde normalize edilir. SMS kodu kısa süreli ve tek kullanımlıktır, hız limiti ve deneme sınırı vardır.
2. Veritabanında tek kullanıcı/tek telefon (`users.phone_e164` unique); deneme hakkı için ayrıca yalnız sunucuda tutulan gizli anahtarla üretilmiş **HMAC-SHA-256 telefon parmak izi** benzersiz saklanır. Kod veya HMAC anahtarı GitHub'a konmaz.
3. Bu tekillik aynı kişinin farklı numara kullanmasını tamamen engellemez. Şüpheli toplu hesaplarda cihaz/IP **risk sinyali** ve manuel inceleme yapılabilir; otomatik ve kalıcı ayrımcılık/yanlış bloklama uygulanmaz.
4. E-posta/Google/Apple ile aynı hesaba bağlanma: kimlik sağlayıcının `sub` kimliği kullanılır; yalnız e-posta eşleşmesiyle otomatik birleştirme olmaz.
5. Bir iş ilanına aynı usta en fazla bir teklif gönderir; teklif/kredi işlemleri transaction ve sunucu yetki kontrolüyle korunur.
6. Spam, ilan dışı reklam, sahte profil, toplu otomasyon, telefon paylaşımı ve aynı kişi tarafından tekrarlanan deneme açma girişimleri şikâyet ve yönetim incelemesine alınır.
7. Müşterinin aynı işi tekrar tekrar sahte ilan olarak açması, ustaların kendi ilanlarına teklif atması, koordineli sahte iş/yorum oluşturulması riskleri incelenir.
8. KVKK gereği asgari veri tutulur, amaç/saklama süreleri belirlenir, kullanıcıya açıklanır. Kredi kararları denetlenebilir kayıtlarla verilir; SMS veya konum verisi pazarlama onayına dönüştürülmez.
9. Hesap silme isteğinde yasal saklama yükümlülükleri değerlendirilir; bir defalık deneme için gerekli minimum kötüye kullanım göstergesi sınırlı süreyle tutulur. Kalıcı saklama politikası ayrı onaylanmalı.

## 5. Durum ve uygulama kabul kontrolleri
- [ ] `database/migrations/004_trial_membership.sql` Plesk'teki yalnız `ustacebim_db` üzerinde **bir defa** çalıştırıldı.
- [ ] Usta onayı ve doğrulanmış telefon olmadan deneme başlatılamıyor.
- [ ] Aynı doğrulanmış numara ve farklı e-posta ile ikinci deneme engelleniyor.
- [ ] Onay anında 15 hak bir kez veriliyor; çift API isteği ikinci grant üretmiyor.
- [ ] 15. teklif geçiyor; 16. teklif güvenli şekilde reddediliyor.
- [ ] 30. günün bitiminde kullanılmayan haklar bloklanıyor.
- [ ] Teklif düzenleme ikinci hak harcamıyor; çekilen teklif otomatik hak iade etmiyor.
- [ ] Eşzamanlı iki cihaz ve ağ tekrarında bakiye eksiye inmiyor.
- [ ] Ücretsiz deneme sonunda otomatik ödeme yapılmıyor.
- [ ] Görünür deneme teklifleri gerçek ödeme/kayıt olmadığını açıkça gösteriyor.

## 6. Sıradaki geliştirme
Node.js + MariaDB API ile `professional_trials` ve `quote_credit_ledger` transaction'ları, usta doğrulaması, teklif politikaları, moderasyon paneli; Netgsm OTP kapalı kalırken yalnız geliştirme ortamında simüle edilen kimlik doğrulama. Canlı kullanıcılara sahte SMS/kod gönderilmiş gibi gösterilmeyecek.
