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

const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.dwg,.dxf,.zip,.rar,.txt,.csv,image/*';

// ---- Kriter satırı
function row(c) {
  const id = c.id, z = isMandatory(c, S), m = maxCredit(c, S), e = earnableCredit(c, S), v = S.v[id] ?? '';
  const stage = c.s ? `<span class="st">${STAGES[c.s]}</span>` : '';
  const req = c.r ? `<details class="rq"><summary>Gereklilik</summary>${esc(c.r)}</details>` : '';
  const evid = ['Yok', 'Hazırlanıyor', 'Tamam'].map(x => `<option ${(S.e[id] || 'Yok') == x ? 'selected' : ''}>${x}</option>`).join('');
  const zLabel = c.zg ? `Zorunlu (${GRADES[c.zg]} ve üstü)` : 'Zorunlu';
  const mxText = !m ? '' : e ? 'maks ' + num(m) : `azami ${num(m)} · kredi kazanılamaz`;
  const ncNote = m && !e ? `<div class="note" style="margin:-2px 0 6px">Yalnızca Evet/Hayır olarak değerlendirilir; ${num(m)} kredi modülün azami kredisine dahildir ancak kazanılamaz (YeS-TR Puan Hesaplama v1.3).</div>` : '';
  return `<div class="r" data-id="${id}">
  <div class="h"><b>${c.c}</b>${stage}${z ? `<span class="z">${zLabel}</span>` : ''}<span class="st" data-c="${id}" hidden></span><span class="mxv">${mxText}</span></div>
  <div class="t">${esc(c.n)}</div>${ncNote}${req}
  <div class="ctl">
    ${z ? `<label class="chk"><input type="checkbox" data-a="z" ${S.z[id] ? 'checked' : ''}> Şart sağlandı</label>` : ''}
    ${e ? `<input type="number" inputmode="decimal" min="0" max="${e}" step="any" data-a="v" value="${v}" placeholder="0"><button data-a="f">Tam</button>` : ''}
    <select data-a="e" title="Kanıt durumu">${evid}</select>
    <input type="text" data-a="n" placeholder="Proje çözümü / not" value="${esc(S.n[id] || '')}">
  </div>
  <div class="ev">
    <label class="up" title="PDF, Word, Excel, görsel, DWG vb. Dosyaları bu satırın üzerine sürükleyip de bırakabilirsiniz.">📎 Kanıt dosyası ekle<input type="file" multiple accept="${ACCEPT}" data-a="up" hidden></label>
    <span class="note">veya dosyayı buraya sürükleyin</span>
  </div>
  <div class="fls" data-t="${id}"></div>
</div>`;
}

// Modüller 6 kutu olarak gösterilir; seçili modülün kriterleri altta listelenir.
function renderMods() {
  if (ACTIVE >= D.mods.length) ACTIVE = 0;
  setTimeout(() => Object.keys(S.f || {}).forEach(drawFiles));
  $('#tiles').innerHTML = D.mods.map((m, i) => `<button class="tile ${i === ACTIVE ? 'on' : ''}" data-mi="${i}">
    <span class="tc">${m}</span>${i < 5 ? `<span class="dot" id="md${i}"></span>` : ''}
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
  $('#mods').innerHTML = `<div class="mp"><div class="mph"><b>${D.mods[ACTIVE]} · ${esc(moduleName(ACTIVE))}</b><span id="mph"></span>${tools}</div>${h}</div>`;
}

// Tema başlıklarının özetleri: kriter sayısı, kazanılan/azami kredi, eksik zorunlu
function themeStats() {
  document.querySelectorAll('[data-ts]').forEach(el => {
    const cs = D.crit.filter(c => c.m === ACTIVE && c.t === el.dataset.ts);
    const got = cs.reduce((a, c) => a + givenCredit(c, S), 0);
    const opts = cs.filter(c => c.g).map(c => maxCredit(c, S)); // seçeneklerden yalnızca en yükseği sayılır
    const max = cs.filter(c => !c.g).reduce((a, c) => a + maxCredit(c, S), 0) + (opts.length ? Math.max(...opts) : 0);
    const miss = cs.filter(c => isMandatory(c, S) && !S.z[c.id]).length;
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
  R.mods.forEach((x, i) => {
    const e = $('#mh' + i), b = $('#mb' + i), d = $('#md' + i);
    if (e) e.textContent = `${num(x.raw)}/${num(x.max)} kredi · ${f2(x.wc)}`;
    if (b) b.style.width = (x.max ? x.raw / x.max * 100 : 0) + '%';
    if (d) { d.classList.toggle('ok', !!x.met[g]); d.title = x.met[g] ? `${GRADES[g]} için modül şartı sağlandı` : `${GRADES[g]} için modül şartı sağlanmadı`; }
  });
  const am = R.mods[ACTIVE], mph = $('#mph');
  themeStats();
  if (mph && am) mph.textContent = `Ağırlık %${num(am.w * 100)} · ${num(am.raw)}/${num(am.max)} kredi · ağırlıklı ${f2(am.wc)}${ACTIVE < 5 ? (am.min ? ` · ${GRADES[g]} şartı ≥ ${am.min[g]}` : ' · tema kapsam şartı') : ' · toplama dahil değil'}`;

  const chip = (ok, t) => `<span class="chip ${ok ? 'ok' : 'no'}">${t}</span>`;
  const gradeTxt = R.grade < 0 ? 'Derece alınamadı' : GRADES[R.grade];
  let h = `<div class="big"><div class="score">${f2(R.total)}</div><span class="badge">${gradeTxt}</span></div>
  <div class="note sline"><span>Toplam ağırlıklı kredi (İNO hariç)</span><span>Hedef: <b>${GRADES[g]}</b> (≥ ${D.th[g]})</span></div><div class="chips">`;
  h += chip(R.total + EPS >= D.th[g], `Toplam ${f2(R.total)} / ${D.th[g]}`);
  R.mods.slice(0, 5).forEach(x => h += chip(x.met[g], x.min ? `${x.m} ${f2(x.wc)} / ${x.min[g]}` : `${x.m} kapsam şartı`));
  h += chip(!R.miss.length, R.miss.length ? `Eksik zorunlu: ${R.miss.length}` : 'Zorunlular tamam') + '</div>';
  if (R.miss.length) h += `<div class="note" style="margin-top:6px">${R.miss.join(', ')}</div>`;

  const SG = suggest(S, R, g), list = SG.items.slice(0, 12);
  if (list.length) h += `<details id="sg" class="sg sec" ${sugOpen ? 'open' : ''}><summary>Hedefe ulaşmak için öneriler (${SG.items.length})</summary>${list.map(s =>
    `<div class="it"><b>${s.c.c}</b> ${esc(s.c.n.slice(0, 70))} · ${s.why}${s.gain ? ` · +${f2(s.gain)}` : ''}${s.c.s ? ' · ' + STAGES[s.c.s] : ''}</div>`).join('')}</details>`;

  const ino = R.mods[5];
  h += `<div class="note sec">İnovasyon: ${f2(ino.wc)} / ${f2(ino.max * ino.w)} (toplama dahil değil)</div>`;

  let done = 0, total = 0;
  D.crit.forEach(c => {
    const id = c.id;
    if (+S.v[id] > 0 || (isMandatory(c, S) && S.z[id])) { total++; if (S.e[id] === 'Tamam') done++; }
  });
  const nFiles = D.crit.reduce((a, c) => a + ((S.f && S.f[c.id]) || []).length, 0);
  const nCrit = D.crit.filter(c => ((S.f && S.f[c.id]) || []).length).length;
  h += `<div class="note sec">Kanıt durumu: ${done}/${total} kriter tamamlandı<br>Kanıt dosyası: ${nFiles} dosya · ${nCrit} kriter</div>`;
  $('#sum').innerHTML = h;
  drawRepCard();
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
  $('#tip').value = S.tip; $('#dur').value = S.durum; $('#hdf').value = S.hedef;
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
  c.img = {}; c.f = {}; c.info.proje = (c.info.proje || 'Proje') + ' (kopya)';
  P.list[id] = c; go(id);
};
let confirmDel = 0;
$('#px').onclick = () => {
  if (!confirmDel) {
    confirmDel = 1; $('#px').textContent = 'Emin misiniz? Tekrar tıklayın';
    setTimeout(() => { confirmDel = 0; $('#px').textContent = 'Projeyi sil'; }, 3000);
    return;
  }
  confirmDel = 0; $('#px').textContent = 'Projeyi sil';
  delAllFiles(S);
  delete P.list[P.cur];
  if (!Object.keys(P.list).length) P.list.p1 = blank();
  P.cur = Object.keys(P.list)[0]; S = Object.assign(blank(), P.list[P.cur]); P.list[P.cur] = S; S.id = P.cur;
  save();
  location.hash = ''; // silindikten sonra açılış sayfasındaki proje listesine dön
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
const isUsed = p => !!(p.info && p.info.proje) || ['v', 'z', 'f', 'n'].some(k => p[k] && Object.keys(p[k]).length);

function route() {
  const work = location.hash === WORK_HASH, edit = location.hash === EDIT_HASH && isUsed(S);
  $('#start').hidden = work;
  $('#work').hidden = !work;
  $('#home').hidden = !(work || edit);
  if (work) { init(); } else { drawStart(edit); $('#hsub').textContent = 'Skorlama ve kanıt takibi · v1.3 esaslı ön değerlendirme aracıdır, bağlayıcı değildir'; }
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
$('#home').onclick = e => { e.preventDefault(); location.hash = ''; };
$('#s_cancel').onclick = () => { location.hash = WORK_HASH; };

function drawStart(edit) {
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
  $('#s_tipd').hidden = $('#s_ols').value === 'Y';
  renderRepForm(edit);
  if (edit && PENDING_GROUP) {
    // Sağ paneldeki karttan seçilen grup açık gelir
    openGroup(PENDING_GROUP);
    const d = document.querySelector(`#repf details[data-g="${PENDING_GROUP}"]`);
    PENDING_GROUP = null;
    if (d) setTimeout(() => d.scrollIntoView({ block: 'start' }));
  }

  // Kayıtlı projeler: en son oluşturulan en üstte (düzenleme modunda gizli)
  const cur = S.olcek, ids = edit ? [] : Object.keys(P.list).filter(k => isUsed(P.list[k])).reverse();
  $('#saved').hidden = !ids.length;
  $('#plist').innerHTML = ids.map(k => {
    const p = Object.assign(blank(), P.list[k]);
    setScale(p.olcek);
    const R = calc(p), kind = p.olcek === 'Y' ? 'Yerleşme' : TIPS[p.tip];
    return `<button class="pl" data-p="${k}">
      <span class="pn"><b>${esc(p.info.proje || 'Adsız proje')}</b><span>${esc([p.info.kurum, kind, p.durum === 'Y' ? 'Yeni' : 'Mevcut', (p.info.tarih || '').split('-').reverse().join('.')].filter(Boolean).join(' · '))}</span></span>
      <span class="pg"><b>${f2(R.total)}</b>${R.grade < 0 ? 'Derece yok' : GRADES[R.grade]}</span>
    </button>`;
  }).join('');
  setScale(cur);
  if (!edit) setTimeout(() => $('#s_proje').focus());
}

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
