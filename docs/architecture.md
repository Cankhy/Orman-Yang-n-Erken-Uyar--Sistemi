# Mimari Notlar

## Sistem Katmanları

### 1. Sunum Katmanı

Kullanıcı tarafında çalışan dashboard, risk haritası, sekmeli operasyon alanları ve oturum akışından oluşur.

- filtreleme
- harita katman kontrolü
- olay listesi
- alarm akışı
- metodoloji görünümü
- operatör oturumu

### 2. API Katmanı

`server.js`, standart Node.js HTTP sunucusu ile aşağıdaki uçları sunar:

- sistem sağlık bilgisi
- dashboard verisi
- istasyon ve olay listeleri
- kullanıcı listesi ve aktif kullanıcı
- oturum açma
- test alarmı

### 3. Domain Servisleri

Backend servis katmanı iş kurallarını taşır:

- `riskEngine.js`: skor ve risk bandı
- `dashboardService.js`: tüm görünüm verisinin birleşimi
- `weatherProvider.js`: dış veri sağlayıcı adaptörü
- `notificationService.js`: alarm kaydı ve webhook tetikleme
- `incidentService.js`: olay akışı
- `userService.js`: kullanıcı ve session yönetimi

### 4. Veri Katmanı

Bu sürümde kalıcı depolama için SQLite kullanılır.

Avantajları:

- kurulum gerektirmez
- tek dosya ile taşınabilir
- demo ve portföy kullanımı için hızlıdır

Seed verileri `backend/data/*.json` dosyalarından ilk açılışta veritabanına yüklenir.

## Veri Akışı

1. frontend `GET /api/dashboard` çağrısı yapar
2. backend hotspot, station, user, incident ve notification verilerini SQLite üzerinden toplar
3. hava durumu provider katmanı canlı veya mock veri döndürür
4. risk motoru hotspot skorlarını üretir
5. dashboard payload tek JSON içinde frontend'e döner
6. frontend panelleri, haritayı ve sekmeleri bu payload ile render eder

## Auth Yaklaşımı

Bu sürümde hafif bir session yapısı vardır:

- kullanıcı listesi API'den çekilir
- seçilen kullanıcı için `POST /api/auth/login` çağrılır
- token tarayıcıda saklanır
- dashboard ve kullanıcı endpoint'leri token ile bağlam kazanır

Bu yapı ileride JWT veya gerçek kimlik sağlayıcıya taşınabilir.

## Güvenlik ve Genişleme

Üretime çıkmadan önce önerilenler:

- JWT veya OAuth tabanlı gerçek auth
- RBAC rol yönetimi
- audit log
- webhook secret doğrulama
- rate limiting
- CORS ve güvenlik başlıkları

## Test Yaklaşımı

Bu repoda temel doğrulama tek komutla yapılır:

- domain testleri: risk motoru
- API testleri: sağlık ve dashboard endpoint'leri

Sonraki aşamada eklenebilir:

- UI smoke testleri
- entegrasyon testleri
- deploy sonrası health checks
