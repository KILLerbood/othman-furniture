// عثمان للأثاث: قصة الكنبة من الخشب للراحة
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// ===== بيانات المعرض (غيّرها ببياناتك) =====
const CONFIG = {
  whatsapp: '201010425775',            // رقم الواتساب بالصيغة الدولية من غير +
  phone: '0101 042 5775',
  address: 'شارع الفردوس، ٦ أكتوبر، الجيزة',
  mapUrl: 'https://www.google.com/maps/place/%D8%B9%D8%AB%D9%85%D8%A7%D9%86+%D9%84%D9%84%D8%A7%D8%AB%D8%A7%D8%AB/@29.9457042,31.045735,17z/data=!3m1!4b1!4m6!3m5!1s0x1458517e600b8e03:0xf068b9b7d176f2f0!8m2!3d29.9457043!4d31.0506059!16s%2Fg%2F11tfs_lphv',
  hours: 'كل يوم من ١١ الصبح لـ ١١ بالليل، ما عدا الجمعة',
};

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
// شريط العنوان في الآيفون والسامسونج بيظهر ويختفي: منعيدش حساب الأنيميشن كل مرة
ScrollTrigger.config({ ignoreMobileResize: true });

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const IS_MOBILE = window.matchMedia('(max-width: 900px)').matches || /Mobi|Android/i.test(navigator.userAgent);
const FINE_POINTER = window.matchMedia('(pointer: fine)').matches;
// أجهزة ضعيفة: نفس المشاهد بس بجودة أخف من الأول
const LOW_END = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
const MAX_DPR = Math.min(window.devicePixelRatio || 1, IS_MOBILE ? (LOW_END ? 1.25 : 1.75) : 2);
const MIN_DPR = Math.min(MAX_DPR, IS_MOBILE ? 0.85 : 1);

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const toAr = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ===== البيانات =====
const WOODS = {
  beech:    { name: 'زان',     full: 'خشب الزان',     base: '#d6ae86', dark: '#a87652', light: '#ecd0b0', style: 'fine' },
  mahogany: { name: 'ماهوجني', full: 'خشب الماهوجني', base: '#7a3a20', dark: '#4e200d', light: '#a05634', style: 'ribbon' },
  oak:      { name: 'أرو',     full: 'خشب الأرو',     base: '#c39860', dark: '#80592e', light: '#e2c28f', style: 'oak' },
  pine:     { name: 'سويد',    full: 'خشب السويد',    base: '#e8d2a0', dark: '#c0945a', light: '#f5e7c6', style: 'knots' },
};
const FABRICS = {
  velvet:   { name: 'قطيفة',      rough: 0.78, sheen: 1,   sheenRough: 0.32, clearcoat: 0,   ccRough: 0,   bump: 0.4, repeat: 3 },
  linen:    { name: 'كتان',       rough: 0.95, sheen: 0.25, sheenRough: 0.8, clearcoat: 0,   ccRough: 0,   bump: 1.6, repeat: 4 },
  leather:  { name: 'جلد طبيعي',  rough: 0.5,  sheen: 0,   sheenRough: 0,    clearcoat: 0.35, ccRough: 0.45, bump: 1.2, repeat: 2 },
  faux:     { name: 'جلد صناعي',  rough: 0.32, sheen: 0,   sheenRough: 0,    clearcoat: 0.8, ccRough: 0.2, bump: 0.3, repeat: 3 },
  chenille: { name: 'شانيل',      rough: 1,    sheen: 0.7, sheenRough: 0.55, clearcoat: 0,   ccRough: 0,   bump: 2.2, repeat: 4 },
};
const COLORS = [
  { key: 'sand',     name: 'بيج رملي',    hex: '#cdb08c' },
  { key: 'charcoal', name: 'رمادي فحمي',  hex: '#4a4a4c' },
  { key: 'olive',    name: 'أخضر زيتوني', hex: '#6b6b3a' },
  { key: 'navy',     name: 'أزرق نيلي',   hex: '#2c3e5c' },
  { key: 'terra',    name: 'تيراكوتا',    hex: '#a8512f' },
  { key: 'cream',    name: 'كريمي',       hex: '#e6dccb' },
  { key: 'caramel',  name: 'بني كراميل',  hex: '#8a5a33' },
  { key: 'rose',     name: 'وردي باهت',   hex: '#c49a94' },
];
const DENSITY = { 30: 'كثافة ٣٠ (طرية)', 35: 'كثافة ٣٥ (متوازنة)', 40: 'كثافة ٤٠ (متماسكة)' };
const STEP_NAMES = ['القاعدة', 'الرجول', 'تركيب الهيكل', 'المساند', 'التثبيت والتقوية'];

const choice = { wood: 'beech', density: '35', material: 'chenille', color: 'sand' };

// ===== اللودر =====
const preBar = document.getElementById('preloaderBar');
const prePct = document.getElementById('preloaderPct');
document.body.classList.add('is-loading');
function setProgress(p) { preBar.style.width = `${p}%`; prePct.textContent = toAr(Math.round(p)); }
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

// ===== تكسشرات بالكود =====
function woodCanvas(wd, W = 1024, H = 256, seed = 7) {
  const r = rng(seed); const rand = (a, b) => a + (b - a) * r();
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = wd.base; g.fillRect(0, 0, W, H);
  if (wd.style === 'ribbon') {
    for (let x = 0; x < W; x += rand(18, 60)) { g.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,220,190'},${rand(0.03, 0.09)})`; g.fillRect(x, 0, rand(8, 40), H); }
  }
  const n = wd.style === 'fine' ? 80 : wd.style === 'oak' ? 50 : 60;
  for (let i = 0; i < n; i++) {
    const y0 = rand(-10, H + 10), a = rand(2, 9), f = rand(0.002, 0.009), p = rand(0, 6.28);
    g.strokeStyle = r() < 0.6 ? wd.dark : wd.light;
    g.globalAlpha = rand(0.12, 0.45) * (wd.style === 'oak' ? 1.4 : 1);
    g.lineWidth = rand(0.5, wd.style === 'oak' ? 3.2 : 1.8);
    g.beginPath();
    for (let x = 0; x <= W; x += 8) {
      const y = y0 + Math.sin(x * f + p) * a + Math.sin(x * f * 3.3 + p * 2) * a * 0.3;
      x === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  if (wd.style === 'oak') {
    g.fillStyle = wd.light;
    for (let i = 0; i < 260; i++) { g.globalAlpha = rand(0.12, 0.3); g.fillRect(rand(0, W), rand(0, H), rand(4, 16), 1.4); }
  }
  if (wd.style === 'knots') {
    for (let k = 0; k < 3; k++) {
      const cx = rand(80, W - 80), cy = rand(40, H - 40);
      for (let ring = 22; ring > 2; ring -= 3) {
        g.globalAlpha = 0.22; g.strokeStyle = wd.dark; g.lineWidth = 1.5;
        g.beginPath(); g.ellipse(cx, cy, ring * 2.4, ring, 0, 0, Math.PI * 2); g.stroke();
      }
      g.globalAlpha = 0.7; g.fillStyle = '#7a5530'; g.beginPath(); g.ellipse(cx, cy, 8, 4, 0, 0, Math.PI * 2); g.fill();
    }
  }
  g.fillStyle = '#000';
  for (let i = 0; i < 3000; i++) { g.globalAlpha = rand(0.03, 0.08); g.fillRect(rand(0, W), rand(0, H), rand(1, 3), 1); }
  g.globalAlpha = 1;
  return c;
}

function barkCanvas() {
  const r = rng(11); const rand = (a, b) => a + (b - a) * r();
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#4b3322'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 140; i++) {
    const x0 = rand(0, 512), a = rand(2, 8), f = rand(0.01, 0.04), p = rand(0, 6);
    g.strokeStyle = r() < 0.65 ? '#22150c' : '#7a5a40'; g.globalAlpha = rand(0.3, 0.8); g.lineWidth = rand(1, 5);
    g.beginPath();
    for (let y = 0; y <= 512; y += 8) { const x = x0 + Math.sin(y * f + p) * a; y === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.stroke();
  }
  g.globalAlpha = 1;
  return c;
}

function ringsCanvas() {
  const r = rng(5); const rand = (a, b) => a + (b - a) * r();
  const c = document.createElement('canvas'); c.width = 512; c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#d9b98e'; g.fillRect(0, 0, 512, 512);
  for (let rad = 6; rad < 236; rad += rand(5, 11)) {
    g.strokeStyle = '#9c7048'; g.globalAlpha = rand(0.25, 0.6); g.lineWidth = rand(1, 2.5);
    g.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.1; a += 0.1) {
      const rr = rad + Math.sin(a * 3 + rad) * rad * 0.03;
      const x = 256 + Math.cos(a) * rr, y = 256 + Math.sin(a) * rr;
      a === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    }
    g.stroke();
  }
  g.globalAlpha = 1;
  g.strokeStyle = '#3a2416'; g.lineWidth = 34; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#6a4528'; g.beginPath(); g.arc(256, 256, 6, 0, Math.PI * 2); g.fill();
  // شروخ تجفيف
  g.strokeStyle = '#5a3a22'; g.lineWidth = 2; g.globalAlpha = 0.6;
  for (let i = 0; i < 4; i++) { const a = rand(0, 6.28); g.beginPath(); g.moveTo(256, 256); g.lineTo(256 + Math.cos(a) * rand(60, 140), 256 + Math.sin(a) * rand(60, 140)); g.stroke(); }
  g.globalAlpha = 1;
  return c;
}

// نويز قابل للتكرار
function makeNoise(G, seed) {
  const r = rng(seed); const grid = new Float32Array(G * G).map(() => r());
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = smooth(x - xi), yf = smooth(y - yi);
    const at = (i, j) => grid[((j % G + G) % G) * G + ((i % G + G) % G)];
    return lerp(lerp(at(xi, yi), at(xi + 1, yi), xf), lerp(at(xi, yi + 1), at(xi + 1, yi + 1), xf), yf);
  };
}

function fabricCanvas(kind, S = 256) {
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const g = c.getContext('2d'); const img = g.createImageData(S, S); const d = img.data;
  const r = rng(kind.length * 13);
  const n8 = makeNoise(8, 3), n16 = makeNoise(16, 9), n32 = makeNoise(32, 21);
  const rows = Array.from({ length: S }, () => r()), cols = Array.from({ length: S }, () => r());
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const u = x / S, v = y / S; let val;
    if (kind === 'velvet') val = 232 + 18 * n32(u * 32, v * 32) + 6 * (r() - 0.5);
    else if (kind === 'linen') {
      const weave = ((x >> 1) + (y >> 1)) & 1 ? rows[y] : cols[x];
      val = 200 + 45 * weave + 10 * n8(u * 8, v * 8);
    } else if (kind === 'leather') {
      const n = n16(u * 16, v * 16) * 0.6 + n32(u * 32, v * 32) * 0.4;
      const ridge = 1 - Math.abs(n * 2 - 1);
      val = 245 - 45 * Math.pow(ridge, 6) - 8 * n8(u * 8, v * 8);
    } else if (kind === 'faux') val = 238 + 12 * n8(u * 8, v * 8) + 4 * (r() - 0.5);
    else {
      const loops = Math.sin(x * 0.7 + 3 * n16(u * 16, v * 16)) * Math.sin(y * 0.7 + 3 * n16(v * 16, u * 16));
      val = 205 + 40 * (0.5 + 0.5 * loops) + 10 * n32(u * 32, v * 32);
    }
    const i = (y * S + x) * 4; d[i] = d[i + 1] = d[i + 2] = clamp(val, 0, 255); d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

// نورمال ماب من صورة الارتفاع: بيدّي القماش نسيج حقيقي بيمسك الضوء
function normalCanvas(src, strength = 2) {
  const S = src.width; const sd = src.getContext('2d').getImageData(0, 0, S, S).data;
  const c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'); const img = g.createImageData(S, S); const d = img.data;
  const h = (x, y) => sd[(((y + S) % S) * S + ((x + S) % S)) * 4] / 255;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = (h(x - 1, y) - h(x + 1, y)) * strength, dy = (h(x, y - 1) - h(x, y + 1)) * strength;
    const l = Math.hypot(dx, dy, 1); const i = (y * S + x) * 4;
    d[i] = (dx / l * 0.5 + 0.5) * 255; d[i + 1] = (dy / l * 0.5 + 0.5) * 255; d[i + 2] = (1 / l * 0.5 + 0.5) * 255; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

// مخدة منفوخة بدل صندوق: الوش بيطلع لبرّه والحروف بتتشد زي القماش المحشي، وظل خفيف في الكسرات
function pillowGeo(w, h, d, { rad = 0.05, puff = 0.3, axis = 'y', wrinkle = 0.004, seg = 6, seed = 1 } = {}) {
  const geo = new RoundedBoxGeometry(w, h, d, seg, rad);
  const p = geo.attributes.position; const n = makeNoise(16, seed);
  const half = { x: w / 2, y: h / 2, z: d / 2 };
  const [a, b] = axis === 'y' ? ['x', 'z'] : axis === 'z' ? ['x', 'y'] : ['y', 'z'];
  const col = new Float32Array(p.count * 3); const v = {};
  for (let i = 0; i < p.count; i++) {
    v.x = p.getX(i); v.y = p.getY(i); v.z = p.getZ(i);
    const na = v[a] / half[a], nb = v[b] / half[b], nt = v[axis] / half[axis];
    const fall = (1 - na * na) * (1 - nb * nb);
    v[axis] += nt * half[axis] * puff * fall;
    // تجاعيد خفيفة في القماش
    const wr = (n(na * 3 + 5, nb * 3 + 5) - 0.5) * wrinkle * (1 - fall * 0.6);
    v[axis] += Math.sign(nt) * wr; v[a] *= 1 + wr * 0.5;
    p.setXYZ(i, v.x, v.y, v.z);
    // AO: الحروف والجنب اللي تحت أغمق شوية
    const edge = Math.max(Math.abs(na), Math.abs(nb));
    const ao = (0.8 + 0.2 * (1 - Math.pow(edge, 6))) * (axis === 'y' ? 0.86 + 0.14 * clamp(nt * 0.5 + 0.5) : 1);
    col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = ao;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  return geo;
}

// خياطة (بايبنج) حوالين حرف المخدة
function pipingGeo(w, d, y, rad, r = 0.007) {
  const pts = []; const cw = w / 2 - rad * 0.3, cd = d / 2 - rad * 0.3, cr = Math.min(rad * 1.2, cw, cd);
  for (const [sx, sz, a0] of [[1, 1, 0], [-1, 1, Math.PI / 2], [-1, -1, Math.PI], [1, -1, Math.PI * 1.5]]) {
    for (let k = 0; k <= 4; k++) {
      const a = a0 + (k / 4) * (Math.PI / 2);
      pts.push(new THREE.Vector3(sx * (cw - cr) + Math.cos(a) * cr, y, sz * (cd - cr) + Math.sin(a) * cr));
    }
  }
  const geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), IS_MOBILE ? 64 : 120, r, 6, true);
  const col = new Float32Array(geo.attributes.position.count * 3).fill(0.78);
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

// ظل ناعم تحت الكنبة (Contact shadow) بيخليها قاعدة على الأرض بجد
function contactShadowCanvas() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 64, 4, 128, 64, 124);
  grd.addColorStop(0, 'rgba(0,0,0,.75)'); grd.addColorStop(0.45, 'rgba(0,0,0,.4)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.setTransform(1, 0, 0, 0.5, 0, 32); g.fillStyle = grd; g.fillRect(0, -64, 256, 384);
  return c;
}

function tintedSwatch(srcCanvas, hex) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.drawImage(srcCanvas, 0, 0, 256, 256);
  g.globalCompositeOperation = 'multiply'; g.fillStyle = hex; g.fillRect(0, 0, 256, 256);
  return c.toDataURL('image/jpeg', 0.85);
}

function plaqueCanvas() {
  const W = 2048, H = 760;
  const base = woodCanvas({ base: '#4d301c', dark: '#2a180c', light: '#6e4a2e', style: 'fine' }, W, H, 31);
  const g = base.getContext('2d');
  g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle';
  // إطار محفور
  g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 8; g.strokeRect(46, 46, W - 92, H - 92);
  g.strokeStyle = 'rgba(226,196,143,.55)'; g.lineWidth = 3; g.strokeRect(58, 58, W - 116, H - 116);
  const title = 'عثمان للأثاث';
  g.font = '700 300px "Aref Ruqaa", "Cairo", serif';
  g.fillStyle = 'rgba(0,0,0,.6)'; g.fillText(title, W / 2 + 6, H / 2 - 30 + 8);
  const grad = g.createLinearGradient(0, H * 0.2, 0, H * 0.7);
  grad.addColorStop(0, '#f4dca6'); grad.addColorStop(0.5, '#c9a36a'); grad.addColorStop(1, '#8e6a3a');
  g.fillStyle = grad; g.fillText(title, W / 2, H / 2 - 30);
  g.font = '600 64px "Cairo", sans-serif';
  g.fillStyle = 'rgba(244,235,223,.85)'; g.fillText('صناعة مصرية بإيدين أسطوات', W / 2, H - 150);
  return base;
}

function parquetCanvas(wd) {
  const W = 1024, H = 1024; const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d'); const plank = woodCanvas(wd, 1024, 256, 77);
  const r = rng(4);
  for (let row = 0; row < 8; row++) {
    const off = r() * 1024;
    g.save(); g.filter = `brightness(${0.85 + r() * 0.25})`;
    g.drawImage(plank, off, 0, 1024 - off, 256, 0, row * 128, (1024 - off), 128);
    g.drawImage(plank, 0, 0, off, 256, 1024 - off, row * 128, off, 128);
    g.restore();
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, row * 128, W, 2);
    g.fillRect((off * 0.7) % W, row * 128, 2, 128);
  }
  return c;
}

