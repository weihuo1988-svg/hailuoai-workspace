# 我的世界任务管理器 - 方块体系升级 PRD

> Issue #7 实施方案 | 2026-05-04

---

## 核心游戏循环

```
完成任务 → 获得宝箱 → 开箱获得方块 → 消耗方块兑换道具 → 集齐道具解锁套装
```

各环节说明：

| 环节 | 说明 |
|------|------|
| 任务→宝箱 | 完成每日/每周/每月/单次任务，获得该任务配置数量的宝箱 |
| 宝箱→方块 | 每个宝箱开出1个方块，方块有5级稀有度，稀有度越高越难获得 |
| 方块→道具 | 玩家主动消耗指定类型和数量的方块，兑换单个道具（工具或护甲） |
| 道具→套装 | 当某个套装的所有道具全部兑换齐全后，玩家点击"解锁套装"按钮主动激活 |

**关键原则：**
- 方块是唯一的"货币"，只能通过开宝箱获得
- 兑换道具是主动操作，玩家在道具页面选择要兑换的道具
- 兑换会消耗（扣减）方块库存
- 套装解锁也是主动操作——集齐所有道具后，需要玩家手动点击"解锁套装"按钮，增强成就感

---

## 收藏页 Tab 结构

将原来的4个子Tab（方块/工具/套装/护甲）调整为3个：

| Tab | 内容 |
|-----|------|
| 方块 | 已拥有的方块收藏，按稀有度分组展示 |
| 道具 | 所有工具+护甲合并展示，按套装分组，带兑换操作 |
| 套装 | 套装解锁进度，显示道具收集情况 |

---

## 第一阶段：扩充方块库 + 稀有度系统（已完成）

### 稀有度定义

| 等级 | 名称 | 颜色 | 概率 |
|------|------|------|------|
| Common | 普通 | 白色 #FFFFFF | 42% |
| Uncommon | 不常见 | 绿色 #4CAF50 | 28% |
| Rare | 稀有 | 蓝色 #2196F3 | 16% |
| Epic | 珍稀 | 紫色 #9C27B0 | 9% |
| Legendary | 传说 | 橙色 #FF9800 | 4% |

### 开箱算法

```
1. 生成随机数 R (0~1)
2. 按概率阶梯判定稀有度
3. 在该稀有度方块池内，按权重加权随机抽取1个方块
```

### 方块清单

共 92 个方块，分布：Common 28种、Uncommon 30种、Rare 15种、Epic 12种、Legendary 7种。

（完整清单见附录A）

---

## 第二阶段：兑换系统 + 套装重做

### 目标

实现"方块→道具→套装"的完整兑换链路，替代当前"方块直接解锁套装"的错误逻辑。

### 2.1 材料组定义

为了让兑换配方简洁且可达成，将92个方块归类为5个**材料组**。兑换道具时消耗的是"材料组"而非单个方块——即同组内的方块可互换使用。

| 材料组 | 代表图标 | 包含方块 | 每箱掉落率 |
|--------|---------|---------|-----------|
| 木材 | oak_planks | 橡木/云杉/白桦/丛林/深橡木板 + 橡木/云杉/白桦原木（8种，全部Common） | ~14% |
| 石材 | cobblestone | 圆石、石头、安山岩、闪长岩、花岗岩、凝灰岩、方解石（7种，全部Common） | ~10% |
| 植物 | oak_leaves | 橡木/白桦/云杉树叶 + 橡木/白桦/云杉树苗（6种，全部Common） | ~7% |
| 铁锭 | iron_block | 铁矿石、铜矿石、煤矿石(Uncommon) + 铁块、铜块、煤炭块、金矿石、金块(Rare)（8种） | ~10% |
| 宝石 | diamond_block | 钻石矿石、绿宝石矿石、青金石矿石(Rare) + 钻石块、绿宝石块、青金石块(Epic)（6种） | ~7% |

**不属于任何材料组的方块**（如泥土、沙子、红砖、玻璃、下界岩等）不参与兑换，仅作为收藏展示。

> 掉落率说明：以每天开5个宝箱估算，每天约获得 木材0.7、石材0.5、植物0.35、铁锭0.5、宝石0.35 个材料。

### 2.2 材料组 → 方块ID 映射表

实现时需要在 data.ts 中定义：

