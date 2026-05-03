// ─── Game Data ────────────────────────────────────────────
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export interface BlockDef { id: string; name: string; rarity: Rarity; weight: number; texture: string; texturePath?: 'items'; }
export interface ToolDef { id: string; name: string; emoji: string; suitId: string; }
export interface ArmorDef { id: string; name: string; emoji: string; suitId: string; }
export interface SuitDef { id: string; name: string; emoji: string; color: string; glowColor: string; blockRequired: number; blockId: string; }
export type Frequency = 'once' | 'daily' | 'weekly' | 'monthly';

// ─── 稀有度概率 & 颜色 ──────────────────────────────────────
export const RARITY_CONFIG: Record<Rarity, { prob: number; color: string; glow: string; label: string }> = {
  common:    { prob: 0.42, color: '#FFFFFF', glow: '#9E9E9E', label: '普通' },
  uncommon:  { prob: 0.28, color: '#4CAF50', glow: '#388E3C', label: '不常见' },
  rare:      { prob: 0.16, color: '#2196F3', glow: '#1976D2', label: '稀有' },
  epic:      { prob: 0.09, color: '#9C27B0', glow: '#7B1FA2', label: '珍稀' },
  legendary: { prob: 0.04, color: '#FF9800', glow: '#F57C00', label: '传说' },
};

export const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// ─── 方块库（按稀有度分组）────────────────────────────────────
// texture 字段为 blocks/ 下文件名，texturePath='items' 则从 items/ 取

const COMMON_BLOCKS: BlockDef[] = [
  { id: 'oak_planks', name: '橡木木板', rarity: 'common', weight: 3.0, texture: 'oak_planks.png' },
  { id: 'spruce_planks', name: '云杉木板', rarity: 'common', weight: 2.5, texture: 'spruce_planks.png' },
  { id: 'birch_planks', name: '白桦木板', rarity: 'common', weight: 2.0, texture: 'birch_planks.png' },
  { id: 'jungle_planks', name: '丛林木板', rarity: 'common', weight: 1.5, texture: 'jungle_planks.png' },
  { id: 'dark_oak_planks', name: '深橡木板', rarity: 'common', weight: 1.5, texture: 'dark_oak_planks.png' },
  { id: 'oak_log', name: '橡木原木', rarity: 'common', weight: 2.5, texture: 'oak_log.png' },
  { id: 'spruce_log', name: '云杉原木', rarity: 'common', weight: 2.0, texture: 'spruce_log.png' },
  { id: 'birch_log', name: '白桦原木', rarity: 'common', weight: 1.5, texture: 'birch_log.png' },
  { id: 'oak_leaves', name: '橡木树叶', rarity: 'common', weight: 2.0, texture: 'oak_leaves.png' },
  { id: 'birch_leaves', name: '白桦树叶', rarity: 'common', weight: 1.5, texture: 'birch_leaves.png' },
  { id: 'spruce_leaves', name: '云杉树叶', rarity: 'common', weight: 1.5, texture: 'spruce_leaves.png' },
  { id: 'oak_sapling', name: '橡木树苗', rarity: 'common', weight: 1.5, texture: 'oak_sapling.png' },
  { id: 'birch_sapling', name: '白桦树苗', rarity: 'common', weight: 1.0, texture: 'birch_sapling.png' },
  { id: 'spruce_sapling', name: '云杉树苗', rarity: 'common', weight: 1.0, texture: 'spruce_sapling.png' },
  { id: 'dirt', name: '泥土', rarity: 'common', weight: 3.0, texture: 'dirt.png' },
  { id: 'sand', name: '沙子', rarity: 'common', weight: 2.5, texture: 'sand.png' },
  { id: 'gravel', name: '沙砾', rarity: 'common', weight: 2.0, texture: 'gravel.png' },
  { id: 'cobblestone', name: '圆石', rarity: 'common', weight: 3.0, texture: 'cobblestone.png' },
  { id: 'stone', name: '石头', rarity: 'common', weight: 2.5, texture: 'stone.png' },
  { id: 'andesite', name: '安山岩', rarity: 'common', weight: 2.0, texture: 'andesite.png' },
  { id: 'diorite', name: '闪长岩', rarity: 'common', weight: 1.5, texture: 'diorite.png' },
  { id: 'granite', name: '花岗岩', rarity: 'common', weight: 1.5, texture: 'granite.png' },
  { id: 'tuff', name: '凝灰岩', rarity: 'common', weight: 1.0, texture: 'tuff.png' },
  { id: 'calcite', name: '方解石', rarity: 'common', weight: 1.0, texture: 'calcite.png' },
  { id: 'grass_block', name: '草方块', rarity: 'common', weight: 2.5, texture: 'grass_block_top.png' },
  { id: 'brick', name: '红砖', rarity: 'common', weight: 1.5, texture: 'bricks.png' },
  { id: 'glass', name: '玻璃', rarity: 'common', weight: 1.5, texture: 'glass.png' },
  { id: 'glass_pane', name: '玻璃板', rarity: 'common', weight: 1.5, texture: 'glass_pane_top.png' },
];

