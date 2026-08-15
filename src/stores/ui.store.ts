import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed:  boolean;
  toggleSidebar:     () => void;
  mobileDrawerOpen:  boolean;
  openMobileDrawer:  () => void;
  closeMobileDrawer: () => void;
  queuePanelOpen:    boolean;
  toggleQueuePanel:  () => void;
  closeQueuePanel:   () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed:  false,
      toggleSidebar:     () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      mobileDrawerOpen:  false,
      openMobileDrawer:  () => set({ mobileDrawerOpen: true }),
      closeMobileDrawer: () => set({ mobileDrawerOpen: false }),
      queuePanelOpen:    false,
      toggleQueuePanel:  () => set(s => ({ queuePanelOpen: !s.queuePanelOpen })),
      closeQueuePanel:   () => set({ queuePanelOpen: false }),
    }),
    {
      name: 'ms-ui',
      partialize: s => ({ sidebarCollapsed: s.sidebarCollapsed }),
    },
  ),
);