```typescript
type MaterialGroup = 'wood' | 'stone' | 'plant' | 'iron' | 'gem';

const MATERIAL_GROUPS: Record<MaterialGroup, string[]> = {
  wood:  ['oak_planks','spruce_planks','birch_planks','jungle_planks','dark_oak_planks','oak_log','spruce_log','birch_log'],
  stone: ['cobblestone','stone','andesite','diorite','granite','tuff','calcite'],
  plant: ['oak_leaves','birch_leaves','spruce_leaves','oak_sapling','birch_sapling','spruce_sapling'],
  iron:  ['iron_ore','copper_ore','coal_ore','iron_block','copper_block','coal_block','gold_ore','gold_block'],
  gem:   ['diamond_ore','emerald_ore','lapis_ore','diamond_block','emerald_block','lapis_block'],
};
```

**计算玩家某材料组的可用数量**：遍历该组所有方块ID，累加 `blocks[id]` 即可。

### 2.3 道具兑换配方

每个道具有一个兑换配方，格式为 `{ materialGroup: MaterialGroup, cost: number }`。

#### 木工具套装（6件，材料：木材）

| 道具 | 材料组 | 数量 | 累计开箱约 |
|------|--------|------|-----------|
| 木剑 | 木材 | 2 | ~14箱 |
| 木盾 | 木材 | 2 | ~14箱 |
| 木斧 | 木材 | 2 | ~14箱 |
| 木镐 | 木材 | 2 | ~14箱 |
| 木锄 | 木材 | 1 | ~7箱 |
| 木铲 | 木材 | 1 | ~7箱 |

全套需 **10 木材**，约 **70 箱**（~10-14天）

#### 石工具套装（5件，材料：石材）

| 道具 | 材料组 | 数量 |
|------|--------|------|
| 石剑 | 石材 | 2 |
| 石斧 | 石材 | 2 |
| 石镐 | 石材 | 2 |
| 石锄 | 石材 | 1 |
| 石铲 | 石材 | 1 |

全套需 **8 石材**，约 **80 箱**（~11-16天）

#### 皮革护甲套装（4件，材料：植物）

| 道具 | 材料组 | 数量 |
|------|--------|------|
| 皮帽 | 植物 | 2 |
| 皮衣 | 植物 | 3 |
| 皮裤 | 植物 | 2 |
| 皮靴 | 植物 | 1 |

全套需 **8 植物**，约 **115 箱**（~16-23天）

#### 铁工具套装（5件，材料：铁锭）

| 道具 | 材料组 | 数量 |
|------|--------|------|
| 铁剑 | 铁锭 | 2 |
| 铁斧 | 铁锭 | 2 |
| 铁镐 | 铁锭 | 2 |
| 铁锄 | 铁锭 | 1 |
| 铁铲 | 铁锭 | 1 |

全套需 **8 铁锭**，约 **80 箱**（~11-16天）

#### 铁护甲套装（4件，材料：铁锭）

| 道具 | 材料组 | 数量 |
|------|--------|------|
| 铁头盔 | 铁锭 | 2 |
| 铁胸甲 | 铁锭 | 3 |
| 铁护腿 | 铁锭 | 2 |
| 铁靴 | 铁锭 | 1 |

全套需 **8 铁锭**，约 **80 箱**（~11-16天）

#### 钻石工具套装（5件，材料：宝石）

| 道具 | 材料组 | 数量 |
|------|--------|------|
| 钻石剑 | 宝石 | 2 |
| 钻石斧 | 宝石 | 2 |
| 钻石镐 | 宝石 | 2 |
| 钻石锄 | 宝石 | 1 |
| 钻石铲 | 宝石 | 1 |

全套需 **8 宝石**，约 **115 箱**（~16-23天）

#### 钻石护甲套装（4件，材料：宝石）

| 道具 | 材料组 | 数量 |
|------|--------|------|
| 钻石头盔 | 宝石 | 2 |
| 钻石胸甲 | 宝石 | 3 |
| 钻石护腿 | 宝石 | 2 |
| 钻石靴 | 宝石 | 1 |

全套需 **8 宝石**，约 **115 箱**（~16-23天）

#### 道具总览

| 套装 | 道具数 | 材料组 | 总消耗 | 预计天数(5箱/天) |
|------|--------|--------|--------|-----------------|
| 木工具 | 6 | 木材 | 10 | 10-14天 |
| 石工具 | 5 | 石材 | 8 | 11-16天 |
| 皮革护甲 | 4 | 植物 | 8 | 16-23天 |
| 铁工具 | 5 | 铁锭 | 8 | 11-16天 |
| 铁护甲 | 4 | 铁锭 | 8 | 11-16天 |
| 钻石工具 | 5 | 宝石 | 8 | 16-23天 |
| 钻石护甲 | 4 | 宝石 | 8 | 16-23天 |
| **合计** | **33** | | **58** | |

