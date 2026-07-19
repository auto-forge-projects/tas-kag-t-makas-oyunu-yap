# 15 — Bakım: tas-kag-t-makas-oyunu-yap

- Tarih: 2026-07-19 | Mod: AUTOPILOT
- Bu dosya ÜRÜNÜN teknik borcunu izler; fabrikanın eksikleri `AUTOFORGE-FEEDBACK.md`'ye (ayrı).

## Bilinen sorunlar
- Docker imajı hedefin (NFR-7 ≤150MB) üstünde (202MB) — işlevsellik/güvenlik etkilenmiyor, yalnız transfer süresi/depolama.
- Sunucu genel hata middleware'i (`src/server.js:42-44`) hatayı sessizce yutuyor — teşhis zorlaşabilir.
- FR-4 sayaç/metin mantığı (`tally`/`resultText`, `public/app.js`) otomatik test edilmiyor — DOM'a gömülü, `game.js`'e çıkarılmamış.

## Teknik borç (kalite kapısı: önceliklendirilmiş)
| # | Borç | Kaynak (DL/review bulgusu) | Öncelik (P1/P2/P3) | Not |
|---|------|---------------------------|--------------------|-----|
| TD-1 | `tally()`/`resultText()` saf fonksiyonlarını `app.js`'den `game.js`'e çıkar + birim test ekle | DL-10-001 (Faz 10 Major, F1) | P2 | Ucuz; davranış değişmez, yalnız test edilebilirlik artar |
| TD-2 | Hata middleware'e `console.error(err)` ekle (gözlemlenebilirlik) | DL-10-001 (Faz 10 Minor, F2) / DL-14-001 | P3 | Tek satır; teşhis kolaylaşır |
| TD-3 | Docker imaj boyutunu ≤150MB'a indirmek için `node:20-alpine` yerine distroless/daha küçük taban değerlendir | DL-12-001 | P3 | Fonksiyonel risk yok; yalnız NFR-7 hedefine tam uyum için |
| TD-4 | NFR-5 (tam WCAG kontrast/ekran okuyucu) ve NFR-6 (çapraz tarayıcı) için gerçek tarayıcı/E2E (Playwright + axe-core) katmanı ekle | DL-11-001 | P2 | Şu an yalnız statik/manuel denetim var |

## Bağımlılık güncelleme planı
- Tek prod bağımlılık: `express` (+ dev: `supertest`). Sıklık: 3 ayda bir `npm outdated` + `npm audit` kontrolü (elle — Dependabot/otomasyon LITE kapsamında kurulmadı).
- Node runtime: `node:20-alpine` (Dockerfile) — Node 20 LTS desteği sona ermeden (2026 sonrası) bir sonraki LTS'e (22) geçiş değerlendirilir.

## Bakım ritmi
- Sürüm başı: `npm audit` + `npm test` yeşil kontrolü (zaten CI'da otomatik).
- Yılda 1: bağımlılık/Node LTS güncelliği elle gözden geçirilir (trafik/kullanım düşük — solo/LITE proje, daha sık ritim gerekmiyor).

## Kalite kapısı raporu
- "Teknik borç önceliklendirilmiş" → ✅ GEÇTİ — 4 borç (TD-1..4), her biri kaynak (DL) + öncelik (P2/P3) ile izlenebilir.
