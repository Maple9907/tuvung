/* Khung phát video "sạch" cho tab Nghe (v3.6)
   - Iframe YouTube chạy với controls:0 và KHÔNG nhận chạm (pointer-events:none) → học sinh không bấm nhầm ra ngoài app.
   - Iframe được dựng cao hơn khung nhìn (dư phía trên và dưới), khung .vb cắt phần dư → tiêu đề, avatar kênh, logo, "Video khác"
     của YouTube nằm ngoài vùng nhìn thấy (xem fit()).
   - Điều khiển riêng của app: chạm để phát/tạm dừng, thanh tua, phụ đề (bật/tắt, ngôn ngữ, cỡ chữ), tốc độ, chất lượng, phóng to.
   Cách dùng: vp=new VPlayer(khungVb,{toast}); vp.attach(ytPlayer) khi onReady; vp.state(s) khi onStateChange; vp.error(c); vp.api(). */

const RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
const QL = { highres: '4320p', hd2880: '2880p', hd2160: '2160p', hd1440: '1440p', hd1080: '1080p', hd720: '720p', large: '480p', medium: '360p', small: '240p', tiny: '144p' };
const FSZ = [[-1, 'Nhỏ'], [0, 'Vừa'], [1, 'Lớn'], [2, 'Rất lớn']];
const MODS = ['captions', 'cc'];
const TRL = { vi: 'Tiếng Việt' };   /* ngôn ngữ cho "Dịch tự động" của YouTube (translationLanguage) */