function rugCanvas() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 704;
  const g = c.getContext('2d');
  g.fillStyle = '#d8c7ad'; g.fillRect(0, 0, 1024, 704);
  g.strokeStyle = '#8a5a3a'; g.lineWidth = 18; g.strokeRect(40, 40, 944, 624);
  g.strokeStyle = '#b0603a'; g.lineWidth = 4; g.strokeRect(74, 74, 876, 556);
  g.strokeStyle = 'rgba(138,90,58,.35)'; g.lineWidth = 3;
  for (let x = 140; x < 900; x += 92) for (let y = 140; y < 600; y += 92) {
    g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x + 30, y); g.lineTo(x, y + 30); g.lineTo(x - 30, y); g.closePath(); g.stroke();
  }
  return c;
}

function dotCanvas() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'); const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,240,210,1)'); grd.addColorStop(0.4, 'rgba(255,220,170,.5)'); grd.addColorStop(1, 'rgba(255,220,170,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64); return c;
}

// ===== الـ UI بتاع الاختيارات =====
function buildSwatches() {
  const wrap = document.getElementById('swatches');
  wrap.innerHTML = COLORS.map((c) => `<button class="swatch" role="radio" aria-checked="false" data-color="${c.key}"><i style="--c:${c.hex}"></i>${c.name}</button>`).join('');
}

function updateSummary() {
  const color = COLORS.find((c) => c.key === choice.color);
  const map = { wood: WOODS[choice.wood].full, density: DENSITY[choice.density], material: FABRICS[choice.material].name, color: color.name };
  document.querySelectorAll('[data-sum]').forEach((el) => { el.textContent = map[el.dataset.sum]; });
  document.querySelectorAll('[data-wood]').forEach((el) => el.setAttribute('aria-checked', el.dataset.wood === choice.wood));
  document.querySelectorAll('[data-density]').forEach((el) => el.setAttribute('aria-checked', el.dataset.density === choice.density));
  document.querySelectorAll('.chip[data-material]').forEach((el) => el.setAttribute('aria-checked', el.dataset.material === choice.material));
  document.querySelectorAll('.mat-card[data-material]').forEach((el) => el.classList.toggle('is-picked', el.dataset.material === choice.material));
  document.querySelectorAll('.mat-pick').forEach((el) => { el.textContent = el.dataset.material === choice.material ? 'اخترتها ✓' : 'اختار الخامة دي'; });
  document.querySelectorAll('[data-color]').forEach((el) => el.setAttribute('aria-checked', el.dataset.color === choice.color));
  document.getElementById('waBtn').href = waLink(`أهلاً عثمان للأثاث، عايز أستفسر عن كنبة: ${map.wood}، ${map.material}، لون ${map.color}، ${map.density}.`);
}
const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

// ===== المشهد =====
const canvas = document.getElementById('scene');
let renderer, scene, camera, clock;
const S = {}; // الحالة الحالية
const T = {}; // الحالة المستهدفة
const parts = { frame: [], springs: [], foam: [], cover: [], planks: [], logs: [] };
let woodMat, fabricMat, accentMat, sofa, saw, plaque, dust, room, roomMats = [], shadowCatcher, lampLight;
const woodTex = {}; const fabricTex = {}; const fabricNrm = {};
let seatCushions = [], pressAnim = { v: 0 }, contactShadow, keyLight, home = null;
let userRot = 0, userVel = 0, lastDrag = -10;
// جودة ذكية: لو الفريمات قلّت بنقلل الدقة شوية شوية، ولو الجهاز مرتاح بنرجّعها
const quality = { dpr: MAX_DPR, frames: 0, elapsed: 0, cooldown: 0 };
function adaptQuality(dt) {
  quality.frames++; quality.elapsed += dt;
  if (quality.cooldown > 0) { quality.cooldown -= dt; return; }
  if (quality.elapsed < 1.5) return;
  const fps = quality.frames / quality.elapsed;
  quality.frames = 0; quality.elapsed = 0;
  let next = quality.dpr;
  if (fps < 40) next = Math.max(MIN_DPR, quality.dpr - 0.25);
  else if (fps > 57) next = Math.min(MAX_DPR, quality.dpr + 0.125);
  if (fps < 28 && quality.dpr <= MIN_DPR && renderer.shadowMap.enabled) {
    renderer.shadowMap.enabled = false; scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  }
  if (next !== quality.dpr) { quality.dpr = next; renderer.setPixelRatio(next); renderer.setSize(window.innerWidth, viewH, false); quality.cooldown = 1; }
}
// طول الكانفاس = 100lvh، فمش بيتغير لما شريط العنوان يظهر ويختفي
const canvasH = () => canvas.clientHeight || window.innerHeight;
let viewH = canvasH();
const intro = { p: REDUCED ? 1 : 0 };

function makeTex(cnv, repeat = 1, srgb = true) {
  const t = new THREE.CanvasTexture(cnv);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat);
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return t;
}

