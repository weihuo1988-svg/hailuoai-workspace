import { useState } from 'react';
import { BLOCKS, BLOCKS_BY_RARITY, RARITY_ORDER, RARITY_CONFIG, ITEMS, SUITS, RECIPE_MAP, MATERIAL_GROUP_NAMES, MATERIAL_GROUP_ICONS, getMaterialCount } from '../data';
import type { Rarity, MaterialGroup } from '../data';
import {
  MC_BLOCKS_BASE, MC_ITEMS_BASE, MC_LOCAL_BASE,
  getBlockTexture, getItemTexture, getSuitTexture,
} from '../mcTextures';

type CTab = 'blocks' | 'items' | 'suits';

interface Props {
  blocks: Record<string, number>;
  items: Record<string, boolean>;
  suits: Record<string, boolean>;
  onCraft: (itemId: string) => void;
  onUnlockSuit: (suitId: string) => void;
}

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

const CTAB_ICONS: Record<CTab, string> = {
  blocks: 'bricks.png',
  items:  'diamond_pickaxe.png',
  suits:  'diamond_sword.png',
};

export function CollectionPanel({ blocks, items, suits, onCraft, onUnlockSuit }: Props) {
  const [tab, setTab] = useState<CTab>('blocks');

  const tabs: { k: CTab; l: string }[] = [
    { k: 'blocks', l: '方块' },
    { k: 'items',  l: '道具' },
    { k: 'suits',  l: '套装' },
  ];

  const tb = (a: boolean): React.CSSProperties => ({
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

  // ── Tab 切换栏 ──────────────────────────────────────────────
  const tabBar = (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
      {tabs.map((t) => (
        <button key={t.k} onClick={() => setTab(t.k)} style={tb(tab === t.k)}>
          <McImg src={MC_LOCAL_BASE + CTAB_ICONS[t.k]} alt="" style={{ width: 14, height: 14 }} />
          {t.l}
        </button>
      ))}
    </div>
  );

  // ── 方块收藏（按稀有度分组）──────────────────────────────────
  if (tab === 'blocks') {
    const totalCollected = Object.values(blocks).reduce((a, b) => a + b, 0);
    const uniqueOwned = BLOCKS.filter(b => (blocks[b.id] || 0) > 0).length;
    return (
      <div>
        {tabBar}
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          <div style={sectionTitle}>
            <McImg src={MC_BLOCKS_BASE + 'bricks.png'} alt="方块" style={{ width: 16, height: 16 }} />
            方块收藏 ({uniqueOwned}/{BLOCKS.length}种 共{totalCollected}个)
          </div>
          {RARITY_ORDER.map((rarity) => {
            const pool = BLOCKS_BY_RARITY[rarity];
            const cfg = RARITY_CONFIG[rarity];
            const ownedInTier = pool.filter(b => (blocks[b.id] || 0) > 0).length;
            return (
              <div key={rarity} style={{ marginBottom: 16 }}>
                <div style={{
                  fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: cfg.color,
                  marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 8px', background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`,
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
                  {cfg.label} ({ownedInTier}/{pool.length})
                  <span style={{ fontSize: 6, color: '#666', marginLeft: 'auto' }}>{Math.round(cfg.prob * 100)}%</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
                  {pool.map((b) => {
                    const cnt = blocks[b.id] || 0;
                    const tex = getBlockTexture(b.id);
                    return (
                      <div key={b.id} style={{
                        background: 'rgba(20,20,40,0.85)',
                        border: `2px solid ${cnt > 0 ? cfg.color : '#333'}`,
                        borderRadius: 0, padding: 8, textAlign: 'center',
                        opacity: cnt > 0 ? 1 : 0.25,
                        boxShadow: cnt > 0 ? `2px 2px 0 ${cfg.glow}55, 0 0 8px ${cfg.glow}22` : '2px 2px 0 #111',
                        transition: 'all 0.2s',
                      }}>
                        <McImg src={tex} alt={b.name} style={{ width: 32, height: 32 }} />
                        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#AAA', marginTop: 3, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</div>
                        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: cnt > 0 ? '#FFD700' : '#444', marginTop: 2 }}>{'\u00d7'}{cnt}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 道具（按套装分组，带兑换按钮）──────────────────────────────
  if (tab === 'items') {
    const totalOwned = ITEMS.filter(i => items[i.id]).length;
    return (
      <div>
        {tabBar}
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          <div style={sectionTitle}>
            <McImg src={MC_ITEMS_BASE + 'diamond_pickaxe.png'} alt="道具" style={{ width: 16, height: 16 }} />
            道具收藏 ({totalOwned}/{ITEMS.length})
          </div>
          {SUITS.map((suit) => {
            const suitItems = ITEMS.filter(i => i.suitId === suit.id);
            const ownedCount = suitItems.filter(i => items[i.id]).length;
            // Find the material group for this suit's items
            const firstRecipe = RECIPE_MAP[suitItems[0]?.id];
            const materialGroup = firstRecipe?.material as MaterialGroup | undefined;
            const materialAvail = materialGroup ? getMaterialCount(blocks, materialGroup) : 0;
            const materialName = materialGroup ? MATERIAL_GROUP_NAMES[materialGroup] : '';
            const materialIcon = materialGroup ? MATERIAL_GROUP_ICONS[materialGroup] : '';

            return (
              <div key={suit.id} style={{
                ...cardBg,
                borderColor: ownedCount === suitItems.length ? suit.color : '#333',
                boxShadow: ownedCount === suitItems.length ? `2px 2px 0 ${suit.glowColor}66` : '2px 2px 0 #111',
              }}>
                {/* 套装组头部 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <McImg src={getSuitTexture(suit.id)} alt={suit.name} style={{ width: 28, height: 28 }} />
                  <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: suit.color }}>{suit.name}</div>
                  <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#888', marginLeft: 'auto' }}>
                    {ownedCount}/{suitItems.length}
                  </span>
                  {ownedCount === suitItems.length && <span style={{ fontSize: 12 }}>✅</span>}
                </div>
                {/* 材料库存提示 */}
                {materialGroup && ownedCount < suitItems.length && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10,
                    fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#888',
                    padding: '4px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid #333',
                  }}>
                    <McImg src={getBlockTexture(materialIcon)} alt="" style={{ width: 12, height: 12 }} />
                    {materialName} 可用: <span style={{ color: materialAvail > 0 ? '#4CAF50' : '#666' }}>{materialAvail}</span>
                  </div>
                )}
                {/* 道具卡片网格 */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {suitItems.map((item) => {
                    const owned = items[item.id];
                    const recipe = RECIPE_MAP[item.id];
                    const canAfford = recipe && materialGroup ? materialAvail >= recipe.cost : false;
                    return (
                      <div key={item.id} style={{
                        background: owned ? 'rgba(40,40,60,0.9)' : 'rgba(20,20,30,0.6)',
                        border: `2px solid ${owned ? suit.color : '#333'}`,
                        borderRadius: 0, padding: '8px 6px', textAlign: 'center',
                        opacity: owned ? 1 : canAfford ? 0.85 : 0.4,
                        minWidth: 66, position: 'relative',
                        transition: 'all 0.2s',
                      }}>
                        <McImg
                          src={getItemTexture(item.id)}
                          alt={item.name}
                          style={{ width: 26, height: 26 }}
                        />
                        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 5, color: '#AAA', marginTop: 2 }}>{item.name}</div>
                        {owned ? (
                          <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: suit.color, marginTop: 3 }}>✅</div>
                        ) : recipe ? (
                          <button
                            onClick={() => canAfford && onCraft(item.id)}
                            disabled={!canAfford}
                            style={{
                              marginTop: 4, padding: '3px 6px', border: 'none', borderRadius: 0,
                              fontFamily: "'Press Start 2P',monospace", fontSize: 5,
                              cursor: canAfford ? 'pointer' : 'default',
                              background: canAfford ? 'linear-gradient(180deg,#4CAF50,#2E7D32)' : '#333',
                              color: canAfford ? '#fff' : '#666',
                              boxShadow: canAfford ? '1px 1px 0 #1B5E20' : 'none',
                            }}>
                            <span style={{ color: canAfford ? '#8BC34A' : '#555' }}>{materialName}</span>
                            {'\u00d7'}{recipe.cost}
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 套装（进度 + 手动解锁按钮）──────────────────────────────
  return (
    <div>
      {tabBar}
      <div style={{ animation: 'fadeIn 0.2s ease' }}>
        <div style={sectionTitle}>
          <McImg src={MC_ITEMS_BASE + 'diamond_sword.png'} alt="套装" style={{ width: 16, height: 16 }} />
          套装收藏 ({SUITS.filter(s => suits[s.id]).length}/{SUITS.length})
        </div>
        {SUITS.map((suit) => {
          const unlocked = suits[suit.id];
          const suitItems = ITEMS.filter(i => i.suitId === suit.id);
          const ownedCount = suitItems.filter(i => items[i.id]).length;
          const allCollected = ownedCount === suitItems.length;
          const progress = Math.round((ownedCount / suitItems.length) * 100);
          const missing = suitItems.length - ownedCount;

          return (
            <div key={suit.id} style={{
              ...cardBg,
              border: `3px solid ${unlocked ? suit.color : allCollected ? '#FF9800' : '#444'}`,
              boxShadow: unlocked
                ? `4px 4px 0 ${suit.glowColor}66, 0 0 20px ${suit.glowColor}33`
                : allCollected ? '4px 4px 0 #7f3f00' : '3px 3px 0 #111',
              opacity: unlocked ? 1 : ownedCount > 0 ? 0.9 : 0.5,
            }}>
              {/* 套装头部 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <McImg src={getSuitTexture(suit.id)} alt={suit.name} style={{ width: 38, height: 38 }} />
                  <div>
                    <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#FFF' }}>{suit.name}</div>
                    <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#666', marginTop: 3 }}>
                      {ownedCount}/{suitItems.length} 件道具
                    </div>
                  </div>
                </div>
                {unlocked && (
                  <span style={{
                    background: suit.color, color: '#000',
                    fontFamily: "'Press Start 2P',monospace", fontSize: 7,
                    padding: '4px 10px', borderRadius: 0,
                    boxShadow: `2px 2px 0 ${suit.glowColor}`,
                  }}>已解锁 ✅</span>
                )}
              </div>

              {/* 道具列表 */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {suitItems.map((item) => {
                  const owned = items[item.id];
                  return (
                    <div key={item.id} style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      padding: '2px 6px',
                      background: owned ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${owned ? '#4CAF5060' : '#333'}`,
                      fontFamily: "'Press Start 2P',monospace", fontSize: 5,
                      color: owned ? '#8BC34A' : '#555',
                    }}>
                      <McImg src={getItemTexture(item.id)} alt="" style={{ width: 12, height: 12 }} />
                      {item.name}
                      {owned ? ' ✅' : ' ❌'}
                    </div>
                  );
                })}
              </div>

              {/* 进度条 */}
              {!unlocked && (
                <div style={{ background: '#111', borderRadius: 0, height: 10, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{
                    background: allCollected
                      ? 'linear-gradient(90deg, #FF9800, #F57C00)'
                      : `linear-gradient(90deg, ${suit.color}88, ${suit.glowColor})`,
                    height: '100%', width: `${progress}%`,
                    transition: 'width 0.5s ease',
                    boxShadow: allCollected ? '0 0 8px #FF9800' : `0 0 8px ${suit.glowColor}`,
                  }} />
                </div>
              )}

              {/* 解锁按钮 */}
              {!unlocked && (
                <div style={{ textAlign: 'center' }}>
                  {allCollected ? (
                    <button
                      onClick={() => onUnlockSuit(suit.id)}
                      style={{
                        background: 'linear-gradient(180deg, #FF9800, #F57C00)',
                        border: '3px solid #E65100',
                        color: '#FFF',
                        fontFamily: "'Press Start 2P',monospace", fontSize: 8,
                        padding: '10px 24px', cursor: 'pointer', borderRadius: 0,
                        boxShadow: '3px 3px 0 #BF360C, 0 0 16px rgba(255,152,0,0.4)',
                        animation: 'blink 1.5s ease infinite',
                      }}>
                      解锁套装
                    </button>
                  ) : (
                    <span style={{
                      fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#555',
                      padding: '6px 16px', display: 'inline-block',
                      background: '#222', border: '2px solid #333',
                    }}>
                      还差 {missing} 件
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
