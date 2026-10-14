// Yerleşme kılavuz içerikleri (YeS-TR Yerleşme Değerlendirme Kılavuzu V1, kılavuz: yerlesme.docx).
// Yapı ve kurallar guide.js ile aynıdır (CRIT_GUIDE açıklamasına bakınız); bu tablo yalnızca yerleşme
// ölçeğinde (D.scale === 'Y') kullanılır, çünkü bazı kodlar (ör. İNO 01 K1) bina ölçeğiyle çakışır.

// Oran girdisinden kredi; bands = { Y: [[alt sınır, kredi], ...], M: [...] } (incl: ilk aralık dahil)
const yOran = (k, ad, bands, incl) => (v, p) => {
  const x = gnum(v[k]);
  if (isNaN(x)) return { cr: 0, text: `${ad} değerini girin.` };
  const cr = bandCredit(x, bands[p.durum], incl);
  return { cr, text: `${ad} = ${pct(x)} → ${cr} kredi` };
};
const YM = ['Y', 'M'];

const CRIT_GUIDE_Y = {
  // ==== BOL Bölgesel ve Yakın Çevre Profili
  'BOL 01 K1': {
    amac: 'Bu kriter ile yeşil yerleşme sertifika sürecini başlatmak isteyen projeler için; alanın büyüklüğü, yerleşme hiyerarşisindeki yeri, planlama aşamasındaki yapı yoğunluğu ve güncel imar durumu hakkında kanıt sunulması amaçlanmaktadır.',
    kanit: 'Proje tanıtım dosyası ekle',
    gerek: [{ no: 1, text: '1/1000 ölçekte uygulama imar planı, güncel imar durumu ve proje alanının güncel hava fotoğrafları kullanılarak, ilgili mevzuat doğrultusunda proje alanı ve sınırlarının gösterildiği Proje Tanıtım Dosyası’nın hazırlanması.', durum: YM }],
    kural: 'mandatory',
    kuralText: 'Yeni ve mevcut yerleşmeler için zorunlu bir kriterdir; gereklilikler sağlandığında kriter zorunluluğu yerine getirilmiş olur.',
    yontem: 'Gereklilikler sağlandığı durumda kriter zorunluluğu yerine getirilmiş olmaktadır.',
    belgeler: 'Proje Tanıtım Dosyası',
    kaynaklar: ['İmar Kanunu']
  },
  'BOL 01 K2': {
    amac: 'Bu kriter ile meri üst ve alt ölçek plan ve raporları, İmar Kanunu ve ilgili mevzuat doğrultusunda proje alanının yakın çevresi ile fiziksel, demografik, ekonomik ve sosyal ilişkilerinin analiz edilmesi amaçlanmaktadır.',
    kanit: 'Proje alanı ve yakın çevresi değerlendirme raporu ekle',
    gerek: [{ no: 1, text: 'Makro ve mikro ölçeklerde fiziksel, demografik, ekonomik ve sosyal analizleri içeren Proje Alanı ve Yakın Çevresinin Değerlendirme Raporu’nun hazırlanması.', durum: YM }],
    kural: 'mandatory',
    kuralText: 'Yeni ve mevcut yerleşmeler için zorunlu bir kriterdir; gereklilikler sağlandığında kriter zorunluluğu yerine getirilmiş olur.',
    yontem: 'Gereklilikler sağlandığı durumda kriter zorunluluğu yerine getirilmiş olmaktadır.',
    belgeler: 'Proje Alanı ve Yakın Çevresinin Değerlendirme Raporu',
    kaynaklar: ['İmar Kanunu']
  },
  'BOL 01 K3': {
    amac: 'Bu kriter ile proje alanının içinde bulunduğu bölgenin ve yakın çevresinin meri üst ve alt ölçek plan ve raporlarının, İmar Kanunu ve ilgili mevzuat kapsamında irdelenerek, proje alanının söz konusu plan kademeleri içindeki yerinin yasal ve yönetsel hassasiyetler gözetilerek değerlendirilmesi amaçlanmaktadır.',
    kanit: 'Planlama kademelenmesi raporu ekle',
    gerek: [{ no: 1, text: 'Proje alanının planlama kademelenmesi içindeki yerinin değerlendirildiği meri plan örnekleri ve plan kararlarının yer aldığı Proje Alanı Planlama Kademelenmesi Raporu’nun sunulması.', durum: YM }],
    kural: 'mandatory',
    kuralText: 'Yeni ve mevcut yerleşmeler için zorunlu bir kriterdir; gereklilikler sağlandığında kriter zorunluluğu yerine getirilmiş olur.',
    yontem: 'Gereklilikler sağlandığı durumda kriter zorunluluğu yerine getirilmiş olmaktadır.',
    belgeler: 'Proje Alanı Planlama Kademelenmesi Raporu',
    kaynaklar: ['İmar Kanunu']
  },
  'BOL 02 K1': {
    amac: 'Bu kriter ile; projeye konu alanın mülkiyet ve imar planına ait bilgilerinin, proje sürdürülebilir geliştirme programının ve proje alanının bağlı olduğu yönetim birimine ait bilgilerin sunulması amaçlanmaktadır.',
    kanit: 'Proje sürdürülebilir geliştirme raporu ekle',
    not: 'Raporda yer alan bölümleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 20, text: 'Projeye konu alanın mülkiyet ve imar planına ait bilgileri (gayrimenkul piyasasının analizi, mevcut ekonomik koşullar, tapu bilgileri ve tetkiki, kullanıma dair yasal izin ve belgeler, son üç yıldaki mülkiyet ve imar değişiklikleri, imar durumu, taşınmazın tanıtımı, ulaşım özellikleri), en iyi ve en verimli kullanım analizi ile geliştirilen / geliştirilmesi beklenen fonksiyonların analizi ve verileri (20 kredi).', durum: YM },
      { no: 2, cr: 20, text: 'Proje sürdürülebilir geliştirme programı: proje amaç ve hedefleri, sürdürülebilirlik taahhütleri, finansal analizler, sürdürülebilir arazi gelişimine bağlı hedefler ve proje zaman yönetimi detayları; Yeşil Sertifika sürdürülebilirlik hedefleri ile proje hedeflerinin karşılaştırmalı analizi (20 kredi).', durum: YM },
      { no: 3, cr: 10, text: 'Yönetim birimine ait nüfus, nüfus artış hızı ve brüt yoğunluk bilgileri: nüfusu 1.500.000 ve daha az olan yerleşim birimine bağlı proje alanı; ya da nüfusu 1.500.000’den fazla olan yerleşim birimine bağlı olup AKE 03 K2 kapsamında açık ve yeşil alan miktarı en az %40 olan proje alanı (10 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Proje Sürdürülebilir Geliştirme Raporu’nda yer alan bölümlere göre krediler toplanır (20 + 20 + 10).',
    yontem: 'Projeye konu alanın mülkiyet ve imar planına ait bilgilerin ve proje alanının bağlı olduğu yönetim birimine ait bilgilerin belirtildiği Proje Sürdürülebilir Geliştirme Raporu hazırlanır; kredilendirme raporun içerdiği bölümlere göre yapılır.',
    belgeler: 'Proje Sürdürülebilir Geliştirme Raporu'
  },
  'BOL 02 K2': {
    amac: 'Bu kriter ile; projede bölgesel gelişme için proje paydaşlarının katılımının sağlanmış olması amaçlanmaktadır.',
    kanit: 'Proje katılım ve iletişim planı ekle',
    gerek: [
      { no: 1, text: 'Katılım ve İletişim Planı’nda arsa / arazi paydaşlarının tam listesinin verilmesi; paydaşlar ile katılım ve iletişim türünün ve proje öncesi, sırası ve sonrasındaki toplantıların zaman planlamasının tanımlanmış olması (40 kredi).', durum: YM },
      { no: 2, text: 'Yapılan planlama hakkında paydaşlara bilgilendirme yapılmış olması (tam kredi).', durum: YM }
    ],
    kural: 'levels', levels: [{ req: [1], cr: 40 }],
    kuralText: '(1) numaralı gereklilik yerine getirildiğinde 40 kredi, ayrıca paydaşlara bilgilendirme yapılmışsa yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Proje kapsamında görev alan paydaşları listeleyen, listelenen paydaşlar ile ilgili proje öncesi, sırası ve sonrasında yapılacak olan toplantıların tarihsel planlarının gösterildiği Proje Katılım ve İletişim Planı teslim edilir.',
    belgeler: 'Proje Katılım ve İletişim Planı',
    kaynaklar: ['İmar Kanunu', 'Mekansal Planlar Yapım Yönetmeliği']
  },

  // ==== AKE Sürdürülebilir Arazi Kullanım, Ekoloji ve Afet Yönetimi
  // ---- AKE 01 Planlama ve Ekolojik Değer Varlığı
  'AKE 01 K1': {
    amac: 'Bu kriter ile; proje alanında doğal çevre ve koruma kararlarında yaşanan öncül problemler arasındaki kurumlar arası yetki ve karar kesişmelerinin önlenerek doğal, kültürel ve tarihsel koruma kararlarının uygulanması amaçlanmaktadır.',
    kanit: 'Proje alanı değerlendirme raporu ekle',
    gerek: [{ no: 1, text: 'Proje alanına ait üst ölçekli plan kararları ile uyumlu, projeye ait fonksiyon, alan kullanımı, yoğunluk ve ulaşım ilişkisinin kurulduğu; proje alanındaki yapılaşma kararlarının üst ölçekli kararlara uygun olduğunun belirtildiği Proje Alanı Değerlendirme Raporu’nun hazırlanması.', durum: YM }],
    kural: 'mandatory',
    kuralText: 'Yeni ve mevcut yerleşmeler için zorunlu bir kriterdir.',
    yontem: 'Yeşil sertifika değerlendirme uzmanı tarafından; proje alanına dair yürürlükte olan planlarda bulunan koruma kararlarının belirlenmiş olması ve proje alanındaki yapılaşma kararlarının bu doğrultuda alınıp alınmadığının tespiti yapılmalıdır. Değerlendirme raporunda, proje alanındaki yapılaşma kararlarının üst ölçekli kararlara uygun olduğunun belirtilmiş olması durumunda kriter zorunluluğu yerine getirilmiş olur.',
    belgeler: 'Proje Alanı Değerlendirme Raporu',
    kaynaklar: ['İmar Kanunu', 'Mekansal Planlar Yapım Yönetmeliği']
  },
  'AKE 01 K2': {
    amac: 'Bu kriter ile; proje alanının ekolojik sisteminin sürdürülebilir kılınması ve ekolojik envanterin koruma altına alınması ile özgün doğal değerlerinin korunması amaçlanmaktadır.',
    kanit: 'Ekolojik değerler strateji raporu ekle',
    gerek: [
      { no: 1, text: 'Proje alanındaki ekolojik değer varlığı ve envanterinin çıkarıldığı Ekolojik Değerler Strateji Raporu’nun teslim edilmesi: proje alanının gelişmeden önceki durumunun tespiti (yeni yerleşmeler için), alanda tespit edilen unsurların tasarımı nasıl şekillendirdiğinin analizi ve projenin arazinin ekolojisi üzerine etkisinin ortaya konulması.', durum: YM },
      { no: 2, text: 'Proje alanında yapılaşma ile tehdit altına girecek bir doğal değerin bulunmaması.', durum: YM }
    ],
    kural: 'all',
    kuralText: 'Bu koşulları ispatlayan belgenin teslim edilmesi durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: [
      'Proje alanındaki ekolojik değer varlığı ve envanterinin çıkarılmış olması ve proje alanında yapılaşma ile tehdit altına girecek bir doğal değerin bulunmaması gerekmektedir. Hazırlanacak raporun 3 kısımdan oluşması beklenmektedir:',
      '• Proje alanının gelişmeden önceki durumunun tespit edilmesi (yeni yerleşmeler için),',
      '• Alanda tespit edilen unsurların tasarımı nasıl şekillendirdiğini belirten analiz ve değerlendirmenin yapılması,',
      '• Projenin arazinin ekolojisi üzerine yaptığı etkinin ortaya konulması.'
    ],
    belgeler: 'Ekolojik Değerler Strateji Raporu',
    kaynaklar: ['İmar Kanunu', 'Orman Kanunu', 'Toprak Koruma ve Arazi Kullanımı Kanunu', 'Mera Kanunu', 'Kıyı Kanunu', 'Korunan Alanların Tespit, Tescil ve Onayına İlişkin Usul ve Esaslara Dair Yönetmelik']
  },
  'AKE 01 K3': {
    amac: 'Bu kriter ile; proje alanı seçimi ve inşaat sürecindeki arazi yönetiminde, özellikle yapılaşmanın ekosistem ve su kaynakları üzerinde yarattığı olumsuz etkileri en düşük seviyede tutmak ve sertifikaya konu proje alanındaki biyoçeşitliliğin korunması amaçlanmaktadır.',
    kanit: 'Biyoçeşitliliği koruma ve geliştirme raporu ekle',
    gerek: [
      { no: 1, text: 'Biyoçeşitliliği Koruma ve Geliştirme Raporu kapsamında; proje alanı sınırlarının belirlendiği arazi planı, yerli ya da uyarlanabilir bitki türlerinin listesi, ekolojik değer haritası ve korunması ya da yeniden düzenlenmesi gereken alanın (daha önce yapılaşmış arazilerde yeşil bırakılmış veya sonradan bitkilendirilmiş bölgelerin) gösterildiği proje alanı planının hazırlanması.', durum: YM },
      { no: 2, text: 'Yerinde iyileştirme: proje alanının önceden kullanılmış alanlarının en az %30’unun (taban alanı dahil) yerel ve/veya adapte olabilen bitkiler ile yenilenmesi (kat alanı katsayısı 1,5 ve üzeri projelerde yerli / adapte olabilen bitkilerle bitkilendirilmiş çatı yüzeyi bu hesaba dahil edilebilir).', durum: YM }
    ],
    kural: 'all',
    kuralText: 'Biyoçeşitliliği Koruma ve Geliştirme Raporu içerisinde belirtilen unsurların sağlanmış olması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: [
      'Proje alanında doğal yaşamı korumak ve yenilemek: doğal yaşamın sağlanması ve biyoçeşitliliğin artması için mevcut doğal alanların korunması, zarar görmüş alanların yeniden düzenlenmesi ile sağlıklı bitkilerin, biyolojik toplulukların, su depolarının ve süzülmenin artmasının sağlanması.',
      'Yerinde iyileştirme: proje alanının önceden kullanılmış alanlarının en az %30’unun (taban alanı dahil) yerel ve/veya adapte olabilen bitkiler ile yenilenmesi. Kat alanı katsayısı 1,5 ve üzeri olan projelerde, doğal yaşamı korumak ve biyoçeşitliliği arttırmak amacıyla yerli / adapte olabilen bitkiler kullanılmış ise bitkilendirilmiş çatı yüzeyi bu hesabın içerisinde yer alabilir.'
    ],
    belgeler: ['Biyoçeşitliliği Koruma ve Geliştirme Raporu:', '• Proje alanı sınırlarının belirlendiği arazi planı,', '• Yerli ya da uyarlanabilir bitki türlerinin listesi,', '• Ekolojik değer haritası,', '• Korunması ya da yeniden düzenlenmesi gereken alanı gösteren proje alanı planı.'],
    kaynaklar: ['İmar Kanunu', 'Kültür ve Tabiat Varlıklarını Koruma Kanunu', 'Milli Parklar Kanunu']
  },

  // ---- AKE 02 Sürdürülebilir Yer Seçimi ve Enerji Etkin Planlama
  'AKE 02 K1': {
    amac: 'Bu kriter ile; yerleşmedeki binaların enerji verimli olması amaçlanmaktadır.',
    kanit: 'Enerji kimlik belgelerini ekle',
    gerek: [{ no: 1, text: 'Yerleşme içerisinde bulunan ve Binalarda Enerji Performansı Yönetmeliği kapsamındaki binaların, enerji performansı ve sera gazı emisyonu sınıflarının en az C olduğunu gösteren Enerji Kimlik Belgesi’ne (EKB) sahip olması.', durum: YM }],
    kural: 'mandatory',
    kuralText: 'Yeni ve mevcut yerleşmeler için zorunlu bir kriterdir.',
    yontem: 'Tüm bina tipleri için hesaplamalar, “Binalarda Enerji Performansı Ulusal Hesaplama Yöntemine Dair Tebliğ” ile belirlenen metodolojiye göre çalışan Ulusal Bina Enerji Performansı Hesaplama Programı (BEP-TR) kullanılarak yapılır. Proje alanındaki binaların enerji performansı ve sera gazı emisyonu sınıfları en az C olan EKB’ye sahip olmaları durumunda zorunluluk yerine getirilmiş olur.',
    belgeler: 'Binaların Enerji Kimlik Belgeleri',
    kaynaklar: ['Enerji Verimliliği Kanunu', 'İmar Kanunu', 'Binalarda Enerji Performansı Yönetmeliği', 'Binalarda Enerji Performansı Ulusal Hesaplama Yöntemine Dair Tebliğ']
  },
  'AKE 02 K2': {
    amac: 'Yerleşmelerde bölgesel ısıtma sistemlerinin kullanılarak hava kalitesinin arttırılması, enerji verimliliği sağlanması ve yakıt seçiminde esneklik sağlanması amaçlanmaktadır.',
    kanit: 'Bölgesel ısıtma raporu ekle',
    not: 'Bölgesel ısıtma sisteminden karşılanan ihtiyacı işaretleyin; en yüksek seçenek sayılır.',
    gerek: [
      { no: 1, text: 'Yerleşmenin ısı ihtiyacının yerleşme içinde veya dışındaki bir bölgesel ısıtma sisteminden karşılandığını belirten; sistemin özellikleri, konumu ve projesini içeren Bölgesel Isıtma Raporu’nun hazırlanması.', durum: YM },
      { no: 2, text: 'Yalnızca sıcak su ihtiyacının bölgesel ısıtma sisteminden karşılanması (yeni 7, mevcut 2 kredi).', durum: YM },
      { no: 3, text: 'Yalnızca ısınma ihtiyacının bölgesel ısıtma sisteminden karşılanması (yeni 9, mevcut 4 kredi).', durum: YM },
      { no: 4, text: 'Isı ihtiyacının tamamının (ısınma ve sıcak su) bölgesel ısıtma sisteminden karşılanması (tam kredi).', durum: YM }
    ],
    kural: 'tiers', must: [1],
    tiers: [{ no: 2, cr: cr7(7, 2), ayri: true }, { no: 3, cr: cr7(9, 4), ayri: true }, { no: 4, cr: cr7(10, 5), ayri: true }],
    kuralText: 'Isı ihtiyacının tamamı bölgesel ısıtma sisteminden karşılanırsa tam kredi; yalnızca ısınma ihtiyacı karşılanırsa yeni yerleşmelerde 9, mevcut yerleşmelerde 4 kredi; yalnızca sıcak su ihtiyacı karşılanırsa yeni yerleşmelerde 7, mevcut yerleşmelerde 2 kredi alınır.',
    yontem: 'Bölgesel Isıtma Raporu’nda belirtilen duruma göre yukarıdaki yöntemlerden uygun olanına göre kredilendirme yapılır.',
    belgeler: 'Bölgesel Isıtma Raporu',
    kaynaklar: ['Enerji Verimliliği Kanunu', 'Merkezi Isıtma ve Sıhhi Sıcak Su Sistemlerinde Isınma ve Sıhhi Sıcak Su Giderlerinin Paylaştırılmasına İlişkin Yönetmelik'],
    tanimlar: [['Bölgesel ısıtma sistemi', 'Bir merkezden elde edilen ısıtma enerjisinin birden fazla binaya dağıtılarak bağımsız bölümlerin ısıtılmasını veya sıhhî sıcak su kullanımını sağlayan sistemi ifade eder.']]
  },
  'AKE 02 K3': {
    amac: 'Bu kriter ile; çevre dostu temiz enerji kullanımı ile fosil yakıta dayalı enerji tüketiminin azaltılması, alternatif yenilenebilir enerji kaynaklarının ülke, bölge, kent ve yapı ölçeğinde kullanımının kentsel sürdürülebilirlik açısından değerlendirilmesi amaçlanmıştır.',
    kanit: 'Yenilenebilir enerji raporu ekle',
    gerek: [{ no: 1, text: 'Enerji ihtiyacının karşılanma oranını belirten hesabı ve kullanılan yenilenebilir enerji sistemlerinin tipi, miktarı, özellikleri, konumu gibi bilgileri içeren Yenilenebilir Enerji Raporu’nun hazırlanması.', durum: YM }],
    girdi: [{ k: 'oran', l: 'Enerji ihtiyacının yenilenebilir kaynaklardan karşılanma oranı', t: 'num', birim: '%' }],
    hesap: yOran('oran', 'Yenilenebilir enerji karşılama oranı', { Y: [[0, 9], [5, 11], [10, 13], [25, 15]], M: [[0, 5], [5, 7], [10, 9], [25, 11]] }),
    kural: 'hesap',
    kuralText: 'Proje alanının enerji ihtiyacının yenilenebilir kaynaklardan karşılanma oranına göre: %5’e kadar yeni 9 / mevcut 5; %5–%10 yeni 11 / mevcut 7; %10–%25 yeni 13 / mevcut 9 kredi; %25’ten fazlası için tam kredi alınır.',
    yontem: 'Proje alanında herhangi bir veya birkaç türde yenilenebilir enerji kullanılması ve proje alanının enerji ihtiyacının yenilenebilir enerji kaynaklarından karşılanma oranına göre kredilendirme yapılır.',
    belgeler: 'Yenilenebilir Enerji Raporu',
    kaynaklar: ['Enerji Verimliliği Kanunu', 'Yenilenebilir Enerji Kaynaklarının Elektrik Enerjisi Üretimi Amaçlı Kullanımına İlişkin Kanun']
  },
  'AKE 02 K4': {
    amac: 'Bu kriter ile; sürdürülebilir yerleşim hedeflerine erişim için, enerji etkin planlama anlayışı ile arazi kullanım kararlarının belirlenmesi ve projelendirmelerin buna göre yapılması amaçlanmaktadır.',
    kanit: 'Yönlenme ve güneş analizi raporu ekle',
    gerek: [{ no: 1, text: 'Yönlenme ve Güneş Analizi Haritası ve Raporu’nun hazırlanması ve proje alanının bu rapora göre yerleşime elverişli alanda olması.', durum: YM }],
    kural: 'all',
    kuralText: 'Yönlenme ve Güneş Analizi Haritası ve Raporu’nda belirtilen proje alanının yerleşime elverişli alanda olması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Yönlenme ve Güneş Analizi Haritası ve Raporu’nda belirtilen proje alanının yerleşime elverişli alanda olup olmama durumuna göre kredilendirme yapılır.',
    belgeler: 'Yönlenme ve Güneş Analizi Haritası ve Raporu',
    kaynaklar: ['İmar Kanunu', 'Planlı Alanlar İmar Yönetmeliği', 'Mekansal Planlar Yapım Yönetmeliği']
  },

  // ---- AKE 03 Sürdürülebilir Kentsel Gelişme ve Arazi Kullanım
  'AKE 03 K1': {
    amac: 'Bu kriter ile mevcut rezerv alanlarının kullanımının teşvik edilmesi; proje alanı seçimi konusunda kentsel boşlukların kullanımı ile yayılmanın engellenmesi ve kompakt bir kentsel gelişimin sağlanması amaçlanmıştır.',
    kanit: 'Arazi değerlendirme raporu ekle',
    not: 'Dört seçenekten yalnızca birinden kredi alınabilir. Her seçenekte, bir önceki ve güncel nazım ve uygulama imar planları, proje alanına ait yasal statü kararları ve bölgeye ait sosyo-ekonomik raporlardan yararlanılarak hazırlanan, proje öncesi ve sonrası arazi kullanım kararlarını değerlendiren Arazi Değerlendirme Raporu istenir.',
    gerek: [
      { no: 1, text: 'Seçenek-1: Daha önce herhangi bir işlev ile kullanılmış, halihazırda boş olan alanın yeniden kullanımı.', durum: YM },
      { no: 2, text: 'Seçenek-2: Halihazırda kullanılan eskimiş yapı stoğu bulunan alanın temizlenerek yeniden kullanımı.', durum: YM },
      { no: 3, text: 'Seçenek-3: Halihazırda kentsel dönüşüm / iyileştirme vb. ilan edilmiş alanın tercih edilmesi.', durum: YM },
      { no: 4, text: 'Seçenek-4: Kentsel dönüşüm alanı ilan edilmeksizin sosyal / fiziksel / ekonomik çöküntü alanının tercih edilmesi.', durum: YM }
    ],
    kural: 'any',
    kuralText: 'Seçeneklerden biri yerine getirildiğinde yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: [
      'Seçenek-1: Kentsel boşlukların kullanımı ile yayılmayı engellemek ve kompakt bir kentsel gelişimi sağlamak amaçlanır.',
      'Seçenek-2: Eskimiş yapı stoğu bulunan alanlarda proje alanının yeniden kullanılarak, kentte henüz yapılaşmamış alanlara yayılmanın önüne geçilmesi amaçlanır.',
      'Seçenek-3: Yasal, yönetsel açıdan halihazırda teşvikin bulunduğu alanlarda dönüşüm, yenileme, sağlıklaştırma vb. sebepler ile müdahale edilen proje alanlarının seçilmesi amaçlanır.',
      'Seçenek-4: Sosyal, fiziki ve ekonomik olarak çöküntü alanı haline gelmiş kentsel alanların yeniden canlandırılması amaçlanır.'
    ],
    belgeler: 'Arazi Değerlendirme Raporu',
    kaynaklar: ['İmar Kanunu', 'Belediye Kanunu', 'Afet Riski Altındaki Alanların Dönüştürülmesi Hakkında Kanun', 'Yıpranan Tarihi ve Kültürel Taşınmaz Varlıkların Yenilenerek Korunması ve Yaşatılarak Kullanılması Hakkında Kanun']
  },
  'AKE 03 K2': {
    amac: 'Bu kriter ile; proje alanında sosyal etkileşim ile açık ve yeşil alan miktarını arttırmak amaçlanmaktadır.',
    kanit: 'Açık ve yeşil alan haritası ve tablosu ekle',
    gerek: [{ no: 1, text: 'Proje alanının açık ve yeşil alanlarının gösterildiği harita ile proje alanı içerisindeki açık ve yeşil alan oranlarını gösteren tablonun hazırlanması.', durum: YM }],
    girdi: [{ k: 'oran', l: 'Açık ve yeşil alan oranı (proje alanına göre)', t: 'num', birim: '%' }],
    hesap: yOran('oran', 'Açık ve yeşil alan oranı', { Y: [[30, 4], [40, 8], [50, 12], [60, 15]], M: [[30, 10], [40, 17], [50, 25], [60, 35]] }, true),
    kural: 'hesap',
    kuralText: 'Açık ve yeşil alan oranına göre: %30–%40 yeni 4 / mevcut 10; %40–%50 yeni 8 / mevcut 17; %50–%60 yeni 12 / mevcut 25 kredi; en az %60 için tam kredi alınır.',
    yontem: 'Proje alanının sağlıklı ve yaşanılabilir olabilmesi için, yerleşmeyi çevreleyen doğal bitki örtüsünün korunmasından başlayarak hava akımlarına olanak sağlayan ‘Açık ve Yeşil Alan Sistemi’nin kurulması gerekir.',
    belgeler: 'Açık ve yeşil alanların gösterildiği harita ve açık ve yeşil alan oranları tablosu'
  },

  // ---- AKE 04 Afete Dayanıklılık
  'AKE 04 K1': {
    amac: 'Bu kriter ile; proje alanının afet (deprem, taşkın, heyelan, yangın, endüstriyel kazalar, fırtına vb.) geçmişinin tanımlanması, halihazırda risklerinin analiz edilmesi ve bunlara yönelik afet yönetim planının oluşturulması, kentsel afetlere dayanıklılık durumunun belirlenmesi amaçlanmaktadır.',
    kanit: 'Afet risk ve yönetim planı ekle',
    gerek: [{ no: 1, text: 'Afet Risk ve Yönetim Planı’nın hazırlanması: proje alanının afet geçmişi; risk haritalarının arazi kullanımı, ulaşım ve altyapı verileriyle çakıştırılmasıyla belirlenen afet riskleri ve dereceleri; belirlenen risklere yönelik kent planlama müdahale yöntemleri ve bunların nasıl uygulanacağı.', durum: YM }],
    kural: 'all',
    kuralText: 'Afet Risk Yönetim Planı’nın belirtilen hususları içermesi durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: [
      'Afet Risk Yönetim Planı aşağıdaki hususları içermelidir:',
      '• Proje alanının afet geçmişi, geçmiş dönemlerde meydana gelmiş ve hâlâ meydana gelme potansiyeli olan afet olaylarının oluşumunun dönemsel ve mekânsal dağılımı,',
      '• Sel / taşkın, heyelan, deprem risk haritaları gibi altlık haritalar ile yerleşmeye ait arazi kullanımı, ulaşım ve altyapı verilerinin üst üste çakıştırılması sonucu oluşturulan haritalama ve analiz yöntemleri ile halihazırda taşıdığı afet riskleri ve dereceleri,',
      '• Belirlenen risklere yönelik kent planlama müdahale yöntemleri (yüksek eğimli arazilerde uygun bitkilendirme, yeterli açık alan rezervleri, heyelan önleme bentleri, şev gibi mühendislik uygulamaları, afet sonrası acil toplanma alanlarının belirlenmesi ve yönlendirme tabelaları, afet sonrası müdahaleyi kolaylaştıracak yol ağı ve genişlikleri vb.) ve bu yöntemlerin nasıl uygulanacağı.'
    ],
    belgeler: 'Afet Risk ve Yönetim Planı',
    kaynaklar: ['Afet ve Acil Durum Yönetimi Başkanlığının Teşkilat ve Görevleri Hakkında Kanun', 'Afet ve Acil Durum Yönetimi Başkanlığı İl Afet Risk Azaltma Planı (İRAP) Hazırlama Kılavuzu']
  },
  'AKE 04 K2': {
    amac: 'Bu kriter ile; afetin yıkıcı etkilerinden sakınma ile birlikte afet anında korunma ve müdahale kabiliyetini arttıracak toplanma alanlarının ve müdahaleler için gerekli donatıların konumunun ve mekânsal büyüklüğünün belirlenmesi amaçlanmaktadır.',
    kanit: 'Afet risk ve yönetim planı ekle',
    gerek: [{ no: 1, text: 'Afet Risk ve Yönetim Planı’nda; afet risk durumu ve nüfus özelliklerine göre analizler, afet riskleri ve afet sonrası yangın, su baskını vb. durumlara karşı tedbirler, acil durum yönetim düzeyleri ve paydaşları, enkaz yönetimi ve rehabilitasyonu, enkaz geri dönüşüm planı ve uydu görüntüleme sisteminden arazi kullanım analizlerinin yer alması.', durum: YM }],
    kural: 'all',
    kuralText: 'Belirtilen hususların sağlanması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: [
      'Afet Risk Yönetim Planı’nda aşağıdaki hususlar yer almalıdır:',
      '• Afet risk durumu, nüfus büyüklüğü, nüfusun sosyal ve fiziksel özellikleri, proje alanının fiziksel koşulları, proje alanının idari özellikleri vb. başlıklar göz önünde bulundurularak analizler yapılması,',
      '• Belirlenen afet risklerine ve afet sonrası yangın, su baskını vb. durumlara karşı alınmış tedbirlerin sıralanması,',
      '• Acil durum yönetiminin düzeyleri ve acil durum yönetim paydaşlarının açıkça belirtilmesi, bina ve yerleşme kullanıcısına ulaştırılma stratejisinin belirlenmiş olması,',
      '• Yapılaşmış alanlarda afet ve sonrası enkaz yönetimi ve rehabilitasyonu,',
      '• Enkaz geri dönüşüm planı,',
      '• Bina parsel, ada, site, mahalle, şehir uydu görüntüleme sisteminden erişilebilen arazi kullanım durumu göz önünde bulundurularak analizler.'
    ],
    belgeler: 'Afet Risk ve Yönetim Planı',
    kaynaklar: ['Afet ve Acil Durum Yönetimi Başkanlığının Teşkilat ve Görevleri Hakkında Kanun']
  },

  // ---- AKE 05 Çevre Yönetimi ve Altyapı Planlama
  'AKE 05 K1': {
    amac: 'Bu kriter ile; proje alanının sürdürülebilirlik açısından doğal kaynakların etkin yönetimini sağlayan, yağmur suyu kaçışını engellemek ve yağmur suyundan yararlanmak amaçlanmıştır.',
    kanit: 'Yağmur suyu toplama projesi ekle',
    not: 'Yağmur Suyu Toplama Projesi’nde yer alan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 1, text: 'Proje alanında geçirimsiz yüzeye düşen yağmur suyunun toplanıp geri dönüşümünün sağlanması (1 kredi).', durum: YM },
      { no: 2, cr: 2, text: 'Proje alanında geçirimli yüzeyde sızdırmayı sağlayacak parke taşı, kaldırım taşı kullanılması (2 kredi).', durum: YM },
      { no: 3, cr: 2, text: 'Rekreasyon alanlarının sulanmasında yağmur suyundan yararlanılması (2 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Yağmur Suyu Toplama Projesi’nde yer alan maddelere göre krediler toplanır (1 + 2 + 2).',
    yontem: 'Yağmur Suyu Toplama Projesi hazırlanır; projede yer alan maddelere göre kredi alınır.',
    belgeler: 'Yağmur Suyu Toplama Projesi'
  },
  'AKE 05 K2': {
    amac: 'Bu kriter ile; yaşam için hayati değer taşıyan su kaynaklarının dengeli kullanılması aynı zamanda tüketilen kaynakların yeniden değerlendirilmesi amaçlanmaktadır.',
    kanit: 'Atık su yönetim planı ekle',
    not: 'Atık Su Yönetim Planı’nda yer alan maddeleri işaretleyin; herhangi ikisi tam kredi için yeterlidir.',
    gerek: [
      { no: 1, text: 'Atık suyun en yakın kanalizasyon sistemine bağlanması.', durum: ['Y'] },
      { no: 2, text: 'Yerleşmeden kaynaklanan atık sudan gri su ayrılması.', durum: YM },
      { no: 3, text: 'Yerleşmeden kaynaklanan atık suyun arıtma tesisine verilmesi.', durum: YM },
      { no: 4, text: 'Atıksu arıtma tesisinden çıkan arıtılmış suyun ekonomiye fayda sağlayacak şekilde değerlendirilmesi.', durum: YM },
      { no: 5, text: 'Yerleşmeden kaynaklanan atık sudan enerji geri kazanımının sağlanması.', durum: YM }
    ],
    kural: 'min', must: [], pick: { of: [1, 2, 3, 4, 5], min: 2 },
    kuralText: 'Atık Su Yönetim Planı’nda belirtilen maddelerden herhangi ikisinin projede yer alması durumunda tam kredi alınır.',
    yontem: 'Atık Su Yönetim Planı hazırlanır; planda yer alan maddelere göre kredilendirme yapılır.',
    belgeler: 'Atık Su Yönetim Planı',
    kaynaklar: ['Çevre Kanunu', 'Su Kirliliği Kontrolü Yönetmeliği', 'Kentsel Atıksu Arıtımı Yönetmeliği']
  },
  'AKE 05 K3': {
    amac: 'Bu kriter ile atıkların ayrı biriktirilerek toplanması, atık önleme, azaltımının sağlanması, yeniden kullanımı ve geri kazanımının sağlanarak enerjinin korunması, alternatif yenilenebilir enerji kaynaklarının değerlendirilmesi, çevre ve insan sağlığı açısından çevresel risklerin en aza indirilmesi amaçlanmaktadır.',
    kanit: 'Atık değerlendirme projesi ekle',
    gerek: [
      { no: 1, text: 'Yerleşmede atık yönetim sistemi, atık biriktirme ekipmanları ile geçici depolama alanının mevcut olması ve işletiliyor olması.', durum: YM },
      { no: 2, text: 'Ayrı toplanan geri kazanılabilir / biyo-bozunur / tıbbi / tehlikeli atıkların mahalli idareye veya çevre lisanslı atık işleme tesisine verilmesi.', durum: YM }
    ],
    kural: 'all',
    kuralText: 'Atık Değerlendirme Projesi’nde belirtilen maddelerin yer alması durumunda tam kredi alınır.',
    yontem: 'Atık Değerlendirme Projesi hazırlanır; projede belirtilen maddelerin yer alması durumuna göre kredilendirme yapılır.',
    belgeler: 'Atık Değerlendirme Projesi'
  },

  // ==== UHA Ulaşım ve Hareketlilik
  // ---- UHA 01 Erişilebilirlik ve Fonksiyonel Bağlantı
  'UHA 01 K1': {
    amac: 'Bu kriter ile; proje alanının konumu, öneriler ve mevcut fonksiyonların çevresi ile bağlantısının, ulaşım modülleri ve bu modüllerin ana ulaşım arterleri ile bağlantısının belirlenmiş olması amaçlanmaktadır.',
    kanit: 'Arazi kullanımı ve ulaşım değerlendirme raporu ekle',
    gerek: [{ no: 1, text: 'Proje alanına ait ulaşım ve erişim ağlarının ve ana arterlere olan mesafelerinin standartlara uygun olarak gösterildiği Arazi Kullanımı ve Ulaşım Değerlendirme Raporu’nun hazırlanması.', durum: YM }],
    kural: 'mandatory',
    kuralText: 'Yeni ve mevcut yerleşmeler için zorunlu bir kriterdir.',
    yontem: 'Raporda proje alanına ait ulaşım ve erişim ağlarının, ana arterlere olan mesafelerinin standartlara uygun olacak şekilde hazırlanması durumunda zorunluluk yerine getirilmiş olur.',
    belgeler: 'Arazi Kullanımı ve Ulaşım Değerlendirme Raporu',
    kaynaklar: ['İmar Kanunu', 'Erişilebilirlik İzleme ve Denetleme Yönetmeliği']
  },
  'UHA 01 K2': {
    amac: 'Bu kriter ile; erişilebilirliği yüksek, karma kullanımlı yerleşim birimleri oluşturmak ve iklim değişikliği sürecinde otomobil bağımlılığını azaltabilmek için alternatif ulaşım sistemlerinin hizmet verdiği alanların tercih edilmesi amaçlanmaktadır.',
    kanit: 'Arazi kullanımı ve ulaşım değerlendirme raporu ekle',
    not: 'Raporu ve projeye uyan durumu işaretleyin; en yüksek seçenek sayılır. Herhangi bir maddenin karşılanması kriter zorunluluğunu sağlar.',
    gerek: [
      { no: 1, text: 'Proje alanı ve çevresindeki mevcut ulaşım modlarının tek tek tanımlandığı; her bir modun erişim mesafelerinin, durakların haritalandırıldığı, trafik yoğunluğu ve zaman çizelgelerini (sefer sayıları) içeren Arazi Kullanımı ve Ulaşım Değerlendirme Raporu’nun hazırlanması.', durum: YM },
      { no: 2, text: '3 ve daha fazla alternatif ulaşım modu, yürüme mesafeleri 500 m içinde (yeni 4, mevcut 7 kredi).', durum: YM },
      { no: 3, text: '2 alternatif ulaşım modu, yürüme mesafeleri 400 m içinde (yeni 3, mevcut 6 kredi).', durum: YM },
      { no: 4, text: '2 alternatif ulaşım modu, yürüme mesafeleri 800 m içinde (yeni 2, mevcut 4 kredi).', durum: YM },
      { no: 5, text: '2 alternatif ulaşım modu, yürüme mesafeleri 1000 m içinde (yeni 1, mevcut 3 kredi).', durum: YM },
      { no: 6, text: 'Tek alternatif ulaşım modu, yürüme mesafeleri 400 m içinde (yeni 1, mevcut 2 kredi).', durum: YM },
      { no: 7, text: 'Tek alternatif ulaşım modu, yürüme mesafeleri 800 m içinde (mevcut 1 kredi).', durum: ['M'] }
    ],
    kural: 'tiers', must: [1],
    tiers: [
      { no: 2, cr: cr7(4, 7), ayri: true }, { no: 3, cr: cr7(3, 6), ayri: true }, { no: 4, cr: cr7(2, 4), ayri: true },
      { no: 5, cr: cr7(1, 3), ayri: true }, { no: 6, cr: cr7(1, 2), ayri: true }, { no: 7, cr: cr7(0, 1), ayri: true }
    ],
    kuralText: 'Yeni ve mevcut yerleşmeler için zorunlu bir kriterdir. Uygun olan maddeye göre kredi alınır; herhangi bir maddenin karşılanması kriter zorunluluğunu sağlar.',
    yontem: 'Kredilendirme, proje alanına hizmet veren alternatif ulaşım modu sayısı ve bu modlara yürüme mesafelerine göre yapılır; uygun olan maddeye göre kredi alınır.',
    belgeler: 'Arazi Kullanımı ve Ulaşım Değerlendirme Raporu',
    kaynaklar: ['İmar Kanunu', 'Bisiklet Yolları Yönetmeliği', 'Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmelik']
  },
  'UHA 01 K3': {
    amac: 'Bu kriter ile; çevreye duyarlı tasarım ve planlama kararlarının geliştirilerek bireysel araç kullanımının azaltılması amaçlanmaktadır.',
    kanit: 'Arazi kullanımı ve ulaşım değerlendirme raporu ekle',
    not: 'Mevcut ulaşım servislerinin ve ağlarının tanımlanıp haritalandırıldığı Arazi Kullanımı ve Ulaşım Değerlendirme Raporu’nda yer alan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 1, text: 'Taşıt yolunun ön planda tutularak Ulaşım Ana Planı ve Raporu hazırlanması (1 kredi).', durum: YM },
      { no: 2, cr: 2, text: 'Alternatif ve sürdürülebilir ulaşım sistemlerine öncelik verilmesi, haritalandırılması ve detaylandırılması (2 kredi).', durum: YM },
      { no: 3, cr: 2, text: 'Yaya ve bisiklet önceliğinin gözetilmesi ve ulaşım ana planında yaya dostu stratejilerin geliştirilmesi (2 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Raporda yer alan maddelere göre krediler toplanır (1 + 2 + 2).',
    yontem: 'Arazi dokusuna uygun, önerilen ulaşım ağlarının geliştirilmesi; yukarıdaki maddelere göre kredilendirilir.',
    belgeler: 'Arazi Kullanımı ve Ulaşım Değerlendirme Raporu',
    kaynaklar: ['İmar Kanunu', 'Bisiklet Yolları Yönetmeliği', 'Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmelik', 'Erişilebilirlik İzleme ve Denetleme Yönetmeliği']
  },
  'UHA 01 K4': {
    amac: 'Bu kriter ile; akıcı trafik sağlamak ve karbon salımını azaltmak için toplu taşıma sistemlerinin kullanımının arttırılması amaçlanmıştır.',
    kanit: 'Yerleşme ulaşım raporu ekle',
    not: 'Toplu taşıma haritasının bulunduğu; durakların, çeşitlerinin, yoğunluklarının ve fonksiyonlara uzaklıklarının değerlendirildiği Yerleşme Ulaşım Raporu’nda yer alan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 2, text: 'Proje alanının toplu taşıma sistemleri ile kurduğu, yolcu bilgilendirme, erişilebilirlik, emniyet ve güvenlik kriterlerini kapsayan kuvvetli ilişkinin haritalandırılması (2 kredi).', durum: YM },
      { no: 2, cr: { Y: 1, M: 2 }, text: 'Öneri toplu taşıma hattı, öneri sefer sayısı ile toplu taşıma sistemlerinde iyileştirme önerilerinin haritalandırılması (yeni 1, mevcut 2 kredi).', durum: YM },
      { no: 3, cr: 2, text: 'Kamu hizmetleri ile yolcu bilgilendirme, erişilebilirlik, emniyet ve güvenlik kriterlerini kapsayan kuvvetli ilişki kurulması (2 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Raporda yer alan maddelere göre krediler toplanır.',
    yontem: 'Toplu taşıma durakları ile fonksiyonlar arası erişim mesafelerinin uygunluğu ve proje alanının toplu taşıma sistemi ile ilişkisi yukarıdaki maddelere göre kredilendirilir.',
    belgeler: 'Yerleşme Ulaşım Raporu',
    kaynaklar: ['İmar Kanunu']
  },
  'UHA 01 K5': {
    amac: 'Bu kriter ile erişilebilirliği yüksek yerleşmeler tasarlamak ve imar planlarından yararlanarak ana ulaşım bağlantılarıyla kurulan ilişkilerin belirtilmesi amaçlanmaktadır.',
    kanit: 'Arazi kullanımı ve ulaşım değerlendirme raporu ekle',
    gerek: [
      { no: 1, text: 'Nazım İmar Planı varsa Ulaşım Ana Planı değerlendirmesi; araç güzergahlarını, yol kademelenmelerini ve proje alanının ana ulaşım bağlantılarıyla ilişkisini tanımlayan mevcut ve öneri ulaşım şemalarını içeren Arazi Kullanımı ve Ulaşım Değerlendirme Raporu’nun hazırlanması.', durum: YM },
      { no: 2, text: 'Proje alanının birinci ve ikinci derece ana ulaşım aksı ile ilişkili olması (yeni 4, mevcut 5 kredi).', durum: YM },
      { no: 3, text: 'Proje alanının üçüncü derece ulaşım aksı ile ilişkili olması (yeni 2, mevcut 3 kredi).', durum: YM }
    ],
    kural: 'tiers', must: [1],
    tiers: [{ no: 2, cr: cr7(4, 5), ayri: true }, { no: 3, cr: cr7(2, 3), ayri: true }],
    kuralText: 'Birinci ve ikinci derece ana ulaşım aksı ile ilişkili olması durumunda yeni yerleşmelerde 4, mevcut yerleşmelerde 5 kredi; üçüncü derece ulaşım aksı ile ilişkili olması durumunda yeni yerleşmelerde 2, mevcut yerleşmelerde 3 kredi alınır.',
    yontem: 'Proje alanının ilişkili olduğu ulaşım aksının derecesine göre kredilendirme yapılır.',
    belgeler: 'Arazi Kullanımı ve Ulaşım Değerlendirme Raporu',
    kaynaklar: ['İmar Kanunu'],
    tanimlar: [
      ['Birinci Derece Yollar', 'Bölge ve il merkezlerini birbirine bağlayan, her yöne en az üç şeridin ayrıldığı yönleri bölünmüş bölgesel, ulusal yollardır.'],
      ['İkinci Derece Yollar', 'Bir il sınırı içindeki kent, kasaba, ilçe ve bucak merkezlerini birbirine ve il merkezlerine, devlet yol ağına bağlayan bir iki şeritten daha fazla olan yollardır.'],
      ['Üçüncü Derece Yollar', 'Bir ya da iki şeritten fazla olan, mahalle içinde yer alan yollar ya da ada içi yollardır.']
    ]
  },
  'UHA 01 K6': {
    amac: 'Bu kriter ile; sosyal bütünleşme ve devamlılık için yeşil / açık alanların varlığı, kalitesi, büyüklüğü, proje alanına yakınlığı, yoğunluğu gibi kriterlerin fiziksel, sosyal, ekonomik ve ekolojik yararlarının göz önünde bulundurularak değerlendirilmesi amaçlanmaktadır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    not: 'Proje alanı ve yakın çevresindeki yeşil / açık alanların çeşitlerinin, boyutlarının, konumlarının tanımlandığı Ulaşım ve Hareketlilik Tasarım Raporu’nda yer alan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: { Y: 2, M: 4 }, text: 'Yerleşme ve yakın çevresindeki yeşil ve açık alanların çeşitlerinin, boyutlarının, konumlarının tanımlanması ve proje alanı ile ilişkisinin, erişim mesafelerinin ve yürüme rotalarının haritalandırılması (yeni 2, mevcut 4 kredi).', durum: YM },
      { no: 2, cr: { Y: 2, M: 4 }, text: 'Yeşil ve açık alanlarla fonksiyonlar arası bağlantıyı güçlendirmek, yaya yollarının güvenliğini ve çekiciliğini arttırmak için öneri geliştirilmesi (yeni 2, mevcut 4 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Raporda yer alan maddelere göre krediler toplanır.',
    yontem: 'Yeşil / açık alanlara erişimin sağlanması ve arttırılması yukarıdaki maddelere göre kredilendirilir.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu',
    kaynaklar: ['İmar Kanunu']
  },
  'UHA 01 K7': {
    amac: 'Bu kriter ile; araç seyahat mesafelerini ve araç bağımlılığını azaltmak, toplu taşıma kullanımını arttırmak amaçlanmaktadır.',
    kanit: 'Arazi kullanımı ve ulaşım değerlendirme raporu ekle',
    gerek: [
      { no: 1, text: 'Proje tamamlanmasını müteakip 5 yıllık yoğunluk hesaplarını içeren rapor ve haritalar ile proje alanında veya yakın çevresinde 4 farklı kullanım biçimini (gıda perakende, büyük ölçekli perakende, kamu hizmetleri, belediye ve toplumsal faaliyetler) içeren arazi kullanım haritalarının bulunduğu Arazi Kullanımı ve Ulaşım Değerlendirme Raporu’nun hazırlanması.', durum: YM },
      { no: 2, text: 'Proje alanına en fazla 2 km uzaklıkta iş imkanları ve 4 farklı kullanım biçiminden en az 10 tanesinin bulunması (5 kredi).', durum: YM },
      { no: 3, text: 'Proje alanına en fazla 5 km uzaklıkta iş imkanları ve 4 farklı kullanım biçiminden en az 10 tanesinin bulunması (2 kredi).', durum: YM }
    ],
    kural: 'tiers', must: [1],
    tiers: [{ no: 2, cr: cr7(5, 5), ayri: true }, { no: 3, cr: cr7(2, 2), ayri: true }],
    kuralText: 'İş imkanları ve kullanım biçimleri 2 km içinde ise 5, 5 km içinde ise 2 kredi alınır.',
    yontem: 'Proje alanında yaşayanlar 4 farklı kullanım biçiminin (gıda perakende, büyük ölçekli perakende, kamu hizmetleri, belediye ve toplumsal faaliyetler) sunduğu olanaklara sahip olmalıdır; uygun olan duruma göre kredi alınır.',
    belgeler: 'Arazi Kullanımı ve Ulaşım Değerlendirme Raporu',
    kaynaklar: ['İmar Kanunu']
  },

  // ---- UHA 02 Sürdürülebilir ve Alternatif Ulaşım Sistemleri
  'UHA 02 K1': {
    amac: 'Bu kriter ile; yaya yolu, bisiklet yolu, açık ve yeşil alanın yoğun olduğu, toplu taşıma sistemleri ile kuvvetli bağlantısı bulunan yerleşmeler planlamak amaçlanmaktadır.',
    kanit: 'Arazi kullanımı ve ulaşım değerlendirme raporu ekle',
    gerek: [{ no: 1, text: 'Toplu taşıma altyapısı ile proje alanının ilişkilendirilerek öneri ve stratejilerin tanımlandığı Arazi Kullanımı ve Ulaşım Değerlendirme Raporu’nun hazırlanması.', durum: YM }],
    kural: 'mandatory',
    kuralText: 'Yeni ve mevcut yerleşmeler için zorunlu bir kriterdir.',
    yontem: 'Gereklilikler sağlandığı durumda kriter zorunluluğu yerine getirilmiş olmaktadır.',
    belgeler: 'Arazi Kullanımı ve Ulaşım Değerlendirme Raporu',
    kaynaklar: ['Ulaşımda Enerji Verimliliğinin Arttırılmasına İlişkin Usul ve Esaslar Hakkında Yönetmelik', 'Bisiklet Yolları Yönetmeliği', 'Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmelik']
  },
  'UHA 02 K2': {
    amac: 'Bu kriter ile; sağlıklı kentler planlama ve tasarlama stratejilerinin önemi ile günlük aktivitelerin teşvik edilmesi, alternatif ulaşım sistemlerinin kullanılmasının teşvik edilmesi ve araç kullanımından kaynaklı karbon emisyonunun azaltılması amaçlanmaktadır.',
    kanit: 'Yerleşme ulaşım raporu ekle',
    gerek: [{ no: 1, text: 'Proje alanında planlanan bisiklet yollarını ve ihtiyacı karşılayacak sayıda bisiklet park istasyonunu gösteren kroki içeren Yerleşme Ulaşım Raporu’nun hazırlanması; bisiklet park istasyonlarının “Bisiklet Yolları Kılavuzu”na, levha ve işaretlemelerin Bisiklet Yolları Yönetmeliği’ne uygun yapılması.', durum: YM }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Çevre, Şehircilik ve İklim Değişikliği Bakanlığı Mesleki Hizmetler Genel Müdürlüğü web sayfası kütüphanesinde yayınlanan “Bisiklet Yolları Kılavuzu” ile belirtildiği şekilde bisiklet park istasyonlarının ve Bisiklet Yolları Yönetmeliği’nde belirtilen levha ve işaretlemelerin yapılması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    belgeler: 'Yerleşme Ulaşım Raporu',
    kaynaklar: ['Bisiklet Yolları Yönetmeliği', 'Ulaşımda Enerji Verimliliğinin Arttırılmasına İlişkin Usul ve Esaslar Hakkında Yönetmelik']
  },
  'UHA 02 K3': {
    amac: 'Bu kriter ile; sağlıklı yerleşmeleri planlama ve tasarlama stratejilerinin önemi ile günlük aktivitelerin teşvik edilmesi, alternatif ulaşım sistemlerinin kullanılmasının teşvik edilmesi ve araç kullanımından kaynaklı karbon emisyonunun azaltılması amaçlanmaktadır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    not: 'Ulaşılan en yüksek kademeyi işaretleyin; alt kademe kendiliğinden işaretlenir.',
    gerek: [
      { no: 1, text: 'Proje alanının her 100 m²’si için en az 3 metre kesintisiz bisiklet yolu (yeni 3, mevcut 1 kredi).', durum: YM },
      { no: 2, text: 'Proje alanının her 100 m²’si için en az 5 metre kesintisiz bisiklet yolu (yeni 6, mevcut 3 kredi).', durum: YM }
    ],
    kural: 'tiers', must: [],
    tiers: [{ no: 1, cr: cr7(3, 1) }, { no: 2, cr: cr7(6, 3) }],
    kuralText: 'Bisiklet yolu uzunluğuna göre kredi alınır: her 100 m² için en az 3 m ise yeni 3 / mevcut 1, en az 5 m ise yeni 6 / mevcut 3 kredi.',
    yontem: '“Bisiklet Yolları Kılavuzu” ile belirtildiği şekilde bisiklet yolu veya parkuru yapılmış olduğunu gösteren Ulaşım ve Hareketlilik Tasarım Raporu hazırlanır; uygun olan maddeye göre kredi alınır.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu',
    kaynaklar: ['Bisiklet Yolları Yönetmeliği']
  },
  'UHA 02 K4': {
    amac: 'Bu kriter ile; karbon salımını azaltmak ve sağlıklı kentler planlama ve tasarlama stratejilerinin önemi ile günlük aktivitelerin ve alternatif ulaşım sistemlerinin kullanılmasının teşvik edilmesi amaçlanmıştır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    gerek: [{ no: 1, text: 'Yaya yolu ve/veya kaldırımların uzunluğu, genişliği, fonksiyonlar arası ve açık / yeşil alan bağlantıları ile tasarım malzemeleri, aydınlatma, oturma elemanları ve bitkilendirme detaylarını içeren Ulaşım ve Hareketlilik Tasarım Raporu’nun hazırlanması; proje alanındaki yaya yolları ve kaldırımların Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmeliğe uygun olması.', durum: YM }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Proje alanı içinde yer alan yaya yolları ve/veya kaldırımların Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmeliğe uygun olması halinde yeni ve mevcut yerleşmeler için tam kredi alınır.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu',
    kaynaklar: ['İmar Kanunu', 'Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmelik', 'TS 12576 Şehir içi yollar - Kaldırım ve yaya geçitlerinde ulaşılabilirlik için yapısal önlemler ve işaretlemelerin tasarım kuralları']
  },

  // ---- UHA 03 Ulaşım Kalitesi
  'UHA 03 K1': {
    amac: 'Bu kriter ile; engelsiz tasarım ilkelerinin benimsenerek erişilebilirliğin arttırıldığı, emniyetli, güvenlikli, konforlu ulaşım tasarımının yapıldığı, toplu taşıma çeşitlerinin kullanıldığı yerleşmelerin oluşturulması amaçlanmaktadır.',
    kanit: 'Yerleşme ulaşım raporu ekle',
    not: '(1) kriter zorunluluğunu, (2) tam krediyi sağlar.',
    gerek: [
      { no: 1, cr: 0, text: 'Proje alanı ve yakın çevresindeki toplu taşıma çeşitlerine mesafenin gösterildiği Ulaşım Şeması’nın sunulması (zorunluluk).', durum: YM },
      { no: 2, cr: { Y: 8, M: 10 }, text: 'Engelsiz tasarım ilkelerine göre erişilebilirliğin arttırıldığı, emniyetli, güvenlikli, konforlu ulaşım tasarımının yapıldığı ulaşım şeması ve haritasını içeren Yerleşme Ulaşım Raporu’nun hazırlanması (tam kredi).', durum: YM }
    ],
    kural: 'sum', zReq: [1],
    kuralText: 'Yeni ve mevcut yerleşmeler için zorunlu bir kriterdir. Ulaşım şemasının sunulması zorunluluğu karşılar; Yerleşme Ulaşım Raporu’nun hazırlanması durumunda tam kredi alınır.',
    yontem: 'Proje alanı ve yakın çevresindeki toplu taşıma çeşitlerine mesafenin gösterildiği Ulaşım Şeması’nın sunulması durumunda kriter zorunluluğu yerine getirilmiş olur. Engelsiz tasarım ilkelerine göre erişilebilirliğin arttırıldığı, emniyetli, güvenlikli, konforlu ulaşım tasarımının yapıldığı ulaşım şeması ve haritasını içeren Yerleşme Ulaşım Raporu’nun hazırlanması durumunda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    belgeler: 'Yerleşme Ulaşım Raporu',
    kaynaklar: ['İmar Kanunu', 'Bisiklet Yolları Yönetmeliği', 'Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmelik', 'TS 12576 Şehir içi yollar - Kaldırım ve yaya geçitlerinde ulaşılabilirlik için yapısal önlemler ve işaretlemelerin tasarım kuralları', '“Erişilebilirlik Kılavuzu” (https://www.aile.gov.tr/media/65613/erisilebilirlik_kilavuzu_2021.pdf)']
  },
  'UHA 03 K2': {
    amac: 'Bu kriter ile; günlük fiziksel aktiviteyi teşvik eden ve yaya güvenliğini sağlayan güvenli, çekici ve konforlu sokak çevreleriyle kamu sağlığını desteklemek, herkesin kullanabileceği engelsiz ve insan öncelikli tasarlanmış yürünebilir tasarımlarla ulaşım verimliliğini arttırmak amaçlanmaktadır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    not: 'Ulaşım ve Hareketlilik Tasarım Raporu’nda yer alan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: { Y: 4, M: 5 }, text: 'En yakın toplu taşıma sistemlerine bağlayan, proje alanı sınırına kadar yaya ve bisiklet yollarının ilgili mevzuat ve standartlara uygun tasarlanması (yeni 4, mevcut 5 kredi).', durum: YM },
      { no: 2, cr: { Y: 4, M: 5 }, text: 'Tüm cadde ve yol tasarımları, kentsel tasarımlar ve projedeki şehir mobilyalarının erişilebilirlik mevzuatı ve standartlarına uygun inşa edilmesi (yeni 4, mevcut 5 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Raporda yer alan maddelere göre krediler toplanır.',
    yontem: 'Toplu taşıma sistemleri ve bağlantılarında, bisiklet ve yaya yollarının tasarımında engelsiz tasarım ilkelerinin kullanılması yukarıdaki maddelere göre kredilendirilir.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu',
    kaynaklar: ['İmar Kanunu', 'Bisiklet Yolları Yönetmeliği', 'Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmelik', 'TS 12576 Şehir içi Yollar - Özürlü ve Yaşlılar İçin Sokak, Cadde, Meydan ve Yapısal Önlemler ve İşaretlemelerin Tasarım Kuralları', '“Erişilebilirlik Kılavuzu” (https://www.aile.gov.tr/media/65613/erisilebilirlik_kilavuzu_2021.pdf)']
  },
  'UHA 03 K3': {
    amac: 'Bu kriter ile; güvenli ve çekici bisiklet ağları oluşturmak ve erişilebilirliği arttırmak amaçlanmaktadır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    not: '“Bisiklet Yolları Kılavuzu”na göre hazırlanan Ulaşım ve Hareketlilik Tasarım Raporu’nda yer alan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: { Y: 3, M: 2 }, text: 'Bisiklet yolları / parkurları, otoparkları ve bisiklet ek hizmet alanlarının belirtilmesi (yeni 3, mevcut 2 kredi).', durum: YM },
      { no: 2, cr: { Y: 3, M: 2 }, text: 'Öneri bisiklet yolları / parkurları ve otoparklarının güzergahlarının belirtilmesi (yeni 3, mevcut 2 kredi).', durum: YM },
      { no: 3, cr: { Y: 2, M: 1 }, text: 'Bisiklet yolu ve ek hizmetlerinin malzeme detaylarının verilmesi (yeni 2, mevcut 1 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Raporda yer alan maddelere göre krediler toplanır.',
    yontem: 'Güvenli, erişilebilir ve yeterli kapasitede bisiklet park alanları ve bisiklet ağları için ek hizmet imkanları yukarıdaki maddelere göre kredilendirilir.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu',
    kaynaklar: ['İmar Kanunu', 'Bisiklet Yolları Yönetmeliği']
  },
  'UHA 03 K4': {
    amac: 'Bu kriter ile standartlara uygun bisiklet ağları oluşturmak ve erişilebilirliği arttırmak amaçlanmaktadır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    not: 'Ulaşım ve Hareketlilik Tasarım Raporu’nda yer alan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 3, text: 'Bisiklet yollarındaki levhaların, işaret ve işaretlemelerin bisiklet sürücüsünü ve yayaları tehlikeye sokmayacak sayıda ve yerlerde olması (3 kredi).', durum: YM },
      { no: 2, cr: { Y: 2, M: 1 }, text: 'Bisiklet yolu ile ulaşılabilecek en yakın toplu taşıma sistemlerine bağlayan yerleşme sınırına kadar mesafe bilgisini veren işaretlemelerin bulunması (yeni 2, mevcut 1 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Raporda yer alan maddelere göre krediler toplanır.',
    yontem: 'Bisiklet kullanımı için gereken sinyalizasyonun kaliteli, güvenli ve anlaşılabilir tasarlanması yukarıdaki maddelere göre kredilendirilir.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu',
    kaynaklar: ['İmar Kanunu', 'Bisiklet Yolları Yönetmeliği']
  },

  // ---- UHA 04 İklim Değişikliğine Adaptasyon Süreci
  'UHA 04 K1': {
    amac: 'Bu kriter ile araca bağlılığı azaltarak, çevreye duyarlı tasarım ve planlama kararlarının geliştirilmesi amaçlanmaktadır.',
    kanit: 'Yerleşme ulaşım raporu ekle',
    not: 'Geliştirilmesi gereken ulaşım ağlarının planda gösterildiği ve ulaşım modüllerinin karbon emisyon değerlendirmelerinin yer aldığı Yerleşme Ulaşım Raporu’na göre ulaşılan kademeyi işaretleyin.',
    gerek: [
      { no: 1, text: 'Önerilen yeni ulaşım modüllerinin çevreci ve sürdürülebilir olması ve karbon salımını en az %10 azaltması (yeni 2, mevcut 1 kredi).', durum: YM },
      { no: 2, text: 'Önerilen yeni ulaşım modüllerinin çevreci ve sürdürülebilir olması ve karbon salımını en az %20 azaltması (tam kredi).', durum: YM }
    ],
    kural: 'tiers', must: [],
    tiers: [{ no: 1, cr: cr7(2, 1) }, { no: 2, cr: cr7(4, 2) }],
    kuralText: 'Karbon salımını azaltma etkisi en az %10 ise yeni yerleşmeler için 2, mevcut yerleşmeler için 1 kredi; en az %20 ise tam kredi alınır.',
    yontem: 'Önerilen yeni ulaşım modüllerinin karbon salımını azaltmadaki etkisine göre kredilendirme yapılır.',
    belgeler: 'Yerleşme Ulaşım Raporu',
    kaynaklar: ['Ulaşımda Enerji Verimliliğinin Arttırılmasına İlişkin Usul ve Esaslar Hakkında Yönetmelik']
  },
  'UHA 04 K2': {
    amac: 'Bu kriter ile sürdürülebilir kentsel gelişme vizyonuna uygun yaşanabilir yerleşmeler oluşturmak amaçlanmaktadır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    gerek: [
      { no: 1, cr: 0, text: 'Araç, yaya ve bisiklet yollarında bitkilendirme plan ve detayları, bitki türleri, aydınlatma ve malzeme detayları; otopark alanı bitkilendirme detayları; toplu taşıma sistemleri, durakları ve kentsel mobilyaların malzeme detayları ile yaya, bisiklet, araç yolları ve otopark alanlarında yağmur suyu toplama giderlerini içeren Ulaşım ve Hareketlilik Tasarım Raporu’nun hazırlanması.', durum: YM },
      { no: 2, cr: { Y: 1, M: 3 }, text: 'İklim değişikliği uyum çerçevesinde kullanılan malzemelerin sürdürülebilir ve yerel malzemeden seçilmesi (yeni 1, mevcut 3 kredi).', durum: YM },
      { no: 3, cr: { Y: 2, M: 3 }, text: 'Bitkilendirme ile mikro klimanın sağlanması (yeni 2, mevcut 3 kredi).', durum: YM }
    ],
    kural: 'sum', must: [1],
    kuralText: 'Rapor hazırlandığında, yer alan maddelere göre krediler toplanır.',
    yontem: 'İklim değişikliğine uyum sağlayan tasarımlar yukarıdaki maddelere göre kredilendirilir.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu',
    kaynaklar: ['Ulaşımda Enerji Verimliliğinin Arttırılmasına İlişkin Usul ve Esaslar Hakkında Yönetmelik']
  },
  'UHA 04 K3': {
    amac: 'Bu kriter ile sürdürülebilir kentsel gelişme vizyonuna uygun yaşanabilir yerleşmeler oluşturmak amaçlanmaktadır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    gerek: [{ no: 1, text: 'Yerleşme içerisinde ulaşım yollarının yüzeyinde ısı etkisini azaltacak malzeme kullanılması veya Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmelik kapsamında yeşil yaya koridorunun oluşturulduğunun gösterildiği Ulaşım ve Hareketlilik Tasarım Raporu’nun hazırlanması.', durum: YM }],
    kural: 'all',
    kuralText: 'Gereklilikler sağlandığı durumda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    yontem: 'Gereklilikler sağlandığı durumda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu',
    kaynaklar: ['İmar Kanunu', 'Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmelik']
  },
  'UHA 04 K4': {
    amac: 'Bu kriter ile yerleşme içerisinde ulaşım yollarının yüzeyinden yağmur suyu kaçışını engellemek ve yağmur suyundan yararlanmak amaçlanmaktadır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    gerek: [{ no: 1, text: 'Otopark, araç yolu, bisiklet yolu ve yaya yollarından yağmur suyu kaçışını engellemek ve yağmur suyundan yararlanmak için gerekli sistemlerin yapıldığını gösteren Ulaşım ve Hareketlilik Tasarım Raporu’nun hazırlanması.', durum: YM }],
    kural: 'all',
    kuralText: 'Gereklilikler sağlandığı durumda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    yontem: 'Gereklilikler sağlandığı durumda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu',
    kaynaklar: ['İmar Kanunu']
  },
  'UHA 04 K5': {
    amac: 'Bu kriter ile motorlu araç bağımlılığını ve fosil yakıt kullanımını azaltmak amaçlanmaktadır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    gerek: [{ no: 1, text: 'Proje alanı içerisinde veya servis imkanı sunan fonksiyonlarda elektrikli araç kullanımının desteklendiğini gösteren belgeleri içeren Ulaşım ve Hareketlilik Tasarım Raporu’nun hazırlanması.', durum: YM }],
    kural: 'all',
    kuralText: 'Gereklilikler sağlandığı durumda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    yontem: 'Gereklilikler sağlandığı durumda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu'
  },
  'UHA 04 K6': {
    amac: 'Bu kriter ile otopark alanlarının kontrolü vasıtasıyla iklim değişikliği sürecinde ısı adası etkisini ve karbon salımını azaltmak amaçlanmaktadır.',
    kanit: 'Ulaşım ve hareketlilik tasarım raporu ekle',
    gerek: [
      { no: 1, text: 'Araç kullanımını azaltmak için alınan önlemler ile mevcut ve öneri otoparkların haritalandırıldığı Ulaşım ve Hareketlilik Tasarım Raporu’nun hazırlanması.', durum: YM },
      { no: 2, text: 'Otopark Yönetmeliği ile belirlenen otopark sayısına uygun otopark planlanmış olması ve bu sayının %30’unu aşmaması.', durum: YM }
    ],
    kural: 'all',
    kuralText: 'Gereklilikler sağlandığında yeni ve mevcut yerleşmelerde tam kredi alınır.',
    yontem: 'Proje alanı için; Otopark Yönetmeliği ile belirlenen otopark sayısına uygun otopark planlanmış olması ve Otopark Yönetmeliği ile belirlenen otopark sayısının %30’unu aşmaması halinde yeni ve mevcut yerleşmelerde tam kredi alınır.',
    belgeler: 'Ulaşım ve Hareketlilik Tasarım Raporu',
    kaynaklar: ['Otopark Yönetmeliği']
  },

  // ==== KET Kentsel Tasarım
  // ---- KET 01 Süreç ve Proje Tasarımı
  'KET 01 K1': {
    amac: 'Bu kriter ile sürdürülebilir yerleşmeye olanak sağlayan tasarım değerlendirme süreçlerini desteklemek, proje ve uygulama süreçlerine ilgili paydaşların aktif katılımını sağlamak, süreç içinde gelen geri bildirimlerle eş zamanlı ve adaletli çözümler üretebilmek amaçlanmaktadır.',
    kanit: 'Proje katılım planı ekle',
    gerek: [
      { no: 1, text: 'Katılım metodolojisi, stratejileri, programı, yaklaşık toplantı ve uygulama takvimleri ile projenin hedefleri (özellikle yeşil yerleşme hedefleri) belirlenmiş Proje Katılım Planı’nın hazırlanması.', durum: YM },
      { no: 2, text: 'Bağımsız ve disiplinler arası uzman katılımı ile afet ve iklim değişikliği göz önünde bulundurularak tasarım değerlendirmesinin (tasarım kritiği) yapılması ve sonuçlarına göre tasarımda gerekli iyileştirmelerin gerçekleştirilmesi.', durum: YM }
    ],
    kural: 'all',
    kuralText: 'Gereklilikler yerine getirildiğinde yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Gelişim önerilerini ve projenin tasarım kritiğini yapmak için bağımsız ve disiplinler arası uzman katılımı ile tasarım değerlendirilmesi yapılması ve sonuçlarına göre tasarımda gerekli iyileştirmelerin gerçekleştirilmesi durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    belgeler: 'Proje Katılım Planı'
  },
  'KET 01 K2': {
    amac: 'Bu kriter ile yerleşmenin yerel kimlik ve karakterini ortaya çıkarıp koruyarak, kentsel tasarımın evrensel ilkelerine göre tasarlanan proje alanının anlam ve kimlik kazanmasını sağlamak amaçlanmaktadır.',
    kanit: 'Yerel karakter değerlendirmesi raporu ekle',
    not: 'Raporu ve projede sağlanan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 0, text: 'Bina malzemeleri, rengi, mimari tarzı, yükseklikleri ve formları ile yerleşme ve çevresinde kent estetik ilkelerine uygunluğu belirten; Kentsel Tasarım Rehberi’ne (yoksa yönetmeliklere) uyulduğuna dair bilgilerin yer aldığı Yerel Karakter Değerlendirmesi Raporu’nun hazırlanması.', durum: YM },
      { no: 2, cr: 2, text: 'Mevcut doku ve bağlamın dikkate alınması (2 kredi).', durum: YM },
      { no: 3, cr: 2, text: 'Yerel bina formları, yükseklikleri ve mimari özelliklerinin dikkate alınması (2 kredi).', durum: YM },
      { no: 4, cr: 2, text: 'Yerel materyaller kullanılması (2 kredi).', durum: YM },
      { no: 5, cr: 2, text: 'Yerel ve bölgesel bitkiler kullanılması (2 kredi).', durum: YM }
    ],
    kural: 'sum', must: [1],
    kuralText: 'Rapor hazırlandığında, projede sağlanan her madde için 2 kredi alınır.',
    yontem: 'Yerel karakteri belirlemek için proje alanı ve çevresi gözden geçirilir; raporda mevcut doku ve bağlamların dikkate alındığı, yerel karakterin, tarihin ve kültürün devamlılığının sağlandığı, yerel bina formlarının, yüksekliklerinin ve mimari özelliklerinin dikkate alındığı, yerel malzemelerin ve bölgesel bitkilerin kullanıldığı belirtilmelidir.',
    belgeler: 'Yerel Karakter Değerlendirmesi Raporu',
    kaynaklar: ['İmar Kanunu', 'Mekânsal Planlar Yapım Yönetmeliği']
  },
  'KET 01 K3': {
    amac: 'Bu kriter ile proje alanının kültürel mirasını ve tarihi bağlamını içeren, yer duygusu ve kimliği geliştirerek halkı ve yöreyi destekleyen projeleri teşvik etmek, korunması gereken yapıların ve kültürel kaynakların korunmasını, tarihi yapıların ve kültürel peyzajların projede yeniden kullanımını desteklemek amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    not: 'Yerleşmenin durumuna uyan seçeneği işaretleyin; iki seçenekten yalnızca birinden kredi alınabilir.',
    gerek: [
      { no: 1, text: 'Seçenek-1: Proje alanında tescilli yapı veya kültürel peyzaj alanında yıkım ve yenileme yapılması durumunda projenin tarihi özelliklerinin korunduğunun belgelendirilmesi; rehabilitasyona tabi tarihi bina ve kültürel peyzaj alanları için uygun rehabilitasyon planlarının geliştirilmesi ve onay alınması. (Korunmaya değer tarihi ve kültür mirası yapılardan biri zarar görüyorsa kredi alınamaz.)', durum: YM },
      { no: 2, text: 'Seçenek-2: Proje alanında tescilli yapı olmaması durumunda yerel karakterin, tarihin ve kültürün devamlılığının sağlanması.', durum: YM }
    ],
    kural: 'any',
    kuralText: 'Seçeneklerden biri sağlandığında yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Yerleşmenin durumuna göre tercih edilecek iki seçenekten yalnızca birinden kredi alınabilir.',
    belgeler: 'Tarihi özelliklerin korunduğunu gösteren belgeler ve onaylı rehabilitasyon planları (Seçenek-1) ya da yerel karakterin, tarihin ve kültürün devamlılığının sağlandığını gösteren belgeler (Seçenek-2)',
    kaynaklar: ['İmar Kanunu', 'Kültür ve Tabiat Varlıklarını Koruma Kanunu', 'Yıpranan Tarihi ve Kültürel Taşınmaz Varlıkların Yenilenerek Korunması ve Yaşatılarak Kullanılması Hakkında Kanun', 'Mekânsal Planlar Yapım Yönetmeliği']
  },

  // ---- KET 02 Dolaşım Sistemi
  'KET 02 K1': {
    amac: 'Bu kriter ile günlük fiziksel aktiviteyi teşvik eden ve yaya güvenliğini sağlayan güvenli ve konforlu sokak çevreleriyle kamu sağlığını desteklemek, herkesin kullanabileceği engelsiz ve insan ölçeğinde tasarlanmış yürünebilir sokak tasarımlarıyla ulaşım verimliliğini arttırmak amaçlanmaktadır.',
    kanit: 'Kentsel tasarım projesi ekle',
    gerek: [
      { no: 1, text: 'İlgili mevzuat ve proje alanının yerel özelliklerine bağlı kalınarak, afet ve iklim değişikliği de göz önünde bulundurularak Kentsel Tasarım Projesi’nin hazırlanması.', durum: YM },
      { no: 2, text: 'Dolaşım sistemine (taşıt ve/veya yaya ulaşım sistemine) cephe veren binaların caddelere yakın yer alması.', durum: YM },
      { no: 3, text: 'Sürekli yürüme yolları oluşturulması.', durum: YM },
      { no: 4, text: 'Yürüme yolları / yaya kaldırımlarının garaj veya servis girişleri tarafından sık sık kesintiye uğramaması.', durum: YM },
      { no: 5, text: 'Kamusal mekana bakan zemin kat kullanımlarında dış mekanlarla bağlantıyı kurabilecek pencere ve cam yüzeylerin arttırılması.', durum: YM }
    ],
    kural: 'all',
    kuralText: 'Gereklilikler yerine getirildiğinde yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Projeye konu alanda yukarıdaki koşulların sağlanması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    belgeler: 'Kentsel Tasarım Projesi',
    kaynaklar: ['Mekânsal Planlar Yapım Yönetmeliği', 'TS 12576 Şehiriçi Yollar - Özürlü ve Yaşlılar İçin Sokak, Cadde, Meydan ve Yapısal Önlemler ve İşaretlemelerin Tasarım Kuralları', '“Erişilebilirlik Kılavuzu” (https://www.aile.gov.tr/media/65613/erisilebilirlik_kilavuzu_2021.pdf)']
  },
  'KET 02 K2': {
    amac: 'Bu kriter ile yapılaşma faaliyetlerinin doğal çevre, insan sağlığı ve yaşam kalitesi üzerindeki olumsuz etkilerini azaltmak amacıyla proje alanı içindeki binaların taban alan oranının azaltılarak açık alan oranının arttırılması hedeflenmektedir.',
    kanit: 'Yapılaşmış alan oranı raporu ekle',
    gerek: [{ no: 1, text: 'Proje alanı içindeki binaların taban alan oranının azaltılarak açık alan oranının arttırıldığını belirten raporun hazırlanması.', durum: YM }],
    girdi: [{ k: 'oran', l: 'Yapılaşmış alan oranı', t: 'num', ipucu: 'ör. 0,25' }],
    hesap: v => {
      const x = gnum(v.oran);
      if (isNaN(x)) return { cr: 0, text: 'Yapılaşmış alan oranını girin.' };
      const cr = x <= 0.20 ? 3 : x <= 0.30 ? 2 : x <= 0.40 ? 1 : 0;
      return { cr, text: `Yapılaşmış alan oranı = ${fmtN(x)} → ${cr} kredi` };
    },
    kural: 'hesap',
    kuralText: 'Yapılaşmış alan oranı 0,30–0,40 arasında ise 1, 0,20–0,30 arasında ise 2, 0,20 ve altında ise 3 kredi alınır (yeni ve mevcut yerleşmeler).',
    yontem: 'Projeye konu alanda yapılaşmış alan oranı kılavuzdaki denkleme göre hesaplanarak kredilendirme yapılır.',
    belgeler: 'Yapılaşmış alan oranı raporu',
    kaynaklar: ['İmar Kanunu', 'Planlı Alanlar İmar Yönetmeliği']
  },
  'KET 02 K3': {
    amac: 'Bu kriter ile proje alanından toplu taşıma sistemlerine erişimde devamlı bisiklet yollarıyla aktif ulaşımın sağlanması amaçlanmaktadır.',
    kanit: 'Ulaşım şeması ekle',
    not: 'Proje alanında planlanan bisiklet yollarının toplu taşıma sistemlerine bağlantısını gösteren ulaşım şemasında yer alan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 1, text: 'Ulaşım şemasında ihtiyaç duyulan ışıklandırma, rota ve yön levhalarının yer alması (1 kredi).', durum: YM },
      { no: 2, cr: { Y: 4, M: 2 }, text: 'Bisiklet yollarının UHA 02 K2’de belirlenen gerekliliklere göre tasarlanması (yeni 4, mevcut 2 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Ulaşım şemasında yer alan maddelere göre krediler toplanır.',
    yontem: 'Proje alanında planlanan bisiklet yollarının toplu taşıma sistemlerine bağlantısını gösteren ulaşım şeması hazırlanır; yer alan maddelere göre kredilendirme yapılır.',
    belgeler: 'Ulaşım şeması',
    kaynaklar: ['İmar Kanunu', 'Bisiklet Yolları Yönetmeliği', 'Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmelik', 'Erişilebilirlik İzleme ve Denetleme Yönetmeliği']
  },

  // ---- KET 03 Kamusal ve Açık Alanlar
  'KET 03 K1': {
    amac: 'Bu kriter ile konforlu ve canlı kamusal alanlar tasarlayarak sosyal etkileşimi desteklemek amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    not: 'Kentsel tasarım projesi, kamusal açık alanlardan bina girişlerine yürüme rotalarını gösteren harita ve suç riski değerlendirme raporu ile kanıtlanan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 2, text: 'Kamusal alanın farklı kullanıcılar için birden fazla kullanıma izin vererek; güvenlik ve konfor dikkate alınarak çocuk, yaşlı ve engellileri kapsayacak şekilde tasarlanması (2 kredi).', durum: YM },
      { no: 2, cr: 2, text: 'Meydan, park veya toplanma alanı gibi planlı veya mevcut kamusal açık alanların, konut alanlarının ve konut dışı kullanımların %90’ının ana girişlerinden en fazla 200 metre mesafede yer alacak şekilde konumlandırılması (2 kredi).', durum: YM },
      { no: 3, cr: 2, text: 'Suç riski değerlendirmesi yapılarak tasarım stratejileri geliştirilmesi, görünebilirlik arttırılarak güvenli mekanlar oluşturulması ve tüm kamusal açık alanların en az bir sokaktan görünür tasarlanması (2 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Sağlanan her madde için yeni ve mevcut yerleşmelerde 2 kredi alınır.',
    yontem: 'Konforlu, yaşayan ve erişilebilir kamusal alanlar yukarıdaki maddelere göre kredilendirilir.',
    belgeler: ['• Kentsel tasarım projesi,', '• Kamusal açık alanlardan bina girişlerine yürüme rotalarını gösteren harita,', '• Suç riski değerlendirme raporu.'],
    kaynaklar: ['İmar Kanunu', 'Mekânsal Planlar Yapım Yönetmeliği']
  },
  'KET 03 K2': {
    amac: 'Bu kriter ile proje alanı içinde yaşayanların, yaşam alanlarına yakın çeşitli tip ve büyüklükte rekreasyon alanları oluşturarak sosyal iletişim ve fiziksel aktivitelerini arttırmak ve sosyal fayda sağlamak amaçlanmaktadır.',
    kanit: 'Yürüme rotaları krokisi ekle',
    not: 'Kamusal rekreasyon alanlarından bina girişlerine ulaşan yürüme rotalarını gösteren krokilerle kanıtlanan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: { Y: 5, M: 3 }, text: 'Bina ana girişinden uygun rekreasyon alanlarına yürüme rotalarının 200 metre yürüme mesafesi içinde tasarlanması (yeni 5, mevcut 3 kredi).', durum: YM },
      { no: 2, cr: 3, text: 'Açık ve yeşil alan toplamının toplam proje alanına oranının 0,80’e eşit veya daha büyük olması (3 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Sağlanan maddelere göre krediler toplanır.',
    yontem: 'Yüksek kaliteye sahip, erişilebilir yeşil alanlar yukarıdaki maddelere göre kredilendirilir.',
    belgeler: 'Kamusal rekreasyon alanlarından bina girişlerine yürüme rotalarını gösteren krokiler',
    kaynaklar: ['Mekânsal Planlar Yapım Yönetmeliği']
  },
  'KET 03 K3': {
    amac: 'Bu kriter ile proje alanı çevresindeki tarım alanlarını destekleyerek toplum esaslı gıda ve tarımsal ürün yetiştirilmesini teşvik etmek, bu üretimin çevresel, ekonomik ve sosyal yararlarını desteklemek ve taze besine daha iyi erişim sağlayarak sağlıklı beslenme standartlarını iyileştirmek amaçlanmaktadır.',
    kanit: 'Toplum bahçeleri krokisi ekle',
    gerek: [
      { no: 1, text: 'Mevcut ve planlı toplum bahçelerinin konumunu ve büyüklüklerini gösteren krokinin hazırlanması.', durum: YM },
      { no: 2, text: 'Yöntem-1 (bahçe ve çiftlikler): proje alanı içinde veya proje alanının merkezinin 800 m’lik çevresinde mevcut ve planlı toplum bahçelerinin bulunması.', durum: YM },
      { no: 3, text: 'Yöntem-2 (topluluk destekli tarım): proje alanının 240 km’lik çevresinde, konut birimlerinin en az %80’ine hizmet veren ve her konut biriminin yerleşimden sonra en az 2 yıl bu servisi aldığı topluluk destekli tarım programının bulunması.', durum: YM },
      { no: 4, text: 'Yöntem-3 (çiftçi / üretici pazarına yakınlık): proje alanına 800 m yürüme mesafesinde, haftada en az 1 kez ve yılda en az 5 ay kurulan, en fazla 240 km mesafede yetiştirilen ürünleri satan mevcut veya planlanmış bir çiftçi pazarının bulunması.', durum: YM }
    ],
    kural: 'min', must: [1], pick: { of: [2, 3, 4], min: 1 },
    kuralText: 'Kroki hazırlandığında, üç yöntemden herhangi birinin sağlanması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Yerleşmenin bu kriterden kredi alabilmesi için üç yöntemden herhangi birini sağlaması yeterlidir.',
    belgeler: 'Mevcut ve planlı toplum bahçelerinin konumunu ve büyüklüklerini gösteren kroki',
    kaynaklar: ['Mekânsal Planlar Yapım Yönetmeliği']
  },

  // ---- KET 04 Hizmetler ve Donatılar
  'KET 04 K1': {
    amac: 'Bu kriter ile yerleşmeler içerisinde karma kullanımlı yapıların tasarlanması, araç bağımlılığının azaltılması, günlük yürüyüş ve bisiklet kullanımının arttırılması amaçlanmaktadır.',
    kanit: 'Kroki ve rapor ekle',
    not: 'Kroki ve raporla kanıtlanan maddeleri işaretleyin; krediler toplanır (iş imkanlarına uzaklıkta yalnızca yüksek olan sayılır).',
    gerek: [
      { no: 1, cr: 2, text: 'Proje alanının, insanların yürüme mesafesi içerisinde günlük ihtiyaçlarını karşılayacak şekilde dizayn edilmesi (2 kredi).', durum: YM },
      { no: 2, cr: { Y: 3, M: 2 }, alt: 'is', text: 'İş imkanları ile proje alanı arasındaki mesafenin en fazla 2 km olması (yeni 3, mevcut 2 kredi).', durum: YM },
      { no: 3, cr: { Y: 2, M: 1 }, alt: 'is', text: 'İş imkanları ile proje alanı arasındaki mesafenin en fazla 5 km olması (yeni 2, mevcut 1 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Sağlanan maddelere göre krediler toplanır; iş imkanlarına uzaklıkta (2 ve 3) yalnızca biri sayılır.',
    yontem: 'Proje alanı seçiminde iş imkanlarına erişimin rahat olduğu ve proje alanının insanların yürüme mesafesi içerisinde günlük ihtiyaçlarını karşılayacak şekilde dizayn edildiği kroki ve raporla belirtilir.',
    belgeler: 'Kroki ve rapor',
    kaynaklar: ['Mekânsal Planlar Yapım Yönetmeliği']
  },
  'KET 04 K2': {
    amac: 'Bu kriterde yaş ve kabiliyete bakılmaksızın herkesin erişebileceği ve gereksinimleri karşılayan servis ve imkanların sağlanması amaçlanmaktadır.',
    kanit: 'Stratejik plan raporu ve arazi kullanım haritası ekle',
    not: '“Demografik Gereksinim ve Öncelikler” bölümü olan Stratejik Plan Raporu (SES 01 K1) ve mevcut / planlanan arazi kullanım haritası hazırlanmalıdır. Karşılanan en kapsamlı durumu işaretleyin; en yüksek seçenek sayılır.',
    gerek: [
      { no: 1, text: 'En az 1 ihtiyaç / öncelik karşılanıyor (1 kredi).', durum: YM },
      { no: 2, text: 'Tüm orta seviye ihtiyaçlar / öncelikler karşılanıyor (2 kredi).', durum: YM },
      { no: 3, text: 'Tüm yüksek seviye ihtiyaçlar / öncelikler karşılanıyor (3 kredi).', durum: YM },
      { no: 4, text: 'Tüm orta ve yüksek seviye ihtiyaçlar / öncelikler karşılanıyor (4 kredi).', durum: YM },
      { no: 5, text: 'Tüm düşük, orta ve yüksek seviye ihtiyaçlar / öncelikler karşılanıyor (tam kredi).', durum: ['Y'] }
    ],
    kural: 'tiers', must: [],
    tiers: [{ no: 1, cr: cr7(1, 1), ayri: true }, { no: 2, cr: cr7(2, 2), ayri: true }, { no: 3, cr: cr7(3, 3), ayri: true }, { no: 4, cr: cr7(4, 4), ayri: true }, { no: 5, cr: cr7(5, 4), ayri: true }],
    kuralText: 'Stratejik Plan Raporu’nda tanımlanan demografik gereksinim ve önceliklerin karşılanma seviyesine göre 1–4 kredi; yeni yerleşmelerde tüm düşük, orta ve yüksek seviye ihtiyaçlar karşılanıyorsa tam kredi alınır.',
    yontem: 'SES 01 K1 kriterinde istenen Stratejik Plan Raporu’nda tanımlanmış demografik gereksinim ve önceliklerin seviyesine göre kredilendirme yapılır.',
    belgeler: ['• Stratejik Plan Raporu (“Demografik Gereksinim ve Öncelikler” bölümü),', '• Mevcut ve planlanan arazi kullanım haritası.'],
    kaynaklar: ['Mekânsal Planlar Yapım Yönetmeliği']
  },

  // ---- KET 05 Yapılar
  'KET 05 K1': {
    amac: 'Bu kriter ile mevcut bina ve altyapıların; gömülü karbon dikkate alınarak yaşam döngüsünün uzatılması ve mümkün olduğu yerlerde tekrar kullanımının sağlanması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, cr: 0, text: 'Tescilli yapı veya kültürel peyzaj alanında yıkım ve yenileme yapılıyorsa gerekli izinlerin alınması ve belgelendirilmesi; kapsamlı onarıma tabi olacak binanın proje alanı içindeki yeri, proje alanının altyapı durumu ve nasıl bir yenilemeye tabi tutulacağının raporlandırılması.', durum: YM },
      { no: 2, cr: 1, alt: 'bina', text: 'Proje alanında 5 veya daha az sayıda yenilenen bina bulunması (1 kredi).', durum: ['M'] },
      { no: 3, cr: 3, alt: 'bina', text: 'Proje alanında 5’ten fazla yenilenen bina bulunması (3 kredi).', durum: ['M'] },
      { no: 4, cr: 2, text: 'Proje alanında mevcut altyapının kullanılması (2 kredi).', durum: ['Y'] }
    ],
    kural: 'sum', must: [1],
    kuralText: 'Mevcut yerleşmelerde yenilenen bina sayısına göre 1 ya da 3 kredi; yeni yerleşmelerde mevcut altyapının kullanılması durumunda 2 kredi alınır.',
    yontem: 'Her mevcut bina ve altyapı; yeniden kullanılabilirlik, yeniden kazanılabilirlik ve sürdürülebilirlik gözüyle değerlendirilmelidir. Bu değerlendirme; miras ve yerel kimlik, konum ve durumu, malzemesindeki gömülü karbon, potansiyel kullanımları, muhtemel malzeme kullanımları, yerel otorite bilgi ve görüşlerine göre yapılmalıdır. Herhangi bir yıkım veya yeniden kullanım kararı için dayanak sunulmuş olmalıdır.',
    belgeler: ['• Gerekli izinler (tescilli yapı / kültürel peyzaj alanında yıkım ve yenileme yapılıyorsa),', '• Binaların ve altyapının durumunu ve yenileme biçimini açıklayan rapor.'],
    kaynaklar: ['Kültür ve Tabiat Varlıklarını Koruma Kanunu', 'Yıpranan Tarihi ve Kültürel Taşınmaz Varlıkların Yenilenerek Korunması ve Yaşatılarak Kullanılması Hakkında Kanun']
  },
  'KET 05 K2': {
    amac: 'Bu kriter ile yeşil sertifika almış binaları teşvik etmek ve yeşil yerleşmenin en temel yapı taşlarından biri olan yeşil binaları sayıca arttırmak amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'İmar planında o alan için tanımlı kullanım kararına hizmet eden en az 1 binanın Ulusal Yeşil Sertifika’nın (YeS) başvuru tarihindeki güncel versiyonuna sahip olması ve diğer binaların EKB’lerindeki enerji performans sınıfının en az “C” olması.', durum: YM }],
    girdi: [{ k: 'oran', l: 'Ulusal Yeşil Sertifikalı bina oranı', t: 'num', birim: '%', durum: ['M'] }],
    hesap: (v, p) => {
      if (p.durum === 'Y') return { cr: 0, text: 'Yeni yerleşmelerde bu kriter zorunludur; kredisi yoktur.' };
      return yOran('oran', 'Yeşil sertifikalı bina oranı', { M: [[10, 1], [21, 2], [31, 3], [41, 4], [51, 5]] }, true)(v, p);
    },
    kural: 'hesap', zReq: [1],
    kuralText: 'Yeni yerleşmeler için zorunlu, mevcut yerleşmeler için zorunlu ve kredili bir kriterdir. Mevcut yerleşmelerde yeşil sertifikalı bina oranına göre: %10–%20 1, %21–%30 2, %31–%40 3, %41–%50 4, %51–%100 5 kredi alınır.',
    yontem: 'Mevcut yerleşmelerde sertifikaya konu olan alan içindeki bina sayısının Ulusal Yeşil Sertifikalı bina oranına göre kredilendirme yapılır.',
    belgeler: ['• Ulusal Yeşil Sertifika belgeleri,', '• Diğer binaların Enerji Kimlik Belgeleri.']
  },
  'KET 05 K3': {
    amac: 'Bu kriter ile sosyal eşitliği sağlamak ve farklı ekonomik sınıflar, aile büyüklüğü ve yaş gruplarını kaynaştırmak amaçlanmaktadır.',
    kanit: 'Konut tipleri krokisi ve tablosu ekle',
    gerek: [{ no: 1, text: 'Saha içinde konut birimlerinin yerlerini gösteren kroki ve konut tipleri tablosunun hazırlanması.', durum: YM }],
    girdi: [{ k: 'sce', l: 'Simpson Çeşitlilik Endeksi (SÇE)', t: 'num', ipucu: 'ör. 0,65' }],
    hesap: (v, p) => {
      const x = gnum(v.sce);
      if (isNaN(x)) return { cr: 0, text: 'Simpson Çeşitlilik Endeksi değerini girin.' };
      const cr = bandCredit(x, { Y: [[0.6, 1], [0.7, 2]], M: [[0.5, 1], [0.6, 2], [0.7, 3]] }[p.durum], true);
      return { cr, text: `SÇE = ${fmtN(x)} → ${cr} kredi` };
    },
    kural: 'hesap',
    kuralText: 'SÇE değerine göre: 0,5 ≤ SÇE < 0,6 mevcut 1; 0,6 ≤ SÇE < 0,7 yeni 1 / mevcut 2; 0,7 ≤ SÇE yeni 2 / mevcut 3 kredi alınır.',
    yontem: 'Konut tiplerindeki çeşitlilik sağlanmalıdır. Projedeki planlanmış ve mevcut konutlar için Simpson Çeşitlilik Endeksi (SÇE) hesaplanır (n: aynı kategori içindeki toplam konut sayısı, N: bütün kategorilerdeki toplam konut sayısı) ve sonuca göre kredilendirme yapılır.',
    belgeler: 'Konut birimlerinin yerlerini gösteren kroki ve konut tipleri tablosu'
  },

  // ---- KET 06 Çevre
  'KET 06 K1': {
    amac: 'Bu kriter ile mikro ölçekte iklim koşullarının kontrol edilerek konforlu açık alan çevreleri oluşturulması amaçlanmaktadır.',
    kanit: 'Mikroklima raporu ekle',
    not: 'Proje alanına dair mikroklima çalışması ve raporunda yer alan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: { Y: 2, M: 3 }, text: 'Proje alanının ve çevresinin dışsal mikroklimasına etkilerini gösteren simülasyon / çalışma yapılması (yeni 2, mevcut 3 kredi).', durum: YM },
      { no: 2, cr: 5, text: 'Proje alanının olumsuz koşulları asgari düzeye indirgeyecek şekilde tasarlanması (5 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Raporda yer alan maddelere göre krediler toplanır.',
    yontem: 'Proje alanına dair mikroklima çalışması ve raporu hazırlanır; yukarıdaki maddelere göre kredilendirme yapılır.',
    belgeler: 'Mikroklima çalışması ve raporu'
  },
  'KET 06 K2': {
    amac: 'Bu kriter ile proje alanının iklim değişikliğinin bilinen ve beklenen etkilerine karşı dayanıklılığının ve adaptasyonunun sağlanması amaçlanmaktadır.',
    kanit: 'BAK hesap tablosu ekle',
    gerek: [
      { no: 1, text: 'Proje alanı için Biyotop Alan Katsayısı (BAK) hesap tablosunun hazırlanması.', durum: YM },
      { no: 2, text: 'Mevcut BAK oranının, Tablo 2.4.8’de verilen BAK standart değerine eşit ya da yüksek olması.', durum: YM }
    ],
    detay: [
      'Tablo 2.4.8 – BAK standartları (konut / ticaret / karma kullanım / kamu / eğitim / anaokulu / teknik altyapı):',
      '• Yeni yerleşme: 0,70 / 0,30 / 0,50 / 0,70 / 0,50 / 0,70 / 0,30,',
      '• Mevcut yerleşme, TAKS ≤ 0,30: 0,60 / 0,30 / 0,30 / 0,60 / 0,30 / 0,60 / 0,30,',
      '• Mevcut yerleşme, TAKS 0,36–0,49: konut, kamu ve anaokulu 0,45,',
      '• Mevcut yerleşme, TAKS ≥ 0,50: konut, kamu ve anaokulu 0,30.'
    ],
    kural: 'all',
    kuralText: 'Mevcut BAK oranı olması gereken BAK standart değerine eşit ya da yüksekse yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Mekânsal planlamada bir doğa koruma yöntemi olarak bilinen BAK, sel, kuraklık, sıcak hava dalgası gibi iklim değişikliği etkilerini azaltmak, yapılaşmış alanlarda bitkilendirmeyi artırarak yeşili teşvik etmek ve yerleşmenin yeşil altyapısını geliştirmek için kullanılır. BAK, yeşil alan / bitkilendirilmiş alanın yapılaşmış alana oranıdır; alanın mevcut BAK’ı bulunur ve yeni ve mevcut yerleşmeler için verilen standartlarla kıyaslanır.',
    belgeler: 'Biyotop Alan Katsayısı (BAK) hesap tablosu',
    kaynaklar: ['İmar Kanunu']
  },
  'KET 06 K3': {
    amac: 'Bu kriter ile ısı adası etkisini azaltacak tedbirleri uygulayan projeleri desteklemek, ısı adası etkisini azaltmak için bitkilendirme ve sert zemin kullanımını düzenlemek amaçlanmaktadır.',
    kanit: 'Isı adası raporu ekle',
    not: 'Vaziyet planı üzerinde ısı adası etkisinin azaltılmasına yönelik çatı dışı yüzeylerde alınan önlemlerin ve kullanılan malzemelerin gösterildiği raporda yer alan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 3, text: 'Bina yükseklikleri, konumları, biçimleri ve binalar arasındaki mesafelerin hava akışına izin verecek şekilde tasarlanması (3 kredi).', durum: YM },
      { no: 2, cr: { Y: 2, M: 3 }, text: 'Yer döşemesinin ısı etkisini azaltacak şekilde kullanılması (yeni 2, mevcut 3 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Sağlanan her şart için belirlenen krediler alınır.',
    yontem: 'Proje kapsamında şartlardan her biri için belirlenen krediler alınır. Proje kapsamında Kentsel Tasarım Kılavuzu hazırlanıyorsa, kılavuzda bu şartlar dikkate alınmalıdır.',
    belgeler: 'Isı adası etkisinin azaltılmasına yönelik önlemleri ve malzemeleri vaziyet planı üzerinde gösteren rapor',
    kaynaklar: ['ASTM E1980-11 Standard Practice for Calculating Solar Reflectance Index of Horizontal and Low-Sloped Opaque Surfaces', 'Cool Roof Rating Council Standard (CRRC-1)', 'Yerel muadili test metodolojileri']
  },
  'KET 06 K4': {
    amac: 'Bu kriter ile yeşil yerleşmelerde ulaşım ve sanayiden kaynaklanan gürültü kirliliğinin azaltılması amaçlanmaktadır.',
    kanit: 'Stratejik gürültü haritaları ekle',
    gerek: [
      { no: 1, text: 'Hesaplanan çevresel gürültünün haritalanması ve çevresel gürültüye maruz kalma kategorilerine göre planlamanın sınırlandırılmasının stratejik gürültü haritaları ile kanıtlanması.', durum: ['Y'] },
      { no: 2, text: 'Mevcut çevresel gürültünün haritalanması ve çevresel gürültüye maruz kalma kategorilerine göre stratejik gürültü haritaları ve gürültü eylem planı ile kanıtlanması.', durum: ['M'] }
    ],
    kural: 'all',
    kuralText: 'Yeni yerleşmelerde stratejik gürültü haritaları, mevcut yerleşmelerde stratejik gürültü haritaları ve eylem planları ile kanıtlanması durumunda tam kredi alınır.',
    yontem: [
      'Stratejik gürültü haritaları ve eylem planlarının Çevresel Gürültünün Değerlendirilmesi ve Yönetimi Yönetmeliği’ne uygun olması gerekmektedir.',
      '• İşletme, tesis, liman, eğlence yeri, işyeri, atölye ve imalathane gürültüsünün hesaplanması için TS ISO 9613-2 kullanılmalıdır; kaynak bazında emisyon verisi TS ISO 8297, TS EN ISO 3744 veya TS EN ISO 3746’ya göre ölçümlerle elde edilir.',
      '• Havaalanı gürültüsü için ECAC.CEAC Doc 29 kullanılmalıdır.',
      '• Karayolu trafiği gürültüsü için “NMPB – Routes – 96 (SETRA – CERTU – LCPC – CSTB)” ve XPS 31-133 kullanılmalıdır.',
      '• Demiryolu gürültüsü için “Reken – Meervoorschrift Railverkeerslawaai 96” kullanılmalıdır.',
      '• Gürültü haritalarında kullanılan Lgag ve Lgece göstergelerinin ölçümü için TS ISO 1996-2 kullanılmalıdır.'
    ],
    belgeler: ['• Stratejik gürültü haritaları,', '• Gürültü eylem planı (mevcut yerleşmeler için).'],
    kaynaklar: [
      'Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik', 'Çevresel Gürültünün Değerlendirilmesi ve Yönetimi Yönetmeliği',
      'TS ISO 1996-2 Akustik - Çevre gürültüsünün tarifi, ölçülmesi ve değerlendirilmesi - Bölüm 2: Çevre gürültü seviyelerinin belirlenmesi',
      'TS ISO 9613-2 Akustik - Sesin Dışarıda Yayılırken Azalması - Bölüm 2: Genel Hesaplama Yöntemi',
      'TS ISO 8297 Akustik - Çoklu Gürültü Kaynağına Sahip Sanayi Tesislerinde Çevredeki Ses Basınç Seviyelerinin Değerlendirilmesi İçin Ses Güç Seviyelerinin Tayini - Mühendislik Metodu',
      'TS EN ISO 3744 Akustik - Gürültü kaynaklarının ses gücü seviyelerinin ve ses basınç seviyelerinin ses basıncı kullanılarak belirlenmesi - Mühendislik yöntemleri',
      'TS EN ISO 3746 Akustik - Ses Basıncı Kullanılarak Gürültü Kaynaklarının Ses Güç Seviyelerinin Tayini - Gözlem Metodu'
    ],
    tanimlar: [['Gürültü haritalama', 'Yürürlükte bulunan her türlü sınır değerin aşılıp aşılmadığını göstermek amacıyla, belirli bir alanda etkilenen kişi ve maruz kalan konut sayısı da dâhil olmak üzere, mevcut veya gelecekte ortaya çıkabilecek bir gürültü durumu hakkındaki verilerin gürültü göstergesi kullanılarak alanın fiziksel haritası üzerinde standartlara uygun olarak belirtilmesidir.']]
  },
  'KET 06 K5': {
    amac: 'Bu kriter ile dış aydınlatmalardan gelen yapay ışığın yaban ve insan yaşamında yol açtığı olumsuzluk ve rahatsızlıkları önlemek, gece göğünün görünürlüğünü arttırmak ve enerji tüketimini azaltmak amaçlanmaktadır.',
    kanit: 'TS EN 12464-2 değerlendirme raporu ekle',
    gerek: [
      { no: 1, text: 'TS EN 12464-2 Standardına uygun Değerlendirme Raporu’nun hazırlanması: enerji verimli ışık kaynakları ve geriverimi yüksek aygıtlar; ışığın yalnızca aydınlatılması istenen alana yönlendirilmesi, kamaşma ve ışık kirliliği oluşturmaması; dış ortam koşullarına uygun koruma sınıfında aygıtlar.', durum: YM },
      { no: 2, text: 'Yöntem 1: Hesaplama / simülasyon.', durum: YM },
      { no: 3, text: 'Yöntem 2: Ölçüm (mevcut yapı).', durum: ['M'] },
      { no: 4, text: 'Yöntem 3: Karma (hesaplama / simülasyon / ölçüm).', durum: YM }
    ],
    kural: 'min', must: [1], pick: { of: [2, 3, 4], min: 1 },
    kuralText: 'Yöntemlerden biri seçilerek TS EN 12464-2 Standardına uygun Değerlendirme Raporu hazırlanması durumunda tam kredi alınır.',
    detay: [
      'Tablo 2.4.10 – Işık kirliliği açısından izin verilen azami değerler (çevre ortamı sınıfı: düşey aydınlık düzeyi Ev kısıtlama öncesi / sonrası lx; aygıt ışık yeğinliği I kısıtlama öncesi / sonrası cd; üst yarı uzaya giden ışık oranı RUL %; azami ortalama ışıklılık yapı cephesinde / işaretlerde cd/m²):',
      '• E1 doğal alanlar: 2 / 0; 2500 / 0; 0; 0 / 50,',
      '• E2 kent sınırı, kırsal: 2 / 1; 7500 / 500; 5; 5 / 400,',
      '• E3 kent çevresi, banliyö: 10 / 2; 10000 / 1000; 15; 10 / 800,',
      '• E4 kent merkezi: 25 / 5; 25000 / 2500; 25; 25 / 1000.',
      'Tablo 2.4.11 – Dış çalışma yerleri (Ēm lx / Uo / RGL / Ra): yalnızca yaya yolları 5 / 0,25 / 50 / 20; düşük hızlı araç trafik alanları 10 / 0,40 / 50 / 20; normal hızlı araç trafik alanları 20 / 0,40 / 45 / 20; yaya geçiş, araç dönüş, yükleme-indirme noktaları 50 / 0,40 / 50 / 20; temizleme ve servis alanları 50 / 0,25 / 50 / 20.'
    ],
    yontem: [
      'Dış mekanlarda eylem ve etkinlikler için ilgili standartlarda verilen aydınlatma koşulları sağlanmalıdır. Dış aydınlatmaların kullanım saatleri, güvenlik açısından tehlike yaratmamak koşuluyla sınırlandırılabilir.',
      'Yöntem 1: Hesaplama / Simülasyon – Kullanılacak aydınlatma aygıtlarının teknik özellikleri bağlamında konum ve aralıkları belirlendikten sonra, aydınlatılacak yüzeylerde gerekli aydınlık düzeyi (E, lx) ve ışıklılıkların (cd/m²) sağlandığının hesaplama ve simülasyonla belirlenmesi.',
      'Yöntem 2: Ölçüm (mevcut yapı) – Aydınlatılan yüzeylerde aydınlık düzeyi ve ışıklılıkların yerinde ölçülmesi.',
      'Yöntem 3: Karma – Yöntem 1 ve Yöntem 2’nin birlikte kullanılması.'
    ],
    belgeler: [
      'Değerlendirme raporu aşağıdaki belgeleri içermelidir:',
      '• Dış aydınlatma aygıtlarının konumlarını gösteren aydınlatma düzeninin planı, kesiti (tüm yöntemler),',
      '• Işık kaynaklarının (lambaların) cins ve gücünün ayrıntılı listesi (tüm yöntemler),',
      '• Aygıt özellikleri ve ışıksal özelliklerinin ayrıntılı listesi (tüm yöntemler),',
      '• Aydınlatma kontrol sistemi özellikleri (tüm yöntemler),',
      '• Aydınlık düzeyi, ışıklılık ve kamaşma değerlerinin gerekli düzlemler üzerinde gösterilmesi (tüm yöntemler),',
      '• Simülasyon programı özellikleri, program girdileri ve sonuç sayfaları (Yöntem 1 ve 3),',
      '• Kullanılan aydınlıkölçer ve ışıklılık ölçer özellikleri (Yöntem 2 ve 3).'
    ],
    kaynaklar: [
      'Genel Aydınlatma Yönetmeliği', 'TS EN 12464-2 Işık ve Aydınlatma - İş Yerlerinin Aydınlatılması - Bölüm 2: Bina dışı iş yerleri', 'LED Işık Kaynaklı Yol Aydınlatma Armatürleri Teknik Şartnamesi, TEDAŞ',
      'CIE (1993) Guide for Floodlighting, Publication No. 094-1993', 'CIE (2000) Guide to the Lighting of Urban Areas, Publication No. 136-2000', 'CIE International Lighting Vocabulary (http://eilv.cie.co.at/)',
      'CIE 171:2006 Test cases to assess the accuracy of lighting programs', 'CIE 206:2014 The Effect of Spectral Power Distribution on Lighting for Urban and Pedestrian Areas', 'CIE 115:2010 The Lighting of Roads for Motor and Pedestrian Traffic'
    ]
  },
  'KET 06 K6': {
    amac: 'Bu kriter ile kamusal alanda düşük etkili malzeme kullanımıyla inşaatın çevresel etkilerinin azaltılması amaçlanmaktadır.',
    kanit: 'ÇÜB / YDD belgelerini ekle',
    gerek: [{ no: 1, text: 'Açık alan tasarımında kullanılacak malzeme / ürünlere ilişkin, Yeşil Sertifika Bina Kılavuzu YMD 01 K1 kriteri doğrultusunda gerçekleştirilecek yönteme göre Çevresel Ürün Beyanları (ÇÜB) veya ilgili çevre belgelerinin temin edilmesi ya da Yaşam Döngüsü Değerlendirme (YDD) Raporu’nun hazırlanması.', durum: YM }],
    kural: 'all',
    kuralText: 'Gerekliliğin sağlanması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Gerekliliğin sağlanması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    belgeler: 'ÇÜB veya ilgili çevre belgeleri ya da YDD Raporu',
    kaynaklar: ['Çevre Etiketi Yönetmeliği', 'TS EN ISO 14040 Çevre Yönetimi - Hayat Boyu Değerlendirme - İlkeler ve Çerçeve', 'TS EN ISO 14044 Çevre Yönetimi - Hayat Boyu Değerlendirme - Gerekler ve Kılavuz', 'TS EN 15804+A2/AC Yapıların Sürdürülebilirliği - Mamullere İlişkin Çevresel Beyanlar', 'TS ISO 14025 Çevre Etiketleri ve Beyanları - Tip III Çevre Beyanları', 'TS ISO 21930 Yapılarda ve inşaat mühendisliği işlerinde sürdürülebilirlik - Yapı malzemelerinin ve hizmetlerinin çevresel beyanları için temel kurallar', 'TS EN 15942 Yapı İşlerinin Sürdürülebilirliği - Çevresel Mamul Beyanı - İşletmeler Arası İletişim Formatı', 'TS EN 14049 Su uygulamalarının yoğunluğu (şiddeti) - Hesaplama yöntemi ve ölçme metodları']
  },

  // ==== SES Sosyal ve Ekonomik Sürdürülebilirlik
  // ---- SES 01 Sosyal ve Ekonomik Refah
  'SES 01 K1': {
    amac: 'Bu kriter ile yeşil yerleşmelerin planlanmasında, bu alanda yaşayan / yaşayacak olan insanların refahını artırmak, hayat standartlarını yükseltmek, temel hak ve özgürlüklerini güçlendirerek adil, güvenli ve huzurlu bir yaşam ortamı tesis etmek ve bunu kalıcı kılmak amaçlanmaktadır.',
    kanit: 'Stratejik plan raporu ekle',
    gerek: [{ no: 1, text: 'Proje alanına dair detaylı projeksiyonları, analiz ve sentezleri içeren; projenin hedef, amaç ve araçları arasında tutarlılık sağlayan ve proje içeriğinin bölgenin sosyal ve ekonomik gelişimi açısından bölge ihtiyaç ve önceliklerine uygunluğunu belirten Stratejik Plan Raporu’nun teslim edilmesi.', durum: YM }],
    kural: 'all',
    kuralText: 'Stratejik Plan Raporu’nun proje içeriğinin bölge ihtiyaç ve önceliklerine uygunluğunu belirtmesi durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Stratejik Plan Raporu’nun değerlendirilmesi ile projenin bölgenin sosyal ve ekonomik gelişimi açısından uygunluğunun tespiti öngörülmektedir.',
    belgeler: 'Stratejik Plan Raporu'
  },
  'SES 01 K2': {
    amac: 'Bu kriter ile sağlanan tüm hizmetlerin kullanıcıların tamamına eşit olarak hizmet etmesi ve bu hizmetlerin kullanıcıların tamamı tarafından erişilebilir ve kullanılabilir olması; yaşlı, hareket kabiliyeti kısıtlı ve engelli vatandaşların sunulan hizmetlerden faydalanması amaçlanmaktadır.',
    kanit: 'Stratejik plan raporu ekle',
    not: 'Erişilebilirlik, UHA 01 K4 için hazırlanan belgeler (Ulaşım Ana Planı ve Raporu) ve bu belgelerde belirtilen standartlara göre, kamu hizmeti sunulan kullanımlara özgü olarak değerlendirilir. Yerine getirilen standart seviyelerini işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 0, text: 'Proje alanında yaş, fiziksel engel gibi faktörlerden bağımsız olarak sağlanan tüm hizmetlerin erişilebilir olduğunun belirtildiği Stratejik Plan Raporu’nun teslim edilmesi.', durum: YM },
      { no: 2, cr: { Y: 5, M: 10 }, text: 'Temel seviyedeki standartların yerine getirilmesi (yeni 5, mevcut 10 kredi).', durum: YM },
      { no: 3, cr: { Y: 3, M: 6 }, text: 'Tavsiye edilen standartların yerine getirilmesi (yeni 3, mevcut 6 kredi).', durum: YM },
      { no: 4, cr: { Y: 2, M: 4 }, text: 'Yerine getirilmesi ideal olan standartların yerine getirilmesi (yeni 2, mevcut 4 kredi).', durum: YM }
    ],
    kural: 'sum', must: [1],
    kuralText: 'Rapor teslim edildiğinde, yerine getirilen standart seviyelerine göre krediler toplanır.',
    yontem: 'Yukarıda belirtilen hususların yerine getirilmesi durumunda kredi alınabilmektedir.',
    belgeler: 'Stratejik Plan Raporu',
    kaynaklar: [
      'İmar Kanunu', 'Belediye Kanunu', 'Büyükşehir Belediyesi Kanunu', 'İl Özel İdaresi Kanunu', 'Kamu Hizmetlerinin Sunumunda Uyulacak Usul ve Esaslara İlişkin Yönetmelik',
      'Bisiklet Yolları Yönetmeliği', 'Yaya Yolları ve Kaldırımların Tasarım Kuralları Hakkında Yönetmelik',
      'TS 9111 Özürlüler ve Hareket Kısıtlılığı Bulunan Bireyler İçin Binalarda Ulaşılabilirlik Gerekleri', 'TS 12576 Kaldırım ve Yaya Geçitlerinde Ulaşılabilirlik İçin Yapısal Önlemler ve İşaretlemelerin Tasarım Kuralları',
      'TS 12460 Raylı Taşıma Sistemleri Bölüm 5: Özürlü ve Yaşlılar İçin Tesislerde Tasarım Kuralları', 'TS ISO 23599 Görme Özürlü veya Az Görenler İçin Yardımcı Mamuller - Hissedilebilir Yürüme Yüzeyi İşaretleri',
      'TS 13536 TS ISO 23599’un Uygulanmasına Yönelik Tamamlayıcı Standard', 'ISO 23600 Görme ve İşitme Özürlüler İçin Yardımcı Mamuller - Yaya Trafik Işıkları - Sesli İkazlar ve Hissedilebilir Yüzeyler',
      'TS 13622 Engelliler ve Hareket Kısıtlılığı Bulunan Kişiler İçin Toplu Taşıma Sistemlerinde Erişilebilirlik Gerekleri', '“Erişilebilirlik Kılavuzu” (https://www.aile.gov.tr/media/65613/erisilebilirlik_kilavuzu_2021.pdf)'
    ]
  },
  'SES 01 K3': {
    amac: 'Bu kriter ile proje alanında mesleki eğitim ve becerilerde artış sağlanması için yapılacak girişimler ile mikro ve makroekonomik anlamda önemli katkılar elde edilmesi amaçlanmaktadır.',
    kanit: 'Stratejik plan raporu ekle',
    not: 'Demografik ve ekonomik yapı analizi, gösterge ve belgeleri içeren Stratejik Plan Raporu’na göre sağlanan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: { Y: 3, M: 1 }, text: 'İşgücü piyasasının ihtiyaçlarının karşılanmasına yönelik artış sağlanması, işsizliğin azaltılması (yeni 3, mevcut 1 kredi).', durum: YM },
      { no: 2, cr: { Y: 3, M: 1 }, text: 'Daha ucuz ve kaliteli mal ve hizmet üretilmesine imkan sağlanması (yeni 3, mevcut 1 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Sağlanan her madde için belirtilen krediler alınır.',
    yontem: 'Proje alanında her bir maddeye uygunluk durumuna göre kredilendirme yapılır.',
    belgeler: 'Stratejik Plan Raporu'
  },
  'SES 01 K4': {
    amac: 'Bu kriter ile toplumsal kalkınma suretiyle proje alanındaki sürecin değişen toplumsal ve ekonomik koşullara adapte edilebilmesi ve projenin vizyon ve misyonunun sürdürülebilirliğinin sağlanması amaçlanmaktadır.',
    kanit: 'Stratejik plan raporu ve sosyal etki analizi ekle',
    not: 'Kalkınma hedeflerini ve yerel halkın katılımına yönelik adımları ortaya koyan Stratejik Plan Raporu ile projenin kalkınma planına uygunluğunu tespit eden Sosyal Etki Analizi’ne göre sağlanan göstergeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 2, text: 'Yerel halkın yaşam kalitesinin artırılması (2 kredi).', durum: YM },
      { no: 2, cr: { Y: 3, M: 2 }, text: 'Toplumsal katılımın sağlanması (yeni 3, mevcut 2 kredi).', durum: YM },
      { no: 3, cr: 1, text: 'Kalkınmada eşitlik ve adillik sağlanması (1 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Sağlanan her gösterge için belirtilen krediler alınır.',
    yontem: 'Stratejik plan raporu, bölge ile ilgili merkezi ve yerel yönetimlerin ortaya koyduğu hedef ve amaçları içeren vizyon ve misyon kararlarını içermeli; sosyal etki analizi, bölge için belirlenen kalkınma hedefleri çerçevesinde iktisadi ve sosyal hedeflere ulaşmak için yol gösterici nitelik taşımalıdır.',
    belgeler: ['• Stratejik Plan Raporu,', '• Sosyal Etki Analizi.']
  },
  'SES 01 K5': {
    amac: 'Bu kriter ile ekonomik olduğu kadar sosyal açıdan da kritik önem taşıyan istihdamın artırılarak yeşil yerleşmelerin sürdürülebilirliğinin sağlanması amaçlanmaktadır.',
    kanit: 'Stratejik plan raporu ve sosyal etki analizi ekle',
    not: 'Stratejik Plan Raporu ve Sosyal Etki Analizi’ne göre sağlanan göstergeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 3, text: 'Bilgi teknolojilerine yönelik istihdam alanlarının yaratılması (3 kredi).', durum: YM },
      { no: 2, cr: 3, text: 'Yerel küçük ve orta boy işletmelere yönelik istihdam alanlarının yaratılması (3 kredi).', durum: YM },
      { no: 3, cr: 2, text: 'Yerel girişimciliğin desteklenmesi (2 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Sağlanan her gösterge için belirtilen krediler alınır.',
    yontem: 'Stratejik plan raporu ile proje alanına dair kalkınma hedefleri ortaya konularak istihdamın artırılmasına yönelik adımlar açıklanır; sosyal etki analiziyle projenin kalkınma planına uygunluğu tespit edilir.',
    belgeler: ['• Stratejik Plan Raporu,', '• Sosyal Etki Analizi.']
  },
  'SES 01 K6': {
    amac: 'Bu kriter ile projenin varlığını sürdürebilmesi ve gelişebilmesi için bölgeye prestij kazandırılarak yatırımın kârlılık durumunun artması amaçlanmaktadır.',
    kanit: 'Gayrimenkul piyasası raporu ekle',
    gerek: [
      { no: 1, text: 'Proje alanı ve yakın çevresi için bina değerlerini, artışları ve gelecek beklentilerini; önerilen ana fonksiyonla ilgili sektör bilgilerini, büyüme hızı ve GSMH öngörülerini, enflasyon oranlarını, konut kredisi faiz ve kullandırma oranlarını, satış oranlarını ve ilgili istatistiki verileri içeren Gayrimenkul Piyasası Raporu’nun teslim edilmesi.', durum: YM },
      { no: 2, text: 'Bina (konut, ofis, işyeri vb.) değerlerindeki artışın Tüketici Fiyat Endeksi’nden (TÜFE) fazla olması.', durum: YM }
    ],
    kural: 'all',
    kuralText: 'Bina değerlerindeki artışın TÜFE’den fazla olması durumunda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    yontem: 'Bina (konut, ofis, işyeri vb.) değerlerindeki artışın Tüketici Fiyat Endeksi’nden (TÜFE) fazla olması durumunda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    belgeler: 'Gayrimenkul Piyasası Raporu'
  },
  'SES 01 K7': {
    amac: 'Bu kriter ile geliştirilen projeyle bir bölgede arazi değerlerinde artış sağlanması amaçlanmaktadır.',
    kanit: 'Gayrimenkul piyasası raporu ekle',
    gerek: [
      { no: 1, text: 'Proje alanı ve yakın çevresi için arazi değerlerini, artışları ve gelecek beklentilerini ve ilgili sektör ve ekonomik verileri içeren Gayrimenkul Piyasası Raporu’nun teslim edilmesi.', durum: YM },
      { no: 2, text: 'Gelir İdaresi Başkanlığı’nın açıkladığı “Arsa ve Arazi Metrekare Değerleri”ndeki artışın Yeniden Değerleme Oranı’ndan (YDO) fazla olması.', durum: YM }
    ],
    kural: 'all',
    kuralText: 'Arsa ve arazi metrekare değerlerindeki artışın YDO’dan fazla olması durumunda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    yontem: 'Gelir İdaresi Başkanlığı tarafından açıklanan “Arsa ve Arazi Metrekare Değerleri”nde artışın Yeniden Değerleme Oranı’ndan (YDO) fazla olması durumunda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    belgeler: 'Gayrimenkul Piyasası Raporu'
  },
  'SES 01 K8': {
    amac: 'Bu kriter ile teşvik programları ve kalkınma planlarında öngörülen hedeflere uygun olarak; proje alanında katma değeri yüksek yatırımların öne çıkartılması, üretimin ve istihdamın artırılması, bölgesel rekabet gücünü artıracak, araştırma-geliştirme içeriği yüksek ve stratejik yatırımların özendirilmesi ve yerel gelişmişlik farklılıklarının azaltılması amaçlanmaktadır.',
    kanit: 'Teşvik başvuru / kabul tutanağı ekle',
    gerek: [
      { no: 1, cr: 2, text: 'Teşvik programına başvuru yapılmış olması (2 kredi).', durum: YM },
      { no: 2, cr: { Y: 4, M: 3 }, text: 'Teşvik programından yararlanılmış olması (yeni 4, mevcut 3 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Sağlanan her gösterge için belirtilen krediler alınır.',
    yontem: 'Yerleşmeye konu alan kapsamında geliştirilen proje için her bir göstergeye göre kredilendirme yapılır.',
    belgeler: 'Teşvik programına başvuru ve/veya kabul tutanağı'
  },

  // ---- SES 02 Sosyo-Kültürel Kalite
  'SES 02 K1': {
    amac: 'Bu kriter ile proje alanında veya yakın çevresinde sağlıklı yaşamın desteklenmesine yönelik açık ve kapalı spor alanlarının yer alması amaçlanmaktadır.',
    kanit: 'Spor alanları vaziyet planı / haritası ekle',
    not: 'Açık ve kapalı spor alanlarını mesafeleriyle gösteren vaziyet planı veya harita ile kanıtlanan maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: 3, text: 'Proje alanı sınırları içinde açık spor tesislerinin oluşturulması (3 kredi).', durum: YM },
      { no: 2, cr: 2, text: 'Proje alanına en fazla 1 km uzaklıkta açık spor tesislerinin oluşturulması (2 kredi).', durum: YM },
      { no: 3, cr: 3, text: 'Proje alanı sınırları içinde kapalı spor tesislerinin oluşturulması (3 kredi).', durum: YM },
      { no: 4, cr: 2, text: 'Proje alanına en fazla 1 km uzaklıkta kapalı spor tesislerinin oluşturulması (2 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Spor tesislerinin proje alanı sınırları içinde veya dışında oluşturulmasına göre krediler toplanır.',
    yontem: 'Spor tesislerinin proje alanı sınırları içinde veya dışında oluşturulmasına göre kredilendirme yapılır.',
    belgeler: 'Açık ve kapalı spor alanlarını mesafeleri ile gösteren vaziyet planı, harita vb. belgeler',
    kaynaklar: ['Mekânsal Planlar Yapım Yönetmeliği']
  },
  'SES 02 K2': {
    amac: 'Bu kriter ile sağlıklı ve temiz yerleşme alanları oluşturmak amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    not: 'Belgelendirilen maddeleri işaretleyin; krediler toplanır.',
    gerek: [
      { no: 1, cr: { Y: 16, M: 12 }, text: 'Açık alanda yapılan spor, kültür, sanat ve eğlence faaliyetlerinin yapıldığı yerler ile seyir yerlerinde tütün ürünlerinin kullanımının engellenmesi; tütün ürünleri için ayrılan alanların bina giriş çıkışlarından ve bina çevresinden en az 10 metre mesafede olması (yeni 16, mevcut 12 kredi).', durum: YM },
      { no: 2, cr: 4, text: 'Yaşlı dostu hizmet sunumlarının gerçekleştirilmiş olması (4 kredi).', durum: YM }
    ],
    kural: 'sum',
    kuralText: 'Sağlanan her madde için belirtilen krediler alınır.',
    yontem: 'Dumansız hava sahasının oluşturulması, hareketi ve yürümeyi teşvik edecek ortamların sağlanması ve yaşlılara yönelik hizmetlerin sunulması belgelendirilmelidir; her bir kritere göre puanlama yapılır.',
    belgeler: 'Dumansız hava sahası, aktif yaşam ortamları ve yaşlı dostu hizmetlere ilişkin belgeler',
    kaynaklar: ['TS 12576 Şehir içi Yollar - Özürlü ve Yaşlılar İçin Sokak, Cadde, Meydan ve Yapısal Önlemler ve İşaretlemelerin Tasarım Kuralları']
  },
  'SES 02 K3': {
    amac: 'Bu kriter ile; gönüllü yerel bahçecilerin kullanımına açılan alanlarda meyve, sebze, çiçek gibi tarımsal ürünlerin yetiştirilmesi amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Sebze, meyve gibi tarımsal ürün ihtiyacının bir bölümünü karşılamak üzere kullanıcılar tarafından tarımsal üretim alanlarının (hobi bahçesi vb.) oluşturulması ve belgelendirilmesi.', durum: YM }],
    kural: 'all',
    kuralText: 'Tarımsal üretim alanlarının oluşturulması durumunda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    yontem: 'Sebze, meyve gibi tarımsal üretim alanlarının (hobi bahçesi vb.) oluşturulması durumunda yeni ve mevcut yerleşmelerde tam kredi alınır.',
    belgeler: 'Tarımsal üretim alanlarının oluşturulduğunu gösteren belgeler'
  },

  // ==== İNO İnovasyon_Yerleşme
  'İNO 01 K1': {
    amac: 'Bu kriter ile; mevcut sertifika gereklilikleri içinde bulunmayan ancak yeşil yerleşme belgelendirmesinde inovatif değeri olan uygulamaların sağlanmış olması amaçlanmaktadır.',
    kanit: 'Yerleşme kategorik inovasyon raporu ekle',
    gerek: [
      { no: 1, text: 'BOL, AKE, UHA, KET ve SES modüllerindeki inovatif çözümlerin ispatının ya da bu modüller için hazırlanan çalışmaların açık veriye dayalı, bulut altyapısı üzerinden, GIS ve GPS’e dayalı ‘büyük veri’ altyapısıyla sürdürülebilirlik, dirençlilik ve sosyal değer konularına katkı sağlayan ürün, hizmet, uygulama, pazarlama ya da iş modeli olarak ele alındığının belirtildiği Yerleşme Kategorik İnovasyon Raporu’nun hazırlanması.', durum: YM },
      { no: 2, text: 'Kategoride tanımlanmamış, kategoride beklenen kanıt belge standardının üzerinde bir yaklaşımın ispatı.', durum: YM },
      { no: 3, text: 'Diğer yerleşme modüllerindeki envanterleme çalışmalarının (AKE 01 K2, KET 01 K3, KET 06 K6 gibi) büyük veri altyapısının oluşturulması.', durum: YM }
    ],
    kural: 'min', must: [1], pick: { of: [2, 3], min: 1 },
    kuralText: 'Uygulama örneklerinden en az birinin gerçekleştiriliyor olması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'İnovasyon_Yerleşme modülünde yer alan kriterin ‘İnovasyon Raporu’ ile sunulması ve kriterin gerekliliklerini nasıl sağladığına ilişkin detaylı açıklamaları içermesi beklenmektedir. Bu kategoriden puan alınması BOL, AKE, UHA, KET ve SES modüllerindeki inovatif çözümlerin ispatı ile mümkündür; ispat için sunulan çözümün kategoride tanımlanmamış olması gerekmektedir.',
    belgeler: 'Yerleşme Kategorik İnovasyon Raporu'
  },
  'İNO 01 K2': {
    amac: 'Bu kriter ile geliştirilecek yenilikçi uygulamalar ile yerleşme kullanıcılarının ‘yaşam kalitesi’ni artırıcı iyileştirmeler sağlanması ve sunulan çözümlerin paydaşlar tarafından kullanılabilir olması amaçlanmaktadır.',
    kanit: 'Yaşam kalitesi raporu ekle',
    gerek: [
      { no: 1, text: 'Yaşam kalitesini arttırmayı hedefleyen, çevresel, sağlık ve sosyal faktörler yönünden avantajlar sağlayan uygulamaları içeren; kullanılan bilişim teknolojilerinin yerel veya merkezi yönetim sistemlerine entegrasyonunu ve uygulamaların paydaşlar tarafından kullanılabilir olduğunu belirten Yaşam Kalitesi Raporu’nun hazırlanması.', durum: YM },
      { no: 2, text: 'Trafik ve ulaşım etkinliğini ve ulaşım deneyiminin kalitesini arttırmak için dinamik ve çok-modlu bilgi sistemleri kullanılması, seyahat öncesi ve seyahat esnasında eş zamanlı bilgi aktarımı ve paydaşlarca kullanılabilir olması.', durum: YM },
      { no: 3, text: 'Temizlik, bakım, güvenlik gibi ana yönetim konularında merkezi bilişim sistemleri ile entegrasyonun sağlanması ve paydaşlarca kullanılabilir olması.', durum: YM },
      { no: 4, text: 'BOL 02 K2, KET 01 K1 gibi kriterler için hazırlanan katılım ve iletişim çalışmalarının ileri veri analitiği için uygun hale getirilmesi ve büyük veritabanı altyapısının kurulmuş olması.', durum: YM }
    ],
    kural: 'min', must: [1], pick: { of: [2, 3, 4], min: 1 },
    kuralText: 'Uygulama örneklerinden en az birinin gerçekleştiriliyor olması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Rapor hazırlanır; uygulama örneklerinden en az birinin gerçekleştiriliyor olması durumunda tam kredi alınır.',
    belgeler: 'Yaşam Kalitesi Raporu'
  },
  'İNO 02 K1': {
    amac: 'Bu kriter ile; enerji ve su tüketiminde bilgi teknolojilerine dayalı izleme, ölçme ve değerlendirme çözümlerinin bulunması ve sonuçların paydaşlar tarafından izleniyor olması amaçlanmaktadır.',
    kanit: 'Sürekli izleme ve değerlendirme sistem raporu ekle',
    gerek: [
      { no: 1, text: 'Yerleşim alanlarının ulaşım sistemlerinde, enerji şebekelerinde ve tüketici cihazlarında büyük hacimli veri toplama, depolama, yönetim, analiz ve görselleştirme teknolojilerinin kullanıldığını gösteren Sürekli İzleme ve Değerlendirme Sistem Raporu’nun hazırlanması.', durum: YM },
      { no: 2, text: 'Ulaşım sistemleri, enerji şebekeleri ve tüketici cihazlarındaki çok sayıda sensörden veri elde edilerek ulaşım akışı, enerji akışı, kirlilik ve insan davranışları konusunda gerçek zamanlı görünüm elde edilmesi ve bilinçli tüketici profilinin oluşturulması.', durum: YM },
      { no: 3, text: 'Akıllı telefon uygulamaları, giyilebilir teknolojiler, sensörler ve internet üzerinden eş zamanlı karşılaştırılabilir veri üretimi ve kent enformasyon modellemesi çalışmalarının yapılmış olması.', durum: YM },
      { no: 4, text: 'Enerji ve su tüketimi, yenilenebilir enerji kullanımı, atık yönetimi, sürdürülebilir tarım gibi uygulamaların uzaktan algılama sistemleri ile senkronizasyonunun yapılmış olması.', durum: YM }
    ],
    kural: 'min', must: [1], pick: { of: [2, 3, 4], min: 1 },
    kuralText: 'Uygulama örneklerinden en az birinin gerçekleştiriliyor olması durumunda yeni ve mevcut yerleşmeler için tam kredi alınır.',
    yontem: 'Rapor hazırlanır; uygulama örneklerinden en az birinin gerçekleştiriliyor olması durumunda tam kredi alınır.',
    belgeler: 'Sürekli İzleme ve Değerlendirme Sistem Raporu'
  }
};
