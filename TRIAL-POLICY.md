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

## 3. Teklif kabulü ve iletişim bilgilerinin açılması
- Müşterinin telefon numarası, açık hizmet talebinde, iş fırsatı bildiriminde, diğer ustaların profilinde veya teklif ekranında **asla gösterilmez**.
- Usta teklif gönderdiğinde 1 hak düşer. Müşterinin daha sonra teklifi kabul etmesiyle **ek kredi düşmez**. İşi görüntülemek, bildirimi açmak, ilgilenmek veya teklifini düzenlemek ücretsizdir.
- Müşteri fiyat ve usta bilgilerini inceledikten sonra **yalnız bir teklifi** kabul edebilir. Kabul, talep sahibinin giriş yapmış oturumundan ve sunucuda transaction içinde yapılır.
- Kabul edilen teklif `quotes.status='accepted'`, `service_requests.accepted_quote_id=quotes.id`, talep durumu `matched` olur. Aynı talebin başka teklifi yanlışlıkla eşzamanlı kabul edilmemelidir; diğerleri `declined` yapılabilir.
- **Telefon numarası yalnızca kabul edilen teklifin sahibi ustaya**, bu kabul sonrasında yetki kontrolüyle ayrı bir `GET /api/requests/:id/contact` gibi kimlik doğrulamalı API çağrısında döner. Diğer ustalar ve anonim ziyaretçiler bu API'de 403 alır. İlgili müşteri kendi iletişim bilgisine erişebilir.
- Telefon numarası istemciye talep listeleme, bildirim, websocket, HTML veri özniteliği veya arama dizini içinde önceden gönderilmez; CSS ile gizlemek güvenli değildir. Cache-Control: no-store ve loglarda PII maskeleme uygulanır.
- Müşteri isterse kabul ettiği ustanın iş için paylaştığı doğrulanmış iletişim numarasını görebilir; iki taraflı paylaşım politikası KVKK aydınlatmasında açıkça belirtilir.
- Talep iptal edildikten veya eşleşme yönetici kararıyla geri alındıktan sonra yeni iletişim bilgisi sorguları kapatılır. Daha önce görülmüş bir telefon numarasının karşı taraftan fiilen geri alınamayacağı kullanıcıya dürüstçe açıklanır.
- Kabul ve iletişim bilgisi erişimi için denetim kaydı tutulur; fazla veri saklama yapılmaz. Telefon sahipliği OTP ile doğrulanmadan gerçek iletişim bilgisi açılmaz.
- `quotes` ve `service_requests` mevcut şeması kabul edilen teklifi temsil etmeye yeterlidir; bu kural için yeni tablo zorunlu değildir. Asıl güvenlik koşulu **sunucu API yetki kontrolüdür**, tarayıcı arayüzü değildir.

## 4. Ücretli abonelikler (henüz onaylanmamış taslak)
- Güncel pilot önerisi: Başlangıç **299 TL / ay, 20 hak / ay**; Profesyonel **599 TL / ay, 50 hak / ay**; Kurumsal **999 TL / ay, 100 hak / ay**. Yıllık tutarlar ve ek paketler de taslaktır.
- Bu rakamlar pilot için kabul edilen planlamadır; gerçek ödeme açılmadan önce vergi, iade ve fiyatlandırma metinleri onaylanmalıdır. Değişiklikler **005_marketplace_flow.sql** ile mevcut abonelik planı kayıtlarına uygulanır.
- Ücretli aylık haklar her dönem başında bir kez grant edilir. Yıllık aboneliklerde 12 aylık hak tek seferde verilmez; her ay yenilenir. Ek hak satın alma kuralları ayrıca netleştirilir.
- Ödeme alınmadan `active` üyelik açılmaz. Havale dekontu tek başına ödeme onayı değildir.

