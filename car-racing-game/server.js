'use strict';
/* Server tĩnh tối giản cho Render Web Service (không cần thư viện ngoài).
   Chạy: `node server.js` hoặc `yarn start`. Render tự cấp biến môi trường PORT. */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.sql': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8'
};

// File dành cho máy chủ / cấu hình — không phục vụ ra ngoài.
const HIDDEN = new Set(['server.js', 'package.json', 'yarn.lock', 'package-lock.json', 'render.yaml']);

function cacheControl(file) {
  const ext = path.extname(file);
  const name = path.basename(file);
  if (ext === '.html' || name === 'sw.js' || ext === '.webmanifest') return 'no-cache';   // luôn kiểm tra bản mới
  if (file.includes(`${path.sep}icons${path.sep}`)) return 'public, max-age=604800';
  return 'public, max-age=300';
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

function sendNotFound(req, res) {
  const page = path.join(ROOT, '404.html');
  fs.readFile(page, (err, data) => {
    if (err) return send(res, 404, 'Không tìm thấy trang');
    res.writeHead(404, { 'Content-Type': TYPES['.html'], 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    return res.end();
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch (_) {
    return send(res, 400, 'Yêu cầu không hợp lệ');
  }
  if (pathname.includes('\0')) return send(res, 400, 'Yêu cầu không hợp lệ');
  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = path.join(ROOT, pathname);
  const rel = path.relative(ROOT, filePath);
  // Chặn thoát khỏi thư mục gốc (../), file ẩn (.git, .env...) và file cấu hình máy chủ
  if (rel.startsWith('..') || path.isAbsolute(rel)) return send(res, 403, 'Không được phép');
  const parts = rel.split(path.sep);
  if (parts.some((p) => p.startsWith('.')) || HIDDEN.has(parts[parts.length - 1])) return sendNotFound(req, res);

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) return sendNotFound(req, res);
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': cacheControl(filePath),
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    });
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Bé Đua Xe đang chạy tại cổng ${PORT}`);
});
