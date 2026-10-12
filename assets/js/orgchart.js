// Organizasyon şeması (ORG_CRITS'teki kriterler, ör. BBT 01 K1).
// Tek yerleşim hesabı (orgLayout) hem sitedeki SVG önizlemesini hem rapordaki PNG'yi çizer.
// Görünüm şablona göre: arkada gri gölge kutu, önde açık kutu, köşeli bağlantı çizgileri.

const ORG = { BW: 168, BH: 60, GX: 26, GY: 54, SH: 12, PAD: 16 }; // kutu, aralıklar, gölge kaydırma, kenar boşluğu

// Boş şema için şablon (gönderilen örnekteki gibi 3 seviye)
const ORG_TEMPLATE = [
  { id: 'r', t: '……', p: null },
  { id: 'a', t: '…', p: 'r' }, { id: 'b', t: '…', p: 'r' },
  { id: 'a1', t: '…', p: 'a' }, { id: 'a2', t: '…', p: 'a' }, { id: 'b1', t: '…', p: 'b' }
];

const orgNodes = (p, id) => ((p.org || {})[id] || []);

// Ağaç yerleşimi: yapraklar soldan sağa dizilir, üst birim alt birimlerinin ortasına gelir
function orgLayout(nodes) {
  const root = nodes.find(n => !n.p);
  if (!root) return null;
  const kids = {};
  nodes.forEach(n => { if (n.p) (kids[n.p] = kids[n.p] || []).push(n); });
  const { BW, BH, GX, GY, SH, PAD } = ORG, pos = {};
  let nextX = 0, maxD = 0;
  (function place(n, d) {
    maxD = Math.max(maxD, d);
    const ch = kids[n.id] || [];
    if (!ch.length) { pos[n.id] = { x: nextX, d }; nextX += BW + GX; }
    else { ch.forEach(c => place(c, d + 1)); pos[n.id] = { x: (pos[ch[0].id].x + pos[ch[ch.length - 1].id].x) / 2, d }; }
  })(root, 0);
  const boxes = Object.keys(pos).map(id => {
    const n = nodes.find(z => z.id === id), p = pos[id];
    return { n, x: PAD + p.x, y: PAD + p.d * (BH + GY) };
  });
  const links = boxes.filter(b => b.n.p && pos[b.n.p]).map(b => ({ from: boxes.find(z => z.n.id === b.n.p), to: b }));
  return { boxes, links, w: PAD * 2 + nextX - GX + SH, h: PAD * 2 + maxD * (BH + GY) + BH + SH };
}

// Kutu metni: görev en fazla 2 satır, ad soyad 1 satır
function orgLines(n) {
  const wrap = (s, max) => {
    const words = String(s || '').trim().split(/\s+/).filter(Boolean), out = [];
    let cur = '';
    words.forEach(w => { if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) out.push(cur);
    if (out.length > 2) { out.length = 2; out[1] = out[1].slice(0, max - 1) + '…'; }
    return out;
  };
  const t = wrap(n.t || '…', 20), a = (n.a || '').trim();
  return { t: t.length ? t : ['…'], a: a.length > 24 ? a.slice(0, 23) + '…' : a };
}

// Bağlantı: üst kutunun alt ortasından aşağı, yatay, alt kutunun üst ortasına
function orgLinkPath(L) {
  const { BW, BH, SH } = ORG;
  const x1 = L.from.x + SH + BW / 2, y1 = L.from.y + SH + BH, x2 = L.to.x + SH + BW / 2, y2 = L.to.y + SH, my = (y1 + y2) / 2;
  return [[x1, y1], [x1, my], [x2, my], [x2, y2]];
}

function orgSVG(nodes) {
  const Lo = orgLayout(nodes);
  if (!Lo) return '';
  const { BW, BH, SH } = ORG, e = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Lo.w} ${Lo.h}" width="${Lo.w}" style="max-width:100%;height:auto" font-family="Calibri, Segoe UI, Arial, sans-serif">`;
  Lo.links.forEach(L => { s += `<polyline points="${orgLinkPath(L).map(p => p.join(',')).join(' ')}" fill="none" stroke="#a6a6a6" stroke-width="1.2"/>`; });
  Lo.boxes.forEach(b => {
    const { t, a } = orgLines(b.n), cx = b.x + SH + BW / 2;
    const lines = t.length + (a ? 1 : 0), y0 = b.y + SH + BH / 2 - (lines - 1) * 8 + 4;
    s += `<rect x="${b.x}" y="${b.y}" width="${BW}" height="${BH}" rx="9" fill="#d0d0d0" stroke="#b8b8b8"/>`;
    s += `<rect x="${b.x + SH}" y="${b.y + SH}" width="${BW}" height="${BH}" rx="9" fill="#fafafa" stroke="#b8b8b8"/>`;
    t.forEach((ln, i) => { s += `<text x="${cx}" y="${y0 + i * 16}" text-anchor="middle" font-size="13" font-weight="600" fill="#10243e">${e(ln)}</text>`; });
    if (a) s += `<text x="${cx}" y="${y0 + t.length * 16}" text-anchor="middle" font-size="12" fill="#5b6b82">${e(a)}</text>`;
  });
  return s + '</svg>';
}

