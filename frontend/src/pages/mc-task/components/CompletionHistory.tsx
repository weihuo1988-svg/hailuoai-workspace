import type { Task } from '../types';

const freqMap: Record<string, string> = { once: '单次', daily: '每天', weekly: '每周', monthly: '每月' };
const freqColor: Record<string, string> = { once: '#9E9E9E', daily: '#4CAF50', weekly: '#2196F3', monthly: '#9C27B0' };

interface HistoryEntry {
  taskName: string;
  frequency: string;
  chests: number;
  completedAt: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekDay = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()];
  return `${month}月${day}日 周${weekDay}`;
}

export function CompletionHistory({ tasks, onClose }: { tasks: Task[]; onClose: () => void }) {
  // Flatten all completion records into a single list
  const entries: HistoryEntry[] = [];
  for (const task of tasks) {
    if (!task.completionHistory || task.completionHistory.length === 0) continue;
    for (const ts of task.completionHistory) {
      entries.push({ taskName: task.name, frequency: task.frequency, chests: task.chests, completedAt: ts });
    }
  }
  entries.sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  // Group by date
  const grouped = new Map<string, HistoryEntry[]>();
  for (const e of entries) {
    const dateKey = e.completedAt.slice(0, 10);
    if (!grouped.has(dateKey)) grouped.set(dateKey, []);
    grouped.get(dateKey)!.push(e);
  }

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button
          onClick={onClose}
          style={{
            background: '#555', border: '2px solid #333', color: '#fff',
            fontFamily: "'Press Start 2P',monospace", fontSize: 7,
            padding: '6px 10px', cursor: 'pointer', borderRadius: 0,
            boxShadow: '2px 2px 0 #222',
          }}>
          &lt; 返回
        </button>
        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#64B5F6' }}>
          完成记录
        </div>
        <div style={{ fontSize: 11, color: '#888', marginLeft: 'auto' }}>
          共 {entries.length} 条
        </div>
      </div>

      {entries.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '48px 20px',
          background: 'rgba(30,30,50,0.7)', border: '3px dashed #1565C0',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#64B5F6', lineHeight: 2 }}>
            还没有完成记录
          </div>
          <div style={{ fontSize: 14, color: '#888', marginTop: 8 }}>
            完成任务后这里会显示每次的时间
          </div>
        </div>
      ) : (
        [...grouped.entries()].map(([dateKey, items]) => (
          <div key={dateKey} style={{ marginBottom: 12 }}>
            {/* Date header */}
            <div style={{
              fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: '#90CAF9',
              padding: '6px 10px', background: 'rgba(21,101,192,0.2)',
              border: '2px solid rgba(21,101,192,0.3)', marginBottom: 6,
            }}>
              {formatDate(items[0].completedAt)}
            </div>
            {/* Entries for this date */}
            {items.map((entry, i) => {
              const time = new Date(entry.completedAt);
              const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', background: 'rgba(30,30,50,0.7)',
                  borderBottom: '1px solid rgba(100,181,246,0.1)',
                }}>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 13, color: '#64B5F6',
                    minWidth: 44,
                  }}>
                    {timeStr}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: '#E0E0E0' }}>
                    {entry.taskName}
                  </div>
                  <span style={{
                    background: '#FF9800', color: '#fff', fontSize: 7,
                    fontFamily: "'Press Start 2P',monospace",
                    padding: '2px 6px', borderRadius: 0, flexShrink: 0,
                  }}>
                    +{entry.chests}箱
                  </span>
                  <span style={{
                    background: freqColor[entry.frequency] || '#555',
                    color: '#fff', fontSize: 7,
                    fontFamily: "'Press Start 2P',monospace",
                    padding: '2px 6px', borderRadius: 0, flexShrink: 0,
                  }}>
                    {freqMap[entry.frequency] || entry.frequency}
                  </span>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
