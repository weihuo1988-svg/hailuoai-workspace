import { useState, useRef, useEffect } from 'react';
import type { Task } from '../types';
import { BLOCKS } from '../data';
import { MC_BLOCKS_BASE, BLOCK_TEXTURE_MAP } from '../mcTextures';

const freqMap: Record<string, string> = { once: '单次', daily: '每天', weekly: '每周', monthly: '每月' };

// ─── MC pixel-img helper ────────────────────────────────────
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

// ─── Get block texture path for a task ─────────────────────
function getTaskBlockTex(task: Task): string {
  if (task.blockTexture) return MC_BLOCKS_BASE + task.blockTexture;
  const block = BLOCKS[Math.floor(Math.random() * BLOCKS.length)];
  const tex = BLOCK_TEXTURE_MAP[block.id];
  return MC_BLOCKS_BASE + (tex ?? 'diamond_block.png');
}

// ─── Frequency options with MC slot icons ───────────────────
const FREQ_OPTIONS: { v: 'once'|'daily'|'weekly'|'monthly'; l: string; c: string; icon: string }[] = [
  { v: 'once',    l: '单次', c: '#9E9E9E', icon: 'paper.png' },
  { v: 'daily',   l: '每天', c: '#4CAF50', icon: 'clock.png' },
  { v: 'weekly',  l: '每周', c: '#2196F3', icon: 'calendar.png' },
  { v: 'monthly', l: '每月', c: '#9C27B0', icon: 'book_cover.png' },
];

// ─── FreqButtons (MC item slot style) ───────────────────────
function FreqButtons({ value, onChange }: { value: string; onChange: (v: 'once'|'daily'|'weekly'|'monthly') => void }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {FREQ_OPTIONS.map(({ v, l, c, icon }) => {
        const active = value === v;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            background: active ? c : 'rgba(20,20,40,0.9)',
            border: `3px solid ${active ? c : '#3a3a5a'}`,
            borderRadius: 0,
            boxShadow: active ? `3px 3px 0 ${c}88, 0 0 8px ${c}44` : '2px 2px 0 #111',
            color: '#fff',
            fontFamily: "'Press Start 2P',monospace",
            fontSize: 6, padding: '7px 10px',
            cursor: 'pointer',
            transition: 'all 0.12s',
            transform: active ? 'translateY(-1px)' : 'translateY(0)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3,
            minWidth: 50,
          }}>
            <div style={{
              background: active ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.3)',
              border: `1px solid ${active ? c + '88' : '#555'}`,
              borderRadius: 0,
              padding: 2,
            }}>
              <McImg
                src={`/mc-textures/items/${icon}`}
                alt={l}
                style={{ width: 12, height: 12 }}
              />
            </div>
            {l}
          </button>
        );
      })}
    </div>
  );
}

