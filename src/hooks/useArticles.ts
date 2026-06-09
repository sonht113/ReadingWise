import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Article } from "@/types";

async function fetchArticles(collectionId: string): Promise<Article[]> {
  const res = await fetch(
    `/api/articles?collectionId=${encodeURIComponent(collectionId)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch articles");
  return res.json();
}

async function deleteArticle(id: string): Promise<void> {
  const res = await fetch(`/api/articles?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete article");
}

export function useArticles(collectionId: string | null) {
  return useQuery({
    queryKey: ["articles", collectionId],
    queryFn: () => fetchArticles(collectionId!),
    enabled: !!collectionId,
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}
