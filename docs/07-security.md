# 07 — Güvenlik Tasarımı: tas-kag-t-makas-oyunu-yap

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Profil: LITE

Girdi: `docs/03-requirements.md` (FR-1..6, NFR-3 asgari yüzey / NFR-4 HTTPS), `docs/05-architecture.md` (2 GET route `/` + `/health`, istemci `Math.random()`, tüm oyun mantığı istemcide, DB/dosya/log/localStorage/çerez yazımı yok). Ürün tamamen stateless: kullanıcı girdi alanı yok, PII yok, oturum yok, sunucu tarafı iş mantığı yok.

## Varlıklar ve veri sınıflandırma
| Veri | Sınıf | Nerede duruyor | Koruma |
|------|-------|----------------|--------|
| Statik dosyalar (index.html/styles.css/app.js/game.js) | Public | `public/` (imaj içi, salt-okunur servis) | Değişmez; `express.static` path-traversal koruması |
| `/health` yanıtı `{status:"ok"}` | Public | Bellekte üretilir | Sabit; sistem/versiyon/env detayı sızdırmaz |
| Skor sayaçları `{win,lose,tie}` + `lastRound` | Ephemeral (kalıcı değil) | Yalnız tarayıcı belleği | Sunucuya asla gitmez; yenilemede sıfırlanır (FR-4) |
| Kullanıcı/PII verisi | **YOK** | — | Toplanmaz/işlenmez/saklanmaz (FR-4, FR-6) |
| Deploy sırları (SSH key/host/user) | Confidential | GitHub Secrets (repo dışı) | `.dockerignore` + env_ref; koda/imaja girmez |

## Threat model (STRIDE)
| Bileşen | Spoofing | Tampering | Repudiation | Info Disclosure | DoS | Elevation | Önlemler |
|---------|----------|-----------|-------------|-----------------|-----|-----------|----------|
| Express statik sunucu | N/A (public, auth yok) | Path-traversal ile imaj dosyası okuma | N/A (yazılan durum yok) | Stack trace / dizin listeleme sızıntısı | Bağlantı seli | RCE (dep zafiyeti) | `express.static` güvenli çözümleme + dotfile reddi, prod hata gizleme, güvenlik başlıkları, `npm audit`, rate-limit proxy'de (SEC-1/2/3/5) |
| `/health` route | N/A | Sabit yanıt (değişmez) | N/A | Versiyon/env/uptime sızıntısı | Ucuz sabit yanıt | N/A | Yalnız `{status:"ok"}`, hiçbir detay yok (SEC-6) |
| İstemci oyun mantığı (game.js) | N/A | Kullanıcı kendi tarayıcısında RNG/skoru değiştirebilir | N/A | Kişisel veri yok | N/A | N/A | Kabul edilir: yerel manipülasyon yalnız kullanıcının kendi ekranını etkiler (skor sunucuya gitmez, güven sınırı yok) |
| İstemci DOM render | N/A | Sonuç metni enjeksiyonu | N/A | — | N/A | N/A | Yalnız sabit sözcük kümesi (tas/kagit/makas + win/lose/tie) `textContent`/`aria-live` ile yazılır, asla `innerHTML` string (SEC-4) |
| Nginx + TLS katmanı | Sahte sertifika | — | TLS access log | Şifresiz trafik | Katman DoS | — | Wildcard TLS, HTTP→HTTPS yönlendirme, HSTS önerisi (NFR-4, SEC-6) |

## Auth / Authz stratejisi
Kimlik doğrulama ve yetkilendirme **uygulanmaz** — bilinçli karar (DL-07-001). Ürün public, salt-okunur, anonim tek-oyunculu bir web oyunudur: kullanıcı hesabı, oturum, kişisel veri veya durum-değiştiren sunucu işlemi yoktur (FR-4/FR-6). Korunacak bir yetki sınırı olmadığından auth eklemek yalnızca saldırı yüzeyi ve karmaşıklık katar, değer katmaz. Tek "yetkili" işlem deploy'dur; o fabrika dışında GitHub Secrets + SSH ile korunur.

