import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { PlayerBar } from '@/components/layout/player-bar';
import { MobileDrawer } from '@/components/layout/mobile-drawer';
import { QueuePanel } from '@/components/player/queue-panel';
import { MiniPlayer } from '@/components/player/mini-player';
import { KeyboardShortcutsHint } from '@/components/player/keyboard-shortcuts-hint';

export const metadata: Metadata = {
  title: { default: 'Soundwave', template: '%s · Soundwave' },
};

/**
 * (app) layout — authenticated shell.
 *
 * Layout structure:
 * ┌──────────┬──────────────────────────┬──────────────┐
 * │          │  TopBar (h-16 sticky)    │              │
 * │ Sidebar  ├──────────────────────────┤  QueuePanel  │
 * │ (240px)  │  <page>  (scrollable)   │  (272px,     │
 * │ desktop  │                          │   when open) │
 * │          │                          │              │
 * ├──────────┴──────────────────────────┴──────────────┤
 * │  PlayerBar (h-20 sticky)                            │
 * └─────────────────────────────────────────────────────┘
 *
 * Mobile: sidebar → MobileDrawer sheet
 *         QueuePanel → full-height overlay
 *         MiniPlayer → floating bar when PlayerBar offscreen
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex h-svh overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile nav drawer */}
        <MobileDrawer />

        {/* Main column */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <TopBar />

          {/* Content row: page + optional queue panel */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <main
              id="main-content"
              className="flex-1 overflow-y-auto overflow-x-hidden"
            >
              {children}
            </main>

            {/* Queue panel renders here on desktop (pushes content) */}
            {/* On mobile it's a fixed overlay — see QueuePanel internals */}
            <QueuePanel />
          </div>

          {/* Bottom player — always visible */}
          <PlayerBar />
        </div>
      </div>

      {/* Floating overlays: mini player (mobile) + keyboard hint (desktop) */}
      <MiniPlayer />
      <KeyboardShortcutsHint />
    </ProtectedRoute>
  );
}
