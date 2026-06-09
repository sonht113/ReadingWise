"use client";

import { useReaderStore } from "@/stores/reader-store";

export function ArticleTabs() {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useReaderStore();

  if (openTabs.length === 0) {
    return null;
  }

  return (
    <div className="flex border-b bg-muted/30 shrink-0 overflow-x-auto">
      {openTabs.map((tab) => (
        <div
          key={tab.articleId}
          className={`group flex items-center border-r border-border shrink-0 ${
            tab.articleId === activeTabId
              ? "bg-background border-b-2 border-b-primary -mb-px"
              : "hover:bg-accent/50"
          }`}
        >
          <button
            onClick={() => setActiveTab(tab.articleId)}
            className="px-3 py-2 text-sm whitespace-nowrap max-w-[160px] truncate"
          >
            {tab.title}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.articleId);
            }}
            className="px-1.5 py-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm mr-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}
