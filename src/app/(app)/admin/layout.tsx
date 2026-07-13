import type { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AdminRoute } from '@/components/auth/admin-route';
import { Sidebar } from '@/components/layout/sidebar';
import { TopBar } from '@/components/layout/topbar';
import { PlayerBar } from '@/components/layout/player-bar';
import { MobileDrawer } from '@/components/layout/mobile-drawer';

export const metadata: Metadata = {
  title: {
    default: 'Admin · Soundwave',
    template: '%s · Admin · Soundwave',
  },
};

/**
 * Admin layout — identical chrome to (app) layout but gated
 * behind AdminRoute which requires role === 'ADMIN'.
 *
 * Guard chain:  ProtectedRoute (must be logged in)
 *                 └─ AdminRoute (must be ADMIN role)
 *                      └─ page content
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminRoute>
        <div className="flex h-svh overflow-hidden">
          <Sidebar />
          <MobileDrawer />

          <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
            <TopBar />

            {/* Admin banner */}
            <div className="flex items-center gap-2 border-b border-amber-800/40 bg-amber-950/30 px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden />
              <span className="text-xs font-medium text-amber-400">Admin mode</span>
            </div>

            <main
              id="main-content"
              className="flex-1 overflow-y-auto overflow-x-hidden"
            >
              {children}
            </main>

            <PlayerBar />
          </div>
        </div>
      </AdminRoute>
    </ProtectedRoute>
  );
}