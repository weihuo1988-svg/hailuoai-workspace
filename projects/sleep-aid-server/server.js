/**
 * Sleep Aid Backend - DashScope CosyVoice v3 WebSocket TTS
 * 协议参考：https://help.aliyun.com/zh/dashscope/
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
  console.error('❌ DASHSCOPE_API_KEY 环境变量未设置，请先设置再启动');
  process.exit(1);
}
const WS_URL = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference';

// CosyVoice v3 音色
const VOICE_MAP = {
  female: 'longanwen_v3',   // 龙安温
  male:   'longanyun_v3',   // 龙安昀
};
const VOICE_NAMES = {
  female: '龙安温（温柔女声）',
  male:   '龙安昀（温柔男声）',
};

// ── TTS 核心 ──────────────────────────────────────────────────
function cosyvoiceTTS(text, voiceId) {
  return new Promise((resolve, reject) => {
    const taskId = crypto.randomUUID();
    const audioChunks = [];
    let done = false;
    let step = 0; // 0=init, 1=open, 2=task-started, 3=audio received

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

    // WebSocket 事件
    ws.addEventListener('open', () => {
      console.log(`[WS] connected, sending run-task`);
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

    ws.addEventListener('message', (e) => {
      if (done) return;

      // 二进制帧 = 音频数据片段
      if (e.data instanceof Buffer || e.data instanceof ArrayBuffer) {
        const buf = e.data instanceof Buffer ? e.data : Buffer.from(e.data);
        if (buf.length > 0) {
          audioChunks.push(buf);
          step = 3;
        }
        return;
      }

      let data;
      try { data = JSON.parse(e.data.toString()); }
      catch { return; }

      const { header = {}, payload = {} } = data;
      const event = header.event || header.type;

      if (event === 'task-started') {
        step = 2;
        console.log('[WS] task-started, waiting for audio...');
        return;
      }

      if (event === 'result-generated') {
        // 流式音频帧（base64）
        const raw = payload.audio_binary || payload.output;
        if (raw && typeof raw === 'string') {
          audioChunks.push(Buffer.from(raw, 'base64'));
        }
        // 发送 finish-task 触发 server 返回完整音频
        const isDone = payload.complete ?? data.complete;
        if (isDone) {
          ws.send(JSON.stringify({ header: { action: 'finish-task', task_id: taskId } }));
        }
        return;
      }

      if (event === 'task-finished') {
        // 非流式：完整音频在 payload 中
        console.log('[WS] task-finished');
        const raw = payload.audio_binary || payload.audio || payload.output;
        if (raw && typeof raw === 'string') {
          audioChunks.push(Buffer.from(raw, 'base64'));
        }
        finish(Buffer.concat(audioChunks));
        return;
      }

      if (event === 'error' || header.error_code) {
        fail(new Error(header.error_message || `CosyVoice error: ${header.error_code}`));
      }
    });

    ws.addEventListener('close', (e) => {
      console.log(`[WS] closed code=${e.code} step=${step} chunks=${audioChunks.length}`);
      if (!done) {
        if (audioChunks.length > 0) {
          finish(Buffer.concat(audioChunks));
        } else {
          fail(new Error(`WebSocket closed (code ${e.code})`));
        }
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

// ── 静态文件 ──────────────────────────────────────────────────
app.use(express.static(join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

createServer(app).listen(PORT, () => {
  console.log(`Sleep Aid backend → http://localhost:${PORT}`);
  console.log(`Voices: female=${VOICE_NAMES.female}, male=${VOICE_NAMES.male}`);
});
