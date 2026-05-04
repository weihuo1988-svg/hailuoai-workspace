import type { Frequency } from './data';

export interface Task {
  id: string; name: string; description: string; frequency: Frequency;
  monthlyLimit: number; monthlyCount: number; chests: number;
  password: string; lastCompletedAt: string | null;
  completedThisWeek: boolean; createdAt: string;
}
export interface Chest { id: string; createdAt: string; }
export interface AppState {
  tasks: Task[]; chests: Chest[]; blocks: Record<string, number>;
  tools: Record<string, boolean>; suits: Record<string, boolean>;
  armors: Record<string, boolean>; parentPin: string;
  lastResetDate: string; weeklyResetWeek: string; monthlyResetMonth: string;
  isNewUser: boolean;
  guideDeviceCode: string;
}
export type Tab = 'tasks' | 'chests' | 'collection';
export type GuideStep = 'none' | 'guide-task' | 'guide-chest' | 'guide-shop' | 'device-code';
