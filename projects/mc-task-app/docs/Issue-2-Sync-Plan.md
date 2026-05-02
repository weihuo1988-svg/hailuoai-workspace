# Issue #2 施工方案 — 我的世界任务工具 · 多端同步

> 负责人：哈哈 | 开发：阿二 | QA：阿一 | 设计：阿四
> GitHub：`weihuo1988-svg/hailuoai-workspace`
> 分支：`feat-data-sync`

---

## 一、问题描述

当前所有数据存储在 `localStorage`，换设备即清零，无账号体系，无后端 API。
目标：新增服务器同步层，实现跨设备数据实时同步。

---

## 二、架构设计

### 2.1 技术选型

**方案：Node.js + JSON 文件存储 + UUID 匿名账号**

| 维度 | 评分 |
|------|------|
| 开发速度 | ⭐⭐⭐⭐⭐（最快上线） |
| 数据安全 | ⭐⭐⭐（JSON 文件，可后续切 D1） |
| 运维成本 | ⭐⭐⭐⭐（一台 ECS 即支持） |
| 扩展性 | ⭐⭐⭐（可平滑迁移至 Cloudflare D1） |

> **反面论证（红军模拟）：**
> Q：JSON 文件存储在并发写入时是否会产生数据竞争？
> A：**防御：** 使用文件锁（`fs.stat` + retry）或 Node.js `fs.promises` 的排他写入模式；当前产品为单人使用工具，无高并发写入场景，风险极低。
> Q：服务器磁盘损坏怎么办？
> A：**防御：** JSON 文件同步至 `/var/www/consolidated/snapshots/`（已配置快照目录）；可后续接入 OSS 备份，当前阶段风险可控。

### 2.2 数据流

```
[前端 App.tsx]
    │ loadState() / saveState()
    ▼
[SyncContext — 新增同步层]
    │ 首次加载：从 /api/sync?userId=xxx 获取服务器数据
    │ 状态变更：POST /api/sync 上报增量
    ▼
[后端 server.js — /api/sync 接口]
    │ 读取 /data/<userId>.json
    │ 或创建默认空文件
    ▼
[服务器 JSON 文件存储]
路径：/var/www/sync-data/<userId>.json（需在 server.js 创建）
```

### 2.3 用户身份方案

**UUID 匿名制（无需登录）：**
- 首次打开 App 时，前端生成 UUID：`crypto.randomUUID()` 存入 `localStorage` 的 `userId` 字段
- 后续所有请求携带 `?userId=xxx` 参数
- 用户清除缓存 = 换新设备 → 数据丢失，属预期行为

> 如需账号体系（后续）：可将 UUID 替换为微信unionid/钉钉ID

---

## 三、数据结构

```typescript
// AppState 全量快照（每次同步全量存储，简化冲突处理）
interface SyncPayload {
  userId: string;
  version: number;        // 递增版本号，用于冲突检测
  updatedAt: string;      // ISO timestamp
  data: AppState;         // 全量 AppState
}

// AppState 字段清单（来自 types.ts）
interface AppState {
  tasks: Task[];              // 任务列表
  chests: Chest[];            // 待开启宝箱列表
  collection: string[];       // 已收集方块ID列表
  settings: Settings;         // PIN码等设置
  stats: Stats;              // 统计信息
  lastResetDate: string;      // 上次重置日期
  weeklyResetWeek: number;   // 本周序号
  monthlyResetMonth: number; // 本月序号
}
```

---

## 四、前端改造（TaskContext → SyncContext）

### 4.1 新增文件

- `src/contexts/SyncContext.tsx` — 同步层上下文
- `src/hooks/useSync.ts` — sync hook（从服务器拉取/上报数据）

### 4.2 核心逻辑

**初始化流程（useSync）：**
```
1. 检查 localStorage 有无 userId
   → 有：直接进入流程2
   → 无：生成 UUID 并存入 localStorage，转流程2
2. 请求 GET /api/sync?userId=xxx
   → 成功：合并服务器数据到本地 state（以服务器 version 更新）
   → 失败（404/网络错误）：使用本地 localStorage 数据（降级）
3. 启动定期同步：每 30 秒检查一次数据变更
4. 每次 state 变化：防抖 2 秒后 POST /api/sync
```

**冲突策略：**
- 以 `version` 字段比较，服务器 version 高则信任服务器
- 版本相同时：本地优先（用户刚产生的数据）

### 4.3 关键改造点

| 文件 | 改造内容 |
|------|---------|
| `src/App.tsx` | 移除直接 `saveState` 调用，改为 `useSync` hook；加载时用 `useSync` 初始化 |
| `src/utils.ts` | `loadState/saveState` 保持降级逻辑（无网络时正常工作） |
| `src/contexts/SyncContext.tsx`（新建） | 同步层 Provider，封装 fetch/push 逻辑 |
| `src/hooks/useSync.ts`（新建） | sync hook，暴露 `{ syncState, pending }` |

---

## 五、后端接口（server.js）

### 5.1 接口设计

**GET `/api/sync`**
```
Query: userId (string, required)
Return 200: { version, updatedAt, data: AppState }
Return 404: { error: 'not_found' }（新建账号，返回空数据）
```

**POST `/api/sync`**
```
Body: { userId, version, updatedAt, data: AppState }
Return 200: { version: newVersion }（服务器计算的新版本号）
Return 400: { error: 'version_conflict' }（可选：服务器版本更新则拒绝）
```

### 5.2 存储路径

```javascript
const DATA_DIR = '/var/www/sync-data/'; // 需在 server.js 创建
const userFile = (userId) => `${DATA_DIR}${userId}.json`;
```

### 5.3 安全策略

- `userId` 仅允许字母/数字/连字符（正则校验）
- 请求体大小限制：< 1MB（防止滥用）
- 每用户文件最大：10MB

---

## 六、CI/CD 流程

```
1. 阿四：从 main 拉出新分支 feat-data-sync
2. 阿二：实现 SyncContext + 后端 /api/sync，提交到 feat-data-sync
3. 阿一：本地 Mock 测试（清除 localStorage，验证从服务器恢复）
4. 阿二：解决测试发现的问题
5. 阿四：PR 合并到 main，推送到 GitHub
6. 哈哈：触发阿里云部署，验证线上可用
```

---

## 七、验收标准

| # | 场景 | 预期结果 |
|---|------|---------|
| 1 | 新设备首次访问（UUID 生成） | 正常加载，返回空状态，可正常添加任务 |
| 2 | 有数据的设备访问 | 从服务器拉取数据，所有任务/宝箱/收藏完整 |
| 3 | 完成任务后 | 数据自动上报，刷新页面后数据仍在 |
| 4 | 离线状态添加任务 | 本地正常完成，上线后自动同步 |
| 5 | 模拟清缓存（清除localStorage） | 重新生成UUID，服务器数据不受影响（旧数据仍在那里，可选择提示用户恢复） |

---

## 八、风险清单

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| JSON 并发写入冲突 | 低 | 中 | 文件锁 + 重试 |
| 服务器磁盘满 | 低 | 高 | 监控 + 定期清理（>90% 告警） |
| 用户清缓存导致 UUID 丢失 | 高 | 低 | 文档说明，引导用户不要清缓存 |
| 后端接口超时 | 中 | 低 | 前端重试 + localStorage 降级 |

---

*本方案由哈哈撰写，七栖确认方案后阿二执行开发。*
