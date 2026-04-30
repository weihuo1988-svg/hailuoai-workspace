import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { useToast } from '../components/ui/toast';
import { Button } from '../components/ui/button';
import { Gift, Lock, Check, Edit3, X } from 'lucide-react';
import type { Reward } from '../lib/types';

export default function RewardsPage() {
  const navigate = useNavigate();
  const { getCurrentMap, dispatch } = useApp();
  const { showToast } = useToast();
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [openingChest, setOpeningChest] = useState<string | null>(null);

  const map = getCurrentMap();

  if (!map) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-5">
        <p className="text-muted-foreground font-display">请先选择一个探险行程</p>
        <Button className="mt-4" onClick={() => navigate('/adventure')}>
          返回首页
        </Button>
      </div>
    );
  }

  const handleOpenChest = (reward: Reward) => {
    if (!reward.isUnlocked) {
      showToast('继续探险解锁更多宝箱!', 'info');
      return;
    }
    setOpeningChest(reward.id);
    setTimeout(() => {
      setOpeningChest(null);
    }, 2000);
  };

  const handleEditStart = (reward: Reward) => {
    setEditingReward(reward);
    setEditTitle(reward.title);
    setEditDesc(reward.description);
  };

  const handleEditSave = () => {
    if (!editingReward) return;
    dispatch({
      type: 'UPDATE_REWARD',
      mapId: map.id,
      rewardId: editingReward.id,
      title: editTitle.trim() || editingReward.title,
      description: editDesc.trim() || editingReward.description,
    });
    setEditingReward(null);
    showToast('奖励已更新!', 'success');
  };

  const completedCount = map.nodes.filter(n => n.isCompleted).length;
  const totalCount = map.nodes.length;

  return (
    <div className="min-h-screen bg-parchment safe-top safe-bottom">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <button
          className="text-muted-foreground text-sm touch-target mb-2"
          onClick={() => navigate('/adventure/map')}
        >
          ← 返回地图
        </button>
        <h1 className="text-2xl font-hand text-foreground flex items-center gap-2">
          <Gift className="w-6 h-6 text-adventure-gold" />
          宝箱中心
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          完成探险点位解锁宝箱，已解锁 {completedCount}/{totalCount}
        </p>
      </div>

      {/* Treasure Chest Hero */}
      <div className="px-5 mb-6">
        <div className="relative rounded-2xl overflow-hidden p-6 text-center" style={{ background: 'var(--gradient-gold)' }}>
          <img
            src="/images/treasure-chest.png"
            alt="宝箱"
            className={`w-24 h-24 mx-auto object-contain ${
              completedCount > 0 ? 'animate-chest-bounce' : 'opacity-60'
            }`}
          />
          <p className="text-foreground font-display text-lg mt-2">
            {map.isComplete ? '全部宝箱已解锁!' : `还差${totalCount - completedCount}个点位`}
          </p>
          {map.isComplete && (
            <div className="mt-2 text-2xl">🎉🏆🎉</div>
          )}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="px-5 pb-8">
        <div className="grid grid-cols-2 gap-4">
          {map.customRewards.map((reward, _idx) => {
            const isUnlocked = reward.isUnlocked;
            const isOpening = openingChest === reward.id;

            return (
              <div
                key={reward.id}
                className={`
                  relative rounded-2xl p-4 text-center transition-all cursor-pointer active:scale-95
                  ${isUnlocked
                    ? 'bg-card border-2 border-adventure-gold/50 shadow-card-warm'
                    : 'bg-muted/50 border-2 border-dashed border-border'
                  }
                `}
                onClick={() => handleOpenChest(reward)}
              >
                {/* Chest icon */}
                <div className={`text-4xl mb-2 ${isOpening ? 'animate-chest-bounce' : ''}`}>
                  {isUnlocked ? (isOpening ? '✨' : '🎁') : '🔒'}
                </div>

                {/* Reward content */}
                {isUnlocked ? (
                  <>
                    <p className="font-display text-sm text-foreground">{reward.title}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {reward.description}
                    </p>

                    {/* Edit button */}
                    <button
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground touch-target"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(reward);
                      }}
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>

                    {/* Opened sparkle */}
                    {isOpening && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {[0, 1, 2, 3, 4, 5].map(i => (
                          <span
                            key={i}
                            className="absolute text-lg animate-sparkle"
                            style={{
                              animationDelay: `${i * 0.15}s`,
                              top: `${20 + Math.sin(i) * 25}%`,
                              left: `${20 + Math.cos(i) * 25}%`,
                            }}
                          >
                            ✨
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <p className="font-display text-sm text-muted-foreground">未解锁</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">继续探险</span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Reward Modal */}
      {editingReward && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-t-3xl p-5 animate-slide-up safe-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">编辑奖励</h3>
              <button
                className="touch-target text-muted-foreground"
                onClick={() => setEditingReward(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">奖励名称</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-bubble border-doodle bg-background text-foreground font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-adventure-orange/40"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">奖励描述</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-doodle bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-adventure-orange/40 resize-none"
                />
              </div>
              <Button
                size="lg"
                variant="adventure"
                className="w-full"
                onClick={handleEditSave}
              >
                <Check className="mr-2 w-4 h-4" />
                保存
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
