import { useState } from 'react'
import { Link } from 'react-router-dom'

const PROJECTS = [
  {
    emoji: '/mc/writable_book.png',
    name: '我的世界任务工具',
    desc: '用 Minecraft 风格的任务激励机制，帮助孩子建立好习惯。完成任务获得宝箱，收集方块解锁套装。',
    tech: ['React', 'TypeScript', 'Vite'],
    url: '/mc-task',
    status: '在线运行',
    color: '#4CAF50',
  },
  {
    emoji: '🎨',
    name: '画画问答',
    desc: 'AI 绘画聊天工具，支持多种风格和场景的智能创作对话。',
    tech: ['React', 'AI API'],
    url: '/art-chat',
    status: '在线运行',
    color: '#E91E63',
  },
  {
    emoji: '😴',
    name: '睡眠助手',
    desc: '助眠工具，提供放松音频和白噪音，帮你更好地入睡。',
    tech: ['React', 'Web Audio'],
    url: '/sleep-aid',
    status: '在线运行',
    color: '#673AB7',
  },
]

export default function Portfolio() {
  const [activeProject, setActiveProject] = useState<number | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a1e', color: '#fff', fontFamily: "'Inter', sans-serif" }}>

      {/* Hero */}
      <section style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        padding: '80px 24px 60px',
        background: 'radial-gradient(ellipse at top, #1a3a1a 0%, #0a0a1e 70%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(#4CAF50 1px, transparent 1px), linear-gradient(90deg, #4CAF50 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🍄</div>
          <h1 style={{
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 700, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #4CAF50, #81C784)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 16,
          }}>
            七栖的作品集
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#aaa', maxWidth: 480, lineHeight: 1.7, marginBottom: 40 }}>
            互联网大厂产品经理 · 副业探索中 · AI工具爱好者<br />
            用代码把想法变成真实的产品
          </p>
          <a href="#projects" style={{
            display: 'inline-block',
            background: '#4CAF50', color: '#fff', padding: '12px 28px',
            borderRadius: 8, fontWeight: 600, textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(76,175,80,0.4)',
          }}>看作品 ↓</a>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ color: '#4CAF50', fontWeight: 600, letterSpacing: '0.1em', fontSize: 13, marginBottom: 8 }}>WHAT I BUILT</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>我的作品</h2>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          {PROJECTS.map((p, i) => (
            <div
              key={i}
              onClick={() => setActiveProject(activeProject === i ? null : i)}
              style={{
                background: activeProject === i ? `${p.color}18` : 'rgba(255,255,255,0.04)',
                border: `2px solid ${activeProject === i ? p.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 16, padding: 28,
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                transform: activeProject === i ? 'translateY(-4px)' : 'none',
                boxShadow: activeProject === i ? `0 8px 32px ${p.color}30` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                <img src={p.emoji} alt={p.name} style={{ width: 52, height: 52, imageRendering: 'pixelated' }} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{p.name}</h3>
                    <span style={{
                      background: p.color, color: '#fff',
                      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                    }}>{p.status}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#aaa', lineHeight: 1.7, marginBottom: 16 }}>{p.desc}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                    {p.tech.map(t => (
                      <span key={t} style={{
                        background: 'rgba(255,255,255,0.06)', color: '#888',
                        fontSize: 10, padding: '3px 8px', borderRadius: 4,
                      }}>{t}</span>
                    ))}
                  </div>
                  {p.url && (
                    <Link
                      to={p.url}
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: 'inline-block',
                        background: p.color, color: '#fff',
                        padding: '10px 24px', borderRadius: 8,
                        fontWeight: 600, fontSize: 14,
                        textDecoration: 'none',
                      }}
                    >
                      打开看看 →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" style={{
        background: 'rgba(76,175,80,0.05)',
        borderTop: '1px solid rgba(76,175,80,0.15)',
        borderBottom: '1px solid rgba(76,175,80,0.15)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ color: '#4CAF50', fontWeight: 600, letterSpacing: '0.1em', fontSize: 13, marginBottom: 8 }}>ABOUT ME</div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>关于我</h2>
          <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: '1rem', marginBottom: 32 }}>
            白羊座 INFP，互联网大厂行业产品专家，也是一个在探索副业和 AI 工具的产品人。
          </p>
          <p style={{ color: '#bbb', lineHeight: 1.8, fontSize: '1rem' }}>
            喜欢把生活中的小想法变成可以用的工具，相信好的产品是给人用的，不是给投资人看的。
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 40, flexWrap: 'wrap' }}>
            {[
              { label: '职业', value: '产品经理' },
              { label: '星座', value: '白羊座' },
              { label: '坐标', value: '杭州' },
              { label: '状态', value: '探索中' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '12px 20px', textAlign: 'center',
              }}>
                <div style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>{label}</div>
                <div style={{ color: '#fff', fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '40px 24px', color: '#555', fontSize: 13 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🍄</div>
        Made with love by 七栖 · {new Date().getFullYear()}
      </footer>
    </div>
  )
}