// Rapor için PNG (2x çözünürlük)
async function orgPNG(nodes) {
  const Lo = orgLayout(nodes);
  if (!Lo) return null;
  const k = 2, { BW, BH, SH } = ORG, c = document.createElement('canvas');
  c.width = Math.ceil(Lo.w * k); c.height = Math.ceil(Lo.h * k);
  const x = c.getContext('2d');
  x.scale(k, k); x.fillStyle = '#fff'; x.fillRect(0, 0, Lo.w, Lo.h);
  const rr = (X, Y, W, H, r) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); };
  x.strokeStyle = '#a6a6a6'; x.lineWidth = 1.2;
  Lo.links.forEach(L => { const p = orgLinkPath(L); x.beginPath(); x.moveTo(...p[0]); p.slice(1).forEach(q => x.lineTo(...q)); x.stroke(); });
  Lo.boxes.forEach(b => {
    x.lineWidth = 1; x.strokeStyle = '#b8b8b8';
    rr(b.x, b.y, BW, BH, 9); x.fillStyle = '#d0d0d0'; x.fill(); x.stroke();
    rr(b.x + SH, b.y + SH, BW, BH, 9); x.fillStyle = '#fafafa'; x.fill(); x.stroke();
    const { t, a } = orgLines(b.n), cx = b.x + SH + BW / 2, lines = t.length + (a ? 1 : 0), y0 = b.y + SH + BH / 2 - (lines - 1) * 8 + 4;
    x.textAlign = 'center';
    x.font = '600 13px Calibri, Segoe UI, Arial, sans-serif'; x.fillStyle = '#10243e';
    t.forEach((ln, i) => x.fillText(ln, cx, y0 + i * 16));
    if (a) { x.font = '12px Calibri, Segoe UI, Arial, sans-serif'; x.fillStyle = '#5b6b82'; x.fillText(a, cx, y0 + t.length * 16); }
  });
  const blob = await new Promise(r => c.toBlob(r, 'image/png'));
  return { data: new Uint8Array(await blob.arrayBuffer()), w: Lo.w, h: Lo.h };
}

// ---- Düzenleyici (kriter satırında)
const orgId = () => 'o' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
function orgEnsure(id) { S.org = S.org || {}; return (S.org[id] = S.org[id] || []); }

function orgEditor(id) {
  const nodes = orgNodes(S, id), root = nodes.find(n => !n.p);
  const kids = p => nodes.filter(n => n.p === p);
  const rowsHtml = [];
  (function walk(n, d) {
    rowsHtml.push(`<div class="orow" style="padding-left:${d * 22}px">
      <span class="obr">${d ? '└' : '■'}</span>
      <input type="text" data-on="${n.id}" data-ok="t" placeholder="${d ? 'Alt birim / görev' : 'En üst birim / görev (ör. Proje Yöneticisi)'}" value="${esc(n.t || '')}">
      <input type="text" data-on="${n.id}" data-ok="a" placeholder="Ad soyad (isteğe bağlı)" value="${esc(n.a || '')}">
      <button type="button" class="ladd" data-oadd="${n.id}" title="Bu birimin altına birim ekle">+ Alt birim</button>
      <button type="button" class="lx" data-odel="${n.id}" title="Birimi altındakilerle birlikte sil">✕</button></div>`);
    kids(n.id).forEach(c => walk(c, d + 1));
  })(root || { id: null }, 0);
  const gorevler = ((S.t || {})[id] || []).map(r => (r.gorev || '').trim()).filter(Boolean);
  const startBtns = root ? '' : `<div class="ctl"><button type="button" class="ladd" data-oadd="">+ En üst birimi ekle</button>${gorevler.length ? `<button type="button" class="ladd" data-ofrom="1">Görev listesinden oluştur (${gorevler.length})</button>` : ''}</div>`;
  return `<div class="ctt">Organizasyon şeması</div>
    ${root ? rowsHtml.join('') : ''}${startBtns}
    <div class="oprev">${root ? orgSVG(nodes) : '<div class="note">Henüz birim eklenmedi. Raporda boş şablon şema yer alır.</div>'}</div>`;
}
const orgRedraw = (box, id) => { box.innerHTML = orgEditor(id); };

document.addEventListener('input', e => {
  const t = e.target, nid = t.dataset && t.dataset.on;
  if (!nid) return;
  const box = t.closest('[data-orgc]'), id = box.dataset.orgc, n = orgEnsure(id).find(z => z.id === nid);
  if (!n) return;
  n[t.dataset.ok] = t.value;
  save();
  box.querySelector('.oprev').innerHTML = orgSVG(orgNodes(S, id)); // yalnızca önizleme (odak kaybolmasın)
});
document.addEventListener('click', e => {
  const t = e.target, box = t.closest && t.closest('[data-orgc]');
  if (!box) return;
  const id = box.dataset.orgc, nodes = orgEnsure(id);
  if (t.dataset.oadd !== undefined) {
    const n = { id: orgId(), t: '', a: '', p: t.dataset.oadd || null };
    if (!n.p && nodes.some(z => !z.p)) return; // tek kök
    nodes.push(n); save(); orgRedraw(box, id);
    const inp = box.querySelector(`[data-on="${n.id}"][data-ok="t"]`); if (inp) inp.focus();
  } else if (t.dataset.odel) {
    const gone = new Set([t.dataset.odel]);
    let grew = true;
    while (grew) { grew = false; nodes.forEach(z => { if (z.p && gone.has(z.p) && !gone.has(z.id)) { gone.add(z.id); grew = true; } }); }
    S.org[id] = nodes.filter(z => !gone.has(z.id)); save(); orgRedraw(box, id);
  } else if (t.dataset.ofrom) {
    // Görev tablosundan: görev → kutu başlığı, uzman adı soyadı → kutudaki ad
    const g = ((S.t || {})[id] || []).filter(r => (r.gorev || '').trim()).map(r => ({ t: r.gorev.trim(), a: (r.uzman || '').trim() }));
    if (!g.length) return;
    const rootN = { id: orgId(), t: g[0].t, a: g[0].a, p: null };
    S.org[id] = [rootN, ...g.slice(1).map(x => ({ id: orgId(), t: x.t, a: x.a, p: rootN.id }))];
    save(); orgRedraw(box, id);
  }
});
