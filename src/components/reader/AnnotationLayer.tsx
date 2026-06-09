"use client";

import { useAnnotations } from "@/hooks/useAnnotation";
import { segmentText } from "@/lib/text-segment";

interface AnnotationLayerProps {
  articleId: string;
  content: string;
  onHover: (vocabularyId: string, rect: DOMRect) => void;
  onLeave: () => void;
  onClick: (vocabularyId: string) => void;
}

export function AnnotationLayer({
  articleId,
  content,
  onHover,
  onLeave,
  onClick,
}: AnnotationLayerProps) {
  const { data: annotations } = useAnnotations(articleId);

  if (!annotations || annotations.length === 0) {
    return <>{content}</>;
  }

  const segments = segmentText(content, annotations);

  return (
    <>
      {segments.map((segment, i) => {
        if (!segment.isHighlight) {
          return <span key={i}>{segment.text}</span>;
        }

        return (
          <mark
            key={i}
            data-annotation-id={segment.annotationId}
            data-vocabulary-id={segment.vocabularyId}
            className="bg-yellow-200 dark:bg-yellow-800 cursor-pointer rounded-sm px-0.5"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              onHover(segment.vocabularyId!, rect);
            }}
            onMouseLeave={onLeave}
            onClick={() => onClick(segment.vocabularyId!)}
          >
            {segment.text}
          </mark>
        );
      })}
    </>
  );
}