async function initScene() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !IS_MOBILE, alpha: true, powerPreference: 'high-performance' });
  // الآيفون ممكن يوقف الـ WebGL لو الذاكرة اتملت: نرجّعه بإعادة تحميل هادية
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); }, false);
  canvas.addEventListener('webglcontextrestored', () => location.reload(), false);
  renderer.setPixelRatio(quality.dpr);
  renderer.setSize(window.innerWidth, viewH, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.shadowMap.enabled = true;
  // PCF مع radius = ظل حروفه ناعمة زي الحقيقة
  renderer.shadowMap.type = THREE.PCFShadowMap;

  scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  pmrem.dispose();

  camera = new THREE.PerspectiveCamera(38, window.innerWidth / viewH, 0.05, 60);
  clock = new THREE.Clock();

  // إضاءة دافية
  scene.add(new THREE.HemisphereLight(0xffe7c7, 0x2a1a10, 0.45));
  const key = keyLight = new THREE.DirectionalLight(0xffe2b8, 1.9);
  key.position.set(-3, 5, 4); key.castShadow = true;
  const shadowRes = LOW_END ? 512 : IS_MOBILE ? 1024 : 2048;
  key.shadow.mapSize.set(shadowRes, shadowRes);
  Object.assign(key.shadow.camera, { left: -2.6, right: 2.6, top: 2.6, bottom: -2.6, near: 0.5, far: 15 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.radius = LOW_END ? 2 : IS_MOBILE ? 4 : 6;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xc9a36a, 1.2); rim.position.set(3, 2.5, -4); scene.add(rim);
  // إضاءة مالية خفيفة من قدّام علشان القماش يبان تفاصيله من غير ما يتحرق
  const fill = new THREE.DirectionalLight(0xfff1dc, 0.45); fill.position.set(2.5, 1.6, 4); scene.add(fill);

  setProgress(15); await nextFrame();

  // تكسشرات الخشب
  for (const k of Object.keys(WOODS)) {
    woodTex[k] = makeTex(woodCanvas(WOODS[k], 1024, 256, 7));
    document.querySelector(`[data-swatch="${k}"]`).style.backgroundImage = `url(${woodTex[k].image.toDataURL('image/jpeg', 0.8)})`;
  }
  woodMat = new THREE.MeshStandardMaterial({ map: woodTex[choice.wood], color: 0xe8dccb, roughness: 0.7, metalness: 0 });
  setProgress(35); await nextFrame();

  // تكسشرات القماش
  for (const k of Object.keys(FABRICS)) {
    const cnv = fabricCanvas(k, IS_MOBILE ? 256 : 512);
    fabricTex[k] = makeTex(cnv, FABRICS[k].repeat);
    fabricNrm[k] = makeTex(normalCanvas(cnv, k === 'leather' ? 3 : 2), FABRICS[k].repeat, false);
    const hint = { velvet: '#6b2f3a', linen: '#cdb99a', leather: '#7a4a2a', faux: '#2f2f33', chenille: '#8c8a7a' }[k];
    document.querySelector(`[data-tex="${k}"]`).style.backgroundImage = `url(${tintedSwatch(cnv, hint)})`;
  }
  fabricMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true });
  accentMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.9, sheen: 0.6, sheenRoughness: 0.5, vertexColors: true });
  applyFabric();
  setProgress(55); await nextFrame();

  sofa = new THREE.Group(); scene.add(sofa);
  buildLogs(); buildPlanks(); buildFrame(); buildSprings(); buildFoam(); buildCover();
  setProgress(70); await nextFrame();
  buildPlaque(); buildRoom(); buildDust();

  shadowCatcher = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.35 }));
  shadowCatcher.rotation.x = -Math.PI / 2; shadowCatcher.receiveShadow = true; scene.add(shadowCatcher);

  setProgress(85); await nextFrame();
  renderer.compile(scene, camera);
}

function addMesh(geo, mat, parent = sofa) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}

function buildLogs() {
  const bark = new THREE.MeshStandardMaterial({ map: makeTex(barkCanvas(), 1), roughness: 0.95 });
  bark.map.repeat.set(2, 1);
  const rings = new THREE.MeshStandardMaterial({ map: makeTex(ringsCanvas(), 1), roughness: 0.8 });
  const spots = [[0, 0.24, -0.27, 0.24], [0, 0.24, 0.27, 0.24], [0.06, 0.62, 0, 0.22]];
  spots.forEach(([x, y, z, rad], i) => {
    const m = addMesh(new THREE.CylinderGeometry(rad, rad * 1.06, 2.1, 32, 1), [bark, rings, rings], scene);
    m.rotation.z = Math.PI / 2; m.rotation.x = i * 0.7;
    m.userData = { base: new THREE.Vector3(x, y, z), i };
    parts.logs.push(m);
  });
  // المنشار الدايري
  const sawMat = new THREE.MeshStandardMaterial({ color: 0xcfd3d6, metalness: 1, roughness: 0.25 });
  const shape = new THREE.Shape(); const teeth = 40, R = 0.5;
  for (let i = 0; i <= teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2, rr = i % 2 ? R : R * 0.92;
    i === 0 ? shape.moveTo(Math.cos(a) * rr, Math.sin(a) * rr) : shape.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.06, 0, Math.PI * 2, true); shape.holes.push(hole);
  saw = addMesh(new THREE.ExtrudeGeometry(shape, { depth: 0.01, bevelEnabled: false }), sawMat, scene);
  saw.visible = false;
}

function buildPlanks() {
  const geo = new THREE.BoxGeometry(1.9, 0.045, 0.2);
  const stickGeo = new THREE.BoxGeometry(0.04, 0.025, 0.5);
  let i = 0;
  for (let layer = 0; layer < 4; layer++) {
    for (let col = -1; col <= 1; col += 2) {
      const m = addMesh(geo, woodMat, scene);
      m.userData = { base: new THREE.Vector3(0, 0.05 + layer * 0.075, col * 0.115), i: i++ };
      parts.planks.push(m);
    }
    if (layer < 3) for (const x of [-0.75, 0, 0.75]) {
      const s = addMesh(stickGeo, woodMat, scene);
      s.userData = { base: new THREE.Vector3(x, 0.05 + layer * 0.075 + 0.035, 0), i: i++, stick: true };
      parts.planks.push(s);
    }
  }
}

function buildFrame() {
  // [geometry args, target pos, step]
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const leg = new THREE.CylinderGeometry(0.035, 0.022, 0.18, 16);
  const defs = [
    [box(2.2, 0.14, 0.05), [0, 0.25, 0.42], 0], [box(2.2, 0.14, 0.05), [0, 0.25, -0.42], 0],
    [box(0.05, 0.14, 0.79), [-1.075, 0.25, 0], 0], [box(0.05, 0.14, 0.79), [1.075, 0.25, 0], 0],
    [box(0.05, 0.05, 0.79), [-0.55, 0.22, 0], 0], [box(0.05, 0.05, 0.79), [0, 0.22, 0], 0], [box(0.05, 0.05, 0.79), [0.55, 0.22, 0], 0],
    [leg, [-1.0, 0.09, 0.37], 1, true], [leg, [1.0, 0.09, 0.37], 1, true], [leg, [-1.0, 0.09, -0.37], 1, true], [leg, [1.0, 0.09, -0.37], 1, true],
    [box(0.05, 0.55, 0.05), [-1.075, 0.595, -0.42], 2], [box(0.05, 0.55, 0.05), [1.075, 0.595, -0.42], 2],
    [box(0.05, 0.5, 0.05), [-0.36, 0.57, -0.42], 2], [box(0.05, 0.5, 0.05), [0.36, 0.57, -0.42], 2],
    [box(2.2, 0.07, 0.05), [0, 0.855, -0.42], 2],
    [box(0.05, 0.36, 0.05), [-1.075, 0.5, 0.42], 3], [box(0.05, 0.36, 0.05), [1.075, 0.5, 0.42], 3],
    [box(0.05, 0.05, 0.89), [-1.075, 0.68, 0], 3], [box(0.05, 0.05, 0.89), [1.075, 0.68, 0], 3],
    [box(0.05, 0.05, 0.89), [-1.075, 0.45, 0], 3], [box(0.05, 0.05, 0.89), [1.075, 0.45, 0], 3],
  ];
  // زوايا التقوية
  for (const x of [-1, 1]) for (const z of [-1, 1]) defs.push([box(0.09, 0.09, 0.09), [x * 1.0, 0.25, z * 0.35], 4]);
  defs.push([box(0.04, 0.04, 0.62), [-0.72, 0.6, -0.42], 4, false, [Math.PI / 2, 0, 0.6]]);
  defs.push([box(0.04, 0.04, 0.62), [0.72, 0.6, -0.42], 4, false, [Math.PI / 2, 0, -0.6]]);

  const r = rng(99); const rand = (a, b) => a + (b - a) * r();
  const counts = [0, 0, 0, 0, 0]; defs.forEach((d) => counts[d[2]]++);
  const idx = [0, 0, 0, 0, 0];
  defs.forEach(([geo, pos, step, isLeg, rot]) => {
    const m = addMesh(geo, woodMat);
    const j = idx[step]++;
    m.userData = {
      target: new THREE.Vector3(...pos), targetRot: new THREE.Euler(...(rot || [0, 0, 0])),
      start: new THREE.Vector3(rand(-1.6, 1.6), rand(1.4, 2.4), rand(-1.2, 1.4)),
      startRot: new THREE.Euler(rand(-2, 2), rand(-2, 2), rand(-2, 2)),
      step, j, n: counts[step], isLeg: !!isLeg,
    };
    m.visible = false;
    parts.frame.push(m);
  });
}

function buildSprings() {
  const mat = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 1, roughness: 0.35 });
  [-0.85, -0.51, -0.17, 0.17, 0.51, 0.85].forEach((x, i) => {
    const pts = []; const segs = 14;
    for (let s = 0; s <= segs; s++) pts.push(new THREE.Vector3((s % 2 ? 0.05 : -0.05), 0, -0.4 + (0.8 * s) / segs));
    const path = new THREE.CurvePath();
    for (let s = 0; s < segs; s++) path.add(new THREE.LineCurve3(pts[s], pts[s + 1]));
    const m = addMesh(new THREE.TubeGeometry(path, segs * 6, 0.008, 6, false), mat);
    m.userData = { target: new THREE.Vector3(x, 0.33, 0), i };
    m.visible = false;
    parts.springs.push(m);
  });
}

function buildFoam() {
  const pores = fabricCanvas('chenille', 128);
  const mat = new THREE.MeshStandardMaterial({ color: 0xf0d987, roughness: 1, bumpMap: makeTex(pores, 6, false), bumpScale: 1.5 });
  [
    [[2.05, 0.14, 0.8], [0, 0.4, 0.02]],
    [[2.05, 0.5, 0.1], [0, 0.62, -0.365]],
    [[0.1, 0.36, 0.86], [-1.075, 0.52, 0]],
    [[0.1, 0.36, 0.86], [1.075, 0.52, 0]],
  ].forEach(([size, pos], i) => {
    const m = addMesh(new RoundedBoxGeometry(...size, 2, 0.02), mat);
    m.userData = { target: new THREE.Vector3(...pos), i };
    m.visible = false;
    parts.foam.push(m);
  });
}

