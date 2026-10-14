// YeS-TR skor motoru: kriter kredileri, modül ağırlıkları, derece kontrolü ve öneriler.
// Veri kaynağı data.js içindeki DALL nesnesidir; aktif ölçek D değişkenindedir.

const GRADES = ['Geçer', 'İyi', 'Çok İyi', 'Ulusal Üstünlük'];
const TIPS = ['Konut', 'Ofis', 'Eğitim', 'Otel', 'Sağlık', 'AVM', 'Diğer'];
const STAGES = ['Tümü', '1 Hazırlık', '2 Proje', '3 İhale', '4 İnşaat'];
const MODULE_NAMES = {
  'BBT': 'Bütünleşik Bina Tasarımı',
  'İOK': 'İç Ortam Kalitesi',
  'YMD': 'Yapı Malzemesi ve Yaşam Döngüsü',
  'EKV': 'Enerji Kullanımı ve Verimliliği',
  'SAY': 'Su ve Atık Yönetimi',
  'İNO': 'İnovasyon (toplama bonus, en fazla +10)'
};
const EPS = 1e-9;

let D = DALL.B;
function setScale(scale) { D = DALL[scale || 'B']; }

// Yerleşme modüllerinin adı yok; temalardan türetilir.
function moduleName(i) {
  const m = D.mods[i];
  if (D.scale === 'B') return MODULE_NAMES[m];
  if (m === 'İNO') return MODULE_NAMES['İNO'];
  const themes = [...new Set(D.crit.filter(c => c.m === i).map(c => c.t.replace(/^\S+ \d+ /, '')))];
  return themes.join(' · ');
}

// Modül renkleri (kılavuzdaki başlık vurguları): light = açık ton (zeminler), dark = koyu ton (beyaz yazılı alanlar).
// Tanımı olmayan modüller sitenin varsayılan laciverdini kullanır.
// Pastel palet (deneme). Koyu tonlar beyaz yazıyla ≥ 4,0 kontrast.
// Önceki (kılavuzdaki) palet: BBT #B8CCE4/#365F91 · İOK #ECC3F0/#8E3E99 · YMD #FCD5B4/#974806 ·
// EKV #E5B8B7/#943634 · SAY #93CDDD/#215968 · İNO #BFBFBF/#595959
const MOD_COLORS = {
  'BBT': { light: '#D5E1EF', dark: '#5A7DA6' },
  'İOK': { light: '#F3DDF5', dark: '#9A6AA4' },
  'YMD': { light: '#FDE5D1', dark: '#A26A43' },
  'EKV': { light: '#F1D8D7', dark: '#A8605E' },
  'SAY': { light: '#C3E3EB', dark: '#4D8796' },
  'İNO': { light: '#DEDEDE', dark: '#7A7A7A' }, // bina ve yerleşmede ortak
  // Yerleşme: kılavuzdaki tema başlığı dolguları (BOL #F0D4C6, AKE #C4D79B, UHA #B1A0C7, KET #ADEDEB, SES #EAEAA2)
  // bina paletiyle aynı yöntemle pastelleştirildi; koyu tonlar beyaz yazıyla ≈ 4,3 kontrast.
  'BOL': { light: '#F6E6DE', dark: '#A06F56' },
  'AKE': { light: '#DDE8C5', dark: '#5B8045' }, // koyu ton daha yeşile çekildi (SES ile karışmasın)
  'UHA': { light: '#D2C8DF', dark: '#8A6CB0' },
  'KET': { light: '#CFF5F3', dark: '#478381' },
  'SES': { light: '#F3F3C9', dark: '#8C7228' }  // koyu ton hardala çekildi (AKE ile karışmasın)
};
const modStyle = m => MOD_COLORS[m] ? ` style="--mc:${MOD_COLORS[m].dark};--ml:${MOD_COLORS[m].light}"` : '';
const modClass = m => MOD_COLORS[m] ? ' mc' : '';

