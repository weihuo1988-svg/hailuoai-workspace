import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { AdventureMap, MapNode } from './types';
import { generateId, generateDefaultRewards, optimizeRoute, simulateAIRecognition } from './types';

interface AppState {
  maps: AdventureMap[];
  currentMapId: string | null;
  // Temporary state for creation flow
  uploadedImages: string[];
  pendingNodes: MapNode[];
}

type Action =
  | { type: 'SET_UPLOADED_IMAGES'; images: string[] }
  | { type: 'ANALYZE_IMAGES'; nodes: MapNode[] }
  | { type: 'REORDER_NODES'; nodes: MapNode[] }
  | { type: 'CREATE_MAP'; title: string }
  | { type: 'SET_CURRENT_MAP'; mapId: string | null }
  | { type: 'COMPLETE_NODE'; mapId: string; nodeId: string; checkinImage: string }
  | { type: 'UNLOCK_REWARD'; mapId: string; rewardId: string }
  | { type: 'UPDATE_REWARD'; mapId: string; rewardId: string; title: string; description: string }
  | { type: 'UPDATE_PENDING_NODE'; nodeId: string; name: string; description: string }
  | { type: 'DELETE_MAP'; mapId: string }
  | { type: 'LOAD_STATE'; state: AppState };

const STORAGE_KEY = 'adventure-explorer-state';

function loadFromStorage(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return {
    maps: [],
    currentMapId: null,
    uploadedImages: [],
    pendingNodes: [],
  };
}

function saveToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_UPLOADED_IMAGES':
      return { ...state, uploadedImages: action.images };

    case 'ANALYZE_IMAGES': {
      return { ...state, pendingNodes: action.nodes };
    }

    case 'REORDER_NODES':
      return { ...state, pendingNodes: action.nodes };

    case 'UPDATE_PENDING_NODE': {
      const pendingNodes = state.pendingNodes.map(n =>
        n.id === action.nodeId
          ? { ...n, name: action.name, description: action.description }
          : n
      );
      return { ...state, pendingNodes };
    }

    case 'CREATE_MAP': {
      const nodes = state.pendingNodes.map((n, i) => ({ ...n, order: i }));
      const rewards = generateDefaultRewards(nodes.length);
      // Assign rewards to nodes
      nodes.forEach((node, i) => {
        if (i < rewards.length) {
          rewards[i].nodeId = node.id;
        }
      });
      const newMap: AdventureMap = {
        id: generateId(),
        title: action.title,
        createdAt: Date.now(),
        nodes,
        customRewards: rewards,
        isComplete: false,
      };
      return {
        ...state,
        maps: [newMap, ...state.maps],
        currentMapId: newMap.id,
        uploadedImages: [],
        pendingNodes: [],
      };
    }

    case 'SET_CURRENT_MAP':
      return { ...state, currentMapId: action.mapId };

    case 'COMPLETE_NODE': {
      const maps = state.maps.map(m => {
        if (m.id !== action.mapId) return m;
        const nodes = m.nodes.map(n =>
          n.id === action.nodeId
            ? { ...n, isCompleted: true, checkinImageUrl: action.checkinImage }
            : n
        );
        // Unlock corresponding reward
        const completedCount = nodes.filter(n => n.isCompleted).length;
        const rewards = m.customRewards.map((r, i) =>
          i < completedCount ? { ...r, isUnlocked: true } : r
        );
        const isComplete = nodes.every(n => n.isCompleted);
        return { ...m, nodes, customRewards: rewards, isComplete };
      });
      return { ...state, maps };
    }

    case 'UNLOCK_REWARD': {
      const maps = state.maps.map(m => {
        if (m.id !== action.mapId) return m;
        const customRewards = m.customRewards.map(r =>
          r.id === action.rewardId ? { ...r, isUnlocked: true } : r
        );
        return { ...m, customRewards };
      });
      return { ...state, maps };
    }

    case 'UPDATE_REWARD': {
      const maps = state.maps.map(m => {
        if (m.id !== action.mapId) return m;
        const customRewards = m.customRewards.map(r =>
          r.id === action.rewardId
            ? { ...r, title: action.title, description: action.description }
            : r
        );
        return { ...m, customRewards };
      });
      return { ...state, maps };
    }

    case 'DELETE_MAP':
      return {
        ...state,
        maps: state.maps.filter(m => m.id !== action.mapId),
        currentMapId: state.currentMapId === action.mapId ? null : state.currentMapId,
      };

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  getCurrentMap: () => AdventureMap | undefined;
  analyzeImages: (images: string[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadFromStorage);

  // Persist on every state change
  React.useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const getCurrentMap = useCallback(() => {
    return state.maps.find(m => m.id === state.currentMapId);
  }, [state.maps, state.currentMapId]);

  const analyzeImages = useCallback((images: string[]) => {
    dispatch({ type: 'SET_UPLOADED_IMAGES', images });
    // Simulate AI recognition
    const recognized = simulateAIRecognition(images.length);
    const nodes: MapNode[] = recognized.map((r, i) => ({
      ...r,
      referenceImageUrl: images[i] || images[0],
    }));
    const optimized = optimizeRoute(nodes);
    dispatch({ type: 'ANALYZE_IMAGES', nodes: optimized });
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch, getCurrentMap, analyzeImages }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
