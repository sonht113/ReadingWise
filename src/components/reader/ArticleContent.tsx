"use client";

import { useRef, useState, useCallback } from "react";
import { useReaderStore, type ReadingMode } from "@/stores/reader-store";
import { useQuery } from "@tanstack/react-query";
import { useSelection } from "@/hooks/useSelection";
import { useCreateAnnotation } from "@/hooks/useAnnotation";
import { AnnotationLayer } from "@/components/reader/AnnotationLayer";
import { BilingualArticleContent } from "@/components/reader/BilingualArticleContent";
import { MiniToolbar } from "@/components/annotation/MiniToolbar";
import { Tooltip } from "@/components/annotation/Tooltip";
import { VocabularyDrawer } from "@/components/annotation/VocabularyDrawer";
import type { Article } from "@/types";

async function fetchArticle(id: string): Promise<Article> {
  const res = await fetch(`/api/articles/${id}`);
  if (!res.ok) throw new Error("Failed to fetch article");
  return res.json();
}

export function ArticleContent() {
  const activeTabId = useReaderStore((s) => s.activeTabId);
  const openTabs = useReaderStore((s) => s.openTabs);
  const readingMode = useReaderStore((s) => s.readingMode);
  const setReadingMode = useReaderStore((s) => s.setReadingMode);
  const containerRef = useRef<HTMLDivElement>(null);

  const { selection, clearSelection } = useSelection(containerRef);
  const createAnnotation = useCreateAnnotation(activeTabId ?? "");

  const [tooltipVocabId, setTooltipVocabId] = useState<string | null>(null);
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null);
  const [drawerVocabId, setDrawerVocabId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: ["article", activeTabId],
    queryFn: () => fetchArticle(activeTabId!),
    enabled: !!activeTabId,
  });

  const activeTab = openTabs.find((t) => t.articleId === activeTabId);

  const handleSave = useCallback(async () => {
    if (!selection || !activeTabId) return;
    try {
      await createAnnotation.mutateAsync({
        articleId: activeTabId,
        startOffset: selection.startOffset,
        endOffset: selection.endOffset,
        selectedText: selection.selectedText,
      });
      clearSelection();
    } catch {
      // Error handled by mutation state
    }
  }, [selection, activeTabId, createAnnotation, clearSelection]);

  const handleTooltipShow = useCallback(
    (vocabularyId: string, rect: DOMRect) => {
      setTooltipVocabId(vocabularyId);
      setTooltipRect(rect);
    },
    [],
  );

  const handleTooltipHide = useCallback(() => {
    setTooltipVocabId(null);
    setTooltipRect(null);
  }, []);

  const handleMarkClick = useCallback((vocabularyId: string) => {
    setDrawerVocabId(vocabularyId);
    setDrawerOpen(true);
  }, []);

  if (!activeTabId || !activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select an article to start reading</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Article not found</p>
      </div>
    );
  }

  const hasTranslation =
    !!article.translatedContent && article.translatedContent.length > 0;

  const modeOptions: { value: ReadingMode; label: string }[] = [
    { value: "original", label: "Original" },
    { value: "side_by_side", label: "Side by Side" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <article className="max-w-5xl mx-auto py-8 px-6">
        <h1 className="text-2xl font-semibold mb-2">{article.title}</h1>
        {hasTranslation && article.translatedTitle && (
          <p className="md:hidden text-base text-muted-foreground mb-4">
            {article.translatedTitle}
          </p>
        )}

        {hasTranslation && (
          <div className="hidden md:flex gap-1 mb-6 border-b pb-4">
            {modeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setReadingMode(opt.value)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  readingMode === opt.value
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        <div ref={containerRef} className="select-text">
          {hasTranslation ? (
            <BilingualArticleContent
              articleId={activeTabId}
              article={article}
              mode={readingMode}
              onHover={handleTooltipShow}
              onLeave={handleTooltipHide}
              onClick={handleMarkClick}
            />
          ) : (
            <div className="text-base leading-relaxed whitespace-pre-line select-text">
              <AnnotationLayer
                articleId={activeTabId}
                content={article.content}
                onHover={handleTooltipShow}
                onLeave={handleTooltipHide}
                onClick={handleMarkClick}
              />
            </div>
          )}
        </div>
      </article>

      {selection && (
        <MiniToolbar
          rect={selection.rect}
          onSave={handleSave}
          onCancel={clearSelection}
          isSaving={createAnnotation.isPending}
        />
      )}

      <Tooltip
        vocabularyId={tooltipVocabId}
        rect={tooltipRect}
      />

      <VocabularyDrawer
        vocabularyId={drawerVocabId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}
