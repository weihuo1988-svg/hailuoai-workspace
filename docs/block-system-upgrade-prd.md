# 我的世界任务管理器 - 方块体系升级 PRD

> Issue #7 实施方案 | 2026-05-04

---

## 总体目标

将现有 13 个方块 + 简单加权随机的系统，升级为 80+ 方块、5 级稀有度、保底机制、兑换系统、套装重做的完整游戏循环。

分 4 个阶段递进实施，每阶段独立可交付。

---

## 第一阶段：扩充方块库 + 稀有度系统

### 目标

替换现有 13 个方块为 80+ 方块，引入 5 级稀有度体系和两步开箱算法。

### 稀有度定义

| 等级 | 名称 | 颜色 | 概率 | 说明 |
|------|------|------|------|------|
| Common | 普通 | 白色 #FFFFFF | 42% | 基础建筑方块（木板、原木、泥土、石头等） |
| Uncommon | 不常见 | 绿色 #4CAF50 | 28% | 天然变种、功能方块（门、活板门、矿石、红石等） |
| Rare | 稀有 | 蓝色 #2196F3 | 16% | 矿石块、红石机械方块 |
| Epic | 珍稀 | 紫色 #9C27B0 | 9% | 钻石块、下界合金块、特殊方块 |
| Legendary | 传说 | 橙色 #FF9800 | 4% | 极稀有物品（鞘翅、龙蛋、下界之星等） |

### 方块清单

#### Common（普通）- 约 28 种

| 方块ID | 中文名 | 纹理文件 | 权重 |
|--------|--------|----------|------|
| oak_planks | 橡木木板 | oak_planks.png | 3.0 |
| spruce_planks | 云杉木板 | spruce_planks.png | 2.5 |
| birch_planks | 白桦木板 | birch_planks.png | 2.0 |
| jungle_planks | 丛林木板 | jungle_planks.png | 1.5 |
| dark_oak_planks | 深橡木板 | dark_oak_planks.png | 1.5 |
| oak_log | 橡木原木 | oak_log.png | 2.5 |
| spruce_log | 云杉原木 | spruce_log.png | 2.0 |
| birch_log | 白桦原木 | birch_log.png | 1.5 |
| oak_leaves | 橡木树叶 | oak_leaves.png | 2.0 |
| birch_leaves | 白桦树叶 | birch_leaves.png | 1.5 |
| spruce_leaves | 云杉树叶 | spruce_leaves.png | 1.5 |
| oak_sapling | 橡木树苗 | oak_sapling.png | 1.5 |
| birch_sapling | 白桦树苗 | birch_sapling.png | 1.0 |
| spruce_sapling | 云杉树苗 | spruce_sapling.png | 1.0 |
| dirt | 泥土 | dirt.png | 3.0 |
| sand | 沙子 | sand.png | 2.5 |
| gravel | 沙砾 | gravel.png | 2.0 |
| cobblestone | 圆石 | cobblestone.png | 3.0 |
| stone | 石头 | stone.png | 2.5 |
| andesite | 安山岩 | andesite.png | 2.0 |
| diorite | 闪长岩 | diorite.png | 1.5 |
| granite | 花岗岩 | granite.png | 1.5 |
| tuff | 凝灰岩 | tuff.png | 1.0 |
| calcite | 方解石 | calcite.png | 1.0 |
| grass_block | 草方块 | grass_block_top.png | 2.5 |
| brick | 红砖 | bricks.png | 1.5 |
| glass | 玻璃 | glass.png | 1.5 |
| glass_pane | 玻璃板 | glass_pane_top.png | 1.5 |

#### Uncommon（不常见）- 约 30 种

