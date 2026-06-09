import { useMutation } from "@tanstack/react-query";

interface SubmitAnswer {
  questionId: string;
  answer: string;
}

interface SubmitAnswersPayload {
  answers: SubmitAnswer[];
}

interface AnswerResult {
  questionId: string;
  answer: string;
  isCorrect: boolean;
}

interface SubmitAnswersResponse {
  total: number;
  correct: number;
  incorrect: number;
  results: AnswerResult[];
}

async function submitAnswers(
  payload: SubmitAnswersPayload,
): Promise<SubmitAnswersResponse> {
  const res = await fetch("/api/answers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to submit answers");
  return res.json();
}

export function useSubmitAnswers() {
  return useMutation({
    mutationFn: submitAnswers,
  });
}
