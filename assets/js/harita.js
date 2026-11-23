// YeS-TR Değerlendirme Kiti · Harita ile ölç (BBT 01 K4)
// Kılavuzda 'harita' tanımı olan kriterlerde açılır bir harita bölümü: bina girişi işaretlenir, çevredeki
// toplu taşıma / sağlık / eğitim noktaları OpenStreetMap'ten (Overpass) bulunur ya da elle eklenir,
// kuş uçuşu mesafelere göre gereklilikler önerilir; harita görüntüsü kanıt olarak eklenebilir.
// Veri: S.gv[id].hm = { lat, lng, bis, items: [{ id, cat, ad, tur, lat, lng, kamu, elle }] }
// Leaflet yalnızca bölüm ilk açıldığında yüklenir (vendor/leaflet). Altlık: Esri World Street Map.

const HM_CAT = { tr: { ad: 'Toplu taşıma durağı', kisa: 'Durak', esik: 500 }, sa: { ad: 'Kamu sağlık tesisi', kisa: 'Sağlık', esik: 3000 }, eg: { ad: 'Kamu eğitim tesisi', kisa: 'Eğitim', esik: 3000 } };
const HM_RENK = { tr: '#1f6fd1', sa: '#d0342c', eg: '#1b8a4b' };
const HM_ATR = 'Altlık: Esri · Kaynak: Esri, HERE, Garmin, © OpenStreetMap katkıda bulunanlar';
const HM_OPEN = new Set();          // açık bırakılan harita bölümleri (yeniden çizimde açık kalsın)
const HM_MAPS = {};                 // id -> { map, pin, rings, layer }

const hmDist = (a, b) => { const R = 6371000, r = Math.PI / 180, dl = (b.lat - a.lat) * r, dn = (b.lng - a.lng) * r;
  const x = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const hmFm = m => m < 1000 ? Math.round(m) + ' m' : (m / 1000).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) + ' km';
const hmOf = (id, p = S) => (p.gv && p.gv[id] && p.gv[id].hm) || null;
function hmSet(id, hm) { S.gv = S.gv || {}; S.gv[id] = S.gv[id] || {}; S.gv[id].hm = hm; save(); }
// En yakın nokta (sağlık / eğitimde yalnızca "kamu" işaretliler)
function hmNearest(hm, cat) {
  if (!hm || hm.lat == null) return null;
  const l = (hm.items || []).filter(i => i.cat === cat && (cat === 'tr' || i.kamu)).map(i => Object.assign({ d: hmDist(hm, i) }, i)).sort((a, b) => a.d - b.d);
  return l[0] || null;
}
// Öneri: (1) durak ≤ 500 m ya da bisiklet yolu; (2) kamu sağlık ve kamu eğitim ≤ 3 km
function hmSuggest(hm) {
  const t = hmNearest(hm, 'tr'), s = hmNearest(hm, 'sa'), e = hmNearest(hm, 'eg');
  return { t, s, e, s1: !!(t && t.d <= 500) || !!(hm && hm.bis), s2: !!(s && s.d <= 3000 && e && e.d <= 3000) };
}

// ---- Kart içindeki kabuk (içerik bölüm açılınca kurulur)
function hmapShell(id) {
  const hm = hmOf(id);
  const ozet = hm && hm.lat != null ? ` · ${(hm.items || []).length} nokta işaretli` : '';
  return `<details class="hm" data-hm="${id}"${HM_OPEN.has(id) ? ' open' : ''}><summary>Harita ile ölç <small>· isteğe bağlı: mesafeleri haritadan bul, gereklilikleri öner${ozet}</small></summary><div class="hmb"></div></details>`;
}

