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
  'İNO': 'İnovasyon (toplam puana dahil değil)'
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

// Raporda modüllerin sırası (binada YMD, İOK'tan önce gelir).
function reportModuleOrder() { return D.scale === 'Y' ? [0, 1, 2, 3, 4, 5] : [0, 2, 1, 3, 4, 5]; }

// Dosya adı için güvenli metin
const safeName = s => (s || 'Proje').replace(/[^\wÇĞİÖŞÜçğıöşü.-]+/g, '_').slice(0, 60);

// Kanıt dosyasının ek numarası: Ek-BBT01K1-2
function evidenceNo(c, i) { return 'Ek-' + c.id.replace(/ /g, '') + '-' + (i + 1); }

// Kriterin bu proje tipi / durumu için tanımlı değeri (sayı ya da 'Z').
function critValue(c, S) { return c.v[S.durum][S.tip]; }

function isMandatory(c, S) {
  if (critValue(c, S) === 'Z' || c.zf) return true;
  // Yeni binalarda bina tipine bağlı zorunluluklar (v1.2 tablosu)
  if (S.durum === 'Y') {
    if (c.c === 'İOK 03 K1') return S.tip == 2 || S.tip == 4;
    if (c.c === 'İOK 04 K1') return S.tip != 0;
  }
  return false;
}

// Modülün azami kredisine giren değer (nc kriterlerinde de sayılır).
function maxCredit(c, S) { const a = critValue(c, S); return a === 'Z' ? 0 : a; }

// Kazanılabilir kredi: nc (yalnızca Evet/Hayır) kriterlerde kredi kazanılamaz (v1.3 Excel).
function earnableCredit(c, S) { return c.nc ? 0 : maxCredit(c, S); }

// Zorunluluğun arandığı en düşük derece (zg yoksa tüm dereceler).
const mandatoryFrom = c => c.zg || 0;

// Girilen krediyi 0..kazanılabilir aralığına sıkıştırır.
function givenCredit(c, S) { return Math.min(Math.max(+S.v[c.id] || 0, 0), earnableCredit(c, S)); }

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
      if (isMandatory(c, S) && !S.z[c.id]) missing.push(c);
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
  R.total = R.mods.slice(0, 5).reduce((a, x) => a + x.wc, 0);
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
  D.crit.forEach(c => { if (isMandatory(c, S) && !S.z[c.id] && mandatoryFrom(c) <= g) out.push({ c, why: 'Zorunlu kriter', gain: 0 }); });

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
    if (x.c.m < 5) tot += x.gain;
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
    if (x.c.m < 5) take(x, 'Toplam kredi hedefi');
  }
  return { items: out, tot };
}
