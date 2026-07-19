# 04 — Çözüm Analizi: tas-kag-t-makas-oyunu-yap

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE

## Karar problemi

Ürün, oturum-içi bellek dışında durumsuz (stateless), istemci-öncelikli bir tek-oyunculu taş-kağıt-makas web oyunudur (bkz. `docs/03-requirements.md`). Bu fazda ürünün mimari/teknoloji yaklaşımı **dört gerçek karar noktasında** somutlaştırılır:

1. **Sunucu/çalışma-zamanı ve statik dosya servisi** — HTML/CSS/JS'i kim servis edecek, `/health` ucunu kim sağlayacak? (FR-5, NFR-3, NFR-7, NFR-8, deploy tutarlılığı)
2. **Rastgele bilgisayar hamlesinin üretim yeri ve kaynağı** — hamle nerede, hangi API ile üretilecek? (FR-2, FR-5, NFR-1, NFR-3, adalet KPI ~%33,3 ±%5)
3. **Kazananı belirleme (kural değerlendirme) mantığı** — 9 kombinasyon %100 doğruluk nasıl garanti edilir? (FR-3, test edilebilirlik)
4. **İstemci teknoloji yığını** — sayfa ≤ 200 KB bütçesinde arayüz ne ile inşa edilecek? (NFR-2, NFR-1, NFR-3, NFR-5, NFR-6)

**Belirleyici NFR/kısıtlar:** NFR-1 (hamle→sonuç ≤ 1 sn), NFR-2 (HTML+CSS+JS ≤ 200 KB), NFR-3 (saldırı yüzeyi asgari, `npm audit` Critical/High = 0), NFR-5 (klavye + `aria-live` erişilebilirlik), NFR-7 (Docker imajı ≤ 150 MB, build ≤ 15 dk), NFR-8 (health %100 200 OK). Proje-üstü kısıt: mevcut **coinflip / dice-game** SSH-push deploy kalıbıyla (Express + JSON health + node-alpine) tutarlılık — ayrı DL yerine trade-off kriteri olarak izlenir.

---

## Karar 1 — Sunucu/çalışma-zamanı ve statik dosya servisi

- **A — Express + express.static.** Node.js + Express; `/public` statik dosyaları `express.static` ile, `/health` küçük bir route ile servis edilir. Tek doğrudan npm bağımlılığı. coinflip/dice-game'in birebir kalıbı.
- **B — Sıfır-bağımlılık: çıplak Node `http` + `fs`.** Yalnız çekirdek modüllerle elle statik sunucu; MIME, path-traversal güvenliği, 304/cache elle. npm bağımlılığı yok.
- **C — Yalnız-statik konteyner (nginx).** Node yerine nginx statik servis; `/health` için statik dosya veya conf yönlendirmesi. App katmanında JS runtime yok.