const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v } catch { return d } },
  set(k, v) { try { localStorage.setItem(k, v) } catch { } }
};
const clk = s => { s = Math.max(0, Math.floor(s || 0)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0') };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const svg = (body, fill) => `<svg viewBox="0 0 24 24" ${fill ? 'fill="currentColor"' : 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${body}</svg>`;
const IPL = svg('<path d="M8 5.2v13.6a.6.6 0 0 0 .9.5l11-6.8a.6.6 0 0 0 0-1L8.9 4.7a.6.6 0 0 0-.9.5z"/>', 1);
const IPA = svg('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>', 1);
const ICC = svg('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10.6 10.3a2.3 2.3 0 1 0 0 3.4M17 10.3a2.3 2.3 0 1 0 0 3.4"/>');
const IST = svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>');
const IFS0 = svg('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>');

/* Phần giao diện chèn vào khung .vb (nút phóng to giữ data-a="vfs" để app.js xử lý) */
const MARK = `<div class="vs" data-c="tap"><i class="vpl">${IPL}</i><i class="vsp"></i></div>
<div class="vc"><div class="vsk" tabindex="0" role="slider" aria-label="Thanh tua video" aria-valuemin="0"><i class="bf"></i><i class="pf"></i><i class="th"></i></div>
<div class="vr"><button class="vbn pp" data-c="pp" aria-label="Phát / Tạm dừng">${IPL}</button><span class="vt">0:00 / 0:00</span><span class="gr"></span>
<button class="vbn cc" data-c="cc" aria-label="Bật/tắt phụ đề" aria-pressed="false">${ICC}</button>
<button class="vbn" data-c="set" aria-label="Cài đặt">${IST}</button>
<button class="vbn vfs" data-a="vfs" aria-label="Phóng to video">${IFS0}</button></div></div>
<div class="vm" hidden></div>`;

export class VPlayer {
  constructor(vb, o = {}) {
    this.vb = vb; this.o = o; this.p = null; this.st = -2; this.vid = '';
    this.drag = false; this.dragT = 0; this.hold = 0; this.menu = false; this.mv = 'main';
    this.rate = +ls.get('vvsp', '1') || 1;
    this.q = ls.get('vvq', 'auto');
    this.cc = ls.get('vvcc', '0') == '1';
    this.lang = ls.get('vvcl', '');
    this.fsz = +ls.get('vvcf', '0') || 0;
    this.tr = TRL[ls.get('vvct', '')] ? ls.get('vvct', '') : '';   /* '' = không dịch */
    this.done = false;
    this.tracks = []; this.curLang = '';
    this.ht = this.rt = this.ct = this.qt = 0;
    vb.insertAdjacentHTML('beforeend', MARK);
    const $ = s => vb.querySelector(s);
    this.sk = $('.vsk'); this.bf = $('.vsk .bf'); this.pf = $('.vsk .pf'); this.th = $('.vsk .th');
    this.tt = $('.vt'); this.pp = $('.pp'); this.ccb = $('.vbn.cc'); this.vm = $('.vm');
    this.ratio = (() => { try { const [a, b] = getComputedStyle(vb.parentNode).getPropertyValue('--vr').split('/').map(Number); if (a > 0 && b > 0) return a / b } catch { } return 16 / 9 })();
    this.bind();
    this.ro = typeof ResizeObserver == 'function' ? new ResizeObserver(() => this.fit()) : null;
    if (this.ro) this.ro.observe(vb);
    this.iv = setInterval(() => this.tick(), 250);
    this.paintCC(); this.paintTime(0, 0);
  }

  /* ---------- Gắn với player YouTube ---------- */
  attach(p) { this.p = p; this.fit(); this.vb.classList.add('rd'); this.show(); this.paintTime() }
  destroy() { clearInterval(this.iv); clearTimeout(this.ht); clearTimeout(this.rt); clearTimeout(this.ct); clearTimeout(this.qt); if (this.ro) this.ro.disconnect(); document.removeEventListener('keydown', this.esc); this.p = null }

  /* Dựng iframe cao hơn khung nhìn: video 16:9 vẫn nằm vừa khít giữa, phần dư trên/dưới (nền đen) bị .vb cắt đi.
     Tiêu đề/avatar (bám mép trên iframe), logo và "Video khác" (bám mép dưới) vì thế bị đẩy ra ngoài vùng nhìn. */
  fit() {
    const f = this.vb.querySelector('iframe'); if (!f) return;
    const W = this.vb.clientWidth, H = this.vb.clientHeight; if (!W || !H) return;
    let vw = W, vh = W / this.ratio; if (vh > H) { vh = H; vw = H * this.ratio }
    const pad = Math.round(Math.max(96, vh * .45)), k = [W, H, pad].join('x');
    if (f._k === k) return; f._k = k;
    f.style.cssText = `left:${(W - vw) / 2}px;top:${(H - vh) / 2 - pad}px;width:${vw}px;height:${vh + 2 * pad}px`;
  }

  /* ---------- Sự kiện từ YouTube ---------- */
  state(s) {
    if (s === this.st) return; this.st = s;
    const b = this.vb.classList, on = s === 1 || s === 3;
    b.toggle('pl', on); b.toggle('bf', s === 3); b.toggle('en', s === 0);
    if (on) { b.remove('raw'); clearTimeout(this.rt) }
    if (s === 1) {
      const y = this.vb.querySelector('#ye'); if (y) { delete y.dataset.err; y.hidden = true } b.remove('err');
      const id = this.vidId(); if (id !== this.vid) { this.vid = id; this.applyPrefs() }
    }
    this.paintPP(); this.show();
  }
  error(c) {
    const y = this.vb.querySelector('#ye'); if (!y) return;
    y.dataset.err = 1; y.hidden = false; this.vb.classList.add('err');
    y.textContent = '⚠️ Video này không phát được (mã lỗi ' + c + '). Thử video khác bằng nút ‹ › bên dưới.';
  }
  api() { if (this.cc && !this.done) this.ccOn(); if (this.menu) this.paintMenu() }
  vidId() { try { return this.p.getVideoData().video_id || '' } catch { return '' } }

  /* Áp lại tuỳ chọn của người dùng cho video mới (YouTube tự đặt lại một số thứ khi đổi video) */
  applyPrefs() {
    const p = this.p; if (!p) return;
    try { p.setPlaybackRate(this.rate) } catch { }
    if (this.q !== 'auto') this.setQ(this.q, true);
    this.tracks = []; this.curLang = ''; this.done = false; clearTimeout(this.ct);
    if (this.cc) this.ccOn(); else this.mod('unloadModule');
  }

  /* ---------- Phát / tạm dừng ---------- */
  tap() {
    const p = this.p; if (!p || this.menu) return;
    try {
      if (this.st === 1 || this.st === 3) p.pauseVideo();
      else { if (this.st === 0) p.seekTo(0, true); this.play() }
    } catch { }
    this.show();
  }
  play() {
    try { this.p.playVideo() } catch { return }
    clearTimeout(this.rt);
    /* Một số trình duyệt (iPhone) chỉ cho phát khi người dùng chạm thẳng vào video: nếu 1,5 giây sau vẫn chưa phát thì mở khoá iframe để chạm vào nút phát của YouTube */
    if (this.st === -1 || this.st === 5 || this.st === -2) this.rt = setTimeout(() => {
      if (this.st === -1 || this.st === 5 || this.st === -2) { this.vb.classList.add('raw'); if (this.o.toast) this.o.toast('Chạm vào hình video để bắt đầu phát') }
    }, 1500);
  }
  paintPP() { const on = this.st === 1 || this.st === 3; this.pp.innerHTML = on ? IPA : IPL; const vpl = this.vb.querySelector('.vpl'); vpl.innerHTML = this.st === 0 ? svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>') : IPL }

  /* ---------- Hiện / ẩn thanh điều khiển ---------- */
  show() {
    const b = this.vb.classList; b.add('ui'); clearTimeout(this.ht);
    if (this.st === 1 && !this.drag && !this.menu) this.ht = setTimeout(() => b.remove('ui'), 3000);
  }

  /* ---------- Cập nhật mỗi 250ms ---------- */
  tick() {
    if (!this.vb.isConnected) return this.destroy();
    this.fit();
    const p = this.p; if (!p || !p.getCurrentTime) return;
    let s; try { s = p.getPlayerState() } catch { return }
    if (s !== this.st) this.state(s);
    if (!this.drag && Date.now() > this.hold) this.paintTime();
    try { this.bf.style.width = Math.min(100, (p.getVideoLoadedFraction() || 0) * 100) + '%' } catch { }
  }
  paintTime(t, d) {
    if (t == null) { try { t = this.p.getCurrentTime(); d = this.p.getDuration() } catch { return } }
    d = d > 0 ? d : 0; t = t || 0;
    const f = d ? Math.min(1, t / d) : 0;
    this.pf.style.width = f * 100 + '%'; this.th.style.left = f * 100 + '%';
    this.tt.textContent = clk(t) + ' / ' + clk(d) + (this.rate !== 1 ? ' · ' + this.rate + '×' : '');
    this.sk.setAttribute('aria-valuenow', Math.round(t)); this.sk.setAttribute('aria-valuemax', Math.round(d));
    this.sk.setAttribute('aria-valuetext', clk(t) + ' trên ' + clk(d));
  }
  dur() { try { return this.p.getDuration() || 0 } catch { return 0 } }

  /* ---------- Phụ đề ---------- */
  mod(fn) { MODS.forEach(m => { try { this.p[fn](m) } catch { } }) }
  opt(k) { for (const m of MODS) { try { const v = this.p.getOption(m, k); if (Array.isArray(v) ? v.length : v != null) return v } catch { } } return null }
  setOpt(k, v) { MODS.forEach(m => { try { this.p.setOption(m, k, v) } catch { } }) }
  ccOn(n = 0) {
    if (!this.p || !this.cc) return;
    clearTimeout(this.ct); this.mod('loadModule');
    let tl = this.opt('tracklist'); tl = Array.isArray(tl) ? tl : [];
    if (!tl.length && n < 3) { this.ct = setTimeout(() => this.ccOn(n + 1), 400); return }   /* danh sách phụ đề đến muộn: chờ một chút */
    /* YouTube thường KHÔNG liệt kê phụ đề tự tạo trong tracklist. Khi rỗng thì cứ thử bật tiếng Anh (tự tạo) – vẫn chạy được. */
    this.tracks = tl;
    const t = tl.find(x => x.languageCode === this.lang) || tl.find(x => /^en/i.test(x.languageCode)) || tl[0];
    this.curLang = t ? t.languageCode : 'en';
    this.applyTrack(); this.done = true; this.paintMenu();
  }
  /* Chọn track + (nếu có) dịch tự động sang ngôn ngữ khác */
  applyTrack() {
    const o = { languageCode: this.curLang };
    if (this.tr && !this.curLang.toLowerCase().startsWith(this.tr)) o.translationLanguage = { languageCode: this.tr, languageName: TRL[this.tr] };
    this.setOpt('track', o); this.setOpt('fontSize', this.fsz);
  }
  ccOff() { clearTimeout(this.ct); this.mod('unloadModule'); this.curLang = '' }
  setCC(on) {
    this.cc = on; ls.set('vvcc', on ? '1' : '0'); this.done = false;
    if (on) this.ccOn(); else this.ccOff();
    this.paintCC(); this.paintMenu();
  }
  paintCC() { this.ccb.classList.toggle('on', this.cc); this.ccb.setAttribute('aria-pressed', this.cc) }

  /* ---------- Tốc độ & chất lượng ---------- */
  rates() { let r = []; try { r = this.p.getAvailablePlaybackRates() || [] } catch { } return r.length ? r : RATES }
  setRate(r) {
    this.rate = r; ls.set('vvsp', r);
    try { this.p.setPlaybackRate(r) } catch { }
    this.paintTime(); this.paintMenu();
  }
  levels() { let l = []; try { l = this.p.getAvailableQualityLevels() || [] } catch { } return l.filter(x => QL[x]) }
  curQ() { try { return this.p.getPlaybackQuality() } catch { return '' } }
  setQ(q, silent) {
    this.q = q; ls.set('vvq', q);
    try { this.p.setPlaybackQuality(q === 'auto' ? 'default' : q) } catch { }
    clearTimeout(this.qt);
    /* YouTube coi hàm này là "gợi ý" và có thể bỏ qua → kiểm tra lại sau vài giây và báo thật cho người dùng */
    if (!silent && q !== 'auto') this.qt = setTimeout(() => {
      const c = this.curQ();
      if (c && c !== q && (this.st === 1 || this.st === 3) && this.o.toast) this.o.toast('YouTube đang phát ' + (QL[c] || c) + ', chưa đổi được sang ' + QL[q], 3500);
      this.paintMenu();
    }, 3000);
    this.paintMenu();
  }

  /* ---------- Bảng cài đặt (nằm trong khung .vb để vẫn thấy khi phóng to) ----------
     Dạng danh sách vào từng mục như YouTube (main → rate | q | cc | fsz) để vừa khung video nhỏ trên điện thoại. */
  setMenu(on) {
    this.menu = on; this.mv = 'main'; this.vb.classList.toggle('mo', on); this.vm.hidden = !on;
    if (on) { this.paintMenu(); clearTimeout(this.ht) } else this.show();
  }
  paintMenu() {
    if (!this.menu) return;
    const chip = (c, v, label, on) => `<button class="mchip${on ? ' on' : ''}" data-c="${c}" data-v="${esc(v)}">${esc(label)}</button>`;
    const cur = this.curQ(), mv = this.mv || 'main';
    const trackName = () => { const t = this.tracks.find(x => x.languageCode === this.curLang); return (t ? (t.displayName || t.languageName || t.languageCode) : this.curLang === 'en' ? 'Tiếng Anh' : 'Bật') + (this.tr ? ' → ' + TRL[this.tr] : '') };
    const TT = { rate: 'Tốc độ phát', q: 'Chất lượng video', cc: 'Phụ đề', fsz: 'Cỡ chữ phụ đề' };
    let body = '';
    if (mv === 'main') {
      const row = (k, val) => `<button class="mrow" data-c="mv" data-v="${k}"><span>${TT[k]}</span><span>${esc(val)} ›</span></button>`;
      body = row('rate', this.rate == 1 ? 'Chuẩn (1×)' : this.rate + '×')
        + row('q', this.q === 'auto' ? 'Tự động' + (QL[cur] ? ' (' + QL[cur] + ')' : '') : (QL[this.q] || this.q))
        + row('cc', this.cc ? trackName() : 'Tắt')
        + row('fsz', (FSZ.find(x => x[0] === this.fsz) || FSZ[1])[1]);
    } else if (mv === 'rate') {
      body = '<div class="mc">' + this.rates().map(r => chip('rate', r, r == 1 ? '1× Chuẩn' : r + '×', Math.abs(r - this.rate) < .001)).join('') + '</div>';
    } else if (mv === 'q') {
      const lv = this.levels();
      body = '<div class="mc">' + chip('q', 'auto', 'Tự động' + (this.q === 'auto' && QL[cur] ? ' (' + QL[cur] + ')' : ''), this.q === 'auto')
        + lv.map(x => chip('q', x, QL[x], this.q === x)).join('') + '</div>'
        + (lv.length ? '' : '<div class="mn">Các mức chất lượng hiện sau khi video bắt đầu phát.</div>');
    } else if (mv === 'cc') {
      const list = this.tracks.length ? this.tracks : [{ languageCode: 'en', displayName: 'Tiếng Anh' }];
      body = '<div class="mt">Ngôn ngữ phụ đề</div><div class="mc">' + chip('ccoff', '', 'Tắt', !this.cc)
        + list.map(t => chip('track', t.languageCode, t.displayName || t.languageName || t.languageCode, this.cc && this.curLang === t.languageCode)).join('') + '</div>'
        + '<div class="mt">Dịch tự động sang</div><div class="mc">' + chip('tr', '', 'Không dịch', !this.tr)
        + Object.entries(TRL).map(([k, n]) => chip('tr', k, n, this.tr === k)).join('') + '</div>'
        + (this.cc && !this.tracks.length ? '<div class="mn">Đang thử bật phụ đề tiếng Anh (tự tạo). Nếu không thấy chữ, video này có thể không có phụ đề.</div>' : '');
    } else if (mv === 'fsz') {
      body = '<div class="mc">' + FSZ.map(([v, l]) => chip('fsz', v, l, this.fsz === v)).join('') + '</div>';
    }
    this.vm.innerHTML = `<div class="mh">${mv === 'main' ? '<b>⚙ Cài đặt video</b>' : `<button class="mb" data-c="mb">‹ ${TT[mv]}</button>`}<button class="vbn" data-c="mx" aria-label="Đóng cài đặt">✕</button></div><div class="mi">${body}</div>`;
  }

  /* ---------- Gắn sự kiện ---------- */
  bind() {
    const vb = this.vb, sk = this.sk;
    vb.addEventListener('click', e => {
      const t = e.target.closest('[data-c]'); if (!t || !vb.contains(t)) return;
      const c = t.dataset.c, v = t.dataset.v;
      if (c === 'tap' || c === 'pp') this.tap();
      else if (c === 'cc') { this.setCC(!this.cc); this.show() }
      else if (c === 'set') this.setMenu(!this.menu);
      else if (c === 'mx') this.setMenu(false);
      else if (c === 'mv') { this.mv = v; this.paintMenu() }
      else if (c === 'mb') { this.mv = 'main'; this.paintMenu() }
      else if (c === 'rate') { this.mv = 'main'; this.setRate(+v) }
      else if (c === 'q') { this.mv = 'main'; this.setQ(v) }
      else if (c === 'ccoff') this.setCC(false)
      else if (c === 'track') { this.lang = v; ls.set('vvcl', v); this.cc = true; ls.set('vvcc', '1'); this.done = false; this.ccOn(); this.paintCC(); this.paintMenu() }
      else if (c === 'tr') { this.tr = v; ls.set('vvct', v); this.cc = true; ls.set('vvcc', '1'); this.done = false; this.ccOn(); this.paintCC(); this.paintMenu() }
      else if (c === 'fsz') { this.mv = 'main'; this.fsz = +v; ls.set('vvcf', v); this.setOpt('fontSize', this.fsz); this.paintMenu() }
    });
    /* Thanh tua: kéo hoặc chạm. Khi video đang phóng to bằng CSS và bị xoay 90° (iPhone dọc) thì trục kéo là dọc. */
    const frac = e => {
      const r = sk.getBoundingClientRect(), rot = vb.classList.contains('fs') && matchMedia('(orientation:portrait)').matches;
      const f = rot ? (e.clientY - r.top) / r.height : (e.clientX - r.left) / r.width;
      return Math.min(1, Math.max(0, f || 0));
    };
    const move = f => { const d = this.dur(); this.dragT = f * d; this.paintTime(this.dragT, d) };
    sk.addEventListener('pointerdown', e => {
      if (!this.p) return; e.preventDefault();
      try { sk.setPointerCapture(e.pointerId) } catch { }
      this.drag = true; clearTimeout(this.ht); move(frac(e));
    });
    sk.addEventListener('pointermove', e => { if (this.drag) move(frac(e)) });
    const end = () => {
      if (!this.drag) return; this.drag = false;
      try { this.p.seekTo(this.dragT, true) } catch { }
      this.hold = Date.now() + 700; this.show();
    };
    sk.addEventListener('pointerup', end); sk.addEventListener('pointercancel', end);
    sk.addEventListener('keydown', e => {
      const k = { ArrowLeft: -5, ArrowRight: 5 }[e.key]; if (!k || !this.p) return; e.preventDefault();
      try { this.p.seekTo(Math.max(0, this.p.getCurrentTime() + k), true) } catch { }
      this.hold = Date.now() + 500; this.show();
    });
    document.addEventListener('keydown', this.esc = e => { if (e.key === 'Escape' && this.menu) this.setMenu(false) });
  }
}