function buildCover() {
  const seg = IS_MOBILE ? 5 : 7;
  const P = (w, h, d, o) => pillowGeo(w, h, d, { seg, ...o });
  const seatW = 0.655, seatD = 0.68, seatH = 0.17;
  // [geometry, pos, mat, rot, kind]
  const defs = [
    [P(2.0, 0.26, 0.9, { rad: 0.035, puff: 0.04, seed: 2 }), [0, 0.32, 0], fabricMat],
    [P(2.0, 0.62, 0.22, { rad: 0.08, puff: 0.12, axis: 'z', seed: 3 }), [0, 0.5, -0.36], fabricMat],
    [P(0.22, 0.56, 0.94, { rad: 0.09, puff: 0.1, axis: 'x', seed: 4 }), [-1.11, 0.46, 0], fabricMat],
    [P(0.22, 0.56, 0.94, { rad: 0.09, puff: 0.1, axis: 'x', seed: 5 }), [1.11, 0.46, 0], fabricMat],
    [P(seatW, seatH, seatD, { rad: 0.05, puff: 0.32, wrinkle: 0.006, seed: 6 }), [-0.665, 0.535, 0.1], fabricMat, null, 'seat'],
    [P(seatW, seatH, seatD, { rad: 0.05, puff: 0.32, wrinkle: 0.006, seed: 7 }), [0, 0.535, 0.1], fabricMat, null, 'seat'],
    [P(seatW, seatH, seatD, { rad: 0.05, puff: 0.32, wrinkle: 0.006, seed: 8 }), [0.665, 0.535, 0.1], fabricMat, null, 'seat'],
    [P(0.64, 0.46, 0.15, { rad: 0.06, puff: 1.05, axis: 'z', wrinkle: 0.01, seed: 9 }), [-0.66, 0.83, -0.2], fabricMat, [-0.18, 0, 0], 'back'],
    [P(0.64, 0.46, 0.15, { rad: 0.06, puff: 1.05, axis: 'z', wrinkle: 0.01, seed: 10 }), [0, 0.83, -0.2], fabricMat, [-0.18, 0, 0], 'back'],
    [P(0.64, 0.46, 0.15, { rad: 0.06, puff: 1.05, axis: 'z', wrinkle: 0.01, seed: 11 }), [0.66, 0.83, -0.2], fabricMat, [-0.18, 0, 0], 'back'],
    [P(0.4, 0.4, 0.05, { rad: 0.02, puff: 3.4, axis: 'z', wrinkle: 0.014, seed: 12 }), [-0.76, 0.79, 0.0], accentMat, [-0.3, 0.15, 0.18], 'throw'],
    [P(0.4, 0.4, 0.05, { rad: 0.02, puff: 3.4, axis: 'z', wrinkle: 0.014, seed: 13 }), [0.76, 0.79, 0.0], accentMat, [-0.3, -0.15, -0.18], 'throw'],
  ];
  // خياطة حوالين المخدات اللي بنقعد عليها
  const pipeTop = pipingGeo(seatW, seatD, seatH / 2 - 0.012, 0.05);
  const pipeBot = pipingGeo(seatW, seatD, -seatH / 2 + 0.012, 0.05);
  seatCushions = [];
  defs.forEach(([geo, pos, mat, rot, kind], i) => {
    const m = addMesh(geo, mat);
    m.position.set(...pos); if (rot) m.rotation.set(...rot);
    m.userData = { target: new THREE.Vector3(...pos), i, n: defs.length, kind };
    if (kind === 'seat') {
      [pipeTop, pipeBot].forEach((g) => { const t = new THREE.Mesh(g, fabricMat); t.castShadow = false; m.add(t); });
      seatCushions.push(m);
    }
    m.visible = false;
    parts.cover.push(m);
  });
  // ظل ناعم تحت الكنبة
  contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.5), new THREE.MeshBasicMaterial({ map: makeTex(contactShadowCanvas(), 1), transparent: true, depthWrite: false, opacity: 0 }));
  contactShadow.material.map.wrapS = contactShadow.material.map.wrapT = THREE.ClampToEdgeWrapping;
  contactShadow.rotation.x = -Math.PI / 2; contactShadow.position.y = 0.006; contactShadow.renderOrder = 1;
  sofa.add(contactShadow);
  // كعوب نحاس تحت الرجول
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a36a, metalness: 1, roughness: 0.28 });
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    const cap = addMesh(new THREE.CylinderGeometry(0.024, 0.022, 0.035, 20), brass);
    cap.position.set(x * 1.0, 0.0175, z * 0.37); cap.visible = false;
    cap.userData = { target: cap.position.clone(), i: 0, n: defs.length, kind: 'cap' };
    parts.cover.push(cap);
  }
}

function buildPlaque() {
  const face = new THREE.MeshStandardMaterial({ map: makeTex(plaqueCanvas(), 1), roughness: 0.55, metalness: 0.05 });
  face.map.wrapS = face.map.wrapT = THREE.ClampToEdgeWrapping;
  const side = new THREE.MeshStandardMaterial({ map: makeTex(woodCanvas({ base: '#3e2616', dark: '#24140a', light: '#5e3e24', style: 'fine' }, 512, 128, 3), 1), roughness: 0.6 });
  plaque = addMesh(new RoundedBoxGeometry(2.7, 1.0, 0.1, 3, 0.02), [side, side, side, side, face, side], scene);
  // RoundedBox بيستخدم مجموعات زي BoxGeometry
  plaque.castShadow = false;
  plaque.position.set(0, 1.1, 0);
}

function buildRoom() {
  room = new THREE.Group(); scene.add(room);
  const mk = (opts) => { const m = new THREE.MeshStandardMaterial({ transparent: true, ...opts }); roomMats.push(m); return m; };
  const floor = addMesh(new THREE.PlaneGeometry(34, 14), mk({ map: makeTex(parquetCanvas(WOODS.oak), 4), roughness: 0.55 }), room);
  floor.material.map.repeat.set(9.7, 4); floor.position.x = 7;
  floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  const wall = addMesh(new THREE.PlaneGeometry(34, 6), mk({ color: 0xcdb79c, roughness: 0.95 }), room);
  wall.position.set(7, 3, -1.6); wall.castShadow = false;
  // حيطة شرايح خشب ورا الكنبة
  const slatMat = mk({ map: makeTex(woodCanvas({ base: '#5a3a22', dark: '#311c0e', light: '#7a5434', style: 'fine' }, 512, 128, 8), 1), roughness: 0.6 });
  for (let i = 0; i < 26; i++) {
    const s = addMesh(new THREE.BoxGeometry(0.06, 2.6, 0.04), slatMat, room);
    s.position.set(-1.5 + i * 0.12, 1.3, -1.57); s.castShadow = false;
  }
  const rug = addMesh(new THREE.PlaneGeometry(3.4, 2.34), mk({ map: makeTex(rugCanvas(), 1), roughness: 1 }), room);
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.004, 0.55); rug.castShadow = false;
  // أباجورة
  const metal = mk({ color: 0x2b2018, metalness: 0.8, roughness: 0.35 });
  const base = addMesh(new THREE.CylinderGeometry(0.16, 0.18, 0.03, 24), metal, room); base.position.set(1.75, 0.015, -0.9);
  const pole = addMesh(new THREE.CylinderGeometry(0.012, 0.012, 1.45, 8), metal, room); pole.position.set(1.75, 0.74, -0.9);
  const shade = addMesh(new THREE.CylinderGeometry(0.14, 0.24, 0.3, 32, 1, true), mk({ color: 0xf3e3c3, emissive: 0xffc98a, emissiveIntensity: 0.6, side: THREE.DoubleSide, roughness: 1 }), room);
  shade.position.set(1.75, 1.5, -0.9);
  [base, pole, shade].forEach((m) => { m.castShadow = false; });
  lampLight = new THREE.PointLight(0xffb870, 0, 4, 1.5); lampLight.position.set(1.75, 1.45, -0.9); room.add(lampLight);
  // ترابيزة جنب
  const tableWood = mk({ map: woodTex.mahogany, roughness: 0.5 });
  const top = addMesh(new THREE.CylinderGeometry(0.26, 0.26, 0.035, 32), tableWood, room); top.position.set(-1.75, 0.5, -0.2);
  const stem = addMesh(new THREE.CylinderGeometry(0.03, 0.05, 0.48, 12), tableWood, room); stem.position.set(-1.75, 0.25, -0.2);
  const vase = addMesh(new THREE.SphereGeometry(0.08, 24, 16), mk({ color: 0xb0603a, roughness: 0.4 }), room);
  vase.scale.set(1, 1.5, 1); vase.position.set(-1.75, 0.63, -0.2);
  room.visible = false;
}