| 方块ID | 中文名 | 纹理文件 | 权重 |
|--------|--------|----------|------|
| oak_door | 橡木门 | oak_door_top.png | 2.0 |
| spruce_door | 云杉木门 | spruce_door_top.png | 1.5 |
| jungle_door | 丛林木门 | jungle_door_top.png | 1.5 |
| dark_oak_door | 深橡木门 | dark_oak_door_top.png | 1.5 |
| oak_trapdoor | 橡木活板门 | oak_trapdoor.png | 1.5 |
| spruce_trapdoor | 云杉活板门 | spruce_trapdoor.png | 1.5 |
| jungle_trapdoor | 丛林活板门 | jungle_trapdoor.png | 1.0 |
| dark_oak_trapdoor | 深橡木活板门 | dark_oak_trapdoor.png | 1.0 |
| stone_bricks | 石砖 | stone_bricks.png | 2.0 |
| cracked_stone_bricks | 裂纹石砖 | cracked_stone_bricks.png | 1.5 |
| mossy_cobblestone | 苔圆石 | mossy_cobblestone.png | 1.5 |
| polished_andesite | 磨制安山岩 | polished_andesite.png | 1.5 |
| polished_diorite | 磨制闪长岩 | polished_diorite.png | 1.0 |
| polished_granite | 磨制花岗岩 | polished_granite.png | 1.0 |
| deepslate | 深层石 | deepslate.png | 1.5 |
| cobbled_deepslate | 深层圆石 | cobbled_deepslate.png | 1.5 |
| end_stone | 末地石 | end_stone.png | 1.0 |
| iron_ore | 铁矿石 | iron_ore.png | 2.0 |
| coal_ore | 煤矿石 | coal_ore.png | 2.5 |
| copper_ore | 铜矿石 | copper_ore.png | 1.5 |
| netherrack | 下界岩 | netherrack.png | 1.5 |
| basalt | 玄武岩 | basalt_side.png | 1.0 |
| blackstone | 黑石 | blackstone.png | 1.5 |
| glowstone | 萤石 | glowstone.png | 1.0 |
| soul_sand | 灵魂沙 | soul_sand.png | 1.0 |
| piston | 活塞 | piston_top.png | 1.5 |
| dropper | 发射器 | dropper_front.png | 1.0 |
| quartz_block | 石英块 | quartz_block_top.png | 1.5 |
| barrel | 木桶 | barrel_top.png | 1.0 |
| beehive | 蜂箱 | beehive_front.png | 1.0 |

#### Rare（稀有）- 约 15 种

| 方块ID | 中文名 | 纹理文件 | 权重 |
|--------|--------|----------|------|
| gold_ore | 金矿石 | gold_ore.png | 2.5 |
| redstone_ore | 红石矿石 | redstone_ore.png | 2.5 |
| lapis_ore | 青金石矿石 | lapis_ore.png | 2.0 |
| diamond_ore | 钻石矿石 | diamond_ore.png | 1.5 |
| emerald_ore | 绿宝石矿石 | emerald_ore.png | 1.0 |
| nether_gold_ore | 下界金矿石 | nether_gold_ore.png | 1.5 |
| nether_quartz_ore | 下界石英矿 | nether_quartz_ore.png | 1.5 |
| iron_block | 铁块 | iron_block.png | 2.0 |
| gold_block | 金块 | gold_block.png | 1.5 |
| copper_block | 铜块 | copper_block.png | 1.5 |
| coal_block | 煤炭块 | coal_block.png | 1.5 |
| comparator | 比较器 | comparator.png | 1.0 |
| repeater | 中继器 | repeater.png | 1.0 |
| sculk_sensor | 幽匿传感器 | sculk_sensor_top.png | 1.0 |
| note_block | 音符盒 | note_block.png | 1.0 |

#### Epic（珍稀）- 约 12 种

| 方块ID | 中文名 | 纹理文件 | 权重 |
|--------|--------|----------|------|
| diamond_block | 钻石块 | diamond_block.png | 2.0 |
| emerald_block | 绿宝石块 | emerald_block.png | 1.5 |
| lapis_block | 青金石块 | lapis_block.png | 1.5 |
| raw_iron_block | 粗铁块 | raw_iron_block.png | 1.0 |
| raw_gold_block | 粗金块 | raw_gold_block.png | 1.0 |
| netherite_block | 下界合金块 | netherite_block.png | 0.5 |
| ancient_debris | 远古残骸 | ancient_debris_side.png | 0.8 |
| polished_blackstone | 磨制黑石 | polished_blackstone.png | 1.5 |
| deepslate_bricks | 深层石砖 | deepslate_bricks.png | 1.0 |
| shulker_box | 潜影盒 | shulker_box.png | 1.5 |
| respawn_anchor | 重生锚 | respawn_anchor_top.png | 0.5 |
| dragon_egg | 龙蛋 | dragon_egg.png | 0.2 |

#### Legendary（传说）- 约 7 种

| 方块ID | 中文名 | 纹理文件(blocks/或items/) | 权重 |
|--------|--------|--------------------------|------|
| ancient_debris_top | 远古残骸顶面 | ancient_debris_top.png | 1.5 |
| gilded_blackstone | 镀金黑石 | gilded_blackstone.png | 1.5 |
| crying_obsidian | 哭泣黑曜石 | crying_obsidian.png | 2.0 |
| elytra | 鞘翅 | items/elytra.png | 0.5 |
| heart_of_the_sea | 海洋之心 | items/heart_of_the_sea.png | 0.3 |
| nether_star | 下界之星 | items/nether_star.png | 0.5 |
| lodestone | 磁石 | lodestone_top.png | 0.5 |

