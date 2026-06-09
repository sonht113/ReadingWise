"use client";

import { useState } from "react";
import { useQuestions } from "@/hooks/useQuestions";
import { useSubmitAnswers } from "@/hooks/useAnswers";
import { Button } from "@/components/ui/button";
import { MultipleChoice } from "./MultipleChoice";
import { TrueFalseNG } from "./TrueFalseNG";
import { MatchingHeading } from "./MatchingHeading";
import { FillInBlank } from "./FillInBlank";
import { ResultModal } from "./ResultModal";

interface QuestionPanelProps {
  articleId: string;
}

interface AnswerState {
  [questionId: string]: string;
}

interface ScoreResult {
  total: number;
  correct: number;
  incorrect: number;
  results: { questionId: string; answer: string; isCorrect: boolean }[];
}

export function QuestionPanel({ articleId }: QuestionPanelProps) {
  const { data: questions, isLoading } = useQuestions(articleId);
  const submitAnswers = useSubmitAnswers();

  const [answers, setAnswers] = useState<AnswerState>({});
  const [score, setScore] = useState<ScoreResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!questions) return;
    const payload = {
      answers: questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? "",
      })),
    };

    try {
      const result = await submitAnswers.mutateAsync(payload);
      setScore(result);
      setShowResult(true);
    } catch {
      // Error handled by mutation state
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setScore(null);
    setShowResult(false);
  };

  if (isLoading) {
    return (
      <div className="border-t p-4">
        <p className="text-sm text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return null;
  }

  const allAnswered = questions.every((q) => answers[q.id]?.trim());

  return (
    <div className="border-t">
      <div className="p-4 space-y-6 max-w-3xl mx-auto max-h-[60vh] overflow-y-auto">
        <h3 className="text-lg font-semibold">Questions</h3>
        <div className="space-y-6">
          {questions.map((q, i) => {
            const disabled = !!score;
            const value = answers[q.id] ?? "";

            switch (q.type) {
              case "multiple_choice":
                return (
                  <MultipleChoice
                    key={q.id}
                    question={`${i + 1}. ${q.question}`}
                    options={(q.options as string[]) ?? []}
                    value={value}
                    onChange={(v) => setAnswer(q.id, v)}
                    disabled={disabled}
                  />
                );
              case "true_false_not_given":
                return (
                  <TrueFalseNG
                    key={q.id}
                    question={`${i + 1}. ${q.question}`}
                    value={value}
                    onChange={(v) => setAnswer(q.id, v)}
                    disabled={disabled}
                  />
                );
              case "matching_heading":
                return (
                  <MatchingHeading
                    key={q.id}
                    question={`${i + 1}. ${q.question}`}
                    options={(q.options as string[]) ?? []}
                    value={value}
                    onChange={(v) => setAnswer(q.id, v)}
                    disabled={disabled}
                  />
                );
              case "fill_in_blank":
                return (
                  <FillInBlank
                    key={q.id}
                    question={`${i + 1}. ${q.question}`}
                    value={value}
                    onChange={(v) => setAnswer(q.id, v)}
                    disabled={disabled}
                  />
                );
              default:
                return (
                  <div key={q.id} className="text-sm text-muted-foreground">
                    {i + 1}. {q.question}
                  </div>
                );
            }
          })}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitAnswers.isPending}
          >
            {submitAnswers.isPending ? "Scoring..." : "Submit Answers"}
          </Button>
        </div>
      </div>

      <ResultModal
        open={showResult}
        onOpenChange={setShowResult}
        score={score}
        onRetry={handleRetry}
      />
    </div>
  );
}
