// chat-app-client/src/stores/sidebarStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useSidebarStore = create(
  persist(
    (set) => ({
      chatCollapsed: false,
      feedCollapsed: false,
      workspaceCollapsed: false,
      toggleChat: () => set((s) => ({ chatCollapsed: !s.chatCollapsed })),
      toggleFeed: () => set((s) => ({ feedCollapsed: !s.feedCollapsed })),
      toggleWorkspace: () =>
        set((s) => ({ workspaceCollapsed: !s.workspaceCollapsed })),
    }),
    { name: "convox-sidebar-state" }
  )
);

export default useSidebarStore;
