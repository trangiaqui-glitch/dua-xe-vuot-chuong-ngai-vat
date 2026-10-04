'use strict';
/* =====================================================================
   BÉ ĐUA XE — NÉ CHƯỚNG NGẠI VẬT (V2)
   HTML5 Canvas + JavaScript thuần. Không cần asset ngoài.
   Các phần: Config · Storage · Audio · Online · Game state · Spawn ·
             Update · Render · UI · Input · Main loop
   ===================================================================== */

// ---------------------------------------------------------------------
// 1. CẤU HÌNH
// ---------------------------------------------------------------------
const W = 480, H = 720;                    // kích thước thế giới (logic)
const ROAD_X = 50, ROAD_W = 380, LANES = 3;
const LANE_W = ROAD_W / LANES;
const laneX = (lane) => ROAD_X + LANE_W * (lane + 0.5);

const PLAYER = { w: 56, h: 92, y: 600, hitW: 38, hitH: 70 };

// Cấu hình level tập trung — không hard-code ở nơi khác.
//  speed: px/giây · spawnInterval: ms giữa 2 hàng vật cản (ở tốc độ gốc)
//  pairChance: xác suất hàng có 2 vật cản (luôn chừa >= 1 làn trống)
//  zigzagChance: xác suất bắt đầu chuỗi ngoằn ngoèo (level cao)
const LEVELS = [
  { id: 1,  targetScore: 300,      speed: 180, spawnInterval: 1300, coinChance: 0.75, powerupChance: 0.05, pairChance: 0,    zigzagChance: 0,    types: ['car', 'cone'],                       grass: '#7ed957', road: '#4f5b6b' },
  { id: 2,  targetScore: 700,      speed: 210, spawnInterval: 1200, coinChance: 0.75, powerupChance: 0.06, pairChance: 0.10, zigzagChance: 0,    types: ['car', 'cone'],                       grass: '#7ed957', road: '#4f5b6b' },
  { id: 3,  targetScore: 1200,     speed: 240, spawnInterval: 1100, coinChance: 0.70, powerupChance: 0.07, pairChance: 0.20, zigzagChance: 0,    types: ['car', 'cone'],                       grass: '#6fd36b', road: '#4a5666' },
  { id: 4,  targetScore: 1800,     speed: 270, spawnInterval: 1050, coinChance: 0.70, powerupChance: 0.12, pairChance: 0.25, zigzagChance: 0,    types: ['car', 'cone', 'barrier'],            grass: '#9be15d', road: '#4a5666' },
  { id: 5,  targetScore: 2500,     speed: 300, spawnInterval: 1000, coinChance: 0.70, powerupChance: 0.13, pairChance: 0.30, zigzagChance: 0,    types: ['car', 'cone', 'barrier'],            grass: '#9be15d', road: '#475263' },
  { id: 6,  targetScore: 3300,     speed: 330, spawnInterval: 950,  coinChance: 0.65, powerupChance: 0.14, pairChance: 0.35, zigzagChance: 0,    types: ['car', 'cone', 'barrier', 'puddle', 'truck'], grass: '#ffd86b', road: '#475263' },
  { id: 7,  targetScore: 4200,     speed: 360, spawnInterval: 900,  coinChance: 0.65, powerupChance: 0.14, pairChance: 0.35, zigzagChance: 0.12, types: ['car', 'cone', 'barrier', 'puddle', 'truck'], grass: '#ffd86b', road: '#434d5d' },
  { id: 8,  targetScore: 5200,     speed: 390, spawnInterval: 850,  coinChance: 0.65, powerupChance: 0.15, pairChance: 0.40, zigzagChance: 0.15, types: ['car', 'cone', 'barrier', 'puddle', 'truck'], grass: '#7fd8f0', road: '#434d5d' },
  { id: 9,  targetScore: 6400,     speed: 420, spawnInterval: 800,  coinChance: 0.60, powerupChance: 0.15, pairChance: 0.40, zigzagChance: 0.18, types: ['car', 'cone', 'barrier', 'puddle', 'truck'], grass: '#7fd8f0', road: '#3f4858' },
  // Level 10: đoạn đường đặc biệt (hoàng hôn), nhanh nhất, điểm thưởng ×1.5, chơi đến khi va chạm.
  { id: 10, targetScore: Infinity, speed: 450, spawnInterval: 760, coinChance: 0.70, powerupChance: 0.16, pairChance: 0.45, zigzagChance: 0.20, types: ['car', 'cone', 'barrier', 'puddle', 'truck'], grass: '#c59bff', road: '#4b3f72', scoreBonus: 1.5, special: true }
];

const POWERUPS = {
  shield: { icon: '🛡️', label: 'KHIÊN!',      duration: 0 },      // 0 = đến khi bị va chạm
  magnet: { icon: '🧲', label: 'NAM CHÂM!',   duration: 7000 },
  slow:   { icon: '🐌', label: 'CHẬM LẠI!',   duration: 5000 },
  double: { icon: '×2', label: 'XU ×2!',      duration: 9000 },
  rocket: { icon: '🚀', label: '+3 TÊN LỬA!', duration: 0 },      // cộng đạn, không có thời hạn
  gift:   { icon: '🎁', label: 'QUÀ BẤT NGỜ!', duration: 0 }       // hộp quà: phần thưởng ngẫu nhiên
};
// Tên lửa: bay thẳng lên theo làn của xe, trúng vật cản đầu tiên thì nổ tung.
//  start: số quả có sẵn · recharge: sau khi bắn, cứ 2 giây tự nạp lại 1 quả (cho tới khi đủ `start` quả)
//  max: số quả tối đa khi nhặt thêm trên đường
const ROCKET = { speed: 900, start: 2, max: 5, pickup: 3, cooldown: 350, bonus: 20, recharge: 2000 };
const POWER_KEYS = Object.keys(POWERUPS);

const TURBO = { max: 100, duration: 4000, speedMul: 1.6, immuneMs: 1500, coin: 5, nearMiss: 8, combo: 10 };
const SLOW_MUL = 0.55;
// Số tốc độ do người chơi tự chọn (↑ ↓ / W S / nút +/−). Chạy nhanh hơn => điểm nhiều hơn.
const GEARS = [0.7, 0.85, 1, 1.2, 1.4];
const DEFAULT_GEAR = 2;
const MAGNET_RADIUS = 170, TURBO_MAGNET_RADIUS = 150;
const SURVIVE_POINTS_PER_SEC = 8;
const COIN_POINTS = 10;
const OBSTACLE_COLORS = ['#e8453c', '#2f9bff', '#ffd93b', '#a56bff', '#2ec4b6'];

// Danh sách xe để bé chọn (chỉ khác hình dáng/màu, không khác sức mạnh nên công bằng cho mọi bé).
//  style: 'f1' (xe đua bánh hở) hoặc 'sport' (xe thể thao); body: màu thân; acc: màu viền/sọc; helmet: màu mũ
const CARS = [
  { id: 'formulaE', name: 'Sét Xanh',   style: 'f1',    body: '#1c2230', acc: '#27d4ff', helmet: '#ffd93b' },
  { id: 'f1red',    name: 'Ngựa Vằn Đỏ', style: 'f1',    body: '#e8201f', acc: '#ffffff', helmet: '#ffffff' },
  { id: 'f1yellow', name: 'Ong Vàng',   style: 'f1',    body: '#ffd21f', acc: '#1d1f27', helmet: '#e8201f' },
  { id: 'f1pink',   name: 'Kẹo Hồng',   style: 'f1',    body: '#ff5fa8', acc: '#7a3cff', helmet: '#ffffff' },
  { id: 'sportBlue', name: 'Cá Mập Xanh', style: 'sport', body: '#2f7bff', acc: '#ffffff' },
  { id: 'police',   name: 'Cảnh Sát',   style: 'sport', body: '#f4f6fb', acc: '#2f4a8a', lights: true }
];
const DEFAULT_CAR = CARS[0].id;

// ----- Giải đấu: 4 chặng, đua với 3 đối thủ -----
//  level: dùng độ khó của level tương ứng (chỉ số trong LEVELS) · length: độ dài đường đua (px)
const STAGES = [
  { name: 'Đường Làng', level: 0, length: 9000 },
  { name: 'Ven Biển',   level: 2, length: 11000 },
  { name: 'Núi Xanh',   level: 5, length: 13000 },
  { name: 'Siêu Tốc',   level: 8, length: 15000 }
];
const RACE_POINTS = [10, 7, 5, 3];        // điểm cho hạng 1, 2, 3, 4
const COUNTDOWN_MS = 3000;
//  pace: tốc độ so với tốc độ gốc của level (1 = bằng xe bé chạy số thường) · start: khoảng cách xuất phát phía trước (px)
const RIVALS = [
  { name: 'Bé Bin', emoji: '🐻', body: '#e8453c', pace: 1.03, start: 300, lane: 1 },
  { name: 'Bé Na',  emoji: '🦊', body: '#ff9b2f', pace: 1.00, start: 190, lane: 0 },
  { name: 'Bé Mi',  emoji: '🐯', body: '#a56bff', pace: 0.96, start: 80,  lane: 2 }
];

// ---------------------------------------------------------------------
// 2. LƯU TRỮ (localStorage, luôn kiểm tra dữ liệu)
// ---------------------------------------------------------------------
const KEYS = { best: 'kidsRacingHighScore', sound: 'kidsRacingSound', board: 'kidsRacingLeaderboard', nick: 'kidsRacingNickname', car: 'kidsRacingCar', photo: 'kidsRacingPhoto', cups: 'kidsRacingCups' };

const Storage = {
  get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
  set(key, val) { try { localStorage.setItem(key, val); } catch (_) { /* bỏ qua: chế độ riêng tư */ } },
  remove(key) { try { localStorage.removeItem(key); } catch (_) { /* bỏ qua */ } },

  getHighScore() {
    const n = Number(this.get(KEYS.best));
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  },
  setHighScore(n) { this.set(KEYS.best, String(Math.floor(n))); },

  getSound() { return this.get(KEYS.sound) !== 'off'; },
  setSound(on) { this.set(KEYS.sound, on ? 'on' : 'off'); },

  getCar() {
    const id = this.get(KEYS.car);
    return CARS.some((c) => c.id === id) ? id : DEFAULT_CAR;     // id lạ => dùng xe mặc định
  },
  setCar(id) { this.set(KEYS.car, id); },

  // Ảnh của bé: chỉ lưu trên máy này (dataURL nhỏ), không bao giờ gửi lên mạng.
  getPhoto() {
    const d = this.get(KEYS.photo);
    return typeof d === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(d) && d.length < 400000 ? d : null;
  },
  setPhoto(dataUrl) { this.set(KEYS.photo, dataUrl); },
  clearPhoto() { this.remove(KEYS.photo); },

  getCups() {
    const n = Math.floor(Number(this.get(KEYS.cups)));
    return Number.isFinite(n) && n > 0 && n < 100000 ? n : 0;
  },
  addCup() { this.set(KEYS.cups, String(this.getCups() + 1)); },

  getNickname() { return this.get(KEYS.nick) || ''; },
  setNickname(n) { this.set(KEYS.nick, n); },

  getBoard() {
    try {
      const arr = JSON.parse(this.get(KEYS.board) || '[]');
      if (!Array.isArray(arr)) return [];
      return arr.map(sanitizeEntry).filter(Boolean);
    } catch (_) { return []; }
  },
  addToBoard(entry) {
    const list = this.getBoard();
    list.push(entry);
    list.sort((a, b) => b.score - a.score);
    this.set(KEYS.board, JSON.stringify(list.slice(0, 20)));   // tối đa 20 bản ghi
  },
  clearAll() { [KEYS.best, KEYS.board].forEach((k) => this.remove(k)); }
};

