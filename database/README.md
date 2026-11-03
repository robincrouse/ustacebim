# UstaCebim MariaDB kurulumu

## Durum
Bu dizindeki SQL dosyaları GitHub'a kaydedilmiş **kurulum dosyalarıdır**; Plesk veritabanında henüz çalıştırılmamıştır. `index.html` halen yalnızca tarayıcıda çalışan demodur; bu veritabanına bağlı değildir.

## İzolasyon
- **Çizmece oyununun mevcut MariaDB veritabanını ASLA kullanmayın.**
- Plesk > cizmece.xyz > Databases > Add Database bölümünde ayrı bir veritabanı açın (örneğin `ustacebim_db`; Plesk önek ekleyebilir).
- Ayrı bir veritabanı kullanıcısı açın. Bu kullanıcıya yalnız yeni veritabanına gereken izinleri verin.
- Parolayı GitHub'a, tarayıcı JavaScript dosyasına veya sohbet mesajlarına koymayın.
- Plesk phpMyAdmin ile **yeni ve boş** veritabanını seçin.
- Önce `migrations/001_initial.sql` dosyasını, ardından `seeds/001_catalog.sql` dosyasını Import ile çalıştırın.
- 001 dosyası tekrar tekrar çalıştırılmak üzere tasarlanmamıştır; yeniden çalıştırmadan önce mevcut tablo ve kayıtları kontrol edin.
- Bağlantı bilgilerini sunucu tarafında ortam değişkenleri veya Plesk güvenli yapılandırmasında tutun.

## Uygulama davranışı (sonraki aşama)
1. Kullanıcı kaydı: Şifreyi Argon2id veya bcrypt ile hashleyin; e-posta doğrulaması ve rate limit ekleyin. `public_id` sunucuda UUID olarak üretilmelidir.
2. Usta profilinde meslekler ve ilçeler ilişki tablolarıyla seçilir. Doğrulanmamış ustanın görünürlüğü politika ile yönetilir.
3. Teklif hakkı, `quote_credit_ledger.credit_delta` toplamıdır; istemciden bakiye alanı yazılmaz. Teklif gönderimi ve kredi düşümü **tek veritabanı transaction'ı** içinde yapılır; eş zamanlı işlemlerde kilitleme uygulanır.
4. Bir müşterinin talebine aynı usta bir defa teklif verebilir. Maksimum teklif sayısı (varsayılan 5), uygun meslek/bölge, abonelik ve bakiye sunucuda doğrulanmalıdır.
5. Banka havalesiyle ödeme emri `pending` olarak başlar. Yalnız yetkili yönetici doğrulanmış banka hareketine göre `paid` yapabilir; işlem referansı benzersiz olmalıdır. Sahte dekontla otomatik hak yüklenmez.
6. Abonelik süresi ve her ay teklif hakkı yenileme işleri **sunucu zamanlayıcısıyla** yürütülür; yıllık abonelik ilk ödeme sırasında 12 aylık hakları peşinen yüklemez.
7. Paket fiyatları yalnızca örnektir; vergi/fatura takvimi muhasebeciyle kesinleşmeden gerçek tahsilat açılmamalıdır.
8. Üyelik, mesaj ve dosyalara yalnız ilgili taraflar ve yetkili görevliler erişebilir. Kişisel veri saklama/silme ve yedekleme politikası hazırlayın.
9. Admin yetkileri `roles` ve `user_roles` üzerinden sunucuda uygulanır. Uygulama tarafı buton gizleme güvenlik kontrolü sayılmaz.
10. Profil, mesaj, açıklama gibi serbest metinlerde HTML/SQL enjeksiyonuna karşı prepared statements ve güvenli çıktı işleme kullanın.
11. `service_requests.accepted_quote_id` değerinin aynı talebe ait teklif olduğunu, yorumun gerçekten tamamlanan işe bağlı olduğunu ve `reports.subject_id` referansını uygulama kontrol etmelidir.
12. Canlıda kişisel veriler ve portföy dosyaları için gizli depolama, dosya türü/boyut kontrolleri, yönetici denetim izleri ve yedekleme gerekir.

## Mimarinin bir sonraki adımı
Node.js API + MariaDB sunucu bağlantısı; güvenli kimlik doğrulama, CRUD API, roller, abonelik ve ödeme onay uçları. Yalnız statik `index.html` ile gerçek üyelik sağlanamaz.
