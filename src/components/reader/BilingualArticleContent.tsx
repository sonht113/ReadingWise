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

  if (mode === "side_by_side") {
    return (
      <div className="grid grid-cols-2 gap-6">
        <div className="text-base leading-relaxed whitespace-pre-line select-text border-r pr-4">
          <AnnotationLayer
            articleId={articleId}
            content={article.content}
            onHover={onHover}
            onLeave={onLeave}
            onClick={onClick}
          />
        </div>
        <div className="text-base leading-relaxed whitespace-pre-line text-muted-foreground">
          {article.translatedContent}
        </div>
      </div>
    );
  }

  const enParagraphs = article.content.split(/\n\n+/);
  const viParagraphs = (article.translatedContent ?? "").split(/\n\n+/);

  return (
    <div className="space-y-4">
      {enParagraphs.map((enPara, i) => (
        <div key={i} className="space-y-2">
          <div className="text-base leading-relaxed whitespace-pre-line select-text">
            <AnnotationLayer
              articleId={articleId}
              content={enPara}
              onHover={onHover}
              onLeave={onLeave}
              onClick={onClick}
            />
          </div>
          {viParagraphs[i] && (
            <div className="text-base leading-relaxed whitespace-pre-line text-muted-foreground pl-4 border-l-2 border-muted">
              {viParagraphs[i]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