/** Chuẩn hoá 1 bản ghi thành tích; trả về null nếu không hợp lệ. */
function sanitizeEntry(e) {
  if (!e || typeof e !== 'object') return null;
  const nickname = typeof e.nickname === 'string' ? e.nickname.slice(0, 15) : '';
  const score = Math.floor(Number(e.score)), level = Math.floor(Number(e.level)), coins = Math.floor(Number(e.coins));
  if (!nickname || !Number.isFinite(score) || score < 0) return null;
  return {
    nickname, score,
    level: Number.isFinite(level) ? level : 1,
    coins: Number.isFinite(coins) ? coins : 0,
    created_at: typeof e.created_at === 'string' ? e.created_at : new Date().toISOString()
  };
}

/** Kiểm tra nickname: 2–15 ký tự, chỉ chữ/số/khoảng trắng/_-. ; chặn HTML & ký tự điều khiển. */
function validateNickname(raw) {
  const nick = String(raw || '').replace(/\s+/g, ' ').trim();
  const len = [...nick].length;
  if (len < 2 || len > 15) return { ok: false, error: 'Tên cần từ 2 đến 15 ký tự nhé!' };
  if (!/^[\p{L}\p{N} _.\-]+$/u.test(nick)) return { ok: false, error: 'Tên chỉ dùng chữ, số và khoảng trắng thôi nhé!' };
  return { ok: true, value: nick };
}

// ---------------------------------------------------------------------
// 3. ÂM THANH (tổng hợp bằng WebAudio, không cần file)
// ---------------------------------------------------------------------
const Sound = {
  ctx: null,
  enabled: Storage.getSound(),

  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    } catch (_) { this.ctx = null; }
  },
  tone(freq, dur, type = 'sine', vol = 0.15, slideTo = null, delay = 0) {
    if (!this.enabled || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    } catch (_) { /* âm thanh lỗi thì bỏ qua */ }
  },
  play(name) {
    switch (name) {
      case 'start':  this.tone(392, .12, 'square', .1); this.tone(523, .12, 'square', .1, null, .12); this.tone(784, .2, 'square', .1, null, .24); break;
      case 'coin':   this.tone(988, .08, 'square', .09); this.tone(1319, .14, 'square', .09, null, .07); break;
      case 'power':  this.tone(523, .1, 'triangle', .15); this.tone(659, .1, 'triangle', .15, null, .09); this.tone(988, .2, 'triangle', .15, null, .18); break;
      case 'shield': this.tone(300, .25, 'sawtooth', .12, 120); break;
      case 'hit':    this.tone(200, .35, 'sawtooth', .2, 40); break;
      case 'over':   this.tone(392, .25, 'triangle', .15, 330); this.tone(294, .25, 'triangle', .15, 247, .25); this.tone(196, .5, 'triangle', .15, 130, .5); break;
      case 'level':  [523, 659, 784, 1046].forEach((f, i) => this.tone(f, .16, 'square', .1, null, i * .1)); break;
      case 'turbo':  this.tone(200, .6, 'sawtooth', .12, 900); break;
      case 'move':   this.tone(520, .04, 'sine', .04); break;
      case 'rocket': this.tone(700, .3, 'sawtooth', .1, 160); break;
      case 'boom':   this.tone(160, .35, 'square', .16, 40); this.tone(90, .3, 'sawtooth', .12, 30, .05); break;
    }
  },
  setEnabled(on) { this.enabled = on; Storage.setSound(on); }
};

// ---------------------------------------------------------------------
// 4. ONLINE (Supabase) — chỉ là lớp bổ sung, lỗi mạng không làm game crash
// ---------------------------------------------------------------------
const Online = {
  client: null,

  /** Có cấu hình hợp lệ không? (và chắc chắn không phải service_role key) */
  configured() {
    try {
      if (typeof SUPABASE_URL !== 'string' || typeof SUPABASE_ANON_KEY !== 'string') return false;
      if (SUPABASE_URL.includes('YOUR_') || SUPABASE_ANON_KEY.includes('YOUR_')) return false;
      if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/i.test(SUPABASE_URL.trim())) return false;
      const payload = SUPABASE_ANON_KEY.split('.')[1];
      if (payload) {
        const role = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))).role;
        if (role === 'service_role') { console.error('Không dùng service_role key ở frontend!'); return false; }
      }
      return true;
    } catch (_) { return false; }
  },

  async init() {
    if (!this.configured()) return;
    try {
      if (!window.supabase) await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
      if (window.supabase && window.supabase.createClient) {
        this.client = window.supabase.createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim());
      }
    } catch (_) { this.client = null; }   // không tải được thư viện => offline
  }
};

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = resolve; s.onerror = () => reject(new Error('load failed'));
    document.head.appendChild(s);
  });
}
const withTimeout = (promise, ms = 8000) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

function isOnlineMode() { return !!Online.client; }

/** Lấy Top 10. Trả về { entries, source: 'online'|'local', error? } */
async function getLeaderboard() {
  const local = () => Storage.getBoard().sort((a, b) => b.score - a.score).slice(0, 10);
  if (!isOnlineMode()) return { entries: local(), source: 'local' };
  try {
    const { data, error } = await withTimeout(
      Online.client.from('leaderboard').select('nickname, score, level, coins, created_at')
        .order('score', { ascending: false }).limit(10)
    );
    if (error || !Array.isArray(data)) throw error || new Error('bad response');
    return { entries: data.map(sanitizeEntry).filter(Boolean), source: 'online' };
  } catch (err) {
    return { entries: local(), source: 'local', error: true };
  }
}

/** Gửi điểm: luôn lưu local trước, sau đó thử gửi online. */
async function submitScore(result) {
  const entry = sanitizeEntry({ ...result, created_at: new Date().toISOString() });
  if (!entry) return { ok: false, saved: false, error: 'invalid' };
  Storage.addToBoard(entry);
  if (!isOnlineMode()) return { ok: true, online: false };
  try {
    const { error } = await withTimeout(
      Online.client.from('leaderboard').insert({ nickname: entry.nickname, score: entry.score, level: entry.level, coins: entry.coins })
    );
    if (error) throw error;
    return { ok: true, online: true };
  } catch (_) {
    return { ok: true, online: false, failed: true };   // điểm đã nằm trong local
  }
}

// ---------------------------------------------------------------------
// 5. TRẠNG THÁI GAME
// ---------------------------------------------------------------------
const State = { START: 'START', PLAYING: 'PLAYING', PAUSED: 'PAUSED', LEVELUP: 'LEVELUP', GAME_OVER: 'GAME_OVER', RESULT: 'RESULT' };

// Trạng thái giải đấu — sống qua nhiều chặng, KHÔNG bị resetGame() xoá.
//  pts[0] = bé, pts[1..3] = các đối thủ (theo thứ tự RIVALS)
const tour = { active: false, stage: 0, pts: [0, 0, 0, 0], lastRank: [4, 4, 4, 4] };

const game = {};   // toàn bộ trạng thái ván chơi — được tạo lại hoàn toàn trong resetGame()
let state = State.START;
let highScore = Storage.getHighScore();
let selectedCarId = Storage.getCar();
const selectedCar = () => CARS.find((c) => c.id === selectedCarId) || CARS[0];

// Ảnh của bé gắn lên xe. photoImg chỉ khác null khi ảnh đã tải xong.
let photoImg = null;
function setPhotoImage(dataUrl, done) {
  if (!dataUrl) { photoImg = null; if (done) done(); return; }
  const img = new Image();
  img.onload = () => { photoImg = img; if (done) done(); };
  img.onerror = () => { photoImg = null; if (done) done(); };
  img.src = dataUrl;
}

/** Vẽ ảnh bé trong khung tròn có viền. */
function drawPhotoCircle(c, x, y, r, ring) {
  if (!photoImg) return false;
  c.save();
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.clip();
  c.drawImage(photoImg, x - r, y - r, r * 2, r * 2);
  c.restore();
  c.strokeStyle = ring || '#fff'; c.lineWidth = 2;
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
  return true;
}

/** Đọc file ảnh, cắt vuông chính giữa, thu nhỏ 128px rồi lưu. Trả về Promise<dataUrl>. */
function processPhotoFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) return reject(new Error('type'));
    if (file.size > 15 * 1024 * 1024) return reject(new Error('size'));
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const side = Math.min(img.naturalWidth, img.naturalHeight), S = 128;
        const cv = document.createElement('canvas');
        cv.width = cv.height = S;
        cv.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, S, S);
        resolve(cv.toDataURL('image/jpeg', 0.82));
      } catch (e) { reject(e); } finally { URL.revokeObjectURL(url); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
    img.src = url;
  });
}

function resetGame() {
  Object.assign(game, {
    levelIndex: 0,
    mode: 'endless',              // 'endless' (chơi tự do) hoặc 'tournament' (giải đấu)
    race: null,                   // dữ liệu chặng đua khi ở chế độ giải đấu
    stun: 0,                      // ms bị quay xe sau va chạm (giải đấu)
    gear: DEFAULT_GEAR,
    ammo: ROCKET.start, rockets: [], fireCd: 0, rechargeMs: 0,
    score: 0, coins: 0,
    combo: 0, bestCombo: 0,
    player: { lane: 1, x: laneX(1), tilt: 0, bob: 0 },
    obstacles: [], items: [],
    particles: [], texts: [],
    spawnProgress: 0,             // tích lũy theo quãng đường, không theo timer
    lastSafe: [0, 1, 2],          // các làn trống của hàng vật cản gần nhất
    zigzag: [],                   // hàng đợi chuỗi ngoằn ngoèo
    powers: { shield: false, magnet: 0, slow: 0, double: 0 },   // ms còn lại
    turbo: { value: 0, active: false, remaining: 0, ready: false },
    invulnerable: 1200,           // ms bảo vệ đầu ván / sau khi dùng khiên
    roadScroll: 0,
    shake: 0, flash: 0,
    overDelay: 0,
    submitted: false,
    newRecord: false,
    elapsed: 0
  });
}
resetGame();

const currentLevel = () => LEVELS[game.levelIndex];

// Tốc độ hiệu dụng: Turbo tăng cả đường; Slow Motion chỉ làm chậm vật cản.
const gearMul = () => GEARS[game.gear];
const roadSpeed = () => currentLevel().speed * gearMul() * (game.turbo.active ? TURBO.speedMul : 1) * (game.stun > 0 ? 0.4 : 1);
const obstacleSpeed = () => roadSpeed() * (game.powers.slow > 0 ? SLOW_MUL : 1);

const comboMultiplier = () => Math.min(3, 1 + Math.floor(game.combo / 5) * 0.5);

// ---------------------------------------------------------------------
// 6. SINH VẬT THỂ (spawn)
// ---------------------------------------------------------------------
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

function makeObstacle(type, lane) {
  const sizes = { car: [58, 96], truck: [66, 134], cone: [40, 40], barrier: [92, 34], puddle: [96, 62] };
  const [w, h] = sizes[type];
  return {
    type, lane, w, h,
    x: laneX(lane), y: -h - 20,
    color: pick(OBSTACLE_COLORS),
    passed: false
  };
}

