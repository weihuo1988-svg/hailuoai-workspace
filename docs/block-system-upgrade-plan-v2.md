---
AIGC:
    ContentProducer: Minimax Agent AI
    ContentPropagator: Minimax Agent AI
    Label: AIGC
    ProduceID: 02c57710d695b290a5b494e9094a367d
    PropagateID: 02c57710d695b290a5b494e9094a367d
    ReservedCode1: 304402206c0c2b70f6e6be8f5656453383a028b61abba2969ae4fb397c783aa65c67f46b022048308292f772ffa8dc630863c8cc1caa597e76dca5a685e85e8a27e8b8bd9b3e
    ReservedCode2: 304402205c31419fc413888881502fef97c1e9fe1988aa272e7e6bf2cd0d04d41a5536e002200d479a799d752ac79006cc75be2ed88c8ccf617008f57d1200d55f07384f61f0
---

# 我的世界任务管理器 · 方块体系完善方案
> 审核版 v2 · 2026-05-01
> 制定人：哈哈（主助理）

---

## 一、素材补全计划

### 1.1 现有素材清点

| 类别 | 现有数量 | 说明 |
|------|----------|------|
| 方块纹理（blocks/） | 929 个 PNG | 基础够用，仍有缺口 |
| 物品纹理（items/） | 452 个 PNG | 工具/护甲较全 |

---

### 1.2 缺失素材清单（需阿三按风格设计出图）

以下方块在 `mc-task-app/mc-textures/` 中不存在，需由 **阿三（UI设计师）** 按现有像素风格设计：

#### P0 · 核心缺失（影响基本功能）

| 方块ID | 中文名称 | 设计说明 |
|--------|---------|---------|
| oak_door | 橡木门 | 正面全图，16×16像素 |
| spruce_door | 云杉木门 | 同上风格 |
| jungle_door | 丛林木门 | 同上风格 |
| dark_oak_door | 深橡木门 | 同上风格 |
| oak_trapdoor | 橡木活板门 | 俯视角度，16×16像素 |
| spruce_trapdoor | 云杉木活板门 | 同上 |
| jungle_trapdoor | 丛林木活板门 | 同上 |
| dark_oak_trapdoor | 深橡木活板门 | 同上 |
| farmland | 耕地 | 正面，泥土+作物痕迹 |
| tall_grass | 高草 | 正面全图，区别于短草 |
| piston | 活塞 | 正面，活塞头伸出状态 |
| sticky_piston | 粘性活塞 | 正面，活塞头有史莱姆黏液 |
| dropper | 发射器 | 正面，漏斗朝下 |
| dispenser | 投掷器 | 正面，箭头朝外 |
| hopper | 漏斗 | 俯视，漏斗口敞开 |
| daylight_detector | 阳光探测器 | 俯视，晶体感光面板 |

#### P1 · 重要缺失（丰富兑换内容）

