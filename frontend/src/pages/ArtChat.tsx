import { useState, useRef, useCallback, useEffect } from 'react'

type Step = 'upload' | 'analyzing' | 'chat'

interface Conversation {
  q: string
  a: string
}

const QUESTION_POOL = [
  (els: string[]) => `我看到这幅画里有"${els[0] || '这里'}"！能给这幅画起个名字吗？🎨`,
  () => '这幅画画的是什么场景呀？给我讲讲吧 🌈',
  () => '你画这个的时候，最先想画的是什么？✨',
  () => '你最喜欢哪个部分？为什么最喜欢它？✨',
  () => '哪个颜色是你自己选的？为什么选这个？🎨',
  () => '这部分花了多长时间画的？💪',
  () => '画里这个小家伙在做什么？它开心吗？🌈',
  () => '这幅画的故事，是什么时候发生的呀？☀️',
  () => '如果画里的东西能动起来，会发生什么？🦄',
  () => '你画这幅画的时候，心情怎么样？😊',
  () => '画完之后，你满意吗？最满意哪一点？🌟',
  () => '这幅画你想给谁看呀？为什么？💌',
  () => '下次再画类似的，还想加点什么？🚀',
  () => '画里有没有什么是你自己想象出来的？✨',
  () => '如果下雨了，画里会变成什么样？☔',
  () => '画的时候遇到困难了吗？怎么解决的？💡',
  () => '和以前画的比起来，这幅有什么不一样？🌱',
  () => '你觉得自己是个有想象力的小画家吗？💜',
]

const TIPS = [
  { stage: '🎯 描述技巧', tip: '先让孩子自己说，不急着评价对错' },
  { stage: '🔍 聚焦技巧', tip: '带孩子注意细节："这部分的形状好特别！"' },
  { stage: '📖 叙事技巧', tip: '引导描述故事发展："然后呢？发生了什么？"' },
  { stage: '💜 感受技巧', tip: '共情创作感受："我感觉到你很享受！"' },
  { stage: '🚀 创意技巧', tip: '打开想象空间，不设限："如果…会怎样？"' },
  { stage: '🌱 回顾技巧', tip: '鼓励反思与成长，肯定努力过程' },
]