/** Một "hàng" vật cản: 1–2 vật cản, luôn chừa >= 1 làn trống mà người chơi với tới được. */
function spawnRow() {
  const lv = currentLevel();
  let blocked;

  if (game.zigzag.length) {                            // đang chạy chuỗi ngoằn ngoèo
    const safe = game.zigzag.shift();
    blocked = [0, 1, 2].filter((l) => l !== safe);
  } else if (Math.random() < lv.zigzagChance) {        // bắt đầu chuỗi mới (3 hàng, mỗi hàng dịch 1 làn)
    const start = pick(game.lastSafe.filter((l) => l >= 0));
    let cur = Math.max(0, Math.min(2, start + pick([-1, 0, 1])));
    const seq = [];
    for (let i = 0; i < 3; i++) {
      seq.push(cur);
      cur = cur === 1 ? pick([0, 2]) : 1;
    }
    game.zigzag = seq.slice(1);
    blocked = [0, 1, 2].filter((l) => l !== seq[0]);
  } else {
    const count = Math.random() < lv.pairChance ? 2 : 1;
    blocked = null;
    for (let attempt = 0; attempt < 12 && !blocked; attempt++) {
      const cand = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, count);
      const free = [0, 1, 2].filter((l) => !cand.includes(l));
      // Anti-frustration: phải có làn trống nằm cách làn trống của hàng trước <= 1 làn.
      if (free.some((f) => game.lastSafe.some((s) => Math.abs(f - s) <= 1))) blocked = cand;
    }
    if (!blocked) blocked = [pick([0, 1, 2])];
  }

  const free = [0, 1, 2].filter((l) => !blocked.includes(l));
  game.lastSafe = free;

  for (const lane of blocked) {
    // Xe tải/puddle chỉ khi đi một mình trong hàng để không quá chật.
    let type = pick(lv.types);
    if (blocked.length > 1 && (type === 'truck')) type = 'car';
    const o = makeObstacle(type, lane);
    // Xoá xu/power-up nằm đè lên vị trí vật cản vừa sinh.
    game.items = game.items.filter((it) => !(it.lane === lane && Math.abs(it.y - o.y) < o.h / 2 + 55));
    game.obstacles.push(o);
  }

  // Xu và power-up đặt ở làn trống, nằm giữa hàng này và hàng kế tiếp.
  const gapPx = lv.speed * lv.spawnInterval / 1000;
  if (Math.random() < lv.coinChance) {
    const lane = pick(free);
    const n = pick([1, 2, 3, 3, 4]);
    for (let i = 0; i < n; i++) {
      game.items.push({ kind: 'coin', lane, x: laneX(lane), y: -40 - gapPx * 0.5 - i * 46, r: 14, spin: Math.random() * 6 });
    }
  }
  if (Math.random() < lv.powerupChance) {
    const lane = pick(free);
    game.items.push({ kind: 'power', power: pick(POWER_KEYS), lane, x: laneX(lane), y: -40 - gapPx * 0.5 - 170, r: 22, spin: 0 });
  }
}

// ---------------------------------------------------------------------
// 7. CẬP NHẬT (update)
// ---------------------------------------------------------------------
function addText(text, x, y, color = '#fff') {
  if (game.texts.length < 12) game.texts.push({ text, x, y, color, life: 0.9 });
}
function burst(x, y, color, n = 10, speed = 160) {
  for (let i = 0; i < n && game.particles.length < 140; i++) {
    const a = Math.random() * Math.PI * 2, s = rand(speed * 0.3, speed);
    game.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.4, 0.8), max: 0.8, color, size: rand(3, 7) });
  }
}

function changeLane(dir) {
  if (state !== State.PLAYING) return;
  const next = Math.max(0, Math.min(LANES - 1, game.player.lane + dir));
  if (next !== game.player.lane) { game.player.lane = next; Sound.play('move'); }
}

function changeGear(dir) {
  if (state !== State.PLAYING) return;
  const next = Math.max(0, Math.min(GEARS.length - 1, game.gear + dir));
  if (next === game.gear) return;
  game.gear = next;
  Sound.play('move');
  addText(dir > 0 ? '⏩ NHANH HƠN!' : '⏪ CHẬM LẠI', game.player.x, PLAYER.y - 60, dir > 0 ? '#ff9b2f' : '#7fe0ff');
}

function fireRocket() {
  if (state !== State.PLAYING || game.ammo <= 0 || game.fireCd > 0) return;
  if (game.mode === 'tournament' && game.race.countdown > 0) return;      // chưa xuất phát
  game.ammo--;
  game.fireCd = ROCKET.cooldown;
  game.rockets.push({ x: game.player.x, y: PLAYER.y - 50 });
  burst(game.player.x, PLAYER.y - 46, '#ffd93b', 6, 110);
  Sound.play('rocket');
}

/** Bay tên lửa; kiểm tra va chạm theo đoạn đường vừa bay để không "xuyên" qua vật cản mỏng. */
function updateRockets(dt) {
  if (!game.rockets.length) return;
  const keep = [];
  for (const r of game.rockets) {
    const prevY = r.y;
    r.y -= ROCKET.speed * dt;
    if (game.particles.length < 120) {                      // khói phía sau
      game.particles.push({ x: r.x, y: r.y + 16, vx: rand(-20, 20), vy: rand(20, 70), life: 0.35, max: 0.35, color: '#e6e9f0', size: rand(3, 6) });
    }
    const box = { x: r.x - 6, y: r.y - 14, w: 12, h: prevY - r.y + 28 };
    let hit = null;
    for (const o of game.obstacles) {
      if (isColliding(box, obstacleBox(o)) && (!hit || o.y > hit.y)) hit = o;   // trúng vật cản gần nhất
    }
    if (hit) { explodeObstacle(hit); continue; }
    if (r.y > -40) keep.push(r);
  }
  game.rockets = keep;
}

function explodeObstacle(o) {
  game.obstacles = game.obstacles.filter((x) => x !== o);
  const pts = Math.round(ROCKET.bonus * comboMultiplier() * gearMul());
  game.score += pts;
  addCombo(1);
  game.shake = Math.max(game.shake, 0.25);
  burst(o.x, o.y, '#ff9b2f', 16, 240);
  burst(o.x, o.y, '#ffd93b', 10, 180);
  burst(o.x, o.y, o.color || '#ffffff', 10, 200);
  addText(`💥 +${pts}`, o.x, o.y, '#ffe066');
  Sound.play('boom');
  UI.popStat('score');
}

function addTurbo(amount) {
  if (game.turbo.active) return;
  game.turbo.value = Math.min(TURBO.max, game.turbo.value + amount);
  if (game.turbo.value >= TURBO.max && !game.turbo.ready) {
    game.turbo.ready = true;
    Sound.play('power');
  }
}

function activateTurbo() {
  if (state !== State.PLAYING || game.turbo.active || !game.turbo.ready) return;
  game.turbo = { value: 0, active: true, remaining: TURBO.duration, ready: false };
  game.invulnerable = Math.max(game.invulnerable, TURBO.immuneMs);
  game.flash = 0.4;
  Sound.play('turbo');
  addText('TURBO!', game.player.x, PLAYER.y - 70, '#ffb400');
}

function addCombo(n = 1) {
  const before = Math.floor(game.combo / 5);
  game.combo += n;
  game.bestCombo = Math.max(game.bestCombo, game.combo);
  if (Math.floor(game.combo / 5) > before) {         // mốc combo: thưởng Turbo
    addTurbo(TURBO.combo);
    addText(`COMBO x${game.combo}!`, game.player.x, PLAYER.y - 100, '#ff4d6d');
  }
}

function collectPower(kind) {
  const def = POWERUPS[kind];
  if (kind === 'shield') game.powers.shield = true;
  else if (kind === 'rocket') game.ammo = Math.min(ROCKET.max, game.ammo + ROCKET.pickup);
  else if (kind === 'gift') { openGift(); return; }
  else game.powers[kind] = def.duration;           // nhặt lại => đặt lại thời gian, không cộng dồn vô hạn
  Sound.play('power');
  addText(`${def.icon} ${def.label}`, game.player.x, PLAYER.y - 80, '#fff');
}

/** Hộp quà 🎁: mở ra một phần thưởng ngẫu nhiên, ai cũng được thưởng. */
function openGift() {
  const roll = Math.random();
  let msg;
  if (roll < 0.3) {
    const pts = Math.round(100 * gearMul());
    game.score += pts; msg = `+${pts} ĐIỂM!`;
  } else if (roll < 0.55) {
    addTurbo(50); msg = '⚡ +TURBO!';
  } else if (roll < 0.8) {
    game.ammo = Math.min(ROCKET.max, game.ammo + 2); msg = '🚀 +2 TÊN LỬA!';
  } else {
    game.coins += 5; game.score += 50; msg = '🪙 +5 XU!';
  }
  burst(game.player.x, PLAYER.y - 30, '#ff6b9d', 10, 200);
  burst(game.player.x, PLAYER.y - 30, '#ffd93b', 10, 200);
  burst(game.player.x, PLAYER.y - 30, '#5cf06b', 8, 200);
  addText(`🎁 ${msg}`, game.player.x, PLAYER.y - 80, '#fff');
  Sound.play('level');
  UI.popStat('score'); UI.popStat('coins');
}

function collectCoin(item) {
  const dbl = game.powers.double > 0;
  const pts = Math.round(COIN_POINTS * (dbl ? 2 : 1) * comboMultiplier() * (game.turbo.active ? 2 : 1) * gearMul());
  game.score += pts;
  game.coins += dbl ? 2 : 1;
  addTurbo(TURBO.coin);
  addCombo(1);
  burst(item.x, item.y, '#ffd93b', 8, 140);
  addText(`+${pts}`, item.x, item.y - 10, '#ffe066');
  Sound.play('coin');
  UI.popStat('coins'); UI.popStat('score');
}

