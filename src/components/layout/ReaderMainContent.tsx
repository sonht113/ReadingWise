"use client";

import { useReaderStore } from "@/stores/reader-store";
import { ArticleContent } from "@/components/reader/ArticleContent";
import { QuestionPanelWrapper } from "@/components/question/QuestionPanelWrapper";
import { NotesPanelDynamic } from "@/components/notes/NotesPanelDynamic";

export function ReaderMainContent() {
  const notesOpen = useReaderStore((s) => s.notesOpen);
  const toggleNotes = useReaderStore((s) => s.toggleNotes);

  return (
    <div className="flex-1 flex min-h-0">
      <div className="flex-1 flex flex-col min-w-0">
        <ArticleContent />
        <QuestionPanelWrapper />
      </div>
      {notesOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={toggleNotes}
          />
          <NotesPanelDynamic />
        </>
      )}
    </div>
  );
}
