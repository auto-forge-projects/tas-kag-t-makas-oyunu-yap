# 16 — Retrospektif: AutoForge pipeline'ı (tas-kag-t-makas-oyunu-yap koşusu)

- Tarih: 2026-07-19 | Mod: AUTOPILOT | Girdi: `AUTOFORGE-FEEDBACK.md` (AF-030..AF-039)
- Kapsam: FABRİKA değerlendirilir, ürün değil.

## Ne iyi gitti
- LITE `async_review` gerçekten çalıştı: Faz 10 (Code Review) arka planda subagent'a devredilirken Faz 11 (Test) ve Faz 12 (CI/CD) beklemeden ilerledi — JOIN kapısı (Faz 13 öncesi Blocker/Critical=0) doğru uygulandı.
- Doctor + resume disiplini işini gördü: bu koşuda `UNPUSHED_WORK` bulgusu tek adımda (push) çözüldü; daha önceki Faz 9 kesintisi (ORPHANED_RUN) iş listesinden devamla (AF-038) baştan üretim yapmadan kapatılmıştı.
- Kalite kapıları hiçbir fazda "beyan yeterli" olmadı — her faz `verify-gate.mjs` ile bağımsız doğrulandı (ör. Faz 12'de imaj gerçekten build edilip health-check ile test edildi, yalnız Dockerfile varlığına güvenilmedi).
- Blind reviewer (Faz 10) gerçek değer kattı: bağımsız `npm audit` + malformed-URL/traversal testleri + FR-4 test-kapsam boşluğunu (F1) yakaladı — orchestrator'ın kendi Faz 9 incelemesinde görünmeyen bir bulgu.

## En önemli öğrenim
Bu projenin Faz 9'u (AF-036/037/038'de detaylandırıldığı üzere) headless özerklik eksikliği yüzünden üç ayrı şekilde sıkıştı (izin isteyip commit'siz çıkma, yanlış "takıldı" alarmıyla sağlıklı ajanın öldürülmesi, gereksiz baştan-okuma) — bunların hepsi bu koşum SÜRESİNCE fabrika seviyesinde tespit edilip düzeltildi. Ancak bu retro'nun kendisi de YENİ bir sınıf sorun buldu: **arka planda çalışan async subagent ile orchestrator'ın aynı git çalışma ağacında EŞZAMANLI yazması** (`git add -A` kapsam çakışması, AF-039) — mevcut düzeltmeler (iş listesi, canlı-koşum geri çekilmesi, freshness fix) bu senaryoyu kapsamıyordu çünkü ikisi de "canlı ve sağlıklı" çalışıyordu, sorun kesinti değil eşzamanlılıktı.

## Kök-neden temaları (AF kayıtları → temalar)
| Tema | İlgili AF | Özet |
|------|-----------|------|
| Headless özerklik (izin isteyip durma) | AF-036 | Commit≠push ayrımı yoktu; ajan commit için izin isteyip iş commitsiz kaldı |
| Yanlış-alarm → sağlıklı ajanı öldürme | AF-037 | Sık health-check + force-resume, uzun adımda sessiz kalan sağlıklı ajanı öldürüyordu |
| Kesinti sonrası gereksiz baştan-okuma | AF-038 | İş listesi yoktu; resume tüm projeyi yeniden okuyup üretiyordu |
| Async devir + inline eşzamanlılık git çakışması | AF-039 (bu koşum) | Arka plan subagent'ın `git add -A`'sı, orchestrator'ın henüz commit'lemediği paralel faz dosyalarını yanlış commit mesajı altına topladı |
| Gerçekçi olmayan NFR hedefi (Docker boyutu) | AF-039 (bu koşum) | Faz 8 planlaması `node:alpine` taban ayak izini hesaba katmadan ≤150MB hedefi koydu |

## Somut süreç iyileştirmeleri (kalite kapısı: ≥1)

### Öneri 1 — Async/paralel devirde subagent'lar yalnız KENDİ dosyalarını commit'lesin **[P2, önerildi]**
`docs/templates/phase-brief.md`'ye şu not eklensin: "Bu faz async/paralel çalışıyorsa (`execution.async_review` veya paralel `deps` seti), `git add -A` KULLANMA — yalnız kendi ürettiğin dosyaları (`git add <artefakt-yolu> <DL-yolu>`) ekle." Alternatif/daha güçlü çözüm: async devredilen fazlar için `Agent` çağrısında `isolation:"worktree"` kullan (araç zaten destekliyor) — tam izolasyon, sıfır çakışma riski, tek maliyet ek disk/kurulum süresi.

### Öneri 2 — Plan şablonu Docker boyut hedefini taban imaja göre kalibre etsin **[P3, önerildi]**
`docs/templates/08-plan.md` (veya devops-engineer rol notu), bir NFR olarak "imaj boyutu ≤X MB" önerirken tek-aşama `node:alpine` gibi yaygın tabanların KENDİ ayak izini (~140-150MB) referans alsın; ya gerçekçi bir eşik (ör. ≤220MB tek-aşama Node için) önersin ya da hedef sıkıysa distroless/multi-stage'i planın kendisinde task olarak listelesin. Amaç: Faz 12'nin her seferinde kaçınılmaz bir "NFR kısmen karşılanmadı" DL'si üretmesini önlemek.

## MASTER-PROMPT / CLAUDE.md / şablon değişiklik önerileri
1. `docs/templates/phase-brief.md` → async/paralel devir notu (Öneri 1).
2. `docs/templates/08-plan.md` → Docker/imaj boyutu NFR'i önerirken taban-imaj kalibrasyonu notu (Öneri 2).

## Kalite kapısı raporu
- "En az 1 somut süreç iyileştirmesi" → ✅ GEÇTİ (Öneri 1, Öneri 2).
