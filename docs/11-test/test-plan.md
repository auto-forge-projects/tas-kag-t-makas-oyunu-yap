# 11 — Test Planı: tas-kag-t-makas-oyunu-yap

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE
- Strateji: birim (Faz 9: `game.test.js`, `health.test.js`) + entegrasyon (Faz 11: `integration.test.js`, aynı süreç içinde supertest/statik dosya denetimi — gerçek tarayıcı/E2E katmanı yok, LITE kapsamı).

## Kritik senaryolar (docs/03 kabul kriterlerinden türetildi)

| Senaryo | FR/NFR/SEC | Test | Katman |
|---------|-----------|------|--------|
| randomMove() daima geçerli/asla boş | FR-2 | game.test.js | Birim |
| 3000 turda dağılım ~%33,3 ±%5 | FR-2 | game.test.js | Birim |
| decide() 9 kombinasyonun tamamı doğru | FR-3 | game.test.js | Birim |
| Geçersiz hamlede hata fırlatır | FR-3 (savunma) | game.test.js | Birim |
| `/health` → 200 tek alan `{status:"ok"}` | FR-5, NFR-8, SEC-6 | health.test.js | Entegrasyon |
| `/` → statik HTML servis edilir | FR-5 | health.test.js | Entegrasyon |
| Güvenlik başlıkları (CSP/nosniff/DENY/no-referrer) | SEC-1 | health.test.js | Entegrasyon |
| Dotfile servis edilmez | SEC-2 | health.test.js | Entegrasyon |
| Bilinmeyen route: sade 404, stack yok | SEC-3 | health.test.js | Entegrasyon |
| Sunucu cookie/oturum oluşturmaz | FR-4, NFR-3 | integration.test.js | Entegrasyon |
| İstemci kodu localStorage/sessionStorage/cookie kullanmaz | FR-4 | integration.test.js | Entegrasyon (statik) |
| DOM yazımı yalnız `textContent` | SEC-4 | integration.test.js | Entegrasyon (statik) |
| Sayfa toplam boyutu ≤200KB | NFR-2 | integration.test.js | Entegrasyon (statik) |
| `aria-live` sonuç bölgesi + 3 gerçek `<button>` | NFR-5 (kısmi) | integration.test.js | Entegrasyon (statik) |

## Kapsam dışı (bilinçli — gerekçe `decisions/DL-11-001.md`)
- NFR-5 tam WCAG 2.1 AA (kontrast oranı, ekran okuyucu duyuru davranışı) — gerçek tarayıcı/axe-core gerektirir, LITE'ta yok.
- NFR-6 çapraz tarayıcı matrisi (Chrome/Firefox/Safari/Edge) — CI'da tarayıcı matrisi kurulmadı.
- FR-1 gerçek-zamanlı "≤1sn" gecikme ölçümü — statik kod incelemesiyle `DISABLE_MS=300ms` sabiti doğrulandı, tarayıcıda timing testi yok.
- NFR-7 Docker imaj boyutu/build süresi — Faz 12 (CI/CD) girdisi, henüz `Dockerfile` yok.

## Kalite kapısı raporu
- "Kritik senaryolar %100 geçti" → ✅ GEÇTİ — 15/15 test yeşil (bkz. `results.md`).