| 方块ID | 中文名称 | 设计说明 |
|--------|---------|---------|
| stone_stairs | 石楼梯 | 正面，阶梯视角 |
| cobblestone_stairs | 圆石楼梯 | 同上 |
| stone_bricks | 石砖 | 正面，4格纹理 |
| cracked_stone_bricks | 裂纹石砖 | 同上 |
| mossy_cobblestone | 苔圆石 | 圆石+苔藓纹理 |
| polished_andesite | 磨制安山岩 | 光面，安山岩材质 |
| polished_diorite | 磨制闪长岩 | 同上 |
| polished_granite | 磨制花岗岩 | 同上 |
| cobbled_deepslate_stairs | 深层圆石楼梯 | 深板岩阶梯风格 |
| deepslate_bricks | 深层石砖 | 深板岩砖纹理 |
| polished_deepslate | 磨制深层石 | 光面深板岩 |
| blackstone | 黑石 | 深灰黑，正面 |
| polished_blackstone | 磨制黑石 | 光面黑石 |
| polished_blackstone_bricks | 磨制黑石砖 | 深色石砖 |
| cracked_polished_blackstone_bricks | 裂纹磨制黑石砖 | 同上 |
| netherrack | 下界岩 | 已有？从确认 |
| basalt | 玄武岩 | 已有？从确认 |
| glowstone | 萤石 | 正面，发光感 |
| soul_sand | 灵魂沙 | 俯视，骷髅纹理 |
| ancient_debris | 远古残骸 | 侧+顶面，残骸质感 |
| shulker_box | 潜影盒 | 正面，打开状态 |
| ender_chest | 末影箱 | 正面，紫黑色 |
| note_block | 音符盒 | 俯视，琴键面板 |
| composter | 堆肥桶 | 正面，木桶+叶柄 |
| lectern | 讲台 | 正面，书架台 |
| cartography_table | 制图台 | 俯视，羊皮纸 |
| smithing_table | 锻造台 | 俯视，铁砧图标 |
| fletching_table | 弓箭台 | 俯视，弓箭头 |
| loom | 织布机 | 俯视，竖纹 |
| grindstone | 砂轮 | 正面，石轮+柄 |
| stonecutter | 切石机 | 俯视，锯片 |
| smoker | 烟熏炉 | 正面，烟囱炉 |
| beacon | 信标 | 俯视，蓝色光柱 |
| conduit | 潮涌核心 | 俯视，海浪符文 |
| end_crystal | 末影水晶 | 正面，粉色水晶 |
| dragon_egg | 龙蛋 | 正面，紫色龙蛋 |
| respawn_anchor | 重生锚 | 正面，紫黑方块+蜡烛 |
| nether_portal_frame | 下界传送门框架 | 俯视，玄武岩框架 |
| bell | 钟 | 正面，金色钟 |
| lightning_rod | 引雷针 | 俯视，铜棒 |
| sculk_sensor | 幽匿传感器 | 俯视，幽匿触须 |
| sculk_catalyst | 幽匿催发体 | 俯视，紫水晶簇 |
| sculk_shrieker | 幽匿啸声者 | 俯视，尖叫图案 |
| comparator | 比较器 | 俯视，红石比较器 |
| repeater | 中继器 | 俯视，红石中继器 |
| observer | 观察者 | 正面，侦测器 |

#### P2 · 变体补全（完善变体系列）

| 类别 | 缺失变体 |
|------|---------|
| 各木头栅栏门（oak/spruce/jungle/dark_oak/acacia） | 5种 |
| 各木头告示牌（oak/spruce/jungle/dark_oak） | 4种 |
| 各木头按钮（全部木头种类） | 6种 |
| 各木头压力板（全部木头种类） | 6种 |
| 石砖楼梯/台阶/墙 | 各1种 |
| 下界砖楼梯/台阶/栅栏 | 各1种 |
| 黑石楼梯/台阶/墙 | 各1种 |
| wheat/carrots/potatoes/beetroots 各生长阶段 | 4×4=16种 |
| 可可果各阶段 | 3种 |

---

### 1.3 素材来源

| 来源 | 覆盖范围 |
|------|---------|
| Minecraft 官方 Wiki / 社区资源 | 基础大方块纹理（可用现有CDN下载） |
| 阿三（UI设计师）设计出图 | P0+P1约60~80张，按像素风格定制 |

---

## 二、核心逻辑（v2 最终版）

### 2.1 游戏循环

```
完成任务
    ↓
获得任务设定的宝箱数量（如：1个 / 3个）
    ↓
开启宝箱 → 随机获得方块（按稀有度概率）
    ↓
方块进入收藏
    ↓
攒够指定方块 → 兑换道具
    ↓
集齐套装所需全部道具 → 激活套装
```

**全程只有「方块数量」一个度量，无积分，无付费，无冷却。**

---

## 三、宝箱概率体系

### 3.1 稀有度概率

| 稀有度 | 颜色 | 概率 | 说明 |
|--------|------|------|------|
| 普通 Common | 白色 | 42% | 基础建筑方块 |
| 不常见 Uncommon | 绿色 | 28% | 天然变种、石头系 |
| 稀有 Rare | 蓝色 | 16% | 矿石、有价值资源 |
| 珍稀 Epic | 紫色 | 9% | 红石功能方块、复杂机制 |
| 传说 Legendary | 橙色 | 4% | 钻石块、下界合金等 |

