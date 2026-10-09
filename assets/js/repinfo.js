// Rapor bilgileri formu (açılış sayfasında, proje bilgilerinin altında isteğe bağlı gruplar).
// Form bir taslak (RF) üzerinde çalışır; "Değerlendirmeye başla" / "Kaydet" ile projeye yazılır.

let RF = repBlank();

const KUNYE_ALANLAR = [
  ['raporNo', 'Rapor no / sürüm', 'ör. YS-2026-014 / v1.0'],
  ['konum', 'Proje konumu (il / ilçe / ada-parsel)', 'ör. Ankara / Çankaya / 1234 ada 5 parsel'],
  ['alan', 'Toplam yapı inşaat alanı (m²)', 'ör. 12.500'],
  ['kat', 'Kat adedi / kullanıcı kapasitesi', 'ör. 2B+6 / 450 kişi'],
  ['ruhsat', 'Yapı ruhsat tarihi / no', 'ör. 12.03.2025 / 2025-118'],
  ['mimar', 'Mimari proje müellifi', ''],
  ['yuklenici', 'Yüklenici / Şantiye şefi', '']
];
// [anahtar, rol, kişi alanı açılış formundan mı geliyor]
const PAY_ROLLER = [
  ['yesu', 'Yeşil Sertifika Uzmanı (YESU)', 'YESU alanından'],
  ['sahip', 'Yapı sahibi / Yetkilisi', 'Kurum alanından'],
  ['yesdu', 'Değerlendirme Uzmanları (YESDU)', ''],
  ['muellif', 'Proje müellifleri / Danışmanlar', '']
];
const ONAY_ROLLER = [['hazirlayan', 'Hazırlayan (YESU)'], ['kontrol', 'Kontrol eden'], ['onaylayan', 'Onaylayan (Yapı sahibi / Yetkili)']];

// "a.b.0.c" biçimindeki yol ile okuma / yazma
const getPath = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
function setPath(o, p, v) {
  const ks = p.split('.'), last = ks.pop();
  ks.reduce((a, k) => a[k] = a[k] || {}, o)[last] = v;
}
const has = v => v != null && String(v).trim() !== '';

const rIn = (path, ph = '', type = 'text') => `<input type="${type}" data-r="${path}" value="${esc(getPath(RF, path) || '')}" placeholder="${esc(ph)}">`;
const rField = (label, path, ph, type) => `<div><label class="f">${label}</label>${rIn(path, ph, type)}</div>`;

// Gruplar: [anahtar, başlık, rapordaki yeri]
const REP_GROUPS = [
  ['kunye', 'Proje künyesi', 'Kapak · 2.1'],
  ['pay', 'Sertifikasyon paydaşları', '2.2'],
  ['ekip', 'Proje ekibi', '2.3'],
  ['deger', 'Değerlendirme notları', '5.4'],
  ['takip', 'Başvuru takip çizelgesi', '6.3'],
  ['eylem', 'Eylem planı', '9.2'],
  ['onay', 'Onay', '9.3']
];

// Grup doluluk özeti (r: rapor bilgisi; varsayılan form taslağı)
function groupCount(g, r = RF) {
  const n = arr => arr.filter(has).length;
  switch (g) {
    case 'kunye': return `${n(KUNYE_ALANLAR.map(a => r.kunye[a[0]]))}/${KUNYE_ALANLAR.length}`;
    case 'pay': {
      const vals = PAY_ROLLER.flatMap(([k, , fromInfo]) => (fromInfo ? [] : [r.pay[k].kisi]).concat([r.pay[k].no, r.pay[k].iletisim]));
      return `${n(vals)}/${vals.length}`;
    }
    case 'ekip': return `${r.ekip.filter(x => has(x.ad)).length} kişi`;
    case 'deger': return `${r.guclu.split('\n').filter(has).length} güçlü · ${r.gelisim.split('\n').filter(has).length} gelişim`;
    case 'takip': return `${n(r.takip.flatMap(t => [t.plan, t.gercek]))}/${r.takip.length * 2} tarih`;
    case 'eylem': return `${r.eylem.filter(x => has(x.eylem)).length} eylem`;
    case 'onay': return `${n(ONAY_ROLLER.flatMap(([k]) => [r.onay[k], r.onay[k + 'T']]))}/${ONAY_ROLLER.length * 2}`;
  }
}