// Başvuru dosyasını hazırlayan (YESUM) ve raporu değerlendiren (YESDUM) meslek grupları (kılavuz Bölüm 3)
const YESUM_TXT = '4 yıllık lisans öğrenimini tamamlayan üniversite mezunu';
const MOD_EXPERTS = {
  B: {
    'BBT': 'Mimar, İnşaat Mühendisi, Makina Mühendisi, Elektrik Mühendisi, Elektrik-Elektronik Mühendisi, Elektronik Mühendisi, Elektronik ve Haberleşme Mühendisi',
    'İOK': 'Mimar, İnşaat Mühendisi, Makina Mühendisi, Elektrik Mühendisi, Elektrik-Elektronik Mühendisi, Elektronik Mühendisi, İç Mimar, Elektronik ve Haberleşme Mühendisi',
    'YMD': 'Mimar, İnşaat Mühendisi, Çevre Mühendisi',
    'EKV': 'Mimar, Makina Mühendisi, Elektrik Mühendisi, Elektrik-Elektronik Mühendisi, Elektronik Mühendisi, Enerji Mühendisi, Enerji Sistemleri Mühendisi, Mekatronik Mühendisi, Elektronik ve Haberleşme Mühendisi, İnşaat Mühendisi',
    'SAY': 'İnşaat Mühendisi, Makina Mühendisi, Çevre Mühendisi',
    'İNO': 'Mimar, Makina Mühendisi, İnşaat Mühendisi, Çevre Mühendisi, İç Mimar, Elektrik Mühendisi, Elektrik-Elektronik Mühendisi, Elektronik Mühendisi, Enerji Mühendisi, Enerji Sistemleri Mühendisi, Mekatronik Mühendisi, Elektronik ve Haberleşme Mühendisi'
  },
  Y: {
    'BOL': 'Şehir Plancısı, Harita ve Kadastro Mühendisi',
    'AKE': 'Şehir Plancısı, Peyzaj Mimarı, Çevre Mühendisi, Biyolog, Jeoloji Mühendisi, Jeofizik Mühendisi, Harita ve Kadastro Mühendisi, Ziraat Mühendisi',
    'UHA': 'Şehir Plancısı, İnşaat Mühendisi',
    'KET': 'Mimar, Şehir Plancısı, Peyzaj Mimarı, Çevre Mühendisi, Harita ve Kadastro Mühendisi',
    'SES': 'Sosyolog, Ekonomist (İktisatçı), Şehir Plancısı, Gayrimenkul Geliştirme ve Yönetimi Uzmanı',
    'İNO': 'Şehir Plancısı, Peyzaj Mimarı, Çevre Mühendisi, Mimar, Sosyolog, Ekonomist (İktisatçı), Biyolog, Makina Mühendisi, İnşaat Mühendisi, İç Mimar, Elektrik Mühendisi, Elektrik-Elektronik Mühendisi, Enerji Mühendisi, Enerji Sistemleri Mühendisi, Mekatronik Mühendisi, Elektronik Mühendisi, Elektronik ve Haberleşme Mühendisi, Jeoloji Mühendisi, Harita ve Kadastro Mühendisi, Ziraat Mühendisi, Jeofizik Mühendisi, Gayrimenkul Geliştirme ve Yönetimi Uzmanı'
  }
};
const modExperts = m => (MOD_EXPERTS[D.scale] || {})[m];

// Raporda modüllerin sırası (binada YMD, İOK'tan önce gelir).
function reportModuleOrder() { return D.scale === 'Y' ? [0, 1, 2, 3, 4, 5] : [0, 2, 1, 3, 4, 5]; }

// Kritere özel, kullanıcının doldurduğu tablolar (kriter satırında ve rapordaki kriter kartının altında).
// cols: [anahtar, başlık, tür] · tür 'text' | 'date' | 'time' | 'num' | 'yn' (E/H) | 'list' = her satır bir madde (raporda • ile),
// 'file' = dosya yükleme (kanıt dosyalarıyla aynı ek numaralandırmasına girer)
// when: (isteğe bağlı) tablonun gösterileceği projeler
const CRIT_TABLES = {
  'BBT 01 K1': { title: 'Proje Ekibi Görev ve Sorumluluk Çizelgesi (Tablo 2.1.3)', rows: 1, when: p => p.durum === 'Y', cols: [
    ['gorev', 'Görev', 'text'], ['uzman', 'Uzman Adı Soyadı', 'text'], ['sor', 'Sorumluluk', 'list'], ['belge', 'Yetki Belgesi', 'file']] },
  'BBT 01 K3': { title: 'Proje İhtiyaç Programı (Tablo 2.1.4)', rows: 1, when: p => p.durum === 'Y', cols: [
    ['islev', 'İşlev', 'text'], ['miktar', 'Miktar', 'text'], ['birim', 'Birim (adet, m², m, …)', 'text']] },
  'BBT 02 K1': { title: 'Toplantı Tutanakları (Tablo 2.1.6)', rows: 1, when: p => p.durum === 'Y', cols: [
    ['tarih', 'Tarih', 'date'], ['saat', 'Saat', 'time'], ['yer', 'Yer', 'text'],
    ['katilanlar', 'Katılanlar', 'list'], ['gundem', 'Gündem', 'list'], ['tutanak', 'Tutanak', 'file']] }
  // Not: tablolar 'totals' ({ flag, yes, no, labels }) ve 'note' alanlarıyla otomatik toplam satırı ve dipnot da taşıyabilir.
};
// Toplam satırları: [[etiket, [sütun toplamları]], ...] — sayı sütunları için
function tableTotals(T, rows) {
  if (!T.totals) return [];
  const nums = T.cols.filter(c => c[2] === 'num').map(c => c[0]), { flag, yes, no, labels } = T.totals;
  const sum = f => nums.map(k => rows.filter(f).reduce((a, r) => a + (parseFloat(String(r[k] || '').replace(',', '.')) || 0), 0));
  return [[labels[0], sum(r => r[flag] === yes)], [labels[1], sum(r => r[flag] === no)], [labels[2], sum(() => true)]];
}
const tableOn = (id, p) => !!CRIT_TABLES[id] && (!CRIT_TABLES[id].when || CRIT_TABLES[id].when(p));