const UNCOMMON_BLOCKS: BlockDef[] = [
  { id: 'oak_door', name: '橡木门', rarity: 'uncommon', weight: 2.0, texture: 'oak_door_top.png' },
  { id: 'spruce_door', name: '云杉木门', rarity: 'uncommon', weight: 1.5, texture: 'spruce_door_top.png' },
  { id: 'jungle_door', name: '丛林木门', rarity: 'uncommon', weight: 1.5, texture: 'jungle_door_top.png' },
  { id: 'dark_oak_door', name: '深橡木门', rarity: 'uncommon', weight: 1.5, texture: 'dark_oak_door_top.png' },
  { id: 'oak_trapdoor', name: '橡木活板门', rarity: 'uncommon', weight: 1.5, texture: 'oak_trapdoor.png' },
  { id: 'spruce_trapdoor', name: '云杉活板门', rarity: 'uncommon', weight: 1.5, texture: 'spruce_trapdoor.png' },
  { id: 'jungle_trapdoor', name: '丛林活板门', rarity: 'uncommon', weight: 1.0, texture: 'jungle_trapdoor.png' },
  { id: 'dark_oak_trapdoor', name: '深橡木活板门', rarity: 'uncommon', weight: 1.0, texture: 'dark_oak_trapdoor.png' },
  { id: 'stone_bricks', name: '石砖', rarity: 'uncommon', weight: 2.0, texture: 'stone_bricks.png' },
  { id: 'cracked_stone_bricks', name: '裂纹石砖', rarity: 'uncommon', weight: 1.5, texture: 'cracked_stone_bricks.png' },
  { id: 'mossy_cobblestone', name: '苔圆石', rarity: 'uncommon', weight: 1.5, texture: 'mossy_cobblestone.png' },
  { id: 'polished_andesite', name: '磨制安山岩', rarity: 'uncommon', weight: 1.5, texture: 'polished_andesite.png' },
  { id: 'polished_diorite', name: '磨制闪长岩', rarity: 'uncommon', weight: 1.0, texture: 'polished_diorite.png' },
  { id: 'polished_granite', name: '磨制花岗岩', rarity: 'uncommon', weight: 1.0, texture: 'polished_granite.png' },
  { id: 'deepslate', name: '深层石', rarity: 'uncommon', weight: 1.5, texture: 'deepslate.png' },
  { id: 'cobbled_deepslate', name: '深层圆石', rarity: 'uncommon', weight: 1.5, texture: 'cobbled_deepslate.png' },
  { id: 'end_stone', name: '末地石', rarity: 'uncommon', weight: 1.0, texture: 'end_stone.png' },
  { id: 'iron_ore', name: '铁矿石', rarity: 'uncommon', weight: 2.0, texture: 'iron_ore.png' },
  { id: 'coal_ore', name: '煤矿石', rarity: 'uncommon', weight: 2.5, texture: 'coal_ore.png' },
  { id: 'copper_ore', name: '铜矿石', rarity: 'uncommon', weight: 1.5, texture: 'copper_ore.png' },
  { id: 'netherrack', name: '下界岩', rarity: 'uncommon', weight: 1.5, texture: 'netherrack.png' },
  { id: 'basalt', name: '玄武岩', rarity: 'uncommon', weight: 1.0, texture: 'basalt_side.png' },
  { id: 'blackstone', name: '黑石', rarity: 'uncommon', weight: 1.5, texture: 'blackstone.png' },
  { id: 'glowstone', name: '萤石', rarity: 'uncommon', weight: 1.0, texture: 'glowstone.png' },
  { id: 'soul_sand', name: '灵魂沙', rarity: 'uncommon', weight: 1.0, texture: 'soul_sand.png' },
  { id: 'piston', name: '活塞', rarity: 'uncommon', weight: 1.5, texture: 'piston_top.png' },
  { id: 'dropper', name: '发射器', rarity: 'uncommon', weight: 1.0, texture: 'dropper_front.png' },
  { id: 'quartz_block', name: '石英块', rarity: 'uncommon', weight: 1.5, texture: 'quartz_block_top.png' },
  { id: 'barrel', name: '木桶', rarity: 'uncommon', weight: 1.0, texture: 'barrel_top.png' },
  { id: 'beehive', name: '蜂箱', rarity: 'uncommon', weight: 1.0, texture: 'beehive_front.png' },
];

