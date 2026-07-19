# 00 — Rafine Proje Brief'i: tas-kag-t-makas-oyunu-yap

- Tarih: 2026-07-19 | Rafine eden model: sonnet (hızlı) | Onay durumu: **Onaylandı** (dashboard, 2026-07-19)

## Ham fikir (kullanıcının girdisi — değiştirilmez)
> taş kağıt makas oyunu yap.

## Rafine problem (tek cümle)
Kullanıcının bilgisayara karşı klasik taş-kağıt-makas oynayabileceği, anında sonuç gösteren basit bir oyun yok.

## Hedef kitle
Tek kullanıcı (solo); hızlıca oynayıp sonuç görmek isteyen herkes — teknik bilgi gerektirmez.

## Kısıtlar & varsayımlar (AF-001 kapanışı)
- Platform/runtime: web (tarayıcıda çalışan basit istemci — HTML/JS); framework'süz de olabilir
- Çevrimiçi/çevrimdışı, veri konumu: tamamen çevrimdışı çalışabilir, sunucu/veritabanı gerekmez, skor kalıcı saklanmaz
- Zaman/kota bütçesi: küçük ölçekli, tek oturumluk bir oyun (POC/LITE)
- Varsayımlar: tek oyunculu (kullanıcı vs bilgisayar), bilgisayar hamlesi rastgele; çok oyunculu/online mod v1 kapsamı dışında

## Başarı kriterleri (ölçülebilir)
1. Kullanıcı 3 seçenekten (taş/kağıt/makas) birini seçebiliyor ve sonuç 1 saniye içinde gösteriliyor
2. Kazanma/kaybetme/berabere kuralları %100 doğru uygulanıyor (taş makas ezer, makas kağıdı keser, kağıt taşı sarar)
3. Oturum boyunca skor (kazanma/kaybetme/berabere sayısı) doğru tutuluyor

## Kapsam sınırı (v1'de yapılmayacaklar)
- Online çok oyunculu mod
- Kullanıcı hesabı / kalıcı skor tablosu
- Gelişmiş yapay zekâ (bilgisayar hamlesi öğrenmeyecek, rastgele kalacak)

## Açık sorular (kullanıcının netleştirmesi önerilen)
- [ ] Web arayüzü mü yoksa terminal/CLI oyunu mu tercih edilir?
- [ ] Skorun oturum arası kalıcı olması (ör. localStorage) istenir mi, yoksa yalnız oturum-içi mi yeterli?
- [ ] Görsel/temaya dair bir tercih var mı (minimal/sade yeterli mi)?

## Önerilen profil ve ilk mod
- Profil: LITE · Gerekçe: küçük, solo, tek-ekranlık bir oyun; kurumsal ölçek/adversarial denetim gerekmiyor

---
## Onay kaydı
- 2026-07-19 — Beklemede
