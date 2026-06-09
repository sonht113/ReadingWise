"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ScoreResult {
  total: number;
  correct: number;
  incorrect: number;
  results: { questionId: string; answer: string; isCorrect: boolean }[];
}

interface ResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  score: ScoreResult | null;
  onRetry: () => void;
}

export function ResultModal({
  open,
  onOpenChange,
  score,
  onRetry,
}: ResultModalProps) {
  if (!score) return null;

  const percentage = Math.round((score.correct / score.total) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Score</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="text-5xl font-bold">
            {score.correct}/{score.total}
          </div>
          <div className="text-lg text-muted-foreground">{percentage}%</div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="grid grid-cols-5 gap-1 w-full">
            {score.results.map((r, i) => (
              <div
                key={i}
                className={`text-center text-xs py-1 rounded ${
                  r.isCorrect
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
