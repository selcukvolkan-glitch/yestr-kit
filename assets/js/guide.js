// Kılavuz içerikleri (YeS-TR Bina Değerlendirme Kılavuzu, kriter sayfalarından).
// Bir kriter burada tanımlıysa:
//  - sitede gereklilikler işaretlenebilir liste olarak gösterilir, kredi elle girilmez;
//  - kredi kuralı 'all': projenin durumuna (Y = yeni, M = mevcut) uyan gerekliliklerin tamamı
//    sağlanınca tam kredi, aksi halde 0;
//  - kural 'each': her sağlanan gereklilik için `each` kredi, uyan gerekliliklerin tamamı sağlanınca tam kredi;
//  - kural 'any': uyan gerekliliklerden herhangi biri sağlanınca tam kredi;
//  - kural 'levels': kademeli; levels: [{ req: [gereklilik no], cr: kredi }], tamamı sağlanınca tam kredi;
//  - kural 'min': must'taki gereklilikler + pick.of içinden en az pick.min tanesi sağlanınca tam kredi
//    (projeye uymayan gereklilik numaraları must / pick listelerinden düşülür);
//  - kural 'tiers': must'taki gereklilikler + tiers kademelerinden işaretli en yüksek kredili olan;
//    tiers: [{ no, cr: { Y: [7 bina tipi], M: [...] }, ayri? }]; zorunlu kriterde şart, must + bir kademe ile sağlanır;
//    sitede üst kademe işaretlenince alt kademeler de işaretlenir (ayri: true = zincir dışı alternatif);
//  - kural 'hesap': uyan gereklilikler işaretli ve girilen değerlerden hesap(v, p) ile kredi;
//    girdi: [{ k, l, t: 'num' | 'sel', opts?: [[değer, etiket]], durum?, birim?, ipucu? }] (değerler p.gv[id]);
//  - gereklilikte tip: [bina tipi indeksleri] (TIPS sırası) = yalnızca bu tiplerde gösterilir;
//  - zorunlu (isMandatory) kriterlerde zorunlu şart her kuralda guideMet ile belirlenir (engine.js zMet);
//  - gereklilikte head: true = işaretlenmeyen başlık (alt maddeleri sub: true ile altında listelenir);
//  - not: gereklilik listesinin üstünde gösterilen ön koşul / açıklama;
//  - kanit: kanıt yükleme butonunun yazısı (varsayılan "Kanıt dosyası ekle");
//  - detay: gerekliliklere ait açıklama (yalnızca raporda, gereklilik listesinin altında);
//  - amac, yontem, belgeler: metin ya da metin dizisi ('• ' ile başlayan öğeler raporda madde olarak);
//  - kural 'mandatory': zorunlu kriter; uyan gereklilikler işaretlenince zorunlu şart sağlanmış sayılır (S.z);
//  - kaynaklar: kaynak / standart listesi (raporda);
//  - durumuna uyan gerekliliği olmayan projelerde kriter "uygulanmaz" olarak gösterilir;
//  - tanimlar: [terim, açıklama] çiftleri (Kılavuz bölümünde ve raporda);
//  - raporda kriter kartına amaç, gereklilikler (sağlandı / sağlanmadı / uygulanmaz),
//    kredi kuralı, yöntem ve teslim edilecek belgeler yazılır.

// Tüm bina tiplerinde aynı kademe kredisi: { Y: [y × 7], M: [m × 7] }
const cr7 = (y, m) => ({ Y: Array(7).fill(y), M: Array(7).fill(m) });

// ---- EKV hesap tabloları (kılavuz Tablo 2.4.7, 2.4.8, 2.4.10–2.4.13)
const EKV_EPI_YENI = [[14, 15], [21, 20], [26, 25], [31, 30], [36, 40], [41, 50], [46, 60], [51, 65], [61, 70], [81, 75]];
const EKV_EPI_MEVCUT = {
  A: [[0, 60], [1, 70], [20, 75]],
  B: [[0, 30], [1, 45], [11, 55], [21, 70], [50, 75]],
  C: [[14, 15], [21, 25], [31, 35], [41, 50], [51, 65], [61, 75]]
};
const EKV_NSEB_UST = { A: 39, B: 79, C: 99 }; // enerji sınıfı oran üst sınırları (Tablo 2.4.3)
// Seçenek-1: [YEKo alt sınırı, kredi, saha dışı satın alma ilave kredisi]
const EKV_YEKO = {
  Y: [[3, 4, 7], [10, 6, 6], [15, 8, 5], [20, 10, 3], [25, 12, 2], [30, 14, 2], [35, 16, 1], [40, 18, 0]],
  M: [[3, 4, 5], [5, 6, 4], [10, 8, 3], [15, 10, 3], [20, 12, 2], [25, 14, 2], [30, 16, 1], [35, 18, 0]]
};
const EVET_HAYIR = [['', 'Seçiniz'], ['H', 'Hayır'], ['E', 'Evet']];
// EKV 02 K2 (iki seçenek) ortak kaynakları ve tanımları
function EKV_YE_KAYNAK() {
  return [
    'Enerji Verimliliği Kanunu',
    'Yenilenebilir Enerji Kaynaklarının Elektrik Enerjisi Üretimi Amaçlı Kullanımına İlişkin Kanun',
    'Elektrik Piyasası Kanunu',
    'Binalarda Enerji Performansı Yönetmeliği',
    'Elektrik Piyasasında Lisanssız Elektrik Üretim Yönetmeliği',
    'Güneş Enerjisine Dayalı Elektrik Üretim Tesisleri Hakkında Yönetmelik',
    'Yenilenebilir Enerji Kaynak Belgesi Verilmesine İlişkin Usul ve Esaslar Hakkında Yönetmelik',
    'Binalarda Enerji Performansı Ulusal Hesaplama Yöntemine Dair Tebliğ'
  ];
}
function EKV_YE_TANIM() {
  return [
    ['BEP-TR', 'Enerji Kimlik Belgelerinin düzenlenmesi için kullanılan ve Bakanlık internet adresinden erişim sağlanan yazılım programıdır.'],
    ['Birincil Enerji Tüketimi', 'Son kullanıcı tarafından binasında veya bağımsız bölümünde katı, sıvı veya gaz yakıtlardan elde edilen enerji ile tüketilen elektrik enerjisinin üretilmesi ve dağıtılması safhalarında tüketilen enerjilerle birlikte toplam tüketimidir.'],
    ['Nihai Enerji Tüketimi', 'Bina için tasarlanan sistemlerin gerçek verim değerleri, kapasiteleri ve kontrol stratejileri ile şebekeden çekeceği enerji miktarıdır.'],
    ['Ön Hesap Sonuç Formu', 'Binalarda Enerji Performansı Yönetmeliği Ek-10’unda belirtilen şekilde ve kapsamında, binaların mimari, mekanik ve aydınlatma projelerinin uygunluğunu gösteren belgedir.'],
    ['Toplam Yenilenebilir Enerji Miktarı', 'Hem saha içinde hem de saha dışında sertifika alınacak bina için üretilen yenilenebilir enerji miktarlarının toplamıdır.'],
    ['Toplam Enerji İhtiyacı', 'Binanın ısıtma, sıhhi sıcak su, soğutma, elektrik ve aydınlatma sistemleri için birincil enerji cinsinden ortama bir yıl içerisinde verilmesi gereken enerji miktarıdır. Yenilenebilir katkısı dahil edilmez.'],
    ['Yenilenebilir Enerji', 'Hidrolik, rüzgar, güneş, jeotermal, biyokütle, biyogaz, dalga, akıntı ve gel-git gibi fosil olmayan enerji kaynaklarından elde edilebilen enerjidir.']
  ];
}
const pct = x => '%' + fmtN(x);

// ---- SAY hesap yardımcıları
// Bina tipi grubu: 0 konut · 1 ofis, otel, AVM, diğer · 2 eğitim ve sağlık
const sayGrp = p => +p.tip === 0 ? 0 : (+p.tip === 2 || +p.tip === 4) ? 2 : 1;
const SAY_GRP_AD = ['Konut', 'Ofis, otel, AVM ve diğer', 'Eğitim ve sağlık'];
// Tek oran girdisinden kredi: bands(p) = [[alt sınır, kredi], ...] (ilk aralık dahil, sınır değer üst aralığa)
const sayOran = (k, ad, bands) => (v, p) => {
  const x = gnum(v[k]);
  if (isNaN(x)) return { cr: 0, text: `${ad} değerini girin.` };
  const cr = bandCredit(x, bands(p), true);
  return { cr, text: `${ad} = ${pct(x)} → ${cr} kredi` };
};

// ---- İOK 02 İşitsel Konfor ortak parçaları
const IOK_AKUSTIK_BELGE = { no: 1, text: 'Kriterin sağlandığının; bina akustiği uzmanı tarafından ölçümlere dayanarak hazırlanan ve akustik proje ekinde yer alan ‘Akustik Performans Belgesi’ ile ya da binanın yeşil sertifikaya esas son hali için bina akustiği uzmanı tarafından hazırlanan akustik proje veya akustik rapor ile kanıtlanması.', durum: ['Y', 'M'] };
const IOK_AKUSTIK_BELGELER = [
  '• Bina akustiği uzmanı tarafından hazırlanan akustik proje,',
  '• Akustik Rapor,',
  '• Akustik Performans Belgesi.',
  'Yukarıdaki belgelerden Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik gereği uygun olan belgenin varlığı kontrol edilmelidir.'
];
const IOK_HAVA_YALITIM_KAYNAK = [
  'Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik',
  'TS EN ISO 16283-1 Akustik - Yapıların ve Yapı Elemanlarının Ses Yalıtımı İçin Sahada Yapılacak Ölçümler - Bölüm 1: Hava İle Yayılan Sesin Yalıtımı',
  'TS EN ISO 16283-3 Akustik - Yapı Elemanlarında ve Yapılarda Ses Yalıtımının Alan Ölçümü - Bölüm 3: Ön Cephedeki Sesin Yalıtımı',
  'TS EN ISO 717-1 Akustik - Yapılarda ve Yapı Elemanlarında Ses Yalıtımının Derecelendirilmesi - Bölüm 1: Hava İle Yayılan Sesin Yalıtımı',
  'TS EN ISO 10140-1 Akustik - Yapı elemanlarında ses yalıtımının laboratuvar ölçümü - Bölüm 1: Özel mamuller için uygulama kuralları',
  'TS EN ISO 10140-2 Akustik - Yapı Elemanlarının Ses Yalıtımının Laboratuvarda Ölçülmesi - Bölüm 2: Hava İle Yayılan Ses Yalıtımının Ölçülmesi',
  'TS EN ISO 12354-1 Bina akustiği - Binaların akustik performansının elemanların performansından tayini - Bölüm 1: Odalar arasında hava ile yayılan sesin yalıtımı',
  'TS EN ISO 12354-3 Bina akustiği - Yapıların akustik performansının elemanların performanslarından hesaplanması - Bölüm 3: Hava ile yayılan dışarıdaki sesin yalıtımı',
  'TS EN ISO 12354-4 Binaların akustiği - Yapıların akustik performansının elemanların performanslarından hesaplanması - Bölüm 4: İçerideki sesin dışarıya iletimi',
  'TS EN ISO 12999-1 Akustik - Yapı Akustiği Ölçüm Belirsizliklerinin Tayini ve Uygulanması - Bölüm 1: Ses Yalıtımı'
];
// İç bölme duvar / döşeme hava doğuşlu ses yalıtımı yöntemi (İOK 02 K5, K6)
const iokYalitimYontem = el => [
  `${el} ve bileşenlerinin akredite laboratuvarda ölçülmüş ses azaltım indeksi R değerleri spektral veya ağırlıklı düzeyler Rw (C; Ctr) olarak bir veri tabanında beyan edilmiş ise bu değerler kullanılabilir. Ses yalıtım değerlerinin laboratuvarda ölçülmesi TS EN ISO 10140-2 standardına göre yapılacaktır.`,
  'Ölçüm sonuçları ya da bir veri tabanı bulunmuyor ise; ses azaltım indeksi R spektral veya ağırlıklı düzeyler Rw (C; Ctr) olarak, sesin doğrudan iletimi için kabul görmüş bilimsel yöntemler veya bu yöntemlere dayalı yazılımlar kullanılarak hesaplanabilir. Ses yalıtım performansları, yapı elemanlarının birleşim bölgelerinin özelliklerine bağlı olarak sesin yanal yollarla iletimini de hesaba katarak bina içinde ses yayılımını modelleyen TS EN 12354-1, 2, 3 ve 4 standartlarının ilgili bölümlerine uygun olarak hesaplanır.',
  'Alanda veya laboratuvarda spektral olarak ölçülen ses azaltım (yalıtım) indeksi R değerlerinin ağırlıklı düzeyler Rw (C; Ctr) olarak derecelendirilmesinde TS EN ISO 717-1 standardı kullanılacaktır.',
  'Uygulanacak ses yalıtımlı yapı elemanları akustik projede liste halinde detayları ve hesaplanan akustik performans değerleri ile birlikte verilir. Uygulama ilkeleri akustik raporda açıklanır.',
  'Laboratuvar ölçümleri veya hesaplarla belirlenen Rw (C; Ctr) performans değerlerinin DnT,A veya DnT,50 değerlerine dönüştürülmesi için genel kabul görmüş yöntemler kullanılabilir. İyileştirme değerlerini sağlayacak ek katmanlar TS EN 12354-1 ve 3’e göre yapılacak hesaplamalar ile malzeme ve konstrüksiyon olarak belirlenecektir.',
  '• Hesaplama ve tasarımlar hedeflenen akustik performans sınıfı değerlerinin olumlu yönde 2 dB üstüne göre yapılmalıdır.',
  '• Akustik proje ve mimari proje kapsamında akustik birleşim detayları çizilecektir.',
  '• Mevcut ve yeni bina değerlendirmelerinde alanda yapılacak ses yalıtım testleri ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ile TS EN ISO 16283-1 ve 3 standartlarına uygun olarak yapılacaktır.',
  '• Ölçümlerde ISO 12999-1’e uygun olarak belirsizlik değerleri verilecektir.'
];
// Akustik performans sınıfı kriteri: ust = yeni binada A/B, mevcutta en az C istenen bina tipleri;
// diğer tiplerde yeni binada en az C, mevcutta en az D. Gereklilik (2) tipe ve duruma göre tek satır görünür.
function iokAkustik(o) {
  const alt = [0, 1, 2, 3, 4, 5, 6].filter(t => !o.ust.includes(t));
  const s = (sinif, durum, tip) => ({ no: 2, text: `${o.sinif} ${sinif} sağlandığının belgelendirilmesi.`, durum: [durum], tip });
  return {
    amac: o.amac, kanit: 'Akustik proje / rapor ekle',
    gerek: [IOK_AKUSTIK_BELGE, s('A veya B sınıfının', 'Y', o.ust), s('en az C sınıfının', 'M', o.ust), s('en az C sınıfının', 'Y', alt), s('en az D sınıfının', 'M', alt)],
    detay: o.detay, kural: 'all',
    kuralText: `${o.ustAd} yeni binalar için A veya B sınıfı, mevcut binalar için en az C sınıfı; ${o.altAd} yeni binalar için en az C sınıfı, mevcut binalar için en az D sınıfı sağlandığının belgelendirilmesi şartıyla tam kredi alınır.`,
    yontem: o.yontem, belgeler: IOK_AKUSTIK_BELGELER, kaynaklar: o.kaynaklar
  };
}

