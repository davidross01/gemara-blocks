import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StudyState {
  notes: Record<string, string>; // key = `${ref}::${segmentId}`
  bookmarks: Record<string, boolean>;
  setNote: (key: string, body: string) => void;
  toggleBookmark: (key: string) => void;
  isBookmarked: (key: string) => boolean;
  getNote: (key: string) => string;
}

export const useStudyStore = create<StudyState>()(
  persist(
    (set, get) => ({
      notes: {},
      bookmarks: {},
      setNote: (key, body) =>
        set((s) => ({ notes: { ...s.notes, [key]: body } })),
      toggleBookmark: (key) =>
        set((s) => ({
          bookmarks: { ...s.bookmarks, [key]: !s.bookmarks[key] },
        })),
      isBookmarked: (key) => Boolean(get().bookmarks[key]),
      getNote: (key) => get().notes[key] ?? "",
    }),
    { name: "gemara-blocks-study" },
  ),
);

export const studyKey = (ref: string, segId: string) => `${ref}::${segId}`;