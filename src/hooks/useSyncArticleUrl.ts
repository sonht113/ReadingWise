"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useReaderStore } from "@/stores/reader-store";

export function useSyncArticleUrl() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTabId = useReaderStore((s) => s.activeTabId);
  const openArticle = useReaderStore((s) => s.openArticle);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (syncingRef.current) return;

    const articleId = searchParams.get("article");
    if (articleId && articleId !== activeTabId) {
      syncingRef.current = true;
      fetch(`/api/articles/${articleId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((article) => {
          if (article?.title) {
            openArticle(article.id, article.title);
          }
        })
        .finally(() => {
          syncingRef.current = false;
        });
    }
  }, [searchParams]);

  useEffect(() => {
    if (syncingRef.current) return;

    const current = searchParams.get("article");
    if (activeTabId && activeTabId !== current) {
      router.replace(`/?article=${activeTabId}`, { scroll: false });
    } else if (!activeTabId && current) {
      router.replace("/", { scroll: false });
    }
  }, [activeTabId, searchParams, router]);
}
