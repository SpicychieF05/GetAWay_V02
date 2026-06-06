import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  createRoomModalOpen: boolean;
  setCreateRoomModalOpen: (open: boolean) => void;
  activeFilter: 'all' | 'active' | 'completed';
  setActiveFilter: (filter: 'all' | 'active' | 'completed') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  createRoomModalOpen: false,
  setCreateRoomModalOpen: (open) => set({ createRoomModalOpen: open }),
  activeFilter: 'all',
  setActiveFilter: (filter) => set({ activeFilter: filter }),
}));
