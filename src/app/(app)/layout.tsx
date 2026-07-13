import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { PlayerBar } from '@/components/layout/player-bar';
import { MobileDrawer } from '@/components/layout/mobile-drawer';

export const metadata: Metadata = {
  title: {
    default: 'Soundwave',
    template: '%s · Soundwave',
  },
};

/**
 * (app) layout — wraps all authenticated pages.
 *
 * Structure:
 *   ┌──────────┬───────────────────────────┐
 *   │          │  TopBar (sticky h-16)     │
 *   │ Sidebar  ├───────────────────────────┤
 *   │ (240px)  │  <page content>           │
 *   │ desktop  │  (scrolls independently)  │
 *   │          │                           │
 *   ├──────────┴───────────────────────────┤
 *   │  PlayerBar (sticky h-20)             │
 *   └──────────────────────────────────────┘
 *
 * Mobile: sidebar hidden, hamburger opens MobileDrawer sheet.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {/* Full-height flex row: sidebar + main column */}
      <div className="flex h-svh overflow-hidden">

        {/* Desktop sidebar */}
        <Sidebar />

        {/* Mobile nav drawer (portals above everything) */}
        <MobileDrawer />

        {/* Main column: topbar + scrollable content + player */}
        <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
          <TopBar />

          {/* Page content — the only scrollable region */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            {children}
          </main>

          {/* Music player — always visible at the bottom */}
          <PlayerBar />
        </div>
      </div>
    </ProtectedRoute>
  );
}