/**
 * mc-task-app 后端服务
 * 路径：/workspace/projects/mc-task-app/backend/server.js
 * 负责人：阿二
 * 描述：提供 /api/sync 接口，支持多端数据同步（JSON 文件存储）
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// ─── 配置 ───────────────────────────────────────────────────
const PORT = 3001;                           // 后端监听端口
const DATA_DIR = '/var/www/sync-data/';     // 用户数据存储目录
const MAX_BODY_SIZE = 1024 * 1024;           // 请求体最大 1MB
const MAX_FILE_SIZE  = 10 * 1024 * 1024;     // 单用户文件最大 10MB

// userId 允许的字符：字母、数字、连字符、下划线
const USER_ID_REGEX = /^[a-zA-Z0-9\-_]+$/;

// ─── 启动时初始化数据目录 ──────────────────────────────────
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log(`[sync] 数据目录已创建: ${DATA_DIR}`);
  } else {
    console.log(`[sync] 数据目录已存在: ${DATA_DIR}`);
  }
}

// ─── 获取用户数据文件路径 ──────────────────────────────────
function userFilePath(userId) {
  return path.join(DATA_DIR, `${userId}.json`);
}

// ─── 安全校验：userId 格式 ─────────────────────────────────
function isValidUserId(userId) {
  return typeof userId === 'string' && USER_ID_REGEX.test(userId) && userId.length > 0 && userId.length <= 64;
}

// ─── 处理 CORS（允许前端 dev server 跨域访问）───────────────
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');           // 可按需限制具体 origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ─── JSON 响应 ──────────────────────────────────────────────
function jsonReply(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// ─── 读取用户数据（GET /api/sync）──────────────────────────
async function handleGetSync(req, res) {
  // 解析 userId query 参数
  const url     = new URL(req.url, `http://localhost:${PORT}`);
  const userId  = url.searchParams.get('userId');

  // 校验 userId
  if (!userId || !isValidUserId(userId)) {
    return jsonReply(res, 400, { error: 'invalid_userId' });
  }

  const filePath = userFilePath(userId);

  try {
    // 检查文件是否存在
    const exists = fs.existsSync(filePath);
    if (!exists) {
      // 新用户：返回 404，前端会创建新账号
      return jsonReply(res, 404, { version: 0, updatedAt: null, data: null });
    }

    // 读取文件内容
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);

    // 安全检查：文件大小（防止损坏的极大文件）
    const stat = fs.statSync(filePath);
    if (stat.size > MAX_FILE_SIZE) {
      console.error(`[sync] 文件过大，跳过: ${filePath} (${stat.size} bytes)`);
      return jsonReply(res, 500, { error: 'file_too_large' });
    }

    // 返回完整数据（version / updatedAt / data）
    return jsonReply(res, 200, {
      version:   parsed.version   ?? 0,
      updatedAt: parsed.updatedAt ?? null,
      data:      parsed.data      ?? null,
    });
  } catch (err) {
    console.error(`[sync] 读取用户数据失败: ${filePath}`, err.message);
    return jsonReply(res, 500, { error: 'read_failed' });
  }
}

// ─── 写入用户数据（POST /api/sync）──────────────────────────
async function handlePostSync(req, res) {
  let body = '';

  // 流式接收 body（受控地分块读取，防止内存爆炸）
  req.on('data', (chunk) => {
    body += chunk;
    // P1-2 修复：413 立即响应，不等 'end' 事件
    if (body.length > MAX_BODY_SIZE) {
      // 必须先写入响应头，再关闭连接，否则客户端会挂起
      if (!res.headersSent) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'payload_too_large' }));
      }
      req.destroy();
    }
  });

  req.on('end', async () => {
    // 如果 data 事件中已发送 413（req.destroy() 后 end 仍可能触发），直接忽略
    if (res.headersSent) return;

    let payload;
    try {
      payload = JSON.parse(body);
    } catch {
      return jsonReply(res, 400, { error: 'invalid_json' });
    }

    const { userId, version, updatedAt, data } = payload;

    // 校验 userId
    if (!userId || !isValidUserId(userId)) {
      return jsonReply(res, 400, { error: 'invalid_userId' });
    }

    // 校验 version（必须为非负整数）
    if (typeof version !== 'number' || !Number.isInteger(version) || version < 0) {
      return jsonReply(res, 400, { error: 'invalid_version' });
    }

    // ─── 版本冲突检测 ───────────────────────────────────────
    // 如果服务器当前 version >= 客户端 version，说明有其他设备抢先写入了
    // 拒绝写入（409），让客户端重新 GET 并合并
    const filePath = userFilePath(userId);
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const existing = JSON.parse(raw);
        const currentVersion = existing.version ?? 0;
        // version 匹配才允许写入（乐观锁）
        if (currentVersion > version) {
          console.warn(`[sync] 版本冲突: 客户端 version=${version}, 服务器 version=${currentVersion}，拒绝写入`);
          return jsonReply(res, 409, { error: 'version_conflict', currentVersion });
        }
      }
    } catch (err) {
      console.error('[sync] 冲突检测失败:', err.message);
      return jsonReply(res, 500, { error: 'conflict_check_failed' });
    }

    // 构造新版本数据（服务器生成新 version = 当前 version + 1）
    const newVersion   = version + 1;
    const newUpdatedAt = new Date().toISOString();
    const fileContent  = JSON.stringify({ version: newVersion, updatedAt: newUpdatedAt, data }, null, 2);
    const filePath     = userFilePath(userId);

    // 写入策略：先写临时文件再 rename（原子写入，防止读到半写文件）
    // 文件锁：用 try/catch + retry 处理 EEXIST（Node.js 排他写入冲突）
    const tmpPath    = filePath + '.tmp';
    let   saved      = false;
    let   retryCount = 0;
    const MAX_RETRY  = 3;

    while (!saved && retryCount < MAX_RETRY) {
      try {
        // 同步写入临时文件（简单直接，避免异步竞争）
        fs.writeFileSync(tmpPath, fileContent, 'utf-8');
        // 原子 rename（覆盖原文件）
        fs.renameSync(tmpPath, filePath);
        saved = true;
        console.log(`[sync] 写入成功: ${filePath} (version: ${newVersion})`);
      } catch (err) {
        retryCount++;
        if (err.code === 'EEXIST') {
          // 文件冲突：稍等后重试（正常情况下不会出现，除非并发写入）
          await new Promise(r => setTimeout(r, 50));
          continue;
        }
        console.error(`[sync] 写入失败: ${filePath}`, err.message);
        return jsonReply(res, 500, { error: 'write_failed' });
      }
    }

    if (!saved) {
      return jsonReply(res, 500, { error: 'write_conflict_retry_exceeded' });
    }

    // 成功返回新的 version 和时间戳
    return jsonReply(res, 200, { version: newVersion, updatedAt: newUpdatedAt });
  });
}

// ─── 路由处理 ───────────────────────────────────────────────
async function handleRequest(req, res) {
  setCorsHeaders(res);

  // 处理 preflight OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /api/sync
  if (req.method === 'GET' && req.url.startsWith('/api/sync')) {
    return handleGetSync(req, res);
  }

  // POST /api/sync
  if (req.method === 'POST' && req.url.startsWith('/api/sync')) {
    return handlePostSync(req, res);
  }

  // 404：未匹配的路由
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not_found' }));
}

// ─── 启动服务器 ─────────────────────────────────────────────
ensureDataDir();

const server = http.createServer(handleRequest);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] mc-task-app 后端启动，监听端口 ${PORT}`);
  console.log(`[server] 数据存储目录: ${DATA_DIR}`);
});

server.on('error', (err) => {
  console.error('[server] 启动失败:', err.message);
  process.exit(1);
});