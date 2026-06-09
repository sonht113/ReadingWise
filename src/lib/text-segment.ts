import type { Annotation } from "@/types";

export interface TextSegment {
  text: string;
  isHighlight: boolean;
  annotationId?: string;
  vocabularyId?: string;
}

export function segmentText(
  content: string,
  annotations: Annotation[],
): TextSegment[] {
  const sorted = [...annotations].sort(
    (a, b) => a.startOffset - b.startOffset,
  );

  const segments: TextSegment[] = [];
  let currentOffset = 0;

  for (const annotation of sorted) {
    if (annotation.startOffset > currentOffset) {
      segments.push({
        text: content.slice(currentOffset, annotation.startOffset),
        isHighlight: false,
      });
    }
    segments.push({
      text: content.slice(annotation.startOffset, annotation.endOffset),
      isHighlight: true,
      annotationId: annotation.id,
      vocabularyId: annotation.vocabularyId,
    });
    currentOffset = annotation.endOffset;
  }

  if (currentOffset < content.length) {
    segments.push({
      text: content.slice(currentOffset),
      isHighlight: false,
    });
  }

  return segments;
}
