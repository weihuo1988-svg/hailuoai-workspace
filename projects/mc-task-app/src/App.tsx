/**
 * App.tsx — 我的世界任务激励工具主组件
 * 路径：/workspace/projects/mc-task-app/src/App.tsx
 *
 * 改造说明（Issue #2）：
 *   - 状态来源改为 useSync()（SyncProvider 持有，App 消费）
 *   - 所有 state 变更通过 setAppState → SyncContext 防抖上报服务器
 *   - 无网络时本地 localStorage 正常工作（降级优先）
 */

import { useState, useEffect, useCallback } from 'react';
import { BLOCKS, SUITS, TOTAL_WEIGHT } from './data';
import type { BlockDef, SuitDef } from './data';
import type { AppState, Tab } from './types';
import { getTodayTasks, getToday, getWeek, getMonth } from './utils';
import { TaskCard, AddTaskForm } from './components/TaskCard';
import { CollectionPanel } from './components/CollectionPanel';
import { ChestAnim, SuitAnim } from './components/ChestAnimations';
import { useSync } from './contexts/SyncContext';
import {
  STAT_ICON_MAP, TAB_ICON_MAP,
  MC_BLOCKS_BASE, MC_ITEMS_BASE, MC_LOCAL_BASE,
  BLOCK_TEXTURE_MAP,
} from './mcTextures';

// ─── Asset CDN (local MC textures) ─────────────────────────
const ASSETS = {
  grassBg: '/mc-textures/blocks/grass_block_top.png',
  chestBg: '/mc-textures/blocks/obsidian.png',
  craftBg: '/mc-textures/blocks/crafting_table_top.png',
  steve:   '/mc/steve_portrait.png',
  badge:   '/mc-textures/items/paper.png',
};

// ─── Helpers ────────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 10); }

function drawBlock(): BlockDef {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const b of BLOCKS) { r -= b.weight; if (r <= 0) return b; }
  return BLOCKS[0];
}

const TASK_BLOCK_TEXTURES = Object.values(BLOCK_TEXTURE_MAP);
function randomBlockTexture() {
  return TASK_BLOCK_TEXTURES[Math.floor(Math.random() * TASK_BLOCK_TEXTURES.length)];
}

// ─── MC pixel-img ───────────────────────────────────────────
const mcStyle: React.CSSProperties = { imageRendering: 'pixelated', MozOsxFontSmoothing: 'grayscale' };
const McImg = ({ src, alt = '', style }: { src: string; alt?: string; style?: React.CSSProperties }) => (
  <img src={src} alt={alt} style={{ ...mcStyle, ...style }} />
);

// ─── Tab config ─────────────────────────────────────────────
const MC_TABS: { k: Tab; l: string; icon: string }[] = [
  { k: 'tasks',       l: '任务',     icon: TAB_ICON_MAP.tasks },
  { k: 'chests',      l: '宝箱',     icon: TAB_ICON_MAP.chests },
  { k: 'collection',  l: '收藏',    icon: TAB_ICON_MAP.collection },
];

const BG_MAP: Record<Tab, { url: string; overlay: string }> = {
  tasks:      { url: ASSETS.grassBg, overlay: 'rgba(10,10,30,0.82)' },
  chests:     { url: ASSETS.chestBg, overlay: 'rgba(10,10,30,0.80)' },
  collection: { url: ASSETS.craftBg, overlay: 'rgba(10,10,30,0.88)' },
};

// ─── Chest floating particles ───────────────────────────────
const CHEST_PARTICLES = [
  MC_ITEMS_BASE + 'diamond_sword.png', MC_ITEMS_BASE + 'diamond_pickaxe.png',
  MC_ITEMS_BASE + 'iron_sword.png', MC_ITEMS_BASE + 'bow.png',
  MC_BLOCKS_BASE + 'gold_block.png', MC_BLOCKS_BASE + 'emerald_block.png',
  MC_ITEMS_BASE + 'enchanted_golden_apple.png', MC_ITEMS_BASE + 'nether_star.png',
  MC_BLOCKS_BASE + 'diamond_block.png', MC_ITEMS_BASE + 'iron_pickaxe.png',
  MC_BLOCKS_BASE + 'netherite_block.png',
];