// Organizasyon şeması bulunan kriterler ve hangi projelerde gösterileceği (orgchart.js)
const ORG_CRITS = {
  'BBT 01 K1': p => p.durum === 'Y' // yalnızca yeni binalarda
};
const hasOrg = (id, p) => !!ORG_CRITS[id] && ORG_CRITS[id](p);

// Dosya adı için güvenli metin
const safeName = s => (s || 'Proje').replace(/[^\wÇĞİÖŞÜçğıöşü.-]+/g, '_').slice(0, 60);

// Kanıt dosyasının ek numarası: Ek-BBT01K1-2
function evidenceNo(c, i) { return 'Ek-' + c.id.replace(/ /g, '') + '-' + (i + 1); }

// Kriterin bu proje tipi / durumu için tanımlı değeri (sayı ya da 'Z').
function critValue(c, S) { return c.v[S.durum][S.tip]; }

function isMandatory(c, S) {
  if (critValue(c, S) === 'Z' || c.zf) return true;
  // Bina tipine bağlı, kredisi de olan zorunluluklar (kılavuz: yeni ve mevcut binalarda)
  if (D.scale === 'B') {
    if (c.c === 'İOK 03 K1') return S.tip == 2 || S.tip == 4; // eğitim ve sağlık
    if (c.c === 'İOK 04 K1') return S.tip != 0;               // konut dışı
  }
  return false;
}

// Zorunlu şart sağlandı mı? Kılavuzu tanımlı kriterde gereklilik işaretlerinden (guideMet),
// diğerlerinde "Şart sağlandı" kutusundan. (Eski kayıt: yalnızca S.z işaretliyse onu kabul et.)
function zMet(c, S) {
  if (guideOf(c)) return guideZMet(c, S) || (!!S.z[c.id] && !(S.g && S.g[c.id]));
  return !!S.z[c.id];
}

// Modülün azami kredisine giren değer (nc kriterlerinde de sayılır).
function maxCredit(c, S) { const a = critValue(c, S); return a === 'Z' ? 0 : a; }

// Kazanılabilir kredi: nc (yalnızca Evet/Hayır) kriterlerde kredi kazanılamaz (v1.3 Excel).
function earnableCredit(c, S) { return c.nc ? 0 : maxCredit(c, S); }

// Zorunluluğun arandığı en düşük derece (zg yoksa tüm dereceler).
const mandatoryFrom = c => c.zg || 0;

// Alınan kredi. Kılavuzu tanımlı kriterlerde (guide.js) gereklilik işaretlerinden hesaplanır;
// diğerlerinde girilen kredi 0..kazanılabilir aralığına sıkıştırılır.
function givenCredit(c, S) {
  if (guideOf(c)) return guideCredit(c, S, earnableCredit(c, S));
  return Math.min(Math.max(+S.v[c.id] || 0, 0), earnableCredit(c, S));
}

