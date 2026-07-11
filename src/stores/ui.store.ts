import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;

  // Mobile drawer (sidebar as sheet on small screens)
  mobileDrawerOpen: boolean;
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;

  // Now-playing queue panel (optional expandable panel)
  queuePanelOpen: boolean;
  toggleQueuePanel: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      mobileDrawerOpen: false,
      openMobileDrawer: () => set({ mobileDrawerOpen: true }),
      closeMobileDrawer: () => set({ mobileDrawerOpen: false }),

      queuePanelOpen: false,
      toggleQueuePanel: () => set((s) => ({ queuePanelOpen: !s.queuePanelOpen })),
    }),
    {
      name: 'ms-ui',
      // Only persist sidebar collapse preference across sessions
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
);