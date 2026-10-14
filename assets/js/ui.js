// Arayüz: proje seçimi, kriter listesi, kanıt dosyaları, özet paneli, olaylar.

const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const f2 = x => x.toFixed(2).replace('.', ',');
const num = x => String(Math.round(x * 100) / 100).replace('.', ',');
const fmtSize = b => b < 1024 * 1024 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB';
const fileExt = name => (name.match(/\.([^.]+)$/) || [, 'DOSYA'])[1].toUpperCase().slice(0, 4);

let ACTIVE = 0;           // seçili modül kutusu
const THOPEN = {};        // açık tema başlıkları
let sugOpen = false;      // öneri listesi açık mı
document.addEventListener('toggle', e => { if (e.target.id === 'sg') sugOpen = e.target.open; }, true);

// Buton yazıları: her kelimenin baş harfi büyük; bağlaçlar küçük (ilk kelime hariç).
// Tire ve eğik çizgiyle bağlı parçalar da ayrı kelime sayılır; tamamı büyük harfli kısaltmalar (İSG) korunur.
const BAGLAC = new Set(['ve', 'ile', 'veya', 'ya', 'da', 'de', 'ki', 'ama', 'fakat', 'hem', 'ne', 'yahut']);
const basHarf = s => s.split(/(\s+|-|\/)/).map((w, i) => {
  if (!/\p{L}/u.test(w) || (w === w.toLocaleUpperCase('tr-TR') && w.length > 1)) return w;
  const lw = w.toLocaleLowerCase('tr-TR');
  return i > 0 && BAGLAC.has(lw) ? lw : lw.charAt(0).toLocaleUpperCase('tr-TR') + lw.slice(1);
}).join('');

const ACCEPT ='.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.zip,.rar,.txt,.csv,image/*';

// ---- Kriter satırı
function row(c) {
  const id = c.id, z = isMandatory(c, S), m = maxCredit(c, S), e = earnableCredit(c, S), v = S.v[id] ?? '';
  const stage = c.s ? `<span class="st">${STAGES[c.s]}</span>` : '';
  const G = guideOf(c);
  const req = G ? guideBlock(c) : c.r ? `<details class="rq"><summary>Gereklilik</summary>${esc(c.r)}</details>` : '';
  const evid = ['Yok', 'Hazırlanıyor', 'Tamam'].map(x => `<option ${(S.e[id] || 'Yok') == x ? 'selected' : ''}>${x}</option>`).join('');
  const zLabel = c.zg ? `Zorunlu (${GRADES[c.zg]} ve üstü)` : 'Zorunlu';
  const mxText = !m ? '' : e ? 'maks ' + num(m) : `azami ${num(m)} · kredi kazanılamaz`;
  const ncNote = m && !e ? `<div class="note" style="margin:-2px 0 6px">Yalnızca Evet/Hayır olarak değerlendirilir; ${num(m)} kredi modülün azami kredisine dahildir ancak kazanılamaz (YeS-TR Puan Hesaplama v1.3).</div>` : '';
  // Kılavuza göre bu projede uygulanmayan kriter: yalnızca başlık, bilgi ve kılavuz (giriş alanları yok)
  if (G && !guideReqs(c, S).length) return `<div class="r na" data-id="${id}">
  <div class="h"><b>${c.c}</b>${stage}<span class="st">Uygulanmaz</span><span class="mxv"></span></div>
  <div class="t">${esc(c.n)}</div>${req}
</div>`;
  return `<div class="r" data-id="${id}">
  <div class="h"><b>${c.c}</b>${stage}${z ? `<span class="z">${zLabel}</span>` : ''}<span class="st" data-c="${id}" hidden></span><span class="mxv">${mxText}</span></div>
  <div class="t">${esc(c.n)}</div>${ncNote}${req}
  <div class="ctl">
    ${z && !G ? `<label class="chk"><input type="checkbox" data-a="z" ${S.z[id] ? 'checked' : ''}> Şart sağlandı</label>` : ''}
    ${G ? `<span class="gcr ${guideOk(c) ? 'ok' : ''}" data-gc="${id}">${guideCreditText(c)}</span>`
      : e ? `<input type="number" inputmode="decimal" min="0" max="${e}" step="any" data-a="v" value="${v}" placeholder="0"><button data-a="f">Tam</button>` : ''}
    <select data-a="e" title="Kanıt durumu">${evid}</select>
    <input type="text" data-a="n" placeholder="Proje çözümü / not" value="${esc(S.n[id] || '')}">
  </div>
  ${tableOn(id, S) ? `<div class="ctab" data-ct="${id}">${critTable(id)}</div>` : ''}
  ${hasOrg(id, S) ? `<div class="ctab orgc" data-orgc="${id}">${orgEditor(id)}</div>` : ''}
  <div class="ev">
    <label class="up" title="PDF, Word, Excel, görsel, DWG vb. Dosyaları bu satırın üzerine sürükleyip de bırakabilirsiniz.">📎 ${esc(basHarf((G && G.kanit) || 'Kanıt dosyası ekle'))}<input type="file" multiple accept="${ACCEPT}" data-a="up" hidden></label>
    <span class="note">veya dosyayı buraya sürükleyin</span>
  </div>
  <div class="fls" data-t="${id}"></div>
</div>`;
}

