// Rapor grafikleri: modül bazlı çubuk grafik ve doluluk radarı (PNG bayt dizisi olarak).
async function drawCharts(R, g, filled) {
  if (!filled) return null;
  const NV = '#00527A', OR = '#D74921', LT = '#BFD5E2', TX = '#333', ms = R.mods.slice(0, 5);
  const mkc = (w, h) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
    x.font = '22px Calibri,Arial,sans-serif';
    return [c, x];
  };
  const png = c => new Promise(r => c.toBlob(async b => r(new Uint8Array(await b.arrayBuffer())), 'image/png'));

  // Çubuk grafik: azami / alınan / hedef şart
  const [c1, x] = mkc(1200, 520), L = 70, T = 30, H = 380, WW = 1100;
  const mv = Math.max(1, ...ms.map(m => Math.max(m.max * m.w, m.min ? m.min[g] : 0))) * 1.1, bw = WW / ms.length;
  x.strokeStyle = '#ddd'; x.fillStyle = TX; x.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y = T + H - H * i / 4;
    x.beginPath(); x.moveTo(L, y); x.lineTo(L + WW, y); x.stroke();
    x.fillText((mv * i / 4).toFixed(0), L - 8, y + 7);
  }
  ms.forEach((m, i) => {
    const x0 = L + i * bw + bw * .15, b = bw * .23, hh = v => H * v / mv;
    [[m.max * m.w, LT], [m.wc, NV]].concat(m.min ? [[m.min[g], OR]] : []).forEach(([v, col], k) => {
      x.fillStyle = col; x.fillRect(x0 + k * b, T + H - hh(v), b - 6, hh(v));
    });
    x.fillStyle = TX; x.textAlign = 'center'; x.fillText(m.m, L + i * bw + bw / 2, T + H + 32);
  });
  [['Azami', LT], ['Alınan', NV]].concat(ms[0].min ? [['Hedef şart', OR]] : []).forEach(([t, col], k) => {
    x.fillStyle = col; x.fillRect(L + k * 200, T + H + 60, 22, 22);
    x.fillStyle = TX; x.textAlign = 'left'; x.fillText(t, L + k * 200 + 30, T + H + 78);
  });

  // Radar: modül doluluk oranı
  const [c2, y] = mkc(760, 720), cx = 380, cy = 360, r = 250, n = R.mods.length;
  const pt = (i, f) => [cx + r * f * Math.sin(2 * Math.PI * i / n), cy - r * f * Math.cos(2 * Math.PI * i / n)];
  y.strokeStyle = '#ccc';
  [.25, .5, .75, 1].forEach(f => {
    y.beginPath();
    R.mods.forEach((_, i) => { const p = pt(i, f); i ? y.lineTo(...p) : y.moveTo(...p); });
    y.closePath(); y.stroke();
  });
  R.mods.forEach((m, i) => {
    const p = pt(i, 1);
    y.beginPath(); y.moveTo(cx, cy); y.lineTo(...p); y.stroke();
    const q = pt(i, 1.13);
    y.fillStyle = TX; y.textAlign = 'center'; y.fillText(m.m, q[0], q[1] + 7);
  });
  y.beginPath();
  R.mods.forEach((m, i) => { const p = pt(i, m.max ? m.raw / m.max : 0); i ? y.lineTo(...p) : y.moveTo(...p); });
  y.closePath();
  y.fillStyle = 'rgba(0,82,122,.30)'; y.fill();
  y.strokeStyle = NV; y.lineWidth = 3; y.stroke();

  return { bar: await png(c1), radar: await png(c2) };
}
