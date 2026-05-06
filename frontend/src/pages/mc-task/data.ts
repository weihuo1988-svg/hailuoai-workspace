// ─── Game Data ────────────────────────────────────────────
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type MaterialGroup = 'wood' | 'stone' | 'plant' | 'iron' | 'gem' | 'nether';
export interface BlockDef { id: string; name: string; rarity: Rarity; weight: number; texture: string; texturePath?: 'items'; }
export interface ItemDef { id: string; name: string; suitId: string; }
export interface Recipe { itemId: string; material: MaterialGroup; cost: number; }
export interface SuitDef { id: string; name: string; emoji: string; color: string; glowColor: string; requiredItems: string[]; }
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

// ─── 材料组（兑换系统核心）───────────────────────────────────
export const MATERIAL_GROUPS: Record<MaterialGroup, string[]> = {
  wood:  ['oak_planks','spruce_planks','birch_planks','jungle_planks','dark_oak_planks','oak_log','spruce_log','birch_log'],
  stone: ['cobblestone','stone','andesite','diorite','granite','tuff','calcite'],
  plant: ['oak_leaves','birch_leaves','spruce_leaves','oak_sapling','birch_sapling','spruce_sapling'],
  iron:  ['iron_ore','copper_ore','coal_ore','iron_block','copper_block','coal_block','gold_ore','gold_block'],
  gem:   ['diamond_ore','emerald_ore','lapis_ore','diamond_block','emerald_block','lapis_block'],
  nether:['netherite_block','ancient_debris','polished_blackstone','ancient_debris_top','gilded_blackstone'],
};

export const MATERIAL_GROUP_NAMES: Record<MaterialGroup, string> = {
  wood: '木材', stone: '石材', plant: '植物', iron: '铁锭', gem: '宝石', nether: '下界',
};

export const MATERIAL_GROUP_ICONS: Record<MaterialGroup, string> = {
  wood: 'oak_planks', stone: 'cobblestone', plant: 'oak_leaves', iron: 'iron_block', gem: 'diamond_block', nether: 'netherite_block',
};

/** 计算玩家某材料组可用库存 */
export function getMaterialCount(blocks: Record<string, number>, group: MaterialGroup): number {
  return MATERIAL_GROUPS[group].reduce((sum, id) => sum + (blocks[id] || 0), 0);
}

/** 扣减材料，返回新的 blocks 记录 */
export function deductMaterial(blocks: Record<string, number>, group: MaterialGroup, cost: number): Record<string, number> {
  const updated = { ...blocks };
  let remaining = cost;
  for (const blockId of MATERIAL_GROUPS[group]) {
    if (remaining <= 0) break;
    const have = updated[blockId] || 0;
    const deduct = Math.min(have, remaining);
    updated[blockId] = have - deduct;
    remaining -= deduct;
  }
  return updated;
}

