# tas-kag-t-makas-oyunu-yap v0.1.0 — Release Notes

- Tarih: 2026-07-19 | SemVer: **v0.1.0** (0.x = API garantisi yok) | Mod: AUTOPILOT
> Sürüm numarası Faz 8 planındaki M1 milestone ile tutarlı.

## Öne çıkanlar
- Tek oyunculu, tarayıcı tabanlı taş/kağıt/makas oyunu — kurulum/hesap gerektirmez.

## Özellikler
- FR-1..3: tıkla/Tab+Enter ile hamle seç, adil rastgele bilgisayar hamlesi (istemci `Math.random()`), 9 kombinasyonun tamamı doğru kural.
- FR-4: oturum-içi skor (kazan/kaybet/berabere) — sayfa yenilemede sıfırlanır, hiçbir yerde kalıcı saklanmaz.
- FR-5: `/health` + statik dosya servisi (Express).

## Güvenlik
- SEC-1..4: güvenlik başlıkları (CSP/nosniff/DENY/no-referrer), dotfile reddi, sade 404 (stack sızmaz), yalnız `textContent` (innerHTML yok).
- `npm audit` prod+dev: 0 zafiyet (Faz 10 bağımsız doğrulandı).

## Bilinen sınırlar (`docs/15-maintenance.md`'ye taşınacak — Faz 15 henüz koşmadı)
- Docker imajı 202MB — NFR-7 (≤150MB) hedefinin üstünde (DL-12-001; `node:20-alpine` taban ayak izi).
- FR-4 sayaç/metin mantığı (`tally`/`resultText`) otomatik test edilmiyor — DL-10-001 (Major, ertelendi, insan onayı bekliyor).
- NFR-5 (tam WCAG kontrast/ekran okuyucu) ve NFR-6 (çapraz tarayıcı) otomatik doğrulanmadı — DL-11-001.

## Kurulum
- Yerel: `npm install && npm start` → `http://localhost:3000`
- Docker: `docker build -t tas-kag-t-makas-oyunu-yap:0.1.0 . && docker run -p 3000:3000 tas-kag-t-makas-oyunu-yap:0.1.0`

## Rollback planı (kalite kapısı)
1. Kod: `git revert <deploy commit>` veya bir önceki imaj tag'ine (`:` kısa SHA) `docker run` ile dönüş.
2. Veri uyumluluğu: yok — uygulama tamamen stateless (sunucuda/DB'de kalıcı veri yok), downgrade veri kaybı riski taşımaz.
3. Doğrulama: rollback sonrası `GET /health` → 200 `{"status":"ok"}` ve `GET /` → 200 kontrolü (aynı `tests/health.test.js` senaryoları elle tekrarlanabilir).
4. Dağıtım: SSH-push deploy (`deploy/remote-deploy.sh`) önceki GHCR imaj tag'ini çekip aynı `docker run` + nginx bloğuyla yeniden başlatır — sıfır şema/migrasyon adımı.

## Kalite kapısı raporu
- "Rollback prosedürü tanımlı" → ✅ GEÇTİ (yukarıdaki 4 adım, stateless mimari sayesinde veri riski yok).
- "Sürüm plana uygun" → ✅ GEÇTİ (Faz 8 milestone: v0.1.0, M1, FR-1..6 kapsandı).
