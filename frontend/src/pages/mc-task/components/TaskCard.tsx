import { useState, useRef, useEffect } from 'react';
import type { Task } from '../types';

const freqMap: Record<string, string> = { once: '单次', daily: '每天', weekly: '每周', monthly: '每月' };

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  showPasswordOnComplete?: boolean;
  completed?: boolean;
}

export function TaskCard({ task, onComplete, onDelete, showPasswordOnComplete, completed }: TaskCardProps) {
  const [open, setOpen] = useState(false);
  const [pw, setPw]     = useState('');
  const [err, setErr]   = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const history = task.completionHistory || [];

  useEffect(() => { if (open) ref.current?.focus(); }, [open]);

  const handleClick = () => {
    if (!showPasswordOnComplete) { onComplete(task.id); return; }
    setOpen(true); setPw(''); setErr(false);
  };

  const submit = () => {
    if (pw === task.password) { setOpen(false); onComplete(task.id); }
    else { setErr(true); setPw(''); }
  };

  return (
    <>
      <div style={{
        background: completed ? 'rgba(30,30,50,0.5)' : 'rgba(30,30,50,0.88)',
        border: `3px solid ${completed ? '#555' : '#5C9E3E'}`,
        borderRadius: 0, padding: 14, marginBottom: 10, position: 'relative',
        boxShadow: completed ? '4px 4px 0 #333' : '4px 4px 0 #1B5E20',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
        opacity: completed ? 0.7 : 1,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: completed ? '#888' : '#FFF', marginBottom: 6, lineHeight: 1.6 }}>{task.name}</div>
            {task.description && <div style={{ fontSize: 12, color: completed ? '#666' : '#AAA', marginBottom: 8 }}>{task.description}</div>}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ background: completed ? '#555' : '#4CAF50', color: '#fff', fontSize: 7, fontFamily: "'Press Start 2P',monospace", padding: '3px 8px', borderRadius: 0 }}>{freqMap[task.frequency]}{task.frequency === 'monthly' ? task.monthlyLimit + '次' : ''}</span>
              <span style={{ background: completed ? '#555' : '#FF9800', color: '#fff', fontSize: 7, fontFamily: "'Press Start 2P',monospace", padding: '3px 8px', borderRadius: 0 }}>🎁 {task.chests}箱</span>
              {completed && (
                <span style={{ background: '#2E7D32', color: '#8f8', fontSize: 7, fontFamily: "'Press Start 2P',monospace", padding: '3px 8px', borderRadius: 0 }}>已完成</span>
              )}
              {history.length > 0 && (
                <span
                  onClick={() => setShowHistory(v => !v)}
                  style={{ background: showHistory ? '#1565C0' : '#1E88E5', color: '#fff', fontSize: 7, fontFamily: "'Press Start 2P',monospace", padding: '3px 8px', borderRadius: 0, cursor: 'pointer' }}>
                  {showHistory ? '收起' : `${history.length}次记录`}
                </span>
              )}
            </div>
            {showHistory && history.length > 0 && (
              <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(0,0,0,0.3)', border: '2px solid #1565C0', maxHeight: 160, overflowY: 'auto' }}>
                <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 7, color: '#64B5F6', marginBottom: 6 }}>完成记录</div>
                {[...history].reverse().map((ts, i) => {
                  const d = new Date(ts);
                  const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                  return (
                    <div key={i} style={{ fontSize: 11, color: '#90CAF9', padding: '2px 0', borderBottom: i < history.length - 1 ? '1px solid rgba(100,181,246,0.15)' : 'none' }}>
                      {str}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {onDelete && !completed && (
              <button onClick={() => onDelete(task.id)} style={{ background: '#C62828', border: '2px solid #7f0000', color: '#fff', fontFamily: "'Press Start 2P',monospace", fontSize: 7, padding: '6px 10px', cursor: 'pointer', borderRadius: 0, boxShadow: '2px 2px 0 #7f0000' }}>删除</button>
            )}
            {completed ? (
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: '#4CAF50', padding: '8px 12px' }}>&#x2714;</div>
            ) : (
              <button onClick={handleClick} style={{ background: 'linear-gradient(180deg,#4CAF50,#2E7D32)', border: '3px solid #1B5E20', color: '#fff', fontFamily: "'Press Start 2P',monospace", fontSize: 7, padding: '8px 12px', cursor: 'pointer', borderRadius: 0, boxShadow: '3px 3px 0 #1B5E20' }}>完成了！</button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 8888, backdropFilter: 'blur(6px)',
        }} onClick={() => setOpen(false)}>
          <div style={{ background: '#1a1a2e', border: '3px solid #FF9800', borderRadius: 0, padding: '28px 24px', boxShadow: '6px 6px 0 #7f3f00', minWidth: 280 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#FF9800', textAlign: 'center', marginBottom: 16, lineHeight: 1.6 }}>🔑 完成确认</div>
            <div style={{ fontSize: 12, color: '#AAA', marginBottom: 16, textAlign: 'center', lineHeight: 1.6 }}>请爸妈输入密码确认完成任务</div>
            <input
              ref={ref} type="password" value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(false); }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="••••" maxLength={10}
              style={{
                width: 160, textAlign: 'center', fontSize: 24, letterSpacing: 10,
                padding: '12px 16px', background: '#0a0a1e',
                border: `3px solid ${err ? '#E53935' : '#FF9800'}`,
                color: '#FF9800', borderRadius: 0, fontFamily: 'monospace',
                outline: 'none', display: 'block', margin: '0 auto',
                animation: err ? 'shake 0.3s ease' : 'none',
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
              <button onClick={submit} style={{ background: 'linear-gradient(180deg,#4CAF50,#2E7D32)', border: '3px solid #1B5E20', color: '#fff', fontFamily: "'Press Start 2P',monospace", fontSize: 8, padding: '8px 16px', cursor: 'pointer', borderRadius: 0, boxShadow: '3px 3px 0 #1B5E20' }}>确认 ✅</button>
              <button onClick={() => setOpen(false)} style={{ background: '#555', border: '3px solid #333', color: '#fff', fontFamily: "'Press Start 2P',monospace", fontSize: 8, padding: '8px 16px', cursor: 'pointer', borderRadius: 0, boxShadow: '3px 3px 0 #222' }}>取消</button>
            </div>
            {err && <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: '#E53935', textAlign: 'center', marginTop: 10 }}>密码不对！</div>}
          </div>
        </div>
      )}
    </>
  );
}