## OWASP Top 10 (2021) değerlendirmesi (kalite kapısı: HER madde)
| # | Risk | Uygulanabilir mi | Önlem / Neden uygulanamaz |
|---|------|------------------|----------------------------|
| A01 | Broken Access Control | Kısmen | Korunan kaynak/rol/kullanıcı yok; tek gerçek risk statik dosya path-traversal → `express.static` güvenli çözümleme + dotfile reddi (SEC-2) |
| A02 | Cryptographic Failures | Kısmen | Şifrelenecek/hash'lenecek gizli veri (parola/PII/token) yok; yalnız transit için prod'da HTTPS/TLS zorunlu (NFR-4, SEC-6) |
| A03 | Injection | Hayır | Sunucuda kullanıcı girdisi/DB/şablon/`child_process` yok; istemcide DOM'a yalnız sabit sözcük kümesi (hamle + sonuç) `textContent` ile yazılır, `innerHTML` string kullanılmaz (SEC-4) |
| A04 | Insecure Design | Evet | Stateless, minimal-yüzey tasarım (2 GET route, girdi/depolama yok) zaten en güvenli tasarımdır; "veri toplama/saklama yok" ilkesi korunur (FR-4/FR-6) |
| A05 | Security Misconfiguration | Evet | Prod hata detayı/stack gizlenir, dizin listeleme kapalı, güvenlik başlıkları (Helmet veya elle CSP/X-Content-Type-Options/X-Frame-Options/Referrer-Policy) (SEC-1/3); prod imajda devDep yok (SEC-7) |
| A06 | Vulnerable & Outdated Components | Evet | Tek prod bağımlılık Express; `npm audit --omit=dev` Critical/High=0 CI kapısı (SEC-5, NFR-3); `npm ci` lockfile; alpine ince imaj |
| A07 | Identification & Authentication Failures | Hayır | Kimlik/oturum/parola mekanizması yok (public anonim) — bkz. Auth stratejisi; N/A |
| A08 | Software & Data Integrity Failures | Kısmen | CDN/harici script/3. taraf kaynak yok (tümü kendi imajında self-host); `npm ci` lockfile ile deterministik kurulum; CI yalnız kendi ürettiği artefaktı push eder |
| A09 | Security Logging & Monitoring Failures | Kısmen | Ürün/hamle/skor verisi loglanmaz (FR-4); hassas veri olmadığından denetim logu gereksiz; yalnız standart erişim logu + `/health` smoke test izlemesi (NFR-8) |
| A10 | Server-Side Request Forgery (SSRF) | Hayır | Sunucu hiçbir dış URL/kaynağa istek yapmaz (giden çağrı/proxy/fetch yok); N/A |

## AI tedarik zinciri & fabrika tehditleri (Öneri 7 — OWASP'ın körlüğü)
| Tehdit | Uygulanabilir? | Önlem / Neden uygulanamaz |
|--------|----------------|----------------------------|
| Prompt injection | Hayır | Üründe LLM/model çağrısı yok; kullanıcı girdisi yok |
| Repository/artefakt prompt poisoning | Kısmen | Fabrika riski; küçük denetlenebilir repo, gömülü çalıştırma talimatı yok |
| Dependency confusion | Hayır | İç/private paket yok; yalnız public `express` |
| Malicious package scripts (postinstall) | Kısmen | Bağımlılık minimal; `npm ci` lockfile + `npm audit`; prod imajda devDep yok (SEC-5/7) |
| Shell komut güvenliği | Hayır | Üründe kullanıcı içeriği kabuğa geçmez; `child_process` yok |
| Workspace sınırı / path & symlink escape | Evet | `express.static` traversal koruması + `.dockerignore` COPY sınırı (SEC-2, SEC-8) |
| Secret leakage | Evet | `.dockerignore` ile `.git`/`.env*`/anahtar imaja girmez; koda düz sır yazılmaz (SEC-8) |
| Docker build izolasyonu | Evet | Tek-aşama alpine, `npm ci --omit=dev`, mümkünse non-root çalıştırma; ağa çıkmayan build (SEC-7) |
| Üretilen CI güvenliği | Evet | Workflow yalnız GITHUB_TOKEN; pinlenmiş action önerisi; aşırı yetki yok; deploy SSH-push izole |
| MCP/tool izinleri | Hayır | Üründe agent/tool yüzeyi yok (statik web app) |

