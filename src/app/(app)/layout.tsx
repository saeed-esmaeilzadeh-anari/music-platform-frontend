import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Sidebar }        from '@/components/layout/sidebar';
import { TopBar }         from '@/components/layout/topbar';
import { MobileDrawer }   from '@/components/layout/mobile-drawer';
import { PlayerBar }      from '@/components/player/player-bar';
import { PlayerShell }    from '@/components/player/player-shell';

export const metadata: Metadata = {
  title: { default: 'Soundwave', template: '%s · Soundwave' },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {/*
        Full-height flex row:
          ┌──────────┬──────────────────────────────────────┐
          │          │  TopBar                              │
          │ Sidebar  ├───────────────────┬──────────────────┤
          │          │  <page content>   │  QueuePanel      │
          │          │  (scrolls alone)  │  (when open)     │
          │          ├───────────────────┴──────────────────┤
          │          │  PlayerBar                           │
          └──────────┴──────────────────────────────────────┘
        MiniPlayer and KeyboardShortcutsHint float above everything (fixed).
      */}
      <div className="flex h-svh overflow-hidden">
        <Sidebar />
        <MobileDrawer />

        {/* Main column */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <TopBar />

          {/* Content + QueuePanel side-by-side */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <main
              id="main-content"
              className="flex-1 overflow-y-auto overflow-x-hidden"
            >
              {children}
            </main>

            {/*
              PlayerShell renders QueuePanel here as a sibling to <main>
              (pushes content on desktop, overlays on mobile).
              MiniPlayer and KeyboardShortcutsHint are position:fixed,
              so they escape this stacking context automatically.
            */}
            <PlayerShell />
          </div>

          <PlayerBar />
        </div>
      </div>
    </ProtectedRoute>
  );
}
