import { useState, useRef, useEffect } from 'react';

interface DeviceCodeModalProps {
  onConfirm: (code: string) => void;
}

export function DeviceCodeModal({ onConfirm }: DeviceCodeModalProps) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const validateCode = (input: string): boolean => {
    return /^[A-Z0-9]{6,10}$/.test(input);
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setErr(true);
      return;
    }
    if (!validateCode(code)) {
      setErr(true);
      return;
    }
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    onConfirm(code.toUpperCase());
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.92)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: 'rgba(30, 30, 50, 0.98)',
        border: '3px solid #4CAF50',
        borderRadius: 0,
        padding: '28px 24px',
        boxShadow: '6px 6px 0 #1B5E20, 0 0 40px rgba(76, 175, 80, 0.3)',
        minWidth: 300,
        maxWidth: 340,
        animation: 'fadeInUp 0.3s ease',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 20,
        }}>
          <div style={{
            width: 64,
            height: 64,
            margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #4CAF50, #2E7D32)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #1B5E20',
            boxShadow: '0 4px 16px rgba(76, 175, 80, 0.4)',
          }}>
            <span style={{ fontSize: 28 }}>🔑</span>
          </div>
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 11,
            color: '#4CAF50',
            lineHeight: 1.6,
          }}>
            🔒 设置设备码
          </div>
          <div style={{
            fontSize: 13,
            color: '#AAA',
            marginTop: 8,
            lineHeight: 1.6,
          }}>
            设置一个专属的设备码，保护你的任务数据
          </div>
        </div>

        <div style={{
          fontSize: 12,
          color: '#888',
          marginBottom: 12,
          textAlign: 'center',
        }}>
          请输入6-10位字母或数字（大写）
        </div>

        <input
          ref={ref}
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setErr(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="ABC123"
          maxLength={10}
          style={{
            width: '100%',
            textAlign: 'center',
            fontSize: 28,
            letterSpacing: 6,
            padding: '14px 16px',
            background: '#0a0a1e',
            border: `3px solid ${err ? '#E53935' : '#4CAF50'}`,
            color: '#4CAF50',
            borderRadius: 0,
            fontFamily: "'Press Start 2P', monospace",
            outline: 'none',
            textTransform: 'uppercase',
            animation: err ? 'shake 0.3s ease' : 'none',
          }}
          disabled={loading}
        />

        {err && (
          <div style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: 8,
            color: '#E53935',
            textAlign: 'center',
            marginTop: 10,
          }}>
            请输入有效的设备码！
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'center',
          marginTop: 20,
        }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? '#555' : 'linear-gradient(180deg, #4CAF50, #2E7D32)',
              border: '3px solid #1B5E20',
              color: '#fff',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 9,
              padding: '10px 24px',
              cursor: loading ? 'not-allowed' : 'pointer',
              borderRadius: 0,
              boxShadow: loading ? 'none' : '3px 3px 0 #1B5E20',
              minWidth: 120,
            }}
          >
            {loading ? '处理中...' : '确认设置'}
          </button>
        </div>

        <div style={{
          fontSize: 11,
          color: '#666',
          textAlign: 'center',
          marginTop: 16,
          lineHeight: 1.6,
        }}>
          💡 提示：设置后将获得 3 个高级宝箱奖励！
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
}