const playerBox = () => ({
  x: game.player.x - PLAYER.hitW / 2, y: PLAYER.y - PLAYER.hitH / 2, w: PLAYER.hitW, h: PLAYER.hitH
});
function isColliding(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
// Hitbox vật cản nhỏ hơn hình vẽ một chút để trẻ nhỏ không bị "chạm oan".
function obstacleBox(o) {
  const pad = 7;
  return { x: o.x - o.w / 2 + pad, y: o.y - o.h / 2 + pad, w: o.w - pad * 2, h: o.h - pad * 2 };
}

function updatePlayer(dt) {
  const p = game.player, target = laneX(p.lane);
  const prev = p.x;
  p.x += (target - p.x) * Math.min(1, dt * 14);          // di chuyển mượt tới làn mục tiêu
  p.tilt = Math.max(-0.25, Math.min(0.25, (p.x - prev) * 0.5 + p.tilt * 0.6));
  p.bob += dt * 12;
}

function updateTimers(dt) {
  const ms = dt * 1000, pw = game.powers;
  pw.magnet = Math.max(0, pw.magnet - ms);
  pw.slow = Math.max(0, pw.slow - ms);
  pw.double = Math.max(0, pw.double - ms);
  game.invulnerable = Math.max(0, game.invulnerable - ms);
  game.fireCd = Math.max(0, game.fireCd - ms);
  game.stun = Math.max(0, game.stun - ms);
  // Tự nạp tên lửa: thiếu so với số quả cơ bản thì cứ đủ 2 giây được cấp 1 quả mới.
  if (game.ammo < ROCKET.start) {
    game.rechargeMs += ms;
    if (game.rechargeMs >= ROCKET.recharge) {
      game.rechargeMs = 0;
      game.ammo++;
      addText('🚀 +1', game.player.x, PLAYER.y - 60, '#ffb4a8');
      Sound.play('power');
    }
  } else {
    game.rechargeMs = 0;
  }
  if (game.turbo.active) {
    game.turbo.remaining -= ms;
    if (game.turbo.remaining <= 0) {
      game.turbo.active = false; game.turbo.remaining = 0;
      game.invulnerable = Math.max(game.invulnerable, 600);    // chút an toàn khi hết Turbo
    }
  }
  game.shake = Math.max(0, game.shake - dt * 3);
  game.flash = Math.max(0, game.flash - dt * 2);
}

function updateSpawn(dt) {
  const lv = currentLevel();
  // Tiến trình spawn tính theo tốc độ vật cản => khoảng cách giữa các hàng luôn ổn định
  // (kể cả khi Slow Motion, Turbo hay đổi số tốc độ).
  game.spawnProgress += dt * 1000 * (obstacleSpeed() / lv.speed);
  if (game.spawnProgress >= lv.spawnInterval) {
    game.spawnProgress -= lv.spawnInterval;
    spawnRow();
  }
}

function updateObjects(dt) {
  const oSpeed = obstacleSpeed(), rSpeed = roadSpeed();
  game.roadScroll += rSpeed * dt;
  const pBox = playerBox();

  for (const o of game.obstacles) {
    o.y += oSpeed * dt;
    // Né thành công: vật cản vừa đi qua đuôi xe người chơi.
    if (!o.passed && o.y - o.h / 2 > PLAYER.y + PLAYER.hitH / 2) {
      o.passed = true;
      addCombo(1);
      if (Math.abs(o.lane - game.player.lane) === 1) {      // né sát => thưởng Turbo
        addTurbo(TURBO.nearMiss);
        addText('SUÝT SOẠT!', game.player.x, PLAYER.y - 60, '#ffe066');
      }
    }
  }
  game.obstacles = game.obstacles.filter((o) => o.y - o.h / 2 < H + 40);

  const magnetR = game.turbo.active ? TURBO_MAGNET_RADIUS : (game.powers.magnet > 0 ? MAGNET_RADIUS : 0);
  for (const it of game.items) {
    it.y += rSpeed * dt;
    it.spin += dt * 6;
    // Nam châm: chỉ hút xu đang nằm trong màn hình và trong bán kính.
    if (magnetR && it.kind === 'coin' && it.y > 0 && it.y < H) {
      const dx = game.player.x - it.x, dy = PLAYER.y - it.y, d = Math.hypot(dx, dy);
      if (d < magnetR && d > 1) {
        const pull = 650 * dt;
        it.x += (dx / d) * pull; it.y += (dy / d) * pull;
      }
    }
  }

  // Thu thập (khoảng cách tâm) — xu & power-up
  const remain = [];
  for (const it of game.items) {
    const d = Math.hypot(it.x - game.player.x, it.y - PLAYER.y);
    if (d < it.r + 34) {
      if (it.kind === 'coin') collectCoin(it); else collectPower(it.power);
    } else if (it.y < H + 40) remain.push(it);
  }
  game.items = remain;

  // Va chạm với vật cản
  for (const o of game.obstacles) {
    if (o.hit) continue;
    if (!isColliding(pBox, obstacleBox(o))) continue;
    if (game.invulnerable > 0) continue;                  // đang bảo vệ / Turbo
    if (game.powers.shield) {                             // khiên đỡ 1 lần
      game.powers.shield = false;
      game.invulnerable = 900;
      game.combo = 0;
      o.hit = true;
      game.shake = 0.5;
      burst(o.x, o.y, '#7fe0ff', 16, 220);
      addText('KHIÊN VỠ!', game.player.x, PLAYER.y - 80, '#7fe0ff');
      Sound.play('shield');
      game.obstacles = game.obstacles.filter((x) => x !== o);
      break;
    }
    if (game.mode === 'tournament') { crashRace(o); break; }   // giải đấu: quay xe, không Game Over
    gameOver();
    return;
  }
}

function updateEffects(dt) {
  for (const p of game.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.life -= dt; }
  game.particles = game.particles.filter((p) => p.life > 0);
  for (const t of game.texts) { t.y -= 40 * dt; t.life -= dt; }
  game.texts = game.texts.filter((t) => t.life > 0);
}

function updateScore(dt) {
  const lv = currentLevel();
  game.score += SURVIVE_POINTS_PER_SEC * dt * comboMultiplier() * (game.turbo.active ? 2 : 1) * (lv.scoreBonus || 1) * gearMul();
  if (game.mode === 'endless' && lv.targetScore !== Infinity && game.score >= lv.targetScore) levelUp();
}

// ---------------------------------------------------------------------
// 7b. GIẢI ĐẤU: đối thủ, vạch đích, xếp hạng
// ---------------------------------------------------------------------
function crashRace(o) {
  game.obstacles = game.obstacles.filter((x) => x !== o);
  game.stun = 1300;                              // quay xe, chạy chậm 1,3 giây
  game.invulnerable = 2300;                      // rồi được bảo vệ thêm một chút
  game.combo = 0;
  game.shake = 0.6;
  burst(game.player.x, PLAYER.y - 20, '#ff9b2f', 14, 220);
  addText('ÔI! VA CHẠM', game.player.x, PLAYER.y - 80, '#ff8a80');
  Sound.play('hit');
}

/** Hạng hiện tại của bé: 1 + số đối thủ đang chạy trước. */
function currentRank() {
  const r = game.race;
  return 1 + r.rivals.filter((v) => v.dist > r.dist).length;
}

function updateRace(dt) {
  const r = game.race, lv = currentLevel();
  r.dist += roadSpeed() * dt;

  for (const v of r.rivals) {
    if (v.finishedAt === null) {
      const def = RIVALS[v.idx];
      const wobble = 1 + 0.06 * Math.sin(game.elapsed * 0.7 + v.idx * 2);         // lúc nhanh lúc chậm cho giống thật
      const gap = v.dist - r.dist;
      const band = gap > 800 ? 0.9 : gap < -800 ? 1.08 : 1;                      // kéo gần khoảng cách để cuộc đua luôn hấp dẫn
      v.dist += lv.speed * (def.pace + tour.stage * 0.01) * wobble * band * dt;
      if (v.dist >= r.length) { v.dist = r.length; v.finishedAt = game.elapsed; }
    }
    // Đối thủ tự né vật cản: chọn làn không có vật cản gần, tránh làn của bé khi đang sát nhau.
    const y = PLAYER.y - (v.dist - r.dist);
    let lane = v.lane;
    const blocked = (l) =>
      game.obstacles.some((o) => o.lane === l && Math.abs(o.y - y) < o.h / 2 + 70) ||
      (Math.abs(y - PLAYER.y) < 110 && game.player.lane === l);
    if (blocked(lane)) {
      const alt = [0, 1, 2].filter((l) => !blocked(l));
      if (alt.length) lane = alt.sort((a, b) => Math.abs(a - lane) - Math.abs(b - lane))[0];
    }
    v.lane = lane;
    v.x += (laneX(lane) - v.x) * Math.min(1, dt * 6);
  }

  if (r.dist >= r.length) finishRace();
}

// ----- Luồng giải đấu -----
function startTournament() {
  Sound.unlock();
  resetGame();                                   // dọn cảnh đua cũ (về chế độ nền màn hình chính)
  tour.active = true; tour.stage = 0; tour.pts = [0, 0, 0, 0]; tour.lastRank = [4, 4, 4, 4];
  showRaceScreen('intro');
}

function startStage(i) {
  Sound.unlock();
  tour.stage = i;
  resetGame();
  const st = STAGES[i];
  game.mode = 'tournament';
  game.levelIndex = st.level;
  game.invulnerable = 0;
  game.race = {
    length: st.length, dist: 0, countdown: COUNTDOWN_MS, goFlash: 0, lastBeep: 4,
    rivals: RIVALS.map((def, idx) => ({ idx, dist: def.start, finishedAt: null, lane: def.lane, x: laneX(def.lane) }))
  };
  game.spawnProgress = -currentLevel().spawnInterval * 1.2;   // vật cản đầu tiên đến sau một lúc
  state = State.PLAYING;
  UI.cache = {};
  UI.hideAll();
  el.hud.hidden = false;
  UI.buildRaceTrack();
  UI.updateHud();
}

function restartCurrentMode() {
  if (game.mode === 'tournament' && tour.active) startStage(tour.stage); else startGame();
}

/** Về đích: xếp hạng, cộng điểm giải đấu, hiện bảng kết quả chặng. */
function finishRace() {
  const r = game.race;
  // Thứ tự: đối thủ về đích trước bé (theo giờ về đích) → bé → đối thủ còn lại (theo quãng đường)
  const before = r.rivals.filter((v) => v.finishedAt !== null).sort((a, b) => a.finishedAt - b.finishedAt);
  const after = r.rivals.filter((v) => v.finishedAt === null).sort((a, b) => b.dist - a.dist);
  const order = [...before.map((v) => v.idx + 1), 0, ...after.map((v) => v.idx + 1)];   // 0 = bé
  order.forEach((who, place) => { tour.pts[who] += RACE_POINTS[place]; tour.lastRank[who] = place + 1; });
  game.stageOrder = order;
  state = State.RESULT;
  el.banner.hidden = true;
  Sound.play(order[0] === 0 ? 'level' : 'over');
  showRaceScreen('result');
}

function update(dt) {
  if (game.mode === 'tournament' && game.race.countdown > 0) {      // đếm ngược 3-2-1 trước khi xuất phát
    game.race.countdown -= dt * 1000;
    const n = Math.ceil(game.race.countdown / 1000);
    if (n !== game.race.lastBeep) { game.race.lastBeep = n; Sound.play(n > 0 ? 'move' : 'start'); }
    if (game.race.countdown <= 0) game.race.goFlash = 0.8;
    updatePlayer(dt);
    return;
  }
  game.elapsed += dt;
  if (game.mode === 'tournament') game.race.goFlash = Math.max(0, game.race.goFlash - dt);
  updatePlayer(dt);
  updateTimers(dt);
  updateSpawn(dt);
  updateRockets(dt);
  updateObjects(dt);
  if (state !== State.PLAYING) return;           // có thể đã Game Over trong updateObjects
  if (game.mode === 'tournament') {
    updateRace(dt);
    if (state !== State.PLAYING) return;         // đã về đích
  }
  updateScore(dt);
  updateEffects(dt);
  // Tự đổi trạng thái Turbo sẵn sàng sau khi meter đầy
  if (game.turbo.active) game.turbo.ready = false;
}

// ---------------------------------------------------------------------
// 8. VẼ (render) — mọi thứ vẽ bằng canvas, không phụ thuộc file ảnh
// ---------------------------------------------------------------------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let scale = 1;

function resizeCanvas() {
  const stage = document.getElementById('stage');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = stage.clientWidth, h = stage.clientHeight;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  scale = canvas.width / W;
  stage.style.setProperty('--u', (w / W) + 'px');
}

function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

// Xe đua F1 nhìn từ trên xuống (mũi xe hướng lên). Dùng cho xe người chơi và xe đối thủ.
function drawF1(c, cx, cy, w, h, color, opts = {}) {
  const s = h / 92;                                  // tỉ lệ so với kích thước chuẩn 56x92
  c.save();
  c.translate(cx, cy);
  if (opts.tilt) c.rotate(opts.tilt);
  c.scale(s, s);
  const dark = '#1d1f27';
  const acc = opts.player ? (opts.acc || '#27d4ff') : '#ffffff';   // màu viền sáng (mặc định xe bé: cyan kiểu Formula E)
  const trim = opts.player ? acc : color;
  // bóng đổ
  c.fillStyle = 'rgba(0,0,0,.2)';
  rr(c, -20, -40, 44, 90, 14); c.fill();
  // trục bánh
  c.fillStyle = '#444'; c.fillRect(-26, -27, 52, 3); c.fillRect(-26, 24, 52, 3);
  // bánh sau (to) và bánh trước (nhỏ hơn)
  c.fillStyle = dark;
  rr(c, -33, 12, 14, 26, 5); c.fill(); rr(c, 19, 12, 14, 26, 5); c.fill();
  rr(c, -30, -36, 11, 19, 4); c.fill(); rr(c, 19, -36, 11, 19, 4); c.fill();
  c.fillStyle = opts.player ? acc : '#c9ccd6';       // mâm bánh
  c.fillRect(-29, 21, 4, 8); c.fillRect(25, 21, 4, 8);
  c.fillRect(-27, -30, 3, 6); c.fillRect(24, -30, 3, 6);
  // cánh sau
  c.fillStyle = dark; rr(c, -26, 36, 52, 9, 3); c.fill();
  c.fillStyle = trim; rr(c, -28, 33, 6, 15, 2); c.fill(); rr(c, 22, 33, 6, 15, 2); c.fill();
  if (opts.player) { c.fillStyle = acc; c.fillRect(-20, 37, 40, 2); }              // vạch sáng cánh sau
  // thân xe thon dài
  c.fillStyle = color; c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = 2.5;
  c.beginPath();
  c.moveTo(0, -46);
  c.quadraticCurveTo(7, -34, 8, -18);
  c.quadraticCurveTo(18, -8, 17, 12);     // hông xe (sidepod)
  c.quadraticCurveTo(15, 30, 8, 40);
  c.lineTo(-8, 40);
  c.quadraticCurveTo(-15, 30, -17, 12);
  c.quadraticCurveTo(-18, -8, -8, -18);
  c.quadraticCurveTo(-7, -34, 0, -46);
  c.closePath(); c.fill(); c.stroke();
  if (opts.player) {
    // ánh kim ở hông xe + đường viền sáng chạy dọc thân (như xe Formula E)
    c.fillStyle = 'rgba(255,255,255,.08)'; rr(c, -14, -8, 8, 40, 4); c.fill(); rr(c, 6, -8, 8, 40, 4); c.fill();
    c.strokeStyle = acc; c.lineWidth = 2.2; c.lineCap = 'round';
    c.beginPath(); c.moveTo(0, -43); c.lineTo(0, -20); c.stroke();                 // sọc mũi xe
    c.beginPath(); c.moveTo(-6, -22); c.quadraticCurveTo(-14, -6, -12, 30); c.stroke();
    c.beginPath(); c.moveTo(6, -22); c.quadraticCurveTo(14, -6, 12, 30); c.stroke();
    c.beginPath(); c.moveTo(0, 14); c.lineTo(0, 36); c.stroke();                   // sọc nắp động cơ
  } else {
    c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(-2.5, -44, 5, 82);
  }
  // cửa hút gió hai bên
  c.fillStyle = 'rgba(0,0,0,.35)'; rr(c, -13, -6, 7, 12, 3); c.fill(); rr(c, 6, -6, 7, 12, 3); c.fill();
  // buồng lái + mũ bảo hiểm
  c.fillStyle = dark; c.beginPath(); c.ellipse(0, -2, 7, 11, 0, 0, 7); c.fill();
  c.fillStyle = opts.player ? (opts.helmet || '#ffd93b') : '#fff'; c.beginPath(); c.arc(0, -3, 5, 0, 7); c.fill();
  c.fillStyle = '#2f9bff'; rr(c, -3.5, -6.5, 7, 3.5, 1.5); c.fill();         // kính mũ
  if (opts.player && photoImg) drawPhotoCircle(c, 0, -4, 10.5, opts.helmet || '#ffd93b');   // mặt bé thay cho mũ bảo hiểm
  // hộp khí phía sau mũ
  c.fillStyle = dark; c.beginPath(); c.arc(0, 9, 4, 0, 7); c.fill();
  // khung bảo vệ halo trên buồng lái
  c.strokeStyle = '#8b93a5'; c.lineWidth = 2.4; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-8, 6); c.lineTo(-7, -8); c.lineTo(0, -15); c.lineTo(7, -8); c.lineTo(8, 6); c.stroke();
  c.beginPath(); c.moveTo(0, -15); c.lineTo(0, -9); c.stroke();
  // cánh trước
  c.fillStyle = dark; rr(c, -28, -46, 56, 8, 3); c.fill();
  c.fillStyle = trim; rr(c, -29, -48, 6, 14, 2); c.fill(); rr(c, 23, -48, 6, 14, 2); c.fill();
  if (opts.player) { c.fillStyle = acc; c.fillRect(-20, -44, 40, 2); }
  c.restore();
}