// Sağ paneldeki "Rapor Bilgileri" kartı: genel doluluk + grup listesi
function drawRepCard() {
  const r = repOf(S), [f, t] = repFill(S);
  $('#repSum').textContent = `${f}/${t} alan dolu`;
  $('#repList').innerHTML = REP_GROUPS.map(([g, title, sub]) =>
    `<a href="#rapor" class="rl" data-og="${g}"><span>${title} <small>${sub}</small></span><span>${groupCount(g, r)}</span></a>`).join('');
}
// Karttan bir gruba tıklanınca düzenleme sayfasında o grup açık gelir
let PENDING_GROUP = null;
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('[data-og]'); if (a) PENDING_GROUP = a.dataset.og; });
function drawCounts() { document.querySelectorAll('[data-gc]').forEach(el => el.textContent = groupCount(el.dataset.gc)); }

function renderRepForm(edit) {
  const openNow = {};
  document.querySelectorAll('#repf details.fg').forEach(d => openNow[d.dataset.g] = d.open);
  const grp = (g, title, sub, body) => `<details class="fg" data-g="${g}" ${openNow[g] ? 'open' : ''}>
    <summary><span class="fgt">${title}<small>${sub}</small></span><span class="fgc" data-gc="${g}"></span></summary><div class="fgb">${body}</div></details>`;

  const kunye = `<div class="grid">${KUNYE_ALANLAR.map(([k, l, ph]) => rField(l, 'kunye.' + k, ph)).join('')}</div>`;

  const pay = PAY_ROLLER.map(([k, l, fromInfo]) => `<div class="pr"><b>${l}</b><div class="grid g3">
      ${fromInfo ? `<div><label class="f">Kişi / kurum</label><input disabled placeholder="${fromInfo}"></div>` : rField('Kişi / kurum', `pay.${k}.kisi`, '')}
      ${rField('Belge / yetki no', `pay.${k}.no`, '')}${rField('İletişim', `pay.${k}.iletisim`, 'telefon / e-posta')}</div></div>`).join('')
    + '<div class="note">Değerlendirme Kuruluşu (Türkiye Çevre Ajansı) rapora otomatik yazılır.</div>';

  const ekip = RF.ekip.map((r, i) => `<div class="lr g4">${rIn(`ekip.${i}.ad`, 'Ad soyad')}${rIn(`ekip.${i}.disiplin`, 'Disiplin / unvan')}${rIn(`ekip.${i}.gorev`, 'Görev ve sorumluluk')}${rIn(`ekip.${i}.sicil`, 'Oda sicil no')}<button type="button" class="lx" data-del="ekip.${i}" title="Satırı sil">✕</button></div>`).join('')
    + `<button type="button" class="ladd" data-add="ekip">+ Kişi ekle</button>`;

  const ta = (path, ph) => `<textarea data-r="${path}" rows="4" placeholder="${esc(ph)}">${esc(getPath(RF, path) || '')}</textarea>`;
  const deger = `<div class="grid"><div><label class="f">Güçlü yönler (her satır bir madde)</label>${ta('guclu', 'ör. Yenilenebilir enerji çalışması tamamlandı')}</div>
    <div><label class="f">Geliştirme alanları (her satır bir madde)</label>${ta('gelisim', 'ör. Akustik raporu henüz hazırlanmadı')}</div></div>`;

  const takip = `<div class="lr g4 lh"><span>Adım</span><span>Planlanan</span><span>Gerçekleşen</span><span>Not</span></div>`
    + TAKIP_ADIMLAR.map((a, i) => `<div class="lr g4"><span class="ls">${a}</span>${rIn(`takip.${i}.plan`, '', 'date')}${rIn(`takip.${i}.gercek`, '', 'date')}${rIn(`takip.${i}.not`, '')}</div>`).join('');

  const eylem = RF.eylem.map((r, i) => `<div class="lr g4e">${rIn(`eylem.${i}.eylem`, 'Eylem')}${rIn(`eylem.${i}.sorumlu`, 'Sorumlu')}${rIn(`eylem.${i}.termin`, '', 'date')}${rIn(`eylem.${i}.kriter`, 'Kriter (ör. BBT 01 K2)')}<button type="button" class="lx" data-del="eylem.${i}" title="Satırı sil">✕</button></div>`).join('')
    + `<div class="ctl"><button type="button" class="ladd" data-add="eylem">+ Eylem ekle</button>${edit ? '<button type="button" class="ladd" data-sug="1">Önerilerden doldur</button>' : ''}</div>`
    + `<div class="note">Boş bırakılırsa rapordaki eylem planı sitenin hedefe ulaşma önerilerinden oluşturulur.</div>`;

  const onay = `<div class="grid">${ONAY_ROLLER.map(([k, l]) => rField(l + ' · ad soyad', 'onay.' + k, '') + rField('Tarih', 'onay.' + k + 'T', '', 'date')).join('')}</div>`;

  const bodies = { kunye, pay, ekip, deger, takip, eylem, onay };
  $('#repf').innerHTML = `<h3 class="rfh">Rapor Bilgileri <small>isteğe bağlı · boş alanlar raporda [Doldurunuz] olarak kalır</small></h3>`
    + REP_GROUPS.map(([g, title, sub]) => grp(g, title, sub, bodies[g])).join('');
  drawCounts();
}