> 注：Legendary 中 elytra/heart_of_the_sea/nether_star 使用 items/ 路径，其余使用 blocks/ 路径。

### 开箱算法

```
1. 生成 0~100 随机数 R
2. 判定稀有度：
   R < 42  → Common
   R < 70  → Uncommon
   R < 86  → Rare
   R < 95  → Epic
   R >= 95 → Legendary
3. 在该稀有度方块列表内，按权重加权随机抽取
```

### 改动文件

| 文件 | 改动 |
|------|------|
| data.ts | 重写 BLOCKS 为 5 组分稀有度数组，新增 Rarity 类型 |
| mcTextures.ts | BLOCK_TEXTURE_MAP 扩充所有新方块 |
| App.tsx | drawBlock() 改为两步算法 |
| CollectionPanel.tsx | 方块展示按稀有度分组，带颜色标识 |

### 兼容性

- AppState.blocks 字段（Record<string, number>）不变，新方块 ID 自动兼容
- 旧数据中的 13 个老方块 ID 将被移除，已收集的老方块数量保留在 state 中但不再展示（不影响使用）
- 套装解锁逻辑暂不改动（第四阶段处理）

---

## 第二阶段：保底机制

### 目标

防止玩家连续大量开箱只出低稀有度方块，增加保底兜底。

### 保底规则

| 条件 | 保底 |
|------|------|
| 连续 10 次未出 Rare 或更高 | 第 10 次强制提升为 Rare |
| 连续 50 次未出 Epic 或更高 | 第 50 次强制提升为 Epic |
| 连续 100 次未出 Legendary | 第 100 次强制提升为 Legendary |

### 数据结构

AppState 新增：

```typescript
pity: {
  sinceRare: number;      // 距上次 Rare+ 的连续开箱次数
  sinceEpic: number;      // 距上次 Epic+ 的连续开箱次数
  sinceLegendary: number; // 距上次 Legendary 的连续开箱次数
}
```

### 算法修改

```
1. 正常两步随机得到稀有度 R
2. 检查保底计数器：
   if sinceLegendary >= 99 → R = Legendary
   else if sinceEpic >= 49 → R = Epic
   else if sinceRare >= 9  → R = Rare
3. 按 R 抽取方块
4. 更新计数器：
   if R >= Rare      → sinceRare = 0
   if R >= Epic       → sinceEpic = 0
   if R == Legendary → sinceLegendary = 0
   否则各计数器 +1
```

### 改动文件

| 文件 | 改动 |
|------|------|
| types.ts | AppState 新增 pity 字段 |
| App.tsx | drawBlock() 加入保底检查逻辑 |
| utils.ts | loadState() 增加 pity 默认值 |

---

## 第三阶段：简化版兑换系统

### 目标

用宝箱开出的方块兑换道具（工具/护甲/特殊物品），取代当前"攒方块自动解锁"的机制。

### 设计原则

1. **只使用宝箱能开出的方块做原料** — 不引入任何宝箱外的材料
2. **配方简单直观** — 每个道具 1~3 种方块原料，总数量合理
3. **兑换是主动操作** — 玩家在兑换页面手动选择要兑换的道具

### 道具兑换配方

#### 工具类

| 道具 | 所需方块 | 说明 |
|------|---------|------|
| 木剑 | 橡木木板 x5 | 基础武器 |
| 木斧 | 橡木木板 x5 + 橡木原木 x2 | 基础工具 |
| 木镐 | 橡木木板 x5 + 橡木原木 x2 | 基础工具 |
| 木锄 | 橡木木板 x3 + 橡木原木 x2 | 基础工具 |
| 木铲 | 橡木木板 x3 + 橡木原木 x1 | 基础工具 |
| 石剑 | 圆石 x5 + 石头 x3 | 进阶武器 |
| 石斧 | 圆石 x5 + 石头 x3 | 进阶工具 |
| 石镐 | 圆石 x5 + 石头 x3 | 进阶工具 |
| 石锄 | 圆石 x3 + 石头 x2 | 进阶工具 |
| 石铲 | 圆石 x3 + 石头 x1 | 进阶工具 |
| 铁剑 | 铁块 x3 + 煤炭块 x2 | 稀有武器 |
| 铁斧 | 铁块 x3 + 煤炭块 x2 | 稀有工具 |
| 铁镐 | 铁块 x3 + 煤炭块 x2 | 稀有工具 |
| 铁锄 | 铁块 x2 + 煤炭块 x1 | 稀有工具 |
| 铁铲 | 铁块 x2 + 煤炭块 x1 | 稀有工具 |
| 钻石剑 | 钻石块 x3 + 绿宝石块 x2 | 珍稀武器 |
| 钻石斧 | 钻石块 x3 + 绿宝石块 x2 | 珍稀工具 |
| 钻石镐 | 钻石块 x3 + 绿宝石块 x2 | 珍稀工具 |
| 钻石锄 | 钻石块 x2 + 绿宝石块 x1 | 珍稀工具 |
| 钻石铲 | 钻石块 x2 + 绿宝石块 x1 | 珍稀工具 |

