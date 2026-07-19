# 03 — Requirement Analizi: tas-kag-t-makas-oyunu-yap

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE

## Bu fazda kapatılan açık sorular (bkz. `docs/00-idea.md` ve `docs/01-02-value-feasibility.md`)

3 açık soru aşağıdaki FR'lere **varsayım olarak** kapatıldı (gerekçe: `decisions/DL-03-001.md`; AUTOPILOT varsayımı, kullanıcı denetleyebilir):

1. **Web mi, CLI mi?** → Web (FR-6). idea.md kısıtında zaten "Platform/runtime: Web" olarak belirtilmişti — burada teyit edildi.
2. **Skor kalıcı mı?** → Hayır, yalnız oturum-içi bellek (FR-4). idea.md kısıtında zaten "skor kalıcı saklanmaz" deniyordu — burada FR'ye bağlandı.
3. **Görsel tema?** → Minimal/sade (v1); somut tema kararı Faz 6 (UI/UX)'ya bırakıldı — bu FR'leri etkilemiyor.

## Fonksiyonel gereksinimler

### FR-1: Hamle Seçimi ve Tur Oynanışı
- **User story:** Ziyaretçi olarak, taş/kağıt/makas'tan birini tek tıkla seçmek istiyorum, böylece anında sonucu görebileyim.
- **Kabul kriterleri (zorunlu):**
  - Given ana sayfa yüklü, when kullanıcı 3 seçenekten (taş/kağıt/makas) birine tıklar veya Tab+Enter/Space ile seçer, then bilgisayar hamlesi üretilir ve nihai sonuç tetiklemeden itibaren ≤ 1 sn içinde ekranda görünür.
  - Given bir tur sonucu gösteriliyor, when kullanıcı yeni bir hamle seçer, then önceki sonuçtan bağımsız yeni bir tur başlar (skor korunur, round state'i sıfırlanır).
- **Öncelik:** Must

### FR-2: Adil Rastgele Bilgisayar Hamlesi
- **User story:** Ziyaretçi olarak, bilgisayar hamlesinin hileli olmadığından emin olmak istiyorum, böylece oyuna güvenebileyim.
- **Kabul kriterleri (zorunlu):**
  - Given herhangi bir tur tetiklenir, when bilgisayar hamlesi üretilir, then değer daima {taş, kağıt, makas} kümesinden biridir (asla `undefined`/boş).
  - Given 3000 turluk otomatik test örneklemi, when her seçeneğin çıkma sıklığı ölçülür, then her biri ~%33,3 (±%5 mutlak) aralığında çıkar.
  - Given kaynak kod incelenir, then rastgelelik istemci tarafında `Math.random()` ile üretilir; sunucu sonucu etkilemez/önceden belirlemez.
- **Öncelik:** Must

### FR-3: Kural Doğruluğu ve Sonuç Bildirimi
- **User story:** Ziyaretçi olarak, kazanma/kaybetme/berabere kurallarının her zaman doğru uygulandığını görmek istiyorum.
- **Kabul kriterleri (zorunlu):**
  - Given 9 olası hamle kombinasyonunun (3x3) her biri, when sonuç hesaplanır, then klasik kural (taş makası ezer, makas kağıdı keser, kağıt taşı sarar, aynı hamle=berabere) %100 doğru uygulanır (birim testte tüm 9 kombinasyon ayrı ayrı doğrulanır).
  - Given sonuç hesaplanır, when ekrana yazılır, then metinsel sonuç (`aria-live` bölgesiyle) + kullanıcı/bilgisayar hamlesi görsel olarak gösterilir.
- **Öncelik:** Must

### FR-4: Oturum-İçi Skor Takibi (Kalıcı Değil)
- **User story:** Ziyaretçi olarak, oturum boyunca kaç kez kazandığımı/kaybettiğimi/berabere kaldığımı görmek istiyorum.
- **Kabul kriterleri (zorunlu):**
  - Given ardışık N tur oynanır, when her tur tamamlanır, then kazanma/kaybetme/berabere sayaçları beklenen değerle %100 tutarlı güncellenir (otomatik test senaryosu).
  - Given kullanıcı sayfayı yeniler/yeniden ziyaret eder, when sayfa yüklenir, then önceki skor/geçmiş hiçbir yerde (sunucu, `localStorage`, çerez) saklanmamıştır — sayaçlar sıfırdan başlar.
  - Given sunucu (Express), when istek işlenir, then hiçbir hamle/skor verisi sunucu tarafında loglanmaz/saklanmaz.
- **Öncelik:** Must

### FR-5: Statik Dosya Servisi ve Health Check
- **User story:** Operatör olarak, container'ın sağlıklı çalıştığını hızlıca doğrulamak istiyorum, böylece coinflip/dice-game ile aynı SSH-push deploy akışını güvenle kullanabileyim.
- **Kabul kriterleri (zorunlu):**
  - Given container `docker run` ile başlatılır, when `GET /health` istenir, then `200 OK` + `{"status":"ok"}` döner.
  - Given tarayıcı ana sayfayı ister, when `GET /` istenir, then statik HTML/CSS/JS servis edilir; oyun mantığı (hamle/sonuç hesaplama) sunucuda YAPILMAZ (istemcide çalışır — FR-2 ile tutarlı).
- **Öncelik:** Must

### FR-6: Kapsam Sınırı — Tek Oyunculu Web, Online/Hesap YOK
- **User story:** Ziyaretçi olarak, kurulum/hesap/internet bağımlılığı olmadan tek başıma oynamak istiyorum.
- **Kabul kriterleri (zorunlu):**
  - Given arayüz incelenir, then yalnızca kullanıcı-vs-bilgisayar tek oyunculu mod vardır; online çok oyunculu, kullanıcı hesabı, kalıcı skor tablosu veya öğrenen yapay zekâ kontrolü YER ALMAZ (`docs/00-idea.md` "Kapsam dışı (v1)").
- **Öncelik:** Must

## Fonksiyonel olmayan gereksinimler (kalite kapısı: ölçülebilir)

| ID | Kategori | Gereksinim | Ölçüt / Hedef |
|----|----------|------------|----------------|
| NFR-1 | Performans | Hamle seçiminden sonucun görünmesine kadar gecikme | ≤ 1 sn |
| NFR-2 | Performans/Boyut | Ana sayfa ilk yükleme boyutu | Toplam HTML+CSS+JS ≤ 200 KB (sıkıştırılmamış) |
| NFR-3 | Güvenlik | Sunucu kalıcı veri saklamaz; saldırı yüzeyi asgari | DB/dosya yazımı = 0; girdi alanı olmadığından (statik GET + health) XSS/SQLi yüzeyi yok; `npm audit` Critical/High = 0 |
| NFR-4 | Güvenlik | Trafik şifreli taşınır | Prod'da tüm trafik HTTPS (`https://tas-kagit-makas.apps.sametemek.com` benzeri, mevcut wildcard TLS) |
| NFR-5 | Erişilebilirlik | Klavye + ekran okuyucu uyumu | Tüm kontroller yalnız `Tab` ile ulaşılabilir; sonuç `aria-live` ile duyurulur; kontrast ≥ 4,5:1 (WCAG 2.1 AA) |
| NFR-6 | Uyumluluk | Güncel tarayıcı desteği | Chrome/Firefox/Safari/Edge son 2 major sürüm + ≥360px mobil viewport'ta hatasız |
| NFR-7 | Dağıtılabilirlik | Docker imaj boyutu/build süresi | İmaj ≤ 150 MB; `docker build`→çalışan container ≤ 15 dk |
| NFR-8 | Güvenilirlik | Health check doğruluğu | CI/smoke testinde `GET /health` başarı oranı = %100 |

## İzlenebilirlik

| FR | Karşıladığı KPI / iş hedefi |
|----|------------------------------|
| FR-1 (Hamle seçimi) | KPI-1 (gecikme ≤ 1 sn) · idea Başarı Kriteri 1 |
| FR-2 (Adil rastgelelik) | Değer önerisi (güvenilir/anında sonuç) |
| FR-3 (Kural doğruluğu) | KPI-2 (9 kombinasyon %100 doğru) · idea Başarı Kriteri 2 |
| FR-4 (Oturum-içi skor) | KPI-3 (skor tutarlılığı) · idea Başarı Kriteri 3 |
| FR-5 (Statik servis/health) | Fizibilite (deploy hazırlığı, coinflip/dice-game emsali) |
| FR-6 (Kapsam sınırı) | idea "Kapsam dışı (v1)" · Değer önerisi (basitlik) |

## Kalite kapısı raporu
- "Her FR'nin kabul kriteri var" → ✅ GEÇTİ — FR-1..FR-6'nın her biri ≥2 Given/When/Then kabul kriteri içeriyor.
- "NFR'ler ölçülebilir" → ✅ GEÇTİ — NFR-1..NFR-8'in her biri somut eşik içeriyor (≤1sn, ≤200KB, ≥4,5:1, ≤150MB, ≤15dk, %100 health, 0 Critical/High).