// ─── App Component ─────────────────────────────────────────
export default function App() {
  // 状态来源：SyncContext（服务器同步后的最新状态）
  const { appState: state, setAppState: setState, pending, syncError } = useSync();

  const [tab, setTab]           = useState<Tab>('tasks');
  const [showAddForm, setShowAddForm] = useState(false);
  const [openingBlock, setOpeningBlock] = useState<BlockDef | null>(null);
  const [suitUnlock, setSuitUnlock]   = useState<SuitDef | null>(null);
  const [notif, setNotif]               = useState('');

  // ── 定期重置逻辑（每日/每周/每月任务）────────────────
  useEffect(() => {
    const today = getToday(), week = getWeek(), month = getMonth();
    let changed = false;
    const tasks = state.tasks.map((t) => {
      if (t.frequency === 'daily' && t.lastCompletedAt !== today && t.lastCompletedAt !== 'done') {
        changed = true; return { ...t, lastCompletedAt: null };
      }
      return t;
    });
    if (state.weeklyResetWeek !== week) {
      changed = true;
      tasks.forEach((t) => { if (t.frequency === 'weekly') (t as any).completedThisWeek = false; });
    }
    if (state.monthlyResetMonth !== month) {
      changed = true;
      tasks.forEach((t) => { if (t.frequency === 'monthly') (t as any).monthlyCount = 0; });
    }
    if (changed) {
      setState((s) => ({ ...s, tasks, lastResetDate: today, weeklyResetWeek: week, monthlyResetMonth: month }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toast 通知自动消失 ─────────────────────────────────
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(''), 3200);
    return () => clearTimeout(t);
  }, [notif]);

  // ── 完成任务 ───────────────────────────────────────────
  const completeTask = useCallback((taskId: string) => {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;
    const today = getToday();
    if (task.frequency === 'once' && task.lastCompletedAt === 'done') return;
    if (task.frequency === 'daily' && task.lastCompletedAt === today) return;
    if (task.frequency === 'weekly' && task.completedThisWeek) return;
    if (task.frequency === 'monthly' && (task.monthlyCount || 0) >= task.monthlyLimit) return;
    const newChests = Array.from({ length: task.chests }, () => ({ id: uid(), createdAt: new Date().toISOString() }));
    setState((s) => {
      let tasks = s.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const u: any = { lastCompletedAt: today };
        if (t.frequency === 'weekly')   u.completedThisWeek = true;
        if (t.frequency === 'monthly')  u.monthlyCount = (t.monthlyCount || 0) + 1;
        if (t.frequency === 'once')     u.lastCompletedAt = 'done';
        return { ...t, ...u };
      });
      if (task.frequency === 'once') tasks = tasks.filter((t) => t.id !== taskId);
      return { ...s, tasks, chests: [...s.chests, ...newChests] };
    });
    setNotif(`🎉 获得 ${task.chests} 个宝箱！`);
  }, [state.tasks]);

  // ── 删除任务 ───────────────────────────────────────────
  const deleteTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  // ── 添加任务 ───────────────────────────────────────────
  const addTask = useCallback((t: Omit<AppState['tasks'][0], 'id' | 'createdAt' | 'lastCompletedAt' | 'completedThisWeek' | 'monthlyCount'>) => {
    setState((s) => ({
      ...s,
      tasks: [...s.tasks, {
        ...t,
        id: uid(),
        createdAt: new Date().toISOString(),
        lastCompletedAt: null,
        completedThisWeek: false,
        monthlyCount: 0,
        blockTexture: randomBlockTexture(),
      }],
    }));
    setShowAddForm(false);
  }, []);

  // ── 开宝箱 ─────────────────────────────────────────────
  const openChest = useCallback((chestId: string) => {
    const block = drawBlock();
    setOpeningBlock(block);
    setState((s) => {
      const nb = { ...s.blocks, [block.id]: (s.blocks[block.id] || 0) + 1 };
      const ns = { ...s.suits }, nt = { ...s.tools }, na = { ...s.armors };
      let suitUnlocked: SuitDef | null = null;
      SUITS.forEach((suit) => {
        if (nb[suit.blockId] >= suit.blockRequired && !ns[suit.id]) {
          ns[suit.id] = true;
          const toolMap: Record<string, string[]> = {
            wood: ['wood_sword','wood_shield','wood_axe','wood_pickaxe','wood_hoe','wood_shovel'],
            stone: ['stone_sword','stone_axe','stone_pickaxe','stone_hoe','stone_shovel'],
            iron: ['iron_sword','iron_axe','iron_pickaxe','iron_hoe','iron_shovel'],
            diamond_tool: ['diamond_sword','diamond_axe','diamond_pickaxe','diamond_hoe','diamond_shovel'],
            netherite_suit: ['iron_sword','iron_axe','iron_pickaxe','iron_hoe','iron_shovel'],
            end_suit: ['diamond_sword','diamond_axe','diamond_pickaxe','diamond_hoe','diamond_shovel'],
          };
          const armorMap: Record<string, string[]> = {
            leather: ['leather_helmet','leather_chest','leather_pants','leather_boots'],
            iron_armor: ['iron_helmet','iron_chest','iron_pants','iron_boots'],
            diamond_armor: ['diamond_helmet','diamond_chest','diamond_pants','diamond_boots'],
            netherite_suit: ['iron_helmet','iron_chest','iron_pants','iron_boots'],
            end_suit: ['diamond_helmet','diamond_chest','diamond_pants','diamond_boots'],
          };
          (toolMap[suit.id] || []).forEach(id => { nt[id] = true; });
          (armorMap[suit.id] || []).forEach(id => { na[id] = true; });
          suitUnlocked = suit;
        }
      });
      if (suitUnlocked) setTimeout(() => setSuitUnlock(suitUnlocked), 200);
      return { ...s, chests: s.chests.filter(c => c.id !== chestId), blocks: nb, suits: ns, tools: nt, armors: na };
    });
  }, []);

  // ── 派生数据 ───────────────────────────────────────────
  const todayTasks    = getTodayTasks(state.tasks);
  const today         = getToday();
  const completedToday = state.tasks.filter(t => {
    if (t.frequency === 'daily')   return t.lastCompletedAt === today;
    if (t.frequency === 'weekly') return t.completedThisWeek;
    if (t.frequency === 'monthly')return (t.monthlyCount || 0) >= t.monthlyLimit;
    return t.lastCompletedAt === 'done';
  }).length;
  const totalBlocks = Object.values(state.blocks).reduce((a, b) => a + b, 0);
  const bg = BG_MAP[tab];

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', overflowX: 'hidden', background: '#0a0a1e' }}>

      {/* Background layer */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${bg.url}')`,
          backgroundSize: '32px', backgroundRepeat: 'repeat',
          transition: 'background-image 0.5s ease',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: bg.overlay, transition: 'background 0.5s ease' }} />
      </div>

      {/* Floating particles */}
      {tab === 'tasks' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
          {[
            MC_BLOCKS_BASE + 'grass_block_top.png', MC_BLOCKS_BASE + 'oak_leaves.png',
            MC_BLOCKS_BASE + 'oak_log.png', MC_BLOCKS_BASE + 'diamond_block.png',
            MC_ITEMS_BASE + 'diamond_sword.png',
          ].map((src, i) => (
            <div key={i} style={{
              position: 'absolute', opacity: 0.12,
              left: `${15 + i * 18}%`, top: `${20 + (i % 3) * 25}%`,
              animation: `float ${2.5 + i * 0.4}s ease-in-out ${i * 0.3}s infinite`,
            }}>
              <McImg src={src} alt="" style={{ width: 20, height: 20 }} />
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#1A1A2E', borderBottom: '4px solid #4CAF50',
        boxShadow: '0 4px 24px rgba(0,0,0,0.8)',
        padding: '12px 16px 10px',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={ASSETS.steve} alt="" style={{
            width: 42, height: 42, borderRadius: 0,
            border: '3px solid #4CAF50', imageRendering: 'pixelated', flexShrink: 0,
            boxShadow: '0 0 8px #4CAF5044',
          }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#4CAF50', lineHeight: 1.6 }}>
              ⛏️ 我的世界任务
            </div>
            <div style={{ fontSize: 12, color: '#6a8', marginTop: 2 }}>儿童任务激励工具</div>
          </div>
          {/* Sync status indicator */}
          {pending && (
            <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 0, background: '#FFD700', animation: 'float 1s ease-in-out infinite' }} />
              同步中
            </div>
          )}
          {syncError && (
            <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#E53935' }}>同步异常</div>
          )}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {([
              { icon: MC_ITEMS_BASE + STAT_ICON_MAP.tasks,   v: state.tasks.length,      color: '#9CCC65' },
              { icon: MC_ITEMS_BASE + STAT_ICON_MAP.complete,v: completedToday,           color: '#FFD700' },
              { icon: MC_BLOCKS_BASE + STAT_ICON_MAP.chests, v: state.chests.length,     color: '#FFB74D' },
              { icon: MC_BLOCKS_BASE + STAT_ICON_MAP.blocks,  v: totalBlocks,              color: '#CE93D8' },
            ] as { icon: string; v: number; color: string }[]).map(({ icon, v, color }, idx) => (
              <div key={idx} style={{
                background: '#1A1A2E', border: '3px solid #3a3a5a', borderRadius: 0,
                boxShadow: 'inset 0 0 0 2px #0f0f1e, 2px 2px 0 #000',
                padding: '4px 3px', minWidth: 36, textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              }}>
                <McImg src={icon} alt="" style={{ width: 16, height: 16 }} />
                <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color, lineHeight: 1 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {notif && (
        <div style={{
          position: 'fixed', top: 68, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          background: 'linear-gradient(135deg,#1b3a1b 0%,#2d5a2d 50%,#1b3a1b 100%)',
          border: '4px solid #4CAF50', borderRadius: 0,
          padding: '12px 20px',
          fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#FFF',
          boxShadow: '4px 4px 0 #1B5E20, 0 0 20px #4CAF5055',
          animation: 'notifIn 0.3s ease', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <McImg src={MC_BLOCKS_BASE + 'diamond_block.png'} alt="" style={{ width: 28, height: 28 }} />
          {notif}
        </div>
      )}

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 2, padding: '16px 14px', maxWidth: 640, margin: '0 auto', paddingBottom: 100 }}>

        {/* Tasks tab */}
        {tab === 'tasks' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <McImg src={MC_ITEMS_BASE + 'diamond_sword.png'} alt="任务" style={{ width: 26, height: 26 }} />
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#4CAF50' }}>
                今日任务 <span style={{ color: '#555', fontSize: 7 }}>({todayTasks.length}个)</span>
              </div>
              <button onClick={() => setShowAddForm(v => !v)}
                style={{
                  marginLeft: 'auto',
                  background: showAddForm ? 'linear-gradient(180deg,#555,#333)' : 'linear-gradient(180deg,#4CAF50,#2E7D32)',
                  border: '3px solid #1B5E20', color: '#fff',
                  fontFamily: "'Press Start 2P',monospace", fontSize: 7, padding: '8px 12px', cursor: 'pointer', borderRadius: 0,
                  boxShadow: '3px 3px 0 #1B5E20',
                }}>
                {showAddForm ? '取消' : '➕ 创建'}
              </button>
            </div>
            {showAddForm && <div style={{ marginBottom: 14 }}><AddTaskForm onAdd={addTask} /></div>}
            {todayTasks.length === 0 && !showAddForm ? (
              <div style={{
                textAlign: 'center', padding: '48px 20px',
                background: 'rgba(30,30,50,0.7)', border: '3px dashed #4CAF50', borderRadius: 0,
                backdropFilter: 'blur(4px)', boxShadow: '4px 4px 0 #1B5E20',
              }}>
                <img src={ASSETS.badge} alt="" style={{ width: 72, height: 72, marginBottom: 16, imageRendering: 'pixelated' }} />
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#4CAF50', lineHeight: 2 }}>太棒了！🎉</div>
                <div style={{ fontSize: 15, color: '#AAA', marginTop: 8 }}>所有任务已完成，继续保持！</div>
              </div>
            ) : (
              todayTasks.map((task) => (
                <TaskCard key={task.id} task={task} onComplete={completeTask} onDelete={deleteTask} showPasswordOnComplete={true} />
              ))
            )}
          </div>
        )}

        {/* Chests tab */}
        {tab === 'chests' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
              {CHEST_PARTICLES.map((src, i) => (
                <div key={i} style={{
                  position: 'absolute', opacity: 0.10,
                  left: `${5 + i * 8}%`, top: `${10 + (i % 5) * 18}%`,
                  animation: `float ${2.8 + (i % 4) * 0.5}s ease-in-out ${i * 0.25}s infinite`,
                }}>
                  <McImg src={src} alt="" style={{ width: 18 + (i % 4) * 4, height: 18 + (i % 4) * 4 }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <McImg src={MC_LOCAL_BASE + 'chest_closed.png'} alt="宝箱" style={{ width: 26, height: 26 }} />
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#FF9800' }}>
                我的宝箱 <span style={{ color: '#555', fontSize: 7 }}>({state.chests.length}个)</span>
              </div>
            </div>
            {state.chests.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '56px 20px',
                background: 'rgba(30,30,50,0.7)', border: '3px dashed #FF9800', borderRadius: 0,
                backdropFilter: 'blur(4px)', boxShadow: '4px 4px 0 #7f3f00',
              }}>
                <McImg src={MC_LOCAL_BASE + 'chest_closed.png'} alt="" style={{ width: 72, height: 72, marginBottom: 16, filter: 'drop-shadow(0 0 16px rgba(255,152,0,0.4))' }} />
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#FF9800', lineHeight: 1.8 }}>还没有宝箱哦～</div>
                <div style={{ fontSize: 15, color: '#AAA', marginTop: 8 }}>完成任务来获得吧！</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 8 }}>
                {state.chests.map((chest) => (
                  <div key={chest.id} onClick={() => openChest(chest.id)} style={{ cursor: 'pointer' }}>
                    <div style={{
                      background: 'rgba(30,30,50,0.85)', border: '4px solid #FF9800', borderRadius: 0, padding: '16px 10px',
                      textAlign: 'center', boxShadow: '4px 4px 0 #7f3f00',
                      transition: 'transform 0.15s, box-shadow 0.15s',
                    }}>
                      <McImg src={MC_LOCAL_BASE + 'chest_closed.png'} alt="点击开启" style={{ width: 52, height: 52, filter: 'drop-shadow(0 0 10px rgba(255,152,0,0.6))' }} />
                      <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 6, color: '#FF9800', marginTop: 6 }}>点击开启</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collection tab */}
        {tab === 'collection' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <CollectionPanel blocks={state.blocks} tools={state.tools} suits={state.suits} armors={state.armors} />
          </div>
        )}
      </div>

      {/* Bottom tab bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: '#1A1A2E', borderTop: '4px solid #333',
        boxShadow: '0 -4px 16px rgba(0,0,0,0.6)',
        padding: `8px 0 max(8px, env(safe-area-inset-bottom))`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: 640, margin: '0 auto' }}>
          {MC_TABS.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{
                background: tab === t.k ? 'linear-gradient(180deg,#4CAF50,#2E7D32)' : 'transparent',
                border: 'none', color: tab === t.k ? '#FFF' : '#555',
                fontFamily: "'Press Start 2P',monospace", fontSize: 7,
                padding: '8px 4px', cursor: 'pointer', borderRadius: 0,
                minWidth: 64, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                boxShadow: tab === t.k ? '0 -3px 0 #1B5E20' : 'none',
              }}>
              <div style={{
                background: tab === t.k ? 'rgba(0,0,0,0.2)' : 'transparent',
                border: `2px solid ${tab === t.k ? '#1B5E20' : '#333'}`, borderRadius: 0, padding: 3,
              }}>
                <McImg src={MC_LOCAL_BASE + t.icon} alt={t.l} style={{ width: 22, height: 22 }} />
              </div>
              <span>{t.l}{t.k === 'chests' && state.chests.length > 0 ? ` ${state.chests.length}` : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {openingBlock && <ChestAnim block={openingBlock} done={() => setOpeningBlock(null)} />}
      {suitUnlock   && <SuitAnim suit={suitUnlock} done={() => setSuitUnlock(null)} />}
    </div>
  );
}
