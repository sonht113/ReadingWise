"use client";

import type { Article } from "@/types";
import type { ReadingMode } from "@/stores/reader-store";
import { AnnotationLayer } from "./AnnotationLayer";

interface BilingualArticleContentProps {
  articleId: string;
  article: Article;
  mode: ReadingMode;
  onHover: (vocabularyId: string, rect: DOMRect) => void;
  onLeave: () => void;
  onClick: (vocabularyId: string) => void;
}

export function BilingualArticleContent({
  articleId,
  article,
  mode,
  onHover,
  onLeave,
  onClick,
}: BilingualArticleContentProps) {
  const hasTranslation =
    !!article.translatedContent && article.translatedContent.length > 0;

  if (mode === "translated" && hasTranslation) {
    return (
      <div className="text-base leading-relaxed whitespace-pre-line select-text text-muted-foreground">
        {article.translatedContent}
      </div>
    );
  }

  if (mode === "original" || !hasTranslation) {
    return (
      <div className="text-base leading-relaxed whitespace-pre-line select-text">
        <AnnotationLayer
          articleId={articleId}
          content={article.content}
          onHover={onHover}
          onLeave={onLeave}
          onClick={onClick}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 select-text">
        <div className="text-base leading-relaxed whitespace-pre-line select-text border-r pr-4">
          <AnnotationLayer
            articleId={articleId}
            content={article.content}
            onHover={onHover}
            onLeave={onLeave}
            onClick={onClick}
          />
        </div>
        <div className="text-base leading-relaxed whitespace-pre-line text-muted-foreground select-text">
          {article.translatedContent}
        </div>
      </div>
  );
}