const RARE_BLOCKS: BlockDef[] = [
  { id: 'gold_ore', name: '金矿石', rarity: 'rare', weight: 2.5, texture: 'gold_ore.png' },
  { id: 'redstone_ore', name: '红石矿石', rarity: 'rare', weight: 2.5, texture: 'redstone_ore.png' },
  { id: 'lapis_ore', name: '青金石矿石', rarity: 'rare', weight: 2.0, texture: 'lapis_ore.png' },
  { id: 'diamond_ore', name: '钻石矿石', rarity: 'rare', weight: 1.5, texture: 'diamond_ore.png' },
  { id: 'emerald_ore', name: '绿宝石矿石', rarity: 'rare', weight: 1.0, texture: 'emerald_ore.png' },
  { id: 'nether_gold_ore', name: '下界金矿石', rarity: 'rare', weight: 1.5, texture: 'nether_gold_ore.png' },
  { id: 'nether_quartz_ore', name: '下界石英矿', rarity: 'rare', weight: 1.5, texture: 'nether_quartz_ore.png' },
  { id: 'iron_block', name: '铁块', rarity: 'rare', weight: 2.0, texture: 'iron_block.png' },
  { id: 'gold_block', name: '金块', rarity: 'rare', weight: 1.5, texture: 'gold_block.png' },
  { id: 'copper_block', name: '铜块', rarity: 'rare', weight: 1.5, texture: 'copper_block.png' },
  { id: 'coal_block', name: '煤炭块', rarity: 'rare', weight: 1.5, texture: 'coal_block.png' },
  { id: 'comparator', name: '比较器', rarity: 'rare', weight: 1.0, texture: 'comparator.png' },
  { id: 'repeater', name: '中继器', rarity: 'rare', weight: 1.0, texture: 'repeater.png' },
  { id: 'sculk_sensor', name: '幽匿传感器', rarity: 'rare', weight: 1.0, texture: 'sculk_sensor_top.png' },
  { id: 'note_block', name: '音符盒', rarity: 'rare', weight: 1.0, texture: 'note_block.png' },
];

const EPIC_BLOCKS: BlockDef[] = [
  { id: 'diamond_block', name: '钻石块', rarity: 'epic', weight: 2.0, texture: 'diamond_block.png' },
  { id: 'emerald_block', name: '绿宝石块', rarity: 'epic', weight: 1.5, texture: 'emerald_block.png' },
  { id: 'lapis_block', name: '青金石块', rarity: 'epic', weight: 1.5, texture: 'lapis_block.png' },
  { id: 'raw_iron_block', name: '粗铁块', rarity: 'epic', weight: 1.0, texture: 'raw_iron_block.png' },
  { id: 'raw_gold_block', name: '粗金块', rarity: 'epic', weight: 1.0, texture: 'raw_gold_block.png' },
  { id: 'netherite_block', name: '下界合金块', rarity: 'epic', weight: 0.5, texture: 'netherite_block.png' },
  { id: 'ancient_debris', name: '远古残骸', rarity: 'epic', weight: 0.8, texture: 'ancient_debris_side.png' },
  { id: 'polished_blackstone', name: '磨制黑石', rarity: 'epic', weight: 1.5, texture: 'polished_blackstone.png' },
  { id: 'deepslate_bricks', name: '深层石砖', rarity: 'epic', weight: 1.0, texture: 'deepslate_bricks.png' },
  { id: 'shulker_box', name: '潜影盒', rarity: 'epic', weight: 1.5, texture: 'shulker_box.png' },
  { id: 'respawn_anchor', name: '重生锚', rarity: 'epic', weight: 0.5, texture: 'respawn_anchor_top.png' },
  { id: 'dragon_egg', name: '龙蛋', rarity: 'epic', weight: 0.2, texture: 'dragon_egg.png' },
];

