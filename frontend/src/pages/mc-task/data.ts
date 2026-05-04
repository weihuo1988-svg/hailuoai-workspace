// ─── Game Data ────────────────────────────────────────────
export interface BlockDef { id: string; name: string; emoji: string; weight: number; color: string; glowColor: string; }
export interface ToolDef { id: string; name: string; emoji: string; suitId: string; }
export interface ArmorDef { id: string; name: string; emoji: string; suitId: string; }
export interface SuitDef { id: string; name: string; emoji: string; color: string; glowColor: string; blockRequired: number; blockId: string; }
export type Frequency = 'once' | 'daily' | 'weekly' | 'monthly';

export const BLOCKS: BlockDef[] = [
  { id: 'tnt', name: 'TNT方块', emoji: '💣', weight: 350, color: '#FFCDD2', glowColor: '#E53935' },
  { id: 'leaves', name: '树叶方块', emoji: '🌿', weight: 250, color: '#C8E6C9', glowColor: '#388E3C' },
  { id: 'pumpkin', name: '南瓜方块', emoji: '🎃', weight: 200, color: '#FFE0B2', glowColor: '#F57C00' },
  { id: 'melon', name: '西瓜方块', emoji: '🍉', weight: 150, color: '#FFCDD2', glowColor: '#C62828' },
  { id: 'netherrack', name: '地狱岩方块', emoji: '🟠', weight: 100, color: '#FFCCBC', glowColor: '#BF360C' },
  { id: 'grass', name: '草方块', emoji: '🟩', weight: 80, color: '#DCEDC8', glowColor: '#4CAF50' },
  { id: 'dirt', name: '土方块', emoji: '🟫', weight: 60, color: '#D7CCC8', glowColor: '#795548' },
  { id: 'wood', name: '木方块', emoji: '🪵', weight: 40, color: '#BCAAA4', glowColor: '#8D6E63' },
  { id: 'obsidian', name: '黑曜石方块', emoji: '🖤', weight: 20, color: '#90A4AE', glowColor: '#607D8B' },
  { id: 'netherite', name: '下界合金方块', emoji: '🔵', weight: 8, color: '#BBDEFB', glowColor: '#1565C0' },
  { id: 'bedrock', name: '基岩方块', emoji: '⚫', weight: 3, color: '#455A64', glowColor: '#37474F' },
  { id: 'end', name: '无尽方块', emoji: '💎', weight: 1, color: '#E1BEE7', glowColor: '#7C4DFF' },
  { id: 'iron_ingot', name: '铁锭方块', emoji: '🔩', weight: 15, color: '#C0C0C0', glowColor: '#9E9E9E' },
];

export const TOOLS: ToolDef[] = [
  { id: 'wood_sword', name: '木剑', emoji: '🗡️', suitId: 'wood' }, { id: 'wood_shield', name: '木盾', emoji: '🛡️', suitId: 'wood' }, { id: 'wood_axe', name: '木斧', emoji: '🪓', suitId: 'wood' }, { id: 'wood_pickaxe', name: '木镐', emoji: '⛏️', suitId: 'wood' }, { id: 'wood_hoe', name: '木锄', emoji: '🔨', suitId: 'wood' }, { id: 'wood_shovel', name: '木铲', emoji: '🍃', suitId: 'wood' },
  { id: 'stone_sword', name: '石剑', emoji: '🗡️', suitId: 'stone' }, { id: 'stone_axe', name: '石斧', emoji: '🪓', suitId: 'stone' }, { id: 'stone_pickaxe', name: '石镐', emoji: '⛏️', suitId: 'stone' }, { id: 'stone_hoe', name: '石锄', emoji: '🔨', suitId: 'stone' }, { id: 'stone_shovel', name: '石铲', emoji: '🍃', suitId: 'stone' },
  { id: 'iron_sword', name: '铁剑', emoji: '🗡️', suitId: 'iron' }, { id: 'iron_axe', name: '铁斧', emoji: '🪓', suitId: 'iron' }, { id: 'iron_pickaxe', name: '铁镐', emoji: '⛏️', suitId: 'iron' }, { id: 'iron_hoe', name: '铁锄', emoji: '🔨', suitId: 'iron' }, { id: 'iron_shovel', name: '铁铲', emoji: '🍃', suitId: 'iron' },
  { id: 'diamond_sword', name: '钻石剑', emoji: '🗡️', suitId: 'diamond_tool' }, { id: 'diamond_axe', name: '钻石斧', emoji: '🪓', suitId: 'diamond_tool' }, { id: 'diamond_pickaxe', name: '钻石镐', emoji: '⛏️', suitId: 'diamond_tool' }, { id: 'diamond_hoe', name: '钻石锄', emoji: '🔨', suitId: 'diamond_tool' }, { id: 'diamond_shovel', name: '钻石铲', emoji: '🍃', suitId: 'diamond_tool' },
];