function drawCar(c, cx, cy, w, h, color, opts = {}) {
  if (!opts.truck && opts.style !== 'sport') { drawF1(c, cx, cy, w, h, color, opts); return; }
  c.save();
  c.translate(cx, cy);
  if (opts.tilt) c.rotate(opts.tilt);
  // bóng
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -w / 2 + 4, -h / 2 + 6, w, h, 14); c.fill();
  // bánh xe
  c.fillStyle = '#25262b';
  const wy = [-h / 2 + h * 0.12, h / 2 - h * 0.12 - h * 0.2];
  for (const y of wy) { rr(c, -w / 2 - 5, y, 9, h * 0.2, 3); c.fill(); rr(c, w / 2 - 4, y, 9, h * 0.2, 3); c.fill(); }
  // thân xe
  c.fillStyle = color; c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 3;
  rr(c, -w / 2, -h / 2, w, h, 16); c.fill(); c.stroke();
  if (opts.truck) {
    c.fillStyle = '#f4f1e8'; rr(c, -w / 2 + 5, -h / 2 + h * 0.36, w - 10, h * 0.58, 6); c.fill(); c.stroke();
    c.fillStyle = '#bfe9ff'; rr(c, -w / 2 + 8, -h / 2 + h * 0.1, w - 16, h * 0.16, 6); c.fill();
  } else {
    if (opts.player) {                                  // sọc đua
      c.fillStyle = opts.acc || '#fff'; c.globalAlpha = 0.9; c.fillRect(-5, -h / 2 + 2, 10, h - 4);
      c.globalAlpha = 0.55; c.fillRect(-w / 2 + 8, -h / 2 + 2, 4, h - 4); c.globalAlpha = 1;
    }
    c.fillStyle = '#bfe9ff';
    rr(c, -w / 2 + 8, -h / 2 + h * 0.24, w - 16, h * 0.17, 6); c.fill();           // kính trước
    rr(c, -w / 2 + 9, h / 2 - h * 0.28, w - 18, h * 0.12, 5); c.fill();            // kính sau
    c.fillStyle = 'rgba(255,255,255,.28)'; rr(c, -w / 2 + 9, -h / 2 + h * 0.43, w - 18, h * 0.22, 6); c.fill(); // nóc
    if (opts.player && photoImg) drawPhotoCircle(c, 0, -h / 2 + h * 0.54, 12, opts.acc || '#fff');   // ảnh bé trên nóc xe
    if (opts.lights) {                                  // đèn nháy trên nóc (xe cảnh sát)
      const flip = Math.floor(performance.now() / 180) % 2 === 0;
      c.fillStyle = flip ? '#ff3b3b' : '#6a2020'; rr(c, -w / 2 + 11, -h / 2 + h * 0.47, 14, 8, 3); c.fill();
      c.fillStyle = flip ? '#1e3d7a' : '#3da5ff'; rr(c, w / 2 - 25, -h / 2 + h * 0.47, 14, 8, 3); c.fill();
    }
  }
  // đèn
  c.fillStyle = '#fff6a8'; c.fillRect(-w / 2 + 5, -h / 2 + 3, 10, 5); c.fillRect(w / 2 - 15, -h / 2 + 3, 10, 5);
  c.fillStyle = '#ff4d4d'; c.fillRect(-w / 2 + 5, h / 2 - 8, 10, 5); c.fillRect(w / 2 - 15, h / 2 - 8, 10, 5);
  c.restore();
}

function drawCone(c, o) {
  c.save(); c.translate(o.x, o.y);
  c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(3, 4, 22, 20, 0, 0, 7); c.fill();
  c.fillStyle = '#e8741a'; rr(c, -19, -19, 38, 38, 8); c.fill();
  c.fillStyle = '#ff9b2f'; c.beginPath(); c.arc(0, 0, 15, 0, 7); c.fill();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill();
  c.fillStyle = '#ff7a1a'; c.beginPath(); c.arc(0, 0, 5, 0, 7); c.fill();
  c.restore();
}
function drawBarrier(c, o) {
  c.save(); c.translate(o.x, o.y);
  c.fillStyle = 'rgba(0,0,0,.2)'; rr(c, -o.w / 2 + 3, -o.h / 2 + 5, o.w, o.h, 8); c.fill();
  c.save(); rr(c, -o.w / 2, -o.h / 2, o.w, o.h, 8); c.clip();
  c.fillStyle = '#fff'; c.fillRect(-o.w / 2, -o.h / 2, o.w, o.h);
  c.fillStyle = '#ee4b4b';
  for (let i = -6; i < 8; i++) { c.beginPath(); c.moveTo(-o.w / 2 + i * 18, o.h / 2); c.lineTo(-o.w / 2 + i * 18 + 10, o.h / 2); c.lineTo(-o.w / 2 + i * 18 + 28, -o.h / 2); c.lineTo(-o.w / 2 + i * 18 + 18, -o.h / 2); c.fill(); }
  c.restore();
  c.strokeStyle = '#7a2222'; c.lineWidth = 3; rr(c, -o.w / 2, -o.h / 2, o.w, o.h, 8); c.stroke();
  c.restore();
}
function drawPuddle(c, o, t) {
  c.save(); c.translate(o.x, o.y);
  c.fillStyle = '#5ab8ff'; c.strokeStyle = '#2f86d6'; c.lineWidth = 3;
  c.beginPath(); c.ellipse(0, 0, o.w / 2, o.h / 2, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,255,255,.65)';
  c.beginPath(); c.ellipse(-14, -8, 14, 6, -0.3, 0, 7); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2;
  c.beginPath(); c.ellipse(10, 6, 8 + Math.sin(t * 4) * 2, 4, 0, 0, 7); c.stroke();
  c.restore();
}

function drawCoin(c, it) {
  const sx = Math.abs(Math.cos(it.spin));        // xoay quanh trục dọc
  c.save(); c.translate(it.x, it.y); c.scale(Math.max(0.15, sx), 1);
  c.fillStyle = '#e0a800'; c.beginPath(); c.arc(0, 0, it.r, 0, 7); c.fill();
  c.fillStyle = '#ffd93b'; c.beginPath(); c.arc(0, 0, it.r - 3, 0, 7); c.fill();
  c.fillStyle = '#fff3a6'; c.font = 'bold 16px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('★', 0, 1);
  c.restore();
}
function drawPowerItem(c, it, t) {
  const def = POWERUPS[it.power], bob = Math.sin(t * 5 + it.x) * 3;
  c.save(); c.translate(it.x, it.y + bob);
  c.fillStyle = 'rgba(255,255,255,.9)'; c.strokeStyle = '#2f9bff'; c.lineWidth = 4;
  c.beginPath(); c.arc(0, 0, it.r + 4, 0, 7); c.fill(); c.stroke();
  c.font = def.icon === '×2' ? 'bold 22px Arial' : '24px Arial';
  c.fillStyle = '#d0720f'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(def.icon, 0, 2);
  c.restore();
}

function drawRocket(c, r, t) {
  c.save(); c.translate(r.x, r.y);
  // lửa đuôi
  c.fillStyle = '#ff9b2f';
  c.beginPath(); c.moveTo(-4, 12); c.lineTo(4, 12); c.lineTo(0, 24 + Math.sin(t * 60) * 4); c.fill();
  c.fillStyle = '#ffe066';
  c.beginPath(); c.moveTo(-2, 12); c.lineTo(2, 12); c.lineTo(0, 18 + Math.sin(t * 70) * 2); c.fill();
  // cánh đuôi
  c.fillStyle = '#e8453c';
  c.beginPath(); c.moveTo(-4, 4); c.lineTo(-10, 14); c.lineTo(-4, 12); c.fill();
  c.beginPath(); c.moveTo(4, 4); c.lineTo(10, 14); c.lineTo(4, 12); c.fill();
  // thân + mũi
  c.fillStyle = '#f4f6fb'; c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.5;
  rr(c, -4.5, -8, 9, 20, 3); c.fill(); c.stroke();
  c.fillStyle = '#e8453c';
  c.beginPath(); c.moveTo(-4.5, -8); c.quadraticCurveTo(0, -22, 4.5, -8); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#2f9bff'; c.beginPath(); c.arc(0, 0, 2.5, 0, 7); c.fill();   // cửa sổ
  c.restore();
}

/** Vạch đích caro, trượt xuống khi bé đến gần cuối đường đua. */
function drawFinishLine(c) {
  const r = game.race;
  const y = PLAYER.y - (r.length - r.dist);
  if (y < -60 || y > H + 60) return;
  const cell = 19, rows = 3;
  c.save();
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i * cell < ROAD_W; i++) {
      c.fillStyle = (i + row) % 2 === 0 ? '#fff' : '#23262d';
      c.fillRect(ROAD_X + i * cell, y - (rows * cell) / 2 + row * cell, Math.min(cell, ROAD_W - i * cell), cell);
    }
  }
  c.fillStyle = '#ee4b4b'; c.fillRect(ROAD_X - 10, y - 40, 10, 80); c.fillRect(ROAD_X + ROAD_W, y - 40, 10, 80);   // cổng
  c.font = '800 24px "Baloo 2", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = 5; c.strokeStyle = '#23406b'; c.strokeText('🏁 ĐÍCH 🏁', W / 2, y - 48);
  c.fillStyle = '#fff'; c.fillText('🏁 ĐÍCH 🏁', W / 2, y - 48);
  c.restore();
}

