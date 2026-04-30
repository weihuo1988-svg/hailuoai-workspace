import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { Button } from '../components/ui/button';
import { MapPin, Plus, Compass, Trash2 } from 'lucide-react';

export default function HomePage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const handleDelete = (e: React.MouseEvent, mapId: string) => {
    e.stopPropagation();
    dispatch({ type: 'DELETE_MAP', mapId });
  };

  return (
    <div className="min-h-screen bg-parchment safe-top safe-bottom">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-5 pt-8 pb-4">
        <div className="relative z-10">
          <h1 className="text-3xl font-hand text-foreground leading-tight">
            小探险家
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            让每次旅行都变成一场冒险
          </p>
        </div>
        <div className="absolute -top-4 -right-4 w-32 h-32 opacity-20">
          <Compass className="w-full h-full text-adventure-orange" strokeWidth={1} />
        </div>
      </div>

      {/* Create New Trip Button */}
      <div className="px-5 pb-6">
        <Button
          size="xl"
          className="w-full"
          onClick={() => navigate('/adventure/upload')}
        >
          <Plus className="mr-2 h-5 w-5" />
          新建探险行程
        </Button>
      </div>

      {/* Trip List */}
      <div className="px-5">
        {state.maps.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-display text-lg">
              还没有探险行程
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              上传景点照片，开始你的第一次冒险吧!
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            <h2 className="font-display text-lg text-foreground">我的探险</h2>
            {state.maps.map((map) => {
              const completedCount = map.nodes.filter(n => n.isCompleted).length;
              const totalCount = map.nodes.length;
              const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

              return (
                <div
                  key={map.id}
                  className="card-doodle p-4 cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => {
                    dispatch({ type: 'SET_CURRENT_MAP', mapId: map.id });
                    navigate('/adventure/map');
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-base text-foreground truncate">
                        {map.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(map.createdAt).toLocaleDateString('zh-CN')} · {totalCount}个景点
                      </p>

                      {/* Progress bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-warm transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                          {completedCount}/{totalCount}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {map.isComplete && (
                        <span className="text-2xl">🏆</span>
                      )}
                      <button
                        className="touch-target flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                        onClick={(e) => handleDelete(e, map.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Node preview icons */}
                  <div className="flex gap-1 mt-3 flex-wrap">
                    {map.nodes.slice(0, 6).map((node) => (
                      <span
                        key={node.id}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          node.isCompleted
                            ? 'bg-adventure-green/20 text-adventure-green'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {node.name}
                      </span>
                    ))}
                    {map.nodes.length > 6 && (
                      <span className="text-xs text-muted-foreground">
                        +{map.nodes.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
