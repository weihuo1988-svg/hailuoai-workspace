import type { AppState } from '../types';
import { AddTaskForm } from './TaskCard';

interface Props {
  state: AppState;
  onAddTask: (t: Omit<AppState['tasks'][0], 'id' | 'createdAt' | 'lastCompletedAt' | 'completedThisWeek' | 'monthlyCount'>) => void;
}

export function TaskStats({ state }: { state: AppState }) {
  const today = new Date().toISOString().slice(0, 10);
  const completed = state.tasks.filter(t => {
    if (t.frequency === 'daily') return t.lastCompletedAt === today;
    if (t.frequency === 'weekly') return t.completedThisWeek;
    if (t.frequency === 'monthly') return (t.monthlyCount || 0) >= t.monthlyLimit;
    return t.lastCompletedAt === 'done';
  }).length;

  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
      {[
        { e: '📋', v: state.tasks.length,         l: '总任务',   c: '#4CAF50' },
        { e: '✅', v: completed,                   l: '已完成',   c: '#8BC34A' },
        { e: '📦', v: state.chests.length,         l: '待开箱',   c: '#FF9800' },
        { e: '🧱', v: Object.values(state.blocks).reduce((a, b) => a + b, 0), l: '方块', c: '#9C27B0' },
      ].map(({ e, v, l, c }) => (
        <div key={l} style={{
          flex: '1 1 120px',
          background: 'rgba(30,30,50,0.8)',
          border: `2px solid ${c}55`,
          borderRadius: 0,
          padding: '12px 8px',
          textAlign: 'center',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>{e}</div>
          <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 14, color: '#FFF', lineHeight: 1.4 }}>{v}</div>
          <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#888', marginTop: 4 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

export function ParentPanel({ state, onAddTask }: Props) {
  return (
    <div>
      {/* 任务统计 */}
      <TaskStats state={state} />

      {/* 添加任务 */}
      <AddTaskForm onAdd={onAddTask} />

      {/* 重置提示 */}
      <div style={{
        background: 'rgba(30,30,50,0.7)',
        border: '2px solid #333',
        borderRadius: 0,
        padding: '14px',
        marginTop: 16,
        textAlign: 'center',
        backdropFilter: 'blur(4px)',
      }}>
        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#666', lineHeight: 1.8 }}>
          📌 数据存储在本地浏览器<br/>
          清除浏览器缓存会重置所有数据
        </div>
      </div>
    </div>
  );
}