> 注意：以上数值为初始设计，上线后可根据实际使用情况调整。

### 2.4 兑换操作逻辑

```
玩家点击道具"兑换"按钮：
1. 计算玩家该材料组的可用库存（遍历组内所有方块ID，累加数量）
2. 判断库存 >= 配方所需数量
3. 扣减方块：按优先级从组内方块扣除
   - 优先扣数量最多的方块（避免某种方块被清零）
   - 或按方块列表顺序逐个扣减（更简单）
4. 标记该道具为已获得：items[itemId] = true
5. 播放道具获得反馈（通知/动画）

玩家点击套装"解锁"按钮（仅在该套装所有道具已集齐时可点击）：
1. 检查该套装 requiredItems 是否全部 items[id] === true
2. 标记套装已解锁：suits[suitId] = true
3. 播放套装解锁动画（全屏庆祝效果）
```

**方块扣减策略**（推荐简单方案）：

```typescript
function deductMaterial(blocks: Record<string, number>, group: string[], cost: number): Record<string, number> {
  const updated = { ...blocks };
  let remaining = cost;
  for (const blockId of group) {
    if (remaining <= 0) break;
    const have = updated[blockId] || 0;
    const deduct = Math.min(have, remaining);
    updated[blockId] = have - deduct;
    remaining -= deduct;
  }
  return updated;
}
```

### 2.5 套装解锁条件

**旧逻辑（删除）：**
```
blocks[suit.blockId] >= suit.blockRequired → 直接解锁套装 + 赠送所有道具
```

**新逻辑：**
```
1. 玩家在套装Tab看到某套装所有道具已集齐
2. "解锁套装"按钮变为可点击状态（高亮）
3. 玩家主动点击按钮 → 解锁套装，播放庆祝动画
4. 未集齐时按钮为灰色禁用状态，显示"还差N件"
```

套装数据重构：

```typescript
// 旧结构（删除 blockRequired / blockId）
interface SuitDef {
  id: string; name: string; blockRequired: number; blockId: string; ...
}

// 新结构
interface SuitDef {
  id: string;
  name: string;
  emoji: string;
  color: string;
  glowColor: string;
  requiredItems: string[];  // 该套装包含的所有道具ID列表
}
```

7个套装对应关系：

| 套装 | requiredItems |
|------|--------------|
| 木工具 | wood_sword, wood_shield, wood_axe, wood_pickaxe, wood_hoe, wood_shovel |
| 石工具 | stone_sword, stone_axe, stone_pickaxe, stone_hoe, stone_shovel |
| 铁工具 | iron_sword, iron_axe, iron_pickaxe, iron_hoe, iron_shovel |
| 钻石工具 | diamond_sword, diamond_axe, diamond_pickaxe, diamond_hoe, diamond_shovel |
| 皮革护甲 | leather_helmet, leather_chest, leather_pants, leather_boots |
| 铁护甲 | iron_helmet, iron_chest, iron_pants, iron_boots |
| 钻石护甲 | diamond_helmet, diamond_chest, diamond_pants, diamond_boots |

### 2.6 道具 Tab UI 设计

**布局：按套装分组展示所有道具**

```
┌─────────────────────────────────────────────┐
│ [方块]  [道具✓]  [套装]                      │  ← 子Tab切换
├─────────────────────────────────────────────┤
│                                             │
│ ⚔ 道具收藏 (已获得 5/33)                     │
│                                             │
│ ┌── 木工具套装 (3/6) ─── 木材 ×4 可用 ──────┐│
│ │ [木剑✅] [木盾✅] [木斧✅]                  ││
│ │ [木镐🔒 木材×2 兑换] [木锄🔒] [木铲🔒]     ││
│ └───────────────────────────────────────────┘│
│                                             │
│ ┌── 石工具套装 (0/5) ─── 石材 ×2 可用 ──────┐│
│ │ [石剑🔒 石材×2 兑换] [石斧🔒] ...          ││
│ └───────────────────────────────────────────┘│
│                                             │
│ ...更多套装组...                              │
│                                             │
└─────────────────────────────────────────────┘
```

