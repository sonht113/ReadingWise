"use client";

import { useState } from "react";
import { Menu, X, Notebook } from "lucide-react";
import { useReaderStore } from "@/stores/reader-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/Sidebar";

export function ArticleTabs() {
  const { openTabs, activeTabId, setActiveTab, closeTab } = useReaderStore();
  const notesOpen = useReaderStore((s) => s.notesOpen);
  const toggleNotes = useReaderStore((s) => s.toggleNotes);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (openTabs.length === 0) {
    return (
      <header className="flex items-center gap-2 border-b bg-background shrink-0 h-11 px-3 shadow-sm">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden -ml-1"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="size-4" />
        </Button>
        <span className="text-sm font-semibold text-muted-foreground select-none flex-1">
          ReadingWise
        </span>
        <button
          type="button"
          onClick={toggleNotes}
          className={`p-1.5 rounded-md transition-colors ${
            notesOpen
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Notebook className="size-4" />
        </button>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar onArticleClick={() => setSidebarOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
    );
  }

  return (
    <header className="flex items-center gap-1.5 border-b bg-background shrink-0 h-11 px-2 shadow-sm">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden shrink-0"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="size-4" />
      </Button>

      <span className="text-sm font-semibold text-muted-foreground select-none shrink-0 px-1 hidden sm:block">
        ReadingWise
      </span>

      <div className="flex items-center gap-1 overflow-x-auto flex-1 mx-1">
        {openTabs.map((tab) => {
          const isActive = tab.articleId === activeTabId;
          return (
            <div
              key={tab.articleId}
              className={`group flex items-center shrink-0 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <button
                onClick={() => setActiveTab(tab.articleId)}
                className="px-2.5 py-1.5 whitespace-nowrap max-w-[140px] truncate cursor-pointer"
              >
                {tab.title}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.articleId);
                }}
                className={`p-0.5 rounded-full mr-1 transition-colors ${
                  isActive
                    ? "hover:bg-primary-foreground/20 text-primary-foreground/70 hover:text-primary-foreground"
                    : "hover:bg-destructive/15 text-muted-foreground/50 hover:text-destructive"
                }`}
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}
      </div>

        <button
          type="button"
          onClick={toggleNotes}
          className={`p-1.5 rounded-md transition-colors shrink-0 ${
            notesOpen
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          <Notebook className="size-4" />
        </button>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Sidebar onArticleClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
