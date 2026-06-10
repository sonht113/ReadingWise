import { create } from "zustand";

interface ArticleTab {
  articleId: string;
  title: string;
}

export type ReadingMode = "original" | "side_by_side";

interface ReaderState {
  openTabs: ArticleTab[];
  activeTabId: string | null;
  selectedCollectionId: string | null;
  questionsOpen: boolean;
  readingMode: ReadingMode;

  setActiveTab: (articleId: string) => void;
  openArticle: (articleId: string, title: string) => void;
  closeTab: (articleId: string) => void;
  setSelectedCollection: (collectionId: string) => void;
  toggleQuestions: () => void;
  setReadingMode: (mode: ReadingMode) => void;
}

export const useReaderStore = create<ReaderState>((set, get) => ({
  openTabs: [],
  activeTabId: null,
  selectedCollectionId: null,
  questionsOpen: false,
  readingMode: "original",

  setActiveTab: (articleId) => set({ activeTabId: articleId }),

  openArticle: (articleId, title) => {
    const { openTabs } = get();
    const exists = openTabs.find((t) => t.articleId === articleId);
    if (exists) {
      set({ activeTabId: articleId });
      return;
    }
    set({
      openTabs: [...openTabs, { articleId, title }],
      activeTabId: articleId,
    });
  },

  closeTab: (articleId) => {
    const { openTabs, activeTabId } = get();
    const remaining = openTabs.filter((t) => t.articleId !== articleId);
    const newActive =
      activeTabId === articleId
        ? remaining[remaining.length - 1]?.articleId ?? null
        : activeTabId;
    set({ openTabs: remaining, activeTabId: newActive });
  },

  setSelectedCollection: (collectionId) =>
    set({ selectedCollectionId: collectionId }),

  toggleQuestions: () => set((s) => ({ questionsOpen: !s.questionsOpen })),

  setReadingMode: (mode) => set({ readingMode: mode }),
}));