/** Xe đối thủ: vẽ theo khoảng cách so với bé, kèm nhãn tên để không nhầm với xe cản đường. */
function drawRivals(c) {
  const r = game.race;
  for (const v of r.rivals) {
    const def = RIVALS[v.idx], y = PLAYER.y - (v.dist - r.dist);
    if (y < -90 || y > H + 90) continue;
    drawCar(c, v.x, y, PLAYER.w, PLAYER.h, def.body, { style: 'f1' });
    c.save();
    c.font = '800 14px "Baloo 2", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const label = `${def.emoji} ${def.name}`, tw = c.measureText(label).width + 14;
    c.fillStyle = 'rgba(255,255,255,.92)'; rr(c, v.x - tw / 2, y - 70, tw, 20, 10); c.fill();
    c.fillStyle = '#23406b'; c.fillText(label, v.x, y - 60);
    c.restore();
  }
}

function drawCountdown(c) {
  const r = game.race;
  let text = null;
  if (r.countdown > 0) text = String(Math.ceil(r.countdown / 1000));
  else if (r.goFlash > 0) text = 'ĐUA!';
  if (!text) return;
  c.save();
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = '800 130px "Baloo 2", Arial';
  c.lineWidth = 12; c.strokeStyle = '#23406b'; c.strokeText(text, W / 2, H * 0.38);
  c.fillStyle = text === 'ĐUA!' ? '#5cf06b' : '#ffd93b'; c.fillText(text, W / 2, H * 0.38);
  c.restore();
}

function drawBackground(c, lv, scroll, t) {
  c.fillStyle = lv.grass; c.fillRect(0, 0, W, H);
  // cây / bụi hai bên đường (vị trí theo chỉ số thế giới => ổn định khi cuộn)
  const step = 130, base = Math.floor(scroll / step), off = scroll % step;
  for (let k = -1; k < H / step + 2; k++) {
    const idx = base - k, y = k * step + off;
    const hsh = Math.abs((idx * 2654435761) % 997);
    for (const side of [0, 1]) {
      const x = side ? W - 25 + (hsh % 7) - 3 : 25 - (hsh % 7) + 3;
      const yy = y + (side ? 55 : 0);
      if ((hsh + side) % 3 === 0) {              // bụi hoa
        c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x + 2, yy + 5, 14, 9, 0, 0, 7); c.fill();
        c.fillStyle = '#4fc15f'; c.beginPath(); c.arc(x, yy, 12, 0, 7); c.fill();
        c.fillStyle = pick2(hsh); c.beginPath(); c.arc(x - 4, yy - 3, 4, 0, 7); c.arc(x + 5, yy + 2, 3.5, 0, 7); c.fill();
      } else {                                   // cây tròn
        c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(x + 4, yy + 6, 18, 13, 0, 0, 7); c.fill();
        c.fillStyle = lv.special ? '#8a62d6' : '#2fa84f'; c.beginPath(); c.arc(x, yy, 18, 0, 7); c.fill();
        c.fillStyle = lv.special ? '#a785ee' : '#4cc86e'; c.beginPath(); c.arc(x - 5, yy - 5, 9, 0, 7); c.fill();
      }
    }
  }
  // mặt đường
  c.fillStyle = lv.road; c.fillRect(ROAD_X, 0, ROAD_W, H);
  // lề đường sọc đỏ trắng
  const curb = 40, co = scroll % (curb * 2);
  for (let y = -curb * 2; y < H + curb; y += curb) {
    const alt = Math.round((y - co) / curb) % 2 === 0;
    c.fillStyle = alt ? '#fff' : (lv.special ? '#ff7ad9' : '#ee4b4b');
    c.fillRect(ROAD_X - 8, y + co, 8, curb); c.fillRect(ROAD_X + ROAD_W, y + co, 8, curb);
  }
  // vạch ngăn làn
  c.fillStyle = 'rgba(255,255,255,.85)';
  const dash = 44, gap = 36, cycle = dash + gap, lo = scroll % cycle;
  for (let i = 1; i < LANES; i++) {
    const x = ROAD_X + LANE_W * i - 3;
    for (let y = -cycle; y < H + cycle; y += cycle) c.fillRect(x, y + lo, 6, dash);
  }
  if (lv.special) {                              // lấp lánh ở level 10
    c.fillStyle = 'rgba(255,255,255,.7)';
    for (let i = 0; i < 14; i++) {
      const sx = (i * 97 + t * 20) % W, sy = (i * 211 + t * 35) % H;
      c.fillRect(sx, sy, 3, 3);
    }
  }
}
const FLOWER_COLORS = ['#ff6b9d', '#ffd93b', '#fff', '#ff9b2f'];
function pick2(h) { return FLOWER_COLORS[h % FLOWER_COLORS.length]; }

function drawPlayer(c, t) {
  const p = game.player, y = PLAYER.y + Math.sin(p.bob) * 1.2;
  // lửa/trail Turbo
  if (game.turbo.active) {
    for (let i = 0; i < 6; i++) {
      const a = 0.5 - i * 0.07;
      c.fillStyle = `rgba(255,${150 - i * 18},30,${Math.max(0, a)})`;
      c.beginPath();
      c.moveTo(p.x - 18 + i, y + PLAYER.h / 2 - 4);
      c.lineTo(p.x + 18 - i, y + PLAYER.h / 2 - 4);
      c.lineTo(p.x, y + PLAYER.h / 2 + 30 + i * 22 + Math.sin(t * 40 + i) * 6);
      c.fill();
    }
  }
  // nhấp nháy khi đang được bảo vệ ngắn (không phải Turbo)
  const blink = game.invulnerable > 0 && !game.turbo.active && Math.floor(t * 12) % 2 === 0;
  const car = selectedCar();
  if (!blink) drawCar(c, p.x, y, PLAYER.w, PLAYER.h, car.body, { player: true, tilt: p.tilt + (game.stun > 0 ? Math.sin(t * 30) * 0.6 : 0), style: car.style, acc: car.acc, helmet: car.helmet, lights: car.lights });
  // khiên
  if (game.powers.shield) {
    c.save();
    c.strokeStyle = 'rgba(80,200,255,.95)'; c.fillStyle = 'rgba(127,224,255,.28)'; c.lineWidth = 4;
    c.beginPath(); c.arc(p.x, y, 58 + Math.sin(t * 6) * 2, 0, 7); c.fill(); c.stroke();
    c.restore();
  }
  // vòng nam châm
  if (game.powers.magnet > 0 || game.turbo.active) {
    c.save();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.setLineDash([8, 10]); c.lineWidth = 2;
    c.lineDashOffset = -t * 30;
    c.beginPath(); c.arc(p.x, y, game.turbo.active ? TURBO_MAGNET_RADIUS : MAGNET_RADIUS, 0, 7); c.stroke();
    c.restore();
  }
}