| Kriter (bağlı NFR) | A — Express | B — Çıplak http+fs | C — nginx |
|--------------------|-------------|--------------------|-----------|
| Efor / karmaşıklık | Düşük (hazır kalıp ~30 satır) | Orta (MIME+path-safety+304 elle) | Orta (conf + JSON health hilesi) |
| NFR-3 saldırı yüzeyi / `npm audit` | 1 iyi-denetlenmiş bağımlılık; Critical/High=0 gerçekçi ✅ | Sıfır bağımlılık ama **elle path-safety hatası riski** ⚠️ | Bağımlılık yok; nginx CVE yüzeyi ayrı ⚠️ |
| NFR-7 imaj ≤ 150 MB | node:alpine+express ≈ 55–75 MB ✅ | node:alpine ≈ 50 MB ✅ | nginx:alpine ≈ 25 MB ✅ (en küçük) |
| NFR-8 JSON health `{"status":"ok"}` | Doğal (tek route) ✅ | Doğal ama elle ✅ | Awkward (statik dosya/conf) ⚠️ |
| Deploy tutarlılığı (SSH-push emsali) | Birebir aynı ✅ | Büyük ölçüde aynı ✅ | Kalıptan sapar (akış yeniden yazılır) ❌ |
| Geri alınabilirlik | Yüksek (B'ye tek dosyada dönülür) | Yüksek | Orta (runtime değişimi) |

**Karar 1 seçimi: A — Express + express.static.**

---

## Karar 2 — Rastgele bilgisayar hamlesinin üretim yeri ve kaynağı

- **A — İstemci tarafında `Math.random()`.** Hamle tarayıcı JS'inde `['tas','kagit','makas'][Math.floor(Math.random()*3)]` ile üretilir; sunucu sonucu ne görür ne etkiler. FR-2/FR-5/NFR-3 ile birebir.
- **B — Sunucu tarafında üretim (`GET /move` API).** Tarayıcı sunucudan hamle ister; sunucu üretip döner. Merkezî ama durum/uç ekler.
- **C — İstemci tarafında `crypto.getRandomValues()`.** Kriptografik istemci RNG; modulo-bias'ı kaldırmak için 3'e reddetme-örneklemesiyle indeks üretir.

| Kriter (bağlı NFR) | A — Math.random() | B — Sunucu API | C — crypto.getRandomValues() |
|--------------------|-------------------|-----------------|------------------------------|
| FR-2/FR-5 uyumu (rastgelelik istemcide) | Birebir gereksinim ✅ | **İhlal** (sonucu sunucu üretir) ❌ | Uyumlu (istemci) ✅ |
| NFR-1 gecikme (≤ 1 sn) | Anında, ağ yok ✅ | Ağ gidiş-dönüşü ekler ⚠️ | Anında ✅ |
| NFR-3 saldırı yüzeyi | Ek uç yok ✅ | Yeni sunucu ucu = daha büyük yüzey ❌ | Ek uç yok ✅ |
| Adalet KPI (her hamle ~%33,3 ±%5) | 3 seçenekte modulo-bias ihmal edilebilir; ±%5'i rahat geçer ✅ | Geçer ama gereksiz maliyetle ✅ | En güçlü entropi; geçer ✅ |
| Efor / karmaşıklık | En düşük (tek satır) | En yüksek (uç + no-store) | Düşük+ (typed array + rejection) |
| Geri alınabilirlik | Yüksek (C'ye tek fonksiyonda geçiş) | Düşük | Yüksek |

**Karar 2 seçimi: A — `Math.random()`.** (C, geri-alınabilir tek-fonksiyonluk ileri-yükseltme olarak notlanır; B, gereksinim ihlali nedeniyle elenir.)

---

## Karar 3 — Kazananı belirleme (kural değerlendirme) mantığı

- **A — Açık kazanç haritası (saf fonksiyon).** `beats = { tas:'makas', kagit:'tas', makas:'kagit' }`; eşitse berabere, `beats[user]===cpu` ise kullanıcı kazanır, aksi kaybeder. Kural veri olarak tabloda; saf fonksiyon → 9 kombinasyon doğrudan test edilir.
- **B — Modüler aritmetik.** Hamleler 0/1/2 kodlanır; `(user - cpu + 3) % 3` → 0 berabere, 1 kazandı, 2 kaybetti. Kompakt ama sonuç, kodlama sırasına gizli bağımlıdır (okunması/denetlenmesi zor).
- **C — İç içe if/else koşulları.** Her kombinasyon elle dallanır. Uzun, kopyala-yapıştır hatasına açık.

| Kriter (bağlı NFR/FR) | A — Kazanç haritası | B — Modüler aritmetik | C — İç içe if |
|-----------------------|---------------------|-----------------------|----------------|
| FR-3 doğruluk (9 kombinasyon %100) | Veri-tablosu, doğrudan denetlenir ✅ | Doğru ama gizli varsayım riski ⚠️ | Doğru ama insan-hatası yüzeyi geniş ❌ |
| Test edilebilirlik | Saf fonksiyon, 9 vaka birebir ✅ | Saf fonksiyon ✅ | Dallar arttıkça kapsam zorlaşır ⚠️ |
| Okunabilirlik / bakım | En yüksek (kural gözle okunur) ✅ | Düşük (aritmetik yorum ister) ⚠️ | Düşük (tekrar) ⚠️ |
| Genişletilebilirlik (ör. RPS-5) | Haritaya satır ekle ✅ | Aritmetik yeniden türetilir ❌ | Kombinatoryel patlar ❌ |
| Geri alınabilirlik | Yüksek (izole saf fonksiyon) | Yüksek | Yüksek |

**Karar 3 seçimi: A — Açık kazanç haritası (saf fonksiyon).**

---

## Karar 4 — İstemci teknoloji yığını

- **A — Framework-suz vanilla JS + HTML/CSS.** Tek küçük `.js`, doğrudan DOM API; build adımı yok.
- **B — Hafif framework (Preact + htm, ~4–8 KB).** Bildirimsel bileşen, minimal boyut; ESM ile build'siz kullanılabilir.
- **C — SPA framework (React + Vite build).** Zengin ekosistem; bundler/build zinciri.

| Kriter (bağlı NFR) | A — Vanilla | B — Preact+htm | C — React+Vite |
|--------------------|-------------|-----------------|-----------------|
| NFR-2 sayfa ≤ 200 KB | Birkaç KB, en küçük ✅ | ~4–8 KB, bütçe içi ✅ | React+ReactDOM ~130 KB+ min; bütçe risk ⚠️ |
| NFR-1 gecikme (parse/hydrate) | Sıfır framework maliyeti ✅ | İhmal edilebilir ✅ | Hydration + bundle parse ⚠️ |
| NFR-3 bağımlılık / `npm audit` | Sıfır istemci bağımlılığı ✅ | Az bağımlılık ✅ | Geniş bağımlılık ağacı ❌ |
| Karmaşıklık / build | Yok (statik dosyalar) ✅ | Düşük | Yüksek (build zinciri, CI) ⚠️ |
| NFR-5/NFR-6 erişilebilirlik+uyum | Elle ama tam kontrol ✅ | İyi ✅ | İyi ama fazla soyutlama |
| Geri alınabilirlik | Yüksek (kapsam küçük) | Yüksek | Orta (build paradigması) |

**Karar 4 seçimi: A — Framework-suz vanilla JS.** (Ürünün ekran sayısı bir; framework'ün soyutlaması bu ölçekte NFR-2/NFR-3'e karşı net kayıptır. B, ölçek büyürse geri-alınabilir yol olarak notlanır.)

---

## Birleşik seçim: **Express (A) + istemci `Math.random()` (A) + açık kazanç haritası (A) + vanilla JS (A)**

Ürün, **node-alpine üzerinde minimal bir Express statik sunucu** (`express.static` + `/health` JSON ucu) tarafından servis edilen; **istemci tarafında `Math.random()` ile bilgisayar hamlesini üreten, kuralı açık bir kazanç haritasıyla saf fonksiyonda değerlendiren, framework-suz vanilla JS ile inşa edilmiş** tek-sayfalık, durumsuz bir uygulamadır. Dört seçim, coinflip/dice-game'in kanıtlanmış SSH-push deploy kalıbıyla birebir hizalıdır.

**Gerekçe (alternatifler neden elendi; seçim NFR'lere neden bağlı):**

- **Karar 1 (Express):** B'nin sıfır-bağımlılık cazibesi gerçektir ama path-traversal'a karşı güvenli statik servisi elle yazmak NFR-3'ün "saldırı yüzeyini asgaride tut" ilkesine aykırı bir risk taşır. C (nginx) NFR-7'de en küçük imajı verse de JSON health'i (NFR-8) awkward kılar ve SSH-push deploy tutarlılığını (FR-5) bozar. A; FR-5'te anılan Express'i kullanır, tek iyi-denetlenmiş bağımlılıkla NFR-3'ü korur, node-alpine ile NFR-7'yi karşılar.
- **Karar 2 (`Math.random()`):** B, sonucu sunucuda üreterek FR-2/FR-5/NFR-3'ü **doğrudan ihlal eder** ve NFR-1'e ağ gecikmesi ekler — elenir. C (crypto) meşru bir "daha titiz" alternatiftir ama kumar olmayan bir oyuncak için aşırıdır; `Math.random()`'ın 3 seçenek üzerindeki tekdüzeliği adalet KPI'sını (±%5) rahatça geçer. C, geri-alınabilir ileri-yükseltme olarak açık bırakılır.
- **Karar 3 (Kazanç haritası):** FR-3'ün "9 kombinasyon %100 doğru" kabul kriteri, kuralın **denetlenebilir veri** olmasını ödüllendirir. B (modüler aritmetik) doğru sonucu üretir ama gizli kodlama-sırası varsayımı taşır; C (iç içe if) insan-hatası yüzeyini büyütür. A, kuralı gözle okunur bir haritada tutar ve saf fonksiyon olarak 9 vakayı birebir test ettirir.
- **Karar 4 (Vanilla JS):** C (React) tek başına NFR-2 (≤200 KB) bütçesini zorlar ve NFR-3 bağımlılık yüzeyini büyütür — tek ekranlık bu ürün için net kayıp. B (Preact) bütçe içidir ama soyutlamanın faydası bu ölçekte yoktur. A; NFR-1/NFR-2/NFR-3'ü en iyi karşılar, build zinciri gerektirmez, deploy kalıbını sadeleştirir.

Dört seçim birbirini pekiştirir: hepsi "sıfır-ağır-bağımlılık, durumsuz, istemci-öncelikli" ilkesine ve mevcut deploy altyapısına yaslanır; her biri yüksek geri-alınabilirliğe sahiptir (bkz. `decisions/DL-04-001.md`).

## Kalite kapısı raporu

- "En az 2 alternatif karşılaştırıldı" → ✅ GEÇTİ — 4 karar noktasında toplam **12 gerçek alternatif** (her noktada A/B/C) ayrı çok-kriterli trade-off matrisleriyle karşılaştırıldı (maliyet/karmaşıklık/NFR-uyumu/geri-alınabilirlik). Elenen alternatifler göstermelik değildir: B-sunucu-API somut gereksinim ihlaliyle (FR-2/FR-5), C-nginx ve C-React ise gerçek trade-off'larla (deploy tutarlılığı / NFR-2 bütçesi) elendi.
- "Seçim NFR'lere bağlı ve gerekçeli" → ✅ GEÇTİ — birleşik seçim ve her karar noktasının gerekçesi belirleyici NFR'lere (NFR-1/2/3/7/8) ve deploy tutarlılığı kısıtına açıkça bağlandı.
- Otomatik doğrulama: `node scripts/verify-gate.mjs 4 --project tas-kag-t-makas-oyunu-yap --level structural` orchestrator tarafından koşulmalı; faz-4 kontrolleri (≥2 alternatif = 12 tanımlı, trade-off tablosu var, seçim gerekçeli, DL-04-* mevcut) yapı bazında sağlanmaktadır.
</content>
</invoke>
