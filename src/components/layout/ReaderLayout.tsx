import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArticleTabs } from "@/components/reader/ArticleTabs";
import { SyncArticleUrl } from "@/components/layout/SyncArticleUrl";
import { ReaderMainContent } from "@/components/layout/ReaderMainContent";

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
        <ReaderMainContent />
      </div>
    </div>
  );
}
