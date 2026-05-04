# 🎨 MC 任务工具 - 新手引导 UI 素材说明

> Issue #7（新手引导系统）视觉素材交付文档

---

## 📁 素材目录

```
docs/guide-assets/
├── 01-guide-overlay-bubble.png   ← 引导遮罩气泡（指向任务卡片）
├── 02-device-code-modal.png       ← 设备码强制弹窗
├── 03-guide-task-badge.png       ← 引导任务角标（新手试炼徽章）
├── 04-bubble-guide-chest-tab.png  ← 气泡指引 → 宝箱 Tab
├── 05-bubble-guide-collection-tab.png ← 气泡指引 → 收藏 Tab
└── guide-assets.zip              ← 完整打包文件
```

---

## 📐 素材尺寸与用途

| 文件名 | 建议尺寸 | 用途说明 |
|--------|---------|---------|
| `01-guide-overlay-bubble.png` | 800×600px | 首次进入 App 时弹出遮罩层 + 对话气泡，箭头向下指向第1张任务卡片 |
| `02-device-code-modal.png` | 600×800px | 全屏强制弹窗（z-index: 99999），MC 铁砧风格，含3格数字输入框 |
| `03-guide-task-badge.png` | 80×24px（小徽章） | 任务卡片右上角角标，金色星星 + "新手试炼"文字 |
| `04-bubble-guide-chest-tab.png` | 800×600px | 气泡指向底部 Tab 栏宝箱图标，文案"去开启你的第一个宝箱！" |
| `05-bubble-guide-collection-tab.png` | 800×600px | 气泡指向底部 Tab 栏收藏图标，文案"用方块兑换套装道具吧！" |

---

## 🎨 色彩规范

| 用途 | 色值 |
|------|------|
| 主色（草地绿） | `#4CAF50` |
| 强调色（金色） | `#FFD700` |
| 背景色（深夜泥土） | `#0a0a1e` |
| 遮罩层背景 | `#1a1a2e`（半透明） |
| 文字（主要） | `#FFFFFF` |
| 边框色 | `#4CAF50`（3px solid） |

---

## ✏️ 字体规范

- **字体：** Press Start 2P（Google Fonts）
- 所有标题文案使用此字体
- 像素风格硬边渲染，无抗锯齿
- 图片输出已嵌入像素风格，无需额外加载字体

---

## 📐 CSS 布局参考

### 引导遮罩气泡定位

```css
/* 遮罩层 */
.guide-overlay {
  background: rgba(10, 10, 30, 0.85);
  backdrop-filter: blur(2px);
  z-index: 9999;
}

/* 气泡容器 */
.guide-bubble {
  position: absolute;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a2e;
  border: 3px solid #4CAF50;
  box-shadow: 4px 4px 0 #000;
  padding: 16px 24px;
  clip-path: polygon(0% 0%, 100% 0%, 100% 80%, 50% 100%, 0% 80%);
  /* 底部箭头通过 clip-path 实现 */
}

/* 箭头向下指向任务卡片 */
.guide-bubble::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 16px solid #4CAF50;
}
```

### 设备码弹窗

```css
/* 全屏强制弹窗 */
.device-modal {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(10, 10, 30, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}

.device-modal .modal-box {
  background: #1a1a2e;
  border: 4px solid #555;
  box-shadow: 8px 8px 0 #000;
  padding: 24px;
  max-width: 480px;
  width: 90%;
}

/* 3格数字输入框（MC 物品槽口风格） */
.code-inputs {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.code-inputs input {
  width: 64px;
  height: 72px;
  background: #2d2d3a;
  border: 3px solid #666;
  border-radius: 0;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.5);
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 24px;
  text-align: center;
}

/* 保存按钮 */
.btn-save-code {
  width: 100%;
  background: #4CAF50;
  border: 3px solid #388E3C;
  box-shadow: 4px 4px 0 #000;
  color: #fff;
  font-family: 'Press Start 2P', monospace;
  font-size: 14px;
  padding: 16px;
  cursor: pointer;
}
```

### 引导任务角标

```css
/* 金色角标徽章 */
.guide-badge {
  display: inline-block;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border: 2px solid #996600;
  box-shadow: 2px 2px 0 #000;
  padding: 4px 10px;
  font-family: 'Press Start 2P', monospace;
  font-size: 10px;
  color: #1a1a2e;
}
```

### Tab 栏气泡指引

```css
/* 底部 Tab 气泡（箭头向上指） */
.tab-bubble {
  position: fixed;
  bottom: 120px; /* 位于 Tab 栏上方 */
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a2e;
  border: 3px solid #4CAF50;
  box-shadow: 4px 4px 0 #000;
  padding: 12px 20px;
  clip-path: polygon(20% 0%, 80% 0%, 100% 60%, 50% 100%, 0% 60%);
  z-index: 9999;
}
```

---

## 🔧 使用建议

1. **引导遮罩气泡**：`01-guide-overlay-bubble.png` 作为背景遮罩层的视觉参考，气泡叠加在遮罩上方
2. **设备码弹窗**：`02-device-code-modal.png` 整体替换为 React 组件，支持用户输入3位数字
3. **任务角标**：将 `03-guide-task-badge.png` 放置于任务卡片右上角，使用绝对定位
4. **Tab 指引气泡**：第4、5个素材用于任务完成后引导用户点击底部 Tab

---

## ✅ 设计清单

- [x] 引导遮罩气泡（指向任务卡片）
- [x] 设备码弹窗（含3格输入框）
- [x] 引导任务角标
- [x] 宝箱 Tab 气泡指引
- [x] 收藏 Tab 气泡指引

---

**交付人：** 阿三（UI 设计师）  
**交付日期：** 2026-05-04  
**关联 Issue：** #7（新手引导系统）、#9（UI 设计协调）