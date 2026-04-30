import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../lib/store';
import { useToast } from '../components/ui/toast';
import { DoodleIcon } from '../components/DoodleIcon';
import { Button } from '../components/ui/button';
import { Camera, X, Trophy, Gift, Eye } from 'lucide-react';
import { simulatePhotoComparison } from '../lib/types';
import type { MapNode } from '../lib/types';

const SIMILARITY_THRESHOLD = 70;

// Generate a hand-drawn wavy path between two points
function doodlePath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Perpendicular offset for waviness
  const offset = (Math.random() - 0.5) * 30;
  const cx = mx + (-dy * 0.15) + offset;
  const cy = my + (dx * 0.15) + offset * 0.5;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

// Decorative SVG elements
function MapDecorations() {
  return (
    <g opacity="0.3">
      {/* Clouds */}
      <ellipse cx="60" cy="40" rx="25" ry="12" fill="hsl(200, 80%, 85%)" />
      <ellipse cx="50" cy="38" rx="15" ry="10" fill="hsl(200, 80%, 88%)" />
      <ellipse cx="72" cy="36" rx="18" ry="10" fill="hsl(200, 80%, 88%)" />

      <ellipse cx="280" cy="55" rx="20" ry="10" fill="hsl(200, 80%, 85%)" />
      <ellipse cx="272" cy="52" rx="12" ry="8" fill="hsl(200, 80%, 88%)" />

      {/* Trees */}
      <g transform="translate(30, 130)">
        <line x1="0" y1="15" x2="0" y2="25" stroke="hsl(28, 40%, 50%)" strokeWidth="2" />
        <circle cx="0" cy="10" r="8" fill="hsl(145, 50%, 60%)" />
      </g>
      <g transform="translate(310, 180)">
        <line x1="0" y1="15" x2="0" y2="25" stroke="hsl(28, 40%, 50%)" strokeWidth="2" />
        <circle cx="0" cy="10" r="6" fill="hsl(145, 50%, 55%)" />
      </g>
      <g transform="translate(50, 350)">
        <line x1="0" y1="12" x2="0" y2="20" stroke="hsl(28, 40%, 50%)" strokeWidth="2" />
        <polygon points="0,0 -7,12 7,12" fill="hsl(145, 50%, 58%)" />
      </g>

      {/* Birds */}
      <path d="M100 30 Q105 25 110 30" stroke="hsl(28, 30%, 50%)" strokeWidth="1.5" fill="none" />
      <path d="M115 25 Q120 20 125 25" stroke="hsl(28, 30%, 50%)" strokeWidth="1.5" fill="none" />

      {/* Stars */}
      <text x="250" y="35" fontSize="12" opacity="0.5">✦</text>
      <text x="150" y="50" fontSize="8" opacity="0.4">✦</text>
    </g>
  );
}

