import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ArticleNote {
  id: string;
  userId: string;
  articleId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchNote(articleId: string): Promise<ArticleNote | null> {
  const res = await fetch(`/api/articles/${articleId}/notes`);
  if (!res.ok) throw new Error("Failed to fetch note");
  return res.json();
}

async function saveNote(articleId: string, content: string): Promise<ArticleNote> {
  const res = await fetch(`/api/articles/${articleId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to save note");
  return res.json();
}

async function deleteNote(articleId: string): Promise<void> {
  const res = await fetch(`/api/articles/${articleId}/notes`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete note");
}

export function useArticleNote(articleId: string | null) {
  return useQuery({
    queryKey: ["article-note", articleId],
    queryFn: () => fetchNote(articleId!),
    enabled: !!articleId,
  });
}

export function useSaveNote(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => saveNote(articleId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-note", articleId] });
    },
  });
}

export function useDeleteNote(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteNote(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["article-note", articleId] });
    },
  });
}
