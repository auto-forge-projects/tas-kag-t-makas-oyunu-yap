# 00 — Fikir (Intake): tas-kag-t-makas-oyunu-yap

- Tarih: 2026-07-19 | Mod: CHECKPOINT | Profil: LITE

## Problem (tek cümle)
Kullanıcının bilgisayara karşı klasik taş-kağıt-makas oynayabileceği, anında sonuç gösteren basit bir oyun yok.

## Çözüm fikri
Kullanıcının taş/kağıt/makas seçeneklerinden birini seçtiği, bilgisayarın rastgele hamle yaptığı, sonucun (kazandı/kaybetti/berabere) 1 saniye içinde gösterildiği; tamamen çevrimdışı çalışan, sunucu/veritabanı gerektirmeyen basit bir web oyunu.

## Hedef kitle
Tek kullanıcı (solo, bilgisayara karşı) — hızlıca oynayıp sonuç görmek isteyen, teknik bilgi gerektirmeyen herkes.

## Kısıtlar & varsayımlar (rafine brief'ten aktarıldı)
- Platform/runtime: Web (tarayıcıda çalışan basit istemci — HTML/JS); framework'süz de olabilir.
- Çevrimiçi/çevrimdışı, veri konumu: Tamamen çevrimdışı çalışabilir; sunucu/veritabanı gerekmez; skor kalıcı saklanmaz.
- Zaman/kota bütçesi: Küçük ölçekli, tek oturumluk bir oyun (POC/LITE).
- Varsayımlar (rafinasyonda yapıldı — kullanıcı düzeltebilir): tek oyunculu (kullanıcı vs bilgisayar); bilgisayar hamlesi rastgele; çok oyunculu/online mod v1 kapsamı dışında.

## Başarı kriterleri
1. Kullanıcı 3 seçenekten (taş/kağıt/makas) birini seçebiliyor ve sonuç 1 saniye içinde gösteriliyor.
2. Kazanma/kaybetme/berabere kuralları %100 doğru uygulanıyor (taş makas ezer, makas kağıdı keser, kağıt taşı sarar).
3. Oturum boyunca skor (kazanma/kaybetme/berabere sayısı) doğru tutuluyor.

## Kapsam dışı (v1)
- Online çok oyunculu mod.
- Kullanıcı hesabı / kalıcı skor tablosu.
- Gelişmiş yapay zekâ (bilgisayar hamlesi öğrenmeyecek, rastgele kalacak).

## Açık sorular (rafine brief'ten devralındı, henüz netleşmedi)
- Web arayüzü mü yoksa terminal/CLI oyunu mu tercih edilir?
- Skorun oturum arası kalıcı olması (ör. localStorage) istenir mi, yoksa yalnız oturum-içi mi yeterli?
- Görsel/temaya dair bir tercih var mı (minimal/sade yeterli mi)?

## Önerilen profil
- **LITE** — Solo, küçük kapsamlı, tek ekranlık bir oyun; kurumsal ölçek/adversarial denetim gerekmiyor. Faz 1+2 birleşik ilerler (`docs/01-02-value-feasibility.md`).

## Kalite kapısı raporu
- "Problem tek cümlede ifade edilebiliyor" → ✅ GEÇTİ (Yukarıdaki "Problem (tek cümle)" bölümü, rafine brief'in `## Rafine problem (tek cümle)` bölümünden birebir ve değiştirilmeden aktarılmıştır; tek cümle olarak ifade edilmiş, çelişki veya belirsizlik içermemektedir.)