## 5. Kötüye kullanım önlemleri
1. Telefon OTP doğrulaması; numara `+90...` şeklinde normalize edilir. SMS kodu kısa süreli ve tek kullanımlıktır, hız limiti ve deneme sınırı vardır.
2. Veritabanında tek kullanıcı/tek telefon (`users.phone_e164` unique); deneme hakkı için ayrıca yalnız sunucuda tutulan gizli anahtarla üretilmiş **HMAC-SHA-256 telefon parmak izi** benzersiz saklanır. Kod veya HMAC anahtarı GitHub'a konmaz.
3. Bu tekillik aynı kişinin farklı numara kullanmasını tamamen engellemez. Şüpheli toplu hesaplarda cihaz/IP **risk sinyali** ve manuel inceleme yapılabilir; otomatik ve kalıcı ayrımcılık/yanlış bloklama uygulanmaz.
4. E-posta/Google/Apple ile aynı hesaba bağlanma: kimlik sağlayıcının `sub` kimliği kullanılır; yalnız e-posta eşleşmesiyle otomatik birleştirme olmaz.
5. Bir iş ilanına aynı usta en fazla bir teklif gönderir; teklif/kredi işlemleri transaction ve sunucu yetki kontrolüyle korunur.
6. Spam, ilan dışı reklam, sahte profil, toplu otomasyon, telefon paylaşımı ve aynı kişi tarafından tekrarlanan deneme açma girişimleri şikâyet ve yönetim incelemesine alınır.
7. Müşterinin aynı işi tekrar tekrar sahte ilan olarak açması, ustaların kendi ilanlarına teklif atması, koordineli sahte iş/yorum oluşturulması riskleri incelenir.
8. KVKK gereği asgari veri tutulur, amaç/saklama süreleri belirlenir, kullanıcıya açıklanır. Kredi kararları denetlenebilir kayıtlarla verilir; SMS veya konum verisi pazarlama onayına dönüştürülmez.
9. Hesap silme isteğinde yasal saklama yükümlülükleri değerlendirilir; bir defalık deneme için gerekli minimum kötüye kullanım göstergesi sınırlı süreyle tutulur. Kalıcı saklama politikası ayrı onaylanmalı.

## 6. Durum ve uygulama kabul kontrolleri
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

## 7. Sıradaki geliştirme
Node.js + MariaDB API ile `professional_trials` ve `quote_credit_ledger` transaction'ları, usta doğrulaması, teklif politikaları, moderasyon paneli; Netgsm OTP kapalı kalırken yalnız geliştirme ortamında simüle edilen kimlik doğrulama. Canlı kullanıcılara sahte SMS/kod gönderilmiş gibi gösterilmeyecek.

## 8. Uygulama akışı (müşteri → usta → müşteri)
1. Müşteri kendi oturumundan talebi gönderir. Talep uygun meslek, ilçe ve moderasyon kontrollerinden geçince `service_requests.status='open'` olur.
2. `professional_professions` ve `professional_areas` tablolarına göre eşleşen **onaylanmış**, erişime açık ustalara `request_matches` kaydı açılır. `notifications` tablosunda kişisel iletişim bilgisi olmadan uygulama içi bildirim oluşturulur. Çift teslimat aynı ilan için ikinci eşleşme üretmez.
3. Usta iş fırsatını **ücretsiz görüntüler**. İstemiyorsa `dismissed` yapabilir ve hak harcamaz.
4. Usta fiyat ve açıklama girerek **Teklif Ver** der. Sunucu teklif uygunluk kontrolü, 15 ücretsiz hak veya ücretli bakiye denetimini transaction içinde yapar; `quotes` kaydı ve `quote_credit_ledger` için **-1** hareketi birlikte onaylanır. Başarısız/tekrarlı istekte hak düşmez.
5. Müşteri teklifleri kendi panelinden görür. Sadece kendi talebindeki **bir** teklifi onaylar. Müşterinin seçtiği ustadan başka hiç kimse müşterinin telefonunu göremez; iletişim bilgisi gizli API üzerinden yetki kontrolüyle sağlanır.
6. İş tamamlandığında müşteri ve usta ayrı ayrı onaylar. Müşteri ustayı `customer_favorite_professionals` ile favorileyebilir.
7. Aynı müşteri, **daha önce kabul ettiği bir ustaya** yeniden iş daveti gönderebilir. `repeat_service_invitations` kullanılır; bu doğrudan davet **teklif hakkı tüketmez**. Teklif verme ücretinden kaçınmak için tanımadığı bir ustaya ücretsiz doğrudan davet açamaz.
8. Fiyat, ödeme, telefon numarası, rol, kalan hak ve talep sahibi yetkileri **istemciden değil sunucu oturumundan** türetilir.

### Kayıt / üretim durumu
`005_marketplace_flow.sql` yeni tabloları oluşturur ve pilot fiyat/limitlerini günceller. Statik HTML önizlemesi gerçek `notifications`, `quotes` veya bakiye tablolarını **henüz kullanmaz**. Uygulama ve API bağlanmadan gerçek SMS/push, fiyat teklifi, iş kabulü veya telefon açma işlemi yapılmaz.
