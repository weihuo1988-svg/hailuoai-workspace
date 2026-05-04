import { useState, useRef, useCallback, useEffect } from 'react'

const TIMER_OPTIONS = [5, 10, 15, 20, 30, 45, 60]

let _noiseBuffer: AudioBuffer | null = null

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (_noiseBuffer) return _noiseBuffer
  const sr = ctx.sampleRate
  const len = sr * 2
  const buf = ctx.createBuffer(1, len, sr)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  _noiseBuffer = buf
  return buf
}

type Phase = 'idle' | 'playing' | 'ending'
type VoiceType = 'female' | 'male'

const WORDS = [
  '热气腾腾的面包', '红色的皮球', '南极冰川', '冰镇西瓜',
  '老旧的木梳', '雨后的蜗牛', '蓝色的海浪', '棉花糖',
  '喜马拉雅山', '琥珀色的蜂蜜', '飘落的枫叶', '旧木书架',
  '清晨的露珠', '温暖的毛毯', '石板路上的苔藓', '远处的风车',
  '薄荷味的牙膏', '松软的枕头', '古老的铜铃', '山间的清泉',
  '白色蒲公英', '烤红薯的香气', '雨后的泥土', '星空下的帐篷',
  '手摇的音乐盒', '静谧的竹林', '旧陶罐', '冬日的玻璃窗',
  '淡淡的薰衣草', '河边的鹅卵石', '午后的向日葵', '蓝色的绣球花',
]

/** 通过后端 API 调用 TTS */
async function dashscopeTTS(text: string, voiceType: VoiceType): Promise<void> {
  const voice = voiceType === 'female' ? 'longanwen_v3' : 'longanyun_v3'

  const response = await fetch('/api/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
  })

  if (!response.ok) {
    throw new Error('TTS failed')
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  return new Promise((resolve, reject) => {
    audio.onended = () => { URL.revokeObjectURL(url); resolve() }
    audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error('audio play failed')) }
    audio.play()
  })
}

function browserSpeak(text: string, voiceType: VoiceType): Promise<void> {
  return dashscopeTTS(text, voiceType)
}