function calc(S) {
  const R = { mods: [], total: 0 };
  const missing = []; // sağlanmamış zorunlu kriterler
  D.mods.forEach((m, i) => {
    let raw = 0, max = 0;
    const optVal = [], optMax = [];
    D.crit.forEach(c => {
      if (c.m !== i) return;
      const x = maxCredit(c, S), u = givenCredit(c, S);
      // Seçenekli kriterlerde (c.g) yalnızca en yüksek seçenek sayılır
      if (c.g) { optVal.push(u); optMax.push(x); } else { raw += u; max += x; }
      if (isMandatory(c, S) && !zMet(c, S)) missing.push(c);
    });
    if (optVal.length) { raw += Math.max(...optVal); max += Math.max(...optMax); }

    const w = D.w[S.durum][i][S.tip] / 100;
    const min = D.min ? D.min[S.durum][i] : null;
    const hasCredit = code => { const c = D.crit.find(z => z.c === code); return c ? givenCredit(c, S) > 0 : false; };
    // met[k]: modül, k derecesi için şartı sağlıyor mu?
    // Bina: ağırlıklı kredi ≥ modül şartı. Yerleşme: her tema grubundan en az bir kriterde kredi.
    const met = i > 4 ? [1, 1, 1, 1] : [0, 1, 2, 3].map(k => min
      ? raw * w + EPS >= min[k]
      : D.grp[i][k].every(gr => gr.some(hasCredit)));
    R.mods.push({ m, raw, max, w, wc: raw * w, min, met });
  });
  // Toplam: beş ana modülün ağırlıklı kredisi + İNO bonusu (İNO ağırlığı %10, en fazla +10; kılavuz: "+10 puan ile katılır")
  R.base = R.mods.slice(0, 5).reduce((a, x) => a + x.wc, 0);
  R.bonus = R.mods[5] ? R.mods[5].wc : 0;
  R.total = R.base + R.bonus;
  // Yerleşme: başvuru belgesi için BOL modülünden 8 ağırlıklı kredi (BOL'un tamamı) gerekir (kılavuz Bölüm 4.1, Aşama 1).
  // Dereceyi etkilemez; sitede ve raporda bilgi / uyarı olarak gösterilir.
  if (D.scale === 'Y') { const bol = R.mods[0]; R.bolNeed = bol.w * 100; R.bolOk = bol.wc + EPS >= R.bolNeed; }
  // missFor(g): g derecesi için aranan ama sağlanmamış zorunlu kriter kodları
  R.missFor = g => missing.filter(c => mandatoryFrom(c) <= g).map(c => c.c);
  R.miss = R.missFor(S.hedef ?? 0); // hedef derece için eksikler (arayüz ve rapor)
  R.ok = GRADES.map((_, g) => R.total + EPS >= D.th[g] && R.mods.slice(0, 5).every(x => x.met[g]) && !R.missFor(g).length);
  R.grade = R.ok.lastIndexOf(true);
  return R;
}

// Hedef dereceye (g) ulaşmak için açgözlü öneri listesi:
// önce eksik zorunlular, sonra modül şartları, en son toplam kredi açığı.
function suggest(S, R, g) {
  const out = [], done = {};
  D.crit.forEach(c => { if (isMandatory(c, S) && !zMet(c, S) && mandatoryFrom(c) <= g) out.push({ c, why: 'Zorunlu kriter', gain: 0 }); });

  const cand = D.crit
    .filter(c => c.m < 6 && earnableCredit(c, S) > givenCredit(c, S) && !(c.g && c.id.endsWith('-2')))
    .map(c => ({ c, gain: (earnableCredit(c, S) - givenCredit(c, S)) * R.mods[c.m].w }))
    .filter(x => x.gain > 0)
    .sort((a, b) => b.gain - a.gain);

  let tot = R.total;
  const wcm = R.mods.map(x => x.wc);
  const take = (x, why) => {
    if (done[x.c.id]) return;
    done[x.c.id] = 1;
    tot += x.gain; // İNO dahil (bonus da toplama eklenir)
    wcm[x.c.m] += x.gain;
    out.push({ c: x.c, why, gain: x.gain });
  };

  R.mods.slice(0, 5).forEach((m, i) => {
    if (m.min) {
      let gap = m.min[g] - wcm[i];
      cand.filter(x => x.c.m === i).forEach(x => { if (gap > EPS) { take(x, m.m + ' modül şartı'); gap -= x.gain; } });
    } else if (!m.met[g]) {
      D.grp[i][g].forEach(gr => {
        const covered = gr.some(code => { const c = D.crit.find(z => z.c === code); return c && givenCredit(c, S) > 0; });
        if (!covered) { const x = cand.find(x => gr.includes(x.c.c)); if (x) take(x, m.m + ' kapsam şartı'); }
      });
    }
  });
  for (const x of cand) {
    if (tot + EPS >= D.th[g]) break;
    take(x, 'Toplam kredi hedefi');
  }
  return { items: out, tot };
}
