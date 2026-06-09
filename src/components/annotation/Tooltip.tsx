"use client";

import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import type { Vocabulary } from "@/types";

interface TooltipProps {
  vocabularyId: string | null;
  rect: DOMRect | null;
}

async function fetchVocabulary(id: string): Promise<Vocabulary> {
  const res = await fetch(
    `/api/vocabulary?id=${encodeURIComponent(id)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch vocabulary");
  return res.json();
}

export function Tooltip({ vocabularyId, rect }: TooltipProps) {
  const { data: vocabulary } = useQuery({
    queryKey: ["vocabulary-tooltip", vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId!),
    enabled: !!vocabularyId,
    staleTime: Infinity,
  });

  if (!vocabularyId || !rect || !vocabulary) return null;

  const top = rect.bottom + 8;
  const left = rect.left + rect.width / 2;

  return createPortal(
    <div
      className="fixed z-50 max-w-xs bg-popover border rounded-lg shadow-lg p-3 text-sm"
      style={{
        top: `${top}px`,
        left: `${left}px`,
        transform: "translateX(-50%)",
      }}
    >
      {vocabulary.translation && (
        <p className="font-medium text-foreground mb-1">
          {vocabulary.translation}
        </p>
      )}
      {vocabulary.explanation && (
        <p className="text-muted-foreground text-xs mb-1">
          {vocabulary.explanation}
        </p>
      )}
      {vocabulary.example && (
        <p className="text-muted-foreground text-xs italic">
          {vocabulary.example}
        </p>
      )}
    </div>,
    document.body,
  );
}
