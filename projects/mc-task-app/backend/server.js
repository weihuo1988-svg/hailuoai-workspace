/**
 * mc-task-app 后端服务
 * 路径：/workspace/projects/mc-task-app/backend/server.js
 * 描述：提供 /api/sync 接口，支持多端数据同步（JSON 文件存储）
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// ─── 配置 ───────────────────────────────────────────────────
const PORT = 3001;
const DATA_DIR = '/var/www/sync-data/';
const MAX_BODY_SIZE = 1024 * 1024;      // 1MB
const MAX_FILE_SIZE  = 10 * 1024 * 1024; // 10MB
const USER_ID_REGEX = /^[a-zA-Z0-9\-_]+$/;

// ─── 启动时初始化数据目录 ──────────────────────────────────
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`[sync] 数据目录已创建: ${DATA_DIR}`);
  }
}

function userFilePath(userId) {
  return path.join(DATA_DIR, `${userId}.json`);
}

function isValidUserId(userId) {
  return typeof userId === 'string' && USER_ID_REGEX.test(userId) && userId.length > 0 && userId.length <= 64;
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function jsonReply(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ─── GET /api/sync ─────────────────────────────────────────
async function handleGetSync(req, res) {
  const url     = new URL(req.url, `http://localhost:${PORT}`);
  const userId  = url.searchParams.get('userId');

  if (!userId || !isValidUserId(userId)) {
    return jsonReply(res, 400, { error: 'invalid_userId' });
  }

  const filePath = userFilePath(userId);

  try {
    if (!fs.existsSync(filePath)) {
      return jsonReply(res, 404, { version: 0, updatedAt: null, data: null });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    const stat = fs.statSync(filePath);

    if (stat.size > MAX_FILE_SIZE) {
      console.error(`[sync] 文件过大: ${filePath} (${stat.size} bytes)`);
      return jsonReply(res, 500, { error: 'file_too_large' });
    }

    return jsonReply(res, 200, {
      version:   parsed.version   ?? 0,
      updatedAt: parsed.updatedAt ?? null,
      data:      parsed.data      ?? null,
    });
  } catch (err) {
    console.error(`[sync] 读取失败: ${filePath}`, err.message);
    return jsonReply(res, 500, { error: 'read_failed' });
  }
}

// ─── POST /api/sync ────────────────────────────────────────
async function handlePostSync(req, res) {
  let body = '';
  let bodyTooLarge = false;

  req.on('data', (chunk) => {
    body += chunk;
    if (body.length > MAX_BODY_SIZE && !bodyTooLarge) {
      bodyTooLarge = true;
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'payload_too_large' }));
      req.destroy();
    }
  });

  req.on('end', async () => {
    if (res.headersSent) return;

    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      return jsonReply(res, 400, { error: 'invalid_json' });
    }

    const { userId, version, updatedAt, data } = payload;

    if (!userId || !isValidUserId(userId)) {
      return jsonReply(res, 400, { error: 'invalid_userId' });
    }
    if (typeof version !== 'number' || !Number.isInteger(version) || version < 0) {
      return jsonReply(res, 400, { error: 'invalid_version' });
    }

    const filePath = userFilePath(userId);

    // 版本冲突检测（乐观锁）
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const existing = JSON.parse(raw);
        if ((existing.version ?? 0) > version) {
          console.warn(`[sync] 版本冲突: 客户端 version=${version}, 服务器 version=${existing.version}`);
          return jsonReply(res, 409, { error: 'version_conflict', currentVersion: existing.version });
        }
      }
    } catch (err) {
      console.error('[sync] 冲突检测失败:', err.message);
      return jsonReply(res, 500, { error: 'conflict_check_failed' });
    }

    const newVersion   = version + 1;
    const newUpdatedAt = new Date().toISOString();
    const fileContent  = JSON.stringify({ version: newVersion, updatedAt: newUpdatedAt, data }, null, 2);

    // 原子写入：先写临时文件，再 rename（防止读到半写文件）
    const tmpPath    = filePath + '.tmp';
    let   saved      = false;
    let   retryCount = 0;
    const MAX_RETRY  = 3;

    while (!saved && retryCount < MAX_RETRY) {
      try {
        fs.writeFileSync(tmpPath, fileContent, 'utf-8');
        fs.renameSync(tmpPath, filePath);
        saved = true;
        console.log(`[sync] 写入成功: ${filePath} (version: ${newVersion})`);
      } catch (err) {
        retryCount++;
        if (err.code === 'EEXIST' || err.code === 'EBUSY') {
          await new Promise(r => setTimeout(r, 100)); // 高并发场景等待 100ms
          continue;
        }
        console.error(`[sync] 写入失败: ${filePath}`, err.message);
        return jsonReply(res, 500, { error: 'write_failed' });
      }
    }

    if (!saved) {
      return jsonReply(res, 500, { error: 'write_conflict_retry_exceeded' });
    }

    return jsonReply(res, 200, { version: newVersion, updatedAt: newUpdatedAt });
  });
}

// ─── 路由处理 ───────────────────────────────────────────────
async function handleRequest(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url.startsWith('/api/sync')) {
    return handleGetSync(req, res);
  }
  if (req.method === 'POST' && req.url.startsWith('/api/sync')) {
    return handlePostSync(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
}

// ─── 启动 ────────────────────────────────────────────────────
ensureDataDir();
const server = http.createServer(handleRequest);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] 启动，监听端口 ${PORT}`);
  console.log(`[server] 数据目录: ${DATA_DIR}`);
});
server.on('error', (err) => {
  console.error('[server] 启动失败:', err.message);
  process.exit(1);
});
