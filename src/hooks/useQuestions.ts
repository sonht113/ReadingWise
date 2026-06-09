import { useQuery } from "@tanstack/react-query";
import type { Question } from "@/types";

async function fetchQuestions(articleId: string): Promise<Question[]> {
  const res = await fetch(`/api/questions?articleId=${articleId}`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}

export function useQuestions(articleId: string | null) {
  return useQuery({
    queryKey: ["questions", articleId],
    queryFn: () => fetchQuestions(articleId!),
    enabled: !!articleId,
  });
}