// ===== البيت كله: ستاير، دولاب، سرير، ديكور (في نفس المعرض، يمين الكنبة) =====
const HOME_X = { curtains: 3.4, wardrobe: 6.8, bed: 10.6, decor: 14.2 };
function buildHome() {
  const g = new THREE.Group(); room.add(g);
  const r = rng(321); const rand = (a, b) => a + (b - a) * r();
  const add = (geo, mat, x, y, z, parent = g) => { const m = addMesh(geo, mat, parent); m.position.set(x, y, z); return m; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const brass = new THREE.MeshStandardMaterial({ color: 0xc9a36a, metalness: 1, roughness: 0.3 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf3eee6, roughness: 0.5 });
  const H = { curtain: {}, ward: { carcass: [], inside: [], doors: [] }, bed: { frame: [], slats: [], head: [], mattress: null, duvet: null, pillows: [], blanket: null }, decor: [] };

  // ----- الستاير -----
  const cx = HOME_X.curtains;
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.9), new THREE.MeshBasicMaterial({ color: 0xfff0d2 }));
  sky.position.set(cx, 1.55, -1.585); g.add(sky);
  const frameBars = [[1.6, 0.06, cx, 2.52], [1.6, 0.06, cx, 0.58], [0.06, 2.0, cx - 0.78, 1.55], [0.06, 2.0, cx + 0.78, 1.55], [0.04, 1.9, cx, 1.55], [1.5, 0.04, cx, 1.75]];
  frameBars.forEach(([w, h, x, y]) => { const m = add(box(w, h, 0.05), white, x, y, -1.57); m.castShadow = false; });
  const rod = add(new THREE.CylinderGeometry(0.014, 0.014, 2.7, 12), brass, cx, 2.74, -1.42); rod.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.035, 16, 12), brass, cx + s * 1.37, 2.74, -1.42);
  const drapeTex = fabricNrm.velvet.clone(); drapeTex.repeat.set(2, 3); drapeTex.needsUpdate = true;
  const drape = new THREE.MeshPhysicalMaterial({ color: 0x6b4a36, roughness: 0.82, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xd2ad80), normalMap: drapeTex, side: THREE.DoubleSide });
  const sheer = new THREE.MeshStandardMaterial({ color: 0xfffaf0, transparent: true, opacity: 0.5, roughness: 1, side: THREE.DoubleSide, depthWrite: false });
  const panel = (mat, segX) => {
    const geo = new THREE.PlaneGeometry(1, 1, segX, 10); geo.userData.base = geo.attributes.position.array.slice();
    const m = new THREE.Mesh(geo, mat); m.castShadow = mat !== sheer; m.receiveShadow = true; m.visible = false; g.add(m); return m;
  };
  H.curtain = { L: panel(drape, IS_MOBILE ? 48 : 72), R: panel(drape, IS_MOBILE ? 48 : 72), S: panel(sheer, 40), rod, last: -1 };

  // ----- الدولاب -----
  const wx = HOME_X.wardrobe, W = 1.8, WH = 2.3, D = 0.56, wz = -1.58 + D / 2;
  const lacquer = new THREE.MeshPhysicalMaterial({ color: 0xe8dfd0, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3 });
  const inner = new THREE.MeshStandardMaterial({ map: woodTex.oak, roughness: 0.6 });
  const carcass = [
    [box(0.03, WH, D), [-W / 2 + 0.015, WH / 2, 0], lacquer], [box(0.03, WH, D), [W / 2 - 0.015, WH / 2, 0], lacquer],
    [box(W, 0.03, D), [0, WH - 0.015, 0], lacquer], [box(W, 0.03, D), [0, 0.1, 0], lacquer], [box(W - 0.04, 0.085, D - 0.05), [0, 0.0425, 0.02], lacquer],
    [box(W, WH, 0.012), [0, WH / 2, -D / 2 + 0.006], new THREE.MeshStandardMaterial({ color: 0xcfc3b0, roughness: 0.6 })], [box(0.03, WH - 0.12, D - 0.02), [0.1, WH / 2 + 0.05, 0], lacquer],
  ];
  carcass.forEach(([geo, pos, mat], j) => {
    const m = add(geo, mat, 0, 0, 0); m.visible = false;
    m.userData = { target: new THREE.Vector3(wx + pos[0], pos[1], wz + pos[2]), start: new THREE.Vector3(wx + rand(-1.5, 1.5), rand(2.6, 3.4), wz + rand(0.4, 1.4)), rot: new THREE.Euler(rand(-1.5, 1.5), rand(-1.5, 1.5), rand(-1.5, 1.5)), j };
    H.ward.carcass.push(m);
  });
  const insideDefs = [];
  for (let s = 0; s < 4; s++) insideDefs.push([box(0.77, 0.025, D - 0.06), [0.5, 0.55 + s * 0.42, 0], inner]);
  insideDefs.push([new THREE.CylinderGeometry(0.012, 0.012, 0.95, 10), [-0.42, 1.95, 0.02], brass, [0, 0, Math.PI / 2]]);
  for (const y of [0.24, 0.48]) insideDefs.push([box(0.95, 0.21, D - 0.06), [-0.42, y + 0.02, 0.01], lacquer]);
  const clothes = ['#3a4a5c', '#b9a58a', '#7a3a2a', '#e9e3d8', '#4a4a4c', '#6b6b3a', '#c49a94'];
  clothes.forEach((c, i) => insideDefs.push([box(0.035, rand(0.75, 1.05), 0.38), [-0.82 + i * 0.12, 1.42, 0.02], new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }), [0, 0, rand(-0.04, 0.04)]]));
  for (let s = 1; s < 4; s++) for (let k = 0; k < 3; k++) insideDefs.push([box(0.2, 0.09 + rand(0, 0.05), 0.3), [0.25 + k * 0.24, 0.6 + s * 0.42 - 0.42 + 0.06, 0], new THREE.MeshStandardMaterial({ color: clothes[(s * 3 + k) % clothes.length], roughness: 0.95 })]);
  insideDefs.forEach(([geo, pos, mat, rot], j) => {
    const m = add(geo, mat, wx + pos[0], pos[1], wz + pos[2]); if (rot) m.rotation.set(...rot);
    m.visible = false; m.userData = { j, n: insideDefs.length }; H.ward.inside.push(m);
  });
  for (const side of [-1, 1]) {
    const pivot = new THREE.Group(); pivot.position.set(wx + side * W / 2, 0, wz + D / 2 + 0.012); g.add(pivot);
    const door = addMesh(box(W / 2 - 0.006, WH - 0.04, 0.022), lacquer, pivot); door.position.set(-side * (W / 4), WH / 2 + 0.02, 0);
    const handle = addMesh(box(0.016, 0.42, 0.02), brass, door); handle.position.set(-side * (W / 4 - 0.07), 0.05, 0.022);
    pivot.visible = false; pivot.userData = { side }; H.ward.doors.push(pivot);
  }

  // ----- السرير -----
  const bx = HOME_X.bed, bz = -1.5 + 1.08;
  const mattressMat = new THREE.MeshPhysicalMaterial({ color: 0xf6f2ea, roughness: 0.9, sheen: 0.4, sheenColor: new THREE.Color(0xffffff), normalMap: fabricNrm.chenille, vertexColors: true });
  const duvetMat = new THREE.MeshPhysicalMaterial({ color: 0xece4d6, roughness: 0.95, sheen: 0.6, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xffffff), normalMap: fabricNrm.linen, vertexColors: true });
  const base = add(pillowGeo(1.82, 0.26, 2.12, { rad: 0.04, puff: 0.05, seed: 30 }), fabricMat, bx, 0.25, bz);
  H.bed.frame.push(base);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) H.bed.frame.push(add(new THREE.CylinderGeometry(0.03, 0.022, 0.12, 12), woodMat, bx + sx * 0.82, 0.06, bz + sz * 0.98));
  for (const s of [-1, 1]) {
    const ns = add(box(0.5, 0.5, 0.42), lacquer, bx + s * 1.22, 0.3, -1.33);
    const line = addMesh(box(0.46, 0.006, 0.01), brass, ns); line.position.set(0, 0.04, 0.215);
    const knob = addMesh(new THREE.SphereGeometry(0.018, 12, 8), brass, ns); knob.position.set(0, 0.14, 0.225);
    const lampBase = addMesh(new THREE.CylinderGeometry(0.05, 0.07, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xb0603a, roughness: 0.35 }), ns); lampBase.position.set(0, 0.35, -0.05);
    const shade = addMesh(new THREE.CylinderGeometry(0.09, 0.13, 0.16, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0xf3e3c3, emissive: 0xffc98a, emissiveIntensity: 0.5, side: THREE.DoubleSide }), ns); shade.position.set(0, 0.52, -0.05);
    H.bed.frame.push(ns);
  }
  H.bed.frame.forEach((m) => { m.userData.target = m.position.clone(); m.visible = false; });
  for (let i = 0; i < 9; i++) {
    const s = add(box(1.62, 0.02, 0.09), woodMat, bx, 0.39, bz - 0.9 + i * 0.225); s.visible = false;
    s.userData = { target: s.position.clone(), i }; H.bed.slats.push(s);
  }
  for (let i = 0; i < 7; i++) {
    const c = add(pillowGeo(0.25, 1.1, 0.12, { rad: 0.05, puff: 0.7, axis: 'z', seed: 40 + i }), fabricMat, bx - 0.78 + i * 0.26, 0.98, -1.5); c.visible = false;
    c.userData = { target: c.position.clone(), i }; H.bed.head.push(c);
  }
  H.bed.mattress = add(pillowGeo(1.64, 0.24, 2.0, { rad: 0.05, puff: 0.12, seed: 50 }), mattressMat, bx, 0.52, bz + 0.02);
  H.bed.duvet = add(pillowGeo(1.76, 0.07, 1.48, { rad: 0.03, puff: 0.9, wrinkle: 0.02, seed: 51 }), duvetMat, bx, 0.675, bz + 0.29);
  for (let i = 0; i < 2; i++) {
    const p = add(pillowGeo(0.68, 0.16, 0.42, { rad: 0.04, puff: 1.1, wrinkle: 0.014, seed: 60 + i }), duvetMat, bx + (i ? 0.38 : -0.38), 0.78, -1.28);
    p.rotation.x = -0.6; H.bed.pillows.push(p);
  }
  const accent = add(pillowGeo(0.5, 0.14, 0.3, { rad: 0.04, puff: 1.2, wrinkle: 0.012, seed: 62 }), accentMat, bx, 0.79, -1.08); accent.rotation.x = -0.45; H.bed.pillows.push(accent);
  H.bed.blanket = add(pillowGeo(1.8, 0.05, 0.42, { rad: 0.02, puff: 0.6, wrinkle: 0.01, seed: 63 }), accentMat, bx, 0.72, bz + 0.78);
  [H.bed.mattress, H.bed.duvet, H.bed.blanket, ...H.bed.pillows].forEach((m) => { m.userData.target = m.position.clone(); m.visible = false; });
  const bedShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 3.2), contactShadow.material.clone());
  bedShadow.rotation.x = -Math.PI / 2; bedShadow.position.set(bx, 0.007, bz); bedShadow.renderOrder = 1; g.add(bedShadow); H.bed.shadow = bedShadow;

  // ----- الديكور -----
  const dx = HOME_X.decor;
  const mirrorMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.04 });
  const decorItems = [];
  const mirror = new THREE.Group(); mirror.position.set(dx, 1.72, -1.56); g.add(mirror);
  addMesh(new THREE.TorusGeometry(0.46, 0.03, 16, 64), brass, mirror);
  addMesh(new THREE.CircleGeometry(0.45, 48), mirrorMat, mirror).position.z = -0.005;
  decorItems.push(mirror);
  const mahog = new THREE.MeshStandardMaterial({ map: woodTex.mahogany, roughness: 0.45 });
  const consoleT = new THREE.Group(); consoleT.position.set(dx, 0, -1.36); g.add(consoleT);
  addMesh(box(1.3, 0.04, 0.38), mahog, consoleT).position.y = 0.8;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) addMesh(box(0.025, 0.78, 0.025), brass, consoleT).position.set(sx * 0.6, 0.39, sz * 0.16);
  addMesh(box(1.2, 0.02, 0.3), mahog, consoleT).position.y = 0.2;
  decorItems.push(consoleT);
  const vase = add(new THREE.SphereGeometry(0.1, 24, 16), new THREE.MeshStandardMaterial({ color: 0x2f4a3a, roughness: 0.25 }), dx - 0.4, 0.95, -1.36); vase.scale.set(1, 1.5, 1); decorItems.push(vase);
  const books = new THREE.Group(); books.position.set(dx + 0.35, 0.82, -1.36); g.add(books);
  ['#7a3a2a', '#c9a36a', '#3a4a5c'].forEach((c, i) => { const b = addMesh(box(0.28 - i * 0.03, 0.045, 0.2), new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }), books); b.position.y = 0.023 + i * 0.046; b.rotation.y = rand(-0.2, 0.2); });
  decorItems.push(books);
  const plant = new THREE.Group(); plant.position.set(dx + 1.1, 0, -1.2); g.add(plant);
  addMesh(new THREE.CylinderGeometry(0.17, 0.13, 0.38, 24), new THREE.MeshStandardMaterial({ color: 0xd8c7ad, roughness: 0.7 }), plant).position.y = 0.19;
  const leaf = new THREE.MeshStandardMaterial({ color: 0x3f5a35, roughness: 0.6, side: THREE.DoubleSide });
  for (let i = 0; i < 14; i++) {
    const l = addMesh(new THREE.SphereGeometry(0.1, 10, 8), leaf, plant); const a = i * 2.4, h = rand(0.5, 1.25);
    l.scale.set(0.35, 1.3, 0.08); l.position.set(Math.cos(a) * 0.12, h, Math.sin(a) * 0.12); l.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6);
  }
  decorItems.push(plant);
  const shelf = new THREE.Group(); shelf.position.set(dx - 1.15, 1.35, -1.47); g.add(shelf);
  addMesh(box(0.7, 0.035, 0.22), mahog, shelf);
  addMesh(new THREE.CylinderGeometry(0.05, 0.06, 0.18, 16), new THREE.MeshStandardMaterial({ color: 0xb0603a, roughness: 0.4 }), shelf).position.set(-0.2, 0.1, 0);
  addMesh(box(0.05, 0.22, 0.16), new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.8 }), shelf).position.set(0.12, 0.13, 0);
  addMesh(box(0.05, 0.19, 0.16), new THREE.MeshStandardMaterial({ color: 0xe6dccb, roughness: 0.8 }), shelf).position.set(0.18, 0.115, 0);
  decorItems.push(shelf);
  const pouf = add(pillowGeo(0.46, 0.38, 0.46, { rad: 0.18, puff: 0.15, seed: 70 }), fabricMat, dx - 0.55, 0.2, -0.45); decorItems.push(pouf);
  const pendant = new THREE.Group(); pendant.position.set(dx, 2.3, -0.7); g.add(pendant);
  addMesh(new THREE.CylinderGeometry(0.004, 0.004, 1.2, 4), brass, pendant).position.y = 0.6;
  addMesh(new THREE.SphereGeometry(0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc9a36a, metalness: 0.9, roughness: 0.35, side: THREE.DoubleSide }), pendant);
  addMesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe2b0 }), pendant).position.y = -0.05;
  decorItems.push(pendant);
  decorItems.forEach((m, i) => { m.userData.base = m.position.clone(); m.userData.i = i; m.visible = false; });
  H.decor = decorItems;
  home = H;
}

