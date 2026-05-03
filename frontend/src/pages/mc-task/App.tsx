import { useState, useEffect, useCallback } from 'react';
import { BLOCKS, SUITS, TOTAL_WEIGHT } from './data';
import type { BlockDef, SuitDef } from './data';
import type { AppState, Tab } from './types';
import { loadState, saveState, getTodayTasks, getToday, getWeek, getMonth, getSyncConfig, setSyncConfig, syncPush, syncPull, isTaskCompleted, getRecurringTasks } from './utils';
import { TaskCard, AddTaskForm } from './components/TaskCard';
import { CollectionPanel } from './components/CollectionPanel';
import { ChestAnim, SuitAnim } from './components/ChestAnimations';
import { SyncPanel } from './components/SyncPanel';
import { CompletionHistory } from './components/CompletionHistory';
import { STAT_ICON_MAP, TAB_ICON_MAP, MC_BLOCKS_BASE, MC_ITEMS_BASE, MC_LOCAL_BASE } from './mcTextures';
import './App.css';

// ─── 素材 CDN ───────────────────────────────────────────────
const ASSETS = {
  grassBg: 'https://cdn.hailuoai.com/matrix_agent/20260411/image_tool/output/195916_a9f1/workspace/imgs/mc_bg_hero.png',
  chestBg: 'https://cdn.hailuoai.com/matrix_agent/20260411/image_tool/output/195944_3dbc/workspace/imgs/mc_bg_chest.png',
  craftBg: 'https://cdn.hailuoai.com/matrix_agent/20260411/image_tool/output/200001_420e/workspace/imgs/mc_bg_collection.png',
  steve:   'https://cdn.hailuoai.com/matrix_agent/20260411/image_tool/output/200106_477d/workspace/imgs/mc_steve_portrait.png',
  badge:   'https://cdn.hailuoai.com/matrix_agent/20260411/image_tool/output/200056_397f/workspace/imgs/mc_badge_complete.png',
};

function uid() { return Math.random().toString(36).slice(2, 10); }

function drawBlock(): BlockDef {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const b of BLOCKS) { r -= b.weight; if (r <= 0) return b; }
  return BLOCKS[0];
}

// ─── Tab 配置（MC材质图标）────────────────────────────────────
const MC_TABS: { k: Tab; l: string; icon: string }[] = [
  { k: 'tasks',      l: '任务',  icon: TAB_ICON_MAP.tasks },
  { k: 'chests',     l: '宝箱',  icon: TAB_ICON_MAP.chests },
  { k: 'collection', l: '收藏',  icon: TAB_ICON_MAP.collection },
];

const BG_MAP: Record<Tab, { url: string; overlay: string }> = {
  tasks:      { url: ASSETS.grassBg,  overlay: 'rgba(10,10,30,0.72)' },
  chests:     { url: ASSETS.chestBg,  overlay: 'rgba(10,10,30,0.78)' },
  collection: { url: ASSETS.craftBg,  overlay: 'rgba(10,10,30,0.80)' },
};

// ─── MC图片工具 ───────────────────────────────────────────────
const mcStyle: React.CSSProperties = { imageRendering: 'pixelated', MozOsxFontSmoothing: 'grayscale' };
const McImg = ({ src, alt = '', style }: { src: string; alt?: string; style?: React.CSSProperties }) => (
  <img src={src} alt={alt} style={{ ...mcStyle, ...style }} />
);