function render(t) {
  const lv = currentLevel();
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.save();
  if (game.shake > 0) ctx.translate(rand(-1, 1) * game.shake * 10, rand(-1, 1) * game.shake * 10);

  drawBackground(ctx, lv, game.roadScroll, t);

  if (game.mode === 'tournament') drawFinishLine(ctx);
  for (const it of game.items) it.kind === 'coin' ? drawCoin(ctx, it) : drawPowerItem(ctx, it, t);
  for (const o of game.obstacles) {
    if (o.type === 'car') drawCar(ctx, o.x, o.y, o.w, o.h, o.color);
    else if (o.type === 'truck') drawCar(ctx, o.x, o.y, o.w, o.h, o.color, { truck: true });
    else if (o.type === 'cone') drawCone(ctx, o);
    else if (o.type === 'barrier') drawBarrier(ctx, o);
    else drawPuddle(ctx, o, t);
  }

  if (game.mode === 'tournament') drawRivals(ctx);
  for (const r of game.rockets) drawRocket(ctx, r, t);
  if (state !== State.GAME_OVER || game.overDelay > 0.35) drawPlayer(ctx, t);

  for (const p of game.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '800 22px "Baloo 2", Arial';
  for (const tx of game.texts) {
    ctx.globalAlpha = Math.min(1, tx.life * 2);
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(35,64,107,.85)'; ctx.strokeText(tx.text, tx.x, tx.y);
    ctx.fillStyle = tx.color; ctx.fillText(tx.text, tx.x, tx.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (game.mode === 'tournament' && state !== State.START) drawCountdown(ctx);

  if (game.flash > 0) {                          // loé sáng khi Turbo / va chạm
    ctx.fillStyle = `rgba(255,255,255,${game.flash * 0.6})`;
    ctx.fillRect(0, 0, W, H);
  }
  // Turbo: vệt tốc độ hai bên
  if (game.turbo.active) {
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;
    for (let i = 0; i < 10; i++) {
      const x = ROAD_X + ((i * 61 + 13) % ROAD_W), y = (t * 900 + i * 97) % (H + 120) - 60;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 50); ctx.stroke();
    }
  }
}

// ---------------------------------------------------------------------
// 9. GIAO DIỆN (DOM)
// ---------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const el = {
  hud: $('hud'), score: $('hud-score'), coins: $('hud-coins'), best: $('hud-best'), level: $('hud-level'),
  powers: $('hud-powers'), combo: $('hud-combo'), turbo: $('hud-turbo'), turboFill: $('turbo-fill'), turboLabel: $('turbo-label'),
  banner: $('banner'), btnTurbo: $('btn-turbo'), btnFire: $('btn-fire'), fireCount: $('fire-count'),
  speed: $('hud-speed'), btnSlower: $('btn-slower'), btnFaster: $('btn-faster'),
  raceTrack: $('race-track'),
  screens: {
    start: $('screen-start'), pause: $('screen-pause'), levelup: $('screen-levelup'),
    over: $('screen-over'), board: $('screen-board'), settings: $('screen-settings'), garage: $('screen-garage'), race: $('screen-race')
  }
};

const UI = {
  cache: {},
  boardReturn: 'start',     // màn hình quay lại khi đóng bảng thành tích
  lastResult: null,

  show(name) {                                    // chỉ hiện đúng 1 màn hình phủ
    for (const [k, node] of Object.entries(el.screens)) node.hidden = k !== name;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  },
  hideAll() { for (const node of Object.values(el.screens)) node.hidden = true; },

  set(key, node, text) {                           // chỉ chạm DOM khi giá trị đổi
    if (this.cache[key] !== text) { this.cache[key] = text; node.textContent = text; }
  },
  popStat(which) {
    const node = which === 'coins' ? el.coins : el.score;
    node.classList.remove('pop'); void node.offsetWidth; node.classList.add('pop');
  },

  updateHud() {
    this.set('score', el.score, String(Math.floor(game.score)));
    this.set('coins', el.coins, String(game.coins));
    this.set('best', el.best, String(Math.max(highScore, Math.floor(game.score))));
    const racing = game.mode === 'tournament';
    this.set('level', el.level, racing ? `CHẶNG ${tour.stage + 1} · HẠNG ${currentRank()}/${RIVALS.length + 1}` : `LEVEL ${currentLevel().id}`);
    if (el.raceTrack.hidden === racing) el.raceTrack.hidden = !racing;
    if (racing) this.updateRaceTrack();

    // combo
    const showCombo = game.combo >= 3 && state === State.PLAYING;
    el.combo.hidden = !showCombo;
    if (showCombo) {
      const m = comboMultiplier();
      const txt = `COMBO x${game.combo}` + (m > 1 ? `  ·  ${m}×` : '');
      if (this.cache.combo !== txt) { this.cache.combo = txt; el.combo.textContent = txt; el.combo.classList.remove('pop'); void el.combo.offsetWidth; el.combo.classList.add('pop'); }
    }

    // power-up đang chạy
    const parts = [];
    if (game.powers.shield) parts.push('<span class="power">🛡️</span>');
    if (game.ammo > 0) parts.push(`<span class="power">🚀<small>×${game.ammo}</small></span>`);
    for (const k of ['magnet', 'slow', 'double']) {
      const ms = game.powers[k];
      if (ms > 0) parts.push(`<span class="power${ms < 1500 ? ' low' : ''}">${POWERUPS[k].icon}<small>${Math.ceil(ms / 1000)}s</small></span>`);
    }
    const html = parts.join('');
    if (this.cache.powers !== html) { this.cache.powers = html; el.powers.innerHTML = html; }

    // nút phóng tên lửa
    this.set('fire', el.fireCount, `×${game.ammo}`);
    const rp = game.ammo < ROCKET.start ? Math.round((game.rechargeMs / ROCKET.recharge) * 100) : 0;   // thanh nạp lại
    if (this.cache.recharge !== rp) { this.cache.recharge = rp; el.btnFire.style.setProperty('--p', rp + '%'); }
    el.btnFire.disabled = game.ammo <= 0 || state !== State.PLAYING;
    el.btnFire.classList.toggle('charging', game.ammo < ROCKET.start);

    // số tốc độ
    const bars = GEARS.map((_, i) => (i <= game.gear ? '▮' : '▯')).join('');
    this.set('speed', el.speed, `🚀 ${bars}`);
    el.btnSlower.disabled = game.gear === 0 || state !== State.PLAYING;
    el.btnFaster.disabled = game.gear === GEARS.length - 1 || state !== State.PLAYING;

    // turbo
    const t = game.turbo;
    const pct = t.active ? (t.remaining / TURBO.duration) * 100 : (t.value / TURBO.max) * 100;
    el.turboFill.style.width = pct.toFixed(1) + '%';
    el.turbo.classList.toggle('ready', t.ready);
    el.turbo.classList.toggle('active', t.active);
    this.set('turboLabel', el.turboLabel, t.active ? '⚡ ĐANG TURBO!' : (t.ready ? '⚡ SẴN SÀNG!' : '⚡ TURBO'));
    const showBanner = t.ready && state === State.PLAYING;
    if (el.banner.hidden === showBanner) el.banner.hidden = !showBanner;
    el.btnTurbo.disabled = !t.ready || state !== State.PLAYING;
    el.btnTurbo.classList.toggle('ready', t.ready);
  },

  // ----- Chọn xe -----
  buildGarage() {
    const grid = $('car-grid');
    grid.textContent = '';
    for (const car of CARS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'car-card';
      btn.dataset.id = car.id;
      btn.setAttribute('aria-label', `Chọn xe ${car.name}`);

      const cv = document.createElement('canvas');           // hình xem trước vẽ bằng đúng hàm vẽ xe trong game
      cv.width = 140; cv.height = 220; cv.className = 'car-preview';
      const g = cv.getContext('2d');
      g.scale(2, 2);
      drawCar(g, 35, 55, PLAYER.w, PLAYER.h, car.body, { player: true, style: car.style, acc: car.acc, helmet: car.helmet, lights: car.lights });

      const name = document.createElement('span');
      name.className = 'car-name'; name.textContent = car.name;
      btn.append(cv, name);
      btn.addEventListener('click', () => this.chooseCar(car.id));
      grid.appendChild(btn);
    }
    this.markCar();
    this.refreshPhotoUi();
  },
  refreshPhotoUi() {
    const has = !!photoImg;
    $('btn-photo-clear').hidden = !has;
    $('photo-thumb').hidden = !has;
    if (has) $('photo-thumb').src = photoImg.src;
  },
  async pickPhoto(file) {
    const msg = $('photo-msg');
    msg.textContent = ''; msg.className = 'msg';
    if (!file) return;
    try {
      const dataUrl = await processPhotoFile(file);
      Storage.setPhoto(dataUrl);
      setPhotoImage(dataUrl, () => { this.buildGarage(); msg.textContent = 'Đã gắn ảnh lên xe! 🎉'; msg.className = 'msg ok'; });
    } catch (_) {
      msg.textContent = 'Không đọc được ảnh này, thử ảnh khác nhé!'; msg.className = 'msg err';
    }
  },
  clearPhoto() {
    Storage.clearPhoto();
    setPhotoImage(null, () => { this.buildGarage(); $('photo-msg').textContent = 'Đã bỏ ảnh.'; $('photo-msg').className = 'msg'; });
  },
  markCar() {
    document.querySelectorAll('.car-card').forEach((b) => {
      const on = b.dataset.id === selectedCarId;
      b.classList.toggle('selected', on);
      b.setAttribute('aria-pressed', String(on));
    });
    $('garage-current').textContent = `Đang chọn: ${selectedCar().name}`;
  },
  chooseCar(id) {
    if (!CARS.some((c) => c.id === id)) return;
    selectedCarId = id;
    Storage.setCar(id);
    Sound.unlock(); Sound.play('start');
    this.markCar();
  },

  soundLabel() {
    const on = Sound.enabled;
    $('btn-sound-hud').textContent = on ? '🔊' : '🔇';
    $('btn-sound-setting').textContent = `${on ? '🔊' : '🔇'} ÂM THANH: ${on ? 'BẬT' : 'TẮT'}`;
  },

  // ----- Bảng thành tích -----
  async openBoard(from, highlight) {
    this.boardReturn = from;
    this.show('board');
    const body = $('board-body'), you = $('board-you'), tag = $('board-source');
    you.hidden = true; tag.textContent = '';
    body.innerHTML = '<p class="empty-state">⏳ Đang tải bảng thành tích...</p>';
    const res = await getLeaderboard();
    if (el.screens.board.hidden) return;           // người chơi đã thoát trong lúc tải
    body.textContent = '';

    if (res.error) {
      const box = document.createElement('div');
      box.className = 'empty-state';
      box.innerHTML = '<p>⚠️ Không thể tải bảng online.</p>';
      const retry = document.createElement('button');
      retry.className = 'btn btn-orange'; retry.textContent = '🔄 THỬ LẠI';
      retry.addEventListener('click', () => this.openBoard(from, highlight));
      box.appendChild(retry);
      body.appendChild(box);
    }
    tag.textContent = res.source === 'online' ? '🌐 Bảng online' : '📱 Bảng trên máy này';

    if (!res.entries.length && !res.error) {
      body.innerHTML = '<p class="empty-state">🏆 Chưa có thành tích.<br>Hãy trở thành người đầu tiên!</p>';
    }
    const medals = ['🥇', '🥈', '🥉'];
    let myRank = -1;
    res.entries.forEach((e, i) => {
      const row = document.createElement('div');
      row.className = 'entry';
      const mine = highlight && e.nickname === highlight.nickname && e.score === highlight.score;
      if (mine && myRank < 0) { myRank = i + 1; row.classList.add('me'); }
      const rank = document.createElement('span'); rank.className = 'rank'; rank.textContent = medals[i] || String(i + 1);
      const name = document.createElement('span'); name.className = 'name'; name.textContent = e.nickname;   // textContent: chống chèn HTML
      const pts = document.createElement('span'); pts.className = 'pts'; pts.textContent = String(e.score);
      row.append(rank, name, pts);
      body.appendChild(row);
    });

    if (highlight) {
      you.hidden = false;
      you.textContent = myRank > 0 ? `🎉 BẠN ĐANG ĐỨNG #${myRank}!` : `Điểm của bạn: ${highlight.score} — Hãy cố gắng vào Top 10!`;
    }
  },

  closeBoard() {
    this.show(this.boardReturn === 'over' ? 'over' : 'start');
  },

  showGameOver() {
    $('over-score').textContent = String(Math.floor(game.score));
    $('over-best').textContent = String(highScore);
    $('over-record').hidden = !game.newRecord;
    const canSave = Math.floor(game.score) > 0 && !game.submitted;
    $('save-form').hidden = !canSave;
    $('save-msg').textContent = ''; $('save-msg').className = 'msg';
    $('btn-save').disabled = false;
    $('nickname').value = Storage.getNickname();
    this.show('over');
  }
};

// ----- Giao diện giải đấu -----
const RACER_NAMES = ['BẠN', ...RIVALS.map((r) => r.name)];
const RACER_EMOJI = ['🏎️', ...RIVALS.map((r) => r.emoji)];

/** Thanh đường đua dọc bên phải: chấm của bé và các đối thủ chạy từ đáy lên vạch đích. */
UI.buildRaceTrack = function () {
  el.raceTrack.querySelectorAll('.rt-dot').forEach((n) => n.remove());
  this.raceDots = RACER_EMOJI.map((emoji, i) => {
    const d = document.createElement('span');
    d.className = 'rt-dot' + (i === 0 ? ' me' : '');
    d.textContent = emoji;
    el.raceTrack.appendChild(d);
    return d;
  });
  this.raceDotCache = [];
};
UI.updateRaceTrack = function () {
  const r = game.race;
  if (!this.raceDots) return;
  const vals = [r.dist, ...r.rivals.map((v) => v.dist)];
  vals.forEach((dist, i) => {
    const pct = Math.round(Math.max(0, Math.min(1, dist / r.length)) * 200) / 2;   // làm tròn 0,5% để ít ghi DOM
    if (this.raceDotCache[i] !== pct) { this.raceDotCache[i] = pct; this.raceDots[i].style.bottom = pct + '%'; }
  });
};

/** Màn hình giải đấu dùng chung: 'intro' (trước chặng), 'result' (sau chặng), 'final' (kết quả chung). */
let raceAction = null;
function showRaceScreen(kind) {
  const title = $('race-title'), sub = $('race-sub'), list = $('race-list'), main = $('btn-race-main'), emoji = $('race-emoji');
  list.textContent = '';
  const last = tour.stage >= STAGES.length - 1;
  const addRow = (rank, who, pts, me, note) => {
    const row = document.createElement('div');
    row.className = 'entry' + (me ? ' me' : '');
    const rk = document.createElement('span'); rk.className = 'rank'; rk.textContent = ['🥇', '🥈', '🥉'][rank] || String(rank + 1);
    const nm = document.createElement('span'); nm.className = 'name'; nm.textContent = `${RACER_EMOJI[who]} ${RACER_NAMES[who]}` + (note ? ` ${note}` : '');
    const pt = document.createElement('span'); pt.className = 'pts'; pt.textContent = String(pts);
    row.append(rk, nm, pt);
    list.appendChild(row);
  };

  if (kind === 'intro') {
    emoji.textContent = '🏁';
    title.textContent = 'GIẢI ĐẤU';
    sub.textContent = `Chặng ${tour.stage + 1}/${STAGES.length}: ${STAGES[tour.stage].name}`;
    const info = document.createElement('p');
    info.className = 'hint';
    info.textContent = `Đua với ${RIVALS.map((r) => `${r.emoji} ${r.name}`).join(' · ')}. Về đích thật nhanh để giành hạng nhất! Va chạm chỉ làm xe quay vòng chứ không thua.`;
    list.appendChild(info);
    const cups = document.createElement('p');
    cups.className = 'sub'; cups.textContent = `🏆 Cúp đã giành: ${Storage.getCups()}`;
    list.appendChild(cups);
    main.textContent = '▶ XUẤT PHÁT';
    raceAction = () => startStage(tour.stage);
  } else if (kind === 'result') {
    const myRank = game.stageOrder.indexOf(0);
    emoji.textContent = ['🥇', '🥈', '🥉', '🏁'][myRank];
    title.textContent = ['HẠNG NHẤT!', 'HẠNG NHÌ!', 'HẠNG BA!', 'HẠNG TƯ'][myRank];
    sub.textContent = `Chặng ${tour.stage + 1}/${STAGES.length}: ${STAGES[tour.stage].name}`;
    game.stageOrder.forEach((who, place) => addRow(place, who, `+${RACE_POINTS[place]}`, who === 0));
    if (last) {
      main.textContent = '🏆 KẾT QUẢ CHUNG';
      raceAction = () => showRaceScreen('final');
    } else {
      main.textContent = `▶ CHẶNG ${tour.stage + 2}: ${STAGES[tour.stage + 1].name.toUpperCase()}`;
      raceAction = () => startStage(tour.stage + 1);
    }
  } else {                                           // final
    const order = [0, 1, 2, 3].sort((a, b) => tour.pts[b] - tour.pts[a] || tour.lastRank[a] - tour.lastRank[b]);
    const myRank = order.indexOf(0);
    if (myRank === 0) Storage.addCup();
    emoji.textContent = myRank === 0 ? '🏆' : ['🥇', '🥈', '🥉', '🏁'][myRank];
    title.textContent = myRank === 0 ? 'NHÀ VÔ ĐỊCH!' : `HẠNG ${myRank + 1} CHUNG CUỘC`;
    sub.textContent = myRank === 0 ? 'Bé giành cúp rồi! 🎉' : 'Đua lại để giành cúp nhé!';
    order.forEach((who, place) => addRow(place, who, tour.pts[who], who === 0));
    main.textContent = '🔄 ĐUA LẠI GIẢI';
    raceAction = startTournament;
    if (myRank === 0) Sound.play('level');
  }
  state = kind === 'intro' ? State.START : State.RESULT;
  if (kind !== 'result') el.hud.hidden = true;
  UI.show('race');
}

// ---------------------------------------------------------------------
// 10. ĐIỀU KHIỂN LUỒNG GAME
// ---------------------------------------------------------------------
function startGame() {
  Sound.unlock();
  resetGame();
  state = State.PLAYING;
  UI.cache = {};
  UI.hideAll();
  el.hud.hidden = false;
  Sound.play('start');
  UI.updateHud();
}

function pauseGame() {
  if (state !== State.PLAYING) return;
  state = State.PAUSED;
  UI.show('pause');
  el.banner.hidden = true;
}
function resumeGame() {
  if (state !== State.PAUSED) return;
  state = State.PLAYING;
  UI.hideAll();
  lastTime = 0;                                   // tránh dt khổng lồ sau khi tạm dừng
}

function levelUp() {
  const next = game.levelIndex + 1;
  if (next >= LEVELS.length) return;
  game.levelIndex = next;
  state = State.LEVELUP;                          // dừng gameplay trong lúc hiện overlay
  const lv = currentLevel();
  let note = 'Sẵn sàng chưa?';
  if (lv.special) { game.score += 200; note = '🌈 Đường đặc biệt! Điểm thưởng ×1.5 (+200)'; }
  $('levelup-num').textContent = `LEVEL ${lv.id}`;
  $('levelup-note').textContent = note;
  Sound.play('level');
  UI.show('levelup');
}
function continueAfterLevelUp() {
  if (state !== State.LEVELUP) return;
  // dọn đường để bắt đầu level mới êm ái
  game.obstacles = []; game.zigzag = []; game.lastSafe = [0, 1, 2];
  game.spawnProgress = -currentLevel().spawnInterval * 0.6;
  game.invulnerable = Math.max(game.invulnerable, 1200);
  state = State.PLAYING;
  UI.hideAll();
  lastTime = 0;
}

function gameOver() {
  state = State.GAME_OVER;
  game.overDelay = 0.9;                           // cho hiệu ứng nổ chạy một chút rồi mới hiện bảng kết quả
  game.shake = 1; game.flash = 0.5;
  burst(game.player.x, PLAYER.y, '#ff9b2f', 24, 280);
  burst(game.player.x, PLAYER.y, '#ffd93b', 16, 200);
  burst(game.player.x, PLAYER.y, '#ffffff', 10, 150);
  Sound.play('hit');
  const final = Math.floor(game.score);
  game.newRecord = final > highScore && final > 0;
  if (game.newRecord) { highScore = final; Storage.setHighScore(final); }
  el.banner.hidden = true;
  UI.updateHud();
}

function goHome() {
  tour.active = false;
  state = State.START;
  resetGame();
  UI.cache = {};
  el.hud.hidden = true;
  el.banner.hidden = true;
  UI.show('start');
}

// ----- Lưu điểm -----
let lastSubmitAt = 0;
async function handleSave(ev) {
  ev.preventDefault();
  const msg = $('save-msg'), btn = $('btn-save');
  const setMsg = (t, cls) => { msg.textContent = t; msg.className = 'msg ' + (cls || ''); msg.scrollIntoView({ block: 'nearest' }); };

  const v = validateNickname($('nickname').value);
  if (!v.ok) return setMsg(v.error, 'err');
  if (Date.now() - lastSubmitAt < 5000) return setMsg('Chờ một chút rồi lưu lại nhé!', 'err');   // giới hạn tần suất
  if (game.submitted) return;

  const result = {
    nickname: v.value,
    score: Math.min(Math.floor(game.score), 1000000),
    level: Math.min(Math.max(currentLevel().id, 1), LEVELS.length),
    coins: Math.min(game.coins, 100000)
  };
  lastSubmitAt = Date.now();
  btn.disabled = true;
  setMsg('Đang lưu...');
  Storage.setNickname(v.value);
  const res = await submitScore(result);
  if (!res.ok) { btn.disabled = false; return setMsg('Điểm chưa hợp lệ, thử lại nhé!', 'err'); }
  game.submitted = true;
  if (res.failed) {
    setMsg('Không thể kết nối bảng thành tích. Điểm đã được lưu trên máy.', 'err');
    setTimeout(() => { if (state === State.GAME_OVER) UI.openBoard('over', result); }, 1600);
  } else {
    setMsg('Đã lưu điểm! 🎉', 'ok');
    UI.openBoard('over', result);
  }
  $('save-form').hidden = true;
}

// ---------------------------------------------------------------------
// 11. NHẬP LIỆU (bàn phím, chạm, vuốt)
// ---------------------------------------------------------------------
function isTypingTarget(t) { return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA'); }

window.addEventListener('keydown', (e) => {
  if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key;
  const onButton = e.target && e.target.tagName === 'BUTTON';

  if (k === 'ArrowLeft' || k === 'a' || k === 'A') { if (state === State.PLAYING) { e.preventDefault(); changeLane(-1); } }
  else if (k === 'ArrowRight' || k === 'd' || k === 'D') { if (state === State.PLAYING) { e.preventDefault(); changeLane(1); } }
  else if (k === 'ArrowUp' || k === 'w' || k === 'W') { if (state === State.PLAYING) { e.preventDefault(); changeGear(1); } }
  else if (k === 'ArrowDown' || k === 's' || k === 'S') { if (state === State.PLAYING) { e.preventDefault(); changeGear(-1); } }
  else if (k === 'f' || k === 'F') { if (state === State.PLAYING) { e.preventDefault(); fireRocket(); } }
  else if (k === ' ' || k === 'Spacebar') {
    if (state === State.PLAYING) { e.preventDefault(); activateTurbo(); }
    else if (!onButton && state === State.PAUSED) { e.preventDefault(); resumeGame(); }
  }
  else if (k === 'Escape' || k === 'p' || k === 'P') {
    if (state === State.PLAYING) pauseGame();
    else if (state === State.PAUSED) resumeGame();
    else if (!el.screens.board.hidden) UI.closeBoard();
    else if (!el.screens.settings.hidden || !el.screens.garage.hidden) UI.show('start');
  }
  else if (k === 'Enter' && !onButton) {
    if (state === State.START && !el.screens.start.hidden) startGame();
    else if (state === State.LEVELUP) continueAfterLevelUp();
  }
});

// Nút cảm ứng dùng Pointer Events (không phụ thuộc hover)
function bindPress(node, fn) {
  node.addEventListener('pointerdown', (e) => { e.preventDefault(); Sound.unlock(); fn(); });
  node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fn(); } });
}
bindPress($('btn-left'), () => changeLane(-1));
bindPress($('btn-right'), () => changeLane(1));
bindPress($('btn-turbo'), activateTurbo);
bindPress($('btn-fire'), fireRocket);
bindPress($('btn-slower'), () => changeGear(-1));
bindPress($('btn-faster'), () => changeGear(1));

