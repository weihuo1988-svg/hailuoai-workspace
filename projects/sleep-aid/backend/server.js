/**
 * Sleep Aid Backend - DashScope CosyVoice WebSocket TTS
 * 协议来源：https://help.aliyun.com/zh/model-studio/cosyvoice-websocket-api/
 *
 * 正确流程：run-task → continue-task(text) → finish-task
 * 音频在 binary 帧中随 sentence-synthesis 事件分片返回
 */
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── DashScope 配置 ────────────────────────────────────────────
const API_KEY = process.env.DASHSCOPE_API_KEY;
if (!API_KEY) {
  console.error('❌ DASHSCOPE_API_KEY 环境变量未设置');
  process.exit(1);
}

// CosyVoice WebSocket URL（根据文档）
const WS_URL = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference';

// 音色映射
const VOICE_MAP = {
  female: 'longanwen_v3',
  male:   'longanyun_v3',
};

// ── TTS 核心（正确协议）─────────────────────────────────────────
function cosyvoiceTTS(text, voiceId) {
  return new Promise((resolve, reject) => {
    const taskId = crypto.randomUUID().replace(/-/g, '');
    const audioChunks = [];
    let done = false;
    let step = 0; // 0=init, 1=ws-open, 2=task-started, 3=audio-receiving

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
      else reject(new Error('No audio returned'));
    };

    const fail = (err) => {
      if (done) return;
      done = true;
      safeClose();
      reject(err);
    };

    // WebSocket open → 发送 run-task
    ws.addEventListener('open', () => {
      console.log('[WS] connected, sending run-task');
      ws.send(JSON.stringify({
        header: {
          action: 'run-task',
          task_id: taskId,
          streaming: 'duplex',   // 必须：文档明确要求
        },
        payload: {
          task_group: 'audio',
          task: 'tts',
          function: 'SpeechSynthesizer',
          model: 'cosyvoice-v3-flash',
          input: {},             // 必须为空：不在此处放文本
          parameters: {
            text_type: 'PlainText',
            voice: voiceId,
            format: 'mp3',       // mp3 体积小，适合流式
            sample_rate: 22050,  // 文档默认值
            rate: 1,
            pitch: 1,
          },
        },
      }));
      step = 1;
    });

    // 收到消息
    ws.addEventListener('message', (e) => {
      if (done) return;

      // 二进制帧 = 音频数据（跟在 sentence-synthesis 事件后）
      if (e.data instanceof Buffer || e.data instanceof ArrayBuffer) {
        const buf = e.data instanceof Buffer ? e.data : Buffer.from(e.data);
        if (buf.length > 10) {  // 过滤掉空帧
          audioChunks.push(buf);
          step = 3;
        }
        return;
      }

      let data;
      try { data = JSON.parse(e.data.toString()); }
      catch { return; }

      const { header = {}, payload = {} } = data;
      const event = header.event;
      const subType = payload.output?.type;

      if (event === 'task-started') {
        // 必须等 task-started 才能发 continue-task
        step = 2;
        console.log('[WS] task-started, sending text...');
        ws.send(JSON.stringify({
          header: { action: 'continue-task', task_id: taskId, streaming: 'duplex' },
          payload: { input: { text } },
        }));
        return;
      }

      if (event === 'result-generated') {
        if (subType === 'sentence-end' || subType === 'sentence-synthesis') {
          // audio 在后续 binary 帧中
          console.log('[WS] result-generated, type:', subType);
        }
        return;
      }

      if (event === 'task-finished') {
        console.log('[WS] task-finished, audio chunks:', audioChunks.length);
        finish(Buffer.concat(audioChunks));
        return;
      }

      if (event === 'task-failed') {
        fail(new Error(header.error_message || `CosyVoice failed: ${header.error_code}`));
      }
    });

    ws.addEventListener('close', (e) => {
      console.log(`[WS] closed code=${e.code} step=${step} chunks=${audioChunks.length}`);
      if (!done) {
        if (audioChunks.length > 0) finish(Buffer.concat(audioChunks));
        else fail(new Error(`WebSocket closed (code ${e.code})`));
      }
    });

    ws.addEventListener('error', (err) => fail(new Error(`WebSocket error: ${err.message}`)));

    // 45s 超时保护
    setTimeout(() => fail(new Error('TTS timeout (45s)')), 45000);
  });
}

// ── HTTP 接口 ──────────────────────────────────────────────────
app.post('/api/tts', async (req, res) => {
  const { text, voice = 'female' } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  const voiceId = VOICE_MAP[voice] || VOICE_MAP.female;
  try {
    const audio = await cosyvoiceTTS(text, voiceId);
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': audio.length });
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
    res.set({ 'Content-Type': 'audio/mpeg', 'Content-Length': audio.length });
    res.send(audio);
  } catch (err) {
    console.error('TTS preview error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// 静态文件
app.use(express.static(join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

createServer(app).listen(PORT, () => {
  console.log(`Sleep Aid backend → http://localhost:${PORT}`);
  console.log(`Voices: female=${VOICE_MAP.female}, male=${VOICE_MAP.male}`);
});
