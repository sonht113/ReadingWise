import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Annotation } from "@/types";

async function fetchAnnotations(articleId: string): Promise<Annotation[]> {
  const res = await fetch(`/api/annotations/${articleId}`);
  if (!res.ok) throw new Error("Failed to fetch annotations");
  return res.json();
}

async function createAnnotation(data: {
  articleId: string;
  startOffset: number;
  endOffset: number;
  selectedText: string;
}): Promise<Annotation> {
  const res = await fetch("/api/annotations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create annotation");
  return res.json();
}

async function deleteAnnotation(id: string): Promise<void> {
  const res = await fetch(`/api/annotations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete annotation");
}

export function useAnnotations(articleId: string | null) {
  return useQuery({
    queryKey: ["annotations", articleId],
    queryFn: () => fetchAnnotations(articleId!),
    enabled: !!articleId,
  });
}

export function useCreateAnnotation(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotations", articleId] });
    },
  });
}

export function useDeleteAnnotation(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAnnotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annotations", articleId] });
    },
  });
}