// Form olayları
document.addEventListener('input', e => {
  const p = e.target.dataset && e.target.dataset.r;
  if (!p || !e.target.closest('#repf')) return;
  setPath(RF, p, e.target.value);
  drawCounts();
});
document.addEventListener('click', e => {
  const t = e.target;
  if (!t.closest || !t.closest('#repf')) return;
  if (t.dataset.add) { RF[t.dataset.add].push({}); openGroup(t.dataset.add); }
  else if (t.dataset.del) { const [k, i] = t.dataset.del.split('.'); RF[k].splice(+i, 1); }
  else if (t.dataset.sug) {
    // Değerlendirme önerilerinden (zorunlu eksikler dahil) en fazla 8 eylem ekle
    const R = calc(S), have = new Set(RF.eylem.map(r => r.kriter));
    suggest(S, R, S.hedef).items.filter(s => !have.has(s.c.c)).slice(0, Math.max(0, 8 - RF.eylem.length))
      .forEach(s => RF.eylem.push({ eylem: `${s.c.n.slice(0, 80)} (${s.why}${s.gain ? `, +${f2(s.gain)} kredi` : ''})`, kriter: s.c.c }));
  } else return;
  renderRepForm(!!t.closest('#sf.edit'));
});
function openGroup(g) { const d = document.querySelector(`#repf details[data-g="${g}"]`); if (d) d.open = true; }

// Taslaktan boş satırları atarak kaydedilecek rapor bilgisini üretir
function repFromForm() {
  const r = JSON.parse(JSON.stringify(RF));
  r.ekip = r.ekip.filter(x => Object.values(x).some(has));
  r.eylem = r.eylem.filter(x => Object.values(x).some(has));
  return r;
}

// Rapor bilgilerinin genel doluluğu (sağ paneldeki not için)
function repFill(p) {
  const r = repOf(p), vals = [
    ...KUNYE_ALANLAR.map(a => r.kunye[a[0]]),
    ...PAY_ROLLER.flatMap(([k, , fi]) => (fi ? [] : [r.pay[k].kisi]).concat([r.pay[k].no, r.pay[k].iletisim])),
    r.ekip.length ? 'x' : '', r.guclu, r.gelisim,
    ...r.takip.map(t => t.plan),
    r.eylem.length ? 'x' : '',
    ...ONAY_ROLLER.flatMap(([k]) => [r.onay[k], r.onay[k + 'T']])
  ];
  return [vals.filter(has).length, vals.length];
}
