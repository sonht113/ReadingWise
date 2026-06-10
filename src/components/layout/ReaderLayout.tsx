import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArticleTabs } from "@/components/reader/ArticleTabs";
import { ArticleContent } from "@/components/reader/ArticleContent";
import { QuestionPanelWrapper } from "@/components/question/QuestionPanelWrapper";
import { SyncArticleUrl } from "@/components/layout/SyncArticleUrl";

export function ReaderLayout() {
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
        <ArticleContent />
        <QuestionPanelWrapper />
      </div>
    </div>
  );
}
