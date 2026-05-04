/**
 * HailuoAI Workspace Backend
 * - DashScope CosyVoice v3 WebSocket TTS (sleep-aid)
 * - MC-Task 数据同步 API (/api/sync)
 */
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, statSync } from 'fs';
import WebSocket from 'ws';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── MC-Task 数据同步（JSON 文件存储）────────────────────────
const SYNC_DATA_DIR = join(__dirname, 'sync-data');
const UID_RE = /^[a-zA-Z0-9\-_]+$/;
const MAX_FILE = 10 * 1024 * 1024; // 10MB

if (!existsSync(SYNC_DATA_DIR)) {
  mkdirSync(SYNC_DATA_DIR, { recursive: true });
}

function validUid(u) {
  return typeof u === 'string' && UID_RE.test(u) && u.length > 0 && u.length <= 64;
}

function safePath(uid) {
  const p = join(SYNC_DATA_DIR, uid + '.json');
  if (!p.startsWith(SYNC_DATA_DIR)) return null;
  return p;
}

// GET /api/sync?userId=xxx
app.get('/api/sync', (req, res) => {
  const id = req.query.userId;
  if (!validUid(id)) return res.status(400).json({ error: 'invalid_userId' });

  const fp = safePath(id);
  if (!fp || !existsSync(fp)) return res.status(404).json({ version: 0, updatedAt: null, data: null });

  try {
    const sz = statSync(fp).size;
    if (sz > MAX_FILE) return res.status(500).json({ error: 'file_too_large' });
    const parsed = JSON.parse(readFileSync(fp, 'utf-8'));
    res.json({ version: parsed.version ?? 0, updatedAt: parsed.updatedAt ?? null, data: parsed.data ?? null });
  } catch (e) {
    console.error('[GET sync error]', e.message);
    res.status(500).json({ error: 'read_failed' });
  }
});

// POST /api/sync { userId, version, data }
app.post('/api/sync', (req, res) => {
  const { userId, version, data } = req.body;
  if (!validUid(userId)) return res.status(400).json({ error: 'invalid_userId' });
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 0)
    return res.status(400).json({ error: 'invalid_version' });

  const fp = safePath(userId);
  if (!fp) return res.status(400).json({ error: 'invalid_userId' });

  // 乐观锁版本冲突检测
  if (existsSync(fp)) {
    try {
      const cur = JSON.parse(readFileSync(fp, 'utf-8'));
      if ((cur.version ?? 0) !== version)
        return res.status(409).json({ error: 'version_conflict', currentVersion: cur.version });
    } catch (err) {
      console.error('[conflict check error]', err.message);
      return res.status(500).json({ error: 'conflict_check_failed' });
    }
  }

  const tmp = fp + '.tmp';
  const now = new Date().toISOString();
  const content = JSON.stringify({ version: version + 1, updatedAt: now, data }, null, 2);

  try {
    writeFileSync(tmp, content, 'utf-8');
    renameSync(tmp, fp);
    console.log(`[sync] OK userId=${userId} version=${version + 1}`);
    res.json({ version: version + 1, updatedAt: now });
  } catch (err) {
    console.error('[sync] write failed', err.message);
    res.status(500).json({ error: 'write_failed' });
  }
});

// ─── DashScope TTS ──────────────────────────────────────────
const API_KEY = process.env.DASHSCOPE_API_KEY;
if (!API_KEY) {
  console.warn('DASHSCOPE_API_KEY 未设置，TTS 功能不可用');
}
const WS_URL = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference';

const VOICE_MAP = {
  female: 'longanwen_v3',
  male:   'longanyun_v3',
};
const VOICE_NAMES = {
  female: '龙安温（温柔女声）',
  male:   '龙安昀（温柔男声）',
};

