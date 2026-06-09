"use client";

import { useReaderStore } from "@/stores/reader-store";
import { useQuestions } from "@/hooks/useQuestions";
import { ChevronUp, ChevronDown } from "lucide-react";
import { QuestionPanel } from "./QuestionPanel";

export function QuestionPanelWrapper() {
  const activeTabId = useReaderStore((s) => s.activeTabId);
  const questionsOpen = useReaderStore((s) => s.questionsOpen);
  const toggleQuestions = useReaderStore((s) => s.toggleQuestions);
  const { data: questions } = useQuestions(activeTabId ?? "");

  if (!activeTabId) return null;

  const count = questions?.length ?? 0;

  return (
    <div className="border-t shrink-0">
      <button
        onClick={toggleQuestions}
        className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
      >
        <span>
          {questionsOpen ? "Hide Questions" : `Show Questions`}
          {count > 0 && !questionsOpen && (
            <span className="ml-1.5 text-xs text-muted-foreground">
              ({count})
            </span>
          )}
        </span>
        {questionsOpen ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronUp className="size-4" />
        )}
      </button>
      {questionsOpen && <QuestionPanel articleId={activeTabId} />}
    </div>
  );
}
