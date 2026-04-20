import { useState } from 'react';
import { BLOCKS, TOOLS, ARMORS, SUITS } from '../data';
import type { AppState } from '../types';
import {
  BLOCK_TEXTURE_MAP, ITEM_TEXTURE_MAP, SUIT_ICON_MAP,
  MC_BLOCKS_BASE, MC_ITEMS_BASE, MC_LOCAL_BASE, mcImgStyle38, mcImgStyle32,
} from '../mcTextures';

type CTab = 'blocks' | 'tools' | 'suits' | 'armors';

// ─── MC图片组件 ───────────────────────────────────────────────
function McImg({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{ imageRendering: 'pixelated', ...style }}
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
    />
  );
}

// 底部Tab子标签图标（16x16）
const CTAB_ICONS: Record<CTab, { emoji: string; item: string }> = {
  blocks:  { emoji: '🧱', item: 'bricks.png' },
  tools:   { emoji: '⛏️', item: 'diamond_pickaxe.png' },
  suits:   { emoji: '⚔️', item: 'diamond_sword.png' },
  armors:  { emoji: '🛡️', item: 'diamond_chestplate.png' },
};

export function CollectionPanel({ blocks, tools, suits, armors }: Pick<AppState, 'blocks' | 'tools' | 'suits' | 'armors'>) {
  const [tab, setTab] = useState<CTab>('blocks');

  const tabs: { k: CTab; l: string; i: string }[] = [
    { k: 'blocks',  l: '方块',  i: '🧱' },
    { k: 'tools',   l: '工具',  i: '⛏️' },
    { k: 'suits',   l: '套装',  i: '⚔️' },
    { k: 'armors',  l: '护甲',  i: '🛡️' },
  ];
  const tb = (a: boolean) => ({
    background: a ? 'linear-gradient(180deg, #4CAF50 0%, #2E7D32 100%)' : 'rgba(30,30,50,0.8)',
    border: `2px solid ${a ? '#1B5E20' : '#444'}`,
    color: '#fff',
    fontFamily: "'Press Start 2P',monospace",
    fontSize: 7,
    padding: '6px 10px',
    cursor: 'pointer',
    borderRadius: 0,
    boxShadow: a ? '2px 2px 0 #1B5E20' : '2px 2px 0 #222',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', gap: 4,
  });

  const cardBg: React.CSSProperties = {
    background: 'rgba(20, 20, 40, 0.75)',
    border: '2px solid #333',
    borderRadius: 0,
    backdropFilter: 'blur(6px)',
    padding: '14px',
    marginBottom: 14,
  };

  const sectionTitle: React.CSSProperties = {
    fontFamily: "'Press Start 2P',monospace",
    fontSize: 9,
    color: '#4CAF50',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  };

  // ── 方块收藏 ────────────────────────────────────────────────
  if (tab === 'blocks') {
    return (
      <div>
        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} style={tb(tab === t.k)}>
              <McImg src={MC_LOCAL_BASE + CTAB_ICONS[t.k].item} alt="" style={{ width: 14, height: 14 }} />
              {t.l}
            </button>
          ))}
        </div>
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          <div style={sectionTitle}>
            <McImg src={MC_BLOCKS_BASE + 'bricks.png'} alt="方块" style={{ width: 16, height: 16 }} />
            方块收藏 ({Object.values(blocks).reduce((a, b) => a + b, 0)} / {BLOCKS.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10 }}>
            {BLOCKS.map((b) => {
              const cnt = blocks[b.id] || 0;
              const tex = MC_BLOCKS_BASE + (BLOCK_TEXTURE_MAP[b.id] ?? 'diamond_block.png');
              return (
                <div key={b.id} style={{
                  background: 'rgba(20,20,40,0.85)',
                  border: `3px solid ${cnt > 0 ? b.color : '#333'}`,
                  borderRadius: 0,
                  padding: 12,
                  textAlign: 'center',
                  opacity: cnt > 0 ? 1 : 0.3,
                  boxShadow: cnt > 0 ? `3px 3px 0 ${b.glowColor}55, 0 0 12px ${b.glowColor}33` : '3px 3px 0 #111',
                  transition: 'all 0.2s',
                }}>
                  <McImg src={tex} alt={b.name} style={mcImgStyle38} />
                  <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#AAA', marginTop: 4, lineHeight: 1.5 }}>{b.name}</div>
                  <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: cnt > 0 ? '#FFD700' : '#444', marginTop: 4 }}>×{cnt}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── 工具收藏 ────────────────────────────────────────────────
  if (tab === 'tools') {
    return (
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} style={tb(tab === t.k)}>
              <McImg src={MC_LOCAL_BASE + CTAB_ICONS[t.k].item} alt="" style={{ width: 14, height: 14 }} />
              {t.l}
            </button>
          ))}
        </div>
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {[
            { sid: 'wood',         suit: SUITS.find(s => s.id === 'wood')! },
            { sid: 'stone',        suit: SUITS.find(s => s.id === 'stone')! },
            { sid: 'iron',         suit: SUITS.find(s => s.id === 'iron')! },
            { sid: 'diamond_tool', suit: SUITS.find(s => s.id === 'diamond_tool')! },
          ].map(({ sid, suit }) => {
            const ts = TOOLS.filter(t => t.suitId === sid);
            const owned = ts.filter(t => tools[t.id]).length;
            const suitTex = MC_BLOCKS_BASE + (SUIT_ICON_MAP[suit.id] ?? 'oak_log.png');
            return (
              <div key={sid} style={{ ...cardBg, borderColor: owned === ts.length ? suit.color : '#333' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <McImg src={suitTex} alt={suit.name} style={mcImgStyle32} />
                  <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: suit.color }}>{suit.name}</div>
                  <span style={{ marginLeft: 'auto', fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#888' }}>{owned}/{ts.length}</span>
                  {owned === ts.length && <span style={{ fontSize: 14 }}>✅</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {ts.map((t) => (
                    <div key={t.id} style={{
                      background: tools[t.id] ? 'rgba(40,40,60,0.9)' : 'rgba(20,20,30,0.6)',
                      border: `2px solid ${tools[t.id] ? suit.color : '#333'}`,
                      borderRadius: 0,
                      padding: '8px 10px',
                      textAlign: 'center',
                      opacity: tools[t.id] ? 1 : 0.3,
                      minWidth: 62,
                    }}>
                      <McImg
                        src={MC_ITEMS_BASE + (ITEM_TEXTURE_MAP[t.id] ?? 'diamond_sword.png')}
                        alt={t.name}
                        style={{ width: 26, height: 26 }}
                      />
                      <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#AAA', marginTop: 2 }}>{t.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 套装 ───────────────────────────────────────────────────
  if (tab === 'suits') {
    return (
      <div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} style={tb(tab === t.k)}>
              <McImg src={MC_LOCAL_BASE + CTAB_ICONS[t.k].item} alt="" style={{ width: 14, height: 14 }} />
              {t.l}
            </button>
          ))}
        </div>
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {SUITS.map((suit) => {
            const owned = suits[suit.id];
            const cnt = blocks[suit.blockId] || 0;
            const progress = Math.min(100, Math.round((cnt / suit.blockRequired) * 100));
            const suitTex = MC_BLOCKS_BASE + (SUIT_ICON_MAP[suit.id] ?? 'diamond_block.png');
            const requiredBlock = BLOCKS.find(b => b.id === suit.blockId);
            const reqBlockTex = requiredBlock ? MC_BLOCKS_BASE + (BLOCK_TEXTURE_MAP[requiredBlock.id] ?? 'diamond_block.png') : '';
            return (
              <div key={suit.id} style={{
                ...cardBg,
                border: `3px solid ${owned ? suit.color : '#444'}`,
                boxShadow: owned ? `4px 4px 0 ${suit.glowColor}66, 0 0 20px ${suit.glowColor}33` : '3px 3px 0 #111',
                opacity: owned ? 1 : cnt > 0 ? 0.85 : 0.45,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: owned ? 0 : 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <McImg src={suitTex} alt={suit.name} style={mcImgStyle38} />
                    <div>
                      <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#FFF' }}>{suit.name}</div>
                      {!owned && <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#666', marginTop: 2 }}>需 {suit.blockRequired} 个</div>}
                    </div>
                  </div>
                  {owned
                    ? <span style={{ background: suit.color, color: '#000', fontFamily: "'Press Start 2P',monospace", fontSize: 7, padding: '4px 10px', borderRadius: 0, boxShadow: `2px 2px 0 ${suit.glowColor}` }}>已解锁 ✅</span>
                    : <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#666' }}>{cnt} / {suit.blockRequired}</span>
                  }
                </div>
                {!owned && (
                  <>
                    <div style={{ background: '#111', borderRadius: 0, height: 10, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{
                        background: `linear-gradient(90deg, ${suit.color}88, ${suit.glowColor})`,
                        height: '100%', width: `${progress}%`,
                        transition: 'width 0.5s ease',
                        boxShadow: `0 0 8px ${suit.glowColor}`,
                      }} />
                    </div>
                    <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#555', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                      {reqBlockTex && <McImg src={reqBlockTex} alt={requiredBlock?.name ?? ''} style={{ width: 10, height: 10 }} />}
                      {requiredBlock?.name} ×{cnt}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 护甲收藏 ────────────────────────────────────────────────
  // (默认返回 tools tab 内容)
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)} style={tb(tab === t.k)}>
            <McImg src={MC_LOCAL_BASE + CTAB_ICONS[t.k].item} alt="" style={{ width: 14, height: 14 }} />
            {t.l}
          </button>
        ))}
      </div>
      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        {[
          { sid: 'leather',        suit: SUITS.find(s => s.id === 'leather')! },
          { sid: 'iron_armor',     suit: SUITS.find(s => s.id === 'iron_armor')! },
          { sid: 'diamond_armor',  suit: SUITS.find(s => s.id === 'diamond_armor')! },
        ].map(({ sid, suit }) => {
          const as = ARMORS.filter(a => a.suitId === sid);
          const owned = as.filter(a => armors[a.id]).length;
          const suitTex = MC_ITEMS_BASE + (ITEM_TEXTURE_MAP[as[0]?.id] ?? 'diamond_chestplate.png');
          return (
            <div key={sid} style={{ ...cardBg, borderColor: owned === as.length ? suit.color : '#333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <McImg src={suitTex} alt={suit.name} style={mcImgStyle32} />
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: suit.color }}>{suit.name}</div>
                <span style={{ marginLeft: 'auto', fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#888' }}>{owned}/{as.length}</span>
                {owned === as.length && <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#FFD700' }}>套装全收集！</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {as.map((a) => (
                  <div key={a.id} style={{
                    background: armors[a.id] ? 'rgba(40,40,60,0.9)' : 'rgba(20,20,30,0.6)',
                    border: `2px solid ${armors[a.id] ? suit.color : '#333'}`,
                    borderRadius: 0,
                    padding: '8px 10px',
                    textAlign: 'center',
                    opacity: armors[a.id] ? 1 : 0.3,
                    minWidth: 62,
                  }}>
                    <McImg
                      src={MC_ITEMS_BASE + (ITEM_TEXTURE_MAP[a.id] ?? 'diamond_chestplate.png')}
                      alt={a.name}
                      style={{ width: 26, height: 26 }}
                    />
                    <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#AAA', marginTop: 2 }}>{a.name}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