const LEGENDARY_BLOCKS: BlockDef[] = [
  { id: 'ancient_debris_top', name: '远古残骸顶面', rarity: 'legendary', weight: 1.5, texture: 'ancient_debris_top.png' },
  { id: 'gilded_blackstone', name: '镀金黑石', rarity: 'legendary', weight: 1.5, texture: 'gilded_blackstone.png' },
  { id: 'crying_obsidian', name: '哭泣黑曜石', rarity: 'legendary', weight: 2.0, texture: 'crying_obsidian.png' },
  { id: 'elytra', name: '鞘翅', rarity: 'legendary', weight: 0.5, texture: 'elytra.png', texturePath: 'items' },
  { id: 'heart_of_the_sea', name: '海洋之心', rarity: 'legendary', weight: 0.3, texture: 'heart_of_the_sea.png', texturePath: 'items' },
  { id: 'nether_star', name: '下界之星', rarity: 'legendary', weight: 0.5, texture: 'nether_star.png', texturePath: 'items' },
  { id: 'lodestone', name: '磁石', rarity: 'legendary', weight: 0.5, texture: 'lodestone_top.png' },
];

// 按稀有度分组
export const BLOCKS_BY_RARITY: Record<Rarity, BlockDef[]> = {
  common: COMMON_BLOCKS,
  uncommon: UNCOMMON_BLOCKS,
  rare: RARE_BLOCKS,
  epic: EPIC_BLOCKS,
  legendary: LEGENDARY_BLOCKS,
};

// 全部方块合并（兼容旧代码引用）
export const BLOCKS: BlockDef[] = [
  ...COMMON_BLOCKS, ...UNCOMMON_BLOCKS, ...RARE_BLOCKS, ...EPIC_BLOCKS, ...LEGENDARY_BLOCKS,
];

// ─── 两步开箱算法 ──────────────────────────────────────────
export function drawBlock(): BlockDef {
  // Step 1: 按概率选择稀有度
  const r = Math.random();
  let cumulative = 0;
  let rarity: Rarity = 'common';
  for (const tier of RARITY_ORDER) {
    cumulative += RARITY_CONFIG[tier].prob;
    if (r < cumulative) { rarity = tier; break; }
  }
  // Step 2: 在该稀有度内按权重随机
  const pool = BLOCKS_BY_RARITY[rarity];
  const totalWeight = pool.reduce((s, b) => s + b.weight, 0);
  let w = Math.random() * totalWeight;
  for (const b of pool) {
    w -= b.weight;
    if (w <= 0) return b;
  }
  return pool[0];
}

// ─── 工具 & 护甲 & 套装（暂不改动，第三四阶段重做）──────────
export const TOOLS: ToolDef[] = [
  { id: 'wood_sword', name: '木剑', emoji: '', suitId: 'wood' }, { id: 'wood_shield', name: '木盾', emoji: '', suitId: 'wood' }, { id: 'wood_axe', name: '木斧', emoji: '', suitId: 'wood' }, { id: 'wood_pickaxe', name: '木镐', emoji: '', suitId: 'wood' }, { id: 'wood_hoe', name: '木锄', emoji: '', suitId: 'wood' }, { id: 'wood_shovel', name: '木铲', emoji: '', suitId: 'wood' },
  { id: 'stone_sword', name: '石剑', emoji: '', suitId: 'stone' }, { id: 'stone_axe', name: '石斧', emoji: '', suitId: 'stone' }, { id: 'stone_pickaxe', name: '石镐', emoji: '', suitId: 'stone' }, { id: 'stone_hoe', name: '石锄', emoji: '', suitId: 'stone' }, { id: 'stone_shovel', name: '石铲', emoji: '', suitId: 'stone' },
  { id: 'iron_sword', name: '铁剑', emoji: '', suitId: 'iron' }, { id: 'iron_axe', name: '铁斧', emoji: '', suitId: 'iron' }, { id: 'iron_pickaxe', name: '铁镐', emoji: '', suitId: 'iron' }, { id: 'iron_hoe', name: '铁锄', emoji: '', suitId: 'iron' }, { id: 'iron_shovel', name: '铁铲', emoji: '', suitId: 'iron' },
  { id: 'diamond_sword', name: '钻石剑', emoji: '', suitId: 'diamond_tool' }, { id: 'diamond_axe', name: '钻石斧', emoji: '', suitId: 'diamond_tool' }, { id: 'diamond_pickaxe', name: '钻石镐', emoji: '', suitId: 'diamond_tool' }, { id: 'diamond_hoe', name: '钻石锄', emoji: '', suitId: 'diamond_tool' }, { id: 'diamond_shovel', name: '钻石铲', emoji: '', suitId: 'diamond_tool' },
];

