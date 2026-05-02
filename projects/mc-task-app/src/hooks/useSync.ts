/**
 * useSync.ts — 同步 Hook（负责实际发起网络请求）
 * 路径：/workspace/projects/mc-task-app/src/hooks/useSync.ts
 * 负责人：阿二
 * 描述：从服务器拉取 / 上报 AppState
 */

import { useRef, useState, useCallback } from 'react';
import type { AppState } from '../types';

// SyncResult：sync 操作的结果状态
export interface SyncResult {
  pending:    boolean;                  // 是否正在同步中
  error:      string | null;           // 同步错误信息（null=无错）
  lastSyncAt: Date | null;             // 上次成功同步时间
}

// SyncPayload：上报给服务器的请求体
export interface SyncPayload {
  userId:    string;
  version:   number;
  updatedAt: string;
  data:      AppState;
}

// SyncResponse：服务器 GET 的响应结构
export interface SyncResponse {
  version:   number;
  updatedAt: string | null;
  data:      AppState | null;
}

// 上报 POST 的响应结构
export interface PushResponse {
  version:   number;
  updatedAt: string;
}

// ─── 反初始化：当前 API_BASE 留空（由部署环境决定）─────────
const API_BASE = import.meta.env.VITE_API_BASE || '';

/**
 * useSync — 同步 Hook
 *
 * @param userId   当前用户的 UUID（由 SyncContext 提供）
 * @param pending  上层控制是否阻止上报（如初始化/同步中）
 * @returns { pending, error, lastSyncAt }
 *
 * 调用方负责：
 *  - 防抖（每 2 秒才真正发起 POST，避免频繁请求）
 *  - 初始化时拉取 GET
 *  - 网络失败时降级到 localStorage
 */
export function useSyncHook(userId: string, _debouncedState: AppState | null) {
  const [result, setResult] = useState<SyncResult>({
    pending:    false,
    error:       null,
    lastSyncAt:  null,
  });

  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef     = useRef<AbortController | null>(null);

  // ─── GET：拉取服务器数据 ─────────────────────────────────
  const pull = useCallback(async (): Promise<SyncResponse | null> => {
    if (!userId) return null;

    abortRef.current = new AbortController();
    try {
      const resp = await fetch(`${API_BASE}/api/sync?userId=${encodeURIComponent(userId)}`, {
        signal: abortRef.current.signal,
      });

      if (resp.status === 404) return null;          // 新账号，无数据
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json: SyncResponse = await resp.json();
      return json;
    } catch (err: any) {
      if (err.name === 'AbortError') return null;
      // 网络失败：降级由上层处理，这里只记录错误
      console.warn('[useSync] GET 拉取失败，降级使用本地数据:', err.message);
      return null;
    }
  }, [userId]);

  // ─── POST：上报本地数据到服务器 ─────────────────────────
  const push = useCallback(async (payload: SyncPayload): Promise<PushResponse | null> => {
    if (!userId) return null;

    abortRef.current = new AbortController();
    try {
      const resp = await fetch(`${API_BASE}/api/sync`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
        signal:  abortRef.current.signal,
      });

      if (resp.status === 413) {
        setResult(r => ({ ...r, error: '数据过大，无法同步' }));
        return null;
      }
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const json: PushResponse = await resp.json();
      return json;
    } catch (err: any) {
      if (err.name === 'AbortError') return null;
      console.warn('[useSync] POST 上报失败:', err.message);
      setResult(r => ({ ...r, error: err.message }));
      return null;
    }
  }, [userId]);

  // ─── 取消当前的 pending 请求 ─────────────────────────────
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    if (pushTimerRef.current) {
      clearTimeout(pushTimerRef.current);
      pushTimerRef.current = null;
    }
  }, []);

  // ─── 防抖上报：debouncedState 变化时，2 秒后 POST ─────────
  // （由调用方传入 debouncedState，SyncContext 负责防抖）
  // 本 hook 暴露 triggerPush 方法供上层触发

  return { pull, push, cancel, result, setResult };
}