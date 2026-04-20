/**
 * Minecraft Texture Mapping — 阿三设计方案实现
 * 所有MC图片使用: image-rendering: pixelated
 */

// ─── 稀有度配置 ─────────────────────────────────────────────
export const RARITY = {
  common:    { color: '#FFFFFF', glow: '#9E9E9E', label: '普通',     shadow: '#555555' },
  uncommon:  { color: '#4CAF50', glow: '#388E3C', label: '不常见',   shadow: '#2E7D32' },
  rare:      { color: '#2196F3', glow: '#1976D2', label: '稀有',     shadow: '#1565C0' },
  epic:      { color: '#9C27B0', glow: '#7B1FA2', label: '珍稀',     shadow: '#6A1B9A' },
  legendary: { color: '#FF9800', glow: '#F57C00', label: '传说',     shadow: '#EF6C00' },
  endless:   { color: '#E91E63', glow: '#C2185B', label: '无尽',     shadow: '#AD1457', rainbow: true },
} as const;

// ─── 基础路径 ────────────────────────────────────────────────
export const MC_BLOCKS_BASE = '/mc-textures/blocks/';
export const MC_ITEMS_BASE  = '/mc-textures/items/';
export const MC_LOCAL_BASE  = '/mc/';

// ─── 方块 ID → 素材路径（blocks/）───────────────────────────
export const BLOCK_TEXTURE_MAP: Record<string, string> = {
  tnt:        'tnt_top.png',
  leaves:     'oak_leaves.png',
  pumpkin:    'carved_pumpkin.png',
  melon:      'melon_side.png',
  netherrack: 'netherrack.png',
  grass:      'grass_block_top.png',
  dirt:       'dirt.png',
  wood:       'oak_log.png',
  obsidian:   'obsidian.png',
  netherite:  'netherite_block.png',
  bedrock:    'bedrock.png',
  end:        'end_stone.png',
  iron_ingot: 'iron_block.png',
};

// ─── 工具/护甲 ID → 素材路径（items/）────────────────────────
export const ITEM_TEXTURE_MAP: Record<string, string> = {
  // 木工具
  wood_sword:     'wooden_sword.png',
  wood_shield:    'empty_armor_slot_shield.png', // 盾牌占位
  wood_axe:       'wooden_axe.png',
  wood_pickaxe:   'wooden_pickaxe.png',
  wood_hoe:       'wooden_hoe.png',
  wood_shovel:    'wooden_shovel.png',
  // 石工具
  stone_sword:    'stone_sword.png',
  stone_axe:      'stone_axe.png',
  stone_pickaxe: 'stone_pickaxe.png',
  stone_hoe:      'stone_hoe.png',
  stone_shovel:   'stone_shovel.png',
  // 铁工具
  iron_sword:     'iron_sword.png',
  iron_axe:       'iron_axe.png',
  iron_pickaxe:  'iron_pickaxe.png',
  iron_hoe:       'iron_hoe.png',
  iron_shovel:    'iron_shovel.png',
  // 钻石工具
  diamond_sword:  'diamond_sword.png',
  diamond_axe:   'diamond_axe.png',
  diamond_pickaxe:'diamond_pickaxe.png',
  diamond_hoe:   'diamond_hoe.png',
  diamond_shovel: 'diamond_shovel.png',
  // 皮革护甲
  leather_helmet: 'leather_helmet.png',
  leather_chest:  'leather_chestplate.png',
  leather_pants:  'leather_leggings.png',
  leather_boots:  'leather_boots.png',
  // 铁护甲
  iron_helmet:    'iron_helmet.png',
  iron_chest:     'iron_chestplate.png',
  iron_pants:     'iron_leggings.png',
  iron_boots:     'iron_boots.png',
  // 钻石护甲
  diamond_helmet: 'diamond_helmet.png',
  diamond_chest:  'diamond_chestplate.png',
  diamond_pants: 'diamond_leggings.png',
  diamond_boots: 'diamond_boots.png',
};

// ─── 套装代表图标 ────────────────────────────────────────────
export const SUIT_ICON_MAP: Record<string, string> = {
  wood:           'oak_log.png',
  stone:          'andesite.png',
  iron:           'iron_block.png',
  diamond_tool:   'diamond_block.png',
  leather:        'leather.png',
  iron_armor:     'iron_helmet.png',
  diamond_armor:  'diamond_helmet.png',
  netherite_suit: 'netherite_block.png',
  end_suit:       'end_stone.png',
};

// ─── 底部 Tab 图标 ───────────────────────────────────────────
export const TAB_ICON_MAP: Record<string, string> = {
  tasks:      'diamond_sword.png',
  chests:     'chest_closed.png',
  collection: 'chest_open.png',
};

// ─── Header 统计图标 ──────────────────────────────────────────
export const STAT_ICON_MAP: Record<string, string> = {
  tasks:    'paper.png',
  complete: 'emerald.png',
  chests:   'emerald_block.png',
  blocks:   'bricks.png',
};

// ─── 工具函数 ────────────────────────────────────────────────
export function getBlockTexture(blockId: string): string {
  return MC_BLOCKS_BASE + (BLOCK_TEXTURE_MAP[blockId] ?? 'diamond_block.png');
}

export function getItemTexture(itemId: string): string {
  return MC_ITEMS_BASE + (ITEM_TEXTURE_MAP[itemId] ?? 'diamond_sword.png');
}

export function getSuitTexture(suitId: string): string {
  return MC_BLOCKS_BASE + (SUIT_ICON_MAP[suitId] ?? 'diamond_block.png');
}

export function getMCImgUrl(path: string): string {
  if (path.startsWith('/mc/')) return path;
  if (path.startsWith('/mc-textures/')) return path;
  return MC_LOCAL_BASE + path;
}

export const mcImgStyle: React.CSSProperties = {
  imageRendering: 'pixelated',
};

export const mcImgStyle16: React.CSSProperties = {
  width: 16,
  height: 16,
  ...mcImgStyle,
};

export const mcImgStyle32: React.CSSProperties = {
  width: 32,
  height: 32,
  ...mcImgStyle,
};

export const mcImgStyle38: React.CSSProperties = {
  width: 38,
  height: 38,
  ...mcImgStyle,
};

export const mcImgStyle56: React.CSSProperties = {
  width: 56,
  height: 56,
  ...mcImgStyle,
};

export const mcImgStyle90: React.CSSProperties = {
  width: 90,
  height: 90,
  ...mcImgStyle,
};

// ─── 粒子配置 ────────────────────────────────────────────────
export const PARTICLE_STARS = [
  { src: `${MC_LOCAL_BASE}star_0.png`, size: 14 },
  { src: `${MC_LOCAL_BASE}star_0.png`, size: 16 },
  { src: `${MC_LOCAL_BASE}star_0.png`, size: 18 },
  { src: `${MC_LOCAL_BASE}star_0.png`, size: 20 },
];
