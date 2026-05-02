# Issue #2 施工方案 — 我的世界任务工具 · 多端同步

> 负责人：哈哈 | 开发：阿二 | QA：阿一
> 分支：`feat-mc-sync-v2`

---

## 一、问题描述

当前所有数据存储在 `localStorage`，换设备即清零，无账号体系，无后端 API。
目标：新增服务器同步层，实现跨设备数据实时同步。

---

## 二、架构设计

**方案：Node.js + JSON 文件存储 + UUID 匿名账号**

```
[前端 App.tsx]
    │ loadState() / saveState()
    ▼
[SyncContext — 同步层 Provider]
    │ 首次加载：GET /api/sync 拉取服务器数据
    │ 状态变更：POST /api/sync 上报增量
    ▼
[后端 server.js — /api/sync 接口]
    ▼
[服务器 JSON 文件存储]
路径：/var/www/sync-data/<userId>.json
```

**UUID 匿名制：**
- 前端生成 `crypto.randomUUID()` 存入 `localStorage` 的 `userId` 字段
- 后续所有请求携带 `?userId=xxx` 参数
- 用户清除缓存 = 换新设备 → 数据丢失（预期行为）

---

## 三、数据结构

```typescript
interface SyncPayload {
  userId:    string;
  version:   number;      // 服务器已知最新 version
  updatedAt: string;      // ISO timestamp
  data:      AppState;    // 全量 AppState
}

interface SyncResponse {
  version:   number;
  updatedAt: string | null;
  data:      AppState | null;
}
```

---

## 四、版本策略

- **GET**：服务器返回当前 `version`，客户端记录到 `serverVersionRef.current`
- **POST**：携带 `serverVersionRef.current`，服务器计算 `newVersion = version + 1`
- **冲突检测**：服务器 `version > client version` → 返回 409，拒绝旧版本写入
- **降级**：网络失败时本地 `localStorage` 正常工作，不阻断用户操作

---

## 五、接口设计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/sync?userId=xxx` | 拉取用户数据，404 为新账号 |
| POST | `/api/sync` | 上报本地数据，返回新版本号 |

---

## 六、前端改造

- **SyncProvider**（`src/contexts/SyncContext.tsx`）：持有 AppState，GET 初始化，POST 防抖上报
- **useSync** hook：暴露 `{ appState, setAppState, pending, syncError }`
- **App.tsx**：移除直接 `saveState`，改为 `useSync()` 消费状态
- **main.tsx**：`<SyncProvider>` 包裹整个 App

---

## 七、验收标准

| 场景 | 预期结果 |
|------|---------|
| 新设备首次访问 | 正常加载空状态，可添加任务 |
| 有数据的设备访问 | 从服务器拉取数据，所有状态完整 |
| 完成任务后 | 数据自动上报，刷新页面后仍在 |
| 离线状态添加任务 | 本地正常完成，上线后自动同步 |
| 清除 localStorage | 重新生成 UUID，服务器旧数据保留 |

---

*本方案由哈哈撰写，七栖确认后阿二执行开发。*
