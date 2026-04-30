export interface MapNode {
  id: string;
  name: string;
  coordinate: [number, number];
  referenceImageUrl: string;
  checkinImageUrl?: string;
  iconType: IconType;
  isCompleted: boolean;
  order: number;
  description?: string;
}

export type IconType =
  | 'forest'
  | 'bridge'
  | 'animal'
  | 'mountain'
  | 'lake'
  | 'castle'
  | 'playground'
  | 'temple'
  | 'flower'
  | 'lighthouse';

export interface AdventureMap {
  id: string;
  title: string;
  createdAt: number;
  nodes: MapNode[];
  customRewards: Reward[];
  isComplete: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
  nodeId?: string;
}

// Mock data for icon types keyed by detected scene
export const ICON_LABELS: Record<IconType, string> = {
  forest: '森林',
  bridge: '小桥',
  animal: '动物',
  mountain: '高山',
  lake: '湖泊',
  castle: '城堡',
  playground: '游乐场',
  temple: '古迹',
  flower: '花园',
  lighthouse: '灯塔',
};

// Mock AI recognition results
const MOCK_SCENES: { name: string; iconType: IconType; description: string }[] = [
  { name: '翠竹林小径', iconType: 'forest', description: '幽静的竹林步道' },
  { name: '彩虹拱桥', iconType: 'bridge', description: '横跨溪流的彩虹桥' },
  { name: '松鼠乐园', iconType: 'animal', description: '可爱的小松鼠栖息地' },
  { name: '望山亭', iconType: 'mountain', description: '可以远眺群山的观景亭' },
  { name: '镜湖', iconType: 'lake', description: '波光粼粼的小湖' },
  { name: '童话城堡', iconType: 'castle', description: '梦幻的儿童城堡' },
  { name: '欢乐滑梯', iconType: 'playground', description: '超长彩色滑梯' },
  { name: '古风凉亭', iconType: 'temple', description: '传统中式凉亭' },
  { name: '百花园', iconType: 'flower', description: '四季花卉花园' },
  { name: '星光塔', iconType: 'lighthouse', description: '景区标志性灯塔' },
];

export function simulateAIRecognition(imageCount: number): Omit<MapNode, 'referenceImageUrl'>[] {
  const shuffled = [...MOCK_SCENES].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(imageCount, MOCK_SCENES.length));

  // Generate random coordinates in a plausible area
  const baseLat = 30.25 + Math.random() * 0.05;
  const baseLng = 120.15 + Math.random() * 0.05;

  return selected.map((scene, i) => ({
    id: `node-${Date.now()}-${i}`,
    name: scene.name,
    coordinate: [
      baseLat + (Math.random() - 0.5) * 0.02,
      baseLng + (Math.random() - 0.5) * 0.02,
    ] as [number, number],
    iconType: scene.iconType,
    isCompleted: false,
    order: i,
    description: scene.description,
  }));
}

// Simple greedy path optimization (nearest neighbor)
export function optimizeRoute(nodes: MapNode[]): MapNode[] {
  if (nodes.length <= 2) return nodes.map((n, i) => ({ ...n, order: i }));

  const remaining = [...nodes];
  const result: MapNode[] = [];

  // Start from the first node
  let current = remaining.shift()!;
  result.push({ ...current, order: 0 });

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = Math.sqrt(
        Math.pow(current.coordinate[0] - remaining[i].coordinate[0], 2) +
        Math.pow(current.coordinate[1] - remaining[i].coordinate[1], 2)
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    current = remaining.splice(nearestIdx, 1)[0];
    result.push({ ...current, order: result.length });
  }

  return result;
}

// Simulate photo comparison (returns similarity 0-100)
export function simulatePhotoComparison(): number {
  // Simulate: 70-95% similarity range
  return Math.floor(70 + Math.random() * 25);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function generateDefaultRewards(nodeCount: number): Reward[] {
  const rewardTemplates = [
    { title: '冰淇淋一支', description: '探险辛苦啦，奖励甜甜的冰淇淋!' },
    { title: '选一个玩具', description: '可以挑选一个喜欢的小玩具' },
    { title: '多看30分钟动画', description: '今晚的动画时间加倍!' },
    { title: '去游乐场', description: '这周末去游乐场玩一天!' },
    { title: '睡前多听一个故事', description: '今晚可以多听一个睡前故事' },
    { title: '亲子烘焙时间', description: '一起做饼干或蛋糕' },
    { title: '骑车兜风', description: '一起骑车去公园兜风' },
    { title: '画画时间', description: '用新蜡笔画一幅画' },
  ];

  const shuffled = [...rewardTemplates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(nodeCount, rewardTemplates.length)).map((r, i) => ({
    id: `reward-${generateId()}-${i}`,
    title: r.title,
    description: r.description,
    isUnlocked: false,
  }));
}