#### 护甲类

| 道具 | 所需方块 | 说明 |
|------|---------|------|
| 皮帽 | 橡木树叶 x8 | 基础护甲 |
| 皮衣 | 橡木树叶 x12 | 基础护甲 |
| 皮裤 | 橡木树叶 x10 | 基础护甲 |
| 皮靴 | 橡木树叶 x6 | 基础护甲 |
| 铁头盔 | 铁块 x5 | 进阶护甲 |
| 铁胸甲 | 铁块 x8 | 进阶护甲 |
| 铁护腿 | 铁块 x7 | 进阶护甲 |
| 铁靴 | 铁块 x4 | 进阶护甲 |
| 钻石头盔 | 钻石块 x5 | 高级护甲 |
| 钻石胸甲 | 钻石块 x8 | 高级护甲 |
| 钻石护腿 | 钻石块 x7 | 高级护甲 |
| 钻石靴 | 钻石块 x4 | 高级护甲 |

### UI

- 收藏页内新增"兑换"子 Tab
- 每个道具卡片显示：图标、名称、所需原料及当前持有量、可否兑换
- 兑换按钮点击后扣除方块、获得道具，播放获得动画

### 改动文件

| 文件 | 改动 |
|------|------|
| data.ts | 新增 RECIPES: Recipe[] 兑换配方数据 |
| types.ts | 无变化（tools/armors 已是 Record<string, boolean>） |
| App.tsx | 新增 craftItem() 方法 |
| CollectionPanel.tsx | 新增"兑换"子 Tab + 兑换卡片 UI |

---

## 第四阶段：套装体系重做

### 目标

将当前"攒 N 个方块自动解锁"改为"集齐该套全部道具后激活"，增加收集成就感。

### 套装定义

| 套装 | 包含道具 | 激活奖励 |
|------|---------|---------|
| 木器套装 | 木剑+木斧+木镐+木锄+木铲 | "木匠"称号 |
| 石器套装 | 石剑+石斧+石镐+石锄+石铲 | "矿工"称号 |
| 铁器套装 | 铁剑+铁斧+铁镐+铁锄+铁铲 | "铁匠"称号 |
| 钻石套装 | 钻石剑+钻石斧+钻石镐+钻石锄+钻石铲 | "钻石大师"称号 |
| 皮革套装 | 皮帽+皮衣+皮裤+皮靴 | "冒险家"称号 |
| 铁甲套装 | 铁头盔+铁胸甲+铁护腿+铁靴 | "铁卫"称号 |
| 钻石甲套装 | 钻石头盔+钻石胸甲+钻石护腿+钻石靴 | "钻石守护者"称号 |

### 激活逻辑

```
套装激活条件 = 该套装所有关联道具已兑换（tools[id] === true / armors[id] === true）
```

- 不再需要方块数量门槛
- 套装 SUITS 数据重构：移除 blockRequired/blockId，改为 requiredItems: string[]
- 自动检测：每次兑换道具后检查是否触发套装激活

### 称号系统

- AppState 新增 `titles: string[]` 记录已获得称号
- 个人信息区域展示当前称号

### 改动文件

| 文件 | 改动 |
|------|------|
| data.ts | SUITS 重构为 requiredItems 模式 |
| types.ts | AppState 新增 titles 字段 |
| App.tsx | 移除旧 suit unlock 逻辑，改为道具触发检查 |
| CollectionPanel.tsx | 套装展示改为道具收集进度 + 称号 |
| ChestAnimations.tsx | 套装激活动画保留复用 |

---

## 素材状态

929 个方块纹理 + 582 个物品纹理已在 `frontend/public/mc-textures/` 下。

已确认缺失（6 个，可用替代或后续补充）：

| 缺失文件 | 替代方案 |
|----------|---------|
| oak_slab.png | 不使用该方块 |
| oak_fence.png | 不使用该方块 |
| oak_fence_gate.png | 不使用该方块 |
| tall_grass.png | 不使用该方块 |
| sticky_piston_top.png | 不使用该方块 |
| bell.png (blocks/) | 不使用该方块 |
| ender_chest_front.png | 不使用该方块 |

以上方块已从清单中剔除，所有列入清单的方块均已确认纹理存在。