function hmBody(id) {
  return `<div class="hmrow"><input type="text" data-hq placeholder="Bina adresi (ör. Atatürk Bulvarı 120, Çankaya, Ankara)" aria-label="Bina adresi"><button type="button" data-hx="ara">Adresi bul</button></div>
  <div class="hmhits"></div>
  <div class="note">Adres bulunamazsa haritada bina ana girişine tıklayın. İşaret sürüklenerek düzeltilebilir.</div>
  <div class="hmmap" role="application" aria-label="Harita"></div>
  <div class="hmleg"><span><i style="background:${HM_RENK.tr}"></i>Toplu taşıma durağı</span><span><i style="background:${HM_RENK.sa}"></i>Sağlık tesisi</span><span><i style="background:${HM_RENK.eg}"></i>Eğitim tesisi</span><span>Halkalar: 500 m ve 3 km</span></div>
  <div class="hmrow"><button type="button" data-hx="bul">Çevredeki tesisleri bul</button><span class="note">Elle ekle:</span>
    <button type="button" class="sec" data-hadd="tr" aria-pressed="false">+ Durak</button><button type="button" class="sec" data-hadd="sa" aria-pressed="false">+ Sağlık</button><button type="button" class="sec" data-hadd="eg" aria-pressed="false">+ Eğitim</button>
    <span class="hmst"></span></div>
  <div class="hmcols"></div>
  <label class="chk"><input type="checkbox" data-hbis> Bina ile toplu taşıma durağı arasında bisiklet yolu var</label>
  <div class="hmsug"></div>
  <div class="hmrow"><button type="button" data-hx="uygula">Önerileri gerekliliklere uygula</button><button type="button" class="sec" data-hx="png">Harita görüntüsünü kanıta ekle</button><button type="button" class="sec" data-hx="sil">Harita verisini temizle</button></div>
  <div class="note">Mesafeler bina ana girişinden kuş uçuşu hesaplanır. Adres ve konum, harita ve tesis bilgisi için Esri ve OpenStreetMap servislerine (Nominatim, Overpass) gönderilir. Tesis verisi gönüllülerce girilir; eksik ya da hatalı olabilir, “kamu” işaretlerini kontrol edin.</div>`;
}

// ---- Leaflet'i bir kez yükle
let hmLib = null;
function hmLoad() {
  if (hmLib) return hmLib;
  if (!document.querySelector('link[data-leaflet]')) {
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'vendor/leaflet/leaflet.css'; l.dataset.leaflet = '1'; document.head.appendChild(l);
  }
  hmLib = loadScript('vendor/leaflet/leaflet.js', () => window.L).then(() => { L.Icon.Default.imagePath = 'vendor/leaflet/images/'; });
  return hmLib;
}

async function hmInit(box) {
  const id = box.dataset.hm, body = box.querySelector('.hmb');
  if (body.dataset.ready) { const M = HM_MAPS[id]; if (M) setTimeout(() => M.map.invalidateSize(), 50); return; }
  body.innerHTML = hmBody(id) + '<div class="note" data-hload>Harita yükleniyor…</div>';
  try { await hmLoad(); } catch (e) { body.querySelector('[data-hload]').textContent = 'Harita kütüphanesi yüklenemedi.'; return; }
  body.querySelector('[data-hload]').remove();
  body.dataset.ready = '1';
  const hm = hmOf(id) || { items: [] };
  const map = L.map(body.querySelector('.hmmap')).setView(hm.lat != null ? [hm.lat, hm.lng] : [39.0, 35.0], hm.lat != null ? 15 : 6);
  const tiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, crossOrigin: 'anonymous', attribution: HM_ATR }).addTo(map);
  const M = HM_MAPS[id] = { map, tiles, pin: null, rings: [], layer: L.layerGroup().addTo(map), mode: null };
  map.on('click', ev => {
    if (M.mode) {
      const cur = hmOf(id) || { items: [] }, cat = M.mode;
      cur.items = (cur.items || []).concat([{ id: 'm' + Date.now(), cat, ad: 'Elle eklenen ' + HM_CAT[cat].kisa.toLocaleLowerCase('tr-TR') + ' noktası', tur: 'elle eklendi', lat: ev.latlng.lat, lng: ev.latlng.lng, kamu: true, elle: true }]);
      hmSet(id, cur); hmMode(box, null); hmDraw(box); return;
    }
    hmPin(box, ev.latlng);
  });
  body.querySelector('[data-hbis]').checked = !!hm.bis;
  hmDraw(box);
  setTimeout(() => map.invalidateSize(), 50);
}

