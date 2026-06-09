"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Vocabulary } from "@/types";

interface VocabularyDrawerProps {
  vocabularyId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function fetchVocabulary(id: string): Promise<Vocabulary> {
  const res = await fetch(
    `/api/vocabulary?id=${encodeURIComponent(id)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch vocabulary");
  return res.json();
}

export function VocabularyDrawer({
  vocabularyId,
  open,
  onOpenChange,
}: VocabularyDrawerProps) {
  const { data: vocabulary } = useQuery({
    queryKey: ["vocabulary-drawer", vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId!),
    enabled: !!vocabularyId && open,
    staleTime: Infinity,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-80">
        <SheetHeader>
          <SheetTitle>
            {vocabulary?.phrase ?? "Vocabulary"}
          </SheetTitle>
        </SheetHeader>
        {vocabulary && (
          <div className="flex flex-col gap-4 px-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Translation
              </p>
              <p className="text-sm">
                {vocabulary.translation ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Explanation
              </p>
              <p className="text-sm">
                {vocabulary.explanation ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Example
              </p>
              <p className="text-sm italic">
                {vocabulary.example ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                Created
              </p>
              <p className="text-sm">
                {new Date(vocabulary.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