// Vuốt trái/phải trên sân chơi
let swipeStart = null;
canvas.addEventListener('pointerdown', (e) => { swipeStart = { x: e.clientX, id: e.pointerId }; });
canvas.addEventListener('pointerup', (e) => {
  if (!swipeStart || swipeStart.id !== e.pointerId) return;
  const dx = e.clientX - swipeStart.x;
  swipeStart = null;
  if (Math.abs(dx) > 30) changeLane(dx > 0 ? 1 : -1);
});
canvas.addEventListener('pointercancel', () => { swipeStart = null; });

// Nút giao diện
const on = (id, fn) => $(id).addEventListener('click', fn);
on('btn-play', startGame);
on('btn-again', startGame);
on('btn-restart-pause', restartCurrentMode);
on('btn-tournament', startTournament);
on('btn-race-main', () => { if (raceAction) raceAction(); });
on('btn-race-home', goHome);
on('btn-resume', resumeGame);
on('btn-continue', continueAfterLevelUp);
on('btn-pause', () => { pauseGame(); });
on('btn-home-pause', goHome);
on('btn-home-over', goHome);
on('btn-board-start', () => UI.openBoard('start', null));
on('btn-board-over', () => UI.openBoard('over', null));
on('btn-board-back', () => UI.closeBoard());
on('btn-garage', () => UI.show('garage'));
on('btn-garage-back', () => UI.show('start'));
on('btn-photo-clear', () => UI.clearPhoto());
$('photo-input').addEventListener('change', (e) => { UI.pickPhoto(e.target.files && e.target.files[0]); e.target.value = ''; });
on('btn-settings', () => { refreshSettings(); UI.show('settings'); });
on('btn-settings-back', () => UI.show('start'));
const toggleSound = () => { Sound.unlock(); Sound.setEnabled(!Sound.enabled); UI.soundLabel(); if (Sound.enabled) Sound.play('coin'); };
on('btn-sound-hud', (e) => { toggleSound(); e.currentTarget.blur(); });
on('btn-sound-setting', toggleSound);
$('save-form').addEventListener('submit', handleSave);

let resetArmed = false;
on('btn-reset-data', (e) => {
  const btn = e.currentTarget;
  if (!resetArmed) { resetArmed = true; btn.textContent = '❗ BẤM LẦN NỮA ĐỂ XOÁ'; setTimeout(() => { resetArmed = false; btn.textContent = '🗑️ XOÁ ĐIỂM TRÊN MÁY'; }, 3000); return; }
  Storage.clearAll(); highScore = 0; resetArmed = false;
  btn.textContent = '✅ ĐÃ XOÁ';
  setTimeout(() => { btn.textContent = '🗑️ XOÁ ĐIỂM TRÊN MÁY'; }, 1500);
});

function refreshSettings() {
  $('online-status').textContent = isOnlineMode()
    ? '🌐 Bảng thành tích online: đã kết nối'
    : '📴 Đang chơi offline — điểm lưu trên máy này';
}

// Tự động tạm dừng khi chuyển tab / ẩn trang
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseGame(); });
window.addEventListener('blur', () => pauseGame());
window.addEventListener('resize', resizeCanvas);

// ---------------------------------------------------------------------
// 12. VÒNG LẶP CHÍNH (requestAnimationFrame)
// ---------------------------------------------------------------------
let lastTime = 0;
function loop(ts) {
  const dt = lastTime ? Math.min(0.05, (ts - lastTime) / 1000) : 0;   // giới hạn dt để tránh nhảy cóc
  lastTime = ts;
  const t = ts / 1000;

  if (state === State.PLAYING) {
    update(dt);
  } else if (state === State.START) {
    game.roadScroll += 120 * dt;                   // đường chạy nhẹ ở màn hình chính
    updatePlayer(dt);
  } else if (state === State.GAME_OVER) {          // chỉ chạy hiệu ứng nổ, ngừng sinh vật thể
    updateEffects(dt);
    updateTimers(dt);
    if (game.overDelay > 0) {
      game.overDelay -= dt;
      if (game.overDelay <= 0) { Sound.play('over'); UI.showGameOver(); }
    }
  }
  // PAUSED / LEVELUP: đóng băng — không update gì cả

  render(t);
  if (state === State.PLAYING || state === State.GAME_OVER) UI.updateHud();
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------------
// 13. KHỞI ĐỘNG
// ---------------------------------------------------------------------
resizeCanvas();
UI.buildGarage();
setPhotoImage(Storage.getPhoto(), () => UI.buildGarage());     // ảnh đã lưu từ lần trước
UI.soundLabel();
UI.set('best', el.best, String(highScore));
UI.show('start');
requestAnimationFrame(loop);
Online.init();           // chạy nền; thất bại thì cứ chơi offline

// Service worker: chơi offline + cài như ứng dụng. Chỉ chạy trên https hoặc localhost; lỗi thì bỏ qua.
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