// ─── 道具（工具 + 护甲合并）──────────────────────────────────
export const ITEMS: ItemDef[] = [
  // 木工具
  { id: 'wood_sword', name: '木剑', suitId: 'wood' },
  { id: 'wood_shield', name: '木盾', suitId: 'wood' },
  { id: 'wood_axe', name: '木斧', suitId: 'wood' },
  { id: 'wood_pickaxe', name: '木镐', suitId: 'wood' },
  { id: 'wood_hoe', name: '木锄', suitId: 'wood' },
  { id: 'wood_shovel', name: '木铲', suitId: 'wood' },
  // 石工具
  { id: 'stone_sword', name: '石剑', suitId: 'stone' },
  { id: 'stone_axe', name: '石斧', suitId: 'stone' },
  { id: 'stone_pickaxe', name: '石镐', suitId: 'stone' },
  { id: 'stone_hoe', name: '石锄', suitId: 'stone' },
  { id: 'stone_shovel', name: '石铲', suitId: 'stone' },
  // 铁工具
  { id: 'iron_sword', name: '铁剑', suitId: 'iron' },
  { id: 'iron_axe', name: '铁斧', suitId: 'iron' },
  { id: 'iron_pickaxe', name: '铁镐', suitId: 'iron' },
  { id: 'iron_hoe', name: '铁锄', suitId: 'iron' },
  { id: 'iron_shovel', name: '铁铲', suitId: 'iron' },
  // 钻石工具
  { id: 'diamond_sword', name: '钻石剑', suitId: 'diamond_tool' },
  { id: 'diamond_axe', name: '钻石斧', suitId: 'diamond_tool' },
  { id: 'diamond_pickaxe', name: '钻石镐', suitId: 'diamond_tool' },
  { id: 'diamond_hoe', name: '钻石锄', suitId: 'diamond_tool' },
  { id: 'diamond_shovel', name: '钻石铲', suitId: 'diamond_tool' },
  // 皮革护甲
  { id: 'leather_helmet', name: '皮帽', suitId: 'leather' },
  { id: 'leather_chest', name: '皮衣', suitId: 'leather' },
  { id: 'leather_pants', name: '皮裤', suitId: 'leather' },
  { id: 'leather_boots', name: '皮靴', suitId: 'leather' },
  // 铁护甲
  { id: 'iron_helmet', name: '铁头盔', suitId: 'iron_armor' },
  { id: 'iron_chest', name: '铁胸甲', suitId: 'iron_armor' },
  { id: 'iron_pants', name: '铁护腿', suitId: 'iron_armor' },
  { id: 'iron_boots', name: '铁靴', suitId: 'iron_armor' },
  // 钻石护甲
  { id: 'diamond_helmet', name: '钻石头盔', suitId: 'diamond_armor' },
  { id: 'diamond_chest', name: '钻石胸甲', suitId: 'diamond_armor' },
  { id: 'diamond_pants', name: '钻石护腿', suitId: 'diamond_armor' },
  { id: 'diamond_boots', name: '钻石靴', suitId: 'diamond_armor' },
  // 下界合金工具
  { id: 'netherite_sword', name: '下界合金剑', suitId: 'netherite_suit' },
  { id: 'netherite_axe', name: '下界合金斧', suitId: 'netherite_suit' },
  { id: 'netherite_pickaxe', name: '下界合金镐', suitId: 'netherite_suit' },
  { id: 'netherite_hoe', name: '下界合金锄', suitId: 'netherite_suit' },
  { id: 'netherite_shovel', name: '下界合金铲', suitId: 'netherite_suit' },
  // 下界合金护甲
  { id: 'netherite_helmet', name: '下界合金头盔', suitId: 'netherite_suit' },
  { id: 'netherite_chest', name: '下界合金胸甲', suitId: 'netherite_suit' },
  { id: 'netherite_pants', name: '下界合金护腿', suitId: 'netherite_suit' },
  { id: 'netherite_boots', name: '下界合金靴', suitId: 'netherite_suit' },
];

