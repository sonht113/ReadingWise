import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArticleTabs } from "@/components/reader/ArticleTabs";
import { ArticleContent } from "@/components/reader/ArticleContent";
import { QuestionPanelWrapper } from "@/components/question/QuestionPanelWrapper";
import { SyncArticleUrl } from "@/components/layout/SyncArticleUrl";
import { NotesPanel } from "@/components/notes/NotesPanel";
import { useReaderStore } from "@/stores/reader-store";

function ReaderContent() {
  const notesOpen = useReaderStore((s) => s.notesOpen);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Suspense>
          <SyncArticleUrl />
        </Suspense>
        <ArticleTabs />
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col min-w-0">
            <ArticleContent />
            <QuestionPanelWrapper />
          </div>
          {notesOpen && <NotesPanel />}
        </div>
      </div>
    </div>
  );
}

export function ReaderLayout() {
  return <ReaderContent />;
}
