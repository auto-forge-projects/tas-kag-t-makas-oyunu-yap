# 11 — Test Sonuç Raporu: tas-kag-t-makas-oyunu-yap

- Tarih: 2026-07-19 | Komut: `npm test` (`node --test`), `npm run test:coverage`

## Sonuç raporu

| Metrik | Değer |
|--------|-------|
| Toplam test | 15 (10 birim/Faz 9 + 5 entegrasyon/Faz 11) |
| Geçti | 15 |
| Kaldı | 0 |
| Coverage (line/branch/func, tüm dosyalar) | 95.51% / 93.33% / 71.43% |

- Kapsanmayan satırlar: `src/server.js:43` (genel hata middleware'i — testte hiçbir route hata fırlatmadığı için tetiklenmedi) ve `:47-49` (`require.main === module` bloğu — test import ile çalışır, doğrudan çalıştırma değil). Her ikisi de beklenen/zararsız boşluk; davranışsal risk taşımıyor.
- Başarısızlık analizi: yok — 15/15 yeşil, Faz 9'a geri besleme gerekmiyor.

## Kalite kapısı raporu
- "Kritik senaryolar %100 geçti" → ✅ GEÇTİ (15/15).