// ─── 兑换配方 ─────────────────────────────────────────────
export const RECIPES: Recipe[] = [
  // 木工具 (木材)
  { itemId: 'wood_sword', material: 'wood', cost: 2 },
  { itemId: 'wood_shield', material: 'wood', cost: 2 },
  { itemId: 'wood_axe', material: 'wood', cost: 2 },
  { itemId: 'wood_pickaxe', material: 'wood', cost: 2 },
  { itemId: 'wood_hoe', material: 'wood', cost: 1 },
  { itemId: 'wood_shovel', material: 'wood', cost: 1 },
  // 石工具 (石材)
  { itemId: 'stone_sword', material: 'stone', cost: 2 },
  { itemId: 'stone_axe', material: 'stone', cost: 2 },
  { itemId: 'stone_pickaxe', material: 'stone', cost: 2 },
  { itemId: 'stone_hoe', material: 'stone', cost: 1 },
  { itemId: 'stone_shovel', material: 'stone', cost: 1 },
  // 铁工具 (铁锭)
  { itemId: 'iron_sword', material: 'iron', cost: 2 },
  { itemId: 'iron_axe', material: 'iron', cost: 2 },
  { itemId: 'iron_pickaxe', material: 'iron', cost: 2 },
  { itemId: 'iron_hoe', material: 'iron', cost: 1 },
  { itemId: 'iron_shovel', material: 'iron', cost: 1 },
  // 钻石工具 (宝石)
  { itemId: 'diamond_sword', material: 'gem', cost: 2 },
  { itemId: 'diamond_axe', material: 'gem', cost: 2 },
  { itemId: 'diamond_pickaxe', material: 'gem', cost: 2 },
  { itemId: 'diamond_hoe', material: 'gem', cost: 1 },
  { itemId: 'diamond_shovel', material: 'gem', cost: 1 },
  // 皮革护甲 (植物)
  { itemId: 'leather_helmet', material: 'plant', cost: 2 },
  { itemId: 'leather_chest', material: 'plant', cost: 3 },
  { itemId: 'leather_pants', material: 'plant', cost: 2 },
  { itemId: 'leather_boots', material: 'plant', cost: 1 },
  // 铁护甲 (铁锭)
  { itemId: 'iron_helmet', material: 'iron', cost: 2 },
  { itemId: 'iron_chest', material: 'iron', cost: 3 },
  { itemId: 'iron_pants', material: 'iron', cost: 2 },
  { itemId: 'iron_boots', material: 'iron', cost: 1 },
  // 钻石护甲 (宝石)
  { itemId: 'diamond_helmet', material: 'gem', cost: 2 },
  { itemId: 'diamond_chest', material: 'gem', cost: 3 },
  { itemId: 'diamond_pants', material: 'gem', cost: 2 },
  { itemId: 'diamond_boots', material: 'gem', cost: 1 },
  // 下界合金工具 (下界)
  { itemId: 'netherite_sword', material: 'nether', cost: 1 },
  { itemId: 'netherite_axe', material: 'nether', cost: 1 },
  { itemId: 'netherite_pickaxe', material: 'nether', cost: 1 },
  { itemId: 'netherite_hoe', material: 'nether', cost: 1 },
  { itemId: 'netherite_shovel', material: 'nether', cost: 1 },
  // 下界合金护甲 (下界)
  { itemId: 'netherite_helmet', material: 'nether', cost: 1 },
  { itemId: 'netherite_chest', material: 'nether', cost: 1 },
  { itemId: 'netherite_pants', material: 'nether', cost: 1 },
  { itemId: 'netherite_boots', material: 'nether', cost: 1 },
];

export const RECIPE_MAP: Record<string, Recipe> = {};
for (const r of RECIPES) RECIPE_MAP[r.itemId] = r;

// ─── 套装（集齐道具 + 手动解锁）──────────────────────────────
export const SUITS: SuitDef[] = [
  { id: 'wood', name: '木工具套装', emoji: '', color: '#8D6E63', glowColor: '#5D4037', requiredItems: ['wood_sword','wood_shield','wood_axe','wood_pickaxe','wood_hoe','wood_shovel'] },
  { id: 'stone', name: '石工具套装', emoji: '', color: '#9E9E9E', glowColor: '#616161', requiredItems: ['stone_sword','stone_axe','stone_pickaxe','stone_hoe','stone_shovel'] },
  { id: 'iron', name: '铁工具套装', emoji: '', color: '#B0BEC5', glowColor: '#78909C', requiredItems: ['iron_sword','iron_axe','iron_pickaxe','iron_hoe','iron_shovel'] },
  { id: 'diamond_tool', name: '钻石工具套装', emoji: '', color: '#4DD0E1', glowColor: '#00ACC1', requiredItems: ['diamond_sword','diamond_axe','diamond_pickaxe','diamond_hoe','diamond_shovel'] },
  { id: 'leather', name: '皮革护甲套装', emoji: '', color: '#A1887F', glowColor: '#6D4C41', requiredItems: ['leather_helmet','leather_chest','leather_pants','leather_boots'] },
  { id: 'iron_armor', name: '铁护甲套装', emoji: '', color: '#90A4AE', glowColor: '#546E7A', requiredItems: ['iron_helmet','iron_chest','iron_pants','iron_boots'] },
  { id: 'diamond_armor', name: '钻石护甲套装', emoji: '', color: '#4DD0E1', glowColor: '#00BCD4', requiredItems: ['diamond_helmet','diamond_chest','diamond_pants','diamond_boots'] },
  { id: 'netherite_suit', name: '下界合金套装', emoji: '', color: '#6D4C41', glowColor: '#3E2723', requiredItems: ['netherite_sword','netherite_axe','netherite_pickaxe','netherite_hoe','netherite_shovel','netherite_helmet','netherite_chest','netherite_pants','netherite_boots'] },
];

export const STORAGE_KEY = 'mc-task-tool-v1';
export const DEFAULT_PIN = '505050';