function hmPin(box, ll, zoom) {
  const id = box.dataset.hm, cur = hmOf(id) || { items: [] };
  cur.lat = ll.lat; cur.lng = ll.lng; hmSet(id, cur);
  const map = HM_MAPS[id].map;
  if (zoom || map.getZoom() < 13) map.setView(ll, Math.max(15, map.getZoom())); // uzak görünümde işaretlenirse yakınlaş
  hmDraw(box);
}
function hmMode(box, m) {
  const M = HM_MAPS[box.dataset.hm]; M.mode = m;
  box.querySelectorAll('[data-hadd]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.hadd === m)));
  M.map.getContainer().style.cursor = m ? 'crosshair' : '';
  hmStatus(box, m ? `Haritada ${HM_CAT[m].kisa.toLocaleLowerCase('tr-TR')} noktasına tıklayın.` : '');
}
function hmStatus(box, t, err) { const e = box.querySelector('.hmst'); if (e) { e.textContent = t || ''; e.classList.toggle('err', !!err); } }

// Harita, listeler ve öneri (veriden yeniden çizilir)
function hmDraw(box) {
  const id = box.dataset.hm, M = HM_MAPS[id], hm = hmOf(id) || { items: [] };
  if (M) {
    M.rings.forEach(r => M.map.removeLayer(r)); M.rings = []; M.layer.clearLayers();
    if (hm.lat != null) {
      const ll = L.latLng(hm.lat, hm.lng);
      if (!M.pin) { M.pin = L.marker(ll, { draggable: true, title: 'Bina ana girişi' }).addTo(M.map).bindTooltip('Bina ana girişi'); M.pin.on('dragend', () => hmPin(box, M.pin.getLatLng())); }
      else M.pin.setLatLng(ll);
      M.rings = [L.circle(ll, { radius: 500, color: HM_RENK.tr, weight: 2, fill: false, dashArray: '6 4', interactive: false }).addTo(M.map),
        L.circle(ll, { radius: 3000, color: HM_RENK.sa, weight: 2, fill: false, dashArray: '6 4', interactive: false }).addTo(M.map)];
    }
    (hm.items || []).forEach(it => {
      const d = hm.lat != null ? hmDist(hm, it) : NaN;
      it._m = L.circleMarker([it.lat, it.lng], { radius: 6, color: '#fff', weight: 1.5, fillColor: HM_RENK[it.cat], fillOpacity: it.cat !== 'tr' && !it.kamu ? .35 : 1 })
        .addTo(M.layer).bindTooltip(esc(it.ad) + (isNaN(d) ? '' : ' · ' + hmFm(d)));
    });
  }
  const cols = box.querySelector('.hmcols');
  if (cols) cols.innerHTML = ['tr', 'sa', 'eg'].map(cat => {
    const l = (hm.items || []).filter(i => i.cat === cat).map(i => Object.assign({ d: hm.lat != null ? hmDist(hm, i) : NaN }, i)).sort((a, b) => a.d - b.d).slice(0, 8);
    const C = HM_CAT[cat];
    return `<div class="hmcol"><h4>${cat === 'tr' ? 'Toplu taşıma' : C.kisa + ' (kamu)'} <span>eşik ${hmFm(C.esik)}</span></h4>` + (l.length ? l.map(it =>
      `<div class="hmit" data-hgo="${esc(it.id)}">${cat === 'tr' ? '<span></span>' : `<input type="checkbox" title="Kamusal hizmet veren tesis" aria-label="Kamu: ${esc(it.ad)}" data-hkamu="${esc(it.id)}"${it.kamu ? ' checked' : ''}>`}<span class="nm">${esc(it.ad)}<small>${esc(it.tur || '')}${cat !== 'tr' ? (it.kamu ? ' · kamu' : ' · kamu değil / bilinmiyor') : ''}</small></span><span class="d ${it.d <= C.esik ? 'in' : ''}">${isNaN(it.d) ? '—' : hmFm(it.d)}</span>${it.elle ? `<button type="button" class="hmdel" title="Noktayı sil" aria-label="Noktayı sil" data-hdel="${esc(it.id)}">×</button>` : ''}</div>`).join('')
      : `<div class="note">${hm.lat != null ? 'Henüz nokta yok.' : 'Önce bina girişini işaretleyin.'}</div>`) + '</div>';
  }).join('');
  const sg = box.querySelector('.hmsug');
  if (sg) {
    const r = hmSuggest(hm), y = ok => ok ? '<b class="ok">sağlanıyor</b>' : '<b class="no">sağlanmıyor</b>';
    sg.innerHTML = hm.lat == null ? '<div class="note">Bina girişini işaretleyip “Çevredeki tesisleri bul”a basın; öneriler burada görünür.</div>'
      : `<div><b>Öneri (1):</b> en yakın durak ${r.t ? hmFm(r.t.d) + ' (' + esc(r.t.ad) + ')' : 'bulunamadı'}${hm.bis ? ' · bisiklet yolu var' : ''} → ${y(r.s1)}</div>`
      + `<div><b>Öneri (2):</b> en yakın kamu sağlık ${r.s ? hmFm(r.s.d) : 'yok'}, kamu eğitim ${r.e ? hmFm(r.e.d) : 'yok'} (ikisi de ≤ 3 km olmalı) → ${y(r.s2)}</div>`
      + '<div class="note">Öneriler gerekliliklere kendiliğinden işlenmez; “Önerileri gerekliliklere uygula” ile aktarılır, sonra elle değiştirilebilir.</div>';
  }
}

// ---- Dış servisler
async function hmGeocode(q) {
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=tr&limit=5&accept-language=tr&q=' + encodeURIComponent(q));
    if (r.ok) { const j = await r.json(); if (j.length) return j.map(x => ({ ad: x.display_name, lat: +x.lat, lng: +x.lon })); }
  } catch (e) {}
  const r2 = await fetch('https://photon.komoot.io/api/?limit=5&q=' + encodeURIComponent(q)), j2 = await r2.json();
  return (j2.features || []).filter(f => (f.properties.countrycode || 'TR') === 'TR').map(f => { const p = f.properties;
    return { ad: [p.name, p.street && (p.street + ' ' + (p.housenumber || '')), p.district, p.city, p.state].filter(Boolean).join(', '), lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] }; });
}
const HM_EP = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
function hmQuery(hm) {
  const a = r => `(around:${r},${hm.lat.toFixed(6)},${hm.lng.toFixed(6)})`;
  // Hafif sorgu: duraklar yalnızca nokta (800 m), tesisler 3 km (sunucular yoğunken ağır sorgu zaman aşımına düşer)
  return `[out:json][timeout:30];(node${a(800)}[highway=bus_stop];node${a(800)}[railway~"^(station|halt|tram_stop)$"];node${a(800)}[amenity~"^(bus_station|ferry_terminal)$"];`
    + `nwr${a(3000)}[amenity~"^(hospital|clinic|school|university|college|kindergarten)$"];);out center tags 400;`;
}
async function hmOverpassOnce(q, ms) {
  const ctl = HM_EP.map(() => new AbortController()), tm = setTimeout(() => ctl.forEach(c => c.abort()), ms);
  try {
    return await Promise.any(HM_EP.map((u, i) => fetch(u, { method: 'POST', body: 'data=' + encodeURIComponent(q), signal: ctl[i].signal })
      .then(r => { if (!r.ok) throw 0; return r.json(); }).then(j => { ctl.forEach((c, k) => { if (k !== i) c.abort(); }); return j; })));
  } finally { clearTimeout(tm); }
}
const HM_TUR = { bus_stop: 'otobüs durağı', station: 'istasyon', halt: 'istasyon', tram_stop: 'tramvay durağı', bus_station: 'otogar', ferry_terminal: 'iskele',
  hospital: 'hastane', clinic: 'klinik / sağlık merkezi', school: 'okul', kindergarten: 'anaokulu', university: 'üniversite', college: 'yüksekokul' };
