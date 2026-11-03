# UstaCebim — Plesk test yayını

Bu depo **robincrouse/cizmece** oyunundan tamamen ayrıdır.

## Güvenli kurulum

1. Plesk'te `cizmece.xyz` domaininin **mevcut document root** klasörünü ve içeriğini kontrol edin. Var olan dosyaları silmeyin veya üzerine yazmayın.
2. **File Manager** içinde alan adının document root klasörü altında `ustacebim-test` adında yeni, boş bir klasör oluşturun. Böylece test adresi `https://cizmece.xyz/ustacebim-test/` olabilir (domain düzgün çalışıyorsa).
3. Plesk > Domains > cizmece.xyz > Git > Add Repository > Remote Git Hosting yolunu açın.
4. Repository URL: `git@github.com:robincrouse/ustacebim.git`
5. Plesk'in gösterdiği **SSH public key** değerini kopyalayın. GitHub > `robincrouse/ustacebim` > Settings > Deploy keys > Add deploy key üzerinden yalnızca okuma izniyle ekleyin. **Özel anahtar, şifre veya token paylaşmayın.**
6. Plesk'te branch `main`, deployment mode **Manual**, deployment directory de yalnızca yeni `ustacebim-test` klasörü olacak şekilde ayarlayın. **/httpdocs köküne kurmayın**: orada başka uygulama olabilir.
7. **Create** ve ardından **Pull Updates / Deploy from Repository** ile dosyaları alın.
8. Plesk'te bu dizini parola korumalı yapın. Test verisi dışında gerçek kişisel/finansal veri girmeyin.
9. `https://cizmece.xyz/ustacebim-test/` adresinden kontrol edin.

### Dikkat
- Bu yalnızca statik prototiptir; veriler kullanıcının tarayıcısındaki localStorage içinde tutulur.
- Üyelik, teklifler ve hak yükleme simülasyondur, gerçek kullanıcı doğrulaması içermez.
- Gerçek ödeme, fatura, havale eşleştirme veya müşteri verisi için sunucu tarafında ayrı uygulama, veritabanı ve güvenlik değerlendirmesi gerekir.
- Test tamamlanınca alan adı değiştirilse de GitHub deposu aynı kalabilir.