// ---- Kılavuzu tanımlı kriterler (guide.js): gereklilik listesi + otomatik kredi
// Durum kutusu: uygulanmaz / zorunlu şart / kredi
// Yalnızca zorunlu (kredisi yok): kural 'mandatory' ya da zorunlu olup bu projede kazanılabilir kredisi olmayan kriter (ör. KET 05 K2 yeni)
const zOnly = c => guideOf(c).kural === 'mandatory' || (isMandatory(c, S) && !earnableCredit(c, S));
const guideOk = c => guideReqs(c, S).length && (zOnly(c) ? guideZMet(c, S) : givenCredit(c, S) > 0 && (!isMandatory(c, S) || guideZMet(c, S)));
function guideCreditText(c) {
  if (!guideReqs(c, S).length) return `Uygulanmaz <small>(${DURUM_AD[S.durum]} ${birimAd(1)} için)</small>`;
  if (zOnly(c)) return guideZMet(c, S) ? '✓ Zorunlu şart sağlandı' : 'Zorunlu şart sağlanmadı <small>(gerekliliği işaretleyin)</small>';
  const m = earnableCredit(c, S), got = givenCredit(c, S);
  // Kredisi de olan zorunlu kriter (ör. İOK 03 K1 eğitim / sağlık, İOK 04 K1 konut dışı)
  const zs = isMandatory(c, S) ? (guideZMet(c, S) ? ' · zorunlu şart ✓' : ' · zorunlu şart sağlanmadı') : '';
  return `${got ? '✓ ' : ''}Kredi: ${num(got)} / ${num(m)}${zs} <small>(gerekliliklere göre otomatik)</small>`;
}
function guideBlock(c) {
  const G = guideOf(c), dn = DURUM_AD[S.durum];
  // Zorunlu kılavuz kriteri: önceki sürümde "Şart sağlandı" işaretlenmişse gereklilikler işaretli başlasın
  if (G.kural === 'mandatory' && S.z[c.id] && !(S.g && S.g[c.id])) {
    S.g = S.g || {}; S.g[c.id] = {}; guideReqs(c, S).forEach(g => S.g[c.id][g.no] = true);
  }
  if (!guideReqs(c, S).length) {
    return `<div class="gl na"><div class="glt">Gereklilikler · ${dn} ${birimAd()}</div><div class="gq">Bu kriter ${dn} ${birimAd(1)} için uygulanmaz.</div></div>`;
  }
  const items = G.gerek.filter(g => gTip(g, S)).map(g => { // başka bina tiplerine ait gereklilikler gösterilmez
    const on = g.durum.includes(S.durum);
    const forWhom = g.durum.length === 1 ? ` <small>· ${DURUM_AD[g.durum[0]]} ${birimAd(1)} için</small>` : '';
    if (g.head) return `<div class="gq gh ${on ? '' : 'na'}"><span><b>(${g.no})</b> ${esc(g.text)}${forWhom}</span></div>`; // işaretlenmeyen başlık
    const sub = g.sub ? ' sub' : '';
    return on
      ? `<label class="chk gq${sub}"><input type="checkbox" data-gq="${g.no}" ${guideChecked(c, S, g.no) ? 'checked' : ''}> <span><b>(${g.no})</b> ${esc(g.text)}${forWhom}</span></label>`
      : `<div class="gq na${sub}"><span><b>(${g.no})</b> ${esc(g.text)}${forWhom}</span></div>`;
  }).join('');
  return `<div class="gl"><div class="glt">Gereklilikler · ${dn} ${birimAd()}</div>${G.not ? `<div class="note gn">${esc(G.not)}</div>` : ''}${items}
      ${G.kural === 'hesap' ? guideInputsHtml(c) : ''}
      <div class="note">${esc(G.kuralText)}</div></div>`;
}
// 'hesap' kuralı: değer giriş alanları + hesap sonucu
function guideInputsHtml(c) {
  const v = gvOf(c, S);
  const field = f => {
    if (f.t === 'f246') return f246Html(v, f.l);
    if (f.t === 'grid') { // satır × sütun tablo: anahtar = k_satır_sütun
      const cell = (r, cc) => { const key = `${f.k}_${r}_${cc}`; return `<td><input type="text" inputmode="decimal" data-gv="${key}" value="${esc(v[key] ?? '')}"></td>`; };
      return `<div class="gin grid"><span>${esc(f.l)}${f.ipucu ? ` <small>(${esc(f.ipucu)})</small>` : ''}</span><div class="ggrid"><table>
        <tr><th></th>${f.cols.map(([, l]) => `<th>${esc(l)}</th>`).join('')}</tr>
        ${f.rows.map(([r, l]) => `<tr><th>${esc(l)}</th>${f.cols.map(([cc]) => cell(r, cc)).join('')}</tr>`).join('')}</table></div></div>`;
    }
    const val = v[f.k] ?? '', unit = f.birim ? `<small>${esc(f.birim)}</small>` : '';
    const ctl = f.t === 'sel'
      ? `<select data-gv="${f.k}">${f.opts.map(([o, l]) => `<option value="${esc(o)}" ${val === o ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`
      : `<input type="text" inputmode="decimal" data-gv="${f.k}" value="${esc(val)}" placeholder="0">`;
    return `<label class="gin"><span>${esc(f.l)}${f.ipucu ? ` <small>(${esc(f.ipucu)})</small>` : ''}</span><span class="giv">${ctl}${unit}</span></label>`;
  };
  return `<div class="gins">${guideInputs(c, S).map(field).join('')}</div>
      <div class="ghr" data-gh="${c.id}">${esc(guideCalc(c, S).text)}</div>`;
}
// Tablo 2.4.6 Bina Enerji Tüketimi Değerlendirme Raporu (EKV 01 K2, mevcut binalar)
function f246Html(v, title) {
  const inp = key => `<input type="text" inputmode="decimal" data-gv="${key}" value="${esc(v[key] ?? '')}">`;
  const sel = key => `<select data-gv="${key}">${EKB_SINIF.map(([o, l]) => `<option value="${o}" ${(v[key] || '') === o ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const body = F246_ROWS.map(([r, l]) => {
    const strong = r === 'ara' || r === 'net';
    const en = F246_EN.map(([c]) => r === 'ara' ? `<td class="fc" data-f246c="ara_${c}">${f246Cell(v, `ara_${c}`)}</td>` : `<td>${inp(`f246_${r}_${c}`)}</td>`).join('');
    const sg = r === 'net' ? F246_SG.map(([c]) => `<td>${inp(`f246_net_${c}`)}</td>`).join('') : '<td class="fx"></td><td class="fx"></td>';
    return `<tr${strong ? ' class="fs"' : ''}><th>${l}</th>${en}${sg}</tr>`;
  }).join('');
  return `<div class="gin grid f246"><span>${esc(title)} <small>(enerji kWh/m².yıl · sera gazı kg eşd./m².yıl)</small></span><div class="ggrid"><table>
    <tr><th rowspan="2"></th><th colspan="4" class="fh2">ENERJİ</th><th colspan="2" class="fh2">CO₂ SALINIMI</th></tr>
    <tr>${F246_EN.map(([, b, k]) => `<th>${b}<br><small>${k}</small></th>`).join('')}${F246_SG.map(([, b]) => `<th>${b}<br><small>Sera gazı emisyonu</small></th>`).join('')}</tr>
    ${body}
    <tr class="fs"><th>ENERJİ KİMLİK BELGESİ SINIFI</th><td colspan="2">${sel('f246_sinif_ab')}</td><td colspan="2">${sel('f246_sinif_kb')}</td><td colspan="2" class="fx"></td></tr>
    <tr class="fs"><th>İYİLEŞTİRME ORANI (%)</th><td colspan="4" class="fc" data-f246c="iyi_e">${f246Cell(v, 'iyi_e')}</td><td colspan="2" class="fc" data-f246c="iyi_s">${f246Cell(v, 'iyi_s')}</td></tr>
  </table></div><div class="note">Kıyaslanan bina: mevcut binanın iyileştirme yapılmadan önceki hali. ARA TOPLAM ve İYİLEŞTİRME ORANI kendiliğinden hesaplanır; ekine kıyaslanan bina için oluşturulan Enerji Kimlik Belgesi eklenir.</div></div>`;
}
// Hesaplanan hücre metni (ARA TOPLAM sütunu ya da iyileştirme oranı)
function f246Cell(v, k) {
  if (k.startsWith('ara_')) { const x = f246Ara(v, k.slice(4)); return isNaN(x) ? '' : fmtN(x); }
  const f = f246Vals(v);
  return f.ok ? (k === 'iyi_e' ? 'Enerji: ' + pct(f.E) : 'Sera gazı: ' + pct(f.S)) : '';
}
// Yazarken hesaplanan hücreleri günceller
function f246Refresh(root, v) {
  if (root) root.querySelectorAll('[data-f246c]').forEach(td => { td.textContent = f246Cell(v, td.dataset.f246c); });
}
document.addEventListener('input', e => {
  const t = e.target;
  if (!t.dataset || t.dataset.gv === undefined) return;
  const id = t.closest('.r').dataset.id, c = D.crit.find(x => x.id === id);
  S.gv = S.gv || {};
  (S.gv[id] = S.gv[id] || {})[t.dataset.gv] = t.value;
  f246Refresh(t.closest('.f246'), S.gv[id]);
  const h = document.querySelector(`[data-gh="${id}"]`);
  if (h) h.textContent = guideCalc(c, S).text;
  if (isMandatory(c, S)) S.z[id] = guideZMet(c, S);
  const pill = document.querySelector(`[data-gc="${id}"]`);
  if (pill) { pill.innerHTML = guideCreditText(c); pill.classList.toggle('ok', !!guideOk(c)); }
  update();
});
// Not: amaç, yöntem, teslim edilecek belgeler ve tanımlar sitede gösterilmez; yalnızca raporda yer alır.
document.addEventListener('change', e => {
  const t = e.target;
  if (!t.dataset || t.dataset.gq === undefined) return;
  const id = t.closest('.r').dataset.id, c = D.crit.find(x => x.id === id);
  S.g = S.g || {};
  (S.g[id] = S.g[id] || {})[t.dataset.gq] = t.checked;
  // 'tiers': üst kademe alt kademeleri kapsar (ör. PPD < %10 ise PPD < %15 de sağlanır)
  // (ayri: true olan kademe, ör. alternatif yöntem, zincire dahil değildir)
  const G = guideOf(c), chain = G.kural === 'tiers' ? G.tiers.filter(x => !x.ayri) : [];
  const ti = chain.findIndex(x => String(x.no) === t.dataset.gq);
  if (ti >= 0) {
    chain.forEach((x, i) => { if (t.checked ? i < ti : i > ti) S.g[id][x.no] = t.checked; });
    t.closest('.gl').querySelectorAll('[data-gq]').forEach(b => { b.checked = !!S.g[id][b.dataset.gq]; });
  }
  if (G.kural === 'mandatory' || isMandatory(c, S)) S.z[id] = guideZMet(c, S); // zorunlu şart işaretlerden
  const pill = document.querySelector(`[data-gc="${id}"]`);
  if (pill) { pill.innerHTML = guideCreditText(c); pill.classList.toggle('ok', !!guideOk(c)); }
  update();
});

// ---- Kritere özel tablolar (CRIT_TABLES): ör. BBT 01 K1 görev / sorumluluk çizelgesi
// Kayıt yoksa tanımdaki kadar boş satır gösterilir; ilk girişte satırlar projeye yazılır.
const tableRows = id => S.t && S.t[id] ? S.t[id] : Array.from({ length: CRIT_TABLES[id].rows }, () => ({}));
function critTable(id) {
  const T = CRIT_TABLES[id], rows = tableRows(id);
  const head = T.cols.map(([, l, type]) => `<span>${l}${type === 'list' ? ' <small>(her satır bir madde)</small>' : ''}</span>`).join('');
  const cell = (r, i, [k, l, type]) => {
    if (type === 'list') return `<textarea rows="2" data-tb="${id}" data-ti="${i}" data-tk="${k}" placeholder="${l}">${esc(r[k] || '')}</textarea>`;
    if (type === 'file') return `<div class="ctf">
        ${(r[k] || []).map(f => `<span class="ctfi"><a href="#" data-tfo="${f.key}" title="Aç">${esc(f.name)}</a><b data-tfx="${f.key}" data-ti="${i}" data-tk="${k}" title="Kaldır">✕</b></span>`).join('')}
        <label class="up sm">📎 ${(r[k] || []).length ? 'Ekle' : l}<input type="file" multiple accept="${ACCEPT}" data-tfu="${i}" data-tk="${k}" hidden></label></div>`;
    if (type === 'yn') return `<select data-tb="${id}" data-ti="${i}" data-tk="${k}" title="${l}">${['', 'E', 'H'].map(x => `<option value="${x}" ${(r[k] || '') === x ? 'selected' : ''}>${x || '–'}</option>`).join('')}</select>`;
    const it = type === 'date' || type === 'time' ? type : type === 'num' ? 'number' : 'text';
    return `<input type="${it}" ${type === 'num' ? 'step="any" min="0" inputmode="decimal"' : ''} data-tb="${id}" data-ti="${i}" data-tk="${k}" placeholder="${l}" value="${esc(r[k] || '')}" title="${l}">`;
  };
  return `<div class="ctt">${T.title}</div>
    <div class="ctr cth c${T.cols.length}">${head}<span></span></div>
    ${rows.map((r, i) => `<div class="ctr c${T.cols.length}">${T.cols.map(col => cell(r, i, col)).join('')}
      <button type="button" class="lx" data-tdel="${i}" title="Satırı sil">✕</button></div>`).join('')}
    ${T.totals ? `<div class="ctot">${tableTotalsHtml(T, rows)}</div>` : ''}
    ${T.note ? `<div class="note">${esc(T.note)}</div>` : ''}
    <button type="button" class="ladd" data-tadd="1">+ Satır ekle</button>`;
}
// Otomatik toplam satırları (ilk iki sütun etiket, sonra sayı sütunlarının toplamları)
const tableTotalsHtml = (T, rows) => tableTotals(T, rows).map(([label, sums]) =>
  `<div class="ctr c${T.cols.length} tot"><span class="tl">${label}</span>${sums.map(s => `<span>${num(s)}</span>`).join('')}<span></span></div>`).join('');
const ensureTable = id => { S.t = S.t || {}; if (!S.t[id]) S.t[id] = tableRows(id); return S.t[id]; };
const fileColsOf = id => CRIT_TABLES[id].cols.filter(c => c[2] === 'file').map(c => c[0]);
const dropKeys = keys => keys.forEach(k => tx('readwrite', s => s.delete(k)).catch(() => {}));

// Tablo dosya sütunu: yükle / aç / kaldır
document.addEventListener('change', async e => {
  const t = e.target, box = t.closest && t.closest('[data-ct]');
  if (!box || t.dataset.tfu === undefined) return;
  const id = box.dataset.ct, files = [...t.files], errs = [];
  t.value = '';
  const rows = ensureTable(id), r = rows[+t.dataset.tfu];
  for (const f of files) {
    try { const s = await storeFile(id + '|belge', f); (r[t.dataset.tk] = r[t.dataset.tk] || []).push(s); } catch (x) { errs.push(x.message || f.name); }
  }
  save();
  box.innerHTML = critTable(id);
  if (errs.length) box.insertAdjacentHTML('beforeend', `<div class="note err">Eklenemedi: ${esc(errs.join(', '))}</div>`);
  update();
});
document.addEventListener('click', async e => {
  const t = e.target;
  if (t.dataset && t.dataset.tfo) {
    e.preventDefault();
    const r = await getFile(t.dataset.tfo).catch(() => null);
    if (r) window.open(URL.createObjectURL(r.blob), '_blank');
    return;
  }
  if (!(t.dataset && t.dataset.tfx)) return;
  const box = t.closest('[data-ct]'), id = box.dataset.ct, r = ensureTable(id)[+t.dataset.ti];
  r[t.dataset.tk] = (r[t.dataset.tk] || []).filter(f => f.key !== t.dataset.tfx);
  dropKeys([t.dataset.tfx]);
  save();
  box.innerHTML = critTable(id);
});
document.addEventListener('input', e => {
  const t = e.target, id = t.dataset && t.dataset.tb;
  if (!id) return;
  const rows = ensureTable(id);
  rows[+t.dataset.ti][t.dataset.tk] = t.value;
  save();
  const tot = t.closest('[data-ct]').querySelector('.ctot'); // toplamlar anında güncellensin
  if (tot) tot.innerHTML = tableTotalsHtml(CRIT_TABLES[id], rows);
  // Şema henüz boşsa "Görev listesinden oluştur" butonu güncellensin
  const ob = document.querySelector(`[data-orgc="${id}"]`);
  if (ob && !orgNodes(S, id).length) ob.innerHTML = orgEditor(id);
});
document.addEventListener('click', e => {
  const t = e.target, box = t.closest && t.closest('[data-ct]');
  if (!box || !(t.dataset.tadd || t.dataset.tdel)) return;
  const id = box.dataset.ct, rows = ensureTable(id);
  if (t.dataset.tadd) rows.push({});
  else {
    const gone = rows.splice(+t.dataset.tdel, 1)[0] || {};
    dropKeys(fileColsOf(id).flatMap(k => (gone[k] || []).map(f => f.key))); // satırın belgeleri de silinir
  }
  save();
  box.innerHTML = critTable(id);
});

// Modül kutusundaki şart rozeti ikonları (sağlandı / sağlanmadı); hangisinin görüneceğini CSS seçer.
const svgIcon = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON_OK = svgIcon('<path class="i-ok" d="M5 12.5l4.5 4.5L19 7.5"/>');
const ICON_NO = svgIcon('<path class="i-no" d="M12 6.5v7M12 18h.01"/>');

// ---- Kılavuz PDF açılır penceresi: projenin ölçeğine göre bina ya da yerleşme kılavuzu (buton yazısı update() içinde)
const KILAVUZ = {
  B: { ad: 'YeS TR Bina Değerlendirme Kılavuzu', pdf: 'assets/docs/yestr-bina-kilavuz.pdf' },
  Y: { ad: 'YeS TR Yerleşme Değerlendirme Kılavuzu', pdf: 'assets/docs/yestr-yerlesme-kilavuz.pdf' }
};
const kilavuz = () => KILAVUZ[D.scale] || KILAVUZ.B;
function pdfOpen() {
  const f = $('#pdff'), k = kilavuz();
  $('#pdft').textContent = k.ad; $('#pdfo').href = k.pdf;
  if (f.getAttribute('src') !== k.pdf) f.src = k.pdf; // ilk açılışta ya da ölçek değişince yüklenir
  $('#pdfm').hidden = false; document.body.classList.add('pdfopen');
  $('#pdfx').focus();
}
function pdfClose() { $('#pdfm').hidden = true; document.body.classList.remove('pdfopen'); }
$('#kilb').onclick = pdfOpen;
$('#pdfx').onclick = pdfClose;
$('#pdfm').addEventListener('click', e => { if (e.target.id === 'pdfm') pdfClose(); }); // pencere dışına tıklayınca kapanır
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#pdfm').hidden) pdfClose(); });

// Seçim kutusu açıklamaları (kılavuz 1.2 Kapsam ve 1.3 Tanımlar)
const TIP_HELP = [
  'Müstakil konut, apartman, yüksek nitelikli konut (rezidans).',
  'Büro, kamu hizmet binaları, iş merkezleri, ar-ge binaları.',
  'Okul öncesi, ilk ve orta öğretim ile yüksek öğretime hizmet veren eğitim kampüsü; genel, mesleki ve teknik eğitim amaçlı okul, kurs vb. binalar.',
  'Otel, motel, tatil köyü, pansiyon, apart otel veya hostel gibi turizm amaçlı konaklama binaları.',
  'Hastane, sağlık ocağı, aile sağlık merkezi, doğumevi, dispanser ve poliklinik, ağız ve diş sağlığı merkezi, fizik tedavi ve rehabilitasyon merkezi, entegre sağlık kampüsü.',
  'Çarşı, mağaza, lokanta, restoran, katlı otopark, alışveriş merkezi, banka, finans kurumları gibi ticaret ve hizmet binaları.',
  'Sanayi alanlarında üretim yapılan binalar; sinema, tiyatro, müze, kütüphane, sergi salonu, kongre merkezi, spor salonu; gazino, düğün salonu; yurt, yemekhane, bakımevleri, rehabilitasyon merkezi, sığınma evleri; altyapı ve ulaşım tesisleri, veri merkezleri vb. Sanayi binalarında İOK (görsel ve ısıl konfor) ile EKV için yalnızca idari bölümler değerlendirilir.'
];
const OLS_HELP = { B: 'Yeni veya mevcut tek bina.', Y: 'İçerisinde birden fazla bina bulunan imar parseli ve daha büyük ölçekteki alanlar.' };
const DUR_HELP = {
  B: { Y: 'Yapı kullanma izin belgesi henüz bulunmayan bina.', M: 'Yapı kullanma izin belgesi bulunan bina.' },
  Y: { Y: 'Yapı kullanma izin belgesine sahip bina bulunmayan yerleşme.', M: 'İçerisinde yapı kullanma izin belgesine sahip en az bir bina bulunan yerleşme.' }
};
// Her açıklama kutusu, aynı alandaki seçim kutusunun değerine ve ölçeğe göre güncellenir
function updHelp() {
  document.querySelectorAll('[data-help]').forEach(el => {
    const sel = el.parentElement.querySelector('select');
    const olsSel = el.closest('#sf') ? $('#s_ols') : $('#ols'), sc = olsSel ? olsSel.value : (S.olcek || 'B');
    const k = el.dataset.help, v = sel ? sel.value : '';
    el.textContent = k === 'tip' ? (TIP_HELP[+v] || '') : k === 'ols' ? OLS_HELP[v] || '' : (DUR_HELP[sc] || DUR_HELP.B)[v] || '';
  });
}
document.addEventListener('change', e => { if (e.target.matches && e.target.matches('#s_ols, #s_tip, #s_dur, #ols, #tip, #dur')) updHelp(); });

// Modül paneli: başvuru dosyasını hazırlayan / değerlendiren meslek grupları (kılavuz Bölüm 3)
const expertsHtml = m => modExperts(m) ? `<details class="mex"><summary>Modülü Değerlendirebilen Uzmanlar</summary>
  <div>${esc(modExperts(m))}.</div></details>` : '';

// Modüller 6 kutu olarak gösterilir; seçili modülün kriterleri altta listelenir.
function renderMods() {
  if (ACTIVE >= D.mods.length) ACTIVE = 0;
  setTimeout(() => Object.keys(S.f || {}).forEach(drawFiles));
  $('#tiles').innerHTML = D.mods.map((m, i) => `<button class="tile${modClass(m)} ${i === ACTIVE ? 'on' : ''}" data-mi="${i}"${modStyle(m)}>
    <span class="tc">${m}</span>${i < 5 ? `<span class="dot" id="md${i}">${ICON_OK}${ICON_NO}</span>` : ''}
    <span class="tn">${esc(moduleName(i))}</span>
    <span class="ts" id="mh${i}"></span>
    <span class="pb"><i id="mb${i}"></i></span>
  </button>`).join('');
  const list = D.crit.filter(c => c.m === ACTIVE && (!S.a || c.s === S.a));
  const themes = [...new Set(list.map(c => c.t))];
  // Her tema açılır-kapanır başlık olarak gösterilir
  let h = themes.map(t => {
    const rows = list.filter(c => c.t === t).map(row).join('');
    return `<details class="tg" data-th="${esc(t)}" ${THOPEN[t] ? 'open' : ''}><summary><span class="tgn">${esc(t)}</span><span class="tgs" data-ts="${esc(t)}"></span></summary>${rows}</details>`;
  }).join('');
  if (!h) h = '<div class="note" style="padding:12px">Seçili aşamada bu modüle ait kriter yok.</div>';
  const tools = themes.length ? '<span class="tga"><button data-fold="1">Tümünü aç</button><button data-fold="0">Tümünü kapat</button></span>' : '';
  $('#mods').innerHTML = `<div class="mp${modClass(D.mods[ACTIVE])}"${modStyle(D.mods[ACTIVE])}><div class="mph"><b>${D.mods[ACTIVE]} · ${esc(moduleName(ACTIVE))}</b><span id="mph"></span>${tools}</div>${expertsHtml(D.mods[ACTIVE])}${h}</div>`;
}

// Tema başlıklarının özetleri: kriter sayısı, kazanılan/azami kredi, eksik zorunlu
function themeStats() {
  document.querySelectorAll('[data-ts]').forEach(el => {
    const cs = D.crit.filter(c => c.m === ACTIVE && c.t === el.dataset.ts);
    const got = cs.reduce((a, c) => a + givenCredit(c, S), 0);
    const opts = cs.filter(c => c.g).map(c => maxCredit(c, S)); // seçeneklerden yalnızca en yükseği sayılır
    const max = cs.filter(c => !c.g).reduce((a, c) => a + maxCredit(c, S), 0) + (opts.length ? Math.max(...opts) : 0);
    const miss = cs.filter(c => isMandatory(c, S) && !zMet(c, S)).length;
    // Tamamlandı: kazanılabilir kredilerin tamamı alınmış ve zorunlu eksik yok
    const earnOpts = cs.filter(c => c.g).map(c => earnableCredit(c, S));
    const earnMax = cs.filter(c => !c.g).reduce((a, c) => a + earnableCredit(c, S), 0) + (earnOpts.length ? Math.max(...earnOpts) : 0);
    const done = !miss && got + EPS >= earnMax;
    el.closest('details.tg').classList.toggle('done', done);
    el.innerHTML = `${done ? '<b class="tgd">✓ Tamamlandı</b> · ' : ''}${cs.length} kriter${max ? ` · ${num(got)}/${num(max)} kredi` : ''}${miss ? ` · <b class="tgz">${miss} zorunlu eksik</b>` : ''}`;
  });
}

document.addEventListener('click', e => {
  const t = e.target.closest && e.target.closest('.tile');
  if (!t) return;
  ACTIVE = +t.dataset.mi;
  renderMods(); update();
});
document.addEventListener('toggle', e => { if (e.target.matches && e.target.matches('details.tg')) THOPEN[e.target.dataset.th] = e.target.open; }, true);
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-fold]');
  if (!b) return;
  document.querySelectorAll('details.tg').forEach(d => { d.open = b.dataset.fold === '1'; THOPEN[d.dataset.th] = d.open; });
});

// ---- Kanıt dosyaları
const URLS = {}; // kriter başına açık nesne URL'leri (yeniden çizimde serbest bırakılır)

async function drawFiles(id) {
  const el = document.querySelector(`[data-t="${id}"]`);
  const badge = document.querySelector(`[data-c="${id}"]`);
  const keys = (S.f && S.f[id]) || [];
  if (badge) { badge.hidden = !keys.length; badge.textContent = `📎 ${keys.length}`; }
  if (!el) return;
  (URLS[id] || []).forEach(u => URL.revokeObjectURL(u));
  URLS[id] = [];
  const c = D.crit.find(x => x.id === id);
  let h = '';
  for (const [i, k] of keys.entries()) {
    let r = null;
    try { r = await getFile(k); } catch (e) {}
    if (!r) continue;
    const u = URL.createObjectURL(r.blob);
    URLS[id].push(u);
    const img = r.type.startsWith('image/'), view = img || r.type === 'application/pdf';
    h += `<div class="fi">
      ${img ? `<img src="${u}" alt="">` : `<span class="ic">${fileExt(r.name)}</span>`}
      <a href="${u}" ${view ? 'target="_blank" rel="noopener"' : `download="${esc(r.name)}"`} title="${esc(r.name)} · ${view ? 'Aç' : 'İndir'}"><small>${evidenceNo(c, i)}</small>${esc(r.name)}</a>
      <small class="sz">${fmtSize(r.size)}</small>
      <b data-x="${k}" title="Kaldır">✕</b>
    </div>`;
  }
  el.innerHTML = h;
}

async function addFiles(id, files) {
  const el = document.querySelector(`[data-t="${id}"]`), errs = [];
  if (el) el.insertAdjacentHTML('beforeend', '<div class="note" data-busy>Yükleniyor…</div>');
  for (const f of files) { try { await addFile(id, f); } catch (e) { errs.push(e.message || f.name); } }
  // Dosya eklenince kanıt durumu "Yok" ise "Hazırlanıyor"a çekilir
  if ((S.f[id] || []).length && (S.e[id] || 'Yok') === 'Yok') {
    S.e[id] = 'Hazırlanıyor';
    const sel = document.querySelector(`[data-id="${id}"] [data-a=e]`);
    if (sel) sel.value = 'Hazırlanıyor';
  }
  await drawFiles(id);
  if (errs.length && el) el.insertAdjacentHTML('beforeend', `<div class="note err">Eklenemedi: ${esc(errs.join(', '))}</div>`);
  update();
}

document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.a !== 'up') return;
  const files = [...t.files];
  t.value = '';
  addFiles(t.closest('.r').dataset.id, files);
});
document.addEventListener('click', async e => {
  const k = e.target.dataset.x;
  if (!k) return;
  const id = e.target.closest('.r').dataset.id;
  await removeFile(id, k);
  await drawFiles(id);
  update();
});

// Sürükle-bırak
document.addEventListener('dragover', e => {
  const r = e.target.closest && e.target.closest('.r');
  if (!r || !e.dataTransfer.types.includes('Files')) return;
  e.preventDefault();
  document.querySelectorAll('.r.drag').forEach(x => x !== r && x.classList.remove('drag'));
  r.classList.add('drag');
});
document.addEventListener('dragleave', e => {
  const r = e.target.closest && e.target.closest('.r');
  if (r && !r.contains(e.relatedTarget)) r.classList.remove('drag');
});
document.addEventListener('drop', e => {
  const r = e.target.closest && e.target.closest('.r');
  if (!r) { if (e.dataTransfer.types.includes('Files')) e.preventDefault(); return; }
  e.preventDefault();
  r.classList.remove('drag');
  if (e.dataTransfer.files.length) addFiles(r.dataset.id, [...e.dataTransfer.files]);
});
// Satır dışına bırakılan dosyanın tarayıcıda açılmasını engelle
window.addEventListener('dragover', e => e.preventDefault());

// ---- Özet paneli (sağda sabit)
function update() {
  const R = calc(S), g = S.hedef;
  $('#kilb').textContent = kilavuz().ad; // kılavuz PDF butonu: projenin ölçeğine göre
  R.mods.forEach((x, i) => {
    const e = $('#mh' + i), b = $('#mb' + i), d = $('#md' + i);
    if (e) e.textContent = `${num(x.raw)}/${num(x.max)} kredi · ${f2(x.wc)}`;
    if (b) b.style.width = (x.max ? x.raw / x.max * 100 : 0) + '%';
    if (d) { d.classList.toggle('ok', !!x.met[g]); d.title = x.met[g] ? `${GRADES[g]} için modül şartı sağlandı` : `${GRADES[g]} için modül şartı sağlanmadı`; }
  });
  const am = R.mods[ACTIVE], mph = $('#mph');
  themeStats();
  if (mph && am) mph.textContent = `Ağırlık %${num(am.w * 100)} · ${num(am.raw)}/${num(am.max)} kredi · ağırlıklı ${f2(am.wc)}${ACTIVE < 5 ? (am.min ? ` · ${GRADES[g]} şartı ≥ ${am.min[g]}` : ' · tema kapsam şartı') : ' · toplama bonus olarak eklenir'}`;

  const chip = (ok, t) => `<span class="chip ${ok ? 'ok' : 'no'}">${t}</span>`;
  const gradeTxt = R.grade < 0 ? 'Derece alınamadı' : GRADES[R.grade];
  let h = `<div class="big"><div class="score">${f2(R.total)}</div><span class="badge">${gradeTxt}</span></div>
  <div class="note sline"><span>Toplam ağırlıklı kredi (İNO bonusu dahil)</span><span>Hedef: <b>${GRADES[g]}</b> (≥ ${D.th[g]})</span></div><div class="chips">`;
  h += chip(R.total + EPS >= D.th[g], `Toplam ${f2(R.total)} / ${D.th[g]}`);
  R.mods.slice(0, 5).forEach(x => h += chip(x.met[g], x.min ? `${x.m} ${f2(x.wc)} / ${x.min[g]}` : `${x.m} kapsam şartı`));
  h += chip(!R.miss.length, R.miss.length ? `Eksik zorunlu: ${R.miss.length}` : 'Zorunlular tamam') + '</div>';
  if (R.miss.length) h += `<div class="note" style="margin-top:6px">${R.miss.join(', ')}</div>`;
  if (D.scale === 'Y' && !R.bolOk) h += `<div class="note" style="margin-top:6px">⚠ Başvuru belgesi için BOL modülünden ${num(R.bolNeed)} ağırlıklı kredi (BOL’un tamamı) gerekir; şu an ${f2(R.mods[0].wc)}.</div>`;

  const SG = suggest(S, R, g), list = SG.items.slice(0, 12);
  if (list.length) h += `<details id="sg" class="sg sec" ${sugOpen ? 'open' : ''}><summary>Hedefe ulaşmak için öneriler (${SG.items.length})</summary>${list.map(s =>
    `<div class="it"><b>${s.c.c}</b> ${esc(s.c.n.slice(0, 70))} · ${s.why}${s.gain ? ` · +${f2(s.gain)}` : ''}${s.c.s ? ' · ' + STAGES[s.c.s] : ''}</div>`).join('')}</details>`;

  const ino = R.mods[5];
  h += `<div class="note sec">İnovasyon bonusu: ${f2(ino.wc)} / ${f2(ino.max * ino.w)} (toplama eklendi)</div>`;

  let done = 0, total = 0;
  D.crit.forEach(c => {
    const id = c.id;
    if (+S.v[id] > 0 || (isMandatory(c, S) && zMet(c, S))) { total++; if (S.e[id] === 'Tamam') done++; }
  });
  const nFiles = D.crit.reduce((a, c) => a + ((S.f && S.f[c.id]) || []).length, 0);
  const nCrit = D.crit.filter(c => ((S.f && S.f[c.id]) || []).length).length;
  h += `<div class="note sec">Kanıt durumu: ${done}/${total} kriter tamamlandı<br>Kanıt dosyası: ${nFiles} dosya · ${nCrit} kriter</div>`;
  $('#sum').innerHTML = h;
  drawRepCard();
  if (!confirmEnd) drawEnd();
  $('#infoSum').textContent = [S.info.proje || 'Adsız proje', D.scale === 'Y' ? 'Yerleşme' : TIPS[S.tip], S.durum === 'Y' ? 'Yeni' : 'Mevcut', 'Hedef: ' + GRADES[g]].join(' · ');
  $('#mini').innerHTML = `<div class="score">${f2(R.total)}</div><span class="badge">${gradeTxt}</span><span class="note">Hedef: ${GRADES[g]} · ${D.th[g]}</span>`;
  save();
  fitSide();
}

// Sağ panel ekrana sığıyorsa üstte sabit kalır; sığmıyorsa alt kenarı ekranın altına hizalanır
// (panel içinde ayrı kaydırma çubuğu olmaz).
function fitSide() {
  const a = $('.side');
  if (!a || a.offsetParent === null) return;
  a.style.top = Math.min(12, innerHeight - a.offsetHeight - 12) + 'px';
}
window.addEventListener('resize', fitSide);
document.addEventListener('toggle', e => { if (e.target.closest && e.target.closest('.side')) fitSide(); }, true);

// ---- Başlatma
function init() {
  setScale(S.olcek);
  S.f = S.f || {};
  const yer = D.scale === 'Y';
  $('#tip').innerHTML = TIPS.map((t, i) => `<option value="${i}">${t}</option>`).join('');
  $('#hdf').innerHTML = GRADES.map((t, i) => `<option value="${i}">${t}</option>`).join('');
  $('#ols').value = S.olcek || 'B';
  $('#tipd').hidden = yer;
  $('#fld').hidden = yer;
  $('#hsub').textContent = `${yer ? 'Yerleşme' : 'Bina'} ölçeği · Skorlama ve kanıt takibi · v1.3 esaslı ön değerlendirme aracıdır, bağlayıcı değildir`;
  $('#tip').value = S.tip; $('#dur').value = S.durum; $('#hdf').value = S.hedef; updHelp();
  document.querySelectorAll('[data-i]').forEach(e => e.value = S.info[e.dataset.i] || '');
  drawFilter(); renderMods(); update();
  migrateImgs(S).then(moved => { if (moved) { renderMods(); update(); } });
}

function drawFilter() { $('#fl').innerHTML = STAGES.map((x, i) => `<button data-f="${i}" class="${S.a == i ? 'on' : ''}">${x}</button>`).join(''); }

function grpFix(c, id) {
  // Seçenekli kriterlerde bir seçenek girilince diğerleri sıfırlanır
  if (!c.g || !S.v[id]) return;
  D.crit.filter(x => x.g && x.c === c.c && x.id !== id).forEach(o => {
    S.v[o.id] = 0;
    const el = document.querySelector(`[data-id="${o.id}"] [data-a=v]`);
    if (el) el.value = 0;
  });
}

// ---- Olaylar
document.addEventListener('click', e => {
  const f = e.target.dataset.f;
  if (f === undefined) return;
  S.a = +f; drawFilter(); renderMods(); update();
});

document.addEventListener('input', e => {
  const t = e.target, a = t.dataset.a, i = t.dataset.i;
  if (i) { S.info[i] = t.value; update(); return; }
  if (!a || a === 'up') return;
  const id = t.closest('.r').dataset.id, c = D.crit.find(x => x.id === id);
  if (a === 'n') S.n[id] = t.value;
  if (a === 'e') S.e[id] = t.value;
  if (a === 'z') S.z[id] = t.checked;
  if (a === 'v') {
    const x = Math.min(Math.max(+t.value || 0, 0), earnableCredit(c, S));
    if (t.value !== '' && +t.value !== x) t.value = x;
    S.v[id] = x; grpFix(c, id);
  }
  update();
});

document.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.a !== 'f') return;
  const r = t.closest('.r'), id = r.dataset.id, c = D.crit.find(x => x.id === id), m = earnableCredit(c, S);
  S.v[id] = m; r.querySelector('[data-a=v]').value = m; grpFix(c, id); update();
});

$('#tip').onchange = e => { S.tip = +e.target.value; renderMods(); update(); };
$('#dur').onchange = e => { S.durum = e.target.value; renderMods(); update(); };
$('#hdf').onchange = e => { S.hedef = +e.target.value; update(); };
$('#ols').onchange = e => { S.olcek = e.target.value; S.tip = S.olcek === 'Y' ? 0 : 1; S.a = 0; init(); };

// ---- JSON dışa / içe aktarma (kanıt dosyaları dahil değildir)
$('#ex').onclick = () => { $('#js').value = JSON.stringify(S); $('#jm').textContent = 'Proje verisi kutuya yazıldı.'; };
$('#exf').onclick = () => {
  downloadBlob(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }), `YeS-TR_${safeName(S.info.proje)}.json`);
};
$('#im').onclick = () => {
  try {
    const data = JSON.parse($('#js').value);
    delete data.img; delete data.f; // dosyalar başka cihazda yoktur
    S = Object.assign(blank(), data);
    S.id = P.cur; P.list[P.cur] = S;
    init();
    $('#jm').textContent = 'İçe aktarıldı.';
  } catch (e) { $('#jm').textContent = 'Geçersiz JSON: veri okunamadı.'; }
};

// ---- Proje yönetimi (proje seçimi ve yeni proje açılış sayfasındadır)
function go(id) { save(); P.cur = id; S = Object.assign(blank(), P.list[id]); P.list[id] = S; S.id = id; init(); }
$('#pd').onclick = () => {
  const id = 'p' + Date.now(), c = JSON.parse(JSON.stringify(S));
  c.img = {}; c.f = {}; delete c.done; c.info.proje = (c.info.proje || 'Proje') + ' (kopya)';
  // Dosyalar kopyalanmaz: tablo dosya sütunları (ör. yetki belgeleri) boşaltılır
  for (const id in c.t || {}) if (CRIT_TABLES[id]) (c.t[id] || []).forEach(r => fileColsOf(id).forEach(k => delete r[k]));
  P.list[id] = c; go(id);
};
// ---- Silme: proje 7 gün "Silinen Projeler"de bekler, sonra kanıt dosyalarıyla kalıcı silinir
const KEEP_DAYS = 7, DAY = 864e5;
const daysLeft = p => Math.max(0, Math.ceil((Date.parse(p.deleted) + KEEP_DAYS * DAY - Date.now()) / DAY));

// Aktif proje silinince/kalıcı kaldırılınca yerine boş bir proje açılır (listelerde görünmez)
function freshCurrent() {
  const id = 'p' + Date.now();
  P.list[id] = blank(); P.cur = id; S = P.list[id]; S.id = id;
}
function purgeNow(k) {
  delAllFiles(Object.assign(blank(), P.list[k]));
  delete P.list[k];
  if (k === P.cur) freshCurrent();
}
// Süresi dolan silinmiş projeleri kalıcı olarak kaldırır (açılışta ve liste çizilirken)
function purgeDeleted() {
  let n = 0;
  Object.keys(P.list).forEach(k => { const p = P.list[k]; if (p.deleted && Date.now() - Date.parse(p.deleted) >= KEEP_DAYS * DAY) { purgeNow(k); n++; } });
  if (n) save();
}

let confirmDel = 0;
$('#px').onclick = () => {
  if (!confirmDel) {
    confirmDel = 1; $('#px').textContent = 'Emin misiniz? Tekrar tıklayın';
    setTimeout(() => { confirmDel = 0; $('#px').textContent = 'Projeyi Sil'; }, 3000);
    return;
  }
  confirmDel = 0; $('#px').textContent = 'Projeyi Sil';
  S.deleted = new Date().toISOString();
  save();
  freshCurrent(); save();
  PTAB = 'x';
  location.hash = homeHash(); // proje listesi, Silinen Projeler sekmesi
};


// ---- Rapor
function loadScript(src, ready) {
  if (ready()) return Promise.resolve();
  return new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok;
    s.onerror = () => no(new Error(src + ' yüklenemedi'));
    document.head.appendChild(s);
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

async function loadReportLibs(files) {
  await loadScript('vendor/docx.umd.js', () => window.docx);
  await loadScript('assets/js/logo.js', () => window.LOGO_B64);
  const hasPdf = Object.values(files).some(l => l.some(f => f.type === 'application/pdf'));
  if (hasPdf) {
    // Çalışan (worker) betiği önce yüklenir; pdf.js ana iş parçacığında çalışır (file:// ile de uyumlu)
    await loadScript('vendor/pdf.worker.min.js', () => window.pdfjsWorker);
    await loadScript('vendor/pdf.min.js', () => window.pdfjsLib);
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdf.worker.min.js';
  }
}

async function runReport(withPackage) {
  const btns = [$('#rp'), $('#rz')], m = $('#rm'), say = t => m.textContent = t;
  btns.forEach(b => b.disabled = true);
  say('Rapor hazırlanıyor…');
  try {
    const files = await loadFiles(S);
    await loadReportLibs(files);
    const docBlob = await makeReport(S, files, say);
    const base = `YeS-TR_Rapor_${safeName(S.info.proje)}`;
    if (!withPackage) {
      downloadBlob(docBlob, base + '.docx');
      say('Rapor indirildi. İçindekiler Word\'de açılışta güncellenir.');
      return;
    }
    say('Kanıt paketi hazırlanıyor…');
    await loadScript('vendor/jszip.min.js', () => window.JSZip);
    const zip = new JSZip();
    zip.file(base + '.docx', docBlob);
    const idx = reportModuleOrder();
    idx.forEach((mi, k) => {
      const folder = `Ekler/EK-${k + 1}_${D.mods[mi]}`;
      D.crit.filter(c => c.m === mi).forEach(c => (files[c.id] || []).forEach((f, i) => {
        zip.file(`${folder}/${evidenceNo(c, i)}_${safeName(f.name)}`, f.blob);
      }));
    });
    const zipBlob = await zip.generateAsync({ type: 'blob' }, meta => say(`Paket sıkıştırılıyor… %${Math.round(meta.percent)}`));
    downloadBlob(zipBlob, base + '.zip');
    say('Rapor ve kanıt dosyaları paketi (.zip) indirildi.');
  } catch (e) {
    say('Rapor oluşturulamadı: ' + ((e && e.message) || e));
  } finally { btns.forEach(b => b.disabled = false); }
}
$('#rp').onclick = () => runReport(false);
$('#rz').onclick = () => runReport(true);

// ---- Açılış sayfası ve sayfa geçişleri
// #degerlendirme = değerlendirme ekranı, #rapor = aktif projenin rapor bilgileri sayfası
// (açılış formu düzenleme modunda; Proje Bilgileri kutusu gizlenir, yalnızca Rapor Bilgileri görünür)
const WORK_HASH = '#degerlendirme', EDIT_HASH = '#rapor';
// Giriş akışı: hash'siz index.html → giris.html (Yeni Proje / Projeler).
// #yeni = yalnızca proje formu, #projeler = yalnızca proje listesi.
// #acilis = eski birleşik açılış sayfası (form + liste); bağlantısız, geri dönüş için korunuyor.
// Eski sayfadan girildiyse (FLOW=false) geri dönüşler oraya, aksi halde Projeler sayfasına yapılır.
const NEW_HASH = '#yeni', LIST_HASH = '#projeler', OLD_HASH = '#acilis', ENTRY_PAGE = 'giris.html';
let FLOW = true;
try { FLOW = sessionStorage.getItem('yestr_flow') !== '0'; } catch (e) {}
const setFlow = v => { FLOW = v; try { sessionStorage.setItem('yestr_flow', v ? '1' : '0'); } catch (e) {} };
const homeHash = () => FLOW ? LIST_HASH : OLD_HASH;
const isUsed = p => !!(p.info && p.info.proje) || ['v', 'z', 'f', 'n', 'g', 't', 'org'].some(k => p[k] && Object.keys(p[k]).length);

function route() {
  const h = location.hash;
  // Adressiz açılış → giriş sayfası
  if (!h || h === '#' || ![WORK_HASH, EDIT_HASH, NEW_HASH, LIST_HASH, OLD_HASH].includes(h)) { location.replace(ENTRY_PAGE); return; }
  if (h === EDIT_HASH && !isUsed(S)) { location.replace('#' + homeHash().slice(1)); return; } // açık proje yokken rapor sayfası
  const work = h === WORK_HASH, edit = h === EDIT_HASH;
  const mode = h === NEW_HASH ? 'yeni' : h === LIST_HASH ? 'liste' : 'full';
  if (mode !== 'full') setFlow(true);
  else if (h === OLD_HASH) setFlow(false); // eski açılış sayfası
  $('#start').hidden = work;
  $('#work').hidden = !work;
  const home = $('#home');
  home.hidden = !(work || edit || mode !== 'full');
  if (mode !== 'full') { home.textContent = '← Giriş'; home.dataset.to = ENTRY_PAGE; }
  else if (FLOW) { home.textContent = '← Projeler'; home.dataset.to = LIST_HASH; }
  else { home.textContent = '← Ana sayfa · Projeler'; home.dataset.to = OLD_HASH; }
  if (work) { init(); } else { drawStart(edit, mode); $('#hsub').textContent = 'Skorlama ve kanıt takibi · v1.3 esaslı ön değerlendirme aracıdır, bağlayıcı değildir'; }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
$('#home').onclick = e => {
  e.preventDefault();
  const to = e.currentTarget.dataset.to || '';
  if (to.endsWith('.html')) location.href = to; else location.hash = to;
};
$('#s_cancel').onclick = () => { location.hash = WORK_HASH; };

function drawStart(edit, mode = 'full') {
  // Yeni akış sayfaları: tek sütun, ortalanmış; #yeni yalnızca form, #projeler yalnızca liste
  $('#start').classList.toggle('solo', mode !== 'full' && !edit);
  $('#sf').hidden = mode === 'liste' && !edit;
  $('.intro').hidden = mode === 'yeni' && !edit;
  $('#s_tip').innerHTML = TIPS.map((t, i) => `<option value="${i}">${t}</option>`).join('');
  $('#s_hdf').innerHTML = GRADES.map((t, i) => `<option value="${i}">${t}</option>`).join('');
  $('#sf').reset();
  $('#sf').classList.toggle('edit', edit);
  $('#s_err').hidden = true;
  $('#s_cancel').hidden = !edit;
  $('#s_card').hidden = edit; // proje bilgileri sağ paneldeki karttan düzenlenir
  $('#s_go').textContent = edit ? 'Kaydet ve değerlendirmeye dön →' : 'Değerlendirmeye başla →';
  $('.intro h2').textContent = edit ? `${S.info.proje} · Rapor Bilgileri` : 'Yeni bir YeS-TR ön değerlendirmesi başlatın';
  $('.intro p').textContent = edit
    ? 'Rapordaki [Doldurunuz] alanlarını doldurun. Kaydedince değerlendirme ekranına dönülür; kriter girişleri ve kanıt dosyaları korunur.'
    : 'Proje bilgilerini girin; kriter bazında skorlama, kanıt dosyası takibi ve Word raporu için değerlendirme ekranına geçilecektir. Rapor bilgileri isteğe bağlıdır, sonradan da doldurulabilir. Veriler yalnızca bu cihazda saklanır.';
  if (edit) {
    $('#s_proje').value = S.info.proje || ''; $('#s_kurum').value = S.info.kurum || '';
    $('#s_yesu').value = S.info.yesu || ''; $('#s_tarih').value = S.info.tarih || '';
    $('#s_ols').value = S.olcek || 'B'; $('#s_tip').value = S.tip; $('#s_dur').value = S.durum; $('#s_hdf').value = S.hedef;
    RF = repOf(S);
  } else {
    $('#s_tip').value = 1; $('#s_hdf').value = 2;
    $('#s_tarih').value = new Date().toISOString().slice(0, 10);
    RF = repBlank();
  }
  $('#s_tipd').hidden = $('#s_ols').value === 'Y'; updHelp();
  renderRepForm(edit);
  if (edit && PENDING_GROUP) {
    // Sağ paneldeki karttan seçilen grup açık gelir
    openGroup(PENDING_GROUP);
    const d = document.querySelector(`#repf details[data-g="${PENDING_GROUP}"]`);
    PENDING_GROUP = null;
    if (d) setTimeout(() => d.scrollIntoView({ block: 'start' }));
  }

  if (!edit) drawProjectList();
  $('#saved').hidden = edit || mode === 'yeni' || (mode === 'full' && !Object.keys(P.list).some(k => isUsed(P.list[k])));
  if (mode === 'liste' && !edit) {
    $('.intro h2').textContent = 'Projeler';
    $('.intro p').innerHTML = 'Devam eden, biten ve silinen projeleriniz. Açmak için projeye tıklayın. · <a href="#yeni">+ Yeni proje oluştur</a>';
  }
  if (!edit && mode !== 'liste') setTimeout(() => $('#s_proje').focus());
}

// Kayıtlı projeler: "Projeler" (devam eden) ve "Biten Projeler" sekmeleri
let PTAB = 'a';
const trDate = d => (d || '').split('-').reverse().join('.');
function drawProjectList() {
  purgeDeleted();
  const used = Object.keys(P.list).filter(k => isUsed(P.list[k]));
  const live = used.filter(k => !P.list[k].deleted);
  const active = live.filter(k => !P.list[k].done).reverse(); // en son oluşturulan en üstte
  const done = live.filter(k => P.list[k].done).sort((a, b) => P.list[b].done.localeCompare(P.list[a].done)); // en son biten en üstte
  const gone = used.filter(k => P.list[k].deleted).sort((a, b) => P.list[b].deleted.localeCompare(P.list[a].deleted)); // en son silinen en üstte
  $('#pt_a').textContent = active.length; $('#pt_d').textContent = done.length; $('#pt_x').textContent = gone.length;
  document.querySelectorAll('[data-pt]').forEach(b => b.classList.toggle('on', b.dataset.pt === PTAB));
  const ids = PTAB === 'd' ? done : PTAB === 'x' ? gone : active, cur = S.olcek;
  $('#plist').innerHTML = ids.map(k => {
    const p = Object.assign(blank(), P.list[k]);
    setScale(p.olcek);
    const R = calc(p), kind = p.olcek === 'Y' ? 'Yerleşme' : TIPS[p.tip];
    const name = `<b>${esc(p.info.proje || 'Adsız proje')}</b>`;
    if (p.deleted) {
      const left = daysLeft(p);
      return `<div class="pl del" data-k="${k}">
        <span class="pn">${name}<span>${esc([p.info.kurum, kind, 'Silinme: ' + trDate(p.deleted.slice(0, 10))].filter(Boolean).join(' · '))}</span>
          <span class="dl">${left ? `${left} gün sonra kalıcı olarak silinecek` : 'Bugün kalıcı olarak silinecek'}</span></span>
        <span class="pact"><button type="button" data-restore="${k}">Geri yükle</button><button type="button" class="hard" data-purge="${k}">Şimdi kalıcı sil</button></span>
      </div>`;
    }
    const meta = [p.info.kurum, kind, p.durum === 'Y' ? 'Yeni' : 'Mevcut', p.done ? 'Bitiş: ' + trDate(p.done) : trDate(p.info.tarih)].filter(Boolean).join(' · ');
    return `<button class="pl ${p.done ? 'fin' : ''}" data-p="${k}">
      <span class="pn">${name}<span>${esc(meta)}</span></span>
      <span class="pg"><b>${f2(R.total)}</b>${R.grade < 0 ? 'Derece yok' : GRADES[R.grade]}</span>
    </button>`;
  }).join('') || `<div class="note" style="padding:10px 2px">${{
    a: 'Devam eden proje yok.',
    d: 'Henüz biten proje yok. Değerlendirme ekranında sağ panelin altındaki “Projeyi Sonlandır” ile projeler buraya taşınır.',
    x: `Silinen proje yok. Silinen projeler burada ${KEEP_DAYS} gün bekler, sonra kalıcı olarak kaldırılır.`
  }[PTAB]}</div>`;
  setScale(cur);
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-pt]');
  if (!b) return;
  PTAB = b.dataset.pt; drawProjectList();
});
// Silinen Projeler: geri yükle / şimdi kalıcı sil (iki tıklamalı onay)
document.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.restore) { delete P.list[t.dataset.restore].deleted; save(); drawProjectList(); return; }
  if (!t.dataset.purge) return;
  if (!t.classList.contains('sure')) {
    t.classList.add('sure'); t.textContent = 'Emin misiniz? Tekrar tıklayın';
    setTimeout(() => { t.classList.remove('sure'); t.textContent = 'Şimdi kalıcı sil'; }, 3000);
    return;
  }
  purgeNow(t.dataset.purge); save(); drawProjectList();
});

