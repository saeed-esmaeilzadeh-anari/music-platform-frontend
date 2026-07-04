'use client';

import { createContext, useCallback, useContext, useReducer } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

type ToastAction =
  | { type: 'ADD'; toast: Toast }
  | { type: 'REMOVE'; id: string };

// ─── Context ──────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Reducer ──────────────────────────────────────────────────────────────────

function toastReducer(state: Toast[], action: ToastAction): Toast[] {
  switch (action.type) {
    case 'ADD':
      return [...state.slice(-4), action.toast]; // cap at 5 visible
    case 'REMOVE':
      return state.filter((t) => t.id !== action.id);
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, string> = {
  default: 'bg-card border border-border text-foreground',
  success: 'bg-emerald-950 border border-emerald-800 text-emerald-100',
  error: 'bg-red-950 border border-red-800 text-red-100',
  warning: 'bg-amber-950 border border-amber-800 text-amber-100',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const toast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: 'ADD', toast: { ...opts, id } });
  }, []);

  const success = useCallback(
    (title: string, description?: string) =>
      toast({ title, description, variant: 'success', duration: 4000 }),
    [toast],
  );

  const error = useCallback(
    (title: string, description?: string) =>
      toast({ title, description, variant: 'error', duration: 6000 }),
    [toast],
  );

  const warning = useCallback(
    (title: string, description?: string) =>
      toast({ title, description, variant: 'warning', duration: 5000 }),
    [toast],
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, warning }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            duration={t.duration ?? 4000}
            onOpenChange={(open) => {
              if (!open) dispatch({ type: 'REMOVE', id: t.id });
            }}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg p-4 shadow-lg',
              'data-[state=open]:animate-fade-in data-[state=closed]:opacity-0 transition-opacity',
              VARIANT_STYLES[t.variant],
            )}
          >
            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="text-sm font-semibold leading-snug">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="mt-1 text-sm opacity-80 leading-snug">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none">
              ×
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 w-[380px] max-w-[calc(100vw-2rem)] outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}