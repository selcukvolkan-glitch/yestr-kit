// Kalıcı saklama: projeler localStorage'da, kanıt dosyaları IndexedDB'de (yalnızca bu cihazda).

const STORE_KEY = 'yestr2';
// Rapor bilgileri (açılış sayfasındaki isteğe bağlı gruplar; rapordaki [Doldurunuz] alanları)
const TAKIP_ADIMLAR = ['YESU sözleşmesi', 'Başvuru ücreti ödemesi', 'Başvuru dosyası yükleme', 'Değerlendirme / düzeltme', 'Taslak sertifika incelemesi', 'Sertifika teslimi'];
const repBlank = () => ({
  kunye: {},                       // raporNo, konum, alan, kat, ruhsat, mimar, yuklenici
  pay: { yesu: {}, sahip: {}, yesdu: {}, muellif: {} }, // her biri: kisi, no, iletisim
  ekip: [],                        // [{ ad, disiplin, gorev, sicil }]
  guclu: '', gelisim: '',          // her satır bir madde
  takip: TAKIP_ADIMLAR.map(() => ({})), // [{ plan, gercek, not }]
  eylem: [],                       // [{ eylem, sorumlu, termin, kriter }]
  onay: {}                         // hazirlayan, hazirlayanT, kontrol, kontrolT, onaylayan, onaylayanT
});
// Eksik alanları varsayılanlarla tamamlar (eski projeler için)
function repOf(p) {
  const r = Object.assign(repBlank(), JSON.parse(JSON.stringify((p && p.rep) || {})));
  r.pay = Object.assign(repBlank().pay, r.pay);
  r.takip = TAKIP_ADIMLAR.map((_, i) => (r.takip && r.takip[i]) || {});
  return r;
}

// f: { kriterId: [dosyaAnahtarı, ...] }  ·  img: eski sürümden kalan fotoğraflar (açılışta f'ye taşınır)
const blank = () => ({ info: {}, olcek: 'B', tip: 1, durum: 'Y', hedef: 2, a: 0, v: {}, z: {}, n: {}, e: {}, f: {}, img: {}, rep: repBlank() });

let S = blank();                    // aktif proje
let P = { cur: 'p1', list: {} };    // tüm projeler

function save() {
  try { P.list[P.cur] = S; localStorage.setItem(STORE_KEY, JSON.stringify(P)); } catch (e) {}
}

function load() {
  try {
    const j = localStorage.getItem(STORE_KEY);
    if (j) P = JSON.parse(j);
    else {
      const old = localStorage.getItem('yestr1'); // tek projeli eski sürüm
      P = { cur: 'p1', list: { p1: old ? JSON.parse(old) : blank() } };
    }
  } catch (e) {}
  if (!P.list[P.cur]) P.list[P.cur] = blank();
  S = Object.assign(blank(), P.list[P.cur]);
  P.list[P.cur] = S;
  S.id = P.cur;
}

// ---- IndexedDB
let _db;
const idb = () => _db || (_db = new Promise((ok, no) => {
  try {
    const r = indexedDB.open('yestr', 2);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('img')) db.createObjectStore('img');     // v1: fotoğraflar
      if (!db.objectStoreNames.contains('files')) db.createObjectStore('files'); // v2: tüm kanıt dosyaları
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => no(r.error);
  } catch (e) { no(e); }
}));

const tx = async (mode, fn, store = 'files') => {
  const d = await idb();
  return new Promise((ok, no) => {
    const q = fn(d.transaction(store, mode).objectStore(store));
    q.onsuccess = () => ok(q.result);
    q.onerror = () => no(q.error);
  });
};

const today = () => new Date().toISOString().slice(0, 10);
const MAX_FILE = 50 * 1024 * 1024;

// Kanıt dosyası ekler. Büyük fotoğraflar okunur kalacak şekilde 2000 px JPEG'e küçültülür,
// diğer dosyalar (PDF, Word, Excel, DWG...) olduğu gibi saklanır.
async function addFile(id, file) {
  if (file.size > MAX_FILE) throw new Error(`${file.name}: 50 MB sınırını aşıyor`);
  let blob = file, type = file.type || 'application/octet-stream', name = file.name, w, h;
  if (/^image\/(jpeg|png|webp|bmp|gif)$/.test(type)) {
    try {
      const bm = await createImageBitmap(file);
      w = bm.width; h = bm.height;
      if (file.size > 1.5e6 || Math.max(w, h) > 2400) {
        const k = Math.min(1, 2000 / Math.max(w, h));
        w = Math.round(w * k); h = Math.round(h * k);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const x = c.getContext('2d');
        x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
        x.drawImage(bm, 0, 0, w, h);
        blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .85));
        type = 'image/jpeg';
        name = name.replace(/\.[^.]+$/, '') + '.jpg';
      }
    } catch (e) {}
  }
  const key = `${S.id}|${id}|${Date.now()}${Math.random().toString(36).slice(2, 5)}`;
  await tx('readwrite', s => s.put({ name, type, size: blob.size, date: today(), blob, w, h }, key));
  (S.f[id] = S.f[id] || []).push(key);
  save();
}

const getFile = key => tx('readonly', s => s.get(key));

async function removeFile(id, key) {
  S.f[id] = (S.f[id] || []).filter(k => k !== key);
  if (!S.f[id].length) delete S.f[id];
  save();
  try { await tx('readwrite', s => s.delete(key)); } catch (e) {}
}

// { kriterId: [{key, name, type, size, date, w, h, blob}] }
async function loadFiles(S) {
  const o = {};
  for (const id in S.f || {}) for (const key of S.f[id]) {
    try { const r = await getFile(key); if (r) (o[id] = o[id] || []).push(Object.assign({ key }, r)); } catch (e) {}
  }
  return o;
}

async function delAllFiles(S) {
  for (const id in S.f || {}) for (const k of S.f[id]) try { await tx('readwrite', s => s.delete(k)); } catch (e) {}
  for (const id in S.img || {}) for (const k of S.img[id]) try { await tx('readwrite', s => s.delete(k), 'img'); } catch (e) {}
}

// Eski sürümdeki fotoğrafları (img deposu) kanıt dosyalarına taşır.
async function migrateImgs(S) {
  if (!S.img || !Object.keys(S.img).length) return false;
  S.f = S.f || {};
  for (const id in S.img) {
    let n = 0;
    for (const k of S.img[id]) {
      try {
        const r = await tx('readonly', s => s.get(k), 'img');
        if (!r) continue;
        await tx('readwrite', s => s.put({ name: `Fotograf-${++n}.jpg`, type: 'image/jpeg', size: r.blob.size, date: today(), blob: r.blob, w: r.w, h: r.h }, k));
        await tx('readwrite', s => s.delete(k), 'img');
        (S.f[id] = S.f[id] || []).push(k);
      } catch (e) {}
    }
  }
  S.img = {};
  save();
  return true;
}
