/**
 * mc-task-app 后端服务
 * 路径：/var/www/consolidated/mc-task-app-backend/server.js
 * 描述：提供 /api/sync 接口，支持多端数据同步（JSON 文件存储）
 * 兼容：Node 14~24+
 */

'use strict';

const http = require('http');
const fs   = require('fs');
const path = require('path');

// ─── 配置 ─────────────────────────────────────────────────
const PORT       = 3001;
const DATA_DIR   = '/var/www/sync-data/';
const MAX_BODY   = 1 * 1024 * 1024;   // 1MB
const MAX_FILE   = 10 * 1024 * 1024;  // 10MB
const UID_RE     = /^[a-zA-Z0-9\-_]+$/;
const INSECURE   = /[<>\"'\\]/;         // 防止注入路径

// ─── 初始化 ───────────────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
console.log('[server] 数据目录: ' + DATA_DIR);

// ─── 工具函数 ─────────────────────────────────────────────
const send = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
  res.end(JSON.stringify(obj));
};

const validUid = (u) =>
  typeof u === 'string' && UID_RE.test(u) && u.length > 0 && u.length <= 64;

const safePath = (uid) => {
  const p = path.join(DATA_DIR, uid + '.json');
  // 防止路径穿越
  if (!p.startsWith(DATA_DIR)) return null;
  return p;
};

// ─── GET /api/sync ────────────────────────────────────────
const onGet = (req, res) => {
  const u = new URL(req.url, 'http://localhost:' + PORT).searchParams;
  const id = u.get('userId');
  if (!validUid(id)) return send(res, 400, { error: 'invalid_userId' });

  const fp = safePath(id);
  if (!fs.existsSync(fp)) return send(res, 404, { version: 0, updatedAt: null, data: null });

  try {
    const sz = fs.statSync(fp).size;
    if (sz > MAX_FILE) throw Object.assign(new Error('too large'), { code: 'EFILETOOBIG' });
    const parsed = JSON.parse(fs.readFileSync(fp, 'utf-8'));
    send(res, 200, { version: parsed.version ?? 0, updatedAt: parsed.updatedAt ?? null, data: parsed.data ?? null });
  } catch (e) {
    console.error('[GET sync error]', e.message);
    send(res, 500, { error: e.code === 'EFILETOOBIG' ? 'file_too_large' : 'read_failed' });
  }
};

// ─── POST /api/sync ────────────────────────────────────────
const onPost = (req, res) => {
  let body = '';
  let exploded = false;

  req.on('data', (c) => {
    body += c;
    if (body.length > MAX_BODY && !exploded) {
      exploded = true;
      if (!res.headersSent) res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'payload_too_large' }));
      req.destroy();
    }
  });

  req.on('end', () => {
    if (res.headersSent) return;
    let d;
    try { d = JSON.parse(body); } catch { return send(res, 400, { error: 'invalid_json' }); }

    const { userId, version, data } = d;
    if (!validUid(userId)) return send(res, 400, { error: 'invalid_userId' });
    if (typeof version !== 'number' || !Number.isInteger(version) || version < 0)
      return send(res, 400, { error: 'invalid_version' });

    const fp = safePath(userId);
    if (!fp) return send(res, 400, { error: 'invalid_userId' });

    // 乐观锁版本冲突检测
    if (fs.existsSync(fp)) {
      try {
        const cur = JSON.parse(fs.readFileSync(fp, 'utf-8'));
        if ((cur.version ?? 0) > version)
          return send(res, 409, { error: 'version_conflict', currentVersion: cur.version });
      } catch (err) {
        console.error('[conflict check error]', err.message);
        return send(res, 500, { error: 'conflict_check_failed' });
      }
    }

    // 原子写入：tmp → rename
    const tmp     = fp + '.tmp';
    const content = JSON.stringify({ version: version + 1, updatedAt: new Date().toISOString(), data }, null, 2);
    let saved     = false;
    let retry     = 0;

    while (!saved && retry < 3) {
      try {
        fs.writeFileSync(tmp, content, 'utf-8');
        fs.renameSync(tmp, fp);
        saved = true;
        console.log('[sync] 写入 OK userId=' + userId + ' version=' + (version + 1));
      } catch (err) {
        if (err.code === 'EEXIST') {
          retry++;
          const pause = new Promise(r => setTimeout(r, 50));
          // 在同步上下文中无法 await，所以改用循环
          const end = Date.now() + 50;
          while (Date.now() < end) {} // 微忙等 50ms
          continue;
        }
        console.error('[sync] 写入失败', err.message);
        return send(res, 500, { error: 'write_failed' });
      }
    }

    if (!saved) return send(res, 500, { error: 'write_conflict_retry_exceeded' });
    send(res, 200, { version: version + 1, updatedAt: new Date().toISOString() });
  });
};

// ─── 路由 ─────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET'    && req.url.startsWith('/api/sync')) return onGet(req, res);
  if (req.method === 'POST'   && req.url.startsWith('/api/sync')) return onPost(req, res);

  send(res, 404, { error: 'not_found' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('[server] mc-task-app 后端已启动，端口 ' + PORT);
  console.log('[server] Node 版本: ' + process.version);
});

server.on('error', (e) => { console.error('[server] 错误:', e.message); process.exit(1); });
