import { useEffect, useState } from 'react';
import type { GuideStep } from '../types';
import { MC_LOCAL_BASE } from '../mcTextures';

interface GuideOverlayProps {
  step: GuideStep;
  onNext: () => void;
  onClose?: () => void;
}

export function GuideOverlay({ step, onNext, onClose }: GuideOverlayProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(false);
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [step]);

  if (step === 'none') return null;

  const getContent = () => {
    switch (step) {
      case 'guide-task':
        return {
          title: '🎯 第一步',
          subtitle: '完成新手任务',
          description: '点击"免密完成"按钮，体验完成任务的乐趣！',
          target: '任务卡片',
          arrowPosition: 'bottom',
        };
      case 'guide-chest':
        return {
          title: '📦 第二步',
          subtitle: '开启宝箱',
          description: '点击底部的"宝箱"标签，去开启你获得的宝箱吧！',
          target: '宝箱Tab',
          arrowPosition: 'top',
        };
      case 'guide-shop':
        return {
          title: '🏪 第三步',
          subtitle: '查看收藏',
          description: '点击底部的"收藏"标签，查看你收集到的物品！',
          target: '收藏Tab',
          arrowPosition: 'top',
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        pointerEvents: 'auto',
      }} onClick={onClose} />

      {step === 'guide-chest' && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto',
        }}>
          <div style={{
            position: 'relative',
            animation: showContent ? 'bounceIn 0.4s ease' : 'none',
          }}>
            <div style={{
              background: 'linear-gradient(180deg, #FFD700, #B8860B)',
              border: '3px solid #8B6914',
              borderRadius: 0,
              padding: '12px 20px',
              boxShadow: '4px 4px 0 #8B6914, 0 0 20px rgba(255, 215, 0, 0.5)',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              color: '#1a1a2e',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
              📦 去开宝箱！
            </div>
            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: -16,
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '16px solid #B8860B',
            }} />
          </div>
        </div>
      )}

      {step === 'guide-shop' && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          right: '25%',
          pointerEvents: 'auto',
        }}>
          <div style={{
            position: 'relative',
            animation: showContent ? 'bounceIn 0.4s ease' : 'none',
          }}>
            <div style={{
              background: 'linear-gradient(180deg, #FFD700, #B8860B)',
              border: '3px solid #8B6914',
              borderRadius: 0,
              padding: '12px 20px',
              boxShadow: '4px 4px 0 #8B6914, 0 0 20px rgba(255, 215, 0, 0.5)',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 8,
              color: '#1a1a2e',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}>
              🏪 去收藏看看！
            </div>
            <div style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: -16,
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '16px solid #B8860B',
            }} />
          </div>
        </div>
      )}

      {step === 'guide-task' && (
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'auto',
          animation: showContent ? 'fadeInUp 0.4s ease' : 'none',
        }}>
          <div style={{
            background: 'rgba(20, 40, 20, 0.95)',
            border: '3px solid #FFD700',
            borderRadius: 0,
            padding: '20px 24px',
            boxShadow: '6px 6px 0 #1B5E20, 0 0 30px rgba(255, 215, 0, 0.3)',
            maxWidth: 280,
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 11,
              color: '#FFD700',
              marginBottom: 8,
              lineHeight: 1.6,
            }}>
              🎯 欢迎来到任务世界！
            </div>
            <div style={{
              fontSize: 13,
              color: '#AAA',
              lineHeight: 1.6,
            }}>
              点击下方的"免密完成"按钮，完成你的第一个任务吧！
            </div>
            <button
              onClick={onNext}
              style={{
                marginTop: 16,
                background: 'linear-gradient(180deg, #FFD700, #B8860B)',
                border: '3px solid #8B6914',
                color: '#1a1a2e',
                fontFamily: "'Press Start 2P', monospace",
                fontSize: 8,
                padding: '10px 20px',
                cursor: 'pointer',
                borderRadius: 0,
                boxShadow: '3px 3px 0 #8B6914',
                animation: 'pulse 1s ease-in-out infinite',
              }}
            >
              知道啦！
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounceIn {
          0% { transform: translateX(-50%) scale(0.3); opacity: 0; }
          50% { transform: translateX(-50%) scale(1.1); }
          100% { transform: translateX(-50%) scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