export const ARMORS: ArmorDef[] = [
  { id: 'leather_helmet', name: '皮帽', emoji: '🧢', suitId: 'leather' }, { id: 'leather_chest', name: '皮衣', emoji: '👕', suitId: 'leather' }, { id: 'leather_pants', name: '皮裤', emoji: '👖', suitId: 'leather' }, { id: 'leather_boots', name: '皮靴', emoji: '🥾', suitId: 'leather' },
  { id: 'iron_helmet', name: '铁头盔', emoji: '⛑️', suitId: 'iron_armor' }, { id: 'iron_chest', name: '铁胸甲', emoji: '🛡️', suitId: 'iron_armor' }, { id: 'iron_pants', name: '铁护腿', emoji: '👖', suitId: 'iron_armor' }, { id: 'iron_boots', name: '铁靴', emoji: '🥾', suitId: 'iron_armor' },
  { id: 'diamond_helmet', name: '钻石头盔', emoji: '💎', suitId: 'diamond_armor' }, { id: 'diamond_chest', name: '钻石胸甲', emoji: '🛡️', suitId: 'diamond_armor' }, { id: 'diamond_pants', name: '钻石护腿', emoji: '👖', suitId: 'diamond_armor' }, { id: 'diamond_boots', name: '钻石靴', emoji: '🥾', suitId: 'diamond_armor' },
];

// 修复套装命名Bug：套装所需方块改为语义一致
export const SUITS: SuitDef[] = [
  { id: 'wood', name: '木套装', emoji: '🪵', color: '#8D6E63', glowColor: '#5D4037', blockRequired: 10, blockId: 'wood' },         // 木套装需要木方块
  { id: 'stone', name: '石套装', emoji: '🪨', color: '#9E9E9E', glowColor: '#616161', blockRequired: 10, blockId: 'grass' },        // 石套装需要草方块（石头感）
  { id: 'iron', name: '铁套装', emoji: '⬜', color: '#B0BEC5', glowColor: '#78909C', blockRequired: 10, blockId: 'iron_ingot' },    // 铁套装需要铁块
  { id: 'diamond_tool', name: '钻石套装', emoji: '💠', color: '#4DD0E1', glowColor: '#00ACC1', blockRequired: 10, blockId: 'netherite' },  // 钻石套装需要下界合金块
  { id: 'leather', name: '皮革套装', emoji: '🟤', color: '#A1887F', glowColor: '#6D4C41', blockRequired: 10, blockId: 'leaves' },    // 皮革套装需要树叶方块
  { id: 'iron_armor', name: '铁护甲套装', emoji: '🛡️', color: '#90A4AE', glowColor: '#546E7A', blockRequired: 10, blockId: 'iron_ingot' }, // 铁护甲套装需要铁块
  { id: 'diamond_armor', name: '钻石护甲套装', emoji: '💎', color: '#4DD0E1', glowColor: '#00BCD4', blockRequired: 10, blockId: 'obsidian' }, // 钻石护甲套装需要黑曜石
  { id: 'netherite_suit', name: '下界合金套装', emoji: '🔥', color: '#1565C0', glowColor: '#0D47A1', blockRequired: 9, blockId: 'netherite' },  // 下界合金套装需要下界合金块
  { id: 'end_suit', name: '无尽套装', emoji: '✨', color: '#7C4DFF', glowColor: '#651FFF', blockRequired: 9, blockId: 'end' },        // 无尽套装需要末地石
];

export const TOTAL_WEIGHT = BLOCKS.reduce((s, b) => s + b.weight, 0);
export const STORAGE_KEY = 'mc-task-tool-v1';
export const DEFAULT_PIN = '123456';

export const DEFAULT_TASKS: { id: string; name: string; description: string; frequency: Frequency; monthlyLimit: number; chests: number; password: string }[] = [
  { id: 'guide_1', name: '【新手试炼】学会完成任务', description: '点击"完成了！"按钮，体验完成任务的乐趣', frequency: 'daily', monthlyLimit: 0, chests: 1, password: '123456' },
  { id: 'default_2', name: '整理书包', description: '把明天要用的书本放回书包', frequency: 'daily', monthlyLimit: 0, chests: 1, password: '123456' },
  { id: 'default_3', name: '帮忙洗碗', description: '吃完饭后帮爸爸妈妈收拾碗筷', frequency: 'daily', monthlyLimit: 0, chests: 1, password: '123456' },
];