function hmClass(t) {
  if (t.highway === 'bus_stop' || t.railway || t.amenity === 'bus_station' || t.amenity === 'ferry_terminal') return 'tr';
  if (t.amenity === 'hospital' || t.amenity === 'clinic') return 'sa';
  if (/^(school|kindergarten|university|college)$/.test(t.amenity || '')) return 'eg';
  return null;
}
function hmKamu(cat, t) {
  if (cat === 'tr') return true;
  const s = [t.name, t.operator, t['operator:type']].filter(Boolean).join(' ').toLocaleLowerCase('tr-TR');
  if (/özel|private|kolej|vakıf|poliklinik|tıp merkezi|dent/.test(s)) return false;
  return /public|government|devlet|bakanl|milli eğitim|meb|belediye|aile sağlığı|asm|toplum sağlığı|şehir hastanesi|eğitim ve araştırma|ilkokul|ortaokul|lise|anadolu|imam hatip|halk eğitim|üniversitesi/.test(s);
}
async function hmFind(box) {
  const id = box.dataset.hm, hm = hmOf(id);
  if (!hm || hm.lat == null) { hmStatus(box, 'Önce bina girişini işaretleyin.', true); return; }
  const btn = box.querySelector('[data-hx="bul"]'); btn.disabled = true;
  hmStatus(box, 'Tesisler aranıyor (10–60 sn sürebilir)…');
  try {
    let j;
    try { j = await hmOverpassOnce(hmQuery(hm), 60000); }
    catch (e) { hmStatus(box, 'Sunucu yoğun, yeniden deneniyor…'); await new Promise(r => setTimeout(r, 4000)); j = await hmOverpassOnce(hmQuery(hm), 60000); }
    const keep = (hm.items || []).filter(i => i.elle), seen = {}, found = [];
    (j.elements || []).forEach(e => {
      const t = e.tags || {}, cat = hmClass(t); if (!cat) return;
      const lat = e.lat != null ? e.lat : e.center && e.center.lat, lng = e.lon != null ? e.lon : e.center && e.center.lon; if (lat == null) return;
      const tur = HM_TUR[t.amenity || t.railway || t.highway] || '';
      const ad = t.name || t['name:tr'] || (tur || HM_CAT[cat].kisa) + ' (adsız)';
      const key = cat + '|' + ad.toLocaleLowerCase('tr-TR') + '|' + lat.toFixed(3) + ',' + lng.toFixed(3); if (seen[key]) return; seen[key] = 1;
      found.push({ id: 'o' + e.type[0] + e.id, cat, ad, tur, lat, lng, kamu: hmKamu(cat, t) });
    });
    hm.items = keep.concat(found); hmSet(id, hm);
    const n = { tr: 0, sa: 0, eg: 0 }; found.forEach(i => n[i.cat]++);
    hmStatus(box, `${n.tr} durak, ${n.sa} sağlık, ${n.eg} eğitim tesisi bulundu.`);
    hmDraw(box); hmSummary(box);
  } catch (e) { hmStatus(box, 'Tesis servisine ulaşılamadı. Biraz sonra tekrar deneyin ya da noktaları elle ekleyin.', true); }
  btn.disabled = false;
}
function hmSummary(box) { const s = box.querySelector('summary small'), hm = hmOf(box.dataset.hm); if (s && hm) s.textContent = `· isteğe bağlı: mesafeleri haritadan bul, gereklilikleri öner · ${(hm.items || []).length} nokta işaretli`; }