function cosyvoiceTTS(text, voiceId) {
  return new Promise((resolve, reject) => {
    if (!API_KEY) return reject(new Error('DASHSCOPE_API_KEY not set'));
    const taskId = crypto.randomUUID();
    const audioChunks = [];
    let done = false;
    let step = 0;

    const ws = new WebSocket(WS_URL, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    const safeClose = () => {
      if (ws.readyState === ws.OPEN || ws.readyState === ws.CONNECTING) {
        try { ws.close(); } catch {}
      }
    };

    const finish = (buf) => {
      if (done) return;
      done = true;
      safeClose();
      if (buf.length > 0) resolve(buf);
      else reject(new Error('No audio returned from CosyVoice'));
    };

    const fail = (err) => {
      if (done) return;
      done = true;
      safeClose();
      reject(err);
    };

    ws.on('open', () => {
      ws.send(JSON.stringify({
        header: { action: 'run-task', task_id: taskId },
        payload: {
          task_group: 'audio',
          task: 'tts',
          function: 'SpeechSynthesizer',
          model: 'cosyvoice-v3-flash',
          input: { text },
          parameters: {
            text_type: 'PlainText',
            voice: voiceId,
            format: 'wav',
            sample_rate: 16000,
          },
        },
      }));
      step = 1;
    });

    ws.on('message', (data) => {
      if (done) return;
      if (Buffer.isBuffer(data)) {
        if (data.length > 0) { audioChunks.push(data); step = 3; }
        return;
      }
      let parsed;
      try { parsed = JSON.parse(data.toString()); } catch { return; }
      const { header = {}, payload = {} } = parsed;
      const event = header.event || header.type;
      if (event === 'task-started') { step = 2; return; }
      if (event === 'result-generated') {
        const raw = payload.audio_binary || payload.output;
        if (raw && typeof raw === 'string') audioChunks.push(Buffer.from(raw, 'base64'));
        if (payload.complete ?? parsed.complete)
          ws.send(JSON.stringify({ header: { action: 'finish-task', task_id: taskId } }));
        return;
      }
      if (event === 'task-finished') {
        const raw = payload.audio_binary || payload.audio || payload.output;
        if (raw && typeof raw === 'string') audioChunks.push(Buffer.from(raw, 'base64'));
        finish(Buffer.concat(audioChunks));
        return;
      }
      if (event === 'error' || header.error_code)
        fail(new Error(header.error_message || `CosyVoice error: ${header.error_code}`));
    });

    ws.on('close', (code) => {
      if (!done) {
        if (audioChunks.length > 0) finish(Buffer.concat(audioChunks));
        else fail(new Error(`WebSocket closed (code ${code})`));
      }
    });

    ws.on('error', (err) => fail(new Error(`WebSocket error: ${err.message}`)));
    setTimeout(() => fail(new Error('TTS timeout (45s)')), 45000);
  });
}

app.post('/api/tts', async (req, res) => {
  const { text, voice = 'female' } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const voiceId = VOICE_MAP[voice] || VOICE_MAP.female;
  try {
    const audio = await cosyvoiceTTS(text, voiceId);
    res.set({ 'Content-Type': 'audio/wav', 'Content-Length': audio.length });
    res.send(audio);
  } catch (err) {
    console.error('TTS error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tts-preview', async (req, res) => {
  const { voice = 'female' } = req.body;
  const voiceId = VOICE_MAP[voice] || VOICE_MAP.female;
  try {
    const audio = await cosyvoiceTTS('慢慢来，跟随声音入睡。', voiceId);
    res.set({ 'Content-Type': 'audio/wav', 'Content-Length': audio.length });
    res.send(audio);
  } catch (err) {
    console.error('TTS preview error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// 静态文件（前端构建产物）
app.use(express.static(join(__dirname, 'public')));

// SPA 路由支持
app.get('/sleep-aid/*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'sleep-aid', 'index.html'));
});
app.get('/mc-task/*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'mc-task', 'index.html'));
});
app.get('/art-chat/*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'art-chat', 'part2.html'));
});
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

createServer(app).listen(PORT, () => {
  console.log(`Backend -> http://localhost:${PORT}`);
  console.log(`Sync data dir: ${SYNC_DATA_DIR}`);
  if (API_KEY) console.log(`TTS voices: ${VOICE_NAMES.female}, ${VOICE_NAMES.male}`);
});