### 3.2 方块清单（按稀有度）

#### ★ 普通（Common）42% — 权重合计约 100

| 方块ID | 中文名称 | 权重 |
|--------|---------|------|
| oak_planks | 橡木木板 | 3.0 |
| spruce_planks | 云杉木板 | 2.5 |
| birch_planks | 白桦木板 | 2.0 |
| jungle_planks | 丛林木板 | 1.5 |
| dark_oak_planks | 深橡木板 | 1.5 |
| oak_log | 橡木原木 | 2.5 |
| spruce_log | 云杉原木 | 2.0 |
| birch_log | 白桦原木 | 1.5 |
| oak_leaves | 橡木树叶 | 2.0 |
| birch_leaves | 白桦树叶 | 1.5 |
| spruce_leaves | 云杉树叶 | 1.5 |
| oak_sapling | 橡木树苗 | 1.5 |
| birch_sapling | 白桦树苗 | 1.0 |
| spruce_sapling | 云杉树苗 | 1.0 |
| dirt | 泥土 | 3.0 |
| sand | 沙子 | 2.5 |
| gravel | 沙砾 | 2.0 |
| cobblestone | 圆石 | 3.0 |
| stone | 石头 | 2.5 |
| andesite | 安山岩 | 2.0 |
| diorite | 闪长岩 | 1.5 |
| granite | 花岗岩 | 1.5 |
| tuff | 凝灰岩 | 1.0 |
| calcite | 方解石 | 1.0 |
| grass_block | 草方块 | 2.5 |
| oak_slab | 橡木台阶 | 1.5 |
| stone_slab | 石台阶 | 1.5 |
| brick | 红砖 | 1.5 |
| oak_fence | 橡木栅栏 | 1.5 |
| oak_fence_gate | 橡木栅栏门 | 1.0 |
| glass | 玻璃 | 1.5 |
| glass_pane | 玻璃板 | 1.5 |

#### ★ 不常见（Uncommon）28% — 权重合计约 100

| 方块ID | 中文名称 | 权重 |
|--------|---------|------|
| oak_door | 橡木门 | 2.0 |
| spruce_door | 云杉木门 | 1.5 |
| jungle_door | 丛林木门 | 1.5 |
| dark_oak_door | 深橡木门 | 1.5 |
| oak_trapdoor | 橡木活板门 | 1.5 |
| spruce_trapdoor | 云杉木活板门 | 1.5 |
| jungle_trapdoor | 丛林木活板门 | 1.0 |
| dark_oak_trapdoor | 深橡木活板门 | 1.0 |
| stone_stairs | 石楼梯 | 1.5 |
| cobblestone_stairs | 圆石楼梯 | 1.5 |
| stone_bricks | 石砖 | 2.0 |
| cracked_stone_bricks | 裂纹石砖 | 1.5 |
| polished_andesite | 磨制安山岩 | 1.5 |
| polished_diorite | 磨制闪长岩 | 1.0 |
| polished_granite | 磨制花岗岩 | 1.0 |
| mossy_cobblestone | 苔圆石 | 1.5 |
| mossy_stone_bricks | 苔石砖 | 1.0 |
| deepslate | 深层石 | 1.5 |
| cobbled_deepslate | 深层圆石 | 1.5 |
| end_stone | 末地石 | 1.0 |
| iron_ore | 铁矿石 | 2.0 |
| coal_ore | 煤矿石 | 2.5 |
| copper_ore | 铜矿石 | 1.5 |
| quartz_block | 石英块 | 1.5 |
| netherrack | 下界岩 | 1.5 |
| basalt | 玄武岩 | 1.0 |
| blackstone | 黑石 | 1.5 |
| glowstone | 萤石 | 1.0 |
| soul_sand | 灵魂沙 | 1.0 |
| piston | 活塞 | 1.5 |
| sticky_piston | 粘性活塞 | 1.0 |
| dropper | 发射器 | 1.0 |
| hopper | 漏斗 | 1.0 |
| beacon | 信标 | 0.5 |
| smoker | 烟熏炉 | 1.0 |
| barrel | 木桶 | 1.0 |
| beehive | 蜂箱 | 1.0 |
| composter | 堆肥桶 | 1.0 |
| lectern | 讲台 | 1.0 |
| loom | 织布机 | 1.0 |
| grindstone | 砂轮 | 1.0 |
| bell | 钟 | 1.0 |
| farmland | 耕地 | 1.5 |
| tall_grass | 高草 | 1.0 |
| beetroots_stage0~3 | 甜菜根各阶段 | 各0.5 |
| wheat_stage0~6 | 小麦各阶段 | 各0.5 |
| carrots_stage0~3 | 胡萝卜各阶段 | 各0.5 |
| potatoes_stage0~3 | 土豆各阶段 | 各0.5 |