// Projeyi sonlandır / yeniden aç (iki tıklamalı onay)
let confirmEnd = 0;
function drawEnd() {
  const d = S.done;
  $('#pend').textContent = d ? 'Projeyi Yeniden Aç' : 'Projeyi Sonlandır';
  $('#pend').classList.toggle('reopen', !!d);
  $('#pendn').textContent = d
    ? `Bu proje ${trDate(d)} tarihinde sonlandırıldı. Yeniden açılırsa “Projeler” sekmesine döner.`
    : 'Sonlandırılan proje açılış sayfasında “Biten Projeler” sekmesine taşınır.';
  $('#doneBanner').hidden = !d;
  if (d) $('#doneBanner').innerHTML = `<b>Bu proje ${trDate(d)} tarihinde sonlandırıldı.</b> <span class="note">Bilgiler görüntülenebilir ve rapor alınabilir. Yeniden açmak için sağ panelin altındaki butonu kullanın.</span>`;
}
$('#pend').onclick = () => {
  if (!confirmEnd) {
    confirmEnd = 1;
    $('#pend').textContent = S.done ? 'Emin misiniz? Yeniden açmak için tekrar tıklayın' : 'Emin misiniz? Sonlandırmak için tekrar tıklayın';
    setTimeout(() => { if (confirmEnd) { confirmEnd = 0; drawEnd(); } }, 3000);
    return;
  }
  confirmEnd = 0;
  if (S.done) { delete S.done; save(); drawEnd(); return; }
  S.done = new Date().toISOString().slice(0, 10);
  save();
  PTAB = 'd';
  location.hash = homeHash(); // proje listesi, Biten Projeler sekmesi
};

