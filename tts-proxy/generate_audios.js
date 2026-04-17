/**
 * 预生成阿里云TTS音频脚本
 * 将所有助眠词预先合成为MP3，上传到CDN
 * 前端直接播放CDN URL，无需后端代理
 */
const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const WORDS = [
  '热气腾腾的面包', '红色的皮球', '南极冰川', '冰镇西瓜',
  '老旧的木梳', '雨后的蜗牛', '蓝色的海浪', '棉花糖',
  '喜马拉雅山', '琥珀色的蜂蜜', '飘落的枫叶', '旧木书架',
  '清晨的露珠', '温暖的毛毯', '石板路上的苔藓', '远处的风车',
  '薄荷味的牙膏', '松软的枕头', '古老的铜铃', '山间的清泉',
  '白色蒲公英', '烤红薯的香气', '雨后的泥土', '星空下的帐篷',
  '手摇的音乐盒', '静谧的竹林', '旧陶罐', '冬日的玻璃窗',
  '淡淡的薰衣草', '河边的鹅卵石', '午后的向日葵', '蓝色的绣球花',
  '木质的相框', '融化的黄油', '清晨的薄雾', '古铜色的指南针',
  '柠檬片', '老房子的红砖', '草地上的野花', '窗边的风铃',
  '橘色的晚霞', '新翻的书页', '安静的壁炉', '湿润的青苔',
  '白色的帆布鞋', '山涧的细流', '柔软的棉布', '褪色的蓝布',
  '熟透的桃子', '生锈的铁门', '古树的年轮', '清晨的鸟鸣',
]

const VOICE = 'zhiming_zhenzhong'
const REGION = 'cn-shanghai'
const OUT_DIR = path.join(__dirname, 'audios')
const MANIFEST_FILE = path.join(__dirname, 'audio_manifest.json')

function hmacSha1(key, text) {
  return crypto.createHmac('sha1', key).update(text, 'utf8').digest('base64')
}

function buildTTSUrl(text) {
  const APPKEY = 'sk-973671b9760f45c5b74322a8ae087279'
  const queries = {
    appkey: APPKEY,
    text,
    voice: VOICE,
    format: 'mp3',
    sample_rate: '16000',
    speech_rate: '-200',
    pitch_rate: '0',
    volume: '5',
  }
  const sortedKeys = Object.keys(queries).sort()
  const canonical = sortedKeys.map(k =>
    `${encodeURIComponent(k)}=${encodeURIComponent(queries[k])}`
  ).join('&')
  const stringToSign = ['GET', '/stream', canonical].join('\n')
  const sig = hmacSha1(APPKEY + '&', stringToSign)
  const auth = `Dataplus ${APPKEY}:${sig}`
  const url = `https://nls-gateway-${REGION}.aliyuncs.com/stream?${canonical}`
  return { url, auth }
}

function httpGet(url, auth) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
      timeout: 15000,
    }
    const client = url.startsWith('https') ? https : http
    const req = client.request(opts, res => {
      if (res.statusCode !== 200) {
        let body = ''
        res.on('data', c => body += c)
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 100)}`)))
        return
      }
      const bufs = []
      res.on('data', c => bufs.push(c))
      res.on('end', () => resolve(Buffer.concat(bufs)))
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
    req.end()
  })
}

function safeFilename(word) {
  return word.replace(/[\/\?<>\\:*"|\s]/g, '_')
}

async function generateOne(word, idx) {
  const fname = `${String(idx).padStart(2, '0')}_${safeFilename(word)}.mp3`
  const fpath = path.join(OUT_DIR, fname)
  if (fs.existsSync(fpath)) {
    return { word, idx, fname, size: fs.statSync(fpath).size, status: 'skip' }
  }
  try {
    const { url, auth } = buildTTSUrl(word)
    const buf = await httpGet(url, auth)
    fs.writeFileSync(fpath, buf)
    console.log(`  [生成] ${idx + 1}/${WORDS.length} "${word}" → ${fname} (${buf.length}B)`)
    return { word, idx, fname, size: buf.length, status: 'ok' }
  } catch (e) {
    console.error(`  [失败] ${idx + 1}/${WORDS.length} "${word}": ${e.message}`)
    return { word, idx, fname, error: e.message, status: 'fail' }
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  console.log(`\n开始生成 ${WORDS.length} 个助眠词音频（阿里云 ${VOICE}）...\n`)

  const results = []
  for (let i = 0; i < WORDS.length; i++) {
    const r = await generateOne(WORDS[i], i)
    results.push(r)
    if (r.status !== 'skip') await new Promise(res => setTimeout(res, 400))
  }

  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(results, null, 2))
  const ok = results.filter(r => r.status === 'ok').length
  const skip = results.filter(r => r.status === 'skip').length
  const fail = results.filter(r => r.status === 'fail').length
  console.log(`\n✅ 完成！生成:${ok} 跳过:${skip} 失败:${fail}`)
  if (fail > 0) {
    console.log('失败项:', results.filter(r => r.status === 'fail').map(r => r.word).join(', '))
  }
}

main().catch(console.error)
