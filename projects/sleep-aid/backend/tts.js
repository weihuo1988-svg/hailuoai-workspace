import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-973671b9760f45c5b74322a8ae087279';
const WS_URL = 'wss://dashscope.aliyuncs.com/api-ws/v1/inference';

// 音色映射
const VOICE_MAP = {
  '温柔女声': { voice_id: 'longanwen_v3', name: '龙安温' },
  '温柔男声': { voice_id: 'longanyun_v3', name: '龙安昀' },
};

function generateTaskId() {
  return 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
}

function sendWsMessage(ws, query) {
  return new Promise((resolve, reject) => {
    if (ws.readyState !== ws.OPEN) { reject(new Error('WebSocket not open')); return; }
    ws.send(JSON.stringify(query));
    const cleanup = () => {
      ws.removeEventListener('message', onMsg);
      ws.removeEventListener('error', onErr);
    };
    function onMsg(e) {
      try {
        const data = JSON.parse(e.data);
        cleanup();
        resolve(data);
      } catch { /* binary frame */ resolve(null); }
    }
    function onErr(err) { cleanup(); reject(err); }
    ws.addEventListener('message', onMsg);
    ws.addEventListener('error', onErr);
  });
}

async function cosyvoiceTTS(text, voiceId) {
  return new Promise((resolve, reject) => {
    const taskId = generateTaskId();
    const audioChunks = [];
    let taskStatus = null;

    const ws = new WebSocket(WS_URL, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'X-DashScope-Async': 'disable',
      }
    });

    ws.addEventListener('open', async () => {
      try {
        // 1. Send start request
        const startRes = await sendWsMessage(ws, {
          task_id: taskId,
          type: 'START',
          model: 'cosyvoice-v3-flash',
          parameters: {
            voice: voiceId,
            format: 'wav',
            sample_rate: 48000,
            text_type: 'plain',
           inet_debug: false,
          },
          input: { text: '' },
        });

        // 2. Send text
        ws.send(JSON.stringify({ task_id: taskId, type: 'CONTINUE', input: { text } }));

        // 3. Send stop
        ws.send(JSON.stringify({ task_id: taskId, type: 'STOP', input: {} }));
      } catch (err) {
        ws.close();
        reject(err);
      }
    });

    ws.addEventListener('message', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'RESULT' || data.type === 'UPDATE') {
          if (data.audio_binary) audioChunks.push(Buffer.from(data.audio_binary, 'base64'));
          if (data.type === 'RESULT') taskStatus = 'done';
        }
      } catch {
        // binary frame - audio data
        if (e.data instanceof Buffer) audioChunks.push(e.data);
        else if (e.data && typeof e.data === 'object' && e.data.data) {
          audioChunks.push(Buffer.from(e.data.data));
        }
      }
    });

    ws.addEventListener('close', (e) => {
      if (audioChunks.length > 0) resolve(Buffer.concat(audioChunks));
      else if (taskStatus === 'done') resolve(Buffer.concat(audioChunks));
      else reject(new Error(`WebSocket closed with code ${e.code}, no audio`));
    });

    ws.addEventListener('error', (err) => reject(err));

    // Timeout after 30s
    setTimeout(() => { ws.close(); reject(new Error('TTS timeout')); }, 30000);
  });
}

// REST endpoints
app.post('/api/tts', async (req, res) => {
  const { text, voice = '温柔女声' } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const voiceInfo = VOICE_MAP[voice] || VOICE_MAP['温柔女声'];
  try {
    const audio = await cosyvoiceTTS(text, voiceInfo.voice_id);
    res.set({ 'Content-Type': 'audio/wav', 'Content-Length': audio.length });
    res.send(audio);
  } catch (err) {
    console.error('TTS error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tts-preview', async (req, res) => {
  const { voice = '温柔女声' } = req.body;
  const voiceInfo = VOICE_MAP[voice] || VOICE_MAP['温柔女声'];
  try {
    const audio = await cosyvoiceTTS('慢慢来，跟随声音入睡。', voiceInfo.voice_id);
    res.set({ 'Content-Type': 'audio/wav', 'Content-Length': audio.length });
    res.send(audio);
  } catch (err) {
    console.error('TTS preview error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Serve static frontend
app.use(express.static(join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`Sleep Aid backend running on http://localhost:${PORT}`);
  console.log(`Voices: 温柔女声=${VOICE_MAP['温柔女声'].name}, 温柔男声=${VOICE_MAP['温柔男声'].name}`);
});
