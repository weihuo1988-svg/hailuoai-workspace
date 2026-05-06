import type { AppState } from './types';
import { STORAGE_KEY, DEFAULT_PIN } from './data';

export function uid(): string { return Math.random().toString(36).slice(2, 10); }
export function getToday(): string { return new Date().toISOString().slice(0, 10); }
export function getWeek(): string { const d = new Date(); return `${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 1) / 7)}`; }
export function getMonth(): string { return new Date().toISOString().slice(0, 7); }

const EXAMPLE_TASKS: AppState['tasks'] = [
  { id: 'example_1', name: '整理书包', description: '把明天要用的书本放回书包', frequency: 'daily', monthlyLimit: 0, monthlyCount: 0, chests: 1, password: '505050', lastCompletedAt: null, completedThisWeek: false, createdAt: new Date().toISOString() },
  { id: 'example_2', name: '按时睡觉', description: '晚上9点前上床睡觉', frequency: 'daily', monthlyLimit: 0, monthlyCount: 0, chests: 1, password: '505050', lastCompletedAt: null, completedThisWeek: false, createdAt: new Date().toISOString() },
  { id: 'example_3', name: '帮忙洗碗', description: '吃完饭后帮爸爸妈妈收拾碗筷', frequency: 'daily', monthlyLimit: 0, monthlyCount: 0, chests: 2, password: '505050', lastCompletedAt: null, completedThisWeek: false, createdAt: new Date().toISOString() },
];

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      // 数据迁移：tools + armors → items
      if (s.tools || s.armors) {
        s.items = { ...s.tools, ...s.armors, ...(s.items || {}) };
        delete s.tools;
        delete s.armors;
      }
      if (!s.items) s.items = {};
      return s;
    }
  } catch {}
  return { tasks: EXAMPLE_TASKS, chests: [], blocks: {}, items: {}, suits: {}, parentPin: DEFAULT_PIN, lastResetDate: getToday(), weeklyResetWeek: getWeek(), monthlyResetMonth: getMonth() };
}

export function saveState(s: AppState): void { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

export function getTodayTasks(tasks: AppState['tasks']) {
  const today = getToday();
  return tasks.filter((t) => {
    if (t.frequency === 'daily') return t.lastCompletedAt !== today;
    if (t.frequency === 'weekly') return !t.completedThisWeek;
    if (t.frequency === 'monthly') return (t.monthlyCount || 0) < t.monthlyLimit;
    return t.lastCompletedAt !== 'done';
  });
}

export function isTaskCompleted(task: AppState['tasks'][0]): boolean {
  const today = getToday();
  if (task.frequency === 'once') return task.lastCompletedAt === 'done';
  if (task.frequency === 'daily') return task.lastCompletedAt === today;
  if (task.frequency === 'weekly') return !!task.completedThisWeek;
  if (task.frequency === 'monthly') return (task.monthlyCount || 0) >= task.monthlyLimit;
  return false;
}

// 获取所有重复任务（排除已删除的单次任务），未完成的排前面
export function getRecurringTasks(tasks: AppState['tasks']) {
  return tasks
    .filter(t => t.frequency !== 'once' || t.lastCompletedAt !== 'done')
    .sort((a, b) => {
      const ac = isTaskCompleted(a) ? 1 : 0;
      const bc = isTaskCompleted(b) ? 1 : 0;
      return ac - bc;
    });
}

// ─── 云同步（基于 /api/sync 接口 + 共享 userId）──────────────
const SYNC_CFG_KEY = 'mc-task-sync-cfg';
const API_BASE = window.location.origin;

export interface SyncConfig {
  userId: string;      // 共享 ID，多设备相同即可同步
  version: number;     // 服务端版本号
}

export function getSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(SYNC_CFG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function setSyncConfig(cfg: SyncConfig | null): void {
  if (cfg) localStorage.setItem(SYNC_CFG_KEY, JSON.stringify(cfg));
  else localStorage.removeItem(SYNC_CFG_KEY);
}

// 生成 6 位易读同步码
export function generateSyncId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// 拉取云端数据
export async function syncPull(userId: string): Promise<{ data: AppState | null; version: number }> {
  const res = await fetch(`${API_BASE}/api/sync?userId=${encodeURIComponent(userId)}`);
  if (res.status === 404) return { data: null, version: 0 };
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return { data: json.data ?? null, version: json.version ?? 0 };
}

// 推送本地数据到云端
export async function syncPush(userId: string, version: number, data: AppState): Promise<number> {
  const res = await fetch(`${API_BASE}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, version, data }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const json = await res.json();
  return json.version ?? version + 1;
}

export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
*{box-sizing:border-box}body{margin:0;background:#1A1A2E}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#1A1A1A}::-webkit-scrollbar-thumb{background:#4CAF50;border-radius:3px}
@keyframes blockBounce{0%{transform:scale(0) translateY(80px);opacity:0}60%{transform:scale(1.3) translateY(-10px);opacity:1}80%{transform:scale(0.9) translateY(5px)}100%{transform:scale(1) translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes fadeSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes notifIn{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes floatUp{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-50%) translateY(-80px) scale(0.3);opacity:0}}
input:focus{border-color:#FF9800!important}button:active{transform:translateY(2px)}
`;
