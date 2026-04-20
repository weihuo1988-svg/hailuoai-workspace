import { useState, useEffect } from 'react';
import type { BlockDef, SuitDef } from '../data';
import { BLOCK_TEXTURE_MAP, SUIT_ICON_MAP, MC_BLOCKS_BASE, MC_LOCAL_BASE } from '../mcTextures';

// ─── MC图片组件 ───────────────────────────────────────────────
function McImg({ src, alt, style }: { src: string; alt?: string; style?: React.CSSProperties }) {
  return (
    <img
      src={src}
      alt={alt ?? ''}
      style={{ imageRendering: 'pixelated', ...style }}
    />
  );
}

// 粒子星星（MC风格金色星星，从生成的star_0.png）
const PARTICLE_COLORS = [
  { color: '#FFD700', size: 14 }, { color: '#FFB300', size: 16 },
  { color: '#FFF176', size: 18 }, { color: '#FFE082', size: 14 },
  { color: '#FFD54F', size: 20 }, { color: '#FFCA28', size: 16 },
  { color: '#FFC107', size: 18 }, { color: '#FFEB3B', size: 15 },
];

export function ChestAnim({ block, done }: { block: BlockDef; done: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setP(1), 150),
      setTimeout(() => setP(2), 400),
      setTimeout(() => setP(3), 700),
      setTimeout(done, 3000),
    ];
    return () => t.forEach(clearTimeout);
  }, [done]);

  const rarityLabel =
    block.id === 'end'      ? '『 无尽奇迹 』' :
    block.id === 'bedrock'  ? '『 传说品质 』' :
    block.id === 'netherite'? '『 珍稀品质 』' :
    block.id === 'obsidian' ? '『 稀有品质 』' :
    block.weight <= 80     ? '『 不常见 』' : '『 普通 』';

  const blockTex = MC_BLOCKS_BASE + (BLOCK_TEXTURE_MAP[block.id] ?? 'diamond_block.png');
  const chestTex = p >= 1 ? MC_LOCAL_BASE + 'chest_open.png' : MC_LOCAL_BASE + 'chest_closed.png';

  return (
    <div onClick={done} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer', userSelect: 'none' }}>
      <style>{`
        @keyframes blockBounce {
          0%   { transform: translateY(60px) scale(0.2); opacity: 0; }
          60%  { transform: translateY(-15px) scale(1.15); opacity: 1; }
          80%  { transform: translateY(5px) scale(0.95); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes floatUp {
          0%   { transform: translateY(0) translateX(-50%) scale(1); opacity: 1; }
          100% { transform: translateY(-80px) translateX(calc(-50% + var(--dx, 0px))) scale(0.4); opacity: 0; }
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .block-pop { animation: blockBounce 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .blink { animation: blink 1s ease infinite; }
      `}</style>

      {/* 宝箱 */}
      <div style={{
        transition: 'transform 0.25s ease, filter 0.3s',
        transform: p >= 1 ? 'perspective(400px) rotateX(-30deg) translateY(-20px) scale(1.1)' : 'none',
        filter: p >= 1 ? `drop-shadow(0 0 30px ${block.glowColor})` : 'none',
      }}>
        <McImg src={chestTex} alt="宝箱" style={{ width: 90, height: 90 }} />
      </div>

      {/* 方块弹出 */}
      {p >= 2 && (
        <div className="block-pop" style={{
          marginTop: 8,
          filter: `drop-shadow(0 0 24px ${block.glowColor})`,
        }}>
          <McImg src={blockTex} alt={block.name} style={{ width: 96, height: 96 }} />
        </div>
      )}

      {/* 名称 */}
      {p >= 3 && (
        <div style={{
          fontFamily: "'Press Start 2P',monospace", fontSize: 12, color: block.color,
          marginTop: 18, textShadow: `0 0 14px ${block.glowColor}`,
          animation: 'fadeSlideUp 0.4s ease', textAlign: 'center',
          padding: '0 20px', lineHeight: 2,
        }}>
          {block.name}
        </div>
      )}

      {/* 稀有度 */}
      {p >= 3 && (
        <div style={{
          fontFamily: "'Press Start 2P',monospace", fontSize: 8,
          color: block.glowColor, marginTop: 8, opacity: 0.8,
        }}>
          {rarityLabel}
        </div>
      )}

      {/* 粒子（MC星星风格） */}
      {p >= 2 && PARTICLE_COLORS.map((pt, i) => (
        <div key={i} style={{
          position: 'absolute',
          fontSize: pt.size,
          top: '55%',
          animation: `floatUp 0.7s ease-out ${i * 40}ms forwards`,
          left: `${50 + (i - 3.5) * 3.5}%`,
          pointerEvents: 'none',
          // MC星星粒子：4-point star using text
        }}>
          <McImg
            src={`${MC_LOCAL_BASE}star_0.png`}
            alt="*"
            style={{ width: pt.size, height: pt.size }}
          />
        </div>
      ))}

      {p < 3 && (
        <p className="blink" style={{
          fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#666',
          marginTop: 40, position: 'absolute', bottom: 40,
        }}>
          点击任意处继续
        </p>
      )}
    </div>
  );
}

export function SuitAnim({ suit, done }: { suit: SuitDef; done: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = [
      setTimeout(() => setP(1), 100),
      setTimeout(() => setP(2), 500),
      setTimeout(() => setP(3), 900),
      setTimeout(done, 3000),
    ];
    return () => t.forEach(clearTimeout);
  }, [done]);

  const suitTex = MC_BLOCKS_BASE + (SUIT_ICON_MAP[suit.id] ?? 'diamond_block.png');

  return (
    <div onClick={done} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999, cursor: 'pointer', userSelect: 'none' }}>
      <style>{`
        @keyframes blockBounce {
          0%   { transform: translateY(60px) scale(0.2); opacity: 0; }
          60%  { transform: translateY(-15px) scale(1.15); opacity: 1; }
          80%  { transform: translateY(5px) scale(0.95); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .suit-bounce { animation: blockBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      `}</style>

      {p >= 1 && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <McImg src={`${MC_LOCAL_BASE}star_0.png`} alt="✨" style={{ width: 60, height: 60 }} />
        </div>
      )}
      {p >= 2 && (
        <div className="suit-bounce" style={{ marginTop: 16, filter: `drop-shadow(0 0 30px ${suit.glowColor})` }}>
          <McImg src={suitTex} alt={suit.name} style={{ width: 90, height: 90 }} />
        </div>
      )}
      {p >= 2 && (
        <div style={{
          fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: suit.color,
          marginTop: 20, textShadow: `0 0 16px ${suit.glowColor}`,
          textAlign: 'center', padding: '0 20px', lineHeight: 2,
        }}>
          <div>🎉 套装解锁！</div>
          <div style={{ fontSize: 14, marginTop: 10 }}>{suit.name}</div>
        </div>
      )}
      {p >= 3 && (
        <div style={{
          fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: '#888',
          marginTop: 24, animation: 'fadeIn 0.3s ease 0.4s both',
        }}>
          点击继续
        </div>
      )}
    </div>
  );
}
