# 10 — Code Review: PR-1 (tas-kag-t-makas-oyunu-yap)

- Tarih: 2026-07-19 | Mod: AUTOPILOT | İnceleyen: code-reviewer (Opus, blind) — **Author ≠ Reviewer** (Faz 9'u yazmadım)
- İncelenen: `src/server.js`, `public/{game,app}.js`, `public/index.html`, `public/styles.css`, `tests/*` · Referans: docs/03, docs/05, docs/07

## Yöntem
Beş kaynak modül + üç test dosyası elle okundu. `npm test` bağımsız koşuldu (15/15 yeşil). `npm audit --omit=dev` ve tam audit koşuldu (0 zafiyet). Malformed-URL (`/%c0%af`) ve traversal (`/../src/server.js`) istekleri supertest ile bağımsız denendi → 404, stack sızmıyor. HTML satır-içi handler/script/style taraması (CSP uyumu) yapıldı.

## Bulgular
| # | Severity | Dosya:Satır | Bulgu | Aksiyon |
|---|----------|-------------|-------|---------|
| F1 | Major | public/app.js:51-70 (score), :32-43 (resultText); tests/* | FR-4 kabul kriteri "sayaçlar %100 tutarlı güncellenir (**otomatik test senaryosu**)" ve resultText metin-seçim mantığı hiçbir otomatik testle kapsanmıyor. Mantık DOM'a bağlı `app.js`'te gömülü (Node'da test edilemez); saf/test-edilebilir katman (`game.js`) iyi test edilmiş ama skor-toplama + sonuç-metni saf değil. | `tally(score,result)` ve `resultText(...)` saf fonksiyonlarını `game.js`'e çıkar + birim test ekle (ucuz). Faz 9 hızlı takip veya Faz 15 borç. Kapıyı bloke ETMEZ. |
| F2 | Minor | src/server.js:42-44 | Hata middleware'i hatayı sessizce yutuyor (loglama yok). Stack gizleme doğru (SEC-3 ✅) ama hiç hata gözlemlenebilirliği yok. | Kabul edilebilir (sunucuda fırlatan iş mantığı yok, A09 asgari log). Faz 14/15'e not; opsiyonel `console.error(err)`. |
| F3 | Nit | public/app.js:59 | `score[result === 'win' ? ... : 'tie']++` gereksiz üçlü; `result` zaten 'win'/'lose'/'tie'. | `score[result]++` olarak sadeleştir. |
| F4 | Nit | src/server.js:13-15 | CSP defans-derinliği: `object-src 'none'` + `frame-ancestors 'none'` eklenebilir (X-Frame-Options DENY zaten çerçevelemeyi kapatıyor). | Opsiyonel sertleştirme. |
| F5 | Nit | public/game.js:33-35 / docs/05 | Mimari "istemci ESM" diyor; implementasyon klasik `<script>` + global fallback (daha sağlam: file://, CORS'suz). Doküman kayması. | Doküman notu; kod kusuru değil. |

**Blocker: 0 · Critical: 0 · Major: 1 · Minor: 1 · Nit: 3**

## İzlenebilirlik (FR ↔ kod)
| FR | Karşılayan modül | Durum |
|----|------------------|-------|
| FR-1 Hamle/tur oynanışı | app.js `playRound` (`isProcessing` guard, buton disable) + index.html `<button data-move>` + native Tab/Enter/Space | ✅ Var (guard'a doğrudan otomatik test yok; senkron → NFR-1 karşılanır) |
| FR-2 Adil rastgelelik | game.js `randomMove()` (`Math.random`) | ✅ Test: küme üyeliği + 6000 örnek dağılım ±%5 |
| FR-3 Kural doğruluğu | game.js `decide()` + `BEATS` haritası | ✅ Test: 9/9 kombinasyon + geçersiz girdi throw. Mantık elle de doğrulandı (doğru) |
| FR-4 Oturum-içi skor | app.js `score{}` (yalnız bellek) + server stateless + storage yok | ⚠️ Kısmi: kalıcılık-yokluğu test edildi (cookie/storage); sayaç-doğruluğu otomatik test EDİLMEDİ (F1) |
| FR-5 Statik servis + health | server.js `express.static` + `/health` | ✅ Test: /health 200 tek-alan, / html servis, dotfile 404 |
| FR-6 Kapsam sınırı | Tek-oyunculu; hesap/online/kalıcı skor/öğrenen AI kodu YOK | ✅ İnceleme ile teyit (böyle kod yok) |

## Güvenlik (SEC-*) uygulama kontrolü
- SEC-1: ✅ CSP + nosniff + X-Frame-Options DENY + Referrer-Policy set (server.js:11-20; test + /health'te de bağımsız teyit)
- SEC-2: ✅ `dotfiles:'ignore'`, yalnız public/ kök; traversal `/../src/server.js` → 404 bağımsız teyit
- SEC-3: ✅ Sade 404; malformed URL + bilinmeyen route → 404, gövdede stack yok (bağımsız teyit); prod 500 handler stack sızdırmaz
- SEC-4: ✅ Yalnız `textContent`; grep + test `innerHTML =` deseni yok
- SEC-5: ✅ `npm audit` prod & dev → 0 zafiyet (bağımsız koşuldu)
- SEC-6: ✅ `/health` yalnız `{status:"ok"}` — tek alan (test `Object.keys==['status']`)
- SEC-7/8/9: N/A bu inceleme — Dockerfile/`.dockerignore`/nginx-HTTPS Faz 12/deploy kapsamı; Faz 9 kod artefaktında değil. Faz 12'de doğrulanmalı.

## Test kalitesi değerlendirmesi
Güçlü: `decide()` için 9/9 tam kombinasyon (davranış-tam, gerçek kural doğrulaması), `randomMove()` istatistiksel dağılım toleransıyla (kanıt-tiyatrosu değil), supertest ile /health + güvenlik başlıkları + dotfile + 404 gerçek HTTP davranışı, integration testte NFR-2 boyut / NFR-5 aria+buton / no-cookie / no-storage statik+dinamik kontrol. Birim + entegrasyon + statik-assert dengesi iyi; assertion'lar spesifik (deepEqual, küme üyeliği).
Boşluk: FR-4 sayaç-doğruluğu ve `resultText` dallanma mantığı otomatik test edilmiyor (F1) — DOM'a bağlı `app.js`'e gömülü, saf katmana çıkarılmadığı için. FR-1 `isProcessing` re-entrancy guard'ının da testi yok. Öneri: skor-toplama + sonuç-metnini `game.js`'e saf fonksiyon olarak çıkar → mevcut Node test koşucusuyla ucuza kapsanır.

## Karar
**Kapı GEÇTİ** — Blocker=0, Critical=0. Kalan bulgular gate'i bloke etmez (LITE reviewLoop eşiği: critical). F1 (Major) → Faz 9 ucuz takip veya Faz 15 borç olarak ertelendi (DL-10-001, insan onayı beklemede). F2 → Faz 14/15 not. F3-F5 → opsiyonel iyileştirme.

## Kalite kapısı raporu
- "Blocker/Critical bulgu = 0" → ✅ (Blocker: 0, Critical: 0)
