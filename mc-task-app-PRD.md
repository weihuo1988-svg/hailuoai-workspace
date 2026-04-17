# 我的世界任务工具 — UI升级 PRD
> 发起人：七栖 | 负责人：哈哈 | 设计：阿三 | 开发：阿二 | QA：阿一

---

## 1. 项目概述

**产品名称：** 我的世界任务管理系统
**类型：** 儿童任务激励工具（H5，React + Vite + TypeScript）
**地址：** http://39.97.246.203/
**现状：** 已上线，Emoji驱动的像素风格UI，所有方块/物品以emoji展示
**目标：** 全面升级为真实 Minecraft 1.20.2 原版材质，替换所有emoji图标

---

## 2. 升级范围

### 2.1 顶部导航栏（Header）
- **统计图标**（📋✅📦🧱）：→ MC物品图标（纸/绿宝石/箱子/砖块）
- **头像**：Steve → 替换为MC Steve 64px 像素头像

### 2.2 任务列表页（Tasks Tab）
- **任务类型emoji**（⚔️等）：→ 对应MC物品/方块图标
- **今日进度背景**：保留MC草地背景，色块覆盖优化
- **空状态徽章**：→ MC成就徽章纹理

### 2.3 宝箱页（Chests Tab）
- **宝箱图标**：📦 → MC真实箱子材质（侧开/开启两帧）
- **空状态**：MC末影箱风格

### 2.4 收藏页（Collection Tab）
- **方块网格**：emoji → 16×16 MC方块PNG
- **套装解锁动画**：emoji → MC套装图标（皮革/铁/钻石/下界合金）
- **工具展示**：emoji → MC物品图标（剑/斧/镐/锄/锹/盾）
- **护甲展示**：emoji → MC护甲图标（头盔/胸甲/护腿/靴子）
- **收集进度条**：MC进度条风格

### 2.5 开箱动画（ChestAnimations）
- **宝箱翻转**：MC箱子开启帧序列
- **掉落方块**：→ 真实MC方块16×16 PNG，带发光光环
- **粒子特效**：保留结构，改为MC风格星星/粒子纹理
- **稀有度标签**：保持颜色逻辑，样式升级为MC tooltip风格

### 2.6 Tab 栏（底部导航）
- 任务⚔️ → MC钻石剑
- 宝箱📦 → MC箱子
- 收藏🗃️ → MC箱子（已开启）

---

## 3. 材质资产清单（已下载，共1510张）

**位置：** `/workspace/mc-textures/blocks/`（928张）| `/workspace/mc-textures/items/`（582张）

### 方块映射参考
| 当前ID | 对应MC文件 | 备注 |
|--------|-----------|------|
| tnt | tnt.png | 红色TNT方块 |
| leaves | oak_leaves.png / dark_oak_leaves.png | 树叶 |
| pumpkin | carved_pumpkin.png | 南瓜 |
| melon | melon.png | 西瓜片 |
| netherrack | netherrack.png | 地狱岩 |
| grass | grass_block_top.png | 草方块顶面 |
| dirt | dirt.png | 泥土 |
| wood | oak_log.png | 原木 |
| obsidian | obsidian.png | 黑曜石 |
| netherite | netherite_block.png | 下界合金块 |
| bedrock | bedrock.png | 基岩 |
| end | end_stone.png | 末地石 |

### 物品映射参考
| 当前ID | 对应MC文件 |
|--------|-----------|
| wood_sword / stone_sword / iron_sword / diamond_sword | wooden_sword.png / stone_sword.png / iron_sword.png / diamond_sword.png |
| 盾牌 | shield.png |
| 弓 | bow.png |
| 皮革/铁/钻石护甲 | leather_helmet.png 等 |

---

## 4. 设计原则

1. **像素原生感**：所有图标用 `image-rendering: pixelated`，保持16×16原始像素
2. **稀有度色彩系统**：
   - 普通：白色/灰色 #FFF/#AAA
   - 不常见：绿色 #4CAF50
   - 稀有：蓝色 #2196F3
   - 珍稀：紫色 #9C27B0
   - 传说：金色 #FF9800
   - 无尽：粉紫 #E91E63（虹光）
3. **发光效果**：稀有物品用 CSS `drop-shadow` 加光晕，与MC原版一致
4. **MC字体**：继续用 Press Start 2P（已正确），无需替换
5. **深色背景保留**：深蓝黑底 `rgba(10,10,30)` 保留，增加MC地牢感
6. **响应式**：手机优先，3栏/2栏/1栏自适应

---

## 5. 设计交付要求

请输出：
1. **视觉风格定义**：整体色调、字体层级、间距规范
2. **图标规范**：每个替换位置的图标尺寸、间距、hover态
3. **稀有度体系**：5级稀有度颜色+发光效果规范
4. **动效建议**：开箱动画、套装解锁动画的MC风格参考
5. **设计稿图片**（可选，若能生成）

---

## 6. 参考文件

- 当前代码：`/workspace/projects/mc-task-app/src/`
- MC材质：`/workspace/mc-textures/blocks/` + `/workspace/mc-textures/items/`
- 现有UI：http://39.97.246.203/（可打开对照）
