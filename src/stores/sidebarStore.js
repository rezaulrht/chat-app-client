// chat-app-client/src/stores/sidebarStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSidebarStore = create(
  persist(
    (set) => ({
      chatCollapsed: false,
      feedCollapsed: false,
      workspaceCollapsed: false,
      chatSidebarWidth: 320,
      workspaceSidebarWidth: 264,
      toggleChat: () => set((s) => ({ chatCollapsed: !s.chatCollapsed })),
      toggleFeed: () => set((s) => ({ feedCollapsed: !s.feedCollapsed })),
      toggleWorkspace: () =>
        set((s) => ({ workspaceCollapsed: !s.workspaceCollapsed })),
      setChatSidebarWidth: (width) => set({ chatSidebarWidth: Math.max(200, Math.min(500, width)) }),
      setWorkspaceSidebarWidth: (width) => set({ workspaceSidebarWidth: Math.max(200, Math.min(400, width)) }),
    }),
    { name: "convox-sidebar-state" }
  )
);

export default useSidebarStore;
