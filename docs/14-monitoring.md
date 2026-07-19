# 14 — Monitoring: tas-kag-t-makas-oyunu-yap

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE → basit health check + hata loglama

## Ürün tipine göre izleme (state.product.type: web)
| Tip | İzlenecekler |
|-----|--------------|
| API (Express sunucu) | `/health` endpoint, HTTP durum kodları, sunucu process crash |
| Frontend (statik JS) | JS çalışma-zamanı hatası olursa konsola düşer (harici hata takip servisi yok — LITE kapsamı) |

> LITE profil: asgari — health check + stderr/log yeterli, harici APM/log altyapısı kurulmadı.

## Health check
| Kontrol | Sağlıklı | Sorunlu davranış |
|---------|----------|-------------------|
| `GET /health` | `200 {"status":"ok"}` | Timeout/5xx/bağlantı reddi → container `docker inspect --format='{{.State.Health.Status}}'` "unhealthy" (Dockerfile HEALTHCHECK, 30s aralık) |
| `GET /` | `200`, HTML döner | 5xx veya boş yanıt → statik dosya/servis sorunu |
| Container process | `docker ps` → `Up` | Crash/restart loop → `docker logs <container>` stderr incelenir |

## Hata görünürlüğü / loglama
- Sunucu: Express varsayılan `console.log`/stderr (`src/server.js` genel hata middleware'i 500 döner — DL-10-001 Minor bulgusu: şu an `console.error` YOK, yalnız yanıt döner; Faz 15 borcu).
- İstemci: JS hataları yalnız tarayıcı konsoluna düşer (harici hata toplama yok — LITE, kapsam dışı).
- Hassas veri loglanmaz: uygulama zaten stateless (FR-4) — kullanıcı hamlesi/skoru hiçbir yerde loglanmaz/saklanmaz (SEC-6 ile tutarlı, `/health` tek-alanlı yanıt).

## Kritik akış izleme (kalite kapısı)
- En kritik risk: container'ın sessizce çökmesi/yanıt vermemesi (kullanıcıya "beyaz sayfa"). Görünürlük: Docker HEALTHCHECK (30s) `unhealthy` durumuna düşer → `docker ps`/deploy sonrası izleme bunu yakalar; SSH-push deploy akışı (`deploy/remote-deploy.sh`) zaten `docker run` sonrası container durumunu kontrol eder.
- İkincil risk: sunucu hata middleware'i hatayı sessizce yutuyor (log yok) → teşhis zorlaşır. Azaltım: Faz 15'e teknik borç (TD) olarak taşınır (`console.error(err)` eklenmesi ucuz bir düzeltme).

## Kalite kapısı raporu
- "Kritik akışlar için alert/hata görünürlüğü tanımlı" → ✅ GEÇTİ — health check (Docker HEALTHCHECK + `/health`) + stderr/log politikası tanımlı.