$('#s_ols').onchange = e => { $('#s_tipd').hidden = e.target.value === 'Y'; };
$('#plist').onclick = e => {
  const b = e.target.closest('[data-p]');
  if (!b) return;
  if (b.dataset.p !== P.cur) go(b.dataset.p);
  location.hash = WORK_HASH;
};

$('#sf').onsubmit = e => {
  e.preventDefault();
  const proje = $('#s_proje').value.trim();
  if (!proje) { $('#s_err').hidden = false; $('#s_proje').focus(); return; }
  const edit = $('#sf').classList.contains('edit');
  const p = edit ? S : blank(), olcek = $('#s_ols').value;
  p.info = Object.assign(p.info || {}, { proje, kurum: $('#s_kurum').value.trim(), yesu: $('#s_yesu').value.trim(), tarih: $('#s_tarih').value });
  if (edit && olcek !== p.olcek) p.a = 0;
  p.olcek = olcek;
  p.tip = olcek === 'Y' ? 0 : +$('#s_tip').value;
  p.durum = $('#s_dur').value;
  p.hedef = +$('#s_hdf').value;
  p.rep = repFromForm();
  if (edit) {
    save();
  } else if (!isUsed(S)) {
    // Boş duran aktif projeyi yeniden kullan
    S = Object.assign(p, { id: P.cur });
    P.list[P.cur] = S;
    save();
  } else {
    const id = 'p' + Date.now();
    P.list[id] = p;
    go(id);
  }
  location.hash = WORK_HASH;
};