const CRIT_GUIDE = {
  'BBT 01 K2': {
    amac: 'Bu kriter ile, projenin performans hedeflerini belirlemek üzere Yeşil Sertifika Uzmanı’nın tasarım ve ruhsata tabi tadilat sürecine dahil olarak proje aşamasından başlayıp sertifika alımına kadar katkı sağlaması amaçlanmaktadır.',
    gerek: [
      { no: 1, text: 'Yeşil Sertifika Uzmanı’nı projenin tasarım aşamasına başlanmadan sürece dahil etmek.', durum: ['Y'] },
      { no: 2, text: 'Mevcut binalarda ruhsata tabi tadilat aşamasında da Yeşil Sertifika Uzmanı’nı sürece dahil etmek.', durum: ['M'] },
      { no: 3, text: 'Yeşil Sertifika Uzmanı’nın görev ve sorumluluklarını belirlemek.', durum: ['Y', 'M'] }
    ],
    kural: 'all',
    kuralText: 'Yeni binalar için (1) ve (3) numaralı gereklilikler, mevcut binalar için ise (2) ve (3) numaralı gereklilikler yerine getirildiğinde tam kredi alınır.',
    yontem: 'Yeşil Sertifika Uzmanı Sözleşmesi/Çalışma Belgeleri (SGK kaydı, Ticari Sicil Gazetesi vb.)’nin varlığı kontrol edilmelidir.',
    belgeler: 'Yeşil Sertifika Uzmanı Sözleşmesi/Çalışma Belgeleri (Sözleşmede, Yeşil Sertifika Uzmanı’nın görev ve sorumlulukları mutlaka yer almalıdır.)'
  },
  'BBT 01 K3': {
    amac: 'Bu kriter, yeni binalarda proje hedefleri (bütçe, zaman) ile son kullanıcı gereksinimleri doğrultusunda proje kapsamını belirlemeyi amaçlamaktadır.',
    gerek: [
      { no: 1, text: 'Proje kapsamını ayrıntılı bir şekilde belirlemek.', durum: ['Y'] }
    ],
    kural: 'mandatory',
    kuralText: 'Mevcut binalar için kriter uygulanmaz (0 kredi).',
    yontem: '‘Proje İhtiyaç Programı’nın varlığı kontrol edilmelidir.',
    belgeler: 'Aşağıda listelenen belgeler kriterin değerlendirilmesi için sağlanmalıdır: Proje İhtiyaç Programı (Tablo 2.1.4).',
    tanimlar: [['Proje Kapsamı', 'Proje hedeflerini, ihtiyaçları, maliyetleri ve süreyi içeren proje planlamanın bir parçasıdır.']]
  },
  'BBT 01 K4': {
    amac: 'Bu kriter, binaya ait yer seçiminde; binanın toplu taşıma duraklarına ve kamu hizmet noktalarına yakın olmasını amaçlamaktadır.',
    gerek: [
      { no: 1, text: 'Bina ana girişinin toplu taşıma duraklarına olan mesafenin en fazla 500 metre olması veya toplu taşıma duraklarına kadar bisiklet yolunun olması.', durum: ['Y', 'M'] },
      { no: 2, text: 'Bina ana girişinin sağlık ve eğitim alanında kamusal hizmet veren tesislere olan mesafenin en fazla 3 km olması.', durum: ['Y', 'M'] }
    ],
    kural: 'each', each: 4,
    kuralText: 'Yukarıdaki her bir gereklilik için 4’er kredi alınır. Her iki gerekliliğin de yerine getirilmesi durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Harita, vaziyet planı, uydu görüntüsü vb.’den yararlanılır.',
    belgeler: 'İlgi tesislere olan mesafenin gösterildiği harita, vaziyet planı, uydu görüntüsü vb.',
    kaynaklar: ['Bisiklet Yolları Yönetmeliği', 'Bütünleşik Bina Tasarımı Yaklaşımı ile Proje Geliştirme Süreci Uygulama Kılavuzu, Mayıs 2016']
  },

  // ---- BBT 02 Bütünleşik Tasarım (kılavuz: bbt 02.docx)
  'BBT 02 K1': {
    amac: 'Bu kriter, yeni binalarda disiplinler arası paydaşların projenin ilk aşamalarından itibaren temel kararların alınmasında birlikte hareket etmesini sağlayarak; etkin karar alma sürecini hızlandırmayı amaçlamaktadır.',
    gerek: [
      { no: 1, text: 'Proje gereksinimlerine ve tipolojiye uygun şekilde disiplinler arası uzmanları proje ekibine dahil etmek.', durum: ['Y'] },
      { no: 2, text: 'Bütünleşik tasarım çalışmaları için bir araya gelerek düzenli toplantılar yapmak.', durum: ['Y'] }
    ],
    kural: 'mandatory',
    kuralText: 'Mevcut binalar için kriter uygulanmaz (0 kredi).',
    yontem: '‘Toplantı Tutanakları’nın varlığı kontrol edilmelidir.',
    belgeler: 'Toplantı Tutanakları (Tablo 2.1.6)'
  },
  'BBT 02 K2': {
    amac: 'Bu kriter, yeni binalarda bina tasarımı aşamasında, mevcut binalarda ise sistem tasarımı aşamasında enerji modelleme analizi yaparak uygulanabilir sistemler ile enerji performansını iyileştirecek uygulamaların yapılmasını amaçlamaktadır.',
    gerek: [
      { no: 1, text: 'Tasarımın öncesinde tasarıma esas olacak şekilde enerji modelleme analizi yapmak.', durum: ['Y', 'M'] },
      { no: 2, text: 'Olası enerji stratejilerini hazırlamak, değerlendirmek ve tasarımı enerji performansını iyileştirecek öneriler doğrultusunda revize etmek.', durum: ['Y', 'M'] }
    ],
    kural: 'levels', levels: [{ req: [1], cr: 2 }],
    kanit: 'Enerji analizi raporu ekle',
    kuralText: '(1) numaralı gereklilik yerine getirildiğinde yeni ve mevcut binalar için 2 kredi, (1) ve (2) numaralı gereklilikler yerine getirildiğinde ise tam kredi alınır.',
    yontem: 'Bina enerji modellemesi yapılır. Bu çalışma için dinamik modelleme ve simülasyon araçları kullanılır.',
    belgeler: 'Enerji Analizi Raporu (Enerji modelleme sonuçları, enerji stratejileri ve bunlar dikkate alınarak; bina enerji performansının arttırılması amacıyla ön tasarım aşamasında alınan tedbirleri içerecek şekilde)',
    kaynaklar: ['Binalarda Enerji Performansı Yönetmeliği', 'TS EN 52016 serisi standartları'],
    tanimlar: [['Enerji Modelleme', 'Uygun bir yazılım kullanılarak, bina enerji tüketiminin tahmin edilmesine yönelik hesaplamaların yapılmasıdır.']]
  },
  'BBT 02 K3': {
    amac: 'Bu kriter, su ile ilgili sistemlere ilişkin ön analizleri gerçekleştirmeyi amaçlamaktadır.',
    kanit: 'Su analizi raporu ekle',
    gerek: [
      { no: 1, text: 'Binada tasarıma esas olacak şekilde, su tüketiminin nasıl azaltılacağına ilişkin ön araştırma yapmak, olası su stratejilerini (bina içi su talebi, bina dışı su talebi, işletme suyu talebi ve tedarik kaynakları) hazırlamak ve değerlendirmek.', durum: ['Y', 'M'] }
    ],
    kural: 'all',
    kuralText: 'Belirtilen gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Yerine getirilen gereklilikleri, olası tasarruf miktarlarını vb. hususları içerecek şekilde Su Analizi Raporu hazırlanmalıdır.',
    belgeler: 'Su Analizi Raporu (yerine getirilen gereklilikleri, olası tasarruf miktarlarını vb. hususları içerecek şekilde)'
  },
  'BBT 02 K4': {
    amac: 'Bu kriter, görsel konforu sağlamaya ilişkin projelerin; bütünleşik tasarım çerçevesinde hazırlanmasını amaçlamaktadır.',
    kanit: 'Doğal ve yapay aydınlatma projeleri ekle',
    gerek: [{ no: 1, text: 'Doğal ve yapay aydınlatma projeleri hazırlamak.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: '‘Doğal ve Yapay Aydınlatma Projeleri’nin varlığı kontrol edilmelidir.',
    belgeler: 'Doğal ve Yapay Aydınlatma Projeleri'
  },
  'BBT 02 K5': {
    amac: 'Bu kriter, işitsel konforu sağlamaya ilişkin projelerin; bütünleşik tasarım çerçevesinde hazırlanmasını amaçlamaktadır.',
    gerek: [{ no: 1, text: 'Akustik Projesi veya Akustik Raporu hazırlamak. Akustik Performans Belgesi de kabul edilir.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Akustik Proje, Akustik Raporu veya Akustik Performans Belgesi’nin varlığı kontrol edilmelidir.',
    belgeler: 'Akustik Proje, Akustik Raporu veya Akustik Performans Belgesi',
    kaynaklar: ['Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik']
  },
  'BBT 02 K6': {
    amac: 'Bütünleşik tasarım çerçevesinde, binada bulunan sabit ekipmanın yaydığı gürültünün yakındaki gürültüye çok hassas binalara etkisini kontrol altına almak amaçlanmaktadır.',
    gerek: [
      { no: 1, text: 'Binanın dış cephesinde, çatısında veya binaya ait açık alanda; havalandırma, ısıtma, soğutma ekipmanı ve benzeri sabit ekipman bulunmamasının proje ile kanıtlanması.', durum: ['Y', 'M'] },
      { no: 2, text: 'Binanın 500 metre yarıçapındaki çevresinde mevcut ya da imar planında gürültüye çok hassas bina bulunmadığının harita ile kanıtlanması.', durum: ['Y', 'M'] },
      { no: 3, text: 'Binanın 500 metre yarıçapındaki çevresinde mevcut ya da imar planında gürültüye çok hassas bina bulunması durumunda, hazırlanan ‘Gürültü Raporu’ ile, binada bulunan sabit ekipmanın gürültüsünün, en yakın gürültüye çok hassas binadaki mevcut arka plan gürültüsünü 2 dB’den fazla aşmadığının kanıtlanması.', durum: ['Y', 'M'] }
    ],
    kural: 'any',
    kuralText: 'Gerekliliklerden biri yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Kriter gerekliliğinin ‘Gürültü Raporu’ ile sağlanması durumunda, aşağıdaki yöntemlerin kullanılması zorunludur.',
      'Arka plan gürültüsünün belirlenmesi için değerlendirilecek gürültüye çok hassas binada; ortalama bir günde 24 saatlik gürültü düzeyi ölçümü yapılmalı, ya da gerekçelendirilerek seçilecek en sessiz saatte gürültü düzeyi ölçümü yapılmalıdır. Gürültü düzeyi ölçümleri TS ISO 1996-2 standardına uygun şekilde gerçekleştirilmelidir.',
      'Binada bulunan sabit ekipmanın gürültüsünün, en yakın gürültüye çok hassas kullanımlı bina veya alana etkisi; TS ISO 9613-2 standardına göre hesaplanmalıdır.'
    ],
    belgeler: [
      'Gereklilik numarasına göre, aşağıdaki belgelerden birinin teslim edilmesi gerekmektedir.',
      '• Sabit ekipmanları gösteren proje,',
      '• Binanın 500 metre yarıçapındaki çevresinde gürültüye çok hassas binaları gösteren ölçekli harita,',
      '• Binanın 500 metre yarıçapındaki çevresinde gürültüye çok hassas bina bulunması durumunda, ‘Gürültü Raporu’.',
      '‘Gürültü Raporu’ aşağıdaki hususları içermelidir:',
      '• Gürültü kaynağı (Binanın dış cephesinde, çatısında veya binaya ait açık alanda; havalandırma, ısıtma, soğutma ekipmanı ve benzeri sabit ekipmanlar) verileri',
      '• Alıcı (En yakın gürültüye çok hassas bina) verisi',
      '• TS ISO 1996-2 standardına uygun arka plan gürültü ölçüm raporu',
      '• TS ISO 9613-2 standardına uygun alıcıda gürültü düzeyi hesaplama verisi',
      '• Ölçülen arka plan gürültüsü ve hesaplanan alıcı gürültü düzeyi karşılaştırması',
      '• Alıcıdaki gürültünün istenen düzeyde olmaması durumunda; alınan önlemler ve yeni gürültü hesapları ile uygunluğun kanıtlanması'
    ],
    kaynaklar: [
      'Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik',
      'Çevresel Gürültü Kontrol Yönetmeliği',
      'TS ISO 1996-2 Akustik- Çevre Gürültüsünün Tarifi, Ölçülmesi ve Değerlendirilmesi- Bölüm 2: Çevre Gürültü Seviyelerinin Belirlenmesi.',
      'TS ISO 9613-2. Akustik- Sesin Dışarıda Yayılırken Azalması- Bölüm 2: Genel Hesaplama Yöntemi.'
    ]
  },
  'BBT 02 K7': {
    amac: 'Bu kriter, ısıl konforu sağlamaya ilişkin çalışmaların; bütünleşik tasarım çerçevesinde yapılmasını amaçlamaktadır.',
    kanit: 'Isıl konfor raporu ekle',
    gerek: [{ no: 1, text: 'Isıl modelleme araçları kullanılarak, ön tasarım aşamasında alınan kararların ısıl konfor açısından değerlendirilmiş olması ve tasarımın ısıl konforu arttıracak önlemler doğrultusunda revize edilmesini sağlamak.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'İç Ortam Kalitesi İOK 03: Isıl Konfor bölümündeki hususlar kontrol edilir.',
    belgeler: 'Isıl Konfor Raporu (Isıl konfor hesapları dikkate alınarak ısıl konforun arttırılması amacıyla ön tasarım aşamasında alınan tedbirleri içerecek şekilde)'
  },
  'BBT 02 K8': {
    amac: 'Bu kriter, hava kalitesini sağlamaya ilişkin projelerin; bütünleşik tasarım çerçevesinde hazırlanmasını amaçlamaktadır.',
    kanit: 'Taze hava temini raporu ekle',
    gerek: [{ no: 1, text: 'İç mekan konforunu sağlayacak ölçüde taze hava temininin sağlanması için konunun uzmanı tarafından önerilen stratejileri; tasarımda değerlendirmeye almak.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde, yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'İç Ortam Kalitesi İOK 04: Hava Kalitesi bölümündeki hususlar kontrol edilir.',
    belgeler: 'Taze Hava Temini Raporu (Taze hava temini için önerilen stratejiler ve projede yer alan ilgili tasarım kararlarının gerekçesini içeren rapor)'
  },
  'BBT 02 K9': {
    amac: 'Bu kriter, bütünleşik tasarım çerçevesinde binalarda acil durum planlarının hazırlanması ile güvenli olarak yönetilmesini sağlamayı amaçlamaktadır.',
    kanit: 'Acil durum planı ekle',
    gerek: [{ no: 1, text: 'Acil durum planı hazırlamak ve güncelliğini sağlamak.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      '‘Acil Durum Planı’, herhangi bir acil durum meydana geldiğinde izlenecek adımları belirtmeli ve acil durumun sınırlandırılması, imkan varsa önlenmesi ve etkilerinin en aza indirgenmesi hususlarında aşağıdaki konuları içermelidir;',
      '• Olası acil durumların tanımlanması,',
      '• Acil durum yönetiminde görev alacakların tespit edilmesi ve sorumluluklarının belirlenmesi,',
      '• Bina tahliye prosedürlerinin belirlenmesi,',
      '• Acil durum planının güncelliğinin sağlanması. (Acil durum esnasında gerekli bina yerleşim planları, tehlikeli malzeme verileri, prosedürler, çalışma talimatları ve iletişime geçilecek kişiler gibi bilgilerin kullanılabilir durumda olduğunu içerecek şekilde.)'
    ],
    belgeler: 'Acil Durum Planı',
    kaynaklar: ['İşyerlerinde Acil Durumlar Hakkında Yönetmelik'],
    tanimlar: [
      ['Acil Durum', 'Binalarda meydana gelebilecek yangın, patlama, tehlikeli kimyasal maddelerden kaynaklanan yayılım, doğal afet gibi acil müdahale, mücadele, ilk yardım veya tahliye gerektiren olaylardır.'],
      ['Acil Durum Planı', 'Binalarda meydana gelebilecek acil durumlarda izlenecek adımlar ile uygulamaya yönelik bilgilerin yer aldığı plandır.']
    ]
  },
  'BBT 02 K10': {
    amac: 'Bu kriter; binanın ilk tasarım aşamasından itibaren yangının meydana gelmesini engellemeyi, meydana gelmesi durumunda oluşabilecek hasarları en azda tutmayı, kullanıcı ve bina emniyetini en yüksek düzeyde sağlamayı amaçlamaktadır.',
    not: 'Yangın emniyetinin artırılması için tüm bina ve yerleşme alanlarında pasif ve aktif yangın emniyet önlemlerinin; ilgili mevzuata uygun olarak alınması gereklidir. Yangın emniyet önlemleri alınırken; sürdürülebilirlik ve çevresel etkiler gözetilerek buna uygun önlemler kredilendirmeye dahil edilir.',
    gerek: [
      { no: 1, text: 'Bina tipine uygun yangın senaryolarının varlığı.', durum: ['Y', 'M'] },
      { no: 2, text: 'Yangın senaryosuna uygun modellemenin varlığı.', durum: ['Y', 'M'] },
      { no: 3, text: 'Bina ve yakın çevresini kapsayacak şekilde ve en az beş yıllık oluşturulmuş yangın yönetimi planlarının varlığı.', durum: ['Y', 'M'] }
    ],
    kural: 'each', each: 1,
    kuralText: 'Belirtilen gerekliliklerden her biri 1’er kredi olmak üzere, tüm gereklilikler sağlandığında yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Yangın emniyet önlemlerinin, tasarımın ilk aşamalarından itibaren tasarımın bir parçası olarak dikkate alınması gerektiği için; yapılacak tüm çalışmalar çeşitli ölçeklerdeki mimari projeler ve mevzuatın zorunlu kıldığı büyüklüklerdeki binalar için ayrı hazırlanan yangın projeleri üzerinden yürütülür.',
      'Söndürme ve algılama sistemi ile bina tahliye planları, bu projelerden ayrı olarak hazırlanır.'
    ],
    belgeler: ['Aşağıda listelenen belgeler kriterin değerlendirilmesi için sağlanmalıdır.', '• Bina tahliye projesi,', '• Gerekliliklerde belirtilen hususlar ile ilgili raporlar'],
    kaynaklar: [
      'Binaların Yangından Korunması Hakkında Yönetmelik',
      'TS 7394 Yangından Korunma- Terimler-Korunma İçin Yapı Elemanları',
      'TS 12116 Yangın Önleme- Yapı Malzemeleri-Yangına Dayanıklılık Sınıfları ve Özellikleri',
      'TS EN 13501-1 Yapı Mamulleri ve Yapı Elemanları, Yangın Sınıflandırması Bölüm 1: Yangın Karşısındaki Davranış Deneylerinden Elde Edilen Veriler Kullanılarak Sınıflandırma'
    ]
  },
  'BBT 02 K11': {
    amac: 'Bu kriter, bütünleşik tasarım çerçevesinde binalarda yaşam döngüsü değerlendirmesi yapılarak; üretim ve kullanım faaliyetlerinin, çevre üzerindeki toplam etkisinin belirlenmesini amaçlamaktadır.',
    kanit: 'Yaşam döngüsü değerlendirme raporu ekle',
    gerek: [{ no: 1, text: 'Yaşam döngüsü değerlendirmesi yapmak.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Yaşam döngüsü değerlendirmesi aşağıdaki adımları içermelidir;',
      '• Yaşam döngüsü değerlendirmesinin amaç ve kapsamının belirlenmesi,',
      '• Bina ile ilgili verilerin toplanması,',
      '• Çevresel etkilerin değerlendirilmesi,',
      '• Sonuçların yorumlanması. (Etkilerin azaltılması için olanakları içerecek şekilde.)'
    ],
    belgeler: 'Yaşam Döngüsü Değerlendirme Raporu',
    kaynaklar: ['TS EN ISO 14040:2006 Çevre yönetimi- Hayat boyu değerlendirme - İlkeler ve çerçeve'],
    tanimlar: [['Yaşam Döngüsü Değerlendirmesi', 'Bina yaşam döngüsü boyunca kullanılan ve çevreye salınan enerji ve malzemelerin sistematik olarak açıklanması ve değerlendirilmesi yoluyla bir ürün ya da faaliyetle ilişkilendirilen çevresel etkileri belirleme yöntemidir. Bir bina sistemine, binanın yaşam döngüsü boyunca giren ve çıkan çevreye zarar verebilecek etmenlerin ve miktarlarının derlenmesi ve sebep olduğu potansiyel çevre etkilerinin değerlendirilmesidir. Bir binanın yaşam döngüsü boyunca, örneğin doğal kaynakların kullanılması ya da çevreye salınan her türlü salım gibi; çevreyle ilişkili konularını ve potansiyel çevre etkilerini işaret eder.']]
  },
  'BBT 02 K12': {
    amac: 'Bu kriter, bütünleşik tasarım çerçevesinde; binada kullanılacak olan her bir malzeme, bileşen ve sistem ile ilgili mevcut veriler ışığında, bina işletme ömrünü mümkün olduğunca doğru bir şekilde tahmin ederek planlamayı amaçlamaktadır.',
    kanit: 'İşletme ömrü planlama raporu ekle',
    gerek: [{ no: 1, text: 'İşletme ömrü planlaması yapmak.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: '‘İşletme Ömrü Planlama Raporu’nun varlığı kontrol edilmelidir.',
    belgeler: 'İşletme Ömrü Planlama Raporu',
    kaynaklar: ['TS ISO 15686 Binalar ve inşa edilmiş varlıklar – Kullanım ömrünün planlanması – Bölüm 1: Genel prensipler ve çerçeve'],
    tanimlar: [['İşletme Ömrü Planlaması', 'İşletme ömrü planlaması, bir bina veya bileşeninin hizmet ömrünün geliştirilmesine yönelik bir karar verme sürecidir.']]
  },
  'BBT 02 K13': {
    amac: 'Bu kriter, yeşil bina belgelendirmesinde inovatif değeri olan uygulamaların ve bina kullanıcılarının; yaşam kalitesini artırıcı iyileştirmelerin sağlanmış olmasını amaçlamaktadır.',
    gerek: [
      { no: 1, text: 'İnovatif değeri olan uygulamaları sağlamış olmak.', durum: ['Y', 'M'] },
      { no: 2, text: 'Bina kullanıcılarının yaşam kalitesini arttırmayı hedefleyen uygulamaları sağlamak.', durum: ['Y', 'M'] }
    ],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'İnovasyon_Bina İNO 01 “Yaşam Kalitesini Yükselten Mühendislik ve Tasarım Çözümleri” bölümündeki hususlar kontrol edilir.',
    belgeler: 'Gereklilikleri içeren rapor'
  },
  'BBT 02 K14': {
    amac: 'Bu kriter; projenin su, ısı ve enerji sürdürülebilirliğini; izleme, ölçme ve değerlendirme ile ilgili inovatif çözümleri içeriyor olmasını amaçlamaktadır.',
    kanit: 'Sürekli izleme ve değerlendirme raporu ekle',
    gerek: [{ no: 1, text: 'Projenin sürdürülebilirliğini ölçmek, izlemek ve değerlendirmek ile ilgili inovatif çözümleri sağlamak.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'İnovasyon_Bina İNO 02 “İzleme ve Değerlendirme Sisteminin Geliştirilmiş Olması” bölümündeki hususlar kontrol edilir.',
    belgeler: 'Sürekli İzleme ve Değerlendirme Raporu'
  },

  // ---- BBT 03 Yapım ile İlgili Dokümanların Hazırlanması
  'BBT 03 K1': {
    amac: 'Bu kriter, bir inşaat imalatının tamamında kullanılacak duvar, döşeme, cephe, çatı vb. bina elemanları ile ilgili bilgilerin uygulama ile uyumlu olmasını amaçlamaktadır.',
    kanit: 'Mahal listesi ve yapı ruhsatı ekle',
    gerek: [
      { no: 1, text: 'Bir inşaat imalatının tamamında kullanılacak duvar, döşeme, cephe, çatı vb. bina elemanları ile ilgili bilgileri içeren “Mahal Listesi”nin hazırlanması.', durum: ['Y', 'M'] },
      { no: 2, text: '“Yapı Ruhsatı”nın sunulması.', durum: ['Y', 'M'] }
    ],
    kural: 'all',
    kuralText: '“Mahal Listesi”nin hazırlanması ve “Yapı Ruhsatı”nın sunulması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Mahal listesi ve yapı ruhsatının varlığı kontrol edilmelidir.',
    belgeler: ['• (1) Mahal Listesi', '• (2) Yapı ruhsatı ve varsa tadilat ruhsatı'],
    tanimlar: [['Mahal Listesi', 'İnşaatın her aşamasında kullanılacak ürün ve malzemelerin detaylı miktarlarını ve kullanım yerlerini belirten listedir.']]
  },

  // ---- BBT 04 Yapım (kılavuz: bbt 04.docx)
  'BBT 04 K1': {
    amac: 'Bu kriter, binaların yapım aşamasında güvenli ve yeterli erişim sağlamayı amaçlamaktadır.',
    kanit: 'Erişime ilişkin fotoğraf, rapor ve belgeleri ekle',
    gerek: [{ no: 1, text: 'Şantiye alanı içinde ve dışında güvenli ve yeterli erişim sağlamak.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Binalar için güvenli ve yeterli erişimin sağlanması aşağıdaki adımları içermelidir;',
      '• Şantiye alanındaki çalışma yerlerinin seçiminde; buralara ulaşımın nasıl sağlanacağının ekipman, hareket ve geçişler için alan veya yolların belirlenmesi,',
      '• Şantiye alanı içinin ve dışının yeterli düzeyde aydınlatılması,',
      '• Şantiye sınırları için yeterli bariyerlerin kullanılması,',
      '• Tüm erişimlerin temiz ve çamurdan arındırılmış olması,',
      '• Şantiye içinde ve dışında yeterli yönlendirme ve işaretlemelerin yer alması.',
      'Gereklilikler, binalarda yerinde kontrol edilerek değerlendirme yapılacak ve ilgili fotoğraf, rapor ve belgeler ile desteklenecektir.'
    ],
    belgeler: 'Şantiye alanı içinde ve dışında güvenli ve yeterli erişim sağlandığına dair ilgili fotoğraf, rapor ve belgeler.',
    kaynaklar: ['6331 Sayılı İş Sağlığı ve Güvenliği Kanunu', 'Yapı İşlerinde İş Sağlığı ve Güvenliği Yönetmeliği']
  },
  'BBT 04 K2': {
    amac: 'Binaların, yapım aşamasında yaydığı gürültünün; gürültüye çok hassas binalara etkisini kontrol altına almak amaçlanmaktadır.',
    kanit: 'Harita / şantiye gürültüsü raporu ekle',
    gerek: [
      { no: 1, text: 'Binanın 500 metre yarıçapındaki çevresinde gürültüye çok hassas binalar bulunmadığının harita ile kanıtlanması.', durum: ['Y', 'M'] },
      { no: 2, text: 'Binanın 500 metre yarıçapındaki çevresinde gürültüye çok hassas bina bulunması halinde gürültüye en yakın gürültüye çok hassas binada, ses seviyesi takip sistemi kurulması ve ses seviyesinin Çevresel Gürültü Kontrol Yönetmeliği’nde işyeri için belirlenen çevresel gürültü düzeyi sınır değerlerini aşması durumunda; bu sınır değerin altına düşürecek önlemlerin planlanması (Şantiye gürültüsü raporu) ve önlemlerin uygulanması.', durum: ['Y', 'M'] }
    ],
    kural: 'any',
    kuralText: 'Belirtilen gerekliliklerden biri yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Kriter gerekliliğinin sağlanması için, aşağıdaki yöntemlerin kullanılması zorunludur.',
      'Ses seviyesi takip sistemi, değerlendirilecek gürültüye çok hassas binada, TS ISO 1996-2 standardına uygun olacak şekilde gürültü seviyesi ölçümü yapılmalıdır.',
      'Gürültü seviyesi takip sistemi, ses seviyesi Çevresel Gürültü Kontrol Yönetmeliği’nde işyeri için belirlenen çevresel gürültü düzeyi sınır değerlerini aşması durumlarında şantiyedeki bir görevliyi uyarmalıdır. Şantiyedeki görevli, ses seviyesini bu sınır değerlerin altına düşürecek önlemlerin uygulanmasından sorumludur.',
      'Ses seviyesini düşürecek önlemlerin belirlenmiş olması gerekmektedir. Bu önlemleri belirlemek için TS ISO 9613-2 standardına göre hesaplama yapılmış olması gerekmektedir.'
    ],
    belgeler: [
      '• Binanın 500 metre yarıçapındaki çevresinde gürültüye çok hassas binayı belirten ölçekli harita',
      '• Gürültü seviyesi takip sistemi kurulması durumunda, aşağıda içeriği verilmiş olan ‘Şantiye Gürültüsü Raporu’ teslim edilmelidir:',
      '• Gürültü Seviyesi Takip Sistemi hakkında veriler,',
      '• Şantiyede farklı etaplarda kullanılabilecek / kullanılan ekipmanları belirten proje ve ekipman verileri,',
      '• Alıcı (Gürültüye en yakın gürültüye çok hassas bina) verisi,',
      '• Farklı ekipman pozisyonları için TS ISO 9613-2 standardına uygun alıcıda gürültü seviyesi hesaplama / ölçüm verisi,',
      '• Alıcıdaki gürültü seviyesinin istenen seviyede olmaması durumu mevcutsa; alınan önlemler ve yeni gürültü hesapları / ölçümleri ile uygunluğun kanıtlanması.'
    ],
    kaynaklar: [
      'Çevresel Gürültü Kontrol Yönetmeliği',
      'TS ISO 1996-2 Akustik- Çevre Gürültüsünün Tarifi, Ölçülmesi ve Değerlendirilmesi- Bölüm 2: Çevre Gürültü Seviyelerinin Belirlenmesi',
      'TS ISO 9613-2 Akustik- Sesin Dışarıda Yayılırken Azalması- Bölüm 2: Genel Hesaplama Yöntemi'
    ]
  },
  'BBT 04 K3': {
    amac: 'Bu kriter, yeni binalarda yapım aşamasında işçi sağlığı ve iş güvenliğini sağlamayı amaçlamaktadır.',
    kanit: 'İSG prosedür belgelerini ekle',
    gerek: [{ no: 1, text: '‘Yapı İşlerinde İş Sağlığı ve Güvenliği Yönetmeliği’ maddelerinde belirtilen hususları yerine getirmek.', durum: ['Y'] }],
    kural: 'mandatory',
    kuralText: 'Mevcut binalar için kriter uygulanmaz (0 kredi).',
    yontem: 'Yeni binalar için ‘İşçi Sağlığı ve İş Güvenliği Prosedürleri’nin varlığı kontrol edilmelidir.',
    belgeler: 'İşçi Sağlığı ve İş Güvenliği Prosedürlerine ait belgeler',
    kaynaklar: ['6331 Sayılı İş Sağlığı ve Güvenliği Kanunu', 'Yapı İşlerinde İş Sağlığı ve Güvenliği Yönetmeliği'],
    tanimlar: [['İşçi Sağlığı ve İş Güvenliği', 'İşçi sağlığı ve iş güvenliği; yapım sürecinde şantiyedeki fiziki çevre şartları nedeniyle işçilerin maruz kaldıkları sağlık sorunları ve mesleki risklerin ortadan kaldırılması veya azaltılmasına yönelik çalışmalardır.']]
  },
  'BBT 04 K4': {
    amac: 'Bu kriter, binaların yapım aşamasındaki enerji ve su tüketimini kontrol ve takip ederek, verimli kullanımını sağlamayı amaçlamaktadır.',
    kanit: 'Enerji ve su tüketimi ölçüm tablolarını ekle',
    gerek: [{ no: 1, text: 'Şantiye aktivitelerinden kaynaklanan enerji (kWh) ve su (m³) tüketimlerinin kayıt altına alınması. (Tüm yapım süreçlerinin tamamlanması için gerekli iş makinaları ve ekipmanları ile şantiye mobilizasyonunda kullanılan miktarları içerecek şekilde.)', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'İlgili belgelerden inceleme yapılacaktır.',
    belgeler: 'Periyodik Enerji ve Su Tüketimi Ölçüm Tabloları'
  },
  'BBT 04 K5': {
    amac: 'Bu kriter, yapım aşamasındaki şantiye aktivitelerinden kaynaklanan atıkların; çevreye zarar vermeden yönetiminin ve etkin geri dönüşümünün sağlanmasını amaçlamaktadır.',
    kanit: 'Atık yönetimi / geri dönüşüm planı ekle',
    gerek: [{ no: 1, text: 'Yapım aşamasında ortaya çıkan atık türü ve miktarının belirlenerek; şantiye alanında nasıl biriktirileceği ve geri dönüşümünü de içeren yönetimin bir plan dahilinde açıklanması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: '‘Atık Yönetimi / Geri Dönüşüm Planı’nın varlığı kontrol edilmelidir.',
    belgeler: 'Yeni binalar için Atık Yönetimi / Geri Dönüşüm Planı (Atık Yönetimi / Geri Dönüşüm Tablosu’nu içerecek şekilde) (Tablo 2.1.9)',
    kaynaklar: [
      'Atık Yönetimi Yönetmeliği',
      'Atık Ön İşlem ve Geri Kazanım Tesislerinin Genel Esaslarına İlişkin Yönetmelik',
      'Hafriyat Toprağı, İnşaat ve Yıkıntı Atıklarının Kontrolü Yönetmeliği ve atık türlerine göre ilgili mevzuat'
    ]
  },

  // ---- BBT 05 Kontrol, İşletmeye Alma ve Kabul (kılavuz: bbt 05.docx)
  'BBT 05 K1': {
    amac: 'Bu kriter, bina performans beklentilerine göre ilgili sistemlerin ölçülmesi ve izlenmesi amacıyla; binada kullanılacak sistemlerin (ısıtma, su dağıtım, aydınlatma, havalandırma, soğutma, yangından korunma, otomatik kontrol vb.) işletmeye alma süreçlerinin ve yönetecek ekibin belirlenmesi yoluyla binada kullanılan sistemlerin etkinliğini sürdürmesini sağlamak ve bu sistemler tarafından kullanılacak enerji ihtiyacının optimize edilmesini amaçlamaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Isıtma, su dağıtım, aydınlatma, havalandırma, soğutma, yangından korunma (algılama, söndürme) ve otomatik kontrol sistemlerinin bütünleşik çalışmasına yönelik işletmeye alma süreçlerini tanımlamak.', durum: ['Y', 'M'] },
      { no: 2, text: 'Isıtma, su dağıtım, aydınlatma, havalandırma, soğutma, yangından korunma (algılama, söndürme) ve otomatik kontrol sistemlerinin bütünleşik çalışmasına yönelik işletmeye alma süreçlerini yönetecek ekibi belirlemek.', durum: ['Y', 'M'] },
      { no: 3, text: 'Ekipte yer alanların sorumluluklarını belirlemek.', durum: ['Y', 'M'] },
      { no: 4, head: true, text: 'Yangın emniyetinin artırılması için bina ve yerleşme alanlarında alınan tüm pasif ve aktif yangın emniyet önlemlerinin; ilgili mevzuat, standart ve işletme prosedürlerine uygun olarak işlerliğini sağlamak. Alt gereklilikler (en az ikisi):', durum: ['Y', 'M'] },
      { no: '4.1', sub: true, text: 'Yangından korunma amaçlı kullanılacak tüm pasif ve aktif önlemler için işletmeye alma, kontrol ve onay işlemlerinin yapılması.', durum: ['Y', 'M'] },
      { no: '4.2', sub: true, text: 'Yangından korunmada kullanılan tüm pasif ve aktif sistemlerin periyodik kontrollerinin ve bakımlarının yapılması ve onaylanması.', durum: ['Y', 'M'] },
      { no: '4.3', sub: true, text: 'Yangın pompası test suyu için içilemeyen su kullanımı ve bu suyun çevre kirliliğine yol açmayacak şekilde uzaklaştırılması.', durum: ['Y', 'M'] },
      { no: '4.4', sub: true, text: 'Alarm sistemi izlemelerini takip eden sürekli personelin varlığı.', durum: ['Y', 'M'] }
    ],
    kural: 'min', must: [1, 2, 3], pick: { of: ['4.1', '4.2', '4.3', '4.4'], min: 2 },
    kuralText: 'Yeni ve mevcut binalarda; bu kriterden tam kredi alınması için (1), (2) ve (3) numaralı gereklilikler yerine getirilmeli ve (4) numaralı gerekliliğe ait alt gerekliliklerden ise en az ikisi sağlanmalıdır.',
    yontem: 'Ekip belirlenirken; ekipte yer alacakların özgeçmişi, bu konudaki yetkinliğini gösterir referans projeler ve projelerdeki görev tanımları veya bu konuda aldığı eğitimler dikkate alınmalıdır. Binada yangın emniyet önlemlerinin kontrol, işletmeye alma ve kabul aşamaları; ilgili mevzuat, standart ve sistem üreticileri tarafından belirlenen işletme talimatlarına göre yapılmalıdır.',
    belgeler: [
      'Aşağıda listelenen belgeler, kriterin değerlendirilmesi için sağlanmalıdır.',
      '• İşletmeye Alma Sorumluluk Çizelgesi,',
      '• Mimari Proje,',
      '• Bina Tahliye, Yangın Algılama ve Söndürme, Acil Durum ve Kaçış Aydınlatması Projeleri.'
    ],
    kaynaklar: [
      'Binaların Yangından Korunması Hakkında Yönetmelik',
      'TS EN 14336 Isıtma Sistemleri - Binalar İçin - Su Esaslı Isıtma Sistemlerinin Tesisi ve İşletmeye Alınması',
      'TSE CLC/TR 50090-9-2. Ev ve Binalarda Elektronik Sistemler (EBES)',
      'PV Modüllerinin Performans Testleri ve Tip Kabulleri İçin TS EN 61215-2, TS EN IEC 61215-1-2 ve TS EN 62108 Standartları ve Emniyet Testleri İçin TS EN 61730-1 Standardı',
      'TSE CEN/TS 54-14 Yangın Algılama ve Yangın Alarm Sistemleri- Bölüm 14: Planlama, Tasarım, Kurulum, Devreye Alma, Kullanım ve Bakım İçin Rehber',
      'TS EN 671-3 Sabit Yangın Söndürme Sistemleri- Hortum Sistemleri- Bölüm 3: Yarı rijit hortumlar için makaraların ve yassı hortumlu hortum sistemlerinin bakımı',
      'TS EN 12845+A1 Sabit Yangın Söndürme Sistemleri- Otomatik Sprinkler Sistemleri- Tasarım, Kurulum ve Bakım.',
      'TS ISO 15779 Yoğunlaştırılmış Aerosol Yangın Söndürme Sistemleri- Bileşenler ve Sistem Tasarımı İçin Kurallar ve Deney Yöntemleri, Kurulum ve Bakım- Genel Kurallar.',
      'TSE CEN/TS 54-32 Yangın Algılama ve Yangın Alarm Sistemleri- Bölüm 32: Sesli Alarm Sistemlerinin Planlaması, Tasarımı, Kurulumu, Devreye Alınması, Kullanımı ve Bakımı.',
      'TS EN 15004-1 Yangınla mücadelede sabit sistemler - Gazlı söndürme sistemleri - Bölüm 1 : Tasarım, montaj ve bakım',
      'TS 9811 Yangın Söndürücüler- Orta ve Yüksek Genleşmeli Köpük Sistemleri- Bakım ve Denetleme',
      'TS EN 14637 Bina Donanımı -Yangın/Duman Kapıları İçin, Elektrikle Kumandalı Açık Tutma Sistemleri- Özellikler, Deney Metotları, Uygulama ve Bakım'
    ],
    tanimlar: [['Kontrol, İşletmeye Alma ve Kabul', 'Isıtma, su dağıtım, aydınlatma, havalandırma, soğutma, yangından korunma (algılama, söndürme) ve otomatik kontrol sistemlerinin tasarım amacına uygun olarak gerçekleştirilmesi için kurulması, işlevsel olarak test edilmesi ile çalıştırılması ve bakımının sağlanması sürecidir.']]
  },
  'BBT 05 K2': {
    amac: 'Bu kriter, bina performans beklentilerine göre ilgili sistemlerin ölçülmesi ve izlenmesi amacıyla işletmeye alma öncesi, işletmeye alma ve gerekiyorsa tekrar işletmeye alma programları yapmayı amaçlamaktadır.',
    kanit: 'İşletmeye alma programı ekle',
    gerek: [{ no: 1, text: 'Bina servislerine ilişkin işletmeye alma programını hazırlamak.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Kontrol, işletmeye alma ve kabul sürecinde uygulanan standartlar, kılavuzlar ve mevzuat çerçevesinde hazırlanmalıdır.',
    belgeler: 'İşletmeye Alma Programı',
    kaynaklar: [
      'TS EN 14336 Isıtma Sistemleri - Binalar İçin - Su Esaslı Isıtma Sistemlerinin Tesisi ve İşletmeye Alınması',
      'TSE CLC/TR 50090-9-2. Ev ve Binalarda Elektronik Sistemler (EBES)',
      'PV Modüllerinin Performans Testleri ve Tip Kabulleri İçin TS EN 61215-2, TS EN IEC 61215-1-2 ve TS EN 62108 Standartları ve Emniyet Testleri İçin TS EN 61730-1 Standardı'
    ]
  },

  // ---- BBT 06 İşletme, Bakım, Ölçüm ve Tesis Yönetimi (kılavuz: bbt 06.docx)
  'BBT 06 K1': {
    amac: 'Bu kriter, binanın uygulanmış projeleri üzerinden bakım ve yenileme işlemlerinin tanımlanarak; işletme sürecinde konfor şartlarını artırmayı, bu bağlamda da kaynak tüketimini ve atıkları azaltmayı amaçlamaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Bina Bakım Kılavuzu’nun hazırlanması.', durum: ['Y', 'M'] },
      { no: 2, text: 'Bina Bakım Kılavuzundaki sistemlerin uygulama/uygulanmış projeleri/krokileri vb. belirleyici dokümanların hazırlanması.', durum: ['Y', 'M'] }
    ],
    detay: 'Binanın en uygun biçimde işletilmesi için yöntemlerde listelenen sistemlerin ve bileşenlerinin hangi sıklıkla bakımdan geçmesi gerekeceği, hangi bileşenlerinin hangi sürelerde yenilenmesi gerektiği tanımlanmalıdır. Bu tanım; usulleri belirlenmiş, sorumluları tayin edilmiş, bilgilendirici ve planlanmış bir doküman olmalıdır.',
    kural: 'all',
    kuralText: 'Belirtilen iki gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Binanın aşağıdaki sistemlere ilişkin hazırlanacak bakım kılavuzunda bu sistemlerin konumları, bağlantı şemaları gibi bakım için gerekli bilgileri içeren uygulama/uygulanmış projelerin/krokilerin hazırlanması.',
      'Bina bakım ve yenileme işlemlerinin tanımını, sürecini ve sorumlularını içeren kılavuzun hazırlanmasıdır. Hazırlanan kılavuz, aşağıdaki maddelerle sınırlı olmamakla birlikte; asgari olarak aşağıdaki hususları içermelidir;',
      '• Acil durum, güvenlik ve kaçış planı senaryoları,',
      '• Binanın sistem, alt sistemler ve bileşenleri hakkında detaylı bilgi,',
      '• Binanın ortak kullanım alanları hakkında bilgilendirme,',
      '• Isıtma, soğutma ve havalandırma sistemleri,',
      '• Su dağıtım sistemi,',
      '• Aydınlatma sistemleri,',
      '• Otomasyon sistemi (varsa),',
      '• Yenilenebilir enerji ve teknolojileri (varsa).',
      'Bakım onarım planı, rehberi, politikaları, programları ve stratejileri açıkça tanımlanmalıdır. Buna göre bakım yapılacak sistem, alt sistem ve bileşenlerin bakım ve yenileme prosedürlerinin yazılması; günlük, aylık ve yıllık olarak tanımlanması ile sorumlularının belirtilmesi gerekmektedir. Bu bağlamda özel bir format tanımlanmamıştır.'
    ],
    belgeler: ['Aşağıda listelenen belgeler kriterin değerlendirilmesi için sağlanmalıdır.', '• Bina Bakım Kılavuzu,', '• Bina Bakım Kılavuzundaki sistemlerin uygulama/uygulanmış projeleri/krokileri vb.'],
    tanimlar: [['Uygulanmış (As-built) Proje', 'Binanın inşaat sürecinde yapılan değişiklik ve güncellemelerin de işlendiği; binanın uygulanmış halinin projeleridir.']]
  },
  'BBT 06 K2': {
    amac: 'Bu kriter, binanın etkin biçimde işletilebilmesi ve mevcut potansiyelinin doğru ve zamanında kullanılması için bina yöneticisi ve kullanıcılarının eğitilmesini amaçlamaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Bina bilgilendirme ve kullanma kılavuzunun hazırlanması.', durum: ['Y', 'M'] },
      { no: 2, text: 'Bina hakkında yönetici ve kullanıcılara eğitim verilmesi.', durum: ['M'] }
    ],
    detay: [
      'Yönetici ve kullanıcılar gibi teknik olmayan kişileri de gözeten, binanın en uygun biçimde işletilmesi için sistemlerin ve bileşenlerinin neler olduğu, nasıl çalıştıkları, hangi sıklıkla bakımdan geçmeleri gerektiği ve hangi bileşenlerinin hangi sürelerde yenilenmesi gerektiği tanımlanmalıdır. Bu doküman aşağıdaki bilgileri içermelidir;',
      '• Binaya ait havalandırma, ısıtma, aydınlatma vb. sistemlerin tanıtılması. Etkin çalışma koşulları ve bakımı hakkında detaylı bilgiler verilmesi,',
      '• Acil durumlar hakkında bilgilendirme yapılması ve acil durum bina tahliye senaryolarının hazırlanması,',
      '• Kaynakların (enerji, su vb.) tüketimi ve ortaya çıkabilecek atıklar hakkında bilgi verilmesi,',
      '• Bakım ve onarım işlerinin tanımlanması, periyodik olarak listelenmesi.'
    ],
    kural: 'all',
    kuralText: 'Yeni binada birinci gereklilik yerine getirildiğinde, mevcut binada ise her iki gereklilik yerine getirildiğinde tam kredi alınır.',
    yontem: 'Bina yöneticisi ve kullanıcıları gibi teknik olmayan kişilerin de binanın bileşenleri ve işletimi hakkında temel bilgilere ulaşabileceği içerikte rehber hazırlanmalıdır. Hazırlanan rehber, uzman olmayan kullanıcıların da anlayabileceği bir dile sahip olmalıdır. Binanın bileşenleri tanımlanmalı, gerekli kullanım bilgileri sunulmalı, kullanım sırasında çıkabilecek acil durumlar hakkında bilgi verilmeli, çözüm için ne yapılması gerektiği ya da kime haber verilmesi gerektiği belirtilmelidir. Hazırlanan bu rehber çerçevesinde, yöneticilerin göreve başlamadan önce; kullanıcıların ise yerleşim öncesi bir eğitim almaları gereklidir. Bina türlerine göre, oteller, hastaneler, vb. gibi kullanıcıları sık değişen ve sürekli olmayan yapı türleri için sürdürülebilirlik ilkelerinin aktarıldığı belgelerin hazırlanması, kiraya verilen ve kullanıcıları belirli periyotlarla değişen yapı türleri için kullanım kitapçıklarının hazırlanması, sürekli kullanıcılar için ise eğitim verilmesi gerekmektedir.',
    belgeler: ['Aşağıda listelenen belgeler kriterin değerlendirilmesi için sağlanmalıdır.', '• Bina Bilgilendirme ve Kullanma Kılavuzu,', '• Mevcut binalar için eğitim belgeleri ve/veya tutanakları.']
  },
  'BBT 06 K3': {
    amac: 'Bu kriter ile; binanın etkin biçimde işletilebilmesi ve mevcut potansiyelinin doğru ve zamanında kullanılabilmesi için kullanıcılarının tanımlanması, güvenlik sistemlerinin oluşturulması ve yeni ve mevcut binalarda kullanılan tüm sistemlerin birbirlerine entegre edilerek kullanılması amaçlanmaktadır.',
    kanit: 'Bina kullanıcı formu ekle',
    gerek: [{ no: 1, text: 'Hazırlanan ‘Bina Kullanıcı Formu’nda bina kullanıcılarının sayısı ve dağılımı ile kamera kontrol sistemlerinin bilgilerinin belirtilmesi.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gerekliliğin yerine getirilmesi durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Bina kullanıcıların sayısı ve dağılımı, kamera kontrol güvenlik sistemlerinin bilgilerini içerecek formun (Bina Kullanıcı Formu) hazırlanmasıdır.',
    belgeler: '‘Bina Kullanıcı Formu’'
  },
  'BBT 06 K4': {
    amac: 'Bu kriter, binanın tasarlanan bileşenlerinin beklentilere bağlı olarak çalışıp çalışmadığını, tüketim değerlerinde sapma olup olmadığını, sapma varsa bu sapmaların sebeplerinin tanımlanmasını ve buna bağlı olarak sorun olan yerlerin gözden geçirilerek; hedeflerin güncellenmesini amaçlamaktadır. Enerji etkinliğinin artırılması, zararlı gazların emisyon miktarlarının düşürülmesi ve kaynakların korunması bakımlarının zamanlarında gerçekleştirilmesi temel amaçtır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Ölçüm araçlarının adet ve dağılımları.', durum: ['Y', 'M'] },
      { no: 2, text: 'Ölçüm araçlarının yerleri, teknik özellikleri ve çalışma prensibi.', durum: ['Y', 'M'] },
      { no: 3, text: 'Mevcut binalarda takip raporu (ölçüm ve bakım bilgileri içeren).', durum: ['M'] }
    ],
    detay: 'Binanın işletim planının gerektiği gibi çalışmasını takip edebilmek amacıyla yapının kaynak tüketiminin aylık ve yıllık olarak belgelenmesi, bina için belirlenen hedeflerle örtüşüp örtüşmediğinin ölçülmesi ve yapı türüne göre özel ve ortak kullanılan mekanların ölçümlerinin ayrıştırılması amacıyla kayıt tutularak yıllara göre kullanım değerlerinin bakım bilgilerinin ve sürelerinin kayıt altına alınması gerekmektedir.',
    kural: 'all',
    kuralText: 'Gereklilikler yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Ölçüm araçlarının adet ve dağılımları ile ölçüm araçlarının yerleri, teknik özellikleri ve çalışma prensiplerinin ortaya konması ve işletmede olan binanın tüketim tablolarının aylık ve yıllık olarak kayıtlarının tutulması gerekir.',
      'Bina tüketim değerlerinin binanın kullanım durumuna göre hane, kat ya da bölüm ve bina türüne göre özel ve ortak alan kullanımlarının ayrı ayrı tutulmasını düzenleyecek kayıt raporunun hazırlanmasıdır. Tutulan kayıtlar, yönetici ve kullanıcılar ile paylaşılarak; etkin tasarruf için yönlendirici bilginin oluşması sağlanmalıdır.'
    ],
    belgeler: ['Aşağıda listelenen belgeler kriterin değerlendirilmesi için sağlanmalıdır.', '• Ölçüm Araçları Özellikleri (Adet ve dağılımlarını, yerlerini, teknik özelliklerini ve çalışma prensibini içerecek şekilde),', '• Takip Raporu (Mevcut binalar için).']
  },

  // ==== İOK İç Ortam Kalitesi (kılavuz: iok.docx)
  // ---- İOK 01 Görsel Konfor
  'İOK 01 K1': {
    amac: 'Görsel işlerin hızlı, güvenli ve konforlu bir biçimde yerine getirilebilmesi için çalışma düzlemi ve çevresinde yeterli aydınlık düzeyinin yapay aydınlatma sistemi ile sağlanması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'İlgili standartlara göre gerekli aydınlık düzeyinin (E) sağlanması.', durum: ['Y', 'M'] },
      { no: 2, text: 'Yapay aydınlatmanın, ana mekanlarda / sürekli kullanılan mekanlarda uygun sistemlere sahip olması.', durum: ['Y', 'M'] }
    ],
    detay: 'Görsel Konfor ve Isıl Konfor temalarında sanayi alanlarında üretim faaliyetleri yürütülen binaların sadece idari bölümleri değerlendirilir.',
    kural: 'mandatory',
    kuralText: 'Yeni ve mevcut binalarda gerekliliklerin yerine getirilmesi zorunludur.',
    yontem: [
      'Yöntem 1: Hesaplama / Simülasyon',
      'Bina tiplerine bağlı olarak sürekli kullanılan mekanlarda çalışma düzleminde gerekli ortalama aydınlık düzeyinin (E; lm/m², lx) sağlandığının belirlenmesi. İlgili standartlarda verilen hesaplama aralıkları kullanılmalıdır.',
      'Yöntem 2: Ölçüm',
      'Çalışma düzlemi üzerinde gerekli ortalama aydınlık düzeyinin (E, lx) yerinde ölçülmesi. İlgili standartlarda verilen ölçme aralıkları kullanılmalıdır.'
    ],
    belgeler: [
      '• Sürekli kullanılan mekanların tefrişli plan ve kesitleri (Yöntem 1 ve 2),',
      '• Gerekli aydınlık düzeylerini sağlayan mekanların listesi (Yöntem 1 ve 2),',
      '• Aydınlık düzeylerinin mekan planı üzerinde gösterilmesi (Yöntem 1 ve 2),',
      '• Simülasyon programı özelliklerinin, program girdilerinin ve sonuç sayfalarının teslimi (Yöntem 1),',
      '• Aydınlık düzeyi ölçümünde kullanılan luxmetre özelliklerinin belirtilmesi (Yöntem 2),',
      '• Ölçüm noktalarının ve ölçülen değerlerin mekan planı üzerinde gösterilmesi (Yöntem 2).'
    ],
    kaynaklar: ['TS EN 12464-1: Işık ve aydınlatma - Çalışma yerlerinin aydınlatılması - Bölüm 1: Kapalı çalışma alanları', 'TS EN 12193: Aydınlatma ve ışık - Spor aydınlatması']
  },
  'İOK 01 K2': {
    amac: 'Görsel işlerin hızlı, güvenli ve konforlu bir biçimde yerine getirilebilmesi için çalışma düzlemi ve çevresinde aydınlığın düzgün dağılımının yapma aydınlatma sistemi ile sağlanması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Tüm kapalı yerlerde başlıca yüzeylerde aydınlık düzgünlüğünün sağlanması: duvarlarda E > 50 lx ve Uo ≥ 0,10; tavanda E > 30 lx ve Uo ≥ 0,10.', durum: ['Y', 'M'] },
      { no: 2, text: 'Ofis, eğitim, sağlık işlevli bazı kapalı mekanlarda ve giriş, koridor, merdiven gibi bazı genel alanlarda aydınlık düzgünlüğünün sağlanması: duvarlarda E > 75 lx ve Uo ≥ 0,10; tavanda E > 50 lx ve Uo ≥ 0,10.', durum: ['Y', 'M'] }
    ],
    kural: 'all',
    kuralText: 'Gereklilikler yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Yöntem 1: Hesaplama / Simülasyon',
      'Bina tiplerine bağlı olarak ana mekanlarda / sürekli kullanılan mekanlarda, çalışma düzleminde gerekli aydınlık düzgünlüğünün (Uo) sağlandığının belirlenmesi. İlgili standartlarda verilen hesaplama aralıkları kullanılmalıdır.',
      'Yöntem 2: Ölçüm / Hesaplama (Mevcut bina)',
      'Çalışma düzlemi üzerinde gerekli aydınlık düzgünlüğünün (Uo) yerinde ölçülen aydınlık düzeylerine (E; lm/m², lx) bağlı olarak hesaplanması. İlgili standartlarda verilen ölçme aralıkları kullanılmalıdır.'
    ],
    belgeler: [
      '• Sürekli kullanılan mekanların tefrişli plan ve kesitleri (Yöntem 1 ve 2),',
      '• Gerekli aydınlık düzgünlüğünü sağlayan mekanların listesi (Yöntem 1 ve 2),',
      '• Aydınlık düzeylerinin ve düzgünlüğün mekan planı üzerinde gösterilmesi (Yöntem 1 ve 2),',
      '• Simülasyon programı özelliklerinin, program girdilerinin ve sonuç sayfalarının teslimi (Yöntem 1),',
      '• Aydınlık düzeyi ölçümünde kullanılan luxmetre özelliklerinin belirtilmesi (Yöntem 2),',
      '• Ölçüm noktalarının ve ölçülen değerlerin mekan planı üzerinde gösterilmesi, hesaplanan düzgünlük değerlerinin listesi (Yöntem 2).'
    ],
    kaynaklar: ['TS EN 12464-1: Işık ve aydınlatma - Çalışma yerlerinin aydınlatılması - Bölüm 1: Kapalı çalışma alanları']
  },
  'İOK 01 K3': {
    amac: 'Görsel işlerin hızlı, güvenli ve konforlu bir biçimde yerine getirilebilmesi için kamaşmanın önlenmesi amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Aydınlatma aygıtlarının kamaşma yaratmayacak özelliklere sahip olmalarına ilişkin ilgili standartlara uygunluğun sağlanması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Hesaplama / Simülasyon',
      'Bina tiplerine bağlı olarak ana mekanlarda / sürekli kullanılan mekanlarda, kamaşma indisi (RUGL) değerlerinin elle veya simülasyon programı ile hesaplanması. Hesaplanan değerler ilgili standartlarda verilen üst sınır değerlerini aşmamalıdır.',
      'Kamaşma indisi RUGL değeri, kılavuzdaki (1) numaralı eşitlikle hesaplanabilmektedir (LB: fon parıltısı, cd/m²; L: aydınlatma elemanının aydınlık parçasının göz doğrultusunda oluşturduğu parıltı, cd/m²; ω: aydınlık parçanın göz ile arasında oluşturduğu açı, sr; p: Guth konum indeksi). Simülasyon programları ile hacimdeki yüzeylerin ışık yansıtma katsayısı, hacim boyutları ve aydınlatma elemanlarının arasındaki uzaklık ve tipik bakış doğrultularına bağlı RUGL değerleri elde edilebilmektedir.'
    ],
    belgeler: [
      '• Ana mekanların / sürekli kullanılan mekanların tefrişli plan ve kesitleri,',
      '• Tefrişli plan ve kesitler üzerinde aydınlatma aygıtlarının ve bakış doğrultularının gösterilmesi,',
      '• Simülasyon programı kullanıldıysa özelliklerinin, program girdilerinin ve sonuç sayfalarının teslimi,',
      '• Aydınlatma aygıtlarının RUGL değerlerini gösteren ürün bilgileri.'
    ],
    kaynaklar: ['TS EN 12464-1: Işık ve aydınlatma - Çalışma yerlerinin aydınlatılması - Bölüm 1: Kapalı çalışma alanları']
  },
  'İOK 01 K4': {
    amac: 'Görsel performansın, sağlık ve konforun sağlanması için; ortamın, nesnelerin ve insan teninin renklerinin doğal ve doğru bir biçimde algılanması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Lambaların ışık rengi özelliklerinden renksel geriverim indisinin (Ra), ilgili standartlarda verilen değerlerde seçilmesi.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Sürekli / düzenli kullanılan mekanların; tefrişli plan ve kesitleri, aydınlatma aygıtları ve özellikleri ile seçilen lamba türüne ilişkin Ra verileri incelenecektir.',
    belgeler: [
      '• Sürekli / düzenli kullanılan mekanların tefrişli plan ve kesitleri,',
      '• Tefrişli plan ve kesitler üzerinde aydınlatma aygıtlarının belirtilmesi,',
      '• Aydınlatma aygıtlarının özellikleri ve seçilen lamba türüne ilişkin bilgiler,',
      '• Ra verilerini içeren ürün bilgileri.'
    ],
    kaynaklar: ['TS EN 12464-1: Işık ve aydınlatma - Çalışma yerlerinin aydınlatılması - Bölüm 1: Kapalı çalışma alanları']
  },
  'İOK 01 K5': {
    amac: 'Sürekli kullanılan ve penceresi olan mekanlarda; kullanıcıların dış ortamla ilişkisinin kurulması, görsel konforunun sağlanması, sirkadyan ritmin güçlendirilmesi ve mekanda yapay aydınlatma enerjisi kullanımının azaltılması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Sürekli kullanılan mekanların ilgili alanlarında Yöntem 1’de belirtilen yeterli hedef günışığı faktörünün sağlanması veya Yöntem 2’de belirtilen günışığı aydınlık düzeyine dayalı hesaplama yöntemleri kullanılarak yeterli günışığı performansının sağlandığının kanıtlanması.', durum: ['Y', 'M'] }],
    detay: [
      'Sürekli kullanılan mekanlar listesi (Tablo 2.2.3):',
      '• Konut: mutfak, yaşam alanı,',
      '• Ofis: ofis alanları, teknik çizim odası, konferans salonu, toplantı odası, giriş alanı,',
      '• Eğitim: derslik, derslik (yetişkinler için ve gece kullanım), oditoryum, sanat atölyesi, laboratuvar, giriş holü, sirkülasyon alanları, merdiven, öğretmenler odası, spor salonu (TS EN 12193), kantin, mutfak,',
      '• Otel: resepsiyon, mutfak, restoran, konferans salonu, yatak odası,',
      '• Sağlık: TS EN 12464-1 standardında verilen tüm mekanlar,',
      '• AVM: satış alanları, kasa ve paketleme,',
      '• Genel alanlar: giriş holü, vestiyer, bilet satış, bekleme odası / salonu.'
    ],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Yöntem 1: Günışığı Çarpanına (Faktörüne) Dayalı Hesaplama / Simülasyon (yeni ve mevcut bina) veya Ölçüm (mevcut bina)',
      'İlgili mekanın referans / çalışma düzleminde Tablo 2.2.4’te belirtilen “Minimum Hedef Günışığı Faktörü” ve “Hedef Günışığı Faktörü” değerleri minimum seviyede sağlanmalıdır. Minimum seviyenin (yıllık günışığı etkin saatin yarısı (2190 saat) için mekanın %50’sinde %1,6 ve/veya %95’inde %0,5 günışığı faktörü) sağlanması halinde tam kredi alınır.',
      'Tablo 2.2.4 (hedef günışığı faktörü / minimum hedef günışığı faktörü; referans alanın %50’si / %95’i için):',
      '• Minimum: %1,6 / %0,5,',
      '• Orta: %2,6 / %1,6,',
      '• Yüksek: %3,9 / %2,6.',
      'Simülasyon yöntemi, TS EN 17037 standardının Hedef Günışığı Faktörü yöntemine uygun olarak, doğruluğu kanıtlanabilen simülasyon programlarında yapılmalıdır. Hesaplamalarda ilgili standartlarda verilen hesaplama aralıkları kullanılmalıdır.',
      'Yöntem 2: Günışığı Aydınlık Düzeyine Dayalı Hesaplama - Simülasyon (yeni ve mevcut bina) veya Ölçüm (mevcut bina)',
      'Sürekli kullanılan mekanlarda günışığı ile yeterli aydınlatma yapılması için Tablo 2.2.5’te üç ayrı seviyede hedef aydınlık seviyeleri tanımlanmıştır. Minimum seviyenin [yıllık günışığı etkin saatin yarısı (2190 saat) için mekanın %50’sinde en az 300 lux, %95’inde en az 100 lux] sağlanması halinde tam kredi alınır.',
      'Tablo 2.2.5 (hedef aydınlık düzeyi / minimum hedef aydınlık düzeyi; referans alanın %50’si / %95’i için, yıllık günışığı etkin saatlerin %50’sinde):',
      '• Minimum: 300 lux / 100 lux,',
      '• Orta: 500 lux / 300 lux,',
      '• Yüksek: 750 lux / 500 lux.',
      'Simülasyon yöntemi, TS EN 17037 standardının hedef aydınlık düzeyi yöntemine uygun olarak, doğruluğu kanıtlanabilen yazılımlarda, yerel koşullara göre hazırlanmış iklim dosyası kullanılarak, saat bazında yapılmalıdır. Hesaplamalarda ilgili standartlarda verilen hesaplama aralıkları kullanılmalıdır.'
    ],
    belgeler: [
      '• Sürekli kullanılan mekanların tefrişli plan ve kesitleri (proje belgeleri) (Yöntem 1 ve 2),',
      '• Gerekli günışığı çarpanı değerlerini / aydınlık düzeylerini sağlayan mekanların listesi (Yöntem 1 ve 2),',
      '• Günışığı çarpanı değerlerinin / aydınlık düzeylerinin mekan planı üzerinde gösterilmesi (Yöntem 1 ve 2),',
      '• Kullanıldıysa günışığı simülasyon programı özelliklerinin, gök koşullarının tanıtılması, program girdilerinin ve sonuç sayfalarının teslimi (Yöntem 2),',
      '• Aydınlık düzeyi ölçümünde kullanılan luxmetre özelliklerinin belirtilmesi (mevcut yapı) (Yöntem 2).'
    ],
    kaynaklar: ['TS EN 17037+A1: Binalarda gün ışığı']
  },
  'İOK 01 K6': {
    amac: 'Sürekli kullanılan ve penceresi olan mekanlarda, kullanıcıların dış ortamla ilişki kurabilmesi için yeterli görüşün sağlanması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Sürekli kullanılan mekanların en az %75’inde; manzaranın (doğal veya yapma çevre) pencereye olan uzaklığının, Planlı Alanlar İmar Yönetmeliği’nde belirtilen parsele ait çekme mesafelerinin en az 1,5 katı olması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Vaziyet planı ve kat planlarında, dışarıda görülen manzaraya ait objeler (çevredeki bina, duvar, ağaç vb.) ile analiz edilen mekanın penceresi arasındaki mesafenin, sınır değeri sağlayıp sağlamadığı kontrol edilmelidir. Dış görüşe giren farklı birden fazla obje olması durumunda manzaraya giren en büyük obje baz alınır. (Dışarıda görülen manzaraya ait objeler, pencereye ait katın döşeme hizasını geçmemesi halinde dikkate alınmaz.)',
    belgeler: [
      '• Vaziyet planı, uydu görüntüleri vb.,',
      '• Yeterli dış görüşü sağlayan mekanların listesi,',
      '• Yeterli dış görüş değerini sağlayan mekanların plan, fotoğraf, render vb. belgeleri.'
    ],
    kaynaklar: ['Planlı Alanlar İmar Yönetmeliği']
  },
  'İOK 01 K7': {
    amac: 'Mekan kullanıcılarına görsel konfor açısından rahatsızlık verebilecek doğal ışığın / güneş ışığının yol açtığı kamaşmanın önlenmesi, çalışma düzlemi üzerindeki günışığı dağılımının düzgünlüğüne katkı sağlanması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Sürekli kullanılan ve penceresi olan mekanlarda elle ya da otomatik olarak kumanda edilen güneş kontrol elemanlarının kullanılması (mekan içinde ya da dışında yer alan, bina bileşenlerine sabitlenmiş hareketli jaluzi, tente, panjur vb.).', durum: ['Y', 'M'] },
      { no: 2, text: 'Kamaşmanın önlenmesi için uygun güneş kontrolünün yapılması sonucunda ilgili mekanların çalışma düzlemi üzerindeki günışığı dağılımının düzgünlüğüne katkı sağlanması.', durum: ['Y', 'M'] }
    ],
    kural: 'all',
    kuralText: 'Gereklilikler yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Mekan kullanıcılarına görsel konfor açısından rahatsızlık verebilecek doğal ışığın / güneş ışığının yol açtığı kamaşmanın önlenmesi için uygun güneş kontrol ekipmanları kullanılarak çalışma düzlemi üzerindeki günışığı dağılımının düzgünlüğüne katkı sağlanması.',
    belgeler: [
      '• Sürekli kullanılan tüm pencereli mekanların planları ve kesitleri (proje belgeleri),',
      '• Güneş kontrolü yapılan mekanların listesi,',
      '• Güneş kontrolü yapılan mekanlardaki güneş kontrol elemanı özellikleri ve açıklayıcı bilgiler,',
      '• Güneş kontrolü yapılan mekanlardaki günışığı aydınlık düzeyi değerleri.'
    ],
    // Kılavuzda İOK 01 Görsel Konfor temasının ortak tanımları (tema sonunda)
    tanimlar: [
      ['Aydınlık düzeyi', 'Aydınlık düzeyi (E), birim alanın (m²) aldığı ışık akısının (Ø), bu alana bölümüdür (lux, lm/m²). Ortalama aydınlık düzeyi çalışma düzlemindeki ışık akısının çalışma düzlemi alanına bölümüdür. İç mekanlarda görsel konfor koşullarının sağlanabilmesi için gerekli aydınlık düzeyi alt sınır değerleri ulusal ve uluslararası standartlarda verilmektedir. Bu değerlerin sağlanabilmesi için lamba ve aygıt ömrü ile temizlenme sıklığı dikkate alınmalıdır.'],
      ['Aydınlık düzgünlüğü (Uo)', 'Çalışma düzleminde gerçekleşen en az aydınlık düzeyinin (Emin), ortalama aydınlık düzeyine (Em) oranıdır (Uo = Emin / Em).'],
      ['CIE standart kapalı göğü', 'Ufkun üzerinde belli bir noktadaki ışıklılığı ile zenitteki (başucundaki) ışıklılığı arasındaki oran Lγ = Lz (1 + 2 sinγ) / 3 formülü ile verilmiş olan tam kapalı gök.'],
      ['Çalışma düzlemi', 'Üzerinde genellikle herhangi bir çalışma yapılan bir düzlemden oluşmuş referans yüzeyidir. İç aydınlatmada tersine bir belirleme yoksa bu düzlem, döşemeden 85 cm yüksekte ve duvarlardan 0,5 m uzaklıkla sınırlanmış yatay düzlemdir. Ofisler için döşemeden 0,7 m, konutlar için 0,85 m yükseklikte alınabilir. Görsel eylemin özelliklerine göre çalışma düzlemi yatay, düşey veya eğimli olabilmektedir.'],
      ['Güneş kontrol elemanı', 'Pencerelerden giren güneş ve gök ışığının hacim içine denetimli alınabilmesi için pencerenin içine ya da dışına yerleştirilebilen hareketsiz ya da hareketli elemanlardır.'],
      ['Günışığı aydınlık düzeyi (E)', 'Birim alanın (m²) aldığı ışık akısının (Ø), bu alana bölümüdür (lux; lm/m²). Ortalama günışığı aydınlık düzeyi çalışma düzlemindeki günışığı ışık akısının çalışma düzlemi alanına bölümüdür. Noktada günışığı aydınlık düzeyi, çalışma düzleminin belli bir noktasına gelen günışığı ışık akısı ile belirlenir.'],
      ['Günışığı düzgünlüğü (Ug)', 'Günışığı ile aydınlatılan bir mekanda, çalışma düzlemi üzerindeki en az günışığı çarpanı veya aydınlık düzeyi değerinin, aynı çalışma düzlemi üzerindeki ortalama günışığı çarpanına veya aydınlık düzeyine oranıdır.'],
      ['Kamaşma', 'Görsel çevrede yer alan yüzeylerin parıltılarının (ışıklılıklarının) uygun olmayan dağılımları ya da aşırı bir karşıtlık sonucu, nesnelerin ya da bunların ayrıntılarının ayırt edilebilmesinde bir yetenek eksikliği ya da bir güçlük, bir sıkıntıya yol açan görme koşullarıdır.'],
      ['Luxmetre (Aydınlıkölçer)', 'Işıksal aydınlıkları ölçmeye yarayan alettir.'],
      ['Parıltı (Işıklılık, Luminance)', 'Söz konusu noktayı çevreleyen sonsuz küçük bir yüzey parçacığının verilmiş doğrultudaki ışık şiddetinin, bu yüzey parçacığının verilmiş doğrultuya dik bir düzlem üzerindeki izdüşümünün alanına bölümüdür.'],
      ['Renk sıcaklığı Tc', 'Işınımı verilmiş bir renk uyartısı ile aynı türsellikte bulunan Planck ışıyıcısının sıcaklığıdır (K).'],
      ['Renksel geriverim', 'Lambanın aydınlattığı nesnelerin, renk türü ile ilgili görünüşleri üzerindeki etkisidir. Seçilen lambaların renksel geriverim indisi Ra değerleri, ilgili standartlarda verilen alt sınır değerleri sağlamalıdır. TS EN 12464-1 standardında Ra alt sınır değeri 80 olarak verilmektedir. Ancak renk algılamanın önem kazandığı bazı mekanlar için bu değer 90 olarak belirtilmiştir.'],
      ['Simülasyon programı', 'Aydınlık düzeyinin hesaplanmasında kullanılabilecek simülasyon programları; Uluslararası Aydınlatma Komisyonu CIE 171:2006 “Test Cases to Assess The Accuracy of Lighting Computer Programs” yayını kullanılarak akredite olmuş aydınlatma simülasyon programları arasından seçilmelidir.'],
      ['Sirkadyan ritim', 'Canlı bir organizmanın 24 saatlik dönem içindeki biyokimyasal ve psikolojik davranışlarının bütünüdür. Günışığı, renk ve aydınlık düzeyindeki değişimleri ile sirkadyan ritmi etkiler (kalp frekansı, tansiyon, vücut sıcaklığı, uyku-uyanıklık durumları gibi).'],
      ['Sürekli kullanılan mekan', 'Değerlendirilen yapının içinde kullanıcıların 30 dakika veya daha uzun süre bulunduğu mekan ya da odalardır.']
    ]
  },

  // ---- İOK 02 İşitsel Konfor (gereklilik (2): bina tipine ve durumuna göre akustik performans sınıfı)
  'İOK 02 K1': iokAkustik({
    amac: 'Bu kriter ile; her türlü bina, tesis ve işletmenin işletimi ve kullanımı safhalarında insanların maruz kalacağı binaların dışından veya içinden kaynaklanan toplam iç ortam gürültüsü değerlerinin kişilerin huzur ve sükûnuna, beden ve ruh sağlığına olumsuz etkilerini en aza indirecek, iyi işitme ve algılama koşullarını yaratacak iç ortam gürültü seviyesinin sağlanması amaçlanmaktadır.',
    sinif: 'Tablo 2.2.7’de verilen iç ortam gürültüsü sınır değerlerinden', ust: [0, 1, 2, 3, 4],
    ustAd: 'Konut, ofis, eğitim, otel ve sağlık binalarında', altAd: 'alışveriş ve ticaret merkezleri ile diğer binalarda',
    detay: [
      'Tablo 2.2.7 İç Ortam Gürültü Düzeyi (LAeq): bina işlevi ve mekana göre akustik performans sınıfına (A, B, C, D) bağlı izin verilen mekan içi en yüksek gürültü düzeyleri için ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ekinde yer alan değerler esas alınır. Zaman dilimleri: gece 23.00–07.00, akşam 19.00–23.00, gündüz 07.00–19.00.',
      'Sirkülasyon alanı: bekleme holü, merdiven holü, antre, giriş holü gibi ortak alanları ifade eder. Dinlenme, yemek yeme, alışveriş, oyun alanları gibi birincil işlevi müzik dinlemek olmayan hacimler için değerler müzik sesi dahil sağlanacak değerlerdir; dans pistleri gibi ses yükselticilerin bulunduğu alanlar için ‘Çevresel Gürültünün Değerlendirilmesi ve Yönetimi Yönetmeliği’ esas alınır.'
    ],
    yontem: [
      'Yeni ve mevcut binalarda iç ortam gürültüsünün belirlenmesinde LAeq ve NR göstergeleri kullanılacaktır. LAeq (eşdeğer iç gürültü düzeyi) kullanıcının mekanı kullanma saatlerine göre ve gündüz, akşam, gece veya 24 saat için hesaplanacaktır. NR 63–8000 Hz arasındaki oktav bantlarda belirlenecektir.',
      'İç ortam gürültü seviyesi ölçümleri, ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ile TS ISO 1996-1 ve TS ISO 1996-2 standartlarına göre yapılacaktır.'
    ],
    kaynaklar: [
      'Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik',
      'Çevresel Gürültünün Değerlendirilmesi ve Yönetimi Yönetmeliği',
      'TS ISO 1996-1 Akustik - Çevre Gürültüsünün Tarifi, Ölçülmesi ve Değerlendirilmesi - Bölüm 1: Temel Büyüklükler ve Değerlendirme İşlemleri',
      'TS ISO 1996-2 Akustik - Çevre Gürültüsünün Tarifi, Ölçülmesi ve Değerlendirilmesi - Bölüm 2: Çevre Gürültü Seviyelerinin Belirlenmesi'
    ]
  }),
  'İOK 02 K2': iokAkustik({
    amac: 'Bu kriter ile; her türlü bina, tesis ve işletmenin işletimi ve kullanımı safhalarında binalarda yapı içinde veya dışında yer alan klima dış üniteleri, merkezi klima sistemleri ve ekipmanları, sıhhi tesisat ekipman ve boruları, asansörler, jeneratörler vb. servis sistemlerinden kaynaklanan iç ortam gürültüsü değerlerinin kişilerin huzur ve sükûnuna, beden ve ruh sağlığına olumsuz etkilerini en aza indirecek iyi işitme ve algılama koşullarını yaratacak seviyelere indirilmesi amaçlanmaktadır.',
    sinif: 'Tablo 2.2.8’de verilen servis ekipmanı gürültü düzeyleri sınır değerlerinden', ust: [0, 1, 2, 3, 4],
    ustAd: 'Konut, ofis, eğitim, otel ve sağlık binalarında', altAd: 'alışveriş ve ticaret merkezleri ile diğer binalarda',
    detay: [
      'Tablo 2.2.8 Servis Ekipmanı Gürültü Düzeyleri (LAeq,nT): bina işlevi ve mekana göre akustik performans sınıfına (A, B, C, D) bağlı olarak, ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ekindeki sürekli gürültüye sahip servis ekipmanlarına bağlı izin verilen en yüksek iç gürültü düzeyleri tablosundaki değerler esas alınır. Zaman dilimleri: gece 23.00–07.00, akşam 19.00–23.00, gündüz 07.00–19.00.',
      'Özel derslik: müzik odası, dans odası, resim ve el işi dersliği gibi bireysel çalışmaya dayalı derslikleri ifade eder. Sirkülasyon alanı: bekleme holü, merdiven holü, antre, giriş holü gibi ortak alanları ifade eder.'
    ],
    yontem: [
      'Binalarda servis ekipmanından kaynaklanan iç gürültülerin değerlendirilmesinde LAeq,nT ve LAF,max,nT göstergeleri kullanılacaktır. Bu değerler, ekipmanın türüne göre 63–8000 Hz arasında oktav bantlarda belirlenecektir. Sürekli ses üreten servis ekipmanı için LAeq,nT, kesikli ses üreten servis ekipmanı için LAF,max,nT kullanılacaktır.',
      'Mekanik sistem kurulumu tamamlanıp işletmeye alınması aşamasında ölçümler, ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ile TS EN ISO 10052 ve TS EN ISO 16032 standartlarına göre yapılır. Ölçüm sonuçlarının sınır değerlerden yüksek çıkması durumunda, bina akustiği uzmanı tarafından alınacak önlemler akustik rapor ile açıklanmalıdır. Titreşim yalıtımına ilişkin önlemler TS EN 1299+A1 standardına göre yapılacaktır.'
    ],
    kaynaklar: [
      'Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik',
      'Çevresel Gürültünün Değerlendirilmesi ve Yönetimi Yönetmeliği',
      'TS EN ISO 16032 Akustik - Binalarda Servis Ekipmanları Ses Basınç Seviyesi Ölçülmesi - Mühendislik Yöntemi',
      'TS EN ISO 10052 Akustik - Hava İle Yayılan Ses ve Darbe Sesi Yalıtımının ve Donanım Sesinin Sahada Ölçülmesi - Araştırma (Survey) Yöntemi',
      'TS EN 1299+A1 Mekanik Titreşim ve Şok - Makinaların Titreşim Yalıtımı - Titreşim Kaynağının Yalıtımının Uygulaması İçin Bilgiler'
    ]
  }),
  'İOK 02 K3': {
    amac: 'Bu kriter ile; her türlü bina, tesis ve işletmenin çeşitli mekanlarında çınlama süresinin iyi işitme ve algılama koşullarını yaratacak değerleri aşmaması amaçlanmaktadır.',
    kanit: 'Akustik proje / rapor ekle',
    gerek: [
      IOK_AKUSTIK_BELGE,
      { no: 2, text: 'Tablo 2.2.9’da verilen çınlama süresi sınır değerlerinden en az %10 daha iyi olduğunun belgelendirilmesi.', durum: ['Y', 'M'] },
      { no: 3, text: 'Eğitim yapıları, sağlık tesisleri, ofisler, yemekhane ve lokantalar, tüm sirkülasyon alanları, kütüphaneler, terminaller, kamuya ait tesisler ve spor salonlarında tavan kaplamasının ağırlıklı ses yutuculuk katsayısının (αw) en az 0,75 olması. (Akustik proje ve raporlarda istenen reverberasyon sürelerinin sağlandığının hesaplar ile gösterilmesi durumunda bu koşul aranmaz.)', durum: ['Y', 'M'] }
    ],
    detay: [
      'Diğer yüzeyler için istenen yutuculuklar; gerektiği takdirde, bina akustiği uzmanı tarafından çınlama sürelerine bağlı olarak elde edilecektir.',
      'Tablo 2.2.9 Çınlama Süresi Sınır Değerleri: bina işlevi ve mekana göre, ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ekindeki akustik performans sınıfına bağlı olarak sağlanacak en yüksek reverberasyon süreleri tablosundaki değerler esas alınır. Sınır değer; 250, 500, 1000 ve 2000 Hz frekanslarındaki değerlerin aritmetik ortalamasıdır ve C ve D sınıfları için geçerlidir. Bina işlevlerine bağlı olarak diğer sınıflar için sınır değerlere, uluslararası sınır değerlere bağlı olarak bina akustiği uzmanı karar verecektir.'
    ],
    kural: 'all',
    kuralText: 'Tüm bina tiplerinde, Tablo 2.2.9’da verilen çınlama süresi sınır değerlerinden en az %10 daha iyi olduğunun belgelendirilmesi şartıyla yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Yeni binalarda proje aşamasında çınlama süresinin hesaplanmasında Sabine Formülü kullanılabilir (T: reverberasyon süresi, sn, frekanslara göre hesaplanır; V: hacim, m³; Atoplam: eşdeğer toplam yutuculuk alanı = S1·α1 + S2·α2 + …; Sn: n. tip malzeme ile kaplı alan, m²; αn: n. tip malzemenin yutuculuk katsayısı).',
      'Mevcut bina veya yapım sonrası yeni bina değerlendirmesi için kriterin sağlandığını belirten ölçümlerin yapılması gereklidir. Malzemelerin ses yutuculuk katsayısı TS EN ISO 10534-1 veya TS EN ISO 354 standardına göre belirlenebilir. Ağırlıklı ses yutuculuk katsayısı TS EN ISO 11654’e göre derecelendirilecektir.',
      'Çınlama süresi ölçümleri ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ile TS EN ISO 354, TS EN ISO 18233 ve TS EN ISO 3382-2 standartlarına göre yapılacaktır.'
    ],
    belgeler: IOK_AKUSTIK_BELGELER,
    kaynaklar: [
      'Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik',
      'Çevresel Gürültünün Değerlendirilmesi ve Yönetimi Yönetmeliği',
      'TS EN ISO 11654 Akustik - Binalarda Kullanılan Ses Absorplayıcıları - Ses Absorpsiyonunun Derecelendirilmesi',
      'TS EN ISO 18233 Akustik - Bina ve Oda Akustiğinde Yeni Ölçme Metotlarının Uygulanması',
      'TS EN ISO 3382-2 Akustik - Odaların Akustik Parametrelerinin Ölçülmesi - Bölüm 2: Sıradan Odalarda Çınlama Süresi',
      'TS EN ISO 354 Akustik - Çınlama Odasında Ses Absorpsiyonunun Ölçülmesi',
      'TS EN ISO 10534-1 Akustik - Empedans Tüplerinde Ses Absorpsiyon Katsayısının ve Empedansının Belirlenmesi - Bölüm 1: Sürekli Dalga Oranı Metodu'
    ]
  },
  'İOK 02 K4': iokAkustik({
    amac: 'Bu kriter ile her türlü bina, tesis ve işletmenin işletimi ve kullanımı safhalarında binalarda yapı dışında yer alan her türlü çevresel gürültü kaynakları ile klima dış üniteleri, merkezi klima sistemleri ve ekipmanları, sıhhi tesisat ekipman ve boruları, asansörler, jeneratörler ve benzeri sistemlerden kaynaklanan hava doğuşlu dış gürültü seviyelerinin kişilerin huzur ve sükûnuna, beden ve ruh sağlığına olumsuz etkilerini en aza indirecek iyi işitme ve algılama koşullarını yaratacak seviyelere indirilmesi için dış yapı elemanlarının hava doğuşlu ses yalıtım değerlerinin istenen değerleri karşılaması amaçlanmaktadır.',
    sinif: 'Tablo 2.2.10’da verilen alıcı odası hassasiyetine göre akustik performans sınıflarından', ust: [0, 2, 4],
    ustAd: 'Konut, eğitim ve sağlık binalarında', altAd: 'ofis, otel, alışveriş ve ticaret merkezleri ile diğer binalarda',
    detay: [
      'Tablo 2.2.10 Alıcı Odası Hassasiyetine Göre Akustik Performans Sınıfları: ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ekinde (Ek-3.1) yer alan ‘Dış gürültü düzeylerine ve alıcı odası hassasiyet derecesine göre sağlanacak en düşük ses yalıtım değerleri (DnT,A,tr, dB)’ esas alınacaktır.',
      '• I - Gürültüye karşı çok hassas kullanıma sahip binalar (konut, yataklı hizmet veren sağlık kurumları, çocuk ve yaşlı bakım evleri, yatılı eğitim kurumları, öğrenci yurtları, kültürel tesisler),',
      '• II - Gürültüye karşı hassas kullanıma sahip binalar (yataklı hizmet veren konaklama tesisleri, eğitim kurumları, dini tesisler),',
      '• III - Gürültüye karşı az hassas kullanıma sahip binalar (ofisler, idari ve ticaret binaları, spor tesisleri, terminaller).'
    ],
    yontem: [
      'Dış yapı elemanları ve bileşenlerinin akredite laboratuvarda ölçülmüş ses azaltım indeksi R değerleri spektral veya ağırlıklı düzeyler Rw (C; Ctr) olarak bir veri tabanında beyan edilmiş ise bu değerler kullanılabilir. Dış yapı elemanlarının ses yalıtım değerlerinin laboratuvarda ölçülmesi TS EN ISO 10140-2 standardına göre yapılacaktır.',
      'Ölçüm sonuçları ya da bir veri tabanı bulunmuyor ise; ses azaltım indeksi R spektral veya ağırlıklı düzeyler Rw (C; Ctr) olarak, sesin doğrudan iletimi için kabul görmüş bilimsel yöntemler veya bu yöntemlere dayalı yazılımlar kullanılarak hesaplanabilir. Dış yapı elemanlarının ses yalıtım performansları, birleşim bölgelerinin özelliklerine bağlı olarak sesin yanal yollarla iletimini de hesaba katarak TS EN 12354-1, 2, 3 ve 4 standartlarının ilgili bölümlerine uygun olarak hesaplanır.',
      'Alanda veya laboratuvarda spektral olarak ölçülen ses azaltım (yalıtım) indeksi R değerlerinin ağırlıklı düzeyler Rw (C; Ctr) olarak derecelendirilmesinde TS EN ISO 717-1 standardı kullanılacaktır.',
      'Uygulanacak ses yalıtımlı yapı elemanları akustik projede liste halinde detayları ve hesaplanan akustik performans değerleri ile birlikte verilir. Uygulama ilkeleri akustik raporda açıklanır.',
      'Laboratuvar ölçümleri veya hesaplarla belirlenen Rw (C; Ctr) performans değerlerinin DnT,A veya DnT,50 değerlerine dönüştürülmesi için genel kabul görmüş yöntemler kullanılabilir. İyileştirme değerlerini sağlayacak ek katmanlar, TS EN 12354-1, 2 ve 3’e göre yapılacak hesaplamalar ile malzeme ve konstrüksiyon olarak belirlenecektir.',
      '• Güvenli tarafta kalmak için hesaplama ve tasarımlar hedeflenen akustik performans sınıfı değerlerinin olumlu yönde 2 dB üstüne göre yapılmalıdır.',
      '• Akustik proje ve mimari proje kapsamında akustik birleşim detayları çizilecektir.',
      '• Mevcut ve yeni bina değerlendirmelerinde alanda yapılacak ses yalıtım testleri ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ile TS EN ISO 16283-1 ve 3 standartlarına uygun olarak yapılacaktır.',
      '• Ölçümlerde ISO 12999-1’e uygun olarak belirsizlik değerleri verilecektir.'
    ],
    kaynaklar: [
      'Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik',
      'TS EN ISO 16283-3 Akustik - Yapı Elemanlarında ve Yapılarda Ses Yalıtımının Alan Ölçümü - Bölüm 3: Ön Cephedeki Sesin Yalıtımı',
      'TS EN ISO 16283-1 Akustik - Yapıların ve Yapı Elemanlarının Ses Yalıtımı İçin Sahada Yapılacak Ölçümler - Bölüm 1: Hava İle Yayılan Sesin Yalıtımı',
      'TS EN ISO 717-1 Akustik - Yapılarda ve Yapı Elemanlarında Ses Yalıtımının Derecelendirilmesi - Bölüm 1: Hava İle Yayılan Sesin Yalıtımı',
      'TS EN ISO 10140-1 Akustik - Yapı elemanlarında ses yalıtımının laboratuvar ölçümü - Bölüm 1: Özel mamuller için uygulama kuralları',
      'TS EN ISO 10140-2 Akustik - Yapı Elemanlarının Ses Yalıtımının Laboratuvarda Ölçülmesi - Bölüm 2: Hava İle Yayılan Ses Yalıtımının Ölçülmesi',
      'TS EN ISO 12354-1 Bina akustiği - Binaların akustik performansının elemanların performansından tayini - Bölüm 1: Odalar arasında hava ile yayılan sesin yalıtımı',
      'TS EN ISO 12354-3 Yapı akustiği - Yapıların akustik performansının elemanların performanslarından hesaplanması - Bölüm 3: Hava ile yayılan dışarıdaki sesin yalıtımı',
      'TS EN ISO 12354-4 Binaların akustiği - Yapıların akustik performansının elemanların performanslarından hesaplanması - Bölüm 4: İçerideki sesin dışarıya iletimi',
      'TS EN ISO 12999-1 Akustik - Yapı Akustiği Ölçüm Belirsizliklerinin Tayini ve Uygulanması - Bölüm 1: Ses Yalıtımı'
    ]
  }),
  'İOK 02 K5': iokAkustik({
    amac: 'Bu kriter ile; her türlü bina, tesis ve işletmenin işletimi ve kullanımı safhalarında binalarda yapı içinde yer alan klima dış üniteleri, merkezi klima sistemleri ve ekipmanları, sıhhi tesisat ekipman ve boruları, asansörler, jeneratörler ve benzeri sistemlerden kaynaklanan veya konutlar arası komşuluk ilişkilerinden doğan hava doğuşlu gürültü seviyelerinin kişilerin huzur ve sükûnuna, beden ve ruh sağlığına olumsuz etkilerini en aza indirecek iyi işitme ve algılama koşullarını yaratacak seviyelere indirilmesi için iç bölme duvarların hava doğuşlu ses yalıtım değerlerinin istenen değerleri karşılaması amaçlanmaktadır.',
    sinif: 'Tablo 2.2.11’de verilen kaynak ve alıcı odasına göre akustik performans sınıflarından', ust: [0, 2, 4],
    ustAd: 'Konut, eğitim ve sağlık binalarında', altAd: 'ofis, otel, alışveriş ve ticaret merkezleri ile diğer binalarda',
    detay: 'Tablo 2.2.11 Kaynak ve Alıcı Odasına Göre Akustik Performans Sınıfı: bina işlevine göre kaynak ve alıcı odası komşuluk ilişkisi için, ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ekindeki kaynak ve alıcı odası özelliklerine göre sağlanacak en düşük hava doğuşlu ses yalıtım değerleri (DnT,A, dB) esas alınacaktır.',
    yontem: iokYalitimYontem('İç bölme duvarlar'),
    kaynaklar: IOK_HAVA_YALITIM_KAYNAK
  }),
  'İOK 02 K6': iokAkustik({
    amac: 'Bu kriter ile; her türlü bina, tesis ve işletmenin işletimi ve kullanımı safhalarında binalarda yapı içinde yer alan klima dış üniteleri, merkezi klima sistemleri ve ekipmanları, sıhhi tesisat ekipman ve boruları, asansörler, jeneratörler ve benzeri sistemlerden kaynaklanan veya konutlar arası komşuluk ilişkilerinden doğan hava doğuşlu gürültü seviyelerinin kişilerin huzur ve sükûnuna, beden ve ruh sağlığına olumsuz etkilerini en aza indirecek iyi işitme ve algılama koşullarını yaratacak seviyelere indirilmesi için döşemelerin hava doğuşlu ses yalıtım değerlerinin istenen değerleri karşılaması amaçlanmaktadır.',
    sinif: 'Tablo 2.2.11’de verilen kaynak odaya göre akustik performans sınıflarından', ust: [0, 2, 4],
    ustAd: 'Konut, eğitim ve sağlık binalarında', altAd: 'ofis, otel, alışveriş ve ticaret merkezleri ile diğer binalarda',
    detay: 'Tablo 2.2.11 Kaynak ve Alıcı Odasına Göre Akustik Performans Sınıfı: bina işlevine göre kaynak ve alıcı odası komşuluk ilişkisi için, ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ekindeki kaynak ve alıcı odası özelliklerine göre sağlanacak en düşük hava doğuşlu ses yalıtım değerleri (DnT,A, dB) esas alınacaktır.',
    yontem: iokYalitimYontem('Döşemeler'),
    kaynaklar: IOK_HAVA_YALITIM_KAYNAK
  }),
  'İOK 02 K7': iokAkustik({
    amac: 'Bu kriter ile; her türlü bina, tesis ve işletmenin işletimi ve kullanımı safhalarında binalarda yapı içinde yer alan klima dış üniteleri, merkezi klima sistemleri ve ekipmanları, sıhhi tesisat ekipman ve boruları, asansörler, jeneratörler ve benzeri sistemlerden kaynaklanan veya konutlar arası komşuluk ilişkilerinden doğan darbe kaynaklı gürültü seviyelerinin kişilerin huzur ve sükûnuna, beden ve ruh sağlığına olumsuz etkilerini en aza indirecek iyi işitme ve algılama koşullarını yaratacak seviyelere indirilmesi için döşemelerin darbe kaynaklı ses yalıtım değerlerinin istenen değerleri karşılaması amaçlanmaktadır.',
    sinif: 'Tablo 2.2.12’de verilen kaynak odaya göre akustik performans sınıflarından', ust: [0, 2, 4],
    ustAd: 'Konut, eğitim ve sağlık binalarında', altAd: 'ofis, otel, alışveriş ve ticaret merkezleri ile diğer binalarda',
    detay: 'Tablo 2.2.12 Kaynak Odaya Göre Akustik Performans Sınıfı: bina işlevine göre kaynak odası (üst kat) için, ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ekindeki farklı bina tiplerinde kaynak odası döşemelerinde sağlanacak en yüksek darbe sesi düzeyleri (L’nT,w, dB) tablosundaki değerler esas alınır.',
    yontem: [
      'Döşemeler ve bileşenlerinin akredite laboratuvarda ölçülmüş darbe sesi basınç düzeyi Ln değerleri spektral veya ağırlıklı düzeyler Ln,w olarak bir veri tabanında beyan edilmiş ise bu değerler kullanılabilir. Döşemelerin ses yalıtım değerlerinin laboratuvarda ölçülmesi TS EN ISO 10140-2 standardına göre yapılacaktır.',
      'Ölçüm sonuçları ya da bir veri tabanı bulunmuyorsa; darbe sesi basınç düzeyi Ln değerleri spektral veya ağırlıklı düzeyler Ln,w olarak, sesin doğrudan iletimi için kabul görmüş bilimsel yöntemler veya bu yöntemlere dayalı yazılımlar kullanılarak hesaplanabilir. Döşemelerin ses yalıtım performansları, birleşim bölgelerinin özelliklerine bağlı olarak sesin yanal yollarla iletimini de hesaba katarak TS EN 12354-1 ve 2 standartlarının ilgili bölümlerine uygun olarak hesaplanır.',
      'Alanda veya laboratuvarda spektral olarak ölçülen darbe sesi basınç düzeyi Ln değerlerinin ağırlıklı düzeyler Ln,w olarak derecelendirilmesinde TS EN ISO 717-2 standardı kullanılacaktır.',
      'Uygulanacak ses yalıtımlı yapı elemanları akustik projede liste halinde, detayları ve hesaplanan akustik performans değerleri ile birlikte verilir. Uygulama ilkeleri akustik raporda açıklanır.',
      'İyileştirme değerlerini sağlayacak ek katmanlar, TS EN 12354-1 ve 2’ye göre yapılacak hesaplamalar ile malzeme ve konstrüksiyon olarak belirlenecektir. L’nT,w ses yalıtım değerlerini sağlayacak yapı elemanlarının belirlenmesi için yardımcı dokümanlar kullanılabilir.',
      '• Hesaplama ve tasarımlar hedeflenen akustik performans sınıfı değerlerinin olumlu yönde 2 dB üstüne göre yapılmalıdır.',
      '• Akustik proje ve mimari proje kapsamında akustik birleşim detayları çizilecektir.',
      '• Mevcut ve yeni bina değerlendirmelerinde alanda yapılacak ses yalıtım testleri ‘Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik’ ile TS EN ISO 16283-2 standardına uygun olarak yapılacaktır.',
      '• Ölçümlerde ISO 12999-1’e uygun olarak belirsizlik değerleri verilecektir.',
      'Özel durumlar için gürültü kaynaklarına ve mekanların iç akustik isteklerine bağlı olarak istenen yalıtım değerleri, bina akustiği uzmanı tarafından ayrıca hesaplanır ve yapı elemanı ile detaylar bu değere göre belirlenir.'
    ],
    kaynaklar: [
      'Binaların Gürültüye Karşı Korunması Hakkında Yönetmelik',
      'TS EN 12354-2 Bina akustiği - Binaların akustik performansının elemanların performansından tayini - Bölüm 2: Odalar arasında darbe sesinin yalıtımı',
      'TS EN ISO 717-2 Akustik - Yapılarda ve Yapı Elemanlarında Ses Yalıtımının Derecelendirilmesi - Bölüm 2: Darbe Sesi Yalıtımı',
      'TS EN ISO 10140-3 Akustik - Yapı Elemanlarının Ses Yalıtımının Laboratuvarda Ölçülmesi - Bölüm 3: Darbe Sesi Yalıtımının Ölçülmesi',
      'TS EN ISO 12354-1 Bina akustiği - Binaların akustik performansının elemanların performansından tayini - Bölüm 1: Odalar arasında hava ile yayılan sesin yalıtımı',
      'TS EN ISO 12999-1 Akustik - Yapı Akustiği Ölçüm Belirsizliklerinin Tayini ve Uygulanması - Bölüm 1: Ses Yalıtımı',
      'TS EN ISO 16283-2 Akustik - Yapı Elemanlarında ve Yapılarda Ses Yalıtımının Alan Ölçümü - Bölüm 2: Darbe Sesi Yalıtımı'
    ]
  }),

  // ---- İOK 03 Isıl Konfor (eğitim ve sağlık binalarında zorunlu: en az PPD < %15 kademesi)
  'İOK 03 K1': {
    amac: [
      'İç mekanda kullanıcıların ısıl açıdan konforlu olduğunun, uluslararası standartlara uygun şekilde gösterilmesi amaçlanmaktadır.',
      'Düzenli olarak kullanılan tüm mahaller için ‘Fanger Metodu’na göre hesaplanan PPD indisinin standartlarca belirtilen sınır değerin altında olduğunun gösterilmesi ve PMV indisinin TS EN ISO 7730 standardında belirtilen koşulları sağlaması beklenmektedir.'
    ],
    kanit: 'Isıl konfor analiz raporu ekle',
    not: 'Ulaşılan en yüksek PPD / PMV kademesini işaretleyin; alt kademeler kendiliğinden işaretlenir.',
    gerek: [
      { no: 1, text: 'Isıl konfor analizlerinin TS EN ISO 7730 standardında açıklanan ‘Fanger Metodu’na göre yapılması; binanın düzenli olarak kullanılan tüm mahalleri için PPD ve PMV indislerinin hesaplanması.', durum: ['Y', 'M'] },
      { no: 2, text: 'PPD < %15 ve −0,7 < PMV < +0,7', durum: ['Y', 'M'] },
      { no: 3, text: 'PPD < %10 ve −0,5 < PMV < +0,5', durum: ['Y', 'M'] },
      { no: 4, text: 'PPD < %6 ve −0,2 < PMV < +0,2', durum: ['Y', 'M'], tip: [2, 4] }
    ],
    detay: [
      'Kredi tabloları (Konut / Ofis / Eğitim / Otel / Sağlık / AVM / Diğer):',
      '• Yeni bina (Tablo 2.2.14) — PPD < %15: 12 / 8 / Zorunlu-4 / 8 / Zorunlu-4 / 8 / 8; PPD < %10: 28 / 25 / 8 / 26 / 10 / 25 / 25; PPD < %6: – / – / 25 / – / 25 / – / –',
      '• Mevcut bina (Tablo 2.2.15) — PPD < %15: 14 / 10 / Zorunlu-5 / 10 / Zorunlu-5 / 10 / 10; PPD < %10: 28 / 25 / 10 / 26 / 10 / 25 / 25; PPD < %6: – / – / 25 / – / 25 / – / –',
      'Görsel Konfor ve Isıl Konfor temalarında sanayi alanlarında üretim faaliyetleri yürütülen binaların sadece idari bölümleri değerlendirilir.'
    ],
    kural: 'tiers', must: [1],
    tiers: [
      { no: 2, cr: { Y: [12, 8, 4, 8, 4, 8, 8], M: [14, 10, 5, 10, 5, 10, 10] } },
      { no: 3, cr: { Y: [28, 25, 8, 26, 10, 25, 25], M: [28, 25, 10, 26, 10, 25, 25] } },
      { no: 4, cr: { Y: [28, 25, 25, 26, 25, 25, 25], M: [28, 25, 25, 26, 25, 25, 25] } }
    ],
    kuralText: 'Tablo 2.2.14 (yeni) ve Tablo 2.2.15’te (mevcut) belirtilen PPD ve PMV koşullarının sağlanmasıyla ilgili kredi alınır. Eğitim ve sağlık binalarında PPD < %15 ve −0,7 < PMV < +0,7 koşulunun sağlanması zorunludur.',
    yontem: 'Isıl konfor hesaplamaları, ısıl modelleme araçları aracılığıyla gerçekleştirilebilmektedir. PMV ve PPD indisleri için hesaplanan değerlere karşılık gelen kredi miktarları yeni binalar için Tablo 2.2.14’te, mevcut binalar için ise Tablo 2.2.15’te sunulmuştur.',
    belgeler: 'Her bir ısıl zon için ‘Fanger Metodu’na göre yapılan değerlendirmeler sonucunda belirtilen koşulların sağlandığını gösteren, konunun uzmanı tarafından hazırlanmış doküman.',
    kaynaklar: [
      'TS EN ISO 7730 Orta Dereceli Termal Ortamlar - PMV ve PPD İndislerinin Tayini Termal Rahatlık İçin Şartların Belirlenmesi',
      'TS EN 16798-1 Binaların enerji performansı - Binalar için havalandırma - Bölüm 1: İç ortam hava kalitesi, termal ortam, aydınlatma ve akustik için iç ortam çevresel girdi parametreleri - Modül M1-6',
      'TS 2164 Kalorifer Tesisatı Projelendirme Kuralları',
      'TS EN ISO 6946 Yapı Bileşenleri ve Yapı Elemanları - Isıl Direnç ve Isıl Geçirgenlik - Hesaplama Metodu',
      'TS EN ISO 52016-1 Binaların enerji performansı - Isıtma ve soğutma, iç sıcaklıklar ve duyulur ve gizli ısı yükleri için enerji gereksinimleri - Bölüm 1: Hesaplama prosedürleri'
    ],
    tanimlar: [
      ['Düzenli olarak kullanılan mahal', 'En az 30 dakika boyunca kullanıcısı olan mahallerdir.'],
      ['Isıl Memnuniyetsizlik Yüzdesi (PPD indisi)', 'Aynı ortamdaki kullanıcılar arasında, ısıl açıdan memnuniyetsiz durumda olanların oranını yüzdesel olarak ifade eden bir parametredir.'],
      ['Ortalama Isıl Duyu Göstergesi (PMV indisi)', 'Aynı ortamdaki çok sayıda kullanıcının bulundukları ortamda, ısıl açıdan nasıl hissettikleri ile ilgili ortalama değeri içeren bir parametredir (örneğin; +3 sıcak, 0 nötr, −3 soğuk hissedildiği anlamını taşır).']
    ]
  },

  // ---- İOK 04 Hava Kalitesi (konut dışı binalarda zorunlu)
  'İOK 04 K1': {
    amac: 'Yeşil binalarda iç mekan konforunu sağlayacak ve kullanıcı sağlığını koruyacak ölçüde, standartlara uygun miktarda taze hava girişinin sağlanması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    not: 'Taze hava teminine göre (1) ve / veya (2) numaralı gerekliliği işaretleyin.',
    gerek: [
      { no: 1, text: 'Mekanik havalandırma: TS EN 16798-1 standardına uygun taze hava miktarının sağlandığının izleneceği bir düzeneğin kurulmuş olması ve taze hava miktarının bu standart değerden −%10 sapması durumunda düzeneğin alarm verecek şekilde planlanmış olması.', durum: ['Y', 'M'] },
      { no: 2, text: 'Doğal havalandırma: CO₂ sensörünün olması ve sensörün ilgili standartlara göre sınır değer (örneğin 1000 ppm) aşıldığında alarm verecek şekilde ayarlanmış olması.', durum: ['Y', 'M'] },
      { no: 3, text: 'Doğal havalandırmanın uygulanabilir olduğu durumlarda binada mümkün olduğu kadar doğal havalandırma kullanılması; mümkün olmadığı durumlarda (dış hava kirliliği, gürültü, rüzgar, güvenlik vb.) gerekçelendirilerek mekanik havalandırma kullanılması.', durum: ['Y', 'M'], tip: [1, 2, 3, 4, 5, 6] }
    ],
    kural: 'min', must: [3], pick: { of: [1, 2], min: 1 },
    kuralText: 'Konut binalarında taze hava temininin mekanik ve/veya doğal havalandırma yoluyla (1) ya da (2) numaralı gerekliliğe uygun sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır. Konut dışı binalarda bu kriterden puan almak zorunlu olup, ilk iki gereklilikten birinin sağlanması ve (3) numaralı gerekliliğin yerine getirilmesi koşuluyla yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Temel olarak TS EN 16798-1 standardında tanımlanan yöntemler izlenecek ve gerektiğinde kaynaklar bölümünde verilen diğer kaynaklardan da yararlanılacaktır.',
    belgeler: [
      '• Taze hava temini mekanik havalandırma ile yapılıyorsa; taze hava miktarının nasıl hesaplandığına ve havalandırma sisteminin TS EN 16798-1 standardına uygun olarak yapıldığına dair bilgileri içeren rapor ile taze hava miktarını izleyen düzeneğin projesi,',
      '• Taze hava temini doğal havalandırma yoluyla yapılıyorsa; açılır pencerelerin ve CO₂ sensörünün gösterildiği projeler, doğal havalandırma hesapları veya simülasyon sonuçlarının raporu (alternatif olarak kritere uygunluğu gösteren hava akış analiz detayları (CFD analizleri) da kabul edilir),',
      '• Doğal havalandırmanın kullanılıp kullanılamayacağına ilişkin değerlendirme raporu: mekanik havalandırma kullanılan mekanlarda doğal havalandırmanın neden kullanılmadığı, doğal havalandırma kullanılan mekanlarda ise herhangi bir sakınca bulunmadığı belirtilmeli; raporu destekleyici bilgiler (hava kirliliği haritaları vb.) eklenmelidir.'
    ],
    kaynaklar: [
      'Hava Kalitesi Değerlendirme ve Yönetimi Yönetmeliği',
      'TS EN 16798-1 Binaların enerji performansı - Binalar için havalandırma - Bölüm 1: İç ortam hava kalitesi, termal ortam, aydınlatma ve akustik için iç ortam çevresel girdi parametreleri - Modül M1-6',
      'TS EN 12599 Binalarda Havalandırma - Havalandırma ve İklimlendirme Sistemlerinin Üzerindeki Deney İşlemleri ve Ölçme Metotları',
      'TS EN ISO 16890-1 Genel havalandırma için hava filtreleri',
      'TS CR 1752 Havalandırma - Binalar İçin - Bina İçi Ortamlar İçin Tasarım Kuralları',
      'CIBSE AM10 ‘Natural Ventilation in Non-Domestic Buildings’'
    ],
    tanimlar: [['CFD (Hesaplamalı Akışkanlar Dinamiği) analizi', 'Akışkanların fiziksel etkileşimlerinin matematiksel metotlarla bilgisayar üzerinde modellenerek sayısal olarak hesaplandığı bir simülasyon yöntemidir.']]
  },

  // ==== YMD Yapı Malzemesi ve Yaşam Döngüsü (kılavuz: ymd.docx)
  // ---- YMD 01 Yaşam Döngüsü Değerlendirmesi (YDD) ve Çevresel Ürün Beyanı (ÇÜB)
  'YMD 01 K1': {
    amac: 'Yapı malzemesinin en az ‘Beşikten-kapıya’ ‘Yaşam Döngüsü Değerlendirilmesi’nin hazırlanması ile çevresel açıdan tercih edilebilir; yaşam döngüsü boyunca çevre etkisi en aza indirilmiş ürün ve malzemelerin kullanılmasının teşvik edilmesidir.',
    kanit: 'Kanıt belgeleri ekle',
    not: 'Yöntem 1’de ulaşılan ürün sayısını işaretleyin (alt kademeler kendiliğinden işaretlenir). Ürüne özgü Tip III ÇÜB veya çevre etiketi olan ürün 1, endüstri çapında genel (jenerik) ÇÜB olan ürün 0,5 sayılır. Yöntem 2 ayrı bir seçenektir.',
    gerek: [
      { no: 1, head: true, text: 'Yöntem 1 – Çevresel Ürün Beyanları veya Sertifikaları: en az üç farklı üreticiden sağlanmış, ÇÜB veya ilgili çevre belgesi (Çevre Etiketi, EU Ecolabel, natureplus, cradle to cradle, FSC, PEFC, CSC vb.) olan malzeme / ürün sayısı:', durum: ['Y', 'M'] },
      { no: '1.1', sub: true, text: '6 farklı malzeme / ürün', durum: ['Y', 'M'] },
      { no: '1.2', sub: true, text: '7 farklı malzeme / ürün', durum: ['Y', 'M'] },
      { no: '1.3', sub: true, text: '8 farklı malzeme / ürün', durum: ['Y', 'M'] },
      { no: '1.4', sub: true, text: '9 farklı malzeme / ürün', durum: ['Y', 'M'] },
      { no: '1.5', sub: true, text: '10 veya daha fazla malzeme / ürün', durum: ['Y', 'M'] },
      { no: 2, text: 'Yöntem 2 – Malzemelerin / ürünlerin toplam maliyetinin en az %50’si için, küresel ısınma potansiyeli zorunlu olmak üzere en az 3 çevre etkisi kategorisi dikkate alınarak en az ‘Beşikten-kapıya’ Yaşam Döngüsü Değerlendirmesi sunulması ve çevre etkisinin endüstri ortalamasının altında kalması.', durum: ['Y', 'M'] }
    ],
    kural: 'tiers', must: [],
    tiers: [
      { no: '1.1', cr: cr7(13, 6) }, { no: '1.2', cr: cr7(16, 7) }, { no: '1.3', cr: cr7(19, 8) },
      { no: '1.4', cr: cr7(22, 9) }, { no: '1.5', cr: cr7(25, 10) },
      { no: 2, cr: cr7(25, 10), ayri: true }
    ],
    detay: [
      'Tablo 2.3.3 – ÇÜB veya ilgili çevre belgeleri olan malzeme / ürün sayısına göre krediler (yeni / mevcut bina):',
      '• 6 farklı malzeme / ürün: 13 / 6,',
      '• 7 farklı malzeme / ürün: 16 / 7,',
      '• 8 farklı malzeme / ürün: 19 / 8,',
      '• 9 farklı malzeme / ürün: 22 / 9,',
      '• 10 veya daha fazla malzeme / ürün: 25 / 10.'
    ],
    kuralText: 'Yöntem 1 kapsamında yeni ve mevcut binalar için Tablo 2.3.3’te belirtildiği şekilde kredilendirme yapılır. Yöntem 2 kapsamında gerekliliklerin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Aşağıda belirtilen yöntemler doğrultusunda, hazırlanmış dokümanın temin edilmesi ve bu dokümanda yer alan ‘Yaşam Döngüsü Değerlendirmesi’nin üretilmesi gerekir.',
      'Yöntem 1. Çevresel Ürün Beyanları veya Sertifikaları',
      'Bina projesine tespit edilmiş en az üç farklı üreticiden sağlanmış; en az altı farklı malzeme / ürün, ilgili standartlarda belirtilen Çevresel Ürün Beyanları (ÇÜB) veya Çevre Etiketi Yönetmeliği kapsamında verilen Çevre Etiketi, EU ECO LABEL (eko-etiket), NATUREPLUS, beşikten beşiğe (cradle to cradle), FSC, PEFC, CSC gibi bir çevre etiketine sahip olmalıdır. Bu dokümanlar; bağımsız değerlendirme raporlarını, değerlendirme sonucunu, değerlendiricinin ismini, iletişim adresini, değerlendirme veya sertifikalandırma tarihini içermelidir.',
      'Yöntem 1.1. Endüstri Çapında Tip III Genel (Jenerik) Çevresel Ürün Beyanı (ÇÜB): Bina projesinde tespit edilmiş malzemelerin / ürünlerin, TS ISO 14025, TS ISO 21930, TS EN 15804 esas alınarak en az ‘Beşikten-kapıya’ Endüstri Çapında Tip III Genel (Jenerik) ÇÜB’nin hazırlanması gerekmektedir. Bu yöntemin uygulanmasıyla bir ürün, hesaplamaya 0,5 ile çarpılarak katkı sağlar.',
      'Yöntem 1.2. Ürüne Özgü Tip III Çevresel Ürün Beyanı (ÇÜB): Bina projesinde tespit edilmiş malzemelerin / ürünlerin, TS ISO 14025, TS ISO 21930, TS EN 15804, CEN TR 15941, EN 15942 esas alınarak en az ‘Beşikten-kapıya’ Ürüne Özgü Tip III ÇÜB’nin veya ilgili çevre belgelerinin (Çevre Etiketi, EU ECO LABEL, NATUREPLUS, cradle to cradle, FSC, PEFC, CSC gibi) olması gerekmektedir. Bu yöntemin uygulanmasıyla bir ürün, hesaplamaya tam katkı sağlar.',
      'Yöntem 2. Yapı Malzemesi / Ürünün Yaşam Döngüsü Çevre Etkisinin Endüstri Ortalamasının Altında Kalması',
      'Bina projesinde tespit edilmiş malzemelerin / ürünlerin toplam maliyetinin en az %50’sinin, aşağıdaki çevre etkisi kategorilerinden küresel ısınma potansiyel etkisi zorunlu olmak koşuluyla en az 3 tanesi göz önünde bulundurularak; en az ‘Beşikten-kapıya’ ‘Yaşam Döngüsü Değerlendirmesi’nin sunulması gerekmektedir. Malzemelerin / ürünlerin çevre etkisi endüstri ortalamasının altında olmalıdır. Etki kategorileri:',
      '• Küresel Isınma Potansiyeli (sera gazları), kg CO₂-eşdeğer,',
      '• Stratosferik Ozon Tabakasının İncelmesi, kg CFC-11-eşdeğer,',
      '• Toprak ve Su Kaynaklarındaki Asitleşme, kg SO₂-eşdeğer,',
      '• Ötrifikasyon, kg (PO₄)³⁻-eşdeğer,',
      '• Fotokimyasal Ozon Oluşumu, NOx ya da etan, kg etan-eşdeğer,',
      '• Cansız Çevreye Ait Kaynakların Tüketimi, kg Sb-eşdeğer,',
      '• Yenilenebilir Olmayan Enerji Kaynaklarının Tüketimi, MJ.'
    ],
    belgeler: 'ÇÜB veya ilgili çevre belgeleri / YDD raporları',
    kaynaklar: [
      'Çevre Etiketi Yönetmeliği',
      'TS EN ISO 14040 Çevre Yönetimi - Hayat Boyu Değerlendirme - İlkeler ve Çerçeve',
      'TS EN ISO 14044 Çevre yönetimi - Yaşam döngüsü değerlendirmesi - Gereksinimler ve kurallar - Tadil 2',
      'TS EN 15804+A2/AC Yapıların Sürdürülebilirliği - Mamullere İlişkin Çevresel Beyanlar - Yapı Mamullerinin Mamul Kategorisi İçin Ana Kurallar',
      'TS ISO 14025 Çevre Etiketleri ve Beyanları - Tip III Çevre Beyanları - Prensipler ve Prosedürler',
      'TS ISO 21930 Yapılarda ve inşaat mühendisliği işlerinde sürdürülebilirlik - Yapı malzemelerinin ve hizmetlerinin çevresel beyanları için temel kurallar',
      'TS EN 15942 Yapı İşlerinin Sürdürülebilirliği - Çevresel Mamul Beyanı - İşletmeler Arası İletişim Formatı',
      'TS EN 14049 Su uygulamalarının yoğunluğu (şiddeti) - Hesaplama yöntemi ve ölçme metodları',
      'FSC: Forest Stewardship Council',
      'PEFC (Programme for the Endorsement of Forest Certification): Orman Sertifikasyonu Onaylama Programı sertifikasyonu',
      'CSC (Beton Sürdürülebilirlik Konseyi): Beton sektörü ve beton bileşenleri (tedarik zinciri: çimento ve agrega) için tüm dünyada kabul gören bir ürün belgelendirme sistemidir.'
    ],
    tanimlar: [
      ['Çevresel Ürün Beyanı (ÇÜB)', 'Ürünlerin yaşam döngüsü boyunca sebep olduğu çevre etkisi hakkında şeffaf ve kıyaslanabilir bilgi sunan, bağımsız olarak değerlendirilen ve onaylanan belgedir. Bir ürünün ÇÜB belgesine sahip olması, ürünün çevre etkisinin mükemmel olduğunu göstermez; ürünün çevre etkisini şeffaf bir şekilde bildirir. ÇÜB içinde yer alan bilginin bağımsız üçüncü taraf hakemlerce tahkik edilmesi bir önkoşuldur. Bir danışma kurulu tarafından belirlenmiş hakemlerin; deney ve sertifika enstitülerinden, bilim ve standartlaşma konusundaki uzmanlardan oluşması gerekmektedir. Hakemler ayrıca; ilgili standartlar esas alınarak oluşturulmuş ürünlerin Yaşam Döngüsü Değerlendirmesi (YDD) konusunda uzman olmalı; üretici tarafından teslim edilen ÇÜB belgesinin inandırıcılığını, tutarlılığını, tamlığını, veri ve hesaplamaların şeffaflığını kontrol edebilmeli ve raporunu hazırlayabilmelidir.'],
      ['Endüstri Çapında Genel (Jenerik) Çevresel Ürün Beyanı', 'Endüstri çapında genel ÇÜB’ler üçüncü taraflarca gözden geçirilip onaylanarak sertifikalandırılırlar. Bu endüstri çapındaki bildirimler, örneğin beton gibi genel bir ürün tipine özgü olup; belirli bir üreticiye veya şirkete ait değildir. Öte yandan, üreticiye ait bir ürünün endüstri çapında genel ÇÜB sertifikası alabilmesi için; sertifikada üreticinin temsiliyeti gereklidir. Bu da ÇÜB program işletmecisinin aracılığıyla gerçekleştirilir.'],
      ['Ürüne Özgü Tip III Çevresel Ürün Beyanı', 'Ürüne özgü tip III ÇÜB’leri, üçüncü taraflarca gözden geçirilip onaylanarak sertifikalandırılırlar. Bununla birlikte, ürüne özgü bildirimler genel (jenerik) ÇÜB’lerin aksine, belirli bir üreticiye özgüdür ve sanayinin geri kalanındaki uygulamaları yansıtma zorunluluğu yoktur. Ürünün ÇÜB sertifikası alabilmesi için; sertifikada üreticinin temsiliyeti gereklidir. Bu da ÇÜB program işletmecisinin aracılığıyla gerçekleştirilir.'],
      ['Program İşletmecisi', 'TS ISO 14025’e göre Tip III Çevresel Ürün Beyanı’nı ortaya koyan kuruluştur. Örneğin; şirket veya şirketler grubu, endüstriyel sektör veya ticari birlik, kamu kurum ve kuruluşları ya da bağımsız bilimsel kuruluşlar veya diğer organizasyonlardır.'],
      ['Yaşam Döngüsü Değerlendirmesi (YDD)', 'Bir bina sistemine, binanın yaşam döngüsü boyunca giren ve çıkan çevreye zarar verebilecek etmenlerin ve miktarlarının derlenmesi ve sebep olduğu potansiyel çevre etkilerinin değerlendirilmesidir. YDD; bir binanın yaşam döngüsü boyunca, örneğin doğal kaynakların kullanılması ya da çevreye salınan her türlü salım gibi; çevreyle ilişkili konularını ve potansiyel çevre etkilerini işaret eder. Malzemenin yaşam döngüsü, beşikten mezara, hammaddenin çıkarılması, üretilmesi, yapım, kullanım, işletim, yaşam sonrası iyileştirme, geri dönüşüm ve en son atım (yaşamının sona ermesi) aşamalarını kapsar. Amaç malzemenin yaşam döngüsü boyunca çevre performansının geliştirilebilmesi için olanakları belirlemektir.']
    ]
  },

  // ---- YMD 02 Sağlıklı Ürün Beyanı (SÜB)
  'YMD 02 K1': {
    amac: 'Hava kalitesine, insan sağlığına, verimliliğe ve çevreye zarar veren kimyasal kirleticilerin yoğunluğunu azaltmak amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Bina projesinde iç ortamda, yüzeysel bölgelerdeki en son katmanda bulunan malzemelerin / ürünlerin içerdikleri UOB miktarlarının, iç ortama yaydıkları UOB salımlarının ve bu salımların hangi deneysel yöntemle tespit edildiğinin beyan edilmesi; UOB salımlarının ilgili standartlarda belirtilen sınır değerlerin altında olması.', durum: ['Y', 'M'] }],
    detay: [
      'Tablo 2.3.5 – Uçucu Organik Bileşik (UOB) içeren malzemeler ve uygun test standartları:',
      '• Yapıştırıcılar ve dolgu malzemeleri (halı, elastomer ve ahşap döşeme kaplama yapıştırıcıları; dolgu tutkalları; seramik plaka yapıştırıcıları; duvar panelleri ve tutkalları; sprey tutkallar; yapıştırıcı astarları; akustik, yangın kesici ve HVAC kanalı contaları; conta astarları ve dolgu macunları): TS EN 13999-1,',
      '• Boyalar ve kaplamalar (anti-pas, bodrum, beton / duvar sızdırmazlık ve yangına dayanıklı kaplamalar; beton kürleme bileşikleri; döşeme son kat ve endüstriyel bakım kaplamaları; vernikler; taş sağlamlaştırıcıları; yüzme havuzu kaplamaları; su yalıtım membranları; ahşap koruyucu ve kaplamaları; çinko astarlar vb.): TS EN 13300 veya EU Directive 2004/42/CE, TS EN ISO 11890-2,',
      '• Döşeme kaplama malzemeleri (halılar, sert yüzeyli kaplamalar): TS EN 14041, TS EN ISO 16000-9,',
      '• Kompozit ahşap, taşıyıcı ahşap paneller ve tarımsal lifli paneller (yonga levha, MDF, HDF, LDF, OSB, kontrplak, çimentolu lif levha, masif ahşap plaka, akustik lif levha vb.): TS EN 717-1, TS ISO 16000-3, TS EN ISO 16000-7, TS EN ISO 16000-9,',
      '• Tavan ve duvar sistemleri (tavan ve duvar yalıtımı, akustik tavan panelleri, kendinden yapışkanlı duvar panelleri, alçıpaneller, duvar kaplamaları): TS ISO 16000-3, TS EN ISO 16000-7, TS EN ISO 16000-9, TS EN 233, TS EN 234, TS 5228-3-1 EN 259-1, TS EN 12149.',
      'Yapıştırıcılar, dolgu malzemeleri, boyalar, incelticiler vb.’nin ortama saldığı gazlarla ilgili örnek referans değerler, Çevre, Şehircilik ve İklim Değişikliği Bakanlığı Mesleki Hizmetler Genel Müdürlüğü’nün yayımladığı “Kamu Binalarının Enerji Verimli Yenilenmesine Yönelik Rehber” Ek-7.1.3.2 Uçucu Bileşenler ve Kirleticiler Kontrol Formu Örneği’nde verilmiştir.'
    ],
    kural: 'all',
    kuralText: 'Kriterin gerekliliklerinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'UOB salım türleri, bunların iç ortamda mekanın işlevine göre değişen sınır değerleri ve salım miktarı sınır değerleri; standartlarda verilen gereklilikleriyle uyumlu olacak şekilde üreticisi tarafından belgelendirilmeli veya yerinde ölçülmelidir (Tablo 2.3.5).',
      'Tuğla, doğal taş, beton, seramik, cam, metal yüzeyler vb. gibi doğası gereği UOB yaymayan ürünlerin değerlendirilmesine gerek yoktur; organik bazlı kaplamalar, bağlayıcılar veya dolgu macunları üretimlerinde veya cilalarında kullanılır. Ölçüm yapılması durumunda binada kullanılan bu malzemelerin tamamını kapsayan mekan / mekanlarda ölçüm yapılmalıdır.'
    ],
    belgeler: 'Malzemelerle ilgili üreticiden alınmış teknik şartnameler veya malzemelere / ürünlere ait UOB salım değerlerini gösteren belgeler veya TÜRKAK tarafından iç ortamlarda UOB ölçümü alanında akredite olmuş bir ölçüm firması tarafından yapılan ölçüm sonuçları.',
    kaynaklar: [
      'TS EN 13999 Yapıştırıcılar - Organik Çözücü İçermeyen veya Düşük Oranda İçeren Yapıştırıcıların Uygulamadan Sonra Emisyon Özelliklerinin Ölçülmesi İçin Kısa Süreli Yöntem - Bölüm 1: Genel İşlemler',
      'TS EN 13300 Boyalar ve vernikler - İç mekan duvar ve tavanlarında kullanılan boyalar ve vernikler - Sınıflandırma',
      'AB Direktifi 2004/42/CE',
      'TS EN ISO 11890-2 Boyalar ve vernikler - Uçucu organik bileşenler (VOC) ve yarı uçucu organik bileşenler (SVOC) içeriğinin tayini - Bölüm 2: Gaz kromatografi yöntemi',
      'TS EN 717-1 Ahşap Esaslı Levhalar - Formaldehit Salınımının Tayini - Bölüm 1: Oda Metodu İle Formaldehit Yayılması',
      'TS ISO 16000-3 İç Mekân Havası - Bölüm 3: Formaldehit ve Diğer Karbonil Bileşiklerinin Tayini - Aktif Numune Alma Yöntemi',
      'TS EN ISO 16000-7 İç Mekan Havası - Bölüm 7: Havadaki Asbestli Elyaf Derişimlerinin Tayini İçin Numune Alma Stratejisi',
      'TS EN ISO 16000-9 İç Mekan Havası - Bölüm 9: Yapı Malzemelerinden ve Mobilyalardan Uçucu Organik Bileşik Emisyonlarının Tayini - Emisyon Deney Odası Metodu',
      'TS EN 233 Duvar Kaplamaları - Rulo Hâlinde - Son İşlemi Tamamlanmış Duvar Kâğıtları, Duvar Vinilleri ve Plâstik Duvar Kaplamalarının Özellikleri',
      'TS EN 234 Duvar kaplamaları - Rulo halinde - Sonradan dekore edilen duvar kaplamalar için özellikler',
      'TS 5228-3-1 EN 259-1 Duvar kaplamaları - Rulo halinde - Ağır hizmet duvar kaplamaları - Bölüm 1: Özellikleri',
      'TS EN 12149 Duvar Kaplamaları - Rulo Halinde - Ağır Metaller ve Bazı Diğer Elementler İle Açığa Çıkan Formaldehit ve Vinilklorür Tayini',
      'Kamu Binalarının Enerji Verimli Yenilenmesine Yönelik Rehber (https://meslekihizmetler.csb.gov.tr/kamu-binalarinin-enerji-verimli-yenilemesine-yonelik-rehber-i-99595)'
    ],
    tanimlar: [['Uçucu Organik Bileşik (UOB)', 'Bazı katı veya sıvılardan gaz olarak salınan uçucu organik bileşikler; bazıları uzun bazıları kısa dönemde olumsuz sağlık etkileri yaratabilen çeşitli kimyasalları içerirler. UOB’lerin iç ortamdaki yoğunlukları dış ortama nazaran yaklaşık 10 kat daha yüksek olabilmektedir. UOB’ler sayısı binleri bulan geniş çeşitlilikteki ürünlerden yayılabilmektedir.']]
  },
  'YMD 02 K2': {
    amac: 'Yaşam döngüsü boyunca kimyasal içerikleri açısından çevreye zararlı etkisi olmayan malzeme ve ürünlerin kullanımının teşvik edilmesi amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Bina projesinde bulunan malzemelerin / ürünlerin toplam maliyetinin en az %20’sinin zararlı kimyasal içeriklerinin kabul görmüş bir yöntem ile belirtilmesi.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Kriterin gerekliliklerinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Kimyasal içerikli malzemelere ait Sağlık Ürün Beyanları (SÜB) veya Malzeme Güvenlik Bilgi Formları (MGBF) temin edilmelidir.',
    belgeler: 'İlgili standart ve salım limitlerinin yer aldığının ve sağlandığının belirtildiği, üreticiden temin edilen SÜB’ler veya MGBF’ler.',
    kaynaklar: [
      'Kimyasalların Kaydı, Değerlendirmesi, İzni ve Kısıtlanması Hakkında Yönetmelik (Avrupa Komisyonunun 1907/2006 sayılı REACH Tüzüğü’nü Türkiye’de uyumlaştıran yönetmelik)',
      'Zararlı Maddeler ve Karışımlara İlişkin Güvenlik Bilgi Formları Hakkında Yönetmelik'
    ],
    tanimlar: [
      ['Sağlık Ürün Beyanı (SÜB)', 'Resmi otoriteler ve bilimsel birlikler tarafından yayınlanmış “yasaklanmış madde, kısıtlanmış madde, izne tabi aday madde ve izne tabi madde” listeleriyle kıyaslayarak malzeme içeriğindeki dikkat edilmesi gereken potansiyel kimyasalların tamamen açıkça bildirilmesini sağlar. SÜB’de, ürün içinde yer alan mevcut maddelerin %100 oranında beyan edilmesi veya ürün içindeki en düşük 1000 ppm’e kadar olan bilinen zararları %100 oranında beyan etmesi gerekmektedir.'],
      ['Malzeme Güvenlik Bilgi Formu (MGBF)', 'Piyasaya arz edilen zararlı maddelerin ve karışımların, insan sağlığı ve çevre üzerinde yaratabilecekleri olumsuz etkilere karşı etkin kontrol ve gözetimi sağlamak üzere geliştirilen güvenlik bilgi formları.']
    ]
  },

  // ---- YMD 03 Radyasyon Kontrolü
  'YMD 03 K1': {
    amac: 'Bina kullanıcılarının yapı içinde maruz kaldığı doğal radyasyon seviyesinin azaltılması ve toplum üyelerinin alacağı radyasyonun mümkün olan en düşük seviyede tutulması amacıyla radon gazının binaya girişinin kontrolü amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Yöntem 1: Yapılan ölçüm sonucunda radon konsantrasyon seviyesinin yıllık ortalama olarak 300 Bq/m³ değerini aşmaması. Ölçüm yapacak kuruluşun akredite veya radon ölçümü konusunda uluslararası karşılaştırma çalışmasına katılmış kuruluş olması gerekir.', durum: ['Y', 'M'] },
      { no: 2, text: 'Yöntem 2: Malzeme ve ürünün ilgili standartlarla belirlenen sınır değerlerini aşmadığının belgelendirilmesi.', durum: ['Y', 'M'] }
    ],
    kural: 'any',
    kuralText: 'Yöntemlerden herhangi birinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Yöntem 1',
      'Radon ölçümleri binanın sürekli kullanılan bölgelerinin (yaşam, çalışma, dinlenme vb.) bulunduğu en alt katında yapılmalıdır. Radon seviyesi ölçümünde kullanılacak cihaz, ilgili mekanlarda zeminden en az 50 cm, tavandan en az 30 cm, dış duvarlardan en az 30 cm, kapı ve pencerelerden en az 90 cm uzaklıkta olmalıdır.',
      'Yöntem 2',
      'Bina projesinde tespit edilmiş aşağıda belirtilen malzemelerin / ürünlerin aktivite konsantrasyon indisinin Nükleer Düzenleme Kurumu tarafından belirlenen sınır değerleri aşmadığının kanıtlanması gerekmektedir. Nükleer Düzenleme Kurumu tarafınca belirlenen sınır değerleri olmaması durumunda; ‘US Environmental Protection Agency’ (EPA), ‘European Atomic Commission’ (EURATOM), ‘World Health Organization’ (WHO) gibi resmi kurumlar tarafınca belirlenen sınır değerlerini aşmadığının kanıtlanması gerekmektedir.',
      '• Radyum ve toryumca zengin granitler,',
      '• Portland çimentosu,',
      '• Yüksek fırın cürufu ve/veya uçucu kül katkılı portland çimentosu,',
      '• Sentetik alçı.'
    ],
    belgeler: [
      '• Radon ölçümü yapılan mekanı, ölçüm yöntemini, ölçüm cihazının özelliklerini, radon ölçümü süresini ve sonuçlarını içeren rapor ile ölçüm yapan kuruluşun akredite veya radon ölçümü konusunda uluslararası karşılaştırma çalışmasına katılmış kuruluş olduğunu gösteren belge (Yöntem 1 için),',
      '• Malzemelere / ürünlere ait radyoaktivite konsantrasyonu, radon konsantrasyonu, radyoaktivite değerlendirme vb. belgeler (Yöntem 2 için).'
    ],
    kaynaklar: ['Radyasyon Güvenliği Yönetmeliği', 'Yapı Malzemeleri Yönetmeliği (305/2011/AB)']
  },

  // ---- YMD 04 Sorumlu Kaynak Kullanımı
  'YMD 04 K1': {
    amac: 'Bina projesine tespit edilmiş ahşap malzemelerin / ürünlerin etkin (yeterli düzeyde, amaca uygun ve çevresel etkisi düşük) kullanılmasının ve sürdürülebilir kaynaklardan temin edilmesinin sağlanması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Bina projesine tespit edilmiş ahşap malzemelerin / ürünlerin temin edildiği kaynaklar hakkında bilgi edinilmesi.', durum: ['Y', 'M'] },
      { no: 2, text: 'Bina projesine tespit edilmiş, kalıcı olarak kurulan ahşap malzemelerin / ürünlerin toplam maliyetinin en az %20’sinin çevresel etkisi düşük ve sürdürülebilir kaynaklardan temin edilmiş olması.', durum: ['Y', 'M'] }
    ],
    kural: 'all',
    kuralText: 'Kriterin gerekliliklerinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Üreticilerin sağlamış oldukları malzemelerin / ürünlerin çevreye zarar vermeyen, uygun bir yasal süreç takip ederek edinildiğini gösteren belgelerin sağlanması gerekmektedir.',
    belgeler: 'Ürünün sorumlu kaynaklardan elde edildiğini belgeleyen dokümanlar (FSC, FSC CoC, GRI, TS EN ISO 14001 vb.).',
    kaynaklar: ['TS EN ISO 14001 Çevre Yönetim Sistemleri - Şartlar ve Kullanım Kılavuzu', 'TS EN ISO 26000 Sosyal sorumluluk için rehber']
  },

  // ---- YMD 05 Yerel Kaynak Kullanımı
  'YMD 05 K1': {
    amac: 'Yerel çevreden çıkarılan ve üretilen yapı malzemesi ve ürünlerine talebi arttırmak ve böylece yerel malzeme kullanımını desteklemek ve ürünlerin taşımacılığından kaynaklanan çevre etkilerini azaltmak amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Bina projesine tespit edilmiş malzemelerin / ürünlerin toplam maliyetinin en az %20’sinin, proje şantiyesinin en fazla 200 km yarıçapındaki bölgeden çıkarılmış / hasat edilmiş / geri kazanılmış ya da üretilmiş yerel malzemelerden sağlanması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Kriterin gerekliliklerinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Yerel malzeme yüzdesi şu şekilde hesaplanır: 200 km yarıçap içinde demiryolu veya denizyolu ile taşınan yapı malzemesi ve ürünlerin toplam maliyeti 0,25 ile çarpılır ve demiryolu veya denizyolu ile taşınmayan yapı malzemesi ve ürünlerin maliyet toplamına eklenir.',
    belgeler: [
      '• 200 km yarıçapındaki bölgeden çıkarılmış / hasat edilmiş / geri kazanılmış ya da üretilmiş yerel malzemelerin temin edildiğini gösteren belgeler,',
      '• Üreticilerin isimleri, malzeme / ürün maliyetleri, proje şantiyesi ile ürünün çıkarıldığı veya hasat edildiği bölge arasındaki mesafe ve proje şantiyesi ile üretici arasındaki mesafe.'
    ]
  },

  // ---- YMD 06 Yeniden Kullanılan, İyileştirilen ya da Geri Dönüştürülen Malzeme Kullanımı
  'YMD 06 K1': {
    amac: 'Doğal kaynaklara olan gereksinimi ve atığı azaltmak için malzemelerin ve ürünlerin yeniden kullanılarak; doğal kaynakların çıkarılması ve işlenmesi sürecinde açığa çıkan çevresel etkilerin azaltılması amaçlanmaktadır.',
    kanit: 'Geri kazanılmış malzeme hesabı ekle',
    gerek: [{ no: 1, text: 'Bina projesine tespit edilmiş malzemelerin / ürünlerin toplam maliyetinin en az %5’inin, önceden başka bir projede kullanıldıktan sonra geri kazanılmış malzeme olması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Kriterin gerekliliklerinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Yeniden kullanılacak olan malzemeler, mevcut binadan olduğu gibi başka kullanılmış binalardan da tedarik edilebilir.',
      'Taşıyıcı elemanlar (döşemeler ve çatı döşemeleri gibi), cephe malzemeleri (pencere sistemleri, kabuk, karkas gibi), daimi olarak tespit edilmiş iç yapı elemanları (duvarlar, kapılar, döşeme kaplamaları, tavan sistemleri gibi) bu kapsamda değerlendirilir.',
      'Mekanik, elektrik ve tesisat elemanları ve özellikle asansör ve diğer cihazlar geri kazanılmış malzeme / ürün hesaplamasına dahil edilmemelidir.'
    ],
    belgeler: 'Bina projesine tespit edilmiş malzeme / ürün listesi ve maliyetleri ile projede kullanılan ‘Geri Kazanılmış Malzeme’ listesi ve maliyetleri doğrultusunda yapılan hesaplama.',
    tanimlar: [['Geri kazanılmış malzeme', 'Bir malzemenin atık olarak atılması ya da enerji geri kazanımı sağlamak üzere kullanılması (yakma tesislerinde yakılması vb.) yerine, binada doğrudan kullanılması ya da geri dönüşüm için üretim sürecinde girdi olarak kullanılmasıdır.']]
  },
  'YMD 06 K2': {
    amac: 'Yapı malzemelerinin / ürünlerinin kullanım ömrü boyunca tespit edildiği binaların değişen koşullar altında oluşabilecek yeni tasarım alternatiflerine uyumlu olmasını sağlamak ve böylece binanın, malzemelerden / ürünlerden kaynaklanabilecek çevre etkisini en aza indirmek ve esnek mimari tasarımı teşvik etmek amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Duvarlar, döşemeler ve çatıda yer alan temel yapı elemanlarının toplam alanının %20’sinde yapı malzemelerinin / ürünlerinin ve bileşenlerinin sökülebilir, takılabilir bitmiş ön yapımlı olarak geliştirilmesi ve binada uygulanması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Kriterin gerekliliklerinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Bina projesinin esnek bir tasarıma olanak sunduğu ve projede sökülebilir / takılabilir ön yapımlı olarak geliştirilen yapı malzemelerinin / ürünlerinin ve bileşenlerinin kullanıldığı belirtilmelidir.',
    belgeler: [
      '• Bina projesinin esnek bir tasarıma olanak sunduğunun projelerle belgelenmesi,',
      '• Projede kullanılmış malzeme / ürün ve bileşenlerin esnek tasarıma olanak sağladığının teknik şartnamelerde / dokümanlarda belirtilmesi.'
    ]
  },
  'YMD 06 K3': {
    amac: 'Geri dönüşüm içeriğine sahip yapı malzemelerine olan talebi arttırmak ve böylece hammaddenin çıkarılması ve üretilmesi sürecinde doğal kaynakların kullanımının azaltılması amaçlanmaktadır.',
    kanit: 'Geri dönüşüm içeriği hesabı ekle',
    gerek: [{ no: 1, text: 'Bina projesine tespit edilmiş malzemelerin / ürünlerin toplam maliyetinin en az %20’sinin geri dönüşüm içerikli olması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Kriterin gerekliliklerinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Bina projesinde tespit edilmiş malzemelerin / ürünlerin geri dönüştürülmüş içerikli malzeme yüzdesini hesaplamak için; geri dönüştürülmüş içerikli tüm malzemeler / ürünler ve bunların maliyetleri listelenir. Her bir malzemenin / ürünün tüketici öncesi ve/veya tüketici sonrası geri dönüşüm içerik yüzdesi ağırlıkça tanımlanır ve listelenir. Bu bilgiler; ürünün üreticisi vb. güvenilir, doğrulanabilir bir kaynaktan temin edilmelidir. Geri dönüştürülmüş içerikli malzeme yüzdesi kılavuzdaki eşitlikler ile bulunur.',
    belgeler: 'Bina projesinde tespit edilmiş malzeme / ürün listesi ve maliyetleri ile geri dönüşüm içerikli malzemelerin listesi, ağırlıkları ve maliyet listesi doğrultusunda yapılan hesaplama.',
    tanimlar: [
      ['Geri kazanılmış malzeme', 'Bir malzemenin atık olarak atılması ya da enerji geri kazanımı sağlamak üzere kullanılması (yakma tesislerinde yakılması vb.) yerine, binada doğrudan kullanılması ya da geri dönüşüm için üretim sürecinde girdi olarak kullanılmasıdır.'],
      ['Geri dönüştürülmüş malzeme', 'Geri kazanılmış malzemenin üretim sürecine yeniden sokularak; son ürün ya da bileşen haline getirilmesidir.'],
      ['Geri dönüştürülme kapasitesi', 'Bir malzeme ya da ürünün kütlece geri dönüşebilen malzeme oranıdır. Sadece tüketici öncesi ve tüketici sonrası malzemeler geri dönüşüm içeriği açısından değerlendirilebilir.'],
      ['Tüketici öncesi geri dönüşüm', 'Malzemenin üretim süreci sonunda oluşan atıklardan geri dönüştürülen malzeme oranıdır. Yeniden işlenen, yeniden öğütülen veya üretim işleminden ıskartaya atılan ve aynı üretim süreciyle geri kazanılan malzeme; tüketici öncesi geri dönüşen malzeme değildir.'],
      ['Tüketici sonrası geri dönüşüm', 'Evsel veya ticari, endüstriyel ve kurumsal faaliyetlerden tüketici tarafından kullanıldıktan sonra hiçbir şekilde aynı amaçla kullanılmayacak olarak ortaya çıkan ürünlerin geri dönüştürülebilen malzeme oranıdır.']
    ]
  },
  'YMD 06 K4': {
    amac: 'Yapı malzemesi / ürünü üreticisinin sorumluluğunda olan bu kriter ile yapı malzemelerinin / ürünlerin ‘beşikten-beşiğe’ yaşam döngüsü etkisinin azaltılması; tüketicinin ürünü satın aldığı süreçte ürünün kullanım sonrası nasıl değerlendireceği veya bertaraf edeceği konusunda farkındalığının arttırılması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Bina projesine tespit edilmiş malzemelerin / ürünlerin toplam maliyetinin en az %20’sinin kullanım sonrasında nasıl bir yöntemle yeniden kullanılabileceğinin, geri dönüştürülebileceğinin, geri kazanılabileceğinin ve/veya bertaraf edilebileceğinin yapı malzemesi / ürün üreticisi tarafından belgelenmesi.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Kriterin gerekliliklerinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Malzeme / ürün üreticileri tarafından, TS ISO 14001 Çevre Yönetim Sistemleri standartları doğrultusunda malzemelere / ürünlere ait atık politikasının yer aldığı teknik şartnameler hazırlanmalıdır.',
    belgeler: 'Malzeme / ürün üreticileri tarafından, ISO 14001 Çevre Yönetim Sistemleri standartları doğrultusunda malzemelere / ürünlere ait atık politikasının yer aldığı teknik şartnameler veya ilgili belgeler.',
    kaynaklar: ['TS EN ISO 14001 Çevre Yönetim Sistemleri - Şartlar ve Kullanım Kılavuzu', 'TS EN ISO 14004 Çevre yönetim sistemleri - Genel uygulama kuralları']
  },

  // ---- YMD 07 Dayanıklı Malzeme Kullanımı
  'YMD 07 K1': {
    amac: 'Bina yapı elemanlarının ve sistemlerinin en iyi şekilde bakımının yapılması, periyodik bakım çizelgelerinin hazırlanması yoluyla alt yapının etkin bir şekilde yönetiminin sağlanması ve önleyici faaliyetler için yerinde tespitlerin yapılması amaçlanmaktadır.',
    kanit: 'Bakım-onarım raporu ekle',
    gerek: [{ no: 1, text: 'Bina projesine ek olarak, dayanıklı ve/veya en az düzeyde bakım gerektiren malzemelerin / ürünlerin kullanıldığı, işletmenin bakım-onarım ve/veya yenileme politikasını oluşturacak çizelgelerin ve malzeme / ürün yönetimini kapsayan satın alma prosedürünün hazırlanması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Kriterin gerekliliklerinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Bakım-onarım / yenileme ve satın alma metodunun hazırlanması gerekmektedir. Bakım-onarım politikasının içeriği aşağıdaki adımlardan oluşmalıdır:',
      '• Metodun amaç ve kapsamı,',
      '• Metodun hazırlanmasından ve uygulanmasından sorumlu kişilerin belirlenmesi,',
      '• Politikanın nasıl gerçekleştirileceğinin ve ulaşılacak hedeflerin belirlenmesi,',
      '• Periyodik bakım çizelgelerinin zamana bağlı olarak hazırlanması.'
    ],
    belgeler: [
      'Aşağıdaki hususlara yer verilen raporun hazırlanarak sunulması:',
      '• Bakım-onarım ve/veya yenileme süreç ve yöntemleri,',
      '• Sarf malzemesi gerekiyorsa satın alma metodu,',
      '• Bakımı gerçekleştirecek olan gerçek veya tüzel kişiler.'
    ]
  },
  'YMD 07 K2': {
    amac: 'Malzeme değişim sıklığını en aza indirmek ve malzeme miktarını en uygun düzeyde tutmak amacıyla, bina içinde ve dışında ortama açık olan yüzeylerin uygun bir şekilde korunması konusunda farkındalığın arttırılarak uygulamanın teşvik edilmesi amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Bina alanı içerisinde ve dışarısında otomobil, yük aracı ve yaya hareketlerinin olduğu alanların tanımlanması ve binanın dışa açık, kolayca aşınabilen bölgelerinin hasar görmesinin engellenmesi için dayanıklılık ve koruma konusunda uygun tedbirlerin projeye dahil edilmesi.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Kriterin gerekliliklerinin sağlanması durumunda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Binada tespit edilen korunmasız bölgeler için uygun dayanıklılık ve koruma metotları aşağıdaki gibi uygulanabilir ve/veya geliştirilebilir:',
      '• Ana giriş, kamu alanları, koridor, asansör ve kapıların açıldığı geçit noktalarında yoğun yaya trafiğinin etkisinden korunması,',
      '• Depo, dağıtım odaları, koridorlar ve mutfak gibi iç mekânlarda bina yüzeyinden 1 metre mesafeye kadar olan bölgenin araç hareketine karşı korunması,',
      '• Tüm otoparkların binanın dış cephesinden 1 metre mesafeye kadar olan ve dağıtım alanlarının 2 metre mesafeye kadar olan bölgesinde; araçların park ederken veya manevra yaparken çarpma olasılığına karşı kaldırım babaları, bariyerler, yükseltilmiş bordürler konumlandırılarak korunması veya önlem alınması,',
      '• 2 metre yüksekliğe kadar nispeten sağlam bir duvar tasarlanması,',
      '• Koridor duvarlarına koruma rayı uygulanması,',
      '• Kapılar üzerine darbe emici levha uygulanması (yük taşıma araçlarının geçtiği kapılar için),',
      '• Ana girişlerde, koridorlarda ve kamuya açık alanlarda oluşabilecek yoğun kullanılan alanlarda kolay temizlenen ve zor yıpranan zemin kaplamalarının kullanılması.'
    ],
    belgeler: [
      '• Binada darbe yüklerine karşı korunması gereken bölgeler ve dayanıklılık için alınan önlemler, tasarım planları üzerinde belirtilmelidir,',
      '• İnşaat sonrası yapılan uygulamalar yerinde fotoğraflanmalıdır.'
    ]
  },

  // ==== EKV Enerji Kullanımı ve Verimliliği (kılavuz: ekv.docx)
  // ---- EKV 01 Bina Enerji Performansı
  'EKV 01 K1': {
    amac: 'Bina enerjisinin ve enerji kaynaklarının etkin ve verimli kullanılması, enerji israfının önlenmesi, mimari tasarım, mekanik tesisat, aydınlatma, elektrik tesisatı gibi binanın enerji kullanımını ilgilendiren konularda bina projelerinin mevzuata, hesaplama metotlarına, standartlara, yöntemlere ve performans kriterlerine uyumun sağlanması amaçlanmaktadır.',
    kanit: 'Enerji Kimlik Belgesi ekle',
    gerek: [{ no: 1, text: 'BEP-TR yazılımı ile hesaplanan binanın Enerji Kimlik Belgesindeki enerji performans sınıfının en az “B” seviyesinde olması.', durum: ['Y', 'M'] }],
    detay: 'EKV modülünde sanayi alanlarında üretim faaliyetleri yürütülen binaların sadece idari bölümleri değerlendirilir.',
    kural: 'mandatory',
    kuralText: 'Yeni ve mevcut tüm bina tipleri için zorunlu bir kriterdir.',
    yontem: 'Tüm bina tipleri için hesaplamalar, “Binalarda Enerji Performansı Ulusal Hesaplama Yöntemine Dair Tebliğ” ile belirlenen metodolojiye göre çalışan Ulusal Bina Enerji Performansı Hesaplama Programı (BEP-TR) kullanılarak yapılır.',
    belgeler: 'Onaylı Enerji Kimlik Belgesinin bir kopyası',
    kaynaklar: ['Enerji Verimliliği Kanunu', 'Binalarda Enerji Performansı Yönetmeliği', 'Binalarda Enerji Performansı Ulusal Hesaplama Yöntemine Dair Tebliğ']
  },
  'EKV 01 K2': {
    amac: 'Binada kullanılan enerjinin verimliliği ve çevreye verdiği zararlar bina tasarımında alınan önlemlere, inşa edilirken kullanılan malzemeye, uygulamanın doğru yapılmasına ve işletilmesine bağlı olarak değişir. Yapım sürecinde alınacak önlemlerle konfor şartlarını bozmadan binanın enerji verimliliğinin artırılması ve bina kullanımında enerji tüketiminin azaltılması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    not: 'Enerji Kimlik Belgesindeki değerleri girin; ağırlıklı enerji performansı iyileştirme oranı (EPİ) ve kredi otomatik hesaplanır.',
    gerek: [
      { no: 1, text: 'Binanın enerji performansının ve sera gazı emisyon değerlerinin BEP-TR ile hesaplanması (Enerji Kimlik Belgesi).', durum: ['Y', 'M'] },
      { no: 2, text: 'Bina enerji tüketimi değerlendirme raporunun hazırlanması (iyileştirme öncesi ve sonrası Enerji Kimlik Belgeleri ile).', durum: ['M'] }
    ],
    girdi: [
      { k: 'epo', l: 'Enerji performans oranı (EPo)', t: 'num', durum: ['Y'], ipucu: 'EKB’deki oran; referans bina = 100' },
      { k: 'sgeo', l: 'Sera gazı emisyon oranı (SGEo)', t: 'num', durum: ['Y'], ipucu: 'EKB’deki oran; referans bina = 100' },
      { k: 'nseb', l: 'Ruhsat tarihine göre NSEB şartı', t: 'sel', durum: ['Y'], opts: [['', 'Yok / gerekmiyor'], ['A', 'NSEB: A sınıfı'], ['B', 'NSEB: B sınıfı'], ['C', 'NSEB: C sınıfı']] },
      { k: 'kbbet', l: 'Kıyaslanan bina birincil enerji (KBBET)', t: 'num', durum: ['M'], birim: 'kWh/yıl' },
      { k: 'abbet', l: 'Asıl bina birincil enerji (ABBET)', t: 'num', durum: ['M'], birim: 'kWh/yıl' },
      { k: 'kbsge', l: 'Kıyaslanan bina sera gazı (KBSGE)', t: 'num', durum: ['M'], birim: 'kg eşd. CO₂/m².yıl' },
      { k: 'absge', l: 'Asıl bina sera gazı (ABSGE)', t: 'num', durum: ['M'], birim: 'kg eşd. CO₂/m².yıl' },
      { k: 'ksinif', l: 'Kıyaslanan binanın enerji sınıfı', t: 'sel', durum: ['M'], opts: [['', 'Seçiniz'], ['A', 'A'], ['B', 'B'], ['C', 'C veya daha düşük']] },
      { k: 'nsebm', l: 'Ruhsat tarihine göre NSEB olması gerekiyor mu?', t: 'sel', durum: ['M'], opts: EVET_HAYIR }
    ],
    hesap: (v, p) => {
      let E, S;
      if (p.durum === 'Y') {
        const ep = gnum(v.epo), sg = gnum(v.sgeo);
        if (isNaN(ep) || isNaN(sg)) return { cr: 0, text: 'EPo ve SGEo değerlerini girin.' };
        E = 100 - ep; S = 100 - sg;
      } else {
        const kb = gnum(v.kbbet), ab = gnum(v.abbet), ks = gnum(v.kbsge), as = gnum(v.absge);
        if ([kb, ab, ks, as].some(isNaN) || !kb || !ks) return { cr: 0, text: 'Kıyaslanan ve asıl bina değerlerini girin.' };
        if (!v.ksinif) return { cr: 0, text: 'Kıyaslanan binanın enerji sınıfını seçin.' };
        E = (kb - ab) / kb * 100; S = (ks - as) / ks * 100;
      }
      const epi = 0.65 * E + 0.35 * S, base = `E% = ${pct(E)} · SGE% = ${pct(S)} · EPİ = 0,65 × E% + 0,35 × SGE% = ${pct(epi)}`;
      let cr;
      if (p.durum === 'Y') {
        cr = bandCredit(epi, EKV_EPI_YENI);
        if (v.nseb && cr) {
          const min = 100 - EKV_NSEB_UST[v.nseb] + 1;
          if (epi < min) return { cr: 0, text: `${base} → NSEB (${v.nseb}) için EPİ en az ${pct(min)} olmalı; kredi alınamaz.` };
        }
      } else {
        cr = bandCredit(epi, EKV_EPI_MEVCUT[v.ksinif]);
        if (v.ksinif === 'B' && v.nsebm === 'E' && epi < 1) cr = 0; // NSEB olması gereken binalar bu aralıkta kredi alamaz
      }
      return { cr, text: `${base} → ${cr} kredi` };
    },
    kural: 'hesap',
    kuralText: 'Ağırlıklı enerji performansı iyileştirme oranına (EPİ) bağlı olarak yeni binalar için Tablo 2.4.7’de, mevcut binalar için kıyaslanan binanın sınıfına göre Tablo 2.4.8’de belirtilen krediler alınır.',
    detay: [
      'Yeni binalar (Tablo 2.4.7, tüm bina tipleri) – EPİ > %14: 15 · ≥ %21: 20 · ≥ %26: 25 · ≥ %31: 30 · ≥ %36: 40 · ≥ %41: 50 · ≥ %46: 60 · ≥ %51: 65 · ≥ %61: 70 · ≥ %81: 75 kredi.',
      'Yapı ruhsat tarihi itibariyle NSEB olması gereken binalarda kredi alınabilmesi için EPİ, NSEB sınıfına karşılık gelen orandan en az 1 puan fazla olmalıdır (örnek: NSEB şartı B ise enerji performans oranı en az %21 (100 − 79), kredi için EPİ en az %22).',
      'Mevcut binalar (Tablo 2.4.8):',
      '• Kıyaslanan bina A sınıfı – EPİ > %0: 60 · ≥ %1: 70 · ≥ %20: 75 kredi,',
      '• Kıyaslanan bina B sınıfı – EPİ > %0: 30 (NSEB olması gereken binalarda 0) · ≥ %1: 45 · ≥ %11: 55 · ≥ %21: 70 · ≥ %50: 75 kredi,',
      '• Kıyaslanan bina C veya daha düşük sınıf – EPİ > %14: 15 · ≥ %21: 25 · ≥ %31: 35 · ≥ %41: 50 · ≥ %51: 65 · ≥ %61: 75 kredi.',
      'Enerji performans / sera gazı emisyon sınıfları (Tablo 2.4.3): A 0–39 · B 40–79 · C 80–99 · D 100–119 · E 120–139 · F 140–174 · G 175 ve üzeri.'
    ],
    yontem: [
      'Ele alınan binanın yıllık enerji tüketimi, BEP-TR aracılığıyla birincil enerji cinsinden hesaplanır. BEP-TR’de basit saatlik hesaplama yöntemi kullanılmıştır. Bu hesaplama yöntemi, bina enerji performansını değerlendirirken;',
      '• Binaların ısıtılması ve soğutulması için binanın ihtiyacı olan net enerji miktarının yılın her saati için hesaplanarak belirlenmesini,',
      '• Net enerjiyi karşılayacak kurulu sistemlerden olan kayıpları ve sistem verimlerini de göz önüne alarak binanın toplam ısıtma-soğutma enerji tüketiminin belirlenmesini,',
      '• Havalandırmadan kaynaklanan enerji tüketiminin belirlenmesini,',
      '• Günışığı etkileri göz önüne alınarak, günışığından yararlanılmayan süre ve günışığının etkili olmadığı alanlar için aydınlatma enerji ihtiyacının ve tüketiminin hesaplanmasını,',
      '• Sıhhi (kullanım) sıcak su için gerekli enerji tüketiminin hesaplanmasını,',
      '• Yenilenebilir enerji, atık ısı ve bölgesel ısıtma sistem katkılarını kapsamaktadır.',
      'BEP-TR ile hesaplatılan bina enerji sınıfı, önerilen tasarımın referans bina ile karşılaştırılması sonucunda elde edilmektedir. Değerlendirilmesi yapılmakta olan bina “asıl bina”, karşılaştırmada kullanılacak olan hayali bina ise “referans bina” olarak tanımlanmaktadır. Türkiye’ye özgü referans bina özellikleri “Binalarda Enerji Performansı Ulusal Hesaplama Yöntemine Dair Tebliğ” ile belirlenmiştir. Mevcut binalarda kıyaslanan bina, asıl binanın iyileştirme yapılmadan önceki halidir.',
      'Binanın ağırlıklı enerji performansı, bina enerji tüketiminin ve sera gazı emisyon miktarının azaltılması dikkate alınarak iki aşamada belirlenir; bu iki aşamanın birlikte değerlendirilmesi sonucunda “enerji performansı ağırlıklı iyileştirme oranı” hesaplanır ve bu orana karşılık gelen kredi alınır.',
      '• Yeni binalar: E% = 100 − EPo, SGE% = 100 − SGEo (EPo: binanın enerji performans oranı, SGEo: sera gazı emisyon oranı; Enerji Kimlik Belgesindeki oranlar, referans bina = 100).',
      '• Mevcut binalar: E% = (KBBET − ABBET) / KBBET × 100, SGE% = (KBSGE − ABSGE) / KBSGE × 100 (KB: kıyaslanan bina, AB: asıl bina; birincil enerji tüketimi kWh/yıl, sera gazı emisyonu kg eşd. CO₂/m².yıl). İyileştirme öncesi ve sonrası Enerji Kimlik Belgeleri gereklidir.',
      'EPİ = ke × E% + ks × SGE% (yeni ve mevcut binalarda tüm bina tipleri için ke = 0,65, ks = 0,35; Tablo 2.4.4 ve 2.4.5).',
      'Mevcut binalar için bina enerji tüketimi değerlendirme raporu (Tablo 2.4.6) hazırlanmalı; ekine kıyaslanan bina için oluşturulan Enerji Kimlik Belgesi ilave edilir. Yeni binalarda ve iyileştirme yapılmamış mevcut binalarda “Kıyaslanan Bina” bilgileri boş bırakılır.'
    ],
    belgeler: ['• Onaylı Enerji Kimlik Belgesinin bir kopyası,', '• Binanın ağırlıklı enerji performansı hesap raporu,', '• Bina enerji tüketimi değerlendirme raporu.'],
    kaynaklar: ['Enerji Verimliliği Kanunu', 'Binalarda Enerji Performansı Yönetmeliği', 'Binalarda Enerji Performansı Ulusal Hesaplama Yöntemine Dair Tebliğ'],
    tanimlar: [
      ['Asıl Bina', 'Yeşil sertifika için değerlendirilmesi yapılmakta olan binadır.'],
      ['BEP-TR', 'Enerji Kimlik Belgelerinin düzenlenmesi için kullanılan ve Bakanlık internet adresinden erişim sağlanan yazılım programıdır.'],
      ['Birincil Enerji Tüketimi (BET)', 'Son kullanıcı tarafından binasında veya bağımsız bölümünde katı, sıvı veya gaz yakıtlardan elde edilen enerji ile tüketilen elektrik enerjisinin üretilmesi ve dağıtılması safhalarında tüketilen enerjilerle birlikte toplam tüketimi olup, nihai enerji tüketim miktarının birincil enerji cinsinden ifadesidir. Kullanılan enerji kaynaklarına bağlı olarak birincil enerji dönüşüm katsayıları kullanılarak BEP-TR ile hesaplanır.'],
      ['Neredeyse Sıfır Enerjili Bina (NSEB)', 'Binalarda Enerji Performansı Yönetmeliği kapsamında yüksek enerji performansına ve aynı zamanda belli oranda yenilenebilir enerji kullanımına sahip olan bina.'],
      ['Nihai Enerji Tüketimi', 'Binalarda Enerji Performansı Ulusal Hesaplama Yöntemine Dair Tebliğ kapsamında BEP-TR ile hesaplanan enerji miktarıdır.'],
      ['Kıyaslanan Bina', 'Asıl bina ile karşılaştırmada kullanılacak olan binadır. Yeni binalar için Binalarda Enerji Performansı Ulusal Hesaplama Yöntemine Dair Tebliğ ile belirlendiği şekildedir (iyileştirme oranı Enerji Kimlik Belgesinde belirtilir); mevcut binalar için binanın iyileştirme yapılmadan önceki halidir.'],
      ['Sera Gazı Emisyonu (SGE)', 'Binanın nihai enerji tüketim miktarına ve kullanılan yakıt türüne bağlı olarak atmosfere salınan eşdeğer CO₂ miktarıdır. BEP-TR yazılımında Sera Gazı Emisyonu olarak belirtilmektedir.']
    ]
  },

  // ---- EKV 02 Yenilenebilir Enerji Teknolojileri
  'EKV 02 K1': {
    amac: 'Bu kriter ile; değerlendirilmekte olan binada yenilenebilir enerji kurulumu ve kullanımı ile ilgili fizibilite çalışması yapılması ve yenilikçi sistemlerin uygulanması beklenmektedir. Yeni binalarda proje aşamasında, mevcut binalarda ise sistemlerin kurulumu aşamasında fizibilite etüdü gerçekleştirilmesi, fosil yakıtlardan elde edilen enerji miktarını azaltmak üzere kullanılabilecek yenilenebilir enerji teknolojilerinin en verimli şekilde kullanılmasını sağlamak amacıyla ekonomik ve çevresel olarak uygunluğunun analiz edilmesi ve yeni enerji verimliliği teknolojilerinin kullanımının özendirilmesi amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Yenilenebilir enerji kullanımı ve yenilenebilir enerji sistemlerinin kurulumu ile ilgili fizibilite raporunun hazırlanması (3 kredi).', durum: ['Y', 'M'] },
      { no: 2, text: 'Enerji kimlik belgesindeki enerji performansı ve sera gazı emisyon sınıflarının ikisinin de A sınıfı olması veya binada güneş duvarı, güneş bacası vb. BEP-TR’de (enerji performans hesabında) yer almayan sistemlerden en az birinin bulunması (7 kredi).', durum: ['Y', 'M'] }
    ],
    kural: 'tiers', must: [],
    tiers: [{ no: 1, cr: cr7(3, 3) }, { no: 2, cr: cr7(7, 7), ayri: true }],
    kuralText: 'Fizibilite raporunun hazırlanması halinde yeni ve mevcut binalar için 3 kredi; enerji performansı ve sera gazı emisyon sınıflarının ikisinin de A olması veya BEP-TR’de yer almayan sistemlerden en az birinin bulunması halinde 7 kredi alınır.',
    yontem: [
      'Fizibilite raporu hazırlanması için; değerlendirilmekte olan binada kullanılabilecek yenilenebilir enerji teknolojileri belirlenmeli, kullanılabilecek yenilenebilir enerji teknolojileri ve sistemleri, bu sistemler aracılığıyla elde edilecek yıllık enerji miktarı, ilk yatırım ve yaşam dönemi maliyetleri, geri ödeme süreleri, arazi kullanımı ve planlama açısından incelenmelidir.',
      'Binada güneş duvarı, güneş bacası, labirent vb. “EKV 02 K2 Yenilenebilir Enerji Kullanımı” kriterinde hesaplamaya dahil edilmeyen sistemler uygulanmalıdır.'
    ],
    belgeler: [
      '• Kullanılabilecek yenilenebilir enerji sistemlerine ait değerlendirmeleri içeren fizibilite raporu,',
      '• Enerji Kimlik Belgesi / binada güneş duvarı, güneş bacası vb. BEP-TR’de enerji performans hesabında yer almayan enerji verimliliği sistemlerinden en az birinin bulunduğuna dair proje ve fotoğraflar.'
    ]
  },
  'EKV 02 K2-1': {
    amac: [
      'Bu kriter ile; binada kullanılan enerjinin karşılanması için yenilenebilir enerji kaynaklarından etkin bir şekilde yararlanılması, fosil kaynakların kullanımının azaltılması amaçlanmaktadır.',
      'Ayrıca; “Neredeyse Sıfır Enerjili Binalar” konseptine geçişte yerinde yenilenebilir enerji kullanımı artırılarak, tüm binaların sıfır enerjili, kendi enerjisini yenilenebilir enerji kaynaklarından sağlayan binalar olması hedeflenmektedir.'
    ],
    kanit: 'Kanıt belgeleri ekle',
    not: 'EKV 02 K2 için Seçenek-1 veya Seçenek-2’den yalnızca birinden kredi alınabilir.',
    gerek: [{ no: 1, text: 'Yenilenebilir enerji sistemlerine ait fizibilite çalışmasının yapılması; kullanılacak sistemin fizibilite etütleri esas alınarak seçilmesi (saha dışında kurulmuş yenilenebilir enerji üretim tesisi varsa belgelendirilmesi).', durum: ['Y', 'M'] }],
    girdi: [
      { k: 'yeko', l: 'Yenilenebilir enerji kurulumundan kullanım oranı (YEKo)', t: 'num', birim: '%' },
      { k: 'ilave', l: 'YEKo dışında kalan enerjinin en az %50’si saha dışından satın alınıyor mu?', t: 'sel', opts: EVET_HAYIR },
      { k: 'nseb', l: 'NSEB yenilenebilir enerji oranı sınır değeri (varsa)', t: 'num', birim: '%' }
    ],
    hesap: (v, p) => {
      const y = gnum(v.yeko);
      if (isNaN(y)) return { cr: 0, text: 'YEKo değerini girin.' };
      const lim = gnum(v.nseb);
      if (!isNaN(lim) && y < lim + 1) return { cr: 0, text: `YEKo = ${pct(y)} → NSEB sınırı ${pct(lim)} için en az ${pct(lim + 1)} olmalı; kredi alınamaz.` };
      const rows = EKV_YEKO[p.durum], row = [...rows].reverse().find((r, i) => i === rows.length - 1 ? y > r[0] : y >= r[0]);
      if (!row) return { cr: 0, text: `YEKo = ${pct(y)} → en az %3’ün üzerinde olmalı; 0 kredi` };
      const add = v.ilave === 'E' ? row[2] : 0, cr = Math.min(18, row[1] + add);
      return { cr, text: `YEKo = ${pct(y)} → ${row[1]} kredi${add ? ` + ${add} ilave (saha dışından satın alma) = ${cr} kredi` : ''}` };
    },
    kural: 'hesap',
    kuralText: 'Bina tipine ve yenilenebilir enerji kullanım oranına bağlı olarak yeni binalar için Tablo 2.4.10’da, mevcut binalar için Tablo 2.4.11’de belirtilen krediler alınır. YEKo dışında kalan enerjinin en az %50’sinin saha dışından satın alınarak karşılanması halinde ilave kredi verilir.',
    detay: [
      'Yeni binalar (Tablo 2.4.10) – YEKo > %3: 4 (+7) · ≥ %10: 6 (+6) · ≥ %15: 8 (+5) · ≥ %20: 10 (+3) · ≥ %25: 12 (+2) · ≥ %30: 14 (+2) · ≥ %35: 16 (+1) · ≥ %40: 18 kredi.',
      'Mevcut binalar (Tablo 2.4.11) – YEKo > %3: 4 (+5) · ≥ %5: 6 (+4) · ≥ %10: 8 (+3) · ≥ %15: 10 (+3) · ≥ %20: 12 (+2) · ≥ %25: 14 (+2) · ≥ %30: 16 (+1) · ≥ %35: 18 kredi.',
      'Parantez içindeki değerler, YEKo dışında kalan enerjinin en az %50’sinin saha dışından satın alınması halinde verilen ilave kredilerdir.',
      'Yapı ruhsat tarihi itibariyle NSEB olması gereken binalarda kredi alınabilmesi için YEKo, ilgili tarih itibariyle NSEB yenilenebilir enerji oranı sınır değerinden en az 1 puan fazla olmalıdır (örnek: sınır değer %10 ise YEKo en az %11). NSEB şartları Binalarda Enerji Performansı Yönetmeliğinde belirtilmektedir.'
    ],
    yontem: [
      'Alınabilecek kredinin hesaplanmasında, binanın yıllık toplam enerji tüketiminin (yenilenebilir olmaksızın hesaplanan değeri) yüzde olarak ne kadarının binanın saha içinde yer alan yenilenebilir enerji kaynaklarından temin edildiğinin (yenilenebilir enerji kullanım oranı) belirlenmesi gerekmektedir. Bunun için binanın;',
      '• Net enerjisini karşılayacak kurulu sistemlerden olan kayıpları ve sistem verimlerini de göz önüne alarak toplam ısıtma-soğutma enerji tüketiminin,',
      '• Aydınlatma enerji ihtiyacının ve tüketiminin,',
      '• Sıhhi (kullanım) sıcak su için gerekli enerji tüketiminin,',
      '• Havalandırma enerjisi tüketiminin belirlenmesi ve yenilenebilir enerji katkılarının da tespit edilmesi gerekir.',
      'Bu kriter için BEP-TR’de kullanılan hesaplamalar aracılığıyla belirlenen yenilenebilir enerji kullanım oranı kullanılır. Saha içinden yenilenebilir enerji kullanım oranı, Enerji Kimlik Belgesinin birinci sayfasında grafik olarak yer almaktadır. Bu oran, binaya entegre veya bina arazisinde bulunan ve hesaplanan bina için tasarlanmış yenilenebilir enerji sistemi kullanılarak üretilen yıllık enerjinin, binanın yıllık enerji tüketimine oranıdır. Saha dışında da binanın ihtiyacı için tasarlanmış yenilenebilir enerji üretim tesisi mevcut ise o tesiste üretilen enerji miktarı ayrıca hesaplanarak YEKo’ya dahil edilir.'
    ],
    belgeler: [
      'Aşağıdaki bilgi ve belgeleri içeren bir rapor sunulmalıdır:',
      '• Bina için tasarlanan yenilenebilir enerji kaynakları ve her bir kaynağın kurulu gücü, enerji potansiyeli,',
      '• Yenilenebilir enerji kaynaklarının yerlerini belirten arazi planı / fotoğraflar,',
      '• Kullanılacak sistemlerin teknik özelliklerini içeren doküman,',
      '• Onaylı Enerji Kimlik Belgesinin bir nüshası,',
      '• Sertifikaya esas bina için saha dışında kurulmuş yenilenebilir enerji üretim tesisi olması halinde bu husus belgelendirilir.',
      'Yenilenebilir enerji satın alınması yolu ile ilave kredi alınması durumunda ayrıca:',
      '• Yenilenebilir enerjinin satın alınabilmesi için yapılmış kontrat (en az üç yıllık),',
      '• Yenilenebilir Enerji Kaynak Belgesi (satın alınan enerji elektrik enerjisi ise),',
      '• Satın alınan / alınacak yenilenebilir enerji kullanım oranını gösteren hesap / Ön Hesap Sonuç Formu.'
    ],
    kaynaklar: EKV_YE_KAYNAK(),
    tanimlar: EKV_YE_TANIM()
  },
  'EKV 02 K2-2': {
    amac: 'Bu kriter ile; bina üzerinde veya arazisinde yenilenebilir enerji sistemleri kurulmasının uygun olmadığı durumlarda da, fosil kaynakların kullanımının azaltılması için binanın ihtiyaç duyduğu enerjinin saha dışında üretilen yenilenebilir enerji kaynaklarından temin edilmesi amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    not: 'EKV 02 K2 için Seçenek-1 veya Seçenek-2’den yalnızca birinden kredi alınabilir.',
    gerek: [{ no: 1, text: 'Yenilenebilir enerji alımının en az üç yıllık kontrat ile belgelendirilmiş olması.', durum: ['Y', 'M'] }],
    girdi: [{ k: 'oran', l: 'Saha dışından satın alınan yenilenebilir enerjinin tüm ihtiyaca oranı', t: 'num', birim: '%' }],
    hesap: (v, p) => {
      const x = gnum(v.oran);
      if (isNaN(x)) return { cr: 0, text: 'Satın alınan yenilenebilir enerji oranını girin.' };
      const bands = +p.tip === 0 ? [[10, 5], [40, 10]] : [[35, 5], [50, 10]], cr = bandCredit(x, bands, true);
      return { cr, text: `Yenilenebilir enerji kullanım oranı = ${pct(x)} → ${cr} kredi` };
    },
    kural: 'hesap',
    kuralText: 'Saha dışından alınan yenilenebilir enerji oranına bağlı olarak yeni ve mevcut binalar için Tablo 2.4.12 ve Tablo 2.4.13’te belirtilen krediler alınır: konutlarda %10–%40 için 5, %40 ve üzeri için 10 kredi; diğer bina tiplerinde %35–%50 için 5, %50 ve üzeri için 10 kredi.',
    detay: 'Not: Dış aydınlatmada kullanılan yenilenebilir enerji miktarı, hem yeni hem de mevcut binalar için bu konunun hesaplamasında yer almaz.',
    yontem: [
      'Tablo 2.4.12 ve Tablo 2.4.13’te belirtilen değerler; saha dışından alınan yenilenebilir enerji ile karşılanan miktarın tüm ihtiyaca oranı olarak hesaplanır.',
      'Satın alınan yenilenebilir enerji ısıtma ve/veya sıcak su amaçlı ise; satın alınan yenilenebilir enerji oranı Binalarda Enerji Performansı Yönetmeliği gereği hazırlanan “Ön Hesap Sonuç Formu”nda belirtilmektedir.',
      'Satın alınan yenilenebilir enerji elektrik enerjisi ise; temin edilen / edilecek elektrik enerjisinin birincil enerji miktarı binanın toplam birincil enerji ihtiyacına bölünerek hesaplanır. Nihai elektrik enerjisini birincil enerjiye dönüştürmek için ulusal güncel değerler Çevre, Şehircilik ve İklim Değişikliği Bakanlığı tarafından https://meslekihizmetler.csb.gov.tr/ adresinde “kütüphane” menüsünde yayınlanmaktadır.'
    ],
    belgeler: [
      '• Yenilenebilir enerjinin satın alınabilmesi için yapılmış kontrat (en az üç yıllık),',
      '• Yenilenebilir Enerji Kaynak Belgesi (satın alınan enerji elektrik enerjisi ise),',
      '• Satın alınan / alınacak yenilenebilir enerji kullanım oranını gösteren hesap / Ön Hesap Sonuç Formu.'
    ],
    kaynaklar: EKV_YE_KAYNAK(),
    tanimlar: EKV_YE_TANIM()
  },

  // ==== SAY Su ve Atık Yönetimi (kılavuz: say.docx)
  // ---- SAY 01 Su Yönetimi
  'SAY 01 K1': {
    amac: 'Bu kriter ile binalarda suyun etkin ve verimli kullanılmasının sağlanması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    not: 'Referans değere göre su kullanımında azalma oranını (I) girin; kredi bina tipine göre otomatik hesaplanır.',
    gerek: [{ no: 1, text: 'Bina / konut içi su kullanan armatür, donatı ve cihazların asgari su kullanımını sağlayacak şekilde seçilmesi ve su kullanımında azalma oranı hesaplarının rapor halinde sunulması.', durum: ['Y', 'M'] }],
    girdi: [{ k: 'oran', l: 'Su kullanımında azalma oranı (I)', t: 'num', birim: '%' }],
    hesap: (v, p) => {
      const r = sayOran('oran', 'Azalma oranı', p => [[1], [5], [11], [16], [26], [36]].map(([m], i) => [m, [[5, 10, 15, 18, 19, 20], [5, 10, 12, 13, 14, 15], [10, 12, 16, 21, 22, 23]][sayGrp(p)][i]]))(v, p);
      return isNaN(gnum(v.oran)) ? r : { cr: r.cr, text: `${r.text} (${SAY_GRP_AD[sayGrp(p)]})` };
    },
    kural: 'hesap',
    kuralText: 'Su kullanımında referans değere göre sağlanan azalma oranına göre, bina tipine bağlı olarak Tablo 2.5.3’te belirtilen krediler alınır.',
    detay: [
      'Tablo 2.5.3 – Su kullanımında azalma oranına göre krediler (konut / ofis, otel, alışveriş ve ticaret / eğitim ve sağlık):',
      '• %1–%4: 5 / 5 / 10,',
      '• %5–%10: 10 / 10 / 12,',
      '• %11–%15: 15 / 12 / 16,',
      '• %16–%25: 18 / 13 / 21,',
      '• %26–%35: 19 / 14 / 22,',
      '• %36 ve üzeri: 20 / 15 / 23.'
    ],
    yontem: [
      'Binalarda suyun verimli ve etkin kullanımı için uygun armatür ve donatıların seçilmesi, perlatör vb. ekipman kullanımı ile bağlantılı olarak su kullanımında sağlanacak tasarruf oranı referans değere göre belirlenir. Su kullanımındaki fiili azalmalar referans değere göre yüzde (%) azalma şeklinde ifade edilir ve bu kriter tipolojilere göre kendi içerisinde derecelendirilir (Tablo 2.5.3).',
      'Tablo 2.5.4 – Bina içi armatür ve donatı referans değerleri (25.02.2022 sonrası / öncesi ruhsat): WC 6 / 6 lt/kullanım (etkin rezervuar hacmi) · Lavabo 6 / 12 lt/dk · Duş 8 / 14 lt/dk · Pisuar 3,8 / 3,8 lt/kullanım · Mutfak eviyesi 6 / 12 lt/dk · Mutfak eviyesi (restoran) 6 / 10,3 lt/dk · Bulaşık makinası 17 / 17 lt/çevrim · Çamaşır makinası 90 / 90 lt/kullanım. Yürürlükteki Planlı Alanlar İmar Yönetmeliği kapsamındaki güncel değerler alınır.',
      'Tablo 2.5.5 – Kullanım faktörleri (konut / eğitim, ofis, AVM, diğer / otel / sağlık): WC 0,30 / 0,35 / 0,22 / 0,25 · Lavabo 0,23 / 0,30 / 0,20 / 0,30 · Duş 0,21 / 0,05 / 0,24 / 0,10 · Pisuar – / 0,20 / 0,05 / 0,06 · Mutfak eviyesi 0,13 / 0,10 / 0,13 / 0,13 · Bulaşık makinası 0,03 / – / 0,05 / 0,04 · Çamaşır makinası 0,10 / – / 0,11 / 0,12.',
      'Su kullanımında azalma oranı: I = Σ (Is × Io × Kf) × 100. Is: iyileştirilmiş armatür / donatı sayısının oranı (iyileştirilen adet / toplam adet), Io: iyileştirilmiş armatür / donatı için su kullanımında azalma oranı ((referans değer − yeni değer) / referans değer), Kf: kullanım faktörü (Tablo 2.5.5).',
      'Örnek: Mevcut binada 10 lavabodan 6’sı 10 lt/dk, 8 WC’den 2’si 3 lt/kullanım olacak şekilde iyileştirilmiştir. Is(lavabo) = 6/10 = 0,6; Io(lavabo) = (12 − 10)/6 = 0,33; Is(WC) = 2/8 = 0,25; Io(WC) = (6 − 3)/6 = 0,5; I = ((0,6 × 0,33 × 0,23) + (0,25 × 0,5 × 0,3)) × 100 = 8,3.'
    ],
    belgeler: ['• Su kullanımında azalma oranı hesaplarının bir rapor halinde sunulması,', '• Kullanılan tüm armatür, donatı ve cihazlara ait teknik belgeler ile mevcut armatür, donatı ve cihazların fotoğrafı.'],
    kaynaklar: ['Planlı Alanlar İmar Yönetmeliği']
  },
  'SAY 01 K2': {
    amac: 'Bu kriter ile binalarda suyun etkin ve verimli kullanılmasının sağlanması amaçlanmaktadır.',
    kanit: 'Kayıp / kaçak raporu ekle',
    gerek: [{ no: 1, text: 'Bina içi su kayıp ve kaçaklarının önlenmesi için teknik rapor hazırlanması, mevcut binalarda gerekli kontrollerin yapılması ve kaçakların tespiti için sistem veya cihazların kullanılması.', durum: ['Y', 'M'] }],
    girdi: [{ k: 'oran', l: 'Su kayıp / kaçak oranı', t: 'num', birim: '%' }],
    hesap: v => {
      const x = gnum(v.oran);
      if (isNaN(x)) return { cr: 0, text: 'Kayıp / kaçak oranını girin.' };
      const cr = x <= 15 ? 10 : x <= 25 ? 8 : x <= 30 ? 5 : 1;
      return { cr, text: `Kayıp / kaçak oranı = ${pct(x)} → ${cr} kredi` };
    },
    kural: 'hesap',
    kuralText: 'Binanın kayıp / kaçak oranı ne kadar düşükse, Tablo 6.58’e göre kademeli olarak alınacak kredi de artar: %15 ve altı 10 · %16–%25 8 · %26–%30 5 · %31 ve üzeri 1 kredi.',
    yontem: [
      'Binanın su iletim hattındaki ana kaçakları tespit etmek amacıyla kaçak kontrol sistemi kurulmalıdır. Sistem, bina ve bina arazisindeki bütün ana su hatlarını kapsamalıdır.',
      'Bina ile ana su şebekesi bağlantısında ana su sayacı bulunmalıdır. Bina içerisinde her daire veya bireysel kullanım alanında ve mümkünse her su dağıtım / kullanım ekipmanında su sayaçları bulunmalı; sayaçların Bina Yönetim Sistemi (BYS) ile bağlantısı olmalı, BYS’den izlenebilmeli ve uzaktan okuma sistemine uygun olmalıdır. BYS olmaması durumunda sayaçların her ay okunarak kaçak kontrolü yapılmalıdır.',
      'Tesisat elemanlarının yetersizliği ve ölçüm hataları su kaybına neden olan etkenler arasındadır. Su kaybını önlemek için ultrasonik sayaçların ve debimetrenin kullanılması önerilir. Su kaybını sıfıra indirmek mümkün değildir; kayıpların bir kısmı “önlenemez su kaybı” sınıfına girer. Su kayıp yönetimi “önlenebilir su kaybını” azaltarak toplam su kaybını ekonomik kayıp seviyesine (ortalama %15’e) çekmeye çalışır. Su kayıp / kaçakları yüzde (%) olarak ifade edilir ve maksimum erişilebilecek oran %15 olarak alınır.'
    ],
    belgeler: 'Su dağıtım yapısında kayıp / kaçakların tespiti / önlenmesi konusunda rapor.'
  },
  'SAY 01 K3': {
    amac: 'Bu kriter ile su kullanımının sayaçlar ile izlenmesi ve kayıt altına alınması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Su kullanımının sayaçlar ile otomatik veya manuel olarak izlenmesi ve ortak alanlara ait tüketimler dahil su kullanım miktarının kayıt altına alınması.', durum: ['Y', 'M'] }],
    kural: 'mandatory',
    kuralText: 'Her türlü bina tipolojisinde, yeni ve mevcut binalarda zorunlu bir kriterdir.',
    yontem: 'Su kullanımının sayaçlar ile otomatik veya manuel olarak izlenmesi ve ortak alanlara ait tüketimlerin kayıt altına alınması zorunlu bir kriter olarak değerlendirilmektedir. Böylelikle zaman ölçeğinde su kullanımları ölçülebilir ve kayıt altına alınarak zorunluluk yerine getirilmiş olur.',
    belgeler: 'Binadaki tek ve/veya diğer tüm sayaç yerlerini gösteren proje / doküman, fotoğraflar.'
  },
  'SAY 01 K4': {
    amac: 'Bu kriter ile halk ve toplum sağlığı açısından su kalitesinin kontrolünün sağlanması ve korunması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Bina içerisinde su dağıtım hatlarında, özellikle depo gibi su biriktirme ünitelerinin periyodik bakımlarının yapılması ve bu bakımlarla ilgili bilginin düzenli olarak kayıt altında tutulması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiği durumda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Su kalitesinin kontrolü halk ve toplum sağlığı açısından son derece önemlidir. Bina içerisinde su dağıtım hatlarında özellikle depo gibi su biriktirme ünitelerinin periyodik bakımları yapılmalı ve bu bakımlarla ilgili bilgi düzenli olarak kayıt altında tutulmalıdır.',
    belgeler: 'Binada dağıtılan suyun kalitesinin kontrolüne ilişkin analiz raporları ve varsa su depolarının rutin temizliklerinin yapıldığına ve/veya yapılacağına dair sözleşmeler.',
    kaynaklar: ['İnsani Tüketim Amaçlı Sular Hakkında Yönetmelik', 'TS 266 Sular - İnsani Tüketim Amaçlı Sular']
  },
  'SAY 01 K5': {
    amac: 'Bu kriter ile; alternatif bir su kaynağı olan yağmur suyunun binalarda çeşitli amaçlar için kullanılarak şebeke suyundan tasarruf edilmesi amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Binanın yağmur suyundan yararlanma hesaplarının yapılması ve yağmur suyu sisteminin kurulması.', durum: ['Y', 'M'] },
      { no: 2, text: 'Yağmur suyu toplama ve depolama tasarımının; Meteoroloji Genel Müdürlüğü’nün yayımladığı ilin yıllık yağış miktarına, yağışın düştüğü çatının ve geçirimsiz yüzeylerin alanına ve toplanan suyun kullanım amacına göre, sıhhi tesisat düzenleme esaslarına uygun mühendislik hesaplarını içeren projelerinin hazırlanması.', durum: ['Y', 'M'] },
      { no: 3, text: 'Binadaki kullanım amacına uygun olarak (bahçe sulama, tuvalet hacimlerinde kullanım, arıtma sonrası lavabolarda kullanım vb.) ve hesaplar sonucunda ihtiyacı karşılayacak kapasitede yağmur suyu toplama sisteminin belirlenmesi.', durum: ['Y', 'M'] }
    ],
    girdi: [{ k: 'oran', l: 'Tasarlanan depo hacminin referans değerden fazla olma oranı', t: 'num', birim: '%' }],
    hesap: sayOran('oran', 'Depo hacmi fazlalık oranı', () => [[5, 3], [12, 5], [25, 7]]),
    kural: 'hesap',
    kuralText: 'Gerekliliklerin sağlanması durumunda, tasarlanan depo hacminin referans değerden fazla olma oranına göre Tablo 2.5.6’da belirtilen krediler alınır: %5–%11 3 · %12–%24 5 · %25 ve üzeri 7 kredi.',
    yontem: [
      'Yağmur suyu toplama sistemleri TS EN 16941-1 “Yerinde içilebilir olmayan su sistemleri - Bölüm 1: Yağmur suyu kullanımı için sistemler” standardına uygun olmalıdır.',
      'Depo hacmi için referans değer; binanın bulunduğu ilin m²’ye düşen yıllık toplam yağış miktarı ortalaması, çatı / kaplama yapılmış geçirimsiz yüzey tipi ve alanına göre hesaplanan yıllık toplanabilir yağmur suyu miktarının en az yıllık ortalama kuraklık periyodundaki ihtiyacı karşılayacak şekilde, TS EN 16941-1 EK-A’da verilen yöntemlerden uygun olanıyla belirlenir.',
      'Yıllık ortalama kuraklık periyot yüzdesi (YOKP%), Meteoroloji Genel Müdürlüğünün her il için yayımladığı yıllık ortalama yağışlı gün sayısına (YOYGS) göre hesaplanır; bu değer Planlı Alanlar İmar Yönetmeliği gereği %6 alınır. Depo hacmi belirlenirken yıllık toplam yağmur suyu hasadının en az %6’sı karşılanmalıdır.',
      'Derecelendirme, bina için tasarlanan deponun referans depo hacminden fazla olma oranına göre yapılır.'
    ],
    belgeler: ['• Yağmur suyu toplama sistemi projesi,', '• Tasarlanan yağmur suyu toplama depo hacminin hesaplanan referans değerden fazla olma oranı (%) hesabı ile arıtılan suyun hangi amaçlarla ve nerede kullanılacağını içeren teknik rapor.'],
    kaynaklar: ['Planlı Alanlar İmar Yönetmeliği', 'TS EN 16941-1 Yerinde içilebilir olmayan su sistemleri - Bölüm 1: Yağmur suyu kullanımı için sistemler', '“Yerinde İçilemez Su Sistemleri Kılavuzu” (https://webdosya.csb.gov.tr/db/meslekihizmetler/menu/yagmur-gri-su-klavuz-05_20250312114534.pdf)']
  },
  'SAY 01 K6': {
    amac: 'Bu kriter ile; alternatif bir su kaynağı olarak değerlendirilen gri suyun arıtıldıktan sonra binalarda çeşitli amaçlar için kullanılarak şebeke suyundan tasarruf edilmesi amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Gri su toplama, arıtma ve geri kullanım sistemine ait fizibilite raporunun hazırlanması ve rapor doğrultusunda gri sudan yararlanılmasının sağlanması.', durum: ['Y', 'M'] }],
    girdi: [{ k: 'oran', l: 'Gri sudan yararlanma oranı', t: 'num', birim: '%' }],
    hesap: (v, p) => {
      const r = sayOran('oran', 'Gri sudan yararlanma oranı', p => [[3], [10], [15]].map(([m], i) => [m, [[4, 6, 8], [8, 10, 13], [3, 4, 5]][sayGrp(p)][i]]))(v, p);
      return isNaN(gnum(v.oran)) ? r : { cr: r.cr, text: `${r.text} (${SAY_GRP_AD[sayGrp(p)]})` };
    },
    kural: 'hesap',
    kuralText: 'Gerekliliğin sağlanma durumuna göre yeni ve mevcut binalar, gri sudan yararlanma oranına bağlı olarak Tablo 2.5.7’de belirtilen şekilde kredilendirilir.',
    detay: [
      'Tablo 2.5.7 – Gri sudan yararlanma oranına göre krediler (konut / ofis, otel, alışveriş ve ticaret / eğitim ve sağlık):',
      '• %3–%9: 4 / 8 / 3,',
      '• %10–%14: 6 / 10 / 4,',
      '• %15 ve üzeri: 8 / 13 / 5.'
    ],
    yontem: [
      'Atık suyun geri kullanımı (gri su) bir alternatif su kaynağıdır. Evsel atık suların lavabo, duş ve küvetten kaynaklanan, foseptik içermeyen kısmına “gri su” adı verilir.',
      'Gri su sistemleri TS EN 16941-2 “Yerinde içilemez su sistemleri - Bölüm 2: Arıtılmış gri suyun kullanımına yönelik sistemler” standardına uygun olmalıdır. Gri su bina içerisinde ayrı bir hatla toplanmalı ve depo sisteminde uygun şekilde arıtılarak yine ayrı bir hatla öncelikle tuvalet rezervuarlarına verilmelidir.',
      'Gri sudan yararlanma oranı; TS EN 16941-2’de verilen yöntemlerden bina tipine uygun olanı kullanılarak hesaplanan günlük gri su talebinin toplanabilir günlük gri su miktarına oranıdır.'
    ],
    belgeler: ['• Gri su toplama sistemi projeleri,', '• Arıtılan suyun hangi amaçlarla ve nerede kullanılacağını ve gri sudan yararlanma oranını (%) içeren teknik rapor,', '• Gri su sisteminin teknik özelliklerini belirten doküman.'],
    kaynaklar: ['Planlı Alanlar İmar Yönetmeliği', 'Atıksu Arıtma Tesisleri Teknik Usuller Tebliği', 'TS EN 16941-2 Yerinde içilemez su sistemleri - Bölüm 2: Arıtılmış gri suyun (lavabo atık suyu) kullanımına yönelik sistemler', '“Yerinde İçilemez Su Sistemleri Kılavuzu” (https://webdosya.csb.gov.tr/db/meslekihizmetler/menu/yagmur-gri-su-klavuz-05_20250312114534.pdf)']
  },

  // ---- SAY 02 Atık Yönetimi
  'SAY 02 K1': {
    amac: 'Bu kriter ile, binalarda oluşan çeşitli ve farklı türdeki atıkların nerelerden ve hangi miktarlarda oluştuğunun belirlenmesi, bunların azaltım, yeniden kullanım ve yönetimine dair yöntemlerin bilinmesi amaçlanmaktadır.',
    kanit: 'Atık yönetim planı ekle',
    gerek: [{ no: 1, text: 'Binada atık yönetim planının hazırlanması (tadilat, inşaat ve yenileme esnasında açığa çıkan malzemelerin geri kullanımı dahil).', durum: ['Y', 'M'] }],
    detay: [
      'Referans bina; yeni binalar için herhangi bir atık yönetiminin olmadığı ve atıkların türlerine göre ayrılmadan doğrudan yerel yönetim tarafından toplandığı durumu, mevcut binalar için binanın iyileştirme yapılmadan önceki halini temsil eder.',
      'Atıkların ayrı biriktirilmesinin sağlanması zorunludur. Yeni yapılarda, diğer atıkların ve geri kazanılabilir atıkların toplanması amacıyla yerel yönetimlerin uygun gördüğü konum, sayı ve nitelikte ikili biriktirme ekipmanı belirlenmeli ve inşaat tamamlanmadan önce montajı için parsel sınırları kullandırılmalıdır.',
      'Atık grupları: geri kazanılabilir atıklar (cam, metal, plastik, kağıt / karton / kompozit), diğer atıklar; oluşması durumunda biyo-bozunur atıklar, bitkisel atık yağ, atık pil ve bataryalar, tekstil atıkları, elektrik ve elektronik atıklar. Atık kompozisyonları ve miktarları aylık, mevsimsel ve yıllık olarak kayıt altında tutulmalı, biriktirme alanında atıklar etiketlenmeli; atık önleme, azaltma ve sıfır atık uygulamaları için “Sıfır Atık Uygulama Kılavuzu” dikkate alınmalıdır.'
    ],
    kural: 'mandatory',
    kuralText: 'Yeni ve mevcut binalar için gerekliliğin yerine getirilmesi zorunludur.',
    yontem: 'Binanın atık yönetim planı tüm ayrıntıları içerecek şekilde hazırlanmalıdır. Binanın faaliyete geçmesi ile birlikte bu yönetim planına uygun şekilde hareket edildiğini değerlendirebilmek adına, toplanan ve ayrıştırılan atıklar ile binanın geçici depolama alanından mahalli idare sistemine veya çevre lisanslı atık işleme tesisine gönderilecek atık miktarlarına ilişkin verilerin kayıtları tutulmalıdır. Ayrıca tadilat, inşaat, yenileme esnasında açığa çıkan malzemelerin geri kullanımının da atık yönetim planında yer alması durumunda zorunluluk yerine getirilmiş olur.',
    belgeler: 'Bina atık yönetim planını açıklayan rapor',
    kaynaklar: [
      'Atık Yönetimi Yönetmeliği', 'Sıfır Atık Yönetmeliği', 'Bitkisel Atık Yağların Kontrolü Yönetmeliği', 'Atık Pil ve Akümülatörlerin Kontrolü Yönetmeliği',
      'Atık Elektrikli ve Elektronik Eşyaların Kontrolü Yönetmeliği', 'Ambalaj Atıklarının Kontrolü Yönetmeliği', 'Atık Ön İşlem ve Geri Kazanım Tesislerinin Genel Esaslarına İlişkin Yönetmelik',
      'Atık Getirme Merkezlerinin Kurulması ve İşletilmesi ile Sıfır Atık Uygulamalarına İlişkin Usul ve Esaslar',
      'Sıfır Atık Uygulama Kılavuzu (https://cygm.csb.gov.tr/sifir-atik-uygulamalari-dairesi-baskanligi-i-108111)'
    ]
  },
  'SAY 02 K2': {
    amac: 'Bu kriter ile; atıkların kaynağında ayrı biriktirilmesi, en az ikili (geri kazanılabilir atıklar ve diğer atıklar için olmak üzere) biriktirme ekipmanlarının sağlanması, uygun yer ve hacimlerde toplanması, atık önleme ve azaltımı ile atıkların yeniden kullanımı ve geri kazanımının sağlanması amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    not: 'Ayrı biriktirilen en kapsamlı atık grubunu işaretleyin; alt kademeler kendiliğinden işaretlenir.',
    gerek: [
      { no: 1, text: 'Geri Kazanılabilir Atıkların (GKA) (cam, metal, plastik, kağıt / karton) ayrı biriktirilmesi (12 kredi).', durum: ['Y', 'M'] },
      { no: 2, text: 'GKA + Elektrik ve Elektronik atıkların (EA) ayrı biriktirilmesi (15 kredi).', durum: ['Y', 'M'] },
      { no: 3, text: 'GKA + EA + Biyo-bozunur Atıkların (BA) (meyve-sebze atıkları, çay ve kahve posaları, park ve bahçe kaynaklı atıklar) ayrı biriktirilmesi (18 kredi).', durum: ['Y', 'M'] },
      { no: 4, text: 'Sıfır Atık Yönetmeliği EK-1 listesindeki yerler için sıfır atık belgesinin alınması; diğer yerler için GKA + EA + BA + bitkisel atık yağ (BAY), atık piller, tekstil atıkları / giysiler ve diğer atıkların ayrı biriktirilmesi (20 kredi).', durum: ['Y', 'M'] }
    ],
    kural: 'tiers', must: [],
    tiers: [{ no: 1, cr: cr7(12, 12) }, { no: 2, cr: cr7(15, 15) }, { no: 3, cr: cr7(18, 18) }, { no: 4, cr: cr7(20, 20) }],
    kuralText: 'Ayrı biriktirilebilen atık gruplarına göre yeni ve mevcut binalar Tablo 2.5.9’da belirtilen şekilde kredilendirilir.',
    detay: 'Sıfır atık yönetim sisteminin kurulması; kaynağında en az ikili olmak üzere ayrı biriktirilen atıkların birbirleriyle karıştırılmadan toplanmasına ve geçici depolanmasına yönelik altyapının oluşturulması, ortalama hane büyüklüklerine göre ekipman ihtiyacının belirlenerek atıkların toplanması ve Sıfır Atık Yönetmeliği EK-1 listede tanımlanan uygulama takviminde yer alması halinde sıfır atık belgesinin alınması beklenir.',
    yontem: [
      'Atıkların kaynağında ayrı biriktirilmesi, yerinde ayrıştırılması, en az ikili biriktirme ekipmanlarının sağlanması ve uygun yer ve hacimlerde toplanması kriterinde; bu amaçla ayrılabilecek alanların mümkün mertebe atığın kaynaklandığı bina içinde / yakınında ayrılmış olması, ayırma işlemlerinin gerçekleştiriliyor olması, ayrı biriktirilen atıkların uygun hacimlerde toplanmasına olanak verecek düzenin ve geçici depolama alanının bulunması uygulamaya göre kredilendirilir.',
      'Atık grupları: geri kazanılabilir atıklar (cam, metal, plastik, kağıt, karton vb.), biyo-bozunur atıklar, bitkisel atık yağ, elektrik - elektronik atıklar, atık piller ve bataryalar, tekstil atıkları (giysiler vb.), diğer atıklar (geri dönüşümü mümkün olmayan atıklar).',
      'Geri kazanılabilir atıklar ayrı ekipmanlarda toplanabilir ve binanın geçici depolama alanından mahalli idare sistemine veya çevre lisanslı atık işleme tesisine gönderilmelidir. Atık kompozisyonları ve miktarları aylık, mevsimsel ve yıllık olarak tablolarda tutulmalı; düzenli ölçümlerde toplanan atık miktarları ve katılım yüzdeleri değerlendirilmeli; geçici depolama alanında atıklar etiketlenmelidir. Bu kriterin derecelendirilmesinde ayrı biriktirilebilen atık grupları baz alınır.'
    ],
    belgeler: 'Atıkların ayrı biriktirilmesi, toplanması ve geçici depolanması konusunda ilgili kroki ve fotoğrafları içeren çalışma planı veya sıfır atık belgesi.',
    kaynaklar: [
      'Atık Yönetimi Yönetmeliği', 'Bitkisel Atık Yağların Kontrolü Yönetmeliği', 'Atık Pil ve Akümülatörlerin Kontrolü Yönetmeliği', 'Atık Elektrikli ve Elektronik Eşyaların Kontrolü Yönetmeliği',
      'Ambalaj Atıklarının Kontrolü Yönetmeliği', 'Atık Ön İşlem ve Geri Kazanım Tesislerinin Genel Esaslarına İlişkin Yönetmelik', 'Sıfır Atık Yönetmeliği',
      'Atık Getirme Merkezlerinin Kurulması ve İşletilmesi ile Sıfır Atık Uygulamalarına İlişkin Usul ve Esaslar',
      'Sıfır Atık Uygulama Kılavuzu (https://cygm.csb.gov.tr/sifir-atik-uygulamalari-dairesi-baskanligi-i-108111)'
    ]
  },
  'SAY 02 K3': {
    amac: 'Bu kriter ile atık oluşumunun önlenmesi ve azaltılmasının teşvik edilmesi ile ayrıştırılan atıkların geri kazanımının sağlanması amaçlanmaktadır.',
    kanit: 'Atık azaltım raporu ekle',
    gerek: [
      { no: 1, text: 'Geri kazanılabilir atıkların (GKA) ve elektrik - elektronik atıkların (EA) ayrı biriktirilip toplanması (5 kredi).', durum: ['Y', 'M'] },
      { no: 2, text: 'Biyo-bozunur atıkların (BA) da ayrı biriktirilip değerlendirilmesi (5 kredi).', durum: ['Y', 'M'] }
    ],
    kural: 'each', each: 5,
    kuralText: 'Her bir gereklilik için 5 kredi alınır; her ikisinin de yerine getirilmesi durumunda yeni ve mevcut binalar için tam kredi alınır (Tablo 2.5.10: GKA + EA 5, GKA + EA + BA 10 kredi).',
    yontem: [
      'Kredilendirme, binada oluşan atıkların ayrıştırma ve ön toplama işlemi yapılmaksızın mahalli idareye veya çevre lisanslı atık işleme tesisine verilmesi durumuna göre atık hacminin azalması ile ayrı biriktirilen ve toplanan atık gruplarına paralel olarak derecelendirilir. Evsel atığın yaklaşık:',
      '• %50’si biyo-bozunur atık,', '• %5’i cam,', '• %9’u kağıt / karton,', '• %11’i plastik,', '• %2’si metal,', '• %14’ü diğer yanabilen,', '• %9’u diğer yanmayanlar ve diğer atıklardır.'
    ],
    belgeler: 'Bina atık yönetim planının eki olarak hazırlanacak ve ayrı biriktirilen atıkların yeniden kullanımı ve geri kazanımının teşviki ile uzaklaştırılacak atık hacminin azaltılması konusunda yapılacakların sıralandığı rapor.',
    kaynaklar: ['Atık Yönetimi Yönetmeliği', 'Bitkisel Atık Yağların Kontrolü Yönetmeliği', 'Atık Pil ve Akümülatörlerin Kontrolü Yönetmeliği', 'Atık Elektrikli ve Elektronik Eşyaların Kontrolü Yönetmeliği', 'Ambalaj Atıklarının Kontrolü Yönetmeliği', 'Sıfır Atık Yönetmeliği']
  },
  'SAY 02 K4': {
    amac: 'Bu kriter ile; ikili biriktirme sistemine ilave olarak yemek hazırlama aşamasında oluşan atıklar, meyve-sebze atıkları, çay ve kahve posaları, park ve bahçe kaynaklı atıklar gibi biyo-bozunur atıkların ayrı biriktirileceği üçlü sistemin kurularak, mahalli idareye veya çevre lisanslı atık işleme tesisine verilmesi amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [{ no: 1, text: 'Biyo-bozunur atıkların ayrı biriktirilip toplanarak mahalli idareye veya çevre lisanslı atık işleme tesisine verilmesi.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gerekliliğin yerine getirildiği durumda yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Biyo-bozunur atıkların organik madde içeriği olması dolayısıyla, özellikle maddesel geri kazanımın sağlanması ve enerji kazanımı mümkün olabilmektedir. Biyo-bozunur atıkların hane / binadan ayrı biriktirildiği ve toplandığı ve mahalli idareye veya çevre lisanslı atık işleme tesisine gönderildiği kanıtlanmalıdır.',
    belgeler: 'Biyo-bozunur atıkların ayrı toplanması ve mahalli idareye veya çevre lisanslı atık işleme tesisine verilmesinin / gönderileceğinin belgelendirilmesi.',
    kaynaklar: [
      'AB Atık Çerçeve Yönetmeliği 2008/98/EC', 'Atık Yönetimi Yönetmeliği', 'Bitkisel Atık Yağların Kontrolü Yönetmeliği', 'Sıfır Atık Yönetmeliği',
      'Çevre, Şehircilik ve İklim Değişikliği Bakanlığının Atık Getirme Merkezlerinin Kurulması ve İşletilmesi ile Sıfır Atık Uygulamalarına İlişkin Usul ve Esaslar hakkındaki Genelgesi'
    ]
  },
  'SAY 02 K5': {
    amac: 'Bu kriter ile; tadilat ve yıkıntı atıklarının karıştırılmadan ayrı biriktirilmesinin sağlanması ve yeniden kullanımının teşvik edilmesi amaçlanmaktadır.',
    kanit: 'Kanıt belgeleri ekle',
    gerek: [
      { no: 1, text: 'Yıkıntı atıklarının ayrı biriktirilmesine yönelik planlamanın yapılması (3 kredi).', durum: ['Y', 'M'] },
      { no: 2, text: 'Ayrı biriktirilen yıkıntı atıklarının yeniden kullanımının yer alması, uygulama yol haritası olması / uygulama örneklerinin yer alması (2 kredi).', durum: ['Y', 'M'] }
    ],
    kural: 'levels', levels: [{ req: [1], cr: 3 }],
    kuralText: 'Planlama mevcut ise 3 kredi; plan ile birlikte uygulama yol haritası / uygulama örnekleri de mevcut ise (her iki gereklilik) yeni ve mevcut binalar için tam kredi (5) alınır.',
    yontem: 'Yıkıntı atıklarının ayrı biriktirilmesine yönelik planlama ile yeniden kullanım alternatiflerinin yer alması beklenmektedir.',
    belgeler: ['• Yıkıntı atıklarının ayrı biriktirilmesi ile yeniden kullanıma yönelik planlama,', '• Örneklerin yer aldığı raporu içeren uygulama yol haritası.'],
    kaynaklar: ['Atık Yönetimi Yönetmeliği', 'Hafriyat Toprağı, İnşaat ve Yıkıntı Atıklarının Kontrolü Yönetmeliği', 'Atık Ön İşlem ve Geri Kazanım Tesislerinin Genel Esaslarına İlişkin Yönetmelik', 'Sıfır Atık Uygulama Kılavuzu (https://cygm.csb.gov.tr/sifir-atik-uygulamalari-dairesi-baskanligi-i-108111)']
  },

  // ==== İNO İnovasyon_Bina (kılavuz: ino.docx) — toplam puana dahil değil
  // ---- İNO 01 Yaşam Kalitesini Yükselten Mühendislik ve Tasarım Çözümleri
  'İNO 01 K1': {
    amac: 'Bu kriter ile; mevcut sertifika gereklilikleri içinde bulunmayan ancak yeşil bina belgelendirmesinde inovatif değeri olan uygulamaların sağlanmış olması amaçlanmaktadır.',
    kanit: 'İnovasyon raporu ekle',
    gerek: [{ no: 1, text: 'İnovatif değeri olan uygulamaların sağlanmış olduğunu gösteren İnovasyon Raporu’nun hazırlanması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Bu modülde yer alan kriterin ‘İnovasyon Raporu’ ile sunulması ve bu raporun kriterin gerekliliklerini nasıl sağladığına ilişkin detaylı açıklamaları içermesi beklenmektedir. İNO 01 K1 kriteri hem tasarım aşamasında BBT modülünde, hem de tamamlanmış uygulama olarak İNO_Bina modülünde kredilendirilir.',
    belgeler: 'İnovasyon Raporu (BBT ve İNO_Bina modülünde sunulmak üzere)'
  },
  'İNO 01 K2': {
    amac: 'Bu kriter ile; geliştirilecek yenilikçi uygulamalar ile bina kullanıcılarının yaşam kalitesini artırıcı iyileştirmeler sağlanması amaçlanmaktadır.',
    kanit: 'Bina ve yaşam kalitesi raporu ekle',
    gerek: [{ no: 1, text: 'Bina kullanıcılarının yaşam kalitesini arttırmayı hedefleyen uygulamaları içeren Bina ve Yaşam Kalitesi Raporu’nun hazırlanması.', durum: ['Y', 'M'] }],
    detay: [
      'Bina ve Yaşam Kalitesi Raporu’nda yaşam kalitesini yükseltici donatılar 4 grupta değerlendirilir:',
      '• Sağlık ve spor alanları: kapalı spor salonu / egzersiz odası, açık / kapalı yüzme havuzu, tenis kortu, takım oyunları için oyun sahası, atletizm / koşu / bisiklet parkuru, yürüyüş parkurları, dinlenme alanı (tasarımı BBT, uygulaması İNO_Bina modülünde kredilendirilir),',
      '• Açık ve yeşil alanlar: parklar, çocuk oyun alanları, ortak kullanım için kat bahçeleri, hobi bahçeleri, çatı terasları, yeşil çatı uygulamaları,',
      '• Sosyal, kültür ve sanat alanları: kreş, kapalı çocuk oyun alanı, dinlenme terasları, kameriye, çardak, açık / kapalı kafeterya; bina içinde herkesin görebileceği bir mekanda (giriş, hol vb.) özgün bir sanat eseri veya toplu konut projelerinde sanat faaliyetleri için ayrılmış mekan ve altyapı,',
      '• Hizmet alanları: lostra, kuaför, kuru temizleme, terzi, market gibi birimlerin ayrılmış olması.'
    ],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: [
      'Bina kullanıcılarının yaşam kalitesini arttırmayı hedefleyen, çevresel, sağlık ve sosyal & psikolojik faktörler yönünden avantajlar sağlayan uygulamalar kredilendirilebilir. Canlılar için doğal yaşama ortamının sağlanması, ısı adası etkisinin azaltılması, hava kirliliğinin azaltılması, bina kullanıcılarına ortak alan (sosyal ve kültürel etkileşim alanı), açık ve yeşil alan yaratılması gibi çevresel, sosyolojik ve psikolojik yönden pozitif etki sağlayan çözüm ve uygulamalar beklenmektedir.',
      'İNO 01 K2 kriteri için gerekli kanıt belgesi olan Bina ve Yaşam Kalitesi Raporu’nun hem tasarım aşamasında BBT modülünde, hem de tamamlanmış uygulama olarak İNO_Bina modülünde sunulması ve kredilendirilmesi beklenmektedir.'
    ],
    belgeler: [
      'Bina ve Yaşam Kalitesi Raporu (BBT ve İNO_Bina modülünde sunulmak üzere). Rapor için gerekli belgeler:',
      '• Sağlık ve spor alanları için; ortak kullanım amacını taşıyan sağlık ve spor alanlarında yönetmelikte belirlenen uygun koşulları sağladığını kanıtlayan rapor. Raporda tesislerin kapasitesi, vaziyet planı üzerinde işaretlenmesi, tesislerin listesi ve binaya uzaklıkları verilmelidir,',
      '• Açık ve yeşil alanlar için; bina girişinde, çatısında, ara katlarda, yan yüzeylerde oluşturulan açık ve yeşil alan ve yüzeylerin bina kullanıcılarına olan çevresel, sosyolojik ve psikolojik pozitif etkilerinin belirtildiği ayrıntılı rapor ile bu alanların teknik yönü, bakım, işletme ve sürdürülebilirliği konusunda peyzaj teknolojileri ile ilgili ayrıntılı rapor,',
      '• Sosyal etkileşim alanları varsa; kameriye, çardak, kafeterya gibi ortak kullanım alanlarının vaziyet planı üzerinde ve bina içi erişilebilirlik ilişkisi kurularak gösterildiği ve bina kullanıcıları üzerindeki sosyal ve psikolojik etkilerinin belirtildiği rapor,',
      '• Sanat eserleri varsa; sanat eserinin özelliklerini açıklayan rapor,',
      '• Sanat için ayrılan mekan varsa; mekanın özelliklerini, mekanı gösteren planı ve sanat mekanının yönetimini açıklayan rapor.'
    ]
  },

  // ---- İNO 02 İzleme ve Değerlendirme Sisteminin Geliştirilmiş Olması
  'İNO 02 K1': {
    amac: 'Projenin su, ısı ve enerji sürdürülebilirliğini izleme, ölçme ve değerlendirme ile ilgili inovatif çözümleri içeriyor olması amaçlanmaktadır.',
    kanit: 'Sürekli izleme ve değerlendirme raporu ekle',
    gerek: [{ no: 1, text: 'Projenin sürdürülebilirliğini izlemek, ölçmek ve değerlendirmek ile ilgili inovatif çözümleri içeren Sürekli İzleme ve Değerlendirme Raporu’nun hazırlanması.', durum: ['Y', 'M'] }],
    kural: 'all',
    kuralText: 'Gereklilik yerine getirildiğinde yeni ve mevcut binalar için tam kredi alınır.',
    yontem: 'Bina verilerinin izleme, ölçme ve değerlendirmesinin yapılması ile hem sektörel hem bireysel enerji verimliliği ve etkin kaynak kullanımının sağlanmasının hedeflendiği İNO 02 K1 kriteri, hem tasarım aşamasında BBT modülünde hem de tamamlanmış uygulama olarak İNO_Bina modülünde kredilendirilebilir. Kriterin tasarım ve uygulama aşamasında yerine getirildiğinin kanıtı olarak ‘Sürekli İzleme ve Değerlendirme Raporu’nun sunulması beklenmektedir.',
    belgeler: 'Sürekli İzleme ve Değerlendirme Raporu'
  }
};

const guideOf = c => CRIT_GUIDE[c.id];
const DURUM_AD = { Y: 'yeni', M: 'mevcut' };
// Gereklilik bu bina tipinde gösterilir mi (tip: bina tipi indeksleri, TIPS sırası; yoksa tüm tipler)
const gTip = (g, p) => !g.tip || g.tip.includes(+p.tip);
// Gereklilik bu projeye uyar mı (durum + bina tipi)
const gApplies = (g, p) => g.durum.includes(p.durum) && gTip(g, p);
// Projenin durumuna ve bina tipine uyan, işaretlenebilir gereklilikler (başlıklar hariç)
const guideReqs = (c, p) => guideOf(c).gerek.filter(g => !g.head && gApplies(g, p));
const guideChecked = (c, p, no) => !!(p.g && p.g[c.id] && p.g[c.id][no]);
// must / pick / tiers listelerinden yalnızca projeye uyan gereklilik numaraları
const reqNos = (c, p, list) => list.filter(n => guideReqs(c, p).some(g => g.no === n));
// 'tiers': işaretli kademeler (projeye uyanlar)
const tiersOn = (c, p) => guideOf(c).tiers.filter(t => reqNos(c, p, [t.no]).length && guideChecked(c, p, t.no));
// ---- 'hesap' kuralı: girilen değerlerden (girdi) kredi hesaplanır
// Projede girilen değerler: p.gv[kriter id][anahtar]
const gvOf = (c, p) => (p.gv && p.gv[c.id]) || {};
// Projeye uyan girdi alanları
const guideInputs = (c, p) => (guideOf(c).girdi || []).filter(f => !f.durum || f.durum.includes(p.durum));
// Sayı okuma (virgül ya da nokta); boşsa NaN
const gnum = v => v === undefined || v === '' ? NaN : parseFloat(String(v).replace(',', '.'));
const fmtN = x => (Math.round(x * 100) / 100).toLocaleString('tr-TR');
// Aralık tablosu: bands = [[alt sınır, kredi], ...] artan sırada; ilk aralıkta x > alt sınır, sonrakilerde x ≥ alt sınır
// (incl: ilk aralıkta da x ≥ alt sınır)
function bandCredit(x, bands, incl) {
  if (!(incl ? x >= bands[0][0] : x > bands[0][0])) return 0;
  let cr = bands[0][1];
  for (const [min, k] of bands.slice(1)) if (x >= min) cr = k;
  return cr;
}
// Hesap sonucu: { cr: kredi, text: açıklama } (girdiler eksikse cr 0)
const guideCalc = (c, p) => guideOf(c).hesap(gvOf(c, p), p);

// Tam kredi / zorunlu şart koşulu ('tiers' kuralında: must + herhangi bir kademe)
function guideMet(c, p) {
  const G = guideOf(c), reqs = guideReqs(c, p), on = g => guideChecked(c, p, g.no);
  if (!reqs.length) return false;
  if (G.kural === 'hesap') return reqs.every(on) && guideCalc(c, p).cr > 0;
  if (G.kural === 'any') return reqs.some(on);
  if (G.kural === 'min') return reqNos(c, p, G.must).every(n => guideChecked(c, p, n)) && reqNos(c, p, G.pick.of).filter(n => guideChecked(c, p, n)).length >= G.pick.min;
  if (G.kural === 'tiers') return reqNos(c, p, G.must).every(n => guideChecked(c, p, n)) && tiersOn(c, p).length > 0;
  return reqs.every(on);
}
// Kılavuza göre alınan kredi (earn: kazanılabilir azami kredi)
function guideCredit(c, p, earn) {
  const G = guideOf(c), reqs = guideReqs(c, p), on = g => guideChecked(c, p, g.no);
  if (!reqs.length || !earn) return 0;
  switch (G.kural) {
    case 'any': case 'min': return guideMet(c, p) ? earn : 0;
    case 'hesap': return reqs.every(on) ? Math.min(earn, guideCalc(c, p).cr || 0) : 0;
    case 'tiers': // kademe kredisi bina durumu ve tipine göre (cr: { Y: [7 tip], M: [7 tip] }); en yüksek işaretli kademe
      if (!guideMet(c, p)) return 0;
      return Math.min(earn, Math.max(...tiersOn(c, p).map(t => t.cr[p.durum][+p.tip])));
    case 'each': return reqs.every(on) ? earn : Math.min(earn, reqs.filter(on).length * G.each);
    case 'levels':
      if (reqs.every(on)) return earn;
      return Math.max(0, ...G.levels.filter(l => l.req.every(n => guideChecked(c, p, n))).map(l => Math.min(earn, l.cr)));
    default: return reqs.every(on) ? earn : 0; // 'all' (ve 'mandatory': kredisi yok)
  }
}
