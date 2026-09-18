import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  darkMode: boolean;
  colorblindMode: boolean;
  showAllStages: boolean;
  setDarkMode: (v: boolean) => void;
  setColorblindMode: (v: boolean) => void;
  setShowAllStages: (v: boolean) => void;
  toggleDarkMode: () => void;
  toggleColorblindMode: () => void;
  toggleShowAllStages: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      colorblindMode: false,
      showAllStages: false,
      setDarkMode: (v) => set({ darkMode: v }),
      setColorblindMode: (v) => set({ colorblindMode: v }),
      setShowAllStages: (v) => set({ showAllStages: v }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleColorblindMode: () => set((s) => ({ colorblindMode: !s.colorblindMode })),
      toggleShowAllStages: () => set((s) => ({ showAllStages: !s.showAllStages })),
    }),
    { name: "gb-settings" },
  ),
);