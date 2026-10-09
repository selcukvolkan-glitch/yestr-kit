# YeS-TR Değerlendirme Kiti

Novera Research & Consultancy · YeS-TR (Yeşil Sertifika) bina ve yerleşme ölçeği ön değerlendirme, skorlama, kanıt takibi ve Word rapor aracı. Ön değerlendirme amaçlıdır, bağlayıcı değildir.

Derleme adımı yoktur; düz HTML/CSS/JS'dir. `index.html` doğrudan tarayıcıda açılabilir ya da klasör olduğu gibi hosting'e yüklenebilir.

## Özellikler

- Açılış sayfası: proje bilgileri (ad, kurum, YESU, tarih, ölçek, bina tipi, yeni/mevcut, hedef derece) ve kayıtlı projeler
- 6 modül kutusu ile kriter bazında kredi girişi, zorunlu kriter takibi, aşama filtresi
- Sabit özet paneli: toplam ağırlıklı kredi, derece, modül şartları, hedefe ulaşma önerileri
- Kriter bazında kanıt dosyası yükleme (PDF, Word, Excel, görsel, DWG…), sürükle-bırak
- Word (.docx) raporu: görseller ve PDF sayfaları Ekler bölümüne gömülür
- Rapor + kanıt dosyaları zip paketi (ek numaralarıyla klasörlenmiş)

## Yapı

| Dosya | İçerik |
|---|---|
| `index.html` | Açılış ve değerlendirme sayfaları |
| `assets/css/style.css` | Stil |
| `assets/js/data.js` | Kriter, ağırlık ve eşik verisi (YeS-TR Puan Hesaplama v1.3 / 2025 esaslı) |
| `assets/js/engine.js` | Skor motoru (`calc`) ve öneri motoru (`suggest`) |
| `assets/js/storage.js` | localStorage (projeler) ve IndexedDB (kanıt dosyaları) |
| `assets/js/ui.js` | Arayüz, sayfa geçişleri ve olaylar |
| `assets/js/charts.js` | Rapor grafikleri |
| `assets/js/report.js` | Word (.docx) raporu |
| `assets/js/logo.js` | Rapora gömülen logo |
| `vendor/` | docx 9.6.1, pdf.js 3.11.174, JSZip 3.10.1 (yerel kopyalar) |

## Sayfalar

| Adres | Sayfa |
|---|---|
| `giris.html` | Giriş: Yeni Proje / Projeler (adressiz `index.html` buraya yönlenir) |
| `index.html#yeni` | Yeni proje: Proje Bilgileri + Rapor Bilgileri |
| `index.html#projeler` | Projeler / Biten / Silinen sekmeleri |
| `index.html#degerlendirme` | Değerlendirme ekranı (aktif proje) |
| `index.html#rapor` | Aktif projenin rapor bilgileri |
| `index.html#acilis` | Eski birleşik açılış sayfası (bağlantısız, geri dönüş için korunuyor) |

## Yayın

`index.html` içindeki CSS/JS bağlantıları `?v=` sürüm etiketi taşır. Her yayında bu değer artırılmalıdır; aksi halde tarayıcılar (GitHub Pages 10 dakikalık önbellek) eski ve yeni dosyaları karıştırabilir.

## Veri

Tüm proje verileri ve kanıt dosyaları kullanıcının tarayıcısında saklanır; sunucuya gönderilmez. Proje verisi JSON ile dışa/içe aktarılabilir; kanıt dosyaları zip paketiyle teslim edilir.
