import type { AppState } from './types';
import { STORAGE_KEY, DEFAULT_PIN, DEFAULT_TASKS } from './data';

export function uid(): string { return Math.random().toString(36).slice(2, 10); }
export function getToday(): string { return new Date().toISOString().slice(0, 10); }
export function getWeek(): string { const d = new Date(); return `${d.getFullYear()}-W${Math.ceil((d.getDate() - d.getDay() + 1) / 7)}`; }
export function getMonth(): string { return new Date().toISOString().slice(0, 7); }

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      const isNewUser = !saved.isNewUser && saved.tasks.length === 0;
      if (isNewUser) {
        return {
          ...saved,
          tasks: DEFAULT_TASKS.map(t => ({ ...t, monthlyCount: 0, lastCompletedAt: null, completedThisWeek: false, createdAt: new Date().toISOString() })),
          isNewUser: true,
          guideDeviceCode: '',
        };
      }
      return {
        ...saved,
        isNewUser: saved.isNewUser || false,
        guideDeviceCode: saved.guideDeviceCode || '',
      };
    }
  } catch {}
  const now = new Date().toISOString();
  return {
    tasks: DEFAULT_TASKS.map(t => ({ ...t, monthlyCount: 0, lastCompletedAt: null, completedThisWeek: false, createdAt: now })),
    chests: [],
    blocks: {},
    tools: {},
    suits: {},
    armors: {},
    parentPin: DEFAULT_PIN,
    lastResetDate: getToday(),
    weeklyResetWeek: getWeek(),
    monthlyResetMonth: getMonth(),
    isNewUser: true,
    guideDeviceCode: '',
  };
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
