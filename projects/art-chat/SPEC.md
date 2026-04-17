# 小画家对话助手 v2.0 · 技术规格说明书

## 概述

基于现有 `/workspace/art-chat/dist/index.html`（v1.3版本，功能已跑通）进行迭代开发。

**目标：** 让AI真正"读懂"画作，生成个性化问题与追问，朋友圈文案能"炫耀"孩子的创造力。

---

## 一、文件结构

- 入口文件：`/workspace/art-chat/dist/index.html`（纯HTML+CSS+JS单文件）
- 参考文档：`/workspace/art-chat/PRD-迭代v2.md`（产品需求）
- 无需新建文件，直接修改 `dist/index.html`

---

## 二、需修改的函数清单

### 2.1 `runAnalysis()` —— 步骤2分析函数

**位置：** JS第160-210行（参考）

**变化：** 在分析成功后，调用AI生成个性化问题列表，存入 `S.generatedQuestions`

**新逻辑：**
```javascript
async function runAnalysis() {
  // ... 现有AI分析逻辑（保留）...
  // 分析完成后，调用AI生成专属问题
  S.generatedQuestions = await generateQuestionsFromAI(paintingDesc);
  // ... 进入startChat() ...
}
```

**新增函数 `generateQuestionsFromAI`：**
- 调用 MiniMax-Text-01
- 输入：AI识别的画作描述（`paintingDesc`）
- 输出：5-8道专属问题的数组
- prompt见PRD需求1

---

### 2.2 `pickQ()` —— 问题选择函数（重构）

**变化：** 不再从固定QPOOL中抽取，改为从 `S.generatedQuestions` 中按顺序取题
- 有 `generatedQuestions` → 从中按序取，取完调用AI续写
- 无 `generatedQuestions`（无API Key）→ 回退到QPOOL模板（保留现有逻辑）

```javascript
function pickQ() {
  // 有AI生成的问题：从S.generatedQuestions取
  if (S.generatedQuestions && S.generatedQuestions.length > 0) {
    return S.generatedQuestions.shift();
  }
  // 无API Key：回退到QPOOL模板（保留）
  return pickQFromPool();
}
```

---

### 2.3 `sendAnswer()` —— 发送回答函数（调整）

**变化：** `genFollowUp()` 调用改为异步，每次追问走AI

```javascript
async function sendAnswer() {
  // ... 显示家长回答 ...
  S.conv.push({ q: S.curQ, a: ans });
  updateHistory();
  document.getElementById('sumBtn').style.display = '';

  // AI追问：有API Key则调用AI，否则走兜底规则
  if (localStorage.getItem('mc_api_key')) {
    document.getElementById('chatStatus').textContent = '🤔 在想下一个问题…';
    var nextQ = await genFollowUpAI(S.curQ, ans);
    S.curQ = nextQ;
  } else {
    S.curQ = genFollowUpFallback(S.curQ, ans);
  }
  S.qCount++;
  document.getElementById('chatStatus').textContent = '问题 ' + S.qCount;
  updateTips(S.qCount);
  // 显示AI追问...
}
```

---

### 2.4 新增 `genFollowUpAI()` —— AI追问函数

**PRD要求：**
- 输入：当前问题 + 孩子回答 + 画作描述 + 对话历史
- 输出：一道追问（50字以内）
- 有兜底：API失败时调用 `genFollowUpFallback`

---

### 2.5 `genSum()` —— 朋友圈文案函数（重构）

**PRD要求：**
- prompt升级为"晒娃型"文案（骄傲、细节、情感）
- 保留 `buildSumFallback()` 兜底模板（3条）
- 验收标准：60-100字，包含孩子原话

---

## 三、AI Prompt 参考

### 3.1 生成专属问题（步骤2末尾调用）

```
你是一位专业的儿童艺术教育老师。请根据这幅儿童画的内容，
生成5-8道适合问孩子的问题，帮助孩子讲述画里的故事。

画作内容：{paintingDesc}

要求：
- 每道问题单独一行，不要编号
- 问题要温暖、有趣、适合3-10岁孩子回答
- 包含对画面细节的追问（颜色、角色动作、想象延伸）
- 不要问"这是什么"、"这是什么颜色"这类封闭问题
- 直接输出问题列表，不要加任何前缀说明
```

### 3.2 AI追问（每次发送回答后调用）

```
你是一位温暖的儿童画引导师，正在和孩子进行一对一对话。

画作内容：{paintingDesc}

对话记录：
{convHistory}

孩子刚才回答了：{lastAnswer}

请基于孩子的回答，自然地追问下一个问题。要求：
1. 承接孩子刚才说的话，自然延伸，不要重复之前的问题
2. 语气温暖好奇，像大朋友在认真听
3. 适合3-10岁孩子回答
4. 50字以内
5. 直接输出问题，不要加"追问："等前缀
```

### 3.3 朋友圈文案（genSum）

```
你是一位特别会"晒娃"的家长，擅长发让人忍不住点赞的朋友圈。

今天你家孩子画了一幅画，内容是：{paintingDesc}。

你们的对话记录：
{qa}

请根据对话生成一条朋友圈文案，要求：
1. 以家长口吻（"我家娃"、"儿子/女儿说"）
2. 包含孩子说的一句原话或一个具体细节（让人感受到创造力）
3. 语气骄傲，自然，不夸张不煽情
4. 结尾暗示陪伴是最好的教育（但要自然，不能说教）
5. 60-100字
6. 直接输出文案，不要加"文案："等前缀，不要加引号
```

---

## 四、现有代码保留清单（不要动）

- ✅ `showPage()` / `goStep()` 页面切换逻辑
- ✅ `handleFile()` 图片读取逻辑
- ✅ `escHtml()` XSS过滤
- ✅ `toast()` 提示函数
- ✅ `updateTips()` 家长提示面板
- ✅ `updateHistory()` 对话记录面板
- ✅ 步骤1上传UI、步骤2加载动画、步骤3对话UI（CSS不变）
- ✅ `buildFollowUpFallback()` 兜底规则（保留但改名）

---

## 五、注意事项

1. **API调用失败时必须走兜底**，不能卡住
2. **不要改变现有UI结构**，只改JS逻辑
3. **所有按钮事件用 `getElementById().onclick`** 绑定，不用HTML内联onclick
4. **文件末尾平台注入的 highlight 脚本不要删除**（部署时会自动注入）
5. 开发完成后提交 git，写清楚改动点

---

## 六、验收标准（啊七CR + 啊一QA会验证）

- [ ] 同一张画多次分析，生成的问题列表不同（LLM随机性）
- [ ] 有API Key时，追问内容与孩子回答相关
- [ ] 无API Key时，追问走兜底规则，不报错
- [ ] 朋友圈文案包含孩子原话或细节
- [ ] 文案字数60-100字
- [ ] 所有现有功能（上传→分析→对话→导出）流程完整，不退化
