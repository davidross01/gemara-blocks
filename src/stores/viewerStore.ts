import { create } from "zustand";

interface ViewerState {
  activeBlockId: string | null;
  setActive: (id: string | null) => void;
  tab: "translation" | "flow" | "notes";
  setTab: (t: "translation" | "flow" | "notes") => void;
  translationTab: "gemara" | "rashi" | "tosafot";
  setTranslationTab: (t: "gemara" | "rashi" | "tosafot") => void;
  activeCommentaryId: string | null;
  setActiveCommentaryId: (id: string | null) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  activeBlockId: null,
  setActive: (id) => set({ activeBlockId: id }),
  tab: "translation",
  setTab: (t) => set({ tab: t }),
  translationTab: "gemara",
  setTranslationTab: (t) => set({ translationTab: t }),
  activeCommentaryId: null,
  setActiveCommentaryId: (id) => set({ activeCommentaryId: id }),
}));