function generateFollowUp(question: string, answer: string): string {
  const a = answer.trim()
  if (a.length < 6) return '还有呢？还有吗？😊'
  if (question.includes('名字')) return '这个名字好棒！有什么特别的意思吗？✨'
  if (question.includes('颜色')) return '这个颜色好特别！为什么选它呀？🎨'
  if (question.includes('心情') || question.includes('开心')) return '听起来你很享受！最有意思的是哪一步？🌟'
  if (question.includes('想象')) return '这个创意是你自己想出来的吗？💡'
  if (question.includes('困难')) return '真棒！遇到困难还能想办法，下次想更上一层楼吗？🚀'
  if (question.includes('给谁')) return '收到这份礼物的ta一定会很开心！想说点什么吗？💌'
  const defaults = [
    '你这样说好有意思！能再多说一点吗？😊',
    '还有呢？还有吗？🌟',
    '为什么会这样想呀？💡',
    '听起来好有创意！是从哪里得到灵感的？✨',
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
}

function buildTemplateSummary(conv: Conversation[], elements: string[]): string {
  if (conv.length === 0) return ''
  const answers = conv.map(c => c.a).join(' ')
  const words = (answers.match(/[^\s，。！？、]{2,8}/g) || [])
  const unique = [...new Set(words)].slice(0, 4)
  const el = elements[0] || '画里的内容'
  const templates = [
    `今天陪孩子一起看了ta的画，听ta讲画里的故事——"${unique[0] || el}"，每一个细节都是小小的世界。原来孩子的脑袋里，装着这么多我没想过的东西。蹲下来倾听，才能看见孩子的世界。感谢这次对话，和ta一起成长。`,
    `孩子指着这幅画说"${unique[0] || el}"，我追问了一下，发现ta的脑子里有一整个宇宙。简单又笃定，是我早就丢了的东西。记录这一刻，保持好奇，和孩子一起。`,
    `画画的时候，孩子眼里有光。问ta为什么这样画，ta说"${unique[0] || '因为想'}"。简单又笃定，是我早就丢了的东西。记录这一刻，和孩子一起，保持想象。`,
  ]
  return templates[Math.floor(Math.random() * templates.length)]
}

export default function ArtChat() {
  const [step, setStep] = useState<Step>('upload')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [elements, setElements] = useState<string[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [questionCount, setQuestionCount] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [usedQuestionIndexes, setUsedQuestionIndexes] = useState<number[]>([])
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [summary, setSummary] = useState('')
  const [toast, setToast] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2800)
  }, [])

  const pickQuestion = useCallback(() => {
    const available = QUESTION_POOL.map((_, i) => i).filter(i => !usedQuestionIndexes.includes(i))
    if (available.length === 0) {
      setUsedQuestionIndexes([])
      return pickQuestion()
    }
    const idx = available[Math.floor(Math.random() * available.length)]
    setUsedQuestionIndexes(prev => [...prev, idx])
    return QUESTION_POOL[idx](elements)
  }, [elements, usedQuestionIndexes])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setStep('analyzing')

    // Simulate AI analysis (in production, call real AI API)
    setTimeout(() => {
      const mockElements = ['可爱的小人', '蓝色的天空', '绿色的草地', '太阳']
      setElements(mockElements)
      setStep('chat')
      const q = QUESTION_POOL[0](mockElements)
      setCurrentQuestion(q)
      setQuestionCount(1)
      setUsedQuestionIndexes([0])
    }, 2000)
  }

  const sendAnswer = useCallback(async () => {
    if (!inputValue.trim()) return
    const answer = inputValue.trim()
    setInputValue('')

    setConversations(prev => [...prev, { q: currentQuestion, a: answer }])

    // Generate follow-up question
    await new Promise(r => setTimeout(r, 500))
    const followUp = generateFollowUp(currentQuestion, answer)
    setCurrentQuestion(followUp)
    setQuestionCount(prev => prev + 1)
  }, [inputValue, currentQuestion])

  const askNewQuestion = useCallback(() => {
    const q = pickQuestion()
    setCurrentQuestion(q)
    setQuestionCount(prev => prev + 1)
  }, [pickQuestion])

  const generateSummary = useCallback(() => {
    const text = buildTemplateSummary(conversations, elements)
    setSummary(text)
    setShowSummaryModal(true)
  }, [conversations, elements])

  const copySummary = useCallback(() => {
    if (!summary) return
    navigator.clipboard.writeText(summary)
    showToast('创意文案已复制！去发朋友圈吧 🎉')
  }, [summary, showToast])

  const exportConversation = useCallback(() => {
    if (conversations.length === 0) {
      showToast('还没有对话，先聊聊吧！')
      return
    }
    const today = new Date().toLocaleDateString('zh-CN')
    let text = `🎨 小画家对话记录\n日期：${today}\n画作元素：${elements.join('、')}\n${'='.repeat(28)}\n\n`
    conversations.forEach((c, i) => {
      text += `问题${i + 1}：${c.q}\n回答${i + 1}：${c.a}\n\n`
    })
    text += `${'='.repeat(28)}\n💡 引导小结：多用"为什么"和"还有呢"延续对话，倾听时保持眼神接触，肯定创作过程而非结果。\n\n由「小画家对话助手」生成`
    navigator.clipboard.writeText(text)
    showToast('对话记录已复制！📋')
  }, [conversations, elements, showToast])

  const restart = useCallback(() => {
    setStep('upload')
    setImageUrl(null)
    setElements([])
    setConversations([])
    setCurrentQuestion('')
    setQuestionCount(0)
    setUsedQuestionIndexes([])
  }, [])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [conversations])

  const currentTip = TIPS[(questionCount - 1) % TIPS.length] || TIPS[0]

  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #333; color: #fff; padding: 12px 24px; border-radius: 8px; z-index: 1000; animation: fadeIn 0.3s ease; }
      `}</style>

      {toast && <div className="toast">{toast}</div>}

      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 32 }}>🎨</span>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#fff' }}>小画家对话助手</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>和孩子一起探索画里的故事</div>
          </div>
          {step !== 'upload' && (
            <button onClick={restart} style={{ marginLeft: 'auto', padding: '8px 16px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}>
              重新开始
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>🖼️</div>
            <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 600, marginBottom: 12 }}>上传孩子的画作</h2>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, lineHeight: 1.6 }}>
              拍照或选择孩子的画，AI会帮你引导一场有趣的对话
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '16px 48px',
                fontSize: 18,
                fontWeight: 600,
                background: '#fff',
                color: '#764ba2',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              📷 选择图片
            </button>
          </div>
        )}

        {/* Step 2: Analyzing */}
        {step === 'analyzing' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', animation: 'fadeIn 0.3s ease' }}>
            {imageUrl && (
              <img
                src={imageUrl}
                alt="上传的画作"
                style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 12, marginBottom: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
              />
            )}
            <div style={{ fontSize: 48, marginBottom: 16, animation: 'pulse 1.5s infinite' }}>🔍</div>
            <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>正在分析画作...</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>AI正在读懂孩子的小世界</p>
          </div>
        )}

        {/* Step 3: Chat */}
        {step === 'chat' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            {/* Image preview */}
            {imageUrl && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <img
                  src={imageUrl}
                  alt="画作"
                  style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                />
                <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {elements.map((el, i) => (
                    <span key={i} style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 12, color: '#fff' }}>
                      {el}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Chat messages */}
            <div
              ref={messagesRef}
              style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: 16,
                padding: 16,
                minHeight: 300,
                maxHeight: 400,
                overflowY: 'auto',
                marginBottom: 16,
              }}
            >
              {/* Intro message */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🤖</div>
                <div style={{ background: '#f0f4ff', padding: '10px 14px', borderRadius: '4px 16px 16px 16px', maxWidth: '80%' }}>
                  {elements.length > 0
                    ? `这幅画好有意思！我看到里面有"${elements.slice(0, 3).join('和')}"呢，好想知道更多！`
                    : '这幅画太有想象力了！让我来问你几个问题，探索你画里的小世界吧 🎨'}
                </div>
              </div>

              {/* Conversation history */}
              {conversations.map((conv, i) => (
                <div key={i}>
                  {/* AI question */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🤖</div>
                    <div>
                      <div style={{ background: '#f0f4ff', padding: '10px 14px', borderRadius: '4px 16px 16px 16px', fontWeight: 500 }}>{conv.q}</div>
                      <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>💡 请爸爸妈妈帮忙输入孩子的回答</div>
                    </div>
                  </div>
                  {/* Parent answer */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: 'flex-end' }}>
                    <div style={{ background: '#667eea', color: '#fff', padding: '10px 14px', borderRadius: '16px 4px 16px 16px', maxWidth: '80%' }}>{conv.a}</div>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>👨‍👩‍👧</div>
                  </div>
                </div>
              ))}

              {/* Current question */}
              {currentQuestion && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🤖</div>
                  <div>
                    <div style={{ background: '#f0f4ff', padding: '10px 14px', borderRadius: '4px 16px 16px 16px', fontWeight: 500 }}>{currentQuestion}</div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>💡 请爸爸妈妈帮忙输入孩子的回答</div>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') sendAnswer() }}
                placeholder="输入孩子的回答..."
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: '2px solid rgba(255,255,255,0.3)',
                  background: 'rgba(255,255,255,0.9)',
                  fontSize: 16,
                  outline: 'none',
                }}
              />
              <button
                onClick={sendAnswer}
                style={{
                  padding: '12px 20px',
                  background: '#fff',
                  color: '#667eea',
                  border: 'none',
                  borderRadius: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                发送
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={askNewQuestion} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}>
                🔄 换个问题
              </button>
              {conversations.length > 0 && (
                <>
                  <button onClick={generateSummary} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}>
                    ✨ 生成文案
                  </button>
                  <button onClick={exportConversation} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 13 }}>
                    📋 导出对话
                  </button>
                </>
              )}
            </div>

            {/* Tips panel */}
            <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 }}>
              <div style={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}>{currentTip.stage}</div>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 1.6 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span>👀</span>
                  <span>{currentTip.tip}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span>🌟</span>
                  <span>多用"还有呢？还有吗？"延续对话</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span>💜</span>
                  <span>肯定孩子的表达，不否定、不修改</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Modal */}
      {showSummaryModal && (
        <div
          onClick={() => setShowSummaryModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: '100%',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <h3 style={{ marginBottom: 16, fontSize: 18 }}>✨ 朋友圈文案</h3>
            <div style={{ background: '#f8f9fa', padding: 16, borderRadius: 8, marginBottom: 16, lineHeight: 1.8 }}>
              {summary || '请先完成一轮对话再生成总结。'}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={copySummary}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                复制文案
              </button>
              <button
                onClick={() => setShowSummaryModal(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