export const ARMORS: ArmorDef[] = [
  { id: 'leather_helmet', name: '皮帽', emoji: '', suitId: 'leather' }, { id: 'leather_chest', name: '皮衣', emoji: '', suitId: 'leather' }, { id: 'leather_pants', name: '皮裤', emoji: '', suitId: 'leather' }, { id: 'leather_boots', name: '皮靴', emoji: '', suitId: 'leather' },
  { id: 'iron_helmet', name: '铁头盔', emoji: '', suitId: 'iron_armor' }, { id: 'iron_chest', name: '铁胸甲', emoji: '', suitId: 'iron_armor' }, { id: 'iron_pants', name: '铁护腿', emoji: '', suitId: 'iron_armor' }, { id: 'iron_boots', name: '铁靴', emoji: '', suitId: 'iron_armor' },
  { id: 'diamond_helmet', name: '钻石头盔', emoji: '', suitId: 'diamond_armor' }, { id: 'diamond_chest', name: '钻石胸甲', emoji: '', suitId: 'diamond_armor' }, { id: 'diamond_pants', name: '钻石护腿', emoji: '', suitId: 'diamond_armor' }, { id: 'diamond_boots', name: '钻石靴', emoji: '', suitId: 'diamond_armor' },
];

export const SUITS: SuitDef[] = [
  { id: 'wood', name: '木套装', emoji: '', color: '#8D6E63', glowColor: '#5D4037', blockRequired: 10, blockId: 'oak_log' },
  { id: 'stone', name: '石套装', emoji: '', color: '#9E9E9E', glowColor: '#616161', blockRequired: 10, blockId: 'cobblestone' },
  { id: 'iron', name: '铁套装', emoji: '', color: '#B0BEC5', glowColor: '#78909C', blockRequired: 10, blockId: 'iron_block' },
  { id: 'diamond_tool', name: '钻石套装', emoji: '', color: '#4DD0E1', glowColor: '#00ACC1', blockRequired: 10, blockId: 'diamond_block' },
  { id: 'leather', name: '皮革套装', emoji: '', color: '#A1887F', glowColor: '#6D4C41', blockRequired: 10, blockId: 'oak_leaves' },
  { id: 'iron_armor', name: '铁护甲套装', emoji: '', color: '#90A4AE', glowColor: '#546E7A', blockRequired: 10, blockId: 'iron_block' },
  { id: 'diamond_armor', name: '钻石护甲套装', emoji: '', color: '#4DD0E1', glowColor: '#00BCD4', blockRequired: 10, blockId: 'diamond_block' },
  { id: 'netherite_suit', name: '下界合金套装', emoji: '', color: '#1565C0', glowColor: '#0D47A1', blockRequired: 9, blockId: 'netherite_block' },
  { id: 'end_suit', name: '无尽套装', emoji: '', color: '#7C4DFF', glowColor: '#651FFF', blockRequired: 9, blockId: 'crying_obsidian' },
];

export const TOTAL_WEIGHT = BLOCKS.reduce((s, b) => s + b.weight, 0);
export const STORAGE_KEY = 'mc-task-tool-v1';
export const DEFAULT_PIN = '123456';