// منحنيات الستارة: كسرات بتتلم لما الستارة تتفتح
function shapeCurtain(mesh, x0, x1, top, bottom, z, folds, amp, phase) {
  const p = mesh.geometry.attributes.position, b = mesh.geometry.userData.base;
  for (let i = 0; i < p.count; i++) {
    const u = b[i * 3] + 0.5, v = b[i * 3 + 1] + 0.5;
    const flare = 1 + (1 - v) * 0.35;
    p.setXYZ(i, lerp(x0, x1, u), lerp(bottom, top, v), z + Math.sin(u * folds * Math.PI * 2 + phase) * amp * flare);
  }
  p.needsUpdate = true; mesh.geometry.computeVertexNormals();
}

function updateHome(time) {
  if (!home || !room.visible) return;
  // الستاير: بتنزل مقفولة، وبعدين بتتفتح والنور يدخل
  const c = S.curt, C = home.curtain;
  const show = c > 0.01; C.L.visible = C.R.visible = C.S.visible = show;
  if (show && Math.abs(c - C.last) > 0.0005) {
    C.last = c;
    const cx = HOME_X.curtains, drop = easeOutCubic(clamp(c / 0.45)), open = smooth(clamp((c - 0.5) / 0.5));
    const top = 2.7, bottom = lerp(2.62, 0.03, drop);
    shapeCurtain(C.S, cx - 1.15, cx + 1.15, top, bottom, -1.5, 16, 0.015, 0);
    shapeCurtain(C.L, cx - 1.2, lerp(cx + 0.02, cx - 0.66, open), top, bottom, -1.43, 8, 0.028 + open * 0.035, 0);
    shapeCurtain(C.R, lerp(cx - 0.02, cx + 0.66, open), cx + 1.2, top, bottom, -1.43, 8, 0.028 + open * 0.035, Math.PI);
  }
  // الدولاب: الألواح بتتجمع، الرفوف والهدوم، وبعدين الضلف بتتقفل وتتفتح
  const w = S.ward; const Wd = home.ward;
  Wd.carcass.forEach((m) => {
    const t = clamp(w / 0.45 * 1.5 - m.userData.j * 0.07); m.visible = t > 0.001;
    if (!m.visible) return;
    const e = easeOutBack(t), er = easeOutCubic(t), { start, target, rot } = m.userData;
    m.position.lerpVectors(start, target, e); m.rotation.set(rot.x * (1 - er), rot.y * (1 - er), rot.z * (1 - er));
  });
  Wd.inside.forEach((m) => {
    const t = clamp((w - 0.42) / 0.22 * 1.6 - (m.userData.j / m.userData.n) * 0.6); m.visible = t > 0.001;
    if (m.visible) m.scale.setScalar(Math.max(0.001, easeOutBack(t)));
  });
  Wd.doors.forEach((pv) => {
    const t = clamp((w - 0.62) / 0.14); pv.visible = t > 0.001;
    if (!pv.visible) return;
    const open = smooth(clamp((w - 0.82) / 0.18)) * 1.95;
    pv.scale.setScalar(Math.max(0.001, easeOutBack(t)));
    pv.rotation.y = pv.userData.side * open; // الضلفتين بيتفتحوا لبرّه
  });
  // السرير: الهيكل، الشرايح، الضهر المنجد، المرتبة، اللحاف والمخدات
  const b = S.bed, B = home.bed;
  B.frame.forEach((m, i) => {
    const t = clamp(b / 0.22 * 1.4 - i * 0.05); m.visible = t > 0.001; if (!m.visible) return;
    m.position.set(m.userData.target.x, m.userData.target.y + (1 - easeOutCubic(t)) * 0.5, m.userData.target.z); m.scale.setScalar(Math.max(0.001, easeOutBack(t)));
  });
  B.slats.forEach((m) => {
    const t = clamp((b - 0.15) / 0.25 * 1.6 - m.userData.i * 0.07); m.visible = t > 0.001 && b < 0.72; if (!m.visible) return;
    m.position.y = m.userData.target.y + (1 - easeOutBack(t)) * 0.7;
  });
  B.head.forEach((m) => {
    const t = clamp((b - 0.3) / 0.25 * 1.5 - m.userData.i * 0.08); m.visible = t > 0.001; if (!m.visible) return;
    m.scale.set(1, Math.max(0.001, easeOutBack(t)), 1); m.position.y = 0.98 - (1 - t) * 0.5;
  });
  const drop = (m, t, h = 0.7) => {
    m.visible = t > 0.001; if (!m.visible) return;
    const fall = clamp(t / 0.6), land = clamp((t - 0.6) / 0.4);
    const sq = land > 0 ? Math.sin(land * Math.PI) * (1 - land) * 0.3 : -0.05 * fall;
    m.position.set(m.userData.target.x, m.userData.target.y + (1 - fall * fall) * h, m.userData.target.z);
    m.scale.set(1 + sq * 0.3, Math.max(0.001, 1 - sq), 1 + sq * 0.3);
  };
  drop(B.mattress, clamp((b - 0.48) / 0.2));
  const dt2 = clamp((b - 0.64) / 0.18); B.duvet.visible = dt2 > 0.001;
  if (B.duvet.visible) { const e = easeOutCubic(dt2); B.duvet.position.set(B.duvet.userData.target.x, B.duvet.userData.target.y + (1 - e) * 0.35, B.duvet.userData.target.z + (1 - e) * 1.1); B.duvet.scale.set(1, 1, Math.max(0.001, 0.35 + 0.65 * e)); }
  B.pillows.forEach((m, i) => drop(m, clamp((b - 0.78) / 0.18 * 1.5 - i * 0.22), 0.5));
  drop(B.blanket, clamp((b - 0.86) / 0.14), 0.4);
  B.shadow.material.opacity = clamp(b / 0.3) * 0.8;
  // الديكور: كل قطعة بتنط في مكانها
  home.decor.forEach((m) => {
    const t = clamp(S.decor * 1.7 - m.userData.i * 0.11); m.visible = t > 0.001; if (!m.visible) return;
    const e = easeOutBack(t); m.scale.setScalar(Math.max(0.001, e));
    m.position.set(m.userData.base.x, m.userData.base.y + (1 - easeOutCubic(t)) * 0.4, m.userData.base.z);
  });
}

function buildDust() {
  const N = LOW_END ? 90 : IS_MOBILE ? 180 : 420;
  const pos = new Float32Array(N * 3); const seeds = new Float32Array(N);
  const r = rng(42);
  for (let i = 0; i < N; i++) { pos[i * 3] = (r() - 0.5) * 6; pos[i * 3 + 1] = r() * 3; pos[i * 3 + 2] = (r() - 0.5) * 4; seeds[i] = r() * 10; }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.035, map: new THREE.CanvasTexture(dotCanvas()), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffd9a0, opacity: 0.4 });
  dust = new THREE.Points(geo, mat); dust.userData.seeds = seeds; dust.userData.base = pos.slice();
  scene.add(dust);
}

function applyWood() {
  woodMat.map = woodTex[choice.wood]; woodMat.needsUpdate = true;
}
function applyFabric() {
  const f = FABRICS[choice.material]; const tex = fabricTex[choice.material];
  const col = COLORS.find((c) => c.key === choice.color).hex;
  Object.assign(fabricMat, {
    map: tex, normalMap: fabricNrm[choice.material], roughness: f.rough, sheen: f.sheen, sheenRoughness: f.sheenRough,
    clearcoat: f.clearcoat, clearcoatRoughness: f.ccRough,
  });
  fabricMat.normalScale.setScalar(0.25 + f.bump * 0.3);
  // اللون بيتغير بنعومة بدل ما ينط
  const to = new THREE.Color(col);
  const sheenTo = to.clone().lerp(new THREE.Color(0xffffff), 0.35);
  // مخدة بلون مكمّل: غامقة على الألوان الفاتحة، وفاتحة على الغامقة
  const hsl = {}; to.getHSL(hsl);
  const accTo = new THREE.Color(hsl.l > 0.45 ? (choice.color === 'terra' ? '#3a4a3a' : '#8a4a2a') : '#d9c6a5');
  const dur = REDUCED || !sofa ? 0 : 0.7;
  gsap.to(fabricMat.color, { r: to.r, g: to.g, b: to.b, duration: dur, ease: 'power2.out' });
  gsap.to(fabricMat.sheenColor, { r: sheenTo.r, g: sheenTo.g, b: sheenTo.b, duration: dur, ease: 'power2.out' });
  gsap.to(accentMat.color, { r: accTo.r, g: accTo.g, b: accTo.b, duration: dur, ease: 'power2.out' });
  accentMat.map = fabricTex.linen; accentMat.normalMap = fabricNrm.linen; accentMat.normalScale.setScalar(0.5);
  accentMat.sheen = 0.25; accentMat.sheenColor.set('#fff4e0');
  fabricMat.needsUpdate = true; accentMat.needsUpdate = true;
  bounceCushions(0.35);
}

// المخدات بتتهز هزة خفيفة لما تغيّر الخامة أو اللون، وبتتضغط لما تختار الكثافة (كأن حد قعد عليها)
function bounceCushions(amount = 0.35) {
  if (REDUCED || !sofa) return;
  gsap.killTweensOf(pressAnim);
  gsap.timeline().to(pressAnim, { v: amount, duration: 0.18, ease: 'power2.out' }).to(pressAnim, { v: 0, duration: 1.1, ease: 'elastic.out(1, 0.35)' });
}

// ===== حالة المشهد بالسكرول (keyframes) =====
const BASE = { plaque: 1, logs: 0, cut: 0, frame: 0, springs: 0, foam: 0, cover: 0, room: 0, curt: 0, ward: 0, bed: 0, decor: 0, dust: 0.25, az: 0, cy: 1.1, r: 4.6, tx: 0, ty: 0.78, tz: 0, shift: 0 };
const keyframes = [];
function kf(at, state) {
  const prev = keyframes.length ? keyframes[keyframes.length - 1].state : BASE;
  keyframes.push({ at, state: { ...prev, ...state }, pos: 0 });
}
function anchor(el, start) { const st = ScrollTrigger.create({ trigger: el, start }); return () => st.start; }