每个道具卡片：
- **已获得**：高亮显示，勾选标记，道具图标正常显示
- **未获得但可兑换**：显示材料成本（绿色），"兑换"按钮可点击
- **未获得且材料不足**：灰色显示，成本数字为红色，按钮禁用

每个套装组头部：
- 套装名 + 代表图标
- 进度 (已获得/总数)
- 该组所需材料类型 + 当前可用量

### 2.7 套装 Tab UI 设计

```
┌─────────────────────────────────────────────┐
│ [方块]  [道具]  [套装✓]                      │
├─────────────────────────────────────────────┤
│                                             │
│ ┌── 木工具套装 ────────────────── 已解锁 ✅ ─┐│
│ │ [图标] 木工具套装                          ││
│ │ ✅木剑 ✅木盾 ✅木斧 ✅木镐 ✅木锄 ✅木铲  ││
│ │ ██████████████████████████████ 6/6         ││
│ └───────────────────────────────────────────┘│
│                                             │
│ ┌── 皮革护甲套装 ──────── 道具已集齐！──────┐│
│ │ [图标] 皮革护甲套装                        ││
│ │ ✅皮帽 ✅皮衣 ✅皮裤 ✅皮靴                ││
│ │ ██████████████████████████████ 4/4         ││
│ │           [ ⚔ 解锁套装 ]                  ││  ← 高亮可点击
│ └───────────────────────────────────────────┘│
│                                             │
│ ┌── 铁工具套装 ───────────────── 进行中 ────┐│
│ │ [图标] 铁工具套装                          ││
│ │ ✅铁剑 ❌铁斧 ❌铁镐 ❌铁锄 ❌铁铲         ││
│ │ ██████░░░░░░░░░░░░░░░░░░░░░░░░ 1/5        ││
│ │           [ 还差4件 ]                      ││  ← 灰色禁用
│ └───────────────────────────────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

每个套装卡片：
- 套装图标 + 名称
- 道具列表（已获得/未获得标记）
- 进度条（已获得数/总数）
- **已解锁**：金色边框 + 发光效果 + "已解锁"徽章，无按钮
- **道具已集齐但未解锁**：显示高亮的"解锁套装"按钮，点击后播放全屏庆祝动画
- **道具未集齐**：灰色"还差N件"按钮（禁用），根据进度显示不同透明度

### 2.8 数据结构变更

**AppState 变更：**

```typescript
interface AppState {
  // 保留
  blocks: Record<string, number>;   // 方块库存（兑换会扣减）
  suits: Record<string, boolean>;   // 套装解锁状态

  // 合并（tools + armors → items）
  items: Record<string, boolean>;   // 所有道具（工具+护甲）的获得状态