// ─── AddTaskForm ─────────────────────────────────────────────
export function AddTaskForm({ onAdd }: { onAdd: (t: Omit<Task, 'id' | 'createdAt' | 'lastCompletedAt' | 'completedThisWeek' | 'monthlyCount'>) => void }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [freq, setFreq] = useState<'once'|'daily'|'weekly'|'monthly'>('daily');
  const [monthlyLimit, setMonthlyLimit] = useState(10);
  const [chests, setChests] = useState(1);

  const lbl: React.CSSProperties = {
    color: '#AAA',
    fontSize: 8,
    fontFamily: "'Press Start 2P',monospace",
    whiteSpace: 'nowrap',
    minWidth: 60,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  };

  const submit = () => {
    if (!name.trim()) return;
    // 任务完成密码固定为 505050
    onAdd({ name: name.trim(), description: desc.trim(), frequency: freq, monthlyLimit, chests, password: '505050' });
    setName(''); setDesc(''); setFreq('daily'); setChests(1);
  };

  return (
    <div style={{
      background: 'rgba(18,18,36,0.95)',
      border: '4px solid #4CAF50',
      borderRadius: 0,
      padding: 16,
      backdropFilter: 'blur(4px)',
      boxShadow: '4px 4px 0 #1B5E20, 0 0 16px rgba(76,175,80,0.15)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <McImg src="/mc-textures/items/writable_book.png" alt="新建" style={{ width: 18, height: 18 }} />
        <span style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 8, color: '#4CAF50' }}>➕ 添加新任务</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="任务名称，如：整理书包"
          style={{
            background: '#0f0f1e',
            border: '3px solid #3a3a5a',
            color: '#FFF',
            fontFamily: "'Press Start 2P',monospace",
            fontSize: 8,
            padding: '10px 12px',
            borderRadius: 0,
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
            boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)',
          }}
          autoFocus
        />
        <input
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="完成条件描述（选填）"
          style={{
            background: '#0f0f1e',
            border: '3px solid #3a3a5a',
            color: '#FFF',
            fontFamily: 'monospace',
            fontSize: 13,
            padding: '10px 12px',
            borderRadius: 0,
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
            boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)',
          }}
        />

        {/* Frequency */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={lbl}>
            <McImg src="/mc-textures/items/clock.png" alt="频率" style={{ width: 12, height: 12 }} />
            频率
          </label>
          <FreqButtons value={freq} onChange={setFreq} />
        </div>

        {freq === 'monthly' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={lbl}>
              <McImg src="/mc-textures/items/book_cover.png" alt="次数" style={{ width: 12, height: 12 }} />
              每月次数
            </label>
            <input
              type="number"
              value={monthlyLimit}
              min={1} max={31}
              onChange={(e) => setMonthlyLimit(parseInt(e.target.value) || 1)}
              style={{
                background: '#0f0f1e', border: '3px solid #3a3a5a',
                color: '#FFF', fontFamily: "'Press Start 2P',monospace", fontSize: 8,
                padding: '8px 10px', borderRadius: 0, outline: 'none', width: 60, boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Chests */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={lbl}>
            <McImg src="/mc/chest_closed.png" alt="宝箱" style={{ width: 12, height: 12 }} />
            奖励
          </label>
          <input
            type="number"
            value={chests}
            min={1} max={10}
            onChange={(e) => setChests(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            style={{
              background: '#0f0f1e', border: '3px solid #3a3a5a',
              color: '#FFF', fontFamily: "'Press Start 2P',monospace", fontSize: 8,
              padding: '8px 10px', borderRadius: 0, outline: 'none', width: 60, boxSizing: 'border-box',
            }}
          />
          <span style={{ color: '#555', fontFamily: "'Press Start 2P',monospace", fontSize: 7 }}>箱（最多10箱）</span>
          <span style={{
            color: '#4CAF50', fontSize: 7, fontFamily: "'Press Start 2P',monospace",
            background: 'rgba(76,175,80,0.12)', border: '2px solid #2E7D32',
            padding: '3px 8px', borderRadius: 0,
          }}>
            🔑 固定密码 505050
          </span>
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={!name.trim()}
          style={{
            background: name.trim()
              ? 'linear-gradient(180deg,#4CAF50,#2E7D32)'
              : 'rgba(30,30,50,0.8)',
            border: `3px solid ${name.trim() ? '#1B5E20' : '#333'}`,
            color: '#fff',
            fontFamily: "'Press Start 2P',monospace",
            fontSize: 8, padding: '10px',
            cursor: name.trim() ? 'pointer' : 'not-allowed',
            borderRadius: 0,
            boxShadow: name.trim() ? '3px 3px 0 #1B5E20, 0 0 10px rgba(76,175,80,0.2)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 0.15s',
          }}>
          <McImg src="/mc-textures/items/emerald.png" alt="" style={{ width: 14, height: 14 }} />
          添加任务
        </button>
      </div>
    </div>
  );
}

// ─── TaskCard ────────────────────────────────────────────────
interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete?: (id: string) => void;
  showPasswordOnComplete?: boolean;
}

export function TaskCard({ task, onComplete, onDelete, showPasswordOnComplete }: TaskCardProps) {
  const [open, setOpen] = useState(false);
  const [pw, setPw]     = useState('');
  const [err, setErr]   = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) ref.current?.focus(); }, [open]);

  const handleClick = () => {
    if (!showPasswordOnComplete) { onComplete(task.id); return; }
    setOpen(true); setPw(''); setErr(false);
  };

  const submit = () => {
    if (pw === task.password) { setOpen(false); onComplete(task.id); }
    else { setErr(true); setPw(''); setTimeout(() => setErr(false), 800); }
  };

  const blockTex = getTaskBlockTex(task);

  return (
    <>
      {/* ── Task card ── */}
      <div style={{
        background: 'rgba(18,18,38,0.92)',
        border: '4px solid #5C9E3E',
        borderRadius: 0,
        padding: 12,
        marginBottom: 10,
        position: 'relative',
        boxShadow: '4px 4px 0 #1B5E20, 0 0 12px rgba(76,175,80,0.1)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        {/* Left: MC block icon */}
        <div style={{
          flexShrink: 0,
          background: 'rgba(10,10,20,0.8)',
          border: '3px solid #3a3a5a',
          borderRadius: 0,
          padding: 4,
          boxShadow: 'inset 0 0 0 2px #0f0f1e, 2px 2px 0 #000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <McImg src={blockTex} alt={task.name} style={{ width: 44, height: 44 }} />
        </div>

        {/* Right: content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Press Start 2P',monospace",
            fontSize: 8, color: '#FFF', marginBottom: 6,
            lineHeight: 1.6, wordBreak: 'break-word',
          }}>
            {task.name}
          </div>
          {task.description && (
            <div style={{ fontSize: 11, color: '#777', marginBottom: 8 }}>{task.description}</div>
          )}
          {/* Tags */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{
              background: 'linear-gradient(180deg,#4CAF50,#2E7D32)',
              color: '#fff', fontSize: 6, fontFamily: "'Press Start 2P',monospace",
              padding: '3px 8px', borderRadius: 0,
              border: '2px solid #1B5E20',
              boxShadow: '2px 2px 0 #1B5E20',
            }}>
              {freqMap[task.frequency]}{task.frequency === 'monthly' ? task.monthlyLimit + '次' : ''}
            </span>
            <span style={{
              background: 'linear-gradient(180deg,#F57C00,#E65100)',
              color: '#fff', fontSize: 6, fontFamily: "'Press Start 2P',monospace",
              padding: '3px 8px', borderRadius: 0,
              border: '2px solid #BF360C',
              boxShadow: '2px 2px 0 #BF360C',
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <McImg src="/mc/chest_closed.png" alt="箱" style={{ width: 8, height: 8 }} />
              {task.chests}箱
            </span>
          </div>
          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={handleClick}
              style={{
                background: 'linear-gradient(180deg,#4CAF50,#2E7D32)',
                border: '3px solid #1B5E20',
                color: '#fff',
                fontFamily: "'Press Start 2P',monospace",
                fontSize: 7, padding: '7px 12px',
                cursor: 'pointer', borderRadius: 0,
                boxShadow: '3px 3px 0 #1B5E20, 0 0 10px rgba(76,175,80,0.3)',
                transition: 'all 0.1s',
                flexShrink: 0,
              }}>
              ✅ 完成了！
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(task.id)}
                style={{
                  background: 'linear-gradient(180deg,#E53935,#C62828)',
                  border: '3px solid #8B0000',
                  color: '#fff',
                  fontFamily: "'Press Start 2P',monospace",
                  fontSize: 7, padding: '7px 10px',
                  cursor: 'pointer', borderRadius: 0,
                  boxShadow: '3px 3px 0 #8B0000',
                  transition: 'all 0.1s',
                  flexShrink: 0,
                }}>
                🗑️ 删除
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Password modal ── */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 8888, backdropFilter: 'blur(6px)',
        }} onClick={() => setOpen(false)}>
          <div style={{
            background: 'linear-gradient(135deg,#1a1a2e,#0f0f1e)',
            border: '4px solid #555',
            borderRadius: 0,
            padding: '28px 24px',
            boxShadow: '6px 6px 0 #222, inset 0 0 20px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.8)',
            minWidth: 300,
            animation: 'fadeIn 0.2s ease',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, justifyContent: 'center' }}>
              <McImg src="/mc-textures/items/iron_door.png" alt="" style={{ width: 20, height: 20 }} />
              <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 9, color: '#FF9800', textAlign: 'center' }}>
                🔑 完成确认
              </div>
              <McImg src="/mc-textures/items/tripwire_hook.png" alt="" style={{ width: 20, height: 20 }} />
            </div>

            <div style={{ fontSize: 12, color: '#888', marginBottom: 16, textAlign: 'center', lineHeight: 1.6 }}>
              请爸妈输入密码<br />确认完成任务
            </div>

            <input
              ref={ref}
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(false); }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="••••"
              maxLength={10}
              style={{
                width: 160, textAlign: 'center', fontSize: 24, letterSpacing: 10,
                padding: '12px 16px',
                background: '#0f0f1e',
                border: `4px solid ${err ? '#E53935' : '#FF9800'}`,
                color: '#FF9800',
                borderRadius: 0,
                fontFamily: 'monospace',
                outline: 'none',
                display: 'block', margin: '0 auto',
                animation: err ? 'shake 0.3s ease' : 'none',
                boxShadow: err ? '4px 4px 0 #8B0000' : '4px 4px 0 #7f3f00, 0 0 8px rgba(255,152,0,0.2)',
              }}
            />

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 18 }}>
              <button
                onClick={submit}
                style={{
                  background: 'linear-gradient(180deg,#4CAF50,#2E7D32)',
                  border: '3px solid #1B5E20',
                  color: '#fff',
                  fontFamily: "'Press Start 2P',monospace",
                  fontSize: 8, padding: '8px 16px',
                  cursor: 'pointer', borderRadius: 0,
                  boxShadow: '3px 3px 0 #1B5E20',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                <McImg src="/mc-textures/items/emerald.png" alt="" style={{ width: 12, height: 12 }} />
                确认
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: 'linear-gradient(180deg,#555,#333)',
                  border: '3px solid #333',
                  color: '#fff',
                  fontFamily: "'Press Start 2P',monospace",
                  fontSize: 8, padding: '8px 16px',
                  cursor: 'pointer', borderRadius: 0,
                  boxShadow: '3px 3px 0 #222',
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                <McImg src="/mc-textures/items/barrel_side.png" alt="" style={{ width: 12, height: 12 }} />
                取消
              </button>
            </div>

            {err && (
              <div style={{
                fontFamily: "'Press Start 2P',monospace", fontSize: 7,
                color: '#E53935', textAlign: 'center', marginTop: 12,
                animation: 'shake 0.3s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <McImg src="/mc-textures/items/redstone.png" alt="" style={{ width: 12, height: 12 }} />
                密码不对！
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