function buildKeyframes() {
  kf(() => 0, {});
  kf(anchor('#forest', 'top 45%'), { plaque: 0, logs: 1, az: 0.75, cy: 1.45, r: 4.3, ty: 0.35, shift: 1, dust: 0.35 });
  kf(anchor('#cutting', 'top 55%'), { cut: 0, az: 0.55, cy: 1.9, r: 3.9, ty: 0.3 });
  kf(anchor('#cutting', 'bottom 75%'), { logs: 0, cut: 1, dust: 1, az: 0.3, cy: 2.0, r: 3.7, ty: 0.15 });
  kf(anchor('#woods', 'top 40%'), { dust: 0.3, az: 0.2, cy: 0.95, r: 2.5, ty: 0.15 });
  kf(anchor('#woods', 'bottom 85%'), { az: -0.15 });
  // الهيكل: مثبّت
  const pin = ScrollTrigger.create({ trigger: '#frame', start: 'top top', end: () => `+=${window.innerHeight * 3.2}`, pin: true });
  kf(() => pin.start, { frame: 0, az: 0.9, cy: 1.9, r: 4.3, ty: 0.45, dust: 0.4 });
  kf(() => pin.end - window.innerHeight * 0.2, { frame: 5.15, az: -0.55, cy: 1.6, r: 4.0, ty: 0.45 });
  kf(anchor('#springs', 'top 40%'), { springs: 1, az: -0.25, cy: 2.7, r: 3.0, ty: 0.3, dust: 0.25 });
  kf(anchor('#foam', 'top 75%'), { foam: 0 });
  kf(anchor('#foam', 'center 55%'), { foam: 1, az: 0.5, cy: 2.1, r: 3.4, ty: 0.35 });
  kf(anchor('#upholster', 'top 75%'), { cover: 0 });
  kf(anchor('#upholster', 'bottom 70%'), { cover: 1, az: 0.65, cy: 1.5, r: 4.0, ty: 0.5 });
  // الجاليري الأفقي
  const wrap = document.querySelector('.horiz-gallery-wrapper');
  const strip = wrap.querySelector('.horiz-gallery-strip');
  const dist = () => Math.max(0, strip.scrollWidth - window.innerWidth);
  gsap.to(strip, {
    x: () => dist(), ease: 'none',
    scrollTrigger: { trigger: wrap, pin: true, start: 'top top', end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true,
      onToggle: (self) => { galleryActive = self.isActive; } },
  });
  kf(anchor('#fabric', 'top 40%'), { az: 0.45, cy: 1.35, r: 3.8, ty: 0.5, shift: 1 });
  kf(anchor('#fabric', 'bottom 85%'), {});
  kf(anchor('#final', 'top 45%'), { room: 1, az: 0.85, cy: 1.45, r: 4.5, ty: 0.55, shift: 0.7 });
  kf(anchor('#final', 'bottom 60%'), { az: -0.8 });
  // البيت كله: الكاميرا بتمشي في المعرض من قطعة للتانية
  // على الموبايل الأنيميشن بيخلص في النص الفاضي اللي فوق، قبل ما الكلام يطلع ويغطيه
  const MOBILE_LAYOUT = window.innerWidth <= 900;
  const END = MOBILE_LAYOUT ? 'top 5%' : 'bottom 85%';
  kf(anchor('#home', 'top 55%'), { tx: 2.6, tz: -0.4, r: 7.5, cy: 2.6, ty: 0.9, az: 0.12, shift: 0 });
  kf(anchor('#curtains', 'top 65%'), { tx: 3.4, tz: -1.0, r: 3.9, cy: 1.7, ty: 1.35, az: 0.2, shift: 0.7, curt: 0 });
  kf(anchor('#curtains', END), { curt: 1, az: -0.12 });
  kf(anchor('#wardrobe', 'top 65%'), { tx: 6.8, tz: -1.0, r: 4.4, cy: 1.7, ty: 1.15, az: 0.28, ward: 0 });
  kf(anchor('#wardrobe', END), { ward: 1, az: -0.2 });
  kf(anchor('#bed', 'top 65%'), { tx: 10.6, tz: -0.5, r: 4.5, cy: 2.4, ty: 0.55, az: 0.5, bed: 0 });
  kf(anchor('#bed', END), { bed: 1, az: 0.15 });
  kf(anchor('#decor', 'top 65%'), { tx: 14.0, tz: -0.9, r: 4.1, cy: 1.7, ty: 1.1, az: -0.25, decor: 0 });
  kf(anchor('#decor', MOBILE_LAYOUT ? 'top 5%' : 'center 50%'), { decor: 1, az: 0.12 });
  kf(anchor('#decor', 'bottom 75%'), { tx: 7.2, tz: -0.3, r: 10.5, cy: 3.4, ty: 0.9, az: 0, shift: 0 });
  kf(anchor('#contact', 'top 50%'), { tx: 0, tz: 0, az: -0.45, cy: 1.8, r: 5.4, ty: 0.55, shift: 0 });
  Object.keys(BASE).forEach((k) => { S[k] = BASE[k]; T[k] = BASE[k]; });
  ScrollTrigger.addEventListener('refresh', () => keyframes.forEach((k) => { k.pos = k.at(); }));
}
let galleryActive = false;

function computeTarget(y) {
  let i = 0;
  while (i < keyframes.length - 1 && y >= keyframes[i + 1].pos) i++;
  const a = keyframes[i], b = keyframes[Math.min(i + 1, keyframes.length - 1)];
  const span = b.pos - a.pos;
  const t = span > 0 ? smooth(clamp((y - a.pos) / span)) : 1;
  for (const k in BASE) T[k] = lerp(a.state[k], b.state[k], t);
}

// ===== التحديث كل فريم =====
const tmpV = new THREE.Vector3();
let lastStep = -1;
const stepItems = [...document.querySelectorAll('#buildSteps li')];
const stepLabel = document.getElementById('stepLabel');

function updateScene(time, dt) {
  // اللوحة
  const p = S.plaque * intro.p;
  plaque.visible = p > 0.01;
  if (plaque.visible) {
    plaque.position.set(0, 1.1 + (1 - p) * 1.2, -(1 - p) * 1.5);
    plaque.rotation.set(pointer.y * 0.12 + (1 - p) * 0.6, pointer.x * 0.25 + Math.sin(time * 0.5) * 0.05, 0);
    plaque.scale.setScalar(Math.max(0.001, p));
  }

  // الكتل الخشب والمنشار
  const logShow = S.logs;
  parts.logs.forEach((m) => {
    const { base, i } = m.userData;
    const e = easeOutCubic(clamp(logShow * 1.4 - i * 0.2));
    m.visible = e > 0.01;
    m.position.set(base.x + (1 - e) * 2.5, base.y + (1 - e) * 1.2, base.z);
    const shrink = 1 - smooth(clamp((S.cut - 0.35) / 0.4));
    m.scale.set(Math.max(0.001, shrink), Math.max(0.001, e), Math.max(0.001, shrink)); // y = طول الكتلة بعد اللف
    if (shrink < 0.01) m.visible = false;
  });
  const sawT = clamp(S.cut / 0.6);
  saw.visible = S.cut > 0.01 && S.cut < 0.75;
  if (saw.visible) {
    saw.position.set(lerp(1.4, -1.4, sawT), 0.45, 0.2);
    saw.rotation.z -= dt * 18;
  }

  // الألواح
  const plankOut = clamp(S.frame * 1.6);
  parts.planks.forEach((m) => {
    const { base, i } = m.userData;
    const e = easeOutBack(clamp((S.cut - 0.4) * 2.2 - i * 0.04));
    const gone = smooth(clamp(plankOut * 1.3 - (parts.planks.length - i) * 0.02));
    m.visible = e > 0.01 && gone < 0.99;
    m.position.set(base.x + (1 - clamp(e)) * 0.4, base.y + (1 - clamp(e)) * 0.3 + gone * 1.2, base.z);
    m.scale.setScalar(Math.max(0.001, clamp(e, 0, 1.2) * (1 - gone)));
  });

  // الهيكل
  const covered = S.cover > 0.97;
  parts.frame.forEach((m) => {
    const { target, targetRot, start, startRot, step, j, n, isLeg } = m.userData;
    const spread = n > 1 ? 0.45 / (n - 1) : 0;
    const t = clamp((S.frame - step) * 1.45 - j * spread);
    m.visible = t > 0.001 && (isLeg || !covered);
    if (!m.visible) return;
    const e = easeOutBack(t), er = easeOutCubic(t);
    m.position.lerpVectors(start, target, e);
    m.rotation.set(lerp(startRot.x, targetRot.x, er), lerp(startRot.y, targetRot.y, er), lerp(startRot.z, targetRot.z, er));
  });
  const si = Math.min(4, Math.max(0, Math.floor(S.frame)));
  if (si !== lastStep) {
    lastStep = si;
    stepItems.forEach((li, k) => { li.classList.toggle('is-active', k === si); li.classList.toggle('is-done', k < si); });
    stepLabel.textContent = STEP_NAMES[si];
    if (!REDUCED) gsap.fromTo(stepLabel, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }

  // السوست
  parts.springs.forEach((m) => {
    const { target, i } = m.userData;
    const t = clamp(S.springs * 1.6 - i * 0.12);
    m.visible = t > 0.001 && !covered;
    if (!m.visible) return;
    m.position.set(target.x, target.y + (1 - easeOutBack(t)) * 1.1, target.z);
  });

  // الإسفنج
  parts.foam.forEach((m) => {
    const { target, i } = m.userData;
    const t = clamp(S.foam * 1.5 - i * 0.18);
    m.visible = t > 0.001 && !covered;
    if (!m.visible) return;
    const e = easeOutBack(t);
    m.position.set(target.x, target.y + (1 - e) * 0.9 - (i === 0 ? pressAnim.v * 0.02 : 0), target.z);
    const pressed = i === 0 ? 1 - pressAnim.v * 0.4 : 1;
    m.scale.set(1, Math.max(0.001, (0.4 + 0.6 * e) * pressed), 1);
  });

  // التنجيد
  parts.cover.forEach((m) => {
    const { target, i, n } = m.userData;
    const t = clamp(S.cover * 1.6 - (i / n) * 0.6);
    m.visible = t > 0.001;
    if (!m.visible) return;
    // بتنزل بجاذبية، وأول ما تلمس بتتبطّط وترجع (squash & stretch)
    const fall = clamp(t / 0.6), land = clamp((t - 0.6) / 0.4);
    const sq = land > 0 ? Math.sin(land * Math.PI) * (1 - land) * 0.28 : -0.06 * fall;
    const kind = m.userData.kind;
    const press = kind === 'seat' ? pressAnim.v : kind === 'back' || kind === 'throw' ? pressAnim.v * 0.4 : 0;
    const grow = Math.min(1, t * 4);
    m.position.set(target.x, target.y + (1 - fall * fall) * 0.6 - press * 0.03, target.z);
    const ys = 1 - sq - press * 0.3, xs = 1 + sq * 0.45 + press * 0.06;
    m.scale.set(Math.max(0.001, xs * grow), Math.max(0.001, ys * grow), Math.max(0.001, xs * grow));
  });
  if (contactShadow) contactShadow.material.opacity = clamp(S.frame / 2) * 0.35 + S.cover * 0.45;

  // دوران الكنبة بالسحب
  userRot += userVel; userVel *= 0.92;
  // لما الكنبة تخلص ومحدش بيلفها، بتلف لوحدها لف هادي زي ما تكون في معرض
  if (!REDUCED && S.cover > 0.97 && time - lastDrag > 3.5) userRot += (Math.sin(time * 0.22) * 0.32 - userRot) * Math.min(1, dt * 0.8);
  sofa.rotation.y = userRot;

  // الأوضة
  room.visible = S.room > 0.01;
  if (room.visible) {
    roomMats.forEach((m) => { m.opacity = S.room; m.transparent = S.room < 0.99; m.depthWrite = S.room > 0.5; });
    lampLight.intensity = S.room * 3;
  }
  shadowCatcher.material.opacity = 0.35 * (1 - S.room);
  scene.environmentIntensity = lerp(0.55, 0.38, S.room); // في الأوضة الإضاءة أهدى عشان الألوان ما تتحرقش

  // تراب الخشب
  const pos = dust.geometry.attributes.position; const seeds = dust.userData.seeds; const base = dust.userData.base;
  if (!REDUCED) {
    for (let i = 0; i < seeds.length; i++) {
      const s = seeds[i];
      pos.array[i * 3] = base[i * 3] + Math.sin(time * 0.2 + s) * 0.3;
      pos.array[i * 3 + 1] = (base[i * 3 + 1] + time * 0.05 * (0.5 + (s % 1))) % 3;
      pos.array[i * 3 + 2] = base[i * 3 + 2] + Math.cos(time * 0.17 + s) * 0.3;
    }
    pos.needsUpdate = true;
  }
  dust.material.opacity = 0.18 + S.dust * 0.6;
  dust.position.x = S.tx; // التراب بيمشي مع الكاميرا في المعرض
  // الشمس بتتبع الكاميرا عشان كل قطعة ياخد ظلها صح
  keyLight.position.set(S.tx - 3, 5, S.tz + 4); keyLight.target.position.set(S.tx, 0, S.tz);
  updateHome(time);
  dust.material.size = 0.03 + S.dust * 0.02;

  // الكاميرا
  const portrait = camera.aspect < 1;
  const rr = S.r * (portrait ? 1 + (1 / camera.aspect - 1) * 0.62 : 1);
  const az = S.az + (FINE_POINTER ? pointer.x * 0.06 : 0);
  camera.position.set(S.tx + Math.sin(az) * rr, S.cy + (portrait ? 0.3 : 0) + (FINE_POINTER ? pointer.y * 0.08 : 0), S.tz + Math.cos(az) * rr);
  tmpV.set(S.tx, S.ty - (portrait ? 0.25 : 0), S.tz);
  camera.lookAt(tmpV);
  const w = window.innerWidth, h = viewH;
  if (w > 900) camera.setViewOffset(w, h, w * 0.17 * S.shift, 0, w, h);
  // على الموبايل: المجسم يطلع في النص اللي فوق، والكلام في النص اللي تحت
  else if (portrait) camera.setViewOffset(w, h, 0, h * 0.17 * (S.plaque > 0.5 ? 0.4 : 1), w, h);
  else camera.clearViewOffset();
}

// ===== المؤشر والسحب =====
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', (e) => {
  pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
}, { passive: true });

