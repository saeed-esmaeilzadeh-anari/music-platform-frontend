'use client';

import { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Shortcut {
  keys: string[];
  label: string;
  category: 'Playback' | 'Navigation' | 'Volume';
}

const SHORTCUTS: Shortcut[] = [
  { keys: ['Space'],        label: 'Play / Pause',       category: 'Playback'   },
  { keys: ['Shift', '→'],  label: 'Next track',          category: 'Playback'   },
  { keys: ['Shift', '←'],  label: 'Previous track',      category: 'Playback'   },
  { keys: ['Alt', 'S'],    label: 'Toggle shuffle',       category: 'Playback'   },
  { keys: ['Alt', 'R'],    label: 'Cycle repeat mode',    category: 'Playback'   },
  { keys: ['Alt', '→'],    label: 'Skip forward 10s',    category: 'Navigation' },
  { keys: ['Alt', '←'],    label: 'Skip backward 10s',   category: 'Navigation' },
  { keys: ['M'],            label: 'Mute / Unmute',       category: 'Volume'     },
  { keys: ['Alt', '↑'],    label: 'Volume up',            category: 'Volume'     },
  { keys: ['Alt', '↓'],    label: 'Volume down',          category: 'Volume'     },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded border border-border bg-secondary text-[10px] font-semibold font-mono shadow-sm">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsHint() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === '?') { e.preventDefault(); setOpen(v => !v); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const categories = ['Playback', 'Navigation', 'Volume'] as const;

  return (
    <>
      {/* Floating trigger (desktop only) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
        className="fixed bottom-24 right-4 z-40 hidden lg:flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors shadow-sm"
      >
        <Keyboard className="h-3.5 w-3.5" />
      </button>

      {/* Modal */}
      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-label="Keyboard shortcuts"
            aria-modal="true"
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2.5">
                <Keyboard className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Keyboard shortcuts</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close"
                className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Shortcut list */}
            <div className="divide-y divide-border max-h-[60vh] overflow-y-auto">
              {categories.map(cat => {
                const items = SHORTCUTS.filter(s => s.category === cat);
                if (!items.length) return null;
                return (
                  <div key={cat} className="px-5 py-4">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{cat}</p>
                    <div className="space-y-2.5">
                      {items.map(s => (
                        <div key={s.label} className="flex items-center justify-between gap-4">
                          <span className="text-sm text-muted-foreground">{s.label}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            {s.keys.map((k, i) => (
                              <span key={k} className="flex items-center gap-1">
                                {i > 0 && <span className="text-[10px] text-muted-foreground/50">+</span>}
                                <Kbd>{k}</Kbd>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-5 py-3 text-center">
              <p className="text-[11px] text-muted-foreground/60">
                Press <Kbd>?</Kbd> to toggle · <Kbd>Esc</Kbd> to close
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