// ─── 频率按钮组 ─────────────────────────────────────────────
const FREQ_OPTIONS: { v: 'once'|'daily'|'weekly'|'monthly'; l: string; c: string }[] = [
  { v: 'once',   l: '单次', c: '#9E9E9E' },
  { v: 'daily',  l: '每天', c: '#4CAF50' },
  { v: 'weekly', l: '每周', c: '#2196F3' },
  { v: 'monthly', l: '每月', c: '#9C27B0' },
];

function FreqButtons({ value, onChange }: { value: string; onChange: (v: 'once'|'daily'|'weekly'|'monthly') => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {FREQ_OPTIONS.map(({ v, l, c }) => {
        const active = value === v;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            background:  active ? c : 'transparent',
            border: `3px solid ${active ? c : '#555'}`,
            color: '#fff',
            fontFamily: "'Press Start 2P',monospace",
            fontSize: 7, padding: '7px 12px',
            cursor: 'pointer', borderRadius: 0,
            boxShadow: active ? `3px 3px 0 ${c}88` : '2px 2px 0 #333',
            transition: 'all 0.12s',
            transform: active ? 'translateY(-1px)' : 'translateY(0)',
          }}>{l}</button>
        );
      })}
    </div>
  );
}

// ─── 添加任务表单 ─────────────────────────────────────────────
export function AddTaskForm({ onAdd }: { onAdd: (t: Omit<Task, 'id' | 'createdAt' | 'lastCompletedAt' | 'completedThisWeek' | 'monthlyCount'>) => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [freq, setFreq] = useState<'once'|'daily'|'weekly'|'monthly'>('daily');
  const [monthlyLimit, setMonthlyLimit] = useState(10);
  const [chests, setChests] = useState(1);

  const i: React.CSSProperties = { background: '#1A1A1A', border: '2px solid #555', color: '#FFF', fontFamily: 'monospace', fontSize: 14, padding: '10px 12px', borderRadius: 0, outline: 'none', width: '100%', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { color: '#AAA', fontSize: 10, fontFamily: "'Press Start 2P',monospace", whiteSpace: 'nowrap', minWidth: 72 };

  const submit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), description: desc.trim(), frequency: freq, monthlyLimit, chests: Math.min(chests, 10), password: '7777777' });
    setName(''); setDesc(''); setFreq('daily'); setChests(1);
  };

  return (
    <div style={{ background: 'rgba(30,50,30,0.88)', border: '3px solid #4CAF50', borderRadius: 0, padding: 16, backdropFilter: 'blur(4px)', boxShadow: '4px 4px 0 #1B5E20' }}>
      <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#4CAF50', marginBottom: 14 }}>➕ 添加新任务</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="任务名称，如：整理书包" style={i} autoFocus />
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="完成条件描述（选填）" style={i} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={lbl}>完成频率</label>
          <FreqButtons value={freq} onChange={setFreq} />
        </div>
        {freq === 'monthly' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={lbl}>每月次数</label>
            <input type="number" value={monthlyLimit} min={1} max={31} onChange={(e) => setMonthlyLimit(parseInt(e.target.value) || 1)} style={{ ...i, width: 70 }} />
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={lbl}>奖励宝箱</label>
          <input type="number" value={chests} min={1} max={10} onChange={(e) => setChests(Math.min(parseInt(e.target.value) || 1, 10))} style={{ ...i, width: 70 }} />
          <span style={{ fontSize: 10, color: '#888' }}>（最多10个）</span>
        </div>
        <button onClick={submit} disabled={!name.trim()} style={{
          background: name.trim() ? 'linear-gradient(180deg,#4CAF50,#2E7D32)' : '#333',
          border: `3px solid ${name.trim() ? '#1B5E20' : '#333'}`,
          color: '#fff', fontFamily: "'Press Start 2P',monospace",
          fontSize: 9, padding: '10px', cursor: name.trim() ? 'pointer' : 'not-allowed',
          borderRadius: 0, boxShadow: name.trim() ? '3px 3px 0 #1B5E20' : 'none',
        }}>✅ 添加任务</button>
      </div>
    </div>
  );
}