#### ★ 稀有（Rare）16% — 权重合计约 100

| 方块ID | 中文名称 | 权重 |
|--------|---------|------|
| gold_ore | 金矿石 | 2.5 |
| redstone_ore | 红石矿石 | 2.5 |
| lapis_ore | 青金石矿石 | 2.0 |
| diamond_ore | 钻石矿石 | 1.5 |
| emerald_ore | 绿宝石矿石 | 1.0 |
| nether_gold_ore | 下界金矿石 | 1.5 |
| nether_quartz_ore | 下界石英矿石 | 1.5 |
| deepslate_gold_ore | 深层金矿石 | 1.0 |
| deepslate_diamond_ore | 深层钻石矿石 | 0.8 |
| iron_block | 铁块 | 2.0 |
| gold_block | 金块 | 1.5 |
| copper_block | 铜块 | 1.5 |
| coal_block | 煤炭块 | 1.5 |
| daylight_detector | 阳光探测器 | 1.0 |
| comparator | 比较器 | 1.0 |
| repeater | 中继器 | 1.0 |
| observer | 观察者 | 1.0 |
| sculk_sensor | 幽匿传感器 | 1.0 |
| sculk_catalyst | 幽匿催发体 | 0.8 |
| sculk_shrieker | 幽匿啸声者 | 0.8 |
| conduit | 潮涌核心 | 0.5 |
| ender_chest | 末影箱 | 0.5 |
| note_block | 音符盒 | 1.0 |

#### ★ 珍稀（Epic）9% — 权重合计约 100

| 方块ID | 中文名称 | 权重 |
|--------|---------|------|
| diamond_block | 钻石块 | 2.0 |
| emerald_block | 绿宝石块 | 1.5 |
| lapis_block | 青金石块 | 1.5 |
| raw_iron_block | 粗铁块 | 1.0 |
| raw_gold_block | 粗金块 | 1.0 |
| raw_copper_block | 粗铜块 | 1.0 |
| block_of_netherite | 下界合金块 | 0.5 |
| ancient_debris | 远古残骸 | 0.8 |
| polished_blackstone | 磨制黑石 | 1.5 |
| polished_blackstone_bricks | 磨制黑石砖 | 1.5 |
| cracked_polished_blackstone_bricks | 裂纹磨制黑石砖 | 1.0 |
| deepslate_bricks | 深层石砖 | 1.0 |
| polished_deepslate | 磨制深层石 | 1.0 |
| shulker_box | 潜影盒 | 1.5 |
| respawn_anchor | 重生锚 | 0.5 |
| end_crystal | 末影水晶 | 0.8 |
| dragon_egg | 龙蛋 | 0.2 |
| jukebox | 唱片机 | 0.5 |

#### ★ 传说（Legendary）4% — 权重合计约 100