function setupDrag() {
  const cursor = document.querySelector('.cursor');
  ['#fabric', '#final'].forEach((sel) => {
    const el = document.querySelector(sel);
    let down = false, lastX = 0;
    const touchGain = FINE_POINTER ? 0.004 : 0.009; // الصباع بيتحرك مسافة أقل، فبنكبّر اللفة
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button, a, input, select, textarea, .panel')) return;
      down = true; lastX = e.clientX; lastDrag = clock.elapsedTime; cursor.classList.add('is-drag');
    });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      lastDrag = clock.elapsedTime; userVel = (e.clientX - lastX) * touchGain; userRot += userVel; userVel *= 0.5; lastX = e.clientX;
    });
    const end = () => { down = false; cursor.classList.remove('is-drag'); };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  });
}

// ===== الكيرسر والزراير المغناطيس =====
function setupCursor() {
  if (!FINE_POINTER) return;
  const dot = document.querySelector('.cursor__dot'), ring = document.querySelector('.cursor__ring'), cur = document.querySelector('.cursor');
  const dx = gsap.quickTo(dot, 'x', { duration: 0.1 }), dy = gsap.quickTo(dot, 'y', { duration: 0.1 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3' });
  window.addEventListener('pointermove', (e) => { cur.classList.add('is-on'); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
  document.querySelectorAll('a, button, .wood-card, .swatch').forEach((el) => {
    el.addEventListener('pointerenter', () => cur.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => cur.classList.remove('is-hover'));
  });
  document.querySelectorAll('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' }), yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const b = el.getBoundingClientRect();
      xTo((e.clientX - b.left - b.width / 2) * 0.3); yTo((e.clientY - b.top - b.height / 2) * 0.35);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

// ===== حركات النصوص =====
function setupReveals() {
  document.querySelectorAll('.split').forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words.map((w) => `<span class="w"><span>${w}</span></span>`).join(' ');
  });
  if (REDUCED) return;
  document.querySelectorAll('.split:not(.hero__tagline)').forEach((el) => {
    gsap.from(el.querySelectorAll('.w > span'), {
      yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.05,
      scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
    });
  });
  document.querySelectorAll('.sec:not(.hero) [data-reveal]').forEach((el) => {
    gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none reverse' } });
  });
  // الكروت والاختيارات بتطلع واحدة ورا التانية
  gsap.utils.toArray('.wood-grid, .density, .swatches, .summary, .mini-steps, .stats, .chips, .process, .opts').forEach((grp) => {
    gsap.from(grp.children, { y: 24, opacity: 0, scale: 0.96, duration: 0.7, ease: 'power3.out', stagger: 0.06,
      scrollTrigger: { trigger: grp, start: 'top 90%', toggleActions: 'play none none reverse' } });
  });
  gsap.utils.toArray('.panel').forEach((p) => {
    gsap.from(p, { opacity: 0, x: -40, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: p, start: 'top 90%', toggleActions: 'play none none reverse' } });
  });
}

function heroIntro() {
  if (REDUCED) return;
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.to(intro, { p: 1, duration: 1.8, ease: 'power3.out' }, 0);
  tl.from('.hero .eyebrow', { y: 20, opacity: 0, duration: 0.8 }, 0.5)
    .from('.hero__tagline .w > span', { yPercent: 110, duration: 1, stagger: 0.06 }, 0.6)
    .from('.hero__actions .btn', { y: 20, opacity: 0, stagger: 0.1, duration: 0.8 }, 1.0)
    .from('.nav', { y: -30, opacity: 0, duration: 0.8 }, 0.8);
}

// ===== الفصول وشريط التقدم =====
function setupChapters() {
  const num = document.getElementById('chapterNum'), name = document.getElementById('chapterName');
  const order = [...new Set([...document.querySelectorAll('[data-chapter]')].map((s) => s.dataset.chapter))];
  document.querySelectorAll('[data-chapter]').forEach((sec) => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 50%', end: 'bottom 50%',
      onToggle: (self) => {
        if (!self.isActive) return;
        const i = order.indexOf(sec.dataset.chapter) + 1;
        num.textContent = toAr(String(i).padStart(2, '0')); name.textContent = sec.dataset.chapter;
      },
    });
  });
  gsap.to('#progressBar', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
}

// ===== الأحداث =====
let smoother = null;
function scrollToSel(sel) {
  if (smoother) smoother.scrollTo(sel, true, 'top top');
  else document.querySelector(sel).scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
}

function setupUI() {
  buildSwatches();
  document.querySelectorAll('[data-scroll-to]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); scrollToSel(a.dataset.scrollTo); }));
  document.querySelectorAll('.wood-card').forEach((b) => b.addEventListener('click', () => { choice.wood = b.dataset.wood; applyWood(); updateSummary(); }));
  // الإسفنج بيتضغط على قد طراوته: ٣٠ بينزل أكتر من ٤٠
  document.querySelectorAll('.density__opt').forEach((b) => b.addEventListener('click', () => { choice.density = b.dataset.density; updateSummary(); bounceCushions({ 30: 0.9, 35: 0.62, 40: 0.38 }[choice.density]); }));
  document.querySelectorAll('.mat-pick, .chip[data-material]').forEach((b) => b.addEventListener('click', () => { choice.material = b.dataset.material; applyFabric(); updateSummary(); }));
  document.querySelectorAll('.swatch').forEach((b) => b.addEventListener('click', () => { choice.color = b.dataset.color; applyFabric(); updateSummary(); }));

  document.getElementById('addrText').textContent = CONFIG.address;
  document.querySelectorAll('[data-map-link]').forEach((a) => { a.href = CONFIG.mapUrl; });
  document.getElementById('hoursText').textContent = CONFIG.hours;
  document.getElementById('phoneText').textContent = CONFIG.phone;

  const form = document.getElementById('orderForm'), msg = document.getElementById('orderMsg');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const nameOk = String(fd.get('name')).trim().length > 1;
    const phoneOk = /^[0-9+\s]{10,15}$/.test(String(fd.get('phone')).trim());
    form.elements.name.classList.toggle('is-invalid', !nameOk); form.elements.phone.classList.toggle('is-invalid', !phoneOk);
    if (!nameOk || !phoneOk) { msg.textContent = 'من فضلك اكتب اسمك ورقم موبايل صحيح.'; return; }
    const color = COLORS.find((c) => c.key === choice.color).name;
    const text = [
      'طلب جديد من موقع عثمان للأثاث',
      `الاسم: ${fd.get('name')}`, `الموبايل: ${fd.get('phone')}`, `المحافظة: ${fd.get('city')}`,
      `عايز: ${fd.getAll('want').join('، ') || 'لسه بستشير'}`,
      `الكنبة: ${WOODS[choice.wood].full}، ${DENSITY[choice.density]}، ${FABRICS[choice.material].name}، ${color}`,
      fd.get('notes') ? `ملاحظات: ${fd.get('notes')}` : '',
    ].filter(Boolean).join('\n');
    msg.innerHTML = '';
    const link = document.createElement('a');
    link.href = waLink(text); link.target = '_blank'; link.rel = 'noopener'; link.className = 'btn btn--whatsapp';
    link.textContent = 'افتح واتساب وابعت الطلب';
    msg.append('طلبك جاهز. دوس على الزرار ده وابعت الرسالة، وهنرد عليك في أسرع وقت.', link);
  });
  updateSummary();
}

// ===== التشغيل =====
async function boot() {
  setProgress(5);
  setupUI();
  try {
    await Promise.race([
      Promise.all([document.fonts.load('700 100px "Aref Ruqaa"'), document.fonts.load('800 40px "Cairo"'), document.fonts.load('400 18px "Tajawal"')]),
      new Promise((r) => setTimeout(r, 3500)),
    ]);
  } catch (_) { /* نكمل بخط احتياطي */ }
  setProgress(10);

  let webgl = true;
  try { await initScene(); } catch (err) { console.warn('WebGL غير متاح', err); webgl = false; canvas.style.display = 'none'; }

  // على اللمس بنسيب السكرول الطبيعي بتاع الموبايل: أنعم وأخف، وكل الأنيميشن شغالة عليه زي ما هي
  if (!REDUCED && FINE_POINTER) {
    smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: 2, effects: false, normalizeScroll: true, ignoreMobileResize: true });
  }
  buildKeyframes();
  setupReveals();
  setupChapters();
  setupDrag();
  setupCursor();
  ScrollTrigger.refresh();

  setProgress(100);
  await nextFrame();
  gsap.to('#preloader', { opacity: 0, duration: 0.8, delay: 0.2, ease: 'power2.out', onComplete: () => { document.getElementById('preloader').remove(); document.body.classList.remove('is-loading'); } });
  heroIntro();

  if (!webgl) return;
  // قطع البيت (ستاير، دولاب، سرير، ديكور) بتتبني بعد ما الصفحة تفتح عشان التحميل يفضل سريع
  setTimeout(() => { try { buildHome(); } catch (err) { console.warn(err); } }, 60);
  const damp = REDUCED ? 1 : 0;
  gsap.ticker.add(() => {
    const dt = Math.min(clock.getDelta(), 0.1);
    const time = clock.elapsedTime;
    pointer.x += (pointer.tx - pointer.x) * 0.06; pointer.y += (pointer.ty - pointer.y) * 0.06;
    const y = smoother ? smoother.scrollTop() : window.scrollY;
    computeTarget(y);
    const k = damp || 1 - Math.pow(0.002, dt);
    for (const key in BASE) S[key] += (T[key] - S[key]) * k;
    if (galleryActive || document.hidden) return;
    updateScene(time, dt);
    renderer.render(scene, camera);
    adaptQuality(dt);
  });

  // شريط العنوان في الموبايل بيغيّر الطول وإنت بتنزل: منعملش resize إلا لو التغيير كبير
  let lastW = window.innerWidth, resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const w = window.innerWidth, h = canvasH();
      if (w === lastW && h === viewH) return;
      lastW = w; viewH = h;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }, 120);
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { clock.getDelta(); quality.frames = 0; quality.elapsed = 0; } });
}

boot();
