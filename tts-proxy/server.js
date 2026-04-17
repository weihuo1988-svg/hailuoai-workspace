/**
 * 阿里云 TTS 代理服务
 * 接收前端文字请求，调用阿里云语音合成，返回音频
 * 
 * 阿里云真实录音棚音色：zhiming_zhenzhong（男声，温和沉稳）
 * 支持流式 + 非流式
 */

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
const { Readable } = require('stream');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// 阿里云配置（请替换为你的真实值）
// 阿里云 AccessKey ID + AccessKey Secret
const ACCESS_KEY_ID     = 'sk-973671b9760f45c5b74322a8ae087279';
const ACCESS_KEY_SECRET  = 'sk-973671b9760f45c5b74322a8ae087279'; // 请填入真实 Secret
const REGION            = 'cn-shanghai';  // 区域
const VOICE_NAME        = 'zhiming_zhenzhong'; // 温和男声
const SPEAKER_VOLUME     = 5;              // 音量 0-10
const SPEAKER_RATE       = '-250';         // 语速 -500~+500，-250 偏慢
const SPEAKER_PITCH      = '0';            // 音调 -500~+500

// 计算 HMAC-SHA1 签名（阿里云标准算法）
function hmacSha1(secret, str) {
  return crypto.createHmac('sha1', secret).update(str, 'utf8').digest('base64');
}

// 构造阿里云语音合成请求
function buildAliyunRequest(text, voice = VOICE_NAME) {
  const method = 'GET';
  const pathname = '/stream';
  const queryParams = {
    appkey: ACCESS_KEY_ID,
    text,
    voice,
    format: 'mp3',
    sample_rate: '16000',
    speech_rate: SPEAKER_RATE,
    pitch_rate: SPEAKER_PITCH,
    volume: String(SPEAKER_VOLUME),
  };

  // 1. 排序参数
  const sortedKeys = Object.keys(queryParams).sort();
  // 2. 构造待签名字符串
  const canonicalized = sortedKeys.map(k => {
    const v = queryParams[k];
    return `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
  }).join('&');

  // 3. StringToSign
  const stringToSign = [
    method,
    pathname,
    canonicalized
  ].join('\n');

  // 4. 签名
  const signature = hmacSha1(ACCESS_KEY_SECRET + '&', stringToSign);

  // 5. Authorization header
  const auth = `Dataplus ${ACCESS_KEY_ID}:${signature}`;

  const url = `https://nls-gateway-${REGION}.aliyuncs.com/stream${pathname}?${canonicalized}`;

  return { url, auth, queryParams };
}

// TTS 端点
app.post('/tts', async (req, res) => {
  const { text, voice, volume, speech_rate } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'text is required' });
  }

  if (text.length > 300) {
    return res.status(400).json({ error: 'text too long (max 300 chars)' });
  }

  const params = {
    voice: voice || VOICE_NAME,
    speech_rate: speech_rate || SPEAKER_RATE,
    volume: volume !== undefined ? String(volume) : String(SPEAKER_RATE),
  };

  const { url, auth } = buildAliyunRequest(text, params.voice);

  try {
    console.log(`[TTS] 请求合成: "${text.substring(0, 30)}..."`);
    console.log(`[TTS] Voice: ${params.voice}, Rate: ${params.speech_rate}`);

    const response = await axios({
      method: 'GET',
      url,
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    const contentType = response.headers['content-type'] || 'audio/mp3';
    console.log(`[TTS] 成功，audio size: ${response.data.length} bytes, type: ${contentType}`);

    res.set({
      'Content-Type': contentType,
      'Content-Length': response.data.length,
      'Cache-Control': 'no-cache',
      'X-Voice': params.voice,
    });
    res.send(response.data);

  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data;
    let msg = 'TTS请求失败';
    if (data && Buffer.isBuffer(data)) {
      try {
        const json = JSON.parse(data.toString());
        msg = json.message || json.error_msg || msg;
      } catch {}
    }
    console.error(`[TTS] 失败 [${status}]: ${msg}`, err.message);
    res.status(status).json({ error: msg, detail: err.message });
  }
});

// 健康检查
app.get('/health', (req, res) => res.json({ ok: true, voice: VOICE_NAME }));

const PORT = 3456;
app.listen(PORT, () => {
  console.log(`🎙️ TTS Proxy 启动: http://localhost:${PORT}`);
  console.log(`🔑 AccessKey ID 前5位: ${ACCESS_KEY_ID.substring(0, 5)}...`);
  console.log(`🗣️ 音色: ${VOICE_NAME} (温柔男声)`);
  console.log(`📖 POST /tts  { text: "要读的词" }`);
});
