import { useState, useEffect, useCallback, createContext, useContext } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  showToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 2500);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              animate-slide-up rounded-bubble px-4 py-3 text-sm font-medium shadow-lg
              ${toast.type === 'success' ? 'bg-adventure-green text-primary-foreground' : ''}
              ${toast.type === 'error' ? 'bg-destructive text-destructive-foreground' : ''}
              ${toast.type === 'info' ? 'bg-adventure-blue text-secondary-foreground' : ''}
            `}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <span>✅</span>}
              {toast.type === 'error' && <span>❌</span>}
              {toast.type === 'info' && <span>💡</span>}
              {toast.message}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
