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

function InterleavedView({
  articleId,
  article,
  onHover,
  onLeave,
  onClick,
}: BilingualArticleContentProps) {
  const engParas = article.content.split(/\n{2,}/);
  const viParas = article.translatedContent?.split(/\n{2,}/) ?? [];

  return (
    <div className="md:hidden space-y-1">
      {engParas.map((para, i) => (
        <div
          key={i}
          className="py-3 border-b last:border-b-0 space-y-3"
        >
          <div className="text-base leading-relaxed whitespace-pre-line select-text">
            <AnnotationLayer
              articleId={articleId}
              content={para}
              onHover={onHover}
              onLeave={onLeave}
              onClick={onClick}
            />
          </div>
          {viParas[i] && (
            <div className="pl-3 border-l-2 border-muted-foreground/20">
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                {viParas[i]}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function BilingualArticleContent(props: BilingualArticleContentProps) {
  const { articleId, article, mode, onHover, onLeave, onClick } = props;

  const hasTranslation =
    !!article.translatedContent && article.translatedContent.length > 0;

  if (!hasTranslation) {
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
    <>
      <InterleavedView {...props} />

      {mode === "original" ? (
        <div className="hidden md:block text-base leading-relaxed whitespace-pre-line select-text">
          <AnnotationLayer
            articleId={articleId}
            content={article.content}
            onHover={onHover}
            onLeave={onLeave}
            onClick={onClick}
          />
        </div>
      ) : (
        <div className="hidden md:grid grid-cols-2 gap-6 select-text">
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
      )}
    </>
  );
}