## Faz 9'a güvenlik gereksinimleri (developer implementasyon listesi)
- [ ] SEC-1: Güvenlik başlıkları uygulanır — `Content-Security-Policy` (default-src 'self'; script/style 'self'), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer` (Helmet veya elle set). Kontrol: `curl -I /` yanıtında başlıklar mevcut.
- [ ] SEC-2: `express.static` path-traversal güvenli; dotfile servis edilmez (`dotfiles:'ignore'`), yalnız `public/` kökü servis edilir. Kontrol: `GET /../server.js` ve `GET /.git/config` → 404.
- [ ] SEC-3: Prod'da hata detayı/stack trace sızmaz; bilinmeyen route için sade 404, dizin listeleme kapalı. Kontrol: hatalı istek gövdesinde stack yok.
- [ ] SEC-4: İstemci DOM'a hamle/sonuç yazımı yalnız `textContent`/`aria-live` ile (asla `innerHTML` string ataması). Kontrol: `app.js`/`game.js`'te `innerHTML =` deseni grep'te bulunmaz.
- [ ] SEC-5: `npm audit --omit=dev` → Critical/High = 0 (NFR-3). Kontrol: CI adımı yeşil; audit çıktısında Critical/High yok.
- [ ] SEC-6: `/health` yalnız `{status:"ok"}` döner; versiyon/env/uptime/host detayı sızdırmaz. Kontrol: yanıt gövdesi tek alan.
- [ ] SEC-7: Prod imajında devDependency yok (`npm ci --omit=dev`); tek-aşama alpine; mümkünse non-root user. Kontrol: imajda `supertest` yok; imaj boyutu ≤150MB (NFR-7).
- [ ] SEC-8: `.dockerignore` ile `.git`, `.env*`, `node_modules`, anahtar/sır dosyaları imaja kopyalanmaz; koda düz sır yazılmaz. Kontrol: `docker history`/dosya taramasında sır yok.
- [ ] SEC-9: Prod deploy HTTPS ardında; nginx katmanında HTTP→HTTPS yönlendirme + wildcard TLS (NFR-4). Uygulama katmanı deploy-agnostik kalır (istemez); Kontrol: canlı `https://` erişilir, http→https yönlenir.

## Kalite kapısı raporu
- "OWASP Top 10 değerlendirildi" → ✅ GEÇTİ — A01..A10'un her maddesi uygulanabilirlik + önlem/gerekçe ile dolduruldu (boş satır yok; uygulanamaz olanlar N/A gerekçesiyle).
- "AI/tedarik zinciri tehditleri değerlendirildi" → ✅ GEÇTİ — 10 tehdit maddesinin her biri uygulanabilirlik + önlemle değerlendirildi.
- STRIDE threat model → ✅ 5 bileşen (statik sunucu, /health, istemci mantığı, DOM render, nginx/TLS) için dolduruldu.
- Hassas veri sınıflandırması → ✅ Eksiksiz; PII/kalıcı veri YOK açıkça gösterildi (yalnız Public + Ephemeral + deploy Confidential).
- Faz 9'a devredilen SEC gereksinimleri → ✅ SEC-1..SEC-9 (9 madde) somut kontrol kriteriyle bırakıldı.
- Blocker/Critical güvenlik bulgusu: YOK (minimal-yüzey stateless tasarım). Kritik risk kabulü: YOK — istemci-taraflı RNG/skor manipülasyonu bilinçli kabul (yalnız kullanıcının kendi ekranını etkiler, sunucu güven sınırı yok).