export default function SleepAid() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [timer, setTimer] = useState(15)
  const [voice, setVoice] = useState<VoiceType>('female')
  const [currentWord, setCurrentWord] = useState('')
  const [prevWord, setPrevWord] = useState('')

  const ctxRef = useRef<AudioContext | null>(null)
  const noiseGainRef = useRef<GainNode | null>(null)
  const noiseSrcRef = useRef<AudioBufferSourceNode | null>(null)
  const wordTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const endingRef = useRef(false)
  const volumeRef = useRef(0.5)

  const ensureAudio = useCallback(async () => {
    if (ctxRef.current) {
      const ctx = ctxRef.current
      if (ctx.state === 'suspended') await ctx.resume()
      return ctx
    }
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const ng = ctx.createGain()
    ng.gain.value = 0
    ng.connect(ctx.destination)
    noiseGainRef.current = ng
    ctxRef.current = ctx
    createNoiseBuffer(ctx)
    await ctx.resume()
    return ctx
  }, [])

  const startNoise = useCallback(async (vol: number) => {
    const ctx = await ensureAudio()
    const ng = noiseGainRef.current
    if (!ctx || !ng) return
    if (noiseSrcRef.current) {
      try { noiseSrcRef.current.stop() } catch {}
      noiseSrcRef.current = null
    }
    const src = ctx.createBufferSource()
    src.buffer = createNoiseBuffer(ctx)
    src.loop = true
    src.connect(ng)
    src.start()
    noiseSrcRef.current = src
    const now = ctx.currentTime
    ng.gain.setValueAtTime(0, now)
    ng.gain.linearRampToValueAtTime(vol, now + 3)
  }, [ensureAudio])

  const stopNoise = useCallback(() => {
    const ng = noiseGainRef.current
    const ctx = ctxRef.current
    if (!ng || !ctx) return
    const now = ctx.currentTime
    ng.gain.setValueAtTime(ng.gain.value, now)
    ng.gain.linearRampToValueAtTime(0, now + 2)
    setTimeout(() => {
      try { noiseSrcRef.current?.stop() } catch {}
      noiseSrcRef.current = null
    }, 2200)
  }, [])

  const stopAll = useCallback(() => {
    window.speechSynthesis?.cancel()
    if (wordTimerRef.current) clearTimeout(wordTimerRef.current)
    if (countRef.current) clearInterval(countRef.current)
    stopNoise()
    endingRef.current = true
  }, [stopNoise])

  const scheduleNext = useCallback((prev: string) => {
    if (endingRef.current) return
    let w = WORDS[Math.floor(Math.random() * WORDS.length)]
    if (w === prev) w = WORDS[(WORDS.indexOf(w) + 1) % WORDS.length]
    setPrevWord(prev)
    setCurrentWord(w)
    browserSpeak(w, voice).then(() => {
      if (endingRef.current) return
      wordTimerRef.current = setTimeout(() => {
        if (!endingRef.current) scheduleNext(w)
      }, 1000)
    })
  }, [voice])

  const startSleep = async () => {
    endingRef.current = false
    setPhase('playing')
    setCurrentWord('')
    setPrevWord('')
    await ensureAudio()
    await startNoise(volumeRef.current)

    let left = timer * 60
    countRef.current = setInterval(() => {
      left -= 1
      if (left <= 0 && !endingRef.current) {
        endingRef.current = true
        clearInterval(countRef.current!)
        setPhase('ending')
        browserSpeak('晚安，明天见。', voice)
        setTimeout(() => { stopAll(); setPhase('idle'); setCurrentWord(''); setPrevWord('') }, 6000)
        return
      }
    }, 1000)

    browserSpeak('好，我们开始。闭上眼睛，跟随声音。', voice).then(() => {
      if (endingRef.current) return
      setTimeout(() => {
        if (endingRef.current) return
        const w = WORDS[Math.floor(Math.random() * WORDS.length)]
        setCurrentWord(w)
        browserSpeak(w, voice).then(() => {
          if (endingRef.current) return
          scheduleNext(w)
        })
      }, 1000)
    })
  }

  const handleVolume = (v: number) => {
    volumeRef.current = v
    if (noiseGainRef.current && ctxRef.current)
      noiseGainRef.current.gain.setValueAtTime(v, ctxRef.current.currentTime)
  }

  useEffect(() => () => { stopAll() }, [stopAll])

  if (phase === 'ending') return (
    <div style={{ minHeight: '100dvh', background: '#080c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, "PingFang SC", sans-serif' }}>
      <Bg />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <div style={{ fontSize: 80, marginBottom: 24 }}>🌙</div>
        <div style={{ fontSize: '2rem', color: 'rgba(255,255,255,0.7)', fontWeight: 300, letterSpacing: '0.15em' }}>晚安</div>
        <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.9rem', marginTop: 8 }}>明天见</div>
      </div>
    </div>
  )

  if (phase === 'playing') {
    return (
      <div style={{ minHeight: '100dvh', background: '#080c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, "PingFang SC", sans-serif', position: 'relative' }}>
        <Bg />
        <div style={{ position: 'fixed', top: 32, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(100,150,255,0.45)', fontSize: 11, letterSpacing: '0.2em' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(100,180,255,0.55)', animation: 'pulse 2s infinite' }} />
            <span>白噪音 · {voice === 'female' ? '🎀' : '🎙️'} {voice === 'female' ? '温柔女声' : '温柔男声'}</span>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px' }}>
          {prevWord ? (
            <div style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.1)', marginBottom: 16, letterSpacing: '0.18em', animation: 'fadeOut 1.8s ease forwards' }}>{prevWord}</div>
          ) : null}
          {currentWord ? (
            <div style={{ fontSize: '2.2rem', color: 'rgba(255,255,255,0.72)', letterSpacing: '0.22em', fontWeight: 300, animation: 'fadeIn 1.2s ease' }}>{currentWord}</div>
          ) : null}
          <div style={{ marginTop: 64, fontSize: '0.65rem', color: 'rgba(255,255,255,0.1)', letterSpacing: '0.5em', textTransform: 'uppercase' }}>Cognitive Shuffling</div>
        </div>
        <div style={{ position: 'fixed', bottom: 40, left: 24, right: 24, zIndex: 20, maxWidth: 360, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>🔈</span>
            <input type="range" min={0} max={1} step={0.02} defaultValue={0.5}
              onChange={(e) => handleVolume(parseFloat(e.target.value))}
              style={{ flex: 1, WebkitAppearance: 'none', height: 1, background: 'rgba(255,255,255,0.13)', outline: 'none' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>🔊</span>
          </div>
          <button onClick={() => { stopAll(); setPhase('idle'); setCurrentWord(''); setPrevWord('') }}
            style={{ width: '100%', padding: '12px 0', borderRadius: 999, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.28)', border: '1px solid rgba(255,255,255,0.09)', fontSize: 14, cursor: 'pointer' }}>
            停止
          </button>
        </div>
      </div>
    )
  }

  const voiceBtn = (v: VoiceType, label: string, emoji: string, color: string) => {
    const active = voice === v
    return (
      <button key={v} onClick={() => setVoice(v)} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: '20px 28px', borderRadius: 20,
        background: active ? color + '22' : 'rgba(255,255,255,0.04)',
        color: active ? '#fff' : 'rgba(255,255,255,0.33)',
        border: active ? '2.5px solid ' + color : '2px solid rgba(255,255,255,0.07)',
        transform: active ? 'scale(1.07)' : 'scale(1)',
        boxShadow: active ? '0 0 28px ' + color + '35' : 'none',
        transition: 'all 0.22s ease', cursor: 'pointer', minWidth: 110,
      }}>
        <span style={{ fontSize: 36 }}>{emoji}</span>
        <span style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{label}</span>
      </button>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#080c14', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, "PingFang SC", sans-serif' }}>
      <Bg />
      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 440, padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🌙</div>
          <h1 style={{ fontSize: '1.9rem', color: 'rgba(255,255,255,0.72)', fontWeight: 300, letterSpacing: '0.2em', marginBottom: 8 }}>认知洗牌</h1>
          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.68rem', letterSpacing: '0.4em', textTransform: 'uppercase' }}>Cognitive Shuffling · 助眠引导</p>
        </div>
        <div style={{ marginBottom: 36 }}>
          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>选择音色</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            {voiceBtn('female', '温柔女声', '🎀', '#ec4899')}
            {voiceBtn('male', '温柔男声', '🎙️', '#60a5fa')}
          </div>
        </div>
        <div style={{ marginBottom: 40 }}>
          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>定时关闭</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {TIMER_OPTIONS.map((min) => {
              const active = timer === min
              return (
                <button key={min} onClick={() => setTimer(min)} style={{
                  padding: '8px 15px', borderRadius: 999, fontSize: 13, fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.04)',
                  color: active ? '#e2e8f0' : 'rgba(255,255,255,0.3)',
                  border: active ? '2px solid rgba(139,92,246,0.7)' : '1px solid rgba(255,255,255,0.08)',
                  transform: active ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: active ? '0 0 16px rgba(139,92,246,0.35)' : 'none',
                  transition: 'all 0.2s ease', cursor: 'pointer',
                }}>{min}分钟</button>
              )
            })}
          </div>
        </div>
        <button onClick={startSleep} style={{
          width: '100%', padding: '16px 0', borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.55), rgba(59,130,246,0.45))',
          color: 'rgba(255,255,255,0.9)', border: '2px solid rgba(139,92,246,0.45)',
          fontSize: '1rem', fontWeight: 600, letterSpacing: '0.12em',
          cursor: 'pointer', boxShadow: '0 4px 28px rgba(139,92,246,0.3)', transition: 'all 0.2s',
        }}>开始助眠 →</button>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.12)', fontSize: 11, marginTop: 14 }}>
          白噪音 · {voice === 'female' ? '温柔女声' : '温柔男声'} · 系统语音
        </p>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeOut { from { opacity: 0.8; } to { opacity: 0; } }
        input[type=range] { -webkit-appearance: none; height: 1px; background: rgba(255,255,255,0.13); outline: none; border-radius: 1px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 13px; height: 13px; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer; }
      `}</style>
    </div>
  )
}

function Bg() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(25,35,70,0.9) 0%, transparent 70%)' }} />
      <div style={{ position: 'absolute', bottom: '20%', left: '50%', transform: 'translate(-50%,0)', width: 350, height: 350, borderRadius: '50%', opacity: 0.2, background: 'radial-gradient(circle, rgba(50,70,130,0.6) 0%, transparent 70%)' }} />
    </div>
  )
}
