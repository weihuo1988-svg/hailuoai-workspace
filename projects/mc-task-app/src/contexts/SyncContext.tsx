/**
 * SyncContext.tsx — 同步上下文（顶层 Provider + 状态持有者）
 * 路径：/workspace/projects/mc-task-app/src/contexts/SyncContext.tsx
 * 描述：
 *   - 持有 AppState 的真实来源（useState）
 *   - 生成/读取 UUID 作为用户身份标识
 *   - 初始化时从服务器拉取数据（version 策略）并覆盖本地 state
 *   - 每次 state 变化后防抖 2 秒上报到服务器（带重试）
 *   - 暴露 pending / error / lastSyncAt 状态
 * 版本策略：
 *   - GET 时服务器返回 version，客户端记录到 serverVersionRef
 *   - POST 时携带 serverVersion，服务器计算 newVersion = serverVersion + 1
 *   - 避免硬编码 version=0 导致的版本回退问题
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSyncHook } from '../hooks/useSync';
import type { AppState } from '../types';
import { loadState } from '../utils';

// ─── 常量 ──────────────────────────────────────────────────
const USER_ID_KEY  = 'mc_task_userId';
const MAX_RETRIES  = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 指数退避

// ─── Context Value 类型 ────────────────────────────────────
export interface SyncContextValue {
  // AppState 来源（SyncProvider 持有，App 直接消费）
  appState:    AppState;
  setAppState:  React.Dispatch<React.SetStateAction<AppState>>;
  // 同步状态（供 UI 显示）
  pending:     boolean;
  syncError:   string | null;
  lastSyncAt:  Date | null;
  hasSynced:   boolean;
}

// ─── Context 定义 ────────────────────────────────────────────
const SyncContext = createContext<SyncContextValue | null>(null);

export const useSyncContext = (): SyncContextValue => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSyncContext 必须用在 SyncProvider 内部');
  return ctx;
};

// ─── 获取/生成 UUID（匿名制）──────────────────────────────
function getUserId(): string {
  const stored = localStorage.getItem(USER_ID_KEY);
  if (stored && typeof stored === 'string' && stored.length > 0) return stored;
  const id = crypto.randomUUID();
  localStorage.setItem(USER_ID_KEY, id);
  return id;
}

// ─── 防抖 Hook ──────────────────────────────────────────────
function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// ─── 带重试的 POST ──────────────────────────────────────────
async function postWithRetry(
  url:  string,
  body: object,
  retries = MAX_RETRIES,
): Promise<Response | null> {
  let lastError: Error | null = null;
  for (let i = 0; i < retries; i++) {
    try {
      const resp = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (resp.ok) return resp;
      if (resp.status < 500) return resp; // 4xx 不重试
    } catch (err: any) {
      lastError = err;
    }
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAYS[i]));
    }
  }
  console.warn(`[SyncContext] POST 重试 ${retries} 次失败:`, lastError?.message);
  return null;
}

// ─── SyncProvider Props ────────────────────────────────────
interface SyncProviderProps { children: ReactNode }

// ─── SyncProvider 主体 ────────────────────────────────────
export function SyncProvider({ children }: SyncProviderProps) {
  // 真实 AppState（来源：本地 localStorage 初始化 → 服务器覆盖）
  const [appState, setAppState] = useState<AppState>(() => loadState());

  const userId   = getUserId();
  const syncHook = useSyncHook(userId, null);
  const { pull, result, setResult } = syncHook;

  // 防抖 2 秒（触发 POST）
  const debouncedState = useDebounce(appState, 2000);

  // 服务器已知最新 version（GET 时服务器返回，POST 时携带）
  const serverVersionRef = useRef(0);

  const [inited, setInited]        = useState(false);
  const [hasSynced, setHasSynced]  = useState(false);

  // ─── 初始化：GET 拉取服务器数据 ──────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setResult(r => ({ ...r, pending: true, error: null }));

      try {
        const serverData = await pull();

        if (cancelled) return;

        if (serverData && serverData.version > 0 && serverData.data !== null) {
          // 服务器有有效数据：信任服务器，用它覆盖本地 state
          console.log(`[SyncContext] 从服务器拉取成功，version=${serverData.version}`);
          setAppState(serverData.data);
          serverVersionRef.current = serverData.version;
        } else {
          // 新账号或服务器无数据：本地 state 保持 loadState() 结果
          console.log('[SyncContext] 新账号或无服务器数据，使用本地数据');
        }
      } catch (err: any) {
        // 网络失败：降级到本地数据，不阻断用户操作
        console.warn('[SyncContext] 拉取失败，使用本地数据:', err.message);
      } finally {
        if (!cancelled) {
          setInited(true);
          setHasSynced(true);
          setResult(r => ({ ...r, pending: false }));
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── 防抖上报：debouncedState 变化时 POST ────────────
  useEffect(() => {
    if (!inited) return;

    const timer = setTimeout(async () => {
      // 携带当前服务器已知 version（允许服务器做递增）
      const payload = {
        userId,
        version:   serverVersionRef.current,
        updatedAt: new Date().toISOString(),
        data:      debouncedState,
      };

      setResult(r => ({ ...r, pending: true }));

      const resp = await postWithRetry(
        `${import.meta.env.VITE_API_BASE || ''}/api/sync`,
        payload,
      );

      if (resp && resp.ok) {
        // 解析服务器返回的新 version（服务器生成的 newVersion = version + 1）
        let newVersion = serverVersionRef.current + 1;
        try {
          const body = await resp.json();
          if (body?.version != null) newVersion = body.version;
        } catch { /* ignore parse fail */ }

        serverVersionRef.current = newVersion;
        console.log(`[SyncContext] 上报成功，serverVersion=${newVersion}`);
        setResult(r => ({
          ...r, pending: false, error: null, lastSyncAt: new Date(),
        }));
      } else if (resp && !resp.ok) {
        let errMsg = `同步失败 HTTP ${resp.status}`;
        try {
          const body = await resp.json();
          if (body?.error) errMsg = body.error;
        } catch { /* ignore */ }
        setResult(r => ({ ...r, pending: false, error: errMsg }));
      } else {
        // 重试耗尽，本地已有数据，网络问题不影响使用
        setResult(r => ({ ...r, pending: false, error: '网络不稳定，数据将在下次变更时重试' }));
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [debouncedState, inited, userId, pull, setResult]);

  // ─── 本地降级：每次 state 变化时同步写入 localStorage ─
  // （即使网络同步失败，本地数据也不会丢失）
  useEffect(() => {
    if (!inited) return; // 初始化未完成时不写入（避免覆盖服务器数据）
    // 使用同步的 saveState，直接写 localStorage
    try {
      localStorage.setItem('mc-task-tool-v1', JSON.stringify(appState));
    } catch (e) {
      console.warn('[SyncContext] localStorage 写入失败:', e);
    }
  }, [appState, inited]);

  const ctxValue: SyncContextValue = {
    appState,
    setAppState,
    pending:    result.pending,
    syncError:  result.error,
    lastSyncAt: result.lastSyncAt,
    hasSynced,
  };

  return (
    <SyncContext.Provider value={ctxValue}>
      {children}
    </SyncContext.Provider>
  );
}

// ─── useSync ───────────────────────────────────────────────
/**
 * App.tsx 使用：
 *   const { appState, setAppState, pending, syncError, lastSyncAt } = useSync();
 *
 * 直接返回 SyncContext 的值，appState 即为服务器同步后的最新状态。
 */
export function useSync() {
  return useSyncContext();
}