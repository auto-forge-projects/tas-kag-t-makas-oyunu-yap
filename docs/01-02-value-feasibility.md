# 01-02 — Değer & Fizibilite (LITE birleşik faz): tas-kag-t-makas-oyunu-yap

> LITE profil: yarım sayfa hedefi, paydaş analizi yok.

- Tarih: 2026-07-19 | Mod: CHECKPOINT | Profil: LITE

## Değer önerisi
Kullanıcıya kurulum/hesap/internet gerektirmeyen, tek tıkla oynanan klasik taş-kağıt-makas deneyimi sunar — anında sonuç ve doğru skor takibiyle, solo geliştiricinin portföyüne düşük maliyetli bir demo/oyun daha ekler (coinflip/dice-game ile aynı ölçek).

## KPI'lar (kalite kapısı: en az 3, ölçülebilir)
1. Hamle-sonuç gecikmesi: seçim (taş/kağıt/makas) → sonucun ekranda görünmesi ≤ 1 sn (idea Başarı Kriteri 1 ile birebir).
2. Kural doğruluğu: 9 olası hamle kombinasyonunun (3x3) tamamında kazanan/kaybeden/berabere sonucu %100 doğru (birim testte tüm kombinasyonlar denenerek doğrulanır; idea Başarı Kriteri 2 ile birebir).
3. Skor tutarlılığı: N ardışık oyunluk otomatik test senaryosunda skor sayaçları (kazanma/kaybetme/berabere) beklenen değerle %100 eşleşir (idea Başarı Kriteri 3 ile birebir).
4. Sayfa boyutu/yüklenme: ana sayfa ilk yüklemesi (HTML+CSS+JS toplam) ≤ 200 KB (stateless/statik servis hedefiyle tutarlı hafiflik ölçütü, coinflip/dice-game emsali).

## Fizibilite
- Teknik: Tarayıcı tarafı basit JS (3 seçenek karşılaştırma mantığı + `Math.random()` ile bilgisayar hamlesi) — coinflip/dice-game'de kanıtlanmış, düşük riskli kalıp; sunucu tarafında durum/DB yok. ✅
- Ekonomik: Altyapı maliyeti 0 (statik dosyalar + hafif Express sunucusu, dış servis/DB yok); geliştirme tahmini ~1 gün (dice-game'e benzer, hatta biraz daha basit — animasyon şart değil). ✅
- Zaman: v1 tek milestone'da (≤ 2-3 gün) teslim edilebilir; mevcut SSH-push deploy akışı ve Docker paketleme dice-game/coinflip'ten doğrudan uyarlanabilir, yeni altyapı kurulumu gerekmez. ✅

## GO / NO-GO önerisi: **GO**
Gerekçe: Teknik/ekonomik/zaman fizibilitesinin üçü de pozitif; kapsam coinflip/dice-game emsalleriyle örtüştüğü için mimari/deploy riski asgari düzeyde. KPI'lar ölçülebilir ve tamamı Faz 9/11'de otomatik test ile doğrulanabilir niteliktedir (özellikle KPI-2 kural doğruluğu — 9 kombinasyonun tam testi ucuz ve kesin). Kalan üç açık soru (web mi CLI mi, skor kalıcı mı, görsel tema — bkz. `docs/00-idea.md`) ürünün temel değer önerisini veya fizibilitesini değiştirmiyor; Faz 3 (Requirement) ve Faz 6 (UI/UX)'da netleştirilecek. Geri dönüş maliyeti düşük (henüz kod yazılmadı), bu nedenle GO ile ilerlemek zaman/kota bütçesine (LITE, düşük efor) uygundur.

## Kalite kapısı raporu
- "En az 3 ölçülebilir KPI" → ✅ GEÇTİ (4 KPI tanımlandı, her biri hedef değer + ölçüm yöntemiyle; KPI 1-3 idea'daki başarı kriterleriyle birebir izlenebilir).
- "GO/NO-GO kararı gerekçeli" → ✅ GEÇTİ (GO; üç fizibilite ekseni pozitif, gerekçe ve açık soruların sonraki fazlara devri yukarıda açıkça yazılı).

## Açık sorular (idea'dan devralındı, bu fazda kapatılmadı)
- Web arayüzü mü yoksa terminal/CLI mi? → Faz 3 (Requirement) veya kullanıcı checkpoint onayında netleştirilecek.
- Skorun oturum arası kalıcı olması (localStorage) istenir mi? → Faz 3/Faz 6'da netleştirilecek.
- Görsel/tema tercihi var mı (minimal yeterli mi)? → Faz 6 (UI/UX)'da netleştirilecek.

Bu üç soru GO/NO-GO kararını veya KPI'ları etkilemiyor (mevcut varsayımlar — web, oturum-içi skor, minimalist — altında da fizibilite pozitif); bu nedenle fazın kapanması için beklenmelerine gerek görülmedi.