export default function MapPage() {
  const navigate = useNavigate();
  const { dispatch, getCurrentMap } = useApp();
  const { showToast } = useToast();
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);
  const [checkinImage, setCheckinImage] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [stampNodeId, setStampNodeId] = useState<string | null>(null);
  const [confettiNodes, setConfettiNodes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const map = getCurrentMap();

  if (!map) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col items-center justify-center p-5">
        <p className="text-muted-foreground font-display">还没有探险地图</p>
        <Button className="mt-4" onClick={() => navigate('/adventure')}>
          返回首页
        </Button>
      </div>
    );
  }

  const nodes = [...map.nodes].sort((a, b) => a.order - b.order);
  const completedCount = nodes.filter(n => n.isCompleted).length;

  // Layout nodes in a vertical winding path
  const SVG_WIDTH = 340;
  const NODE_SPACING = 120;
  const SVG_HEIGHT = Math.max(500, nodes.length * NODE_SPACING + 100);
  const PADDING_X = 55;

  const nodePositions = nodes.map((_, i) => {
    const y = 70 + i * NODE_SPACING;
    // Alternate left-right for winding path effect
    const xBase = i % 2 === 0 ? PADDING_X + 40 : SVG_WIDTH - PADDING_X - 40;
    const xOffset = (Math.sin(i * 1.5) * 20);
    return { x: xBase + xOffset, y };
  });

  const handleNodeClick = (node: MapNode) => {
    setSelectedNode(node);
    setCheckinImage(null);
    setShowCheckinModal(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCheckinImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVerify = useCallback(async () => {
    if (!selectedNode || !checkinImage) return;
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1200));
    const similarity = simulatePhotoComparison();
    setVerifying(false);

    if (similarity >= SIMILARITY_THRESHOLD) {
      dispatch({
        type: 'COMPLETE_NODE',
        mapId: map.id,
        nodeId: selectedNode.id,
        checkinImage,
      });
      setShowCheckinModal(false);
      setStampNodeId(selectedNode.id);
      setConfettiNodes(prev => [...prev, selectedNode.id]);
      showToast(`打卡成功! 相似度${similarity}%`, 'success');

      setTimeout(() => {
        setStampNodeId(null);
      }, 2000);

      // Check if all completed
      if (completedCount + 1 === nodes.length) {
        setTimeout(() => {
          showToast('恭喜! 探险任务全部完成! 🎉', 'success');
        }, 1500);
      }
    } else {
      showToast(`相似度${similarity}%，再试试看!`, 'error');
    }
  }, [selectedNode, checkinImage, dispatch, map.id, showToast, completedCount, nodes.length]);

  return (
    <div className="min-h-screen bg-parchment safe-top safe-bottom">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm px-5 py-3 flex items-center justify-between border-b border-border">
        <button
          className="text-muted-foreground text-sm touch-target"
          onClick={() => navigate('/adventure')}
        >
          ← 首页
        </button>
        <h2 className="font-display text-base text-foreground truncate mx-3">
          {map.title}
        </h2>
        <button
          className="touch-target flex items-center gap-1 text-adventure-gold"
          onClick={() => navigate('/adventure/rewards')}
        >
          <Gift className="w-5 h-5" />
          <span className="text-xs font-medium">{completedCount}</span>
        </button>
      </div>

      {/* Progress */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-warm transition-all duration-700"
              style={{ width: `${(completedCount / nodes.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-display text-muted-foreground">
            {completedCount}/{nodes.length}
          </span>
          {map.isComplete && <Trophy className="w-5 h-5 text-adventure-gold animate-float" />}
        </div>
      </div>

      {/* SVG Map */}
      <div className="px-2 overflow-x-hidden">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full"
          style={{ maxWidth: 420, margin: '0 auto', display: 'block' }}
        >
          {/* Background decorations */}
          <MapDecorations />

          {/* Dashed trail title */}
          <text
            x={SVG_WIDTH / 2}
            y="30"
            textAnchor="middle"
            className="fill-adventure-brown/40"
            fontSize="14"
            fontFamily="var(--font-hand)"
          >
            ~ 探险路线 ~
          </text>

          {/* Connection paths */}
          {nodePositions.map((pos, i) => {
            if (i === 0) return null;
            const prev = nodePositions[i - 1];
            const isCompleted = nodes[i - 1].isCompleted && nodes[i].isCompleted;
            const prevCompleted = nodes[i - 1].isCompleted;

            return (
              <path
                key={`path-${i}`}
                d={doodlePath(prev.x, prev.y, pos.x, pos.y)}
                stroke={prevCompleted ? 'hsl(24, 90%, 58%)' : 'hsl(28, 20%, 70%)'}
                strokeWidth={prevCompleted ? 3 : 2}
                strokeDasharray={isCompleted ? 'none' : '8 6'}
                fill="none"
                strokeLinecap="round"
                opacity={prevCompleted ? 1 : 0.5}
              />
            );
          })}

          {/* Footprint marks on completed paths */}
          {nodePositions.map((pos, i) => {
            if (i === 0 || !nodes[i - 1].isCompleted) return null;
            const prev = nodePositions[i - 1];
            const mx = (prev.x + pos.x) / 2;
            const my = (prev.y + pos.y) / 2;
            return (
              <text
                key={`foot-${i}`}
                x={mx}
                y={my}
                fontSize="14"
                textAnchor="middle"
                opacity="0.4"
              >
                👣
              </text>
            );
          })}

          {/* Node markers */}
          {nodePositions.map((pos, i) => {
            const node = nodes[i];
            const isCompleted = node.isCompleted;
            const showStamp = stampNodeId === node.id;

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => handleNodeClick(node)}
                className="cursor-pointer"
                style={{ touchAction: 'manipulation' }}
              >
                {/* Glow ring for active/completed */}
                {isCompleted && (
                  <circle
                    cx="0"
                    cy="0"
                    r="32"
                    fill="none"
                    stroke="hsl(145, 60%, 45%)"
                    strokeWidth="2"
                    opacity="0.3"
                  >
                    <animate
                      attributeName="r"
                      values="30;35;30"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.3;0.1;0.3"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Base circle */}
                <circle
                  cx="0"
                  cy="0"
                  r="28"
                  fill={isCompleted ? 'hsl(38, 50%, 97%)' : 'hsl(38, 30%, 92%)'}
                  stroke={isCompleted ? 'hsl(145, 60%, 45%)' : 'hsl(28, 20%, 75%)'}
                  strokeWidth={isCompleted ? 3 : 2}
                  strokeDasharray={isCompleted ? 'none' : '5 3'}
                />

                {/* Icon */}
                <g transform="translate(-18, -18)">
                  <DoodleIcon type={node.iconType} size={36} completed={isCompleted} />
                </g>

                {/* Order number badge */}
                <circle
                  cx="20"
                  cy="-20"
                  r="10"
                  fill={isCompleted ? 'hsl(145, 60%, 45%)' : 'hsl(24, 90%, 58%)'}
                />
                <text
                  x="20"
                  y="-16"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="white"
                >
                  {i + 1}
                </text>

                {/* Name label */}
                <text
                  x="0"
                  y="45"
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="var(--font-display)"
                  fill={isCompleted ? 'hsl(145, 50%, 35%)' : 'hsl(28, 20%, 55%)'}
                  fontWeight="500"
                >
                  {node.name}
                </text>

                {/* Checkmark for completed */}
                {isCompleted && !showStamp && (
                  <g transform="translate(-22, -22)">
                    <text fontSize="16">✅</text>
                  </g>
                )}

                {/* Stamp animation */}
                {showStamp && (
                  <g className="animate-stamp-in">
                    <circle cx="0" cy="0" r="22" fill="hsl(145, 60%, 45%)" opacity="0.15" />
                    <text x="0" y="5" textAnchor="middle" fontSize="22">🎉</text>
                  </g>
                )}

                {/* Confetti particles */}
                {confettiNodes.includes(node.id) && (
                  <>
                    {[...Array(6)].map((_, j) => (
                      <circle
                        key={`confetti-${j}`}
                        cx={Math.cos(j * 60 * Math.PI / 180) * 15}
                        cy={Math.sin(j * 60 * Math.PI / 180) * 15}
                        r="3"
                        fill={['hsl(24,90%,58%)', 'hsl(42,92%,56%)', 'hsl(145,60%,45%)', 'hsl(200,80%,55%)', 'hsl(340,75%,65%)', 'hsl(42,80%,50%)'][j]}
                        opacity="0.8"
                      >
                        <animate
                          attributeName="cy"
                          from={Math.sin(j * 60 * Math.PI / 180) * 15}
                          to={Math.sin(j * 60 * Math.PI / 180) * 15 - 60}
                          dur="1s"
                          fill="freeze"
                        />
                        <animate
                          attributeName="opacity"
                          from="0.8"
                          to="0"
                          dur="1s"
                          fill="freeze"
                        />
                      </circle>
                    ))}
                  </>
                )}
              </g>
            );
          })}

          {/* Start flag */}
          <g transform={`translate(${(nodePositions[0]?.x ?? 0) - 35}, ${(nodePositions[0]?.y ?? 70) - 25})`}>
            <text fontSize="18">🚩</text>
          </g>

          {/* End flag / treasure */}
          {nodes.length > 1 && (
            <g transform={`translate(${(nodePositions[nodePositions.length - 1]?.x ?? 0) + 25}, ${(nodePositions[nodePositions.length - 1]?.y ?? 0) - 25})`}>
              <text fontSize="18" className={map.isComplete ? 'animate-float' : ''}>
                {map.isComplete ? '🏆' : '🎯'}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Check-in Modal */}
      {showCheckinModal && selectedNode && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-foreground/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-card rounded-t-3xl p-5 animate-slide-up safe-bottom">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">
                {selectedNode.isCompleted ? '已打卡' : '拍照打卡'}
              </h3>
              <button
                className="touch-target text-muted-foreground"
                onClick={() => setShowCheckinModal(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                <DoodleIcon type={selectedNode.iconType} size={44} completed={selectedNode.isCompleted} />
              </div>
              <div>
                <p className="font-display text-base text-foreground">{selectedNode.name}</p>
                <p className="text-xs text-muted-foreground">{selectedNode.description}</p>
              </div>
            </div>

            {/* Reference image */}
            <button
              className="w-full mb-4 text-left"
              onClick={() => setShowReferenceModal(true)}
            >
              <div className="relative rounded-lg overflow-hidden border-doodle">
                <img
                  src={selectedNode.referenceImageUrl}
                  alt="参考图"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-foreground/50 text-background text-xs text-center py-1 flex items-center justify-center gap-1">
                  <Eye className="w-3 h-3" />
                  点击查看参考图
                </div>
              </div>
            </button>

            {selectedNode.isCompleted ? (
              <div className="text-center py-4">
                <div className="stamp-effect inline-flex items-center justify-center w-16 h-16 mx-auto mb-2">
                  <span className="text-adventure-green font-hand text-sm">打卡<br/>成功</span>
                </div>
                {selectedNode.checkinImageUrl && (
                  <img
                    src={selectedNode.checkinImageUrl}
                    alt="打卡照片"
                    className="w-full h-40 object-cover rounded-lg mt-3 border-doodle"
                  />
                )}
              </div>
            ) : (
              <>
                {checkinImage ? (
                  <div className="relative rounded-lg overflow-hidden border-doodle mb-4">
                    <img src={checkinImage} alt="打卡照片" className="w-full h-40 object-cover" />
                    <button
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-foreground/60 text-background flex items-center justify-center"
                      onClick={() => setCheckinImage(null)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full h-32 rounded-lg border-2 border-dashed border-adventure-orange/40 flex flex-col items-center justify-center gap-2 text-adventure-orange touch-target mb-4 active:scale-95 transition-transform"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-8 h-8" />
                    <span className="text-sm font-display">拍照 / 选择照片</span>
                  </button>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  disabled={!checkinImage || verifying}
                  onClick={handleVerify}
                >
                  {verifying ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">🔍</span>
                      AI比对中...
                    </span>
                  ) : (
                    '提交打卡'
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reference Image Fullscreen Modal */}
      {showReferenceModal && selectedNode && (
        <div
          className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4"
          onClick={() => setShowReferenceModal(false)}
        >
          <div className="relative max-w-md w-full">
            <img
              src={selectedNode.referenceImageUrl}
              alt="参考图"
              className="w-full rounded-lg"
            />
            <button
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/60 text-background flex items-center justify-center touch-target"
              onClick={() => setShowReferenceModal(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