| 方块ID | 中文名称 | 权重 |
|--------|---------|------|
| ancient_debris_top | 远古残骸（顶面） | 1.5 |
| gilded_blackstone | 镀金黑石 | 1.5 |
| crying_obsidian | 哭泣黑曜石 | 2.0 |
| elytra | 鞘翅（物品） | 0.5 |
| heart_of_the_sea | 海洋之心（物品） | 0.3 |
| lodestone | 罗盘方块 | 0.5 |
| nether_star | 下界之星（物品） | 0.5 |
| dragon_head | 龙首 | 0.5 |

---

## 四、兑换规则

### 4.1 单件道具兑换

用「方块数量」直接兑换，无需积分。

| 道具 | 所需方块 | 说明 |
|------|---------|------|
| 营火 | 橡木木板 ×20 | 生存必备 |
| 蜂箱 | 橡木木板 ×15 + 花草方块 ×8 | 蜂蜜来源 |
| 堆肥桶 | 橡木栅栏 ×10 + 橡木台阶 ×10 | 堆肥增产 |
| 木桶 | 橡木木板 ×20 + 铁块 ×2 | 储物容器 |
| 烟熏炉 | 橡木原木 ×8 + 煤炭块 ×4 | 食物烹饪 |
| 铁砧 | 铁块 ×27 | 物品修复 |
| 附魔台 | 黑曜石 ×10 + 钻石块 ×2 + 书 ×1 | 经验附魔 |
| 酿造台 | 烈焰棒 ×3 + 圆石 ×5 | 药水酿造 |
| 音符盒 | 橡木木板 ×8 + 红石粉 ×1 | 音乐播放 |
| 唱片机 | 钻石块 ×3 + 红石块 ×1 | 唱片播放 |
| 讲台 | 橡木木板 ×15 + 书 ×1 | 展示阅读 |
| 锻造台 | 铁块 ×4 + 煤炭块 ×2 | 装备升级 |
| 制图台 | 纸 ×4 + 皮革 ×2 | 地图绘制 |
| 切石机 | 石砖 ×4 + 铁块 ×2 | 石材加工 |
| 砂轮 | 木棍 ×4 + 石砖 ×2 | 经验磨刀 |
| 织布机 | 橡木木板 ×10 + 羊毛 ×2 | 旗帜图案 |
| 弓箭台 | 木棍 ×8 + 铁块 ×2 + 线 ×2 | 附魔弓箭 |
| 潮涌核心 | 鹦鹉螺壳 ×4 + 海晶碎片 ×8 | 水下信标 |
| 末影水晶 | 末影珍珠 ×8 + 玻璃 ×1 | 下界复活 |
| 信标 | 黑曜石 ×5 + 玻璃 ×3 + 下界之星 ×1 | 全地图增益 |
| 重生锚 | 下界石英 ×40 + 哭泣黑曜石 ×2 | 下界重生 |

### 4.2 套装兑换

集齐全套所需道具 + 方块后，自动激活套装。

#### 🪵 木器套装
- **所需道具：** 营火 ×1 + 木桶 ×1
- **所需方块：** 橡木木板 ×40 + 橡木原木 ×20 + 橡木栅栏 ×10
- **套装效果：** 木工具全套 + 木护甲全套 + 「木匠」称号

#### 🔩 铁器套装
- **所需道具：** 铁砧 ×1 + 烟熏炉 ×1 + 桶 ×1
- **所需方块：** 铁块 ×30 + 铁栅栏 ×15 + 煤炭块 ×20
- **套装效果：** 铁工具全套 + 铁护甲全套 + 「铁匠」称号

#### 💎 钻石套装
- **所需道具：** 附魔台 ×1 + 唱片机 ×1
- **所需方块：** 钻石块 ×20 + 绿宝石块 ×15 + 黑曜石 ×10
- **套装效果：** 钻石工具全套 + 钻石护甲全套 + 「钻石大师」称号

#### 🔶 下界合金套装
- **所需道具：** 重生锚 ×1 + 信标 ×1
- **所需方块：** 下界合金块 ×10 + 远古残骸 ×8 + 哭泣黑曜石 ×4
- **套装效果：** 下界合金工具全套 + 「下界征服者」称号

