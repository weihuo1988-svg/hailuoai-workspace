import { useState } from 'react';
import type { AppState } from '../types';
import type { SyncConfig } from '../utils';
import { getSyncConfig, setSyncConfig, generateSyncId, syncPull, syncPush } from '../utils';

interface Props {
  state: AppState;
  syncVersion: number;
  onSynced: (state: AppState, version: number) => void;
  onClose: () => void;
}

const btn: React.CSSProperties = {
  fontFamily: "'Press Start 2P',monospace", fontSize: 8,
  padding: '10px 16px', border: '3px solid #1B5E20', borderRadius: 0,
  cursor: 'pointer', color: '#fff', boxShadow: '3px 3px 0 #1B5E20',
};

const input: React.CSSProperties = {
  fontFamily: "'Press Start 2P',monospace", fontSize: 14,
  padding: '10px 14px', border: '3px solid #555', borderRadius: 0,
  background: 'rgba(20,20,40,0.9)', color: '#fff',
  width: '100%', textAlign: 'center', letterSpacing: 6,
};

export function SyncPanel({ state, syncVersion, onSynced, onClose }: Props) {
  const [config] = useState<SyncConfig | null>(getSyncConfig);
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>(config ? 'status' as any : 'menu');
  const [syncId, setSyncId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 已绑定 - 显示状态
  if (config) {
    return (
      <div style={{ background: 'rgba(20,20,40,0.95)', border: '3px solid #4CAF50', padding: 20, backdropFilter: 'blur(8px)' }}>
        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#4CAF50', marginBottom: 16 }}>
          云同步已开启
        </div>
        <div style={{ background: 'rgba(76,175,80,0.15)', border: '2px solid #4CAF50', padding: 14, textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>同步码</div>
          <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 22, color: '#4CAF50', letterSpacing: 6, userSelect: 'all' }}>
            {config.userId}
          </div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 8 }}>在其他设备输入此码即可同步数据</div>
        </div>
        {error && <div style={{ color: '#f44', fontSize: 12, marginBottom: 10 }}>{error}</div>}
        {success && <div style={{ color: '#4CAF50', fontSize: 12, marginBottom: 10 }}>{success}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button disabled={loading} onClick={async () => {
            setLoading(true); setError(''); setSuccess('');
            try {
              const newVer = await syncPush(config.userId, syncVersion, state);
              setSyncConfig({ ...config, version: newVer });
              onSynced(state, newVer);
              setSuccess('上传成功');
            } catch (e: any) { setError(e.message); }
            setLoading(false);
          }} style={{ ...btn, flex: 1, background: 'linear-gradient(180deg,#4CAF50,#2E7D32)', opacity: loading ? 0.5 : 1 }}>
            {loading ? '...' : '上传数据'}
          </button>
          <button disabled={loading} onClick={async () => {
            setLoading(true); setError(''); setSuccess('');
            try {
              const { data, version } = await syncPull(config.userId);
              if (data) {
                setSyncConfig({ ...config, version });
                onSynced(data, version);
                setSuccess('下载成功');
              } else { setError('云端暂无数据'); }
            } catch (e: any) { setError(e.message); }
            setLoading(false);
          }} style={{ ...btn, flex: 1, background: 'linear-gradient(180deg,#FF9800,#E65100)', opacity: loading ? 0.5 : 1 }}>
            {loading ? '...' : '下载数据'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button onClick={() => { setSyncConfig(null); window.location.reload(); }}
            style={{ ...btn, flex: 1, background: '#444', border: '3px solid #666' }}>
            解除绑定
          </button>
          <button onClick={onClose} style={{ ...btn, flex: 1, background: '#333', border: '3px solid #555' }}>关闭</button>
        </div>
      </div>
    );
  }

  // 选择菜单
  if (mode === 'menu') {
    return (
      <div style={{ background: 'rgba(20,20,40,0.95)', border: '3px solid #FF9800', padding: 20, backdropFilter: 'blur(8px)' }}>
        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#FF9800', marginBottom: 6 }}>
          跨设备数据同步
        </div>
        <div style={{ fontSize: 13, color: '#999', marginBottom: 18, lineHeight: 1.6 }}>
          开启云同步后，任务、宝箱和收藏在多台设备间保持一致。
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setMode('create')} style={{ ...btn, flex: 1, background: 'linear-gradient(180deg,#4CAF50,#2E7D32)' }}>
            创建同步码
          </button>
          <button onClick={() => setMode('join')} style={{ ...btn, flex: 1, background: 'linear-gradient(180deg,#FF9800,#E65100)' }}>
            输入同步码
          </button>
        </div>
        <button onClick={onClose} style={{ ...btn, width: '100%', marginTop: 10, background: '#333', border: '3px solid #555' }}>
          稍后设置
        </button>
      </div>
    );
  }

  // 创建同步码
  if (mode === 'create') {
    return (
      <div style={{ background: 'rgba(20,20,40,0.95)', border: '3px solid #4CAF50', padding: 20, backdropFilter: 'blur(8px)' }}>
        <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#4CAF50', marginBottom: 14 }}>
          创建同步码
        </div>
        <div style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
          点击创建后，将自动生成同步码并上传当前数据。
        </div>
        {error && <div style={{ color: '#f44', fontSize: 12, marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { setMode('menu'); setError(''); }} style={{ ...btn, flex: 1, background: '#444' }}>返回</button>
          <button disabled={loading} onClick={async () => {
            setLoading(true); setError('');
            try {
              const newId = generateSyncId();
              const newVer = await syncPush(newId, 0, state);
              const cfg: SyncConfig = { userId: newId, version: newVer };
              setSyncConfig(cfg);
              onSynced(state, newVer);
              window.location.reload();
            } catch (e: any) { setError(e.message); }
            setLoading(false);
          }} style={{ ...btn, flex: 1, background: 'linear-gradient(180deg,#4CAF50,#2E7D32)', opacity: loading ? 0.5 : 1 }}>
            {loading ? '创建中...' : '创建并上传'}
          </button>
        </div>
      </div>
    );
  }

  // 输入已有同步码
  return (
    <div style={{ background: 'rgba(20,20,40,0.95)', border: '3px solid #FF9800', padding: 20, backdropFilter: 'blur(8px)' }}>
      <div style={{ fontFamily: "'Press Start 2P',monospace", fontSize: 10, color: '#FF9800', marginBottom: 14 }}>
        输入同步码
      </div>
      <input placeholder="如 A3K9F2" maxLength={6}
        value={syncId} onChange={e => setSyncId(e.target.value.toUpperCase())}
        style={{ ...input, marginBottom: 10 }}
      />
      {error && <div style={{ color: '#f44', fontSize: 12, marginTop: 8 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button onClick={() => { setMode('menu'); setError(''); }} style={{ ...btn, flex: 1, background: '#444' }}>返回</button>
        <button disabled={loading || syncId.length < 6} onClick={async () => {
          setLoading(true); setError('');
          try {
            const { data, version } = await syncPull(syncId);
            if (data) {
              const cfg: SyncConfig = { userId: syncId, version };
              setSyncConfig(cfg);
              onSynced(data, version);
              window.location.reload();
            } else { setError('此同步码暂无数据，请检查是否正确'); }
          } catch (e: any) { setError(e.message); }
          setLoading(false);
        }} style={{
          ...btn, flex: 1,
          background: syncId.length >= 6 ? 'linear-gradient(180deg,#FF9800,#E65100)' : '#444',
          opacity: loading ? 0.5 : 1,
        }}>
          {loading ? '连接中...' : '连接同步'}
        </button>
      </div>
    </div>
  );
}