// Harita görüntüsü: yüklü kutucuklar + halkalar + noktalar tuvale çizilir, kanıt dosyası olarak eklenir
async function hmPng(box) {
  const id = box.dataset.hm, M = HM_MAPS[id], hm = hmOf(id);
  if (!M || !hm || hm.lat == null) { hmStatus(box, 'Önce bina girişini işaretleyin.', true); return; }
  // Çerçeve: bina girişi + tablodaki en yakın tesisler; kutucuklar yüklenene kadar beklenir
  hmStatus(box, 'Harita görüntüsü hazırlanıyor…');
  const pts = [[hm.lat, hm.lng]].concat(['tr', 'sa', 'eg'].map(k => hmNearest(hm, k)).filter(Boolean).map(n => [n.lat, n.lng]));
  const done = new Promise(r => { const t = setTimeout(r, 6000); M.tiles.once('load', () => { clearTimeout(t); setTimeout(r, 200); }); });
  if (pts.length > 1) M.map.fitBounds(pts, { padding: [40, 40], maxZoom: 16 }); else M.map.setView(pts[0], 16);
  await done;
  const el = M.map.getContainer(), R = el.getBoundingClientRect(), k = 2, cv = document.createElement('canvas');
  cv.width = R.width * k; cv.height = R.height * k; const g = cv.getContext('2d'); g.scale(k, k); g.fillStyle = '#e5e5e5'; g.fillRect(0, 0, R.width, R.height);
  try {
    el.querySelectorAll('.leaflet-tile-loaded').forEach(img => { const r = img.getBoundingClientRect(); g.drawImage(img, r.left - R.left, r.top - R.top, r.width, r.height); });
    const c = L.latLng(hm.lat, hm.lng), p = M.map.latLngToContainerPoint(c);
    [[500, HM_RENK.tr], [3000, HM_RENK.sa]].forEach(([m, col]) => { const q = M.map.latLngToContainerPoint(L.latLng(c.lat + m / 111320, c.lng));
      g.beginPath(); g.setLineDash([6, 4]); g.lineWidth = 2; g.strokeStyle = col; g.arc(p.x, p.y, Math.abs(p.y - q.y), 0, 7); g.stroke(); });
    g.setLineDash([]);
    (hm.items || []).forEach(it => { const q = M.map.latLngToContainerPoint([it.lat, it.lng]); g.beginPath(); g.arc(q.x, q.y, 6, 0, 7); g.fillStyle = HM_RENK[it.cat];
      g.globalAlpha = it.cat !== 'tr' && !it.kamu ? .4 : 1; g.fill(); g.globalAlpha = 1; g.lineWidth = 1.5; g.strokeStyle = '#fff'; g.stroke(); });
    g.beginPath(); g.moveTo(p.x, p.y); g.arc(p.x, p.y - 14, 7, .75 * Math.PI, .25 * Math.PI); g.closePath(); g.fillStyle = '#d74921'; g.fill();
    g.beginPath(); g.arc(p.x, p.y - 14, 2.5, 0, 7); g.fillStyle = '#fff'; g.fill();
    g.font = '11px system-ui, sans-serif'; const aw = g.measureText(HM_ATR).width + 12;
    g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(R.width - aw, R.height - 18, aw, 18); g.fillStyle = '#333'; g.fillText(HM_ATR, R.width - aw + 6, R.height - 5);
    const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
    if (!blob) throw new Error('boş');
    await addFiles(id, [new File([blob], `harita_${id.replace(/\s+/g, '')}.png`, { type: 'image/png' })]);
    hmStatus(box, 'Harita görüntüsü kanıt belgelerine eklendi.');
  } catch (e) { hmStatus(box, 'Görüntü oluşturulamadı; harita kutucukları yüklenmemiş olabilir. Birkaç saniye sonra tekrar deneyin.', true); }
}

