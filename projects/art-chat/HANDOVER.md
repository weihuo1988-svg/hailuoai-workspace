# 🎨 小画家对话助手 — 项目交接文档

## 项目概述

**目标：** 一个温暖引导式对话工具，帮助家长通过提问引导小朋友讲述自己画作里的故事，最终生成适合发朋友圈的创意文案。

**用户：** 家有小朋友（3-10岁）的家长

---

## 技术约束（必须遵守）

- **纯 HTML + CSS + JS**，无任何外部依赖（字体除外）
- 手机优先，微信/Safari/Chrome 全兼容
- 所有数据存 localStorage，不上传服务器
- API Key 存 localStorage，永不上传

---

## 功能流程

### 步骤1：上传画作
- 支持拍照或从相册选择（`input[type=file]`）
- 显示图片预览
- 点「开始对话」进入步骤2

### 步骤2：AI 分析（可选）
- 有 API Key：调用 MiniMax Vision 分析图片，识别画面元素
- 无 API Key：跳过分析，直接进入对话
- 显示加载动画 + 识别到的元素标签

### 步骤3：对话
- AI 依次提问（18道问题池，6大类别，防重复）
- 家长输入孩子回答
- AI 智能追问
- 右侧面板动态显示家长引导技巧
- 「一键生成创意总结」生成朋友圈文案（60-90字，家长口吻）
- 「导出对话记录」复制到剪贴板

---

## 已有代码位置

`/workspace/art-chat/index.html`

---

## 当前已知 Bug（必须修复）

### Bug 1：页面空白（最严重）
- **现象：** 进度条显示正常，但上传区域不出现
- **历史：** 已修复 CSS `.page-show{display:block!important}` 和 JS `showPage()` 直接操作 `style.display`
- **待确认：** 是否真正修复，需要真机测试

### Bug 2：手机文件上传点击无响应
- **历史：** 试过 `opacity:0` 覆盖、`label` 关联、`onclick` 触发，均失效
- **最终方案：** `onclick="document.getElementById('fileInput').click()"` + `pointer-events` 处理

### Bug 3：问题重复
- **已修复：** 问题池 18 道，`usedQ[]` 数组记录已问问题，抽到重复就重新随机

### Bug 4：模板字符串引号错误
- **已修复：** 改用字符串拼接

### Bug 5：XSS 注入
- **已修复：** `escHtml()` 函数过滤 `< > " &`

---

## API 端点（参考）

```
Vision 分析：
POST https://api.minimax.chat/v1/text/chatcompletion_pro
Headers: Authorization: Bearer <key>
模型: MiniMax-Text-01（支持图片）

文案生成：
POST https://api.minimax.chat/v1/text/chatcompletion_pro
Headers: Authorization: Bearer <key>
模型: MiniMax-Text-01
```

---

## 交付标准

1. ✅ 页面加载后上传区域**立即可见**（无需任何操作）
2. ✅ 选择图片后预览正常显示
3. ✅ 点「开始对话」后有明确的视觉反馈（加载动画）
4. ✅ 对话区能正常显示问题和输入框
5. ✅ 所有按钮点击有响应（不能点不动）
6. ✅ 发送回答后 AI 追问能正常出现
7. ✅ 一键生成文案能正常复制
8. ✅ 微信手机端测试通过（兼容性问题最多在此暴露）

---

## 啊一 QA 规则（必须通过）

啊一的 skill：`/workspace/skills/ayi-reviewer-1.0.0/SKILL.md`

**交付前必须通过啊一的审查**，重点：
- 手机上传是否可靠
- JS 逻辑完整性
- 所有 `getElementById` 元素是否存在
- 无悬空标签或语法错误
- XSS/安全
