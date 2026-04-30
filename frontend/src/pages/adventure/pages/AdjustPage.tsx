import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { useToast } from '../components/ui/toast';
import { Button } from '../components/ui/button';
import { DoodleIcon } from '../components/DoodleIcon';
import { GripVertical, ArrowRight, MapPinned, Pencil, X, Check } from 'lucide-react';
import type { MapNode } from '../lib/types';
import { ICON_LABELS } from '../lib/types';

export default function AdjustPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const dragNode = useRef<number | null>(null);
  const [editingNode, setEditingNode] = useState<MapNode | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const nodes = state.pendingNodes;

  if (nodes.length === 0) {
    navigate('/adventure/upload');
    return null;
  }

  const handleDragStart = (idx: number) => {
    dragNode.current = idx;
    setDragIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  };

  const handleDrop = (idx: number) => {
    if (dragNode.current === null) return;
    const from = dragNode.current;
    if (from === idx) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }

    const newNodes = [...nodes];
    const [moved] = newNodes.splice(from, 1);
    newNodes.splice(idx, 0, moved);
    const reordered = newNodes.map((n, i) => ({ ...n, order: i }));

    dispatch({ type: 'REORDER_NODES', nodes: reordered });
    dragNode.current = null;
    setDragIdx(null);
    setOverIdx(null);
  };

  // Touch drag support
  const touchStartY = useRef(0);
  const touchNodeIdx = useRef<number | null>(null);

  const handleTouchStart = (idx: number, e: React.TouchEvent) => {
    touchNodeIdx.current = idx;
    touchStartY.current = e.touches[0].clientY;
    setDragIdx(idx);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchNodeIdx.current === null) return;
    const touch = e.touches[0];
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY);
    const cardEl = elements.find(el => el.getAttribute('data-node-idx'));
    if (cardEl) {
      const idx = parseInt(cardEl.getAttribute('data-node-idx')!);
      setOverIdx(idx);
    }
  };

  const handleTouchEnd = () => {
    if (touchNodeIdx.current !== null && overIdx !== null && touchNodeIdx.current !== overIdx) {
      const newNodes = [...nodes];
      const [moved] = newNodes.splice(touchNodeIdx.current, 1);
      newNodes.splice(overIdx, 0, moved);
      const reordered = newNodes.map((n, i) => ({ ...n, order: i }));
      dispatch({ type: 'REORDER_NODES', nodes: reordered });
    }
    touchNodeIdx.current = null;
    setDragIdx(null);
    setOverIdx(null);
  };

  const handleCreate = () => {
    const mapTitle = title.trim() || `探险 ${new Date().toLocaleDateString('zh-CN')}`;
    dispatch({ type: 'CREATE_MAP', title: mapTitle });
    showToast('探险地图已生成!', 'success');
    navigate('/adventure/map');
  };

  const handleEditStart = (node: MapNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNode(node);
    setEditName(node.name);
    setEditDesc(node.description || '');
  };

  const handleEditSave = () => {
    if (!editingNode) return;
    dispatch({
      type: 'UPDATE_PENDING_NODE',
      nodeId: editingNode.id,
      name: editName.trim() || editingNode.name,
      description: editDesc.trim(),
    });
    setEditingNode(null);
    showToast('地点信息已更新', 'success');
  };

  return (
    <div className="min-h-screen bg-parchment safe-top safe-bottom pb-28">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <button
          className="text-muted-foreground text-sm touch-target mb-2"
          onClick={() => navigate('/adventure/upload')}
        >
          ← 返回上传
        </button>
        <h1 className="text-2xl font-hand text-foreground">调整探险路线</h1>
        <p className="text-muted-foreground text-sm mt-1">
          长按拖拽卡片调整顺序，AI已为你规划最短路线
        </p>
      </div>

      {/* Trip Title Input */}
      <div className="px-5 mb-4">
        <input
          type="text"
          placeholder="给这次探险起个名字..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-bubble border-doodle bg-card text-foreground font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-adventure-orange/40"
        />
      </div>

      {/* Route Preview - connection line */}
      <div className="px-5">
        <div className="space-y-0">
          {nodes.map((node: MapNode, idx: number) => (
            <div key={node.id}>
              <div
                data-node-idx={idx}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                onDrop={() => handleDrop(idx)}
                onTouchStart={(e) => handleTouchStart(idx, e)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all cursor-grab active:cursor-grabbing
                  ${dragIdx === idx ? 'opacity-50 scale-95' : ''}
                  ${overIdx === idx && dragIdx !== idx ? 'bg-adventure-orange/10 scale-[1.02]' : ''}
                  bg-card border-doodle
                `}
              >
                <div className="touch-target flex items-center justify-center text-muted-foreground">
                  <GripVertical className="w-5 h-5" />
                </div>

                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  <DoodleIcon type={node.iconType} size={36} completed />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-display text-sm text-foreground truncate">
                    {node.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ICON_LABELS[node.iconType]} · {node.description}
                  </p>
                </div>

                <button
                  className="touch-target flex items-center justify-center text-muted-foreground hover:text-adventure-orange transition-colors flex-shrink-0"
                  onClick={(e) => handleEditStart(node, e)}
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <div className="w-7 h-7 rounded-full bg-adventure-orange/15 text-adventure-orange flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
              </div>

              {/* Connection line between nodes */}
              {idx < nodes.length - 1 && (
                <div className="flex items-center pl-9 py-1">
                  <div className="w-px h-6 border-l-2 border-dashed border-adventure-orange/30 ml-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-background/80 backdrop-blur-sm safe-bottom">
        <Button
          size="xl"
          variant="adventure"
          className="w-full"
          onClick={handleCreate}
        >
          <MapPinned className="mr-2 h-5 w-5" />
          生成探险地图
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Edit Node Modal */}
      {editingNode && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-t-3xl p-5 animate-slide-up safe-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">编辑地点信息</h3>
              <button
                className="touch-target text-muted-foreground"
                onClick={() => setEditingNode(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-muted/50">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <DoodleIcon type={editingNode.iconType} size={36} completed />
              </div>
              <span className="text-sm text-muted-foreground">
                AI 识别类型: {ICON_LABELS[editingNode.iconType]}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground block mb-1">地点名称</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="输入地点名称"
                  className="w-full px-4 py-3 rounded-bubble border-doodle bg-background text-foreground font-display placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-adventure-orange/40"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground block mb-1">地点描述</label>
                <textarea
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="简单描述一下这个地方..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-doodle bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-adventure-orange/40 resize-none"
                />
              </div>
              <Button
                size="lg"
                className="w-full"
                onClick={handleEditSave}
              >
                <Check className="mr-2 w-4 h-4" />
                保存修改
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