// ---- Olaylar
document.addEventListener('toggle', e => {
  const box = e.target; if (!box.matches || !box.matches('details.hm')) return;
  if (box.open) { HM_OPEN.add(box.dataset.hm); hmInit(box); } else HM_OPEN.delete(box.dataset.hm);
}, true);
document.addEventListener('click', async e => {
  const box = e.target.closest && e.target.closest('details.hm'); if (!box) return;
  const id = box.dataset.hm, M = HM_MAPS[id], b = e.target.closest('[data-hx],[data-hadd],[data-hgo],[data-hdel],.hmhits button');
  if (!b || e.target.matches('[data-hkamu]')) return;
  if (b.dataset.hadd) { hmMode(box, M.mode === b.dataset.hadd ? null : b.dataset.hadd); return; }
  if (b.dataset.hdel) { const hm = hmOf(id); hm.items = hm.items.filter(i => i.id !== b.dataset.hdel); hmSet(id, hm); hmDraw(box); hmSummary(box); return; }
  if (b.dataset.hgo) { const it = (hmOf(id).items || []).find(i => i.id === b.dataset.hgo); if (it && M) { M.map.setView([it.lat, it.lng], Math.max(M.map.getZoom(), 16)); if (it._m) it._m.openTooltip(); } return; }
  if (b.dataset.hit != null) { const h = box._hits[+b.dataset.hit]; box.querySelector('.hmhits').innerHTML = ''; hmPin(box, L.latLng(h.lat, h.lng), true); return; }
  const x = b.dataset.hx;
  if (x === 'ara') {
    const q = box.querySelector('[data-hq]').value.trim(); if (!q) return;
    hmStatus(box, 'Adres aranıyor…'); box.querySelector('.hmhits').innerHTML = '';
    try {
      const h = await hmGeocode(q); box._hits = h;
      hmStatus(box, h.length ? '' : 'Adres bulunamadı. Haritada bina girişine tıklayın.', !h.length);
      if (h.length === 1) hmPin(box, L.latLng(h[0].lat, h[0].lng), true);
      else box.querySelector('.hmhits').innerHTML = h.map((r, i) => `<button type="button" data-hit="${i}">${esc(r.ad)}</button>`).join('');
    } catch (err) { hmStatus(box, 'Adres servisine ulaşılamadı. Haritada bina girişine tıklayın.', true); }
  } else if (x === 'bul') hmFind(box);
  else if (x === 'png') hmPng(box);
  else if (x === 'uygula') {
    const r = hmSuggest(hmOf(id)), card = box.closest('.r');
    [[1, r.s1], [2, r.s2]].forEach(([no, v]) => { const cb = card.querySelector(`[data-gq="${no}"]`); if (cb && cb.checked !== v) { cb.checked = v; cb.dispatchEvent(new Event('change', { bubbles: true })); } });
    hmStatus(box, 'Öneriler gerekliliklere aktarıldı.');
  } else if (x === 'sil') {
    if (S.gv && S.gv[id]) { delete S.gv[id].hm; save(); }
    if (M) { if (M.pin) { M.map.removeLayer(M.pin); M.pin = null; } M.map.setView([39.0, 35.0], 6); }
    box.querySelector('[data-hbis]').checked = false; hmDraw(box); hmStatus(box, 'Harita verisi temizlendi.');
    const s = box.querySelector('summary small'); if (s) s.textContent = '· isteğe bağlı: mesafeleri haritadan bul, gereklilikleri öner';
  }
});
document.addEventListener('change', e => {
  const box = e.target.closest && e.target.closest('details.hm'); if (!box) return;
  e.stopPropagation();
  const id = box.dataset.hm, hm = hmOf(id) || { items: [] };
  if (e.target.matches('[data-hkamu]')) { const it = hm.items.find(i => i.id === e.target.dataset.hkamu); if (it) { it.kamu = e.target.checked; hmSet(id, hm); hmDraw(box); } }
  else if (e.target.matches('[data-hbis]')) { hm.bis = e.target.checked; hmSet(id, hm); hmDraw(box); }
}, true);
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches && e.target.matches('[data-hq]')) { e.preventDefault(); e.target.closest('details.hm').querySelector('[data-hx="ara"]').click(); }
});
