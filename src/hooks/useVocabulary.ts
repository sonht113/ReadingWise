import { useQuery } from "@tanstack/react-query";
import type { Vocabulary } from "@/types";

async function searchVocabulary(
  phrase: string,
): Promise<Vocabulary | null> {
  const res = await fetch(
    `/api/vocabulary?phrase=${encodeURIComponent(phrase)}`,
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to search vocabulary");
  return res.json();
}

async function createVocabulary(phrase: string): Promise<Vocabulary> {
  const res = await fetch("/api/vocabulary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phrase }),
  });
  if (!res.ok) throw new Error("Failed to create vocabulary");
  return res.json();
}

export function useVocabulary(phrase: string | null) {
  return useQuery({
    queryKey: ["vocabulary", phrase],
    queryFn: () => searchVocabulary(phrase!),
    enabled: !!phrase,
  });
}

export { createVocabulary };