  // 删除
  // tools: Record<string, boolean>;  ← 合并到 items
  // armors: Record<string, boolean>; ← 合并到 items
}
```

**数据迁移**：加载旧数据时，将 `tools` 和 `armors` 合并到 `items`：
```typescript
if (state.tools || state.armors) {
  state.items = { ...state.tools, ...state.armors, ...state.items };
  delete state.tools;
  delete state.armors;
}
```

### 2.9 改动文件清单

| 文件 | 改动 |
|------|------|
| data.ts | 新增 MATERIAL_GROUPS、RECIPES、重构 SUITS（requiredItems）、合并 TOOLS+ARMORS 为 ITEMS |
| types.ts | AppState: tools+armors → items |
| mcTextures.ts | 无大改 |
| App.tsx | 删除旧 openChest 中的套装解锁逻辑；新增 craftItem() 方法 |
| CollectionPanel.tsx | 重写：3个子Tab（方块/道具/套装），道具Tab加兑换UI |
| utils.ts | loadState() 加数据迁移逻辑 |
| ChestAnimations.tsx | 道具获得动画（可选） |

---

## 第三阶段：保底机制

### 目标

防止连续大量开箱只出低稀有度方块。

### 保底规则

| 条件 | 保底 |
|------|------|
| 连续 10 次未出 Rare+ | 第 10 次强制 Rare |
| 连续 50 次未出 Epic+ | 第 50 次强制 Epic |
| 连续 100 次未出 Legendary | 第 100 次强制 Legendary |

### 数据结构

AppState 新增：

```typescript
pity: {
  sinceRare: number;
  sinceEpic: number;
  sinceLegendary: number;
}
```

### 改动文件

| 文件 | 改动 |
|------|------|
| types.ts | AppState 新增 pity |
| data.ts | drawBlock() 加保底检查 |
| utils.ts | loadState() 增加 pity 默认值 |

---

## 附录A：完整方块清单

### Common（普通）- 28 种

| 方块ID | 中文名 | 纹理文件 | 权重 | 材料组 |
|--------|--------|----------|------|--------|
| oak_planks | 橡木木板 | oak_planks.png | 3.0 | 木材 |
| spruce_planks | 云杉木板 | spruce_planks.png | 2.5 | 木材 |
| birch_planks | 白桦木板 | birch_planks.png | 2.0 | 木材 |
| jungle_planks | 丛林木板 | jungle_planks.png | 1.5 | 木材 |
| dark_oak_planks | 深橡木板 | dark_oak_planks.png | 1.5 | 木材 |
| oak_log | 橡木原木 | oak_log.png | 2.5 | 木材 |
| spruce_log | 云杉原木 | spruce_log.png | 2.0 | 木材 |
| birch_log | 白桦原木 | birch_log.png | 1.5 | 木材 |
| oak_leaves | 橡木树叶 | oak_leaves.png | 2.0 | 植物 |
| birch_leaves | 白桦树叶 | birch_leaves.png | 1.5 | 植物 |
| spruce_leaves | 云杉树叶 | spruce_leaves.png | 1.5 | 植物 |
| oak_sapling | 橡木树苗 | oak_sapling.png | 1.5 | 植物 |
| birch_sapling | 白桦树苗 | birch_sapling.png | 1.0 | 植物 |
| spruce_sapling | 云杉树苗 | spruce_sapling.png | 1.0 | 植物 |
| dirt | 泥土 | dirt.png | 3.0 | - |
| sand | 沙子 | sand.png | 2.5 | - |
| gravel | 沙砾 | gravel.png | 2.0 | - |
| cobblestone | 圆石 | cobblestone.png | 3.0 | 石材 |
| stone | 石头 | stone.png | 2.5 | 石材 |
| andesite | 安山岩 | andesite.png | 2.0 | 石材 |
| diorite | 闪长岩 | diorite.png | 1.5 | 石材 |
| granite | 花岗岩 | granite.png | 1.5 | 石材 |
| tuff | 凝灰岩 | tuff.png | 1.0 | 石材 |
| calcite | 方解石 | calcite.png | 1.0 | 石材 |
| grass_block | 草方块 | grass_block_top.png | 2.5 | - |
| brick | 红砖 | bricks.png | 1.5 | - |
| glass | 玻璃 | glass.png | 1.5 | - |
| glass_pane | 玻璃板 | glass_pane_top.png | 1.5 | - |

### Uncommon（不常见）- 30 种

| 方块ID | 中文名 | 纹理文件 | 权重 | 材料组 |
|--------|--------|----------|------|--------|
| oak_door | 橡木门 | oak_door_top.png | 2.0 | - |
| spruce_door | 云杉木门 | spruce_door_top.png | 1.5 | - |
| jungle_door | 丛林木门 | jungle_door_top.png | 1.5 | - |
| dark_oak_door | 深橡木门 | dark_oak_door_top.png | 1.5 | - |
| oak_trapdoor | 橡木活板门 | oak_trapdoor.png | 1.5 | - |
| spruce_trapdoor | 云杉活板门 | spruce_trapdoor.png | 1.5 | - |
| jungle_trapdoor | 丛林活板门 | jungle_trapdoor.png | 1.0 | - |
| dark_oak_trapdoor | 深橡木活板门 | dark_oak_trapdoor.png | 1.0 | - |
| stone_bricks | 石砖 | stone_bricks.png | 2.0 | - |
| cracked_stone_bricks | 裂纹石砖 | cracked_stone_bricks.png | 1.5 | - |
| mossy_cobblestone | 苔圆石 | mossy_cobblestone.png | 1.5 | - |
| polished_andesite | 磨制安山岩 | polished_andesite.png | 1.5 | - |
| polished_diorite | 磨制闪长岩 | polished_diorite.png | 1.0 | - |
| polished_granite | 磨制花岗岩 | polished_granite.png | 1.0 | - |
| deepslate | 深层石 | deepslate.png | 1.5 | - |
| cobbled_deepslate | 深层圆石 | cobbled_deepslate.png | 1.5 | - |
| end_stone | 末地石 | end_stone.png | 1.0 | - |
| iron_ore | 铁矿石 | iron_ore.png | 2.0 | 铁锭 |
| coal_ore | 煤矿石 | coal_ore.png | 2.5 | 铁锭 |
| copper_ore | 铜矿石 | copper_ore.png | 1.5 | 铁锭 |
| netherrack | 下界岩 | netherrack.png | 1.5 | - |
| basalt | 玄武岩 | basalt_side.png | 1.0 | - |
| blackstone | 黑石 | blackstone.png | 1.5 | - |
| glowstone | 萤石 | glowstone.png | 1.0 | - |
| soul_sand | 灵魂沙 | soul_sand.png | 1.0 | - |
| piston | 活塞 | piston_top.png | 1.5 | - |
| dropper | 发射器 | dropper_front.png | 1.0 | - |
| quartz_block | 石英块 | quartz_block_top.png | 1.5 | - |
| barrel | 木桶 | barrel_top.png | 1.0 | - |
| beehive | 蜂箱 | beehive_front.png | 1.0 | - |

### Rare（稀有）- 15 种

| 方块ID | 中文名 | 纹理文件 | 权重 | 材料组 |
|--------|--------|----------|------|--------|
| gold_ore | 金矿石 | gold_ore.png | 2.5 | 铁锭 |
| redstone_ore | 红石矿石 | redstone_ore.png | 2.5 | - |
| lapis_ore | 青金石矿石 | lapis_ore.png | 2.0 | 宝石 |
| diamond_ore | 钻石矿石 | diamond_ore.png | 1.5 | 宝石 |
| emerald_ore | 绿宝石矿石 | emerald_ore.png | 1.0 | 宝石 |
| nether_gold_ore | 下界金矿石 | nether_gold_ore.png | 1.5 | 铁锭 |
| nether_quartz_ore | 下界石英矿 | nether_quartz_ore.png | 1.5 | - |
| iron_block | 铁块 | iron_block.png | 2.0 | 铁锭 |
| gold_block | 金块 | gold_block.png | 1.5 | 铁锭 |
| copper_block | 铜块 | copper_block.png | 1.5 | 铁锭 |
| coal_block | 煤炭块 | coal_block.png | 1.5 | 铁锭 |
| comparator | 比较器 | comparator.png | 1.0 | - |
| repeater | 中继器 | repeater.png | 1.0 | - |
| sculk_sensor | 幽匿传感器 | sculk_sensor_top.png | 1.0 | - |
| note_block | 音符盒 | note_block.png | 1.0 | - |

### Epic（珍稀）- 12 种

| 方块ID | 中文名 | 纹理文件 | 权重 | 材料组 |
|--------|--------|----------|------|--------|
| diamond_block | 钻石块 | diamond_block.png | 2.0 | 宝石 |
| emerald_block | 绿宝石块 | emerald_block.png | 1.5 | 宝石 |
| lapis_block | 青金石块 | lapis_block.png | 1.5 | 宝石 |
| raw_iron_block | 粗铁块 | raw_iron_block.png | 1.0 | - |
| raw_gold_block | 粗金块 | raw_gold_block.png | 1.0 | - |
| netherite_block | 下界合金块 | netherite_block.png | 0.5 | - |
| ancient_debris | 远古残骸 | ancient_debris_side.png | 0.8 | - |
| polished_blackstone | 磨制黑石 | polished_blackstone.png | 1.5 | - |
| deepslate_bricks | 深层石砖 | deepslate_bricks.png | 1.0 | - |
| shulker_box | 潜影盒 | shulker_box.png | 1.5 | - |
| respawn_anchor | 重生锚 | respawn_anchor_top.png | 0.5 | - |
| dragon_egg | 龙蛋 | dragon_egg.png | 0.2 | - |

### Legendary（传说）- 7 种

| 方块ID | 中文名 | 纹理文件 | 权重 | 材料组 |
|--------|--------|----------|------|--------|
| ancient_debris_top | 远古残骸顶面 | ancient_debris_top.png | 1.5 | - |
| gilded_blackstone | 镀金黑石 | gilded_blackstone.png | 1.5 | - |
| crying_obsidian | 哭泣黑曜石 | crying_obsidian.png | 2.0 | - |
| elytra | 鞘翅 | items/elytra.png | 0.5 | - |
| heart_of_the_sea | 海洋之心 | items/heart_of_the_sea.png | 0.3 | - |
| nether_star | 下界之星 | items/nether_star.png | 0.5 | - |
| lodestone | 磁石 | lodestone_top.png | 0.5 | - |
