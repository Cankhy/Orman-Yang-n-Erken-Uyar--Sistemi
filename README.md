# Orman Yangını Erken Uyarı Sistemi

Web tabanlı, harita destekli ve tam-stack mimariye sahip bir yangın karar destek platformu. Bu repo; modern operasyon ekranı, Node.js API katmanı, SQLite veri saklama, risk motoru, olay geçmişi, kullanıcı oturumu, test alarmı ve deploy hazırlığı ile CV ve GitHub için güçlü bir ürün vitrini olacak şekilde tasarlanmıştır.

## Öne Çıkan Özellikler

- Harita destekli modern komuta merkezi arayüzü
- Node.js ile yazılmış modüler backend API
- SQLite tabanlı kalıcı veri katmanı
- Risk skorlama motoru ve istasyon hazırlık analizi
- Olay geçmişi, alarm akışı ve ilk 60 dakika müdahale planı
- Kullanıcı rolü, oturum açma ve izin görünümü
- Test alarmı ve webhook entegrasyonuna hazır bildirim akışı
- Open-Meteo ve OpenWeather destekli hava sağlayıcı yapısı
- Sıfır bağımlılıkla çalışan test doğrulama betiği
- Docker ve Render deploy hazırlığı

## GitHub İçin Hazır Paket

- MIT lisansı
- GitHub Actions CI workflow
- PR şablonu
- `.gitattributes` ile satır sonu standardizasyonu
- temiz `.gitignore` ve örnek `.env`

## Mimari Özet

### Frontend

- `index.html`: ana ürün yüzeyi
- `src/scripts/app.js`: render, filtreleme, sekmeler, oturum ve alarm etkileşimleri
- `src/scripts/dashboardService.js`: API-first, local-fallback veri erişimi
- `src/styles/main.css`: arayüz, sekmeler, paneller ve responsive stiller

### Backend

- `server.js`: HTTP sunucu ve route yönetimi
- `backend/db/database.js`: SQLite kurulum ve seed işlemleri
- `backend/services/dashboardService.js`: dashboard payload üretimi
- `backend/services/riskEngine.js`: risk skorlama motoru
- `backend/services/weatherProvider.js`: canlı veya mock hava verisi sağlayıcısı
- `backend/services/notificationService.js`: test alarmı ve webhook gönderimi
- `backend/services/incidentService.js`: olay kayıtları
- `backend/services/userService.js`: kullanıcı ve oturum yönetimi

## API Uçları

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/incidents`
- `GET /api/users`
- `GET /api/users/me`
- `POST /api/auth/login`
- `POST /api/alerts/test`

## Çalıştırma

```bash
node server.js
```

Ardından [http://localhost:3000](http://localhost:3000) adresini açın.

## Ortam Değişkenleri

Örnek yapı [`.env.example`](C:\Users\Abidin CAN\OneDrive\Documentos\Orman Yangını Erken Uyarı Sistemi\.env.example) içinde bulunur.

Önemli alanlar:

- `WEATHER_PROVIDER=open-meteo|openweather|mock`
- `OPENWEATHER_API_KEY=...`
- `ALERT_WEBHOOK_URL=...`
- `PORT=3000`

Varsayılan olarak `open-meteo` kullanılır. Ağ erişimi yoksa veya sağlayıcı cevap vermezse sistem otomatik olarak mock veriye geri düşer.

## Testler

```bash
node tests/run.js
```

veya

```bash
npm test
```

Test kapsamı:

- risk bandı ve skor mantığı
- sağlık endpoint'i
- dashboard endpoint'i

## GitHub'a Bağlama

Yeni bir GitHub repo oluşturduktan sonra şu komutlar yeterli olacaktır:

```bash
git branch -M main
git add .
git commit -m "Initial release: wildfire early warning platform"
git remote add origin <GITHUB_REPO_URL>
git push -u origin main
```

## Deploy

- Docker için: [Dockerfile](C:\Users\Abidin CAN\OneDrive\Documentos\Orman Yangını Erken Uyarı Sistemi\Dockerfile)
- Render için: [render.yaml](C:\Users\Abidin CAN\OneDrive\Documentos\Orman Yangını Erken Uyarı Sistemi\render.yaml)
- GitHub Pages için: [pages.yml](C:\Users\Abidin CAN\OneDrive\Documentos\Orman Yangını Erken Uyarı Sistemi\.github\workflows\pages.yml)

## Statik Demo Yayını

`main` branch'e her push sonrası GitHub Pages workflow'u çalışacak şekilde repo hazırlandı. Bu repo için beklenen demo adresi:

`https://cankhy.github.io/Orman-Yang-n-Erken-Uyar-Sistemi/`

Not:
GitHub Pages sürümü statik demo olarak çalışır. Backend API gerektiren login ve test alarmı gibi özellikler Pages üzerinde pasif moda düşer. Tam canlı backend için Render veya başka bir Node hosting servisi gerekir.

## Sonraki Üretim Adımları

- PostgreSQL/PostGIS geçişi
- JWT tabanlı kimlik doğrulama
- gerçek SMS ve e-posta bildirimleri
- geçmiş alarm sorguları ve raporlama
- uydu verisi ve ML tabanlı risk tahmini
- gözlem kuleleri için olay oluşturma iş akışı

## Portföy Değeri

Bu proje şu başlıklarda güçlü sinyal üretir:

- Coğrafi veri ve harita tabanlı ürün geliştirme
- Operasyon dashboard tasarımı
- Backend API ve servis katmanı tasarımı
- Domain modelleme ve karar destek mantığı
- Test ve deploy hazırlığı

## Lisans

MIT