export default function McTaskApp() {
  const [state, setState]         = useState<AppState>(() => loadState());
  const [tab, setTab]             = useState<Tab>('tasks');
  const [showAddForm, setShowAddForm] = useState(false);
  const [openingBlock, setOpeningBlock] = useState<BlockDef | null>(null);
  const [suitUnlock, setSuitUnlock]   = useState<SuitDef | null>(null);
  const [notif, setNotif]               = useState('');
  const [showSync, setShowSync]   = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [syncVer, setSyncVer]     = useState(() => getSyncConfig()?.version ?? 0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'ok' | 'err'>('idle');

  // localStorage 持久化 + 防抖自动推送云端
  useEffect(() => {
    saveState(state);
    const cfg = getSyncConfig();
    if (!cfg) return;
    const timer = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        const newVer = await syncPush(cfg.userId, syncVer, state);
        setSyncVer(newVer);
        setSyncConfig({ ...cfg, version: newVer });
        setSyncStatus('ok');
      } catch {
        setSyncStatus('err');
      }
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // 页面获得焦点时拉取云端最新
  useEffect(() => {
    const onFocus = async () => {
      const cfg = getSyncConfig();
      if (!cfg) return;
      try {
        setSyncStatus('syncing');
        const { data, version } = await syncPull(cfg.userId);
        if (data && version > syncVer) {
          setState(data);
          setSyncVer(version);
          setSyncConfig({ ...cfg, version });
        }
        setSyncStatus('ok');
      } catch {
        setSyncStatus('err');
      }
    };
    window.addEventListener('focus', onFocus);
    onFocus();
    return () => window.removeEventListener('focus', onFocus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 周期重置（组件挂载时 + 每分钟检测跨天）
  useEffect(() => {
    const doReset = () => {
      const today = getToday(), week = getWeek(), month = getMonth();
      setState((s) => {
        let changed = false;
        const tasks = s.tasks.map((t) => {
          if (t.frequency === 'daily' && t.lastCompletedAt !== today && t.lastCompletedAt !== 'done' && t.lastCompletedAt !== null) {
            changed = true; return { ...t, lastCompletedAt: null };
          }
          return t;
        });
        if (s.weeklyResetWeek !== week) {
          changed = true;
          tasks.forEach((t) => { if (t.frequency === 'weekly') (t as any).completedThisWeek = false; });
        }
        if (s.monthlyResetMonth !== month) {
          changed = true;
          tasks.forEach((t) => { if (t.frequency === 'monthly') (t as any).monthlyCount = 0; });
        }
        if (!changed) return s;
        return { ...s, tasks, lastResetDate: today, weeklyResetWeek: week, monthlyResetMonth: month };
      });
    };
    doReset();
    const timer = setInterval(doReset, 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(''), 3000);
    return () => clearTimeout(t);
  }, [notif]);

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
      const tasks = s.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const u: any = { lastCompletedAt: today };
        if (t.frequency === 'weekly') u.completedThisWeek = true;
        if (t.frequency === 'monthly') u.monthlyCount = (t.monthlyCount || 0) + 1;
        if (t.frequency === 'once') u.lastCompletedAt = 'done';
        const history = [...(t.completionHistory || []), new Date().toISOString()];
        return { ...t, ...u, completionHistory: history };
      });
      return { ...s, tasks, chests: [...s.chests, ...newChests] };
    });
    setNotif(`🎉 获得 ${task.chests} 个宝箱！`);
  }, [state.tasks]);

  const deleteTask = useCallback((id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
  }, []);

  const addTask = useCallback((t: Omit<AppState['tasks'][0], 'id' | 'createdAt' | 'lastCompletedAt' | 'completedThisWeek' | 'monthlyCount'>) => {
    setState((s) => ({
      ...s,
      tasks: [...s.tasks, { ...t, id: uid(), createdAt: new Date().toISOString(), lastCompletedAt: null, completedThisWeek: false, monthlyCount: 0 }],
    }));
    setShowAddForm(false);
  }, []);

  const openChest = useCallback((chestId: string) => {
    const block = drawBlock();
    setOpeningBlock(block);
    setState((s) => {
      const nb = { ...s.blocks, [block.id]: (s.blocks[block.id] || 0) + 1 };
      const ns = { ...s.suits }; const nt = { ...s.tools }; const na = { ...s.armors };
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

  const todayTasks = getTodayTasks(state.tasks);
  const allTasks = getRecurringTasks(state.tasks);
  const today = getToday();
  const completedToday = state.tasks.filter(t => {
    if (t.frequency === 'daily') return t.lastCompletedAt === today;
    if (t.frequency === 'weekly') return t.completedThisWeek;
    if (t.frequency === 'monthly') return (t.monthlyCount || 0) >= t.monthlyLimit;
    return t.lastCompletedAt === 'done';
  }).length;
  const bg = BG_MAP[tab];

  return (
    <div style={{ minHeight: '100dvh', position: 'relative', overflowX: 'hidden', background: '#0a0a1e' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        body{margin:0;background:#0a0a1e}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes notifIn{from{transform:translateY(-14px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
        button:active{transform:translateY(2px)!important}
        input:focus,select:focus{border-color:#FF9800!important;outline:none}
      `}</style>

      {/* 背景层 */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${bg.url}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          transition: 'background-image 0.5s ease',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: bg.overlay, transition: 'background 0.5s ease' }} />
      </div>

      {/* 浮动粒子（MC材质图标） */}
      {tab === 'tasks' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }}>
          {[
            MC_BLOCKS_BASE + 'grass_block_top.png',
            MC_BLOCKS_BASE + 'oak_leaves.png',
            MC_BLOCKS_BASE + 'oak_log.png',
            MC_BLOCKS_BASE + 'diamond_block.png',
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

      {/* 顶部导航 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(10,10,30,0.96)',
        borderBottom: '4px solid #4CAF50',
        boxShadow: '0 4px 24px rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        padding: '12px 16px 10px',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={ASSETS.steve} alt="" style={{ width: 42, height: 42, borderRadius: 4, border: '2px solid #4CAF50', imageRendering: 'pixelated', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#4CAF50', lineHeight: 1.6 }}>⛏️ 我的世界任务</div>
            <div style={{ fontSize: 13, color: '#9e9', marginTop: 2 }}>儿童任务激励工具</div>
          </div>
          {/* 同步按钮 + 4项统计（MC材质图标） */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => setShowSync(v => !v)} title="云同步"
              style={{
                background: getSyncConfig() ? 'rgba(76,175,80,0.3)' : 'rgba(255,152,0,0.2)',
                border: `2px solid ${getSyncConfig() ? '#4CAF50' : '#FF9800'}`,
                borderRadius: 0, padding: '4px 6px', cursor: 'pointer',
                fontSize: 14, lineHeight: 1, position: 'relative',
              }}>
              {syncStatus === 'syncing' ? '...' : '\u2601\uFE0F'}
              {getSyncConfig() && (
                <span style={{
                  position: 'absolute', top: -3, right: -3,
                  width: 8, height: 8, borderRadius: '50%',
                  background: syncStatus === 'err' ? '#f44' : '#4CAF50',
                }} />
              )}
            </button>
            {([
              { icon: MC_ITEMS_BASE + STAT_ICON_MAP.tasks,    v: state.tasks.length,                                   color: '#4CAF50' },
              { icon: MC_ITEMS_BASE + STAT_ICON_MAP.complete, v: completedToday,                                       color: '#8BC34A' },
              { icon: MC_BLOCKS_BASE + STAT_ICON_MAP.chests,  v: state.chests.length,                                 color: '#FF9800' },
              { icon: MC_BLOCKS_BASE + STAT_ICON_MAP.blocks, v: Object.values(state.blocks).reduce((a, b) => a + b, 0), color: '#9C27B0' },
            ] as { icon: string; v: number; color: string }[]).map(({ icon, v, color }, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <McImg src={icon} alt="" style={{ width: 18, height: 18, display: 'block', margin: '0 auto' }} />
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 通知 */}
      {notif && (
        <div style={{
          position: 'fixed', top: 68, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
          background: 'linear-gradient(135deg,#1b5e20,#2e7d32)',
          border: '3px solid #4CAF50', borderRadius: 0,
          padding: '10px 24px',
          fontFamily: "'Press Start 2P',monospace", fontSize: 10,
          color: '#FFF', boxShadow: '0 4px 16px rgba(76,175,80,0.5), 4px 4px 0 #1b5e20',
          animation: 'notifIn 0.3s ease', whiteSpace: 'nowrap',
        }}>
          {notif}
        </div>
      )}

      {/* 内容 */}
      <div style={{ position: 'relative', zIndex: 2, padding: '16px 14px', maxWidth: 640, margin: '0 auto', paddingBottom: 100 }}>

        {/* 同步面板 */}
        {showSync && (
          <div style={{ marginBottom: 16, animation: 'fadeIn 0.2s ease' }}>
            <SyncPanel
              state={state}
              syncVersion={syncVer}
              onSynced={(data, version) => { setState(data); setSyncVer(version); }}
              onClose={() => setShowSync(false)}
            />
          </div>
        )}

        {/* 任务页 */}
        {tab === 'tasks' && !showHistory && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {/* 标题栏 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <McImg src={MC_ITEMS_BASE + 'diamond_sword.png'} alt="任务" style={{ width: 26, height: 26 }} />
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#4CAF50' }}>
                今日任务 <span style={{ color: '#888', fontSize: 8 }}>(待完成{todayTasks.length}/{allTasks.length})</span>
              </div>
              <button
                onClick={() => setShowHistory(true)}
                style={{
                  marginLeft: 'auto',
                  background: 'rgba(21,101,192,0.3)', border: '2px solid #1565C0', color: '#90CAF9',
                  fontFamily: "'Press Start 2P',monospace",
                  fontSize: 7, padding: '6px 10px', cursor: 'pointer', borderRadius: 0,
                  boxShadow: '2px 2px 0 #0D47A1',
                }}>
                记录
              </button>
              <button
                onClick={() => setShowAddForm(v => !v)}
                style={{
                  background: showAddForm ? '#444' : 'linear-gradient(180deg,#4CAF50,#2E7D32)',
                  border: '3px solid #1B5E20', color: '#fff',
                  fontFamily: "'Press Start 2P',monospace",
                  fontSize: 7, padding: '8px 12px', cursor: 'pointer', borderRadius: 0,
                  boxShadow: '3px 3px 0 #1B5E20',
                }}>
                {showAddForm ? '取消' : '➕ 创建任务'}
              </button>
            </div>

            {/* 创建表单 */}
            {showAddForm && (
              <div style={{ marginBottom: 14 }}>
                <AddTaskForm onAdd={addTask} />
              </div>
            )}

            {/* 任务列表：未完成在前，已完成灰色显示 */}
            {allTasks.length === 0 && !showAddForm ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', background: 'rgba(30,30,50,0.7)', border: '3px dashed #4CAF50', borderRadius: 0, backdropFilter: 'blur(4px)' }}>
                <img src={ASSETS.badge} alt="" style={{ width: 72, height: 72, marginBottom: 16, imageRendering: 'pixelated' }} />
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 11, color: '#4CAF50', lineHeight: 2 }}>还没有任务</div>
                <div style={{ fontSize: 15, color: '#AAA', marginTop: 8 }}>点击上方创建任务吧！</div>
              </div>
            ) : (
              allTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  completed={isTaskCompleted(task)}
                  onComplete={completeTask}
                  onDelete={deleteTask}
                  showPasswordOnComplete={true}
                />
              ))
            )}
            {/* 全部完成提示 */}
            {allTasks.length > 0 && todayTasks.length === 0 && !showAddForm && (
              <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(30,50,30,0.5)', border: '2px solid #4CAF50', marginTop: 10 }}>
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#4CAF50', lineHeight: 2 }}>太棒了！🎉 今日任务全部完成！</div>
              </div>
            )}
          </div>
        )}

        {/* 完成记录页 */}
        {tab === 'tasks' && showHistory && (
          <CompletionHistory tasks={state.tasks} onClose={() => setShowHistory(false)} />
        )}

        {/* 宝箱页 */}
        {tab === 'chests' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <McImg src={MC_LOCAL_BASE + 'chest_closed.png'} alt="宝箱" style={{ width: 26, height: 26 }} />
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#FF9800' }}>
                我的宝箱 <span style={{ color: '#888', fontSize: 8 }}>({state.chests.length}个)</span>
              </div>
            </div>
            {state.chests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '56px 20px', background: 'rgba(30,30,50,0.7)', border: '3px dashed #FF9800', borderRadius: 0, backdropFilter: 'blur(4px)' }}>
                <McImg src={MC_LOCAL_BASE + 'chest_closed.png'} alt="宝箱" style={{ width: 72, height: 72, marginBottom: 16, filter: 'drop-shadow(0 0 16px rgba(255,152,0,0.4))' }} />
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#FF9800', lineHeight: 1.8 }}>还没有宝箱哦～</div>
                <div style={{ fontSize: 15, color: '#AAA', marginTop: 8 }}>完成任务来获得吧！</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 12 }}>
                {state.chests.map((chest) => (
                  <div key={chest.id}
                    onClick={() => openChest(chest.id)}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    style={{
                      background: 'rgba(30,30,50,0.85)', border: '3px solid #FF9800', borderRadius: 0,
                      padding: '18px 12px', textAlign: 'center', cursor: 'pointer',
                      boxShadow: '4px 4px 0 #7f3f00', transition: 'transform 0.15s',
                      backdropFilter: 'blur(4px)',
                    }}>
                    <div style={{ animation: 'float 3s ease-in-out infinite' }}>
                      <McImg src={MC_LOCAL_BASE + 'chest_closed.png'} alt="点击开启" style={{ width: 56, height: 56, filter: 'drop-shadow(0 0 10px rgba(255,152,0,0.6))' }} />
                    </div>
                    <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#FF9800', marginTop: 8 }}>点击开启</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 收藏页 */}
        {tab === 'collection' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <CollectionPanel blocks={state.blocks} tools={state.tools} suits={state.suits} armors={state.armors} />
          </div>
        )}
      </div>

      {/* 底部 Tab（MC材质图标） */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,20,0.96)', borderTop: '4px solid #333',
        backdropFilter: 'blur(12px)',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: 640, margin: '0 auto' }}>
          {MC_TABS.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{
                background: tab === t.k ? 'linear-gradient(180deg,#4CAF50,#2E7D32)' : 'transparent',
                border: 'none', color: tab === t.k ? '#FFF' : '#666',
                fontFamily: "'Press Start 2P',monospace", fontSize: 7,
                padding: '8px 4px', cursor: 'pointer', borderRadius: 0,
                minWidth: 60, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4,
                boxShadow: tab === t.k ? '0 -3px 0 #1B5E20' : 'none',
                transition: 'all 0.15s',
              }}>
              <McImg src={MC_LOCAL_BASE + t.icon} alt={t.l} style={{ width: 22, height: 22 }} />
              <span>{t.l}{t.k === 'chests' && state.chests.length > 0 ? ` ${state.chests.length}` : ''}</span>
            </button>
          ))}
        </div>
      </div>

      {openingBlock && <ChestAnim block={openingBlock} done={() => setOpeningBlock(null)} />}
      {suitUnlock  && <SuitAnim suit={suitUnlock} done={() => setSuitUnlock(null)} />}
    </div>
  );
}
