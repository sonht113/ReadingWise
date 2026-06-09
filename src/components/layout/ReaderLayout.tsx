import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { ArticleTabs } from "@/components/reader/ArticleTabs";
import { ArticleContent } from "@/components/reader/ArticleContent";
import { QuestionPanelWrapper } from "@/components/question/QuestionPanelWrapper";

export function ReaderLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 border-b px-3 lg:hidden shrink-0">
          <MobileSidebar />
          <span className="text-sm font-semibold">ReadingWise</span>
        </div>
        <ArticleTabs />
        <ArticleContent />
        <QuestionPanelWrapper />
      </div>
    </div>
  );
}
