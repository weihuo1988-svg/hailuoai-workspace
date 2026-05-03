/**
 * Minecraft Texture Mapping — 阿三设计方案实现
 * 所有MC图片使用: image-rendering: pixelated
 */

import { BLOCKS } from './data';
import type { BlockDef } from './data';

// ─── 基础路径 ────────────────────────────────────────────────
export const MC_BLOCKS_BASE = '/mc-textures/blocks/';
export const MC_ITEMS_BASE  = '/mc-textures/items/';
export const MC_LOCAL_BASE  = '/mc/';

// ─── 方块 ID → 纹理路径（从 BLOCKS 数据自动生成）──────────────
const _blockTextureCache = new Map<string, BlockDef>();
for (const b of BLOCKS) _blockTextureCache.set(b.id, b);

export function getBlockTexture(blockId: string): string {
  const b = _blockTextureCache.get(blockId);
  if (!b) return MC_BLOCKS_BASE + 'diamond_block.png';
  const base = b.texturePath === 'items' ? MC_ITEMS_BASE : MC_BLOCKS_BASE;
  return base + b.texture;
}

// 兼容旧代码引用
export const BLOCK_TEXTURE_MAP: Record<string, string> = {};
for (const b of BLOCKS) BLOCK_TEXTURE_MAP[b.id] = b.texture;

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
  // 下界合金工具
  netherite_sword:   'netherite_sword.png',
  netherite_axe:     'netherite_axe.png',
  netherite_pickaxe: 'netherite_pickaxe.png',
  netherite_hoe:     'netherite_hoe.png',
  netherite_shovel:  'netherite_shovel.png',
  // 下界合金护甲
  netherite_helmet:  'netherite_helmet.png',
  netherite_chest:   'netherite_chestplate.png',
  netherite_pants:   'netherite_leggings.png',
  netherite_boots:   'netherite_boots.png',
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
  tasks:      'writable_book.png',
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
export function getItemTexture(itemId: string): string {
  return MC_ITEMS_BASE + (ITEM_TEXTURE_MAP[itemId] ?? 'diamond_sword.png');
}

const SUIT_ITEMS_PATH = new Set(['leather', 'iron_armor', 'diamond_armor']);

export function getSuitTexture(suitId: string): string {
  const base = SUIT_ITEMS_PATH.has(suitId) ? MC_ITEMS_BASE : MC_BLOCKS_BASE;
  return base + (SUIT_ICON_MAP[suitId] ?? 'diamond_block.png');
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