#### 🏗️ 建筑大师套装
- **所需道具：** 切石机 ×1 + 砂轮 ×1 + 织布机 ×1
- **所需方块：** 石砖系 ×30 + 各类木板 ×40 + 玻璃 ×20 + 红砖 ×15
- **套装效果：** 建筑速度×1.5 + 「建筑大师」称号

#### ⚙️ 红石工程师套装
- **所需道具：** 音符盒 ×1 + 酿造台 ×1
- **所需方块：** 红石块 ×10 + 比较器 ×5 + 中继器 ×5 + 发射器 ×5 + 投掷器 ×5
- **套装效果：** 红石信号范围×2 + 「红石大师」称号

#### 🐝 养蜂人套装
- **所需道具：** 蜂箱 ×1 + 堆肥桶 ×1
- **所需方块：** 橡木木板 ×20 + 花草方块 ×30 + 玻璃瓶 ×8
- **套装效果：** 蜜蜂不攻击 + 蜂蜜产量×2 + 「养蜂人」称号

#### 🌀 下界探险套装
- **所需道具：** 末影水晶 ×2 + 重生锚 ×1
- **所需方块：** 下界岩 ×30 + 玄武岩 ×15 + 黑石 ×20 + 下界砖 ×15
- **套装效果：** 下界行走加速 + 岩浆伤害免疫 + 「下界探险家」称号

---

## 五、开箱机制

### 5.1 概率算法

```
1. 生成 0~100 随机数 R
2. 判定稀有度区间：
   - R < 42  → Common（普通）
   - R < 70  → Uncommon（不常见）
   - R < 86  → Rare（稀有）
   - R < 95  → Epic（珍稀）
   - R ≥ 95  → Legendary（传说）
3. 在该稀有度内，按权重加权随机抽取具体方块
4. 若方块已达收集上限（endless 类），自动折算为低稀有度方块
```

### 5.2 保底机制

| 条件 | 保底内容 |
|------|---------|
| 10连内 | 至少1个 Rare 或更高 |
| 50连内 | 至少1个 Epic 或更高 |
| 100连内 | 至少1个 Legendary |

### 5.3 宝箱获取方式

**完成任务 → 直接获得任务设定的宝箱数量**，无时间限制，无付费。

- 每日任务 → 1个宝箱
- 周常任务 → 3个宝箱
- 成就解锁 → 1个传说宝箱

---

## 六、文件改动清单

| 文件 | 改动内容 |
|------|---------|
| `mc-task-app/mc-textures/blocks/` | 新增约60~80个方块纹理PNG（P0+P1） |
| `mc-task-app/src/lib/types.ts` | 新增方块类型定义、稀有度概率导出 |
| `mc-task-app/src/lib/store.tsx` | 新增方块数量/道具/套装状态、概率算法、保底逻辑 |
| `mc-task-app/src/components/ChestPage.tsx` | 新增宝箱UI、保底计数器、开箱动画 |
| `mc-task-app/src/pages/RewardsPage.tsx` | 重构兑换商店UI（道具兑换 + 套装激活） |
| `mc-task-app/src/components/SuitPage.tsx` | 新增套装展示页（套装效果 + 收集进度） |

---

## 七、实施计划

| 阶段 | 内容 | 负责人 |
|------|------|------|
| Phase 1 | 素材下载（官方CDN可获取部分） | 哈哈 |
| Phase 2 | 阿三设计缺失方块纹理（约60~80张） | 阿三 |
| Phase 3 | types.ts 类型重构 + 稀有度概率配置 | 阿二 |
| Phase 4 | store.tsx 收藏状态/兑换/保底算法 | 阿二 |
| Phase 5 | ChestPage 宝箱开箱UI + 动画 | 阿三 |
| Phase 6 | RewardsPage 兑换商店UI | 阿三 |
| Phase 7 | SuitPage 套装展示UI | 阿三 |
| Phase 8 | 阿一QA测试 + 概率验证 | 阿一 |
| Phase 9 | 视觉验收 + 交付 | 阿三 + 七栖 |

---

> **请七栖审核，有任何调整意见请直接告知，再开工。** 🍄